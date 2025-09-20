#!/usr/bin/env node
/**
 * Bundle Size Checker Script
 * TypeScript version with enhanced analysis and reporting capabilities
 */

import * as fs from 'fs'
import * as path from 'path'
import { execSync } from 'child_process'
import type {
  CLIConfig,
  Logger,
  LogLevel,
  ExitCode
} from '../src/types/scripts/node-cli.js'
import type {
  BundleAnalysis,
  BundleAsset,
  BundleSizeCheck,
  BundleSizeThresholds,
  OptimizationResult
} from '../src/types/scripts/build-analysis.js'

// ==================== Configuration ====================

interface BundleSizeConfig {
  distDir: string
  patterns: Record<string, number>
  outputFormats: ('console' | 'json' | 'html')[]
  includeAnalysis: boolean
  compression: 'gzip' | 'brotli' | 'both'
}

interface BundleCheckResult {
  file: string
  pattern: string
  rawSize: number
  compressedSize: number
  limit: number
  passed: boolean
  overage?: number
  compressionRatio: number
  type: BundleFileType
}

interface BundleReport {
  timestamp: string
  totalFiles: number
  passedFiles: number
  failedFiles: number
  results: BundleCheckResult[]
  summary: BundleSummary
  suggestions: OptimizationSuggestion[]
}

interface BundleSummary {
  totalRawSize: number
  totalCompressedSize: number
  averageCompressionRatio: number
  largestFile: string
  overallStatus: 'pass' | 'fail'
}

type BundleFileType = 'js' | 'css' | 'html' | 'image' | 'font' | 'other'

// ==================== Constants ====================

const CONFIG: BundleSizeConfig = {
  distDir: path.join(__dirname, '..', 'dist/assets'),
  patterns: {
    'index-*.js': 280 * 1024, // 280KB
    'vendor-*.js': 170 * 1024, // 170KB
    'ui-*.js': 180 * 1024, // 180KB
    'd3-*.js': 100 * 1024, // 100KB
    '*.css': 50 * 1024, // 50KB
  },
  outputFormats: ['console', 'json'],
  includeAnalysis: true,
  compression: 'gzip',
}

const PERFORMANCE_BUDGET: PerformanceBudget = {
  resourceCounts: [
    { resourceType: 'script', budget: 10 },
    { resourceType: 'stylesheet', budget: 5 },
    { resourceType: 'image', budget: 20 },
  ],
  resourceSizes: [
    { resourceType: 'script', budget: 500000 }, // 500KB total JS
    { resourceType: 'stylesheet', budget: 100000 }, // 100KB total CSS
  ],
  timings: [
    { metric: 'first-contentful-paint', budget: 2000 },
    { metric: 'largest-contentful-paint', budget: 2500 },
    { metric: 'interactive', budget: 5000 },
  ],
}

// ==================== Utility Functions ====================

function log(message: string, level: LogLevel = 'info'): void {
  const emoji = {
    debug: '🔍',
    info: 'ℹ️',
    warn: '⚠️',
    error: '❌',
    fatal: '💀',
  }[level]
  
  console.log(`${emoji} ${message}`)
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}

function getBundleFileType(filename: string): BundleFileType {
  const ext = path.extname(filename).toLowerCase()
  switch (ext) {
    case '.js':
    case '.mjs':
      return 'js'
    case '.css':
      return 'css'
    case '.html':
      return 'html'
    case '.png':
    case '.jpg':
    case '.jpeg':
    case '.gif':
    case '.svg':
    case '.webp':
      return 'image'
    case '.woff':
    case '.woff2':
    case '.ttf':
    case '.otf':
      return 'font'
    default:
      return 'other'
  }
}

function getCompressedSize(filePath: string, compression: 'gzip' | 'brotli' = 'gzip'): number {
  try {
    let command: string
    if (compression === 'gzip') {
      command = `gzip -c "${filePath}" | wc -c`
    } else {
      command = `brotli -c "${filePath}" | wc -c`
    }
    
    const output = execSync(command, { encoding: 'utf8' })
    return parseInt(output.trim(), 10)
  } catch (error) {
    // Fallback to raw size if compression fails
    return fs.statSync(filePath).size
  }
}

function matchesPattern(filename: string, pattern: string): boolean {
  const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$')
  return regex.test(filename)
}

function generateSuggestions(results: BundleCheckResult[]): OptimizationSuggestion[] {
  const suggestions: OptimizationSuggestion[] = []
  
  for (const result of results) {
    if (!result.passed) {
      // Poor compression ratio suggests optimization opportunities
      if (result.compressionRatio < 0.3) {
        suggestions.push({
          type: 'compress',
          target: result.file,
          description: `Poor compression ratio (${(result.compressionRatio * 100).toFixed(1)}%). Consider code splitting or removing unused code.`,
          potentialSavings: result.rawSize - result.compressedSize,
          impact: 'high',
        })
      }
      
      // Large vendor bundle
      if (result.pattern.includes('vendor') && result.compressedSize > 150 * 1024) {
        suggestions.push({
          type: 'split',
          target: result.file,
          description: 'Large vendor bundle. Consider splitting vendor dependencies or using dynamic imports.',
          potentialSavings: Math.floor(result.compressedSize * 0.3),
          impact: 'medium',
        })
      }
      
      // Large CSS files
      if (result.type === 'css' && result.compressedSize > 40 * 1024) {
        suggestions.push({
          type: 'treeshake',
          target: result.file,
          description: 'Large CSS bundle. Consider removing unused styles or using CSS purging.',
          potentialSavings: Math.floor(result.compressedSize * 0.4),
          impact: 'medium',
        })
      }
    }
  }
  
  return suggestions
}

// ==================== Analysis Functions ====================

function analyzeBundle(distDir: string, config: BundleSizeConfig): BundleCheckResult[] {
  const results: BundleCheckResult[] = []
  
  if (!fs.existsSync(distDir)) {
    throw new Error(`Build directory not found: ${distDir}. Run npm run build first.`)
  }
  
  const files = fs.readdirSync(distDir)
  
  for (const [pattern, limit] of Object.entries(config.patterns)) {
    const matchingFiles = files.filter((file) => matchesPattern(file, pattern))
    
    if (matchingFiles.length === 0) {
      log(`No files found matching pattern: ${pattern}`, 'warn')
      continue
    }
    
    for (const file of matchingFiles) {
      const filePath = path.join(distDir, file)
      const rawSize = fs.statSync(filePath).size
      const compressedSize = getCompressedSize(filePath, config.compression)
      const compressionRatio = compressedSize / rawSize
      const passed = compressedSize <= limit
      
      const result: BundleCheckResult = {
        file,
        pattern,
        rawSize,
        compressedSize,
        limit,
        passed,
        compressionRatio,
        type: getBundleFileType(file),
      }
      
      if (!passed) {
        result.overage = ((compressedSize - limit) / limit) * 100
      }
      
      results.push(result)
    }
  }
  
  return results
}

function generateReport(results: BundleCheckResult[], config: BundleSizeConfig): BundleReport {
  const passedFiles = results.filter(r => r.passed).length
  const failedFiles = results.length - passedFiles
  
  const totalRawSize = results.reduce((sum, r) => sum + r.rawSize, 0)
  const totalCompressedSize = results.reduce((sum, r) => sum + r.compressedSize, 0)
  const averageCompressionRatio = totalCompressedSize / totalRawSize
  
  const largestFile = results.reduce((largest, current) => 
    current.compressedSize > largest.compressedSize ? current : largest
  )
  
  const suggestions = config.includeAnalysis ? generateSuggestions(results) : []
  
  return {
    timestamp: new Date().toISOString(),
    totalFiles: results.length,
    passedFiles,
    failedFiles,
    results,
    summary: {
      totalRawSize,
      totalCompressedSize,
      averageCompressionRatio,
      largestFile: largestFile.file,
      overallStatus: failedFiles === 0 ? 'pass' : 'fail',
    },
    suggestions,
  }
}

// ==================== Output Functions ====================

function outputConsole(report: BundleReport): void {
  console.log('📊 Bundle Size Analysis')
  console.log('========================\n')
  
  for (const result of report.results) {
    const status = result.passed ? '✅' : '❌'
    const compressionInfo = `(${(result.compressionRatio * 100).toFixed(1)}% compressed)`
    
    console.log(`${status} ${result.file} ${compressionInfo}`)
    console.log(
      `   Raw: ${formatBytes(result.rawSize)} | ` +
      `Compressed: ${formatBytes(result.compressedSize)} | ` +
      `Limit: ${formatBytes(result.limit)}`
    )
    
    if (!result.passed && result.overage) {
      console.log(`   ⚠️  Exceeds limit by ${result.overage.toFixed(1)}%`)
    }
    console.log()
  }
  
  console.log('========================')
  console.log(`📈 Summary:`)
  console.log(`   Total files: ${report.totalFiles}`)
  console.log(`   Passed: ${report.passedFiles}`)
  console.log(`   Failed: ${report.failedFiles}`)
  console.log(`   Total size: ${formatBytes(report.summary.totalRawSize)} → ${formatBytes(report.summary.totalCompressedSize)}`)
  console.log(`   Compression: ${(report.summary.averageCompressionRatio * 100).toFixed(1)}%`)
  console.log(`   Largest file: ${report.summary.largestFile}`)
  
  if (report.suggestions.length > 0) {
    console.log('\n💡 Optimization Suggestions:')
    for (const suggestion of report.suggestions) {
      console.log(`   • ${suggestion.description}`)
      console.log(`     Potential savings: ${formatBytes(suggestion.potentialSavings)}`)
    }
  }
  
  console.log('\n========================')
  if (report.summary.overallStatus === 'pass') {
    console.log('✅ All bundle sizes are within limits!')
  } else {
    console.log('❌ Some bundles exceed size limits!')
  }
}

function outputJson(report: BundleReport, outputPath: string): void {
  const jsonPath = path.join(outputPath, 'bundle-size-report.json')
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2))
  log(`JSON report saved to: ${jsonPath}`, 'info')
}

function outputHtml(report: BundleReport, outputPath: string): void {
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bundle Size Report</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 40px; }
    .pass { color: green; }
    .fail { color: red; }
    .summary { background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .file-result { margin: 10px 0; padding: 10px; border-left: 3px solid #ddd; }
    .file-result.pass { border-left-color: green; }
    .file-result.fail { border-left-color: red; }
  </style>
</head>
<body>
  <h1>Bundle Size Report</h1>
  <div class="summary">
    <h2>Summary</h2>
    <p><strong>Status:</strong> <span class="${report.summary.overallStatus}">${report.summary.overallStatus.toUpperCase()}</span></p>
    <p><strong>Total files:</strong> ${report.totalFiles}</p>
    <p><strong>Passed:</strong> ${report.passedFiles}</p>
    <p><strong>Failed:</strong> ${report.failedFiles}</p>
    <p><strong>Total size:</strong> ${formatBytes(report.summary.totalRawSize)} → ${formatBytes(report.summary.totalCompressedSize)}</p>
    <p><strong>Compression:</strong> ${(report.summary.averageCompressionRatio * 100).toFixed(1)}%</p>
  </div>
  
  <h2>File Analysis</h2>
  ${report.results.map(result => `
    <div class="file-result ${result.passed ? 'pass' : 'fail'}">
      <h3>${result.file} ${result.passed ? '✅' : '❌'}</h3>
      <p>Raw: ${formatBytes(result.rawSize)} | Compressed: ${formatBytes(result.compressedSize)} | Limit: ${formatBytes(result.limit)}</p>
      <p>Compression: ${(result.compressionRatio * 100).toFixed(1)}%</p>
      ${result.overage ? `<p class="fail">Exceeds limit by ${result.overage.toFixed(1)}%</p>` : ''}
    </div>
  `).join('')}
  
  ${report.suggestions.length > 0 ? `
    <h2>Optimization Suggestions</h2>
    <ul>
      ${report.suggestions.map(s => `
        <li><strong>${s.target}:</strong> ${s.description} (Potential savings: ${formatBytes(s.potentialSavings)})</li>
      `).join('')}
    </ul>
  ` : ''}
  
  <p><small>Generated at: ${report.timestamp}</small></p>
</body>
</html>`

  const htmlPath = path.join(outputPath, 'bundle-size-report.html')
  fs.writeFileSync(htmlPath, htmlContent)
  log(`HTML report saved to: ${htmlPath}`, 'info')
}

// ==================== Main Function ====================

async function checkBundleSize(options: ScriptOptions = {}): Promise<ScriptResult<BundleReport>> {
  const startTime = Date.now()
  
  try {
    const config = { ...CONFIG }
    
    if (options.verbose) {
      config.outputFormats.push('html')
    }
    
    if (options.dryRun) {
      log('DRY RUN MODE: Would analyze bundle sizes but no reports will be generated', 'warn')
      return {
        success: true,
        data: {} as BundleReport,
        duration: Date.now() - startTime,
        timestamp: new Date(),
      }
    }
    
    // Perform analysis
    const results = analyzeBundle(config.distDir, config)
    const report = generateReport(results, config)
    
    // Output reports
    if (config.outputFormats.includes('console')) {
      outputConsole(report)
    }
    
    const outputDir = path.dirname(config.distDir)
    if (config.outputFormats.includes('json')) {
      outputJson(report, outputDir)
    }
    
    if (config.outputFormats.includes('html')) {
      outputHtml(report, outputDir)
    }
    
    return {
      success: report.summary.overallStatus === 'pass',
      data: report,
      duration: Date.now() - startTime,
      timestamp: new Date(),
    }
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    log(`Failed to check bundle size: ${errorMessage}`, 'error')
    
    return {
      success: false,
      error: errorMessage,
      duration: Date.now() - startTime,
      timestamp: new Date(),
    }
  }
}

// ==================== CLI Execution ====================

if (require.main === module) {
  const args = process.argv.slice(2)
  const options: ScriptOptions = {
    dryRun: args.includes('--dry-run'),
    verbose: args.includes('--verbose'),
    force: args.includes('--force'),
  }
  
  checkBundleSize(options)
    .then((result) => {
      if (result.success) {
        process.exit(0)
      } else {
        process.exit(1)
      }
    })
    .catch((error) => {
      log(`Unexpected error: ${error}`, 'error')
      process.exit(1)
    })
}

export default checkBundleSize
export { checkBundleSize, type BundleCheckResult, type BundleReport }