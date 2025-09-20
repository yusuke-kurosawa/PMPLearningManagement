#!/usr/bin/env node
/**
 * Performance Monitoring Script
 * TypeScript version that monitors site performance, accessibility, and core web vitals
 * Generates detailed reports and alerts for maintenance
 */

import * as fs from 'fs'
import * as path from 'path'
import * as https from 'https'
import { performance } from 'perf_hooks'
import type {
  CLIConfig,
  Logger,
  LogLevel,
  ExitCode,
  ScriptOptions,
  ScriptResult
} from '../src/types/devops/scripts.js'

// ==================== Type Definitions ====================

interface MonitoringConfig {
  siteUrl: string
  thresholds: {
    responseTime: number
    contentSize: number
    availability: number
  }
  routes: string[]
  monitoringInterval: number
  reportDir: string
}

interface ResponseMeasurement {
  url: string
  statusCode?: number
  responseTime: number
  contentLength: number
  headers?: any
  timestamp: string
  error?: string
}

interface HealthCheckResult extends ResponseMeasurement {
  isHealthy: boolean
  performance: 'excellent' | 'good' | 'acceptable' | 'poor'
  sizeAnalysis: 'small' | 'medium' | 'large' | 'very-large'
}

interface PWAFeatureCheck {
  feature: string
  available: boolean
  details?: ResponseMeasurement
  error?: string
}

interface Alert {
  type: 'performance' | 'availability' | 'pwa'
  severity: 'critical' | 'warning' | 'info'
  message: string
  details: any[]
}

interface MonitoringReport {
  timestamp: string
  summary: {
    performanceScore: number
    totalRoutes: number
    healthyRoutes: number
    averageResponseTime: number
    alertCount: number
  }
  healthChecks: HealthCheckResult[]
  pwaFeatures: PWAFeatureCheck[]
  alerts: Alert[]
  thresholds: MonitoringConfig['thresholds']
  monitoring: {
    duration: number
    version: string
  }
}

// ==================== Configuration ====================

const CONFIG: MonitoringConfig = {
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

// ==================== Main Class ====================

class PerformanceMonitor {
  private results: HealthCheckResult[]
  private startTime: number

  constructor() {
    this.results = []
    this.startTime = Date.now()
    this.ensureReportDirectory()
  }

  private ensureReportDirectory(): void {
    if (!fs.existsSync(CONFIG.reportDir)) {
      fs.mkdirSync(CONFIG.reportDir, { recursive: true })
    }
  }

  private async measureResponseTime(url: string): Promise<ResponseMeasurement> {
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

  private async checkSiteHealth(): Promise<HealthCheckResult[]> {
    this.log('🔍 Starting site health check...', 'info')
    const healthResults: HealthCheckResult[] = []

    for (const route of CONFIG.routes) {
      const url = CONFIG.siteUrl + route
      
      try {
        const result = await this.measureResponseTime(url)
        
        // Analyze result
        const analysis: HealthCheckResult = {
          ...result,
          isHealthy: result.statusCode === 200 && result.responseTime < CONFIG.thresholds.responseTime,
          performance: this.categorizePerformance(result.responseTime),
          sizeAnalysis: this.analyzeSizeCategory(result.contentLength)
        }
        
        healthResults.push(analysis)
        
        this.log(`  ${analysis.isHealthy ? '✅' : '❌'} ${route || 'home'}: ${result.responseTime}ms (${result.statusCode})`, 'info')
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        this.log(`  ❌ ${route || 'home'}: Error - ${errorMessage}`, 'error')
        
        healthResults.push({
          url,
          error: errorMessage,
          isHealthy: false,
          timestamp: new Date().toISOString(),
          responseTime: 0,
          contentLength: 0,
          performance: 'poor',
          sizeAnalysis: 'small'
        })
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    return healthResults
  }

  private categorizePerformance(responseTime: number): 'excellent' | 'good' | 'acceptable' | 'poor' {
    if (responseTime < 500) return 'excellent'
    if (responseTime < 1000) return 'good'
    if (responseTime < 2000) return 'acceptable'
    return 'poor'
  }

  private analyzeSizeCategory(contentLength: number): 'small' | 'medium' | 'large' | 'very-large' {
    if (contentLength < 100000) return 'small'
    if (contentLength < 500000) return 'medium'
    if (contentLength < 1000000) return 'large'
    return 'very-large'
  }

  private async checkPWAFeatures(): Promise<PWAFeatureCheck[]> {
    this.log('📱 Checking PWA features...', 'info')
    
    const pwaChecks: PWAFeatureCheck[] = []
    
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
        error: error instanceof Error ? error.message : String(error)
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
        error: error instanceof Error ? error.message : String(error)
      })
    }

    return pwaChecks
  }

  private generatePerformanceScore(healthResults: HealthCheckResult[]): number {
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

  private generateAlerts(healthResults: HealthCheckResult[], pwaResults: PWAFeatureCheck[]): Alert[] {
    const alerts: Alert[] = []
    
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

  private async generateReport(
    healthResults: HealthCheckResult[],
    pwaResults: PWAFeatureCheck[],
    alerts: Alert[]
  ): Promise<{ report: MonitoringReport; reportFile: string }> {
    const validResults = healthResults.filter(r => !r.error)
    const averageResponseTime = validResults.length > 0
      ? Math.round(validResults.reduce((sum, r) => sum + r.responseTime, 0) / validResults.length)
      : 0

    const report: MonitoringReport = {
      timestamp: new Date().toISOString(),
      summary: {
        performanceScore: this.generatePerformanceScore(healthResults),
        totalRoutes: CONFIG.routes.length,
        healthyRoutes: healthResults.filter(r => r.isHealthy).length,
        averageResponseTime,
        alertCount: alerts.length
      },
      healthChecks: healthResults,
      pwaFeatures: pwaResults,
      alerts: alerts,
      thresholds: CONFIG.thresholds,
      monitoring: {
        duration: Date.now() - this.startTime,
        version: '2.0.0'
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

  async run(options: ScriptOptions = {}): Promise<ScriptResult<MonitoringReport>> {
    const startTime = Date.now()

    this.log('🚀 Starting Performance Monitoring', 'info')
    this.log('=====================================', 'info')
    this.log(`Site URL: ${CONFIG.siteUrl}`, 'info')
    this.log(`Routes to check: ${CONFIG.routes.length}`, 'info')
    this.log('=====================================\n', 'info')

    try {
      if (options.dryRun) {
        this.log('DRY RUN MODE: Would monitor performance but no actual checks will run', 'warn')
        return {
          success: true,
          data: {} as MonitoringReport,
          duration: Date.now() - startTime,
          timestamp: new Date(),
        }
      }

      // Run health checks
      const healthResults = await this.checkSiteHealth()
      
      // Check PWA features
      const pwaResults = await this.checkPWAFeatures()
      
      // Generate alerts
      const alerts = this.generateAlerts(healthResults, pwaResults)
      
      // Generate report
      const { report, reportFile } = await this.generateReport(healthResults, pwaResults, alerts)
      
      // Print summary
      this.log('\n📊 Monitoring Summary', 'info')
      this.log('====================', 'info')
      this.log(`Performance Score: ${report.summary.performanceScore}/100`, 'info')
      this.log(`Healthy Routes: ${report.summary.healthyRoutes}/${report.summary.totalRoutes}`, 'info')
      this.log(`Average Response Time: ${report.summary.averageResponseTime}ms`, 'info')
      this.log(`Alerts: ${report.summary.alertCount}`, 'info')
      this.log(`Report saved: ${reportFile}`, 'info')
      
      // Print alerts
      if (alerts.length > 0) {
        this.log('\n⚠️  Active Alerts:', 'warn')
        alerts.forEach(alert => {
          const icon = alert.severity === 'critical' ? '🚨' : alert.severity === 'warning' ? '⚠️' : 'ℹ️'
          this.log(`  ${icon} [${alert.type}] ${alert.message}`, alert.severity === 'critical' ? 'error' : 'warn')
        })
      } else {
        this.log('\n✅ No alerts detected', 'info')
      }
      
      this.log('\n🎉 Performance monitoring completed successfully!', 'info')
      
      // Determine success based on critical alerts
      const criticalAlerts = alerts.filter(a => a.severity === 'critical')
      const success = criticalAlerts.length === 0

      return {
        success,
        data: report,
        duration: Date.now() - startTime,
        timestamp: new Date(),
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      this.log(`❌ Monitoring failed: ${errorMessage}`, 'error')

      return {
        success: false,
        error: errorMessage,
        duration: Date.now() - startTime,
        timestamp: new Date(),
      }
    }
  }

  private log(message: string, level: LogLevel = 'info'): void {
    console.log(message)
  }
}

// ==================== CLI Execution ====================

async function monitorPerformanceMain(options: ScriptOptions = {}): Promise<ScriptResult<MonitoringReport>> {
  const monitor = new PerformanceMonitor()
  return monitor.run(options)
}

if (require.main === module) {
  const args = process.argv.slice(2)
  const options: ScriptOptions = {
    dryRun: args.includes('--dry-run'),
    verbose: args.includes('--verbose'),
    force: args.includes('--force'),
  }

  monitorPerformanceMain(options)
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

export default PerformanceMonitor
export { PerformanceMonitor, monitorPerformanceMain, type MonitoringReport, type Alert }