/**
 * Metrics Collection System
 * Prometheus-compatible metrics for monitoring and observability
 * 担当: DevOpsエンジニア
 */

import client from 'prom-client'
// import { AsyncLocalStorage } from 'async_hooks' // TODO: Will be used in future
import { Logger } from './logger'

// メトリクス収集間隔（ミリ秒）
const METRICS_COLLECTION_INTERVAL = 10000 // 10秒

// Prometheus メトリクス初期化
export class Metrics {
  private static instance: Metrics
  private register: client.Registry
  private collectDefaultMetrics: boolean = true

  // アプリケーション固有のメトリクス
  private httpRequestDuration: client.Histogram<string>
  private httpRequestTotal: client.Counter<string>
  private activeUsers: client.Gauge<string>
  private dbConnectionPool: client.Gauge<string>
  private dbQueryDuration: client.Histogram<string>
  private dbQueryTotal: client.Counter<string>
  private learningSessionsTotal: client.Counter<string>
  private examAttemptsTotal: client.Counter<string>
  private subscriptionsActive: client.Gauge<string>
  private revenueTotal: client.Counter<string>
  private notificationsSent: client.Counter<string>
  private emailsSent: client.Counter<string>
  private pushNotificationsSent: client.Counter<string>
  private errorRate: client.Counter<string>
  private cacheHitRate: client.Counter<string>
  private queueSize: client.Gauge<string>
  private workerJobsProcessed: client.Counter<string>

  constructor() {
    this.register = new client.Registry()

    // デフォルトメトリクスを収集
    if (this.collectDefaultMetrics) {
      client.collectDefaultMetrics({
        register: this.register,
        timeout: 5000,
      })
    }

    this.initializeCustomMetrics()
    this.startPeriodicCollection()
  }

  // シングルトンパターン
  static getInstance(): Metrics {
    if (!Metrics.instance) {
      Metrics.instance = new Metrics()
    }
    return Metrics.instance
  }

  // カスタムメトリクス初期化
  private initializeCustomMetrics(): void {
    // HTTP リクエスト関連
    this.httpRequestDuration = new client.Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
      registers: [this.register],
    })

    this.httpRequestTotal = new client.Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
      registers: [this.register],
    })

    // アクティブユーザー
    this.activeUsers = new client.Gauge({
      name: 'active_users_total',
      help: 'Number of active users in the system',
      labelNames: ['time_period'],
      registers: [this.register],
    })

    // データベース関連
    this.dbConnectionPool = new client.Gauge({
      name: 'db_connection_pool_size',
      help: 'Current size of database connection pool',
      labelNames: ['pool_name', 'status'],
      registers: [this.register],
    })

    this.dbQueryDuration = new client.Histogram({
      name: 'db_query_duration_seconds',
      help: 'Duration of database queries in seconds',
      labelNames: ['operation', 'table'],
      buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1],
      registers: [this.register],
    })

    this.dbQueryTotal = new client.Counter({
      name: 'db_queries_total',
      help: 'Total number of database queries',
      labelNames: ['operation', 'table', 'status'],
      registers: [this.register],
    })

    // 学習関連
    this.learningSessionsTotal = new client.Counter({
      name: 'learning_sessions_total',
      help: 'Total number of learning sessions',
      labelNames: ['knowledge_area', 'process_group', 'completed'],
      registers: [this.register],
    })

    this.examAttemptsTotal = new client.Counter({
      name: 'exam_attempts_total',
      help: 'Total number of exam attempts',
      labelNames: ['exam_type', 'result'],
      registers: [this.register],
    })

    // サブスクリプション・収益関連
    this.subscriptionsActive = new client.Gauge({
      name: 'subscriptions_active_total',
      help: 'Number of active subscriptions',
      labelNames: ['plan'],
      registers: [this.register],
    })

    this.revenueTotal = new client.Counter({
      name: 'revenue_total_yen',
      help: 'Total revenue in Japanese Yen',
      labelNames: ['plan', 'payment_method'],
      registers: [this.register],
    })

    // 通知関連
    this.notificationsSent = new client.Counter({
      name: 'notifications_sent_total',
      help: 'Total number of notifications sent',
      labelNames: ['type', 'channel', 'status'],
      registers: [this.register],
    })

    this.emailsSent = new client.Counter({
      name: 'emails_sent_total',
      help: 'Total number of emails sent',
      labelNames: ['template', 'status'],
      registers: [this.register],
    })

    this.pushNotificationsSent = new client.Counter({
      name: 'push_notifications_sent_total',
      help: 'Total number of push notifications sent',
      labelNames: ['device_type', 'status'],
      registers: [this.register],
    })

    // エラー関連
    this.errorRate = new client.Counter({
      name: 'errors_total',
      help: 'Total number of errors',
      labelNames: ['type', 'component', 'severity'],
      registers: [this.register],
    })

    // キャッシュ関連
    this.cacheHitRate = new client.Counter({
      name: 'cache_operations_total',
      help: 'Total number of cache operations',
      labelNames: ['operation', 'result'],
      registers: [this.register],
    })

    // キュー・ワーカー関連
    this.queueSize = new client.Gauge({
      name: 'queue_size_total',
      help: 'Current size of job queues',
      labelNames: ['queue_name'],
      registers: [this.register],
    })

    this.workerJobsProcessed = new client.Counter({
      name: 'worker_jobs_processed_total',
      help: 'Total number of worker jobs processed',
      labelNames: ['job_type', 'status'],
      registers: [this.register],
    })
  }

  // 定期的なメトリクス収集開始
  private startPeriodicCollection(): void {
    setInterval(() => {
      this.collectBusinessMetrics()
    }, METRICS_COLLECTION_INTERVAL)
  }

  // ビジネスメトリクス収集
  private async collectBusinessMetrics(): Promise<void> {
    try {
      // この実装は実際のデータベース接続が必要
      // 以下は例として基本的な構造を示す

      // アクティブユーザー数（過去1時間、過去24時間、過去7日間）
      // const activeUsersData = await this.getActiveUsersCount()
      // this.activeUsers.set({ time_period: '1h' }, activeUsersData.last1Hour)
      // this.activeUsers.set({ time_period: '24h' }, activeUsersData.last24Hours)
      // this.activeUsers.set({ time_period: '7d' }, activeUsersData.last7Days)

      // アクティブサブスクリプション数
      // const subscriptionData = await this.getActiveSubscriptionsCount()
      // Object.entries(subscriptionData).forEach(([plan, count]) => {
      //   this.subscriptionsActive.set({ plan }, count as number)
      // })

      Logger.debug('ビジネスメトリクス収集完了')
    } catch (error) {
      Logger.error('ビジネスメトリクス収集エラー', error)
    }
  }

  // HTTPリクエストメトリクス記録
  recordHttpRequest(method: string, route: string, statusCode: number, duration: number): void {
    const labels = {
      method: method.toUpperCase(),
      route,
      status_code: statusCode.toString(),
    }

    this.httpRequestTotal.inc(labels)
    this.httpRequestDuration.observe(labels, duration / 1000) // ミリ秒を秒に変換
  }

  // データベースクエリメトリクス記録
  recordDatabaseQuery(operation: string, table: string, duration: number, success: boolean): void {
    const labels = {
      operation: operation.toUpperCase(),
      table,
      status: success ? 'success' : 'error',
    }

    this.dbQueryTotal.inc(labels)
    this.dbQueryDuration.observe({ operation: operation.toUpperCase(), table }, duration / 1000)
  }

  // 学習セッションメトリクス記録
  recordLearningSession(knowledgeArea: string, processGroup: string, completed: boolean): void {
    this.learningSessionsTotal.inc({
      knowledge_area: knowledgeArea,
      process_group: processGroup,
      completed: completed.toString(),
    })
  }

  // 試験受験メトリクス記録
  recordExamAttempt(examType: string, passed: boolean): void {
    this.examAttemptsTotal.inc({
      exam_type: examType,
      result: passed ? 'pass' : 'fail',
    })
  }

  // 収益メトリクス記録
  recordRevenue(plan: string, amount: number, paymentMethod: string): void {
    this.revenueTotal.inc({ plan, payment_method: paymentMethod }, amount)
  }

  // 通知送信メトリクス記録
  recordNotificationSent(type: string, channel: string, success: boolean): void {
    this.notificationsSent.inc({
      type,
      channel,
      status: success ? 'success' : 'failure',
    })
  }

  // メール送信メトリクス記録
  recordEmailSent(template: string, success: boolean): void {
    this.emailsSent.inc({
      template,
      status: success ? 'success' : 'failure',
    })
  }

  // プッシュ通知送信メトリクス記録
  recordPushNotificationSent(deviceType: string, success: boolean): void {
    this.pushNotificationsSent.inc({
      device_type: deviceType,
      status: success ? 'success' : 'failure',
    })
  }

  // エラーメトリクス記録
  recordError(
    type: string,
    component: string,
    severity: 'low' | 'medium' | 'high' | 'critical'
  ): void {
    this.errorRate.inc({ type, component, severity })
  }

  // キャッシュ操作メトリクス記録
  recordCacheOperation(operation: 'get' | 'set' | 'delete', hit: boolean): void {
    this.cacheHitRate.inc({
      operation,
      result: hit ? 'hit' : 'miss',
    })
  }

  // キューサイズ更新
  updateQueueSize(queueName: string, size: number): void {
    this.queueSize.set({ queue_name: queueName }, size)
  }

  // ワーカージョブ処理メトリクス記録
  recordWorkerJob(jobType: string, success: boolean): void {
    this.workerJobsProcessed.inc({
      job_type: jobType,
      status: success ? 'success' : 'failure',
    })
  }

  // カスタムメトリクス作成
  createCounter(name: string, help: string, labelNames: string[] = []): client.Counter<string> {
    return new client.Counter({
      name,
      help,
      labelNames,
      registers: [this.register],
    })
  }

  createGauge(name: string, help: string, labelNames: string[] = []): client.Gauge<string> {
    return new client.Gauge({
      name,
      help,
      labelNames,
      registers: [this.register],
    })
  }

  createHistogram(
    name: string,
    help: string,
    labelNames: string[] = [],
    buckets?: number[]
  ): client.Histogram<string> {
    return new client.Histogram({
      name,
      help,
      labelNames,
      buckets,
      registers: [this.register],
    })
  }

  // メトリクス出力（Prometheusフォーマット）
  async getMetrics(): Promise<string> {
    return this.register.metrics()
  }

  // メトリクスクリア
  clearMetrics(): void {
    this.register.clear()
  }

  // レジストリ取得
  getRegistry(): client.Registry {
    return this.register
  }

  // ヘルスチェック用メトリクス
  async getHealthMetrics(): Promise<{
    uptime: number
    memoryUsage: NodeJS.MemoryUsage
    cpuUsage: NodeJS.CpuUsage
    eventLoopLag: number
  }> {
    return {
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      eventLoopLag: await this.measureEventLoopLag(),
    }
  }

  // イベントループ遅延測定
  private measureEventLoopLag(): Promise<number> {
    return new Promise((resolve) => {
      const start = process.hrtime.bigint()
      setImmediate(() => {
        const lag = Number(process.hrtime.bigint() - start) / 1000000
        resolve(lag)
      })
    })
  }
}

// Express/Next.js用のメトリクスミドルウェア
export const metricsMiddleware = () => {
  const metrics = Metrics.getInstance()

  return (req: unknown, res: unknown, next: unknown) => {
    const startTime = Date.now()

    // レスポンス終了時にメトリクス記録
    const originalSend = res.send
    res.send = function (data: unknown) {
      const duration = Date.now() - startTime
      const route = req.route?.path || req.path

      metrics.recordHttpRequest(req.method, route, res.statusCode, duration)

      return originalSend.call(this, data)
    }

    next()
  }
}

// Prometheus メトリクスエンドポイント用ハンドラ
export const getMetricsHandler = async (): Promise<string> => {
  const metrics = Metrics.getInstance()
  return await metrics.getMetrics()
}

// ヘルスチェック用データ
export const getHealthData = async (): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  uptime: number
  memory: NodeJS.MemoryUsage
  version: string
  environment: string
}> => {
  const metrics = Metrics.getInstance()
  const healthMetrics = await metrics.getHealthMetrics()

  // ヘルス状態判定
  let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'

  if (healthMetrics.memoryUsage.heapUsed / healthMetrics.memoryUsage.heapTotal > 0.9) {
    status = 'degraded'
  }

  if (healthMetrics.eventLoopLag > 100) {
    // 100ms以上の遅延
    status = 'unhealthy'
  }

  return {
    status,
    timestamp: new Date().toISOString(),
    uptime: healthMetrics.uptime,
    memory: healthMetrics.memoryUsage,
    version: process.env.APP_VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  }
}

// パフォーマンス測定デコレータ
export const measurePerformance = (metricName: string, labels: Record<string, string> = {}) => {
  return (target: unknown, propertyName: string, descriptor: PropertyDescriptor) => {
    const method = descriptor.value
    const metrics = Metrics.getInstance()

    descriptor.value = async function (...args: unknown[]) {
      const startTime = Date.now()

      try {
        const result = await method.apply(this, args)
        const duration = Date.now() - startTime

        // カスタムメトリクス記録（必要に応じて）
        Logger.debug(`${metricName} completed`, { duration, labels })

        return result
      } catch (error) {
        const duration = Date.now() - startTime

        metrics.recordError('method_execution', propertyName, 'high')

        Logger.error(`${metricName} failed`, error, { duration, labels })
        throw error
      }
    }

    return descriptor
  }
}

// グローバルメトリクスインスタンス
export const metrics = Metrics.getInstance()

export default Metrics
