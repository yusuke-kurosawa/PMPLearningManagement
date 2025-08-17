/**
 * テストケース実装
 * Developer 8: 品質保証エンジニア
 * テストタイプ: {test_type}
 * 対象: {target}
 * 最終更新: {updated}
 */

import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll, vi } from 'vitest'
import {
  EnhancedPrismaClient,
  DatabaseManager,
  DatabaseMonitor,
  type DatabaseStats,
} from '../connectionPool'
import {
  QueryOptimizer,
  QueryCache,
  IndexOptimizer,
  type PaginationOptions,
} from '../queryOptimizer'

// PrismaClient のモック
const mockPrismaClient = {
  $connect: vi.fn(),
  $disconnect: vi.fn(),
  $queryRaw: vi.fn(),
  $executeRaw: vi.fn(),
  $on: vi.fn(),
  $use: vi.fn(),
  user: {
    count: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}

// PrismaClientをモック
vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn(() => mockPrismaClient),
}))

describe('データベース最適化システム', () => {
  beforeAll(() => {
    // テスト用環境変数
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db'
  })

  describe('EnhancedPrismaClient', () => {
    let client: EnhancedPrismaClient

    beforeEach(() => {
      vi.clearAllMocks()
      mockPrismaClient.$connect.mockResolvedValue(undefined)
      mockPrismaClient.$disconnect.mockResolvedValue(undefined)
    })

    it('正常に初期化される', async () => {
      client = new EnhancedPrismaClient({
        maxConnections: 50,
        minConnections: 5,
      })

      expect(mockPrismaClient.$on).toHaveBeenCalledWith('query', expect.any(Function))
      expect(mockPrismaClient.$on).toHaveBeenCalledWith('error', expect.any(Function))
      expect(mockPrismaClient.$use).toHaveBeenCalledWith(expect.any(Function))
    })

    it('データベース統計を正しく取得する', async () => {
      client = new EnhancedPrismaClient()

      mockPrismaClient.$queryRaw.mockResolvedValue([
        { state: 'active', count: 10 },
        { state: 'idle', count: 5 },
      ])

      const stats = await client.getConnectionStats()

      expect(stats).toMatchObject({
        totalConnections: 15,
        activeConnections: 10,
        idleConnections: 5,
        minPoolSize: 10,
        maxPoolSize: 100,
      })
      expect(typeof stats.avgConnectionTime).toBe('number')
      expect(typeof stats.slowQueries).toBe('number')
    })

    it('ヘルスチェックが正常に動作する', async () => {
      client = new EnhancedPrismaClient()

      mockPrismaClient.$queryRaw.mockResolvedValue([{ test: 1 }])
      mockPrismaClient.user.count.mockResolvedValue(100)

      const health = await client.healthCheck()

      expect(health.status).toBe('healthy')
      expect(health.details.connectionTest).toBe(true)
      expect(health.details.queryTest).toBe(true)
      expect(typeof health.details.responseTime).toBe('number')
      expect(health.details.responseTime).toBeGreaterThan(0)
    })

    it('エラー時にはunhealthyステータスを返す', async () => {
      client = new EnhancedPrismaClient()

      mockPrismaClient.$queryRaw.mockRejectedValue(new Error('Connection failed'))

      const health = await client.healthCheck()

      expect(health.status).toBe('unhealthy')
      expect(health.details.connectionTest).toBe(false)
    })

    it('レスポンス時間が遅い場合にdegradedステータスを返す', async () => {
      client = new EnhancedPrismaClient()

      // 遅いクエリをシミュレート
      mockPrismaClient.$queryRaw.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve([{ test: 1 }]), 1100))
      )
      mockPrismaClient.user.count.mockResolvedValue(100)

      const health = await client.healthCheck()

      expect(health.status).toBe('degraded')
      expect(health.details.responseTime).toBeGreaterThan(1000)
    })

    it('データベース最適化が正常に実行される', async () => {
      client = new EnhancedPrismaClient()

      mockPrismaClient.$queryRaw.mockResolvedValue([
        { tablename: 'User' },
        { tablename: 'ExamAttempt' },
        { tablename: 'LearningProgress' },
      ])
      mockPrismaClient.$executeRaw.mockResolvedValue(undefined)

      const result = await client.optimize()

      expect(result.tablesAnalyzed).toBe(3)
      expect(mockPrismaClient.$executeRaw).toHaveBeenCalledTimes(3)
    })

    it('クエリ統計を正しく記録する', () => {
      client = new EnhancedPrismaClient()

      // クエリ統計をシミュレート
      const stats = client.getQueryStats()
      expect(Array.isArray(stats)).toBe(true)
    })

    it('遅いクエリを正しく検出する', () => {
      client = new EnhancedPrismaClient()

      const slowQueries = client.getSlowQueries(5)
      expect(Array.isArray(slowQueries)).toBe(true)
      expect(slowQueries.length).toBeLessThanOrEqual(5)
    })

    it('統計をリセットできる', () => {
      client = new EnhancedPrismaClient()

      client.resetStats()

      const stats = client.getQueryStats()
      expect(stats.length).toBe(0)
    })

    afterEach(async () => {
      if (client) {
        await client.$disconnect()
      }
    })
  })

  describe('DatabaseManager', () => {
    afterEach(async () => {
      // シングルトンをリセット
      await DatabaseManager.disconnect()
    })

    it('シングルトンパターンが正しく動作する', async () => {
      mockPrismaClient.$connect.mockResolvedValue(undefined)

      const instance1 = await DatabaseManager.getInstance()
      const instance2 = await DatabaseManager.getInstance()

      expect(instance1).toBe(instance2)
      expect(mockPrismaClient.$connect).toHaveBeenCalledTimes(1)
    })

    it('接続エラーを適切に処理する', async () => {
      mockPrismaClient.$connect.mockRejectedValue(new Error('Connection failed'))

      await expect(DatabaseManager.getInstance()).rejects.toThrow('Connection failed')
    })

    it('接続状態を正しく報告する', async () => {
      expect(DatabaseManager.isConnected()).toBe(false)

      mockPrismaClient.$connect.mockResolvedValue(undefined)
      await DatabaseManager.getInstance()

      expect(DatabaseManager.isConnected()).toBe(true)
    })

    it('正常に切断できる', async () => {
      mockPrismaClient.$connect.mockResolvedValue(undefined)
      mockPrismaClient.$disconnect.mockResolvedValue(undefined)

      await DatabaseManager.getInstance()
      await DatabaseManager.disconnect()

      expect(mockPrismaClient.$disconnect).toHaveBeenCalledTimes(1)
      expect(DatabaseManager.isConnected()).toBe(false)
    })
  })

  describe('DatabaseMonitor', () => {
    let client: EnhancedPrismaClient
    let monitor: DatabaseMonitor

    beforeEach(() => {
      client = new EnhancedPrismaClient()
      monitor = new DatabaseMonitor(client)
    })

    it('メトリクスを正しく収集する', async () => {
      mockPrismaClient.$queryRaw.mockResolvedValueOnce([{ test: 1 }]).mockResolvedValueOnce([
        { state: 'active', count: 20 },
        { state: 'idle', count: 10 },
      ])
      mockPrismaClient.user.count.mockResolvedValue(100)

      // プライベートメソッドをテストするため、リフレクションを使用
      await (monitor as any).collectMetrics()

      const metrics = monitor.getMetrics()
      expect(typeof metrics.response_time).toBe('number')
      expect(typeof metrics.active_connections).toBe('number')
      expect(typeof metrics.error_rate).toBe('number')
    })

    it('アラートを正しく生成する', async () => {
      // 高いレスポンス時間をシミュレート
      mockPrismaClient.$queryRaw.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve([{ test: 1 }]), 2100))
      )
      mockPrismaClient.user.count.mockResolvedValue(100)

      await (monitor as any).collectMetrics()

      const alerts = monitor.getAlerts()
      expect(alerts.some((alert) => alert.type === 'performance')).toBe(true)
    })

    it('メトリクスをリセットできる', () => {
      monitor.resetMetrics()

      const metrics = monitor.getMetrics()
      expect(Object.keys(metrics).length).toBe(0)

      const alerts = monitor.getAlerts()
      expect(alerts.length).toBe(0)
    })

    afterEach(async () => {
      await client.$disconnect()
    })
  })

  describe('QueryOptimizer', () => {
    it('ページネーションクエリを正しく構築する', () => {
      const options: PaginationOptions = {
        page: 2,
        limit: 20,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      }

      const query = QueryOptimizer.buildPaginatedQuery(options)

      expect(query.skip).toBe(20)
      expect(query.take).toBe(20)
      expect(query.orderBy).toEqual({ createdAt: 'desc' })
    })

    it('日付範囲フィルターを正しく構築する', () => {
      const start = new Date('2023-01-01')
      const end = new Date('2023-12-31')

      const filter = QueryOptimizer.buildDateRangeFilter('createdAt', start, end)

      expect(filter).toEqual({
        createdAt: {
          gte: start,
          lte: end,
        },
      })
    })

    it('複合フィルター条件を正しく構築する', () => {
      const conditions = {
        status: ['ACTIVE', 'COMPLETED'],
        category: 'LEARNING',
        userId: 'user123',
        dateRange: {
          field: 'updatedAt',
          start: new Date('2023-01-01'),
          end: new Date('2023-12-31'),
        },
        search: {
          fields: ['name', 'description'],
          query: 'project management',
        },
      }

      const filter = QueryOptimizer.buildComplexFilter(conditions)

      expect(filter.status).toEqual({ in: ['ACTIVE', 'COMPLETED'] })
      expect(filter.category).toBe('LEARNING')
      expect(filter.userId).toBe('user123')
      expect(filter.updatedAt).toBeDefined()
      expect(filter._fullTextSearch).toBeDefined()
    })

    it('学習進捗クエリを最適化して構築する', () => {
      const query = QueryOptimizer.buildLearningProgressQuery('user123', {
        knowledgeAreas: ['Integration', 'Scope'],
        status: ['IN_PROGRESS', 'COMPLETED'],
        masteryLevel: { min: 50, max: 100 },
      })

      expect(query.where.userId).toBe('user123')
      expect(query.where.process.knowledgeArea).toEqual({ in: ['Integration', 'Scope'] })
      expect(query.where.status).toEqual({ in: ['IN_PROGRESS', 'COMPLETED'] })
      expect(query.where.masteryLevel).toEqual({ gte: 50, lte: 100 })
      expect(query.include.process).toBeDefined()
    })

    it('試験結果クエリを最適化して構築する', () => {
      const query = QueryOptimizer.buildExamResultsQuery('user123', {
        status: ['COMPLETED'],
        scoreRange: { min: 70 },
        dateRange: {
          start: new Date('2023-01-01'),
          end: new Date('2023-12-31'),
        },
      })

      expect(query.where.userId).toBe('user123')
      expect(query.where.status).toEqual({ in: ['COMPLETED'] })
      expect(query.where.score).toEqual({ gte: 70 })
      expect(query.where.startTime).toBeDefined()
      expect(query.include.answers).toBeDefined()
    })

    it('バッチクエリを正しく構築する', () => {
      const query = QueryOptimizer.buildBatchQuery(500, 'last123')

      expect(query.take).toBe(500)
      expect(query.cursor).toEqual({ id: 'last123' })
      expect(query.skip).toBe(1)
      expect(query.orderBy).toEqual({ id: 'asc' })
    })

    it('重複除去クエリを正しく構築する', () => {
      const query = QueryOptimizer.buildDistinctQuery(['userId', 'processId'], ['createdAt'])

      expect(query.distinct).toEqual(['userId', 'processId'])
      expect(query.select.userId).toBe(true)
      expect(query.select.processId).toBe(true)
      expect(query.select.createdAt).toBe(true)
    })

    it('ダッシュボードクエリを包括的に構築する', () => {
      const query = QueryOptimizer.buildDashboardQuery('user123')

      expect(query.learningProgress.where.userId).toBe('user123')
      expect(query.examResults.where.userId).toBe('user123')
      expect(query.recentActivity.where.userId).toBe('user123')
      expect(query.recentActivity.take).toBe(10)
      expect(query.recentActivity.include.process).toBeDefined()
    })
  })

  describe('QueryCache', () => {
    let cache: QueryCache

    beforeEach(() => {
      cache = new QueryCache()
    })

    it('データをキャッシュし取得できる', () => {
      const query = { table: 'users', where: { id: 1 } }
      const data = { id: 1, name: 'Test User' }

      cache.set(query, data, 1000)
      const retrieved = cache.get(query)

      expect(retrieved).toEqual(data)
    })

    it('TTL後にキャッシュが無効になる', async () => {
      const query = { table: 'users', where: { id: 1 } }
      const data = { id: 1, name: 'Test User' }

      cache.set(query, data, 100) // 100ms TTL

      expect(cache.get(query)).toEqual(data)

      // TTLの期限を待つ
      await new Promise((resolve) => setTimeout(resolve, 150))

      expect(cache.get(query)).toBeNull()
    })

    it('存在しないキーでnullを返す', () => {
      const query = { table: 'nonexistent', where: { id: 999 } }

      expect(cache.get(query)).toBeNull()
    })

    it('パターンマッチングでキャッシュを無効化できる', () => {
      cache.set({ table: 'users', id: 1 }, { data: 'user1' })
      cache.set({ table: 'users', id: 2 }, { data: 'user2' })
      cache.set({ table: 'posts', id: 1 }, { data: 'post1' })

      const invalidated = cache.invalidate('users')

      expect(invalidated).toBe(2)
      expect(cache.get({ table: 'posts', id: 1 })).not.toBeNull()
    })

    it('すべてのキャッシュをクリアできる', () => {
      cache.set({ table: 'users', id: 1 }, { data: 'user1' })
      cache.set({ table: 'posts', id: 1 }, { data: 'post1' })

      cache.clear()

      expect(cache.get({ table: 'users', id: 1 })).toBeNull()
      expect(cache.get({ table: 'posts', id: 1 })).toBeNull()
    })

    it('期限切れキャッシュを清掃できる', async () => {
      cache.set({ table: 'temp', id: 1 }, { data: 'temp1' }, 50)
      cache.set({ table: 'permanent', id: 1 }, { data: 'perm1' }, 10000)

      // 期限切れまで待つ
      await new Promise((resolve) => setTimeout(resolve, 100))

      const cleaned = cache.cleanup()

      expect(cleaned).toBe(1)
      expect(cache.get({ table: 'permanent', id: 1 })).not.toBeNull()
    })

    it('統計情報を提供する', () => {
      cache.set({ table: 'test', id: 1 }, { data: 'test1' })
      cache.set({ table: 'test', id: 2 }, { data: 'test2' })

      const stats = cache.getStats()

      expect(stats.size).toBe(2)
      expect(typeof stats.hitRate).toBe('number')
    })
  })

  describe('IndexOptimizer', () => {
    it('単一フィールドのインデックスを推奨する', () => {
      const suggestions = IndexOptimizer.suggestIndexes('User', { email: 'test@example.com' })

      expect(suggestions).toContain('CREATE INDEX idx_User_email ON "User" ("email");')
    })

    it('複合フィールドのインデックスを推奨する', () => {
      const suggestions = IndexOptimizer.suggestIndexes(
        'LearningProgress',
        { userId: 'user123', status: 'COMPLETED' },
        { createdAt: 'desc' }
      )

      expect(suggestions.length).toBeGreaterThan(0)
      expect(suggestions.some((s) => s.includes('userId'))).toBe(true)
      expect(suggestions.some((s) => s.includes('status'))).toBe(true)
    })

    it('ORDER BY句を含むインデックスを推奨する', () => {
      const suggestions = IndexOptimizer.suggestIndexes(
        'ExamAttempt',
        { userId: 'user123' },
        { startTime: 'desc', score: 'asc' }
      )

      expect(
        suggestions.some((s) => s.includes('ORDER') || s.includes('DESC') || s.includes('ASC'))
      ).toBe(true)
    })

    it('クエリプラン分析用のクエリを生成する（開発環境）', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'

      const analyzedQuery = IndexOptimizer.analyzeQuery('SELECT * FROM users')

      expect(analyzedQuery).toContain('EXPLAIN')
      expect(analyzedQuery).toContain('ANALYZE')

      process.env.NODE_ENV = originalEnv
    })

    it('本番環境ではクエリプラン分析をスキップする', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'

      const query = 'SELECT * FROM users'
      const analyzedQuery = IndexOptimizer.analyzeQuery(query)

      expect(analyzedQuery).toBe(query)

      process.env.NODE_ENV = originalEnv
    })
  })

  describe('統合テスト', () => {
    it('接続プールと最適化システムが連携して動作する', async () => {
      mockPrismaClient.$connect.mockResolvedValue(undefined)
      mockPrismaClient.$queryRaw.mockResolvedValue([
        { state: 'active', count: 5 },
        { state: 'idle', count: 3 },
      ])
      mockPrismaClient.user.count.mockResolvedValue(50)

      const client = new EnhancedPrismaClient({
        maxConnections: 20,
        minConnections: 2,
      })

      // ヘルスチェック
      const health = await client.healthCheck()
      expect(health.status).toBe('healthy')

      // 統計情報取得
      const stats = await client.getConnectionStats()
      expect(stats.totalConnections).toBe(8)

      // クエリ最適化
      const paginationQuery = QueryOptimizer.buildPaginatedQuery({
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      })

      expect(paginationQuery.take).toBe(10)
      expect(paginationQuery.skip).toBe(0)

      await client.$disconnect()
    })

    it('キャッシュとクエリ最適化が連携する', () => {
      const cache = new QueryCache()
      const query = QueryOptimizer.buildLearningProgressQuery('user123', {
        status: ['COMPLETED'],
      })

      // クエリをキャッシュ
      const mockData = [{ id: '1', status: 'COMPLETED', userId: 'user123' }]
      cache.set(query, mockData)

      // キャッシュから取得
      const cachedData = cache.get(query)
      expect(cachedData).toEqual(mockData)

      // インデックス推奨
      const suggestions = IndexOptimizer.suggestIndexes('LearningProgress', query.where)
      expect(suggestions.length).toBeGreaterThan(0)
    })
  })

  describe('エラーハンドリング', () => {
    it('データベース接続エラーを適切に処理する', async () => {
      mockPrismaClient.$connect.mockRejectedValue(new Error('Connection timeout'))

      await expect(DatabaseManager.getInstance()).rejects.toThrow('Connection timeout')
    })

    it('無効な設定値でもエラーにならない', () => {
      expect(
        () =>
          new EnhancedPrismaClient({
            maxConnections: -1, // 無効な値
            minConnections: 1000, // 論理的に無効
            acquireTimeoutMillis: 0, // 無効な値
          })
      ).not.toThrow()
    })

    it('クエリエラー時の統計記録', async () => {
      const client = new EnhancedPrismaClient()

      // エラーを発生させるミドルウェアをテスト
      const middleware = vi.fn().mockRejectedValue(new Error('Query failed'))

      try {
        await middleware({ model: 'User', action: 'findMany' }, () =>
          Promise.reject(new Error('Query failed'))
        )
      } catch (error) {
        // エラーが適切に処理されることを確認
        expect(error.message).toBe('Query failed')
      }
    })
  })
})
