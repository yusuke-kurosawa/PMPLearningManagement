#!/usr/bin/env node

/**
 * ESLintエラーを分析して優先順位付けするスクリプト
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ESLintレポートを生成
function generateReport() {
  console.log('📊 ESLintレポートを生成中...');
  try {
    // 直接ESLintを実行してJSONフォーマットで出力
    execSync('npx eslint src --ext .js,.jsx,.ts,.tsx --format json > eslint-report.json 2>/dev/null', {
      shell: true
    });
  } catch (error) {
    // ESLintがエラーを返してもレポートは生成される
    console.log('⚠️ ESLintがエラーを検出しましたが、レポートは生成されました。');
  }
}

// エラーを分類
function categorizeErrors() {
  const reportPath = path.join(process.cwd(), 'eslint-report.json');
  const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
  
  const categories = {
    'unused-vars': [],
    'typescript-errors': [],
    'react-hooks': [],
    'accessibility': [],
    'console-logs': [],
    'prettier': [],
    'other': []
  };
  
  let totalErrors = 0;
  let totalWarnings = 0;
  
  report.forEach(file => {
    file.messages.forEach(msg => {
      const issue = {
        file: path.relative(process.cwd(), file.filePath),
        line: msg.line,
        column: msg.column,
        severity: msg.severity === 2 ? 'error' : 'warning',
        ruleId: msg.ruleId,
        message: msg.message
      };
      
      if (msg.severity === 2) totalErrors++;
      else totalWarnings++;
      
      // カテゴリ分類
      if (msg.ruleId?.includes('unused-vars')) {
        categories['unused-vars'].push(issue);
      } else if (msg.ruleId?.includes('typescript') || msg.ruleId?.includes('@typescript-eslint')) {
        categories['typescript-errors'].push(issue);
      } else if (msg.ruleId?.includes('react-hooks')) {
        categories['react-hooks'].push(issue);
      } else if (msg.ruleId?.includes('jsx-a11y')) {
        categories['accessibility'].push(issue);
      } else if (msg.ruleId === 'no-console') {
        categories['console-logs'].push(issue);
      } else if (msg.ruleId === 'prettier/prettier') {
        categories['prettier'].push(issue);
      } else {
        categories['other'].push(issue);
      }
    });
  });
  
  return { categories, totalErrors, totalWarnings };
}

// 修正優先度を決定
function prioritizeIssues(categories) {
  const priorities = {
    'immediate': [],    // すぐに修正すべき
    'high': [],        // 高優先度
    'medium': [],      // 中優先度
    'low': []          // 低優先度
  };
  
  // エラーは即座に修正
  Object.entries(categories).forEach(([category, issues]) => {
    issues.forEach(issue => {
      if (issue.severity === 'error') {
        if (category === 'unused-vars' || category === 'prettier') {
          priorities.immediate.push({ ...issue, category });
        } else {
          priorities.high.push({ ...issue, category });
        }
      } else {
        if (category === 'console-logs') {
          priorities.low.push({ ...issue, category });
        } else if (category === 'react-hooks' || category === 'accessibility') {
          priorities.medium.push({ ...issue, category });
        } else {
          priorities.low.push({ ...issue, category });
        }
      }
    });
  });
  
  return priorities;
}

// 自動修正可能な問題を特定
function identifyAutoFixable(categories) {
  const autoFixable = {
    'prettier': categories.prettier.filter(i => i.severity === 'error'),
    'unused-vars': categories['unused-vars'].filter(i => i.severity === 'error'),
    'imports': categories['typescript-errors'].filter(i => 
      i.message.includes('import') || i.message.includes('require')
    )
  };
  
  const autoFixCount = Object.values(autoFixable).reduce((sum, arr) => sum + arr.length, 0);
  
  return { autoFixable, count: autoFixCount };
}

// レポート生成
function generateActionPlan(analysis) {
  const { categories, totalErrors, totalWarnings } = analysis.basic;
  const priorities = analysis.priorities;
  const autoFix = analysis.autoFix;
  
  const plan = `
# ESLintエラー解決アクションプラン

## 📊 現在の状況
- **総エラー数**: ${totalErrors}
- **総警告数**: ${totalWarnings}
- **合計**: ${totalErrors + totalWarnings}

## 📈 カテゴリ別分布
${Object.entries(categories).map(([cat, issues]) => 
  `- **${cat}**: ${issues.length}件 (エラー: ${issues.filter(i => i.severity === 'error').length}, 警告: ${issues.filter(i => i.severity === 'warning').length})`
).join('\n')}

## 🚀 優先度別アクション

### 即座対応（${priorities.immediate.length}件）
${priorities.immediate.length > 0 ? '自動修正可能なエラー中心' : 'なし'}
${priorities.immediate.slice(0, 5).map(i => 
  `- ${i.file}:${i.line} - ${i.ruleId}`
).join('\n')}

### 高優先度（${priorities.high.length}件）
${priorities.high.length > 0 ? 'ビルドに影響する可能性のあるエラー' : 'なし'}
${priorities.high.slice(0, 5).map(i => 
  `- ${i.file}:${i.line} - ${i.ruleId}`
).join('\n')}

### 中優先度（${priorities.medium.length}件）
${priorities.medium.length > 0 ? '機能性に影響する可能性のある警告' : 'なし'}
${priorities.medium.slice(0, 5).map(i => 
  `- ${i.file}:${i.line} - ${i.ruleId}`
).join('\n')}

### 低優先度（${priorities.low.length}件）
${priorities.low.length > 0 ? 'コードスタイルや非クリティカルな警告' : 'なし'}

## 🔧 自動修正可能（${autoFix.count}件）
- Prettier: ${autoFix.autoFixable.prettier.length}件
- 未使用変数: ${autoFix.autoFixable['unused-vars'].length}件
- インポート: ${autoFix.autoFixable.imports.length}件

## 📝 推奨アクション順序
1. \`npm run lint:fix\` で自動修正可能な問題を解決
2. \`scripts/fix-unused-vars.cjs\` で未使用変数を処理
3. TypeScriptエラーを手動修正
4. React Hooksの依存関係を調整
5. アクセシビリティ問題を段階的に改善

## 🎯 目標
- **Phase 1 (1週間)**: エラーを0にする
- **Phase 2 (2週間)**: 警告を100件以下に
- **Phase 3 (1ヶ月)**: 警告を50件以下に
`;
  
  return plan;
}

// メイン処理
function main() {
  console.log('🔍 ESLintエラー分析を開始...\n');
  
  // レポート生成
  generateReport();
  
  // エラー分析
  const { categories, totalErrors, totalWarnings } = categorizeErrors();
  const priorities = prioritizeIssues(categories);
  const autoFix = identifyAutoFixable(categories);
  
  const analysis = {
    basic: { categories, totalErrors, totalWarnings },
    priorities,
    autoFix
  };
  
  // アクションプラン生成
  const actionPlan = generateActionPlan(analysis);
  
  // ファイルに保存
  fs.writeFileSync('ESLINT_ACTION_PLAN.md', actionPlan);
  
  console.log(actionPlan);
  console.log('\n✅ 分析完了！ ESLINT_ACTION_PLAN.md を確認してください。');
  
  // 即座に実行可能なコマンドを表示
  console.log('\n🚀 すぐに実行可能なコマンド:');
  console.log('1. npm run lint:fix           # Prettierと簡単な修正');
  console.log('2. node scripts/fix-unused-vars.cjs  # 未使用変数の修正');
  console.log('3. npm run lint               # 再チェック');
}

main();