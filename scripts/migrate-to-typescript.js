#!/usr/bin/env node
/**
 * JavaScriptファイルをTypeScriptに自動移行するスクリプト
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class TypeScriptMigrator {
  constructor() {
    this.projectRoot = process.cwd();
    this.migrationQueue = [];
    this.migrationResults = [];
  }

  /**
   * 移行対象ファイルの特定
   */
  identifyMigrationTargets() {
    const targets = [
      // E2E テスト
      { from: 'e2e/tests/accessibility.spec.js', to: 'e2e/tests/accessibility.spec.ts', type: 'e2e-test' },
      { from: 'e2e/tests/home.spec.js', to: 'e2e/tests/home.spec.ts', type: 'e2e-test' },
      { from: 'e2e/tests/navigation.spec.js', to: 'e2e/tests/navigation.spec.ts', type: 'e2e-test' },
      
      // Service Worker
      { from: 'public/sw.js', to: 'public/sw.ts', type: 'service-worker' },
      
      // スクリプト
      { from: 'scripts/duplicate-detector.js', to: 'scripts/duplicate-detector.ts', type: 'script' },
      { from: 'scripts/import-mock-exam.js', to: 'scripts/import-mock-exam.ts', type: 'script' },
      { from: 'scripts/fix-all-eslint-issues.js', to: 'scripts/fix-all-eslint-issues.ts', type: 'script' },
      
      // テストファイル
      { from: 'test/test-translation.js', to: 'test/test-translation.ts', type: 'test' },
      
      // 監視・運用スクリプト
      { from: '.claude/operations/monitoring/scripts/check.js', to: '.claude/operations/monitoring/scripts/check.ts', type: 'monitoring' },
      { from: '.claude/operations/scripts/dashboard.js', to: '.claude/operations/scripts/dashboard.ts', type: 'dashboard' }
    ];

    return targets.filter(target => {
      const fromPath = path.join(this.projectRoot, target.from);
      return fs.existsSync(fromPath);
    });
  }

  /**
   * E2Eテストファイルの移行
   */
  migrateE2ETest(content) {
    // CommonJS imports to ES6 imports
    content = content.replace(/const\s+{\s*([^}]+)\s*}\s*=\s*require\(['"]([^'"]+)['"]\);?/g, 
      'import { $1 } from \'$2\';');
    content = content.replace(/const\s+(\w+)\s*=\s*require\(['"]([^'"]+)['"]\);?/g, 
      'import $1 from \'$2\';');

    // Add type annotations for test functions
    content = content.replace(/test\((['"][^'"]+['"])\s*,\s*async\s*\(\s*{\s*([^}]+)\s*}\s*\)\s*=>/g, 
      'test($1, async ({ $2 }: { $2: Page }): Promise<void> =>');
    
    content = content.replace(/test\.describe\((['"][^'"]+['"])\s*,\s*\(\s*\)\s*=>/g, 
      'test.describe($1, (): void =>');

    // Add type imports
    if (content.includes('page') && !content.includes('type Page')) {
      content = content.replace(
        /import\s+{\s*([^}]*test[^}]*)\s*}\s*from\s*['"]@playwright\/test['"];?/,
        "import { $1, type Page } from '@playwright/test';"
      );
    }

    return content;
  }

  /**
   * Service Workerの移行
   */
  migrateServiceWorker(content) {
    // Add TypeScript service worker types
    const serviceWorkerTypes = `
interface ExtendableEvent extends Event {
  waitUntil(promise: Promise<any>): void;
}

interface FetchEvent extends ExtendableEvent {
  request: Request;
  respondWith(response: Promise<Response> | Response): void;
}

interface InstallEvent extends ExtendableEvent {}

declare const self: ServiceWorkerGlobalScope;

`;

    // Add type annotations to event listeners
    content = content.replace(/self\.addEventListener\(['"]install['"],\s*\(/g, 
      'self.addEventListener(\'install\', (event: InstallEvent): void => {');
    
    content = content.replace(/self\.addEventListener\(['"]fetch['"],\s*\(/g, 
      'self.addEventListener(\'fetch\', (event: FetchEvent): void => {');

    // Add void return types for functions
    content = content.replace(/function\s+(\w+)\s*\(/g, 'function $1(): void (');

    return serviceWorkerTypes + content;
  }

  /**
   * 一般スクリプトの移行
   */
  migrateScript(content) {
    // CommonJS to ES6 modules
    content = content.replace(/const\s+{\s*([^}]+)\s*}\s*=\s*require\(['"]([^'"]+)['"]\);?/g, 
      'import { $1 } from \'$2\';');
    content = content.replace(/const\s+(\w+)\s*=\s*require\(['"]([^'"]+)['"]\);?/g, 
      'import $1 from \'$2\';');

    // Add Node.js types if using Node.js APIs
    if (content.includes('fs.') || content.includes('path.') || content.includes('process.')) {
      content = "import { promises as fs } from 'fs';\nimport path from 'path';\n\n" + content;
    }

    // Add function return types
    content = content.replace(/function\s+(\w+)\s*\(/g, 'function $1(): void (');
    content = content.replace(/async\s+function\s+(\w+)\s*\(/g, 'async function $1(): Promise<void> (');

    // Add main function type annotation
    if (content.includes('async function main(')) {
      content = content.replace(/async\s+function\s+main\s*\(/g, 'async function main(): Promise<void> (');
    }

    return content;
  }

  /**
   * ファイル移行実行
   */
  async migrateFile(target) {
    const fromPath = path.join(this.projectRoot, target.from);
    const toPath = path.join(this.projectRoot, target.to);
    
    console.log(`🔄 Migrating: ${target.from} → ${target.to}`);
    
    try {
      // 元ファイルの読み込み
      let content = fs.readFileSync(fromPath, 'utf8');
      
      // タイプ別の移行処理
      switch (target.type) {
        case 'e2e-test':
          content = this.migrateE2ETest(content);
          break;
        case 'service-worker':
          content = this.migrateServiceWorker(content);
          break;
        case 'script':
        case 'monitoring':
        case 'dashboard':
          content = this.migrateScript(content);
          break;
        case 'test':
          content = this.migrateScript(content); // 基本的なスクリプト移行を適用
          break;
        default:
          // 基本的な移行のみ
          content = content.replace(/const\s+{\s*([^}]+)\s*}\s*=\s*require\(['"]([^'"]+)['"]\);?/g, 
            'import { $1 } from \'$2\';');
      }
      
      // ディレクトリが存在しない場合は作成
      const toDir = path.dirname(toPath);
      if (!fs.existsSync(toDir)) {
        fs.mkdirSync(toDir, { recursive: true });
      }
      
      // 新しいファイルの書き込み
      fs.writeFileSync(toPath, content, 'utf8');
      
      // 元ファイルの削除
      fs.unlinkSync(fromPath);
      
      // 結果記録
      this.migrationResults.push({
        target,
        status: 'success',
        message: 'Migration completed successfully'
      });
      
      console.log(`✅ Successfully migrated: ${target.from}`);
      
      return true;
    } catch (error) {
      console.error(`❌ Failed to migrate ${target.from}:`, error.message);
      
      this.migrationResults.push({
        target,
        status: 'error',
        message: error.message
      });
      
      return false;
    }
  }

  /**
   * 移行後の検証
   */
  async verifyMigration() {
    console.log('\n🔍 Verifying migration...');
    
    const verificationTasks = [
      {
        name: 'TypeScript Compilation',
        command: 'npx tsc --noEmit',
        critical: true
      },
      {
        name: 'ESLint Check',
        command: 'npm run lint',
        critical: false
      },
      {
        name: 'Tests',
        command: 'npm run test:run',
        critical: true
      }
    ];
    
    let allPassed = true;
    
    for (const task of verificationTasks) {
      try {
        console.log(`  Running: ${task.name}...`);
        execSync(task.command, { 
          stdio: 'pipe',
          cwd: this.projectRoot 
        });
        console.log(`  ✅ ${task.name} passed`);
      } catch (error) {
        console.log(`  ❌ ${task.name} failed`);
        if (task.critical) {
          allPassed = false;
        }
      }
    }
    
    return allPassed;
  }

  /**
   * 移行レポート生成
   */
  generateMigrationReport() {
    console.log('\n📊 Migration Report');
    console.log('==================');
    
    const successful = this.migrationResults.filter(r => r.status === 'success').length;
    const failed = this.migrationResults.filter(r => r.status === 'error').length;
    
    console.log(`Total files processed: ${this.migrationResults.length}`);
    console.log(`Successful migrations: ${successful}`);
    console.log(`Failed migrations: ${failed}`);
    console.log('');
    
    if (failed > 0) {
      console.log('Failed migrations:');
      this.migrationResults
        .filter(r => r.status === 'error')
        .forEach(result => {
          console.log(`  ❌ ${result.target.from}: ${result.message}`);
        });
      console.log('');
    }
    
    console.log('Successful migrations:');
    this.migrationResults
      .filter(r => r.status === 'success')
      .forEach(result => {
        console.log(`  ✅ ${result.target.from} → ${result.target.to}`);
      });
  }

  /**
   * 一括移行実行
   */
  async migrateAll() {
    console.log('🚀 Starting TypeScript migration...\n');
    
    const targets = this.identifyMigrationTargets();
    
    if (targets.length === 0) {
      console.log('✅ No files to migrate. All files are already TypeScript!');
      return;
    }
    
    console.log(`Found ${targets.length} files to migrate:`);
    targets.forEach(target => {
      console.log(`  • ${target.from} (${target.type})`);
    });
    console.log('');
    
    // 段階的移行実行
    for (const target of targets) {
      await this.migrateFile(target);
    }
    
    // 移行後検証
    const verificationPassed = await this.verifyMigration();
    
    // レポート生成
    this.generateMigrationReport();
    
    // 最終結果
    console.log('\n🎯 Migration Summary');
    console.log('===================');
    
    if (verificationPassed && this.migrationResults.every(r => r.status === 'success')) {
      console.log('🎉 All migrations completed successfully!');
      console.log('🎯 Next steps:');
      console.log('  1. Run "git add ." to stage changes');
      console.log('  2. Run "git commit -m \'feat: Complete TypeScript migration\'"');
      console.log('  3. Run "npm run ts:verify" for final verification');
    } else {
      console.log('⚠️ Some migrations failed or verification issues detected.');
      console.log('Please review the errors above and fix manually.');
      process.exit(1);
    }
  }

  /**
   * 特定ファイルの移行
   */
  async migrateSingle(filePath) {
    const targets = this.identifyMigrationTargets();
    const target = targets.find(t => t.from === filePath);
    
    if (!target) {
      console.log(`❌ File not found in migration targets: ${filePath}`);
      return;
    }
    
    await this.migrateFile(target);
    this.generateMigrationReport();
  }
}

// CLI実行
if (require.main === module) {
  const migrator = new TypeScriptMigrator();
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    migrator.migrateAll();
  } else if (args[0] === '--file' && args[1]) {
    migrator.migrateSingle(args[1]);
  } else if (args[0] === '--list') {
    const targets = migrator.identifyMigrationTargets();
    console.log('Migration targets:');
    targets.forEach(target => {
      console.log(`  ${target.from} → ${target.to} (${target.type})`);
    });
  } else {
    console.log('Usage:');
    console.log('  node scripts/migrate-to-typescript.js           # Migrate all');
    console.log('  node scripts/migrate-to-typescript.js --list    # List targets');
    console.log('  node scripts/migrate-to-typescript.js --file <path>  # Migrate single file');
  }
}

module.exports = TypeScriptMigrator;