/**
 * Structured Logging System
 * Centralized logging with correlation IDs and structured data
 * 担当: DevOpsエンジニア
 */

import winston from 'winston'
import path from 'path'
import { AsyncLocalStorage } from 'async_hooks'

// ログレベル定義
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  HTTP = 'http',
  VERBOSE = 'verbose',
  DEBUG = 'debug',
  SILLY = 'silly',
}

// ログコンテキスト型定義
export interface LogContext {
  correlationId: string
  userId?: string
  sessionId?: string
  requestId?: string
  userAgent?: string
  ip?: string
  route?: string
  method?: string
}

// ログエントリー型定義
export interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: LogContext
  metadata?: Record<string, any>
  error?: {
    name: string
    message: string
    stack?: string
    code?: string | number
  }
  performance?: {
    duration: number
    memory: NodeJS.MemoryUsage
    cpu?: number
  }
}

// 相関ID管理用AsyncLocalStorage
const asyncLocalStorage = new AsyncLocalStorage<LogContext>()

// カスタムログフォーマット
const customFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss.SSS',
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf((info) => {
    const context = asyncLocalStorage.getStore()
    const logEntry: LogEntry = {
      timestamp: info.timestamp,
      level: info.level as LogLevel,
      message: info.message,
      context,
      metadata: info.metadata,
      error: info.error,
      performance: info.performance,
    }

    return JSON.stringify(logEntry, null, process.env.NODE_ENV === 'development' ? 2 : 0)
  })
)

// Winston ロガー設定
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: customFormat,
  defaultMeta: {
    service: 'pmp-learning-management',
    version: process.env.APP_VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  },
  transports: [
    // コンソール出力
    new winston.transports.Console({
      format:
        process.env.NODE_ENV === 'development'
          ? winston.format.combine(winston.format.colorize(), winston.format.simple())
          : customFormat,
    }),

    // ファイル出力（エラーレベル）
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'error.log'),
      level: 'error',
      maxsize: 50 * 1024 * 1024, // 50MB
      maxFiles: 10,
      tailable: true,
    }),

    // ファイル出力（全レベル）
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'combined.log'),
      maxsize: 100 * 1024 * 1024, // 100MB
      maxFiles: 20,
      tailable: true,
    }),

    // HTTP アクセスログ
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'access.log'),
      level: 'http',
      maxsize: 100 * 1024 * 1024, // 100MB
      maxFiles: 15,
      tailable: true,
    }),
  ],

  // 未処理の例外とPromise拒否をキャッチ
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'exceptions.log'),
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'rejections.log'),
    }),
  ],
})

// 本番環境では未処理例外で終了しない
if (process.env.NODE_ENV === 'production') {
  logger.exitOnError = false
}

// ロガークラス
export class Logger {
  // 相関IDを生成
  static generateCorrelationId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  // コンテキストを設定してコードを実行
  static withContext<T>(context: LogContext, fn: () => T): T {
    return asyncLocalStorage.run(context, fn)
  }

  // 現在のコンテキスト取得
  static getContext(): LogContext | undefined {
    return asyncLocalStorage.getStore()
  }

  // コンテキスト更新
  static updateContext(updates: Partial<LogContext>): void {
    const currentContext = asyncLocalStorage.getStore()
    if (currentContext) {
      Object.assign(currentContext, updates)
    }
  }

  // パフォーマンス測定を伴うログ
  static async withPerformance<T>(
    message: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    const startTime = process.hrtime.bigint()
    const startMemory = process.memoryUsage()

    try {
      const result = await fn()

      const endTime = process.hrtime.bigint()
      const duration = Number(endTime - startTime) / 1000000 // ナノ秒をミリ秒に変換

      logger.info(message, {
        metadata,
        performance: {
          duration: Math.round(duration * 100) / 100,
          memory: process.memoryUsage(),
        },
      })

      return result
    } catch (error) {
      const endTime = process.hrtime.bigint()
      const duration = Number(endTime - startTime) / 1000000

      this.error(message + ' (失敗)', error, {
        metadata,
        performance: {
          duration: Math.round(duration * 100) / 100,
          memory: process.memoryUsage(),
        },
      })

      throw error
    }
  }

  // ログレベル別メソッド
  static error(message: string, error?: Error | unknown, metadata?: Record<string, any>): void {
    const errorInfo =
      error instanceof Error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
            code: (error as any).code,
          }
        : error
          ? { message: String(error) }
          : undefined

    logger.error(message, { metadata, error: errorInfo })
  }

  static warn(message: string, metadata?: Record<string, any>): void {
    logger.warn(message, { metadata })
  }

  static info(message: string, metadata?: Record<string, any>): void {
    logger.info(message, { metadata })
  }

  static http(
    message: string,
    metadata?: {
      method?: string
      url?: string
      statusCode?: number
      responseTime?: number
      contentLength?: number
      userAgent?: string
      ip?: string
    }
  ): void {
    logger.http(message, { metadata })
  }

  static debug(message: string, metadata?: Record<string, any>): void {
    logger.debug(message, { metadata })
  }

  static verbose(message: string, metadata?: Record<string, any>): void {
    logger.verbose(message, { metadata })
  }

  // 構造化ログ
  static structured(level: LogLevel, event: string, data: Record<string, any>): void {
    logger.log(level, `[${event}]`, {
      metadata: {
        event,
        ...data,
      },
    })
  }

  // セキュリティイベントログ
  static security(
    event: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    details: Record<string, any>
  ): void {
    this.structured(LogLevel.WARN, 'SECURITY_EVENT', {
      event,
      severity,
      ...details,
    })
  }

  // ビジネスイベントログ
  static business(
    event: string,
    entityType: string,
    entityId: string,
    action: string,
    details?: Record<string, any>
  ): void {
    this.structured(LogLevel.INFO, 'BUSINESS_EVENT', {
      event,
      entityType,
      entityId,
      action,
      ...details,
    })
  }

  // システムヘルスログ
  static health(
    component: string,
    status: 'healthy' | 'degraded' | 'unhealthy',
    metrics?: Record<string, any>
  ): void {
    this.structured(LogLevel.INFO, 'HEALTH_CHECK', {
      component,
      status,
      metrics,
    })
  }

  // データベース操作ログ
  static database(
    operation: string,
    table: string,
    duration: number,
    recordCount?: number,
    error?: Error
  ): void {
    if (error) {
      this.structured(LogLevel.ERROR, 'DATABASE_ERROR', {
        operation,
        table,
        duration,
        recordCount,
        error: {
          name: error.name,
          message: error.message,
        },
      })
    } else {
      this.structured(LogLevel.DEBUG, 'DATABASE_OPERATION', {
        operation,
        table,
        duration,
        recordCount,
      })
    }
  }

  // 外部API呼び出しログ
  static externalApi(
    service: string,
    endpoint: string,
    method: string,
    statusCode: number,
    duration: number,
    error?: Error
  ): void {
    const level = error ? LogLevel.ERROR : statusCode >= 400 ? LogLevel.WARN : LogLevel.INFO

    this.structured(level, 'EXTERNAL_API_CALL', {
      service,
      endpoint,
      method,
      statusCode,
      duration,
      success: !error && statusCode < 400,
      error: error
        ? {
            name: error.name,
            message: error.message,
          }
        : undefined,
    })
  }

  // 認証イベントログ
  static auth(
    event: 'LOGIN' | 'LOGOUT' | 'LOGIN_FAILED' | 'PASSWORD_RESET' | 'ACCOUNT_LOCKED',
    userId: string | null,
    details?: Record<string, any>
  ): void {
    this.structured(LogLevel.INFO, 'AUTH_EVENT', {
      event,
      userId,
      ...details,
    })
  }

  // サブスクリプションイベントログ
  static subscription(
    event: 'CREATED' | 'UPDATED' | 'CANCELLED' | 'PAYMENT_FAILED',
    userId: string,
    planId: string,
    details?: Record<string, any>
  ): void {
    this.structured(LogLevel.INFO, 'SUBSCRIPTION_EVENT', {
      event,
      userId,
      planId,
      ...details,
    })
  }

  // 学習進捗イベントログ
  static learning(
    event: 'SESSION_STARTED' | 'SESSION_COMPLETED' | 'EXAM_TAKEN' | 'GOAL_ACHIEVED',
    userId: string,
    details?: Record<string, any>
  ): void {
    this.structured(LogLevel.INFO, 'LEARNING_EVENT', {
      event,
      userId,
      ...details,
    })
  }
}

// Express/Next.js用のリクエストログミドルウェア
export const requestLoggingMiddleware = (req: any, res: any, next: any) => {
  const startTime = Date.now()
  const correlationId = req.headers['x-correlation-id'] || Logger.generateCorrelationId()

  // レスポンスヘッダーに相関IDを追加
  res.setHeader('X-Correlation-ID', correlationId)

  const context: LogContext = {
    correlationId,
    requestId: req.headers['x-request-id'],
    userAgent: req.headers['user-agent'],
    ip: req.ip || req.connection.remoteAddress,
    route: req.route?.path,
    method: req.method,
  }

  // ユーザー情報が利用可能な場合
  if (req.user?.id) {
    context.userId = req.user.id
  }
  if (req.sessionID) {
    context.sessionId = req.sessionID
  }

  // レスポンス終了時のログ
  const originalSend = res.send
  res.send = function (data: any) {
    const duration = Date.now() - startTime
    const statusCode = res.statusCode

    Logger.http(`${req.method} ${req.originalUrl}`, {
      method: req.method,
      url: req.originalUrl,
      statusCode,
      responseTime: duration,
      contentLength: res.get('content-length'),
      userAgent: req.headers['user-agent'],
      ip: req.ip,
    })

    return originalSend.call(this, data)
  }

  // コンテキストを設定して次のミドルウェアを実行
  Logger.withContext(context, () => {
    next()
  })
}

// tRPC用のログミドルウェア
export const trpcLoggingMiddleware = () => {
  return async ({ path, type, next, ctx }: any) => {
    const correlationId = Logger.generateCorrelationId()
    const startTime = Date.now()

    const context: LogContext = {
      correlationId,
      userId: ctx?.session?.user?.id,
      route: path,
      method: type,
    }

    return Logger.withContext(context, async () => {
      try {
        const result = await next()

        const duration = Date.now() - startTime
        Logger.debug(`tRPC ${type} ${path}`, {
          duration,
          success: true,
        })

        return result
      } catch (error) {
        const duration = Date.now() - startTime
        Logger.error(`tRPC ${type} ${path} failed`, error, {
          duration,
          path,
          type,
        })
        throw error
      }
    })
  }
}

// ログレベル動的変更
export const setLogLevel = (level: LogLevel): void => {
  logger.level = level
  Logger.info(`ログレベルを ${level} に変更しました`)
}

// ログ統計情報取得
export const getLogStats = (): {
  transports: Array<{
    name: string
    level: string
    filename?: string
  }>
} => {
  return {
    transports: logger.transports.map((transport: any) => ({
      name: transport.name,
      level: transport.level,
      filename: transport.filename,
    })),
  }
}

// デフォルトエクスポート
export default Logger
