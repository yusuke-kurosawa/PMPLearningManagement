#!/usr/bin/env node

/**
 * ESLintレポート分析スクリプト
 */

const fs = require('fs');
const path = require('path');

// ESLintレポートを読み込み
const reportPath = path.join(process.cwd(), 'eslint-report.json');
const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));

// 統計情報を集計
const stats = {
  totalFiles: report.length,
  filesWithErrors: 0,
  filesWithWarnings: 0,
  totalErrors: 0,
  totalWarnings: 0,
  errorsByRule: {},
  warningsByRule: {},
  filesByErrorCount: []
};

// 各ファイルを分析
report.forEach(file => {
  if (file.errorCount > 0) {
    stats.filesWithErrors++;
    stats.totalErrors += file.errorCount;
    stats.filesByErrorCount.push({
      file: file.filePath.replace(process.cwd(), '.'),
      errors: file.errorCount,
      warnings: file.warningCount
    });
  }
  
  if (file.warningCount > 0) {
    stats.filesWithWarnings++;
    stats.totalWarnings += file.warningCount;
  }
  
  // ルール別にエラーを集計
  file.messages.forEach(msg => {
    if (msg.severity === 2) { // Error
      stats.errorsByRule[msg.ruleId] = (stats.errorsByRule[msg.ruleId] || 0) + 1;
    } else if (msg.severity === 1) { // Warning
      stats.warningsByRule[msg.ruleId] = (stats.warningsByRule[msg.ruleId] || 0) + 1;
    }
  });
});

// エラーが多い順にソート
stats.filesByErrorCount.sort((a, b) => b.errors - a.errors);

// レポート出力
console.log('📊 ESLint分析レポート\n');
console.log('='.repeat(50));
console.log(`📁 総ファイル数: ${stats.totalFiles}`);
console.log(`❌ エラーのあるファイル: ${stats.filesWithErrors}`);
console.log(`⚠️  警告のあるファイル: ${stats.filesWithWarnings}`);
console.log(`🔴 総エラー数: ${stats.totalErrors}`);
console.log(`🟡 総警告数: ${stats.totalWarnings}`);
console.log('='.repeat(50));

// エラーの多いファイルTOP10
if (stats.filesByErrorCount.length > 0) {
  console.log('\n❌ エラーの多いファイル TOP10:');
  stats.filesByErrorCount.slice(0, 10).forEach((file, index) => {
    console.log(`${index + 1}. ${file.file}`);
    console.log(`   エラー: ${file.errors}, 警告: ${file.warnings}`);
  });
}

// ルール別エラー集計
if (Object.keys(stats.errorsByRule).length > 0) {
  console.log('\n🔴 ルール別エラー:');
  Object.entries(stats.errorsByRule)
    .sort((a, b) => b[1] - a[1])
    .forEach(([rule, count]) => {
      console.log(`  ${rule}: ${count}件`);
    });
}

// ルール別警告集計
if (Object.keys(stats.warningsByRule).length > 0) {
  console.log('\n🟡 ルール別警告 TOP10:');
  Object.entries(stats.warningsByRule)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([rule, count]) => {
      console.log(`  ${rule}: ${count}件`);
    });
}

// 修正可能なエラーを確認
const fixableErrors = report.reduce((sum, file) => sum + file.fixableErrorCount, 0);
const fixableWarnings = report.reduce((sum, file) => sum + file.fixableWarningCount, 0);

console.log('\n🔧 自動修正可能:');
console.log(`  エラー: ${fixableErrors}件`);
console.log(`  警告: ${fixableWarnings}件`);

// 推奨アクション
console.log('\n📋 推奨アクション:');
if (fixableErrors > 0 || fixableWarnings > 0) {
  console.log('  1. npm run lint:fix を実行して自動修正');
}
if (stats.errorsByRule['@typescript-eslint/no-unused-vars'] > 0) {
  console.log('  2. 未使用変数の削除またはアンダースコア追加');
}
if (stats.errorsByRule['prettier/prettier'] > 0) {
  console.log('  3. npm run format でフォーマット統一');
}