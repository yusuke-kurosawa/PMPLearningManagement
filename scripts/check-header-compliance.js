#!/usr/bin/env node

/**
 * @file scripts/check-header-compliance.js
 * @description TypeScript専用ヘッダーコメント準拠チェックスクリプト
 * @developer Developer 7: セキュリティ・DevOps・インフラ
 * @agent devops-engineer
 * @lastModified 2025-08-17
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Use native fs methods instead of glob
function findFiles(dir, pattern, result = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      if (!['node_modules', 'dist', 'coverage', '.git'].includes(file)) {
        findFiles(filePath, pattern, result);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      result.push(filePath);
    }
  }
  return result;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 設定読み込み
const headerConfig = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../.eslintrc.header.json'), 'utf8')
);

// カラーコード
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
  bold: '\x1b[1m'
};

// 統計データ
const stats = {
  totalFiles: 0,
  compliantFiles: 0,
  nonCompliantFiles: 0,
  autoFixable: 0,
  byDeveloper: {},
  byAgent: {},
  byFileType: {
    components: { total: 0, compliant: 0 },
    services: { total: 0, compliant: 0 },
    tests: { total: 0, compliant: 0 },
    types: { total: 0, compliant: 0 },
    config: { total: 0, compliant: 0 }
  },
  issues: []
};

// ヘッダー検証
function validateHeader(filePath, content) {
  const lines = content.split('\n').slice(0, 10);
  
  // ヘッダーコメントの存在チェック
  if (!lines[0]?.startsWith('/**')) {
    return {
      valid: false,
      error: 'Missing header comment',
      fixable: true
    };
  }
  
  // 必須フィールドのチェック
  const requiredFields = ['@file', '@description', '@developer', '@agent', '@lastModified'];
  const foundFields = [];
  
  lines.forEach(line => {
    requiredFields.forEach(field => {
      if (line.includes(field)) {
        foundFields.push(field);
      }
    });
  });
  
  const missingFields = requiredFields.filter(field => !foundFields.includes(field));
  
  if (missingFields.length > 0) {
    return {
      valid: false,
      error: `Missing required fields: ${missingFields.join(', ')}`,
      fixable: true,
      missingFields
    };
  }
  
  return { valid: true };
}

// Developer判定
function determineDeveloper(filePath) {
  const relativePath = path.relative(process.cwd(), filePath);
  
  if (headerConfig.developerAgentMapping) {
    for (const [developer, config] of Object.entries(headerConfig.developerAgentMapping)) {
      if (config && config.paths) {
        for (const pattern of config.paths) {
          const regex = new RegExp(
            pattern
              .replace(/\*\*/g, '.*')
              .replace(/\*/g, '[^/]*')
              .replace(/\{ts,tsx\}/g, '(ts|tsx)')
          );
          
          if (regex.test(relativePath)) {
            return {
              developer,
              agent: config.agent || 'code-assistant',
              template: config.template || null
            };
          }
        }
      }
    }
  }
  
  return {
    developer: 'Team',
    agent: 'code-assistant',
    template: null
  };
}

// ファイルタイプ判定
function determineFileType(filePath) {
  const basename = path.basename(filePath);
  
  if (basename.includes('.test.') || basename.includes('.spec.')) {
    return 'tests';
  }
  if (basename.endsWith('.d.ts')) {
    return 'types';
  }
  if (basename.endsWith('.config.ts') || basename.endsWith('.config.mjs')) {
    return 'config';
  }
  if (filePath.includes('/components/')) {
    return 'components';
  }
  if (filePath.includes('/services/') || filePath.includes('/server/')) {
    return 'services';
  }
  
  return 'other';
}

// ヘッダー自動生成
function generateHeader(filePath, developerInfo) {
  const relativePath = path.relative(process.cwd(), filePath);
  const fileName = path.basename(filePath);
  const fileType = determineFileType(filePath);
  const date = new Date().toISOString().split('T')[0];
  
  let description = '';
  if (fileType === 'components') description = 'React component implementation';
  else if (fileType === 'services') description = 'Service layer implementation';
  else if (fileType === 'tests') description = 'Test suite implementation';
  else if (fileType === 'types') description = 'TypeScript type definitions';
  else if (fileType === 'config') description = 'Configuration file';
  else description = 'Module implementation';
  
  const developerName = headerConfig.developerAgentMapping?.[developerInfo.developer]?.name || 'Team member';
  
  return `/**
 * @file ${relativePath}
 * @description ${description}
 * @developer ${developerInfo.developer}: ${developerName}
 * @agent ${developerInfo.agent}
 * @lastModified ${date}
 */`;
}

// メイン処理
async function main() {
  console.log(`${colors.bold}${colors.blue}📝 TypeScript Header Compliance Check${colors.reset}\n`);
  
  // TypeScriptファイルを検索
  const srcPath = path.join(process.cwd(), 'src');
  const files = fs.existsSync(srcPath) ? findFiles(srcPath) : [];
  
  stats.totalFiles = files.length;
  console.log(`Found ${colors.bold}${files.length}${colors.reset} TypeScript files\n`);
  
  // 各ファイルをチェック
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const validation = validateHeader(file, content);
    const developerInfo = determineDeveloper(file);
    const fileType = determineFileType(file);
    
    // 統計更新
    if (!stats.byDeveloper[developerInfo.developer]) {
      stats.byDeveloper[developerInfo.developer] = { total: 0, compliant: 0 };
    }
    if (!stats.byAgent[developerInfo.agent]) {
      stats.byAgent[developerInfo.agent] = { total: 0, compliant: 0 };
    }
    
    stats.byDeveloper[developerInfo.developer].total++;
    stats.byAgent[developerInfo.agent].total++;
    
    if (fileType !== 'other') {
      stats.byFileType[fileType].total++;
    }
    
    if (validation.valid) {
      stats.compliantFiles++;
      stats.byDeveloper[developerInfo.developer].compliant++;
      stats.byAgent[developerInfo.agent].compliant++;
      if (fileType !== 'other') {
        stats.byFileType[fileType].compliant++;
      }
      console.log(`${colors.green}✓${colors.reset} ${file}`);
    } else {
      stats.nonCompliantFiles++;
      if (validation.fixable) stats.autoFixable++;
      
      stats.issues.push({
        file,
        error: validation.error,
        developer: developerInfo.developer,
        agent: developerInfo.agent,
        fixable: validation.fixable
      });
      
      console.log(`${colors.red}✗${colors.reset} ${file} - ${colors.yellow}${validation.error}${colors.reset}`);
    }
  }
  
  // サマリー表示
  console.log(`\n${colors.bold}═══════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bold}📊 Summary${colors.reset}\n`);
  
  const complianceRate = Math.round((stats.compliantFiles / stats.totalFiles) * 100);
  console.log(`Total Files:     ${stats.totalFiles}`);
  console.log(`Compliant:       ${colors.green}${stats.compliantFiles}${colors.reset} (${complianceRate}%)`);
  console.log(`Non-compliant:   ${colors.red}${stats.nonCompliantFiles}${colors.reset}`);
  console.log(`Auto-fixable:    ${colors.yellow}${stats.autoFixable}${colors.reset}`);
  
  // Developer別統計
  console.log(`\n${colors.bold}👥 By Developer${colors.reset}`);
  console.log('─'.repeat(50));
  Object.entries(stats.byDeveloper).forEach(([dev, data]) => {
    const rate = Math.round((data.compliant / data.total) * 100);
    const emoji = rate === 100 ? '✅' : rate >= 80 ? '🟡' : '❌';
    console.log(`${emoji} ${dev}: ${data.compliant}/${data.total} (${rate}%)`);
  });
  
  // Agent別統計
  console.log(`\n${colors.bold}🤖 By Agent${colors.reset}`);
  console.log('─'.repeat(50));
  Object.entries(stats.byAgent).forEach(([agent, data]) => {
    const rate = Math.round((data.compliant / data.total) * 100);
    const emoji = rate === 100 ? '✅' : rate >= 80 ? '🟡' : '❌';
    console.log(`${emoji} ${agent}: ${data.compliant}/${data.total} (${rate}%)`);
  });
  
  // ファイルタイプ別統計
  console.log(`\n${colors.bold}📁 By File Type${colors.reset}`);
  console.log('─'.repeat(50));
  Object.entries(stats.byFileType).forEach(([type, data]) => {
    if (data.total > 0) {
      const rate = Math.round((data.compliant / data.total) * 100);
      const emoji = rate === 100 ? '✅' : rate >= 80 ? '🟡' : '❌';
      console.log(`${emoji} ${type}: ${data.compliant}/${data.total} (${rate}%)`);
    }
  });
  
  // 推奨事項
  if (stats.nonCompliantFiles > 0) {
    console.log(`\n${colors.bold}💡 Recommendations${colors.reset}`);
    console.log('─'.repeat(50));
    console.log(`Run ${colors.blue}npm run header:apply${colors.reset} to auto-fix ${stats.autoFixable} files`);
    
    if (stats.issues.length <= 10) {
      console.log(`\n${colors.bold}📝 Non-compliant files:${colors.reset}`);
      stats.issues.forEach(issue => {
        console.log(`  - ${issue.file} (${issue.developer})`);
      });
    }
  } else {
    console.log(`\n${colors.green}${colors.bold}✅ All files are compliant!${colors.reset}`);
  }
  
  // JSON出力（CI用）
  if (process.env.CI) {
    fs.writeFileSync(
      'header-compliance-report.json',
      JSON.stringify(stats, null, 2)
    );
    console.log(`\n${colors.gray}Report saved to header-compliance-report.json${colors.reset}`);
  }
  
  // 終了コード
  process.exit(stats.nonCompliantFiles > 0 ? 1 : 0);
}

// エラーハンドリング
process.on('unhandledRejection', error => {
  console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
  process.exit(1);
});

// 実行
main().catch(error => {
  console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
  process.exit(1);
});