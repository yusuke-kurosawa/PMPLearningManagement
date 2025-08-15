/**
 * 包括的ヘルスチェック・システム監視
 * Developer 6: Prometheus監視・ヘルスチェック・パフォーマンス測定実装
 */

import { z } from 'zod'

// ヘルスチェック設定スキーマ
const HealthCheckConfigSchema = z.object({
  timeout: z.number().positive().default(5000),
  retries: z.number().int().min(0).default(3),
  retryDelay: z.number().positive().default(1000),
  enableDetailedChecks: z.boolean().default(true),
  thresholds: z
    .object({
      responseTime: z.number().positive().default(1000),
      memoryUsage: z.number().min(0).max(1).default(0.9),
      diskUsage: z.number().min(0).max(1).default(0.9),
      cpuUsage: z.number().min(0).max(1).default(0.9),
    })
    .default({}),
})

export type HealthCheckConfig = z.infer<typeof HealthCheckConfigSchema>

// ヘルスステータス
export enum HealthStatus {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  UNHEALTHY = 'unhealthy',
  CRITICAL = 'critical',
}

// チェック結果
export interface CheckResult {
  name: string
  status: HealthStatus
  responseTime: number
  details: Record<string, unknown>
  error?: string
  timestamp: Date
}

// 全体的なヘルス状況
export interface HealthReport {
  status: HealthStatus
  version: string
  uptime: number
  timestamp: Date
  checks: CheckResult[]
  summary: {
    total: number
    healthy: number
    degraded: number
    unhealthy: number
    critical: number
  }
}

// ヘルスチェッカーのインターフェース
export interface HealthChecker {
  name: string
  check(): Promise<CheckResult>
}

/**
 * 包括的ヘルスチェックマネージャー
 */
export class HealthCheckManager {
  private config: HealthCheckConfig
  private checkers: Map<string, HealthChecker> = new Map()
  private startTime: Date = new Date()

  constructor(config?: Partial<HealthCheckConfig>) {
    this.config = HealthCheckConfigSchema.parse(config || {})

    // 基本チェッカーの登録
    this.registerDefaultCheckers()
  }

  /**
   * デフォルトチェッカーの登録
   */
  private registerDefaultCheckers(): void {
    // システム基本情報チェッカー
    this.registerChecker('system', new SystemHealthChecker(this.config))

    // メモリ使用量チェッカー
    this.registerChecker('memory', new MemoryHealthChecker(this.config))

    // ディスク使用量チェッカー（Node.js環境では限定的）
    this.registerChecker('disk', new DiskHealthChecker(this.config))

    // イベントループチェッカー
    this.registerChecker('event_loop', new EventLoopHealthChecker(this.config))
  }

  /**
   * カスタムヘルスチェッカーの登録
   */
  registerChecker(name: string, checker: HealthChecker): void {
    this.checkers.set(name, checker)
  }

  /**
   * ヘルスチェッカーの削除
   */
  unregisterChecker(name: string): boolean {
    return this.checkers.delete(name)
  }

  /**
   * 単一のヘルスチェックを実行
   */
  async runSingleCheck(checkerName: string): Promise<CheckResult | null> {
    const checker = this.checkers.get(checkerName)
    if (!checker) {
      return null
    }

    const startTime = Date.now()

    try {
      const result = await this.executeWithTimeout(checker.check(), this.config.timeout)

      result.responseTime = Date.now() - startTime
      return result
    } catch (error) {
      return {
        name: checker.name,
        status: HealthStatus.CRITICAL,
        responseTime: Date.now() - startTime,
        details: {},
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date(),
      }
    }
  }

  /**
   * すべてのヘルスチェックを実行
   */
  async runAllChecks(): Promise<HealthReport> {
    const checkPromises = Array.from(this.checkers.keys()).map((name) => this.runSingleCheck(name))

    const results = await Promise.allSettled(checkPromises)
    const checks: CheckResult[] = []

    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) {
        checks.push(result.value)
      } else if (result.status === 'rejected') {
        checks.push({
          name: 'unknown',
          status: HealthStatus.CRITICAL,
          responseTime: 0,
          details: {},
          error: 'Check execution failed',
          timestamp: new Date(),
        })
      }
    }

    return this.generateHealthReport(checks)
  }

  /**
   * ヘルスレポートの生成
   */
  private generateHealthReport(checks: CheckResult[]): HealthReport {
    const summary = {
      total: checks.length,
      healthy: 0,
      degraded: 0,
      unhealthy: 0,
      critical: 0,
    }

    // ステータス集計
    checks.forEach((check) => {
      switch (check.status) {
        case HealthStatus.HEALTHY:
          summary.healthy++
          break
        case HealthStatus.DEGRADED:
          summary.degraded++
          break
        case HealthStatus.UNHEALTHY:
          summary.unhealthy++
          break
        case HealthStatus.CRITICAL:
          summary.critical++
          break
      }
    })

    // 全体ステータスの決定
    let overallStatus = HealthStatus.HEALTHY
    if (summary.critical > 0) {
      overallStatus = HealthStatus.CRITICAL
    } else if (summary.unhealthy > 0) {
      overallStatus = HealthStatus.UNHEALTHY
    } else if (summary.degraded > 0) {
      overallStatus = HealthStatus.DEGRADED
    }

    return {
      status: overallStatus,
      version: process.env.npm_package_version || '1.0.0',
      uptime: Date.now() - this.startTime.getTime(),
      timestamp: new Date(),
      checks,
      summary,
    }
  }

  /**
   * タイムアウト付きでチェックを実行
   */
  private async executeWithTimeout<T>(promise: Promise<T>, timeout: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Health check timeout')), timeout)
      ),
    ])
  }

  /**
   * 簡単なヘルス確認（レスポンス高速化用）
   */
  async quickHealthCheck(): Promise<{ status: HealthStatus; uptime: number }> {
    try {
      const uptime = Date.now() - this.startTime.getTime()

      // 基本的なシステムチェックのみ
      const memUsage = process.memoryUsage()
      const memoryUsageRatio = memUsage.heapUsed / memUsage.heapTotal

      let status = HealthStatus.HEALTHY
      if (memoryUsageRatio > this.config.thresholds.memoryUsage) {
        status = HealthStatus.DEGRADED
      }

      return { status, uptime }
    } catch (error) {
      return { status: HealthStatus.CRITICAL, uptime: 0 }
    }
  }

  /**
   * ヘルスチェック結果のキャッシュ（パフォーマンス向上用）
   */
  private healthReportCache: { report: HealthReport; timestamp: number } | null = null
  private cacheTimeout: number = 30000 // 30秒

  async getCachedHealthReport(): Promise<HealthReport> {
    const now = Date.now()

    if (this.healthReportCache && now - this.healthReportCache.timestamp < this.cacheTimeout) {
      return this.healthReportCache.report
    }

    const report = await this.runAllChecks()
    this.healthReportCache = { report, timestamp: now }

    return report
  }

  /**
   * キャッシュのクリア
   */
  clearCache(): void {
    this.healthReportCache = null
  }
}

/**
 * システム基本情報ヘルスチェッカー
 */
export class SystemHealthChecker implements HealthChecker {
  name = 'system'
  private config: HealthCheckConfig

  constructor(config: HealthCheckConfig) {
    this.config = config
  }

  async check(): Promise<CheckResult> {
    const startTime = Date.now()

    try {
      const details = {
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version,
        pid: process.pid,
        uptime: process.uptime(),
        loadAverage: process.loadavg?.() || [],
      }

      // CPU使用率の概算（使用可能な場合）
      const cpuUsage = process.cpuUsage()
      const elapsedTime = process.hrtime()
      const totalTime = elapsedTime[0] * 1000 + elapsedTime[1] / 1000000
      const cpuPercent = (cpuUsage.user + cpuUsage.system) / 1000 / totalTime

      details.cpuUsage = {
        user: cpuUsage.user,
        system: cpuUsage.system,
        percent: Math.min(cpuPercent, 1.0),
      }

      let status = HealthStatus.HEALTHY
      if (cpuPercent > this.config.thresholds.cpuUsage) {
        status = HealthStatus.DEGRADED
      }

      return {
        name: this.name,
        status,
        responseTime: Date.now() - startTime,
        details,
        timestamp: new Date(),
      }
    } catch (error) {
      return {
        name: this.name,
        status: HealthStatus.CRITICAL,
        responseTime: Date.now() - startTime,
        details: {},
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date(),
      }
    }
  }
}

/**
 * メモリ使用量ヘルスチェッカー
 */
export class MemoryHealthChecker implements HealthChecker {
  name = 'memory'
  private config: HealthCheckConfig

  constructor(config: HealthCheckConfig) {
    this.config = config
  }

  async check(): Promise<CheckResult> {
    const startTime = Date.now()

    try {
      const memUsage = process.memoryUsage()
      const memoryUsageRatio = memUsage.heapUsed / memUsage.heapTotal

      const details = {
        heapUsed: memUsage.heapUsed,
        heapTotal: memUsage.heapTotal,
        external: memUsage.external,
        rss: memUsage.rss,
        usageRatio: memoryUsageRatio,
        threshold: this.config.thresholds.memoryUsage,
      }

      let status = HealthStatus.HEALTHY
      if (memoryUsageRatio > this.config.thresholds.memoryUsage) {
        status = HealthStatus.CRITICAL
      } else if (memoryUsageRatio > this.config.thresholds.memoryUsage * 0.8) {
        status = HealthStatus.DEGRADED
      }

      return {
        name: this.name,
        status,
        responseTime: Date.now() - startTime,
        details,
        timestamp: new Date(),
      }
    } catch (error) {
      return {
        name: this.name,
        status: HealthStatus.CRITICAL,
        responseTime: Date.now() - startTime,
        details: {},
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date(),
      }
    }
  }
}

/**
 * ディスク使用量ヘルスチェッカー（簡略版）
 */
export class DiskHealthChecker implements HealthChecker {
  name = 'disk'
  private config: HealthCheckConfig

  constructor(config: HealthCheckConfig) {
    this.config = config
  }

  async check(): Promise<CheckResult> {
    const startTime = Date.now()

    try {
      // Node.js環境では詳細なディスク情報は取得困難なため、
      // ファイルシステムの基本的な読み書き確認を行う
      const fs = await import('fs').then((m) => m.promises)
      const tmpFile = `/tmp/health-check-${Date.now()}`

      await fs.writeFile(tmpFile, 'health check')
      const content = await fs.readFile(tmpFile, 'utf8')
      await fs.unlink(tmpFile)

      const details = {
        fileSystemAccessible: content === 'health check',
        tmpDirectory: '/tmp',
        canWrite: true,
        canRead: true,
      }

      return {
        name: this.name,
        status: HealthStatus.HEALTHY,
        responseTime: Date.now() - startTime,
        details,
        timestamp: new Date(),
      }
    } catch (error) {
      return {
        name: this.name,
        status: HealthStatus.UNHEALTHY,
        responseTime: Date.now() - startTime,
        details: { fileSystemAccessible: false },
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date(),
      }
    }
  }
}

/**
 * イベントループ遅延チェッカー
 */
export class EventLoopHealthChecker implements HealthChecker {
  name = 'event_loop'
  private config: HealthCheckConfig

  constructor(config: HealthCheckConfig) {
    this.config = config
  }

  async check(): Promise<CheckResult> {
    const startTime = Date.now()

    return new Promise<CheckResult>((resolve) => {
      const start = process.hrtime()

      setImmediate(() => {
        const delta = process.hrtime(start)
        const lag = delta[0] * 1000 + delta[1] / 1000000 // ms

        const details = {
          eventLoopLag: lag,
          threshold: 10, // 10ms以上は警告
        }

        let status = HealthStatus.HEALTHY
        if (lag > 100) {
          status = HealthStatus.CRITICAL
        } else if (lag > 50) {
          status = HealthStatus.UNHEALTHY
        } else if (lag > 10) {
          status = HealthStatus.DEGRADED
        }

        resolve({
          name: this.name,
          status,
          responseTime: Date.now() - startTime,
          details,
          timestamp: new Date(),
        })
      })
    })
  }
}

/**
 * データベースヘルスチェッカー
 */
export class DatabaseHealthChecker implements HealthChecker {
  name = 'database'
  private config: HealthCheckConfig
  private connectionTest: () => Promise<boolean>

  constructor(config: HealthCheckConfig, connectionTest: () => Promise<boolean>) {
    this.config = config
    this.connectionTest = connectionTest
  }

  async check(): Promise<CheckResult> {
    const startTime = Date.now()

    try {
      const isConnected = await this.connectionTest()
      const responseTime = Date.now() - startTime

      const details = {
        connected: isConnected,
        responseTime: responseTime,
        threshold: this.config.thresholds.responseTime,
      }

      let status = HealthStatus.HEALTHY
      if (!isConnected) {
        status = HealthStatus.CRITICAL
      } else if (responseTime > this.config.thresholds.responseTime) {
        status = HealthStatus.DEGRADED
      }

      return {
        name: this.name,
        status,
        responseTime,
        details,
        timestamp: new Date(),
      }
    } catch (error) {
      return {
        name: this.name,
        status: HealthStatus.CRITICAL,
        responseTime: Date.now() - startTime,
        details: { connected: false },
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date(),
      }
    }
  }
}

/**
 * Redisヘルスチェッカー
 */
export class RedisHealthChecker implements HealthChecker {
  name = 'redis'
  private config: HealthCheckConfig
  private pingTest: () => Promise<string>

  constructor(config: HealthCheckConfig, pingTest: () => Promise<string>) {
    this.config = config
    this.pingTest = pingTest
  }

  async check(): Promise<CheckResult> {
    const startTime = Date.now()

    try {
      const result = await this.pingTest()
      const responseTime = Date.now() - startTime

      const details = {
        connected: result === 'PONG',
        responseTime: responseTime,
        pingResult: result,
        threshold: this.config.thresholds.responseTime,
      }

      let status = HealthStatus.HEALTHY
      if (result !== 'PONG') {
        status = HealthStatus.CRITICAL
      } else if (responseTime > this.config.thresholds.responseTime) {
        status = HealthStatus.DEGRADED
      }

      return {
        name: this.name,
        status,
        responseTime,
        details,
        timestamp: new Date(),
      }
    } catch (error) {
      return {
        name: this.name,
        status: HealthStatus.CRITICAL,
        responseTime: Date.now() - startTime,
        details: { connected: false },
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date(),
      }
    }
  }
}

// エクスポート用インスタンス
export const healthCheckManager = new HealthCheckManager({
  timeout: 5000,
  enableDetailedChecks: true,
  thresholds: {
    responseTime: 1000,
    memoryUsage: 0.85,
    diskUsage: 0.9,
    cpuUsage: 0.8,
  },
})

export default {
  HealthCheckManager,
  SystemHealthChecker,
  MemoryHealthChecker,
  DiskHealthChecker,
  EventLoopHealthChecker,
  DatabaseHealthChecker,
  RedisHealthChecker,
  HealthStatus,
  healthCheckManager,
}
