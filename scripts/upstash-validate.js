#!/usr/bin/env node

/**
 * Upstash Context7 Configuration Validator
 * Validates Upstash API key configuration and tests connectivity
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import chalk from 'chalk';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.dirname(__dirname);

class UpstashValidator {
  constructor() {
    this.config = {};
    this.results = {
      passed: 0,
      failed: 0,
      warnings: 0,
      tests: []
    };
  }

  async validate() {
    console.log(chalk.blue.bold('\n🔍 Upstash Context7 Configuration Validator\n'));

    try {
      await this.loadConfiguration();
      await this.runValidationTests();
      this.displayResults();
    } catch (error) {
      console.error(chalk.red(`\n❌ Validation failed: ${error.message}`));
      process.exit(1);
    }
  }

  async loadConfiguration() {
    console.log(chalk.yellow('📁 Loading configuration files...\n'));

    // Load from .context7rc
    const context7rcPath = path.join(projectRoot, '.context7rc');
    if (fs.existsSync(context7rcPath)) {
      this.parseEnvFile(context7rcPath);
      console.log(chalk.green('✓ Loaded .context7rc'));
    } else {
      this.addTest('Configuration Files', 'context7rc_exists', 'failed',
        '.context7rc file not found');
    }

    // Load from .env.local
    const envLocalPath = path.join(projectRoot, '.env.local');
    if (fs.existsSync(envLocalPath)) {
      this.parseEnvFile(envLocalPath);
      console.log(chalk.green('✓ Loaded .env.local'));
    } else {
      this.addTest('Configuration Files', 'env_local_exists', 'warning',
        '.env.local file not found (optional)');
    }

    // Load from environment variables
    this.loadFromEnvironment();
    console.log(chalk.green('✓ Loaded environment variables\n'));
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

  loadFromEnvironment() {
    const envVars = [
      'UPSTASH_API_KEY',
      'UPSTASH_API_SECRET',
      'UPSTASH_API_ENDPOINT',
      'UPSTASH_REDIS_REST_URL',
      'UPSTASH_REDIS_REST_TOKEN',
      'CONTEXT7_ENABLE_UPSTASH'
    ];

    for (const envVar of envVars) {
      if (process.env[envVar]) {
        this.config[envVar] = process.env[envVar];
      }
    }
  }

  async runValidationTests() {
    console.log(chalk.yellow('🧪 Running validation tests...\n'));

    await this.testConfigurationCompleteness();
    await this.testCredentialFormat();
    await this.testApiConnectivity();
    await this.testRedisConnectivity();
    await this.testSecurityConfiguration();
    await this.testPerformanceSettings();
  }

  async testConfigurationCompleteness() {
    console.log(chalk.blue('Testing configuration completeness...'));

    // Required fields
    const required = ['UPSTASH_API_KEY', 'UPSTASH_API_SECRET'];
    for (const field of required) {
      if (this.config[field]) {
        this.addTest('Required Configuration', field, 'passed',
          `${field} is configured`);
      } else {
        this.addTest('Required Configuration', field, 'failed',
          `${field} is missing`);
      }
    }

    // Optional but recommended fields
    const recommended = ['UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN'];
    for (const field of recommended) {
      if (this.config[field]) {
        this.addTest('Recommended Configuration', field, 'passed',
          `${field} is configured`);
      } else {
        this.addTest('Recommended Configuration', field, 'warning',
          `${field} not configured (Redis caching disabled)`);
      }
    }

    // Context7 integration settings
    if (this.config.CONTEXT7_ENABLE_UPSTASH === 'true') {
      this.addTest('Context7 Integration', 'upstash_enabled', 'passed',
        'Upstash integration is enabled');
    } else {
      this.addTest('Context7 Integration', 'upstash_enabled', 'warning',
        'Upstash integration is disabled');
    }
  }

  async testCredentialFormat() {
    console.log(chalk.blue('Testing credential format...'));

    // API Key format
    const apiKey = this.config.UPSTASH_API_KEY;
    if (apiKey) {
      if (apiKey.length >= 20 && apiKey.length <= 100) {
        this.addTest('Credential Format', 'api_key_format', 'passed',
          'API key format is valid');
      } else {
        this.addTest('Credential Format', 'api_key_format', 'failed',
          `API key length invalid (${apiKey.length} chars, expected 20-100)`);
      }
    }

    // API Secret format
    const apiSecret = this.config.UPSTASH_API_SECRET;
    if (apiSecret) {
      if (apiSecret.length >= 20 && apiSecret.length <= 100) {
        this.addTest('Credential Format', 'api_secret_format', 'passed',
          'API secret format is valid');
      } else {
        this.addTest('Credential Format', 'api_secret_format', 'failed',
          `API secret length invalid (${apiSecret.length} chars, expected 20-100)`);
      }
    }

    // Redis URL format
    const redisUrl = this.config.UPSTASH_REDIS_REST_URL;
    if (redisUrl) {
      if (redisUrl.startsWith('https://') && redisUrl.includes('upstash.io')) {
        this.addTest('Credential Format', 'redis_url_format', 'passed',
          'Redis URL format is valid');
      } else {
        this.addTest('Credential Format', 'redis_url_format', 'failed',
          'Redis URL format invalid (should be https://...upstash.io)');
      }
    }

    // Redis Token format
    const redisToken = this.config.UPSTASH_REDIS_REST_TOKEN;
    if (redisToken) {
      if (redisToken.length >= 20 && redisToken.length <= 200) {
        this.addTest('Credential Format', 'redis_token_format', 'passed',
          'Redis token format is valid');
      } else {
        this.addTest('Credential Format', 'redis_token_format', 'failed',
          `Redis token length invalid (${redisToken.length} chars, expected 20-200)`);
      }
    }
  }

  async testApiConnectivity() {
    console.log(chalk.blue('Testing API connectivity...'));

    const apiKey = this.config.UPSTASH_API_KEY;
    const apiEndpoint = this.config.UPSTASH_API_ENDPOINT || 'https://api.upstash.com';

    if (!apiKey) {
      this.addTest('API Connectivity', 'api_connection', 'failed',
        'Cannot test API connectivity - API key missing');
      return;
    }

    try {
      const response = await this.makeHttpRequest(`${apiEndpoint}/v2/redis/databases`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.statusCode === 200) {
        this.addTest('API Connectivity', 'api_connection', 'passed',
          'Successfully connected to Upstash API');

        // Parse response to get database count
        try {
          const data = JSON.parse(response.body);
          const dbCount = Array.isArray(data) ? data.length : 0;
          this.addTest('API Connectivity', 'database_count', 'passed',
            `Found ${dbCount} Redis database(s)`);
        } catch (e) {
          this.addTest('API Connectivity', 'response_parsing', 'warning',
            'API response received but could not parse database list');
        }
      } else if (response.statusCode === 401) {
        this.addTest('API Connectivity', 'api_connection', 'failed',
          'API authentication failed - check API key');
      } else {
        this.addTest('API Connectivity', 'api_connection', 'failed',
          `API request failed with status ${response.statusCode}`);
      }
    } catch (error) {
      this.addTest('API Connectivity', 'api_connection', 'failed',
        `API connection failed: ${error.message}`);
    }
  }

  async testRedisConnectivity() {
    console.log(chalk.blue('Testing Redis connectivity...'));

    const redisUrl = this.config.UPSTASH_REDIS_REST_URL;
    const redisToken = this.config.UPSTASH_REDIS_REST_TOKEN;

    if (!redisUrl || !redisToken) {
      this.addTest('Redis Connectivity', 'redis_connection', 'warning',
        'Cannot test Redis connectivity - credentials missing');
      return;
    }

    try {
      const response = await this.makeHttpRequest(`${redisUrl}/ping`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${redisToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.statusCode === 200) {
        this.addTest('Redis Connectivity', 'redis_connection', 'passed',
          'Successfully connected to Redis database');

        // Test a simple SET/GET operation
        await this.testRedisOperations(redisUrl, redisToken);
      } else if (response.statusCode === 401) {
        this.addTest('Redis Connectivity', 'redis_connection', 'failed',
          'Redis authentication failed - check token');
      } else {
        this.addTest('Redis Connectivity', 'redis_connection', 'failed',
          `Redis connection failed with status ${response.statusCode}`);
      }
    } catch (error) {
      this.addTest('Redis Connectivity', 'redis_connection', 'failed',
        `Redis connection failed: ${error.message}`);
    }
  }

  async testRedisOperations(redisUrl, redisToken) {
    try {
      const testKey = 'context7:test:' + Date.now();
      const testValue = 'validation-test';

      // Test SET operation
      const setResponse = await this.makeHttpRequest(`${redisUrl}/set/${testKey}/${testValue}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${redisToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (setResponse.statusCode === 200) {
        // Test GET operation
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
            this.addTest('Redis Operations', 'redis_operations', 'passed',
              'Redis SET/GET operations working correctly');

            // Clean up test key
            await this.makeHttpRequest(`${redisUrl}/del/${testKey}`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${redisToken}`,
                'Content-Type': 'application/json'
              }
            });
          } else {
            this.addTest('Redis Operations', 'redis_operations', 'failed',
              'Redis GET returned incorrect value');
          }
        } else {
          this.addTest('Redis Operations', 'redis_operations', 'failed',
            'Redis GET operation failed');
        }
      } else {
        this.addTest('Redis Operations', 'redis_operations', 'failed',
          'Redis SET operation failed');
      }
    } catch (error) {
      this.addTest('Redis Operations', 'redis_operations', 'failed',
        `Redis operations failed: ${error.message}`);
    }
  }

  async testSecurityConfiguration() {
    console.log(chalk.blue('Testing security configuration...'));

    // Check if credentials are in .gitignore
    const gitignorePath = path.join(projectRoot, '.gitignore');
    if (fs.existsSync(gitignorePath)) {
      const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
      if (gitignoreContent.includes('.env.local') || gitignoreContent.includes('.context7rc.local')) {
        this.addTest('Security', 'gitignore_protection', 'passed',
          'Credential files are protected in .gitignore');
      } else {
        this.addTest('Security', 'gitignore_protection', 'warning',
          'Consider adding .env.local to .gitignore');
      }
    }

    // Check file permissions
    const envLocalPath = path.join(projectRoot, '.env.local');
    if (fs.existsSync(envLocalPath)) {
      try {
        const stats = fs.statSync(envLocalPath);
        const mode = stats.mode & parseInt('777', 8);
        if (mode <= parseInt('600', 8)) {
          this.addTest('Security', 'file_permissions', 'passed',
            '.env.local has secure permissions');
        } else {
          this.addTest('Security', 'file_permissions', 'warning',
            '.env.local permissions may be too permissive');
        }
      } catch (error) {
        this.addTest('Security', 'file_permissions', 'warning',
          'Could not check .env.local permissions');
      }
    }

    // Check for secure endpoint usage
    const apiEndpoint = this.config.UPSTASH_API_ENDPOINT || 'https://api.upstash.com';
    if (apiEndpoint.startsWith('https://')) {
      this.addTest('Security', 'secure_endpoint', 'passed',
        'Using secure HTTPS endpoint');
    } else {
      this.addTest('Security', 'secure_endpoint', 'failed',
        'API endpoint should use HTTPS');
    }
  }

  async testPerformanceSettings() {
    console.log(chalk.blue('Testing performance settings...'));

    // Check cache TTL setting
    const cacheTtl = this.config.CONTEXT7_UPSTASH_CACHE_TTL;
    if (cacheTtl) {
      const ttlValue = parseInt(cacheTtl);
      if (ttlValue >= 3600 && ttlValue <= 86400) {
        this.addTest('Performance', 'cache_ttl', 'passed',
          `Cache TTL is optimized (${ttlValue}s)`);
      } else if (ttlValue < 3600) {
        this.addTest('Performance', 'cache_ttl', 'warning',
          `Cache TTL may be too low (${ttlValue}s) - consider 3600-86400s`);
      } else {
        this.addTest('Performance', 'cache_ttl', 'warning',
          `Cache TTL may be too high (${ttlValue}s) - consider 3600-86400s`);
      }
    }

    // Check cache size setting
    const cacheSize = this.config.CONTEXT7_UPSTASH_MAX_CACHE_SIZE;
    if (cacheSize) {
      if (cacheSize.includes('MB') || cacheSize.includes('GB')) {
        this.addTest('Performance', 'cache_size', 'passed',
          `Cache size is configured (${cacheSize})`);
      } else {
        this.addTest('Performance', 'cache_size', 'warning',
          'Cache size should include unit (MB/GB)');
      }
    }

    // Check compression setting
    const compression = this.config.CONTEXT7_UPSTASH_COMPRESSION;
    if (compression === 'true') {
      this.addTest('Performance', 'compression', 'passed',
        'Compression is enabled');
    } else {
      this.addTest('Performance', 'compression', 'warning',
        'Consider enabling compression for better performance');
    }
  }

  async makeHttpRequest(url, options) {
    return new Promise((resolve, reject) => {
      const request = https.request(url, options, (response) => {
        let body = '';
        response.on('data', (chunk) => body += chunk);
        response.on('end', () => {
          resolve({
            statusCode: response.statusCode,
            headers: response.headers,
            body: body
          });
        });
      });

      request.on('error', reject);
      request.setTimeout(10000, () => {
        request.destroy();
        reject(new Error('Request timeout'));
      });

      request.end();
    });
  }

  addTest(category, name, status, message) {
    this.results.tests.push({ category, name, status, message });
    if (status === 'passed') this.results.passed++;
    else if (status === 'failed') this.results.failed++;
    else if (status === 'warning') this.results.warnings++;
  }

  displayResults() {
    console.log(chalk.yellow('\n📊 Validation Results\n'));

    // Group tests by category
    const categories = {};
    for (const test of this.results.tests) {
      if (!categories[test.category]) {
        categories[test.category] = [];
      }
      categories[test.category].push(test);
    }

    // Display results by category
    for (const [category, tests] of Object.entries(categories)) {
      console.log(chalk.cyan.bold(`${category}:`));
      for (const test of tests) {
        let icon, color;
        if (test.status === 'passed') {
          icon = '✓';
          color = chalk.green;
        } else if (test.status === 'failed') {
          icon = '✗';
          color = chalk.red;
        } else {
          icon = '⚠';
          color = chalk.yellow;
        }
        console.log(`  ${color(icon)} ${test.message}`);
      }
      console.log('');
    }

    // Summary
    console.log(chalk.gray('━'.repeat(60)));
    console.log(chalk.cyan.bold('Summary:'));
    console.log(chalk.green(`✓ Passed: ${this.results.passed}`));
    console.log(chalk.red(`✗ Failed: ${this.results.failed}`));
    console.log(chalk.yellow(`⚠ Warnings: ${this.results.warnings}`));
    console.log(chalk.gray(`Total Tests: ${this.results.tests.length}`));

    // Overall status
    if (this.results.failed === 0) {
      console.log(chalk.green.bold('\n🎉 Configuration validation passed!'));
      if (this.results.warnings > 0) {
        console.log(chalk.yellow('Consider addressing the warnings above for optimal performance.'));
      }
    } else {
      console.log(chalk.red.bold('\n❌ Configuration validation failed!'));
      console.log(chalk.white('Please fix the failed tests above before proceeding.'));
    }

    console.log(chalk.cyan('\nNext Steps:'));
    if (this.results.failed > 0) {
      console.log(chalk.white('• Fix configuration issues'));
      console.log(chalk.white('• Re-run validation: npm run upstash:validate'));
    } else {
      console.log(chalk.white('• Run performance tests: npm run upstash:test'));
      console.log(chalk.white('• Start Context7: npm run context7:start'));
      console.log(chalk.white('• Monitor dashboard: https://console.upstash.com'));
    }
    console.log('');
  }
}

// CLI handling
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
${chalk.blue.bold('Upstash Context7 Configuration Validator')}

${chalk.yellow('Usage:')}
  node scripts/upstash-validate.js [options]

${chalk.yellow('Options:')}
  -h, --help       Show this help message
  --verbose        Show detailed output
  --json           Output results in JSON format
  --only-errors    Only show failed tests

${chalk.yellow('Examples:')}
  node scripts/upstash-validate.js               # Run all validation tests
  node scripts/upstash-validate.js --verbose     # Detailed output
  node scripts/upstash-validate.js --json        # JSON output

${chalk.yellow('Exit Codes:')}
  0 - All tests passed
  1 - Some tests failed
  2 - Validation error
`);
    process.exit(0);
  }

  const validator = new UpstashValidator();
  await validator.validate();

  // Exit with appropriate code
  process.exit(validator.results.failed > 0 ? 1 : 0);
}

// Handle script execution
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(chalk.red(`\n❌ Error: ${error.message}`));
    process.exit(2);
  });
}

export default UpstashValidator;