#!/usr/bin/env node

/**
 * TypeScript パフォーマンス監視スクリプト
 * 
 * 目的: TypeScript型チェックとビルドパフォーマンスの測定・分析
 * 機能: 
 * - 型チェック時間測定
 * - ビルド時間測定
 * - Bundle サイズ分析
 * - 型安全性メトリクス
 * - パフォーマンス履歴追跡
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');

class TypeScriptPerformanceMonitor {
  constructor() {
    this.metricsFile = join(PROJECT_ROOT, '.github', 'typescript-metrics.json');
    this.results = {
      timestamp: new Date().toISOString(),
      typecheck: {},
      build: {},
      bundle: {},
      quality: {},
      previous: this.loadPreviousMetrics()
    };
  }

  /**
   * 前回のメトリクスを読み込み
   */
  loadPreviousMetrics() {
    try {
      if (existsSync(this.metricsFile)) {
        const data = readFileSync(this.metricsFile, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.warn('⚠️ Previous metrics could not be loaded:', error.message);
    }
    return null;
  }

  /**
   * コマンド実行時間測定
   */
  async measureCommandTime(command, description) {
    console.log(`🔍 ${description} 開始...`);
    const startTime = Date.now();
    
    try {
      const output = execSync(command, { 
        cwd: PROJECT_ROOT,
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;
      
      console.log(`✅ ${description} 完了: ${duration.toFixed(2)}秒`);
      
      return { 
        success: true, 
        duration, 
        output: output.trim()
      };
    } catch (error) {
      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;
      
      console.log(`❌ ${description} 失敗: ${duration.toFixed(2)}秒`);
      console.error(`Error: ${error.message}`);
      
      return { 
        success: false, 
        duration, 
        error: error.message
      };
    }
  }

  /**
   * TypeScript型チェック性能測定
   */
  async measureTypeCheck() {
    console.log('\n📊 TypeScript型チェック性能測定');
    console.log('================================');

    // 基本型チェック
    const typeCheckResult = await this.measureCommandTime(
      'npm run typecheck',
      'TypeScript型チェック'
    );

    this.results.typecheck = {
      duration: typeCheckResult.duration,
      success: typeCheckResult.success,
      error: typeCheckResult.error || null
    };

    // 型チェック詳細分析
    if (typeCheckResult.success) {
      await this.analyzeTypeQuality();
    }

    // パフォーマンス評価
    this.evaluateTypeCheckPerformance();
  }

  /**
   * 型品質分析
   */
  async analyzeTypeQuality() {
    console.log('\n🎯 型品質分析実行...');
    
    try {
      // any使用数カウント
      const anyUsageResult = await this.measureCommandTime(
        'npm run ts:any-check',
        'any使用数カウント'
      );
      
      const anyCount = parseInt(anyUsageResult.output) || 0;
      
      // TypeScriptファイル総数
      const tsFileCountResult = await this.measureCommandTime(
        'find src -name "*.ts" -o -name "*.tsx" | wc -l',
        'TypeScriptファイル数カウント'
      );
      
      const totalTsFiles = parseInt(tsFileCountResult.output) || 1;
      
      // 型注釈総数（概算）
      const typeAnnotationResult = await this.measureCommandTime(
        'grep -r ": " src/ --include="*.ts" --include="*.tsx" | wc -l',
        '型注釈数カウント'
      );
      
      const totalTypeAnnotations = parseInt(typeAnnotationResult.output) || 1;
      
      // any使用率計算
      const anyUsageRate = ((anyCount / totalTypeAnnotations) * 100).toFixed(2);
      
      this.results.quality = {
        anyUsageCount: anyCount,
        anyUsageRate: parseFloat(anyUsageRate),
        totalTypeScriptFiles: totalTsFiles,
        totalTypeAnnotations: totalTypeAnnotations,
        typeQualityScore: this.calculateTypeQualityScore(anyUsageRate)
      };
      
      console.log(`📈 型品質メトリクス:`);
      console.log(`  - any使用数: ${anyCount}件`);
      console.log(`  - any使用率: ${anyUsageRate}%`);
      console.log(`  - TypeScriptファイル数: ${totalTsFiles}件`);
      console.log(`  - 型品質スコア: ${this.results.quality.typeQualityScore}/100`);
      
    } catch (error) {
      console.error('❌ 型品質分析エラー:', error.message);
      this.results.quality = { error: error.message };
    }
  }

  /**
   * 型品質スコア計算
   */
  calculateTypeQualityScore(anyUsageRate) {
    const rate = parseFloat(anyUsageRate);
    if (rate <= 1) return 100;
    if (rate <= 5) return 90;
    if (rate <= 10) return 75;
    if (rate <= 20) return 50;
    return 25;
  }

  /**
   * ビルド性能測定
   */
  async measureBuildPerformance() {
    console.log('\n🏗️ ビルド性能測定');
    console.log('==================');

    const buildResult = await this.measureCommandTime(
      'npm run build',
      'プロダクションビルド'
    );

    this.results.build = {
      duration: buildResult.duration,
      success: buildResult.success,
      error: buildResult.error || null
    };

    // Bundle分析
    if (buildResult.success) {
      await this.analyzeBundleSize();
    }

    // ビルドパフォーマンス評価
    this.evaluateBuildPerformance();
  }

  /**
   * Bundle サイズ分析
   */
  async analyzeBundleSize() {
    console.log('\n📦 Bundle サイズ分析...');
    
    try {
      const distPath = join(PROJECT_ROOT, 'dist');
      
      if (!existsSync(distPath)) {
        throw new Error('dist ディレクトリが見つかりません');
      }
      
      // 総Bundle サイズ
      const bundleSizeResult = await this.measureCommandTime(
        'du -s dist | cut -f1',
        'Bundle サイズ測定'
      );
      
      const bundleSizeKB = parseInt(bundleSizeResult.output) || 0;
      const bundleSizeMB = (bundleSizeKB / 1024).toFixed(2);
      
      // 主要ファイル分析
      const jsFilesResult = await this.measureCommandTime(
        'find dist -name "*.js" -type f',
        'JavaScriptファイル検索'
      );
      
      const jsFiles = jsFilesResult.output.split('\n').filter(f => f.trim());
      
      this.results.bundle = {
        totalSizeKB: bundleSizeKB,
        totalSizeMB: parseFloat(bundleSizeMB),
        jsFileCount: jsFiles.length,
        bundleQualityScore: this.calculateBundleQualityScore(bundleSizeMB)
      };
      
      console.log(`📦 Bundle 分析結果:`);
      console.log(`  - 総サイズ: ${bundleSizeMB}MB`);
      console.log(`  - JSファイル数: ${jsFiles.length}件`);
      console.log(`  - Bundle品質スコア: ${this.results.bundle.bundleQualityScore}/100`);
      
    } catch (error) {
      console.error('❌ Bundle分析エラー:', error.message);
      this.results.bundle = { error: error.message };
    }
  }

  /**
   * Bundle品質スコア計算
   */
  calculateBundleQualityScore(sizeMB) {
    const size = parseFloat(sizeMB);
    if (size <= 1.0) return 100;
    if (size <= 1.5) return 90;
    if (size <= 2.0) return 75;
    if (size <= 3.0) return 50;
    return 25;
  }

  /**
   * TypeScript型チェックパフォーマンス評価
   */
  evaluateTypeCheckPerformance() {
    const { duration, success } = this.results.typecheck;
    
    console.log('\n📊 型チェックパフォーマンス評価:');
    
    if (!success) {
      console.log('❌ 型チェック失敗 - 型エラーが存在します');
      return;
    }
    
    if (duration <= 30) {
      console.log(`✅ 優秀: 型チェック時間が目標内です (${duration.toFixed(2)}s ≤ 30s)`);
    } else if (duration <= 60) {
      console.log(`⚠️ 改善推奨: 型チェック時間がやや長いです (${duration.toFixed(2)}s > 30s)`);
    } else {
      console.log(`❌ 要改善: 型チェック時間が長すぎます (${duration.toFixed(2)}s > 60s)`);
    }
    
    // 前回との比較
    if (this.results.previous?.typecheck?.duration) {
      const previousDuration = this.results.previous.typecheck.duration;
      const improvement = ((previousDuration - duration) / previousDuration * 100).toFixed(1);
      
      if (improvement > 0) {
        console.log(`📈 改善: 前回より${improvement}%高速化`);
      } else {
        console.log(`📉 劣化: 前回より${Math.abs(improvement)}%低速化`);
      }
    }
  }

  /**
   * ビルドパフォーマンス評価
   */
  evaluateBuildPerformance() {
    const { duration, success } = this.results.build;
    
    console.log('\n📊 ビルドパフォーマンス評価:');
    
    if (!success) {
      console.log('❌ ビルド失敗');
      return;
    }
    
    if (duration <= 60) {
      console.log(`✅ 優秀: ビルド時間が目標内です (${duration.toFixed(2)}s ≤ 60s)`);
    } else if (duration <= 120) {
      console.log(`⚠️ 改善推奨: ビルド時間がやや長いです (${duration.toFixed(2)}s > 60s)`);
    } else {
      console.log(`❌ 要改善: ビルド時間が長すぎます (${duration.toFixed(2)}s > 120s)`);
    }
    
    // 前回との比較
    if (this.results.previous?.build?.duration) {
      const previousDuration = this.results.previous.build.duration;
      const improvement = ((previousDuration - duration) / previousDuration * 100).toFixed(1);
      
      if (improvement > 0) {
        console.log(`📈 改善: 前回より${improvement}%高速化`);
      } else {
        console.log(`📉 劣化: 前回より${Math.abs(improvement)}%低速化`);
      }
    }
  }

  /**
   * 総合パフォーマンススコア計算
   */
  calculateOverallScore() {
    let totalScore = 0;
    let weightSum = 0;
    
    // 型チェック成功 (重み: 40%)
    if (this.results.typecheck.success) {
      const typeScore = this.results.typecheck.duration <= 30 ? 100 : 
                       this.results.typecheck.duration <= 60 ? 75 : 50;
      totalScore += typeScore * 0.4;
    }
    weightSum += 0.4;
    
    // ビルド成功 (重み: 30%)
    if (this.results.build.success) {
      const buildScore = this.results.build.duration <= 60 ? 100 : 
                        this.results.build.duration <= 120 ? 75 : 50;
      totalScore += buildScore * 0.3;
    }
    weightSum += 0.3;
    
    // 型品質 (重み: 20%)
    if (this.results.quality.typeQualityScore) {
      totalScore += this.results.quality.typeQualityScore * 0.2;
      weightSum += 0.2;
    }
    
    // Bundle品質 (重み: 10%)
    if (this.results.bundle.bundleQualityScore) {
      totalScore += this.results.bundle.bundleQualityScore * 0.1;
      weightSum += 0.1;
    }
    
    return weightSum > 0 ? Math.round(totalScore / weightSum) : 0;
  }

  /**
   * メトリクスを保存
   */
  saveMetrics() {
    this.results.overallScore = this.calculateOverallScore();
    
    try {
      writeFileSync(this.metricsFile, JSON.stringify(this.results, null, 2));
      console.log(`\n💾 メトリクスを保存しました: ${this.metricsFile}`);
    } catch (error) {
      console.error('❌ メトリクス保存エラー:', error.message);
    }
  }

  /**
   * 最終レポート生成
   */
  generateReport() {
    console.log('\n🎯 TypeScript パフォーマンス最終レポート');
    console.log('==========================================');
    console.log(`📅 測定時刻: ${this.results.timestamp}`);
    console.log(`🎯 総合スコア: ${this.results.overallScore}/100`);
    console.log('');
    
    // TypeScript型チェック
    console.log('📊 TypeScript型チェック:');
    if (this.results.typecheck.success) {
      console.log(`  ✅ 成功 (${this.results.typecheck.duration.toFixed(2)}秒)`);
    } else {
      console.log(`  ❌ 失敗`);
    }
    
    // ビルド
    console.log('🏗️ ビルド:');
    if (this.results.build.success) {
      console.log(`  ✅ 成功 (${this.results.build.duration.toFixed(2)}秒)`);
    } else {
      console.log(`  ❌ 失敗`);
    }
    
    // 型品質
    if (this.results.quality.typeQualityScore) {
      console.log(`📈 型品質: ${this.results.quality.typeQualityScore}/100 (any使用率: ${this.results.quality.anyUsageRate}%)`);
    }
    
    // Bundle品質
    if (this.results.bundle.bundleQualityScore) {
      console.log(`📦 Bundle品質: ${this.results.bundle.bundleQualityScore}/100 (サイズ: ${this.results.bundle.totalSizeMB}MB)`);
    }
    
    console.log('');
    console.log('🔗 Issue #132: ビルドシステム最適化・CI/CD調整・型チェック統合');
  }

  /**
   * メイン実行
   */
  async run() {
    console.log('🚀 TypeScript パフォーマンス監視開始');
    console.log('==================================');
    
    try {
      await this.measureTypeCheck();
      await this.measureBuildPerformance();
      this.saveMetrics();
      this.generateReport();
      
      console.log('\n✅ TypeScript パフォーマンス監視完了');
      
      // 失敗があった場合は適切な終了コードを返す
      const hasFailures = !this.results.typecheck.success || !this.results.build.success;
      if (hasFailures) {
        process.exit(1);
      }
      
    } catch (error) {
      console.error('❌ パフォーマンス監視エラー:', error.message);
      process.exit(1);
    }
  }
}

// スクリプト実行
if (import.meta.url === `file://${process.argv[1]}`) {
  const monitor = new TypeScriptPerformanceMonitor();
  monitor.run().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

export default TypeScriptPerformanceMonitor;