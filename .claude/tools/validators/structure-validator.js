#!/usr/bin/env node

/**
 * Structure Validator for Claude Directory
 *
 * Validates that the .claude directory structure follows enterprise standards
 * and all required components are properly configured.
 */

const fs = require('fs').promises
const path = require('path')

class StructureValidator {
  constructor(claudeDir) {
    this.claudeDir = claudeDir || path.resolve(__dirname, '../..')
    this.errors = []
    this.warnings = []
    this.info = []
  }

  /**
   * Required directory structure
   */
  getRequiredStructure() {
    return {
      core: {
        type: 'directory',
        required: true,
        children: {
          agents: { type: 'directory', required: true },
          context: { type: 'directory', required: true },
          policies: { type: 'directory', required: true },
          config: {
            type: 'directory',
            required: true,
            children: {
              'config.schema.json': { type: 'file', required: true },
              'default.config.json': { type: 'file', required: true },
            },
          },
        },
      },
      development: {
        type: 'directory',
        required: true,
        children: {
          templates: { type: 'directory', required: true },
          generators: { type: 'directory', required: true },
          validation: { type: 'directory', required: true },
          testing: { type: 'directory', required: true },
        },
      },
      operations: {
        type: 'directory',
        required: true,
        children: {
          automation: { type: 'directory', required: true },
          monitoring: { type: 'directory', required: true },
          deployment: { type: 'directory', required: true },
          infrastructure: { type: 'directory', required: true },
          security: { type: 'directory', required: true },
        },
      },
      knowledge: {
        type: 'directory',
        required: true,
        children: {
          'quick-ref': { type: 'directory', required: true },
          documentation: { type: 'directory', required: true },
          guides: { type: 'directory', required: true },
          runbooks: { type: 'directory', required: true },
        },
      },
      tools: {
        type: 'directory',
        required: true,
        children: {
          cli: {
            type: 'directory',
            required: true,
            children: {
              'claude-cli.js': { type: 'file', required: true },
              'package.json': { type: 'file', required: true },
            },
          },
          scripts: { type: 'directory', required: true },
          validators: { type: 'directory', required: true },
          maintainers: { type: 'directory', required: true },
        },
      },
      meta: {
        type: 'directory',
        required: true,
        children: {
          schema: { type: 'directory', required: true },
          health: {
            type: 'directory',
            required: true,
            children: {
              'health-monitor.js': { type: 'file', required: true },
            },
          },
          metrics: { type: 'directory', required: true },
          backup: { type: 'directory', required: true },
        },
      },
    }
  }

  /**
   * Validate directory structure
   */
  async validateStructure(structure = this.getRequiredStructure(), basePath = this.claudeDir) {
    for (const [name, config] of Object.entries(structure)) {
      const fullPath = path.join(basePath, name)

      try {
        const stat = await fs.stat(fullPath)

        if (config.type === 'directory' && !stat.isDirectory()) {
          this.errors.push(`Expected directory but found file: ${fullPath}`)
        } else if (config.type === 'file' && !stat.isFile()) {
          this.errors.push(`Expected file but found directory: ${fullPath}`)
        }

        // Recursively validate children
        if (config.children && stat.isDirectory()) {
          await this.validateStructure(config.children, fullPath)
        }

        // Validate file content if validator exists
        if (config.type === 'file' && config.validator) {
          await this.validateFileContent(fullPath, config.validator)
        }
      } catch (error) {
        if (config.required) {
          this.errors.push(`Missing required ${config.type}: ${fullPath}`)
        } else {
          this.warnings.push(`Optional ${config.type} not found: ${fullPath}`)
        }
      }
    }
  }

  /**
   * Validate configuration files
   */
  async validateConfiguration() {
    const configPath = path.join(this.claudeDir, 'core/config/default.config.json')
    const schemaPath = path.join(this.claudeDir, 'core/config/config.schema.json')

    try {
      const config = JSON.parse(await fs.readFile(configPath, 'utf8'))
      const schema = JSON.parse(await fs.readFile(schemaPath, 'utf8'))

      // Validate required fields
      if (schema.required) {
        for (const field of schema.required) {
          if (!config[field]) {
            this.errors.push(`Missing required configuration field: ${field}`)
          }
        }
      }

      // Validate version format
      if (config.version && !config.version.match(/^\d+\.\d+\.\d+$/)) {
        this.errors.push(`Invalid version format: ${config.version}`)
      }

      // Validate environment
      if (
        config.environment &&
        !['development', 'staging', 'production', 'test'].includes(config.environment)
      ) {
        this.warnings.push(`Unexpected environment: ${config.environment}`)
      }

      this.info.push(`Configuration validated: v${config.version} (${config.environment})`)
    } catch (error) {
      this.errors.push(`Configuration validation failed: ${error.message}`)
    }
  }

  /**
   * Validate agent configurations
   */
  async validateAgents() {
    const agentsDir = path.join(this.claudeDir, 'core/agents')

    try {
      const agents = await fs.readdir(agentsDir)
      let validAgents = 0

      for (const agent of agents) {
        const agentPath = path.join(agentsDir, agent)
        const stat = await fs.stat(agentPath)

        if (stat.isDirectory()) {
          // Check for required agent files
          const configPath = path.join(agentPath, 'config.json')
          const indexPath = path.join(agentPath, 'index.js')

          try {
            await fs.access(configPath)
            await fs.access(indexPath)
            validAgents++
          } catch {
            this.warnings.push(`Incomplete agent configuration: ${agent}`)
          }
        }
      }

      this.info.push(`Found ${validAgents} valid agents`)
    } catch (error) {
      this.errors.push(`Agent validation failed: ${error.message}`)
    }
  }

  /**
   * Validate CLI tool
   */
  async validateCLI() {
    const cliPath = path.join(this.claudeDir, 'tools/cli/claude-cli.js')

    try {
      const stat = await fs.stat(cliPath)

      // Check if executable
      if (!(stat.mode & 0o100)) {
        this.warnings.push('CLI tool is not executable. Run: chmod +x tools/cli/claude-cli.js')
      }

      // Check package.json
      const packagePath = path.join(this.claudeDir, 'tools/cli/package.json')
      const packageJson = JSON.parse(await fs.readFile(packagePath, 'utf8'))

      if (!packageJson.bin || !packageJson.bin.claude) {
        this.warnings.push('CLI tool not properly configured in package.json')
      }

      this.info.push('CLI tool validated')
    } catch (error) {
      this.errors.push(`CLI validation failed: ${error.message}`)
    }
  }

  /**
   * Validate health monitoring
   */
  async validateHealthMonitoring() {
    const healthMonitorPath = path.join(this.claudeDir, 'meta/health/health-monitor.js')

    try {
      await fs.access(healthMonitorPath)

      // Check for health check results
      const resultsPath = path.join(this.claudeDir, 'meta/health/latest-results.json')

      try {
        const results = JSON.parse(await fs.readFile(resultsPath, 'utf8'))
        const age = Date.now() - new Date(results.summary?.timestamp).getTime()
        const ageInHours = age / (1000 * 60 * 60)

        if (ageInHours > 24) {
          this.warnings.push(`Health check results are ${Math.round(ageInHours)} hours old`)
        } else {
          this.info.push(`Latest health check: ${Math.round(ageInHours)} hours ago`)
        }
      } catch {
        this.warnings.push('No health check results found')
      }
    } catch (error) {
      this.errors.push(`Health monitoring validation failed: ${error.message}`)
    }
  }

  /**
   * Validate backup status
   */
  async validateBackups() {
    const backupDir = path.join(this.claudeDir, 'meta/backup')

    try {
      const backups = await fs.readdir(backupDir)

      if (backups.length === 0) {
        this.warnings.push('No backups found')
      } else {
        // Check age of latest backup
        const latestBackup = backups.sort().pop()
        const backupPath = path.join(backupDir, latestBackup)
        const stat = await fs.stat(backupPath)
        const ageInDays = (Date.now() - stat.mtime) / (1000 * 60 * 60 * 24)

        if (ageInDays > 7) {
          this.warnings.push(`Latest backup is ${Math.round(ageInDays)} days old`)
        } else {
          this.info.push(`Latest backup: ${latestBackup} (${Math.round(ageInDays)} days old)`)
        }
      }
    } catch {
      this.warnings.push('Backup directory not accessible')
    }
  }

  /**
   * Validate permissions
   */
  async validatePermissions() {
    const criticalPaths = ['core/config', 'operations/security', 'meta/backup']

    for (const relativePath of criticalPaths) {
      const fullPath = path.join(this.claudeDir, relativePath)

      try {
        const stat = await fs.stat(fullPath)
        const mode = (stat.mode & parseInt('777', 8)).toString(8)

        // Check for overly permissive directories
        if (mode === '777') {
          this.warnings.push(`Directory has overly permissive permissions (777): ${relativePath}`)
        }
      } catch {
        // Path doesn't exist, already handled in structure validation
      }
    }
  }

  /**
   * Validate documentation
   */
  async validateDocumentation() {
    const docsToCheck = [
      'README_ENTERPRISE.md',
      'knowledge/guides/user-guide.md',
      'knowledge/quick-ref/commands.md',
      'knowledge/runbooks/incident-response.md',
    ]

    let foundDocs = 0

    for (const doc of docsToCheck) {
      const docPath = path.join(this.claudeDir, doc)

      try {
        await fs.access(docPath)
        foundDocs++
      } catch {
        this.warnings.push(`Documentation not found: ${doc}`)
      }
    }

    this.info.push(`Found ${foundDocs}/${docsToCheck.length} documentation files`)
  }

  /**
   * Generate validation report
   */
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        errors: this.errors.length,
        warnings: this.warnings.length,
        info: this.info.length,
        status: this.errors.length === 0 ? 'PASS' : 'FAIL',
      },
      errors: this.errors,
      warnings: this.warnings,
      info: this.info,
      recommendations: this.generateRecommendations(),
    }

    return report
  }

  /**
   * Generate recommendations based on validation results
   */
  generateRecommendations() {
    const recommendations = []

    if (this.errors.length > 0) {
      recommendations.push({
        priority: 'CRITICAL',
        action: 'Fix all structural errors before proceeding',
        command: 'claude maintain validate && claude maintain fix',
      })
    }

    if (this.warnings.includes('No backups found')) {
      recommendations.push({
        priority: 'HIGH',
        action: 'Create an initial backup',
        command: 'claude maintain backup',
      })
    }

    if (this.warnings.some((w) => w.includes('health check results'))) {
      recommendations.push({
        priority: 'MEDIUM',
        action: 'Run health checks',
        command: 'claude health check',
      })
    }

    if (this.warnings.some((w) => w.includes('executable'))) {
      recommendations.push({
        priority: 'LOW',
        action: 'Fix CLI permissions',
        command: 'chmod +x .claude/tools/cli/claude-cli.js',
      })
    }

    return recommendations
  }

  /**
   * Format report for console output
   */
  formatConsoleReport(report) {
    const colors = {
      reset: '\x1b[0m',
      bright: '\x1b[1m',
      red: '\x1b[31m',
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      blue: '\x1b[34m',
      cyan: '\x1b[36m',
    }

    let output = '\n'
    output += colors.bright + '=== Claude Structure Validation Report ===' + colors.reset + '\n'
    output += `Generated: ${report.timestamp}\n\n`

    // Summary
    const statusColor = report.summary.status === 'PASS' ? colors.green : colors.red
    output += colors.cyan + 'Summary:' + colors.reset + '\n'
    output += `  Status: ${statusColor}${report.summary.status}${colors.reset}\n`
    output += `  Errors: ${report.summary.errors}\n`
    output += `  Warnings: ${report.summary.warnings}\n`
    output += `  Info: ${report.summary.info}\n\n`

    // Errors
    if (report.errors.length > 0) {
      output += colors.red + 'Errors:' + colors.reset + '\n'
      report.errors.forEach((error) => {
        output += `  ✗ ${error}\n`
      })
      output += '\n'
    }

    // Warnings
    if (report.warnings.length > 0) {
      output += colors.yellow + 'Warnings:' + colors.reset + '\n'
      report.warnings.forEach((warning) => {
        output += `  ⚠ ${warning}\n`
      })
      output += '\n'
    }

    // Info
    if (report.info.length > 0) {
      output += colors.blue + 'Information:' + colors.reset + '\n'
      report.info.forEach((info) => {
        output += `  ℹ ${info}\n`
      })
      output += '\n'
    }

    // Recommendations
    if (report.recommendations.length > 0) {
      output += colors.cyan + 'Recommendations:' + colors.reset + '\n'
      report.recommendations.forEach((rec) => {
        const priorityColor =
          rec.priority === 'CRITICAL'
            ? colors.red
            : rec.priority === 'HIGH'
              ? colors.yellow
              : colors.blue

        output += `  ${priorityColor}[${rec.priority}]${colors.reset} ${rec.action}\n`
        if (rec.command) {
          output += `    Command: ${colors.bright}${rec.command}${colors.reset}\n`
        }
      })
      output += '\n'
    }

    return output
  }

  /**
   * Run complete validation
   */
  async validate() {
    console.log('Starting Claude structure validation...\n')

    // Run all validations
    await this.validateStructure()
    await this.validateConfiguration()
    await this.validateAgents()
    await this.validateCLI()
    await this.validateHealthMonitoring()
    await this.validateBackups()
    await this.validatePermissions()
    await this.validateDocumentation()

    // Generate and display report
    const report = this.generateReport()
    console.log(this.formatConsoleReport(report))

    // Save report
    const reportPath = path.join(this.claudeDir, 'meta/validation-report.json')
    await fs.mkdir(path.dirname(reportPath), { recursive: true })
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2))
    console.log(`Full report saved to: ${reportPath}\n`)

    // Exit with appropriate code
    process.exit(report.summary.status === 'PASS' ? 0 : 1)
  }

  /**
   * Auto-fix common issues
   */
  async autoFix() {
    console.log('Attempting to auto-fix issues...\n')

    // Create missing directories
    const structure = this.getRequiredStructure()
    await this.createMissingDirectories(structure, this.claudeDir)

    // Fix permissions
    await this.fixPermissions()

    // Create default files
    await this.createDefaultFiles()

    console.log('Auto-fix complete. Please run validation again.\n')
  }

  /**
   * Create missing directories
   */
  async createMissingDirectories(structure, basePath) {
    for (const [name, config] of Object.entries(structure)) {
      const fullPath = path.join(basePath, name)

      if (config.type === 'directory') {
        await fs.mkdir(fullPath, { recursive: true }).catch(() => {})

        if (config.children) {
          await this.createMissingDirectories(config.children, fullPath)
        }
      }
    }
  }

  /**
   * Fix file permissions
   */
  async fixPermissions() {
    const cliPath = path.join(this.claudeDir, 'tools/cli/claude-cli.js')

    try {
      await fs.chmod(cliPath, 0o755)
      console.log('Fixed CLI permissions')
    } catch {
      // File might not exist
    }
  }

  /**
   * Create default files if missing
   */
  async createDefaultFiles() {
    // Create default README if missing
    const readmePath = path.join(this.claudeDir, 'README_ENTERPRISE.md')

    try {
      await fs.access(readmePath)
    } catch {
      await fs.writeFile(
        readmePath,
        '# Claude Enterprise DevOps Platform\n\nPlease run validation to generate full documentation.\n'
      )
      console.log('Created default README')
    }
  }
}

// Export for use in other tools
module.exports = StructureValidator

// Run if called directly
if (require.main === module) {
  const validator = new StructureValidator()

  const command = process.argv[2]

  if (command === 'fix') {
    validator.autoFix().catch(console.error)
  } else {
    validator.validate().catch(console.error)
  }
}
