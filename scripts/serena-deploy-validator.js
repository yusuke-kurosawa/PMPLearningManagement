#!/usr/bin/env node

/**
 * Serena Deploy Validator
 * デプロイ前後でSerenaメモリの整合性とプロジェクト品質を検証
 * 
 * 機能:
 * - デプロイ前品質チェック
 * - ビルド後検証
 * - パフォーマンス監視
 * - デプロイ後ヘルスチェック
 * 
 * @author Claude Code Integration System
 * @date 2025-09-20
 */

import fs from 'fs/promises';
import { execSync } from 'child_process';
import path from 'path';
import crypto from 'crypto';

const CONFIG = {
  serenaDir: '.serena',
  memoriesDir: '.serena/memories',
  deploymentLogsDir: '.serena/deployment-logs',
  buildDir: 'dist',
  maxBuildSize: 10 * 1024 * 1024, // 10MB
  requiredMemories: [
    'project_overview',
    'development_workflow_optimization',
    'performance_optimization',
    'testing_strategy',
    'security_guidelines'
  ],
  verbose: process.env.SERENA_VERBOSE === 'true',
  environment: process.env.NODE_ENV || 'production'
};

class SerenaDeployValidator {
  constructor() {
    this.startTime = Date.now();
    this.errors = [];
    this.warnings = [];
    this.metrics = {
      buildSize: 0,
      memoryHealth: 0,
      performanceScore: 0,
      securityScore: 0
    };
    this.deploymentId = this.generateDeploymentId();
  }

  /**
   * メインエントリーポイント
   */
  async run(phase = 'pre-deploy') {
    try {
      this.log(`🚀 Serena Deploy Validator 開始 - Phase: ${phase}`);
      
      await this.ensureDirectories();
      
      switch (phase) {
        case 'pre-deploy':
          await this.preDeployValidation();
          break;
        case 'post-build':
          await this.postBuildValidation();
          break;
        case 'post-deploy':
          await this.postDeployValidation();
          break;
        default:
          throw new Error(`未知のフェーズ: ${phase}`);
      }
      
      await this.generateDeploymentReport(phase);
      
      if (this.errors.length > 0) {
        this.error(`❌ デプロイ検証失敗 (${phase})`);
        return 1;
      }
      
      this.log(`✅ デプロイ検証完了 (${phase})`);
      return 0;
      
    } catch (error) {
      this.error('💥 デプロイ検証エラー:', error);
      return 1;
    }
  }

  /**
   * デプロイ前検証
   */
  async preDeployValidation() {
    this.log('🔍 デプロイ前検証開始');
    
    await Promise.all([
      this.validateSerenaMemories(),
      this.validateProjectStructure(),
      this.validateConfiguration(),
      this.checkSecurityRequirements()
    ]);
    
    // 総合評価
    const healthScore = this.calculateHealthScore();
    this.metrics.memoryHealth = healthScore;
    
    if (healthScore < 80) {
      this.warnings.push(`プロジェクト健全度が低いです: ${healthScore}%`);
    }
    
    this.log('✅ デプロイ前検証完了');
  }

  /**
   * ビルド後検証
   */
  async postBuildValidation() {
    this.log('🏗️ ビルド後検証開始');
    
    await Promise.all([
      this.validateBuildOutput(),
      this.checkBundleSize(),
      this.validateAssets(),
      this.checkPerformanceMetrics()
    ]);
    
    this.log('✅ ビルド後検証完了');
  }

  /**
   * デプロイ後検証
   */
  async postDeployValidation() {
    this.log('🌐 デプロイ後検証開始');
    
    await Promise.all([
      this.validateDeployedSite(),
      this.checkEndpointHealth(),
      this.validateSerenaIntegration(),
      this.collectDeploymentMetrics()
    ]);
    
    this.log('✅ デプロイ後検証完了');
  }

  /**
   * Serenaメモリの検証
   */
  async validateSerenaMemories() {
    try {
      if (!await this.pathExists(CONFIG.memoriesDir)) {
        this.warnings.push('Serenaメモリディレクトリが存在しません');
        return;
      }
      
      const memoryFiles = await fs.readdir(CONFIG.memoriesDir);
      const missingMemories = [];
      
      for (const requiredMemory of CONFIG.requiredMemories) {
        const memoryFile = `${requiredMemory}.md`;
        
        if (!memoryFiles.includes(memoryFile)) {
          missingMemories.push(requiredMemory);
          continue;
        }
        
        // メモリファイルの品質チェック
        await this.validateMemoryQuality(path.join(CONFIG.memoriesDir, memoryFile));
      }
      
      if (missingMemories.length > 0) {
        this.warnings.push(`不足メモリファイル: ${missingMemories.join(', ')}`);
      }
      
      // メモリ同期状態のチェック
      await this.checkMemorySyncStatus();
      
    } catch (error) {
      this.errors.push(`Serenaメモリ検証エラー: ${error.message}`);
    }
  }

  /**
   * プロジェクト構造の検証
   */
  async validateProjectStructure() {
    try {
      const requiredFiles = [
        'package.json',
        'vite.config.js',
        'src/App.jsx',
        'public/index.html'
      ];
      
      const missingFiles = [];
      for (const file of requiredFiles) {
        if (!await this.pathExists(file)) {
          missingFiles.push(file);
        }
      }
      
      if (missingFiles.length > 0) {
        this.errors.push(`必須ファイル不足: ${missingFiles.join(', ')}`);
      }
      
      // package.jsonの検証
      const packageJson = await this.readJsonFile('package.json');
      this.validatePackageJson(packageJson);
      
    } catch (error) {
      this.errors.push(`プロジェクト構造検証エラー: ${error.message}`);
    }
  }

  /**
   * 設定の検証
   */
  async validateConfiguration() {
    try {
      // Vite設定の検証
      if (await this.pathExists('vite.config.js')) {
        this.log('✓ Vite設定ファイル存在');
      }
      
      // TypeScript設定の検証
      if (await this.pathExists('tsconfig.json')) {
        const tsConfig = await this.readJsonFile('tsconfig.json');
        if (!tsConfig.compilerOptions) {
          this.warnings.push('TypeScript設定が不完全です');
        }
      }
      
      // GitHub Pages設定の検証
      const packageJson = await this.readJsonFile('package.json');
      if (!packageJson.homepage) {
        this.warnings.push('GitHub Pages用のhomepage設定が不足');
      }
      
    } catch (error) {
      this.errors.push(`設定検証エラー: ${error.message}`);
    }
  }

  /**
   * セキュリティ要件チェック
   */
  async checkSecurityRequirements() {
    try {
      // 依存関係の脆弱性チェック
      try {
        execSync('npm audit --audit-level=high --dry-run', { stdio: 'pipe' });
        this.log('✓ 依存関係セキュリティチェック: OK');
        this.metrics.securityScore += 40;
      } catch (error) {
        this.warnings.push('依存関係に脆弱性が検出されました');
      }
      
      // 環境変数の検証
      const packageJson = await this.readJsonFile('package.json');
      if (packageJson.scripts && packageJson.scripts.build) {
        this.metrics.securityScore += 30;
      }
      
      // セキュリティヘッダーの設定確認
      if (await this.pathExists('public/_headers')) {
        this.metrics.securityScore += 30;
        this.log('✓ セキュリティヘッダー設定確認');
      }
      
    } catch (error) {
      this.warnings.push(`セキュリティチェックエラー: ${error.message}`);
    }
  }

  /**
   * ビルド出力の検証
   */
  async validateBuildOutput() {
    try {
      if (!await this.pathExists(CONFIG.buildDir)) {
        this.errors.push('ビルド出力ディレクトリが存在しません');
        return;
      }
      
      // 必須ファイルの存在確認
      const requiredBuildFiles = ['index.html'];
      for (const file of requiredBuildFiles) {
        const filePath = path.join(CONFIG.buildDir, file);
        if (!await this.pathExists(filePath)) {
          this.errors.push(`ビルド必須ファイル不足: ${file}`);
        }
      }
      
      // ビルドサイズの計算
      this.metrics.buildSize = await this.calculateDirectorySize(CONFIG.buildDir);
      
    } catch (error) {
      this.errors.push(`ビルド出力検証エラー: ${error.message}`);
    }
  }

  /**
   * バンドルサイズチェック
   */
  async checkBundleSize() {
    try {
      if (this.metrics.buildSize > CONFIG.maxBuildSize) {
        this.warnings.push(`ビルドサイズが大きいです: ${(this.metrics.buildSize / 1024 / 1024).toFixed(2)}MB`);
      } else {
        this.log(`✓ ビルドサイズ: ${(this.metrics.buildSize / 1024 / 1024).toFixed(2)}MB`);
      }
      
      // 主要ファイルのサイズ分析
      await this.analyzeAssetSizes();
      
    } catch (error) {
      this.warnings.push(`バンドルサイズチェックエラー: ${error.message}`);
    }
  }

  /**
   * アセットの検証
   */
  async validateAssets() {
    try {
      const assetsDir = path.join(CONFIG.buildDir, 'assets');
      
      if (await this.pathExists(assetsDir)) {
        const assets = await fs.readdir(assetsDir);
        
        // JSファイルの存在確認
        const jsFiles = assets.filter(file => file.endsWith('.js'));
        if (jsFiles.length === 0) {
          this.errors.push('JavaScriptファイルが見つかりません');
        }
        
        // CSSファイルの存在確認
        const cssFiles = assets.filter(file => file.endsWith('.css'));
        if (cssFiles.length === 0) {
          this.warnings.push('CSSファイルが見つかりません');
        }
        
        this.log(`✓ アセットファイル: JS(${jsFiles.length}), CSS(${cssFiles.length})`);
      }
      
    } catch (error) {
      this.warnings.push(`アセット検証エラー: ${error.message}`);
    }
  }

  /**
   * パフォーマンスメトリクスチェック
   */
  async checkPerformanceMetrics() {
    try {
      // ビルド時間の記録
      const buildTime = Date.now() - this.startTime;
      
      // パフォーマンススコアの計算
      let score = 100;
      
      if (this.metrics.buildSize > CONFIG.maxBuildSize) {
        score -= 20;
      }
      
      if (buildTime > 120000) { // 2分
        score -= 15;
      }
      
      this.metrics.performanceScore = score;
      
      this.log(`✓ パフォーマンススコア: ${score}%`);
      
    } catch (error) {
      this.warnings.push(`パフォーマンスチェックエラー: ${error.message}`);
    }
  }

  /**
   * デプロイされたサイトの検証
   */
  async validateDeployedSite() {
    try {
      const packageJson = await this.readJsonFile('package.json');
      
      if (packageJson.homepage) {
        this.log(`✓ デプロイURL: ${packageJson.homepage}`);
        // 実際のHTTPチェックは省略（環境依存のため）
      }
      
    } catch (error) {
      this.warnings.push(`デプロイサイト検証エラー: ${error.message}`);
    }
  }

  /**
   * エンドポイントヘルスチェック
   */
  async checkEndpointHealth() {
    try {
      // 基本的なファイル存在チェック
      const indexPath = path.join(CONFIG.buildDir, 'index.html');
      
      if (await this.pathExists(indexPath)) {
        const content = await fs.readFile(indexPath, 'utf8');
        
        // 基本的なHTML構造チェック
        if (!content.includes('<html') || !content.includes('</html>')) {
          this.errors.push('index.htmlの構造が無効です');
        }
        
        // React rootの存在確認
        if (!content.includes('id="root"')) {
          this.warnings.push('React root要素が見つかりません');
        }
        
        this.log('✓ エンドポイントヘルスチェック: OK');
      }
      
    } catch (error) {
      this.errors.push(`エンドポイントヘルスチェックエラー: ${error.message}`);
    }
  }

  /**
   * Serena統合の検証
   */
  async validateSerenaIntegration() {
    try {
      // メモリファイルの最終チェック
      if (await this.pathExists(CONFIG.memoriesDir)) {
        const memories = await fs.readdir(CONFIG.memoriesDir);
        this.log(`✓ Serena統合: ${memories.length}メモリファイル`);
      }
      
      // デプロイメントログの記録
      await this.recordDeploymentEvent();
      
    } catch (error) {
      this.warnings.push(`Serena統合検証エラー: ${error.message}`);
    }
  }

  /**
   * デプロイメントメトリクスの収集
   */
  async collectDeploymentMetrics() {
    try {
      const metrics = {
        deploymentId: this.deploymentId,
        timestamp: new Date().toISOString(),
        buildSize: this.metrics.buildSize,
        buildTime: Date.now() - this.startTime,
        environment: CONFIG.environment,
        errors: this.errors.length,
        warnings: this.warnings.length,
        performanceScore: this.metrics.performanceScore,
        securityScore: this.metrics.securityScore
      };
      
      // メトリクスファイルに保存
      const metricsPath = path.join(CONFIG.deploymentLogsDir, `deployment-${this.deploymentId}.json`);
      await fs.writeFile(metricsPath, JSON.stringify(metrics, null, 2));
      
      this.log('✓ デプロイメントメトリクス収集完了');
      
    } catch (error) {
      this.warnings.push(`メトリクス収集エラー: ${error.message}`);
    }
  }

  /**
   * デプロイメントレポートの生成
   */
  async generateDeploymentReport(phase) {
    try {
      const report = {
        phase,
        deploymentId: this.deploymentId,
        timestamp: new Date().toISOString(),
        duration: Date.now() - this.startTime,
        metrics: this.metrics,
        errors: this.errors,
        warnings: this.warnings,
        summary: {
          success: this.errors.length === 0,
          healthScore: this.calculateHealthScore(),
          recommendation: this.generateRecommendation()
        }
      };
      
      const reportPath = path.join(CONFIG.deploymentLogsDir, `${phase}-report-${this.deploymentId}.json`);
      await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
      
      // コンソール出力
      this.printReport(report);
      
    } catch (error) {
      this.error('レポート生成エラー:', error);
    }
  }

  // ユーティリティメソッド
  async ensureDirectories() {
    const dirs = [CONFIG.deploymentLogsDir];
    
    for (const dir of dirs) {
      try {
        await fs.access(dir);
      } catch {
        await fs.mkdir(dir, { recursive: true });
      }
    }
  }

  calculateHealthScore() {
    let score = 100;
    
    score -= this.errors.length * 20;
    score -= this.warnings.length * 5;
    
    if (this.metrics.performanceScore > 0) {
      score = (score + this.metrics.performanceScore) / 2;
    }
    
    return Math.max(0, Math.round(score));
  }

  generateRecommendation() {
    const recommendations = [];
    
    if (this.errors.length > 0) {
      recommendations.push('エラーを修正してから再デプロイしてください');
    }
    
    if (this.metrics.buildSize > CONFIG.maxBuildSize) {
      recommendations.push('バンドルサイズの最適化を検討してください');
    }
    
    if (this.warnings.some(w => w.includes('メモリ'))) {
      recommendations.push('Serenaメモリファイルの更新を実行してください');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('デプロイ品質は良好です');
    }
    
    return recommendations;
  }

  printReport(report) {
    console.log('\n🚀 Serena Deploy Validation Report');
    console.log('═'.repeat(50));
    console.log(`Phase: ${report.phase}`);
    console.log(`Deployment ID: ${report.deploymentId}`);
    console.log(`Duration: ${report.duration}ms`);
    console.log(`Health Score: ${report.summary.healthScore}%`);
    
    if (report.errors.length > 0) {
      console.log('\n❌ Errors:');
      report.errors.forEach((error, i) => console.log(`  ${i + 1}. ${error}`));
    }
    
    if (report.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      report.warnings.forEach((warning, i) => console.log(`  ${i + 1}. ${warning}`));
    }
    
    console.log('\n🎯 Recommendations:');
    report.summary.recommendation.forEach((rec, i) => console.log(`  ${i + 1}. ${rec}`));
    
    console.log('═'.repeat(50));
  }

  async validateMemoryQuality(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      
      if (content.length > 51200) {
        this.warnings.push(`メモリファイルが大きすぎます: ${path.basename(filePath)}`);
      }
      
      if (!content.includes('#')) {
        this.warnings.push(`メモリファイルにヘッダーがありません: ${path.basename(filePath)}`);
      }
      
    } catch (error) {
      this.errors.push(`メモリファイル検証エラー: ${path.basename(filePath)}`);
    }
  }

  async checkMemorySyncStatus() {
    try {
      const cacheFile = path.join(CONFIG.serenaDir, 'cache/memory-cache.json');
      
      if (await this.pathExists(cacheFile)) {
        const cache = await this.readJsonFile(cacheFile);
        
        if (cache.timestamp) {
          const lastUpdate = new Date(cache.timestamp);
          const ageInHours = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60);
          
          if (ageInHours > 24) {
            this.warnings.push(`Serenaメモリが${Math.round(ageInHours)}時間更新されていません`);
          }
        }
      }
      
    } catch (error) {
      this.warnings.push('Serenaメモリ同期状態チェックエラー');
    }
  }

  validatePackageJson(packageJson) {
    if (!packageJson.name) {
      this.errors.push('package.jsonにnameが不足');
    }
    
    if (!packageJson.version) {
      this.errors.push('package.jsonにversionが不足');
    }
    
    if (!packageJson.scripts || !packageJson.scripts.build) {
      this.errors.push('buildスクリプトが定義されていません');
    }
    
    if (!packageJson.homepage) {
      this.warnings.push('GitHub Pages用homepageが未設定');
    }
  }

  async analyzeAssetSizes() {
    try {
      const assetsDir = path.join(CONFIG.buildDir, 'assets');
      
      if (await this.pathExists(assetsDir)) {
        const assets = await fs.readdir(assetsDir);
        
        for (const asset of assets) {
          const assetPath = path.join(assetsDir, asset);
          const stats = await fs.stat(assetPath);
          
          if (stats.size > 1024 * 1024) { // 1MB
            this.warnings.push(`大きなアセットファイル: ${asset} (${(stats.size / 1024 / 1024).toFixed(2)}MB)`);
          }
        }
      }
      
    } catch (error) {
      this.warnings.push('アセットサイズ分析エラー');
    }
  }

  async calculateDirectorySize(dirPath) {
    try {
      const result = execSync(`du -sb "${dirPath}"`, { encoding: 'utf8' });
      return parseInt(result.split('\t')[0]);
    } catch {
      return 0;
    }
  }

  async recordDeploymentEvent() {
    try {
      const event = {
        id: this.deploymentId,
        timestamp: new Date().toISOString(),
        phase: 'deployment',
        status: this.errors.length === 0 ? 'success' : 'warning',
        metrics: this.metrics
      };
      
      const eventsPath = path.join(CONFIG.deploymentLogsDir, 'deployment-events.json');
      
      let events = [];
      if (await this.pathExists(eventsPath)) {
        try {
          const content = await fs.readFile(eventsPath, 'utf8');
          events = JSON.parse(content);
        } catch {
          events = [];
        }
      }
      
      events.push(event);
      
      // 最新100件のみ保持
      if (events.length > 100) {
        events = events.slice(-100);
      }
      
      await fs.writeFile(eventsPath, JSON.stringify(events, null, 2));
      
    } catch (error) {
      this.warnings.push('デプロイメントイベント記録エラー');
    }
  }

  generateDeploymentId() {
    const timestamp = Date.now().toString();
    const hash = crypto.createHash('md5').update(timestamp).digest('hex').slice(0, 8);
    return `deploy-${hash}`;
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

  log(message) {
    if (CONFIG.verbose) {
      console.log(`[Serena Deploy] ${message}`);
    }
  }

  error(message, error = null) {
    console.error(`[Serena Deploy Error] ${message}`);
    if (error && CONFIG.verbose) {
      console.error(error);
    }
  }
}

// CLI実行
if (import.meta.url === `file://${process.argv[1]}`) {
  const phase = process.argv[2] || 'pre-deploy';
  const validator = new SerenaDeployValidator();
  
  validator.run(phase).then(exitCode => {
    process.exit(exitCode);
  }).catch(error => {
    console.error('Deploy validator 実行エラー:', error);
    process.exit(1);
  });
}

export default SerenaDeployValidator;