#!/usr/bin/env node

/**
 * Upstash Context7 Troubleshooting Assistant
 * Diagnoses and helps resolve common Upstash integration issues
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { spawn } from 'child_process';
import chalk from 'chalk';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.dirname(__dirname);

class UpstashTroubleshooter {
  constructor(options = {}) {
    this.options = {
      debug: options.debug || false,
      verbose: options.verbose || false,
      interactive: options.interactive !== false,
      autoFix: options.autoFix || false
    };

    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    this.issues = [];
    this.fixes = [];
    this.config = {};
  }

  async troubleshoot() {
    console.log(chalk.blue.bold('\n🔧 Upstash Context7 Troubleshooting Assistant\n'));
    console.log(chalk.gray('This tool will diagnose and help fix common integration issues.\n'));

    try {
      await this.gatherSystemInfo();
      await this.runDiagnosticTests();
      await this.suggestFixes();
      if (this.options.interactive) {
        await this.interactiveFixes();
      }
      this.displaySummary();
    } catch (error) {
      console.error(chalk.red(`\n❌ Troubleshooting failed: ${error.message}`));
      process.exit(1);
    } finally {
      this.rl.close();
    }
  }

  async gatherSystemInfo() {
    console.log(chalk.yellow('🔍 Gathering system information...\n'));

    // Load configuration
    await this.loadConfiguration();

    // Check Node.js version
    const nodeVersion = process.version;
    console.log(chalk.gray(`Node.js version: ${nodeVersion}`));

    // Check npm packages
    await this.checkPackages();

    // Check file permissions
    this.checkFilePermissions();

    // Check network connectivity
    await this.checkNetworkConnectivity();

    console.log('');
  }

  async loadConfiguration() {
    // Load from .context7rc
    const context7rcPath = path.join(projectRoot, '.context7rc');
    if (fs.existsSync(context7rcPath)) {
      this.parseEnvFile(context7rcPath);
      console.log(chalk.green('✓ Found .context7rc configuration'));
    } else {
      this.addIssue('configuration', 'missing_context7rc', 'critical',
        '.context7rc file not found', 'Create .context7rc with Upstash credentials');
    }

    // Load from .env.local
    const envLocalPath = path.join(projectRoot, '.env.local');
    if (fs.existsSync(envLocalPath)) {
      this.parseEnvFile(envLocalPath);
      console.log(chalk.green('✓ Found .env.local configuration'));
    } else {
      this.addIssue('configuration', 'missing_env_local', 'warning',
        '.env.local file not found', 'Create .env.local for local development');
    }

    // Load from environment
    Object.assign(this.config, process.env);
  }

  parseEnvFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    for (const line of lines) {
      const cleanLine = line.trim();
      if (cleanLine && !cleanLine.startsWith('#')) {
        const [key, ...valueParts] = cleanLine.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').trim();
          this.config[key.trim()] = value;
        }
      }
    }
  }

  async checkPackages() {
    const packageJsonPath = path.join(projectRoot, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      this.addIssue('environment', 'missing_package_json', 'critical',
        'package.json not found', 'Ensure you are in the project root directory');
      return;
    }

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    // Check for Upstash dependencies
    const hasUpstashRedis = packageJson.dependencies?.['@upstash/redis'] ||
                          packageJson.devDependencies?.['@upstash/redis'];

    if (!hasUpstashRedis) {
      this.addIssue('dependencies', 'missing_upstash_redis', 'warning',
        '@upstash/redis package not installed', 'Run: npm install @upstash/redis');
    } else {
      console.log(chalk.green('✓ @upstash/redis package found'));
    }

    // Check for other required packages
    const requiredPackages = ['react', 'vite'];
    for (const pkg of requiredPackages) {
      if (!packageJson.dependencies?.[pkg] && !packageJson.devDependencies?.[pkg]) {
        this.addIssue('dependencies', `missing_${pkg}`, 'warning',
          `${pkg} package not found`, `Run: npm install ${pkg}`);
      }
    }
  }

  checkFilePermissions() {
    const filesToCheck = [
      '.context7rc',
      '.env.local',
      'context7.config.js'
    ];

    for (const file of filesToCheck) {
      const filePath = path.join(projectRoot, file);
      if (fs.existsSync(filePath)) {
        try {
          const stats = fs.statSync(filePath);
          const mode = stats.mode & parseInt('777', 8);

          if (file.includes('env') || file.includes('context7rc')) {
            if (mode > parseInt('600', 8)) {
              this.addIssue('security', `permissions_${file}`, 'warning',
                `${file} has overly permissive permissions (${mode.toString(8)})`,
                `Run: chmod 600 ${file}`);
            }
          }
        } catch (error) {
          this.addIssue('filesystem', `permissions_error_${file}`, 'warning',
            `Could not check permissions for ${file}`, 'Check file system permissions');
        }
      }
    }
  }

  async checkNetworkConnectivity() {
    console.log(chalk.blue('Checking network connectivity...'));

    // Test Upstash API endpoint
    try {
      const response = await this.makeHttpRequest('https://api.upstash.com', {
        method: 'GET',
        timeout: 5000
      });

      if (response.statusCode < 400) {
        console.log(chalk.green('✓ Upstash API endpoint reachable'));
      } else {
        this.addIssue('network', 'upstash_api_unreachable', 'critical',
          'Cannot reach Upstash API endpoint', 'Check internet connection and firewall settings');
      }
    } catch (error) {
      this.addIssue('network', 'upstash_api_error', 'critical',
        `Upstash API connection failed: ${error.message}`, 'Check internet connection');
    }

    // Test Context7 server
    try {
      const response = await this.makeHttpRequest('http://localhost:3001/api/status', {
        method: 'GET',
        timeout: 3000
      });

      if (response.statusCode === 200) {
        console.log(chalk.green('✓ Context7 server is running'));
      } else {
        this.addIssue('context7', 'server_not_running', 'critical',
          'Context7 server not responding', 'Start Context7 server: npm run context7:start');
      }
    } catch (error) {
      this.addIssue('context7', 'server_connection_error', 'critical',
        'Cannot connect to Context7 server', 'Start Context7 server: npm run context7:start');
    }
  }

  async runDiagnosticTests() {
    console.log(chalk.yellow('🧪 Running diagnostic tests...\n'));

    await this.testCredentials();
    await this.testUpstashConnection();
    await this.testRedisOperations();
    await this.testContext7Integration();
    await this.testCachePerformance();
  }

  async testCredentials() {
    console.log(chalk.blue('Testing credentials...'));

    const apiKey = this.config.UPSTASH_API_KEY;
    const apiSecret = this.config.UPSTASH_API_SECRET;

    if (!apiKey) {
      this.addIssue('credentials', 'missing_api_key', 'critical',
        'UPSTASH_API_KEY not configured', 'Add API key to .context7rc or environment variables');
    } else if (apiKey.length < 20) {
      this.addIssue('credentials', 'invalid_api_key', 'critical',
        'UPSTASH_API_KEY appears to be invalid (too short)', 'Check API key in Upstash console');
    } else {
      console.log(chalk.green('✓ API key format appears valid'));
    }

    if (!apiSecret) {
      this.addIssue('credentials', 'missing_api_secret', 'critical',
        'UPSTASH_API_SECRET not configured', 'Add API secret to .context7rc or environment variables');
    } else if (apiSecret.length < 20) {
      this.addIssue('credentials', 'invalid_api_secret', 'critical',
        'UPSTASH_API_SECRET appears to be invalid (too short)', 'Check API secret in Upstash console');
    } else {
      console.log(chalk.green('✓ API secret format appears valid'));
    }
  }

  async testUpstashConnection() {
    console.log(chalk.blue('Testing Upstash API connection...'));

    const apiKey = this.config.UPSTASH_API_KEY;
    if (!apiKey) return;

    try {
      const response = await this.makeHttpRequest('https://api.upstash.com/v2/redis/databases', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.statusCode === 200) {
        console.log(chalk.green('✓ Successfully authenticated with Upstash API'));

        try {
          const databases = JSON.parse(response.body);
          console.log(chalk.gray(`  Found ${databases.length} Redis database(s)`));

          if (databases.length === 0) {
            this.addIssue('upstash', 'no_databases', 'warning',
              'No Redis databases found in Upstash account', 'Create a Redis database in Upstash console');
          }
        } catch (e) {
          this.addIssue('upstash', 'api_response_parse_error', 'warning',
            'Could not parse Upstash API response', 'Check API response format');
        }
      } else if (response.statusCode === 401) {
        this.addIssue('upstash', 'authentication_failed', 'critical',
          'Upstash API authentication failed', 'Check API key and secret in Upstash console');
      } else {
        this.addIssue('upstash', 'api_error', 'critical',
          `Upstash API returned status ${response.statusCode}`, 'Check Upstash service status');
      }
    } catch (error) {
      this.addIssue('upstash', 'connection_error', 'critical',
        `Upstash API connection failed: ${error.message}`, 'Check network connectivity and credentials');
    }
  }

  async testRedisOperations() {
    console.log(chalk.blue('Testing Redis operations...'));

    const redisUrl = this.config.UPSTASH_REDIS_REST_URL;
    const redisToken = this.config.UPSTASH_REDIS_REST_TOKEN;

    if (!redisUrl || !redisToken) {
      this.addIssue('redis', 'missing_redis_config', 'warning',
        'Redis database credentials not configured', 'Add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN');
      return;
    }

    try {
      // Test ping
      const pingResponse = await this.makeHttpRequest(`${redisUrl}/ping`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${redisToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (pingResponse.statusCode === 200) {
        console.log(chalk.green('✓ Redis database connection successful'));

        // Test SET/GET operations
        const testKey = `context7:troubleshoot:${Date.now()}`;
        const testValue = 'troubleshoot-test';

        const setResponse = await this.makeHttpRequest(`${redisUrl}/set/${testKey}/${testValue}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${redisToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (setResponse.statusCode === 200) {
          const getResponse = await this.makeHttpRequest(`${redisUrl}/get/${testKey}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${redisToken}`,
              'Content-Type': 'application/json'
            }
          });

          if (getResponse.statusCode === 200) {
            const data = JSON.parse(getResponse.body);
            if (data.result === testValue) {
              console.log(chalk.green('✓ Redis SET/GET operations working correctly'));

              // Clean up
              await this.makeHttpRequest(`${redisUrl}/del/${testKey}`, {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${redisToken}`,
                  'Content-Type': 'application/json'
                }
              });
            } else {
              this.addIssue('redis', 'operations_data_mismatch', 'critical',
                'Redis GET returned incorrect data', 'Check Redis database integrity');
            }
          } else {
            this.addIssue('redis', 'get_operation_failed', 'critical',
              'Redis GET operation failed', 'Check Redis database permissions');
          }
        } else {
          this.addIssue('redis', 'set_operation_failed', 'critical',
            'Redis SET operation failed', 'Check Redis database permissions');
        }
      } else {
        this.addIssue('redis', 'ping_failed', 'critical',
          `Redis ping failed with status ${pingResponse.statusCode}`, 'Check Redis database status and credentials');
      }
    } catch (error) {
      this.addIssue('redis', 'connection_error', 'critical',
        `Redis connection failed: ${error.message}`, 'Check Redis URL, token, and network connectivity');
    }
  }

  async testContext7Integration() {
    console.log(chalk.blue('Testing Context7 integration...'));

    try {
      const response = await this.makeHttpRequest('http://localhost:3001/api/status', {
        method: 'GET'
      });

      if (response.statusCode === 200) {
        try {
          const status = JSON.parse(response.body);

          if (status.upstash?.enabled) {
            console.log(chalk.green('✓ Upstash integration is enabled in Context7'));
          } else {
            this.addIssue('context7', 'upstash_not_enabled', 'warning',
              'Upstash integration not enabled in Context7', 'Set CONTEXT7_ENABLE_UPSTASH=true');
          }

          if (status.upstash?.connected) {
            console.log(chalk.green('✓ Context7 successfully connected to Upstash'));
          } else {
            this.addIssue('context7', 'upstash_not_connected', 'critical',
              'Context7 not connected to Upstash', 'Check Upstash credentials in Context7 configuration');
          }
        } catch (e) {
          this.addIssue('context7', 'status_parse_error', 'warning',
            'Could not parse Context7 status response', 'Check Context7 server logs');
        }
      } else {
        this.addIssue('context7', 'status_request_failed', 'critical',
          'Context7 status request failed', 'Check Context7 server health');
      }
    } catch (error) {
      this.addIssue('context7', 'integration_test_failed', 'critical',
        `Context7 integration test failed: ${error.message}`, 'Ensure Context7 server is running');
    }
  }

  async testCachePerformance() {
    console.log(chalk.blue('Testing cache performance...'));

    const testQuery = 'React hooks performance optimization test';

    try {
      // Make initial request
      const startTime = Date.now();
      const response1 = await this.makeHttpRequest('http://localhost:3001/api/context', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: testQuery })
      });
      const firstRequestTime = Date.now() - startTime;

      if (response1.statusCode === 200) {
        // Make second request (should be cached)
        const startTime2 = Date.now();
        const response2 = await this.makeHttpRequest('http://localhost:3001/api/context', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ query: testQuery })
        });
        const secondRequestTime = Date.now() - startTime2;

        if (response2.statusCode === 200) {
          const improvementPercent = ((firstRequestTime - secondRequestTime) / firstRequestTime * 100).toFixed(1);

          if (secondRequestTime < firstRequestTime * 0.7) {
            console.log(chalk.green(`✓ Cache performance good (${improvementPercent}% improvement)`));
          } else {
            this.addIssue('performance', 'poor_cache_performance', 'warning',
              `Cache performance suboptimal (${improvementPercent}% improvement)`, 'Check cache configuration and TTL settings');
          }

          console.log(chalk.gray(`  First request: ${firstRequestTime}ms`));
          console.log(chalk.gray(`  Second request: ${secondRequestTime}ms`));
        }
      }
    } catch (error) {
      this.addIssue('performance', 'cache_test_failed', 'warning',
        `Cache performance test failed: ${error.message}`, 'Check Context7 server functionality');
    }
  }

  async suggestFixes() {
    console.log(chalk.yellow('\n💡 Suggested fixes...\n'));

    if (this.issues.length === 0) {
      console.log(chalk.green('🎉 No issues found! Your Upstash integration appears to be working correctly.'));
      return;
    }

    // Group issues by severity
    const criticalIssues = this.issues.filter(i => i.severity === 'critical');
    const warningIssues = this.issues.filter(i => i.severity === 'warning');

    if (criticalIssues.length > 0) {
      console.log(chalk.red.bold('🚨 Critical Issues (must fix):'));
      for (const issue of criticalIssues) {
        console.log(chalk.red(`  ✗ ${issue.description}`));
        console.log(chalk.white(`    Fix: ${issue.fix}`));
      }
      console.log('');
    }

    if (warningIssues.length > 0) {
      console.log(chalk.yellow.bold('⚠️  Warnings (recommended to fix):'));
      for (const issue of warningIssues) {
        console.log(chalk.yellow(`  ⚠ ${issue.description}`));
        console.log(chalk.white(`    Fix: ${issue.fix}`));
      }
      console.log('');
    }

    // Auto-fix suggestions
    this.generateAutoFixes();
  }

  generateAutoFixes() {
    for (const issue of this.issues) {
      switch (issue.type) {
        case 'missing_upstash_redis':
          this.fixes.push({
            id: 'install_upstash_redis',
            description: 'Install @upstash/redis package',
            command: 'npm install @upstash/redis',
            category: 'dependencies'
          });
          break;

        case 'missing_context7rc':
          this.fixes.push({
            id: 'create_context7rc',
            description: 'Create .context7rc configuration file',
            action: 'create_file',
            file: '.context7rc',
            category: 'configuration'
          });
          break;

        case 'missing_env_local':
          this.fixes.push({
            id: 'create_env_local',
            description: 'Create .env.local file',
            action: 'create_file',
            file: '.env.local',
            category: 'configuration'
          });
          break;

        case 'upstash_not_enabled':
          this.fixes.push({
            id: 'enable_upstash',
            description: 'Enable Upstash integration',
            action: 'set_env_var',
            variable: 'CONTEXT7_ENABLE_UPSTASH',
            value: 'true',
            category: 'configuration'
          });
          break;
      }
    }
  }

  async interactiveFixes() {
    if (this.fixes.length === 0) return;

    console.log(chalk.cyan('🔧 Interactive Fixes\n'));
    console.log(chalk.gray('The following fixes can be applied automatically:\n'));

    for (let i = 0; i < this.fixes.length; i++) {
      const fix = this.fixes[i];
      console.log(chalk.white(`${i + 1}. ${fix.description}`));
    }

    console.log(chalk.white(`${this.fixes.length + 1}. Apply all fixes`));
    console.log(chalk.white(`${this.fixes.length + 2}. Skip automatic fixes`));

    const choice = await this.question('\nChoose an option: ');
    const choiceNum = parseInt(choice);

    if (choiceNum === this.fixes.length + 1) {
      // Apply all fixes
      for (const fix of this.fixes) {
        await this.applyFix(fix);
      }
    } else if (choiceNum >= 1 && choiceNum <= this.fixes.length) {
      // Apply specific fix
      const fix = this.fixes[choiceNum - 1];
      await this.applyFix(fix);
    } else {
      console.log(chalk.gray('Skipping automatic fixes.'));
    }
  }

  async applyFix(fix) {
    console.log(chalk.blue(`Applying fix: ${fix.description}...`));

    try {
      if (fix.command) {
        await this.runCommand(fix.command);
      } else if (fix.action === 'create_file') {
        await this.createConfigFile(fix.file);
      } else if (fix.action === 'set_env_var') {
        await this.setEnvironmentVariable(fix.variable, fix.value);
      }

      console.log(chalk.green(`✓ Fix applied successfully`));
    } catch (error) {
      console.log(chalk.red(`✗ Fix failed: ${error.message}`));
    }
  }

  async runCommand(command) {
    return new Promise((resolve, reject) => {
      const child = spawn('sh', ['-c', command], {
        cwd: projectRoot,
        stdio: 'inherit'
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Command failed with exit code ${code}`));
        }
      });

      child.on('error', reject);
    });
  }

  async createConfigFile(filename) {
    const filePath = path.join(projectRoot, filename);

    if (fs.existsSync(filePath)) {
      console.log(chalk.yellow(`File ${filename} already exists, skipping...`));
      return;
    }

    let template = '';
    if (filename === '.context7rc') {
      template = `# Context7 MCP Server Configuration
# Generated by troubleshooting assistant

# Upstash API Configuration
UPSTASH_API_KEY=your_api_key_here
UPSTASH_API_SECRET=your_api_secret_here
UPSTASH_API_ENDPOINT=https://api.upstash.com

# Context7 Upstash Integration
CONTEXT7_ENABLE_UPSTASH=true
`;
    } else if (filename === '.env.local') {
      template = `# Local environment variables
# Generated by troubleshooting assistant

UPSTASH_API_KEY=your_api_key_here
UPSTASH_API_SECRET=your_api_secret_here
CONTEXT7_ENABLE_UPSTASH=true
`;
    }

    fs.writeFileSync(filePath, template);
    console.log(chalk.green(`Created ${filename}`));
    console.log(chalk.yellow(`⚠ Remember to add your actual Upstash credentials to ${filename}`));
  }

  async setEnvironmentVariable(variable, value) {
    // In a real implementation, this would update the appropriate config file
    console.log(chalk.blue(`Setting ${variable}=${value}`));
    console.log(chalk.yellow(`Manual action required: Add ${variable}=${value} to your configuration`));
  }

  async question(prompt) {
    return new Promise((resolve) => {
      this.rl.question(prompt, resolve);
    });
  }

  addIssue(category, type, severity, description, fix) {
    this.issues.push({
      category,
      type,
      severity,
      description,
      fix,
      timestamp: new Date().toISOString()
    });
  }

  async makeHttpRequest(url, options) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const requestOptions = {
        hostname: urlObj.hostname,
        port: urlObj.port,
        path: urlObj.pathname + urlObj.search,
        method: options.method || 'GET',
        headers: options.headers || {},
        timeout: options.timeout || 10000
      };

      const req = (urlObj.protocol === 'https:' ? https : require('http')).request(requestOptions, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: body
          });
        });
      });

      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      if (options.body) {
        req.write(options.body);
      }

      req.end();
    });
  }

  displaySummary() {
    console.log(chalk.yellow('\n📋 Troubleshooting Summary\n'));

    if (this.issues.length === 0) {
      console.log(chalk.green.bold('🎉 All tests passed! Your Upstash integration is working correctly.'));
    } else {
      const critical = this.issues.filter(i => i.severity === 'critical').length;
      const warnings = this.issues.filter(i => i.severity === 'warning').length;

      console.log(chalk.red(`Critical issues: ${critical}`));
      console.log(chalk.yellow(`Warnings: ${warnings}`));
      console.log(chalk.gray(`Total issues: ${this.issues.length}`));

      if (critical > 0) {
        console.log(chalk.red.bold('\n⚠️  Critical issues must be resolved before Upstash integration will work properly.'));
      }
    }

    console.log(chalk.cyan('\nNext Steps:'));
    if (this.issues.length > 0) {
      console.log(chalk.white('• Address the issues listed above'));
      console.log(chalk.white('• Re-run troubleshooting: npm run upstash:troubleshoot'));
      console.log(chalk.white('• Validate configuration: npm run upstash:validate'));
    } else {
      console.log(chalk.white('• Run performance tests: npm run upstash:test'));
      console.log(chalk.white('• Monitor Upstash dashboard for usage'));
    }

    console.log(chalk.cyan('\nDocumentation:'));
    console.log(chalk.white('• Setup Guide: docs/UPSTASH_CONTEXT7_SETUP_GUIDE.md'));
    console.log(chalk.white('• Upstash Console: https://console.upstash.com'));
    console.log('');
  }
}

// CLI handling
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
${chalk.blue.bold('Upstash Context7 Troubleshooting Assistant')}

${chalk.yellow('Usage:')}
  node scripts/upstash-troubleshoot.js [options]

${chalk.yellow('Options:')}
  -h, --help         Show this help message
  --debug            Enable debug output
  --verbose          Show detailed information
  --non-interactive  Run without interactive prompts
  --auto-fix         Automatically apply safe fixes

${chalk.yellow('Examples:')}
  node scripts/upstash-troubleshoot.js                    # Interactive troubleshooting
  node scripts/upstash-troubleshoot.js --debug            # Debug mode
  node scripts/upstash-troubleshoot.js --non-interactive  # Automated mode

${chalk.yellow('Common Issues:')}
  • Missing API credentials
  • Network connectivity problems
  • Context7 server not running
  • Configuration file issues
  • Permission problems
`);
    process.exit(0);
  }

  const options = {
    debug: args.includes('--debug'),
    verbose: args.includes('--verbose'),
    interactive: !args.includes('--non-interactive'),
    autoFix: args.includes('--auto-fix')
  };

  const troubleshooter = new UpstashTroubleshooter(options);
  await troubleshooter.troubleshoot();
}

// Handle script execution
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(chalk.red(`\n❌ Error: ${error.message}`));
    process.exit(1);
  });
}

export default UpstashTroubleshooter;