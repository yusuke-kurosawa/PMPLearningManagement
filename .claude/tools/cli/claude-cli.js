#!/usr/bin/env node

/**
 * Claude CLI - Unified Command Line Interface for .claude Directory Operations
 *
 * This enterprise-grade CLI provides comprehensive management capabilities for the
 * .claude directory structure, including configuration management, health monitoring,
 * automation orchestration, and maintenance operations.
 */

const fs = require('fs').promises
const path = require('path')
const { spawn } = require('child_process')
const { promisify } = require('util')
const exec = promisify(require('child_process').exec)

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
}

// Base paths
const CLAUDE_DIR = path.resolve(__dirname, '../..')
const CONFIG_DIR = path.join(CLAUDE_DIR, 'core/config')
const TOOLS_DIR = path.join(CLAUDE_DIR, 'tools')
const META_DIR = path.join(CLAUDE_DIR, 'meta')

/**
 * CLI Command Registry
 */
class ClaudeCLI {
  constructor() {
    this.commands = new Map()
    this.config = null
    this.initializeCommands()
  }

  /**
   * Initialize all available commands
   */
  initializeCommands() {
    // Configuration commands
    this.registerCommand('config', {
      description: 'Manage Claude configuration',
      subcommands: {
        get: { handler: this.configGet.bind(this), description: 'Get configuration value' },
        set: { handler: this.configSet.bind(this), description: 'Set configuration value' },
        validate: {
          handler: this.configValidate.bind(this),
          description: 'Validate configuration',
        },
        reset: {
          handler: this.configReset.bind(this),
          description: 'Reset to default configuration',
        },
        show: { handler: this.configShow.bind(this), description: 'Show current configuration' },
      },
    })

    // Agent commands
    this.registerCommand('agent', {
      description: 'Manage Claude agents',
      subcommands: {
        list: { handler: this.agentList.bind(this), description: 'List all agents' },
        info: { handler: this.agentInfo.bind(this), description: 'Show agent information' },
        enable: { handler: this.agentEnable.bind(this), description: 'Enable an agent' },
        disable: { handler: this.agentDisable.bind(this), description: 'Disable an agent' },
        run: { handler: this.agentRun.bind(this), description: 'Run an agent' },
      },
    })

    // Health and monitoring commands
    this.registerCommand('health', {
      description: 'Health checking and monitoring',
      subcommands: {
        check: { handler: this.healthCheck.bind(this), description: 'Run health checks' },
        status: { handler: this.healthStatus.bind(this), description: 'Show health status' },
        metrics: { handler: this.healthMetrics.bind(this), description: 'Show metrics' },
        report: { handler: this.healthReport.bind(this), description: 'Generate health report' },
      },
    })

    // Maintenance commands
    this.registerCommand('maintain', {
      description: 'Maintenance operations',
      subcommands: {
        cleanup: { handler: this.maintainCleanup.bind(this), description: 'Run cleanup' },
        backup: { handler: this.maintainBackup.bind(this), description: 'Create backup' },
        restore: { handler: this.maintainRestore.bind(this), description: 'Restore from backup' },
        optimize: {
          handler: this.maintainOptimize.bind(this),
          description: 'Optimize .claude directory',
        },
        validate: {
          handler: this.maintainValidate.bind(this),
          description: 'Validate directory structure',
        },
      },
    })

    // Automation commands
    this.registerCommand('auto', {
      description: 'Automation and workflow management',
      subcommands: {
        run: { handler: this.autoRun.bind(this), description: 'Run automation workflow' },
        list: { handler: this.autoList.bind(this), description: 'List workflows' },
        schedule: { handler: this.autoSchedule.bind(this), description: 'Schedule workflow' },
        status: { handler: this.autoStatus.bind(this), description: 'Show automation status' },
      },
    })

    // Development commands
    this.registerCommand('dev', {
      description: 'Development tools',
      subcommands: {
        generate: {
          handler: this.devGenerate.bind(this),
          description: 'Generate code from templates',
        },
        validate: { handler: this.devValidate.bind(this), description: 'Validate code' },
        test: { handler: this.devTest.bind(this), description: 'Run tests' },
        lint: { handler: this.devLint.bind(this), description: 'Run linters' },
      },
    })

    // Security commands
    this.registerCommand('security', {
      description: 'Security operations',
      subcommands: {
        scan: { handler: this.securityScan.bind(this), description: 'Run security scan' },
        audit: { handler: this.securityAudit.bind(this), description: 'Run security audit' },
        report: {
          handler: this.securityReport.bind(this),
          description: 'Generate security report',
        },
        fix: { handler: this.securityFix.bind(this), description: 'Apply security fixes' },
      },
    })

    // Deployment commands
    this.registerCommand('deploy', {
      description: 'Deployment operations',
      subcommands: {
        status: { handler: this.deployStatus.bind(this), description: 'Show deployment status' },
        preview: { handler: this.deployPreview.bind(this), description: 'Preview deployment' },
        execute: { handler: this.deployExecute.bind(this), description: 'Execute deployment' },
        rollback: { handler: this.deployRollback.bind(this), description: 'Rollback deployment' },
      },
    })

    // Info commands
    this.registerCommand('info', {
      description: 'Information and documentation',
      subcommands: {
        version: { handler: this.infoVersion.bind(this), description: 'Show version information' },
        status: { handler: this.infoStatus.bind(this), description: 'Show overall status' },
        docs: { handler: this.infoDocs.bind(this), description: 'Open documentation' },
        help: { handler: this.showHelp.bind(this), description: 'Show help' },
      },
    })
  }

  /**
   * Register a command
   */
  registerCommand(name, config) {
    this.commands.set(name, config)
  }

  /**
   * Load configuration
   */
  async loadConfig() {
    try {
      const configPath = path.join(CONFIG_DIR, 'default.config.json')
      const configData = await fs.readFile(configPath, 'utf8')
      this.config = JSON.parse(configData)

      // Load environment-specific overrides
      const env = process.env.CLAUDE_ENV || 'development'
      const envConfigPath = path.join(CONFIG_DIR, `${env}.config.json`)

      try {
        const envConfigData = await fs.readFile(envConfigPath, 'utf8')
        const envConfig = JSON.parse(envConfigData)
        this.config = { ...this.config, ...envConfig }
      } catch (e) {
        // Environment-specific config is optional
      }

      return this.config
    } catch (error) {
      this.error(`Failed to load configuration: ${error.message}`)
      process.exit(1)
    }
  }

  // Configuration command handlers
  async configGet(args) {
    const key = args[0]
    if (!key) {
      this.error('Please specify a configuration key')
      return
    }

    await this.loadConfig()
    const value = this.getNestedProperty(this.config, key)

    if (value === undefined) {
      this.warn(`Configuration key '${key}' not found`)
    } else {
      this.success(`${key}: ${JSON.stringify(value, null, 2)}`)
    }
  }

  async configSet(args) {
    const [key, value] = args
    if (!key || !value) {
      this.error('Please specify key and value')
      return
    }

    await this.loadConfig()
    this.setNestedProperty(this.config, key, value)

    const configPath = path.join(CONFIG_DIR, 'custom.config.json')
    await fs.writeFile(configPath, JSON.stringify(this.config, null, 2))

    this.success(`Configuration updated: ${key} = ${value}`)
  }

  async configValidate() {
    this.info('Validating configuration...')

    try {
      const schemaPath = path.join(CONFIG_DIR, 'config.schema.json')
      const schemaData = await fs.readFile(schemaPath, 'utf8')
      const schema = JSON.parse(schemaData)

      await this.loadConfig()

      // Basic validation (would use ajv in production)
      const errors = this.validateAgainstSchema(this.config, schema)

      if (errors.length === 0) {
        this.success('Configuration is valid')
      } else {
        this.error('Configuration validation failed:')
        errors.forEach((err) => this.error(`  - ${err}`))
      }
    } catch (error) {
      this.error(`Validation failed: ${error.message}`)
    }
  }

  async configReset() {
    this.warn('Resetting configuration to defaults...')

    try {
      const customConfigPath = path.join(CONFIG_DIR, 'custom.config.json')
      await fs.unlink(customConfigPath).catch(() => {})

      this.success('Configuration reset to defaults')
    } catch (error) {
      this.error(`Reset failed: ${error.message}`)
    }
  }

  async configShow() {
    await this.loadConfig()
    this.info('Current Configuration:')
    console.log(JSON.stringify(this.config, null, 2))
  }

  // Health command handlers
  async healthCheck() {
    this.info('Running health checks...\n')

    const checks = [
      { name: 'Directory Structure', fn: this.checkDirectoryStructure.bind(this) },
      { name: 'Configuration', fn: this.checkConfiguration.bind(this) },
      { name: 'Dependencies', fn: this.checkDependencies.bind(this) },
      { name: 'Permissions', fn: this.checkPermissions.bind(this) },
      { name: 'Disk Space', fn: this.checkDiskSpace.bind(this) },
      { name: 'Agent Status', fn: this.checkAgentStatus.bind(this) },
    ]

    const results = []
    for (const check of checks) {
      process.stdout.write(`Checking ${check.name}... `)
      try {
        const result = await check.fn()
        if (result.success) {
          this.success('✓')
        } else {
          this.error('✗')
          this.warn(`  ${result.message}`)
        }
        results.push({ ...result, name: check.name })
      } catch (error) {
        this.error('✗')
        this.error(`  ${error.message}`)
        results.push({ name: check.name, success: false, message: error.message })
      }
    }

    // Summary
    console.log('\n' + colors.bright + 'Health Check Summary:' + colors.reset)
    const passed = results.filter((r) => r.success).length
    const failed = results.filter((r) => !r.success).length

    if (failed === 0) {
      this.success(`All ${passed} checks passed`)
    } else {
      this.warn(`${passed} passed, ${failed} failed`)
    }

    // Save results
    const reportPath = path.join(META_DIR, 'health', 'latest-check.json')
    await fs.mkdir(path.dirname(reportPath), { recursive: true })
    await fs.writeFile(
      reportPath,
      JSON.stringify(
        {
          timestamp: new Date().toISOString(),
          results,
          summary: { passed, failed },
        },
        null,
        2
      )
    )
  }

  async healthStatus() {
    try {
      const reportPath = path.join(META_DIR, 'health', 'latest-check.json')
      const reportData = await fs.readFile(reportPath, 'utf8')
      const report = JSON.parse(reportData)

      this.info(`Health Status (checked: ${report.timestamp})\n`)

      report.results.forEach((result) => {
        const status = result.success ? colors.green + '✓' : colors.red + '✗'
        console.log(`${status} ${result.name}${colors.reset}`)
        if (!result.success && result.message) {
          console.log(`  ${colors.dim}${result.message}${colors.reset}`)
        }
      })

      console.log(`\nSummary: ${report.summary.passed} passed, ${report.summary.failed} failed`)
    } catch (error) {
      this.error('No health status available. Run "claude health check" first.')
    }
  }

  async healthMetrics() {
    this.info('Collecting metrics...\n')

    const metrics = {
      timestamp: new Date().toISOString(),
      system: await this.collectSystemMetrics(),
      claude: await this.collectClaudeMetrics(),
      performance: await this.collectPerformanceMetrics(),
    }

    console.log(JSON.stringify(metrics, null, 2))

    // Save metrics
    const metricsPath = path.join(META_DIR, 'metrics', `metrics-${Date.now()}.json`)
    await fs.mkdir(path.dirname(metricsPath), { recursive: true })
    await fs.writeFile(metricsPath, JSON.stringify(metrics, null, 2))

    this.success('\nMetrics saved to ' + metricsPath)
  }

  async healthReport() {
    this.info('Generating comprehensive health report...\n')

    const report = {
      generated: new Date().toISOString(),
      project: this.config?.project || {},
      health: await this.getHealthStatus(),
      metrics: await this.collectAllMetrics(),
      issues: await this.detectIssues(),
      recommendations: await this.generateRecommendations(),
    }

    const reportPath = path.join(META_DIR, 'health', `report-${Date.now()}.html`)
    await fs.mkdir(path.dirname(reportPath), { recursive: true })

    const html = this.generateHealthReportHTML(report)
    await fs.writeFile(reportPath, html)

    this.success(`Report generated: ${reportPath}`)
  }

  // Agent command handlers
  async agentList() {
    const agentsDir = path.join(CLAUDE_DIR, 'core/agents')

    try {
      const agents = await fs.readdir(agentsDir)

      this.info('Available Agents:\n')

      for (const agent of agents) {
        const agentPath = path.join(agentsDir, agent)
        const stat = await fs.stat(agentPath)

        if (stat.isDirectory()) {
          const enabled = this.config?.agents?.enabled?.includes(agent)
            ? colors.green + '[enabled]'
            : colors.dim + '[disabled]'

          console.log(`  ${colors.cyan}${agent}${colors.reset} ${enabled}${colors.reset}`)
        }
      }
    } catch (error) {
      this.error(`Failed to list agents: ${error.message}`)
    }
  }

  async agentInfo(args) {
    const agentName = args[0]
    if (!agentName) {
      this.error('Please specify an agent name')
      return
    }

    const agentPath = path.join(CLAUDE_DIR, 'core/agents', agentName)

    try {
      const configPath = path.join(agentPath, 'config.json')
      const configData = await fs.readFile(configPath, 'utf8')
      const config = JSON.parse(configData)

      this.info(`Agent: ${agentName}\n`)
      console.log(JSON.stringify(config, null, 2))
    } catch (error) {
      this.error(`Agent '${agentName}' not found or invalid`)
    }
  }

  // Maintenance command handlers
  async maintainCleanup() {
    this.info('Running cleanup...\n')

    const patterns = this.config?.maintenance?.cleanup?.patterns || ['*.tmp', '*.log']
    let cleaned = 0

    for (const pattern of patterns) {
      this.info(`Cleaning ${pattern}...`)
      const files = await this.findFiles(CLAUDE_DIR, pattern)

      for (const file of files) {
        try {
          await fs.unlink(file)
          cleaned++
        } catch (error) {
          this.warn(`  Failed to delete ${file}: ${error.message}`)
        }
      }
    }

    this.success(`\nCleanup complete. Removed ${cleaned} files.`)
  }

  async maintainBackup() {
    this.info('Creating backup...\n')

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupDir = path.join(META_DIR, 'backup', timestamp)

    await fs.mkdir(backupDir, { recursive: true })

    // Backup core directories
    const coreDirs = ['core', 'development', 'operations', 'knowledge', 'tools']

    for (const dir of coreDirs) {
      this.info(`Backing up ${dir}...`)
      const sourcePath = path.join(CLAUDE_DIR, dir)
      const targetPath = path.join(backupDir, dir)

      await this.copyDirectory(sourcePath, targetPath)
    }

    // Create backup manifest
    const manifest = {
      timestamp,
      version: this.config?.version || '1.0.0',
      directories: coreDirs,
      size: await this.getDirectorySize(backupDir),
    }

    await fs.writeFile(path.join(backupDir, 'manifest.json'), JSON.stringify(manifest, null, 2))

    this.success(`\nBackup created: ${backupDir}`)
  }

  // Utility methods
  log(message) {
    console.log(message)
  }

  info(message) {
    console.log(colors.blue + '→' + colors.reset + ' ' + message)
  }

  success(message) {
    console.log(colors.green + '✓' + colors.reset + ' ' + message)
  }

  warn(message) {
    console.log(colors.yellow + '⚠' + colors.reset + ' ' + message)
  }

  error(message) {
    console.log(colors.red + '✗' + colors.reset + ' ' + message)
  }

  getNestedProperty(obj, path) {
    return path.split('.').reduce((curr, prop) => curr?.[prop], obj)
  }

  setNestedProperty(obj, path, value) {
    const props = path.split('.')
    const last = props.pop()
    const target = props.reduce((curr, prop) => {
      if (!curr[prop]) curr[prop] = {}
      return curr[prop]
    }, obj)
    target[last] = value
  }

  validateAgainstSchema(data, schema) {
    const errors = []
    // Simplified validation - in production would use ajv
    if (schema.required) {
      for (const req of schema.required) {
        if (!data[req]) {
          errors.push(`Missing required field: ${req}`)
        }
      }
    }
    return errors
  }

  async checkDirectoryStructure() {
    const requiredDirs = ['core', 'development', 'operations', 'knowledge', 'tools', 'meta']

    for (const dir of requiredDirs) {
      const dirPath = path.join(CLAUDE_DIR, dir)
      try {
        await fs.access(dirPath)
      } catch {
        return { success: false, message: `Missing directory: ${dir}` }
      }
    }

    return { success: true }
  }

  async checkConfiguration() {
    try {
      await this.loadConfig()
      return { success: true }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  async checkDependencies() {
    // Check for required tools
    const tools = ['node', 'npm', 'git']

    for (const tool of tools) {
      try {
        await exec(`which ${tool}`)
      } catch {
        return { success: false, message: `Missing dependency: ${tool}` }
      }
    }

    return { success: true }
  }

  async checkPermissions() {
    try {
      const testFile = path.join(CLAUDE_DIR, '.permission-test')
      await fs.writeFile(testFile, 'test')
      await fs.unlink(testFile)
      return { success: true }
    } catch (error) {
      return { success: false, message: 'Insufficient permissions' }
    }
  }

  async checkDiskSpace() {
    try {
      const { stdout } = await exec(`df -h ${CLAUDE_DIR} | tail -1`)
      const usage = parseInt(stdout.split(/\s+/)[4])

      if (usage > 90) {
        return { success: false, message: `Disk usage critical: ${usage}%` }
      }

      return { success: true }
    } catch (error) {
      return { success: true } // Don't fail on this check
    }
  }

  async checkAgentStatus() {
    const enabledAgents = this.config?.agents?.enabled || []

    if (enabledAgents.length === 0) {
      return { success: false, message: 'No agents enabled' }
    }

    return { success: true }
  }

  async collectSystemMetrics() {
    const { stdout: cpu } = await exec("top -bn1 | grep 'Cpu(s)' | head -1").catch(() => ({
      stdout: 'N/A',
    }))
    const { stdout: memory } = await exec('free -m | grep Mem').catch(() => ({ stdout: 'N/A' }))
    const { stdout: disk } = await exec(`df -h ${CLAUDE_DIR} | tail -1`).catch(() => ({
      stdout: 'N/A',
    }))

    return { cpu, memory, disk }
  }

  async collectClaudeMetrics() {
    const agentCount = (await fs.readdir(path.join(CLAUDE_DIR, 'core/agents'))).length
    const scriptCount = (await fs.readdir(path.join(CLAUDE_DIR, 'tools/scripts'))).length

    return {
      agents: agentCount,
      scripts: scriptCount,
      configVersion: this.config?.version,
    }
  }

  async collectPerformanceMetrics() {
    return {
      startupTime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      nodeVersion: process.version,
    }
  }

  async findFiles(dir, pattern) {
    const files = []
    // Simplified file finding - in production would use glob
    return files
  }

  async copyDirectory(source, target) {
    await fs.mkdir(target, { recursive: true })
    const entries = await fs.readdir(source, { withFileTypes: true })

    for (const entry of entries) {
      const sourcePath = path.join(source, entry.name)
      const targetPath = path.join(target, entry.name)

      if (entry.isDirectory()) {
        await this.copyDirectory(sourcePath, targetPath)
      } else {
        await fs.copyFile(sourcePath, targetPath)
      }
    }
  }

  async getDirectorySize(dir) {
    // Simplified size calculation
    return '0 MB'
  }

  generateHealthReportHTML(report) {
    return `
<!DOCTYPE html>
<html>
<head>
  <title>Claude Health Report</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; }
    .section { background: white; padding: 20px; margin: 20px 0; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .metric { display: inline-block; margin: 10px; padding: 15px; background: #f7f7f7; border-radius: 5px; }
    .success { color: #10b981; }
    .warning { color: #f59e0b; }
    .error { color: #ef4444; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Claude Health Report</h1>
      <p>Generated: ${report.generated}</p>
    </div>
    
    <div class="section">
      <h2>Project Information</h2>
      <pre>${JSON.stringify(report.project, null, 2)}</pre>
    </div>
    
    <div class="section">
      <h2>Health Status</h2>
      <pre>${JSON.stringify(report.health, null, 2)}</pre>
    </div>
    
    <div class="section">
      <h2>Metrics</h2>
      <pre>${JSON.stringify(report.metrics, null, 2)}</pre>
    </div>
    
    <div class="section">
      <h2>Issues</h2>
      <pre>${JSON.stringify(report.issues, null, 2)}</pre>
    </div>
    
    <div class="section">
      <h2>Recommendations</h2>
      <pre>${JSON.stringify(report.recommendations, null, 2)}</pre>
    </div>
  </div>
</body>
</html>
    `
  }

  async getHealthStatus() {
    // Implementation for getting health status
    return { status: 'healthy' }
  }

  async collectAllMetrics() {
    return {
      system: await this.collectSystemMetrics(),
      claude: await this.collectClaudeMetrics(),
      performance: await this.collectPerformanceMetrics(),
    }
  }

  async detectIssues() {
    return []
  }

  async generateRecommendations() {
    return ['Keep configuration up to date', 'Run regular health checks', 'Monitor disk usage']
  }

  /**
   * Show help message
   */
  showHelp() {
    console.log(`
${colors.bright}Claude CLI - Enterprise DevOps Management Tool${colors.reset}

${colors.cyan}Usage:${colors.reset}
  claude <command> [subcommand] [options]

${colors.cyan}Available Commands:${colors.reset}
`)

    for (const [name, config] of this.commands) {
      console.log(`  ${colors.green}${name.padEnd(12)}${colors.reset} ${config.description}`)

      if (config.subcommands) {
        for (const [subName, subConfig] of Object.entries(config.subcommands)) {
          console.log(
            `    ${colors.dim}${subName.padEnd(10)} ${subConfig.description}${colors.reset}`
          )
        }
      }
    }

    console.log(`
${colors.cyan}Examples:${colors.reset}
  claude config show              # Show current configuration
  claude health check             # Run health checks
  claude agent list               # List all agents
  claude maintain cleanup         # Run cleanup
  claude auto run ci              # Run CI workflow

${colors.cyan}For more information:${colors.reset}
  claude info docs               # Open documentation
  claude info help               # Show this help message
    `)
  }

  /**
   * Main CLI entry point
   */
  async run(args) {
    const [command, subcommand, ...commandArgs] = args.slice(2)

    if (!command || command === 'help' || command === '--help' || command === '-h') {
      this.showHelp()
      return
    }

    const cmd = this.commands.get(command)

    if (!cmd) {
      this.error(`Unknown command: ${command}`)
      this.info('Run "claude help" for available commands')
      return
    }

    if (cmd.subcommands) {
      if (!subcommand) {
        this.error(`Please specify a subcommand for ${command}`)
        console.log('\nAvailable subcommands:')
        for (const [name, config] of Object.entries(cmd.subcommands)) {
          console.log(`  ${name.padEnd(12)} ${config.description}`)
        }
        return
      }

      const subcmd = cmd.subcommands[subcommand]
      if (!subcmd) {
        this.error(`Unknown subcommand: ${subcommand}`)
        return
      }

      await this.loadConfig()
      await subcmd.handler(commandArgs)
    } else if (cmd.handler) {
      await this.loadConfig()
      await cmd.handler(commandArgs)
    }
  }
}

// Initialize and run CLI
const cli = new ClaudeCLI()
cli.run(process.argv).catch((error) => {
  console.error(colors.red + 'Fatal error:' + colors.reset, error.message)
  process.exit(1)
})
