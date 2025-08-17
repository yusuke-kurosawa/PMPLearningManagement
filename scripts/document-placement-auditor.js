#!/usr/bin/env node

/**
 * 📋 Document Placement Auditor
 * 
 * プロジェクト全体のMDファイル配置を監査し、
 * 配置ルールへの準拠状況をチェックします。
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// 配置ルール定義
const PLACEMENT_RULES = {
  // .claude directory - メモリバンク最適化
  '.claude': {
    maxLines: 50,
    allowedPatterns: [
      'README.md',
      'context/*.md',
      'quick-ref/*.md', 
      'rules/*.md',
      'prompts/README.md',
      'policies/README.md'
    ],
    purpose: 'Memory bank optimization - lightweight references only'
  },
  
  // docs directory - 権威ソース
  'docs': {
    maxLines: Infinity,
    allowedPatterns: ['**/*.md'],
    purpose: 'Authoritative source for all documentation'
  },
  
  // .github directory - GitHub関連
  '.github': {
    maxLines: Infinity, 
    allowedPatterns: [
      'CONTRIBUTING.md',
      'ISSUE_TEMPLATE/*.md',
      'PULL_REQUEST_TEMPLATE.md',
      '**/*REPORT*.md'
    ],
    purpose: 'GitHub-specific documentation and templates'
  },
  
  // root directory - 制限
  '.': {
    maxLines: 100,
    allowedPatterns: [
      'README.md',
      'SECURITY.md',
      'LICENSE.md',
      'CHANGELOG.md'
    ],
    purpose: 'Essential project files only'
  }
};

// 除外パターン
const EXCLUDE_PATTERNS = [
  'node_modules',
  '.git',
  'dist',
  'build',
  'coverage',
  '*.log',
  'test-results'
];

/**
 * ファイル/ディレクトリが除外対象かチェック
 */
function shouldExclude(filePath) {
  return EXCLUDE_PATTERNS.some(pattern => {
    if (pattern.includes('*')) {
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      return regex.test(filePath);
    }
    return filePath.includes(pattern);
  });
}

/**
 * ファイルの行数を取得
 */
async function getLineCount(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return content.split('\n').length;
  } catch (error) {
    return 0;
  }
}

/**
 * パターンマッチング
 */
function matchesPattern(filePath, pattern) {
  if (pattern === '**/*.md') {
    return filePath.endsWith('.md');
  }
  
  if (pattern.includes('*')) {
    const regex = new RegExp(pattern.replace(/\*/g, '[^/]*'));
    return regex.test(filePath);
  }
  
  return filePath === pattern || filePath.endsWith('/' + pattern);
}

/**
 * MDファイルを再帰的に検索
 */
async function findMdFiles(dirPath, relativePath = '') {
  const items = [];
  
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      const relPath = path.join(relativePath, entry.name);
      
      if (shouldExclude(relPath)) {
        continue;
      }
      
      if (entry.isDirectory()) {
        const subItems = await findMdFiles(fullPath, relPath);
        items.push(...subItems);
      } else if (entry.name.endsWith('.md')) {
        const lineCount = await getLineCount(fullPath);
        items.push({
          path: relPath,
          fullPath,
          lineCount,
          directory: relativePath || '.'
        });
      }
    }
  } catch (error) {
    console.warn(`Warning: Could not read directory ${dirPath}`);
  }
  
  return items;
}

/**
 * 配置ルールをチェック
 */
function checkPlacementRules(files) {
  const violations = [];
  const compliant = [];
  
  for (const file of files) {
    let ruleFound = false;
    
    // 各ディレクトリルールをチェック
    for (const [ruleDir, rule] of Object.entries(PLACEMENT_RULES)) {
      if (file.directory === ruleDir || 
          (ruleDir !== '.' && file.directory.startsWith(ruleDir + '/'))) {
        
        ruleFound = true;
        
        // パターンマッチングチェック
        const patternMatch = rule.allowedPatterns.some(pattern => 
          matchesPattern(file.path, pattern)
        );
        
        if (!patternMatch) {
          violations.push({
            file: file.path,
            rule: ruleDir,
            violation: 'Pattern mismatch',
            message: `File doesn't match allowed patterns: ${rule.allowedPatterns.join(', ')}`,
            suggestion: `Move to docs/ directory or rename to match pattern`
          });
          continue;
        }
        
        // 行数チェック
        if (file.lineCount > rule.maxLines) {
          violations.push({
            file: file.path,
            rule: ruleDir,
            violation: 'Size limit exceeded',
            message: `${file.lineCount} lines > ${rule.maxLines} limit`,
            suggestion: `Split file or move to docs/ directory`
          });
          continue;
        }
        
        compliant.push({
          file: file.path,
          rule: ruleDir,
          lineCount: file.lineCount,
          status: 'COMPLIANT'
        });
        
        break;
      }
    }
    
    if (!ruleFound) {
      violations.push({
        file: file.path,
        rule: 'NONE',
        violation: 'No applicable rule',
        message: 'File in unmanaged directory',
        suggestion: 'Move to appropriate directory (docs/, .github/, etc.)'
      });
    }
  }
  
  return { violations, compliant };
}

/**
 * レポート生成
 */
function generateReport(files, violations, compliant) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalFiles: files.length,
      compliantFiles: compliant.length,
      violationFiles: violations.length,
      complianceRate: Math.round((compliant.length / files.length) * 100)
    },
    violations: violations.map(v => ({
      ...v,
      severity: v.rule === '.claude' ? 'HIGH' : 'MEDIUM'
    })),
    compliant: compliant,
    recommendations: generateRecommendations(violations)
  };
  
  return report;
}

/**
 * 推奨事項生成
 */
function generateRecommendations(violations) {
  const recommendations = [];
  
  // .claudeディレクトリの大容量ファイル
  const claudeViolations = violations.filter(v => v.rule === '.claude');
  if (claudeViolations.length > 0) {
    recommendations.push({
      priority: 'HIGH',
      action: 'Optimize .claude memory bank',
      description: 'Move large files to docs/ and create lightweight references',
      affectedFiles: claudeViolations.length
    });
  }
  
  // パターン不一致ファイル
  const patternViolations = violations.filter(v => v.violation === 'Pattern mismatch');
  if (patternViolations.length > 0) {
    recommendations.push({
      priority: 'MEDIUM', 
      action: 'Fix file placement',
      description: 'Move files to appropriate directories based on content type',
      affectedFiles: patternViolations.length
    });
  }
  
  // ルールなしファイル
  const noRuleViolations = violations.filter(v => v.rule === 'NONE');
  if (noRuleViolations.length > 0) {
    recommendations.push({
      priority: 'LOW',
      action: 'Organize unmanaged files', 
      description: 'Review and properly categorize files in unmanaged directories',
      affectedFiles: noRuleViolations.length
    });
  }
  
  return recommendations;
}

/**
 * コンソール出力
 */
function printReport(report) {
  console.log('\\n📋 Document Placement Audit Report');
  console.log('=====================================\\n');
  
  // サマリー
  console.log('📊 Summary:');
  console.log(`   Total MD Files: ${report.summary.totalFiles}`);
  console.log(`   Compliant: ${report.summary.compliantFiles} (${report.summary.complianceRate}%)`);
  console.log(`   Violations: ${report.summary.violationFiles}`);
  
  // 違反詳細
  if (report.violations.length > 0) {
    console.log('\\n🚨 Violations:');
    for (const violation of report.violations) {
      console.log(`   [${violation.severity}] ${violation.file}`);
      console.log(`     Rule: ${violation.rule}`);
      console.log(`     Issue: ${violation.message}`);
      console.log(`     Fix: ${violation.suggestion}\\n`);
    }
  }
  
  // 推奨事項
  if (report.recommendations.length > 0) {
    console.log('💡 Recommendations:');
    for (const rec of report.recommendations) {
      console.log(`   [${rec.priority}] ${rec.action}`);
      console.log(`     ${rec.description}`);
      console.log(`     Affected files: ${rec.affectedFiles}\\n`);
    }
  }
  
  // ステータス
  const status = report.summary.complianceRate >= 90 ? '✅ GOOD' : 
                 report.summary.complianceRate >= 70 ? '⚠️ NEEDS ATTENTION' : '🚨 CRITICAL';
  console.log(`\\nOverall Status: ${status}`);
  console.log(`Generated: ${report.timestamp}`);
}

/**
 * メイン実行
 */
async function main() {
  try {
    console.log('🔍 Scanning project for MD files...');
    
    const files = await findMdFiles(projectRoot);
    console.log(`Found ${files.length} MD files`);
    
    console.log('📋 Checking placement rules...');
    const { violations, compliant } = checkPlacementRules(files);
    
    const report = generateReport(files, violations, compliant);
    
    // レポートをファイルに保存
    const reportPath = path.join(projectRoot, '.claude', 'audit-results.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    // コンソール出力
    printReport(report);
    
    console.log(`\\n📄 Detailed report saved: ${reportPath}`);
    
    // 違反がある場合は終了コード1
    process.exit(violations.length > 0 ? 1 : 0);
    
  } catch (error) {
    console.error('❌ Audit failed:', error);
    process.exit(1);
  }
}

// スクリプトとして直接実行された場合
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default main;