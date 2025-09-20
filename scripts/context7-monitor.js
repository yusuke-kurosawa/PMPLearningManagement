#!/usr/bin/env node

/**
 * Context7 MCP Server Performance Monitor
 * Real-time monitoring and diagnostics for Context7 optimization
 */

import { performance } from 'perf_hooks';
import { execSync } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

class Context7Monitor {
  constructor() {
    this.metrics = {
      startTime: Date.now(),
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      totalResponseTime: 0,
      cacheHits: 0,
      cacheMisses: 0,
      memoryUsage: [],
      errorLog: [],
    };

    this.thresholds = {
      responseTime: 5000, // 5 seconds
      errorRate: 0.05, // 5%
      memoryUsage: 2048, // 2GB in MB
      cacheHitRate: 0.8, // 80%
    };

    this.isMonitoring = false;
  }

  /**
   * Start monitoring Context7 MCP server
   */
  async startMonitoring() {
    if (this.isMonitoring) {
      console.log('📊 Context7 monitor already running');
      return;
    }

    this.isMonitoring = true;
    console.log('🚀 Starting Context7 MCP Server monitoring...');

    // Initialize monitoring
    await this.initializeMonitoring();

    // Start periodic collection
    this.metricsInterval = setInterval(() => {
      this.collectMetrics();
    }, 5000); // Every 5 seconds

    // Start health checks
    this.healthInterval = setInterval(() => {
      this.performHealthCheck();
    }, 30000); // Every 30 seconds

    // Generate reports
    this.reportInterval = setInterval(() => {
      this.generateReport();
    }, 300000); // Every 5 minutes

    console.log('✅ Context7 monitoring started successfully');
  }

  /**
   * Stop monitoring
   */
  stopMonitoring() {
    if (!this.isMonitoring) {
      console.log('📊 Context7 monitor not running');
      return;
    }

    this.isMonitoring = false;
    clearInterval(this.metricsInterval);
    clearInterval(this.healthInterval);
    clearInterval(this.reportInterval);

    console.log('🛑 Context7 monitoring stopped');
  }

  /**
   * Initialize monitoring setup
   */
  async initializeMonitoring() {
    try {
      // Create monitoring directory
      const monitorDir = path.join(process.cwd(), '.context7-monitoring');
      await fs.mkdir(monitorDir, { recursive: true });

      // Initialize log files
      const logFile = path.join(monitorDir, 'context7-metrics.log');
      const timestamp = new Date().toISOString();
      await fs.writeFile(logFile, `# Context7 Monitoring Log - Started: ${timestamp}\n`);

      console.log('📁 Monitoring directory initialized');
    } catch (error) {
      console.error('❌ Failed to initialize monitoring:', error.message);
    }
  }

  /**
   * Collect performance metrics
   */
  async collectMetrics() {
    try {
      // Memory usage
      const memoryUsage = process.memoryUsage();
      this.metrics.memoryUsage.push({
        timestamp: Date.now(),
        rss: memoryUsage.rss / 1024 / 1024, // MB
        heapUsed: memoryUsage.heapUsed / 1024 / 1024, // MB
        heapTotal: memoryUsage.heapTotal / 1024 / 1024, // MB
        external: memoryUsage.external / 1024 / 1024, // MB
      });

      // Keep only last 100 memory readings
      if (this.metrics.memoryUsage.length > 100) {
        this.metrics.memoryUsage = this.metrics.memoryUsage.slice(-100);
      }

      // Check Node.js process for Context7
      const context7Processes = await this.getContext7Processes();

      if (context7Processes.length > 0) {
        await this.collectContext7Metrics(context7Processes);
      }

    } catch (error) {
      console.warn('⚠️ Failed to collect metrics:', error.message);
    }
  }

  /**
   * Get Context7 related processes
   */
  async getContext7Processes() {
    try {
      const psOutput = execSync('ps aux | grep context7 | grep -v grep', { encoding: 'utf8' });
      return psOutput.trim().split('\n').filter(line => line.length > 0);
    } catch (error) {
      return [];
    }
  }

  /**
   * Collect Context7 specific metrics
   */
  async collectContext7Metrics(processes) {
    try {
      // Parse process information
      for (const processLine of processes) {
        const parts = processLine.trim().split(/\s+/);
        if (parts.length >= 11) {
          const cpu = parseFloat(parts[2]);
          const memory = parseFloat(parts[3]);

          console.log(`📈 Context7 Process - CPU: ${cpu}%, Memory: ${memory}%`);
        }
      }

      // Check cache directory size
      await this.checkCacheSize();

    } catch (error) {
      console.warn('⚠️ Failed to collect Context7 metrics:', error.message);
    }
  }

  /**
   * Check Context7 cache size
   */
  async checkCacheSize() {
    try {
      const cacheDir = path.join(process.cwd(), '.context7-cache');

      try {
        await fs.access(cacheDir);
        const duOutput = execSync(`du -sh "${cacheDir}"`, { encoding: 'utf8' });
        const cacheSize = duOutput.trim().split('\t')[0];
        console.log(`💾 Context7 Cache Size: ${cacheSize}`);
      } catch {
        console.log('💾 Context7 Cache: Not found or empty');
      }
    } catch (error) {
      console.warn('⚠️ Failed to check cache size:', error.message);
    }
  }

  /**
   * Perform health check
   */
  async performHealthCheck() {
    try {
      console.log('🏥 Performing Context7 health check...');

      // Check if Context7 is responsive
      const isResponsive = await this.checkContext7Responsiveness();

      // Check memory usage
      const memoryOk = this.checkMemoryThresholds();

      // Check error rate
      const errorRateOk = this.checkErrorRate();

      const healthStatus = {
        responsive: isResponsive,
        memoryOk: memoryOk,
        errorRateOk: errorRateOk,
        overall: isResponsive && memoryOk && errorRateOk,
        timestamp: new Date().toISOString(),
      };

      await this.logHealthStatus(healthStatus);

      if (!healthStatus.overall) {
        console.warn('🚨 Context7 health check failed!');
        await this.triggerAlerts(healthStatus);
      } else {
        console.log('✅ Context7 health check passed');
      }

    } catch (error) {
      console.error('❌ Health check failed:', error.message);
    }
  }

  /**
   * Check Context7 responsiveness
   */
  async checkContext7Responsiveness() {
    try {
      // This would normally ping the Context7 MCP server
      // For now, we'll check if the process is running
      const processes = await this.getContext7Processes();
      return processes.length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Check memory usage thresholds
   */
  checkMemoryThresholds() {
    if (this.metrics.memoryUsage.length === 0) return true;

    const latestMemory = this.metrics.memoryUsage[this.metrics.memoryUsage.length - 1];
    const memoryUsageMB = latestMemory.heapUsed;

    return memoryUsageMB < this.thresholds.memoryUsage;
  }

  /**
   * Check error rate
   */
  checkErrorRate() {
    if (this.metrics.totalRequests === 0) return true;

    const errorRate = this.metrics.failedRequests / this.metrics.totalRequests;
    return errorRate < this.thresholds.errorRate;
  }

  /**
   * Log health status
   */
  async logHealthStatus(healthStatus) {
    try {
      const logFile = path.join(process.cwd(), '.context7-monitoring', 'health.log');
      const logEntry = `${healthStatus.timestamp} - ${JSON.stringify(healthStatus)}\n`;
      await fs.appendFile(logFile, logEntry);
    } catch (error) {
      console.warn('⚠️ Failed to log health status:', error.message);
    }
  }

  /**
   * Trigger alerts for health issues
   */
  async triggerAlerts(healthStatus) {
    const alerts = [];

    if (!healthStatus.responsive) {
      alerts.push('Context7 MCP server is not responsive');
    }

    if (!healthStatus.memoryOk) {
      alerts.push('Memory usage exceeds threshold');
    }

    if (!healthStatus.errorRateOk) {
      alerts.push('Error rate exceeds threshold');
    }

    for (const alert of alerts) {
      console.error(`🚨 ALERT: ${alert}`);
    }

    // Log alerts
    try {
      const alertFile = path.join(process.cwd(), '.context7-monitoring', 'alerts.log');
      const alertEntry = `${healthStatus.timestamp} - ALERTS: ${alerts.join(', ')}\n`;
      await fs.appendFile(alertFile, alertEntry);
    } catch (error) {
      console.warn('⚠️ Failed to log alerts:', error.message);
    }
  }

  /**
   * Generate performance report
   */
  async generateReport() {
    try {
      console.log('📊 Generating Context7 performance report...');

      const report = {
        timestamp: new Date().toISOString(),
        uptime: Date.now() - this.metrics.startTime,
        metrics: {
          totalRequests: this.metrics.totalRequests,
          successfulRequests: this.metrics.successfulRequests,
          failedRequests: this.metrics.failedRequests,
          averageResponseTime: this.metrics.totalRequests > 0
            ? this.metrics.totalResponseTime / this.metrics.totalRequests
            : 0,
          cacheHitRate: (this.metrics.cacheHits + this.metrics.cacheMisses) > 0
            ? this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses)
            : 0,
          errorRate: this.metrics.totalRequests > 0
            ? this.metrics.failedRequests / this.metrics.totalRequests
            : 0,
        },
        memory: this.getMemorySummary(),
        recommendations: this.generateRecommendations(),
      };

      // Save report
      const reportFile = path.join(process.cwd(), '.context7-monitoring', 'performance-report.json');
      await fs.writeFile(reportFile, JSON.stringify(report, null, 2));

      // Display summary
      this.displayReportSummary(report);

    } catch (error) {
      console.error('❌ Failed to generate report:', error.message);
    }
  }

  /**
   * Get memory usage summary
   */
  getMemorySummary() {
    if (this.metrics.memoryUsage.length === 0) return null;

    const latest = this.metrics.memoryUsage[this.metrics.memoryUsage.length - 1];
    const values = this.metrics.memoryUsage.map(m => m.heapUsed);

    return {
      current: latest.heapUsed,
      average: values.reduce((sum, val) => sum + val, 0) / values.length,
      peak: Math.max(...values),
      trend: values.length > 1
        ? values[values.length - 1] > values[0] ? 'increasing' : 'decreasing'
        : 'stable',
    };
  }

  /**
   * Generate optimization recommendations
   */
  generateRecommendations() {
    const recommendations = [];

    // Cache hit rate recommendations
    const cacheHitRate = (this.metrics.cacheHits + this.metrics.cacheMisses) > 0
      ? this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses)
      : 0;

    if (cacheHitRate < this.thresholds.cacheHitRate) {
      recommendations.push({
        type: 'cache',
        priority: 'high',
        message: `Cache hit rate is ${(cacheHitRate * 100).toFixed(1)}%. Consider increasing cache TTL or size.`,
      });
    }

    // Memory recommendations
    const memorySummary = this.getMemorySummary();
    if (memorySummary && memorySummary.current > this.thresholds.memoryUsage * 0.8) {
      recommendations.push({
        type: 'memory',
        priority: 'medium',
        message: 'Memory usage is approaching threshold. Consider increasing NODE_OPTIONS max-old-space-size.',
      });
    }

    // Error rate recommendations
    const errorRate = this.metrics.totalRequests > 0
      ? this.metrics.failedRequests / this.metrics.totalRequests
      : 0;

    if (errorRate > this.thresholds.errorRate * 0.5) {
      recommendations.push({
        type: 'reliability',
        priority: 'high',
        message: 'Error rate is elevated. Check network connectivity and API rate limits.',
      });
    }

    return recommendations;
  }

  /**
   * Display report summary
   */
  displayReportSummary(report) {
    console.log('\n📊 Context7 Performance Report Summary');
    console.log('=====================================');
    console.log(`⏱️  Uptime: ${Math.round(report.uptime / 1000 / 60)} minutes`);
    console.log(`📈 Total Requests: ${report.metrics.totalRequests}`);
    console.log(`✅ Success Rate: ${(report.metrics.successfulRequests / Math.max(report.metrics.totalRequests, 1) * 100).toFixed(1)}%`);
    console.log(`⚡ Avg Response Time: ${report.metrics.averageResponseTime.toFixed(0)}ms`);
    console.log(`🎯 Cache Hit Rate: ${(report.metrics.cacheHitRate * 100).toFixed(1)}%`);

    if (report.memory) {
      console.log(`💾 Memory Usage: ${report.memory.current.toFixed(1)}MB (${report.memory.trend})`);
    }

    if (report.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      report.recommendations.forEach((rec, index) => {
        console.log(`   ${index + 1}. [${rec.priority.toUpperCase()}] ${rec.message}`);
      });
    }

    console.log('=====================================\n');
  }

  /**
   * Generate diagnostic information
   */
  async generateDiagnostics() {
    console.log('🔍 Generating Context7 diagnostics...');

    const diagnostics = {
      timestamp: new Date().toISOString(),
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        memory: process.memoryUsage(),
      },
      configuration: await this.getConfigurationInfo(),
      network: await this.getNetworkInfo(),
      fileSystem: await this.getFileSystemInfo(),
      recommendations: this.generateDiagnosticRecommendations(),
    };

    // Save diagnostics
    const diagFile = path.join(process.cwd(), '.context7-monitoring', 'diagnostics.json');
    await fs.writeFile(diagFile, JSON.stringify(diagnostics, null, 2));

    console.log('✅ Diagnostics saved to .context7-monitoring/diagnostics.json');
    return diagnostics;
  }

  /**
   * Get configuration information
   */
  async getConfigurationInfo() {
    try {
      const configPath = path.join(process.cwd(), 'context7.config.js');
      const configExists = await fs.access(configPath).then(() => true).catch(() => false);

      return {
        configFile: configExists,
        envVars: Object.keys(process.env).filter(key => key.startsWith('CONTEXT7_')),
      };
    } catch {
      return { configFile: false, envVars: [] };
    }
  }

  /**
   * Get network information
   */
  async getNetworkInfo() {
    try {
      const networkInterfaces = await import('os').then(os => os.networkInterfaces());
      return {
        interfaces: Object.keys(networkInterfaces),
        hasInternet: await this.checkInternetConnectivity(),
      };
    } catch {
      return { interfaces: [], hasInternet: false };
    }
  }

  /**
   * Check internet connectivity
   */
  async checkInternetConnectivity() {
    try {
      execSync('ping -c 1 8.8.8.8', { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get file system information
   */
  async getFileSystemInfo() {
    try {
      const cacheDir = path.join(process.cwd(), '.context7-cache');
      const monitorDir = path.join(process.cwd(), '.context7-monitoring');

      return {
        cacheDirectory: await fs.access(cacheDir).then(() => true).catch(() => false),
        monitoringDirectory: await fs.access(monitorDir).then(() => true).catch(() => false),
        diskSpace: await this.getDiskSpace(),
      };
    } catch {
      return { cacheDirectory: false, monitoringDirectory: false, diskSpace: null };
    }
  }

  /**
   * Get available disk space
   */
  async getDiskSpace() {
    try {
      const dfOutput = execSync('df -h .', { encoding: 'utf8' });
      return dfOutput.trim().split('\n')[1];
    } catch {
      return null;
    }
  }

  /**
   * Generate diagnostic recommendations
   */
  generateDiagnosticRecommendations() {
    return [
      {
        category: 'Performance',
        items: [
          'Ensure adequate memory allocation (--max-old-space-size)',
          'Enable compression for large responses',
          'Configure appropriate cache TTL based on usage patterns',
          'Monitor cache hit rates and adjust cache size accordingly',
        ],
      },
      {
        category: 'Reliability',
        items: [
          'Implement retry logic with exponential backoff',
          'Set appropriate request timeouts',
          'Monitor error rates and response times',
          'Use circuit breaker pattern for external API calls',
        ],
      },
      {
        category: 'Security',
        items: [
          'Validate SSL certificates for external requests',
          'Implement rate limiting to prevent abuse',
          'Use secure storage for API keys and credentials',
          'Enable request/response logging for audit trails',
        ],
      },
    ];
  }
}

// CLI interface
const monitor = new Context7Monitor();

async function main() {
  const command = process.argv[2];

  switch (command) {
    case 'start':
      await monitor.startMonitoring();
      break;

    case 'stop':
      monitor.stopMonitoring();
      break;

    case 'status':
      await monitor.generateReport();
      break;

    case 'diagnostics':
      await monitor.generateDiagnostics();
      break;

    case 'health':
      await monitor.performHealthCheck();
      break;

    default:
      console.log(`
Context7 MCP Server Monitor

Usage:
  node context7-monitor.js <command>

Commands:
  start         Start continuous monitoring
  stop          Stop monitoring
  status        Generate performance report
  diagnostics   Generate diagnostic information
  health        Perform health check

Examples:
  node context7-monitor.js start
  node context7-monitor.js status
  node context7-monitor.js diagnostics
      `);
      break;
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down Context7 monitor...');
  monitor.stopMonitoring();
  process.exit(0);
});

process.on('SIGTERM', () => {
  monitor.stopMonitoring();
  process.exit(0);
});

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default Context7Monitor;