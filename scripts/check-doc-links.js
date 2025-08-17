#!/usr/bin/env node

/**
 * ドキュメント内のリンク完全性チェックスクリプト
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const DOCS_DIR = path.join(__dirname, '..', 'docs');
const MARKDOWN_PATTERN = '**/*.md';

// カラー出力用
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

// 結果を格納
const results = {
  totalFiles: 0,
  totalLinks: 0,
  brokenLinks: [],
  warnings: []
};

/**
 * Markdownファイルからリンクを抽出
 */
function extractLinks(content, filePath) {
  const links = [];
  
  // [text](url) 形式のリンク
  const mdLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;
  
  while ((match = mdLinkRegex.exec(content)) !== null) {
    links.push({
      text: match[1],
      url: match[2],
      line: content.substring(0, match.index).split('\n').length,
      type: 'markdown'
    });
  }
  
  // <a href="url"> 形式のリンク
  const htmlLinkRegex = /<a\s+(?:[^>]*?\s+)?href=["']([^"']+)["']/gi;
  
  while ((match = htmlLinkRegex.exec(content)) !== null) {
    links.push({
      url: match[1],
      line: content.substring(0, match.index).split('\n').length,
      type: 'html'
    });
  }
  
  return links;
}

/**
 * リンクの有効性をチェック
 */
function checkLink(link, sourceFile) {
  // 外部リンクはスキップ
  if (link.url.startsWith('http://') || link.url.startsWith('https://')) {
    return { valid: true, external: true };
  }
  
  // アンカーリンクはスキップ
  if (link.url.startsWith('#')) {
    return { valid: true, anchor: true };
  }
  
  // 相対パスを絶対パスに変換
  const sourcePath = path.dirname(sourceFile);
  const targetPath = path.resolve(sourcePath, link.url.split('#')[0]);
  
  // ファイルの存在確認
  if (fs.existsSync(targetPath)) {
    return { valid: true, resolved: targetPath };
  }
  
  // .mdを追加して再チェック
  const targetPathWithMd = targetPath + '.md';
  if (fs.existsSync(targetPathWithMd)) {
    return { valid: true, resolved: targetPathWithMd, warning: 'Missing .md extension' };
  }
  
  return { valid: false, target: targetPath };
}

/**
 * メイン処理
 */
function main() {
  console.log(`${colors.blue}📝 ドキュメントリンクチェック開始${colors.reset}\n`);
  console.log(`検索ディレクトリ: ${DOCS_DIR}\n`);
  
  // Markdownファイルを検索
  const files = glob.sync(MARKDOWN_PATTERN, {
    cwd: DOCS_DIR,
    absolute: true
  });
  
  results.totalFiles = files.length;
  console.log(`${colors.green}✓${colors.reset} ${files.length} 個のMarkdownファイルを発見\n`);
  
  // 各ファイルをチェック
  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf-8');
    const links = extractLinks(content, file);
    const relativePath = path.relative(DOCS_DIR, file);
    
    if (links.length > 0) {
      console.log(`${colors.blue}📄${colors.reset} ${relativePath}`);
      
      links.forEach(link => {
        results.totalLinks++;
        const checkResult = checkLink(link, file);
        
        if (!checkResult.valid) {
          results.brokenLinks.push({
            file: relativePath,
            line: link.line,
            url: link.url,
            text: link.text
          });
          console.log(`  ${colors.red}✗${colors.reset} Line ${link.line}: ${link.url}`);
        } else if (checkResult.warning) {
          results.warnings.push({
            file: relativePath,
            line: link.line,
            url: link.url,
            warning: checkResult.warning
          });
          console.log(`  ${colors.yellow}⚠${colors.reset} Line ${link.line}: ${link.url} - ${checkResult.warning}`);
        }
      });
    }
  });
  
  // 結果サマリー
  console.log('\n' + '='.repeat(60));
  console.log(`${colors.blue}📊 チェック結果サマリー${colors.reset}`);
  console.log('='.repeat(60));
  console.log(`総ファイル数: ${results.totalFiles}`);
  console.log(`総リンク数: ${results.totalLinks}`);
  console.log(`${colors.red}壊れたリンク: ${results.brokenLinks.length}${colors.reset}`);
  console.log(`${colors.yellow}警告: ${results.warnings.length}${colors.reset}`);
  
  // 詳細レポート
  if (results.brokenLinks.length > 0) {
    console.log(`\n${colors.red}🔴 壊れたリンクの詳細:${colors.reset}`);
    results.brokenLinks.forEach(broken => {
      console.log(`  ${broken.file}:${broken.line} - ${broken.url}`);
    });
  }
  
  if (results.warnings.length > 0) {
    console.log(`\n${colors.yellow}⚠️  警告の詳細:${colors.reset}`);
    results.warnings.forEach(warning => {
      console.log(`  ${warning.file}:${warning.line} - ${warning.warning}`);
    });
  }
  
  // 終了コード
  const exitCode = results.brokenLinks.length > 0 ? 1 : 0;
  
  if (exitCode === 0) {
    console.log(`\n${colors.green}✅ すべてのリンクが有効です！${colors.reset}`);
  } else {
    console.log(`\n${colors.red}❌ ${results.brokenLinks.length} 個の壊れたリンクが見つかりました${colors.reset}`);
  }
  
  process.exit(exitCode);
}

// 実行
main();