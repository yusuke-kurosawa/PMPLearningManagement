#!/usr/bin/env node

/**
 * Console.log置換スクリプト
 * 全てのconsole文をloggerサービスに置き換えます
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// 置換統計
let stats = {
  filesProcessed: 0,
  consolesReplaced: 0,
  filesModified: [],
  errors: []
};

/**
 * ファイルを処理してconsole文を置き換える
 */
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    let modified = false;

    // ファイル名を取得
    const fileName = path.basename(filePath);
    const fileExt = path.extname(filePath);
    
    // TypeScript/JavaScript判定
    const isTypeScript = fileExt === '.ts' || fileExt === '.tsx';
    const isJavaScript = fileExt === '.js' || fileExt === '.jsx';
    
    if (!isTypeScript && !isJavaScript) {
      return;
    }

    // logger importがあるかチェック
    const hasLoggerImport = content.includes("import { logger }") || 
                            content.includes("const { logger }") ||
                            content.includes("import logger");

    // console文を検出（ESLintコメント付きも含む）
    const consolePatterns = [
      // console.log
      {
        pattern: /(\s*)(?:\/\/\s*eslint-disable-next-line\s+no-console\s*\n\s*)?console\.log\((.*?)\)/g,
        replacement: (match, indent, args) => `${indent}logger.info(${args})`,
        type: 'log'
      },
      // console.info
      {
        pattern: /(\s*)(?:\/\/\s*eslint-disable-next-line\s+no-console\s*\n\s*)?console\.info\((.*?)\)/g,
        replacement: (match, indent, args) => `${indent}logger.info(${args})`,
        type: 'info'
      },
      // console.warn
      {
        pattern: /(\s*)(?:\/\/\s*eslint-disable-next-line\s+no-console\s*\n\s*)?console\.warn\((.*?)\)/g,
        replacement: (match, indent, args) => `${indent}logger.warn(${args})`,
        type: 'warn'
      },
      // console.error
      {
        pattern: /(\s*)(?:\/\/\s*eslint-disable-next-line\s+no-console\s*\n\s*)?console\.error\((.*?)\)/g,
        replacement: (match, indent, args) => `${indent}logger.error(${args})`,
        type: 'error'
      },
      // console.debug
      {
        pattern: /(\s*)(?:\/\/\s*eslint-disable-next-line\s+no-console\s*\n\s*)?console\.debug\((.*?)\)/g,
        replacement: (match, indent, args) => `${indent}logger.debug(${args})`,
        type: 'debug'
      }
    ];

    // 各パターンを適用
    consolePatterns.forEach(({ pattern, replacement }) => {
      const matches = content.match(pattern);
      if (matches) {
        content = content.replace(pattern, replacement);
        modified = true;
        stats.consolesReplaced += matches.length;
      }
    });

    // loggerインポートを追加（必要な場合）
    if (modified && !hasLoggerImport) {
      // 適切なインポートパスを計算
      const relativePath = path.relative(path.dirname(filePath), path.join(process.cwd(), 'src/services'));
      const importPath = relativePath.replace(/\\/g, '/');
      
      // インポート文を追加
      const loggerImport = isTypeScript 
        ? `import { logger } from '${importPath}/logger';\n`
        : `const { logger } = require('${importPath}/logger');\n`;

      // 既存のインポート後に追加
      if (content.includes('import ')) {
        // 最後のimport文を見つける
        const importMatches = content.match(/^import .* from .*$/gm);
        if (importMatches) {
          const lastImport = importMatches[importMatches.length - 1];
          const lastImportIndex = content.lastIndexOf(lastImport);
          content = content.slice(0, lastImportIndex + lastImport.length) + 
                   '\n' + loggerImport + 
                   content.slice(lastImportIndex + lastImport.length);
        } else {
          // ファイルの先頭に追加
          content = loggerImport + '\n' + content;
        }
      } else if (content.includes('require(')) {
        // 最後のrequire文を見つける
        const requireMatches = content.match(/^const .* = require\(.*\)$/gm);
        if (requireMatches) {
          const lastRequire = requireMatches[requireMatches.length - 1];
          const lastRequireIndex = content.lastIndexOf(lastRequire);
          content = content.slice(0, lastRequireIndex + lastRequire.length) + 
                   '\n' + loggerImport + 
                   content.slice(lastRequireIndex + lastRequire.length);
        } else {
          // ファイルの先頭に追加
          content = loggerImport + '\n' + content;
        }
      } else {
        // ファイルの先頭に追加
        content = loggerImport + '\n' + content;
      }
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
  console.log('🔍 Searching for console statements...\n');

  // 対象ファイルを検索
  const patterns = [
    'src/**/*.ts',
    'src/**/*.tsx',
    'src/**/*.js',
    'src/**/*.jsx'
  ];

  // logger.ts自体は除外
  const excludePatterns = [
    '**/logger.ts',
    '**/logger.js',
    '**/*.test.ts',
    '**/*.test.tsx',
    '**/*.test.js',
    '**/*.test.jsx',
    '**/*.spec.ts',
    '**/*.spec.tsx',
    '**/*.spec.js',
    '**/*.spec.jsx'
  ];

  let allFiles = [];
  patterns.forEach(pattern => {
    const files = glob.sync(pattern, {
      ignore: excludePatterns,
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
  console.log('📊 REPLACEMENT SUMMARY');
  console.log('='.repeat(60));
  console.log(`Files processed: ${stats.filesProcessed}`);
  console.log(`Console statements replaced: ${stats.consolesReplaced}`);
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

  console.log('\n✨ Console.log replacement complete!');
}

// 実行
main();