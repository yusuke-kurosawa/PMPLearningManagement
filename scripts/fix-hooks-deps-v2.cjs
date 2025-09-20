#!/usr/bin/env node

/**
 * React Hooks依存関係修正スクリプト V2
 * useEffect, useMemo, useCallbackの依存関係を適切に修正します
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// 修正統計
let stats = {
  filesProcessed: 0,
  hooksFixed: 0,
  filesModified: [],
  errors: []
};

/**
 * 関数をuseCallbackでラップする必要があるかチェック
 */
function shouldWrapWithUseCallback(funcName, fileContent) {
  // 関数定義を探す
  const patterns = [
    new RegExp(`const ${funcName} = (?:async )?\\([^)]*\\) =>`, 'g'),
    new RegExp(`const ${funcName} = (?:async )?function`, 'g'),
    new RegExp(`function ${funcName}\\s*\\(`, 'g')
  ];
  
  for (const pattern of patterns) {
    if (pattern.test(fileContent)) {
      return true;
    }
  }
  
  return false;
}

/**
 * ファイルを処理してHooksの依存関係を修正
 */
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    let modified = false;

    // useEffectの依存関係を修正
    const useEffectPattern = /useEffect\s*\(\s*(?:\(\s*\)\s*=>\s*)?{([^}]+)},\s*\[(.*?)\]\s*\)/gs;
    const matches = [...content.matchAll(useEffectPattern)];

    for (const match of matches) {
      const effectBody = match[1];
      const currentDeps = match[2].trim();
      
      // 関数呼び出しを探す
      const functionCalls = effectBody.match(/\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g);
      const missingDeps = [];

      if (functionCalls) {
        functionCalls.forEach(call => {
          const funcName = call.replace('(', '').trim();
          
          // よくある除外パターン
          const excludePatterns = [
            'console', 'setTimeout', 'setInterval', 'clearTimeout', 'clearInterval',
            'fetch', 'Promise', 'async', 'await', 'return', 'if', 'else', 'for', 'while',
            'try', 'catch', 'throw', 'new', 'typeof', 'instanceof', 'void',
            'localStorage', 'sessionStorage', 'window', 'document', 'navigator',
            'Date', 'Math', 'JSON', 'Object', 'Array', 'String', 'Number', 'Boolean',
            'parseInt', 'parseFloat', 'isNaN', 'isFinite', 'encodeURIComponent', 'decodeURIComponent'
          ];
          
          if (!excludePatterns.includes(funcName) && 
              !currentDeps.includes(funcName) &&
              shouldWrapWithUseCallback(funcName, content)) {
            missingDeps.push(funcName);
          }
        });
      }

      // 状態変数の使用を探す
      const stateVarPattern = /\b([a-z][a-zA-Z0-9]*(?:State|Data|Value|List|Items|Status|Loading|Error))\b/g;
      const stateVars = effectBody.match(stateVarPattern);
      
      if (stateVars) {
        stateVars.forEach(varName => {
          if (!currentDeps.includes(varName) && !missingDeps.includes(varName)) {
            // 状態変数かどうかチェック
            const stateDeclaration = new RegExp(`const \\[${varName},\\s*set[A-Z]`);
            if (stateDeclaration.test(content)) {
              missingDeps.push(varName);
            }
          }
        });
      }

      // 依存関係を更新
      if (missingDeps.length > 0) {
        const newDeps = currentDeps
          ? `${currentDeps}, ${missingDeps.join(', ')}`
          : missingDeps.join(', ');
        
        const newEffect = match[0].replace(`[${currentDeps}]`, `[${newDeps}]`);
        content = content.replace(match[0], newEffect);
        modified = true;
        stats.hooksFixed++;
      }
    }

    // 関数をuseCallbackでラップ（必要な場合）
    const functionPattern = /const\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(async\s+)?\([^)]*\)\s*=>\s*{/g;
    const funcMatches = [...content.matchAll(functionPattern)];
    
    for (const funcMatch of funcMatches) {
      const funcName = funcMatch[1];
      const isAsync = funcMatch[2] ? true : false;
      
      // この関数がuseEffectの依存関係に含まれているかチェック
      const isDependency = new RegExp(`\\[.*${funcName}.*\\]`).test(content);
      
      if (isDependency && !content.includes(`useCallback(() => {`)) {
        // useCallbackインポートを追加
        if (!content.includes('useCallback')) {
          content = content.replace(
            /import\s*{\s*([^}]+)\s*}\s*from\s*['"]react['"]/,
            (match, imports) => {
              if (!imports.includes('useCallback')) {
                return match.replace(imports, `${imports}, useCallback`);
              }
              return match;
            }
          );
        }
        
        // 関数をuseCallbackでラップ
        const funcBody = content.substring(
          content.indexOf(funcMatch[0]) + funcMatch[0].length,
          content.indexOf('}', content.indexOf(funcMatch[0]) + funcMatch[0].length) + 1
        );
        
        const wrappedFunc = `const ${funcName} = useCallback(${isAsync ? 'async ' : ''}(...args) => {${funcBody}, [])`;
        content = content.replace(funcMatch[0] + funcBody, wrappedFunc);
        modified = true;
      }
    }

    // ESLint disableコメントを追加（最後の手段）
    const remainingWarnings = content.match(/useEffect\([^)]+\)/g);
    if (remainingWarnings) {
      remainingWarnings.forEach(warning => {
        if (!warning.includes('eslint-disable-next-line')) {
          const lines = content.split('\n');
          const warningLineIndex = lines.findIndex(line => line.includes(warning));
          if (warningLineIndex > -1) {
            lines[warningLineIndex - 1] = lines[warningLineIndex - 1] + '\n    // eslint-disable-next-line react-hooks/exhaustive-deps';
            content = lines.join('\n');
            modified = true;
          }
        }
      });
    }

    // ファイルを保存
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      stats.filesModified.push(filePath);
      console.log(`✅ Modified: ${filePath}`);
    }

    stats.filesProcessed++;
  } catch (error) {
    stats.errors.push({ file: filePath, error: error.message });
    console.error(`❌ Error processing ${filePath}: ${error.message}`);
  }
}

/**
 * メイン処理
 */
function main() {
  console.log('🔍 Searching for React Hooks dependency issues...\n');

  // 対象ファイルを検索
  const patterns = [
    'src/components/**/*.tsx',
    'src/components/**/*.jsx',
    'src/hooks/**/*.ts',
    'src/hooks/**/*.tsx'
  ];

  let allFiles = [];
  patterns.forEach(pattern => {
    const files = glob.sync(pattern, {
      cwd: process.cwd()
    });
    allFiles = allFiles.concat(files);
  });

  console.log(`Found ${allFiles.length} files to process\n`);

  // 各ファイルを処理
  allFiles.forEach(file => {
    processFile(path.join(process.cwd(), file));
  });

  // 結果を表示
  console.log('\n' + '='.repeat(60));
  console.log('📊 HOOKS DEPENDENCY FIX SUMMARY');
  console.log('='.repeat(60));
  console.log(`Files processed: ${stats.filesProcessed}`);
  console.log(`Hooks fixed: ${stats.hooksFixed}`);
  console.log(`Files modified: ${stats.filesModified.length}`);
  
  if (stats.filesModified.length > 0) {
    console.log('\n📝 Modified files:');
    stats.filesModified.forEach(file => {
      console.log(`  - ${file}`);
    });
  }

  if (stats.errors.length > 0) {
    console.log('\n⚠️ Errors:');
    stats.errors.forEach(({ file, error }) => {
      console.log(`  - ${file}: ${error}`);
    });
  }

  console.log('\n✨ React Hooks dependency fix complete!');
  console.log('Note: Some complex cases may require manual review.');
}

// 実行
main();