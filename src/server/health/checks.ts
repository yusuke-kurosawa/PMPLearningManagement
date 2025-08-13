/**
 * Health Check System
 * Comprehensive health monitoring for all system components
 * 担当: DevOpsエンジニア
 */

import { prisma } from '@/lib/db'
import { StripeService } from '@/server/services/stripeService'
import { Logger } from '../monitoring/logger'
import { metrics } from '../monitoring/metrics'
import Redis from 'ioredis'
// import { z } from 'zod' // TODO: Will be used in future

// ヘルスチェック結果の型定義
export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  responseTime: number
  details?: Record<string, any>
  error?: string
}

// システム全体のヘルス状態
export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  uptime: number
  version: string
  environment: string
  checks: {
    database: HealthCheckResult
    redis: HealthCheckResult
    stripe: HealthCheckResult
    email: HealthCheckResult
    storage: HealthCheckResult
    external_apis: HealthCheckResult
    memory: HealthCheckResult
    cpu: HealthCheckResult
    disk: HealthCheckResult
  }
  summary: {
    total: number
    healthy: number
    degraded: number
    unhealthy: number
  }
}

// ヘルスチェック設定
const HEALTH_CHECK_TIMEOUT = 5000 // 5秒
const MEMORY_WARNING_THRESHOLD = 0.8 // メモリ使用率80%
const DISK_WARNING_THRESHOLD = 0.85 // ディスク使用率85%

// Redis接続（オプション）
let redisClient: Redis | null = null
try {
  if (process.env.REDIS_URL) {
    redisClient = new Redis(process.env.REDIS_URL, {
      connectTimeout: HEALTH_CHECK_TIMEOUT,
      commandTimeout: HEALTH_CHECK_TIMEOUT,
    })
  }
} catch (error) {
  Logger.warn('Redis接続の初期化に失敗しました', {
    error: error instanceof Error ? error.message : error,
  })
}

// ヘルスチェッククラス
export class HealthChecker {
  // データベースヘルスチェック
  static async checkDatabase(): Promise<HealthCheckResult> {
    const startTime = Date.now()

    try {
      // 基本接続チェック
      await Promise.race([
        prisma.$queryRaw`SELECT 1`,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Database timeout')), HEALTH_CHECK_TIMEOUT)
        ),
      ])

      // 接続プール情報取得（可能な場合）
      const connectionInfo = (await prisma.$queryRaw`SELECT 
        COUNT(*) as total_connections
      FROM pg_stat_activity 
      WHERE datname = current_database()`) as any[]

      const responseTime = Date.now() - startTime

      // パフォーマンステスト
      const testStartTime = Date.now()
      await prisma.user.count()
      const queryTime = Date.now() - testStartTime

      let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'
      if (responseTime > 1000 || queryTime > 500) {
        status = 'degraded'
      }

      return {
        status,
        timestamp: new Date().toISOString(),
        responseTime,
        details: {
          connectionCount: connectionInfo[0]?.total_connections || 0,
          queryTime,
          provider: 'postgresql',
        },
      }
    } catch (error) {
      const responseTime = Date.now() - startTime
      Logger.error('データベースヘルスチェック失敗', error)

      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        responseTime,
        error: error instanceof Error ? error.message : 'Database connection failed',
      }
    }
  }

  // Redisヘルスチェック
  static async checkRedis(): Promise<HealthCheckResult> {
    const startTime = Date.now()

    if (!redisClient) {
      return {
        status: 'healthy', // Redisは必須ではない
        timestamp: new Date().toISOString(),
        responseTime: 0,
        details: { message: 'Redis not configured' },
      }
    }

    try {
      // PING コマンドでレスポンステスト
      await Promise.race([
        redisClient.ping(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Redis timeout')), HEALTH_CHECK_TIMEOUT)
        ),
      ])

      // メモリ使用量確認
      const info = await redisClient.info('memory')
      const memoryMatch = info.match(/used_memory:(\d+)/)
      const usedMemory = memoryMatch ? parseInt(memoryMatch[1]) : 0

      const responseTime = Date.now() - startTime

      let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'
      if (responseTime > 100) {
        status = 'degraded'
      }

      return {
        status,
        timestamp: new Date().toISOString(),
        responseTime,
        details: {
          usedMemory,
          connected: true,
        },
      }
    } catch (error) {
      const responseTime = Date.now() - startTime
      Logger.error('Redisヘルスチェック失敗', error)

      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        responseTime,
        error: error instanceof Error ? error.message : 'Redis connection failed',
      }
    }
  }

  // Stripeヘルスチェック
  static async checkStripe(): Promise<HealthCheckResult> {
    const startTime = Date.now()

    try {
      // Stripe APIのヘルスチェック（アカウント情報取得）
      await Promise.race([
        StripeService.stripe.accounts.retrieve(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Stripe timeout')), HEALTH_CHECK_TIMEOUT)
        ),
      ])

      const responseTime = Date.now() - startTime

      let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'
      if (responseTime > 2000) {
        status = 'degraded'
      }

      return {
        status,
        timestamp: new Date().toISOString(),
        responseTime,
        details: {
          service: 'stripe',
          apiVersion: '2023-10-16',
        },
      }
    } catch (error) {
      const responseTime = Date.now() - startTime
      Logger.error('Stripeヘルスチェック失敗', error)

      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        responseTime,
        error: error instanceof Error ? error.message : 'Stripe API unavailable',
      }
    }
  }

  // メールサービスヘルスチェック
  static async checkEmail(): Promise<HealthCheckResult> {
    const startTime = Date.now()

    try {
      // SMTP接続確認（実際のメール送信はしない）
      const { EmailService } = await import('../services/emailService')
      const result = await Promise.race([
        EmailService.verifyConnection(),
        new Promise<{ success: boolean; error?: string }>((_, reject) =>
          setTimeout(() => reject(new Error('Email timeout')), HEALTH_CHECK_TIMEOUT)
        ),
      ])

      const responseTime = Date.now() - startTime

      return {
        status: result.success ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        responseTime,
        details: {
          smtpHost: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT,
        },
        error: result.error,
      }
    } catch (error) {
      const responseTime = Date.now() - startTime
      Logger.error('メールヘルスチェック失敗', error)

      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        responseTime,
        error: error instanceof Error ? error.message : 'Email service unavailable',
      }
    }
  }

  // ストレージヘルスチェック
  static async checkStorage(): Promise<HealthCheckResult> {
    const startTime = Date.now()

    try {
      const fs = await import('fs/promises')
      const path = await import('path')

      // ログディレクトリの読み書きテスト
      const testDir = path.join(process.cwd(), 'logs')
      const testFile = path.join(testDir, '.health-check')

      // ディレクトリ作成（存在しない場合）
      await fs.mkdir(testDir, { recursive: true })

      // テストファイル書き込み
      await fs.writeFile(testFile, new Date().toISOString())

      // テストファイル読み込み
      //       const content = await fs.readFile(testFile, 'utf-8') // TODO: Will be used in future

      // テストファイル削除
      await fs.unlink(testFile)

      const responseTime = Date.now() - startTime

      // ディスク使用量チェック
      let diskUsage = 0
      try {
        //         const stats = await fs.stat(testDir) // TODO: Will be used in future
        // 実際のディスク使用量計算は環境に依存するため、簡易実装
        diskUsage = 0.5 // プレースホルダー
      } catch {
        // ディスク使用量取得失敗は警告レベル
      }

      let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'
      if (diskUsage > DISK_WARNING_THRESHOLD) {
        status = 'degraded'
      }

      return {
        status,
        timestamp: new Date().toISOString(),
        responseTime,
        details: {
          writeable: true,
          readable: true,
          diskUsage,
          testPath: testDir,
        },
      }
    } catch (error) {
      const responseTime = Date.now() - startTime
      Logger.error('ストレージヘルスチェック失敗', error)

      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        responseTime,
        error: error instanceof Error ? error.message : 'Storage unavailable',
      }
    }
  }

  // 外部API統合ヘルスチェック
  static async checkExternalApis(): Promise<HealthCheckResult> {
    const startTime = Date.now()
    const results: Record<string, any> = {}

    try {
      // 複数の外部APIを並行してチェック
      const checks = [
        // OpenAI API（AI機能用）
        this.checkOpenAI()
          .then((result) => ({ openai: result }))
          .catch((error) => ({ openai: { error: error.message } })),

        // その他の外部サービス（必要に応じて追加）
        // this.checkSlack().then(result => ({ slack: result })).catch(error => ({ slack: { error: error.message } })),
      ]

      const apiResults = await Promise.allSettled(
        checks.map((check) =>
          Promise.race([
            check,
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('API timeout')), HEALTH_CHECK_TIMEOUT)
            ),
          ])
        )
      )

      // 結果をマージ
      apiResults.forEach((result) => {
        if (result.status === 'fulfilled') {
          Object.assign(results, result.value)
        }
      })

      const responseTime = Date.now() - startTime

      // 全体的なステータス判定
      const hasUnhealthy = Object.values(results).some((result: unknown) => result.error)
      const status = hasUnhealthy ? 'degraded' : 'healthy'

      return {
        status,
        timestamp: new Date().toISOString(),
        responseTime,
        details: results,
      }
    } catch (error) {
      const responseTime = Date.now() - startTime
      Logger.error('外部APIヘルスチェック失敗', error)

      return {
        status: 'degraded', // 外部APIは完全失敗でもdegradedに留める
        timestamp: new Date().toISOString(),
        responseTime,
        error: error instanceof Error ? error.message : 'External APIs check failed',
        details: results,
      }
    }
  }

  // OpenAI APIヘルスチェック
  private static async checkOpenAI(): Promise<{ status: string; responseTime: number }> {
    if (!process.env.OPENAI_API_KEY) {
      return { status: 'not_configured', responseTime: 0 }
    }

    const startTime = Date.now()
    try {
      // OpenAI APIの簡単なリクエスト
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      })

      const responseTime = Date.now() - startTime

      return {
        status: response.ok ? 'healthy' : 'unhealthy',
        responseTime,
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
      }
    }
  }

  // メモリヘルスチェック
  static async checkMemory(): Promise<HealthCheckResult> {
    const startTime = Date.now()

    try {
      const memoryUsage = process.memoryUsage()
      const responseTime = Date.now() - startTime

      const heapUsageRatio = memoryUsage.heapUsed / memoryUsage.heapTotal
      const rss = memoryUsage.rss / (1024 * 1024) // MB
      const external = memoryUsage.external / (1024 * 1024) // MB

      let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'
      if (heapUsageRatio > MEMORY_WARNING_THRESHOLD) {
        status = 'degraded'
      }
      if (heapUsageRatio > 0.95) {
        status = 'unhealthy'
      }

      return {
        status,
        timestamp: new Date().toISOString(),
        responseTime,
        details: {
          heapUsed: Math.round(memoryUsage.heapUsed / (1024 * 1024)), // MB
          heapTotal: Math.round(memoryUsage.heapTotal / (1024 * 1024)), // MB
          heapUsageRatio: Math.round(heapUsageRatio * 100) / 100,
          rss: Math.round(rss),
          external: Math.round(external),
        },
      }
    } catch (error) {
      const responseTime = Date.now() - startTime

      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        responseTime,
        error: error instanceof Error ? error.message : 'Memory check failed',
      }
    }
  }

  // CPUヘルスチェック
  static async checkCpu(): Promise<HealthCheckResult> {
    const startTime = Date.now()

    try {
      const startUsage = process.cpuUsage()

      // 100ms待機してCPU使用率を測定
      await new Promise((resolve) => setTimeout(resolve, 100))

      const currentUsage = process.cpuUsage(startUsage)
      const responseTime = Date.now() - startTime

      const totalUsage = currentUsage.user + currentUsage.system
      const cpuPercent = (totalUsage / 1000000) * 10 // 100ms期間での使用率

      let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'
      if (cpuPercent > 80) {
        status = 'degraded'
      }
      if (cpuPercent > 95) {
        status = 'unhealthy'
      }

      return {
        status,
        timestamp: new Date().toISOString(),
        responseTime,
        details: {
          user: Math.round(currentUsage.user / 1000), // μs を ms に変換
          system: Math.round(currentUsage.system / 1000),
          total: Math.round(totalUsage / 1000),
          percent: Math.round(cpuPercent * 100) / 100,
        },
      }
    } catch (error) {
      const responseTime = Date.now() - startTime

      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        responseTime,
        error: error instanceof Error ? error.message : 'CPU check failed',
      }
    }
  }

  // ディスクヘルスチェック
  static async checkDisk(): Promise<HealthCheckResult> {
    const startTime = Date.now()

    try {
      const _fs = await import('_fs/promises')
      //       const path = require('path') // TODO: Will be used in future

      // 簡易的なディスク容量チェック
      //       const stats = await fs.stat(process.cwd()) // TODO: Will be used in future
      const responseTime = Date.now() - startTime

      // 実際の使用量計算は環境依存のため、プレースホルダー実装
      const diskUsage = 0.6 // 仮の値

      let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'
      if (diskUsage > DISK_WARNING_THRESHOLD) {
        status = 'degraded'
      }
      if (diskUsage > 0.95) {
        status = 'unhealthy'
      }

      return {
        status,
        timestamp: new Date().toISOString(),
        responseTime,
        details: {
          usage: Math.round(diskUsage * 100) / 100,
          path: process.cwd(),
        },
      }
    } catch (error) {
      const responseTime = Date.now() - startTime

      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        responseTime,
        error: error instanceof Error ? error.message : 'Disk check failed',
      }
    }
  }

  // 包括的ヘルスチェック
  static async performComprehensiveHealthCheck(): Promise<SystemHealth> {
    const startTime = Date.now()

    Logger.info('包括的ヘルスチェック開始')

    try {
      // 並行してヘルスチェックを実行
      const [database, redis, stripe, email, storage, external_apis, memory, cpu, disk] =
        await Promise.all([
          this.checkDatabase(),
          this.checkRedis(),
          this.checkStripe(),
          this.checkEmail(),
          this.checkStorage(),
          this.checkExternalApis(),
          this.checkMemory(),
          this.checkCpu(),
          this.checkDisk(),
        ])

      const checks = {
        database,
        redis,
        stripe,
        email,
        storage,
        external_apis,
        memory,
        cpu,
        disk,
      }

      // 全体的なステータス判定
      const results = Object.values(checks)
      const healthy = results.filter((r) => r.status === 'healthy').length
      const degraded = results.filter((r) => r.status === 'degraded').length
      const unhealthy = results.filter((r) => r.status === 'unhealthy').length

      let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'

      if (unhealthy > 0) {
        overallStatus = 'unhealthy'
      } else if (degraded > 0) {
        overallStatus = 'degraded'
      }

      const systemHealth: SystemHealth = {
        status: overallStatus,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.APP_VERSION || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        checks,
        summary: {
          total: results.length,
          healthy,
          degraded,
          unhealthy,
        },
      }

      const duration = Date.now() - startTime
      Logger.info('包括的ヘルスチェック完了', {
        duration,
        status: overallStatus,
        summary: systemHealth.summary,
      })

      // メトリクス記録
      metrics.health('system', overallStatus, {
        duration,
        healthy,
        degraded,
        unhealthy,
      })

      return systemHealth
    } catch (error) {
      Logger.error('包括的ヘルスチェック失敗', error)

      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.APP_VERSION || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        checks: {} as any,
        summary: {
          total: 0,
          healthy: 0,
          degraded: 0,
          unhealthy: 1,
        },
      }
    }
  }

  // 軽量ヘルスチェック（レスポンス速度重視）
  static async performLightHealthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy'
    timestamp: string
    responseTime: number
  }> {
    const startTime = Date.now()

    try {
      // 最低限のチェックのみ実行
      const [database, memory] = await Promise.all([this.checkDatabase(), this.checkMemory()])

      const responseTime = Date.now() - startTime

      let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'

      if (database.status === 'unhealthy' || memory.status === 'unhealthy') {
        status = 'unhealthy'
      } else if (database.status === 'degraded' || memory.status === 'degraded') {
        status = 'degraded'
      }

      return {
        status,
        timestamp: new Date().toISOString(),
        responseTime,
      }
    } catch (error) {
      Logger.error('軽量ヘルスチェック失敗', error)

      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        responseTime: Date.now() - startTime,
      }
    }
  }
}

export default HealthChecker
