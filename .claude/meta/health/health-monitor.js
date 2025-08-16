/**
 * Health Monitoring System for Claude Directory
 *
 * Provides comprehensive health checking, monitoring, and alerting capabilities
 * for the entire .claude ecosystem.
 */

const fs = require('fs').promises
const path = require('path')
const { exec } = require('child_process')
const { promisify } = require('util')
const execAsync = promisify(exec)

class HealthMonitor {
  constructor(claudeDir) {
    this.claudeDir = claudeDir
    this.checks = new Map()
    this.alerts = []
    this.metrics = {}
    this.initializeChecks()
  }

  /**
   * Initialize health check definitions
   */
  initializeChecks() {
    // Core checks
    this.registerCheck('directory-structure', {
      name: 'Directory Structure Integrity',
      severity: 'critical',
      check: this.checkDirectoryStructure.bind(this),
      interval: 3600000, // 1 hour
    })

    this.registerCheck('configuration', {
      name: 'Configuration Validity',
      severity: 'critical',
      check: this.checkConfiguration.bind(this),
      interval: 1800000, // 30 minutes
    })

    this.registerCheck('agent-health', {
      name: 'Agent Health',
      severity: 'high',
      check: this.checkAgentHealth.bind(this),
      interval: 900000, // 15 minutes
    })

    this.registerCheck('automation-status', {
      name: 'Automation Status',
      severity: 'medium',
      check: this.checkAutomationStatus.bind(this),
      interval: 1800000, // 30 minutes
    })

    this.registerCheck('disk-usage', {
      name: 'Disk Usage',
      severity: 'high',
      check: this.checkDiskUsage.bind(this),
      interval: 3600000, // 1 hour
    })

    this.registerCheck('memory-usage', {
      name: 'Memory Usage',
      severity: 'high',
      check: this.checkMemoryUsage.bind(this),
      interval: 900000, // 15 minutes
    })

    this.registerCheck('file-permissions', {
      name: 'File Permissions',
      severity: 'medium',
      check: this.checkFilePermissions.bind(this),
      interval: 7200000, // 2 hours
    })

    this.registerCheck('dependencies', {
      name: 'Dependencies',
      severity: 'high',
      check: this.checkDependencies.bind(this),
      interval: 86400000, // 24 hours
    })

    this.registerCheck('security', {
      name: 'Security Status',
      severity: 'critical',
      check: this.checkSecurity.bind(this),
      interval: 3600000, // 1 hour
    })

    this.registerCheck('backup-status', {
      name: 'Backup Status',
      severity: 'medium',
      check: this.checkBackupStatus.bind(this),
      interval: 86400000, // 24 hours
    })

    this.registerCheck('performance', {
      name: 'Performance Metrics',
      severity: 'low',
      check: this.checkPerformance.bind(this),
      interval: 1800000, // 30 minutes
    })

    this.registerCheck('connectivity', {
      name: 'External Connectivity',
      severity: 'medium',
      check: this.checkConnectivity.bind(this),
      interval: 3600000, // 1 hour
    })
  }

  /**
   * Register a health check
   */
  registerCheck(id, config) {
    this.checks.set(id, {
      ...config,
      lastRun: null,
      lastResult: null,
      consecutiveFailures: 0,
    })
  }

  /**
   * Run all health checks
   */
  async runAllChecks() {
    const results = new Map()
    const startTime = Date.now()

    console.log('Running comprehensive health checks...\n')

    for (const [id, check] of this.checks) {
      try {
        console.log(`Checking ${check.name}...`)
        const result = await check.check()

        check.lastRun = new Date()
        check.lastResult = result

        if (!result.healthy) {
          check.consecutiveFailures++
          await this.handleFailure(id, check, result)
        } else {
          check.consecutiveFailures = 0
        }

        results.set(id, result)

        // Display result
        const status = result.healthy ? '✓' : '✗'
        const color = result.healthy ? '\x1b[32m' : '\x1b[31m'
        console.log(`${color}${status}\x1b[0m ${check.name}: ${result.message || 'OK'}`)

        if (result.details) {
          console.log(`  Details: ${JSON.stringify(result.details)}`)
        }
      } catch (error) {
        console.error(`Error in check ${id}: ${error.message}`)
        results.set(id, {
          healthy: false,
          message: `Check failed: ${error.message}`,
          error: true,
        })
      }
    }

    const duration = Date.now() - startTime
    const summary = this.generateSummary(results, duration)

    await this.saveResults(results, summary)
    await this.checkAlertConditions(results)

    return { results, summary }
  }

  /**
   * Run a specific health check
   */
  async runCheck(checkId) {
    const check = this.checks.get(checkId)

    if (!check) {
      throw new Error(`Unknown check: ${checkId}`)
    }

    const result = await check.check()
    check.lastRun = new Date()
    check.lastResult = result

    return result
  }

  /**
   * Health check implementations
   */
  async checkDirectoryStructure() {
    const requiredDirs = [
      'core',
      'core/agents',
      'core/context',
      'core/policies',
      'core/config',
      'development',
      'development/templates',
      'development/generators',
      'operations',
      'operations/automation',
      'operations/monitoring',
      'knowledge',
      'knowledge/quick-ref',
      'knowledge/documentation',
      'tools',
      'tools/cli',
      'tools/scripts',
      'meta',
      'meta/health',
      'meta/metrics',
      'meta/backup',
    ]

    const missing = []

    for (const dir of requiredDirs) {
      const dirPath = path.join(this.claudeDir, dir)
      try {
        await fs.access(dirPath)
      } catch {
        missing.push(dir)
      }
    }

    if (missing.length > 0) {
      return {
        healthy: false,
        message: `Missing directories: ${missing.join(', ')}`,
        details: { missing },
      }
    }

    return {
      healthy: true,
      message: 'All required directories present',
      details: { checked: requiredDirs.length },
    }
  }

  async checkConfiguration() {
    try {
      const configPath = path.join(this.claudeDir, 'core/config/default.config.json')
      const schemaPath = path.join(this.claudeDir, 'core/config/config.schema.json')

      const config = JSON.parse(await fs.readFile(configPath, 'utf8'))
      const schema = JSON.parse(await fs.readFile(schemaPath, 'utf8'))

      // Basic validation
      const requiredFields = schema.required || []
      const missingFields = requiredFields.filter((field) => !config[field])

      if (missingFields.length > 0) {
        return {
          healthy: false,
          message: `Missing required configuration fields: ${missingFields.join(', ')}`,
          details: { missingFields },
        }
      }

      return {
        healthy: true,
        message: 'Configuration is valid',
        details: { version: config.version },
      }
    } catch (error) {
      return {
        healthy: false,
        message: `Configuration error: ${error.message}`,
      }
    }
  }

  async checkAgentHealth() {
    const agentsDir = path.join(this.claudeDir, 'core/agents')

    try {
      const agents = await fs.readdir(agentsDir)
      const healthyAgents = []
      const unhealthyAgents = []

      for (const agent of agents) {
        const agentPath = path.join(agentsDir, agent)
        const stat = await fs.stat(agentPath)

        if (stat.isDirectory()) {
          try {
            const configPath = path.join(agentPath, 'config.json')
            await fs.access(configPath)
            healthyAgents.push(agent)
          } catch {
            unhealthyAgents.push(agent)
          }
        }
      }

      if (unhealthyAgents.length > 0) {
        return {
          healthy: false,
          message: `Unhealthy agents: ${unhealthyAgents.join(', ')}`,
          details: { healthy: healthyAgents.length, unhealthy: unhealthyAgents.length },
        }
      }

      return {
        healthy: true,
        message: `All ${healthyAgents.length} agents are healthy`,
        details: { count: healthyAgents.length },
      }
    } catch (error) {
      return {
        healthy: false,
        message: `Agent check failed: ${error.message}`,
      }
    }
  }

  async checkAutomationStatus() {
    // Check if automation workflows are functioning
    const automationDir = path.join(this.claudeDir, 'operations/automation')

    try {
      await fs.access(automationDir)

      // Check for workflow definitions
      const workflowsPath = path.join(automationDir, 'workflows')
      const workflows = await fs.readdir(workflowsPath).catch(() => [])

      if (workflows.length === 0) {
        return {
          healthy: false,
          message: 'No automation workflows defined',
          details: { workflows: 0 },
        }
      }

      return {
        healthy: true,
        message: `${workflows.length} automation workflows available`,
        details: { workflows: workflows.length },
      }
    } catch (error) {
      return {
        healthy: false,
        message: `Automation check failed: ${error.message}`,
      }
    }
  }

  async checkDiskUsage() {
    try {
      const { stdout } = await execAsync(`du -sh ${this.claudeDir}`)
      const size = stdout.split('\t')[0]

      const { stdout: dfOutput } = await execAsync(`df -h ${this.claudeDir} | tail -1`)
      const usage = parseInt(dfOutput.split(/\s+/)[4])

      if (usage > 90) {
        return {
          healthy: false,
          message: `Critical disk usage: ${usage}%`,
          details: { usage: `${usage}%`, claudeSize: size },
        }
      } else if (usage > 80) {
        return {
          healthy: true,
          message: `High disk usage: ${usage}%`,
          warning: true,
          details: { usage: `${usage}%`, claudeSize: size },
        }
      }

      return {
        healthy: true,
        message: `Disk usage normal: ${usage}%`,
        details: { usage: `${usage}%`, claudeSize: size },
      }
    } catch (error) {
      return {
        healthy: true,
        message: 'Unable to check disk usage',
        warning: true,
      }
    }
  }

  async checkMemoryUsage() {
    try {
      const { rss, heapUsed, heapTotal } = process.memoryUsage()
      const rssMB = Math.round(rss / 1024 / 1024)
      const heapUsedMB = Math.round(heapUsed / 1024 / 1024)
      const heapTotalMB = Math.round(heapTotal / 1024 / 1024)

      const heapUsagePercent = (heapUsed / heapTotal) * 100

      if (heapUsagePercent > 90) {
        return {
          healthy: false,
          message: `High memory usage: ${heapUsagePercent.toFixed(1)}%`,
          details: {
            rss: `${rssMB}MB`,
            heapUsed: `${heapUsedMB}MB`,
            heapTotal: `${heapTotalMB}MB`,
          },
        }
      }

      return {
        healthy: true,
        message: `Memory usage normal: ${heapUsagePercent.toFixed(1)}%`,
        details: {
          rss: `${rssMB}MB`,
          heapUsed: `${heapUsedMB}MB`,
          heapTotal: `${heapTotalMB}MB`,
        },
      }
    } catch (error) {
      return {
        healthy: true,
        message: 'Unable to check memory usage',
        warning: true,
      }
    }
  }

  async checkFilePermissions() {
    const criticalFiles = ['tools/cli/claude-cli.js', 'core/config/default.config.json']

    const issues = []

    for (const file of criticalFiles) {
      const filePath = path.join(this.claudeDir, file)

      try {
        const stat = await fs.stat(filePath)

        // Check if CLI is executable
        if (file.includes('cli.js') && !(stat.mode & 0o100)) {
          issues.push(`${file} is not executable`)
        }

        // Check if config files are readable
        if (file.includes('config') && !(stat.mode & 0o400)) {
          issues.push(`${file} is not readable`)
        }
      } catch (error) {
        issues.push(`Cannot access ${file}`)
      }
    }

    if (issues.length > 0) {
      return {
        healthy: false,
        message: 'Permission issues detected',
        details: { issues },
      }
    }

    return {
      healthy: true,
      message: 'File permissions are correct',
    }
  }

  async checkDependencies() {
    const requiredCommands = ['node', 'npm', 'git']
    const missing = []

    for (const cmd of requiredCommands) {
      try {
        await execAsync(`which ${cmd}`)
      } catch {
        missing.push(cmd)
      }
    }

    if (missing.length > 0) {
      return {
        healthy: false,
        message: `Missing dependencies: ${missing.join(', ')}`,
        details: { missing },
      }
    }

    // Check Node version
    try {
      const { stdout } = await execAsync('node --version')
      const version = stdout.trim()
      const major = parseInt(version.split('.')[0].substring(1))

      if (major < 14) {
        return {
          healthy: false,
          message: `Node version too old: ${version} (requires >=14)`,
          details: { currentVersion: version, required: '>=14.0.0' },
        }
      }
    } catch (error) {
      return {
        healthy: false,
        message: 'Cannot determine Node version',
      }
    }

    return {
      healthy: true,
      message: 'All dependencies satisfied',
    }
  }

  async checkSecurity() {
    const securityIssues = []

    // Check for sensitive files
    const sensitivePatterns = ['.env', 'credentials', 'secrets', 'private_key', 'password']

    for (const pattern of sensitivePatterns) {
      try {
        const { stdout } = await execAsync(
          `find ${this.claudeDir} -name "*${pattern}*" -type f 2>/dev/null | head -5`
        )

        if (stdout.trim()) {
          securityIssues.push(`Found potentially sensitive files matching: ${pattern}`)
        }
      } catch {
        // Ignore errors in find command
      }
    }

    // Check file permissions for sensitive directories
    const sensitiveDirs = ['core/config', 'operations/security']

    for (const dir of sensitiveDirs) {
      const dirPath = path.join(this.claudeDir, dir)

      try {
        const stat = await fs.stat(dirPath)
        const mode = (stat.mode & parseInt('777', 8)).toString(8)

        if (mode !== '755' && mode !== '700') {
          securityIssues.push(`Directory ${dir} has insecure permissions: ${mode}`)
        }
      } catch {
        // Directory doesn't exist, skip
      }
    }

    if (securityIssues.length > 0) {
      return {
        healthy: false,
        message: 'Security issues detected',
        details: { issues: securityIssues },
      }
    }

    return {
      healthy: true,
      message: 'No security issues detected',
    }
  }

  async checkBackupStatus() {
    const backupDir = path.join(this.claudeDir, 'meta/backup')

    try {
      const backups = await fs.readdir(backupDir)

      if (backups.length === 0) {
        return {
          healthy: false,
          message: 'No backups found',
          details: { count: 0 },
        }
      }

      // Check age of latest backup
      const latestBackup = backups.sort().pop()
      const backupPath = path.join(backupDir, latestBackup)
      const stat = await fs.stat(backupPath)

      const ageInDays = (Date.now() - stat.mtime) / (1000 * 60 * 60 * 24)

      if (ageInDays > 7) {
        return {
          healthy: false,
          message: `Latest backup is ${Math.floor(ageInDays)} days old`,
          details: {
            latestBackup,
            age: `${Math.floor(ageInDays)} days`,
          },
        }
      }

      return {
        healthy: true,
        message: `${backups.length} backups available`,
        details: {
          count: backups.length,
          latestBackup,
          age: `${Math.floor(ageInDays)} days`,
        },
      }
    } catch (error) {
      return {
        healthy: false,
        message: 'Cannot access backup directory',
      }
    }
  }

  async checkPerformance() {
    const metrics = {
      uptime: process.uptime(),
      cpuUsage: process.cpuUsage(),
      memoryUsage: process.memoryUsage(),
    }

    // Simple performance check
    const startTime = Date.now()

    try {
      // Test file system performance
      const testFile = path.join(this.claudeDir, '.perf-test')
      await fs.writeFile(testFile, 'test')
      await fs.readFile(testFile)
      await fs.unlink(testFile)

      const duration = Date.now() - startTime

      if (duration > 100) {
        return {
          healthy: false,
          message: `Poor I/O performance: ${duration}ms`,
          details: { ioLatency: `${duration}ms`, ...metrics },
        }
      }

      return {
        healthy: true,
        message: `Good performance: ${duration}ms I/O latency`,
        details: { ioLatency: `${duration}ms`, ...metrics },
      }
    } catch (error) {
      return {
        healthy: false,
        message: `Performance check failed: ${error.message}`,
      }
    }
  }

  async checkConnectivity() {
    const endpoints = [
      { name: 'GitHub', url: 'github.com' },
      { name: 'NPM', url: 'registry.npmjs.org' },
    ]

    const failures = []

    for (const endpoint of endpoints) {
      try {
        await execAsync(`ping -c 1 -W 2 ${endpoint.url} 2>/dev/null`)
      } catch {
        failures.push(endpoint.name)
      }
    }

    if (failures.length > 0) {
      return {
        healthy: false,
        message: `Cannot reach: ${failures.join(', ')}`,
        details: { unreachable: failures },
      }
    }

    return {
      healthy: true,
      message: 'All endpoints reachable',
    }
  }

  /**
   * Handle check failure
   */
  async handleFailure(checkId, check, result) {
    // Log failure
    console.error(`Check failed: ${check.name} - ${result.message}`)

    // Create alert if consecutive failures exceed threshold
    if (check.consecutiveFailures >= 3) {
      await this.createAlert({
        checkId,
        checkName: check.name,
        severity: check.severity,
        message: result.message,
        details: result.details,
        consecutiveFailures: check.consecutiveFailures,
        timestamp: new Date(),
      })
    }

    // Auto-remediation for certain checks
    if (check.autoRemediate && check.consecutiveFailures >= 2) {
      await this.attemptRemediation(checkId, result)
    }
  }

  /**
   * Create an alert
   */
  async createAlert(alert) {
    this.alerts.push(alert)

    // Save alert to file
    const alertPath = path.join(this.claudeDir, 'meta/health/alerts', `alert-${Date.now()}.json`)

    await fs.mkdir(path.dirname(alertPath), { recursive: true })
    await fs.writeFile(alertPath, JSON.stringify(alert, null, 2))

    // Trigger alert notifications (webhook, email, etc.)
    await this.sendAlertNotifications(alert)
  }

  /**
   * Send alert notifications
   */
  async sendAlertNotifications(alert) {
    // In production, this would send to various channels
    console.log(`\n🚨 ALERT: ${alert.checkName}`)
    console.log(`Severity: ${alert.severity}`)
    console.log(`Message: ${alert.message}`)

    if (alert.details) {
      console.log(`Details: ${JSON.stringify(alert.details)}`)
    }
  }

  /**
   * Attempt automatic remediation
   */
  async attemptRemediation(checkId, result) {
    console.log(`Attempting auto-remediation for ${checkId}...`)

    switch (checkId) {
      case 'directory-structure':
        // Recreate missing directories
        if (result.details?.missing) {
          for (const dir of result.details.missing) {
            const dirPath = path.join(this.claudeDir, dir)
            await fs.mkdir(dirPath, { recursive: true })
            console.log(`Created missing directory: ${dir}`)
          }
        }
        break

      case 'file-permissions':
        // Fix file permissions
        if (result.details?.issues) {
          for (const issue of result.details.issues) {
            if (issue.includes('not executable')) {
              const file = issue.split(' ')[0]
              const filePath = path.join(this.claudeDir, file)
              await execAsync(`chmod +x ${filePath}`)
              console.log(`Fixed permissions for ${file}`)
            }
          }
        }
        break

      default:
        console.log(`No auto-remediation available for ${checkId}`)
    }
  }

  /**
   * Generate summary of health check results
   */
  generateSummary(results, duration) {
    let healthy = 0
    let warnings = 0
    let failures = 0

    for (const [id, result] of results) {
      if (result.healthy) {
        if (result.warning) {
          warnings++
        } else {
          healthy++
        }
      } else {
        failures++
      }
    }

    const total = healthy + warnings + failures
    const score = Math.round((healthy / total) * 100)

    return {
      timestamp: new Date().toISOString(),
      duration: `${duration}ms`,
      total,
      healthy,
      warnings,
      failures,
      score,
      status: failures > 0 ? 'unhealthy' : warnings > 0 ? 'degraded' : 'healthy',
    }
  }

  /**
   * Save health check results
   */
  async saveResults(results, summary) {
    const resultsPath = path.join(this.claudeDir, 'meta/health', 'latest-results.json')

    const data = {
      summary,
      results: Array.from(results.entries()).map(([id, result]) => ({
        id,
        ...result,
      })),
      alerts: this.alerts,
    }

    await fs.mkdir(path.dirname(resultsPath), { recursive: true })
    await fs.writeFile(resultsPath, JSON.stringify(data, null, 2))

    // Archive results
    const archivePath = path.join(
      this.claudeDir,
      'meta/health/archive',
      `health-${Date.now()}.json`
    )

    await fs.mkdir(path.dirname(archivePath), { recursive: true })
    await fs.writeFile(archivePath, JSON.stringify(data, null, 2))
  }

  /**
   * Check alert conditions
   */
  async checkAlertConditions(results) {
    // Check for critical failures
    const criticalFailures = []

    for (const [id, check] of this.checks) {
      const result = results.get(id)

      if (!result?.healthy && check.severity === 'critical') {
        criticalFailures.push({
          id,
          name: check.name,
          message: result.message,
        })
      }
    }

    if (criticalFailures.length > 0) {
      await this.createAlert({
        type: 'critical-failures',
        severity: 'critical',
        message: `${criticalFailures.length} critical health checks failed`,
        details: { failures: criticalFailures },
        timestamp: new Date(),
      })
    }
  }

  /**
   * Start continuous monitoring
   */
  async startMonitoring() {
    console.log('Starting continuous health monitoring...\n')

    // Run initial check
    await this.runAllChecks()

    // Schedule periodic checks
    for (const [id, check] of this.checks) {
      setInterval(async () => {
        try {
          await this.runCheck(id)
        } catch (error) {
          console.error(`Error in scheduled check ${id}: ${error.message}`)
        }
      }, check.interval)
    }

    console.log('Health monitoring started. Press Ctrl+C to stop.\n')
  }

  /**
   * Get current health status
   */
  async getStatus() {
    try {
      const resultsPath = path.join(this.claudeDir, 'meta/health/latest-results.json')
      const data = JSON.parse(await fs.readFile(resultsPath, 'utf8'))
      return data
    } catch (error) {
      return {
        summary: { status: 'unknown', message: 'No health data available' },
        results: [],
        alerts: [],
      }
    }
  }

  /**
   * Generate health report
   */
  async generateReport(format = 'json') {
    const status = await this.getStatus()
    const history = await this.getHealthHistory()
    const metrics = await this.collectMetrics()

    const report = {
      generated: new Date().toISOString(),
      currentStatus: status.summary,
      checks: status.results,
      alerts: this.alerts,
      history,
      metrics,
      recommendations: await this.generateRecommendations(status),
    }

    if (format === 'html') {
      return this.formatReportAsHTML(report)
    }

    return report
  }

  /**
   * Get health history
   */
  async getHealthHistory() {
    const archiveDir = path.join(this.claudeDir, 'meta/health/archive')

    try {
      const files = await fs.readdir(archiveDir)
      const history = []

      // Get last 10 results
      const recentFiles = files.sort().slice(-10)

      for (const file of recentFiles) {
        const data = JSON.parse(await fs.readFile(path.join(archiveDir, file), 'utf8'))
        history.push({
          timestamp: data.summary.timestamp,
          status: data.summary.status,
          score: data.summary.score,
        })
      }

      return history
    } catch {
      return []
    }
  }

  /**
   * Collect system metrics
   */
  async collectMetrics() {
    return {
      system: {
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version,
        uptime: process.uptime(),
      },
      resources: {
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
      },
      claude: {
        version: '1.0.0',
        checks: this.checks.size,
        alerts: this.alerts.length,
      },
    }
  }

  /**
   * Generate recommendations based on health status
   */
  async generateRecommendations(status) {
    const recommendations = []

    for (const result of status.results) {
      if (!result.healthy) {
        switch (result.id) {
          case 'disk-usage':
            recommendations.push({
              priority: 'high',
              action: 'Clean up disk space',
              command: 'claude maintain cleanup',
            })
            break

          case 'backup-status':
            recommendations.push({
              priority: 'medium',
              action: 'Create a new backup',
              command: 'claude maintain backup',
            })
            break

          case 'security':
            recommendations.push({
              priority: 'critical',
              action: 'Run security audit and fix issues',
              command: 'claude security audit && claude security fix',
            })
            break

          case 'dependencies':
            recommendations.push({
              priority: 'high',
              action: 'Install missing dependencies',
              command: 'Check and install required tools',
            })
            break
        }
      }
    }

    return recommendations
  }

  /**
   * Format report as HTML
   */
  formatReportAsHTML(report) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Claude Health Report - ${report.generated}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 20px;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px;
      text-align: center;
    }
    .header h1 { font-size: 2.5rem; margin-bottom: 10px; }
    .header p { opacity: 0.9; }
    
    .status-banner {
      padding: 20px 40px;
      font-size: 1.2rem;
      font-weight: bold;
      text-align: center;
    }
    .status-healthy { background: #10b981; color: white; }
    .status-degraded { background: #f59e0b; color: white; }
    .status-unhealthy { background: #ef4444; color: white; }
    
    .content { padding: 40px; }
    
    .section {
      margin-bottom: 40px;
      padding: 25px;
      background: #f9fafb;
      border-radius: 10px;
    }
    .section h2 {
      font-size: 1.5rem;
      margin-bottom: 20px;
      color: #1f2937;
    }
    
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }
    .metric-card {
      background: white;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .metric-value {
      font-size: 2rem;
      font-weight: bold;
      color: #667eea;
    }
    .metric-label {
      color: #6b7280;
      font-size: 0.9rem;
      margin-top: 5px;
    }
    
    .check-list {
      list-style: none;
      margin-top: 20px;
    }
    .check-item {
      padding: 15px;
      margin-bottom: 10px;
      background: white;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .check-healthy { border-left: 4px solid #10b981; }
    .check-unhealthy { border-left: 4px solid #ef4444; }
    .check-warning { border-left: 4px solid #f59e0b; }
    
    .icon-healthy { color: #10b981; }
    .icon-unhealthy { color: #ef4444; }
    .icon-warning { color: #f59e0b; }
    
    .recommendations {
      background: #fef3c7;
      border: 2px solid #f59e0b;
      border-radius: 10px;
      padding: 20px;
    }
    .recommendation {
      margin-bottom: 15px;
      padding-bottom: 15px;
      border-bottom: 1px solid #fcd34d;
    }
    .recommendation:last-child {
      margin-bottom: 0;
      padding-bottom: 0;
      border-bottom: none;
    }
    .rec-priority {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 0.8rem;
      font-weight: bold;
      margin-right: 10px;
    }
    .priority-critical { background: #ef4444; color: white; }
    .priority-high { background: #f59e0b; color: white; }
    .priority-medium { background: #3b82f6; color: white; }
    
    .chart-container {
      margin-top: 20px;
      padding: 20px;
      background: white;
      border-radius: 10px;
    }
    
    .footer {
      text-align: center;
      padding: 20px;
      color: #6b7280;
      font-size: 0.9rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Claude Health Report</h1>
      <p>Generated: ${new Date(report.generated).toLocaleString()}</p>
    </div>
    
    <div class="status-banner status-${report.currentStatus.status}">
      System Status: ${report.currentStatus.status.toUpperCase()} 
      (Score: ${report.currentStatus.score}%)
    </div>
    
    <div class="content">
      <div class="section">
        <h2>Overview</h2>
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-value">${report.currentStatus.healthy}</div>
            <div class="metric-label">Healthy Checks</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">${report.currentStatus.warnings}</div>
            <div class="metric-label">Warnings</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">${report.currentStatus.failures}</div>
            <div class="metric-label">Failures</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">${report.alerts.length}</div>
            <div class="metric-label">Active Alerts</div>
          </div>
        </div>
      </div>
      
      <div class="section">
        <h2>Health Checks</h2>
        <ul class="check-list">
          ${report.checks
            .map(
              (check) => `
            <li class="check-item ${check.healthy ? 'check-healthy' : 'check-unhealthy'}">
              <div>
                <span class="${check.healthy ? 'icon-healthy' : 'icon-unhealthy'}">
                  ${check.healthy ? '✓' : '✗'}
                </span>
                <strong>${check.id}</strong>: ${check.message || 'OK'}
              </div>
            </li>
          `
            )
            .join('')}
        </ul>
      </div>
      
      ${
        report.recommendations.length > 0
          ? `
        <div class="section recommendations">
          <h2>Recommendations</h2>
          ${report.recommendations
            .map(
              (rec) => `
            <div class="recommendation">
              <span class="rec-priority priority-${rec.priority}">${rec.priority.toUpperCase()}</span>
              <strong>${rec.action}</strong>
              ${rec.command ? `<br><code>${rec.command}</code>` : ''}
            </div>
          `
            )
            .join('')}
        </div>
      `
          : ''
      }
      
      ${
        report.alerts.length > 0
          ? `
        <div class="section">
          <h2>Active Alerts</h2>
          <ul class="check-list">
            ${report.alerts
              .map(
                (alert) => `
              <li class="check-item check-unhealthy">
                <div>
                  <strong>${alert.checkName || alert.type}</strong>: ${alert.message}
                  <br><small>${new Date(alert.timestamp).toLocaleString()}</small>
                </div>
              </li>
            `
              )
              .join('')}
          </ul>
        </div>
      `
          : ''
      }
      
      <div class="section">
        <h2>System Information</h2>
        <pre>${JSON.stringify(report.metrics, null, 2)}</pre>
      </div>
    </div>
    
    <div class="footer">
      <p>Claude Health Monitoring System v1.0.0</p>
      <p>Report generated automatically by the health monitoring service</p>
    </div>
  </div>
</body>
</html>
    `
  }
}

// Export for use in CLI and other tools
module.exports = HealthMonitor

// If run directly, start monitoring
if (require.main === module) {
  const claudeDir = path.resolve(__dirname, '../..')
  const monitor = new HealthMonitor(claudeDir)

  const command = process.argv[2]

  switch (command) {
    case 'check':
      monitor.runAllChecks().then(({ summary }) => {
        console.log('\nHealth Check Complete')
        console.log(`Status: ${summary.status}`)
        console.log(`Score: ${summary.score}%`)
        process.exit(summary.failures > 0 ? 1 : 0)
      })
      break

    case 'monitor':
      monitor.startMonitoring()
      break

    case 'report':
      monitor.generateReport('html').then((html) => {
        const reportPath = path.join(claudeDir, 'meta/health/report.html')
        require('fs').writeFileSync(reportPath, html)
        console.log(`Report saved to: ${reportPath}`)
      })
      break

    default:
      console.log('Usage: node health-monitor.js [check|monitor|report]')
      process.exit(1)
  }
}
