#!/usr/bin/env node

/**
 * Upstash Context7 Performance Testing Tool
 * Tests and compares performance with and without Upstash integration
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { performance } from 'perf_hooks';
import chalk from 'chalk';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.dirname(__dirname);

class UpstashPerformanceTester {
  constructor(options = {}) {
    this.options = {
      iterations: options.iterations || 10,
      concurrency: options.concurrency || 3,
      timeout: options.timeout || 30000,
      warmup: options.warmup || 2,
      verbose: options.verbose || false,
      compare: options.compare || false
    };

    this.results = {
      withUpstash: [],
      withoutUpstash: [],
      cacheStats: {}
    };

    this.testQueries = [
      'React hooks best practices',
      'TypeScript interface design patterns',
      'Vite build optimization',
      'D3.js data visualization techniques',
      'React performance optimization',
      'Context API vs Zustand',
      'Tailwind CSS responsive design',
      'Vitest testing strategies',
      'React component composition',
      'TypeScript generic constraints'
    ];
  }

  async run() {
    console.log(chalk.blue.bold('\n🚀 Upstash Context7 Performance Testing\n'));

    try {
      await this.checkPrerequisites();

      if (this.options.compare) {
        await this.runComparisonTests();
      } else {
        await this.runStandardTests();
      }

      this.analyzeResults();
      this.displayResults();
      await this.generateReport();
    } catch (error) {
      console.error(chalk.red(`\n❌ Testing failed: ${error.message}`));
      process.exit(1);
    }
  }

  async checkPrerequisites() {
    console.log(chalk.yellow('📋 Checking prerequisites...\n'));

    // Check if Context7 MCP server is available
    try {
      const response = await this.makeRequest('http://localhost:3001/api/status', {
        method: 'GET',
        timeout: 5000
      });

      if (response.statusCode === 200) {
        console.log(chalk.green('✓ Context7 MCP server is running'));
      } else {
        throw new Error(`Context7 server returned status ${response.statusCode}`);
      }
    } catch (error) {
      throw new Error('Context7 MCP server not available. Please start it first.');
    }

    // Check Upstash configuration
    const config = await this.loadConfiguration();
    if (config.UPSTASH_API_KEY && config.CONTEXT7_ENABLE_UPSTASH === 'true') {
      console.log(chalk.green('✓ Upstash integration is configured'));
    } else {
      console.log(chalk.yellow('⚠ Upstash integration not configured - running basic tests only'));
    }

    console.log('');
  }

  async loadConfiguration() {
    const config = {};

    // Load from .context7rc
    const context7rcPath = path.join(projectRoot, '.context7rc');
    if (fs.existsSync(context7rcPath)) {
      this.parseEnvFile(context7rcPath, config);
    }

    // Load from .env.local
    const envLocalPath = path.join(projectRoot, '.env.local');
    if (fs.existsSync(envLocalPath)) {
      this.parseEnvFile(envLocalPath, config);
    }

    // Load from environment
    Object.assign(config, process.env);

    return config;
  }

  parseEnvFile(filePath, config) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    for (const line of lines) {
      const cleanLine = line.trim();
      if (cleanLine && !cleanLine.startsWith('#')) {
        const [key, ...valueParts] = cleanLine.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').trim();
          config[key.trim()] = value;
        }
      }
    }
  }

  async runStandardTests() {
    console.log(chalk.yellow('🧪 Running standard performance tests...\n'));

    // Warmup requests
    console.log(chalk.blue('Warming up cache...'));
    for (let i = 0; i < this.options.warmup; i++) {
      await this.testQuery(this.testQueries[i], false);
    }
    console.log(chalk.green('✓ Warmup completed\n'));

    // Run performance tests
    console.log(chalk.blue('Running performance tests...'));
    const results = [];

    for (let i = 0; i < this.options.iterations; i++) {
      const query = this.testQueries[i % this.testQueries.length];
      console.log(chalk.gray(`Test ${i + 1}/${this.options.iterations}: "${query.substring(0, 30)}..."`));

      const result = await this.testQuery(query, true);
      results.push(result);

      if (this.options.verbose) {
        console.log(chalk.gray(`  Response time: ${result.responseTime}ms`));
        console.log(chalk.gray(`  Cache hit: ${result.cacheHit ? 'Yes' : 'No'}`));
      }
    }

    this.results.withUpstash = results;
  }

  async runComparisonTests() {
    console.log(chalk.yellow('⚖️  Running comparison tests (with vs without Upstash)...\n'));

    // Test without Upstash
    console.log(chalk.blue('Testing without Upstash integration...'));
    await this.toggleUpstash(false);

    const withoutResults = [];
    for (let i = 0; i < this.options.iterations; i++) {
      const query = this.testQueries[i % this.testQueries.length];
      const result = await this.testQuery(query, true);
      withoutResults.push(result);

      if (this.options.verbose) {
        console.log(chalk.gray(`  Without: ${result.responseTime}ms`));
      }
    }
    this.results.withoutUpstash = withoutResults;

    // Brief pause
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test with Upstash
    console.log(chalk.blue('\nTesting with Upstash integration...'));
    await this.toggleUpstash(true);

    // Warmup with Upstash
    for (let i = 0; i < this.options.warmup; i++) {
      await this.testQuery(this.testQueries[i], false);
    }

    const withResults = [];
    for (let i = 0; i < this.options.iterations; i++) {
      const query = this.testQueries[i % this.testQueries.length];
      const result = await this.testQuery(query, true);
      withResults.push(result);

      if (this.options.verbose) {
        console.log(chalk.gray(`  With: ${result.responseTime}ms (hit: ${result.cacheHit})`));
      }
    }
    this.results.withUpstash = withResults;
  }

  async testQuery(query, measurePerformance = true) {
    const startTime = performance.now();

    try {
      const response = await this.makeRequest('http://localhost:3001/api/context', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: query,
          context: 'react-typescript-development',
          maxResults: 5
        })
      });

      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);

      let cacheHit = false;
      let dataSize = 0;

      if (response.body) {
        dataSize = Buffer.byteLength(response.body, 'utf8');

        try {
          const data = JSON.parse(response.body);
          cacheHit = data.cached === true || data.cacheHit === true;
        } catch (e) {
          // Response not JSON, that's ok
        }
      }

      return {
        query,
        responseTime,
        statusCode: response.statusCode,
        dataSize,
        cacheHit,
        success: response.statusCode === 200,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);

      return {
        query,
        responseTime,
        statusCode: 0,
        dataSize: 0,
        cacheHit: false,
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async toggleUpstash(enabled) {
    try {
      const response = await this.makeRequest('http://localhost:3001/api/config/upstash', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ enabled })
      });

      if (response.statusCode !== 200) {
        console.log(chalk.yellow(`⚠ Could not toggle Upstash (status: ${response.statusCode})`));
      }

      // Wait for configuration to take effect
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.log(chalk.yellow(`⚠ Could not toggle Upstash: ${error.message}`));
    }
  }

  async makeRequest(url, options) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const requestOptions = {
        hostname: urlObj.hostname,
        port: urlObj.port,
        path: urlObj.pathname + urlObj.search,
        method: options.method || 'GET',
        headers: options.headers || {},
        timeout: options.timeout || this.options.timeout
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

  analyzeResults() {
    console.log(chalk.yellow('\n📊 Analyzing results...\n'));

    if (this.results.withUpstash.length > 0) {
      this.analyzeResultSet('with Upstash', this.results.withUpstash);
    }

    if (this.results.withoutUpstash.length > 0) {
      this.analyzeResultSet('without Upstash', this.results.withoutUpstash);
    }

    if (this.options.compare && this.results.withUpstash.length > 0 && this.results.withoutUpstash.length > 0) {
      this.compareResults();
    }
  }

  analyzeResultSet(label, results) {
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    const responseTimes = successful.map(r => r.responseTime);
    const cacheHits = successful.filter(r => r.cacheHit).length;
    const totalDataSize = successful.reduce((sum, r) => sum + r.dataSize, 0);

    const stats = {
      label,
      total: results.length,
      successful: successful.length,
      failed: failed.length,
      cacheHits,
      cacheHitRate: successful.length > 0 ? (cacheHits / successful.length * 100).toFixed(1) : 0,
      avgResponseTime: responseTimes.length > 0 ? Math.round(responseTimes.reduce((a, b) => a + b) / responseTimes.length) : 0,
      minResponseTime: responseTimes.length > 0 ? Math.min(...responseTimes) : 0,
      maxResponseTime: responseTimes.length > 0 ? Math.max(...responseTimes) : 0,
      medianResponseTime: responseTimes.length > 0 ? this.median(responseTimes) : 0,
      p95ResponseTime: responseTimes.length > 0 ? this.percentile(responseTimes, 95) : 0,
      totalDataSize: Math.round(totalDataSize / 1024), // KB
      avgDataSize: successful.length > 0 ? Math.round(totalDataSize / successful.length / 1024) : 0
    };

    console.log(chalk.cyan.bold(`Results ${label}:`));
    console.log(chalk.white(`  Total requests: ${stats.total}`));
    console.log(chalk.white(`  Successful: ${stats.successful} (${(stats.successful/stats.total*100).toFixed(1)}%)`));
    console.log(chalk.white(`  Failed: ${stats.failed}`));
    console.log(chalk.white(`  Cache hits: ${stats.cacheHits} (${stats.cacheHitRate}%)`));
    console.log(chalk.white(`  Avg response time: ${stats.avgResponseTime}ms`));
    console.log(chalk.white(`  Min/Max response time: ${stats.minResponseTime}ms / ${stats.maxResponseTime}ms`));
    console.log(chalk.white(`  Median response time: ${stats.medianResponseTime}ms`));
    console.log(chalk.white(`  95th percentile: ${stats.p95ResponseTime}ms`));
    console.log(chalk.white(`  Total data transferred: ${stats.totalDataSize}KB`));
    console.log(chalk.white(`  Avg data per request: ${stats.avgDataSize}KB`));
    console.log('');

    return stats;
  }

  compareResults() {
    const withStats = this.analyzeResultSet('', this.results.withUpstash);
    const withoutStats = this.analyzeResultSet('', this.results.withoutUpstash);

    console.log(chalk.cyan.bold('Performance Comparison:'));
    console.log(chalk.gray('━'.repeat(60)));

    // Response time improvement
    const responseTimeImprovement = ((withoutStats.avgResponseTime - withStats.avgResponseTime) / withoutStats.avgResponseTime * 100).toFixed(1);
    const responseTimeColor = responseTimeImprovement > 0 ? chalk.green : chalk.red;
    console.log(chalk.white(`Response Time: ${responseTimeColor(responseTimeImprovement + '%')} improvement`));

    // Cache hit rate
    console.log(chalk.white(`Cache Hit Rate: ${chalk.green(withStats.cacheHitRate + '%')} (Upstash enabled)`));

    // Data transfer savings
    const dataTransferSavings = ((withoutStats.totalDataSize - withStats.totalDataSize) / withoutStats.totalDataSize * 100).toFixed(1);
    const dataTransferColor = dataTransferSavings > 0 ? chalk.green : chalk.red;
    console.log(chalk.white(`Data Transfer: ${dataTransferColor(dataTransferSavings + '%')} reduction`));

    // Performance score
    let performanceScore = 0;
    if (responseTimeImprovement > 20) performanceScore += 30;
    else if (responseTimeImprovement > 10) performanceScore += 20;
    else if (responseTimeImprovement > 0) performanceScore += 10;

    if (withStats.cacheHitRate > 80) performanceScore += 30;
    else if (withStats.cacheHitRate > 60) performanceScore += 20;
    else if (withStats.cacheHitRate > 40) performanceScore += 10;

    if (dataTransferSavings > 30) performanceScore += 20;
    else if (dataTransferSavings > 15) performanceScore += 15;
    else if (dataTransferSavings > 0) performanceScore += 10;

    if (withStats.successful === withStats.total) performanceScore += 20;

    const scoreColor = performanceScore >= 80 ? chalk.green : performanceScore >= 60 ? chalk.yellow : chalk.red;
    console.log(chalk.white(`Performance Score: ${scoreColor(performanceScore + '/100')}`));

    console.log(chalk.gray('━'.repeat(60)));
    console.log('');
  }

  median(arr) {
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
  }

  percentile(arr, p) {
    const sorted = [...arr].sort((a, b) => a - b);
    const index = Math.ceil(sorted.length * p / 100) - 1;
    return sorted[Math.min(index, sorted.length - 1)];
  }

  displayResults() {
    console.log(chalk.yellow('📈 Performance Summary\n'));

    if (this.options.compare) {
      console.log(chalk.cyan('Comparison test completed successfully!'));
      console.log(chalk.gray('See detailed analysis above for performance improvements.'));
    } else {
      const stats = this.analyzeResultSet('', this.results.withUpstash);
      if (stats.cacheHitRate > 70) {
        console.log(chalk.green('🎉 Excellent cache performance!'));
      } else if (stats.cacheHitRate > 40) {
        console.log(chalk.yellow('📊 Good cache performance - consider cache warmup strategies.'));
      } else {
        console.log(chalk.red('⚠️  Low cache hit rate - check Upstash configuration.'));
      }
    }

    console.log(chalk.cyan('\nRecommendations:'));

    if (this.results.withUpstash.length > 0) {
      const avgResponseTime = this.results.withUpstash.reduce((sum, r) => sum + r.responseTime, 0) / this.results.withUpstash.length;
      const cacheHitRate = this.results.withUpstash.filter(r => r.cacheHit).length / this.results.withUpstash.length * 100;

      if (avgResponseTime > 2000) {
        console.log(chalk.white('• Consider increasing cache TTL for better performance'));
      }
      if (cacheHitRate < 50) {
        console.log(chalk.white('• Implement cache warming strategies for common queries'));
      }
      if (this.results.withUpstash.some(r => !r.success)) {
        console.log(chalk.white('• Check error logs for failed requests'));
      }
    }

    console.log(chalk.white('• Monitor Upstash dashboard for usage patterns'));
    console.log(chalk.white('• Run tests periodically to track performance trends'));
    console.log('');
  }

  async generateReport() {
    const reportPath = path.join(projectRoot, 'reports', 'upstash-performance-report.json');

    // Ensure reports directory exists
    const reportsDir = path.dirname(reportPath);
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const report = {
      timestamp: new Date().toISOString(),
      options: this.options,
      results: this.results,
      summary: {
        totalTests: this.results.withUpstash.length + this.results.withoutUpstash.length,
        comparisonMode: this.options.compare,
        upstashEnabled: this.results.withUpstash.length > 0
      }
    };

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(chalk.green(`📁 Performance report saved to: ${reportPath}`));
  }
}

// CLI handling
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
${chalk.blue.bold('Upstash Context7 Performance Testing Tool')}

${chalk.yellow('Usage:')}
  node scripts/upstash-test.js [options]

${chalk.yellow('Options:')}
  -h, --help           Show this help message
  --compare            Compare performance with and without Upstash
  --iterations <n>     Number of test iterations (default: 10)
  --concurrency <n>    Concurrent requests (default: 3)
  --verbose            Show detailed output
  --warmup <n>         Number of warmup requests (default: 2)
  --timeout <ms>       Request timeout in milliseconds (default: 30000)

${chalk.yellow('Examples:')}
  node scripts/upstash-test.js                        # Standard performance test
  node scripts/upstash-test.js --compare              # Compare with/without Upstash
  node scripts/upstash-test.js --iterations 20        # More test iterations
  node scripts/upstash-test.js --verbose --compare    # Detailed comparison

${chalk.yellow('Prerequisites:')}
  • Context7 MCP server must be running (port 3001)
  • Upstash credentials configured (for enhanced tests)
`);
    process.exit(0);
  }

  const options = {
    iterations: parseInt(args.find((arg, i) => args[i-1] === '--iterations')) || 10,
    concurrency: parseInt(args.find((arg, i) => args[i-1] === '--concurrency')) || 3,
    timeout: parseInt(args.find((arg, i) => args[i-1] === '--timeout')) || 30000,
    warmup: parseInt(args.find((arg, i) => args[i-1] === '--warmup')) || 2,
    verbose: args.includes('--verbose'),
    compare: args.includes('--compare')
  };

  const tester = new UpstashPerformanceTester(options);
  await tester.run();
}

// Handle script execution
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(chalk.red(`\n❌ Error: ${error.message}`));
    process.exit(1);
  });
}

export default UpstashPerformanceTester;