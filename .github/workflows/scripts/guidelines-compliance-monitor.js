#!/usr/bin/env node

/**
 * GitHub Actions Guidelines Compliance Monitor
 * Purpose: Monitor and enforce compliance with integrated guidelines
 * Author: PMPLearningManagement Team
 * Date: 2025-08-17
 * Issue: #80 - GitHub Actions完全準拠化
 */

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Integrated guidelines compliance rules
const INTEGRATED_RULES = {
  // Updated naming conventions based on actual implementation
  naming: {
    workflowNamePattern: /^[🎯📦🧪🔒📊🤖♻️🔧🔄] .+$/,
    fileNamePattern: /^\d{2}-[a-z]+-[a-z-]+\.yml$/,
    categories: {
      '00': ['meta'],
      '01': ['ci', 'core', 'deploy'],
      '02': ['quality', 'test', 'cd', 'performance'],
      '03': ['security'],
      '04': ['monitoring', 'integration', 'deployment', 'security'],
      '05': ['automation', 'performance'],
      '07': ['self-healing'],
      '08': ['developer'],
      '09': ['reusable']
    }
  },
  
  // Mandatory structure elements
  structure: {
    requiredFields: ['name', 'on', 'permissions', 'jobs'],
    requiredTriggers: ['workflow_dispatch'],
    requiredPermissions: true,
    requiredConcurrency: true,
    requiredTimeout: true,
    requiredJapaneseComments: true
  },
  
  // Security requirements
  security: {
    noHardcodedSecrets: true,
    versionPinning: true,
    minimalPermissions: true,
    secretsUsage: /\$\{\{\s*secrets\./
  },
  
  // Documentation requirements
  documentation: {
    fileHeader: true,
    japaneseJobNames: true,
    stepDescriptions: true,
    purposeDocumentation: true
  }
};

class GuidelinesComplianceMonitor {
  constructor() {
    this.workflowsDir = path.resolve(__dirname, '../');
    this.results = {
      total: 0,
      compliant: 0,
      violations: []
    };
  }

  async monitor() {
    console.log('🔍 GitHub Actions Guidelines Compliance Monitor');
    console.log('==================================================');
    
    const workflowFiles = this.getWorkflowFiles();
    
    for (const file of workflowFiles) {
      await this.analyzeWorkflow(file);
    }
    
    this.generateReport();
    this.saveReport();
  }

  getWorkflowFiles() {
    return fs.readdirSync(this.workflowsDir)
      .filter(file => file.endsWith('.yml') && file.match(/^\d{2}-/))
      .sort();
  }

  async analyzeWorkflow(filename) {
    this.results.total++;
    const filepath = path.join(this.workflowsDir, filename);
    const content = fs.readFileSync(filepath, 'utf8');
    
    let workflow;
    try {
      workflow = yaml.load(content);
    } catch (error) {
      this.addViolation(filename, 'critical', `YAML parsing error: ${error.message}`);
      return;
    }

    const violations = this.checkCompliance(filename, workflow, content);
    
    if (violations.length === 0) {
      this.results.compliant++;
      console.log(`✅ ${filename}: Compliant`);
    } else {
      console.log(`❌ ${filename}: ${violations.length} violations`);
      violations.forEach(v => console.log(`   ${this.getSeverityIcon(v.severity)} ${v.message}`));
    }
  }

  checkCompliance(filename, workflow, content) {
    const violations = [];
    
    // Check naming conventions
    violations.push(...this.checkNaming(filename, workflow));
    
    // Check structure requirements
    violations.push(...this.checkStructure(workflow));
    
    // Check security requirements
    violations.push(...this.checkSecurity(workflow, content));
    
    // Check documentation requirements
    violations.push(...this.checkDocumentation(workflow, content));
    
    return violations;
  }

  checkNaming(filename, workflow) {
    const violations = [];
    
    // Check filename pattern
    if (!INTEGRATED_RULES.naming.fileNamePattern.test(filename)) {
      violations.push({
        severity: 'high',
        message: `Filename "${filename}" doesn't follow pattern: 00-category-description.yml`
      });
    }
    
    // Check workflow name pattern
    if (workflow.name && !INTEGRATED_RULES.naming.workflowNamePattern.test(workflow.name)) {
      violations.push({
        severity: 'medium',
        message: `Workflow name missing required emoji prefix or proper format`
      });
    }
    
    // Check category consistency
    const category = filename.substring(0, 2);
    const categoryName = filename.split('-')[1];
    const allowedCategories = INTEGRATED_RULES.naming.categories[category];
    
    if (allowedCategories && !allowedCategories.some(cat => categoryName.includes(cat))) {
      violations.push({
        severity: 'medium',
        message: `Category "${categoryName}" not allowed for prefix "${category}"`
      });
    }
    
    return violations;
  }

  checkStructure(workflow) {
    const violations = [];
    
    // Check required fields
    INTEGRATED_RULES.structure.requiredFields.forEach(field => {
      if (!workflow[field]) {
        violations.push({
          severity: 'high',
          message: `Missing required field: ${field}`
        });
      }
    });
    
    // Check workflow_dispatch trigger
    if (!workflow.on || !workflow.on.workflow_dispatch) {
      violations.push({
        severity: 'medium',
        message: 'Missing workflow_dispatch trigger for manual execution'
      });
    }
    
    // Check permissions
    if (!workflow.permissions) {
      violations.push({
        severity: 'high',
        message: 'Missing permissions configuration'
      });
    }
    
    // Check concurrency
    if (!workflow.concurrency) {
      violations.push({
        severity: 'medium',
        message: 'Missing concurrency control configuration'
      });
    }
    
    // Check job timeouts
    if (workflow.jobs) {
      Object.entries(workflow.jobs).forEach(([jobName, job]) => {
        if (!job['timeout-minutes']) {
          violations.push({
            severity: 'low',
            message: `Job "${jobName}" missing timeout-minutes`
          });
        }
      });
    }
    
    return violations;
  }

  checkSecurity(workflow, content) {
    const violations = [];
    
    // Check for hardcoded secrets (basic check)
    const suspiciousPatterns = [
      /password\s*[:=]\s*["'][^"']+["']/i,
      /api[_-]?key\s*[:=]\s*["'][^"']+["']/i,
      /token\s*[:=]\s*["'][^"']+["']/i
    ];
    
    suspiciousPatterns.forEach(pattern => {
      if (pattern.test(content)) {
        violations.push({
          severity: 'critical',
          message: 'Potential hardcoded secret detected'
        });
      }
    });
    
    // Check action version pinning
    const actionUsages = content.match(/uses:\s+([^\s]+)/g) || [];
    actionUsages.forEach(usage => {
      const action = usage.replace('uses:', '').trim();
      if (action.includes('@main') || action.includes('@master') || action.includes('@latest')) {
        violations.push({
          severity: 'high',
          message: `Unpinned action version: ${action}`
        });
      }
    });
    
    return violations;
  }

  checkDocumentation(workflow, content) {
    const violations = [];
    
    // Check for file header
    if (!content.includes('# ====================================================================')) {
      violations.push({
        severity: 'medium',
        message: 'Missing standardized file header documentation'
      });
    }
    
    // Check for Japanese job names
    if (workflow.jobs) {
      Object.entries(workflow.jobs).forEach(([jobName, job]) => {
        if (!job.name || !/[ひらがなカタカナ一-龯]/.test(job.name)) {
          violations.push({
            severity: 'low',
            message: `Job "${jobName}" missing Japanese name/description`
          });
        }
      });
    }
    
    // Check for purpose documentation
    if (!content.includes('目的:') && !content.includes('Purpose:')) {
      violations.push({
        severity: 'medium',
        message: 'Missing purpose documentation in header'
      });
    }
    
    return violations;
  }

  addViolation(filename, severity, message) {
    this.results.violations.push({
      file: filename,
      severity,
      message
    });
  }

  getSeverityIcon(severity) {
    const icons = {
      critical: '🔴',
      high: '🟠',
      medium: '🟡',
      low: '🔵'
    };
    return icons[severity] || '⚪';
  }

  generateReport() {
    const complianceRate = ((this.results.compliant / this.results.total) * 100).toFixed(1);
    
    console.log('\n📊 COMPLIANCE SUMMARY');
    console.log('==================================================');
    console.log(`Total Workflows: ${this.results.total}`);
    console.log(`Compliant: ${this.results.compliant} (${complianceRate}%)`);
    console.log(`Non-Compliant: ${this.results.total - this.results.compliant}`);
    
    if (complianceRate >= 95) {
      console.log('🎉 Excellent compliance! Guidelines are well adopted.');
    } else if (complianceRate >= 80) {
      console.log('👍 Good compliance. Minor improvements needed.');
    } else {
      console.log('⚠️  Compliance below target. Review and updates required.');
    }
    
    return {
      total: this.results.total,
      compliant: this.results.compliant,
      complianceRate: parseFloat(complianceRate),
      status: complianceRate >= 95 ? 'excellent' : complianceRate >= 80 ? 'good' : 'needs-improvement'
    };
  }

  saveReport() {
    const reportData = {
      timestamp: new Date().toISOString(),
      summary: this.generateReport(),
      violations: this.results.violations,
      guidelines: INTEGRATED_RULES
    };
    
    const reportPath = path.join(__dirname, 'guidelines-compliance-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
    
    console.log(`\n📄 Report saved: ${reportPath}`);
  }
}

// Execute monitoring
if (import.meta.url === `file://${process.argv[1]}`) {
  const monitor = new GuidelinesComplianceMonitor();
  monitor.monitor().catch(console.error);
}

export default GuidelinesComplianceMonitor;