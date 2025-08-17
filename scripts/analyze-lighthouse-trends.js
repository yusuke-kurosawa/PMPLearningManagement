#!/usr/bin/env node

/**
 * Intelligent Lighthouse Trend Analysis
 * Analyzes performance trends and provides actionable insights
 */

const fs = require('fs')
const path = require('path')

class LighthouseTrendAnalyzer {
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

  async analyze() {
    console.log('🔍 Analyzing Lighthouse performance trends...')

    try {
      const results = this.collectResults()
      const analysis = this.performAnalysis(results)
      const recommendations = this.generateRecommendations(analysis)

      await this.saveAnalysis({ results, analysis, recommendations })
      await this.generateReport(analysis, recommendations)

      console.log('✅ Analysis complete!')
      return analysis
    } catch (error) {
      console.error('❌ Analysis failed:', error)
      process.exit(1)
    }
  }

  collectResults() {
    const results = []

    if (!fs.existsSync(this.resultsDir)) {
      console.log('No lighthouse results found')
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
        console.warn(`Failed to parse ${file}:`, error.message)
      }
    }

    return results
  }

  extractMetrics(lhr) {
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

  performAnalysis(results) {
    if (results.length === 0) {
      return { trend: 'no-data', insights: [] }
    }

    const latest = results[results.length - 1]
    const analysis = {
      currentState: this.analyzeCurrentState(latest),
      trends: this.analyzeTrends(results),
      coreWebVitalsStatus: this.analyzeCoreWebVitals(latest),
      performanceIssues: this.identifyPerformanceIssues(latest),
      resourceOptimization: this.analyzeResourceOptimization(latest),
    }

    return analysis
  }

  analyzeCurrentState(latest) {
    const scores = latest.scores
    const status = {}

    for (const [category, score] of Object.entries(scores)) {
      const thresholds = this.thresholds[category]
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

  analyzeTrends(results) {
    if (results.length < 2) return { trend: 'insufficient-data' }

    const recent = results.slice(-5) // Last 5 runs
    const trends = {}

    ;['performance', 'accessibility', 'bestPractices', 'seo', 'pwa'].forEach((category) => {
      const values = recent.map((r) => r.scores[category])
      const trend = this.calculateTrend(values)
      trends[category] = trend
    })

    return trends
  }

  calculateTrend(values) {
    if (values.length < 2) return 0

    const first = values[0]
    const last = values[values.length - 1]
    const change = last - first

    if (Math.abs(change) < 2) return 0 // Stable
    return change > 0 ? 1 : -1 // Improving or declining
  }

  analyzeCoreWebVitals(latest) {
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

  identifyPerformanceIssues(latest) {
    const issues = []
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

  analyzeResourceOptimization(latest) {
    const { resourceMetrics } = latest
    const potential = {}

    if (resourceMetrics.unusedJavaScript > 0) {
      potential.javascriptSavings = Math.round(resourceMetrics.unusedJavaScript / 1024)
    }

    if (resourceMetrics.unusedCSS > 0) {
      potential.cssSavings = Math.round(resourceMetrics.unusedCSS / 1024)
    }

    const totalSavings = (potential.javascriptSavings || 0) + (potential.cssSavings || 0)
    potential.totalPotentialSavings = totalSavings

    return potential
  }

  generateRecommendations(analysis) {
    const recommendations = []

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

  getWebVitalRecommendation(metric, value) {
    const recommendations = {
      lcp: 'Optimize server response times, use CDN, implement resource hints',
      fid: 'Reduce JavaScript execution time, use web workers, optimize event handlers',
      cls: 'Set explicit dimensions for images and ads, avoid dynamic content insertion',
    }

    return recommendations[metric] || 'Follow Core Web Vitals best practices'
  }

  async saveAnalysis(data) {
    const analysisFile = './lighthouse-results/performance-analysis.json'
    fs.writeFileSync(analysisFile, JSON.stringify(data, null, 2))

    // Save summary for GitHub Actions
    const summary = {
      performance: data.results[data.results.length - 1]?.scores.performance || 0,
      accessibility: data.results[data.results.length - 1]?.scores.accessibility || 0,
      bestPractices: data.results[data.results.length - 1]?.scores.bestPractices || 0,
      seo: data.results[data.results.length - 1]?.scores.seo || 0,
      pwa: data.results[data.results.length - 1]?.scores.pwa || 0,
      lcp: data.results[data.results.length - 1]?.coreWebVitals.lcp / 1000 || 0,
      fid: data.results[data.results.length - 1]?.coreWebVitals.fid || 0,
      cls: data.results[data.results.length - 1]?.coreWebVitals.cls || 0,
      bundleSize:
        Math.round(
          ((data.results[data.results.length - 1]?.resourceMetrics.totalByteWeight || 0) /
            1024 /
            1024) *
            100
        ) / 100,
      bundleSizeStatus: this.getBundleSizeStatus(
        data.results[data.results.length - 1]?.resourceMetrics.totalByteWeight || 0
      ),
      loadTime: (data.results[data.results.length - 1]?.performanceMetrics.tti / 1000 || 0).toFixed(
        1
      ),
      loadTimeStatus: this.getLoadTimeStatus(
        data.results[data.results.length - 1]?.performanceMetrics.tti || 0
      ),
      reportUrl: 'https://lighthouse-results.example.com',
    }

    fs.writeFileSync(
      './lighthouse-results/performance-summary.json',
      JSON.stringify(summary, null, 2)
    )
  }

  getBundleSizeStatus(bytes) {
    if (bytes <= 1024000) return '✅' // 1MB
    if (bytes <= 2048000) return '⚠️' // 2MB
    return '❌'
  }

  getLoadTimeStatus(tti) {
    if (tti <= 3000) return '✅' // 3s
    if (tti <= 5000) return '⚠️' // 5s
    return '❌'
  }

  async generateReport(analysis, recommendations) {
    const report = `# PWA Performance Analysis Report

## Current State
${Object.entries(analysis.currentState.status)
  .map(
    ([category, status]) =>
      `- **${category}**: ${status} (${analysis.currentState.scores[category]}/100)`
  )
  .join('\\n')}

## Core Web Vitals
${Object.entries(analysis.coreWebVitalsStatus)
  .map(
    ([metric, data]) =>
      `- **${metric.toUpperCase()}**: ${data.value}${metric === 'cls' ? '' : metric === 'fid' ? 'ms' : 's'} (${data.status})`
  )
  .join('\\n')}

## Performance Issues
${analysis.performanceIssues.map((issue) => `- ${issue.type}: ${issue.recommendation}`).join('\\n')}

## Recommendations
${recommendations
  .map(
    (rec, index) => `${index + 1}. **${rec.title}** (${rec.priority} priority)\\n   ${rec.action}`
  )
  .join('\\n\\n')}

---
Generated at: ${new Date().toISOString()}
`

    fs.writeFileSync('./lighthouse-results/performance-report.md', report)
    console.log('📊 Performance report generated')
  }
}

// Run if called directly
if (require.main === module) {
  const analyzer = new LighthouseTrendAnalyzer()
  analyzer.analyze().catch(console.error)
}

module.exports = LighthouseTrendAnalyzer
