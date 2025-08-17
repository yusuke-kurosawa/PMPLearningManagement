#!/usr/bin/env node
/**
 * Intelligent Bundle Analyzer
 * TypeScript version with enhanced type safety and comprehensive analysis
 */

import * as fs from 'fs'
import * as path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'
import type {
  CLIConfig,
  Logger,
  LogLevel,
  ExitCode
} from '../src/types/scripts/node-cli.js'
import type {
  BundleAnalysis,
  BundleAsset,
  BundleChunk,
  DependencyAnalysis,
  DependencyInfo,
  OptimizationResult,
  OptimizationStep
} from '../src/types/scripts/build-analysis.js'

const execAsync = promisify(exec)

// ==================== Configuration Types ====================

interface BundleAnalyzerConfig {
  distDir: string
  analysisDir: string
  statsFile: string
  budgets: BundleBudgets
  outputFormats: ('json' | 'html' | 'console')[]
}

interface BundleBudgets {
  totalSize: number
  gzippedSize: number
  jsSize: number
  cssSize: number
  chunkSize: number
  thirdPartyPercent: number
}

interface FileAnalysis {
  path: string
  size: number
  type: BundleFileType
  gzippedSize: number
  compressionRatio: number
}

interface DependencyAnalysis {
  name: string
  version: string
  description?: string
  size: number
  license?: string
  dependencies: string[]
  category: DependencyCategory
}

interface BundleStats {
  stats: any | null
  fileSizes: FileAnalysis[]
  dependencyAnalysis: DependencyAnalysis[]
}

interface ChunkAnalysis {
  totalChunks: number
  largestChunk: { path: string; size: string } | null
  oversizedChunks: Array<{ path: string; size: string; overage: string }>
  chunkDistribution: ChunkDistributionRange[]
}

interface ChunkDistributionRange {
  name: string
  min: number
  max: number
  count: number
}

interface DependencySummary {
  totalDependencies: number
  totalSize: string
  thirdPartySize: string
  thirdPartyPercent: string
  largestDependencies: Array<{
    name: string
    size: string
    category: string
    percentage: string
  }>
  categoryBreakdown: Record<string, CategoryBreakdown>
}

interface CategoryBreakdown {
  count: number
  totalSize: string
  topDependencies: string[]
}

interface DuplicationAnalysis {
  count: number
  duplicates: Array<{
    name: string
    versions: string[]
    totalWastedSize: string
  }>
  potentialSaving: number
}

interface TreeshakingAnalysis {
  currentJsSize: string
  optimizableLibraries: Array<{
    name: string
    size: string
    recommendation: string
  }>
  potentialSaving: string
  recommendations: string[]
}

interface CodeSplittingAnalysis {
  hasCodeSplitting: boolean
  mainBundleSize: string
  chunkCount: number
  recommendations: string[]
}

interface ComprehensiveAnalysis {
  timestamp: string
  summary: BundleSummary
  chunks: ChunkAnalysis
  dependencies: DependencySummary
  optimizations: OptimizationSuggestion[]
  duplications: DuplicationAnalysis
  treeshaking: TreeshakingAnalysis
  codesplitting: CodeSplittingAnalysis
  recommendations: string[]
}

interface BundleSummary {
  totalSize: string
  totalSizeBytes: number
  gzippedSize: string
  gzippedSizeBytes: number
  compressionRatio: string
  fileCount: number
  typeBreakdown: Record<string, string>
}

interface BudgetComplianceReport {
  status: 'compliant' | 'exceeded'
  violations: string[]
  budgets: BundleBudgets
  current: {
    totalSize: number
    gzippedSize: number
  }
}

type BundleFileType = 'js' | 'css' | 'html' | 'image' | 'font' | 'data' | 'sourcemap' | 'other'
type DependencyCategory = 'framework' | 'ui' | 'utility' | 'bundler' | 'testing' | 'build' | 'visualization' | 'component' | 'other'

// ==================== Main Class ====================

class IntelligentBundleAnalyzer {
  private config: BundleAnalyzerConfig

  constructor(options: Partial<BundleAnalyzerConfig> = {}) {
    this.config = {
      distDir: './dist',
      analysisDir: './bundle-analysis',
      statsFile: path.join('./dist', 'stats.json'),
      budgets: {
        totalSize: 2 * 1024 * 1024, // 2MB
        gzippedSize: 1 * 1024 * 1024, // 1MB
        jsSize: 1.5 * 1024 * 1024, // 1.5MB
        cssSize: 256 * 1024, // 256KB
        chunkSize: 512 * 1024, // 512KB per chunk
        thirdPartyPercent: 60, // 60% max third-party code
      },
      outputFormats: ['json', 'html', 'console'],
      ...options,
    }
  }

  async analyze(scriptOptions: ScriptOptions = {}): Promise<ScriptResult<ComprehensiveAnalysis>> {
    const startTime = Date.now()

    try {
      this.log('📦 Starting intelligent bundle analysis...', 'info')

      if (scriptOptions.dryRun) {
        this.log('DRY RUN MODE: Would analyze bundle but no files will be modified', 'warn')
        return {
          success: true,
          data: {} as ComprehensiveAnalysis,
          duration: Date.now() - startTime,
          timestamp: new Date(),
        }
      }

      await this.ensureAnalysisDir()
      await this.generateBundleStats()

      const stats = await this.loadBundleStats()
      const analysis = await this.performComprehensiveAnalysis(stats)

      await this.generateReports(analysis)
      await this.checkBudgetCompliance(analysis)

      this.log('✅ Bundle analysis completed successfully!', 'info')

      return {
        success: true,
        data: analysis,
        duration: Date.now() - startTime,
        timestamp: new Date(),
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      this.log(`❌ Bundle analysis failed: ${errorMessage}`, 'error')

      return {
        success: false,
        error: errorMessage,
        duration: Date.now() - startTime,
        timestamp: new Date(),
      }
    }
  }

  private log(message: string, level: LogLevel = 'info'): void {
    const emoji = {
      debug: '🔍',
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
      fatal: '💀',
    }[level]

    console.log(`${emoji} ${message}`)
  }

  private async ensureAnalysisDir(): Promise<void> {
    if (!fs.existsSync(this.config.analysisDir)) {
      fs.mkdirSync(this.config.analysisDir, { recursive: true })
    }
  }

  private async generateBundleStats(): Promise<void> {
    this.log('📊 Generating bundle statistics...', 'info')

    // Generate webpack stats if not present
    if (!fs.existsSync(this.config.statsFile)) {
      try {
        await execAsync('npm run build -- --analyze')
      } catch (error) {
        this.log('⚠️ Build with analyze flag failed, using regular build', 'warn')
        await execAsync('npm run build')
      }
    }

    // Generate additional analysis files
    await this.generateFileSizeAnalysis()
    await this.generateDependencyAnalysis()
  }

  private async generateFileSizeAnalysis(): Promise<void> {
    const distFiles = this.getAllFiles(this.config.distDir)
    const fileSizes: FileAnalysis[] = []

    for (const file of distFiles) {
      const stats = fs.statSync(file)
      const relativePath = path.relative(this.config.distDir, file)
      const gzippedSize = await this.getGzippedSize(file)

      fileSizes.push({
        path: relativePath,
        size: stats.size,
        type: this.getFileType(file),
        gzippedSize,
        compressionRatio: gzippedSize / stats.size,
      })
    }

    fileSizes.sort((a, b) => b.size - a.size)

    fs.writeFileSync(
      path.join(this.config.analysisDir, 'file-sizes.json'),
      JSON.stringify(fileSizes, null, 2)
    )
  }

  private async generateDependencyAnalysis(): Promise<void> {
    const packageJsonPath = './package.json'
    if (!fs.existsSync(packageJsonPath)) {
      throw new Error('package.json not found')
    }

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
    const dependencies = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    }

    const dependencyAnalysis: DependencyAnalysis[] = []

    for (const [name, version] of Object.entries(dependencies)) {
      try {
        const packagePath = path.join('./node_modules', name, 'package.json')
        if (fs.existsSync(packagePath)) {
          const depPackage = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
          dependencyAnalysis.push({
            name,
            version: version as string,
            description: depPackage.description,
            size: await this.getDependencySize(name),
            license: depPackage.license,
            dependencies: Object.keys(depPackage.dependencies || {}),
            category: this.categorizeDependency(name, depPackage),
          })
        }
      } catch (error) {
        this.log(`Failed to analyze dependency ${name}: ${error}`, 'warn')
      }
    }

    dependencyAnalysis.sort((a, b) => b.size - a.size)

    fs.writeFileSync(
      path.join(this.config.analysisDir, 'dependency-analysis.json'),
      JSON.stringify(dependencyAnalysis, null, 2)
    )
  }

  private async loadBundleStats(): Promise<BundleStats> {
    let stats = null

    if (fs.existsSync(this.config.statsFile)) {
      stats = JSON.parse(fs.readFileSync(this.config.statsFile, 'utf8'))
    }

    const fileSizes: FileAnalysis[] = JSON.parse(
      fs.readFileSync(path.join(this.config.analysisDir, 'file-sizes.json'), 'utf8')
    )

    const dependencyAnalysis: DependencyAnalysis[] = JSON.parse(
      fs.readFileSync(path.join(this.config.analysisDir, 'dependency-analysis.json'), 'utf8')
    )

    return { stats, fileSizes, dependencyAnalysis }
  }

  private async performComprehensiveAnalysis(data: BundleStats): Promise<ComprehensiveAnalysis> {
    const { stats, fileSizes, dependencyAnalysis } = data

    const analysis: ComprehensiveAnalysis = {
      timestamp: new Date().toISOString(),
      summary: this.generateSummary(fileSizes),
      chunks: this.analyzeChunks(fileSizes),
      dependencies: this.analyzeDependencies(dependencyAnalysis),
      optimizations: this.identifyOptimizations(fileSizes, dependencyAnalysis),
      duplications: this.findDuplications(dependencyAnalysis),
      treeshaking: this.analyzeTreeshaking(fileSizes, dependencyAnalysis),
      codesplitting: this.analyzeCodeSplitting(fileSizes),
      recommendations: [],
    }

    analysis.recommendations = this.generateRecommendations(analysis)

    return analysis
  }

  private generateSummary(fileSizes: FileAnalysis[]): BundleSummary {
    const totalSize = fileSizes.reduce((sum, file) => sum + file.size, 0)
    const totalGzippedSize = fileSizes.reduce((sum, file) => sum + file.gzippedSize, 0)

    const typeBreakdown = fileSizes.reduce((acc, file) => {
      acc[file.type] = (acc[file.type] || 0) + file.size
      return acc
    }, {} as Record<string, number>)

    return {
      totalSize: this.formatSize(totalSize),
      totalSizeBytes: totalSize,
      gzippedSize: this.formatSize(totalGzippedSize),
      gzippedSizeBytes: totalGzippedSize,
      compressionRatio: ((1 - totalGzippedSize / totalSize) * 100).toFixed(1) + '%',
      fileCount: fileSizes.length,
      typeBreakdown: Object.fromEntries(
        Object.entries(typeBreakdown).map(([type, size]) => [type, this.formatSize(size)])
      ),
    }
  }

  private analyzeChunks(fileSizes: FileAnalysis[]): ChunkAnalysis {
    const jsFiles = fileSizes.filter((f) => f.type === 'js')

    return {
      totalChunks: jsFiles.length,
      largestChunk:
        jsFiles.length > 0
          ? {
              path: jsFiles[0].path,
              size: this.formatSize(jsFiles[0].size),
            }
          : null,
      oversizedChunks: jsFiles
        .filter((f) => f.size > this.config.budgets.chunkSize)
        .map((f) => ({
          path: f.path,
          size: this.formatSize(f.size),
          overage: this.formatSize(f.size - this.config.budgets.chunkSize),
        })),
      chunkDistribution: this.analyzeChunkDistribution(jsFiles),
    }
  }

  private analyzeChunkDistribution(jsFiles: FileAnalysis[]): ChunkDistributionRange[] {
    const ranges: ChunkDistributionRange[] = [
      { name: 'Small (<100KB)', min: 0, max: 100 * 1024, count: 0 },
      { name: 'Medium (100KB-500KB)', min: 100 * 1024, max: 500 * 1024, count: 0 },
      { name: 'Large (500KB-1MB)', min: 500 * 1024, max: 1024 * 1024, count: 0 },
      { name: 'Very Large (>1MB)', min: 1024 * 1024, max: Infinity, count: 0 },
    ]

    return ranges.map((range) => ({
      ...range,
      count: jsFiles.filter((f) => f.size >= range.min && f.size < range.max).length,
    }))
  }

  private analyzeDependencies(dependencyAnalysis: DependencyAnalysis[]): DependencySummary {
    const totalSize = dependencyAnalysis.reduce((sum, dep) => sum + dep.size, 0)
    const thirdPartySize = dependencyAnalysis
      .filter((dep) => dep.category !== 'other')
      .reduce((sum, dep) => sum + dep.size, 0)

    return {
      totalDependencies: dependencyAnalysis.length,
      totalSize: this.formatSize(totalSize),
      thirdPartySize: this.formatSize(thirdPartySize),
      thirdPartyPercent: ((thirdPartySize / totalSize) * 100).toFixed(1) + '%',
      largestDependencies: dependencyAnalysis.slice(0, 10).map((dep) => ({
        name: dep.name,
        size: this.formatSize(dep.size),
        category: dep.category,
        percentage: ((dep.size / totalSize) * 100).toFixed(1) + '%',
      })),
      categoryBreakdown: this.categorizeDependenciesByType(dependencyAnalysis),
    }
  }

  private categorizeDependenciesByType(dependencies: DependencyAnalysis[]): Record<string, CategoryBreakdown> {
    const categories = dependencies.reduce((acc, dep) => {
      acc[dep.category] = acc[dep.category] || []
      acc[dep.category].push(dep)
      return acc
    }, {} as Record<string, DependencyAnalysis[]>)

    return Object.fromEntries(
      Object.entries(categories).map(([category, deps]) => [
        category,
        {
          count: deps.length,
          totalSize: this.formatSize(deps.reduce((sum, dep) => sum + dep.size, 0)),
          topDependencies: deps.slice(0, 5).map((dep) => dep.name),
        },
      ])
    )
  }

  private identifyOptimizations(fileSizes: FileAnalysis[], dependencyAnalysis: DependencyAnalysis[]): OptimizationSuggestion[] {
    const optimizations: OptimizationSuggestion[] = []

    // Large bundle optimization
    const totalSize = fileSizes.reduce((sum, file) => sum + file.size, 0)
    if (totalSize > this.config.budgets.totalSize) {
      optimizations.push({
        type: 'compress',
        target: 'Total bundle',
        description: 'Bundle exceeds size budget',
        potentialSavings: totalSize - this.config.budgets.totalSize,
        impact: 'high',
      })
    }

    // Large dependencies
    const largeDeps = dependencyAnalysis
      .filter((dep) => dep.size > 100 * 1024) // >100KB
      .slice(0, 5)

    if (largeDeps.length > 0) {
      optimizations.push({
        type: 'replace',
        target: largeDeps.map((dep) => dep.name).join(', '),
        description: `${largeDeps.length} large dependencies found`,
        potentialSavings: Math.floor(largeDeps.reduce((sum, dep) => sum + dep.size, 0) * 0.3),
        impact: 'medium',
      })
    }

    // Unused CSS
    const cssFiles = fileSizes.filter((f) => f.type === 'css')
    const totalCssSize = cssFiles.reduce((sum, file) => sum + file.size, 0)
    if (totalCssSize > this.config.budgets.cssSize) {
      optimizations.push({
        type: 'treeshake',
        target: 'CSS bundle',
        description: 'CSS bundle exceeds budget',
        potentialSavings: Math.floor(totalCssSize * 0.4),
        impact: 'medium',
      })
    }

    return optimizations
  }

  private findDuplications(dependencyAnalysis: DependencyAnalysis[]): DuplicationAnalysis {
    const duplicates: Array<{
      name: string
      versions: string[]
      totalWastedSize: string
    }> = []
    const nameVersionMap = new Map<string, DependencyAnalysis>()

    for (const dep of dependencyAnalysis) {
      const baseName = dep.name.split('/')[0] // Handle scoped packages
      if (nameVersionMap.has(baseName)) {
        const existing = nameVersionMap.get(baseName)!
        if (existing.version !== dep.version) {
          duplicates.push({
            name: baseName,
            versions: [existing.version, dep.version],
            totalWastedSize: this.formatSize(Math.min(existing.size, dep.size)),
          })
        }
      } else {
        nameVersionMap.set(baseName, dep)
      }
    }

    const potentialSaving = duplicates.reduce((sum, dup) => {
      const existing = nameVersionMap.get(dup.name)
      return sum + (existing ? Math.min(existing.size, existing.size) : 0)
    }, 0)

    return {
      count: duplicates.length,
      duplicates: duplicates.slice(0, 10),
      potentialSaving,
    }
  }

  private analyzeTreeshaking(fileSizes: FileAnalysis[], dependencyAnalysis: DependencyAnalysis[]): TreeshakingAnalysis {
    const jsSize = fileSizes
      .filter((f) => f.type === 'js')
      .reduce((sum, file) => sum + file.size, 0)

    const librariesWithTreeshaking = ['lodash', 'moment', 'date-fns', 'rxjs', 'ramda']

    const optimizableLibraries = dependencyAnalysis
      .filter((dep) => librariesWithTreeshaking.some((lib) => dep.name.includes(lib)))
      .map((dep) => ({
        name: dep.name,
        size: this.formatSize(dep.size),
        recommendation: this.getTreeshakingRecommendation(dep.name),
      }))

    return {
      currentJsSize: this.formatSize(jsSize),
      optimizableLibraries,
      potentialSaving: optimizableLibraries.length * 50 + 'KB (estimated)',
      recommendations: [
        'Enable tree shaking in webpack config',
        'Use ES6 imports instead of CommonJS',
        'Import specific functions instead of entire libraries',
      ],
    }
  }

  private getTreeshakingRecommendation(name: string): string {
    const recommendations: Record<string, string> = {
      lodash: 'Use lodash-es or import specific functions',
      moment: 'Consider date-fns for better tree shaking',
      'date-fns': 'Import specific functions only',
      rxjs: 'Import operators individually',
      ramda: 'Import specific functions',
    }

    return recommendations[name] || 'Review for tree shaking opportunities'
  }

  private analyzeCodeSplitting(fileSizes: FileAnalysis[]): CodeSplittingAnalysis {
    const jsFiles = fileSizes.filter((f) => f.type === 'js')
    const mainBundle = jsFiles.find((f) => f.path.includes('index') || f.path.includes('main'))

    const routeBasedChunks = jsFiles.filter(
      (f) => f.path.includes('route') || f.path.includes('page') || f.path.includes('chunk')
    )

    return {
      hasCodeSplitting: routeBasedChunks.length > 0,
      mainBundleSize: mainBundle ? this.formatSize(mainBundle.size) : 'Not found',
      chunkCount: routeBasedChunks.length,
      recommendations: this.getCodeSplittingRecommendations(mainBundle, routeBasedChunks),
    }
  }

  private getCodeSplittingRecommendations(mainBundle: FileAnalysis | undefined, chunks: FileAnalysis[]): string[] {
    const recommendations: string[] = []

    if (mainBundle && mainBundle.size > 500 * 1024) {
      // >500KB
      recommendations.push('Main bundle is large - implement route-based code splitting')
    }

    if (chunks.length === 0) {
      recommendations.push('No code splitting detected - implement lazy loading for routes')
    }

    if (chunks.length > 0) {
      const largeChunks = chunks.filter((c) => c.size > 300 * 1024)
      if (largeChunks.length > 0) {
        recommendations.push('Some chunks are large - consider further splitting')
      }
    }

    return recommendations
  }

  private generateRecommendations(analysis: ComprehensiveAnalysis): string[] {
    const recommendations: string[] = []

    // High priority recommendations
    if (analysis.summary.totalSizeBytes > this.config.budgets.totalSize) {
      recommendations.push('🚨 CRITICAL: Reduce total bundle size to meet budget')
    }

    if (analysis.optimizations.some((opt) => opt.type === 'replace')) {
      recommendations.push(
        '📦 HIGH: Review and replace large dependencies with lighter alternatives'
      )
    }

    // Medium priority recommendations
    if (analysis.duplications.count > 0) {
      recommendations.push('🔄 MEDIUM: Eliminate duplicate dependencies to reduce bundle size')
    }

    if (!analysis.codesplitting.hasCodeSplitting) {
      recommendations.push('✂️ MEDIUM: Implement code splitting for better load performance')
    }

    if (analysis.treeshaking.optimizableLibraries.length > 0) {
      recommendations.push('🌳 MEDIUM: Enable tree shaking for optimizable libraries')
    }

    // Low priority recommendations
    if (analysis.chunks.oversizedChunks.length > 0) {
      recommendations.push('📏 LOW: Break down oversized chunks for better caching')
    }

    return recommendations
  }

  private async checkBudgetCompliance(analysis: ComprehensiveAnalysis): Promise<void> {
    const violations: string[] = []

    if (analysis.summary.totalSizeBytes > this.config.budgets.totalSize) {
      violations.push('Total bundle size exceeds budget')
    }

    if (analysis.summary.gzippedSizeBytes > this.config.budgets.gzippedSize) {
      violations.push('Gzipped bundle size exceeds budget')
    }

    const budgetStatus = violations.length === 0 ? 'compliant' : 'exceeded'

    const budgetReport: BudgetComplianceReport = {
      status: budgetStatus,
      violations,
      budgets: this.config.budgets,
      current: {
        totalSize: analysis.summary.totalSizeBytes,
        gzippedSize: analysis.summary.gzippedSizeBytes,
      },
    }

    fs.writeFileSync(
      path.join(this.config.analysisDir, 'budget-compliance.json'),
      JSON.stringify(budgetReport, null, 2)
    )

    if (budgetStatus === 'exceeded') {
      this.log('⚠️ Bundle size budget exceeded!', 'warn')
    } else {
      this.log('✅ Bundle size within budget', 'info')
    }
  }

  private async generateReports(analysis: ComprehensiveAnalysis): Promise<void> {
    // Main analysis report
    fs.writeFileSync(
      path.join(this.config.analysisDir, 'bundle-analysis.json'),
      JSON.stringify(analysis, null, 2)
    )

    // Summary for GitHub Actions
    const summary = {
      totalSize: analysis.summary.totalSize,
      gzippedSize: analysis.summary.gzippedSize,
      sizeChange: '+0B', // Would need previous build data
      sizeChangePercent: '+0%',
      largeDependencies: analysis.dependencies.largestDependencies.slice(0, 5),
      optimizations: analysis.optimizations.slice(0, 3),
      recommendations: analysis.recommendations.slice(0, 5),
      budgetStatus:
        analysis.summary.totalSizeBytes > this.config.budgets.totalSize ? 'exceeded' : 'compliant',
      reportUrl: 'https://bundle-analysis.example.com',
    }

    fs.writeFileSync(
      path.join(this.config.analysisDir, 'bundle-summary.json'),
      JSON.stringify(summary, null, 2)
    )

    // Generate HTML report
    if (this.config.outputFormats.includes('html')) {
      await this.generateHTMLReport(analysis)
    }

    this.log('📊 Bundle analysis reports generated', 'info')
  }

  private async generateHTMLReport(analysis: ComprehensiveAnalysis): Promise<void> {
    const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bundle Analysis Report</title>
    <style>
        body { font-family: system-ui, sans-serif; margin: 40px; line-height: 1.6; }
        .metric { background: #f5f5f5; padding: 20px; margin: 10px 0; border-radius: 8px; }
        .recommendation { background: #e3f2fd; padding: 15px; margin: 10px 0; border-left: 4px solid #2196f3; }
        .optimization { background: #fff3e0; padding: 15px; margin: 10px 0; border-left: 4px solid #ff9800; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f5f5f5; font-weight: 600; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; border-radius: 12px; margin-bottom: 30px; }
        .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 20px 0; }
        .summary-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .metric-value { font-size: 2em; font-weight: bold; color: #2196f3; }
        .metric-label { color: #666; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="header">
        <h1>📦 Bundle Analysis Report</h1>
        <p>Generated: ${analysis.timestamp}</p>
    </div>
    
    <div class="summary-grid">
        <div class="summary-card">
            <div class="metric-value">${analysis.summary.totalSize}</div>
            <div class="metric-label">Total Size</div>
        </div>
        <div class="summary-card">
            <div class="metric-value">${analysis.summary.gzippedSize}</div>
            <div class="metric-label">Gzipped Size</div>
        </div>
        <div class="summary-card">
            <div class="metric-value">${analysis.summary.compressionRatio}</div>
            <div class="metric-label">Compression Ratio</div>
        </div>
        <div class="summary-card">
            <div class="metric-value">${analysis.summary.fileCount}</div>
            <div class="metric-label">Total Files</div>
        </div>
    </div>

    <h2>📊 Top Dependencies</h2>
    <table>
        <thead>
            <tr><th>Package</th><th>Size</th><th>Percentage</th><th>Category</th></tr>
        </thead>
        <tbody>
            ${analysis.dependencies.largestDependencies
              .map(
                (dep) =>
                  `<tr><td>${dep.name}</td><td>${dep.size}</td><td>${dep.percentage}</td><td>${dep.category}</td></tr>`
              )
              .join('')}
        </tbody>
    </table>

    <h2>⚡ Optimization Opportunities</h2>
    ${analysis.optimizations
      .map(
        (opt) =>
          `<div class="optimization">
        <strong>${opt.type.toUpperCase()}</strong> (${opt.impact} impact)<br>
        ${opt.description}<br>
        Potential saving: ${this.formatSize(opt.potentialSavings)}
      </div>`
      )
      .join('')}

    <h2>💡 Recommendations</h2>
    ${analysis.recommendations.map((rec) => `<div class="recommendation">${rec}</div>`).join('')}
    
    <h2>📈 Chunk Analysis</h2>
    <div class="metric">
        <p><strong>Total Chunks:</strong> ${analysis.chunks.totalChunks}</p>
        <p><strong>Largest Chunk:</strong> ${analysis.chunks.largestChunk?.size || 'N/A'}</p>
        <p><strong>Oversized Chunks:</strong> ${analysis.chunks.oversizedChunks.length}</p>
    </div>
    
    <h2>🔄 Duplications</h2>
    <div class="metric">
        <p><strong>Duplicate Dependencies:</strong> ${analysis.duplications.count}</p>
        <p><strong>Potential Saving:</strong> ${this.formatSize(analysis.duplications.potentialSaving)}</p>
    </div>

    <footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; text-align: center;">
        <p>Generated by Intelligent Bundle Analyzer</p>
    </footer>
</body>
</html>`

    fs.writeFileSync(path.join(this.config.analysisDir, 'bundle-report.html'), htmlTemplate)
  }

  // ==================== Helper Methods ====================

  private getAllFiles(dir: string): string[] {
    const files: string[] = []
    const entries = fs.readdirSync(dir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        files.push(...this.getAllFiles(fullPath))
      } else {
        files.push(fullPath)
      }
    }

    return files
  }

  private getFileType(filePath: string): BundleFileType {
    const ext = path.extname(filePath).toLowerCase()
    const typeMap: Record<string, BundleFileType> = {
      '.js': 'js',
      '.mjs': 'js',
      '.css': 'css',
      '.html': 'html',
      '.png': 'image',
      '.jpg': 'image',
      '.jpeg': 'image',
      '.gif': 'image',
      '.svg': 'image',
      '.webp': 'image',
      '.ico': 'image',
      '.woff': 'font',
      '.woff2': 'font',
      '.ttf': 'font',
      '.eot': 'font',
      '.json': 'data',
      '.map': 'sourcemap',
    }

    return typeMap[ext] || 'other'
  }

  private async getGzippedSize(filePath: string): Promise<number> {
    try {
      const { stdout } = await execAsync(`gzip -c "${filePath}" | wc -c`)
      return parseInt(stdout.trim(), 10)
    } catch (error) {
      return 0
    }
  }

  private async getDependencySize(name: string): Promise<number> {
    try {
      const { stdout } = await execAsync(`du -sb node_modules/${name} 2>/dev/null || echo "0"`)
      return parseInt(stdout.split('\t')[0], 10) || 0
    } catch (error) {
      return 0
    }
  }

  private categorizeDependency(name: string, packageJson: any): DependencyCategory {
    const categories: Record<DependencyCategory, string[]> = {
      framework: ['react', 'vue', 'angular', 'svelte'],
      ui: ['@mui', 'antd', 'bootstrap', 'tailwindcss'],
      utility: ['lodash', 'ramda', 'date-fns', 'moment'],
      bundler: ['webpack', 'rollup', 'vite', 'parcel'],
      testing: ['jest', 'vitest', 'cypress', 'playwright'],
      build: ['babel', 'typescript', 'eslint', 'prettier'],
      visualization: ['d3', 'chart.js', 'plotly', 'three'],
      component: [],
      other: [],
    }

    for (const [category, packages] of Object.entries(categories)) {
      if (packages.some((pkg) => name.includes(pkg))) {
        return category as DependencyCategory
      }
    }

    return packageJson.description?.includes('component') ? 'component' : 'other'
  }

  private formatSize(bytes: number): string {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
  }
}

// ==================== CLI Execution ====================

async function analyzeBundleMain(options: ScriptOptions = {}): Promise<ScriptResult<ComprehensiveAnalysis>> {
  const analyzer = new IntelligentBundleAnalyzer()
  return analyzer.analyze(options)
}

if (require.main === module) {
  const args = process.argv.slice(2)
  const options: ScriptOptions = {
    dryRun: args.includes('--dry-run'),
    verbose: args.includes('--verbose'),
    force: args.includes('--force'),
  }

  analyzeBundleMain(options)
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

export default IntelligentBundleAnalyzer
export { IntelligentBundleAnalyzer, analyzeBundleMain, type ComprehensiveAnalysis, type BundleSummary }