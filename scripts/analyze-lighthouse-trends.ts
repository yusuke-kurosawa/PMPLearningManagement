#!/usr/bin/env node
/**
 * Intelligent Lighthouse Trend Analysis
 * TypeScript version with enhanced analytics and comprehensive trend analysis
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

interface LighthouseScores {
  performance: number
  accessibility: number
  bestPractices: number
  seo: number
  pwa: number
}

interface CoreWebVitals {
  lcp: number
  fid: number
  cls: number
}

interface PerformanceMetrics {
  fcp: number
  si: number
  tti: number
  tbt: number
}

interface ResourceMetrics {
  totalByteWeight: number
  unusedJavaScript: number
  unusedCSS: number
}

interface LighthouseResult {
  timestamp: string
  url: string
  scores: LighthouseScores
  coreWebVitals: CoreWebVitals
  performanceMetrics: PerformanceMetrics
  resourceMetrics: ResourceMetrics
}

interface CategoryThresholds {
  excellent: number
  good: number
  poor: number
}

interface Thresholds {
  performance: CategoryThresholds
  accessibility: CategoryThresholds
  bestPractices: CategoryThresholds
  seo: CategoryThresholds
  pwa: CategoryThresholds
}

interface CurrentState {
  scores: LighthouseScores
  status: Record<string, 'excellent' | 'good' | 'poor'>
}

interface TrendData {
  [category: string]: number // -1 declining, 0 stable, 1 improving
}

interface CoreWebVitalStatus {
  value: number
  status: 'good' | 'needs-improvement' | 'poor'
}

interface CoreWebVitalsAnalysis {
  lcp: CoreWebVitalStatus
  fid: CoreWebVitalStatus
  cls: CoreWebVitalStatus
}

interface PerformanceIssue {
  type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  value: number
  recommendation: string
}

interface ResourceOptimization {
  javascriptSavings?: number
  cssSavings?: number
  totalPotentialSavings: number
}

interface TrendAnalysis {
  currentState: CurrentState
  trends: TrendData
  coreWebVitalsStatus: CoreWebVitalsAnalysis
  performanceIssues: PerformanceIssue[]
  resourceOptimization: ResourceOptimization
}

interface Recommendation {
  priority: 'low' | 'medium' | 'high' | 'critical'
  category: string
  title: string
  action: string
  details?: string[] | string
  metric?: string
  currentValue?: number
}

interface PerformanceSummary {
  performance: number
  accessibility: number
  bestPractices: number
  seo: number
  pwa: number
  lcp: number
  fid: number
  cls: number
  bundleSize: number
  bundleSizeStatus: string
  loadTime: string
  loadTimeStatus: string
  reportUrl: string
}

interface AnalysisData {
  results: LighthouseResult[]
  analysis: TrendAnalysis
  recommendations: Recommendation[]
}

// ==================== Main Class ====================

class LighthouseTrendAnalyzer {
  private resultsDir: string
  private trendsFile: string
  private thresholds: Thresholds

  constructor() {
    this.resultsDir = './lighthouse-results'
    this.trendsFile = './lighthouse-trends.json'
    this.thresholds = {
      performance: { excellent: 90, good: 70, poor: 50 },
      accessibility: { excellent: 95, good: 80, poor: 60 },
      bestPractices: { excellent: 90, good: 80, poor: 60 },
      seo: { excellent: 90, good: 80, poor: 60 },
      pwa: { excellent: 90, good: 70, poor: 50 },
    }
  }

  async analyze(options: ScriptOptions = {}): Promise<ScriptResult<TrendAnalysis>> {
    const startTime = Date.now()

    try {
      this.log('🔍 Analyzing Lighthouse performance trends...', 'info')

      if (options.dryRun) {
        this.log('DRY RUN MODE: Would analyze trends but no reports will be generated', 'warn')
        return {
          success: true,
          data: {} as TrendAnalysis,
          duration: Date.now() - startTime,
          timestamp: new Date(),
        }
      }

      const results = this.collectResults()
      const analysis = this.performAnalysis(results)
      const recommendations = this.generateRecommendations(analysis)

      await this.saveAnalysis({ results, analysis, recommendations })
      await this.generateReport(analysis, recommendations)

      this.log('✅ Analysis complete!', 'info')

      return {
        success: true,
        data: analysis,
        duration: Date.now() - startTime,
        timestamp: new Date(),
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      this.log(`❌ Analysis failed: ${errorMessage}`, 'error')

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

  private collectResults(): LighthouseResult[] {
    const results: LighthouseResult[] = []

    if (!fs.existsSync(this.resultsDir)) {
      this.log('No lighthouse results found', 'warn')
      return results
    }

    const files = fs
      .readdirSync(this.resultsDir)
      .filter((file) => file.endsWith('.json'))
      .map((file) => path.join(this.resultsDir, file))

    for (const file of files) {
      try {
        const data = JSON.parse(fs.readFileSync(file, 'utf8'))
        if (data.lhr && data.lhr.categories) {
          results.push(this.extractMetrics(data.lhr))
        }
      } catch (error) {
        this.log(`Failed to parse ${file}: ${error}`, 'warn')
      }
    }

    return results
  }

  private extractMetrics(lhr: any): LighthouseResult {
    const categories = lhr.categories
    const audits = lhr.audits

    return {
      timestamp: new Date().toISOString(),
      url: lhr.requestedUrl,
      scores: {
        performance: Math.round(categories.performance.score * 100),
        accessibility: Math.round(categories.accessibility.score * 100),
        bestPractices: Math.round(categories['best-practices'].score * 100),
        seo: Math.round(categories.seo.score * 100),
        pwa: Math.round(categories.pwa.score * 100),
      },
      coreWebVitals: {
        lcp: audits['largest-contentful-paint']?.numericValue || 0,
        fid: audits['max-potential-fid']?.numericValue || 0,
        cls: audits['cumulative-layout-shift']?.numericValue || 0,
      },
      performanceMetrics: {
        fcp: audits['first-contentful-paint']?.numericValue || 0,
        si: audits['speed-index']?.numericValue || 0,
        tti: audits['interactive']?.numericValue || 0,
        tbt: audits['total-blocking-time']?.numericValue || 0,
      },
      resourceMetrics: {
        totalByteWeight: audits['total-byte-weight']?.numericValue || 0,
        unusedJavaScript: audits['unused-javascript']?.details?.overallSavingsBytes || 0,
        unusedCSS: audits['unused-css-rules']?.details?.overallSavingsBytes || 0,
      },
    }
  }

  private performAnalysis(results: LighthouseResult[]): TrendAnalysis {
    if (results.length === 0) {
      return {
        currentState: { scores: {} as LighthouseScores, status: {} },
        trends: {},
        coreWebVitalsStatus: {} as CoreWebVitalsAnalysis,
        performanceIssues: [],
        resourceOptimization: { totalPotentialSavings: 0 },
      }
    }

    const latest = results[results.length - 1]
    const analysis: TrendAnalysis = {
      currentState: this.analyzeCurrentState(latest),
      trends: this.analyzeTrends(results),
      coreWebVitalsStatus: this.analyzeCoreWebVitals(latest),
      performanceIssues: this.identifyPerformanceIssues(latest),
      resourceOptimization: this.analyzeResourceOptimization(latest),
    }

    return analysis
  }

  private analyzeCurrentState(latest: LighthouseResult): CurrentState {
    const scores = latest.scores
    const status: Record<string, 'excellent' | 'good' | 'poor'> = {}

    for (const [category, score] of Object.entries(scores)) {
      const thresholds = this.thresholds[category as keyof Thresholds]
      if (score >= thresholds.excellent) {
        status[category] = 'excellent'
      } else if (score >= thresholds.good) {
        status[category] = 'good'
      } else {
        status[category] = 'poor'
      }
    }

    return { scores, status }
  }

  private analyzeTrends(results: LighthouseResult[]): TrendData {
    if (results.length < 2) return {}

    const recent = results.slice(-5) // Last 5 runs
    const trends: TrendData = {}

    const categories: (keyof LighthouseScores)[] = ['performance', 'accessibility', 'bestPractices', 'seo', 'pwa']
    
    categories.forEach((category) => {
      const values = recent.map((r) => r.scores[category])
      const trend = this.calculateTrend(values)
      trends[category] = trend
    })

    return trends
  }

  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0

    const first = values[0]
    const last = values[values.length - 1]
    const change = last - first

    if (Math.abs(change) < 2) return 0 // Stable
    return change > 0 ? 1 : -1 // Improving or declining
  }

  private analyzeCoreWebVitals(latest: LighthouseResult): CoreWebVitalsAnalysis {
    const { lcp, fid, cls } = latest.coreWebVitals

    return {
      lcp: {
        value: lcp,
        status: lcp <= 2500 ? 'good' : lcp <= 4000 ? 'needs-improvement' : 'poor',
      },
      fid: {
        value: fid,
        status: fid <= 100 ? 'good' : fid <= 300 ? 'needs-improvement' : 'poor',
      },
      cls: {
        value: cls,
        status: cls <= 0.1 ? 'good' : cls <= 0.25 ? 'needs-improvement' : 'poor',
      },
    }
  }

  private identifyPerformanceIssues(latest: LighthouseResult): PerformanceIssue[] {
    const issues: PerformanceIssue[] = []
    const { performanceMetrics, resourceMetrics } = latest

    if (performanceMetrics.fcp > 1800) {
      issues.push({
        type: 'slow-fcp',
        severity: 'high',
        value: performanceMetrics.fcp,
        recommendation: 'Optimize critical rendering path and reduce render-blocking resources',
      })
    }

    if (performanceMetrics.si > 3000) {
      issues.push({
        type: 'slow-speed-index',
        severity: 'medium',
        value: performanceMetrics.si,
        recommendation: 'Optimize above-the-fold content and defer non-critical resources',
      })
    }

    if (resourceMetrics.totalByteWeight > 2048000) {
      // 2MB
      issues.push({
        type: 'large-bundle',
        severity: 'high',
        value: resourceMetrics.totalByteWeight,
        recommendation: 'Implement code splitting and remove unused dependencies',
      })
    }

    if (resourceMetrics.unusedJavaScript > 200000) {
      // 200KB
      issues.push({
        type: 'unused-javascript',
        severity: 'medium',
        value: resourceMetrics.unusedJavaScript,
        recommendation: 'Remove unused JavaScript and implement tree shaking',
      })
    }

    return issues
  }

  private analyzeResourceOptimization(latest: LighthouseResult): ResourceOptimization {
    const { resourceMetrics } = latest
    const optimization: ResourceOptimization = { totalPotentialSavings: 0 }

    if (resourceMetrics.unusedJavaScript > 0) {
      optimization.javascriptSavings = Math.round(resourceMetrics.unusedJavaScript / 1024)
    }

    if (resourceMetrics.unusedCSS > 0) {
      optimization.cssSavings = Math.round(resourceMetrics.unusedCSS / 1024)
    }

    const totalSavings = (optimization.javascriptSavings || 0) + (optimization.cssSavings || 0)
    optimization.totalPotentialSavings = totalSavings

    return optimization
  }

  private generateRecommendations(analysis: TrendAnalysis): Recommendation[] {
    const recommendations: Recommendation[] = []

    // Performance recommendations
    if (analysis.currentState.status.performance === 'poor') {
      recommendations.push({
        priority: 'high',
        category: 'performance',
        title: 'Critical Performance Issues',
        action: 'Implement immediate performance optimizations',
        details: analysis.performanceIssues.map((issue) => issue.recommendation),
      })
    }

    // Core Web Vitals recommendations
    Object.entries(analysis.coreWebVitalsStatus).forEach(([metric, data]) => {
      if (data.status !== 'good') {
        recommendations.push({
          priority: 'high',
          category: 'core-web-vitals',
          title: `Improve ${metric.toUpperCase()}`,
          action: this.getWebVitalRecommendation(metric, data.value),
          metric: metric,
          currentValue: data.value,
        })
      }
    })

    // Resource optimization
    if (analysis.resourceOptimization.totalPotentialSavings > 100) {
      recommendations.push({
        priority: 'medium',
        category: 'resource-optimization',
        title: 'Bundle Size Optimization',
        action: `Potential savings: ${analysis.resourceOptimization.totalPotentialSavings}KB`,
        details: 'Implement tree shaking and remove unused code',
      })
    }

    return recommendations
  }

  private getWebVitalRecommendation(metric: string, value: number): string {
    const recommendations: Record<string, string> = {
      lcp: 'Optimize server response times, use CDN, implement resource hints',
      fid: 'Reduce JavaScript execution time, use web workers, optimize event handlers',
      cls: 'Set explicit dimensions for images and ads, avoid dynamic content insertion',
    }

    return recommendations[metric] || 'Follow Core Web Vitals best practices'
  }

  private async saveAnalysis(data: AnalysisData): Promise<void> {
    // Ensure results directory exists
    if (!fs.existsSync(this.resultsDir)) {
      fs.mkdirSync(this.resultsDir, { recursive: true })
    }

    const analysisFile = path.join(this.resultsDir, 'performance-analysis.json')
    fs.writeFileSync(analysisFile, JSON.stringify(data, null, 2))

    // Save summary for GitHub Actions
    const latest = data.results[data.results.length - 1]
    if (latest) {
      const summary: PerformanceSummary = {
        performance: latest.scores.performance || 0,
        accessibility: latest.scores.accessibility || 0,
        bestPractices: latest.scores.bestPractices || 0,
        seo: latest.scores.seo || 0,
        pwa: latest.scores.pwa || 0,
        lcp: latest.coreWebVitals.lcp / 1000 || 0,
        fid: latest.coreWebVitals.fid || 0,
        cls: latest.coreWebVitals.cls || 0,
        bundleSize: Math.round(((latest.resourceMetrics.totalByteWeight || 0) / 1024 / 1024) * 100) / 100,
        bundleSizeStatus: this.getBundleSizeStatus(latest.resourceMetrics.totalByteWeight || 0),
        loadTime: (latest.performanceMetrics.tti / 1000 || 0).toFixed(1),
        loadTimeStatus: this.getLoadTimeStatus(latest.performanceMetrics.tti || 0),
        reportUrl: 'https://lighthouse-results.example.com',
      }

      fs.writeFileSync(
        path.join(this.resultsDir, 'performance-summary.json'),
        JSON.stringify(summary, null, 2)
      )
    }
  }

  private getBundleSizeStatus(bytes: number): string {
    if (bytes <= 1024000) return '✅' // 1MB
    if (bytes <= 2048000) return '⚠️' // 2MB
    return '❌'
  }

  private getLoadTimeStatus(tti: number): string {
    if (tti <= 3000) return '✅' // 3s
    if (tti <= 5000) return '⚠️' // 5s
    return '❌'
  }

  private async generateReport(analysis: TrendAnalysis, recommendations: Recommendation[]): Promise<void> {
    const report = `# PWA Performance Analysis Report

## Current State
${Object.entries(analysis.currentState.status)
  .map(
    ([category, status]) =>
      `- **${category}**: ${status} (${analysis.currentState.scores[category as keyof LighthouseScores]}/100)`
  )
  .join('\n')}

## Core Web Vitals
${Object.entries(analysis.coreWebVitalsStatus)
  .map(
    ([metric, data]) =>
      `- **${metric.toUpperCase()}**: ${data.value}${metric === 'cls' ? '' : metric === 'fid' ? 'ms' : 's'} (${data.status})`
  )
  .join('\n')}

## Performance Issues
${analysis.performanceIssues.map((issue) => `- ${issue.type}: ${issue.recommendation}`).join('\n')}

## Recommendations
${recommendations
  .map(
    (rec, index) => `${index + 1}. **${rec.title}** (${rec.priority} priority)\n   ${rec.action}`
  )
  .join('\n\n')}

---
Generated at: ${new Date().toISOString()}
`

    const reportPath = path.join(this.resultsDir, 'performance-report.md')
    fs.writeFileSync(reportPath, report)
    this.log('📊 Performance report generated', 'info')
  }
}

// ==================== CLI Execution ====================

async function analyzeLighthouseTrendsMain(options: ScriptOptions = {}): Promise<ScriptResult<TrendAnalysis>> {
  const analyzer = new LighthouseTrendAnalyzer()
  return analyzer.analyze(options)
}

if (require.main === module) {
  const args = process.argv.slice(2)
  const options: ScriptOptions = {
    dryRun: args.includes('--dry-run'),
    verbose: args.includes('--verbose'),
    force: args.includes('--force'),
  }

  analyzeLighthouseTrendsMain(options)
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

export default LighthouseTrendAnalyzer
export { LighthouseTrendAnalyzer, analyzeLighthouseTrendsMain, type TrendAnalysis, type LighthouseResult }