#!/usr/bin/env node

/**
 * Serena CLI Tool
 * 開発者向けSerena MCP Server統合自動化ツール
 * 
 * 機能:
 * - メモリ管理（更新、検証、最適化）
 * - レポート生成
 * - 診断とトラブルシューティング
 * - インタラクティブモード
 * 
 * @author Claude Code Integration System
 * @date 2025-09-20
 */

import fs from 'fs/promises';
import { execSync } from 'child_process';
import path from 'path';
import SerenaMemoryUpdater from './serena-memory-updater.js';
import SerenaDeployValidator from './serena-deploy-validator.js';

const CONFIG = {
  serenaDir: '.serena',
  memoriesDir: '.serena/memories',
  logsDir: '.serena/logs',
  cacheDir: '.serena/cache',
  version: '1.0.0'
};

class SerenaCLI {
  constructor() {
    this.commands = {
      update: this.updateMemories.bind(this),
      validate: this.validateProject.bind(this),
      report: this.generateReport.bind(this),
      clean: this.cleanCache.bind(this),
      status: this.showStatus.bind(this),
      init: this.initializeSerena.bind(this),
      diagnose: this.diagnoseIssues.bind(this),
      interactive: this.interactiveMode.bind(this),
      help: this.showHelp.bind(this)
    };
  }

  /**
   * CLIエントリーポイント
   */
  async run(args = process.argv.slice(2)) {
    try {
      if (args.length === 0) {
        return await this.interactiveMode();
      }

      const [command, ...options] = args;
      const handler = this.commands[command];

      if (!handler) {
        console.error(`❌ 不明なコマンド: ${command}`);
        this.showHelp();
        return 1;
      }

      return await handler(options);

    } catch (error) {
      console.error('❌ CLIエラー:', error.message);
      return 1;
    }
  }

  /**
   * メモリ更新コマンド
   */
  async updateMemories(options) {
    console.log('🧠 Serenaメモリ更新開始...');
    
    const updater = new SerenaMemoryUpdater();
    await updater.run();
    
    console.log('✅ メモリ更新完了');
    return 0;
  }

  /**
   * プロジェクト検証コマンド
   */
  async validateProject(options) {
    console.log('🔍 プロジェクト検証開始...');
    
    const phase = options.includes('--deploy') ? 'pre-deploy' : 'validation';
    const validator = new SerenaDeployValidator();
    
    const result = await validator.run(phase);
    return result;
  }

  /**
   * レポート生成コマンド
   */
  async generateReport(options) {
    console.log('📋 Serenaレポート生成開始...');
    
    const format = this.getOption(options, '--format', 'console');
    const outputFile = this.getOption(options, '--output', null);
    
    const report = await this.buildComprehensiveReport();
    
    switch (format) {
      case 'json':
        await this.outputReport(report, 'json', outputFile);
        break;
      case 'markdown':
        await this.outputReport(report, 'markdown', outputFile);
        break;
      default:
        this.displayConsoleReport(report);
    }
    
    console.log('✅ レポート生成完了');
    return 0;
  }

  /**
   * キャッシュクリーンアップコマンド
   */
  async cleanCache(options) {
    console.log('🧹 Serenaキャッシュクリーンアップ開始...');
    
    try {
      if (await this.pathExists(CONFIG.cacheDir)) {
        const files = await fs.readdir(CONFIG.cacheDir);
        
        for (const file of files) {
          await fs.unlink(path.join(CONFIG.cacheDir, file));
        }
        
        console.log(`✅ ${files.length}件のキャッシュファイルを削除`);
      } else {
        console.log('ℹ️  キャッシュディレクトリが存在しません');
      }
      
      if (options.includes('--logs')) {
        await this.cleanLogs();
      }
      
    } catch (error) {
      console.error('❌ クリーンアップエラー:', error.message);
      return 1;
    }
    
    return 0;
  }

  /**
   * ステータス表示コマンド
   */
  async showStatus(options) {
    console.log('📊 Serena統合ステータス');
    console.log('═'.repeat(50));
    
    const status = await this.gatherStatus();
    
    console.log(`🧠 メモリファイル: ${status.memoryCount}件`);
    console.log(`💾 キャッシュサイズ: ${this.formatBytes(status.cacheSize)}`);
    console.log(`📝 ログファイル: ${status.logCount}件`);
    console.log(`⏰ 最終更新: ${status.lastUpdate || 'N/A'}`);
    console.log(`🎯 健全度: ${status.healthScore}%`);
    
    if (status.issues.length > 0) {
      console.log('\n⚠️  検出された問題:');
      status.issues.forEach((issue, i) => {
        console.log(`  ${i + 1}. ${issue}`);
      });
    }
    
    console.log('═'.repeat(50));
    return 0;
  }

  /**
   * Serena初期化コマンド
   */
  async initializeSerena(options) {
    console.log('🚀 Serena MCP統合初期化開始...');
    
    try {
      // ディレクトリ構造の作成
      const dirs = [
        CONFIG.serenaDir,
        CONFIG.memoriesDir,
        CONFIG.logsDir,
        CONFIG.cacheDir
      ];
      
      for (const dir of dirs) {
        await fs.mkdir(dir, { recursive: true });
        console.log(`📁 作成: ${dir}`);
      }
      
      // 初期設定ファイルの作成
      await this.createInitialConfig();
      
      // 初回メモリ更新
      console.log('🧠 初期メモリ更新実行...');
      const updater = new SerenaMemoryUpdater();
      await updater.run();
      
      console.log('✅ Serena統合初期化完了');
      console.log('💡 次のステップ: npm run serena:status でステータス確認');
      
    } catch (error) {
      console.error('❌ 初期化エラー:', error.message);
      return 1;
    }
    
    return 0;
  }

  /**
   * 診断コマンド
   */
  async diagnoseIssues(options) {
    console.log('🔬 Serena統合診断開始...');
    
    const issues = [];
    const recommendations = [];
    
    try {
      // Serenaディレクトリ構造チェック
      if (!await this.pathExists(CONFIG.serenaDir)) {
        issues.push('Serenaディレクトリが存在しません');
        recommendations.push('npm run serena:init で初期化してください');
      }
      
      // メモリファイルチェック
      const memoryIssues = await this.checkMemoryFiles();
      issues.push(...memoryIssues);
      
      // Git統合チェック
      const gitIssues = await this.checkGitIntegration();
      issues.push(...gitIssues);
      
      // パフォーマンスチェック
      const perfIssues = await this.checkPerformance();
      issues.push(...perfIssues);
      
      // 結果表示
      console.log('\n🔍 診断結果:');
      
      if (issues.length === 0) {
        console.log('✅ 問題は検出されませんでした');
      } else {
        console.log(`❌ ${issues.length}件の問題が検出されました:`);
        issues.forEach((issue, i) => {
          console.log(`  ${i + 1}. ${issue}`);
        });
      }
      
      if (recommendations.length > 0) {
        console.log('\n💡 推奨事項:');
        recommendations.forEach((rec, i) => {
          console.log(`  ${i + 1}. ${rec}`);
        });
      }
      
    } catch (error) {
      console.error('❌ 診断エラー:', error.message);
      return 1;
    }
    
    return issues.length > 0 ? 1 : 0;
  }

  /**
   * インタラクティブモード
   */
  async interactiveMode() {
    console.log(`🧠 Serena CLI v${CONFIG.version} - インタラクティブモード`);
    console.log('═'.repeat(50));
    
    const { default: inquirer } = await import('inquirer').catch(() => {
      // inquirerが利用できない場合のフォールバック
      return { default: null };
    });
    
    if (!inquirer) {
      console.log('💡 利用可能なコマンド:');
      Object.keys(this.commands).forEach(cmd => {
        console.log(`  serena ${cmd}`);
      });
      return 0;
    }
    
    const choices = [
      { name: '🧠 メモリ更新', value: 'update' },
      { name: '🔍 プロジェクト検証', value: 'validate' },
      { name: '📋 レポート生成', value: 'report' },
      { name: '📊 ステータス確認', value: 'status' },
      { name: '🔬 診断実行', value: 'diagnose' },
      { name: '🧹 キャッシュクリーンアップ', value: 'clean' },
      { name: '❓ ヘルプ表示', value: 'help' },
      { name: '🚪 終了', value: 'exit' }
    ];
    
    while (true) {
      const { action } = await inquirer.prompt([
        {
          type: 'list',
          name: 'action',
          message: '実行したいアクションを選択してください:',
          choices
        }
      ]);
      
      if (action === 'exit') {
        console.log('👋 Serena CLIを終了します');
        break;
      }
      
      if (action === 'help') {
        this.showHelp();
        continue;
      }
      
      console.log(''); // 空行
      
      try {
        await this.commands[action]([]);
      } catch (error) {
        console.error('❌ アクション実行エラー:', error.message);
      }
      
      console.log('\n' + '─'.repeat(30) + '\n');
    }
    
    return 0;
  }

  /**
   * ヘルプ表示
   */
  showHelp() {
    console.log(`
🧠 Serena CLI v${CONFIG.version} - Serena MCP統合ツール

使用方法:
  serena <command> [options]

コマンド:
  update      メモリファイルを更新
  validate    プロジェクトを検証 [--deploy]
  report      レポートを生成 [--format=json|markdown] [--output=file]
  status      統合ステータスを表示
  clean       キャッシュをクリーンアップ [--logs]
  init        Serena統合を初期化
  diagnose    問題を診断
  interactive インタラクティブモード
  help        このヘルプを表示

例:
  serena update                     # メモリ更新
  serena validate --deploy         # デプロイ前検証
  serena report --format=markdown  # Markdownレポート
  serena clean --logs              # ログも含めてクリーンアップ
  serena                           # インタラクティブモード

環境変数:
  SERENA_VERBOSE=true              # 詳細ログ
  SKIP_SERENA_CHECK=true           # チェックをスキップ
`);
  }

  // ユーティリティメソッド
  async buildComprehensiveReport() {
    const status = await this.gatherStatus();
    
    return {
      metadata: {
        generatedAt: new Date().toISOString(),
        version: CONFIG.version,
        project: await this.getProjectInfo()
      },
      status,
      memory: {
        files: await this.getMemoryFileInfo(),
        cacheStatus: await this.getCacheStatus()
      },
      integration: {
        git: await this.getGitIntegration(),
        ci: await this.getCIStatus()
      },
      recommendations: await this.generateRecommendations(status)
    };
  }

  async outputReport(report, format, outputFile) {
    let content;
    
    switch (format) {
      case 'json':
        content = JSON.stringify(report, null, 2);
        break;
      case 'markdown':
        content = this.formatMarkdownReport(report);
        break;
      default:
        throw new Error(`未対応フォーマット: ${format}`);
    }
    
    if (outputFile) {
      await fs.writeFile(outputFile, content);
      console.log(`📄 レポート出力: ${outputFile}`);
    } else {
      console.log(content);
    }
  }

  formatMarkdownReport(report) {
    return `# Serena MCP統合レポート

生成日時: ${report.metadata.generatedAt}

## 📊 ステータスサマリー

- **メモリファイル**: ${report.status.memoryCount}件
- **キャッシュサイズ**: ${this.formatBytes(report.status.cacheSize)}
- **健全度**: ${report.status.healthScore}%
- **最終更新**: ${report.status.lastUpdate || 'N/A'}

## 🧠 メモリファイル詳細

${report.memory.files.map(file => `- **${file.name}**: ${this.formatBytes(file.size)} (${file.lastModified})`).join('\n')}

## 🔗 統合ステータス

- **Git統合**: ${report.integration.git.enabled ? '✅ 有効' : '❌ 無効'}
- **CI/CD統合**: ${report.integration.ci.enabled ? '✅ 有効' : '❌ 無効'}

## 💡 推奨事項

${report.recommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n')}

---
Generated by Serena CLI v${CONFIG.version}
`;
  }

  displayConsoleReport(report) {
    console.log('\n📋 Serena MCP統合レポート');
    console.log('═'.repeat(50));
    console.log(`生成日時: ${report.metadata.generatedAt}`);
    console.log(`健全度: ${report.status.healthScore}%`);
    console.log(`メモリファイル: ${report.status.memoryCount}件`);
    console.log(`キャッシュサイズ: ${this.formatBytes(report.status.cacheSize)}`);
    
    if (report.recommendations.length > 0) {
      console.log('\n💡 推奨事項:');
      report.recommendations.forEach((rec, i) => {
        console.log(`  ${i + 1}. ${rec}`);
      });
    }
    
    console.log('═'.repeat(50));
  }

  async gatherStatus() {
    const status = {
      memoryCount: 0,
      cacheSize: 0,
      logCount: 0,
      lastUpdate: null,
      healthScore: 100,
      issues: []
    };
    
    try {
      // メモリファイル数
      if (await this.pathExists(CONFIG.memoriesDir)) {
        const memories = await fs.readdir(CONFIG.memoriesDir);
        status.memoryCount = memories.length;
      }
      
      // キャッシュサイズ
      if (await this.pathExists(CONFIG.cacheDir)) {
        status.cacheSize = await this.calculateDirectorySize(CONFIG.cacheDir);
      }
      
      // ログファイル数
      if (await this.pathExists(CONFIG.logsDir)) {
        const logs = await fs.readdir(CONFIG.logsDir);
        status.logCount = logs.length;
      }
      
      // 最終更新時刻
      const cacheFile = path.join(CONFIG.cacheDir, 'memory-cache.json');
      if (await this.pathExists(cacheFile)) {
        const cache = await this.readJsonFile(cacheFile);
        status.lastUpdate = cache.timestamp;
      }
      
      // 健全度計算
      if (status.memoryCount < 5) {
        status.healthScore -= 20;
        status.issues.push('メモリファイルが不足しています');
      }
      
      if (status.lastUpdate) {
        const ageInHours = (Date.now() - new Date(status.lastUpdate).getTime()) / (1000 * 60 * 60);
        if (ageInHours > 24) {
          status.healthScore -= 15;
          status.issues.push('メモリが24時間以上更新されていません');
        }
      } else {
        status.healthScore -= 25;
        status.issues.push('メモリ更新履歴がありません');
      }
      
    } catch (error) {
      status.healthScore -= 30;
      status.issues.push(`ステータス収集エラー: ${error.message}`);
    }
    
    return status;
  }

  async checkMemoryFiles() {
    const issues = [];
    
    const requiredMemories = [
      'project_overview',
      'development_workflow_optimization',
      'performance_optimization',
      'testing_strategy',
      'security_guidelines'
    ];
    
    for (const memory of requiredMemories) {
      const memoryPath = path.join(CONFIG.memoriesDir, `${memory}.md`);
      
      if (!await this.pathExists(memoryPath)) {
        issues.push(`必須メモリファイル不足: ${memory}.md`);
      }
    }
    
    return issues;
  }

  async checkGitIntegration() {
    const issues = [];
    
    try {
      execSync('git status', { stdio: 'pipe' });
      
      // Pre-commit hookの確認
      if (!await this.pathExists('.husky/pre-commit')) {
        issues.push('Pre-commit hookが設定されていません');
      }
      
    } catch {
      issues.push('Gitリポジトリではありません');
    }
    
    return issues;
  }

  async checkPerformance() {
    const issues = [];
    
    if (await this.pathExists(CONFIG.cacheDir)) {
      const cacheSize = await this.calculateDirectorySize(CONFIG.cacheDir);
      
      if (cacheSize > 50 * 1024 * 1024) { // 50MB
        issues.push('キャッシュサイズが大きすぎます');
      }
    }
    
    return issues;
  }

  async createInitialConfig() {
    const config = {
      version: CONFIG.version,
      createdAt: new Date().toISOString(),
      settings: {
        autoUpdate: true,
        maxCacheSize: 50 * 1024 * 1024,
        logRetention: 30
      }
    };
    
    const configPath = path.join(CONFIG.serenaDir, 'config.json');
    await fs.writeFile(configPath, JSON.stringify(config, null, 2));
  }

  async cleanLogs() {
    if (await this.pathExists(CONFIG.logsDir)) {
      const logs = await fs.readdir(CONFIG.logsDir);
      
      for (const log of logs) {
        await fs.unlink(path.join(CONFIG.logsDir, log));
      }
      
      console.log(`✅ ${logs.length}件のログファイルを削除`);
    }
  }

  async getProjectInfo() {
    try {
      const packageJson = await this.readJsonFile('package.json');
      return {
        name: packageJson.name,
        version: packageJson.version,
        description: packageJson.description
      };
    } catch {
      return { name: 'unknown', version: 'unknown', description: 'unknown' };
    }
  }

  async getMemoryFileInfo() {
    const files = [];
    
    if (await this.pathExists(CONFIG.memoriesDir)) {
      const memories = await fs.readdir(CONFIG.memoriesDir);
      
      for (const memory of memories) {
        const filePath = path.join(CONFIG.memoriesDir, memory);
        const stats = await fs.stat(filePath);
        
        files.push({
          name: memory,
          size: stats.size,
          lastModified: stats.mtime.toISOString()
        });
      }
    }
    
    return files;
  }

  async getCacheStatus() {
    if (!await this.pathExists(CONFIG.cacheDir)) {
      return { enabled: false };
    }
    
    const size = await this.calculateDirectorySize(CONFIG.cacheDir);
    const files = await fs.readdir(CONFIG.cacheDir);
    
    return {
      enabled: true,
      size,
      fileCount: files.length
    };
  }

  async getGitIntegration() {
    try {
      execSync('git status', { stdio: 'pipe' });
      return { enabled: true };
    } catch {
      return { enabled: false };
    }
  }

  async getCIStatus() {
    const workflowsDir = '.github/workflows';
    
    if (await this.pathExists(workflowsDir)) {
      const workflows = await fs.readdir(workflowsDir);
      const serenaWorkflow = workflows.some(w => w.includes('serena'));
      
      return {
        enabled: true,
        workflowCount: workflows.length,
        serenaIntegrated: serenaWorkflow
      };
    }
    
    return { enabled: false };
  }

  async generateRecommendations(status) {
    const recommendations = [];
    
    if (status.memoryCount < 5) {
      recommendations.push('npm run serena:update でメモリファイルを更新してください');
    }
    
    if (status.cacheSize > 50 * 1024 * 1024) {
      recommendations.push('npm run serena:clean でキャッシュをクリーンアップしてください');
    }
    
    if (status.issues.length > 0) {
      recommendations.push('npm run serena:diagnose で詳細診断を実行してください');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Serena統合は正常に動作しています');
    }
    
    return recommendations;
  }

  getOption(options, key, defaultValue) {
    const option = options.find(opt => opt.startsWith(key));
    
    if (!option) return defaultValue;
    
    const [, value] = option.split('=');
    return value || defaultValue;
  }

  async calculateDirectorySize(dirPath) {
    try {
      const { execSync } = await import('child_process');
      const result = execSync(`du -sb "${dirPath}"`, { encoding: 'utf8' });
      return parseInt(result.split('\t')[0]);
    } catch {
      return 0;
    }
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
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
}

// CLI実行
if (import.meta.url === `file://${process.argv[1]}`) {
  const cli = new SerenaCLI();
  cli.run().then(exitCode => {
    process.exit(exitCode);
  }).catch(error => {
    console.error('CLI実行エラー:', error);
    process.exit(1);
  });
}

export default SerenaCLI;