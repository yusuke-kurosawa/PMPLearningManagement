#!/usr/bin/env node
/**
 * Documentation Consolidation Script
 * Merges redundant documentation files to reduce context memory usage
 */

const fs = require('fs')
const path = require('path')
const PROJECT_ROOT = path.resolve(__dirname, '..')

class DocumentationConsolidator {
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

  async run() {
    console.log('🧹 Starting documentation consolidation...')

    try {
      await this.createDirectories()
      const markdownFiles = await this.findMarkdownFiles()
      const categorized = await this.categorizeFiles(markdownFiles)
      await this.consolidateCategories(categorized)
      await this.generateIndex()

      console.log('✅ Documentation consolidation completed successfully')
      return true
    } catch (error) {
      console.error('❌ Documentation consolidation failed:', error)
      return false
    }
  }

  async createDirectories() {
    const dirs = [this.archiveDir, this.consolidatedDir]
    for (const dir of dirs) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
    }
  }

  async findMarkdownFiles() {
    const files = []

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

    console.log(`📄 Found ${files.length} markdown files`)
    return files
  }

  categorizeFile(filename) {
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
      return 'deployment'
    }
    if (filename.includes('README') || filename.includes('GUIDE')) {
      return 'guides'
    }
    if (filename.includes('PLAN') || filename.includes('ROADMAP')) {
      return 'planning'
    }

    return 'misc'
  }

  async categorizeFiles(files) {
    const categories = new Map()

    for (const file of files) {
      const category = file.category
      if (!categories.has(category)) {
        categories.set(category, [])
      }
      categories.get(category).push(file)
    }

    // Sort by size within each category
    for (const [category, categoryFiles] of categories) {
      categoryFiles.sort((a, b) => b.size - a.size)
    }

    return categories
  }

  async consolidateCategories(categories) {
    const consolidatedFiles = []

    for (const [category, files] of categories) {
      if (files.length <= 1) continue

      console.log(`📂 Consolidating ${category}: ${files.length} files`)

      const consolidatedContent = await this.mergeFiles(category, files)
      const consolidatedPath = path.join(
        this.consolidatedDir,
        `${category.toUpperCase()}_CONSOLIDATED.md`
      )

      fs.writeFileSync(consolidatedPath, consolidatedContent)
      consolidatedFiles.push(consolidatedPath)

      // Archive original files
      await this.archiveFiles(category, files)
    }

    console.log(`📋 Created ${consolidatedFiles.length} consolidated files`)
    return consolidatedFiles
  }

  async mergeFiles(category, files) {
    const header = `# ${category.charAt(0).toUpperCase() + category.slice(1)} Documentation\n\n`
    const tableOfContents = '## Table of Contents\n\n'
    const metadata = `<!-- Consolidated on: ${new Date().toISOString()} -->\n`
    const sourceInfo = `<!-- Source files: ${files.map((f) => f.name).join(', ')} -->\n\n`

    let content = header + metadata + sourceInfo

    // Add table of contents
    let tocContent = tableOfContents
    files.forEach((file, index) => {
      const title = file.name.replace('.md', '').replace(/[-_]/g, ' ')
      tocContent += `${index + 1}. [${title}](#${this.createAnchor(title)})\n`
    })
    content += tocContent + '\n---\n\n'

    // Merge file contents
    for (const file of files) {
      try {
        const fileContent = fs.readFileSync(file.path, 'utf8')
        const title = file.name.replace('.md', '').replace(/[-_]/g, ' ')

        content += `## ${title}\n\n`
        content += `*Source: \`${file.relativePath}\`*\n\n`

        // Clean and process content
        const processedContent = this.processContent(fileContent)
        content += processedContent + '\n\n---\n\n'
      } catch (error) {
        console.warn(`⚠️ Failed to read ${file.path}:`, error.message)
      }
    }

    return content
  }

  processContent(content) {
    // Remove duplicate headers
    content = content.replace(/^#\s+.*$/gm, '')

    // Clean up extra whitespace
    content = content.replace(/\n{3,}/g, '\n\n')

    // Remove metadata comments
    content = content.replace(/<!--.*?-->/gs, '')

    return content.trim()
  }

  createAnchor(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
  }

  async archiveFiles(category, files) {
    const categoryArchiveDir = path.join(this.archiveDir, category)
    if (!fs.existsSync(categoryArchiveDir)) {
      fs.mkdirSync(categoryArchiveDir, { recursive: true })
    }

    for (const file of files) {
      const archivePath = path.join(categoryArchiveDir, file.name)
      try {
        fs.copyFileSync(file.path, archivePath)
        // Only remove if it's not in a protected location
        if (!file.path.includes('CLAUDE.md') && !file.path.includes('README.md')) {
          fs.unlinkSync(file.path)
        }
      } catch (error) {
        console.warn(`⚠️ Failed to archive ${file.path}:`, error.message)
      }
    }
  }

  async generateIndex() {
    const consolidatedFiles = fs
      .readdirSync(this.consolidatedDir)
      .filter((file) => file.endsWith('.md'))
      .sort()

    const indexContent = `# Consolidated Documentation Index

Generated on: ${new Date().toISOString()}

## Available Documentation

${consolidatedFiles
  .map((file) => {
    const title = file.replace('_CONSOLIDATED.md', '').toLowerCase()
    return `- [${title.charAt(0).toUpperCase() + title.slice(1)}](./consolidated/${file})`
  })
  .join('\n')}

## Archive

Original files have been archived in the \`docs/archive/\` directory organized by category.

## Context Management

This consolidation was performed to optimize context memory usage and improve documentation accessibility. All original content has been preserved in the archive.
`

    const indexPath = path.join(PROJECT_ROOT, 'docs', 'CONSOLIDATED_INDEX.md')
    fs.writeFileSync(indexPath, indexContent)

    console.log('📇 Generated consolidated documentation index')
  }
}

// Run the consolidator if called directly
if (require.main === module) {
  const consolidator = new DocumentationConsolidator()
  consolidator
    .run()
    .then((success) => {
      process.exit(success ? 0 : 1)
    })
    .catch((error) => {
      console.error('Fatal error:', error)
      process.exit(1)
    })
}

module.exports = DocumentationConsolidator
