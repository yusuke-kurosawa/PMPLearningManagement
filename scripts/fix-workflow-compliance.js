#!/usr/bin/env node

/**
 * GitHub Actions Workflow Compliance Auto-Fix Script
 * Purpose: Automatically fix common compliance issues in GitHub Actions workflows
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

// Emoji mappings based on category
const CATEGORY_EMOJIS = {
  '00': '🎯', // Meta/Orchestration
  '01': '🚀', // CI/Core/Deploy  
  '02': '🧪', // Quality/Test/Performance
  '03': '🔒', // Security
  '04': '📊', // Monitoring/Integration
  '05': '🤖', // Automation/Performance
  '07': '♻️', // Self-healing
  '08': '🔧', // Developer tools
  '09': '🔄'  // Reusable components
};

// Japanese job name translations
const JOB_NAME_TRANSLATIONS = {
  'setup': 'セットアップ',
  'build': 'ビルド',
  'test': 'テスト',
  'deploy': 'デプロイ',
  'lint': 'リント',
  'format': 'フォーマット',
  'validate': '検証',
  'scan': 'スキャン',
  'check': 'チェック',
  'analysis': '分析',
  'report': 'レポート',
  'monitor': '監視',
  'security': 'セキュリティ',
  'performance': 'パフォーマンス',
  'documentation': 'ドキュメント',
  'notification': '通知',
  'cleanup': 'クリーンアップ',
  'optimization': '最適化',
  'validation': '検証',
  'execution': '実行',
  'preparation': '準備'
};

class WorkflowComplianceFixer {
  constructor() {
    this.workflowsDir = path.resolve(__dirname, '..', '.github', 'workflows');
    this.fixedCount = 0;
    this.errorCount = 0;
    this.issues = [];
  }

  async fixAllWorkflows() {
    console.log('🔧 GitHub Actions Workflow Compliance Auto-Fix');
    console.log('===============================================');
    
    const workflowFiles = fs.readdirSync(this.workflowsDir)
      .filter(file => file.endsWith('.yml') && file.match(/^\d{2}-/))
      .sort();

    console.log(`Found ${workflowFiles.length} workflow files to process\n`);

    for (const file of workflowFiles) {
      await this.fixWorkflow(file);
    }

    this.generateSummary();
  }

  async fixWorkflow(filename) {
    try {
      console.log(`🔍 Processing: ${filename}`);
      const filePath = path.join(this.workflowsDir, filename);
      const content = fs.readFileSync(filePath, 'utf8');
      
      let workflow;
      try {
        workflow = yaml.load(content);
      } catch (error) {
        console.log(`  ❌ YAML parsing error: ${error.message}`);
        this.errorCount++;
        return;
      }

      let modified = false;
      const fixes = [];

      // Fix 1: Add/fix emoji prefix in workflow name
      if (workflow.name) {
        const category = filename.substring(0, 2);
        const emoji = CATEGORY_EMOJIS[category] || '🔧';
        
        if (!workflow.name.match(/^[🎯📦🧪🔒📊🤖♻️🔧🔄]/)) {
          const oldName = workflow.name;
          workflow.name = `${emoji} ${workflow.name.replace(/^[\s"']+|[\s"']+$/g, '')}`;
          fixes.push(`Added emoji prefix: ${oldName} → ${workflow.name}`);
          modified = true;
        }
      }

      // Fix 2: Add workflow_dispatch if missing
      if (!workflow.on || !workflow.on.workflow_dispatch) {
        if (!workflow.on) workflow.on = {};
        workflow.on.workflow_dispatch = {
          inputs: {
            debug:  {
              description: 'デバッグモードを有効にする',
              required: false,
              default: 'false',
              type: 'boolean'
            }
          }
        };
        fixes.push('Added workflow_dispatch trigger');
        modified = true;
      }

      // Fix 3: Add permissions if missing
      if (!workflow.permissions) {
        workflow.permissions = {
          contents: 'read',
          actions: 'read',
          checks: 'write'
        };
        fixes.push('Added basic permissions');
        modified = true;
      }

      // Fix 4: Add concurrency if missing
      if (!workflow.concurrency) {
        workflow.concurrency = {
          group: '${{ github.workflow }}-${{ github.ref }}',
          'cancel-in-progress': '${{ github.ref != \'refs/heads/main\' }}'
        };
        fixes.push('Added concurrency control');
        modified = true;
      }

      // Fix 5: Add Japanese job names
      if (workflow.jobs) {
        Object.entries(workflow.jobs).forEach(([jobKey, job]) => {
          if (!job.name || !/[ひらがなカタカナ一-龯]/.test(job.name)) {
            const translatedName = this.translateJobName(jobKey);
            job.name = `🔧 ${translatedName}: ${jobKey}`;
            fixes.push(`Added Japanese name for job: ${jobKey}`);
            modified = true;
          }

          // Add timeout if missing
          if (!job['timeout-minutes']) {
            job['timeout-minutes'] = 15;
            fixes.push(`Added timeout for job: ${jobKey}`);
            modified = true;
          }
        });
      }

      if (modified) {
        // Write back the modified workflow
        const newContent = yaml.dump(workflow, {
          lineWidth: 120,
          noRefs: true,
          quotingType: '"',
          forceQuotes: false
        });

        fs.writeFileSync(filePath, newContent);
        console.log(`  ✅ Fixed (${fixes.length} issues)`);
        fixes.forEach(fix => console.log(`     - ${fix}`));
        this.fixedCount++;
      } else {
        console.log(`  ✅ Already compliant`);
      }

    } catch (error) {
      console.log(`  ❌ Error processing ${filename}: ${error.message}`);
      this.errorCount++;
      this.issues.push({ file: filename, error: error.message });
    }
  }

  translateJobName(jobKey) {
    // Simple translation based on common patterns
    const key = jobKey.toLowerCase().replace(/[-_]/g, '');
    
    for (const [english, japanese] of Object.entries(JOB_NAME_TRANSLATIONS)) {
      if (key.includes(english)) {
        return japanese;
      }
    }
    
    // Fallback to generic translation
    if (key.includes('test')) return 'テスト';
    if (key.includes('build')) return 'ビルド';
    if (key.includes('deploy')) return 'デプロイ';
    if (key.includes('check')) return 'チェック';
    
    return '処理';
  }

  generateSummary() {
    console.log('\n📊 COMPLIANCE FIX SUMMARY');
    console.log('==========================');
    console.log(`✅ Fixed workflows: ${this.fixedCount}`);
    console.log(`❌ Errors: ${this.errorCount}`);
    
    if (this.issues.length > 0) {
      console.log('\n❌ Issues encountered:');
      this.issues.forEach(issue => {
        console.log(`  - ${issue.file}: ${issue.error}`);
      });
    }

    if (this.fixedCount > 0) {
      console.log('\n🎉 Compliance improvements applied!');
      console.log('Next steps:');
      console.log('1. Review the changes');
      console.log('2. Test the workflows');
      console.log('3. Commit the improvements');
    }
  }
}

// Install js-yaml if not available
try {
  await import('js-yaml');
} catch (error) {
  console.log('Installing js-yaml...');
  const { exec } = await import('child_process');
  exec('npm install js-yaml', (error) => {
    if (error) {
      console.error('Failed to install js-yaml:', error);
      process.exit(1);
    }
  });
}

// Execute compliance fixes
if (import.meta.url === `file://${process.argv[1]}`) {
  const fixer = new WorkflowComplianceFixer();
  fixer.fixAllWorkflows().catch(console.error);
}

export default WorkflowComplianceFixer;