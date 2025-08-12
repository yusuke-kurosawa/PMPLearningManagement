#!/usr/bin/env node

/**
 * Performance Budget Enforcement System
 * Automatically checks and enforces performance budgets
 */

const fs = require('fs');
const path = require('path');

class PerformanceBudgetChecker {
  constructor() {
    this.budgetFile = './performance-budget.json';
    this.resultsDir = './lighthouse-results';
    this.violations = [];
    this.warnings = [];
  }

  async check() {
    console.log('💰 Checking performance budget compliance...');
    
    try {
      const budget = this.loadBudget();
      const results = this.loadLatestResults();
      
      if (!results) {
        console.log('⚠️ No performance results found');
        return;
      }
      
      this.checkBudget(budget, results);
      await this.generateReport();
      
      if (this.violations.length > 0) {
        console.error(`❌ ${this.violations.length} budget violations found!`);
        process.exit(1);
      } else {
        console.log('✅ All performance budgets are within limits');
      }
      
    } catch (error) {
      console.error('❌ Budget check failed:', error);
      process.exit(1);
    }
  }

  loadBudget() {
    if (!fs.existsSync(this.budgetFile)) {
      // Create default budget if none exists
      const defaultBudget = this.createDefaultBudget();
      fs.writeFileSync(this.budgetFile, JSON.stringify(defaultBudget, null, 2));
      console.log('📋 Created default performance budget');
      return defaultBudget;
    }
    
    return JSON.parse(fs.readFileSync(this.budgetFile, 'utf8'));
  }

  createDefaultBudget() {
    return {
      version: "1.0.0",
      description: "PWA Learning Management Performance Budget",
      budgets: {
        lighthouse: {
          performance: { min: 85, warn: 90 },
          accessibility: { min: 95, warn: 98 },
          bestPractices: { min: 90, warn: 95 },
          seo: { min: 90, warn: 95 },
          pwa: { min: 90, warn: 95 }
        },
        coreWebVitals: {
          lcp: { max: 2500, warn: 2000 }, // ms
          fid: { max: 100, warn: 50 },    // ms
          cls: { max: 0.1, warn: 0.05 }   // score
        },
        performance: {
          fcp: { max: 1800, warn: 1500 },       // ms
          speedIndex: { max: 3000, warn: 2500 }, // ms
          tti: { max: 5000, warn: 4000 },       // ms
          tbt: { max: 300, warn: 200 }          // ms
        },
        resources: {
          totalSize: { max: 2097152, warn: 1572864 },     // bytes (2MB/1.5MB)
          jsSize: { max: 1048576, warn: 786432 },         // bytes (1MB/768KB)
          cssSize: { max: 262144, warn: 196608 },         // bytes (256KB/192KB)
          imageSize: { max: 524288, warn: 393216 },       // bytes (512KB/384KB)
          unusedJs: { max: 204800, warn: 102400 },        // bytes (200KB/100KB)
          unusedCss: { max: 51200, warn: 25600 }          // bytes (50KB/25KB)
        },
        timing: {
          domContentLoaded: { max: 3000, warn: 2000 },  // ms
          loadComplete: { max: 5000, warn: 4000 },      // ms
          timeToFirstByte: { max: 600, warn: 400 }      // ms
        }
      },
      alerts: {
        slack: {
          enabled: false,
          webhook: process.env.SLACK_WEBHOOK_URL
        },
        email: {
          enabled: false,
          recipients: []
        }
      }
    };
  }

  loadLatestResults() {
    const analysisFile = path.join(this.resultsDir, 'performance-analysis.json');
    
    if (!fs.existsSync(analysisFile)) {
      console.log('No analysis results found');
      return null;
    }
    
    const analysis = JSON.parse(fs.readFileSync(analysisFile, 'utf8'));
    return analysis.results[analysis.results.length - 1]; // Latest result
  }

  checkBudget(budget, results) {
    // Check Lighthouse scores
    this.checkLighthouseScores(budget.budgets.lighthouse, results.scores);
    
    // Check Core Web Vitals
    this.checkCoreWebVitals(budget.budgets.coreWebVitals, results.coreWebVitals);
    
    // Check Performance metrics
    this.checkPerformanceMetrics(budget.budgets.performance, results.performanceMetrics);
    
    // Check Resource budgets
    this.checkResourceBudgets(budget.budgets.resources, results.resourceMetrics);
  }

  checkLighthouseScores(budget, scores) {
    for (const [category, limits] of Object.entries(budget)) {
      const score = scores[category];
      const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
      
      if (score < limits.min) {
        this.violations.push({
          type: 'lighthouse',
          category,
          message: `${categoryName} score ${score} is below minimum ${limits.min}`,
          current: score,
          limit: limits.min,
          severity: 'error'
        });
      } else if (score < limits.warn) {
        this.warnings.push({
          type: 'lighthouse',
          category,
          message: `${categoryName} score ${score} is below warning threshold ${limits.warn}`,
          current: score,
          limit: limits.warn,
          severity: 'warning'
        });
      }
    }
  }

  checkCoreWebVitals(budget, vitals) {
    for (const [metric, limits] of Object.entries(budget)) {
      const value = vitals[metric];
      const metricName = metric.toUpperCase();
      
      if (value > limits.max) {
        this.violations.push({
          type: 'core-web-vitals',
          metric,
          message: `${metricName} ${value} exceeds maximum ${limits.max}`,
          current: value,
          limit: limits.max,
          severity: 'error'
        });
      } else if (value > limits.warn) {
        this.warnings.push({
          type: 'core-web-vitals',
          metric,
          message: `${metricName} ${value} exceeds warning threshold ${limits.warn}`,
          current: value,
          limit: limits.warn,
          severity: 'warning'
        });
      }
    }
  }

  checkPerformanceMetrics(budget, metrics) {
    const metricMap = {
      fcp: 'First Contentful Paint',
      speedIndex: 'Speed Index',
      tti: 'Time to Interactive',
      tbt: 'Total Blocking Time'
    };
    
    for (const [key, limits] of Object.entries(budget)) {
      const value = metrics[key === 'speedIndex' ? 'si' : key];
      const metricName = metricMap[key];
      
      if (value > limits.max) {
        this.violations.push({
          type: 'performance',
          metric: key,
          message: `${metricName} ${Math.round(value)}ms exceeds maximum ${limits.max}ms`,
          current: value,
          limit: limits.max,
          severity: 'error'
        });
      } else if (value > limits.warn) {
        this.warnings.push({
          type: 'performance',
          metric: key,
          message: `${metricName} ${Math.round(value)}ms exceeds warning threshold ${limits.warn}ms`,
          current: value,
          limit: limits.warn,
          severity: 'warning'
        });
      }
    }
  }

  checkResourceBudgets(budget, resources) {
    const checks = [
      { key: 'totalSize', value: resources.totalByteWeight, name: 'Total Bundle Size' },
      { key: 'unusedJs', value: resources.unusedJavaScript, name: 'Unused JavaScript' },
      { key: 'unusedCss', value: resources.unusedCSS, name: 'Unused CSS' }
    ];
    
    checks.forEach(({ key, value, name }) => {
      if (budget[key] && value > budget[key].max) {
        this.violations.push({
          type: 'resources',
          metric: key,
          message: `${name} ${this.formatBytes(value)} exceeds maximum ${this.formatBytes(budget[key].max)}`,
          current: value,
          limit: budget[key].max,
          severity: 'error'
        });
      } else if (budget[key] && value > budget[key].warn) {
        this.warnings.push({
          type: 'resources',
          metric: key,
          message: `${name} ${this.formatBytes(value)} exceeds warning threshold ${this.formatBytes(budget[key].warn)}`,
          current: value,
          limit: budget[key].warn,
          severity: 'warning'
        });
      }
    });
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  async generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      status: this.violations.length === 0 ? 'pass' : 'fail',
      summary: {
        violations: this.violations.length,
        warnings: this.warnings.length,
        total: this.violations.length + this.warnings.length
      },
      violations: this.violations,
      warnings: this.warnings,
      recommendations: this.generateRecommendations()
    };
    
    // Save detailed report
    const reportFile = path.join(this.resultsDir, 'budget-report.json');
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    
    // Generate markdown report
    const markdownReport = this.generateMarkdownReport(report);
    fs.writeFileSync(path.join(this.resultsDir, 'budget-report.md'), markdownReport);
    
    console.log('📋 Budget report generated');
  }

  generateRecommendations() {
    const recommendations = [];
    
    // Group violations by type
    const groupedViolations = this.violations.reduce((acc, violation) => {
      if (!acc[violation.type]) acc[violation.type] = [];
      acc[violation.type].push(violation);
      return acc;
    }, {});
    
    if (groupedViolations.lighthouse) {
      recommendations.push({
        category: 'Lighthouse Scores',
        priority: 'high',
        action: 'Focus on improving low-scoring categories',
        details: groupedViolations.lighthouse.map(v => v.category)
      });
    }
    
    if (groupedViolations['core-web-vitals']) {
      recommendations.push({
        category: 'Core Web Vitals',
        priority: 'critical',
        action: 'Optimize Core Web Vitals for better user experience',
        details: groupedViolations['core-web-vitals'].map(v => v.metric)
      });
    }
    
    if (groupedViolations.resources) {
      recommendations.push({
        category: 'Resource Optimization',
        priority: 'high',
        action: 'Reduce bundle size and remove unused code',
        details: ['Implement tree shaking', 'Code splitting', 'Remove unused dependencies']
      });
    }
    
    return recommendations;
  }

  generateMarkdownReport(report) {
    return `# Performance Budget Report

**Status**: ${report.status.toUpperCase()} ${report.status === 'pass' ? '✅' : '❌'}
**Generated**: ${new Date(report.timestamp).toLocaleString()}

## Summary
- **Violations**: ${report.summary.violations}
- **Warnings**: ${report.summary.warnings}
- **Total Issues**: ${report.summary.total}

## Violations
${report.violations.length === 0 ? 'None 🎉' : 
  report.violations.map(v => `- **${v.type}**: ${v.message}`).join('\\n')
}

## Warnings
${report.warnings.length === 0 ? 'None' :
  report.warnings.map(w => `- **${w.type}**: ${w.message}`).join('\\n')
}

## Recommendations
${report.recommendations.map((rec, i) => 
  `${i + 1}. **${rec.category}** (${rec.priority} priority)\\n   ${rec.action}`
).join('\\n\\n')}

---
*Performance budget enforcement helps maintain optimal user experience*
`;
  }
}

// Run if called directly
if (require.main === module) {
  const checker = new PerformanceBudgetChecker();
  checker.check().catch(console.error);
}

module.exports = PerformanceBudgetChecker;