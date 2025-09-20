#!/usr/bin/env node

/**
 * React Hooks依存関係を修正するスクリプト
 * useEffectの依存配列を自動修正
 */

const fs = require('fs');
const path = require('path');

// ESLintレポートからHooks依存関係の問題を抽出
function getHooksDepsIssues() {
  try {
    const reportPath = path.join(process.cwd(), 'eslint-report.json');
    const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
    
    const hooksIssues = [];
    
    report.forEach(file => {
      file.messages.forEach(msg => {
        if (msg.ruleId === 'react-hooks/exhaustive-deps') {
          hooksIssues.push({
            file: file.filePath,
            line: msg.line,
            column: msg.column,
            message: msg.message,
            source: msg.source
          });
        }
      });
    });
    
    return hooksIssues;
  } catch (error) {
    console.error('ESLintレポートの読み込みに失敗:', error);
    return [];
  }
}

// 依存関係の提案を抽出
function extractSuggestedDeps(message) {
  // ESLintメッセージから依存関係を抽出
  // 例: "React Hook useEffect has missing dependencies: 'dependency1', 'dependency2'"
  const missingMatch = message.match(/missing dependencies?: ([^.]+)/);
  if (missingMatch) {
    const deps = missingMatch[1]
      .replace(/['"`]/g, '')
      .split(/,\s*/)
      .map(dep => dep.trim());
    return deps;
  }
  
  // "has an unnecessary dependency" パターン
  const unnecessaryMatch = message.match(/unnecessary dependency: '([^']+)'/);
  if (unnecessaryMatch) {
    return { remove: unnecessaryMatch[1] };
  }
  
  return null;
}

// useEffectの依存配列を修正
function fixHooksDeps(content, issues) {
  let modified = content;
  const lines = content.split('\n');
  
  // 各問題を逆順で処理（行番号がずれないように）
  const sortedIssues = issues.sort((a, b) => b.line - a.line);
  
  for (const issue of sortedIssues) {
    const suggestedDeps = extractSuggestedDeps(issue.message);
    
    if (!suggestedDeps) continue;
    
    // 該当行周辺を取得
    const startLine = Math.max(0, issue.line - 5);
    const endLine = Math.min(lines.length, issue.line + 5);
    const context = lines.slice(startLine, endLine).join('\n');
    
    // useEffect/useCallback/useMemoのパターンを検出
    const hookPattern = /(useEffect|useCallback|useMemo)\s*\(\s*(?:\([^)]*\)|[^,]+)\s*=>\s*\{[^}]*\},\s*\[([^\]]*)\]/s;
    const match = context.match(hookPattern);
    
    if (match) {
      const hookName = match[1];
      const currentDeps = match[2].split(',').map(d => d.trim()).filter(d => d);
      
      let newDeps;
      if (suggestedDeps.remove) {
        // 不要な依存関係を削除
        newDeps = currentDeps.filter(d => d !== suggestedDeps.remove);
      } else {
        // 不足している依存関係を追加
        newDeps = [...new Set([...currentDeps, ...suggestedDeps])];
      }
      
      // 新しい依存配列を作成
      const newDepsString = newDeps.join(', ');
      
      // 該当行を修正
      const lineIndex = issue.line - 1;
      if (lines[lineIndex]) {
        // 依存配列だけを置き換え
        lines[lineIndex] = lines[lineIndex].replace(
          /\[([^\]]*)\]/,
          `[${newDepsString}]`
        );
      }
    }
  }
  
  const newContent = lines.join('\n');
  return newContent !== content ? newContent : null;
}

// useCallbackとuseMemoの最適化
function optimizeHooks(content) {
  let modified = content;
  
  // 不要なuseCallbackを削除（依存関係が空の場合）
  modified = modified.replace(
    /const\s+(\w+)\s*=\s*useCallback\(\s*\(\)\s*=>\s*\{([^}]+)\},\s*\[\]\)/g,
    (match, varName, body) => {
      // 単純な関数の場合はuseCallbackを削除
      if (!body.includes('setState') && !body.includes('dispatch')) {
        return `const ${varName} = () => {${body}}`;
      }
      return match;
    }
  );
  
  // 定数値のuseMemoを削除
  modified = modified.replace(
    /const\s+(\w+)\s*=\s*useMemo\(\s*\(\)\s*=>\s*([^,]+),\s*\[\]\)/g,
    (match, varName, value) => {
      // 単純な値の場合はuseMemoを削除
      if (!value.includes('(') && !value.includes('{')) {
        return `const ${varName} = ${value}`;
      }
      return match;
    }
  );
  
  return modified !== content ? modified : null;
}

// ファイルのHooks依存関係を修正
function fixHooksInFile(filePath, issues) {
  if (!fs.existsSync(filePath)) {
    console.warn(`ファイルが見つかりません: ${filePath}`);
    return false;
  }
  
  let content = fs.readFileSync(filePath, 'utf-8');
  const originalContent = content;
  
  // 依存関係の修正
  const depsFixed = fixHooksDeps(content, issues);
  if (depsFixed) {
    content = depsFixed;
  }
  
  // Hooksの最適化
  const optimized = optimizeHooks(content);
  if (optimized) {
    content = optimized;
  }
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    return true;
  }
  
  return false;
}

// メイン処理
function main() {
  console.log('🔧 React Hooks依存関係を分析中...');
  
  const issues = getHooksDepsIssues();
  console.log(`📊 ${issues.length}件のHooks依存関係問題を検出`);
  
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
    // JSX/TSXファイルのみ処理
    if (file.match(/\.(jsx|tsx|ts|js)$/)) {
      console.log(`📝 修正中: ${path.basename(file)} (${fileIssues.length}件)`);
      if (fixHooksInFile(file, fileIssues)) {
        fixedCount++;
      }
    }
  }
  
  console.log(`\n✅ ${fixedCount}ファイルを修正しました`);
  
  // 推奨事項を出力
  console.log('\n📋 Hooks最適化の推奨事項:');
  console.log('1. 必要な依存関係のみを配列に含める');
  console.log('2. オブジェクトや配列は useMemo で安定化');
  console.log('3. 関数は useCallback で安定化');
  console.log('4. 不要な再レンダリングを防ぐため依存関係を最小化');
  console.log('5. ESLintのreact-hooks/exhaustive-depsルールを活用');
  
  console.log('\n⚠️ 注意: 自動修正後は必ず動作確認を行ってください');
}

main();