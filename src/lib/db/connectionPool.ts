/**
 * 高性能データベース接続プール管理
 * Developer 4: データベース最適化・インデックス・接続プール設定
 */

import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { logger } from '../../services/logger'

// 接続プール設定スキーマ
const ConnectionPoolConfigSchema = z.object({
  maxConnections: z.number().int().positive().default(100),
  minConnections: z.number().int().min(0).default(10),
  acquireTimeoutMillis: z.number().int().positive().default(60000),
  idleTimeoutMillis: z.number().int().positive().default(600000),
  reapIntervalMillis: z.number().int().positive().default(1000),
  createRetryIntervalMillis: z.number().int().positive().default(200),
  createTimeoutMillis: z.number().int().positive().default(30000),
  destroyTimeoutMillis: z.number().int().positive().default(5000),
  propagateCreateError: z.boolean().default(true),
})

export type ConnectionPoolConfig = z.infer<typeof ConnectionPoolConfigSchema>

// データベース統計
export interface DatabaseStats {
  totalConnections: number
  activeConnections: number
  idleConnections: number
  pendingConnections: number
  acquiredCount: number
  createdCount: number
  failedCount: number
  timedOutCount: number
  destroyedCount: number
  minPoolSize: number
  maxPoolSize: number
  avgConnectionTime: number
  slowQueries: number
}

// クエリ統計
export interface QueryStats {
  queryType: string
  count: number
  totalDuration: number
  avgDuration: number
  minDuration: number
  maxDuration: number
  lastExecuted: Date
}

/**
 * 拡張PrismaClient（接続プール管理機能付き）
 */
export class EnhancedPrismaClient extends PrismaClient {
  private connectionStats: Map<string, number> = new Map()
  private queryStats: Map<string, QueryStats> = new Map()
  private startTime: Date = new Date()
  private slowQueryThreshold: number = 1000 // 1秒

  constructor(config?: ConnectionPoolConfig) {
    const _validatedConfig = ConnectionPoolConfigSchema.parse(config || {})

    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
      log: [
        {
          emit: 'event',
          level: 'query',
        },
        {
          emit: 'event',
          level: 'error',
        },
        {
          emit: 'event',
          level: 'info',
        },
        {
          emit: 'event',
          level: 'warn',
        },
      ],
    })

    this.setupEventListeners()
    this.setupMiddleware()
  }

  /**
   * イベントリスナーの設定
   */
  private setupEventListeners(): void {
    // クエリイベント
    this.$on('query', (e) => {
      this.recordQueryStats(e.query, e.duration)

      if (e.duration > this.slowQueryThreshold) {
        if (process.env.NODE_ENV === 'development') {
          logger.warn(`Slow query detected (${e.duration}ms):`, {
            query: e.query.substring(0, 200),
            duration: e.duration,
            params: e.params,
          })
        }
      }
    })

    // エラーイベント
    this.$on('error', (e) => {
      if (process.env.NODE_ENV === 'development') {
        logger.error('Database error:', e)
      }
    })

    // 情報イベント
    this.$on('info', (e) => {
      if (process.env.NODE_ENV === 'development') {
        logger.info('Database info:', e.message)
      }
    })

    // 警告イベント
    this.$on('warn', (e) => {
      if (process.env.NODE_ENV === 'development') {
        logger.warn('Database warning:', e.message)
      }
    })
  }

  /**
   * ミドルウェアの設定
   */
  private setupMiddleware(): void {
    // 接続統計記録
    this.$use(async (params, next) => {
      const start = Date.now()

      try {
        const result = await next(params)
        this.incrementStat('successful_queries')
        return result
      } catch (error) {
        this.incrementStat('failed_queries')
        throw error
      } finally {
        const duration = Date.now() - start
        this.recordQueryStats(params.model || 'unknown', duration)
      }
    })

    // トランザクション統計
    this.$use(async (params, next) => {
      if (params.action === 'transaction') {
        this.incrementStat('transactions')
      }
      return next(params)
    })
  }

  /**
   * 統計値を記録
   */
  private incrementStat(key: string): void {
    const current = this.connectionStats.get(key) || 0
    this.connectionStats.set(key, current + 1)
  }

  /**
   * クエリ統計を記録
   */
  private recordQueryStats(query: string, duration: number): void {
    const queryType = this.extractQueryType(query)
    const existing = this.queryStats.get(queryType) || {
      queryType,
      count: 0,
      totalDuration: 0,
      avgDuration: 0,
      minDuration: Infinity,
      maxDuration: 0,
      lastExecuted: new Date(),
    }

    existing.count++
    existing.totalDuration += duration
    existing.avgDuration = existing.totalDuration / existing.count
    existing.minDuration = Math.min(existing.minDuration, duration)
    existing.maxDuration = Math.max(existing.maxDuration, duration)
    existing.lastExecuted = new Date()

    this.queryStats.set(queryType, existing)
  }

  /**
   * クエリタイプの抽出
   */
  private extractQueryType(query: string): string {
    const normalized = query.trim().toLowerCase()
    if (normalized.startsWith('select')) {
      return 'SELECT'
    }
    if (normalized.startsWith('insert')) {
      return 'INSERT'
    }
    if (normalized.startsWith('update')) {
      return 'UPDATE'
    }
    if (normalized.startsWith('delete')) {
      return 'DELETE'
    }
    if (normalized.startsWith('begin')) {
      return 'TRANSACTION'
    }
    if (normalized.startsWith('commit')) {
      return 'COMMIT'
    }
    if (normalized.startsWith('rollback')) {
      return 'ROLLBACK'
    }
    return 'OTHER'
  }

  /**
   * データベース統計の取得
   */
  async getConnectionStats(): Promise<DatabaseStats> {
    try {
      const poolInfo = await this.$queryRaw<
        Array<{
          state: string
          count: number
        }>
      >`
        SELECT state, COUNT(*) as count
        FROM pg_stat_activity 
        WHERE datname = current_database()
        GROUP BY state
      `

      const activeConnections = poolInfo.find((p) => p.state === 'active')?.count || 0
      const idleConnections = poolInfo.find((p) => p.state === 'idle')?.count || 0
      const totalConnections = activeConnections + idleConnections

      return {
        totalConnections,
        activeConnections,
        idleConnections,
        pendingConnections: 0, // Prisma doesn't expose this directly
        acquiredCount: this.connectionStats.get('successful_queries') || 0,
        createdCount: totalConnections,
        failedCount: this.connectionStats.get('failed_queries') || 0,
        timedOutCount: 0, // Would need custom tracking
        destroyedCount: 0, // Would need custom tracking
        minPoolSize: 10, // From config
        maxPoolSize: 100, // From config
        avgConnectionTime: this.calculateAvgConnectionTime(),
        slowQueries: Array.from(this.queryStats.values()).reduce(
          (sum, stat) => sum + (stat.avgDuration > this.slowQueryThreshold ? stat.count : 0),
          0
        ),
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('Failed to get connection stats:', error)
      }
      return {
        totalConnections: 0,
        activeConnections: 0,
        idleConnections: 0,
        pendingConnections: 0,
        acquiredCount: 0,
        createdCount: 0,
        failedCount: 0,
        timedOutCount: 0,
        destroyedCount: 0,
        minPoolSize: 10,
        maxPoolSize: 100,
        avgConnectionTime: 0,
        slowQueries: 0,
      }
    }
  }

  /**
   * クエリ統計の取得
   */
  getQueryStats(): QueryStats[] {
    return Array.from(this.queryStats.values()).sort((a, b) => b.count - a.count)
  }

  /**
   * 平均接続時間の計算
   */
  private calculateAvgConnectionTime(): number {
    const stats = Array.from(this.queryStats.values())
    if (stats.length === 0) {
      return 0
    }

    const totalDuration = stats.reduce((sum, stat) => sum + stat.totalDuration, 0)
    const totalCount = stats.reduce((sum, stat) => sum + stat.count, 0)

    return totalCount > 0 ? totalDuration / totalCount : 0
  }

  /**
   * 遅いクエリの取得
   */
  getSlowQueries(limit: number = 10): QueryStats[] {
    return Array.from(this.queryStats.values())
      .filter((stat) => stat.avgDuration > this.slowQueryThreshold)
      .sort((a, b) => b.avgDuration - a.avgDuration)
      .slice(0, limit)
  }

  /**
   * 統計のリセット
   */
  resetStats(): void {
    this.connectionStats.clear()
    this.queryStats.clear()
    this.startTime = new Date()
  }

  /**
   * ヘルスチェック
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy'
    details: {
      connectionTest: boolean
      queryTest: boolean
      responseTime: number
      activeConnections: number
      errorRate: number
    }
  }> {
    const start = Date.now()

    try {
      // 接続テスト
      await this.$queryRaw`SELECT 1 as test`
      const connectionTest = true

      // 簡単なクエリテスト
      const userCount = await this.user.count()
      const queryTest = typeof userCount === 'number'

      const responseTime = Date.now() - start
      const stats = await this.getConnectionStats()

      const totalQueries =
        this.connectionStats.get('successful_queries') ||
        0 + this.connectionStats.get('failed_queries') ||
        0
      const failedQueries = this.connectionStats.get('failed_queries') || 0
      const errorRate = totalQueries > 0 ? failedQueries / totalQueries : 0

      let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'

      if (responseTime > 1000 || errorRate > 0.05) {
        status = 'degraded'
      }
      if (responseTime > 5000 || errorRate > 0.1 || !connectionTest || !queryTest) {
        status = 'unhealthy'
      }

      return {
        status,
        details: {
          connectionTest,
          queryTest,
          responseTime,
          activeConnections: stats.activeConnections,
          errorRate: Math.round(errorRate * 100) / 100,
        },
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('Health check failed:', error)
      }
      return {
        status: 'unhealthy',
        details: {
          connectionTest: false,
          queryTest: false,
          responseTime: Date.now() - start,
          activeConnections: 0,
          errorRate: 1.0,
        },
      }
    }
  }

  /**
   * データベース最適化の実行
   */
  async optimize(): Promise<{
    tablesAnalyzed: number
    indexesRebuilt: number
    vacuumCleaned: number
  }> {
    let tablesAnalyzed = 0
    const indexesRebuilt = 0
    let vacuumCleaned = 0

    try {
      // 統計情報の更新
      const tables = await this.$queryRaw<Array<{ tablename: string }>>`
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
      `

      for (const table of tables) {
        try {
          await this.$executeRaw`ANALYZE ${table.tablename}`
          tablesAnalyzed++
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            logger.warn(`Failed to analyze table ${table.tablename}:`, error)
          }
        }
      }

      // 必要に応じてVACUUM実行（本番環境では慎重に）
      if (process.env.NODE_ENV === 'development') {
        for (const table of tables) {
          try {
            await this.$executeRaw`VACUUM ANALYZE ${table.tablename}`
            vacuumCleaned++
          } catch (error) {
            if (process.env.NODE_ENV === 'development') {
              logger.warn(`Failed to vacuum table ${table.tablename}:`, error)
            }
          }
        }
      }

      if (process.env.NODE_ENV === 'development') {
        logger.debug(
          `Database optimization completed: ${tablesAnalyzed} tables analyzed, ${vacuumCleaned} tables vacuumed`
        )
      }

      return { tablesAnalyzed, indexesRebuilt, vacuumCleaned }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('Database optimization failed:', error)
      }
      return { tablesAnalyzed, indexesRebuilt, vacuumCleaned }
    }
  }
}

/**
 * データベースマネージャー（シングルトン）
 */
class DatabaseManager {
  private static instance: EnhancedPrismaClient | null = null
  private static connecting = false

  static async getInstance(config?: ConnectionPoolConfig): Promise<EnhancedPrismaClient> {
    if (!DatabaseManager.instance && !DatabaseManager.connecting) {
      DatabaseManager.connecting = true

      try {
        DatabaseManager.instance = new EnhancedPrismaClient(config)
        await DatabaseManager.instance.$connect()
        if (process.env.NODE_ENV === 'development') {
          logger.debug('Database connection pool initialized')
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          logger.error('Database connection failed:', error)
        }
        DatabaseManager.instance = null
        throw error
      } finally {
        DatabaseManager.connecting = false
      }
    }

    // 接続中の場合は待機
    while (DatabaseManager.connecting) {
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    if (!DatabaseManager.instance) {
      throw new Error('Database client not initialized')
    }

    return DatabaseManager.instance
  }

  static async disconnect(): Promise<void> {
    if (DatabaseManager.instance) {
      await DatabaseManager.instance.$disconnect()
      DatabaseManager.instance = null
      if (process.env.NODE_ENV === 'development') {
        logger.debug('Database connection pool disconnected')
      }
    }
  }

  static isConnected(): boolean {
    return DatabaseManager.instance !== null
  }
}

/**
 * データベース監視とメトリクス
 */
export class DatabaseMonitor {
  private db: EnhancedPrismaClient
  private metrics: Map<string, number> = new Map()
  private alerts: Array<{ type: string; message: string; timestamp: Date }> = []

  constructor(db: EnhancedPrismaClient) {
    this.db = db
  }

  /**
   * 継続的な監視の開始
   */
  startMonitoring(intervalMs: number = 60000): void {
    setInterval(async () => {
      await this.collectMetrics()
      this.checkAlerts()
    }, intervalMs)

    if (process.env.NODE_ENV === 'development') {
      logger.debug(`Database monitoring started (interval: ${intervalMs}ms)`)
    }
  }

  /**
   * メトリクスの収集
   */
  private async collectMetrics(): Promise<void> {
    try {
      const healthCheck = await this.db.healthCheck()
      const stats = await this.db.getConnectionStats()

      this.metrics.set('response_time', healthCheck.details.responseTime)
      this.metrics.set('active_connections', healthCheck.details.activeConnections)
      this.metrics.set('error_rate', healthCheck.details.errorRate)
      this.metrics.set('total_connections', stats.totalConnections)
      this.metrics.set('slow_queries', stats.slowQueries)
      this.metrics.set('successful_queries', stats.acquiredCount)
      this.metrics.set('failed_queries', stats.failedCount)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('Failed to collect database metrics:', error)
      }
    }
  }

  /**
   * アラートチェック
   */
  private checkAlerts(): void {
    const responseTime = this.metrics.get('response_time') || 0
    const errorRate = this.metrics.get('error_rate') || 0
    const activeConnections = this.metrics.get('active_connections') || 0

    // レスポンス時間アラート
    if (responseTime > 2000) {
      this.addAlert('performance', `High response time: ${responseTime}ms`)
    }

    // エラー率アラート
    if (errorRate > 0.05) {
      this.addAlert('error', `High error rate: ${Math.round(errorRate * 100)}%`)
    }

    // 接続数アラート
    if (activeConnections > 80) {
      this.addAlert('connection', `High connection usage: ${activeConnections}`)
    }
  }

  /**
   * アラートの追加
   */
  private addAlert(type: string, message: string): void {
    this.alerts.push({
      type,
      message,
      timestamp: new Date(),
    })

    // 古いアラートを削除（最新100件まで保持）
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100)
    }

    if (process.env.NODE_ENV === 'development') {
      logger.warn(`Database alert [${type}]: ${message}`)
    }
  }

  /**
   * メトリクスの取得
   */
  getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics)
  }

  /**
   * アラート履歴の取得
   */
  getAlerts(limit: number = 50): Array<{ type: string; message: string; timestamp: Date }> {
    return this.alerts.slice(-limit)
  }

  /**
   * メトリクスのリセット
   */
  resetMetrics(): void {
    this.metrics.clear()
    this.alerts = []
  }
}

// エクスポート用インスタンス
export const getDatabaseClient = DatabaseManager.getInstance
export const disconnectDatabase = DatabaseManager.disconnect
export const isDatabaseConnected = DatabaseManager.isConnected

export default {
  EnhancedPrismaClient,
  DatabaseManager,
  DatabaseMonitor,
  getDatabaseClient,
  disconnectDatabase,
  isDatabaseConnected,
}
