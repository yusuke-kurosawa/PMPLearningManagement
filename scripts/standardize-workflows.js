#!/usr/bin/env node

/**
 * GitHub Actions ワークフロー標準化スクリプト
 * 命名規則の適用とコメント規則の統一
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// ワークフローディレクトリ
const WORKFLOWS_DIR = path.join(__dirname, '..', '.github', 'workflows');

// 命名規則マッピング
const NAMING_RULES = {
  // CI関連
  'ci-basic-checks.yml': 'ci-01-basic-checks.yml',
  'ci-build-main.yml': 'ci-02-build-main.yml',
  'ci-main-pipeline.yml': 'ci-03-main-pipeline.yml',
  '01-ci-continuous-integration.yml': 'ci-04-continuous-integration.yml',
  '02-ci-basic-validation.yml': 'ci-05-basic-validation.yml',
  'integration-test.yml': 'ci-06-integration-test.yml',
  '04-integration-full-test.yml': 'ci-07-full-integration-test.yml',
  
  // CD関連
  'deploy.yml': 'cd-01-deploy-pages.yml',
  '02-cd-continuous-deployment.yml': 'cd-02-continuous-deployment.yml',
  'cd-deploy-production.yml': 'cd-03-deploy-production.yml',
  'cd-production-deployment.yml': 'cd-04-production-deployment.yml',
  
  // QA関連
  'test.yml': 'qa-01-test-suite.yml',
  'quality-assurance.yml': 'qa-02-quality-assurance.yml',
  '01-quality-comprehensive-check.yml': 'qa-03-comprehensive-check.yml',
  'advanced-quality-gates.yml': 'qa-04-advanced-gates.yml',
  'advanced-testing.yml': 'qa-05-advanced-testing.yml',
  'content-quality-assurance.yml': 'qa-06-content-quality.yml',
  'lighthouse-ci.yml': 'qa-07-lighthouse-ci.yml',
  
  // Security関連
  'security-scan.yml': 'sec-01-basic-scan.yml',
  '04-security-devsecops.yml': 'sec-02-devsecops.yml',
  'security-comprehensive-scan.yml': 'sec-03-comprehensive-scan.yml',
  'sec-scan-comprehensive.yml': 'sec-04-scan-comprehensive.yml',
  'infrastructure-security.yml': 'sec-05-infrastructure.yml',
  
  // Performance関連
  '02-performance-optimization.yml': 'perf-01-optimization.yml',
  '05-performance-monitoring.yml': 'perf-02-monitoring.yml',
  'performance-monitoring.yml': 'perf-03-monitoring-basic.yml',
  'perf-monitoring-comprehensive.yml': 'perf-04-monitoring-comprehensive.yml',
  'performance-budget.yml': 'perf-05-budget.yml',
  'bundle-analysis.yml': 'perf-06-bundle-analysis.yml',
  
  // IDD関連
  'issue-driven-development.yml': 'idd-01-core.yml',
  'idd-compliance.yml': 'idd-02-compliance.yml',
  'idd-metrics-collector.yml': 'idd-03-metrics.yml',
  'idd-compliance-monitor.yml': 'idd-04-monitor.yml',
  'idd-auto-labeling.yml': 'idd-05-auto-labeling.yml',
  'idd-pr-issue-link.yml': 'idd-06-pr-issue-link.yml',
  '01-idd-core-validation.yml': 'idd-07-core-validation.yml',
  
  // Claude/AI関連
  'claude-pr-review.yml': 'ai-01-claude-pr-review.yml',
  'claude-pr-review-enhanced.yml': 'ai-02-claude-pr-review-enhanced.yml',
  '01-claude-code-review.yml': 'ai-03-claude-code-review.yml',
  'claude-assistant.yml': 'ai-04-claude-assistant.yml',
  'claude-issue-handler.yml': 'ai-05-claude-issue-handler.yml',
  'claude-docs-sync.yml': 'ai-06-claude-docs-sync.yml',
  'claude-logger.yml': 'ai-07-claude-logger.yml',
  'ai-claude-integration.yml': 'ai-08-claude-integration.yml',
  'ai-monitoring-analytics.yml': 'ai-09-monitoring-analytics.yml',
  'ai-assisted-review.yml': 'ai-10-assisted-review.yml',
  'claudecode-ai-integration.yml': 'ai-11-claudecode-integration.yml',
  'claude-ai-weekly-monitoring.yml': 'ai-12-weekly-monitoring.yml',
  'weekly-claude-summary.yml': 'ai-13-weekly-summary.yml',
  
  // DevOps/Infrastructure関連
  'monitoring-setup.yml': 'ops-01-monitoring-setup.yml',
  'observability.yml': 'ops-02-observability.yml',
  'cost-optimization.yml': 'ops-03-cost-optimization.yml',
  'compliance-audit.yml': 'ops-04-compliance-audit.yml',
  'notifications.yml': 'ops-05-notifications.yml',
  'developer-experience.yml': 'ops-06-developer-experience.yml',
  'feature-management.yml': 'ops-07-feature-management.yml',
  'dependency-health-check.yml': 'ops-08-dependency-health.yml',
  'dependabot-auto-merge.yml': 'ops-09-dependabot-merge.yml',
  'image-optimization.yml': 'ops-10-image-optimization.yml',
  
  // メタ/管理関連
  '00-meta-workflow-validator.yml': 'meta-01-workflow-validator.yml',
  '00-template-workflow.yml': 'meta-02-template.yml',
  'devops-workflow-template.yml': 'meta-03-devops-template.yml',
  'master-devops-orchestrator.yml': 'meta-04-orchestrator.yml',
  'world-class-devops-benchmark.yml': 'meta-05-benchmark.yml',
  'enhanced-automation.yml': 'meta-06-automation.yml',
  '07-self-healing-system.yml': 'meta-07-self-healing.yml',
  
  // Reusable workflows
  'reusable-setup.yml': 'reusable-01-setup.yml',
  'reusable-tests.yml': 'reusable-02-tests.yml',
  
  // その他
  'pr-validation.yml': 'misc-01-pr-validation.yml',
  'test-data-management.yml': 'misc-02-test-data.yml',
  'docs-devops-documentation.yml': 'docs-01-devops.yml',
};

// サブディレクトリ内のワークフロー
const SUBDIRECTORY_MAPPINGS = {
  'idd/00-idd-meta-validator.yml': 'idd/meta-validator.yml',
  'idd/01-idd-issue-generator.yml': 'idd/issue-generator.yml',
  'idd/02-idd-pr-automation.yml': 'idd/pr-automation.yml',
  'claudecode/claude-code-integration.yml': 'claudecode/integration.yml',
};

/**
 * ワークフローファイルに標準コメントヘッダーを追加
 */
function addStandardHeader(filePath, category) {
  const content = fs.readFileSync(filePath, 'utf8');
  const fileName = path.basename(filePath);
  
  // すでにヘッダーがある場合はスキップ
  if (content.startsWith('# ====')) {
    return;
  }
  
  const categoryDescriptions = {
    'ci': 'Continuous Integration',
    'cd': 'Continuous Deployment',
    'qa': 'Quality Assurance',
    'sec': 'Security',
    'perf': 'Performance',
    'idd': 'Issue-Driven Development',
    'ai': 'AI/Claude Integration',
    'ops': 'DevOps/Infrastructure',
    'meta': 'Meta/Management',
    'reusable': 'Reusable Workflow',
    'misc': 'Miscellaneous',
    'docs': 'Documentation'
  };
  
  const categoryDesc = categoryDescriptions[category] || 'General';
  
  const header = `# ============================================================================
# Workflow: ${fileName}
# Category: ${categoryDesc}
# Description: ${extractDescription(content)}
# Trigger: ${extractTrigger(content)}
# Dependencies: ${extractDependencies(content)}
# ============================================================================

`;
  
  fs.writeFileSync(filePath, header + content);
}

/**
 * ワークフロー内容から説明を抽出
 */
function extractDescription(content) {
  try {
    const doc = yaml.load(content);
    if (doc && doc.name) {
      return doc.name;
    }
  } catch (e) {
    // YAMLパースエラーの場合は無視
  }
  return 'Workflow automation';
}

/**
 * トリガー情報を抽出
 */
function extractTrigger(content) {
  try {
    const doc = yaml.load(content);
    if (doc && doc.on) {
      if (typeof doc.on === 'string') {
        return doc.on;
      }
      return Object.keys(doc.on).join(', ');
    }
  } catch (e) {
    // YAMLパースエラーの場合は無視
  }
  return 'Various';
}

/**
 * 依存関係を抽出
 */
function extractDependencies(content) {
  const dependencies = [];
  
  // workflow_call依存関係をチェック
  if (content.includes('workflow_call:')) {
    dependencies.push('Called by other workflows');
  }
  
  // uses:で他のワークフローを呼び出しているかチェック
  const usesPattern = /uses:\s+\.\/\.github\/workflows\/([\w-]+\.yml)/g;
  let match;
  while ((match = usesPattern.exec(content)) !== null) {
    dependencies.push(match[1]);
  }
  
  return dependencies.length > 0 ? dependencies.join(', ') : 'None';
}

/**
 * メイン処理
 */
async function main() {
  console.log('🔧 GitHub Actions ワークフロー標準化を開始します...\n');
  
  // ワークフローディレクトリの存在確認
  if (!fs.existsSync(WORKFLOWS_DIR)) {
    console.error('❌ ワークフローディレクトリが見つかりません:', WORKFLOWS_DIR);
    process.exit(1);
  }
  
  const renameOperations = [];
  const skippedFiles = [];
  
  // リネーム操作の収集
  for (const [oldName, newName] of Object.entries(NAMING_RULES)) {
    const oldPath = path.join(WORKFLOWS_DIR, oldName);
    const newPath = path.join(WORKFLOWS_DIR, newName);
    
    if (fs.existsSync(oldPath)) {
      // 新しいファイル名が既に存在する場合
      if (fs.existsSync(newPath) && oldPath !== newPath) {
        skippedFiles.push({ oldName, newName, reason: 'Target file already exists' });
        continue;
      }
      
      renameOperations.push({ oldPath, newPath, oldName, newName });
    }
  }
  
  // サブディレクトリ内のファイル処理
  for (const [oldName, newName] of Object.entries(SUBDIRECTORY_MAPPINGS)) {
    const oldPath = path.join(WORKFLOWS_DIR, oldName);
    const newPath = path.join(WORKFLOWS_DIR, newName);
    
    if (fs.existsSync(oldPath)) {
      if (fs.existsSync(newPath) && oldPath !== newPath) {
        skippedFiles.push({ oldName, newName, reason: 'Target file already exists' });
        continue;
      }
      
      renameOperations.push({ oldPath, newPath, oldName, newName });
    }
  }
  
  // リネーム実行
  console.log('📝 ファイル名を標準化しています...\n');
  
  for (const op of renameOperations) {
    try {
      fs.renameSync(op.oldPath, op.newPath);
      console.log(`✅ ${op.oldName} → ${op.newName}`);
      
      // カテゴリを抽出してヘッダーを追加
      const category = op.newName.split('-')[0];
      addStandardHeader(op.newPath, category);
    } catch (error) {
      console.error(`❌ リネーム失敗: ${op.oldName}`, error.message);
    }
  }
  
  // 既存のファイルにもヘッダーを追加
  console.log('\n📝 標準ヘッダーを追加しています...\n');
  
  const allWorkflows = fs.readdirSync(WORKFLOWS_DIR)
    .filter(file => file.endsWith('.yml'))
    .map(file => path.join(WORKFLOWS_DIR, file));
  
  for (const workflowPath of allWorkflows) {
    const fileName = path.basename(workflowPath);
    const category = fileName.split('-')[0];
    
    try {
      addStandardHeader(workflowPath, category);
      console.log(`✅ ヘッダー追加: ${fileName}`);
    } catch (error) {
      console.error(`❌ ヘッダー追加失敗: ${fileName}`, error.message);
    }
  }
  
  // スキップされたファイルの報告
  if (skippedFiles.length > 0) {
    console.log('\n⚠️  スキップされたファイル:');
    skippedFiles.forEach(file => {
      console.log(`  - ${file.oldName} (理由: ${file.reason})`);
    });
  }
  
  // サマリー
  console.log('\n📊 標準化完了サマリー:');
  console.log(`  - リネーム実行: ${renameOperations.length} ファイル`);
  console.log(`  - スキップ: ${skippedFiles.length} ファイル`);
  console.log(`  - ヘッダー追加: ${allWorkflows.length} ファイル`);
  
  console.log('\n✨ ワークフロー標準化が完了しました！');
}

// 実行
main().catch(error => {
  console.error('❌ エラーが発生しました:', error);
  process.exit(1);
});