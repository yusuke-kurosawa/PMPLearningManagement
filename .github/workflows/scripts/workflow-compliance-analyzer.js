#!/usr/bin/env node

/**
 * GitHub Actions Workflow Compliance Analyzer
 * Purpose: Analyze all workflows against defined rules and generate comprehensive report
 * Author: DevOps Team
 * Date: 2025-08-17
 */

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Compliance rules based on github-actions-rules.md
const COMPLIANCE_RULES = {
  naming: {
    workflowNamePattern: /^[🔒📦🧪📊🤖⚖️🔔🔧] .+$/,
    fileNamePattern: /^\d{2}-[a-z]+-[a-z-]+\.yml$/,
    categories: {
      '01': 'deploy',
      '02': 'test/quality',
      '03': 'security',
      '04': 'monitoring/integration',
      '05': 'automation/performance',
      '06': 'compliance',
      '07': 'notification/self-healing',
      '08': 'developer'
    }
  },
  structure: {
    requiredFields: ['name', 'on', 'permissions', 'jobs'],
    requiredTriggers: ['workflow_dispatch'],
    requiredPermissions: true,
    requiredConcurrency: true,
    requiredTimeout: true
  },
  security: {
    noHardcodedSecrets: true,
    versionPinning: true,
    minimalPermissions: true
  },
  documentation: {
    fileHeader: true,
    japaneseComments: true,
    stepDescriptions: true
  }
};

class WorkflowAnalyzer {
  constructor(workflowDir) {
    this.workflowDir = workflowDir;
    this.results = {
      totalWorkflows: 0,
      compliant: [],
      nonCompliant: [],
      issues: {},
      recommendations: []
    };
  }

  analyzeAllWorkflows() {
    const files = fs.readdirSync(this.workflowDir)
      .filter(f => f.endsWith('.yml') && !f.startsWith('.'));
    
    this.results.totalWorkflows = files.length;
    
    files.forEach(file => {
      const filePath = path.join(this.workflowDir, file);
      const issues = this.analyzeWorkflow(filePath, file);
      
      if (issues.length === 0) {
        this.results.compliant.push(file);
      } else {
        this.results.nonCompliant.push(file);
        this.results.issues[file] = issues;
      }
    });
    
    this.generateRecommendations();
    return this.results;
  }

  analyzeWorkflow(filePath, fileName) {
    const issues = [];
    const content = fs.readFileSync(filePath, 'utf8');
    
    try {
      const workflow = yaml.load(content);
      
      // Check file naming
      if (!COMPLIANCE_RULES.naming.fileNamePattern.test(fileName)) {
        issues.push({
          type: 'naming',
          severity: 'high',
          message: `File name "${fileName}" doesn't follow pattern: 00-category-description.yml`
        });
      }
      
      // Check workflow name
      if (!workflow.name || !COMPLIANCE_RULES.naming.workflowNamePattern.test(workflow.name)) {
        issues.push({
          type: 'naming',
          severity: 'medium',
          message: 'Workflow name missing emoji prefix or Japanese description'
        });
      }
      
      // Check file header comments
      const hasHeader = content.includes('====') && 
                       content.includes('目的:') && 
                       content.includes('実行タイミング:');
      if (!hasHeader) {
        issues.push({
          type: 'documentation',
          severity: 'medium',
          message: 'Missing required file header with purpose and trigger documentation'
        });
      }
      
      // Check permissions
      if (!workflow.permissions) {
        issues.push({
          type: 'security',
          severity: 'high',
          message: 'Missing permissions configuration (minimal permissions required)'
        });
      }
      
      // Check concurrency
      if (!workflow.concurrency) {
        issues.push({
          type: 'performance',
          severity: 'medium',
          message: 'Missing concurrency control configuration'
        });
      }
      
      // Check workflow_dispatch trigger
      if (workflow.on && !workflow.on.workflow_dispatch) {
        issues.push({
          type: 'structure',
          severity: 'low',
          message: 'Missing workflow_dispatch trigger for manual execution'
        });
      }
      
      // Check job timeouts
      if (workflow.jobs) {
        Object.entries(workflow.jobs).forEach(([jobName, job]) => {
          if (!job['timeout-minutes']) {
            issues.push({
              type: 'performance',
              severity: 'medium',
              message: `Job "${jobName}" missing timeout-minutes configuration`
            });
          }
          
          // Check for Japanese names in jobs
          if (!job.name || !/[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff]/.test(job.name)) {
            issues.push({
              type: 'documentation',
              severity: 'low',
              message: `Job "${jobName}" missing Japanese name/description`
            });
          }
        });
      }
      
      // Check for hardcoded secrets
      if (content.match(/[A-Z0-9]{20,}/g) && !content.includes('${{ secrets.')) {
        issues.push({
          type: 'security',
          severity: 'critical',
          message: 'Potential hardcoded secrets detected'
        });
      }
      
      // Check action version pinning
      const unpinnedActions = content.match(/uses:\s+[^@]+@(main|master|latest)/g);
      if (unpinnedActions) {
        issues.push({
          type: 'security',
          severity: 'high',
          message: 'Unpinned action versions detected (use tags or commit SHA)'
        });
      }
      
    } catch (e) {
      issues.push({
        type: 'syntax',
        severity: 'critical',
        message: `YAML parsing error: ${e.message}`
      });
    }
    
    return issues;
  }

  generateRecommendations() {
    const severityCount = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    };
    
    Object.values(this.results.issues).forEach(fileIssues => {
      fileIssues.forEach(issue => {
        severityCount[issue.severity]++;
      });
    });
    
    // Generate prioritized recommendations
    if (severityCount.critical > 0) {
      this.results.recommendations.push({
        priority: 1,
        action: 'Fix critical security issues immediately',
        count: severityCount.critical
      });
    }
    
    if (severityCount.high > 0) {
      this.results.recommendations.push({
        priority: 2,
        action: 'Address high-severity naming and security issues',
        count: severityCount.high
      });
    }
    
    if (this.results.nonCompliant.length > 10) {
      this.results.recommendations.push({
        priority: 3,
        action: 'Implement automated workflow generation/refactoring tool',
        details: 'High number of non-compliant workflows detected'
      });
    }
    
    this.results.recommendations.push({
      priority: 4,
      action: 'Add workflow validation to pre-commit hooks',
      details: 'Prevent non-compliant workflows from being committed'
    });
  }

  generateReport() {
    const report = {
      summary: {
        timestamp: new Date().toISOString(),
        totalWorkflows: this.results.totalWorkflows,
        compliantCount: this.results.compliant.length,
        nonCompliantCount: this.results.nonCompliant.length,
        complianceRate: ((this.results.compliant.length / this.results.totalWorkflows) * 100).toFixed(2) + '%'
      },
      compliantWorkflows: this.results.compliant,
      nonCompliantWorkflows: this.results.nonCompliant,
      detailedIssues: this.results.issues,
      recommendations: this.results.recommendations,
      nextSteps: [
        '1. Fix critical and high-severity issues first',
        '2. Apply naming convention refactoring',
        '3. Add missing documentation headers',
        '4. Implement performance optimizations',
        '5. Set up continuous compliance monitoring'
      ]
    };
    
    return report;
  }
}

// Main execution
const workflowDir = path.join(__dirname, '..');
const analyzer = new WorkflowAnalyzer(workflowDir);

console.log('🔍 Analyzing GitHub Actions workflows for compliance...\n');

analyzer.analyzeAllWorkflows();
const report = analyzer.generateReport();

// Output report
console.log('📊 COMPLIANCE ANALYSIS REPORT');
console.log('=' .repeat(60));
console.log(`Total Workflows: ${report.summary.totalWorkflows}`);
console.log(`Compliant: ${report.summary.compliantCount} (${report.summary.complianceRate})`);
console.log(`Non-Compliant: ${report.summary.nonCompliantCount}`);
console.log('=' .repeat(60));

if (report.nonCompliantWorkflows.length > 0) {
  console.log('\n❌ NON-COMPLIANT WORKFLOWS:');
  report.nonCompliantWorkflows.forEach(workflow => {
    console.log(`\n  📄 ${workflow}`);
    const issues = report.detailedIssues[workflow];
    issues.forEach(issue => {
      const icon = issue.severity === 'critical' ? '🔴' :
                  issue.severity === 'high' ? '🟠' :
                  issue.severity === 'medium' ? '🟡' : '🔵';
      console.log(`    ${icon} [${issue.severity}] ${issue.message}`);
    });
  });
}

if (report.compliantWorkflows.length > 0) {
  console.log('\n✅ COMPLIANT WORKFLOWS:');
  report.compliantWorkflows.forEach(workflow => {
    console.log(`  ✓ ${workflow}`);
  });
}

console.log('\n🎯 RECOMMENDATIONS:');
report.recommendations.forEach(rec => {
  console.log(`  ${rec.priority}. ${rec.action}`);
  if (rec.details) {
    console.log(`     ${rec.details}`);
  }
});

console.log('\n📋 NEXT STEPS:');
report.nextSteps.forEach(step => {
  console.log(`  ${step}`);
});

// Save report to file
const reportPath = path.join(__dirname, 'workflow-compliance-report.json');
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log(`\n💾 Full report saved to: ${reportPath}`);

export default WorkflowAnalyzer;