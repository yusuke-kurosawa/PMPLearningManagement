/**
 * 階層キャッシュシステム - Enterprise Grade
 * 10,000+ 同時ユーザー対応の高性能キャッシュ階層
 */

import LRU from 'lru-cache'
import { EventEmitter } from 'events'
import { performance } from 'perf_hooks'
import { gzipSync, gunzipSync } from 'zlib'
import crypto from 'crypto'
import { RedisCache } from '../../lib/cache/redisCache'

// キャッシュレイヤー定義
export enum CacheLayer {
  L1_MEMORY = 'L1_MEMORY', // インメモリ（最高速）
  L2_REDIS = 'L2_REDIS', // Redis（高速）
  L3_DATABASE = 'L3_DATABASE', // データベース（基本速度）
}

// キャッシュ戦略
export enum CacheStrategy {
  WRITE_THROUGH = 'WRITE_THROUGH', // 書き込み時に全レイヤー更新
  WRITE_BACK = 'WRITE_BACK', // 書き込みをL1のみで行い、後でL2,L3に同期
  WRITE_AROUND = 'WRITE_AROUND', // 書き込み時はL1をスキップしてL2以降に直接書き込み
  READ_THROUGH = 'READ_THROUGH', // 読み込み時に下位レイヤーから自動取得
  CACHE_ASIDE = 'CACHE_ASIDE', // アプリケーションが明示的にキャッシュを管理
}

// LRU/LFU 戦略
export enum EvictionStrategy {
  LRU = 'LRU', // Least Recently Used
  LFU = 'LFU', // Least Frequently Used
  TTL = 'TTL', // Time To Live
  FIFO = 'FIFO', // First In First Out
}

// キャッシュ設定
export interface CacheConfig {
  strategy: CacheStrategy
  eviction: EvictionStrategy
  ttl: {
    L1: number // ミリ秒
    L2: number // ミリ秒
    L3?: number // データベースはTTLなし
  }
  maxSize: {
    L1: number // エントリ数
    L2: string // Redis memory (例: '100mb')
  }
  compression: boolean
  encryption: boolean
  warmupOnStart: boolean
  batchSize: number
  syncInterval: number
}

// パフォーマンスメトリクス
interface CacheMetrics {
  hits: number
  misses: number
  evictions: number
  totalRequests: number
  averageLatency: number
  memoryUsage: {
    L1: number
    L2: number
  }
  hitRateByLayer: {
    L1: number
    L2: number
    L3: number
  }
}

// キャッシュエントリー
interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
  accessCount: number
  lastAccessed: number
  size: number
  compressed?: boolean
  encrypted?: boolean
}

/**
 * 階層キャッシュマネージャー - ENHANCED VERSION
 * 大規模同時アクセス対応の統合キャッシュシステム
 */
export class HierarchicalCacheManager extends EventEmitter {
  private L1Cache: LRU<string, CacheEntry<any>>
  private redisCache: RedisCache
  private config: CacheConfig
  private metrics: CacheMetrics
  private batchQueue: Map<string, any> = new Map()
  private syncTimer: NodeJS.Timer | null = null
  private encryptionKey: Buffer

  constructor(config: CacheConfig, redisCache: RedisCache) {
    super()
    this.config = config
    this.redisCache = redisCache

    // L1キャッシュ初期化（LRU Cache使用）
    this.L1Cache = new LRU<string, CacheEntry<any>>({
      max: config.maxSize.L1,
      ttl: config.ttl.L1,
      updateAgeOnGet: config.eviction === EvictionStrategy.LRU,
      allowStale: false,
      dispose: (key, entry) => {
        this.metrics.evictions++
        this.emit('eviction', { layer: 'L1', key, size: entry.size })
      },
    })

    // メトリクス初期化
    this.metrics = {
      hits: 0,
      misses: 0,
      evictions: 0,
      totalRequests: 0,
      averageLatency: 0,
      memoryUsage: { L1: 0, L2: 0 },
      hitRateByLayer: { L1: 0, L2: 0, L3: 0 },
    }

    // 暗号化キー生成
    this.encryptionKey = crypto.randomBytes(32)

    // バッチ同期の開始
    if (config.strategy === CacheStrategy.WRITE_BACK) {
      this.startBatchSync()
    }

    // 定期メトリクス出力
    setInterval(() => {
      this.updateMetrics()
      this.emit('metrics', this.getMetrics())
    }, 30000)

    // ウォームアップ実行
    if (config.warmupOnStart) {
      this.warmupCache()
    }
  }

  /**
   * データの取得（階層キャッシュ）- 高性能版
   */
  async get<T>(key: string): Promise<T | null> {
    const startTime = performance.now()
    this.metrics.totalRequests++

    try {
      // L1キャッシュをチェック
      const l1Entry = this.L1Cache.get(key)
      if (l1Entry && !this.isExpired(l1Entry)) {
        l1Entry.accessCount++
        l1Entry.lastAccessed = Date.now()
        this.metrics.hits++
        this.recordLatency(performance.now() - startTime)
        this.emit('cache_hit', { layer: 'L1', key, duration: performance.now() - startTime })
        return this.deserializeData<T>(l1Entry.data)
      }

      // L2キャッシュ（Redis）をチェック
      const redisData = await this.redisCache.get<string>(key)
      if (redisData !== null) {
        const deserializedData = this.deserializeData<T>(redisData)
        this.metrics.hits++

        // L1にプロモート（効率的な階層管理）
        await this.setL1(key, deserializedData, this.config.ttl.L1)

        this.recordLatency(performance.now() - startTime)
        this.emit('cache_hit', { layer: 'L2', key, duration: performance.now() - startTime })
        return deserializedData
      }

      // キャッシュミス
      this.metrics.misses++
      this.recordLatency(performance.now() - startTime)
      this.emit('cache_miss', { key, duration: performance.now() - startTime })
      return null
    } catch (error) {
      this.emit('cache_error', { key, error, layer: 'get' })
      return null
    }
  }

  /**
   * データの設定（戦略に応じて階層更新）- 高性能版
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<boolean> {
    const startTime = performance.now()

    try {
      const serializedData = this.serializeData(value)
      const effectiveTtl = ttl || this.config.ttl.L2

      switch (this.config.strategy) {
        case CacheStrategy.WRITE_THROUGH:
          // 全レイヤーに同期書き込み
          const promises = [
            this.setL1(key, value, effectiveTtl),
            this.redisCache.set(key, serializedData, { ttl: effectiveTtl }),
          ]
          const results = await Promise.allSettled(promises)
          const success = results.every((r) => r.status === 'fulfilled' && r.value)

          this.emit('cache_write', {
            strategy: 'WRITE_THROUGH',
            key,
            duration: performance.now() - startTime,
            success,
            size: this.getDataSize(serializedData),
          })
          return success

        case CacheStrategy.WRITE_BACK:
          // L1のみに書き込み、バッチでL2に同期
          const writeBackSuccess = this.setL1(key, value, effectiveTtl)
          this.queueForBatchSync(key, serializedData, effectiveTtl)

          this.emit('cache_write', {
            strategy: 'WRITE_BACK',
            key,
            duration: performance.now() - startTime,
            success: writeBackSuccess,
          })
          return writeBackSuccess

        case CacheStrategy.WRITE_AROUND:
          // L1をスキップしてL2に直接書き込み
          const writeAroundSuccess = await this.redisCache.set(key, serializedData, {
            ttl: effectiveTtl,
          })
          this.emit('cache_write', {
            strategy: 'WRITE_AROUND',
            key,
            duration: performance.now() - startTime,
            success: writeAroundSuccess,
            size: this.getDataSize(serializedData),
          })
          return writeAroundSuccess

        default:
          // CACHE_ASIDE: アプリケーションが明示的に管理
          return false
      }
    } catch (error) {
      this.emit('cache_error', { key, error, layer: 'set' })
      return false
    }
  }

  /**
   * L1キャッシュへの設定 - 最適化版
   */
  private setL1<T>(key: string, value: T, ttl?: number): boolean {
    try {
      const serializedData = this.serializeData(value)
      const dataSize = this.getDataSize(serializedData)

      const entry: CacheEntry<any> = {
        data: serializedData,
        timestamp: Date.now(),
        ttl: ttl || this.config.ttl.L1,
        accessCount: 1,
        lastAccessed: Date.now(),
        size: dataSize,
        compressed: this.config.compression,
        encrypted: this.config.encryption,
      }

      this.L1Cache.set(key, entry)
      this.metrics.memoryUsage.L1 += dataSize

      return true
    } catch (error) {
      console.error('L1 cache set error:', error)
      return false
    }
  }

  /**
   * データのシリアライゼーション（圧縮・暗号化対応）
   */
  private serializeData<T>(data: T): string {
    try {
      let serialized = JSON.stringify(data)

      // 圧縮
      if (this.config.compression && serialized.length > 1024) {
        const compressed = gzipSync(Buffer.from(serialized))
        serialized = compressed.toString('base64')
      }

      // 暗号化
      if (this.config.encryption) {
        const cipher = crypto.createCipher('aes-256-cbc', this.encryptionKey)
        let encrypted = cipher.update(serialized, 'utf8', 'hex')
        encrypted += cipher.final('hex')
        serialized = encrypted
      }

      return serialized
    } catch (error) {
      console.error('Serialization error:', error)
      return JSON.stringify(data)
    }
  }

  /**
   * データのデシリアライゼーション
   */
  private deserializeData<T>(serialized: string): T {
    try {
      let data = serialized

      // 復号化
      if (this.config.encryption) {
        const decipher = crypto.createDecipher('aes-256-cbc', this.encryptionKey)
        let decrypted = decipher.update(data, 'hex', 'utf8')
        decrypted += decipher.final('utf8')
        data = decrypted
      }

      // 展開
      if (this.config.compression) {
        try {
          const decompressed = gunzipSync(Buffer.from(data, 'base64'))
          data = decompressed.toString()
        } catch {
          // 圧縮されていないデータの場合はそのまま
        }
      }

      return JSON.parse(data)
    } catch (error) {
      console.error('Deserialization error:', error)
      return JSON.parse(serialized)
    }
  }

  /**
   * データサイズ計算
   */
  private getDataSize(data: string): number {
    return Buffer.byteLength(data, 'utf8')
  }

  /**
   * エントリーの有効期限チェック
   */
  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() > entry.timestamp + entry.ttl
  }

  /**
   * バッチ同期キューに追加
   */
  private queueForBatchSync(key: string, data: string, ttl: number): void {
    this.batchQueue.set(key, { data, ttl, timestamp: Date.now() })

    // バッチサイズに達したら即座に同期
    if (this.batchQueue.size >= this.config.batchSize) {
      this.processBatchSync()
    }
  }

  /**
   * バッチ同期処理
   */
  private async processBatchSync(): Promise<void> {
    if (this.batchQueue.size === 0) return

    const batch = Array.from(this.batchQueue.entries())
    this.batchQueue.clear()

    const promises = batch.map(([key, { data, ttl }]) => this.redisCache.set(key, data, { ttl }))

    try {
      await Promise.allSettled(promises)
      this.emit('batch_sync_completed', { count: batch.length })
    } catch (error) {
      this.emit('batch_sync_error', { error, count: batch.length })
    }
  }

  /**
   * バッチ同期タイマー開始
   */
  private startBatchSync(): void {
    this.syncTimer = setInterval(() => {
      this.processBatchSync()
    }, this.config.syncInterval)
  }

  /**
   * レイテンシ記録
   */
  private recordLatency(latency: number): void {
    this.metrics.averageLatency =
      (this.metrics.averageLatency * (this.metrics.totalRequests - 1) + latency) /
      this.metrics.totalRequests
  }

  /**
   * メトリクス更新
   */
  private updateMetrics(): void {
    this.metrics.hitRateByLayer.L1 =
      this.metrics.totalRequests > 0 ? this.L1Cache.size / this.metrics.totalRequests : 0

    this.metrics.memoryUsage.L1 = Array.from(this.L1Cache.values()).reduce(
      (total, entry) => total + entry.size,
      0
    )
  }

  /**
   * キャッシュウォームアップ
   */
  private async warmupCache(): Promise<void> {
    try {
      console.log('🔥 Starting cache warmup...')

      // 頻繁にアクセスされるデータを事前ロード
      const warmupKeys = ['user_progress_*', 'exam_questions_*', 'leaderboard_*', 'process_data_*']

      for (const pattern of warmupKeys) {
        const keys = await this.redisCache.keys(pattern)
        console.log(`Warming up ${keys.length} keys for pattern: ${pattern}`)

        // 並列でウォームアップ（制限付き）
        const chunkSize = 50
        for (let i = 0; i < keys.length; i += chunkSize) {
          const chunk = keys.slice(i, i + chunkSize)
          await Promise.allSettled(chunk.map((key) => this.get(key)))
        }
      }

      console.log('✅ Cache warmup completed')
      this.emit('warmup_completed', { patterns: warmupKeys.length })
    } catch (error) {
      console.error('❌ Cache warmup failed:', error)
      this.emit('warmup_failed', { error })
    }
  }

  /**
   * キャッシュクリア
   */
  async clear(): Promise<void> {
    this.L1Cache.clear()
    await this.redisCache.clear()
    this.batchQueue.clear()
    this.resetMetrics()
    this.emit('cache_cleared')
  }

  /**
   * メトリクスリセット
   */
  private resetMetrics(): void {
    this.metrics = {
      hits: 0,
      misses: 0,
      evictions: 0,
      totalRequests: 0,
      averageLatency: 0,
      memoryUsage: { L1: 0, L2: 0 },
      hitRateByLayer: { L1: 0, L2: 0, L3: 0 },
    }
  }

  /**
   * メトリクスの取得 - 詳細版
   */
  getMetrics(): CacheMetrics {
    return {
      ...this.metrics,
      hitRateByLayer: {
        L1: this.metrics.totalRequests > 0 ? this.metrics.hitRateByLayer.L1 : 0,
        L2: this.metrics.totalRequests > 0 ? this.metrics.hitRateByLayer.L2 : 0,
        L3: this.metrics.totalRequests > 0 ? this.metrics.hitRateByLayer.L3 : 0,
      },
    }
  }

  /**
   * ヘルスチェック
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy'
    metrics: CacheMetrics
    layers: {
      L1: { status: string; size: number }
      L2: { status: string; connected: boolean }
    }
  }> {
    try {
      const l2Health = await this.redisCache.healthCheck()
      const hitRate =
        this.metrics.totalRequests > 0 ? this.metrics.hits / this.metrics.totalRequests : 0

      let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'

      if (!l2Health.connected || hitRate < 0.5) {
        status = 'degraded'
      }
      if (!l2Health.connected && hitRate < 0.2) {
        status = 'unhealthy'
      }

      return {
        status,
        metrics: this.getMetrics(),
        layers: {
          L1: {
            status: this.L1Cache.size < this.config.maxSize.L1 ? 'healthy' : 'full',
            size: this.L1Cache.size,
          },
          L2: {
            status: l2Health.connected ? 'healthy' : 'unhealthy',
            connected: l2Health.connected,
          },
        },
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        metrics: this.getMetrics(),
        layers: {
          L1: { status: 'error', size: 0 },
          L2: { status: 'error', connected: false },
        },
      }
    }
  }

  /**
   * クリーンアップ
   */
  async destroy(): Promise<void> {
    if (this.syncTimer) {
      clearInterval(this.syncTimer)
      this.syncTimer = null
    }

    // 残りのバッチを同期
    await this.processBatchSync()

    this.L1Cache.clear()
    this.batchQueue.clear()
    this.removeAllListeners()
  }
}

/**
 * メモリ使用量監視とアラート
 */
export class CacheMemoryManager {
  private readonly WARNING_THRESHOLD = 0.8
  private readonly CRITICAL_THRESHOLD = 0.95

  constructor(private cacheManager: HierarchicalCacheManager) {
    // メモリ監視の開始
    setInterval(() => {
      this.checkMemoryUsage()
    }, 60000) // 1分ごと
  }

  private checkMemoryUsage(): void {
    const metrics = this.cacheManager.getMetrics()
    const utilizationRate = metrics.memoryUsage.L1 / (this.cacheManager['config'].maxSize.L1 * 1024) // 概算

    if (utilizationRate >= this.CRITICAL_THRESHOLD) {
      this.cacheManager.emit('memory_critical', {
        utilizationRate,
        usage: metrics.memoryUsage.L1,
      })
    } else if (utilizationRate >= this.WARNING_THRESHOLD) {
      this.cacheManager.emit('memory_warning', {
        utilizationRate,
        usage: metrics.memoryUsage.L1,
      })
    }
  }
}

/**
 * 事前定義されたキャッシュ設定
 */
export const CacheConfigurations = {
  // 高パフォーマンス設定（本番環境）
  HIGH_PERFORMANCE: {
    strategy: CacheStrategy.WRITE_THROUGH,
    eviction: EvictionStrategy.LRU,
    ttl: {
      L1: 5 * 60 * 1000, // 5分
      L2: 30 * 60 * 1000, // 30分
    },
    maxSize: {
      L1: 10000, // 10K エントリ
      L2: '500mb', // 500MB
    },
    compression: true,
    encryption: false,
    warmupOnStart: true,
    batchSize: 100,
    syncInterval: 5000,
  } as CacheConfig,

  // メモリ効率設定
  MEMORY_EFFICIENT: {
    strategy: CacheStrategy.WRITE_BACK,
    eviction: EvictionStrategy.LFU,
    ttl: {
      L1: 2 * 60 * 1000, // 2分
      L2: 15 * 60 * 1000, // 15分
    },
    maxSize: {
      L1: 5000, // 5K エントリ
      L2: '200mb', // 200MB
    },
    compression: true,
    encryption: false,
    warmupOnStart: false,
    batchSize: 50,
    syncInterval: 10000,
  } as CacheConfig,

  // 開発環境設定
  DEVELOPMENT: {
    strategy: CacheStrategy.CACHE_ASIDE,
    eviction: EvictionStrategy.TTL,
    ttl: {
      L1: 30 * 1000, // 30秒
      L2: 2 * 60 * 1000, // 2分
    },
    maxSize: {
      L1: 1000, // 1K エントリ
      L2: '50mb', // 50MB
    },
    compression: false,
    encryption: false,
    warmupOnStart: false,
    batchSize: 10,
    syncInterval: 5000,
  } as CacheConfig,
}

// デフォルトエクスポート
export default {
  HierarchicalCacheManager,
  CacheMemoryManager,
  CacheStrategy,
  CacheLayer,
  EvictionStrategy,
  CacheConfigurations,
}
