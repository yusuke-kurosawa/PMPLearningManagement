#!/usr/bin/env node

/**
 * Serena Pre-commit Hook
 * コミット前にSerenaメモリの整合性とプロジェクト品質をチェック
 * 
 * 機能:
 * - Serenaメモリファイルの整合性チェック
 * - プロジェクト変更の影響分析
 * - コミット品質の検証
 * - IDD準拠チェック
 * 
 * @author Claude Code Integration System
 * @date 2025-09-20
 */

import fs from 'fs/promises';
import { execSync } from 'child_process';
import path from 'path';

const CONFIG = {
  serenaDir: '.serena',
  memoriesDir: '.serena/memories',
  requiredMemories: [
    'project_overview',
    'development_workflow_optimization', 
    'performance_optimization',
    'testing_strategy',
    'security_guidelines',
    'code_style_conventions',
    'architecture_analysis_guidelines'
  ],
  verbose: process.env.SERENA_VERBOSE === 'true',
  skipSerena: process.env.SKIP_SERENA_CHECK === 'true'
};

class SerenaPreCommitHook {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.checks = {
      iddCompliance: false,
      serenaMemories: false,
      projectIntegrity: false,
      changeImpact: false
    };
  }

  /**
   * メインエントリーポイント
   */
  async run() {
    try {
      this.log('🔍 Serena Pre-commit チェック開始');
      
      if (CONFIG.skipSerena) {
        this.log('⏭️  Serena チェックをスキップ (SKIP_SERENA_CHECK=true)');
        return 0;
      }
      
      // 並行でチェックを実行
      await Promise.all([
        this.checkIDDCompliance(),
        this.checkSerenaMemories(),
        this.checkProjectIntegrity(),
        this.analyzeChangeImpact()
      ]);
      
      // 結果のレポート
      this.generateReport();
      
      // エラーがあれば終了コード1で終了
      if (this.errors.length > 0) {
        this.error('❌ Pre-commit チェックに失敗しました');
        this.error(`エラー: ${this.errors.length}件, 警告: ${this.warnings.length}件`);
        return 1;
      }
      
      if (this.warnings.length > 0) {
        this.log(`⚠️  警告: ${this.warnings.length}件 (コミットは継続)`);
      }
      
      this.log('✅ Serena Pre-commit チェック完了');
      return 0;
      
    } catch (error) {
      this.error('💥 Pre-commit チェックでエラーが発生:', error);
      return 1;
    }
  }

  /**
   * IDD準拠チェック
   */
  async checkIDDCompliance() {
    try {
      // コミットメッセージの取得
      const commitMsg = await this.getCommitMessage();
      
      // Issue番号の存在チェック
      const issuePattern = /#\d+/;
      if (!issuePattern.test(commitMsg)) {
        this.errors.push('コミットメッセージにIssue番号が含まれていません (例: feat: 機能追加 #123)');
        return;
      }
      
      // コミットタイプの検証
      const typePattern = /^(feat|fix|docs|style|refactor|test|chore|perf|ci|build):/;
      if (!typePattern.test(commitMsg)) {
        this.errors.push('コミットメッセージが規約に従っていません (type: description #issue)');
        return;
      }
      
      // 日本語文字の検証
      if (!/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(commitMsg)) {
        this.warnings.push('コミットメッセージに日本語が含まれていません');
      }
      
      this.checks.iddCompliance = true;
      this.log('✅ IDD準拠チェック: OK');
      
    } catch (error) {
      this.errors.push(`IDD準拠チェックエラー: ${error.message}`);
    }
  }

  /**
   * Serenaメモリファイルのチェック
   */
  async checkSerenaMemories() {
    try {
      // Serenaディレクトリの存在確認
      if (!await this.pathExists(CONFIG.serenaDir)) {
        this.warnings.push('Serenaディレクトリが存在しません');
        return;
      }
      
      // 必須メモリファイルの存在確認
      const missingMemories = [];
      for (const memory of CONFIG.requiredMemories) {
        const memoryPath = path.join(CONFIG.memoriesDir, `${memory}.md`);
        
        if (!await this.pathExists(memoryPath)) {
          missingMemories.push(memory);
          continue;
        }
        
        // メモリファイルの品質チェック
        await this.validateMemoryFile(memoryPath, memory);
      }
      
      if (missingMemories.length > 0) {
        this.warnings.push(`不足しているメモリファイル: ${missingMemories.join(', ')}`);
        this.warnings.push('npm run serena:update でメモリを更新してください');
      }
      
      // メモリファイルの新しさチェック
      await this.checkMemoryFreshness();
      
      this.checks.serenaMemories = true;
      this.log('✅ Serenaメモリチェック: OK');
      
    } catch (error) {
      this.errors.push(`Serenaメモリチェックエラー: ${error.message}`);
    }
  }

  /**
   * プロジェクト整合性チェック
   */
  async checkProjectIntegrity() {
    try {
      // package.jsonの整合性
      const packageJson = await this.readJsonFile('package.json');
      if (!packageJson.name || !packageJson.version) {
        this.errors.push('package.jsonに必須フィールドが不足');
        return;
      }
      
      // 重要ファイルの存在確認
      const criticalFiles = [
        'README.md',
        'package.json',
        'vite.config.js',
        'src/App.jsx'
      ];
      
      for (const file of criticalFiles) {
        if (!await this.pathExists(file)) {
          this.errors.push(`重要ファイルが不足: ${file}`);
        }
      }
      
      // TypeScript設定の確認
      if (await this.pathExists('tsconfig.json')) {
        try {
          const tsConfig = await this.readJsonFile('tsconfig.json');
          if (!tsConfig.compilerOptions) {
            this.warnings.push('TypeScript設定が不完全です');
          }
        } catch {
          this.errors.push('tsconfig.jsonが無効です');
        }
      }
      
      this.checks.projectIntegrity = true;
      this.log('✅ プロジェクト整合性チェック: OK');
      
    } catch (error) {
      this.errors.push(`プロジェクト整合性チェックエラー: ${error.message}`);
    }
  }

  /**
   * 変更影響分析
   */
  async analyzeChangeImpact() {
    try {
      // Gitステージングエリアの変更ファイル取得
      const stagedFiles = await this.getStagedFiles();
      
      if (stagedFiles.length === 0) {
        this.warnings.push('ステージングされたファイルがありません');
        return;
      }
      
      const impact = {
        frontend: 0,
        config: 0,
        docs: 0,
        tests: 0,
        workflows: 0
      };
      
      // ファイル別影響分析
      for (const file of stagedFiles) {
        if (file.startsWith('src/')) {
          impact.frontend++;
        } else if (file.match(/\.(json|js|ts|yml|yaml)$/)) {
          impact.config++;
        } else if (file.match(/\.(md|txt|rst)$/)) {
          impact.docs++;
        } else if (file.includes('test') || file.includes('spec')) {
          impact.tests++;
        } else if (file.includes('.github/workflows')) {
          impact.workflows++;
        }
      }
      
      // 影響度による警告
      if (impact.frontend > 10) {
        this.warnings.push(`多数のフロントエンドファイル変更 (${impact.frontend}件) - レビューを推奨`);
      }
      
      if (impact.config > 3) {
        this.warnings.push(`設定ファイル変更 (${impact.config}件) - 慎重なテストを推奨`);
      }
      
      if (impact.workflows > 0) {
        this.warnings.push(`ワークフロー変更 (${impact.workflows}件) - CI/CDへの影響を確認`);
      }
      
      // Serenaメモリ更新の必要性チェック
      const needsSerenaUpdate = impact.frontend > 5 || impact.config > 2;
      if (needsSerenaUpdate) {
        this.warnings.push('大きな変更が検出されました - Serenaメモリ更新を推奨 (npm run serena:update)');
      }
      
      this.checks.changeImpact = true;
      this.log(`✅ 変更影響分析: ${stagedFiles.length}ファイル (FE:${impact.frontend}, Config:${impact.config})`);
      
    } catch (error) {
      this.errors.push(`変更影響分析エラー: ${error.message}`);
    }
  }

  /**
   * メモリファイルの品質検証
   */
  async validateMemoryFile(filePath, memoryName) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      
      // ファイルサイズチェック (50KB制限)
      if (content.length > 51200) {
        this.warnings.push(`メモリファイル ${memoryName} が大きすぎます (${content.length} bytes)`);
      }
      
      // 基本構造チェック
      if (!content.includes('#')) {
        this.errors.push(`メモリファイル ${memoryName} にヘッダーがありません`);
      }
      
      // 最新性チェック (ファイル修正時間)
      const stats = await fs.stat(filePath);
      const ageInHours = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60);
      
      if (ageInHours > 168) { // 1週間
        this.warnings.push(`メモリファイル ${memoryName} が古い可能性があります (${Math.round(ageInHours)}時間前)`);
      }
      
    } catch (error) {
      this.errors.push(`メモリファイル検証エラー ${memoryName}: ${error.message}`);
    }
  }

  /**
   * メモリファイルの新しさチェック
   */
  async checkMemoryFreshness() {
    try {
      if (!await this.pathExists('.serena/cache/memory-cache.json')) {
        this.warnings.push('Serenaキャッシュファイルが存在しません');
        return;
      }
      
      const cache = await this.readJsonFile('.serena/cache/memory-cache.json');
      
      if (cache.timestamp) {
        const lastUpdate = new Date(cache.timestamp);
        const ageInHours = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60);
        
        if (ageInHours > 24) {
          this.warnings.push(`Serenaメモリが${Math.round(ageInHours)}時間更新されていません`);
        }
      }
      
    } catch (error) {
      this.warnings.push('Serenaキャッシュの読み込みに失敗しました');
    }
  }

  /**
   * レポート生成
   */
  generateReport() {
    console.log('\n🔍 Serena Pre-commit チェック結果');
    console.log('═'.repeat(50));
    
    // チェック結果サマリー
    console.log('\n📊 チェック結果:');
    for (const [check, status] of Object.entries(this.checks)) {
      const icon = status ? '✅' : '❌';
      console.log(`${icon} ${this.formatCheckName(check)}: ${status ? 'OK' : 'FAIL'}`);
    }
    
    // エラー表示
    if (this.errors.length > 0) {
      console.log('\n❌ エラー:');
      this.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    }
    
    // 警告表示
    if (this.warnings.length > 0) {
      console.log('\n⚠️  警告:');
      this.warnings.forEach((warning, index) => {
        console.log(`  ${index + 1}. ${warning}`);
      });
    }
    
    // 推奨アクション
    if (this.errors.length > 0 || this.warnings.length > 0) {
      console.log('\n🎯 推奨アクション:');
      
      if (this.warnings.some(w => w.includes('メモリ更新'))) {
        console.log('  • npm run serena:update でメモリを更新');
      }
      
      if (this.errors.some(e => e.includes('Issue番号'))) {
        console.log('  • コミットメッセージにIssue番号を追加 (例: feat: 機能追加 #123)');
      }
      
      if (this.warnings.some(w => w.includes('TypeScript'))) {
        console.log('  • TypeScript設定を確認・修正');
      }
    }
    
    console.log('═'.repeat(50));
  }

  // ユーティリティメソッド
  async getCommitMessage() {
    try {
      // .git/COMMIT_EDITMSGから取得を試行
      const commitMsgPath = '.git/COMMIT_EDITMSG';
      if (await this.pathExists(commitMsgPath)) {
        const content = await fs.readFile(commitMsgPath, 'utf8');
        return content.split('\n')[0].trim();
      }
      
      // 最新コミットメッセージを取得
      return execSync('git log -1 --pretty=%B', { encoding: 'utf8' }).trim();
      
    } catch {
      throw new Error('コミットメッセージを取得できません');
    }
  }

  async getStagedFiles() {
    try {
      const result = execSync('git diff --cached --name-only', { encoding: 'utf8' });
      return result.trim().split('\n').filter(Boolean);
    } catch {
      return [];
    }
  }

  async pathExists(path) {
    try {
      await fs.access(path);
      return true;
    } catch {
      return false;
    }
  }

  async readJsonFile(filePath) {
    const content = await fs.readFile(filePath, 'utf8');
    return JSON.parse(content);
  }

  formatCheckName(checkName) {
    const names = {
      iddCompliance: 'IDD準拠',
      serenaMemories: 'Serenaメモリ',
      projectIntegrity: 'プロジェクト整合性',
      changeImpact: '変更影響分析'
    };
    
    return names[checkName] || checkName;
  }

  log(message) {
    if (CONFIG.verbose) {
      console.log(`[Serena] ${message}`);
    }
  }

  error(message, error = null) {
    console.error(`[Serena Error] ${message}`);
    if (error && CONFIG.verbose) {
      console.error(error);
    }
  }
}

// CLI実行
if (import.meta.url === `file://${process.argv[1]}`) {
  const hook = new SerenaPreCommitHook();
  hook.run().then(exitCode => {
    process.exit(exitCode);
  }).catch(error => {
    console.error('Pre-commit hook 実行エラー:', error);
    process.exit(1);
  });
}

export default SerenaPreCommitHook;