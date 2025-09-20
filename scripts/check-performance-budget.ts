#!/usr/bin/env node

/**
 * Performance Budget Enforcement System
 * Automatically checks and enforces performance budgets
 */

import { promises as fs } from 'node:fs'
import * as fsSync from 'node:fs'
import * as path from 'node:path'
import type { 
  CLIArguments, 
  Logger, 
  ExitCode, 
  CLIException,
  PerformanceBudgetChecker as PerformanceBudgetCheckerInterface,
  PerformanceBudget,
  BudgetViolation,
  BudgetWarning,
  BudgetReport,
  PerformanceResults
} from '../src/types/scripts/index.js'

interface PerformanceMetrics {
  readonly fcp: number
  readonly si: number
  readonly tti: number
  readonly tbt: number
}

interface CoreWebVitals {
  readonly lcp: number
  readonly fid: number
  readonly cls: number
}

interface ResourceMetrics {
  readonly totalByteWeight: number
  readonly unusedJavaScript: number
  readonly unusedCSS: number
}

interface LighthouseScores {
  readonly performance: number
  readonly accessibility: number
  readonly bestPractices: number
  readonly seo: number
  readonly pwa: number
}

interface BudgetRecommendation {
  readonly category: string
  readonly priority: 'low' | 'medium' | 'high' | 'critical'
  readonly action: string
  readonly details: readonly string[]
}

class PerformanceBudgetChecker implements PerformanceBudgetCheckerInterface {
  private readonly budgetFile: string = './performance-budget.json'
  private readonly resultsDir: string = './lighthouse-results'
  private readonly violations: BudgetViolation[] = []
  private readonly warnings: BudgetWarning[] = []
  
  private readonly logger: Logger = {
    info: (message: string) => console.log(`ℹ️ ${message}`),
    warn: (message: string) => console.warn(`⚠️ ${message}`),
    error: (message: string) => console.error(`❌ ${message}`),
    debug: (message: string) => console.log(`🐛 ${message}`),
    success: (message: string) => console.log(`✅ ${message}`)
  }

  async check(): Promise<void> {
    console.log('💰 Checking performance budget compliance...')

    try {
      const budget = this.loadBudget()
      const results = this.loadLatestResults()

      if (!results) {
        console.log('⚠️ No performance results found')
        return
      }

      this.checkBudget(budget, results)
      await this.generateReport()

      if (this.violations.length > 0) {
        console.error(`❌ ${this.violations.length} budget violations found!`)
        process.exit(ExitCode.GENERAL_ERROR)
      } else {
        this.logger.success('All performance budgets are within limits')
      }
    } catch (error) {
      if (error instanceof CLIException) {
        this.logger.error(`Budget check failed: ${error.message}`)
        process.exit(error.exitCode)
      } else {
        this.logger.error(`Budget check failed: ${error instanceof Error ? error.message : String(error)}`)
        process.exit(ExitCode.GENERAL_ERROR)
      }
    }
  }

  private loadBudget(): PerformanceBudget {
    if (!fsSync.existsSync(this.budgetFile)) {
      // Create default budget if none exists
      const defaultBudget = this.createDefaultBudget()
      fsSync.writeFileSync(this.budgetFile, JSON.stringify(defaultBudget, null, 2))
      console.log('📋 Created default performance budget')
      return defaultBudget
    }

    try {
      const content = fsSync.readFileSync(this.budgetFile, 'utf8')
      return JSON.parse(content) as PerformanceBudget
    } catch (error) {
      throw new CLIException(
        `Failed to load performance budget: ${error instanceof Error ? error.message : String(error)}`,
        ExitCode.CONFIG_ERROR
      )
    }
  }

  private createDefaultBudget(): PerformanceBudget {
    return {
      version: '1.0.0',
      description: 'PWA Learning Management Performance Budget',
      budgets: {
        lighthouse: {
          performance: { min: 85, warn: 90 },
          accessibility: { min: 95, warn: 98 },
          bestPractices: { min: 90, warn: 95 },
          seo: { min: 90, warn: 95 },
          pwa: { min: 90, warn: 95 },
        },
        coreWebVitals: {
          lcp: { max: 2500, warn: 2000 }, // ms
          fid: { max: 100, warn: 50 }, // ms
          cls: { max: 0.1, warn: 0.05 }, // score
        },
        performance: {
          fcp: { max: 1800, warn: 1500 }, // ms
          speedIndex: { max: 3000, warn: 2500 }, // ms
          tti: { max: 5000, warn: 4000 }, // ms
          tbt: { max: 300, warn: 200 }, // ms
        },
        resources: {
          totalSize: { max: 2097152, warn: 1572864 }, // bytes (2MB/1.5MB)
          jsSize: { max: 1048576, warn: 786432 }, // bytes (1MB/768KB)
          cssSize: { max: 262144, warn: 196608 }, // bytes (256KB/192KB)
          imageSize: { max: 524288, warn: 393216 }, // bytes (512KB/384KB)
          unusedJs: { max: 204800, warn: 102400 }, // bytes (200KB/100KB)
          unusedCss: { max: 51200, warn: 25600 }, // bytes (50KB/25KB)
        },
        timing: {
          domContentLoaded: { max: 3000, warn: 2000 }, // ms
          loadComplete: { max: 5000, warn: 4000 }, // ms
          timeToFirstByte: { max: 600, warn: 400 }, // ms
        },
      },
      alerts: {
        slack: {
          enabled: false,
          webhook: process.env.SLACK_WEBHOOK_URL,
        },
        email: {
          enabled: false,
          recipients: [],
        },
      },
    }
  }

  private loadLatestResults(): PerformanceResults | null {
    const analysisFile = path.join(this.resultsDir, 'performance-analysis.json')

    if (!fsSync.existsSync(analysisFile)) {
      console.log('No analysis results found')
      return null
    }

    try {
      const content = fsSync.readFileSync(analysisFile, 'utf8')
      const analysis = JSON.parse(content)
      return analysis.results[analysis.results.length - 1] // Latest result
    } catch (error) {
      this.logger.warn(`Failed to load performance results: ${error instanceof Error ? error.message : String(error)}`)
      return null
    }
  }

  private checkBudget(budget: PerformanceBudget, results: PerformanceResults): void {
    // Check Lighthouse scores
    this.checkLighthouseScores(budget.budgets.lighthouse, results.scores)

    // Check Core Web Vitals
    this.checkCoreWebVitals(budget.budgets.coreWebVitals, results.coreWebVitals)

    // Check Performance metrics
    this.checkPerformanceMetrics(budget.budgets.performance, results.performanceMetrics)

    // Check Resource budgets
    this.checkResourceBudgets(budget.budgets.resources, results.resourceMetrics)
  }

  private checkLighthouseScores(
    budget: PerformanceBudget['budgets']['lighthouse'], 
    scores: LighthouseScores
  ): void {
    for (const [category, limits] of Object.entries(budget)) {
      const score = scores[category as keyof LighthouseScores]
      const categoryName = category.charAt(0).toUpperCase() + category.slice(1)

      if (score < limits.min) {
        this.violations.push({
          type: 'lighthouse',
          category,
          message: `${categoryName} score ${score} is below minimum ${limits.min}`,
          current: score,
          limit: limits.min,
          severity: 'error',
        })
      } else if (score < limits.warn) {
        this.warnings.push({
          type: 'lighthouse',
          category,
          message: `${categoryName} score ${score} is below warning threshold ${limits.warn}`,
          current: score,
          limit: limits.warn,
          severity: 'warning',
        })
      }
    }
  }

  private checkCoreWebVitals(
    budget: PerformanceBudget['budgets']['coreWebVitals'], 
    vitals: CoreWebVitals
  ): void {
    for (const [metric, limits] of Object.entries(budget)) {
      const value = vitals[metric as keyof CoreWebVitals]
      const metricName = metric.toUpperCase()

      if (value > limits.max) {
        this.violations.push({
          type: 'core-web-vitals',
          category: metric,
          message: `${metricName} ${value} exceeds maximum ${limits.max}`,
          current: value,
          limit: limits.max,
          severity: 'error',
        })
      } else if (value > limits.warn) {
        this.warnings.push({
          type: 'core-web-vitals',
          category: metric,
          message: `${metricName} ${value} exceeds warning threshold ${limits.warn}`,
          current: value,
          limit: limits.warn,
          severity: 'warning',
        })
      }
    }
  }

  private checkPerformanceMetrics(
    budget: PerformanceBudget['budgets']['performance'], 
    metrics: PerformanceMetrics
  ): void {
    const metricMap: Record<string, string> = {
      fcp: 'First Contentful Paint',
      speedIndex: 'Speed Index',
      tti: 'Time to Interactive',
      tbt: 'Total Blocking Time',
    }

    for (const [key, limits] of Object.entries(budget)) {
      const value = metrics[key === 'speedIndex' ? 'si' : key as keyof PerformanceMetrics]
      const metricName = metricMap[key]

      if (value > limits.max) {
        this.violations.push({
          type: 'performance',
          category: key,
          message: `${metricName} ${Math.round(value)}ms exceeds maximum ${limits.max}ms`,
          current: value,
          limit: limits.max,
          severity: 'error',
        })
      } else if (value > limits.warn) {
        this.warnings.push({
          type: 'performance',
          category: key,
          message: `${metricName} ${Math.round(value)}ms exceeds warning threshold ${limits.warn}ms`,
          current: value,
          limit: limits.warn,
          severity: 'warning',
        })
      }
    }
  }

  private checkResourceBudgets(
    budget: PerformanceBudget['budgets']['resources'], 
    resources: ResourceMetrics
  ): void {
    const checks = [
      { key: 'totalSize' as const, value: resources.totalByteWeight, name: 'Total Bundle Size' },
      { key: 'unusedJs' as const, value: resources.unusedJavaScript, name: 'Unused JavaScript' },
      { key: 'unusedCss' as const, value: resources.unusedCSS, name: 'Unused CSS' },
    ]

    checks.forEach(({ key, value, name }) => {
      const budgetLimits = budget[key]
      if (budgetLimits && value > budgetLimits.max) {
        this.violations.push({
          type: 'resources',
          category: key,
          message: `${name} ${this.formatBytes(value)} exceeds maximum ${this.formatBytes(budgetLimits.max)}`,
          current: value,
          limit: budgetLimits.max,
          severity: 'error',
        })
      } else if (budgetLimits && value > budgetLimits.warn) {
        this.warnings.push({
          type: 'resources',
          category: key,
          message: `${name} ${this.formatBytes(value)} exceeds warning threshold ${this.formatBytes(budgetLimits.warn)}`,
          current: value,
          limit: budgetLimits.warn,
          severity: 'warning',
        })
      }
    })
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  private async generateReport(): Promise<BudgetReport> {
    const report: BudgetReport = {
      timestamp: new Date().toISOString(),
      status: this.violations.length === 0 ? 'pass' : 'fail',
      summary: {
        violations: this.violations.length,
        warnings: this.warnings.length,
        total: this.violations.length + this.warnings.length,
      },
      violations: this.violations,
      warnings: this.warnings,
      recommendations: this.generateRecommendations(),
    }

    // Ensure results directory exists
    if (!fsSync.existsSync(this.resultsDir)) {
      fsSync.mkdirSync(this.resultsDir, { recursive: true })
    }

    // Save detailed report
    const reportFile = path.join(this.resultsDir, 'budget-report.json')
    fsSync.writeFileSync(reportFile, JSON.stringify(report, null, 2))

    // Generate markdown report
    const markdownReport = this.generateMarkdownReport(report)
    fsSync.writeFileSync(path.join(this.resultsDir, 'budget-report.md'), markdownReport)

    console.log('📋 Budget report generated')
    return report
  }

  private generateRecommendations(): readonly BudgetRecommendation[] {
    const recommendations: BudgetRecommendation[] = []

    // Group violations by type
    const groupedViolations = this.violations.reduce((acc, violation) => {
      if (!acc[violation.type]) acc[violation.type] = []
      acc[violation.type].push(violation)
      return acc
    }, {} as Record<string, BudgetViolation[]>)

    if (groupedViolations.lighthouse) {
      recommendations.push({
        category: 'Lighthouse Scores',
        priority: 'high',
        action: 'Focus on improving low-scoring categories',
        details: groupedViolations.lighthouse.map((v) => v.category),
      })
    }

    if (groupedViolations['core-web-vitals']) {
      recommendations.push({
        category: 'Core Web Vitals',
        priority: 'critical',
        action: 'Optimize Core Web Vitals for better user experience',
        details: groupedViolations['core-web-vitals'].map((v) => v.category),
      })
    }

    if (groupedViolations.resources) {
      recommendations.push({
        category: 'Resource Optimization',
        priority: 'high',
        action: 'Reduce bundle size and remove unused code',
        details: ['Implement tree shaking', 'Code splitting', 'Remove unused dependencies'],
      })
    }

    return recommendations
  }

  private generateMarkdownReport(report: BudgetReport): string {
    return `# Performance Budget Report

**Status**: ${report.status.toUpperCase()} ${report.status === 'pass' ? '✅' : '❌'}
**Generated**: ${new Date(report.timestamp).toLocaleString()}

## Summary
- **Violations**: ${report.summary.violations}
- **Warnings**: ${report.summary.warnings}
- **Total Issues**: ${report.summary.total}

## Violations
${
  report.violations.length === 0
    ? 'None 🎉'
    : report.violations.map((v) => `- **${v.type}**: ${v.message}`).join('\n')
}

## Warnings
${
  report.warnings.length === 0
    ? 'None'
    : report.warnings.map((w) => `- **${w.type}**: ${w.message}`).join('\n')
}

## Recommendations
${report.recommendations
  .map((rec, i) => `${i + 1}. **${rec.category}** (${rec.priority} priority)\n   ${rec.action}`)
  .join('\n\n')}

---
*Performance budget enforcement helps maintain optimal user experience*
`
  }
}

// Export class for testing
export default PerformanceBudgetChecker

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const checker = new PerformanceBudgetChecker()
  checker.check().catch(console.error)
}