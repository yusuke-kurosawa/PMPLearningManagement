/**
 * 包括的メトリクス収集・監視システム
 * Developer 6: Prometheus監視・ヘルスチェック・パフォーマンス測定実装
 */

import { register, collectDefaultMetrics, Counter, Histogram, Gauge, Summary } from 'prom-client'
import { z } from 'zod'
import { logger } from '../../services/logger'

// メトリクス設定スキーマ
const MetricsConfigSchema = z.object({
  collectDefaultMetrics: z.boolean().default(true),
  prefix: z.string().default('pmp_learning_'),
  defaultLabels: z.record(z.string()).default({}),
  timeout: z.number().positive().default(10000),
})

export type MetricsConfig = z.infer<typeof MetricsConfigSchema>

// カスタムメトリクスの定義
export interface CustomMetrics {
  // HTTP関連メトリクス
  httpRequestDuration: Histogram<string>
  httpRequestsTotal: Counter<string>
  httpRequestSize: Histogram<string>
  httpResponseSize: Histogram<string>

  // アプリケーション関連メトリクス
  activeUsers: Gauge<string>
  userSessions: Gauge<string>
  learningProgress: Gauge<string>
  examAttempts: Counter<string>
  examScore: Histogram<string>

  // データベース関連メトリクス
  databaseConnections: Gauge<string>
  databaseQueryDuration: Histogram<string>
  databaseQueriesTotal: Counter<string>

  // キャッシュ関連メトリクス
  cacheHits: Counter<string>
  cacheMisses: Counter<string>
  cacheOperationDuration: Histogram<string>

  // システム関連メトリクス
  errorRate: Counter<string>
  backgroundJobs: Gauge<string>
  memoryUsage: Gauge<string>

  // ビジネスメトリクス
  userRegistrations: Counter<string>
  examCompletions: Counter<string>
  learningTimeTotal: Counter<string>
  pmbok_process_views: Counter<string>
}

/**
 * 高性能メトリクス収集マネージャー
 */
export class MetricsCollector {
  private config: MetricsConfig
  private metrics: CustomMetrics
  private startTime: number = Date.now()

  constructor(config?: Partial<MetricsConfig>) {
    this.config = MetricsConfigSchema.parse(config || {})

    // デフォルトメトリクスの収集開始
    if (this.config.collectDefaultMetrics) {
      collectDefaultMetrics({
        register,
        prefix: this.config.prefix,
        timeout: this.config.timeout,
      })
    }

    // デフォルトラベルを設定
    register.setDefaultLabels(this.config.defaultLabels)

    // カスタムメトリクスの初期化
    this.metrics = this.initializeMetrics()
  }

  /**
   * カスタムメトリクスの初期化
   */
  private initializeMetrics(): CustomMetrics {
    const prefix = this.config.prefix

    return {
      // HTTP関連メトリクス
      httpRequestDuration: new Histogram({
        name: `${prefix}http_request_duration_seconds`,
        help: 'Duration of HTTP requests in seconds',
        labelNames: ['method', 'route', 'status_code', 'user_type'],
        buckets: [0.001, 0.005, 0.015, 0.05, 0.1, 0.2, 0.3, 0.4, 0.5, 1.0, 5.0, 10.0],
      }),

      httpRequestsTotal: new Counter({
        name: `${prefix}http_requests_total`,
        help: 'Total number of HTTP requests',
        labelNames: ['method', 'route', 'status_code', 'user_type'],
      }),

      httpRequestSize: new Histogram({
        name: `${prefix}http_request_size_bytes`,
        help: 'Size of HTTP requests in bytes',
        labelNames: ['method', 'route'],
        buckets: [100, 1000, 5000, 10000, 50000, 100000, 500000, 1000000],
      }),

      httpResponseSize: new Histogram({
        name: `${prefix}http_response_size_bytes`,
        help: 'Size of HTTP responses in bytes',
        labelNames: ['method', 'route', 'status_code'],
        buckets: [100, 1000, 5000, 10000, 50000, 100000, 500000, 1000000],
      }),

      // アプリケーション関連メトリクス
      activeUsers: new Gauge({
        name: `${prefix}active_users`,
        help: 'Number of currently active users',
        labelNames: ['user_type'],
      }),

      userSessions: new Gauge({
        name: `${prefix}user_sessions_active`,
        help: 'Number of active user sessions',
        labelNames: ['session_type'],
      }),

      learningProgress: new Gauge({
        name: `${prefix}learning_progress_percent`,
        help: 'User learning progress percentage',
        labelNames: ['user_id', 'knowledge_area', 'process_group'],
      }),

      examAttempts: new Counter({
        name: `${prefix}exam_attempts_total`,
        help: 'Total number of exam attempts',
        labelNames: ['exam_type', 'user_type', 'difficulty'],
      }),

      examScore: new Histogram({
        name: `${prefix}exam_score`,
        help: 'Distribution of exam scores',
        labelNames: ['exam_type', 'difficulty'],
        buckets: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 100],
      }),

      // データベース関連メトリクス
      databaseConnections: new Gauge({
        name: `${prefix}database_connections_active`,
        help: 'Number of active database connections',
        labelNames: ['database', 'state'],
      }),

      databaseQueryDuration: new Histogram({
        name: `${prefix}database_query_duration_seconds`,
        help: 'Duration of database queries in seconds',
        labelNames: ['query_type', 'table', 'operation'],
        buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0],
      }),

      databaseQueriesTotal: new Counter({
        name: `${prefix}database_queries_total`,
        help: 'Total number of database queries',
        labelNames: ['query_type', 'table', 'operation', 'status'],
      }),

      // キャッシュ関連メトリクス
      cacheHits: new Counter({
        name: `${prefix}cache_hits_total`,
        help: 'Total number of cache hits',
        labelNames: ['cache_type', 'key_strategy'],
      }),

      cacheMisses: new Counter({
        name: `${prefix}cache_misses_total`,
        help: 'Total number of cache misses',
        labelNames: ['cache_type', 'key_strategy'],
      }),

      cacheOperationDuration: new Histogram({
        name: `${prefix}cache_operation_duration_seconds`,
        help: 'Duration of cache operations in seconds',
        labelNames: ['operation', 'cache_type'],
        buckets: [0.001, 0.002, 0.005, 0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1.0],
      }),

      // システム関連メトリクス
      errorRate: new Counter({
        name: `${prefix}errors_total`,
        help: 'Total number of errors',
        labelNames: ['error_type', 'severity', 'component'],
      }),

      backgroundJobs: new Gauge({
        name: `${prefix}background_jobs_active`,
        help: 'Number of active background jobs',
        labelNames: ['job_type', 'status'],
      }),

      memoryUsage: new Gauge({
        name: `${prefix}memory_usage_bytes`,
        help: 'Memory usage in bytes',
        labelNames: ['type'],
      }),

      // ビジネスメトリクス
      userRegistrations: new Counter({
        name: `${prefix}user_registrations_total`,
        help: 'Total number of user registrations',
        labelNames: ['registration_type', 'source'],
      }),

      examCompletions: new Counter({
        name: `${prefix}exam_completions_total`,
        help: 'Total number of completed exams',
        labelNames: ['exam_type', 'result', 'user_type'],
      }),

      learningTimeTotal: new Counter({
        name: `${prefix}learning_time_seconds_total`,
        help: 'Total learning time in seconds',
        labelNames: ['user_type', 'knowledge_area', 'activity_type'],
      }),

      pmbok_process_views: new Counter({
        name: `${prefix}pmbok_process_views_total`,
        help: 'Total number of PMBOK process views',
        labelNames: ['process_id', 'knowledge_area', 'process_group', 'view_type'],
      }),
    }
  }

  /**
   * HTTPリクエストメトリクスの記録
   */
  recordHttpRequest(
    method: string,
    route: string,
    statusCode: number,
    duration: number,
    requestSize?: number,
    responseSize?: number,
    userType: string = 'anonymous'
  ): void {
    const statusCodeStr = statusCode.toString()
    const labels = { method, route, status_code: statusCodeStr, user_type: userType }

    this.metrics.httpRequestDuration.observe(labels, duration / 1000)
    this.metrics.httpRequestsTotal.inc(labels)

    if (requestSize !== undefined) {
      this.metrics.httpRequestSize.observe({ method, route }, requestSize)
    }

    if (responseSize !== undefined) {
      this.metrics.httpResponseSize.observe(
        { method, route, status_code: statusCodeStr },
        responseSize
      )
    }
  }

  /**
   * データベースクエリメトリクスの記録
   */
  recordDatabaseQuery(
    queryType: string,
    table: string,
    operation: string,
    duration: number,
    status: 'success' | 'error' = 'success'
  ): void {
    const labels = { query_type: queryType, table, operation }

    this.metrics.databaseQueryDuration.observe(labels, duration / 1000)
    this.metrics.databaseQueriesTotal.inc({ ...labels, status })
  }

  /**
   * キャッシュメトリクスの記録
   */
  recordCacheOperation(
    operation: 'hit' | 'miss' | 'set' | 'delete',
    cacheType: string,
    keyStrategy: string,
    duration?: number
  ): void {
    const labels = { cache_type: cacheType, key_strategy: keyStrategy }

    if (operation === 'hit') {
      this.metrics.cacheHits.inc(labels)
    } else if (operation === 'miss') {
      this.metrics.cacheMisses.inc(labels)
    }

    if (duration !== undefined) {
      this.metrics.cacheOperationDuration.observe(
        { operation, cache_type: cacheType },
        duration / 1000
      )
    }
  }

  /**
   * 学習進捗メトリクスの記録
   */
  recordLearningProgress(
    userId: string,
    knowledgeArea: string,
    processGroup: string,
    progressPercent: number
  ): void {
    this.metrics.learningProgress.set(
      { user_id: userId, knowledge_area: knowledgeArea, process_group: processGroup },
      progressPercent
    )
  }

  /**
   * 試験メトリクスの記録
   */
  recordExamAttempt(
    examType: string,
    userType: string,
    difficulty: string,
    score?: number,
    completed: boolean = false,
    result: 'pass' | 'fail' | 'in_progress' = 'in_progress'
  ): void {
    this.metrics.examAttempts.inc({
      exam_type: examType,
      user_type: userType,
      difficulty,
    })

    if (score !== undefined) {
      this.metrics.examScore.observe({ exam_type: examType, difficulty }, score)
    }

    if (completed) {
      this.metrics.examCompletions.inc({
        exam_type: examType,
        result,
        user_type: userType,
      })
    }
  }

  /**
   * エラーメトリクスの記録
   */
  recordError(
    errorType: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    component: string
  ): void {
    this.metrics.errorRate.inc({
      error_type: errorType,
      severity,
      component,
    })
  }

  /**
   * アクティブユーザー数の更新
   */
  updateActiveUsers(count: number, userType: string = 'all'): void {
    this.metrics.activeUsers.set({ user_type: userType }, count)
  }

  /**
   * セッション数の更新
   */
  updateActiveSessions(count: number, sessionType: string = 'web'): void {
    this.metrics.userSessions.set({ session_type: sessionType }, count)
  }

  /**
   * データベース接続数の更新
   */
  updateDatabaseConnections(count: number, database: string, state: string): void {
    this.metrics.databaseConnections.set({ database, state }, count)
  }

  /**
   * バックグラウンドジョブ数の更新
   */
  updateBackgroundJobs(count: number, jobType: string, status: string): void {
    this.metrics.backgroundJobs.set({ job_type: jobType, status }, count)
  }

  /**
   * メモリ使用量の更新
   */
  updateMemoryUsage(usage: number, type: string): void {
    this.metrics.memoryUsage.set({ type }, usage)
  }

  /**
   * ユーザー登録の記録
   */
  recordUserRegistration(registrationType: string, source: string): void {
    this.metrics.userRegistrations.inc({
      registration_type: registrationType,
      source,
    })
  }

  /**
   * 学習時間の記録
   */
  recordLearningTime(
    duration: number,
    userType: string,
    knowledgeArea: string,
    activityType: string
  ): void {
    this.metrics.learningTimeTotal.inc(
      {
        user_type: userType,
        knowledge_area: knowledgeArea,
        activity_type: activityType,
      },
      duration
    )
  }

  /**
   * PMBOKプロセス閲覧の記録
   */
  recordPMBOKProcessView(
    processId: string,
    knowledgeArea: string,
    processGroup: string,
    viewType: string
  ): void {
    this.metrics.pmbok_process_views.inc({
      process_id: processId,
      knowledge_area: knowledgeArea,
      process_group: processGroup,
      view_type: viewType,
    })
  }

  /**
   * 高レベルメトリクスの計算と記録
   */
  calculateDerivedMetrics(): void {
    const now = Date.now()
    const uptimeSeconds = (now - this.startTime) / 1000

    // アプリケーション稼働時間
    const uptimeGauge = new Gauge({
      name: `${this.config.prefix}uptime_seconds`,
      help: 'Application uptime in seconds',
    })
    uptimeGauge.set(uptimeSeconds)

    // メモリ使用状況（Node.js）
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const memUsage = process.memoryUsage()
      this.updateMemoryUsage(memUsage.heapUsed, 'heap_used')
      this.updateMemoryUsage(memUsage.heapTotal, 'heap_total')
      this.updateMemoryUsage(memUsage.rss, 'rss')
      this.updateMemoryUsage(memUsage.external, 'external')
    }
  }

  /**
   * すべてのメトリクスをPrometheus形式で出力
   */
  async getMetrics(): Promise<string> {
    this.calculateDerivedMetrics()
    return register.metrics()
  }

  /**
   * メトリクスのリセット
   */
  resetMetrics(): void {
    register.clear()
    this.metrics = this.initializeMetrics()
    this.startTime = Date.now()
  }

  /**
   * 特定のメトリクスの値を取得（デバッグ用）
   */
  async getMetricValue(metricName: string): Promise<any> {
    const metric = register.getSingleMetric(metricName)
    if (metric) {
      return await metric.get()
    }
    return null
  }

  /**
   * レジストリからメトリクス一覧を取得
   */
  getRegisteredMetrics(): string[] {
    return register.getMetricsAsArray().map((metric) => metric.name)
  }

  /**
   * カスタムメトリクスの追加
   */
  addCustomCounter(name: string, help: string, labelNames: string[] = []): Counter<string> {
    return new Counter({
      name: `${this.config.prefix}${name}`,
      help,
      labelNames,
    })
  }

  addCustomGauge(name: string, help: string, labelNames: string[] = []): Gauge<string> {
    return new Gauge({
      name: `${this.config.prefix}${name}`,
      help,
      labelNames,
    })
  }

  addCustomHistogram(
    name: string,
    help: string,
    labelNames: string[] = [],
    buckets?: number[]
  ): Histogram<string> {
    return new Histogram({
      name: `${this.config.prefix}${name}`,
      help,
      labelNames,
      buckets,
    })
  }

  addCustomSummary(
    name: string,
    help: string,
    labelNames: string[] = [],
    percentiles?: number[]
  ): Summary<string> {
    return new Summary({
      name: `${this.config.prefix}${name}`,
      help,
      labelNames,
      percentiles,
    })
  }
}

/**
 * メトリクス収集用ミドルウェア
 */
export function createMetricsMiddleware(collector: MetricsCollector) {
  return function metricsMiddleware(req: unknown, res: unknown, next: () => void): void {
    const startTime = Date.now()
    const originalSend = res.send
    const originalJson = res.json

    // レスポンスサイズ測定用
    let responseSize = 0

    // res.send をオーバーライド
    res.send = function (data: unknown) {
      responseSize = Buffer.isBuffer(data) ? data.length : Buffer.byteLength(data || '', 'utf8')
      return originalSend.call(this, data)
    }

    // res.json をオーバーライド
    res.json = function (data: unknown) {
      const jsonStr = JSON.stringify(data)
      responseSize = Buffer.byteLength(jsonStr, 'utf8')
      return originalJson.call(this, data)
    }

    // レスポンス終了時にメトリクスを記録
    res.on('finish', () => {
      const duration = Date.now() - startTime
      const method = req.method || 'UNKNOWN'
      const route = req.route?.path || req.path || req.url || 'unknown'
      const statusCode = res.statusCode || 500
      const userType = req.user?.role || 'anonymous'

      // リクエストサイズ（概算）
      const requestSize = parseInt(req.headers['content-length'] || '0')

      collector.recordHttpRequest(
        method,
        route,
        statusCode,
        duration,
        requestSize,
        responseSize,
        userType
      )
    })

    next()
  }
}

/**
 * システム監視メトリクス収集
 */
export class SystemMetricsCollector {
  private collector: MetricsCollector
  private intervalId: NodeJS.Timeout | null = null

  constructor(collector: MetricsCollector) {
    this.collector = collector
  }

  /**
   * システムメトリクス収集の開始
   */
  startCollecting(intervalMs: number = 30000): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
    }

    this.intervalId = setInterval(() => {
      this.collectSystemMetrics()
    }, intervalMs)

    if (process.env.NODE_ENV === 'development') {
      logger.debug(`System metrics collection started (interval: ${intervalMs}ms)`)
    }
  }

  /**
   * システムメトリクス収集の停止
   */
  stopCollecting(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
      if (process.env.NODE_ENV === 'development') {
        logger.debug('System metrics collection stopped')
      }
    }
  }

  /**
   * システムメトリクスの収集
   */
  private collectSystemMetrics(): void {
    try {
      // Node.js プロセス情報
      if (typeof process !== 'undefined') {
        const memUsage = process.memoryUsage()
        this.collector.updateMemoryUsage(memUsage.heapUsed, 'heap_used')
        this.collector.updateMemoryUsage(memUsage.heapTotal, 'heap_total')
        this.collector.updateMemoryUsage(memUsage.rss, 'rss')

        const cpuUsage = process.cpuUsage()
        this.collector.updateMemoryUsage(cpuUsage.user, 'cpu_user')
        this.collector.updateMemoryUsage(cpuUsage.system, 'cpu_system')
      }

      // Event Loop Lag (概算)
      const start = process.hrtime()
      setImmediate(() => {
        const delta = process.hrtime(start)
        const nanosec = delta[0] * 1e9 + delta[1]
        const eventLoopLag = nanosec / 1e6 // ms

        const eventLoopLagGauge = this.collector.addCustomGauge(
          'event_loop_lag_ms',
          'Event loop lag in milliseconds'
        )
        eventLoopLagGauge.set(eventLoopLag)
      })
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('System metrics collection error:', error)
      }
    }
  }
}

// エクスポート用インスタンス
export const metricsCollector = new MetricsCollector({
  collectDefaultMetrics: true,
  prefix: 'pmp_learning_',
  defaultLabels: {
    app: 'pmp-learning-management',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  },
})

export const systemMetricsCollector = new SystemMetricsCollector(metricsCollector)

// システムメトリクス収集の開始
systemMetricsCollector.startCollecting(30000) // 30秒ごと

export default {
  MetricsCollector,
  SystemMetricsCollector,
  createMetricsMiddleware,
  metricsCollector,
  systemMetricsCollector,
}
