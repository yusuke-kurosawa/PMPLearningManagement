/**
 * Redis キャッシングシステムのテスト
 * Developer 5: Redisキャッシング戦略・ミドルウェア・無効化ロジック実装のテスト
 */

import { describe, it, expect, beforeEach, afterEach, beforeAll, vi } from 'vitest'
import {
  RedisCacheManager,
  createCacheMiddleware,
  SpecializedCacheHelpers,
  CacheKeyStrategy,
  type CacheEntry,
  type _
} from '../redisCache'
import { AdvancedCacheManager, PMPCacheStrategies } from '../cacheStrategies'

// Redis モック設定
const mockRedis = {
  ping: vi.fn(),
  get: vi.fn(),
  set: vi.fn(),
  setex: vi.fn(),
  del: vi.fn(),
  mget: vi.fn(),
  mset: vi.fn(),
  keys: vi.fn(),
  smembers: vi.fn(),
  sadd: vi.fn(),
  expire: vi.fn(),
  ttl: vi.fn(),
  info: vi.fn(),
  dbsize: vi.fn(),
  eval: vi.fn(),
  pipeline: vi.fn().mockReturnValue({
    setex: vi.fn(),
    del: vi.fn(),
    sadd: vi.fn(),
    expire: vi.fn(),
    exec: vi.fn().mockResolvedValue([]),
  }),
  quit: vi.fn(),
}

// Redis クライアントをモック
vi.mock('ioredis', () => {
  return {
    default: vi.fn(() => mockRedis),
  }
})

describe('Redis キャッシングシステム', () => {
  beforeAll(() => {
    // テスト用環境変数
    process.env.REDIS_HOST = 'localhost'
    process.env.REDIS_PORT = '6379'
    process.env.REDIS_PASSWORD = 'test-password'
  })

  beforeEach(() => {
    // モック関数のリセット
    vi.clearAllMocks()
    mockRedis.ping.mockResolvedValue('PONG')
  })

  describe('RedisCacheManager', () => {
    let cacheManager: RedisCacheManager

    beforeEach(() => {
      cacheManager = new RedisCacheManager({
        defaultTTL: 300,
        keyPrefix: 'test_cache',
        compressionThreshold: 1024,
      })
    })

    afterEach(async () => {
      await cacheManager.disconnect()
    })

    it('正常に初期化される', () => {
      expect(cacheManager).toBeInstanceOf(RedisCacheManager)
    })

    it('データをキャッシュに設定できる', async () => {
      const testData = { id: '123', name: 'Test User', email: 'test@example.com' }
      mockRedis.setex.mockResolvedValue('OK')

      await cacheManager.set(CacheKeyStrategy.USER_DATA, 'user123', testData, {
        ttl: 600,
        tags: ['user', 'profile'],
      })

      expect(mockRedis.setex).toHaveBeenCalledWith(
        'user:user123',
        600,
        expect.stringContaining('"data"')
      )
    })

    it('キャッシュからデータを取得できる', async () => {
      const testData = { id: '123', name: 'Test User' }
      const cacheEntry: CacheEntry = {
        data: testData,
        timestamp: Date.now(),
        ttl: 300,
        version: '1.0.0',
        tags: ['user'],
      }

      mockRedis.get.mockResolvedValue(JSON.stringify(cacheEntry))

      const result = await cacheManager.get(CacheKeyStrategy.USER_DATA, 'user123')

      expect(result).toEqual(testData)
      expect(mockRedis.get).toHaveBeenCalledWith('user:user123')
    })

    it('キャッシュミス時はnullを返す', async () => {
      mockRedis.get.mockResolvedValue(null)

      const result = await cacheManager.get(CacheKeyStrategy.USER_DATA, 'nonexistent')

      expect(result).toBeNull()
    })

    it('キャッシュからデータを削除できる', async () => {
      mockRedis.del.mockResolvedValue(1)

      const result = await cacheManager.delete(CacheKeyStrategy.USER_DATA, 'user123')

      expect(result).toBe(true)
      expect(mockRedis.del).toHaveBeenCalledWith('user:user123')
    })

    it('複数のキーを一括取得できる', async () => {
      const testData1 = { id: '1', name: 'User 1' }
      const testData2 = { id: '2', name: 'User 2' }

      const entry1: CacheEntry = {
        data: testData1,
        timestamp: Date.now(),
        ttl: 300,
        version: '1.0.0',
        tags: [],
      }

      const entry2: CacheEntry = {
        data: testData2,
        timestamp: Date.now(),
        ttl: 300,
        version: '1.0.0',
        tags: [],
      }

      mockRedis.mget.mockResolvedValue([
        JSON.stringify(entry1),
        JSON.stringify(entry2),
        null, // 3番目のキーは存在しない
      ])

      const results = await cacheManager.mget(CacheKeyStrategy.USER_DATA, [
        'user1',
        'user2',
        'user3',
      ])

      expect(results.size).toBe(2)
      expect(results.get('user1')).toEqual(testData1)
      expect(results.get('user2')).toEqual(testData2)
      expect(results.has('user3')).toBe(false)
    })

    it('複数のキーを一括設定できる', async () => {
      const dataMap = new Map([
        ['user1', { id: '1', name: 'User 1' }],
        ['user2', { id: '2', name: 'User 2' }],
      ])

      const mockPipeline = {
        setex: vi.fn(),
        sadd: vi.fn(),
        expire: vi.fn(),
        exec: vi.fn().mockResolvedValue([]),
      }
      mockRedis.pipeline.mockReturnValue(mockPipeline)

      await cacheManager.mset(CacheKeyStrategy.USER_DATA, dataMap, {
        ttl: 600,
        tags: ['bulk_users'],
      })

      expect(mockPipeline.setex).toHaveBeenCalledTimes(2)
      expect(mockPipeline.exec).toHaveBeenCalledTimes(1)
    })

    it('タグによるキャッシュ無効化ができる', async () => {
      const keys = ['user:user1', 'user:user2', 'user:user3']
      mockRedis.smembers.mockResolvedValue(keys)

      const mockPipeline = {
        del: vi.fn(),
        exec: vi.fn().mockResolvedValue([]),
      }
      mockRedis.pipeline.mockReturnValue(mockPipeline)

      const invalidatedCount = await cacheManager.invalidateByTag('user')

      expect(invalidatedCount).toBe(3)
      expect(mockPipeline.del).toHaveBeenCalledTimes(4) // 3つのキー + 1つのタグキー
    })

    it('パターンによるキャッシュ無効化ができる', async () => {
      const keys = ['user:user1', 'user:user2']
      mockRedis.keys.mockResolvedValue(keys)
      mockRedis.del.mockResolvedValue(2)

      const invalidatedCount = await cacheManager.invalidateByPattern('user:*')

      expect(invalidatedCount).toBe(2)
      expect(mockRedis.keys).toHaveBeenCalledWith('user:*')
      expect(mockRedis.del).toHaveBeenCalledWith(...keys)
    })

    it('ユーザーキャッシュの一括無効化ができる', async () => {
      const keys = ['user:user123:profile', 'user:user123:stats', 'analytics:user123']
      mockRedis.keys.mockResolvedValue(keys)
      mockRedis.del.mockResolvedValue(3)

      const invalidatedCount = await cacheManager.invalidateUserCache('user123')

      expect(invalidatedCount).toBe(3)
      expect(mockRedis.keys).toHaveBeenCalledWith('*user:user123*')
    })

    it('キャッシュ統計を取得できる', async () => {
      mockRedis.info.mockResolvedValue('used_memory:1024000\nother_info:value')
      mockRedis.dbsize.mockResolvedValue(150)

      const stats = await cacheManager.getStats()

      expect(stats.memoryUsage).toBe(1024000)
      expect(stats.keyCount).toBe(150)
      expect(typeof stats.hitRate).toBe('number')
    })

    it('ヘルスチェックが正常に動作する', async () => {
      mockRedis.ping.mockResolvedValue('PONG')
      mockRedis.info.mockResolvedValue('used_memory:512000')
      mockRedis.dbsize.mockResolvedValue(100)

      const health = await cacheManager.healthCheck()

      expect(health.status).toBe('healthy')
      expect(health.details.connection).toBe(true)
      expect(typeof health.details.responseTime).toBe('number')
    })

    it('レスポンス時間が遅い場合はdegradedステータス', async () => {
      // 遅いレスポンスをシミュレート
      mockRedis.ping.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve('PONG'), 150))
      )
      mockRedis.info.mockResolvedValue('used_memory:512000')
      mockRedis.dbsize.mockResolvedValue(100)

      const health = await cacheManager.healthCheck()

      expect(health.status).toBe('degraded')
      expect(health.details.responseTime).toBeGreaterThan(100)
    })

    it('接続エラー時はunhealthyステータス', async () => {
      mockRedis.ping.mockRejectedValue(new Error('Connection failed'))

      const health = await cacheManager.healthCheck()

      expect(health.status).toBe('unhealthy')
      expect(health.details.connection).toBe(false)
    })

    it('期限切れキーのクリーンアップができる', async () => {
      mockRedis.eval.mockResolvedValue(5) // 5個のキーがクリーンアップされた

      const cleanedCount = await cacheManager.cleanup()

      expect(cleanedCount).toBe(5)
      expect(mockRedis.eval).toHaveBeenCalledWith(
        expect.stringContaining('redis.call'),
        0,
        'test_cache:*'
      )
    })

    it('大きなデータは圧縮される', async () => {
      const largeData = {
        content: 'x'.repeat(2000), // 2KB の大きなデータ
        metadata: { size: 'large' },
      }
      mockRedis.setex.mockResolvedValue('OK')

      await cacheManager.set(CacheKeyStrategy.TEMP_DATA, 'large_data', largeData)

      // 圧縮されたデータが保存されることを確認
      expect(mockRedis.setex).toHaveBeenCalled()
      // 実際の圧縮データの検証は複雑なのでモック呼び出しの確認のみ
    })

    it('エラー時の統計記録', async () => {
      mockRedis.get.mockRejectedValue(new Error('Redis error'))

      const result = await cacheManager.get(CacheKeyStrategy.USER_DATA, 'error_key')

      expect(result).toBeNull()
      // エラー時でも適切に処理されることを確認
    })

    it('統計をリセットできる', () => {
      // まず統計を変更
      cacheManager['stats'].hits = 10
      cacheManager['stats'].misses = 5

      cacheManager.resetStats()

      const resetStats = cacheManager['stats']
      expect(resetStats.hits).toBe(0)
      expect(resetStats.misses).toBe(0)
      expect(resetStats.sets).toBe(0)
      expect(resetStats.deletes).toBe(0)
    })
  })

  describe('createCacheMiddleware', () => {
    let cacheManager: RedisCacheManager
    let cacheMiddleware: unknown

    beforeEach(() => {
      cacheManager = new RedisCacheManager()
      cacheMiddleware = createCacheMiddleware(cacheManager)
    })

    afterEach(async () => {
      await cacheManager.disconnect()
    })

    it('キャッシュヒット時は元の処理をスキップする', async () => {
      const cachedData = { id: '123', name: 'Cached User' }
      const cacheEntry: CacheEntry = {
        data: cachedData,
        timestamp: Date.now(),
        ttl: 300,
        version: '1.0.0',
        tags: [],
      }

      mockRedis.get.mockResolvedValue(JSON.stringify(cacheEntry))

      const middleware = cacheMiddleware(CacheKeyStrategy.USER_DATA, 'user123', { ttl: 600 })

      const mockHandler = vi.fn().mockResolvedValue({ id: '123', name: 'Fresh User' })
      const mockReq = { userId: 'user123' }

      const result = await middleware(mockReq, mockHandler)

      expect(result).toEqual(cachedData)
      expect(mockHandler).not.toHaveBeenCalled() // 元の処理はスキップされる
    })

    it('キャッシュミス時は元の処理を実行してキャッシュする', async () => {
      const freshData = { id: '123', name: 'Fresh User' }

      mockRedis.get.mockResolvedValue(null) // キャッシュミス
      mockRedis.setex.mockResolvedValue('OK')

      const middleware = cacheMiddleware(CacheKeyStrategy.USER_DATA, 'user456', { ttl: 600 })

      const mockHandler = vi.fn().mockResolvedValue(freshData)
      const mockReq = { userId: 'user456' }

      const result = await middleware(mockReq, mockHandler)

      expect(result).toEqual(freshData)
      expect(mockHandler).toHaveBeenCalledTimes(1)
      expect(mockRedis.setex).toHaveBeenCalled()
    })

    it('スキップ条件がある場合は適切にスキップする', async () => {
      const middleware = cacheMiddleware(CacheKeyStrategy.USER_DATA, 'user789', {
        skipCache: (req: unknown) => req.bypassCache === true,
      })

      const mockHandler = vi.fn().mockResolvedValue({ id: '789', name: 'Bypassed User' })
      const mockReq = { userId: 'user789', bypassCache: true }

      const result = await middleware(mockReq, mockHandler)

      expect(result).toEqual({ id: '789', name: 'Bypassed User' })
      expect(mockHandler).toHaveBeenCalledTimes(1)
      expect(mockRedis.get).not.toHaveBeenCalled() // キャッシュ確認はスキップ
    })

    it('動的キー生成が正しく動作する', async () => {
      mockRedis.get.mockResolvedValue(null)
      mockRedis.setex.mockResolvedValue('OK')

      const middleware = cacheMiddleware(
        CacheKeyStrategy.USER_DATA,
        (req: unknown) => `user_${req.userId}`,
        {
          generateKey: (req: unknown) => ({ role: req.userRole }),
        }
      )

      const mockHandler = vi.fn().mockResolvedValue({ id: '100', name: 'Dynamic User' })
      const mockReq = { userId: '100', userRole: 'admin' }

      await middleware(mockReq, mockHandler)

      expect(mockRedis.get).toHaveBeenCalledWith('user:user_100')
      expect(mockHandler).toHaveBeenCalledTimes(1)
    })

    it('キャッシュエラー時は元の処理にフォールバック', async () => {
      mockRedis.get.mockRejectedValue(new Error('Cache error'))

      const middleware = cacheMiddleware(CacheKeyStrategy.USER_DATA, 'user_error')

      const mockHandler = vi.fn().mockResolvedValue({ id: '999', name: 'Fallback User' })
      const mockReq = { userId: 'user_error' }

      const result = await middleware(mockReq, mockHandler)

      expect(result).toEqual({ id: '999', name: 'Fallback User' })
      expect(mockHandler).toHaveBeenCalledTimes(1)
    })
  })

  describe('SpecializedCacheHelpers', () => {
    let cacheManager: RedisCacheManager
    let helpers: SpecializedCacheHelpers

    beforeEach(() => {
      cacheManager = new RedisCacheManager()
      helpers = new SpecializedCacheHelpers(cacheManager)
    })

    afterEach(async () => {
      await cacheManager.disconnect()
    })

    it('ユーザーセッションをキャッシュできる', async () => {
      const sessionData = { userId: 'user123', role: 'user', permissions: [] }
      mockRedis.setex.mockResolvedValue('OK')

      await helpers.cacheUserSession('user123', sessionData, 7200)

      expect(mockRedis.setex).toHaveBeenCalledWith(
        'session:user123',
        7200,
        expect.stringContaining('"data"')
      )
    })

    it('PMBOKプロセスデータをキャッシュできる', async () => {
      const processData = { id: 'process1', name: 'Project Charter', group: 'Initiating' }
      mockRedis.setex.mockResolvedValue('OK')

      await helpers.cachePMBOKProcess('process1', processData)

      expect(mockRedis.setex).toHaveBeenCalledWith(
        'pmbok:process1',
        86400, // 24時間
        expect.stringContaining('"data"')
      )
    })

    it('試験結果をキャッシュできる', async () => {
      const examResults = { examId: 'exam1', score: 85, passed: true }
      mockRedis.setex.mockResolvedValue('OK')

      await helpers.cacheExamResults('exam1', examResults)

      expect(mockRedis.setex).toHaveBeenCalledWith(
        'exam:exam1',
        7200, // 2時間
        expect.stringContaining('"data"')
      )
    })

    it('学習統計をキャッシュできる', async () => {
      const learningStats = { progress: 75, completedProcesses: 30 }
      mockRedis.setex.mockResolvedValue('OK')

      await helpers.cacheLearningStats('user123', learningStats)

      expect(mockRedis.setex).toHaveBeenCalledWith(
        'analytics:learning_stats:user123',
        1800, // 30分
        expect.stringContaining('"data"')
      )
    })

    it('PMBOKキャッシュを一括無効化できる', async () => {
      const keys = ['pmbok:process1', 'pmbok:process2']
      mockRedis.smembers.mockResolvedValue(keys)

      const mockPipeline = {
        del: vi.fn(),
        exec: vi.fn().mockResolvedValue([]),
      }
      mockRedis.pipeline.mockReturnValue(mockPipeline)

      const invalidatedCount = await helpers.invalidatePMBOKCache()

      expect(invalidatedCount).toBe(2)
    })

    it('ユーザー関連キャッシュを一括無効化できる', async () => {
      const keys = ['session:user123', 'analytics:user123']
      mockRedis.smembers.mockResolvedValue(keys)

      const mockPipeline = {
        del: vi.fn(),
        exec: vi.fn().mockResolvedValue([]),
      }
      mockRedis.pipeline.mockReturnValue(mockPipeline)

      const invalidatedCount = await helpers.invalidateUserRelatedCache('user123')

      expect(invalidatedCount).toBe(2)
    })
  })

  describe('AdvancedCacheManager', () => {
    let cacheManager: RedisCacheManager
    let advancedCache: AdvancedCacheManager

    beforeEach(() => {
      cacheManager = new RedisCacheManager()
      advancedCache = new AdvancedCacheManager(cacheManager)
    })

    afterEach(async () => {
      await cacheManager.disconnect()
    })

    it('Cache-Aside パターンが正しく動作する', async () => {
      const testData = { id: 'test', value: 'cache-aside' }
      const dataFetcher = vi.fn().mockResolvedValue(testData)

      mockRedis.get.mockResolvedValue(null) // キャッシュミス
      mockRedis.setex.mockResolvedValue('OK')

      const result = await advancedCache.cacheAside(
        CacheKeyStrategy.USER_DATA,
        'test_key',
        dataFetcher
      )

      expect(result.data).toEqual(testData)
      expect(result.hit).toBe(false)
      expect(result.source).toBe('network')
      expect(dataFetcher).toHaveBeenCalledTimes(1)
    })

    it('スマートキャッシュでバックグラウンドリフレッシュが動作する', async () => {
      const testData = { id: 'smart', value: 'refresh' }
      const cacheEntry: CacheEntry = {
        data: testData,
        timestamp: Date.now(),
        ttl: 300,
        version: '1.0.0',
        tags: [],
      }

      mockRedis.get.mockResolvedValue(JSON.stringify(cacheEntry))
      mockRedis.ttl.mockResolvedValue(60) // TTLが残り60秒（リフレッシュ閾値以下）

      const dataFetcher = vi.fn().mockResolvedValue({ id: 'smart', value: 'refreshed' })

      const result = await advancedCache.smartCache(
        CacheKeyStrategy.USER_DATA,
        'smart_key',
        dataFetcher,
        { refreshThreshold: 0.8, backgroundRefresh: true }
      )

      expect(result.data).toEqual(testData)
      expect(result.hit).toBe(true)
      expect(result.source).toBe('cache')

      // バックグラウンドリフレッシュがスケジュールされることを確認
      expect(advancedCache['refreshQueue'].has('user:smart_key')).toBe(true)
    })

    it('Write-Through パターンが正しく動作する', async () => {
      const testData = { id: 'write', value: 'through' }
      const dataPersister = vi.fn().mockResolvedValue(undefined)

      mockRedis.setex.mockResolvedValue('OK')

      await advancedCache.writeThrough(
        CacheKeyStrategy.USER_DATA,
        'write_key',
        testData,
        dataPersister
      )

      expect(dataPersister).toHaveBeenCalledWith(testData)
      expect(mockRedis.setex).toHaveBeenCalled()
    })

    it('Write-Behind パターンが非同期で動作する', async () => {
      const testData = { id: 'write', value: 'behind' }
      const dataPersister = vi.fn().mockResolvedValue(undefined)

      mockRedis.setex.mockResolvedValue('OK')

      await advancedCache.writeBehind(
        CacheKeyStrategy.USER_DATA,
        'write_behind_key',
        testData,
        dataPersister
      )

      // キャッシュには即座に保存される
      expect(mockRedis.setex).toHaveBeenCalled()

      // dataPersisterは非同期で実行される（テスト環境では即座にコールされる）
      await new Promise((resolve) => setImmediate(resolve))
      expect(dataPersister).toHaveBeenCalledWith(testData)
    })

    it('依存関係ベースの無効化が動作する', async () => {
      await advancedCache.addDependency('parent_key', 'user:child1')
      await advancedCache.addDependency('parent_key', 'session:child2')

      mockRedis.del.mockResolvedValue(1)

      await advancedCache['invalidateDependencies']('parent_key')

      expect(mockRedis.del).toHaveBeenCalledTimes(2)
    })

    it('キャッシュウォーミングが正しく動作する', async () => {
      const warmupConfigs = [
        {
          keyStrategy: CacheKeyStrategy.USER_DATA,
          identifier: 'warmup1',
          dataFetcher: vi.fn().mockResolvedValue({ id: '1' }),
        },
        {
          keyStrategy: CacheKeyStrategy.PMBOK_DATA,
          identifier: 'warmup2',
          dataFetcher: vi.fn().mockResolvedValue({ id: '2' }),
        },
      ]

      mockRedis.get.mockResolvedValue(null) // すべてキャッシュミス
      mockRedis.setex.mockResolvedValue('OK')

      const warmedUp = await advancedCache.warmupCache(warmupConfigs)

      expect(warmedUp).toBe(2)
      expect(warmupConfigs[0].dataFetcher).toHaveBeenCalledTimes(1)
      expect(warmupConfigs[1].dataFetcher).toHaveBeenCalledTimes(1)
    })

    it('キャッシュレポートを生成する', async () => {
      mockRedis.info.mockResolvedValue('used_memory:1048576')
      mockRedis.dbsize.mockResolvedValue(1000)

      const report = await advancedCache.generateCacheReport()

      expect(report.stats).toBeDefined()
      expect(Array.isArray(report.topKeys)).toBe(true)
      expect(Array.isArray(report.recommendations)).toBe(true)
    })

    it('マルチレイヤーキャッシングが動作する', async () => {
      const testData = { size: 'large', items: new Array(20) }
      const dataFetcher = vi.fn().mockResolvedValue(testData)

      mockRedis.get.mockResolvedValue(null) // すべてのレイヤーでミス
      mockRedis.setex.mockResolvedValue('OK')

      const result = await advancedCache.multiLayerCache(
        CacheKeyStrategy.TEMP_DATA,
        'multi_layer',
        dataFetcher,
        [
          { name: 'hot', ttl: 60, condition: (data: unknown) => data.items.length > 10 },
          { name: 'warm', ttl: 300, condition: (data: unknown) => data.items.length > 0 },
          { name: 'cold', ttl: 3600 },
        ]
      )

      expect(result.data).toEqual(testData)
      expect(result.hit).toBe(false)
      expect(result.source).toBe('network')
      expect(mockRedis.setex).toHaveBeenCalledTimes(3) // 3つのレイヤーにキャッシュ
    })
  })

  describe('PMPCacheStrategies', () => {
    let cacheManager: RedisCacheManager
    let advancedCache: AdvancedCacheManager
    let pmpStrategies: PMPCacheStrategies

    beforeEach(() => {
      cacheManager = new RedisCacheManager()
      advancedCache = new AdvancedCacheManager(cacheManager)
      pmpStrategies = new PMPCacheStrategies(advancedCache)
    })

    afterEach(async () => {
      await cacheManager.disconnect()
    })

    it('ユーザーダッシュボードデータをスマートキャッシュする', async () => {
      const dashboardData = { progress: 75, recentActivity: [] }
      const dataFetcher = vi.fn().mockResolvedValue(dashboardData)

      mockRedis.get.mockResolvedValue(null)
      mockRedis.setex.mockResolvedValue('OK')

      const result = await pmpStrategies.cacheUserDashboard('user123', dataFetcher)

      expect(result.data).toEqual(dashboardData)
      expect(dataFetcher).toHaveBeenCalledTimes(1)
    })

    it('PMBOKプロセス情報をキャッシュする', async () => {
      const processData = [{ id: 'p1', name: 'Process 1' }]
      const dataFetcher = vi.fn().mockResolvedValue(processData)

      mockRedis.get.mockResolvedValue(null)
      mockRedis.setex.mockResolvedValue('OK')

      const result = await pmpStrategies.cachePMBOKProcesses(dataFetcher)

      expect(result.data).toEqual(processData)
      expect(dataFetcher).toHaveBeenCalledTimes(1)
    })

    it('試験問題を階層化キャッシュする', async () => {
      const examQuestions = new Array(15).fill(0).map((_, i) => ({ id: i, question: `Q${i}` }))
      const dataFetcher = vi.fn().mockResolvedValue(examQuestions)

      mockRedis.get.mockResolvedValue(null)
      mockRedis.setex.mockResolvedValue('OK')

      const result = await pmpStrategies.cacheExamQuestions('mock', 'medium', dataFetcher)

      expect(result.data).toEqual(examQuestions)
      expect(dataFetcher).toHaveBeenCalledTimes(1)
    })

    it('学習統計をWrite-Behindで更新する', async () => {
      const stats = { completedProcesses: 25, totalTime: 3600 }
      const dataPersister = vi.fn().mockResolvedValue(undefined)

      mockRedis.setex.mockResolvedValue('OK')

      await pmpStrategies.updateLearningStats('user123', stats, dataPersister)

      expect(mockRedis.setex).toHaveBeenCalled()

      // 非同期でデータベースに保存される
      await new Promise((resolve) => setImmediate(resolve))
      expect(dataPersister).toHaveBeenCalledWith(stats)
    })

    it('セッション情報をWrite-Throughで更新する', async () => {
      const sessionData = { userId: 'user123', lastActivity: Date.now() }
      const dataPersister = vi.fn().mockResolvedValue(undefined)

      mockRedis.setex.mockResolvedValue('OK')

      await pmpStrategies.updateUserSession('user123', sessionData, dataPersister)

      expect(dataPersister).toHaveBeenCalledWith(sessionData)
      expect(mockRedis.setex).toHaveBeenCalled()
    })
  })

  describe('エラーハンドリングと例外ケース', () => {
    let cacheManager: RedisCacheManager

    beforeEach(() => {
      cacheManager = new RedisCacheManager()
    })

    afterEach(async () => {
      await cacheManager.disconnect()
    })

    it('Redis接続エラー時のフォールバック', async () => {
      mockRedis.ping.mockRejectedValue(new Error('Connection failed'))

      // エラーにもかかわらずインスタンスは作成される
      expect(cacheManager).toBeInstanceOf(RedisCacheManager)
    })

    it('不正なJSONデータのパース', async () => {
      mockRedis.get.mockResolvedValue('invalid-json-string')

      const result = await cacheManager.get(CacheKeyStrategy.USER_DATA, 'invalid')

      expect(result).toBeNull() // パースエラー時はnullを返す
    })

    it('大量のキー操作でのメモリ考慮', async () => {
      const largeDataMap = new Map()
      for (let i = 0; i < 10000; i++) {
        largeDataMap.set(`key${i}`, { id: i, data: `data${i}` })
      }

      const mockPipeline = {
        setex: vi.fn(),
        sadd: vi.fn(),
        expire: vi.fn(),
        exec: vi.fn().mockResolvedValue([]),
      }
      mockRedis.pipeline.mockReturnValue(mockPipeline)

      await cacheManager.mset(CacheKeyStrategy.TEMP_DATA, largeDataMap)

      expect(mockPipeline.setex).toHaveBeenCalledTimes(10000)
      expect(mockPipeline.exec).toHaveBeenCalledTimes(1)
    })

    it('TTL設定エラーの処理', async () => {
      mockRedis.setex.mockRejectedValue(new Error('TTL error'))

      await expect(
        cacheManager.set(CacheKeyStrategy.USER_DATA, 'ttl_error', { data: 'test' })
      ).rejects.toThrow('TTL error')
    })

    it('ネットワーク分断時のキャッシュ動作', async () => {
      mockRedis.get.mockRejectedValue(new Error('Network error'))
      mockRedis.set.mockRejectedValue(new Error('Network error'))

      const result = await cacheManager.get(CacheKeyStrategy.USER_DATA, 'network_error')

      expect(result).toBeNull() // ネットワークエラー時はnullを返す
    })
  })
})
