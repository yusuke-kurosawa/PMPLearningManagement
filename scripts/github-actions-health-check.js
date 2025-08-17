#!/usr/bin/env node

/**
 * GitHub Actions Health Check System
 * Purpose: Continuous improvement process for GitHub Actions ecosystem
 * Author: PMPLearningManagement Team
 * Date: 2025-08-17
 * Issue: #80 - GitHub Actions完全準拠化
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class GitHubActionsHealthCheck {
  constructor() {
    this.rootDir = path.resolve(__dirname, '..');
    this.workflowsDir = path.join(this.rootDir, '.github', 'workflows');
    this.actionsDir = path.join(this.rootDir, '.github', 'actions');
    this.guidelinesPath = path.join(this.rootDir, '.claude', 'context', 'github-actions-rules.md');
    
    this.healthReport = {
      timestamp: new Date().toISOString(),
      guidelines: {},
      workflows: {},
      actions: {},
      integration: {},
      recommendations: []
    };
  }

  async performHealthCheck() {
    console.log('🏥 GitHub Actions Ecosystem Health Check');
    console.log('==========================================');
    
    await this.checkGuidelines();
    await this.checkWorkflows();
    await this.checkCustomActions();
    await this.checkIntegration();
    await this.generateRecommendations();
    
    this.generateReport();
    this.saveReport();
  }

  async checkGuidelines() {
    console.log('\n📋 Checking Guidelines Health...');
    
    const guidelinesExists = fs.existsSync(this.guidelinesPath);
    const actionsReadmeExists = fs.existsSync(path.join(this.actionsDir, 'README.md'));
    
    this.healthReport.guidelines = {
      integratedGuidelinesExists: guidelinesExists,
      actionsDocumentationExists: actionsReadmeExists,
      lastModified: guidelinesExists ? 
        fs.statSync(this.guidelinesPath).mtime.toISOString() : null,
      status: guidelinesExists && actionsReadmeExists ? 'healthy' : 'needs-attention'
    };
    
    if (guidelinesExists) {
      const content = fs.readFileSync(this.guidelinesPath, 'utf8');
      const sections = [
        '絶対的ルール',
        'カスタムアクション',
        'セキュリティルール',
        'ベストプラクティス',
        'トラブルシューティング'
      ];
      
      const missingSections = sections.filter(section => !content.includes(section));
      this.healthReport.guidelines.completeness = {
        totalSections: sections.length,
        missingSections,
        completenessScore: ((sections.length - missingSections.length) / sections.length * 100).toFixed(1)
      };
    }
    
    console.log(`  Guidelines Status: ${this.healthReport.guidelines.status}`);
  }

  async checkWorkflows() {
    console.log('\n⚙️ Checking Workflows Health...');
    
    const workflowFiles = fs.readdirSync(this.workflowsDir)
      .filter(file => file.endsWith('.yml'))
      .filter(file => file.match(/^\d{2}-/));
    
    const categories = {};
    const issues = [];
    
    workflowFiles.forEach(file => {
      const category = file.substring(0, 2);
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(file);
      
      // Check for common issues
      const content = fs.readFileSync(path.join(this.workflowsDir, file), 'utf8');
      
      if (!content.includes('workflow_dispatch')) {
        issues.push(`${file}: Missing manual trigger`);
      }
      
      if (!content.includes('permissions:')) {
        issues.push(`${file}: Missing permissions`);
      }
      
      if (!content.includes('timeout-minutes:')) {
        issues.push(`${file}: Missing timeout configuration`);
      }
    });
    
    this.healthReport.workflows = {
      totalWorkflows: workflowFiles.length,
      categories: Object.keys(categories).length,
      categoryDistribution: categories,
      issues: issues.length,
      issueDetails: issues,
      status: issues.length === 0 ? 'healthy' : issues.length < 5 ? 'good' : 'needs-improvement'
    };
    
    console.log(`  Workflows Status: ${this.healthReport.workflows.status} (${workflowFiles.length} files)`);
  }

  async checkCustomActions() {
    console.log('\n🎬 Checking Custom Actions Health...');
    
    const actionDirs = fs.readdirSync(this.actionsDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    const actionHealth = {};
    let healthyActions = 0;
    
    actionDirs.forEach(actionName => {
      const actionPath = path.join(this.actionsDir, actionName);
      const actionYmlPath = path.join(actionPath, 'action.yml');
      
      const health = {
        hasActionYml: fs.existsSync(actionYmlPath),
        hasDocumentation: false,
        lastModified: null,
        issues: []
      };
      
      if (health.hasActionYml) {
        const stat = fs.statSync(actionYmlPath);
        health.lastModified = stat.mtime.toISOString();
        
        const content = fs.readFileSync(actionYmlPath, 'utf8');
        
        // Check for required fields
        const requiredFields = ['name', 'description', 'inputs', 'runs'];
        requiredFields.forEach(field => {
          if (!content.includes(`${field}:`)) {
            health.issues.push(`Missing ${field} field`);
          }
        });
        
        // Check for Japanese description
        if (!content.match(/[ひらがなカタカナ一-龯]/)) {
          health.issues.push('Missing Japanese documentation');
        }
      } else {
        health.issues.push('Missing action.yml file');
      }
      
      health.status = health.issues.length === 0 ? 'healthy' : 'needs-attention';
      if (health.status === 'healthy') healthyActions++;
      
      actionHealth[actionName] = health;
    });
    
    this.healthReport.actions = {
      totalActions: actionDirs.length,
      healthyActions,
      healthScore: actionDirs.length > 0 ? (healthyActions / actionDirs.length * 100).toFixed(1) : 0,
      actionDetails: actionHealth,
      status: healthyActions === actionDirs.length ? 'healthy' : 
              healthyActions >= actionDirs.length * 0.8 ? 'good' : 'needs-improvement'
    };
    
    console.log(`  Actions Status: ${this.healthReport.actions.status} (${healthyActions}/${actionDirs.length} healthy)`);
  }

  async checkIntegration() {
    console.log('\n🔗 Checking Integration Health...');
    
    // Check links between guidelines and actions README
    const guidelinesContent = fs.existsSync(this.guidelinesPath) ? 
      fs.readFileSync(this.guidelinesPath, 'utf8') : '';
    const actionsReadmeContent = fs.existsSync(path.join(this.actionsDir, 'README.md')) ? 
      fs.readFileSync(path.join(this.actionsDir, 'README.md'), 'utf8') : '';
    
    const crossReferences = {
      guidelinesToActions: guidelinesContent.includes('.github/actions/README.md'),
      actionsToGuidelines: actionsReadmeContent.includes('github-actions-rules.md'),
      workflowReferences: guidelinesContent.includes('REFACTORING_SUMMARY.md')
    };
    
    const integrationScore = Object.values(crossReferences).filter(Boolean).length / 
                            Object.values(crossReferences).length * 100;
    
    this.healthReport.integration = {
      crossReferences,
      integrationScore: integrationScore.toFixed(1),
      status: integrationScore === 100 ? 'healthy' : 
              integrationScore >= 80 ? 'good' : 'needs-improvement'
    };
    
    console.log(`  Integration Status: ${this.healthReport.integration.status} (${integrationScore.toFixed(1)}%)`);
  }

  async generateRecommendations() {
    console.log('\n💡 Generating Recommendations...');
    
    const recommendations = [];
    
    // Guidelines recommendations
    if (this.healthReport.guidelines.status !== 'healthy') {
      recommendations.push({
        priority: 'high',
        category: 'guidelines',
        title: 'Update Guidelines Documentation',
        description: 'Ensure integrated guidelines and actions documentation are up to date'
      });
    }
    
    // Workflows recommendations
    if (this.healthReport.workflows.issues > 0) {
      recommendations.push({
        priority: 'medium',
        category: 'workflows',
        title: 'Fix Workflow Compliance Issues',
        description: `Address ${this.healthReport.workflows.issues} workflow compliance issues`
      });
    }
    
    // Actions recommendations
    if (parseFloat(this.healthReport.actions.healthScore) < 90) {
      recommendations.push({
        priority: 'medium',
        category: 'actions',
        title: 'Improve Custom Actions Health',
        description: 'Update action.yml files and documentation for unhealthy actions'
      });
    }
    
    // Integration recommendations
    if (parseFloat(this.healthReport.integration.integrationScore) < 100) {
      recommendations.push({
        priority: 'low',
        category: 'integration',
        title: 'Enhance Documentation Cross-References',
        description: 'Add missing links between guidelines and actions documentation'
      });
    }
    
    // Performance recommendations
    if (this.healthReport.workflows.totalWorkflows > 50) {
      recommendations.push({
        priority: 'low',
        category: 'performance',
        title: 'Consider Workflow Consolidation',
        description: 'Review workflow count for potential consolidation opportunities'
      });
    }
    
    this.healthReport.recommendations = recommendations;
    
    console.log(`  Generated ${recommendations.length} recommendations`);
  }

  generateReport() {
    console.log('\n📊 HEALTH CHECK SUMMARY');
    console.log('=======================');
    
    const overallHealth = this.calculateOverallHealth();
    
    console.log(`Overall Health: ${overallHealth.status} (${overallHealth.score}%)`);
    console.log(`Guidelines: ${this.healthReport.guidelines.status}`);
    console.log(`Workflows: ${this.healthReport.workflows.status}`);
    console.log(`Actions: ${this.healthReport.actions.status}`);
    console.log(`Integration: ${this.healthReport.integration.status}`);
    
    if (this.healthReport.recommendations.length > 0) {
      console.log('\n📋 Priority Recommendations:');
      this.healthReport.recommendations
        .filter(r => r.priority === 'high')
        .forEach(r => console.log(`  🔴 ${r.title}`));
      
      this.healthReport.recommendations
        .filter(r => r.priority === 'medium')
        .forEach(r => console.log(`  🟡 ${r.title}`));
    }
  }

  calculateOverallHealth() {
    const scores = {
      guidelines: this.healthReport.guidelines.status === 'healthy' ? 100 : 50,
      workflows: this.healthReport.workflows.status === 'healthy' ? 100 : 
                this.healthReport.workflows.status === 'good' ? 80 : 60,
      actions: parseFloat(this.healthReport.actions.healthScore),
      integration: parseFloat(this.healthReport.integration.integrationScore)
    };
    
    const averageScore = Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length;
    
    return {
      score: averageScore.toFixed(1),
      status: averageScore >= 95 ? 'excellent' : 
              averageScore >= 85 ? 'healthy' : 
              averageScore >= 70 ? 'good' : 'needs-improvement'
    };
  }

  saveReport() {
    const reportPath = path.join(this.rootDir, 'github-actions-health-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.healthReport, null, 2));
    
    console.log(`\n📄 Health report saved: ${reportPath}`);
    
    // Also save a human-readable summary
    const summaryPath = path.join(this.rootDir, 'github-actions-health-summary.md');
    this.generateMarkdownSummary(summaryPath);
  }

  generateMarkdownSummary(filePath) {
    const overallHealth = this.calculateOverallHealth();
    
    const summary = `# GitHub Actions Ecosystem Health Report

**Generated:** ${new Date().toLocaleString()}  
**Overall Health:** ${overallHealth.status} (${overallHealth.score}%)

## Component Health Status

| Component | Status | Score | Issues |
|-----------|---------|-------|---------|
| Guidelines | ${this.healthReport.guidelines.status} | - | - |
| Workflows | ${this.healthReport.workflows.status} | - | ${this.healthReport.workflows.issues} |
| Actions | ${this.healthReport.actions.status} | ${this.healthReport.actions.healthScore}% | - |
| Integration | ${this.healthReport.integration.status} | ${this.healthReport.integration.integrationScore}% | - |

## Recommendations

${this.healthReport.recommendations.map(r => 
  `### ${r.priority.toUpperCase()}: ${r.title}\n${r.description}\n`
).join('\n')}

## Metrics

- **Total Workflows:** ${this.healthReport.workflows.totalWorkflows}
- **Total Actions:** ${this.healthReport.actions.totalActions}
- **Healthy Actions:** ${this.healthReport.actions.healthyActions}
- **Cross-References:** ${Object.values(this.healthReport.integration.crossReferences).filter(Boolean).length}/3

---
*This report is generated automatically by the GitHub Actions Health Check System*
`;
    
    fs.writeFileSync(filePath, summary);
    console.log(`📄 Summary saved: ${filePath}`);
  }
}

// Execute health check
if (import.meta.url === `file://${process.argv[1]}`) {
  const healthCheck = new GitHubActionsHealthCheck();
  healthCheck.performHealthCheck().catch(console.error);
}

export default GitHubActionsHealthCheck;