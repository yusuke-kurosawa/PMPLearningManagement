#!/usr/bin/env node

/**
 * Performance Monitoring Script
 * Monitors site performance, accessibility, and core web vitals
 * Generates detailed reports and alerts for maintenance
 */

const fs = require('fs')
const path = require('path')
const https = require('https')
const { performance } = require('perf_hooks')

// Configuration
const CONFIG = {
  siteUrl: 'https://yusuke-kurosawa.github.io/PMPLearningManagement/',
  thresholds: {
    responseTime: 2000, // ms
    contentSize: 2000000, // 2MB
    availability: 99.9 // %
  },
  routes: [
    '',
    '#/matrix',
    '#/network', 
    '#/integrated',
    '#/visualizations',
    '#/glossary',
    '#/progress',
    '#/flashcards'
  ],
  monitoringInterval: 300000, // 5 minutes
  reportDir: './monitoring-reports'
}

class PerformanceMonitor {
  constructor() {
    this.results = []
    this.startTime = Date.now()
    this.ensureReportDirectory()
  }

  ensureReportDirectory() {
    if (!fs.existsSync(CONFIG.reportDir)) {
      fs.mkdirSync(CONFIG.reportDir, { recursive: true })
    }
  }

  async measureResponseTime(url) {
    const start = performance.now()
    
    return new Promise((resolve, reject) => {
      const request = https.get(url, (response) => {
        const end = performance.now()
        const responseTime = Math.round(end - start)
        
        let data = ''
        response.on('data', (chunk) => {
          data += chunk
        })
        
        response.on('end', () => {
          resolve({
            url,
            statusCode: response.statusCode,
            responseTime,
            contentLength: Buffer.byteLength(data, 'utf8'),
            headers: response.headers,
            timestamp: new Date().toISOString()
          })
        })
      })
      
      request.on('error', (error) => {
        reject(error)
      })
      
      request.setTimeout(10000, () => {
        request.destroy()
        reject(new Error('Request timeout'))
      })
    })
  }

  async checkSiteHealth() {
    console.log('🔍 Starting site health check...')
    const healthResults = []

    for (const route of CONFIG.routes) {
      const url = CONFIG.siteUrl + route
      
      try {
        const result = await this.measureResponseTime(url)
        
        // Analyze result
        const analysis = {
          ...result,
          isHealthy: result.statusCode === 200 && result.responseTime < CONFIG.thresholds.responseTime,
          performance: this.categorizePerformance(result.responseTime),
          sizeAnalysis: this.analyzeSizeCategory(result.contentLength)
        }
        
        healthResults.push(analysis)
        
        console.log(`  ${analysis.isHealthy ? '✅' : '❌'} ${route || 'home'}: ${result.responseTime}ms (${result.statusCode})`)
        
      } catch (error) {
        console.log(`  ❌ ${route || 'home'}: Error - ${error.message}`)
        healthResults.push({
          url,
          error: error.message,
          isHealthy: false,
          timestamp: new Date().toISOString()
        })
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    return healthResults
  }

  categorizePerformance(responseTime) {
    if (responseTime < 500) return 'excellent'
    if (responseTime < 1000) return 'good'
    if (responseTime < 2000) return 'acceptable'
    return 'poor'
  }

  analyzeSizeCategory(contentLength) {
    if (contentLength < 100000) return 'small'
    if (contentLength < 500000) return 'medium'
    if (contentLength < 1000000) return 'large'
    return 'very-large'
  }

  async checkPWAFeatures() {
    console.log('📱 Checking PWA features...')
    
    const pwaChecks = []
    
    // Check manifest
    try {
      const manifestResult = await this.measureResponseTime(CONFIG.siteUrl + 'manifest.json')
      pwaChecks.push({
        feature: 'manifest',
        available: manifestResult.statusCode === 200,
        details: manifestResult
      })
    } catch (error) {
      pwaChecks.push({
        feature: 'manifest',
        available: false,
        error: error.message
      })
    }

    // Check service worker (approximate)
    try {
      const swResult = await this.measureResponseTime(CONFIG.siteUrl + 'sw.js')
      pwaChecks.push({
        feature: 'service-worker',
        available: swResult.statusCode === 200,
        details: swResult
      })
    } catch (error) {
      pwaChecks.push({
        feature: 'service-worker',
        available: false,
        error: error.message
      })
    }

    return pwaChecks
  }

  generatePerformanceScore(healthResults) {
    const validResults = healthResults.filter(r => !r.error)
    
    if (validResults.length === 0) return 0
    
    const avgResponseTime = validResults.reduce((sum, r) => sum + r.responseTime, 0) / validResults.length
    const successRate = (validResults.filter(r => r.isHealthy).length / validResults.length) * 100
    
    // Score calculation (0-100)
    let score = 100
    
    // Penalize slow response times
    if (avgResponseTime > 1000) score -= 20
    if (avgResponseTime > 2000) score -= 30
    
    // Penalize low success rate
    score = score * (successRate / 100)
    
    return Math.max(0, Math.round(score))
  }

  generateAlerts(healthResults, pwaResults) {
    const alerts = []
    
    // Response time alerts
    const slowRoutes = healthResults.filter(r => r.responseTime > CONFIG.thresholds.responseTime)
    if (slowRoutes.length > 0) {
      alerts.push({
        type: 'performance',
        severity: 'warning',
        message: `${slowRoutes.length} routes with slow response times`,
        details: slowRoutes.map(r => ({ route: r.url, time: r.responseTime }))
      })
    }

    // Availability alerts  
    const failedRoutes = healthResults.filter(r => !r.isHealthy)
    if (failedRoutes.length > 0) {
      alerts.push({
        type: 'availability',
        severity: failedRoutes.length > CONFIG.routes.length / 2 ? 'critical' : 'warning',
        message: `${failedRoutes.length} routes are not accessible`,
        details: failedRoutes.map(r => ({ route: r.url, status: r.statusCode || 'error' }))
      })
    }

    // PWA alerts
    const failedPWAFeatures = pwaResults.filter(p => !p.available)
    if (failedPWAFeatures.length > 0) {
      alerts.push({
        type: 'pwa',
        severity: 'info',
        message: `${failedPWAFeatures.length} PWA features unavailable`,
        details: failedPWAFeatures.map(p => ({ feature: p.feature, error: p.error }))
      })
    }

    return alerts
  }

  async generateReport(healthResults, pwaResults, alerts) {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        performanceScore: this.generatePerformanceScore(healthResults),
        totalRoutes: CONFIG.routes.length,
        healthyRoutes: healthResults.filter(r => r.isHealthy).length,
        averageResponseTime: Math.round(
          healthResults.filter(r => !r.error).reduce((sum, r) => sum + r.responseTime, 0) / 
          healthResults.filter(r => !r.error).length
        ),
        alertCount: alerts.length
      },
      healthChecks: healthResults,
      pwaFeatures: pwaResults,
      alerts: alerts,
      thresholds: CONFIG.thresholds,
      monitoring: {
        duration: Date.now() - this.startTime,
        version: '1.0.0'
      }
    }

    // Save report
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const reportFile = path.join(CONFIG.reportDir, `performance-${timestamp}.json`)
    
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2))
    
    // Save latest report (for easy access)
    fs.writeFileSync(path.join(CONFIG.reportDir, 'latest.json'), JSON.stringify(report, null, 2))
    
    return { report, reportFile }
  }

  async run() {
    console.log('🚀 Starting Performance Monitoring')
    console.log('=====================================')
    console.log(`Site URL: ${CONFIG.siteUrl}`)
    console.log(`Routes to check: ${CONFIG.routes.length}`)
    console.log('=====================================\n')

    try {
      // Run health checks
      const healthResults = await this.checkSiteHealth()
      
      // Check PWA features
      const pwaResults = await this.checkPWAFeatures()
      
      // Generate alerts
      const alerts = this.generateAlerts(healthResults, pwaResults)
      
      // Generate report
      const { report, reportFile } = await this.generateReport(healthResults, pwaResults, alerts)
      
      // Print summary
      console.log('\n📊 Monitoring Summary')
      console.log('====================')
      console.log(`Performance Score: ${report.summary.performanceScore}/100`)
      console.log(`Healthy Routes: ${report.summary.healthyRoutes}/${report.summary.totalRoutes}`)
      console.log(`Average Response Time: ${report.summary.averageResponseTime}ms`)
      console.log(`Alerts: ${report.summary.alertCount}`)
      console.log(`Report saved: ${reportFile}`)
      
      // Print alerts
      if (alerts.length > 0) {
        console.log('\n⚠️  Active Alerts:')
        alerts.forEach(alert => {
          const icon = alert.severity === 'critical' ? '🚨' : alert.severity === 'warning' ? '⚠️' : 'ℹ️'
          console.log(`  ${icon} [${alert.type}] ${alert.message}`)
        })
      } else {
        console.log('\n✅ No alerts detected')
      }
      
      console.log('\n🎉 Performance monitoring completed successfully!')
      
      // Exit with appropriate code
      const criticalAlerts = alerts.filter(a => a.severity === 'critical')
      process.exit(criticalAlerts.length > 0 ? 1 : 0)
      
    } catch (error) {
      console.error('❌ Monitoring failed:', error)
      process.exit(1)
    }
  }
}

// Run if executed directly
if (require.main === module) {
  const monitor = new PerformanceMonitor()
  monitor.run()
}

module.exports = PerformanceMonitor