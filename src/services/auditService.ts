/**
 * 監査ログサービス
 * @description セキュリティ監査、ユーザー行動追跡、不正アクセス検知を提供
 * @author Claude Code Actions
 * @version 2.0.0
 * @since 2025-08-14
 */

import { supabase } from '../lib/supabase'
import { logger } from './logger'

// ========================================
// 型定義
// ========================================

/**
 * 監査イベント種別列挙型
 * @description システム内で発生する全ての監査可能なイベントを定義
 */
export const AuditEventTypes = {
  // Authentication events
  USER_REGISTERED: 'user_registered',
  USER_LOGGED_IN: 'user_logged_in',
  USER_LOGGED_OUT: 'user_logged_out',
  LOGIN_FAILED: 'login_failed',
  LOGIN_ATTEMPT_BLOCKED: 'login_attempt_blocked',
  PASSWORD_RESET_REQUESTED: 'password_reset_requested',
  PASSWORD_UPDATED: 'password_updated',
  EMAIL_VERIFIED: 'email_verified',
  MFA_ENABLED: 'mfa_enabled',
  MFA_DISABLED: 'mfa_disabled',
  MFA_VERIFIED: 'mfa_verified',
  OAUTH_LOGIN_INITIATED: 'oauth_login_initiated',

  // Authorization events
  PERMISSION_GRANTED: 'permission_granted',
  PERMISSION_DENIED: 'permission_denied',
  ROLE_ASSIGNED: 'role_assigned',
  ROLE_REVOKED: 'role_revoked',

  // Data access events
  DATA_ACCESSED: 'data_accessed',
  DATA_CREATED: 'data_created',
  DATA_UPDATED: 'data_updated',
  DATA_DELETED: 'data_deleted',
  DATA_EXPORTED: 'data_exported',

  // Security events
  SUSPICIOUS_ACTIVITY: 'suspicious_activity',
  RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded',
  INVALID_TOKEN: 'invalid_token',
  SESSION_HIJACK_ATTEMPT: 'session_hijack_attempt',
  XSS_ATTEMPT: 'xss_attempt',
  SQL_INJECTION_ATTEMPT: 'sql_injection_attempt',

  // Administrative events
  SETTINGS_CHANGED: 'settings_changed',
  USER_CREATED: 'user_created',
  USER_UPDATED: 'user_updated',
  USER_DELETED: 'user_deleted',
  USER_SUSPENDED: 'user_suspended',
  USER_ACTIVATED: 'user_activated',
}

/**
 * 監査イベント重要度レベル
 * @description イベントの重要度を4段階で分類
 */
export enum AuditSeverity {
  /** 情報レベル - 通常の操作 */
  INFO = 'info',
  /** 警告レベル - 注意が必要な操作 */
  WARNING = 'warning',
  /** エラーレベル - 問題のある操作 */
  ERROR = 'error',
  /** 重要レベル - 即座に対応が必要な操作 */
  CRITICAL = 'critical',
}

/**
 * 監査イベント入力インターフェース
 */
export interface AuditEvent {
  /** アクション種別 */
  action: string
  /** ユーザーID（オプション） */
  userId?: string
  /** 重要度（オプション、自動判定される） */
  severity?: AuditSeverity
  /** イベント詳細情報 */
  details?: Record<string, unknown>
  /** 追加メタデータ */
  metadata?: Record<string, unknown>
}

/**
 * 監査ログエントリ完全構造
 */
export interface AuditLogEntry {
  /** エントリ一意ID */
  id: string
  /** イベント発生時刻 */
  timestamp: string
  /** アクション種別 */
  action: string
  /** ユーザーID */
  user_id: string | null
  /** セッションID */
  session_id: string
  /** 重要度レベル */
  severity: AuditSeverity
  /** イベント詳細 */
  details: Record<string, unknown>
  /** IPアドレス */
  ip_address: string | null
  /** ユーザーエージェント */
  user_agent: string
  /** ブラウザ種別 */
  browser: string
  /** OS種別 */
  os: string
  /** デバイス種別 */
  device_type: string
  /** 地理的位置 */
  location: string | null
  /** 追加メタデータ */
  metadata: Record<string, unknown>
}

/**
 * クライアント情報インターフェース
 */
interface ClientInfo {
  /** IPアドレス（サーバーサイドで設定） */
  ipAddress: string | null
  /** ユーザーエージェント文字列 */
  userAgent: string
  /** ブラウザ種別 */
  browser: string
  /** OS種別 */
  os: string
  /** デバイス種別 */
  deviceType: string
  /** 地理的位置（サーバーサイドで設定） */
  location: string | null
}

/**
 * 監査ログクエリフィルター
 */
export interface AuditLogFilters {
  /** ユーザーID */
  userId?: string
  /** アクション種別 */
  action?: string
  /** 重要度レベル */
  severity?: AuditSeverity
  /** 開始日時 */
  startDate?: string
  /** 終了日時 */
  endDate?: string
  /** 取得件数制限 */
  limit?: number
}

/**
 * セキュリティメトリクス情報
 */
export interface SecurityMetrics {
  /** 総イベント数 */
  totalEvents: number
  /** ログイン失敗数 */
  failedLogins: number
  /** ログイン成功数 */
  successfulLogins: number
  /** 疑わしい活動数 */
  suspiciousActivities: number
  /** ユニークユーザー数 */
  uniqueUsers: number
  /** アクション別イベント数 */
  eventsByAction: Record<string, number>
  /** 重要度別イベント数 */
  eventsBySeverity: Record<string, number>
  /** 時間別イベント数 */
  eventsByHour: Record<number, number>
}

/**
 * 疑わしいパターン検知結果
 */
export interface SuspiciousPatterns {
  /** 連続ログイン失敗 */
  rapidFailedLogins: boolean
  /** 異常な地理的位置 */
  unusualLocation: boolean
  /** 複数デバイス同時使用 */
  multipleDevices: boolean
  /** 疑わしい操作 */
  suspiciousActions: boolean
}

/**
 * 時間範囲指定タイプ
 */
export type TimeRange = '1h' | '24h' | '7d' | '30d'

// ========================================
// メイン監査ログサービスクラス
// ========================================

/**
 * 監査ログサービスクラス
 * @description セキュリティ監査とログ管理の中核機能を提供
 */
class AuditLogger {
  /** ログキューバッファ */
  private queue: AuditLogEntry[] = []

  /** バッチ処理サイズ */
  private readonly batchSize: number

  /** フラッシュ間隔（ミリ秒） */
  private readonly flushInterval: number

  /** 監査ログ有効フラグ */
  private readonly isEnabled: boolean
  /**
   * コンストラクタ
   * @description 監査ログサービスの初期化
   */
  constructor() {
    this.batchSize = 10
    this.flushInterval = 5000 // 5秒
    this.isEnabled = import.meta.env.VITE_ENABLE_AUDIT_LOG === 'true'

    // バッチ処理開始
    if (this.isEnabled) {
      this.startBatchProcessing()
    }
  }

  // ========================================
  // 公開メソッド - ログ記録
  // ========================================

  /**
   * 監査イベントのログ記録
   * @param event - 監査イベント情報
   * @returns Promise<void>
   */
  async log(event: AuditEvent): Promise<void> {
    if (!this.isEnabled) {return}

    try {
      const auditEntry = this.createAuditEntry(event)

      // Add to queue for batch processing
      this.queue.push(auditEntry)

      // Flush if queue is full
      if (this.queue.length >= this.batchSize) {
        await this.flush()
      }

      // For critical events, flush immediately
      if (event.severity === AuditSeverity.CRITICAL) {
        await this.flush()
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('Audit logging error:', error)
      }
    }
  }

  // ========================================
  // プライベートメソッド - ログエントリ作成
  // ========================================

  /**
   * 監査ログエントリ作成
   * @param event - 監査イベント
   * @returns 完全な監査ログエントリ
   * @private
   */
  private createAuditEntry(event: AuditEvent): AuditLogEntry {
    const timestamp = new Date().toISOString()
    const sessionId = this.getSessionId()
    const clientInfo = this.getClientInfo()

    return {
      id: this.generateId(),
      timestamp,
      action: event.action,
      user_id: event.userId || null,
      session_id: sessionId,
      severity: event.severity || this.getSeverityForAction(event.action),
      details: event.details || {},
      ip_address: clientInfo.ipAddress,
      user_agent: clientInfo.userAgent,
      browser: clientInfo.browser,
      os: clientInfo.os,
      device_type: clientInfo.deviceType,
      location: clientInfo.location,
      metadata: {
        ...event.metadata,
        client_timestamp: timestamp,
        page_url: window.location.href,
        referrer: document.referrer,
      },
    }
  }

  /**
   * バッチログ保存（フラッシュ）
   * @returns Promise<void>
   * @private
   */
  private async flush(): Promise<void> {
    if (this.queue.length === 0) {return}

    const batch = [...this.queue]
    this.queue = []

    try {
      const { error } = await supabase.from('audit_logs').insert(batch)

      if (error) {
        if (process.env.NODE_ENV === 'development') {
          logger.error('Failed to insert audit logs:', error)
        }
        // Re-add to queue on failure
        this.queue.unshift(...batch)
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('Audit flush error:', error)
      }
      // Re-add to queue on failure
      this.queue.unshift(...batch)
    }
  }

  /**
   * バッチ処理タイマー開始
   * @private
   */
  private startBatchProcessing(): void {
    setInterval(() => {
      this.flush()
    }, this.flushInterval)

    // Flush on page unload
    window.addEventListener('beforeunload', () => {
      this.flush()
    })
  }

  /**
   * アクションに基づく重要度判定
   * @param action - アクション種別
   * @returns 重要度レベル
   * @private
   */
  private getSeverityForAction(action: string): AuditSeverity {
    const criticalActions = [
      AuditEventTypes.SESSION_HIJACK_ATTEMPT,
      AuditEventTypes.XSS_ATTEMPT,
      AuditEventTypes.SQL_INJECTION_ATTEMPT,
    ]

    const warningActions = [
      AuditEventTypes.LOGIN_FAILED,
      AuditEventTypes.LOGIN_ATTEMPT_BLOCKED,
      AuditEventTypes.PERMISSION_DENIED,
      AuditEventTypes.RATE_LIMIT_EXCEEDED,
      AuditEventTypes.SUSPICIOUS_ACTIVITY,
    ]

    const errorActions = [AuditEventTypes.INVALID_TOKEN]

    if (criticalActions.includes(action)) {return AuditSeverity.CRITICAL}
    if (warningActions.includes(action)) {return AuditSeverity.WARNING}
    if (errorActions.includes(action)) {return AuditSeverity.ERROR}

    return AuditSeverity.INFO
  }

  /**
   * 一意ID生成（暗号学的に安全）
   * @returns 生成されたID
   * @private
   */
  private generateId(): string {
    const timestamp = Date.now()
    
    try {
      // Web Crypto APIを使用した安全な乱数生成
      if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
        const randomArray = new Uint8Array(16)
        window.crypto.getRandomValues(randomArray)
        const randomString = Array.from(randomArray, byte => byte.toString(36)).join('')
        return `${timestamp}-${randomString}`
      }
      
      // Node.js環境での安全な乱数生成
      if (typeof require !== 'undefined') {
        try {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const crypto = require('crypto')
          const randomBytes = crypto.randomBytes(16)
          const randomString = randomBytes.toString('hex').substring(0, 12)
          return `${timestamp}-${randomString}`
        } catch (nodeError) {
          console.warn('Node.js crypto module利用不可:', nodeError)
        }
      }
      
      // 最終フォールバック（開発環境専用、暗号学的に安全でない）
      console.warn('⚠️ セキュリティ警告: 開発環境フォールバック使用。本番環境ではCrypto APIが必要です。')
      const timestamp_suffix = Date.now().toString(36)
      const counter = (this.fallbackCounter = (this.fallbackCounter || 0) + 1)
      return `${timestamp}-dev-${timestamp_suffix}-${counter.toString(36)}`
      
    } catch (error) {
      console.error('ID生成エラー:', error)
      // 緊急フォールバック（タイムスタンプベース）
      return `${timestamp}-emergency-${timestamp.toString(36)}`
    }
  }

  private fallbackCounter: number = 0

  /**
   * セッションID取得（セッションストレージから）
   * @returns セッションID
   * @private
   */
  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('audit_session_id')
    if (!sessionId) {
      sessionId = this.generateId()
      sessionStorage.setItem('audit_session_id', sessionId)
    }
    return sessionId
  }

  /**
   * クライアント情報取得
   * @returns クライアント詳細情報
   * @private
   */
  private getClientInfo(): ClientInfo {
    const userAgent = navigator.userAgent
    const platform = navigator.platform

    // Detect browser
    let browser = 'Unknown'
    if (userAgent.includes('Firefox')) {browser = 'Firefox'}
    else if (userAgent.includes('Chrome')) {browser = 'Chrome'}
    else if (userAgent.includes('Safari')) {browser = 'Safari'}
    else if (userAgent.includes('Edge')) {browser = 'Edge'}

    // Detect OS
    let os = 'Unknown'
    if (platform.includes('Win')) {os = 'Windows'}
    else if (platform.includes('Mac')) {os = 'macOS'}
    else if (platform.includes('Linux')) {os = 'Linux'}
    else if (userAgent.includes('Android')) {os = 'Android'}
    else if (userAgent.includes('iOS')) {os = 'iOS'}

    // Detect device type
    let deviceType = 'Desktop'
    if (/Mobile|Android|iPhone|iPad/i.test(userAgent)) {
      deviceType = 'Mobile'
    } else if (/Tablet|iPad/i.test(userAgent)) {
      deviceType = 'Tablet'
    }

    return {
      ipAddress: null, // Will be set by backend
      userAgent,
      browser,
      os,
      deviceType,
      location: null, // Will be set by backend based on IP
    }
  }

  // ========================================
  // 公開メソッド - ログ検索・分析
  // ========================================

  /**
   * 監査ログクエリ実行
   * @param filters - 検索フィルター
   * @returns 監査ログエントリ配列
   */
  async queryLogs(filters: AuditLogFilters = {}): Promise<AuditLogEntry[]> {
    try {
      let query = supabase.from('audit_logs').select('*').order('timestamp', { ascending: false })

      // Apply filters
      if (filters.userId) {
        query = query.eq('user_id', filters.userId)
      }

      if (filters.action) {
        query = query.eq('action', filters.action)
      }

      if (filters.severity) {
        query = query.eq('severity', filters.severity)
      }

      if (filters.startDate) {
        query = query.gte('timestamp', filters.startDate)
      }

      if (filters.endDate) {
        query = query.lte('timestamp', filters.endDate)
      }

      if (filters.limit) {
        query = query.limit(filters.limit)
      }

      const { data, error } = await query

      if (error) {throw error}

      return data
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('Query audit logs error:', error)
      }
      throw error
    }
  }

  /**
   * セキュリティメトリクス取得
   * @param timeRange - 時間範囲
   * @returns セキュリティメトリクス情報
   */
  async getSecurityMetrics(timeRange: TimeRange = '24h'): Promise<SecurityMetrics> {
    try {
      const now = new Date()
      let startDate

      switch (timeRange) {
        case '1h':
          startDate = new Date(now - 60 * 60 * 1000)
          break
        case '24h':
          startDate = new Date(now - 24 * 60 * 60 * 1000)
          break
        case '7d':
          startDate = new Date(now - 7 * 24 * 60 * 60 * 1000)
          break
        case '30d':
          startDate = new Date(now - 30 * 24 * 60 * 60 * 1000)
          break
        default:
          startDate = new Date(now - 24 * 60 * 60 * 1000)
      }

      const logs = await this.queryLogs({
        startDate: startDate.toISOString(),
        endDate: now.toISOString(),
      })

      // Calculate metrics
      const metrics = {
        totalEvents: logs.length,
        failedLogins: logs.filter((l) => l.action === AuditEventTypes.LOGIN_FAILED).length,
        successfulLogins: logs.filter((l) => l.action === AuditEventTypes.USER_LOGGED_IN).length,
        suspiciousActivities: logs.filter(
          (l) => l.severity === AuditSeverity.WARNING || l.severity === AuditSeverity.CRITICAL
        ).length,
        uniqueUsers: new Set(logs.map((l) => l.user_id).filter(Boolean)).size,
        eventsByAction: {},
        eventsBySeverity: {},
        eventsByHour: {},
      }

      // Group by action
      logs.forEach((log) => {
        metrics.eventsByAction[log.action] = (metrics.eventsByAction[log.action] || 0) + 1
        metrics.eventsBySeverity[log.severity] = (metrics.eventsBySeverity[log.severity] || 0) + 1

        const hour = new Date(log.timestamp).getHours()
        metrics.eventsByHour[hour] = (metrics.eventsByHour[hour] || 0) + 1
      })

      return metrics
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('Get security metrics error:', error)
      }
      throw error
    }
  }

  /**
   * 疑わしいパターン検知
   * @param userId - 対象ユーザーID
   * @returns 疑わしいパターン検知結果
   */
  async detectSuspiciousPatterns(userId: string): Promise<SuspiciousPatterns | null> {
    try {
      const recentLogs = await this.queryLogs({
        userId,
        startDate: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // Last hour
      })

      const patterns = {
        rapidFailedLogins: false,
        unusualLocation: false,
        multipleDevices: false,
        suspiciousActions: false,
      }

      // Check for rapid failed logins
      const failedLogins = recentLogs.filter((l) => l.action === AuditEventTypes.LOGIN_FAILED)
      if (failedLogins.length > 3) {
        patterns.rapidFailedLogins = true
      }

      // Check for multiple devices
      const devices = new Set(recentLogs.map((l) => l.device_type))
      if (devices.size > 2) {
        patterns.multipleDevices = true
      }

      // Check for suspicious actions
      const suspiciousActions = recentLogs.filter(
        (l) => l.severity === AuditSeverity.WARNING || l.severity === AuditSeverity.CRITICAL
      )
      if (suspiciousActions.length > 0) {
        patterns.suspiciousActions = true
      }

      return patterns
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('Detect suspicious patterns error:', error)
      }
      return null
    }
  }
}

// ========================================
// エクスポート
// ========================================

/** 監査ログサービスシングルトンインスタンス */
export const auditLogger = new AuditLogger()
export default auditLogger
