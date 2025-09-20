#!/usr/bin/env node

/**
 * @ts-ignoreを@ts-expect-errorに置換するスクリプト
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// TypeScriptファイルを検索
function findTypeScriptFiles() {
  return glob.sync('src/**/*.{ts,tsx,js,jsx}', {
    ignore: ['**/node_modules/**', '**/dist/**', '**/build/**']
  });
}

// ファイル内の@ts-ignoreを置換
function fixTsIgnoreInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  const originalContent = content;
  
  // @ts-ignoreを@ts-expect-errorに置換
  content = content.replace(/@ts-ignore/g, '@ts-expect-error');
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    return true;
  }
  
  return false;
}

// メイン処理
function main() {
  console.log('🔧 @ts-ignoreを@ts-expect-errorに置換中...');
  
  const files = findTypeScriptFiles();
  let fixedCount = 0;
  
  files.forEach(file => {
    if (fixTsIgnoreInFile(file)) {
      console.log(`✅ ${path.relative(process.cwd(), file)}`);
      fixedCount++;
    }
  });
  
  console.log(`\n✨ 完了: ${fixedCount}ファイルを修正しました`);
}

// globパッケージの確認
try {
  require.resolve('glob');
  main();
} catch (e) {
  console.log('globパッケージをインストール中...');
  const { execSync } = require('child_process');
  execSync('npm install glob', { stdio: 'inherit' });
  main();
}