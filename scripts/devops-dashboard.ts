#!/usr/bin/env node
/**
 * DevOps Metrics Dashboard Generator
 * TypeScript version that generates comprehensive DevOps metrics and reports
 */

import * as fs from 'fs/promises'
import * as path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'
import type {
  CLIConfig,
  Logger,
  LogLevel,
  ExitCode,
  ScriptOptions,
  ScriptResult
} from '../src/types/devops/scripts.js'

// ==================== Type Definitions ====================

interface ESLintMetrics {
  errors: number
  warnings: number
  filesWithIssues: number
  totalFiles: number
  score: number
}

interface CodebaseMetrics {
  totalFiles: number
  totalLOC: number
  avgLOCPerFile: number
}

interface CodeQualityMetrics {
  eslint?: ESLintMetrics
  codebase?: CodebaseMetrics
}

interface BuildMetrics {
  buildTime: string
  bundleSize: string
  success: boolean
  error?: string
}

interface TestMetrics {
  lineCoverage?: number
  branchCoverage?: number
  functionCoverage?: number
  statementCoverage?: number
  totalTests?: number
  passedTests?: number
  failedTests?: number
  testDuration?: string
}

interface SecurityMetrics {
  vulnerabilities?: {
    critical: number
    high: number
    moderate: number
    low: number
  }
  lastAudit?: string
  dependencies?: {
    total: number
    outdated: number
  }
}

interface PerformanceMetrics {
  lighthouse?: {
    performance: number
    accessibility: number
    bestPractices: number
    seo: number
    pwa: number
  }
  bundleAnalysis?: {
    totalSize: string
    jsSize: string
    cssSize: string
    imageSize: string
  }
}

interface DeploymentMetrics {
  lastDeployment?: string
  deploymentFrequency?: string
  leadTime?: string
  mttr?: string
  changeFailureRate?: number
}

interface DevOpsMetrics {
  codeQuality: CodeQualityMetrics
  buildMetrics: BuildMetrics
  testMetrics: TestMetrics
  securityMetrics: SecurityMetrics
  performanceMetrics: PerformanceMetrics
  deploymentMetrics: DeploymentMetrics
}

interface DashboardReport {
  metrics: DevOpsMetrics
  insights: string[]
  recommendations: string[]
  score: number
  timestamp: Date
}

// ==================== Main Class ====================

const execAsync = promisify(exec)

class DevOpsDashboard {
  private metrics: DevOpsMetrics

  constructor() {
    this.metrics = {
      codeQuality: {},
      buildMetrics: {
        buildTime: 'N/A',
        bundleSize: 'N/A',
        success: false
      },
      testMetrics: {},
      securityMetrics: {},
      performanceMetrics: {},
      deploymentMetrics: {},
    }
  }

  async run(options: ScriptOptions = {}): Promise<ScriptResult<DashboardReport>> {
    const startTime = Date.now()
    this.log('🚀 Generating DevOps Dashboard...\n', 'info')

    try {
      if (options.dryRun) {
        this.log('DRY RUN MODE: Would generate dashboard but no actual metrics will be collected', 'warn')
        return {
          success: true,
          data: {} as DashboardReport,
          duration: Date.now() - startTime,
          timestamp: new Date(),
        }
      }

      await this.collectCodeQualityMetrics()
      await this.collectBuildMetrics()
      await this.collectTestMetrics()
      await this.collectSecurityMetrics()
      await this.collectPerformanceMetrics()
      await this.collectDeploymentMetrics()

      const insights = await this.generateActionableInsights()
      const recommendations = await this.generateRecommendations()
      const score = this.calculateOverallScore()

      const report: DashboardReport = {
        metrics: this.metrics,
        insights,
        recommendations,
        score,
        timestamp: new Date()
      }

      await this.generateDashboard(report)

      this.log('✅ DevOps Dashboard generated successfully!', 'info')

      return {
        success: true,
        data: report,
        duration: Date.now() - startTime,
        timestamp: new Date(),
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      this.log(`❌ Dashboard generation failed: ${errorMessage}`, 'error')

      return {
        success: false,
        error: errorMessage,
        duration: Date.now() - startTime,
        timestamp: new Date(),
      }
    }
  }

  private async collectCodeQualityMetrics(): Promise<void> {
    this.log('📊 Collecting code quality metrics...', 'info')

    try {
      // ESLint metrics
      const { stdout: eslintOutput } = await execAsync('npx eslint src --format json', {
        encoding: 'utf8',
      }).catch(() => ({ stdout: '[]', stderr: '' }))
      
      const eslintResults = JSON.parse(eslintOutput || '[]')

      let totalErrors = 0
      let totalWarnings = 0
      let filesWithIssues = 0

      if (Array.isArray(eslintResults)) {
        eslintResults.forEach((file: any) => {
          if (file.errorCount > 0 || file.warningCount > 0) {
            filesWithIssues++
            totalErrors += file.errorCount
            totalWarnings += file.warningCount
          }
        })
      }

      this.metrics.codeQuality.eslint = {
        errors: totalErrors,
        warnings: totalWarnings,
        filesWithIssues,
        totalFiles: eslintResults.length,
        score: Math.max(0, 100 - totalErrors * 5 - totalWarnings * 0.5),
      }

      // Code complexity
      const { stdout: complexityOutput } = await execAsync(
        'find src -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" | wc -l'
      )
      const totalSourceFiles = parseInt(complexityOutput.trim())

      // Lines of code
      const { stdout: locOutput } = await execAsync(
        'find src -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" -exec wc -l {} + | tail -1'
      )
      const totalLOC = parseInt(locOutput.trim().split(/\s+/)[0] || '0')

      this.metrics.codeQuality.codebase = {
        totalFiles: totalSourceFiles,
        totalLOC,
        avgLOCPerFile: totalSourceFiles > 0 ? Math.round(totalLOC / totalSourceFiles) : 0,
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      this.log(`Error collecting code quality metrics: ${errorMessage}`, 'warn')
    }
  }

  private async collectBuildMetrics(): Promise<void> {
    this.log('🔨 Collecting build metrics...', 'info')

    try {
      const startTime = Date.now()
      await execAsync('npm run build')
      const buildTime = (Date.now() - startTime) / 1000

      // Get bundle size
      const { stdout: bundleSize } = await execAsync('du -sh dist | cut -f1')

      this.metrics.buildMetrics = {
        buildTime: `${buildTime}s`,
        bundleSize: bundleSize.trim(),
        success: true,
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      this.metrics.buildMetrics = {
        buildTime: 'N/A',
        bundleSize: 'N/A',
        success: false,
        error: errorMessage,
      }
    }
  }

  private async collectTestMetrics(): Promise<void> {
    this.log('🧪 Collecting test metrics...', 'info')

    try {
      // Check if coverage report exists
      const coverageFile = path.join(process.cwd(), 'coverage', 'coverage-summary.json')

      const fileExists = await fs
        .access(coverageFile)
        .then(() => true)
        .catch(() => false)

      if (fileExists) {
        const coverageData = JSON.parse(await fs.readFile(coverageFile, 'utf8'))

        this.metrics.testMetrics = {
          lineCoverage: coverageData.total.lines.pct,
          branchCoverage: coverageData.total.branches.pct,
          functionCoverage: coverageData.total.functions.pct,
          statementCoverage: coverageData.total.statements.pct,
        }
      } else {
        // Try to run tests to generate coverage
        try {
          await execAsync('npm run test:coverage')
          // Check again
          const exists = await fs
            .access(coverageFile)
            .then(() => true)
            .catch(() => false)
          
          if (exists) {
            const coverageData = JSON.parse(await fs.readFile(coverageFile, 'utf8'))
            this.metrics.testMetrics = {
              lineCoverage: coverageData.total.lines.pct,
              branchCoverage: coverageData.total.branches.pct,
              functionCoverage: coverageData.total.functions.pct,
              statementCoverage: coverageData.total.statements.pct,
            }
          }
        } catch (testError) {
          this.log('Could not generate test coverage', 'warn')
        }
      }

      // Get test count
      try {
        const { stdout: testOutput } = await execAsync('npm run test -- --listTests | wc -l')
        const totalTests = parseInt(testOutput.trim())
        this.metrics.testMetrics.totalTests = totalTests
      } catch (error) {
        // Silent fail for test count
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      this.log(`Error collecting test metrics: ${errorMessage}`, 'warn')
    }
  }

  private async collectSecurityMetrics(): Promise<void> {
    this.log('🔒 Collecting security metrics...', 'info')

    try {
      // Run npm audit
      const { stdout: auditOutput } = await execAsync('npm audit --json').catch((error) => ({
        stdout: JSON.stringify({ vulnerabilities: {} }),
        stderr: ''
      }))
      
      const auditData = JSON.parse(auditOutput)

      const vulnerabilities = {
        critical: 0,
        high: 0,
        moderate: 0,
        low: 0,
      }

      if (auditData.vulnerabilities) {
        Object.values(auditData.vulnerabilities).forEach((vuln: any) => {
          const severity = vuln.severity?.toLowerCase()
          if (severity && severity in vulnerabilities) {
            vulnerabilities[severity as keyof typeof vulnerabilities]++
          }
        })
      }

      // Check outdated dependencies
      const { stdout: outdatedOutput } = await execAsync('npm outdated --json').catch(() => ({
        stdout: '{}',
        stderr: ''
      }))
      
      const outdatedData = JSON.parse(outdatedOutput || '{}')
      const outdatedCount = Object.keys(outdatedData).length

      this.metrics.securityMetrics = {
        vulnerabilities,
        lastAudit: new Date().toISOString(),
        dependencies: {
          total: Object.keys(auditData.dependencies || {}).length,
          outdated: outdatedCount,
        },
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      this.log(`Error collecting security metrics: ${errorMessage}`, 'warn')
    }
  }

  private async collectPerformanceMetrics(): Promise<void> {
    this.log('⚡ Collecting performance metrics...', 'info')

    try {
      // Check for lighthouse results
      const lighthouseFile = path.join(process.cwd(), 'lighthouse-results', 'latest.json')
      
      const fileExists = await fs
        .access(lighthouseFile)
        .then(() => true)
        .catch(() => false)

      if (fileExists) {
        const lighthouseData = JSON.parse(await fs.readFile(lighthouseFile, 'utf8'))
        
        if (lighthouseData.categories) {
          this.metrics.performanceMetrics.lighthouse = {
            performance: Math.round(lighthouseData.categories.performance?.score * 100 || 0),
            accessibility: Math.round(lighthouseData.categories.accessibility?.score * 100 || 0),
            bestPractices: Math.round(lighthouseData.categories['best-practices']?.score * 100 || 0),
            seo: Math.round(lighthouseData.categories.seo?.score * 100 || 0),
            pwa: Math.round(lighthouseData.categories.pwa?.score * 100 || 0),
          }
        }
      }

      // Bundle analysis
      try {
        const { stdout: jsSize } = await execAsync('find dist -name "*.js" -exec du -ch {} + | grep total | cut -f1')
        const { stdout: cssSize } = await execAsync('find dist -name "*.css" -exec du -ch {} + | grep total | cut -f1')
        const { stdout: totalSize } = await execAsync('du -sh dist | cut -f1')

        this.metrics.performanceMetrics.bundleAnalysis = {
          totalSize: totalSize.trim(),
          jsSize: jsSize.trim() || '0',
          cssSize: cssSize.trim() || '0',
          imageSize: '0', // Would need more complex analysis
        }
      } catch (error) {
        // Silent fail for bundle analysis
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      this.log(`Error collecting performance metrics: ${errorMessage}`, 'warn')
    }
  }

  private async collectDeploymentMetrics(): Promise<void> {
    this.log('🚀 Collecting deployment metrics...', 'info')

    try {
      // Get last deployment from git tags or commits
      const { stdout: lastDeploy } = await execAsync(
        'git log --grep="deploy" --pretty=format:"%h - %s (%cr)" -1'
      ).catch(() => ({ stdout: 'N/A', stderr: '' }))

      // Calculate deployment frequency (deployments in last 30 days)
      const { stdout: deployCount } = await execAsync(
        'git log --grep="deploy" --since="30 days ago" --oneline | wc -l'
      ).catch(() => ({ stdout: '0', stderr: '' }))

      const deploymentsPerMonth = parseInt(deployCount.trim())

      this.metrics.deploymentMetrics = {
        lastDeployment: lastDeploy.trim() || 'N/A',
        deploymentFrequency: `${deploymentsPerMonth} per month`,
        leadTime: 'N/A', // Would need more complex calculation
        mttr: 'N/A', // Would need incident tracking
        changeFailureRate: 0, // Would need deployment tracking
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      this.log(`Error collecting deployment metrics: ${errorMessage}`, 'warn')
    }
  }

  private async generateActionableInsights(): Promise<string[]> {
    const insights: string[] = []

    // Code quality insights
    if (this.metrics.codeQuality.eslint) {
      const { errors, warnings, score } = this.metrics.codeQuality.eslint
      if (errors > 0) {
        insights.push(`🔴 ${errors} ESLint errors need immediate attention`)
      }
      if (warnings > 20) {
        insights.push(`⚠️  ${warnings} ESLint warnings should be addressed`)
      }
      if (score > 90) {
        insights.push('✅ Code quality score is excellent (>90)')
      }
    }

    // Test coverage insights
    if (this.metrics.testMetrics.lineCoverage) {
      const coverage = this.metrics.testMetrics.lineCoverage
      if (coverage < 60) {
        insights.push(`🔴 Test coverage is low (${coverage}%), consider adding more tests`)
      } else if (coverage > 80) {
        insights.push(`✅ Good test coverage (${coverage}%)`)
      }
    }

    // Security insights
    if (this.metrics.securityMetrics.vulnerabilities) {
      const { critical, high } = this.metrics.securityMetrics.vulnerabilities
      if (critical > 0) {
        insights.push(`🚨 ${critical} critical vulnerabilities detected - immediate action required`)
      }
      if (high > 0) {
        insights.push(`🔴 ${high} high severity vulnerabilities need attention`)
      }
    }

    // Performance insights
    if (this.metrics.performanceMetrics.lighthouse) {
      const { performance } = this.metrics.performanceMetrics.lighthouse
      if (performance < 50) {
        insights.push(`🔴 Poor performance score (${performance}/100)`)
      } else if (performance > 90) {
        insights.push(`✅ Excellent performance score (${performance}/100)`)
      }
    }

    return insights
  }

  private async generateRecommendations(): Promise<string[]> {
    const recommendations: string[] = []

    // Based on metrics, generate recommendations
    if (this.metrics.codeQuality.eslint?.errors && this.metrics.codeQuality.eslint.errors > 0) {
      recommendations.push('Run `npm run lint:fix` to automatically fix ESLint issues')
    }

    if (this.metrics.testMetrics.lineCoverage && this.metrics.testMetrics.lineCoverage < 70) {
      recommendations.push('Increase test coverage to at least 70% for better code reliability')
    }

    if (this.metrics.securityMetrics.vulnerabilities?.critical && 
        this.metrics.securityMetrics.vulnerabilities.critical > 0) {
      recommendations.push('Run `npm audit fix --force` to fix critical vulnerabilities')
    }

    if (this.metrics.securityMetrics.dependencies?.outdated && 
        this.metrics.securityMetrics.dependencies.outdated > 10) {
      recommendations.push('Update outdated dependencies with `npm update`')
    }

    if (this.metrics.performanceMetrics.lighthouse?.performance && 
        this.metrics.performanceMetrics.lighthouse.performance < 70) {
      recommendations.push('Optimize bundle size and implement code splitting')
    }

    return recommendations
  }

  private calculateOverallScore(): number {
    let score = 0
    let weights = 0

    // Code quality score (weight: 25)
    if (this.metrics.codeQuality.eslint?.score) {
      score += this.metrics.codeQuality.eslint.score * 0.25
      weights += 0.25
    }

    // Test coverage score (weight: 25)
    if (this.metrics.testMetrics.lineCoverage) {
      score += this.metrics.testMetrics.lineCoverage * 0.25
      weights += 0.25
    }

    // Security score (weight: 25)
    if (this.metrics.securityMetrics.vulnerabilities) {
      const { critical, high } = this.metrics.securityMetrics.vulnerabilities
      const securityScore = Math.max(0, 100 - critical * 30 - high * 10)
      score += securityScore * 0.25
      weights += 0.25
    }

    // Performance score (weight: 25)
    if (this.metrics.performanceMetrics.lighthouse?.performance) {
      score += this.metrics.performanceMetrics.lighthouse.performance * 0.25
      weights += 0.25
    }

    return weights > 0 ? Math.round(score / weights) : 0
  }

  private async generateDashboard(report: DashboardReport): Promise<void> {
    const dashboardPath = path.join(process.cwd(), 'devops-dashboard.md')

    const content = `# DevOps Dashboard

Generated: ${report.timestamp.toISOString()}

## Overall Score: ${report.score}/100

## 📊 Metrics Summary

### Code Quality
- ESLint Errors: ${report.metrics.codeQuality.eslint?.errors || 'N/A'}
- ESLint Warnings: ${report.metrics.codeQuality.eslint?.warnings || 'N/A'}
- Code Quality Score: ${report.metrics.codeQuality.eslint?.score || 'N/A'}/100
- Total LOC: ${report.metrics.codeQuality.codebase?.totalLOC || 'N/A'}

### Build Metrics
- Build Time: ${report.metrics.buildMetrics.buildTime}
- Bundle Size: ${report.metrics.buildMetrics.bundleSize}
- Build Success: ${report.metrics.buildMetrics.success ? '✅' : '❌'}

### Test Coverage
- Line Coverage: ${report.metrics.testMetrics.lineCoverage || 'N/A'}%
- Branch Coverage: ${report.metrics.testMetrics.branchCoverage || 'N/A'}%
- Function Coverage: ${report.metrics.testMetrics.functionCoverage || 'N/A'}%
- Statement Coverage: ${report.metrics.testMetrics.statementCoverage || 'N/A'}%

### Security
- Critical: ${report.metrics.securityMetrics.vulnerabilities?.critical || 0}
- High: ${report.metrics.securityMetrics.vulnerabilities?.high || 0}
- Moderate: ${report.metrics.securityMetrics.vulnerabilities?.moderate || 0}
- Low: ${report.metrics.securityMetrics.vulnerabilities?.low || 0}

### Performance (Lighthouse)
- Performance: ${report.metrics.performanceMetrics.lighthouse?.performance || 'N/A'}/100
- Accessibility: ${report.metrics.performanceMetrics.lighthouse?.accessibility || 'N/A'}/100
- Best Practices: ${report.metrics.performanceMetrics.lighthouse?.bestPractices || 'N/A'}/100
- SEO: ${report.metrics.performanceMetrics.lighthouse?.seo || 'N/A'}/100
- PWA: ${report.metrics.performanceMetrics.lighthouse?.pwa || 'N/A'}/100

## 💡 Insights

${report.insights.map(insight => `- ${insight}`).join('\n')}

## 📋 Recommendations

${report.recommendations.map(rec => `- ${rec}`).join('\n')}

---
*Dashboard generated by DevOps Metrics Collector*
`

    await fs.writeFile(dashboardPath, content)
    this.log(`\n📊 Dashboard saved to: ${dashboardPath}`, 'info')
  }

  private log(message: string, level: LogLevel = 'info'): void {
    console.log(message)
  }
}

// ==================== CLI Execution ====================

async function generateDevOpsDashboardMain(options: ScriptOptions = {}): Promise<ScriptResult<DashboardReport>> {
  const dashboard = new DevOpsDashboard()
  return dashboard.run(options)
}

if (require.main === module) {
  const args = process.argv.slice(2)
  const options: ScriptOptions = {
    dryRun: args.includes('--dry-run'),
    verbose: args.includes('--verbose'),
    force: args.includes('--force'),
  }

  generateDevOpsDashboardMain(options)
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

export default DevOpsDashboard
export { DevOpsDashboard, generateDevOpsDashboardMain, type DashboardReport, type DevOpsMetrics }