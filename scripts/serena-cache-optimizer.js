#!/usr/bin/env node

/**
 * Serena Cache Optimizer
 * インテリジェントキャッシュ最適化システム
 * 
 * 機能:
 * - 予測的キャッシュプリロード
 * - LRU/LFU ハイブリッドキャッシュ戦略
 * - キャッシュヒット率の最大化
 * - メモリ使用量の最適化
 * 
 * @author Claude Code Integration System
 * @date 2025-09-20
 * @version 1.0.0
 */

import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { EventEmitter } from 'events';
import { performance } from 'perf_hooks';

const CONFIG = {
  cacheDir: '.serena/cache',
  maxCacheSize: 100 * 1024 * 1024, // 100MB
  maxCacheEntries: 10000,
  evictionPolicy: 'hybrid', // lru | lfu | hybrid
  preloadThreshold: 0.8, // 80%確率でアクセスされるファイルをプリロード
  compressionEnabled: true,
  ttl: 24 * 60 * 60 * 1000, // 24時間
  warmupEnabled: true
};

class CacheEntry {
  constructor(key, value, size) {
    this.key = key;
    this.value = value;
    this.size = size;
    this.frequency = 1;
    this.lastAccess = Date.now();
    this.created = Date.now();
    this.hits = 0;
    this.compressed = false;
  }

  updateAccess() {
    this.lastAccess = Date.now();
    this.frequency++;
    this.hits++;
  }

  getScore() {
    // ハイブリッドスコア計算（LRU + LFU）
    const age = Date.now() - this.lastAccess;
    const ageScore = 1 / (1 + age / 1000);
    const frequencyScore = Math.log2(this.frequency + 1);
    return ageScore * 0.4 + frequencyScore * 0.6;
  }

  isExpired() {
    return Date.now() - this.created > CONFIG.ttl;
  }
}

class SerenaCacheOptimizer extends EventEmitter {
  constructor() {
    super();
    this.cache = new Map();
    this.accessPatterns = new Map();
    this.predictiveModel = new Map();
    this.currentSize = 0;
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      compressions: 0,
      predictions: 0,
      correctPredictions: 0
    };
    this.initializeOptimizer();
  }

  async initializeOptimizer() {
    await this.loadPersistedCache();
    await this.loadAccessPatterns();
    await this.buildPredictiveModel();
    
    if (CONFIG.warmupEnabled) {
      await this.warmupCache();
    }
    
    // 定期的な最適化タスク
    this.startOptimizationCycle();
  }

  /**
   * キャッシュの取得（最適化付き）
   */
  async get(key) {
    const entry = this.cache.get(key);
    
    if (entry && !entry.isExpired()) {
      entry.updateAccess();
      this.stats.hits++;
      this.recordAccess(key, true);
      
      // 予測モデルの更新
      this.updatePredictiveModel(key);
      
      // 関連ファイルのプリロード
      await this.preloadRelated(key);
      
      this.emit('cache:hit', { key, size: entry.size });
      
      return entry.compressed ? await this.decompress(entry.value) : entry.value;
    }
    
    this.stats.misses++;
    this.recordAccess(key, false);
    this.emit('cache:miss', { key });
    
    return null;
  }

  /**
   * キャッシュへの設定（最適化付き）
   */
  async set(key, value, options = {}) {
    let size = this.calculateSize(value);
    let processedValue = value;
    
    // 圧縮判定
    if (CONFIG.compressionEnabled && size > 1024) {
      processedValue = await this.compress(value);
      const compressedSize = this.calculateSize(processedValue);
      
      if (compressedSize < size * 0.9) {
        size = compressedSize;
        this.stats.compressions++;
      } else {
        processedValue = value; // 圧縮効果が低い場合は元のまま
      }
    }
    
    // キャッシュサイズ管理
    while (this.currentSize + size > CONFIG.maxCacheSize || 
           this.cache.size >= CONFIG.maxCacheEntries) {
      await this.evict();
    }
    
    const entry = new CacheEntry(key, processedValue, size);
    entry.compressed = processedValue !== value;
    
    this.cache.set(key, entry);
    this.currentSize += size;
    
    this.emit('cache:set', { key, size });
    
    // アクセスパターンの学習
    this.learnAccessPattern(key);
  }

  /**
   * エビクション（追い出し）処理
   */
  async evict() {
    if (this.cache.size === 0) return;
    
    let victimKey = null;
    let lowestScore = Infinity;
    
    // スコアベースのエビクション
    for (const [key, entry] of this.cache) {
      if (entry.isExpired()) {
        victimKey = key;
        break;
      }
      
      const score = entry.getScore();
      if (score < lowestScore) {
        lowestScore = score;
        victimKey = key;
      }
    }
    
    if (victimKey) {
      const entry = this.cache.get(victimKey);
      this.cache.delete(victimKey);
      this.currentSize -= entry.size;
      this.stats.evictions++;
      
      this.emit('cache:evict', { key: victimKey, size: entry.size });
    }
  }

  /**
   * 予測的プリロード
   */
  async preloadRelated(key) {
    const predictions = this.predictNextAccess(key);
    
    for (const [predictedKey, probability] of predictions) {
      if (probability >= CONFIG.preloadThreshold && !this.cache.has(predictedKey)) {
        this.stats.predictions++;
        
        // 非同期でプリロード
        setImmediate(async () => {
          try {
            const content = await this.loadFromDisk(predictedKey);
            if (content) {
              await this.set(predictedKey, content, { preloaded: true });
            }
          } catch (error) {
            // プリロードエラーは無視
          }
        });
      }
    }
  }

  /**
   * アクセス予測モデル
   */
  predictNextAccess(currentKey) {
    const predictions = new Map();
    const pattern = this.accessPatterns.get(currentKey);
    
    if (pattern) {
      // マルコフ連鎖ベースの予測
      for (const [nextKey, count] of pattern.transitions) {
        const probability = count / pattern.totalTransitions;
        predictions.set(nextKey, probability);
      }
    }
    
    // グローバルパターンも考慮
    const globalPattern = this.getGlobalAccessPattern();
    for (const [key, freq] of globalPattern) {
      const current = predictions.get(key) || 0;
      predictions.set(key, current * 0.7 + freq * 0.3);
    }
    
    // 上位N個を返す
    return Array.from(predictions)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }

  /**
   * アクセスパターンの学習
   */
  learnAccessPattern(key) {
    if (!this.accessPatterns.has(key)) {
      this.accessPatterns.set(key, {
        count: 0,
        transitions: new Map(),
        totalTransitions: 0,
        lastKeys: []
      });
    }
    
    const pattern = this.accessPatterns.get(key);
    pattern.count++;
    
    // 遷移パターンの記録
    if (this.lastAccessedKey && this.lastAccessedKey !== key) {
      const transitions = this.accessPatterns.get(this.lastAccessedKey).transitions;
      transitions.set(key, (transitions.get(key) || 0) + 1);
      this.accessPatterns.get(this.lastAccessedKey).totalTransitions++;
    }
    
    this.lastAccessedKey = key;
  }

  /**
   * キャッシュのウォームアップ
   */
  async warmupCache() {
    console.log('🔥 キャッシュウォームアップ開始...');
    
    try {
      // 頻繁にアクセスされるファイルをプリロード
      const hotFiles = await this.identifyHotFiles();
      
      for (const file of hotFiles) {
        try {
          const content = await this.loadFromDisk(file);
          if (content) {
            await this.set(file, content, { warmup: true });
          }
        } catch (error) {
          // ウォームアップエラーは無視
        }
      }
      
      console.log(`✅ ${hotFiles.length}個のファイルをプリロード`);
    } catch (error) {
      console.error('❌ ウォームアップエラー:', error);
    }
  }

  /**
   * ホットファイルの識別
   */
  async identifyHotFiles() {
    const hotFiles = [];
    
    // アクセスパターンから頻繁にアクセスされるファイルを特定
    const sorted = Array.from(this.accessPatterns)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 50);
    
    for (const [file] of sorted) {
      hotFiles.push(file);
    }
    
    // 静的な重要ファイルも追加
    const criticalFiles = [
      'package.json',
      'src/App.tsx',
      'src/main.tsx',
      '.serena/project.yml'
    ];
    
    return [...new Set([...hotFiles, ...criticalFiles])];
  }

  /**
   * 最適化サイクルの開始
   */
  startOptimizationCycle() {
    // 定期的なガベージコレクション
    setInterval(() => {
      this.collectGarbage();
    }, 60 * 1000); // 1分ごと
    
    // キャッシュ統計のレポート
    setInterval(() => {
      this.reportStatistics();
    }, 5 * 60 * 1000); // 5分ごと
    
    // アクセスパターンの永続化
    setInterval(() => {
      this.persistAccessPatterns();
    }, 10 * 60 * 1000); // 10分ごと
  }

  /**
   * ガベージコレクション
   */
  async collectGarbage() {
    let collected = 0;
    
    for (const [key, entry] of this.cache) {
      if (entry.isExpired()) {
        this.cache.delete(key);
        this.currentSize -= entry.size;
        collected++;
      }
    }
    
    if (collected > 0) {
      this.emit('cache:gc', { collected });
    }
  }

  /**
   * 統計レポート
   */
  reportStatistics() {
    const hitRate = this.calculateHitRate();
    const efficiency = this.calculateEfficiency();
    
    console.log(`
📊 Serena Cache Statistics
═══════════════════════════════════
Hit Rate: ${hitRate.toFixed(2)}%
Cache Size: ${this.formatBytes(this.currentSize)}
Entries: ${this.cache.size}
Evictions: ${this.stats.evictions}
Compressions: ${this.stats.compressions}
Predictions: ${this.stats.predictions}
Prediction Accuracy: ${this.calculatePredictionAccuracy().toFixed(2)}%
Efficiency Score: ${efficiency.toFixed(2)}/100
═══════════════════════════════════
    `);
    
    this.emit('cache:stats', {
      hitRate,
      size: this.currentSize,
      entries: this.cache.size,
      efficiency
    });
  }

  /**
   * ヒット率の計算
   */
  calculateHitRate() {
    const total = this.stats.hits + this.stats.misses;
    return total === 0 ? 0 : (this.stats.hits / total) * 100;
  }

  /**
   * 予測精度の計算
   */
  calculatePredictionAccuracy() {
    if (this.stats.predictions === 0) return 0;
    return (this.stats.correctPredictions / this.stats.predictions) * 100;
  }

  /**
   * 効率スコアの計算
   */
  calculateEfficiency() {
    const hitRate = this.calculateHitRate();
    const compressionRate = this.stats.compressions / this.cache.size * 100;
    const predictionAccuracy = this.calculatePredictionAccuracy();
    
    return (hitRate * 0.5 + compressionRate * 0.2 + predictionAccuracy * 0.3);
  }

  // ヘルパーメソッド
  async loadFromDisk(key) {
    try {
      const filePath = path.resolve(key);
      return await fs.readFile(filePath, 'utf8');
    } catch {
      return null;
    }
  }

  async loadPersistedCache() {
    try {
      const cachePath = path.join(CONFIG.cacheDir, 'cache.json');
      const data = await fs.readFile(cachePath, 'utf8');
      const parsed = JSON.parse(data);
      
      // キャッシュの復元
      for (const [key, value] of Object.entries(parsed.entries)) {
        const entry = new CacheEntry(key, value.value, value.size);
        Object.assign(entry, value);
        this.cache.set(key, entry);
        this.currentSize += entry.size;
      }
      
      this.stats = parsed.stats || this.stats;
    } catch {
      // キャッシュファイルが存在しない場合は無視
    }
  }

  async loadAccessPatterns() {
    try {
      const patternsPath = path.join(CONFIG.cacheDir, 'patterns.json');
      const data = await fs.readFile(patternsPath, 'utf8');
      const patterns = JSON.parse(data);
      
      for (const [key, pattern] of Object.entries(patterns)) {
        this.accessPatterns.set(key, {
          ...pattern,
          transitions: new Map(pattern.transitions)
        });
      }
    } catch {
      // パターンファイルが存在しない場合は無視
    }
  }

  async persistAccessPatterns() {
    try {
      await fs.mkdir(CONFIG.cacheDir, { recursive: true });
      
      const patterns = {};
      for (const [key, pattern] of this.accessPatterns) {
        patterns[key] = {
          ...pattern,
          transitions: Array.from(pattern.transitions)
        };
      }
      
      const patternsPath = path.join(CONFIG.cacheDir, 'patterns.json');
      await fs.writeFile(patternsPath, JSON.stringify(patterns, null, 2));
    } catch (error) {
      console.error('パターン永続化エラー:', error);
    }
  }

  buildPredictiveModel() {
    // 簡易的な予測モデルの構築
    this.predictiveModel.clear();
    
    for (const [key, pattern] of this.accessPatterns) {
      if (pattern.count > 10) {
        this.predictiveModel.set(key, {
          weight: Math.log2(pattern.count),
          transitions: pattern.transitions
        });
      }
    }
  }

  recordAccess(key, hit) {
    if (!this.accessHistory) {
      this.accessHistory = [];
    }
    
    this.accessHistory.push({
      key,
      hit,
      timestamp: Date.now()
    });
    
    // 履歴のサイズ制限
    if (this.accessHistory.length > 1000) {
      this.accessHistory.shift();
    }
  }

  updatePredictiveModel(key) {
    // オンライン学習による予測モデルの更新
    if (this.lastPredictedKeys && this.lastPredictedKeys.includes(key)) {
      this.stats.correctPredictions++;
    }
  }

  getGlobalAccessPattern() {
    const pattern = new Map();
    
    for (const [key, data] of this.accessPatterns) {
      pattern.set(key, data.count);
    }
    
    const total = Array.from(pattern.values()).reduce((a, b) => a + b, 0);
    
    for (const [key, count] of pattern) {
      pattern.set(key, count / total);
    }
    
    return pattern;
  }

  calculateSize(value) {
    if (typeof value === 'string') {
      return Buffer.byteLength(value, 'utf8');
    }
    return JSON.stringify(value).length;
  }

  async compress(value) {
    // 簡易圧縮（実際の実装では zlib などを使用）
    return value;
  }

  async decompress(value) {
    // 簡易解凍
    return value;
  }

  formatBytes(bytes) {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  }
}

// エクスポート
export default SerenaCacheOptimizer;

// CLI実行
if (import.meta.url === `file://${process.argv[1]}`) {
  const optimizer = new SerenaCacheOptimizer();
  
  // テストデータでデモンストレーション
  (async () => {
    await optimizer.set('test1', 'value1');
    await optimizer.set('test2', 'value2');
    
    const result = await optimizer.get('test1');
    console.log('Cache result:', result);
    
    optimizer.reportStatistics();
  })();
}