/**
 * ファイル説明: {description}
 * 開発者: {developer}
 * 専門分野: {specialization}
 * 作成日: {created}
 * 最終更新: {updated}
 * 依存関係: {dependencies}
 * セキュリティレベル: {security_level}
 */
import { RedisCacheManager, CacheKeyStrategy } from './redisCache'
import { z } from 'zod'

// キャッシング戦略の定義
export enum CacheStrategy {
  CACHE_ASIDE = 'cache_aside', // 読み取り時キャッシュ
  WRITE_THROUGH = 'write_through', // 書き込み同期キャッシュ
  WRITE_BEHIND = 'write_behind', // 書き込み非同期キャッシュ
  CACHE_FIRST = 'cache_first', // キャッシュ優先
  NETWORK_FIRST = 'network_first', // ネットワーク優先
}

// 無効化パターン
export enum InvalidationPattern {
  TIME_BASED = 'time_based', // 時間ベース
  EVENT_BASED = 'event_based', // イベントベース
  DEPENDENCY_BASED = 'dependency_based', // 依存関係ベース
  LRU_BASED = 'lru_based', // LRUベース
  SMART_REFRESH = 'smart_refresh', // スマートリフレッシュ
}

// キャッシング設定スキーマ
const CacheStrategyConfigSchema = z.object({
  strategy: z.nativeEnum(CacheStrategy),
  invalidation: z.nativeEnum(InvalidationPattern),
  ttl: z.number().positive().default(300),
  tags: z.array(z.string()).default([]),
  dependencies: z.array(z.string()).default([]),
  refreshThreshold: z.number().min(0).max(1).default(0.8), // TTLの80%で再取得
  maxStale: z.number().positive().default(3600), // 最大1時間古いデータを許可
  backgroundRefresh: z.boolean().default(true),
  compressionEnabled: z.boolean().default(true),
})

export type CacheStrategyConfig = z.infer<typeof CacheStrategyConfigSchema>

// キャッシング結果
export interface CacheResult<T> {
  data: T | null
  hit: boolean
  source: 'cache' | 'network' | 'stale'
  timestamp: number
  ttl?: number
  refreshed?: boolean
}

/**
 * 高度なキャッシング戦略マネージャー
 */
export class AdvancedCacheManager {
  private cacheManager: RedisCacheManager
  private dependencyGraph: Map<string, Set<string>> = new Map()
  private refreshQueue: Set<string> = new Set()
  private refreshCallbacks: Map<string, () => Promise<any>> = new Map()

  constructor(cacheManager: RedisCacheManager) {
    this.cacheManager = cacheManager
    this.startBackgroundRefresh()
  }

  /**
   * Cache-Aside パターン（遅延読み込み）
   */
  async cacheAside<T>(
    keyStrategy: CacheKeyStrategy,
    identifier: string,
    dataFetcher: () => Promise<T>,
    config: Partial<CacheStrategyConfig> = {}
  ): Promise<CacheResult<T>> {
    const fullConfig = CacheStrategyConfigSchema.parse(config)
    const startTime = Date.now()

    try {
      // キャッシュから取得を試行
      const cachedData = await this.cacheManager.get<T>(keyStrategy, identifier)

      if (cachedData !== null) {
        return {
          data: cachedData,
          hit: true,
          source: 'cache',
          timestamp: startTime,
        }
      }

      // キャッシュミスの場合はデータを取得
      const data = await dataFetcher()

      if (data !== null && data !== undefined) {
        await this.cacheManager.set(keyStrategy, identifier, data, {
          ttl: fullConfig.ttl,
          tags: fullConfig.tags,
        })
      }

      return {
        data,
        hit: false,
        source: 'network',
        timestamp: startTime,
      }
    } catch (error) {
      console.error('Cache-Aside error:', error)
      return {
        data: null,
        hit: false,
        source: 'network',
        timestamp: startTime,
      }
    }
  }

  /**
   * Write-Through パターン（同期書き込み）
   */
  async writeThrough<T>(
    keyStrategy: CacheKeyStrategy,
    identifier: string,
    data: T,
    dataPersister: (data: T) => Promise<void>,
    config: Partial<CacheStrategyConfig> = {}
  ): Promise<void> {
    const fullConfig = CacheStrategyConfigSchema.parse(config)

    try {
      // データベースとキャッシュに同期的に書き込み
      await Promise.all([
        dataPersister(data),
        this.cacheManager.set(keyStrategy, identifier, data, {
          ttl: fullConfig.ttl,
          tags: fullConfig.tags,
        }),
      ])

      // 依存関係の無効化
      await this.invalidateDependencies(identifier)
    } catch (error) {
      console.error('Write-Through error:', error)
      // エラー時はキャッシュを削除して整合性を保つ
      await this.cacheManager.delete(keyStrategy, identifier)
      throw error
    }
  }

  /**
   * Write-Behind パターン（非同期書き込み）
   */
  async writeBehind<T>(
    keyStrategy: CacheKeyStrategy,
    identifier: string,
    data: T,
    dataPersister: (data: T) => Promise<void>,
    config: Partial<CacheStrategyConfig> = {}
  ): Promise<void> {
    const fullConfig = CacheStrategyConfigSchema.parse(config)

    try {
      // キャッシュに即座に書き込み
      await this.cacheManager.set(keyStrategy, identifier, data, {
        ttl: fullConfig.ttl,
        tags: [...fullConfig.tags, 'write_behind'],
      })

      // 非同期でデータベースに書き込み
      setImmediate(async () => {
        try {
          await dataPersister(data)
          // 書き込み完了後、write_behindタグを削除
          const updatedData = await this.cacheManager.get<T>(keyStrategy, identifier)
          if (updatedData) {
            await this.cacheManager.set(keyStrategy, identifier, updatedData, {
              ttl: fullConfig.ttl,
              tags: fullConfig.tags,
            })
          }
        } catch (error) {
          console.error('Write-Behind persist error:', error)
          // 失敗時はキャッシュも無効化
          await this.cacheManager.delete(keyStrategy, identifier)
        }
      })
    } catch (error) {
      console.error('Write-Behind error:', error)
      throw error
    }
  }

  /**
   * スマート・リフレッシュ機能付きキャッシュ取得
   */
  async smartCache<T>(
    keyStrategy: CacheKeyStrategy,
    identifier: string,
    dataFetcher: () => Promise<T>,
    config: Partial<CacheStrategyConfig> = {}
  ): Promise<CacheResult<T>> {
    const fullConfig = CacheStrategyConfigSchema.parse(config)
    const startTime = Date.now()

    try {
      // キャッシュエントリの詳細情報を取得
      const cacheKey = `${keyStrategy}:${identifier}`
      const redis = await (this.cacheManager as any).getRedis()
      const ttl = await redis.ttl(cacheKey)
      const cachedData = await this.cacheManager.get<T>(keyStrategy, identifier)

      if (cachedData !== null && ttl > 0) {
        const remainingTime = ttl
        const totalTtl = fullConfig.ttl
        const refreshThreshold = totalTtl * fullConfig.refreshThreshold

        // リフレッシュが必要かチェック
        if (remainingTime < refreshThreshold && fullConfig.backgroundRefresh) {
          // バックグラウンドでリフレッシュ
          this.scheduleBackgroundRefresh(keyStrategy, identifier, dataFetcher, fullConfig)
        }

        return {
          data: cachedData,
          hit: true,
          source: 'cache',
          timestamp: startTime,
          ttl: remainingTime,
        }
      }

      // キャッシュミスまたは期限切れの場合
      const data = await dataFetcher()

      if (data !== null && data !== undefined) {
        await this.cacheManager.set(keyStrategy, identifier, data, {
          ttl: fullConfig.ttl,
          tags: fullConfig.tags,
        })
      }

      return {
        data,
        hit: false,
        source: 'network',
        timestamp: startTime,
        refreshed: true,
      }
    } catch (error) {
      console.error('Smart cache error:', error)

      // エラー時は古いデータの返却を試行
      const staleData = await this.getStaleData<T>(keyStrategy, identifier, fullConfig.maxStale)
      if (staleData !== null) {
        return {
          data: staleData,
          hit: false,
          source: 'stale',
          timestamp: startTime,
        }
      }

      return {
        data: null,
        hit: false,
        source: 'network',
        timestamp: startTime,
      }
    }
  }

  /**
   * 依存関係ベースの無効化
   */
  async addDependency(parentKey: string, childKey: string): Promise<void> {
    if (!this.dependencyGraph.has(parentKey)) {
      this.dependencyGraph.set(parentKey, new Set())
    }
    this.dependencyGraph.get(parentKey)!.add(childKey)
  }

  /**
   * 依存関係の無効化実行
   */
  private async invalidateDependencies(key: string): Promise<void> {
    const dependencies = this.dependencyGraph.get(key)
    if (!dependencies) return

    const invalidationTasks = Array.from(dependencies).map((depKey) => {
      // 依存キーの形式: "strategy:identifier"
      const [strategy, identifier] = depKey.split(':', 2)
      return this.cacheManager.delete(strategy as CacheKeyStrategy, identifier)
    })

    await Promise.allSettled(invalidationTasks)
    console.log(`Invalidated ${dependencies.size} dependencies for key: ${key}`)
  }

  /**
   * バックグラウンドリフレッシュのスケジューリング
   */
  private scheduleBackgroundRefresh<T>(
    keyStrategy: CacheKeyStrategy,
    identifier: string,
    dataFetcher: () => Promise<T>,
    config: CacheStrategyConfig
  ): void {
    const refreshKey = `${keyStrategy}:${identifier}`

    // 既にリフレッシュがスケジュールされている場合はスキップ
    if (this.refreshQueue.has(refreshKey)) return

    this.refreshQueue.add(refreshKey)
    this.refreshCallbacks.set(refreshKey, async () => {
      try {
        const data = await dataFetcher()
        if (data !== null && data !== undefined) {
          await this.cacheManager.set(keyStrategy, identifier, data, {
            ttl: config.ttl,
            tags: config.tags,
          })
        }
      } catch (error) {
        console.error('Background refresh failed:', error)
      } finally {
        this.refreshQueue.delete(refreshKey)
        this.refreshCallbacks.delete(refreshKey)
      }
    })
  }

  /**
   * 古いデータの取得（フォールバック用）
   */
  private async getStaleData<T>(
    keyStrategy: CacheKeyStrategy,
    identifier: string,
    maxStale: number
  ): Promise<T | null> {
    try {
      // Redisから期限切れでも取得を試行
      const redis = await (this.cacheManager as any).getRedis()
      const cacheKey = `${keyStrategy}:${identifier}`
      const result = await redis.get(cacheKey)

      if (result) {
        const entry = JSON.parse(result)
        const age = Date.now() - entry.timestamp

        if (age < maxStale * 1000) {
          return entry.data
        }
      }

      return null
    } catch (error) {
      console.error('Get stale data error:', error)
      return null
    }
  }

  /**
   * バックグラウンドリフレッシュワーカー
   */
  private startBackgroundRefresh(): void {
    setInterval(async () => {
      const refreshTasks = Array.from(this.refreshCallbacks.values())
      if (refreshTasks.length === 0) return

      console.log(`Processing ${refreshTasks.length} background refresh tasks`)

      // 並列数を制限してリフレッシュを実行
      const concurrencyLimit = 5
      for (let i = 0; i < refreshTasks.length; i += concurrencyLimit) {
        const batch = refreshTasks.slice(i, i + concurrencyLimit)
        await Promise.allSettled(batch.map((task) => task()))
      }
    }, 30000) // 30秒ごと
  }

  /**
   * キャッシュウォーミング（事前読み込み）
   */
  async warmupCache(
    warmupConfigs: Array<{
      keyStrategy: CacheKeyStrategy
      identifier: string
      dataFetcher: () => Promise<any>
      config?: Partial<CacheStrategyConfig>
    }>
  ): Promise<number> {
    let warmedUp = 0
    const warmupTasks = warmupConfigs.map(
      async ({ keyStrategy, identifier, dataFetcher, config }) => {
        try {
          const result = await this.cacheAside(keyStrategy, identifier, dataFetcher, config)
          if (!result.hit) warmedUp++
        } catch (error) {
          console.error(`Cache warmup failed for ${keyStrategy}:${identifier}:`, error)
        }
      }
    )

    await Promise.allSettled(warmupTasks)
    console.log(`Cache warmup completed: ${warmedUp} entries loaded`)
    return warmedUp
  }

  /**
   * キャッシュ分析とレポート
   */
  async generateCacheReport(): Promise<{
    stats: any
    topKeys: Array<{ key: string; hitCount: number }>
    recommendations: string[]
  }> {
    const stats = await this.cacheManager.getStats()
    const recommendations: string[] = []

    // ヒット率分析
    if (stats.hitRate < 0.7) {
      recommendations.push('キャッシュヒット率が低いです。TTLの調整を検討してください。')
    }

    // メモリ使用量分析
    if (stats.memoryUsage > 0.8) {
      recommendations.push('メモリ使用量が高いです。LRU無効化やTTL短縮を検討してください。')
    }

    // レスポンス時間分析
    if (stats.avgResponseTime > 50) {
      recommendations.push('キャッシュレスポンス時間が遅いです。Redis性能の確認が必要です。')
    }

    return {
      stats,
      topKeys: [], // 実際にはRedisからホットキー情報を取得
      recommendations,
    }
  }

  /**
   * マルチレイヤーキャッシング
   */
  async multiLayerCache<T>(
    keyStrategy: CacheKeyStrategy,
    identifier: string,
    dataFetcher: () => Promise<T>,
    layers: Array<{
      name: string
      ttl: number
      condition?: (data: T) => boolean
    }>
  ): Promise<CacheResult<T>> {
    // L1キャッシュ（メモリ）から試行
    for (const layer of layers) {
      const layerKey = `${layer.name}:${keyStrategy}:${identifier}`
      const cachedData = await this.cacheManager.get<T>(keyStrategy, layerKey)

      if (cachedData !== null) {
        return {
          data: cachedData,
          hit: true,
          source: 'cache',
          timestamp: Date.now(),
        }
      }
    }

    // すべてのレイヤーでミスした場合は取得
    const data = await dataFetcher()

    if (data !== null && data !== undefined) {
      // 各レイヤーの条件に応じてキャッシュ
      const cacheTasks = layers.map((layer) => {
        if (!layer.condition || layer.condition(data)) {
          const layerKey = `${layer.name}:${keyStrategy}:${identifier}`
          return this.cacheManager.set(keyStrategy, layerKey, data, { ttl: layer.ttl })
        }
        return Promise.resolve()
      })

      await Promise.allSettled(cacheTasks)
    }

    return {
      data,
      hit: false,
      source: 'network',
      timestamp: Date.now(),
    }
  }
}

/**
 * アプリケーション固有のキャッシング戦略
 */
export class PMPCacheStrategies {
  constructor(private advancedCache: AdvancedCacheManager) {}

  /**
   * ユーザーダッシュボードデータ用キャッシング
   */
  async cacheUserDashboard(userId: string, dataFetcher: () => Promise<any>) {
    return this.advancedCache.smartCache(
      CacheKeyStrategy.USER_DATA,
      `dashboard:${userId}`,
      dataFetcher,
      {
        strategy: CacheStrategy.CACHE_FIRST,
        ttl: 300, // 5分
        tags: [`user:${userId}`, 'dashboard'],
        backgroundRefresh: true,
        refreshThreshold: 0.7,
      }
    )
  }

  /**
   * PMBOK プロセス情報用キャッシング
   */
  async cachePMBOKProcesses(dataFetcher: () => Promise<any>) {
    return this.advancedCache.cacheAside(
      CacheKeyStrategy.PMBOK_DATA,
      'all_processes',
      dataFetcher,
      {
        strategy: CacheStrategy.CACHE_FIRST,
        ttl: 86400, // 24時間
        tags: ['pmbok', 'processes', 'static'],
      }
    )
  }

  /**
   * 試験問題用キャッシング（階層化）
   */
  async cacheExamQuestions(examType: string, difficulty: string, dataFetcher: () => Promise<any>) {
    return this.advancedCache.multiLayerCache(
      CacheKeyStrategy.EXAM_DATA,
      `questions:${examType}:${difficulty}`,
      dataFetcher,
      [
        { name: 'hot', ttl: 300, condition: (data: any) => data.length > 10 },
        { name: 'warm', ttl: 1800, condition: (data: any) => data.length > 0 },
        { name: 'cold', ttl: 7200 }, // すべてのデータ
      ]
    )
  }

  /**
   * 学習統計用キャッシング（書き込み非同期）
   */
  async updateLearningStats(
    userId: string,
    stats: any,
    dataPersister: (stats: any) => Promise<void>
  ) {
    await this.advancedCache.writeBehind(
      CacheKeyStrategy.ANALYTICS_DATA,
      `learning_stats:${userId}`,
      stats,
      dataPersister,
      {
        strategy: CacheStrategy.WRITE_BEHIND,
        ttl: 1800, // 30分
        tags: [`user:${userId}`, 'analytics', 'stats'],
      }
    )
  }

  /**
   * セッション情報用キャッシング（書き込み同期）
   */
  async updateUserSession(
    userId: string,
    sessionData: any,
    dataPersister: (data: any) => Promise<void>
  ) {
    await this.advancedCache.writeThrough(
      CacheKeyStrategy.SESSION_DATA,
      userId,
      sessionData,
      dataPersister,
      {
        strategy: CacheStrategy.WRITE_THROUGH,
        ttl: 3600, // 1時間
        tags: [`user:${userId}`, 'session'],
      }
    )
  }
}

export default {
  AdvancedCacheManager,
  PMPCacheStrategies,
  CacheStrategy,
  InvalidationPattern,
}
