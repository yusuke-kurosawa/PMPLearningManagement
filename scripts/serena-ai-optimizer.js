#!/usr/bin/env node

/**
 * Serena AI-Driven Memory Optimizer
 * 機械学習ベースのメモリ最適化システム
 * 
 * 主要機能:
 * - メモリ使用パターンの学習と予測
 * - 動的なメモリ割り当て最適化
 * - 異常検知とアラート機能
 * - インテリジェントなプリロード戦略
 */

import fs from 'fs/promises';
import path from 'path';
import { performance } from 'perf_hooks';
import { EventEmitter } from 'events';
import chalk from 'chalk';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * メモリ使用パターン学習モデル
 */
class MemoryPatternLearner {
  constructor() {
    this.patterns = new Map();
    this.timeSeriesData = [];
    this.seasonalPatterns = new Map();
    this.anomalyThresholds = {
      memoryUsage: { mean: 0, std: 0 },
      allocations: { mean: 0, std: 0 },
      gcFrequency: { mean: 0, std: 0 }
    };
  }

  /**
   * メモリ使用パターンを学習
   */
  async learnPattern(context, memoryData) {
    const pattern = {
      timestamp: Date.now(),
      context,
      memory: memoryData,
      features: this.extractFeatures(memoryData)
    };

    // パターンをコンテキスト別に保存
    if (!this.patterns.has(context)) {
      this.patterns.set(context, []);
    }
    this.patterns.get(context).push(pattern);

    // 時系列データに追加
    this.timeSeriesData.push(pattern);

    // 季節性パターンの検出
    this.detectSeasonality(pattern);

    // 異常検知のための統計を更新
    this.updateAnomalyStatistics(pattern);

    return pattern;
  }

  /**
   * 特徴量抽出
   */
  extractFeatures(memoryData) {
    return {
      heapUsedRatio: memoryData.heapUsed / memoryData.heapTotal,
      externalMemory: memoryData.external || 0,
      arrayBuffers: memoryData.arrayBuffers || 0,
      gcPressure: this.calculateGCPressure(memoryData),
      fragmentationLevel: this.calculateFragmentation(memoryData),
      allocationRate: this.calculateAllocationRate(memoryData),
      peakUsage: Math.max(...(this.timeSeriesData.slice(-100).map(d => d.memory.heapUsed) || [0]))
    };
  }

  /**
   * GC圧力の計算
   */
  calculateGCPressure(memoryData) {
    const usedRatio = memoryData.heapUsed / memoryData.heapTotal;
    const recentGCs = this.timeSeriesData
      .slice(-10)
      .filter(d => d.memory.gcCount > 0).length;
    
    return usedRatio * 0.7 + (recentGCs / 10) * 0.3;
  }

  /**
   * メモリフラグメンテーションの計算
   */
  calculateFragmentation(memoryData) {
    const totalAllocated = memoryData.heapTotal;
    const actualUsed = memoryData.heapUsed;
    const external = memoryData.external || 0;
    
    return 1 - (actualUsed / (totalAllocated - external));
  }

  /**
   * アロケーション率の計算
   */
  calculateAllocationRate(memoryData) {
    if (this.timeSeriesData.length < 2) return 0;
    
    const previousData = this.timeSeriesData[this.timeSeriesData.length - 1];
    const timeDelta = Date.now() - previousData.timestamp;
    const memoryDelta = memoryData.heapUsed - previousData.memory.heapUsed;
    
    return memoryDelta / timeDelta;
  }

  /**
   * 季節性パターンの検出
   */
  detectSeasonality(pattern) {
    const hour = new Date(pattern.timestamp).getHours();
    const dayOfWeek = new Date(pattern.timestamp).getDay();
    const key = `${dayOfWeek}-${hour}`;

    if (!this.seasonalPatterns.has(key)) {
      this.seasonalPatterns.set(key, {
        samples: [],
        average: 0,
        trend: 'stable'
      });
    }

    const seasonal = this.seasonalPatterns.get(key);
    seasonal.samples.push(pattern.features.heapUsedRatio);
    
    // 移動平均の計算
    if (seasonal.samples.length > 10) {
      seasonal.samples.shift();
    }
    seasonal.average = seasonal.samples.reduce((a, b) => a + b, 0) / seasonal.samples.length;
    
    // トレンドの判定
    if (seasonal.samples.length >= 5) {
      const recent = seasonal.samples.slice(-3).reduce((a, b) => a + b, 0) / 3;
      const older = seasonal.samples.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
      
      if (recent > older * 1.1) seasonal.trend = 'increasing';
      else if (recent < older * 0.9) seasonal.trend = 'decreasing';
      else seasonal.trend = 'stable';
    }
  }

  /**
   * 異常検知統計の更新
   */
  updateAnomalyStatistics(pattern) {
    const metrics = {
      memoryUsage: pattern.features.heapUsedRatio,
      allocations: pattern.features.allocationRate,
      gcFrequency: pattern.features.gcPressure
    };

    for (const [key, value] of Object.entries(metrics)) {
      const samples = this.timeSeriesData
        .slice(-100)
        .map(d => d.features[key] || 0);
      
      if (samples.length > 0) {
        const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
        const std = Math.sqrt(
          samples.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / samples.length
        );
        
        this.anomalyThresholds[key] = { mean, std };
      }
    }
  }

  /**
   * メモリ使用量の予測
   */
  predict(context, horizon = 5) {
    const contextPatterns = this.patterns.get(context) || [];
    const seasonalData = this.getCurrentSeasonalData();
    
    if (contextPatterns.length < 3) {
      // データ不足の場合は単純な線形予測
      return this.simpleLinearPrediction(horizon);
    }

    // ARIMA風の時系列予測
    const predictions = [];
    const recentData = contextPatterns.slice(-20);
    
    for (let i = 0; i < horizon; i++) {
      const prediction = this.arimaPredict(recentData, seasonalData);
      predictions.push({
        timestamp: Date.now() + (i + 1) * 60000,
        estimatedHeapUsed: prediction.heapUsed,
        estimatedGCPressure: prediction.gcPressure,
        confidence: this.calculateConfidence(recentData)
      });
    }

    return predictions;
  }

  /**
   * ARIMA風の予測
   */
  arimaPredict(data, seasonalData) {
    // 自己回帰成分
    const ar = data.slice(-3).reduce((sum, d) => 
      sum + d.features.heapUsedRatio, 0) / 3;
    
    // 移動平均成分
    const ma = data.slice(-5).reduce((sum, d) => 
      sum + d.features.heapUsedRatio, 0) / 5;
    
    // 季節性成分
    const seasonal = seasonalData ? seasonalData.average : 0;
    
    // 予測値の計算
    const predicted = ar * 0.5 + ma * 0.3 + seasonal * 0.2;
    
    return {
      heapUsed: predicted * (process.memoryUsage().heapTotal),
      gcPressure: this.predictGCPressure(predicted)
    };
  }

  /**
   * GC圧力の予測
   */
  predictGCPressure(heapUsedRatio) {
    if (heapUsedRatio > 0.9) return 'critical';
    if (heapUsedRatio > 0.7) return 'high';
    if (heapUsedRatio > 0.5) return 'medium';
    return 'low';
  }

  /**
   * 予測信頼度の計算
   */
  calculateConfidence(data) {
    if (data.length < 5) return 0.3;
    
    // データの分散を計算
    const values = data.map(d => d.features.heapUsedRatio);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    
    // 分散が小さいほど信頼度が高い
    const confidence = Math.max(0, 1 - variance);
    return Math.min(0.95, confidence);
  }

  /**
   * 現在の季節性データを取得
   */
  getCurrentSeasonalData() {
    const now = new Date();
    const key = `${now.getDay()}-${now.getHours()}`;
    return this.seasonalPatterns.get(key);
  }

  /**
   * 単純な線形予測
   */
  simpleLinearPrediction(horizon) {
    const recent = this.timeSeriesData.slice(-10);
    if (recent.length < 2) return [];
    
    const trend = (recent[recent.length - 1].memory.heapUsed - recent[0].memory.heapUsed) / recent.length;
    const current = recent[recent.length - 1].memory.heapUsed;
    
    return Array.from({ length: horizon }, (_, i) => ({
      timestamp: Date.now() + (i + 1) * 60000,
      estimatedHeapUsed: current + trend * (i + 1),
      estimatedGCPressure: 'medium',
      confidence: 0.5
    }));
  }
}

/**
 * メモリ割り当て最適化エンジン
 */
class MemoryAllocationOptimizer {
  constructor(learner) {
    this.learner = learner;
    this.allocationStrategy = 'adaptive';
    this.poolSizes = new Map();
    this.cacheConfig = {
      maxSize: 100 * 1024 * 1024, // 100MB
      ttl: 3600000, // 1時間
      strategy: 'lru'
    };
  }

  /**
   * メモリ割り当ての最適化
   */
  async optimize(context) {
    const predictions = this.learner.predict(context);
    const currentUsage = process.memoryUsage();
    
    // 最適なメモリ割り当て戦略を決定
    const strategy = this.determineStrategy(predictions, currentUsage);
    
    // メモリプールのサイズ調整
    this.adjustMemoryPools(strategy, predictions);
    
    // キャッシュ設定の最適化
    this.optimizeCacheSettings(predictions);
    
    // GCの最適化
    await this.optimizeGC(strategy);
    
    return {
      strategy,
      poolSizes: Array.from(this.poolSizes),
      cacheConfig: this.cacheConfig,
      recommendations: this.generateRecommendations(predictions)
    };
  }

  /**
   * メモリ戦略の決定
   */
  determineStrategy(predictions, currentUsage) {
    if (!predictions || predictions.length === 0) {
      return 'conservative';
    }

    const avgPredicted = predictions.reduce((sum, p) => 
      sum + p.estimatedHeapUsed, 0) / predictions.length;
    const currentRatio = currentUsage.heapUsed / currentUsage.heapTotal;
    
    // 予測値と現在値から戦略を決定
    if (avgPredicted > currentUsage.heapTotal * 0.8) {
      return 'aggressive_gc';
    } else if (avgPredicted > currentUsage.heapTotal * 0.6) {
      return 'balanced';
    } else if (currentRatio < 0.3) {
      return 'lazy_allocation';
    } else {
      return 'adaptive';
    }
  }

  /**
   * メモリプールの調整
   */
  adjustMemoryPools(strategy, predictions) {
    const poolConfigs = {
      aggressive_gc: { small: 1024, medium: 4096, large: 16384 },
      balanced: { small: 2048, medium: 8192, large: 32768 },
      lazy_allocation: { small: 4096, medium: 16384, large: 65536 },
      adaptive: { small: 2048, medium: 8192, large: 32768 },
      conservative: { small: 512, medium: 2048, large: 8192 }
    };

    const config = poolConfigs[strategy];
    
    // プールサイズを設定
    this.poolSizes.set('small', config.small);
    this.poolSizes.set('medium', config.medium);
    this.poolSizes.set('large', config.large);
    
    // 予測に基づいて動的調整
    if (predictions.length > 0) {
      const maxPredicted = Math.max(...predictions.map(p => p.estimatedHeapUsed));
      if (maxPredicted > 500 * 1024 * 1024) { // 500MB以上
        // 大規模メモリ使用が予測される場合
        this.poolSizes.set('xlarge', 131072);
      }
    }
  }

  /**
   * キャッシュ設定の最適化
   */
  optimizeCacheSettings(predictions) {
    if (!predictions || predictions.length === 0) return;
    
    const avgPredicted = predictions.reduce((sum, p) => 
      sum + p.estimatedHeapUsed, 0) / predictions.length;
    
    // 予測メモリ使用量に基づいてキャッシュサイズを調整
    if (avgPredicted < 100 * 1024 * 1024) {
      this.cacheConfig.maxSize = 50 * 1024 * 1024; // 50MB
      this.cacheConfig.strategy = 'lfu'; // 頻度ベース
    } else if (avgPredicted < 300 * 1024 * 1024) {
      this.cacheConfig.maxSize = 100 * 1024 * 1024; // 100MB
      this.cacheConfig.strategy = 'lru'; // 最近使用
    } else {
      this.cacheConfig.maxSize = 200 * 1024 * 1024; // 200MB
      this.cacheConfig.strategy = 'adaptive'; // 適応型
    }
    
    // GC圧力が高い場合はTTLを短縮
    const highPressure = predictions.some(p => 
      p.estimatedGCPressure === 'high' || p.estimatedGCPressure === 'critical');
    
    if (highPressure) {
      this.cacheConfig.ttl = 1800000; // 30分
    } else {
      this.cacheConfig.ttl = 3600000; // 1時間
    }
  }

  /**
   * GCの最適化
   */
  async optimizeGC(strategy) {
    if (strategy === 'aggressive_gc') {
      // 強制的なGC実行
      if (global.gc) {
        global.gc();
      }
      
      // Node.jsのGCパラメータ調整の推奨
      console.log(chalk.yellow('推奨: --max-old-space-size=4096 --optimize-for-size'));
    } else if (strategy === 'lazy_allocation') {
      // GC頻度を減らす
      console.log(chalk.blue('推奨: --max-semi-space-size=128'));
    }
  }

  /**
   * 推奨事項の生成
   */
  generateRecommendations(predictions) {
    const recommendations = [];
    
    if (!predictions || predictions.length === 0) {
      recommendations.push({
        type: 'info',
        message: '予測データが不足しています。継続的な監視を推奨します。'
      });
      return recommendations;
    }
    
    const maxPredicted = Math.max(...predictions.map(p => p.estimatedHeapUsed));
    const currentHeapTotal = process.memoryUsage().heapTotal;
    
    // メモリ不足の警告
    if (maxPredicted > currentHeapTotal * 0.9) {
      recommendations.push({
        type: 'warning',
        message: 'メモリ使用量が上限に近づくことが予測されます。',
        action: 'ヒープサイズの増加を検討してください。'
      });
    }
    
    // GC圧力の警告
    const highGCPressure = predictions.filter(p => 
      p.estimatedGCPressure === 'high' || p.estimatedGCPressure === 'critical');
    
    if (highGCPressure.length > predictions.length / 2) {
      recommendations.push({
        type: 'warning',
        message: '高いGC圧力が予測されます。',
        action: 'メモリリークの可能性を調査してください。'
      });
    }
    
    // 最適化の提案
    if (this.allocationStrategy === 'adaptive') {
      recommendations.push({
        type: 'info',
        message: '適応型メモリ管理が有効です。',
        action: 'パフォーマンスを継続的に監視してください。'
      });
    }
    
    return recommendations;
  }
}

/**
 * 異常検知システム
 */
class AnomalyDetector extends EventEmitter {
  constructor(learner) {
    super();
    this.learner = learner;
    this.anomalies = [];
    this.alertThresholds = {
      memory: { warning: 0.7, critical: 0.9 },
      gcFrequency: { warning: 10, critical: 20 },
      allocationRate: { warning: 10000000, critical: 50000000 } // bytes/sec
    };
  }

  /**
   * 異常検知の実行
   */
  detect(memoryData) {
    const anomalies = [];
    
    // メモリ使用量の異常
    const memoryAnomaly = this.detectMemoryAnomaly(memoryData);
    if (memoryAnomaly) anomalies.push(memoryAnomaly);
    
    // GC頻度の異常
    const gcAnomaly = this.detectGCAnomaly(memoryData);
    if (gcAnomaly) anomalies.push(gcAnomaly);
    
    // アロケーション率の異常
    const allocationAnomaly = this.detectAllocationAnomaly(memoryData);
    if (allocationAnomaly) anomalies.push(allocationAnomaly);
    
    // 統計的異常
    const statisticalAnomaly = this.detectStatisticalAnomaly(memoryData);
    if (statisticalAnomaly) anomalies.push(statisticalAnomaly);
    
    // 異常が検出された場合はイベントを発行
    if (anomalies.length > 0) {
      this.anomalies.push(...anomalies);
      this.emit('anomaly', anomalies);
    }
    
    return anomalies;
  }

  /**
   * メモリ使用量の異常検知
   */
  detectMemoryAnomaly(memoryData) {
    const heapRatio = memoryData.heapUsed / memoryData.heapTotal;
    
    if (heapRatio > this.alertThresholds.memory.critical) {
      return {
        type: 'critical',
        category: 'memory',
        message: `危険: ヒープ使用率が${(heapRatio * 100).toFixed(1)}%に達しています`,
        value: heapRatio,
        timestamp: Date.now(),
        recommendation: '即座にメモリ最適化を実行してください'
      };
    } else if (heapRatio > this.alertThresholds.memory.warning) {
      return {
        type: 'warning',
        category: 'memory',
        message: `警告: ヒープ使用率が${(heapRatio * 100).toFixed(1)}%です`,
        value: heapRatio,
        timestamp: Date.now(),
        recommendation: 'メモリ使用状況を監視してください'
      };
    }
    
    return null;
  }

  /**
   * GC頻度の異常検知
   */
  detectGCAnomaly(memoryData) {
    const recentPatterns = this.learner.timeSeriesData.slice(-20);
    if (recentPatterns.length < 10) return null;
    
    const gcEvents = recentPatterns.filter(p => p.memory.gcCount > 0).length;
    
    if (gcEvents > this.alertThresholds.gcFrequency.critical) {
      return {
        type: 'critical',
        category: 'gc',
        message: `危険: 過度なGC実行（${gcEvents}回/20サンプル）`,
        value: gcEvents,
        timestamp: Date.now(),
        recommendation: 'メモリリークの可能性があります'
      };
    } else if (gcEvents > this.alertThresholds.gcFrequency.warning) {
      return {
        type: 'warning',
        category: 'gc',
        message: `警告: GC頻度が高い（${gcEvents}回/20サンプル）`,
        value: gcEvents,
        timestamp: Date.now(),
        recommendation: 'メモリ割り当てパターンを確認してください'
      };
    }
    
    return null;
  }

  /**
   * アロケーション率の異常検知
   */
  detectAllocationAnomaly(memoryData) {
    const features = this.learner.extractFeatures(memoryData);
    const rate = Math.abs(features.allocationRate);
    
    if (rate > this.alertThresholds.allocationRate.critical) {
      return {
        type: 'critical',
        category: 'allocation',
        message: `危険: 異常なメモリ割り当て率（${(rate / 1024 / 1024).toFixed(2)}MB/秒）`,
        value: rate,
        timestamp: Date.now(),
        recommendation: 'メモリリークまたは無限ループの可能性'
      };
    } else if (rate > this.alertThresholds.allocationRate.warning) {
      return {
        type: 'warning',
        category: 'allocation',
        message: `警告: 高いメモリ割り当て率（${(rate / 1024 / 1024).toFixed(2)}MB/秒）`,
        value: rate,
        timestamp: Date.now(),
        recommendation: 'コードの最適化を検討してください'
      };
    }
    
    return null;
  }

  /**
   * 統計的異常検知
   */
  detectStatisticalAnomaly(memoryData) {
    const features = this.learner.extractFeatures(memoryData);
    const thresholds = this.learner.anomalyThresholds;
    
    // Z-scoreベースの異常検知
    for (const [metric, value] of Object.entries({
      memoryUsage: features.heapUsedRatio,
      allocations: features.allocationRate,
      gcFrequency: features.gcPressure
    })) {
      const { mean, std } = thresholds[metric];
      if (std === 0) continue;
      
      const zScore = Math.abs((value - mean) / std);
      
      if (zScore > 3) {
        return {
          type: 'warning',
          category: 'statistical',
          message: `統計的異常: ${metric}が通常範囲を超えています（Z-score: ${zScore.toFixed(2)}）`,
          value: { metric, value, zScore },
          timestamp: Date.now(),
          recommendation: '詳細な調査が必要です'
        };
      }
    }
    
    return null;
  }

  /**
   * アラートの送信
   */
  sendAlert(anomaly) {
    const color = anomaly.type === 'critical' ? chalk.red : chalk.yellow;
    console.log(color(`\n[${anomaly.type.toUpperCase()}] ${anomaly.message}`));
    console.log(chalk.gray(`推奨: ${anomaly.recommendation}`));
    
    // 重要なアラートの場合は追加のアクション
    if (anomaly.type === 'critical') {
      this.handleCriticalAlert(anomaly);
    }
  }

  /**
   * クリティカルアラートの処理
   */
  handleCriticalAlert(anomaly) {
    // ログファイルへの記録
    const logEntry = {
      timestamp: new Date(anomaly.timestamp).toISOString(),
      type: anomaly.type,
      category: anomaly.category,
      message: anomaly.message,
      value: anomaly.value,
      recommendation: anomaly.recommendation
    };
    
    // アラート履歴の保存
    this.saveAlertHistory(logEntry);
    
    // 自動修復の試行
    if (anomaly.category === 'memory') {
      this.attemptAutoRecovery();
    }
  }

  /**
   * アラート履歴の保存
   */
  async saveAlertHistory(logEntry) {
    const logDir = path.join(process.cwd(), '.serena', 'logs');
    await fs.mkdir(logDir, { recursive: true });
    
    const logFile = path.join(logDir, `alerts-${new Date().toISOString().split('T')[0]}.json`);
    
    try {
      let logs = [];
      try {
        const existing = await fs.readFile(logFile, 'utf-8');
        logs = JSON.parse(existing);
      } catch {}
      
      logs.push(logEntry);
      await fs.writeFile(logFile, JSON.stringify(logs, null, 2));
    } catch (error) {
      console.error(chalk.red('アラート履歴の保存に失敗:', error.message));
    }
  }

  /**
   * 自動修復の試行
   */
  attemptAutoRecovery() {
    console.log(chalk.cyan('\n自動修復を試行中...'));
    
    // 強制GC実行
    if (global.gc) {
      global.gc();
      console.log(chalk.green('✓ ガベージコレクションを実行しました'));
    }
    
    // キャッシュクリア
    this.emit('clear-cache');
    console.log(chalk.green('✓ キャッシュをクリアしました'));
    
    // メモリ使用状況の再確認
    setTimeout(() => {
      const current = process.memoryUsage();
      const heapRatio = current.heapUsed / current.heapTotal;
      
      if (heapRatio < 0.7) {
        console.log(chalk.green('✓ メモリ使用量が改善されました'));
      } else {
        console.log(chalk.yellow('⚠ メモリ使用量が依然として高い状態です'));
      }
    }, 1000);
  }
}

/**
 * プリロード戦略マネージャー
 */
class PreloadStrategyManager {
  constructor(learner) {
    this.learner = learner;
    this.preloadQueue = [];
    this.preloadedResources = new Map();
    this.accessPatterns = new Map();
  }

  /**
   * アクセスパターンの学習
   */
  learnAccessPattern(resource, context) {
    const pattern = {
      resource,
      context,
      timestamp: Date.now(),
      frequency: 1
    };
    
    const key = `${resource}-${context}`;
    if (this.accessPatterns.has(key)) {
      const existing = this.accessPatterns.get(key);
      existing.frequency++;
      existing.lastAccess = Date.now();
    } else {
      this.accessPatterns.set(key, pattern);
    }
    
    // パターンに基づいてプリロード戦略を更新
    this.updatePreloadStrategy();
  }

  /**
   * プリロード戦略の更新
   */
  updatePreloadStrategy() {
    // アクセス頻度によるランキング
    const patterns = Array.from(this.accessPatterns.values())
      .sort((a, b) => b.frequency - a.frequency);
    
    // 上位パターンをプリロード対象に
    this.preloadQueue = patterns
      .slice(0, 10)
      .map(p => ({
        resource: p.resource,
        priority: this.calculatePriority(p),
        estimatedSize: this.estimateResourceSize(p.resource)
      }))
      .filter(item => item.estimatedSize < 10 * 1024 * 1024); // 10MB未満
  }

  /**
   * 優先度の計算
   */
  calculatePriority(pattern) {
    const recency = Date.now() - pattern.lastAccess;
    const recencyScore = Math.max(0, 1 - recency / (24 * 3600 * 1000)); // 24時間で減衰
    const frequencyScore = Math.min(1, pattern.frequency / 100);
    
    return recencyScore * 0.3 + frequencyScore * 0.7;
  }

  /**
   * リソースサイズの推定
   */
  estimateResourceSize(resource) {
    // リソースタイプに基づいたサイズ推定
    if (resource.endsWith('.json')) return 50 * 1024; // 50KB
    if (resource.endsWith('.js')) return 100 * 1024; // 100KB
    if (resource.endsWith('.css')) return 30 * 1024; // 30KB
    if (resource.includes('image')) return 500 * 1024; // 500KB
    return 100 * 1024; // デフォルト100KB
  }

  /**
   * プリロードの実行
   */
  async executePreload() {
    const memoryUsage = process.memoryUsage();
    const availableMemory = memoryUsage.heapTotal - memoryUsage.heapUsed;
    
    // 利用可能メモリの30%までプリロード
    const maxPreloadSize = availableMemory * 0.3;
    let totalPreloaded = 0;
    
    for (const item of this.preloadQueue) {
      if (totalPreloaded + item.estimatedSize > maxPreloadSize) {
        break;
      }
      
      if (!this.preloadedResources.has(item.resource)) {
        try {
          await this.preloadResource(item.resource);
          totalPreloaded += item.estimatedSize;
        } catch (error) {
          console.error(chalk.red(`プリロード失敗: ${item.resource}`), error.message);
        }
      }
    }
    
    return {
      preloaded: this.preloadedResources.size,
      totalSize: totalPreloaded,
      queue: this.preloadQueue.length
    };
  }

  /**
   * リソースのプリロード
   */
  async preloadResource(resource) {
    // シミュレーション: 実際の実装ではリソースを読み込む
    const startTime = performance.now();
    
    // ダミーデータのロード
    const data = {
      resource,
      loadTime: performance.now() - startTime,
      size: this.estimateResourceSize(resource),
      timestamp: Date.now()
    };
    
    this.preloadedResources.set(resource, data);
    
    // TTLの設定
    setTimeout(() => {
      this.preloadedResources.delete(resource);
    }, 3600000); // 1時間後に削除
  }

  /**
   * プリロード効果の分析
   */
  analyzeEffectiveness() {
    const hits = Array.from(this.preloadedResources.values())
      .filter(r => r.accessed).length;
    const total = this.preloadedResources.size;
    
    const hitRate = total > 0 ? hits / total : 0;
    
    return {
      hitRate,
      totalPreloaded: total,
      hits,
      misses: total - hits,
      recommendation: hitRate < 0.5 ? 
        'プリロード戦略の見直しを推奨' : 
        'プリロード戦略は効果的です'
    };
  }
}

/**
 * Serena AI最適化マネージャー
 */
class SerenaAIOptimizer {
  constructor() {
    this.learner = new MemoryPatternLearner();
    this.optimizer = new MemoryAllocationOptimizer(this.learner);
    this.detector = new AnomalyDetector(this.learner);
    this.preloader = new PreloadStrategyManager(this.learner);
    
    this.monitoringInterval = null;
    this.optimizationInterval = null;
    this.config = {
      monitoringFrequency: 5000, // 5秒
      optimizationFrequency: 60000, // 1分
      enableAutoOptimization: true,
      enableAnomalyDetection: true,
      enablePreloading: true
    };
    
    this.setupEventListeners();
  }

  /**
   * イベントリスナーの設定
   */
  setupEventListeners() {
    // 異常検知イベント
    this.detector.on('anomaly', (anomalies) => {
      for (const anomaly of anomalies) {
        this.detector.sendAlert(anomaly);
      }
    });
    
    // キャッシュクリアイベント
    this.detector.on('clear-cache', () => {
      this.preloader.preloadedResources.clear();
    });
    
    // プロセス終了時のクリーンアップ
    process.on('exit', () => {
      this.stop();
    });
  }

  /**
   * AI最適化の開始
   */
  async start() {
    console.log(chalk.cyan.bold('\n🤖 Serena AI Memory Optimizer 起動中...\n'));
    
    // 初期分析
    await this.performInitialAnalysis();
    
    // 監視の開始
    this.startMonitoring();
    
    // 自動最適化の開始
    if (this.config.enableAutoOptimization) {
      this.startOptimization();
    }
    
    // プリロード戦略の開始
    if (this.config.enablePreloading) {
      this.startPreloading();
    }
    
    console.log(chalk.green('✓ AI最適化システムが起動しました\n'));
    
    // ステータス表示
    this.displayStatus();
  }

  /**
   * 初期分析の実行
   */
  async performInitialAnalysis() {
    console.log(chalk.blue('初期メモリ分析を実行中...'));
    
    const memoryData = process.memoryUsage();
    
    // 基準データの収集
    for (let i = 0; i < 5; i++) {
      await this.learner.learnPattern('initial', memoryData);
      await this.sleep(100);
    }
    
    // システム情報の取得
    const systemInfo = await this.getSystemInfo();
    console.log(chalk.gray(`システム: ${systemInfo.platform} | メモリ: ${systemInfo.totalMemory}GB`));
  }

  /**
   * 監視の開始
   */
  startMonitoring() {
    this.monitoringInterval = setInterval(async () => {
      const memoryData = process.memoryUsage();
      
      // パターン学習
      await this.learner.learnPattern('runtime', memoryData);
      
      // 異常検知
      if (this.config.enableAnomalyDetection) {
        this.detector.detect(memoryData);
      }
      
      // アクセスパターンの記録（ダミー）
      this.preloader.learnAccessPattern('module.js', 'runtime');
      
    }, this.config.monitoringFrequency);
  }

  /**
   * 自動最適化の開始
   */
  startOptimization() {
    this.optimizationInterval = setInterval(async () => {
      console.log(chalk.blue('\n最適化サイクル実行中...'));
      
      const result = await this.optimizer.optimize('runtime');
      
      // 最適化結果の表示
      console.log(chalk.green('最適化完了:'));
      console.log(chalk.gray(`  戦略: ${result.strategy}`));
      console.log(chalk.gray(`  キャッシュ: ${result.cacheConfig.maxSize / 1024 / 1024}MB`));
      
      // 推奨事項の表示
      if (result.recommendations.length > 0) {
        console.log(chalk.yellow('\n推奨事項:'));
        for (const rec of result.recommendations) {
          const icon = rec.type === 'warning' ? '⚠' : 'ℹ';
          console.log(chalk.gray(`  ${icon} ${rec.message}`));
          if (rec.action) {
            console.log(chalk.gray(`     → ${rec.action}`));
          }
        }
      }
      
    }, this.config.optimizationFrequency);
  }

  /**
   * プリロードの開始
   */
  startPreloading() {
    setInterval(async () => {
      const result = await this.preloader.executePreload();
      
      if (result.preloaded > 0) {
        console.log(chalk.cyan(
          `プリロード: ${result.preloaded}個のリソース (${(result.totalSize / 1024).toFixed(1)}KB)`
        ));
      }
    }, 30000); // 30秒ごと
  }

  /**
   * ステータス表示
   */
  displayStatus() {
    setInterval(() => {
      const memory = process.memoryUsage();
      const heapUsedMB = (memory.heapUsed / 1024 / 1024).toFixed(1);
      const heapTotalMB = (memory.heapTotal / 1024 / 1024).toFixed(1);
      const heapPercent = ((memory.heapUsed / memory.heapTotal) * 100).toFixed(1);
      
      // プログレスバーの作成
      const barLength = 30;
      const filledLength = Math.round((memory.heapUsed / memory.heapTotal) * barLength);
      const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
      
      // 色の決定
      let color = chalk.green;
      if (heapPercent > 70) color = chalk.yellow;
      if (heapPercent > 90) color = chalk.red;
      
      // ステータス行の表示
      process.stdout.write('\r' + color(
        `メモリ: [${bar}] ${heapUsedMB}/${heapTotalMB}MB (${heapPercent}%) | ` +
        `パターン: ${this.learner.patterns.size} | ` +
        `異常: ${this.detector.anomalies.length}`
      ));
      
    }, 1000);
  }

  /**
   * 停止
   */
  stop() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    if (this.optimizationInterval) {
      clearInterval(this.optimizationInterval);
    }
    
    console.log(chalk.yellow('\n\n🛑 AI最適化システムを停止しました'));
    
    // 最終レポート
    this.generateFinalReport();
  }

  /**
   * 最終レポートの生成
   */
  async generateFinalReport() {
    console.log(chalk.cyan.bold('\n📊 最終レポート\n'));
    
    // メモリパターン分析
    const patterns = this.learner.patterns;
    console.log(chalk.white('メモリパターン分析:'));
    for (const [context, data] of patterns) {
      const avgHeap = data.reduce((sum, d) => 
        sum + d.memory.heapUsed, 0) / data.length / 1024 / 1024;
      console.log(chalk.gray(`  ${context}: 平均 ${avgHeap.toFixed(1)}MB (${data.length}サンプル)`));
    }
    
    // 異常検知サマリー
    const anomalies = this.detector.anomalies;
    if (anomalies.length > 0) {
      console.log(chalk.white('\n異常検知サマリー:'));
      const categoryCounts = {};
      for (const anomaly of anomalies) {
        categoryCounts[anomaly.category] = (categoryCounts[anomaly.category] || 0) + 1;
      }
      for (const [category, count] of Object.entries(categoryCounts)) {
        console.log(chalk.gray(`  ${category}: ${count}件`));
      }
    }
    
    // プリロード効果
    const effectiveness = this.preloader.analyzeEffectiveness();
    console.log(chalk.white('\nプリロード効果:'));
    console.log(chalk.gray(`  ヒット率: ${(effectiveness.hitRate * 100).toFixed(1)}%`));
    console.log(chalk.gray(`  ${effectiveness.recommendation}`));
    
    // レポートファイルの保存
    await this.saveReport({
      patterns: Array.from(patterns.entries()),
      anomalies,
      preloadEffectiveness: effectiveness,
      timestamp: Date.now()
    });
  }

  /**
   * レポートの保存
   */
  async saveReport(report) {
    const reportDir = path.join(process.cwd(), '.serena', 'reports');
    await fs.mkdir(reportDir, { recursive: true });
    
    const reportFile = path.join(
      reportDir, 
      `ai-optimizer-${new Date().toISOString().replace(/:/g, '-')}.json`
    );
    
    await fs.writeFile(reportFile, JSON.stringify(report, null, 2));
    console.log(chalk.green(`\n✓ レポートを保存しました: ${reportFile}`));
  }

  /**
   * システム情報の取得
   */
  async getSystemInfo() {
    try {
      const { stdout } = await execAsync('node -v');
      const nodeVersion = stdout.trim();
      
      return {
        platform: process.platform,
        nodeVersion,
        totalMemory: (require('os').totalmem() / 1024 / 1024 / 1024).toFixed(1),
        cpus: require('os').cpus().length
      };
    } catch {
      return {
        platform: process.platform,
        nodeVersion: process.version,
        totalMemory: 'unknown',
        cpus: 'unknown'
      };
    }
  }

  /**
   * スリープユーティリティ
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * メイン実行
 */
async function main() {
  const optimizer = new SerenaAIOptimizer();
  
  // コマンドライン引数の処理
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(chalk.cyan.bold('Serena AI Memory Optimizer'));
    console.log(chalk.white('\n使用方法:'));
    console.log(chalk.gray('  node serena-ai-optimizer.js [options]'));
    console.log(chalk.white('\nオプション:'));
    console.log(chalk.gray('  --monitor-only    監視のみ（最適化なし）'));
    console.log(chalk.gray('  --no-preload      プリロードを無効化'));
    console.log(chalk.gray('  --frequency <ms>  監視頻度を設定'));
    console.log(chalk.gray('  --help, -h        ヘルプを表示'));
    process.exit(0);
  }
  
  // オプションの適用
  if (args.includes('--monitor-only')) {
    optimizer.config.enableAutoOptimization = false;
  }
  
  if (args.includes('--no-preload')) {
    optimizer.config.enablePreloading = false;
  }
  
  const freqIndex = args.indexOf('--frequency');
  if (freqIndex !== -1 && args[freqIndex + 1]) {
    optimizer.config.monitoringFrequency = parseInt(args[freqIndex + 1]);
  }
  
  // 開始
  await optimizer.start();
  
  // Ctrl+Cでの終了処理
  process.on('SIGINT', () => {
    console.log(chalk.yellow('\n\n終了処理中...'));
    optimizer.stop();
    process.exit(0);
  });
}

// エラーハンドリング
process.on('uncaughtException', (error) => {
  console.error(chalk.red('\n予期しないエラー:'), error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(chalk.red('\n未処理の Promise rejection:'), reason);
  process.exit(1);
});

// 実行
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error(chalk.red('起動エラー:'), error);
    process.exit(1);
  });
}

export { 
  SerenaAIOptimizer,
  MemoryPatternLearner,
  MemoryAllocationOptimizer,
  AnomalyDetector,
  PreloadStrategyManager
};