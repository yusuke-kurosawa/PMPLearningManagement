#!/usr/bin/env node

/**
 * DevOps Metrics Dashboard Generator
 * Generates comprehensive DevOps metrics and reports
 */

const fs = require('fs').promises
const path = require('path')
const { exec } = require('child_process')
const { promisify } = require('util')

const execAsync = promisify(exec)

class DevOpsDashboard {
  constructor() {
    this.metrics = {
      codeQuality: {},
      buildMetrics: {},
      testMetrics: {},
      securityMetrics: {},
      performanceMetrics: {},
      deploymentMetrics: {},
    }
  }

  async run() {
    console.log('🚀 Generating DevOps Dashboard...\n')

    await this.collectCodeQualityMetrics()
    await this.collectBuildMetrics()
    await this.collectTestMetrics()
    await this.collectSecurityMetrics()
    await this.collectPerformanceMetrics()
    await this.collectDeploymentMetrics()

    await this.generateDashboard()
    await this.generateActionableInsights()
  }

  async collectCodeQualityMetrics() {
    console.log('📊 Collecting code quality metrics...')

    try {
      // ESLint metrics
      const { stdout: eslintOutput } = await execAsync('npx eslint src --format json', {
        encoding: 'utf8',
      }).catch(() => ({ stdout: '[]' }))
      const eslintResults = JSON.parse(eslintOutput || '[]')

      let totalErrors = 0
      let totalWarnings = 0
      let filesWithIssues = 0

      eslintResults.forEach((file) => {
        if (file.errorCount > 0 || file.warningCount > 0) {
          filesWithIssues++
          totalErrors += file.errorCount
          totalWarnings += file.warningCount
        }
      })

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
        avgLOCPerFile: Math.round(totalLOC / totalSourceFiles),
      }
    } catch (error) {
      console.error('Error collecting code quality metrics:', error.message)
    }
  }

  async collectBuildMetrics() {
    console.log('🔨 Collecting build metrics...')

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
      this.metrics.buildMetrics = {
        buildTime: 'N/A',
        bundleSize: 'N/A',
        success: false,
        error: error.message,
      }
    }
  }

  async collectTestMetrics() {
    console.log('🧪 Collecting test metrics...')

    try {
      // Check if coverage report exists
      const coverageFile = path.join(process.cwd(), 'coverage', 'coverage-summary.json')

      if (
        await fs
          .access(coverageFile)
          .then(() => true)
          .catch(() => false)
      ) {
        const coverageData = JSON.parse(await fs.readFile(coverageFile, 'utf8'))

        this.metrics.testMetrics = {
          lineCoverage: coverageData.total.lines.pct,
          branchCoverage: coverageData.total.branches.pct,
          functionCoverage: coverageData.total.functions.pct,
          statementCoverage: coverageData.total.statements.pct,
        }
      } else {
        // Run tests to generate coverage
        await execAsync('npm run test:coverage').catch(() => {})
        // Try again
        if (
          await fs
            .access(coverageFile)
            .then(() => true)
            .catch(() => false)
        ) {
          const coverageData = JSON.parse(await fs.readFile(coverageFile, 'utf8'))
          this.metrics.testMetrics = {
            lineCoverage: coverageData.total.lines.pct,
            branchCoverage: coverageData.total.branches.pct,
            functionCoverage: coverageData.total.functions.pct,
            statementCoverage: coverageData.total.statements.pct,
          }
        }
      }
    } catch (error) {
      this.metrics.testMetrics = {
        error: 'Unable to collect test metrics',
      }
    }
  }

  async collectSecurityMetrics() {
    console.log('🔒 Collecting security metrics...')

    try {
      const { stdout } = await execAsync('npm audit --json')
      const auditData = JSON.parse(stdout)

      this.metrics.securityMetrics = {
        vulnerabilities: auditData.metadata.vulnerabilities,
        totalDependencies: auditData.metadata.dependencies,
        totalDevDependencies: auditData.metadata.devDependencies,
      }
    } catch (error) {
      this.metrics.securityMetrics = {
        error: 'Unable to collect security metrics',
      }
    }
  }

  async collectPerformanceMetrics() {
    console.log('⚡ Collecting performance metrics...')

    // Placeholder for Lighthouse metrics
    this.metrics.performanceMetrics = {
      lighthouse: {
        performance: 'N/A',
        accessibility: 'N/A',
        bestPractices: 'N/A',
        seo: 'N/A',
        pwa: 'N/A',
      },
    }
  }

  async collectDeploymentMetrics() {
    console.log('🚀 Collecting deployment metrics...')

    try {
      // Get last deployment info from git
      const { stdout: lastCommit } = await execAsync('git log -1 --format="%h - %s (%cr)"')
      const { stdout: branch } = await execAsync('git branch --show-current')

      this.metrics.deploymentMetrics = {
        lastCommit: lastCommit.trim(),
        currentBranch: branch.trim(),
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      this.metrics.deploymentMetrics = {
        error: 'Unable to collect deployment metrics',
      }
    }
  }

  async generateDashboard() {
    const dashboard = `
# 📊 DevOps Metrics Dashboard
Generated: ${new Date().toLocaleString()}

## 🎯 Executive Summary

### Overall Health Score: ${this.calculateHealthScore()}/100

---

## 📈 Code Quality Metrics

### ESLint Analysis
- **Errors**: ${this.metrics.codeQuality.eslint?.errors || 'N/A'}
- **Warnings**: ${this.metrics.codeQuality.eslint?.warnings || 'N/A'}
- **Files with Issues**: ${this.metrics.codeQuality.eslint?.filesWithIssues || 'N/A'}/${this.metrics.codeQuality.eslint?.totalFiles || 'N/A'}
- **Quality Score**: ${this.metrics.codeQuality.eslint?.score?.toFixed(1) || 'N/A'}/100

### Codebase Statistics
- **Total Files**: ${this.metrics.codeQuality.codebase?.totalFiles || 'N/A'}
- **Lines of Code**: ${this.metrics.codeQuality.codebase?.totalLOC?.toLocaleString() || 'N/A'}
- **Avg LOC/File**: ${this.metrics.codeQuality.codebase?.avgLOCPerFile || 'N/A'}

---

## 🔨 Build Metrics

- **Build Time**: ${this.metrics.buildMetrics.buildTime}
- **Bundle Size**: ${this.metrics.buildMetrics.bundleSize}
- **Build Status**: ${this.metrics.buildMetrics.success ? '✅ Success' : '❌ Failed'}

---

## 🧪 Test Coverage

- **Line Coverage**: ${this.metrics.testMetrics.lineCoverage || 'N/A'}%
- **Branch Coverage**: ${this.metrics.testMetrics.branchCoverage || 'N/A'}%
- **Function Coverage**: ${this.metrics.testMetrics.functionCoverage || 'N/A'}%
- **Statement Coverage**: ${this.metrics.testMetrics.statementCoverage || 'N/A'}%

---

## 🔒 Security Metrics

### Vulnerability Summary
${this.formatVulnerabilities()}

- **Total Dependencies**: ${this.metrics.securityMetrics.totalDependencies || 'N/A'}
- **Dev Dependencies**: ${this.metrics.securityMetrics.totalDevDependencies || 'N/A'}

---

## ⚡ Performance Metrics

### Lighthouse Scores
- **Performance**: ${this.metrics.performanceMetrics.lighthouse.performance}
- **Accessibility**: ${this.metrics.performanceMetrics.lighthouse.accessibility}
- **Best Practices**: ${this.metrics.performanceMetrics.lighthouse.bestPractices}
- **SEO**: ${this.metrics.performanceMetrics.lighthouse.seo}
- **PWA**: ${this.metrics.performanceMetrics.lighthouse.pwa}

---

## 🚀 Deployment Info

- **Last Commit**: ${this.metrics.deploymentMetrics.lastCommit || 'N/A'}
- **Current Branch**: ${this.metrics.deploymentMetrics.currentBranch || 'N/A'}
- **Generated At**: ${this.metrics.deploymentMetrics.timestamp || 'N/A'}

---

## 📋 Recommendations

${this.generateRecommendations()}
`

    await fs.writeFile('DEVOPS_DASHBOARD.md', dashboard)
    console.log('\n✅ Dashboard generated: DEVOPS_DASHBOARD.md')
  }

  calculateHealthScore() {
    let score = 100

    // Deduct points for code quality issues
    if (this.metrics.codeQuality.eslint) {
      score -= this.metrics.codeQuality.eslint.errors * 2
      score -= this.metrics.codeQuality.eslint.warnings * 0.1
    }

    // Deduct points for low test coverage
    if (this.metrics.testMetrics.lineCoverage) {
      if (this.metrics.testMetrics.lineCoverage < 80) {
        score -= (80 - this.metrics.testMetrics.lineCoverage) * 0.5
      }
    }

    // Deduct points for security vulnerabilities
    if (this.metrics.securityMetrics.vulnerabilities) {
      const vulns = this.metrics.securityMetrics.vulnerabilities
      score -= vulns.critical * 10
      score -= vulns.high * 5
      score -= vulns.moderate * 2
      score -= vulns.low * 0.5
    }

    return Math.max(0, Math.round(score))
  }

  formatVulnerabilities() {
    if (!this.metrics.securityMetrics.vulnerabilities) {
      return '- No vulnerability data available'
    }

    const vulns = this.metrics.securityMetrics.vulnerabilities
    return `
- **Critical**: ${vulns.critical || 0}
- **High**: ${vulns.high || 0}
- **Moderate**: ${vulns.moderate || 0}
- **Low**: ${vulns.low || 0}
- **Info**: ${vulns.info || 0}`
  }

  generateRecommendations() {
    const recommendations = []

    // Code quality recommendations
    if (this.metrics.codeQuality.eslint?.errors > 0) {
      recommendations.push(
        `🔴 **Critical**: Fix ${this.metrics.codeQuality.eslint.errors} ESLint errors`
      )
    }

    if (this.metrics.codeQuality.eslint?.warnings > 100) {
      recommendations.push(
        `🟡 **Warning**: Address ${this.metrics.codeQuality.eslint.warnings} ESLint warnings`
      )
    }

    // Test coverage recommendations
    if (this.metrics.testMetrics.lineCoverage && this.metrics.testMetrics.lineCoverage < 80) {
      recommendations.push(
        `🟡 **Testing**: Improve test coverage (currently ${this.metrics.testMetrics.lineCoverage}%)`
      )
    }

    // Security recommendations
    if (this.metrics.securityMetrics.vulnerabilities?.critical > 0) {
      recommendations.push(
        `🔴 **Security**: Fix ${this.metrics.securityMetrics.vulnerabilities.critical} critical vulnerabilities immediately`
      )
    }

    if (this.metrics.securityMetrics.vulnerabilities?.high > 0) {
      recommendations.push(
        `🟠 **Security**: Address ${this.metrics.securityMetrics.vulnerabilities.high} high severity vulnerabilities`
      )
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ All metrics are within acceptable ranges!')
    }

    return recommendations.join('\n')
  }

  async generateActionableInsights() {
    const insights = {
      immediate: [],
      shortTerm: [],
      longTerm: [],
    }

    // Analyze and categorize issues
    if (this.metrics.codeQuality.eslint?.errors > 0) {
      insights.immediate.push({
        type: 'Code Quality',
        action: 'Run `npm run lint:fix` to auto-fix ESLint errors',
        impact: 'High',
      })
    }

    if (this.metrics.securityMetrics.vulnerabilities?.critical > 0) {
      insights.immediate.push({
        type: 'Security',
        action: 'Run `npm audit fix --force` to fix critical vulnerabilities',
        impact: 'Critical',
      })
    }

    // Save insights
    await fs.writeFile('DEVOPS_INSIGHTS.json', JSON.stringify(insights, null, 2))
    console.log('💡 Actionable insights saved: DEVOPS_INSIGHTS.json')
  }
}

// Run the dashboard generator
const dashboard = new DevOpsDashboard()
dashboard.run().catch(console.error)
