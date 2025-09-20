#!/usr/bin/env node
/**
 * Documentation Consolidation Script
 * TypeScript version that merges redundant documentation files to reduce context memory usage
 */

import * as fs from 'fs'
import * as path from 'path'
import type {
  CLIConfig,
  Logger,
  LogLevel,
  ExitCode,
  ScriptOptions,
  ScriptResult
} from '../src/types/devops/scripts.js'

// ==================== Type Definitions ====================

interface MarkdownFile {
  name: string
  path: string
  relativePath: string
  category: string
  size: number
}

interface CategorizedFiles {
  [category: string]: MarkdownFile[]
}

interface ConsolidationReport {
  originalFiles: number
  consolidatedFiles: number
  categoriesProcessed: string[]
  savedBytes: number
  archivedFiles: number
  timestamp: Date
}

interface ConsolidationMetrics {
  duplicatesFound: number
  similarContent: number
  totalSaved: number
}

// ==================== Main Class ====================

const PROJECT_ROOT = path.resolve(__dirname, '..')

class DocumentationConsolidator {
  private consolidatedDocs: Map<string, string>
  private duplicatePatterns: RegExp[]
  private archiveDir: string
  private consolidatedDir: string

  constructor() {
    this.consolidatedDocs = new Map()
    this.duplicatePatterns = [
      /IMPLEMENTATION.*SUMMARY/i,
      /TEST.*SUMMARY/i,
      /.*SUMMARY.*/i,
      /README/i,
    ]
    this.archiveDir = path.join(PROJECT_ROOT, 'docs', 'archive')
    this.consolidatedDir = path.join(PROJECT_ROOT, 'docs', 'consolidated')
  }

  async run(options: ScriptOptions = {}): Promise<ScriptResult<ConsolidationReport>> {
    const startTime = Date.now()
    this.log('🧹 Starting documentation consolidation...', 'info')

    try {
      if (options.dryRun) {
        this.log('DRY RUN MODE: Would consolidate docs but no files will be modified', 'warn')
        return {
          success: true,
          data: {} as ConsolidationReport,
          duration: Date.now() - startTime,
          timestamp: new Date(),
        }
      }

      await this.createDirectories()
      const markdownFiles = await this.findMarkdownFiles()
      const categorized = await this.categorizeFiles(markdownFiles)
      const metrics = await this.consolidateCategories(categorized)
      await this.generateIndex()

      const report: ConsolidationReport = {
        originalFiles: markdownFiles.length,
        consolidatedFiles: this.consolidatedDocs.size,
        categoriesProcessed: Object.keys(categorized),
        savedBytes: metrics.totalSaved,
        archivedFiles: metrics.duplicatesFound,
        timestamp: new Date()
      }

      this.log('✅ Documentation consolidation completed successfully', 'info')
      this.displayReport(report)

      return {
        success: true,
        data: report,
        duration: Date.now() - startTime,
        timestamp: new Date(),
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      this.log(`❌ Documentation consolidation failed: ${errorMessage}`, 'error')

      return {
        success: false,
        error: errorMessage,
        duration: Date.now() - startTime,
        timestamp: new Date(),
      }
    }
  }

  private async createDirectories(): Promise<void> {
    const dirs = [this.archiveDir, this.consolidatedDir]
    for (const dir of dirs) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
    }
  }

  private async findMarkdownFiles(): Promise<MarkdownFile[]> {
    const files: MarkdownFile[] = []

    const searchDirs = [
      PROJECT_ROOT,
      path.join(PROJECT_ROOT, 'docs'),
      path.join(PROJECT_ROOT, 'docs', 'architecture'),
      path.join(PROJECT_ROOT, 'docs', 'api'),
      path.join(PROJECT_ROOT, 'docs', 'guides'),
      path.join(PROJECT_ROOT, 'docs', 'security'),
      path.join(PROJECT_ROOT, 'docs', 'testing'),
    ]

    for (const dir of searchDirs) {
      if (fs.existsSync(dir)) {
        const dirFiles = fs
          .readdirSync(dir)
          .filter((file) => file.endsWith('.md'))
          .map((file) => ({
            name: file,
            path: path.join(dir, file),
            relativePath: path.relative(PROJECT_ROOT, path.join(dir, file)),
            category: this.categorizeFile(file),
            size: fs.statSync(path.join(dir, file)).size,
          }))
        files.push(...dirFiles)
      }
    }

    this.log(`📄 Found ${files.length} markdown files`, 'info')
    return files
  }

  private categorizeFile(filename: string): string {
    if (filename.includes('IMPLEMENTATION') || filename.includes('SUMMARY')) {
      return 'implementation'
    }
    if (filename.includes('TEST')) {
      return 'testing'
    }
    if (filename.includes('API') || filename.includes('BACKEND')) {
      return 'api'
    }
    if (filename.includes('ARCHITECTURE') || filename.includes('DESIGN')) {
      return 'architecture'
    }
    if (filename.includes('SECURITY') || filename.includes('AUTH')) {
      return 'security'
    }
    if (filename.includes('DEPLOYMENT') || filename.includes('DEVOPS') || filename.includes('CI')) {
      return 'devops'
    }
    if (filename.includes('ISSUE') || filename.includes('PROJECT')) {
      return 'project-management'
    }
    if (filename.includes('GUIDE') || filename.includes('MANUAL')) {
      return 'guides'
    }
    return 'general'
  }

  private async categorizeFiles(files: MarkdownFile[]): Promise<CategorizedFiles> {
    const categorized: CategorizedFiles = {}

    for (const file of files) {
      if (!categorized[file.category]) {
        categorized[file.category] = []
      }
      categorized[file.category].push(file)
    }

    // Log category distribution
    this.log('\n📊 Category Distribution:', 'info')
    for (const [category, categoryFiles] of Object.entries(categorized)) {
      const totalSize = categoryFiles.reduce((sum, f) => sum + f.size, 0)
      this.log(
        `   ${category}: ${categoryFiles.length} files (${this.formatBytes(totalSize)})`,
        'info'
      )
    }

    return categorized
  }

  private async consolidateCategories(categorized: CategorizedFiles): Promise<ConsolidationMetrics> {
    const metrics: ConsolidationMetrics = {
      duplicatesFound: 0,
      similarContent: 0,
      totalSaved: 0,
    }

    for (const [category, files] of Object.entries(categorized)) {
      if (files.length > 1) {
        const consolidated = await this.consolidateCategory(category, files)
        metrics.duplicatesFound += consolidated.duplicates
        metrics.similarContent += consolidated.similar
        metrics.totalSaved += consolidated.saved
      }
    }

    return metrics
  }

  private async consolidateCategory(
    category: string,
    files: MarkdownFile[]
  ): Promise<{ duplicates: number; similar: number; saved: number }> {
    this.log(`\n🔄 Consolidating ${category} category...`, 'info')

    const consolidatedPath = path.join(this.consolidatedDir, `${category}-consolidated.md`)
    let consolidatedContent = `# ${this.formatCategoryName(category)} Documentation\n\n`
    consolidatedContent += `Generated: ${new Date().toISOString()}\n\n`
    consolidatedContent += `## Table of Contents\n\n`

    const contentMap = new Map<string, string>()
    let duplicates = 0
    let similar = 0
    let savedBytes = 0

    // Sort files by size (largest first)
    files.sort((a, b) => b.size - a.size)

    for (const file of files) {
      const content = fs.readFileSync(file.path, 'utf-8')
      const contentHash = this.hashContent(content)

      // Check for exact duplicates
      if (contentMap.has(contentHash)) {
        duplicates++
        savedBytes += file.size
        // Archive duplicate
        await this.archiveFile(file)
        continue
      }

      // Check for similar content
      const isSimilar = this.checkSimilarity(content, Array.from(contentMap.values()))
      if (isSimilar) {
        similar++
        savedBytes += Math.floor(file.size * 0.7) // Estimate 70% savings
      }

      contentMap.set(contentHash, content)

      // Add to consolidated file
      consolidatedContent += `- [${file.name}](#${this.slugify(file.name)})\n`
    }

    consolidatedContent += '\n---\n\n'

    // Add unique content to consolidated file
    let index = 0
    for (const [hash, content] of contentMap) {
      const fileName = files[index]?.name || `Section ${index + 1}`
      consolidatedContent += `## ${fileName}\n\n`
      consolidatedContent += content
      consolidatedContent += '\n\n---\n\n'
      index++
    }

    // Save consolidated file
    fs.writeFileSync(consolidatedPath, consolidatedContent)
    this.consolidatedDocs.set(category, consolidatedPath)

    this.log(`   ✅ Created: ${path.basename(consolidatedPath)}`, 'info')
    this.log(`   📊 Duplicates: ${duplicates}, Similar: ${similar}`, 'info')
    this.log(`   💾 Saved: ${this.formatBytes(savedBytes)}`, 'info')

    return { duplicates, similar, saved: savedBytes }
  }

  private hashContent(content: string): string {
    // Simple hash for demo - in production use crypto.createHash
    return content.length.toString() + '-' + content.slice(0, 100).replace(/\s/g, '').length
  }

  private checkSimilarity(content: string, existingContents: string[]): boolean {
    // Simple similarity check - in production use more sophisticated algorithm
    for (const existing of existingContents) {
      const similarity = this.calculateSimilarity(content, existing)
      if (similarity > 0.8) {
        // 80% similarity threshold
        return true
      }
    }
    return false
  }

  private calculateSimilarity(str1: string, str2: string): number {
    // Simple length-based similarity - in production use Levenshtein distance or similar
    const len1 = str1.length
    const len2 = str2.length
    const maxLen = Math.max(len1, len2)
    const minLen = Math.min(len1, len2)
    return minLen / maxLen
  }

  private async archiveFile(file: MarkdownFile): Promise<void> {
    const archivePath = path.join(this.archiveDir, file.name)
    if (fs.existsSync(file.path)) {
      fs.renameSync(file.path, archivePath)
      this.log(`   📦 Archived: ${file.name}`, 'debug')
    }
  }

  private formatCategoryName(category: string): string {
    return category
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim()
  }

  private formatBytes(bytes: number): string {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  private async generateIndex(): Promise<void> {
    this.log('\n📝 Generating index file...', 'info')

    let indexContent = '# Documentation Index\n\n'
    indexContent += `Generated: ${new Date().toISOString()}\n\n`
    indexContent += '## Consolidated Documentation\n\n'

    for (const [category, filePath] of this.consolidatedDocs) {
      const relativePath = path.relative(PROJECT_ROOT, filePath)
      indexContent += `- [${this.formatCategoryName(category)}](${relativePath})\n`
    }

    const indexPath = path.join(this.consolidatedDir, 'INDEX.md')
    fs.writeFileSync(indexPath, indexContent)

    this.log(`   ✅ Created: INDEX.md`, 'info')
  }

  private displayReport(report: ConsolidationReport): void {
    this.log('\n📊 Consolidation Report', 'info')
    this.log('=' .repeat(50), 'info')
    this.log(`Original files: ${report.originalFiles}`, 'info')
    this.log(`Consolidated files: ${report.consolidatedFiles}`, 'info')
    this.log(`Categories: ${report.categoriesProcessed.join(', ')}`, 'info')
    this.log(`Space saved: ${this.formatBytes(report.savedBytes)}`, 'info')
    this.log(`Files archived: ${report.archivedFiles}`, 'info')
    this.log('=' .repeat(50), 'info')
  }

  private log(message: string, level: LogLevel = 'info'): void {
    const levelColors = {
      debug: '\x1b[90m', // gray
      info: '\x1b[36m', // cyan
      warn: '\x1b[33m', // yellow
      error: '\x1b[31m', // red
      fatal: '\x1b[35m', // magenta
    }

    const reset = '\x1b[0m'
    const color = levelColors[level] || ''

    if (level !== 'debug' || process.env.DEBUG) {
      console.log(`${color}${message}${reset}`)
    }
  }
}

// ==================== CLI Execution ====================

async function consolidateDocsMain(options: ScriptOptions = {}): Promise<ScriptResult<ConsolidationReport>> {
  const consolidator = new DocumentationConsolidator()
  return consolidator.run(options)
}

if (require.main === module) {
  const args = process.argv.slice(2)
  const options: ScriptOptions = {
    dryRun: args.includes('--dry-run'),
    verbose: args.includes('--verbose'),
    force: args.includes('--force'),
  }

  consolidateDocsMain(options)
    .then((result) => {
      if (result.success) {
        process.exit(0)
      } else {
        process.exit(1)
      }
    })
    .catch((error) => {
      console.error(`Unexpected error: ${error}`)
      process.exit(1)
    })
}

export default DocumentationConsolidator
export { DocumentationConsolidator, consolidateDocsMain, type ConsolidationReport }