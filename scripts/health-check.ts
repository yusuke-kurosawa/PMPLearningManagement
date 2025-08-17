#!/usr/bin/env node

/**
 * Application Health Check Script
 * Monitors application health, performance metrics, and system status
 * Note: Database checks are disabled for static deployment
 */

import { promises as fs } from 'node:fs'
import * as fsSync from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import { performance } from 'node:perf_hooks'
import type { 
  CLIArguments, 
  Logger, 
  ExitCode, 
  CLIException,
  HealthChecker,
  HealthReport,
  SystemHealth
} from '../src/types/scripts/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

interface ComponentHealth {
  readonly status: 'healthy' | 'unhealthy' | 'unknown'
  readonly responseTime: number
  readonly version?: string
  readonly details: Record<string, any>
  readonly error?: string
}

interface PerformanceTest {
  readonly name: string
  readonly duration: number
  readonly status: 'good' | 'slow'
}

interface HealthIssue {
  readonly type: 'error' | 'warning' | 'info' | 'critical'
  readonly category: string
  readonly message: string
  readonly action?: string
  readonly details?: any
  readonly error?: string
}

class ApplicationHealthChecker implements HealthChecker {
  private readonly logger: Logger

  constructor() {
    this.logger = {
      info: (message: string) => console.log(`ℹ️ ${message}`),
      warn: (message: string) => console.warn(`⚠️ ${message}`),
      error: (message: string) => console.error(`❌ ${message}`),
      debug: (message: string) => console.log(`🐛 ${message}`),
      success: (message: string) => console.log(`✅ ${message}`)
    }
  }

  async checkHealth(): Promise<HealthReport> {
    console.log('\n' + '='.repeat(60))
    console.log('APPLICATION HEALTH CHECK REPORT')
    console.log('='.repeat(60))
    console.log(`Timestamp: ${new Date().toISOString()}`)
    console.log('='.repeat(60))

    try {
      // Application Health
      console.log('\n📊 Application Status:')
      const appHealth = await this.checkApplicationHealth()
      this.displayComponentHealth('Application', appHealth)

      // Frontend Assets Health
      console.log('\n📊 Frontend Assets:')
      const assetsHealth = await this.checkAssetsHealth()
      this.displayComponentHealth('Assets', assetsHealth)

      // Performance Tests
      console.log('\n📊 Performance Tests:')
      const performanceTests = await this.checkPerformance()
      this.displayPerformanceTests(performanceTests)

      // System Issues
      console.log('\n📊 System Issues:')
      const issues = await this.checkForIssues()
      this.displayIssues(issues)

      // Generate Summary
      const overallHealth = this.calculateOverallHealth(appHealth, assetsHealth, issues)
      console.log('\n' + '='.repeat(60))
      const healthIcon = overallHealth ? '✅' : '❌'
      console.log(`Overall Status: ${healthIcon} ${overallHealth ? 'HEALTHY' : 'ISSUES DETECTED'}`)
      console.log('='.repeat(60))

      // Save report
      const report = await this.generateHealthReport({
        application: appHealth,
        assets: assetsHealth,
        performanceTests,
        issues,
        overallStatus: overallHealth ? 'healthy' : 'unhealthy'
      })

      return report
    } catch (error) {
      if (error instanceof CLIException) {
        this.logger.error(`Health check failed: ${error.message}`)
        throw error
      } else {
        throw new CLIException(
          `Health check failed: ${error instanceof Error ? error.message : String(error)}`,
          ExitCode.GENERAL_ERROR
        )
      }
    }
  }

  private async checkApplicationHealth(): Promise<ComponentHealth> {
    const results: ComponentHealth = {
      status: 'unknown',
      responseTime: 0,
      details: {},
    }

    try {
      const startTime = performance.now()

      // Check if main application files exist
      const projectRoot = path.join(__dirname, '..')
      const criticalFiles = [
        'package.json',
        'vite.config.js',
        'index.html',
        'src/main.jsx',
        'src/App.jsx'
      ]

      let missingFiles = 0
      for (const file of criticalFiles) {
        const filePath = path.join(projectRoot, file)
        if (!fsSync.existsSync(filePath)) {
          missingFiles++
        }
      }

      results.responseTime = Math.round(performance.now() - startTime)

      if (missingFiles === 0) {
        results.status = 'healthy'
        results.details.criticalFiles = 'All present'
      } else {
        results.status = 'unhealthy'
        results.details.missingFiles = missingFiles
      }

      // Check package.json for version and dependencies
      const packageJsonPath = path.join(projectRoot, 'package.json')
      if (fsSync.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fsSync.readFileSync(packageJsonPath, 'utf8'))
        results.version = packageJson.version || 'unknown'
        results.details.dependencies = Object.keys(packageJson.dependencies || {}).length
        results.details.devDependencies = Object.keys(packageJson.devDependencies || {}).length
      }

      // Check build directory
      const distPath = path.join(projectRoot, 'dist')
      if (fsSync.existsSync(distPath)) {
        const distStats = fsSync.statSync(distPath)
        results.details.lastBuild = distStats.mtime.toISOString()
        
        // Check if dist contains required files
        const requiredDistFiles = ['index.html', 'assets']
        const distFiles = fsSync.readdirSync(distPath)
        const hasRequiredFiles = requiredDistFiles.every(file => distFiles.includes(file))
        results.details.buildComplete = hasRequiredFiles
      } else {
        results.details.buildComplete = false
      }

    } catch (error) {
      results.status = 'unhealthy'
      results.error = error instanceof Error ? error.message : String(error)
    }

    return results
  }

  private async checkAssetsHealth(): Promise<ComponentHealth> {
    const results: ComponentHealth = {
      status: 'unknown',
      responseTime: 0,
      details: {},
    }

    try {
      const startTime = performance.now()
      const projectRoot = path.join(__dirname, '..')

      // Check public assets
      const publicPath = path.join(projectRoot, 'public')
      if (fsSync.existsSync(publicPath)) {
        const publicFiles = this.getDirectorySize(publicPath)
        results.details.publicAssets = {
          count: publicFiles.count,
          size: this.formatBytes(publicFiles.size)
        }
      }

      // Check src assets
      const srcPath = path.join(projectRoot, 'src')
      if (fsSync.existsSync(srcPath)) {
        const srcFiles = this.getDirectorySize(srcPath)
        results.details.sourceFiles = {
          count: srcFiles.count,
          size: this.formatBytes(srcFiles.size)
        }
      }

      // Check dist assets (if build exists)
      const distPath = path.join(projectRoot, 'dist')
      if (fsSync.existsSync(distPath)) {
        const distFiles = this.getDirectorySize(distPath)
        results.details.builtAssets = {
          count: distFiles.count,
          size: this.formatBytes(distFiles.size)
        }

        // Check for large bundles
        const assetsPath = path.join(distPath, 'assets')
        if (fsSync.existsSync(assetsPath)) {
          const assets = fsSync.readdirSync(assetsPath)
          const jsFiles = assets.filter(f => f.endsWith('.js'))
          const cssFiles = assets.filter(f => f.endsWith('.css'))
          
          results.details.bundleInfo = {
            jsFiles: jsFiles.length,
            cssFiles: cssFiles.length
          }

          // Check for oversized bundles
          const oversizedFiles = []
          for (const file of assets) {
            const filePath = path.join(assetsPath, file)
            const stats = fsSync.statSync(filePath)
            if (stats.size > 1024 * 1024) { // > 1MB
              oversizedFiles.push({
                name: file,
                size: this.formatBytes(stats.size)
              })
            }
          }
          
          if (oversizedFiles.length > 0) {
            results.details.oversizedFiles = oversizedFiles
          }
        }
      }

      results.responseTime = Math.round(performance.now() - startTime)
      results.status = 'healthy'

    } catch (error) {
      results.status = 'unhealthy'
      results.error = error instanceof Error ? error.message : String(error)
    }

    return results
  }

  private async checkPerformance(): Promise<readonly PerformanceTest[]> {
    const tests: PerformanceTest[] = []

    // Test 1: File system access speed
    const fsTestStart = performance.now()
    const tempFile = path.join(__dirname, 'temp-perf-test.txt')
    fsSync.writeFileSync(tempFile, 'performance test')
    fsSync.readFileSync(tempFile, 'utf8')
    fsSync.unlinkSync(tempFile)
    
    tests.push({
      name: 'File System Access',
      duration: Math.round(performance.now() - fsTestStart),
      status: performance.now() - fsTestStart < 50 ? 'good' : 'slow',
    })

    // Test 2: JSON parsing performance
    const jsonTestStart = performance.now()
    const largeObject = Array.from({ length: 1000 }, (_, i) => ({ id: i, data: `item-${i}` }))
    const jsonString = JSON.stringify(largeObject)
    JSON.parse(jsonString)
    
    tests.push({
      name: 'JSON Processing',
      duration: Math.round(performance.now() - jsonTestStart),
      status: performance.now() - jsonTestStart < 100 ? 'good' : 'slow',
    })

    // Test 3: Directory traversal
    const dirTestStart = performance.now()
    this.getDirectorySize(path.join(__dirname, '..', 'src'))
    
    tests.push({
      name: 'Directory Traversal',
      duration: Math.round(performance.now() - dirTestStart),
      status: performance.now() - dirTestStart < 200 ? 'good' : 'slow',
    })

    return tests
  }

  private async checkForIssues(): Promise<readonly HealthIssue[]> {
    const issues: HealthIssue[] = []
    const projectRoot = path.join(__dirname, '..')

    try {
      // Check for missing package-lock.json
      if (!fsSync.existsSync(path.join(projectRoot, 'package-lock.json'))) {
        issues.push({
          type: 'warning',
          category: 'dependencies',
          message: 'package-lock.json is missing',
          action: 'Run npm install to generate lock file'
        })
      }

      // Check for node_modules size
      const nodeModulesPath = path.join(projectRoot, 'node_modules')
      if (fsSync.existsSync(nodeModulesPath)) {
        const nodeModulesSize = this.getDirectorySize(nodeModulesPath)
        if (nodeModulesSize.size > 500 * 1024 * 1024) { // > 500MB
          issues.push({
            type: 'warning',
            category: 'dependencies',
            message: `node_modules is large (${this.formatBytes(nodeModulesSize.size)})`,
            action: 'Consider removing unused dependencies'
          })
        }
      }

      // Check for old build files
      const distPath = path.join(projectRoot, 'dist')
      if (fsSync.existsSync(distPath)) {
        const distStats = fsSync.statSync(distPath)
        const buildAge = Date.now() - distStats.mtime.getTime()
        const oneDayInMs = 24 * 60 * 60 * 1000
        
        if (buildAge > oneDayInMs) {
          issues.push({
            type: 'info',
            category: 'build',
            message: 'Build is more than 1 day old',
            action: 'Consider rebuilding for latest changes'
          })
        }
      } else {
        issues.push({
          type: 'warning',
          category: 'build',
          message: 'No build directory found',
          action: 'Run npm run build to create production build'
        })
      }

      // Check for potential security issues
      const packageJsonPath = path.join(projectRoot, 'package.json')
      if (fsSync.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fsSync.readFileSync(packageJsonPath, 'utf8'))
        
        // Check for scripts that might be risky
        const scripts = packageJson.scripts || {}
        const riskyPatterns = ['rm -rf', 'sudo', 'chmod 777']
        
        for (const [scriptName, scriptContent] of Object.entries(scripts)) {
          for (const pattern of riskyPatterns) {
            if (typeof scriptContent === 'string' && scriptContent.includes(pattern)) {
              issues.push({
                type: 'warning',
                category: 'security',
                message: `Script '${scriptName}' contains potentially risky command: ${pattern}`,
                action: 'Review script for security implications'
              })
            }
          }
        }
      }

    } catch (error) {
      issues.push({
        type: 'error',
        category: 'check',
        message: 'Failed to complete issue checks',
        error: error instanceof Error ? error.message : String(error),
      })
    }

    return issues
  }

  private getDirectorySize(dirPath: string): { count: number; size: number } {
    let totalSize = 0
    let fileCount = 0

    try {
      const items = fsSync.readdirSync(dirPath)
      
      for (const item of items) {
        const itemPath = path.join(dirPath, item)
        const stats = fsSync.statSync(itemPath)
        
        if (stats.isDirectory()) {
          const subDir = this.getDirectorySize(itemPath)
          totalSize += subDir.size
          fileCount += subDir.count
        } else {
          totalSize += stats.size
          fileCount++
        }
      }
    } catch (error) {
      // Ignore permission errors or other issues
    }

    return { count: fileCount, size: totalSize }
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  private displayComponentHealth(name: string, health: ComponentHealth): void {
    const statusIcon = health.status === 'healthy' ? '✅' : '❌'
    console.log(`  Status: ${statusIcon} ${health.status}`)
    console.log(`  Response Time: ${health.responseTime}ms`)
    
    if (health.version) {
      console.log(`  Version: ${health.version}`)
    }
    
    if (Object.keys(health.details).length > 0) {
      for (const [key, value] of Object.entries(health.details)) {
        if (typeof value === 'object') {
          console.log(`  ${key}:`)
          for (const [subKey, subValue] of Object.entries(value)) {
            console.log(`    ${subKey}: ${subValue}`)
          }
        } else {
          console.log(`  ${key}: ${value}`)
        }
      }
    }

    if (health.error) {
      console.log(`  Error: ${health.error}`)
    }
  }

  private displayPerformanceTests(tests: readonly PerformanceTest[]): void {
    for (const test of tests) {
      const icon = test.status === 'good' ? '✅' : '⚠️'
      console.log(`  ${icon} ${test.name}: ${test.duration}ms`)
    }
  }

  private displayIssues(issues: readonly HealthIssue[]): void {
    if (issues.length === 0) {
      console.log('  ✅ No issues detected')
      return
    }

    for (const issue of issues) {
      const icon = issue.type === 'critical' ? '❌' : 
                   issue.type === 'warning' ? '⚠️' : 
                   issue.type === 'error' ? '🔥' : 'ℹ️'
      console.log(`  ${icon} [${issue.category}] ${issue.message}`)
      if (issue.action) {
        console.log(`     Action: ${issue.action}`)
      }
    }
  }

  private calculateOverallHealth(
    appHealth: ComponentHealth,
    assetsHealth: ComponentHealth,
    issues: readonly HealthIssue[]
  ): boolean {
    const hasHealthyComponents = appHealth.status === 'healthy' && assetsHealth.status === 'healthy'
    const hasCriticalIssues = issues.some(issue => issue.type === 'critical' || issue.type === 'error')
    
    return hasHealthyComponents && !hasCriticalIssues
  }

  private async generateHealthReport(data: {
    application: ComponentHealth
    assets: ComponentHealth
    performanceTests: readonly PerformanceTest[]
    issues: readonly HealthIssue[]
    overallStatus: string
  }): Promise<HealthReport> {
    const report: HealthReport = {
      timestamp: new Date().toISOString(),
      application: data.application,
      assets: data.assets,
      performanceTests: data.performanceTests,
      issues: data.issues,
      overallStatus: data.overallStatus,
    }

    // Save report to file
    const reportsDir = path.join(__dirname, '..', 'reports', 'health')
    if (!fsSync.existsSync(reportsDir)) {
      fsSync.mkdirSync(reportsDir, { recursive: true })
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const reportFile = path.join(reportsDir, `health-check-${timestamp}.json`)
    fsSync.writeFileSync(reportFile, JSON.stringify(report, null, 2))
    console.log(`\nReport saved to: ${reportFile}`)

    return report
  }
}

// Main execution function
async function main(): Promise<void> {
  const checker = new ApplicationHealthChecker()
  
  try {
    const report = await checker.checkHealth()
    const isHealthy = report.overallStatus === 'healthy'
    process.exit(isHealthy ? ExitCode.SUCCESS : ExitCode.GENERAL_ERROR)
  } catch (error) {
    if (error instanceof CLIException) {
      console.error(`\n❌ Health check failed: ${error.message}`)
      process.exit(error.exitCode)
    } else {
      console.error(`\n❌ Health check failed: ${error instanceof Error ? error.message : String(error)}`)
      process.exit(ExitCode.GENERAL_ERROR)
    }
  }
}

// Export for testing
export { ApplicationHealthChecker }

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}