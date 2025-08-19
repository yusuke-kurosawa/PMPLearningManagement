/**
 * 包括的Redis キャッシングシステム
 * Developer 5: Redisキャッシング戦略・ミドルウェア・無効化ロジック実装
 */

import Redis from 'ioredis'
import { z } from 'zod'
import { logger } from '../../services/logger'

// キャッシュ設定スキーマ
const CacheConfigSchema = z.object({
  defaultTTL: z.number().positive().default(300), // 5分
  maxMemory: z.string().default('512mb'),
  keyPrefix: z.string().default('pmp_cache'),
  compressionThreshold: z.number().positive().default(1024), // 1KB以上は圧縮
  maxRetries: z.number().int().min(0).default(3),
  retryDelayMs: z.number().positive().default(100),
})

export type CacheConfig = z.infer<typeof CacheConfigSchema>

// キャッシュエントリの型
export interface CacheEntry<T = unknown> {
  data: T
  timestamp: number
  ttl: number
  version: string
  compressed?: boolean
  tags: string[]
}

// キャッシュ統計
export interface CacheStats {
  hits: number
  misses: number
  sets: number
  deletes: number
  hitRate: number
  memoryUsage: number
  keyCount: number
  avgResponseTime: number
}

// キャッシュキー戦略
export enum CacheKeyStrategy {
  USER_DATA = 'user', // ユーザー固有データ
  PMBOK_DATA = 'pmbok', // PMBOKプロセス・用語集
  EXAM_DATA = 'exam', // 試験問題・結果
  SESSION_DATA = 'session', // セッション関連
  ANALYTICS_DATA = 'analytics', // 分析・統計
  TEMP_DATA = 'temp', // 一時的なデータ
}

/**
 * 高性能Redisキャッシュマネージャー
 */
export class RedisCacheManager {
  private redis: Redis | null = null
  private config: CacheConfig
  private stats: CacheStats
  private keyPrefix: string

  constructor(config?: Partial<CacheConfig>) {
    this.config = CacheConfigSchema.parse(config || {})
    this.keyPrefix = this.config.keyPrefix
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      hitRate: 0,
      memoryUsage: 0,
      keyCount: 0,
      avgResponseTime: 0,
    }
  }

  /**
   * Redis接続の初期化
   */
  private async getRedis(): Promise<Redis> {
    if (!this.redis) {
      this.redis = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
        retryDelayOnFailover: this.config.retryDelayMs,
        maxRetriesPerRequest: this.config.maxRetries,
        lazyConnect: true,
        keyPrefix: `${this.keyPrefix}:`,
      })

      this.redis.on('connect', () => {
        if (process.env.NODE_ENV === 'development') {
          logger.debug('Redis cache connection established')
        }
      })

      this.redis.on('error', (error) => {
        if (process.env.NODE_ENV === 'development') {
          logger.error('Redis cache error:', error)
        }
      })

      // 接続テスト
      await this.redis.ping()
    }
    return this.redis
  }

  /**
   * キャッシュキーの生成
   */
  private generateKey(
    strategy: CacheKeyStrategy,
    identifier: string,
    additionalParams?: Record<string, unknown>
  ): string {
    let key = `${strategy}:${identifier}`

    if (additionalParams) {
      const params = Object.keys(additionalParams)
        .sort()
        .map((k) => `${k}:${additionalParams[k]}`)
        .join(':')
      key += `:${params}`
    }

    return key
  }

  /**
   * データの圧縮
   */
  private compress(data: string): Buffer {
    // Note: zlib is a Node.js module and not available in browser environment
    // For now, return uncompressed buffer for browser compatibility
    return Buffer.from(data)
  }

  /**
   * データの展開
   */
  private decompress(data: Buffer): string {
    // Note: zlib is a Node.js module and not available in browser environment
    // For now, return uncompressed data for browser compatibility
    return data.toString()
  }

  /**
   * データをキャッシュに設定
   */
  async set<T>(
    strategy: CacheKeyStrategy,
    identifier: string,
    data: T,
    options?: {
      ttl?: number
      tags?: string[]
      version?: string
      additionalParams?: Record<string, unknown>
    }
  ): Promise<void> {
    const startTime = Date.now()

    try {
      const redis = await this.getRedis()
      const key = this.generateKey(strategy, identifier, options?.additionalParams)

      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl: options?.ttl || this.config.defaultTTL,
        version: options?.version || '1.0.0',
        tags: options?.tags || [],
      }

      const serializedData = JSON.stringify(entry)

      // 圧縮判定
      if (serializedData.length > this.config.compressionThreshold) {
        const compressed = this.compress(serializedData)
        await redis.setex(key, entry.ttl, compressed)
        entry.compressed = true
      } else {
        await redis.setex(key, entry.ttl, serializedData)
      }

      // タグ付けによる関連キーの管理
      if (entry.tags.length > 0) {
        const pipeline = redis.pipeline()
        entry.tags.forEach((tag) => {
          pipeline.sadd(`tag:${tag}`, key)
          pipeline.expire(`tag:${tag}`, entry.ttl + 3600) // タグは1時間長く保持
        })
        await pipeline.exec()
      }

      this.stats.sets++
      this.updateResponseTime(Date.now() - startTime)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('Cache set error:', error)
      }
      throw error
    }
  }

  /**
   * キャッシュからデータを取得
   */
  async get<T>(
    strategy: CacheKeyStrategy,
    identifier: string,
    options?: {
      additionalParams?: Record<string, unknown>
      acceptedVersions?: string[]
    }
  ): Promise<T | null> {
    const startTime = Date.now()

    try {
      const redis = await this.getRedis()
      const key = this.generateKey(strategy, identifier, options?.additionalParams)

      const result = await redis.get(key)

      if (!result) {
        this.stats.misses++
        return null
      }

      let entry: CacheEntry<T>

      // 圧縮データの展開判定
      if (result.startsWith('H4sI') || result.length > this.config.compressionThreshold) {
        try {
          const decompressed = this.decompress(Buffer.from(result, 'base64'))
          entry = JSON.parse(decompressed)
        } catch {
          // 圧縮されていない場合
          entry = JSON.parse(result)
        }
      } else {
        entry = JSON.parse(result)
      }

      // バージョンチェック
      if (options?.acceptedVersions && !options.acceptedVersions.includes(entry.version)) {
        await this.delete(strategy, identifier, options)
        this.stats.misses++
        return null
      }

      this.stats.hits++
      this.updateResponseTime(Date.now() - startTime)

      return entry.data
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('Cache get error:', error)
      }
      this.stats.misses++
      return null
    }
  }

  /**
   * キャッシュからデータを削除
   */
  async delete(
    strategy: CacheKeyStrategy,
    identifier: string,
    options?: {
      additionalParams?: Record<string, unknown>
    }
  ): Promise<boolean> {
    try {
      const redis = await this.getRedis()
      const key = this.generateKey(strategy, identifier, options?.additionalParams)

      const result = await redis.del(key)

      if (result > 0) {
        this.stats.deletes++
        return true
      }

      return false
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('Cache delete error:', error)
      }
      return false
    }
  }

  /**
   * 複数のキーを一括取得
   */
  async mget<T>(
    strategy: CacheKeyStrategy,
    identifiers: string[],
    options?: {
      additionalParams?: Record<string, unknown>
    }
  ): Promise<Map<string, T>> {
    const results = new Map<string, T>()

    try {
      const redis = await this.getRedis()
      const keys = identifiers.map((id) =>
        this.generateKey(strategy, id, options?.additionalParams)
      )

      const values = await redis.mget(...keys)

      for (let i = 0; i < identifiers.length; i++) {
        if (values[i]) {
          try {
            const entry: CacheEntry<T> = JSON.parse(values[i] || '{}')
            results.set(identifiers[i], entry.data)
            this.stats.hits++
          } catch (error) {
            if (process.env.NODE_ENV === 'development') {
              logger.warn(`Failed to parse cached data for ${identifiers[i]}:`, error)
            }
            this.stats.misses++
          }
        } else {
          this.stats.misses++
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('Cache mget error:', error)
      }
    }

    return results
  }

  /**
   * 複数のキーを一括設定
   */
  async mset<T>(
    strategy: CacheKeyStrategy,
    dataMap: Map<string, T>,
    options?: {
      ttl?: number
      tags?: string[]
      version?: string
      additionalParams?: Record<string, unknown>
    }
  ): Promise<void> {
    try {
      const redis = await this.getRedis()
      const pipeline = redis.pipeline()
      const ttl = options?.ttl || this.config.defaultTTL

      for (const [identifier, data] of dataMap) {
        const key = this.generateKey(strategy, identifier, options?.additionalParams)
        const entry: CacheEntry<T> = {
          data,
          timestamp: Date.now(),
          ttl,
          version: options?.version || '1.0.0',
          tags: options?.tags || [],
        }

        const serializedData = JSON.stringify(entry)
        pipeline.setex(key, ttl, serializedData)

        // タグ管理
        if (entry.tags.length > 0) {
          entry.tags.forEach((tag) => {
            pipeline.sadd(`tag:${tag}`, key)
            pipeline.expire(`tag:${tag}`, ttl + 3600)
          })
        }
      }

      await pipeline.exec()
      this.stats.sets += dataMap.size
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('Cache mset error:', error)
      }
      throw error
    }
  }

  /**
   * タグによるキャッシュ無効化
   */
  async invalidateByTag(tag: string): Promise<number> {
    try {
      const redis = await this.getRedis()
      const keys = await redis.smembers(`tag:${tag}`)

      if (keys.length === 0) {
        return 0
      }

      const pipeline = redis.pipeline()
      keys.forEach((key) => pipeline.del(key))
      pipeline.del(`tag:${tag}`)

      await pipeline.exec()
      this.stats.deletes += keys.length

      return keys.length
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('Cache invalidate by tag error:', error)
      }
      return 0
    }
  }

  /**
   * パターンによるキャッシュ無効化
   */
  async invalidateByPattern(pattern: string): Promise<number> {
    try {
      const redis = await this.getRedis()
      const keys = await redis.keys(pattern)

      if (keys.length === 0) {
        return 0
      }

      await redis.del(...keys)
      this.stats.deletes += keys.length

      return keys.length
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('Cache invalidate by pattern error:', error)
      }
      return 0
    }
  }

  /**
   * 特定ユーザーのキャッシュをすべて無効化
   */
  async invalidateUserCache(userId: string): Promise<number> {
    return this.invalidateByPattern(`*user:${userId}*`)
  }

  /**
   * キャッシュ統計の更新
   */
  private updateResponseTime(responseTime: number): void {
    const totalResponses = this.stats.hits + this.stats.misses
    this.stats.avgResponseTime =
      (this.stats.avgResponseTime * (totalResponses - 1) + responseTime) / totalResponses
    this.stats.hitRate = this.stats.hits / totalResponses
  }

  /**
   * キャッシュ統計の取得
   */
  async getStats(): Promise<CacheStats> {
    try {
      const redis = await this.getRedis()
      const info = await redis.info('memory')
      const keyCount = await redis.dbsize()

      // メモリ使用量の解析
      const memoryMatch = info.match(/used_memory:(\d+)/)
      const memoryUsage = memoryMatch ? parseInt(memoryMatch[1]) : 0

      return {
        ...this.stats,
        memoryUsage,
        keyCount,
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('Failed to get cache stats:', error)
      }
      return this.stats
    }
  }

  /**
   * キャッシュのヘルスチェック
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy'
    details: {
      connection: boolean
      responseTime: number
      memoryUsage: number
      hitRate: number
      keyCount: number
    }
  }> {
    const startTime = Date.now()

    try {
      const redis = await this.getRedis()
      await redis.ping()
      const responseTime = Date.now() - startTime
      const stats = await this.getStats()

      let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'

      // ヘルスチェック条件
      if (responseTime > 100 || stats.hitRate < 0.7) {
        status = 'degraded'
      }
      if (responseTime > 500 || stats.memoryUsage > 0.9) {
        status = 'unhealthy'
      }

      return {
        status,
        details: {
          connection: true,
          responseTime,
          memoryUsage: stats.memoryUsage,
          hitRate: stats.hitRate,
          keyCount: stats.keyCount,
        },
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('Cache health check failed:', error)
      }
      return {
        status: 'unhealthy',
        details: {
          connection: false,
          responseTime: Date.now() - startTime,
          memoryUsage: 0,
          hitRate: 0,
          keyCount: 0,
        },
      }
    }
  }

  /**
   * 期限切れキーのクリーンアップ
   */
  async cleanup(): Promise<number> {
    try {
      const redis = await this.getRedis()

      // Luaスクリプトで効率的にクリーンアップ
      const luaScript = `
        local keys = redis.call('keys', ARGV[1])
        local deleted = 0
        
        for i = 1, #keys do
          local ttl = redis.call('ttl', keys[i])
          if ttl == -1 then  -- TTLが設定されていない
            redis.call('expire', keys[i], 300)  -- デフォルト5分TTLを設定
          elseif ttl == -2 then  -- 既に期限切れ
            redis.call('del', keys[i])
            deleted = deleted + 1
          end
        end
        
        return deleted
      `

      const deleted = (await redis.eval(luaScript, 0, `${this.keyPrefix}:*`)) as number

      if (deleted > 0) {
        if (process.env.NODE_ENV === 'development') {
          logger.debug(`Cleaned up ${deleted} expired cache keys`)
        }
      }

      return deleted
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('Cache cleanup error:', error)
      }
      return 0
    }
  }

  /**
   * 統計のリセット
   */
  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      hitRate: 0,
      memoryUsage: 0,
      keyCount: 0,
      avgResponseTime: 0,
    }
  }

  /**
   * 接続の切断
   */
  async disconnect(): Promise<void> {
    if (this.redis) {
      await this.redis.quit()
      this.redis = null
      if (process.env.NODE_ENV === 'development') {
        logger.debug('Redis cache disconnected')
      }
    }
  }
}

/**
 * キャッシュミドルウェア関数
 */
export function createCacheMiddleware(cacheManager: RedisCacheManager) {
  return function cacheMiddleware<T>(
    strategy: CacheKeyStrategy,
    identifier: string | ((req: unknown) => string),
    options?: {
      ttl?: number
      tags?: string[]
      version?: string
      skipCache?: (req: unknown) => boolean
      generateKey?: (req: unknown) => Record<string, unknown>
    }
  ) {
    return async function (req: unknown, handler: () => Promise<T>): Promise<T> {
      try {
        // スキップ条件チェック
        if (options?.skipCache && options.skipCache(req)) {
          return await handler()
        }

        // キー生成
        const keyIdentifier = typeof identifier === 'function' ? identifier(req) : identifier

        const additionalParams = options?.generateKey ? options.generateKey(req) : undefined

        // キャッシュから取得を試行
        const cachedData = await cacheManager.get<T>(strategy, keyIdentifier, { additionalParams })

        if (cachedData !== null) {
          return cachedData
        }

        // キャッシュミスの場合、データを取得してキャッシュ
        const data = await handler()

        if (data !== null && data !== undefined) {
          await cacheManager.set(strategy, keyIdentifier, data, {
            ttl: options?.ttl,
            tags: options?.tags,
            version: options?.version,
            additionalParams,
          })
        }

        return data
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          logger.error('Cache middleware error:', error)
        }
        // キャッシュエラー時は元の処理を実行
        return await handler()
      }
    }
  }
}

/**
 * 専用キャッシュヘルパー
 */
export class SpecializedCacheHelpers {
  constructor(private cacheManager: RedisCacheManager) {}

  /**
   * ユーザーセッション用キャッシュ
   */
  async cacheUserSession(userId: string, sessionData: unknown, ttl: number = 3600): Promise<void> {
    await this.cacheManager.set(CacheKeyStrategy.SESSION_DATA, userId, sessionData, {
      ttl,
      tags: ['session', `user:${userId}`],
    })
  }

  /**
   * PMBOK プロセスデータ用キャッシュ
   */
  async cachePMBOKProcess(processId: string, processData: unknown): Promise<void> {
    await this.cacheManager.set(
      CacheKeyStrategy.PMBOK_DATA,
      processId,
      processData,
      { ttl: 86400, tags: ['pmbok', 'process'] } // 24時間
    )
  }

  /**
   * 試験結果用キャッシュ
   */
  async cacheExamResults(examId: string, results: unknown): Promise<void> {
    await this.cacheManager.set(
      CacheKeyStrategy.EXAM_DATA,
      examId,
      results,
      { ttl: 7200, tags: ['exam', 'results'] } // 2時間
    )
  }

  /**
   * 学習進捗統計用キャッシュ
   */
  async cacheLearningStats(userId: string, stats: unknown): Promise<void> {
    await this.cacheManager.set(
      CacheKeyStrategy.ANALYTICS_DATA,
      `learning_stats:${userId}`,
      stats,
      { ttl: 1800, tags: ['analytics', `user:${userId}`] } // 30分
    )
  }

  /**
   * PMBOKデータの一括無効化
   */
  async invalidatePMBOKCache(): Promise<number> {
    return this.cacheManager.invalidateByTag('pmbok')
  }

  /**
   * ユーザー関連キャッシュの一括無効化
   */
  async invalidateUserRelatedCache(userId: string): Promise<number> {
    return this.cacheManager.invalidateByTag(`user:${userId}`)
  }
}

// エクスポート用インスタンス
export const redisCacheManager = new RedisCacheManager()
export const cacheHelpers = new SpecializedCacheHelpers(redisCacheManager)

// 定期クリーンアップの設定
setInterval(
  async () => {
    await redisCacheManager.cleanup()
  },
  30 * 60 * 1000
) // 30分ごと

export default {
  RedisCacheManager,
  createCacheMiddleware,
  SpecializedCacheHelpers,
  CacheKeyStrategy,
  redisCacheManager,
  cacheHelpers,
}
