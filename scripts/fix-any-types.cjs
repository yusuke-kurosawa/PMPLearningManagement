#!/usr/bin/env node

/**
 * any型を具体的な型定義に置き換えるスクリプト
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ESLintレポートからany型の使用箇所を抽出
function getAnyTypeIssues() {
  try {
    const reportPath = path.join(process.cwd(), 'eslint-report.json');
    const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
    
    const anyTypeIssues = [];
    
    report.forEach(file => {
      file.messages.forEach(msg => {
        if (msg.ruleId === '@typescript-eslint/no-explicit-any') {
          anyTypeIssues.push({
            file: file.filePath,
            line: msg.line,
            column: msg.column,
            message: msg.message,
            source: msg.source
          });
        }
      });
    });
    
    return anyTypeIssues;
  } catch (error) {
    console.error('ESLintレポートの読み込みに失敗:', error);
    return [];
  }
}

// よくあるany型のパターンと置き換え案
const commonPatterns = {
  'any[]': 'unknown[]',
  'Array<any>': 'Array<unknown>',
  'Promise<any>': 'Promise<unknown>',
  'Record<string, any>': 'Record<string, unknown>',
  '(error: any)': '(error: Error | unknown)',
  '(err: any)': '(err: Error | unknown)',
  '(e: any)': '(e: Error | unknown)',
  '(_error: any)': '(_error: Error | unknown)',
  'data: any': 'data: unknown',
  'value: any': 'value: unknown',
  'result: any': 'result: unknown',
  'response: any': 'response: unknown',
  'payload: any': 'payload: unknown',
  'params: any': 'params: Record<string, unknown>',
  'config: any': 'config: Record<string, unknown>',
  'options: any': 'options: Record<string, unknown>',
};

// ファイル内のany型を置き換え
function fixAnyInFile(filePath, issues) {
  if (!fs.existsSync(filePath)) {
    console.warn(`ファイルが見つかりません: ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;
  
  // よくあるパターンを置き換え
  for (const [pattern, replacement] of Object.entries(commonPatterns)) {
    const regex = new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    if (regex.test(content)) {
      content = content.replace(regex, replacement);
      modified = true;
    }
  }
  
  // 特定のパターンをより詳細に処理
  // React Event Handlers
  content = content.replace(/\(event: any\)/g, '(event: React.SyntheticEvent)');
  content = content.replace(/\(e: any\)/g, '(e: React.SyntheticEvent)');
  
  // Function parameters
  content = content.replace(/\(([a-zA-Z_][a-zA-Z0-9_]*): any\)/g, '($1: unknown)');
  
  // Type assertions
  content = content.replace(/as any/g, 'as unknown');
  
  // Generic any
  content = content.replace(/<any>/g, '<unknown>');
  
  if (modified) {
    fs.writeFileSync(filePath, content);
    return true;
  }
  
  return false;
}

// メイン処理
function main() {
  console.log('🔍 any型の使用箇所を分析中...');
  
  const issues = getAnyTypeIssues();
  console.log(`📊 ${issues.length}件のany型使用箇所を検出`);
  
  // ファイルごとにグループ化
  const fileGroups = {};
  issues.forEach(issue => {
    if (!fileGroups[issue.file]) {
      fileGroups[issue.file] = [];
    }
    fileGroups[issue.file].push(issue);
  });
  
  // 各ファイルを修正
  let fixedCount = 0;
  for (const [file, fileIssues] of Object.entries(fileGroups)) {
    console.log(`📝 修正中: ${path.basename(file)} (${fileIssues.length}件)`);
    if (fixAnyInFile(file, fileIssues)) {
      fixedCount++;
    }
  }
  
  console.log(`\n✅ ${fixedCount}ファイルを修正しました`);
  
  // 型定義の推奨事項を出力
  console.log('\n📋 推奨される型定義の追加:');
  console.log('1. APIレスポンス用の型定義を作成');
  console.log('2. イベントハンドラーの具体的な型を指定');
  console.log('3. エラーハンドリングで Error | unknown を使用');
  console.log('4. Record<string, unknown> でオブジェクト型を明確化');
}

main();