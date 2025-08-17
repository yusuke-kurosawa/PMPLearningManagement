#!/usr/bin/env node

/**
 * GitHub Actions Workflow Automated Refactorer
 * Purpose: Automatically refactor workflows to comply with defined rules
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

// Category mapping for file naming
const CATEGORY_MAP = {
  'deploy': '01-deploy',
  'ci': '01-ci',
  'cd': '01-cd',
  'core': '01-core',
  'quality': '02-quality',
  'test': '02-test',
  'security': '03-security',
  'sec': '03-security',
  'monitoring': '04-monitoring',
  'perf': '04-monitoring',
  'performance': '04-monitoring',
  'integration': '04-integration',
  'automation': '05-automation',
  'ai': '05-automation',
  'claude': '05-automation',
  'compliance': '06-compliance',
  'idd': '06-compliance',
  'notification': '07-notification',
  'self-healing': '07-self-healing',
  'weekly': '07-notification',
  'docs': '08-developer',
  'developer': '08-developer',
  'reusable': '09-reusable',
  'bundle': '04-monitoring',
  'lighthouse': '04-monitoring',
  'image': '04-monitoring',
  'content': '02-quality',
  'balanced': '01-ci',
  'minimal': '01-core',
  'master': '00-meta'
};

// Emoji mapping for workflow names
const EMOJI_MAP = {
  '00': '🎯',
  '01': '📦',
  '02': '🧪',
  '03': '🔒',
  '04': '📊',
  '05': '🤖',
  '06': '⚖️',
  '07': '🔔',
  '08': '🔧',
  '09': '♻️'
};

class WorkflowRefactorer {
  constructor(workflowDir) {
    this.workflowDir = workflowDir;
    this.refactoredCount = 0;
    this.errors = [];
  }

  refactorAllWorkflows() {
    const files = fs.readdirSync(this.workflowDir)
      .filter(f => f.endsWith('.yml') && !f.startsWith('.'));
    
    console.log(`🔧 Refactoring ${files.length} workflow files...\n`);
    
    files.forEach(file => {
      try {
        this.refactorWorkflow(file);
        this.refactoredCount++;
      } catch (error) {
        this.errors.push({ file, error: error.message });
        console.error(`❌ Error refactoring ${file}: ${error.message}`);
      }
    });
    
    console.log(`\n✅ Successfully refactored ${this.refactoredCount}/${files.length} workflows`);
    if (this.errors.length > 0) {
      console.log(`\n❌ Errors encountered:`);
      this.errors.forEach(e => console.log(`  - ${e.file}: ${e.error}`));
    }
  }

  refactorWorkflow(fileName) {
    const filePath = path.join(this.workflowDir, fileName);
    const content = fs.readFileSync(filePath, 'utf8');
    let workflow;
    
    try {
      workflow = yaml.load(content);
    } catch (e) {
      console.error(`⚠️  Skipping ${fileName} - YAML parse error`);
      return;
    }
    
    // Determine new file name
    const newFileName = this.generateNewFileName(fileName, workflow);
    
    // Generate refactored content
    const refactoredContent = this.generateRefactoredContent(workflow, fileName, newFileName);
    
    // Write refactored workflow
    const newFilePath = path.join(this.workflowDir, newFileName);
    fs.writeFileSync(newFilePath, refactoredContent);
    
    // Remove old file if name changed
    if (fileName !== newFileName) {
      fs.unlinkSync(filePath);
      console.log(`✅ Renamed and refactored: ${fileName} → ${newFileName}`);
    } else {
      console.log(`✅ Refactored: ${fileName}`);
    }
  }

  generateNewFileName(oldFileName, workflow) {
    // Check if already compliant
    if (/^\d{2}-[a-z]+-[a-z-]+\.yml$/.test(oldFileName)) {
      return oldFileName;
    }
    
    // Extract category from old file name or workflow name
    const baseName = oldFileName.replace('.yml', '').toLowerCase();
    let category = null;
    let description = baseName;
    
    // Find matching category
    for (const [key, value] of Object.entries(CATEGORY_MAP)) {
      if (baseName.includes(key)) {
        category = value;
        description = baseName.replace(key, '').replace(/^-+|-+$/g, '');
        break;
      }
    }
    
    // Default category if not found
    if (!category) {
      if (baseName.includes('reusable')) category = '09-reusable';
      else if (workflow.on && workflow.on.workflow_call) category = '09-reusable';
      else category = '01-core';
    }
    
    // Clean description
    description = description
      .replace(/_/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/^-+|-+$/g, '')
      .substring(0, 30);
    
    if (!description) {
      description = 'workflow';
    }
    
    return `${category}-${description}.yml`;
  }

  generateRefactoredContent(workflow, oldFileName, newFileName) {
    const categoryNum = newFileName.substring(0, 2);
    const emoji = EMOJI_MAP[categoryNum] || '🔧';
    const categoryName = this.getCategoryName(categoryNum);
    
    // Update workflow name with emoji and Japanese
    if (!workflow.name || !workflow.name.match(/^[🔒📦🧪📊🤖⚖️🔔🔧🎯♻️]/)) {
      const baseName = workflow.name || oldFileName.replace('.yml', '');
      workflow.name = `${emoji} ${categoryName} - ${this.toTitleCase(baseName)}`;
    }
    
    // Add permissions if missing
    if (!workflow.permissions) {
      workflow.permissions = {
        contents: 'read',
        actions: 'read',
        checks: 'write',
        'pull-requests': 'write'
      };
    }
    
    // Add concurrency if missing
    if (!workflow.concurrency) {
      workflow.concurrency = {
        group: '${{ github.workflow }}-${{ github.ref }}',
        'cancel-in-progress': '${{ github.ref != \'refs/heads/main\' }}'
      };
    }
    
    // Add workflow_dispatch if missing
    if (workflow.on && !workflow.on.workflow_dispatch && !workflow.on.workflow_call) {
      if (typeof workflow.on === 'string') {
        workflow.on = { [workflow.on]: null, workflow_dispatch: null };
      } else if (Array.isArray(workflow.on)) {
        const triggers = {};
        workflow.on.forEach(t => triggers[t] = null);
        triggers.workflow_dispatch = null;
        workflow.on = triggers;
      } else {
        workflow.on.workflow_dispatch = null;
      }
    }
    
    // Add timeout and Japanese names to jobs
    if (workflow.jobs) {
      Object.entries(workflow.jobs).forEach(([jobName, job]) => {
        // Add timeout if missing
        if (!job['timeout-minutes']) {
          job['timeout-minutes'] = 30;
        }
        
        // Add Japanese name if missing
        if (!job.name || !/[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff]/.test(job.name)) {
          const japName = this.getJapaneseName(jobName);
          job.name = `${japName} ${job.name || jobName}`;
        }
        
        // Ensure proper job structure
        workflow.jobs[jobName] = job;
      });
    }
    
    // Generate header comment
    const header = this.generateHeader(workflow, categoryName, newFileName);
    
    // Convert workflow to YAML
    const yamlContent = yaml.dump(workflow, {
      lineWidth: -1,
      noRefs: true,
      sortKeys: false
    });
    
    return header + '\n' + yamlContent;
  }

  generateHeader(workflow, categoryName, fileName) {
    const triggers = workflow.on ? Object.keys(typeof workflow.on === 'object' ? workflow.on : { [workflow.on]: null }).join(', ') : 'manual';
    const jobNames = workflow.jobs ? Object.keys(workflow.jobs).join(', ') : '';
    
    return `# ====================================================================
# ${workflow.name}
# ====================================================================
# 目的: ${this.getWorkflowPurpose(workflow, fileName)}
#
# 実行タイミング:
#   - ${this.getTriggerDescription(workflow.on)}
#
# 主な処理:
#   ${this.getMainProcesses(workflow.jobs)}
#
# 依存関係: Node.js, npm, GitHub Actions
# 実行時間目安: 約10-15分
# 最終更新: ${new Date().toISOString().split('T')[0]}
# ====================================================================
`;
  }

  getCategoryName(categoryNum) {
    const names = {
      '00': 'メタ検証',
      '01': 'CI/CD',
      '02': '品質・テスト',
      '03': 'セキュリティ',
      '04': '監視・統合',
      '05': '自動化・AI',
      '06': 'コンプライアンス',
      '07': '通知・自己修復',
      '08': '開発者支援',
      '09': '再利用可能'
    };
    return names[categoryNum] || '一般';
  }

  getJapaneseName(jobName) {
    const nameMap = {
      'setup': '🔧 セットアップ:',
      'build': '🏗️ ビルド:',
      'test': '🧪 テスト:',
      'deploy': '🚀 デプロイ:',
      'security': '🔒 セキュリティ:',
      'lint': '📝 リント:',
      'quality': '✅ 品質:',
      'performance': '⚡ パフォーマンス:',
      'validation': '✔️ 検証:',
      'notification': '🔔 通知:',
      'report': '📊 レポート:',
      'analysis': '🔍 分析:',
      'audit': '📋 監査:',
      'check': '✓ チェック:',
      'scan': '🔍 スキャン:',
      'monitor': '📊 監視:',
      'integration': '🔗 統合:',
      'optimization': '⚡ 最適化:',
      'documentation': '📚 ドキュメント:',
      'claude': '🤖 Claude:',
      'ai': '🤖 AI:',
      'compliance': '⚖️ コンプライアンス:',
      'idd': '📋 IDD:',
      'healing': '🔧 自己修復:',
      'summary': '📊 サマリー:'
    };
    
    for (const [key, value] of Object.entries(nameMap)) {
      if (jobName.toLowerCase().includes(key)) {
        return value;
      }
    }
    return '📌 処理:';
  }

  getWorkflowPurpose(workflow, fileName) {
    const name = workflow.name || fileName;
    if (name.includes('deploy')) return 'プロダクション環境へのデプロイメントと検証';
    if (name.includes('security')) return 'セキュリティスキャンと脆弱性検査';
    if (name.includes('test')) return 'テスト実行と品質保証';
    if (name.includes('ci')) return '継続的インテグレーション';
    if (name.includes('cd')) return '継続的デプロイメント';
    if (name.includes('performance')) return 'パフォーマンス監視と最適化';
    if (name.includes('claude')) return 'Claude AI統合と自動化';
    if (name.includes('idd')) return 'Issue-Driven Development準拠チェック';
    if (name.includes('quality')) return 'コード品質チェックと改善';
    if (name.includes('monitoring')) return 'システム監視とメトリクス収集';
    return 'ワークフロー自動実行';
  }

  getTriggerDescription(on) {
    if (!on) return '手動実行のみ';
    
    const triggers = [];
    if (typeof on === 'string') {
      triggers.push(on);
    } else if (Array.isArray(on)) {
      triggers.push(...on);
    } else {
      triggers.push(...Object.keys(on));
    }
    
    const descriptions = triggers.map(t => {
      switch(t) {
        case 'push': return 'コードプッシュ時';
        case 'pull_request': return 'プルリクエスト作成・更新時';
        case 'workflow_dispatch': return '手動実行';
        case 'schedule': return 'スケジュール実行';
        case 'workflow_call': return '他ワークフローからの呼び出し';
        case 'release': return 'リリース作成時';
        case 'issues': return 'Issue作成・更新時';
        default: return t;
      }
    });
    
    return descriptions.join('\n#   - ');
  }

  getMainProcesses(jobs) {
    if (!jobs) return '1. デフォルト処理';
    
    const processes = Object.entries(jobs).map(([name, job], index) => {
      const jobName = job.name || name;
      return `${index + 1}. ${jobName}`;
    });
    
    return processes.join('\n#   ');
  }

  toTitleCase(str) {
    return str
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }
}

// Main execution
const workflowDir = path.join(__dirname, '..');
const refactorer = new WorkflowRefactorer(workflowDir);

console.log('🚀 Starting GitHub Actions Workflow Refactoring...\n');
console.log('📂 Workflow directory:', workflowDir);
console.log('=' .repeat(60));

refactorer.refactorAllWorkflows();

console.log('\n=' .repeat(60));
console.log('✨ Refactoring complete!');
console.log('📋 Next steps:');
console.log('  1. Review the refactored workflows');
console.log('  2. Test workflows locally');
console.log('  3. Commit changes with appropriate message');
console.log('  4. Monitor workflow execution in GitHub Actions');

export default WorkflowRefactorer;