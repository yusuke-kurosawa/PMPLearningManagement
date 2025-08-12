#!/usr/bin/env node

/**
 * GitHub Actions ワークフロー検証ツール
 * ルールブックに基づいてワークフローファイルの準拠性をチェック
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// 設定
const CONFIG = {
  workflowsDir: path.join(__dirname, '..', 'workflows'),
  rulesFile: path.join(__dirname, '..', 'GITHUB_ACTIONS_RULEBOOK.md'),
  outputFormat: process.env.OUTPUT_FORMAT || 'console', // console, json, markdown
  strictMode: process.env.STRICT_MODE === 'true',
};

// 検証ルール
const VALIDATION_RULES = {
  // ファイル名規則
  fileName: {
    pattern: /^(\d{2}-)?([\w-]+)\.yml$/,
    message: 'ファイル名は {優先度}-{カテゴリ}-{機能}.yml の形式に従ってください',
    severity: 'error',
  },
  
  // 必須フィールド
  requiredFields: {
    fields: ['name', 'on', 'jobs'],
    message: '必須フィールドが不足しています',
    severity: 'error',
  },
  
  // ワークフロー名の形式
  workflowName: {
    pattern: /^[🎯🚀📦🧪🔒⚡📊✨👁️🔔🤖⚙️]/,
    message: 'ワークフロー名は適切な絵文字で始まる必要があります',
    severity: 'warning',
  },
  
  // 手動実行トリガー
  manualTrigger: {
    required: true,
    message: 'workflow_dispatch トリガーが必要です',
    severity: 'error',
  },
  
  // タイムアウト設定
  timeout: {
    required: true,
    message: 'ジョブにはtimeout-minutesの設定が必要です',
    severity: 'warning',
  },
  
  // 権限設定
  permissions: {
    required: true,
    message: '明示的な権限設定が必要です',
    severity: 'warning',
  },
  
  // 並行実行制御
  concurrency: {
    required: false,
    message: '並行実行制御の設定を推奨します',
    severity: 'info',
  },
  
  // コメント
  comments: {
    required: true,
    message: 'ヘッダーコメントが必要です',
    severity: 'warning',
  },
};

// 検証結果を格納
const validationResults = {
  totalFiles: 0,
  passed: 0,
  failed: 0,
  warnings: 0,
  errors: [],
  warnings: [],
  info: [],
  fileResults: {},
};

/**
 * ワークフローファイルを検証
 */
function validateWorkflowFile(filePath) {
  const fileName = path.basename(filePath);
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const results = {
    fileName,
    errors: [],
    warnings: [],
    info: [],
    passed: true,
  };
  
  // ファイル名の検証
  if (!VALIDATION_RULES.fileName.pattern.test(fileName)) {
    results.errors.push({
      rule: 'fileName',
      message: VALIDATION_RULES.fileName.message,
    });
    results.passed = false;
  }
  
  // YAMLパース
  let workflow;
  try {
    workflow = yaml.load(fileContent);
  } catch (error) {
    results.errors.push({
      rule: 'yaml',
      message: `YAMLパースエラー: ${error.message}`,
    });
    results.passed = false;
    return results;
  }
  
  // 必須フィールドの検証
  for (const field of VALIDATION_RULES.requiredFields.fields) {
    if (!workflow[field]) {
      results.errors.push({
        rule: 'requiredFields',
        message: `必須フィールド '${field}' が不足しています`,
      });
      results.passed = false;
    }
  }
  
  // ワークフロー名の検証
  if (workflow.name && !VALIDATION_RULES.workflowName.pattern.test(workflow.name)) {
    results.warnings.push({
      rule: 'workflowName',
      message: VALIDATION_RULES.workflowName.message,
    });
  }
  
  // workflow_dispatchトリガーの検証
  if (workflow.on && !workflow.on.workflow_dispatch) {
    results.errors.push({
      rule: 'manualTrigger',
      message: VALIDATION_RULES.manualTrigger.message,
    });
    results.passed = false;
  }
  
  // ジョブの検証
  if (workflow.jobs) {
    for (const [jobName, job] of Object.entries(workflow.jobs)) {
      // タイムアウト設定の確認
      if (!job['timeout-minutes']) {
        results.warnings.push({
          rule: 'timeout',
          message: `ジョブ '${jobName}' にtimeout-minutesが設定されていません`,
        });
      }
      
      // ジョブ名の形式確認
      if (job.name && !job.name.includes('|')) {
        results.info.push({
          rule: 'jobName',
          message: `ジョブ '${jobName}' の名前に日英併記を推奨します`,
        });
      }
    }
  }
  
  // 権限設定の確認
  if (!workflow.permissions) {
    results.warnings.push({
      rule: 'permissions',
      message: VALIDATION_RULES.permissions.message,
    });
  }
  
  // 並行実行制御の確認
  if (!workflow.concurrency) {
    results.info.push({
      rule: 'concurrency',
      message: VALIDATION_RULES.concurrency.message,
    });
  }
  
  // ヘッダーコメントの確認
  if (!fileContent.includes('====================================================================')) {
    results.warnings.push({
      rule: 'comments',
      message: VALIDATION_RULES.comments.message,
    });
  }
  
  return results;
}

/**
 * すべてのワークフローファイルを検証
 */
function validateAllWorkflows() {
  console.log('🔍 GitHub Actions ワークフロー検証開始...\n');
  
  // ワークフローファイルの取得
  const files = fs.readdirSync(CONFIG.workflowsDir)
    .filter(file => file.endsWith('.yml') || file.endsWith('.yaml'))
    .filter(file => !file.includes('template')); // テンプレートは除外
  
  validationResults.totalFiles = files.length;
  
  // 各ファイルを検証
  for (const file of files) {
    const filePath = path.join(CONFIG.workflowsDir, file);
    const results = validateWorkflowFile(filePath);
    
    validationResults.fileResults[file] = results;
    
    if (results.passed && results.warnings.length === 0) {
      validationResults.passed++;
    } else if (!results.passed) {
      validationResults.failed++;
    } else {
      validationResults.warnings++;
    }
    
    // 結果の集約
    validationResults.errors.push(...results.errors.map(e => ({ file, ...e })));
    validationResults.warnings.push(...results.warnings.map(w => ({ file, ...w })));
    validationResults.info.push(...results.info.map(i => ({ file, ...i })));
  }
  
  return validationResults;
}

/**
 * 結果を出力
 */
function outputResults(results) {
  if (CONFIG.outputFormat === 'json') {
    console.log(JSON.stringify(results, null, 2));
    return;
  }
  
  if (CONFIG.outputFormat === 'markdown') {
    outputMarkdown(results);
    return;
  }
  
  // コンソール出力
  console.log('📊 検証結果サマリー');
  console.log('=' .repeat(50));
  console.log(`総ファイル数: ${results.totalFiles}`);
  console.log(`✅ 合格: ${results.passed}`);
  console.log(`⚠️  警告あり: ${results.warnings}`);
  console.log(`❌ 不合格: ${results.failed}`);
  console.log('=' .repeat(50));
  
  // エラーの詳細
  if (results.errors.length > 0) {
    console.log('\n❌ エラー:');
    for (const error of results.errors) {
      console.log(`  - ${error.file}: ${error.message}`);
    }
  }
  
  // 警告の詳細
  if (results.warnings.length > 0) {
    console.log('\n⚠️  警告:');
    for (const warning of results.warnings) {
      console.log(`  - ${warning.file}: ${warning.message}`);
    }
  }
  
  // 情報の詳細
  if (results.info.length > 0 && !CONFIG.strictMode) {
    console.log('\nℹ️  推奨事項:');
    for (const info of results.info.slice(0, 10)) {
      console.log(`  - ${info.file}: ${info.message}`);
    }
    if (results.info.length > 10) {
      console.log(`  ... 他 ${results.info.length - 10} 件`);
    }
  }
  
  // 最終判定
  console.log('\n' + '=' .repeat(50));
  if (results.failed === 0 && (CONFIG.strictMode ? results.warnings.length === 0 : true)) {
    console.log('✅ すべてのワークフローがルールに準拠しています！');
  } else {
    console.log('⚠️  改善が必要なワークフローがあります。');
    console.log('詳細は上記のエラーと警告を確認してください。');
  }
}

/**
 * Markdown形式で出力
 */
function outputMarkdown(results) {
  const markdown = `# GitHub Actions ワークフロー検証レポート

## 📊 サマリー

| 項目 | 数値 |
|-----|------|
| 総ファイル数 | ${results.totalFiles} |
| ✅ 合格 | ${results.passed} |
| ⚠️ 警告あり | ${results.warnings} |
| ❌ 不合格 | ${results.failed} |

## 詳細結果

### ❌ エラー (${results.errors.length}件)

${results.errors.map(e => `- **${e.file}**: ${e.message}`).join('\n')}

### ⚠️ 警告 (${results.warnings.length}件)

${results.warnings.map(w => `- **${w.file}**: ${w.message}`).join('\n')}

### ℹ️ 推奨事項 (${results.info.length}件)

${results.info.slice(0, 20).map(i => `- **${i.file}**: ${i.message}`).join('\n')}

## 推奨アクション

1. エラーを修正してルールに準拠させる
2. 警告を確認して改善を検討する
3. 推奨事項を参考に品質を向上させる

---

*生成日時: ${new Date().toISOString()}*
`;
  
  console.log(markdown);
}

/**
 * メイン処理
 */
function main() {
  try {
    // ワークフローディレクトリの存在確認
    if (!fs.existsSync(CONFIG.workflowsDir)) {
      console.error(`エラー: ワークフローディレクトリが見つかりません: ${CONFIG.workflowsDir}`);
      process.exit(1);
    }
    
    // 検証実行
    const results = validateAllWorkflows();
    
    // 結果出力
    outputResults(results);
    
    // 終了コード
    if (CONFIG.strictMode) {
      process.exit(results.failed > 0 || results.warnings.length > 0 ? 1 : 0);
    } else {
      process.exit(results.failed > 0 ? 1 : 0);
    }
  } catch (error) {
    console.error(`エラー: ${error.message}`);
    process.exit(1);
  }
}

// CLIとして実行された場合
if (require.main === module) {
  main();
}

// モジュールとしてエクスポート
module.exports = {
  validateWorkflowFile,
  validateAllWorkflows,
  VALIDATION_RULES,
};