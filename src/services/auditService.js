/**
 * フロントエンドサービス・状態管理実装
 * Developer 9: React専門・状態管理
 * 技術スタック: React Context, Zustand, Custom Hooks
 * セキュリティレベル: Medium
 * 最終更新: {updated}
 */
import { supabase } from '../lib/supabase'

// Audit event types
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

// Severity levels
export const AuditSeverity = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical',
}

class AuditLogger {
  constructor() {
    this.queue = []
    this.batchSize = 10
    this.flushInterval = 5000 // 5 seconds
    this.isEnabled = import.meta.env.VITE_ENABLE_AUDIT_LOG === 'true'

    // Start batch processing
    if (this.isEnabled) {
      this.startBatchProcessing()
    }
  }

  // Log an audit event
  async log(event) {
    if (!this.isEnabled) return

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
      console.error('Audit logging error:', error)
    }
  }

  // Create audit entry
  createAuditEntry(event) {
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

  // Batch insert audit logs
  async flush() {
    if (this.queue.length === 0) return

    const batch = [...this.queue]
    this.queue = []

    try {
      const { error } = await supabase.from('audit_logs').insert(batch)

      if (error) {
        console.error('Failed to insert audit logs:', error)
        // Re-add to queue on failure
        this.queue.unshift(...batch)
      }
    } catch (error) {
      console.error('Audit flush error:', error)
      // Re-add to queue on failure
      this.queue.unshift(...batch)
    }
  }

  // Start batch processing timer
  startBatchProcessing() {
    setInterval(() => {
      this.flush()
    }, this.flushInterval)

    // Flush on page unload
    window.addEventListener('beforeunload', () => {
      this.flush()
    })
  }

  // Get severity level for action
  getSeverityForAction(action) {
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

    if (criticalActions.includes(action)) return AuditSeverity.CRITICAL
    if (warningActions.includes(action)) return AuditSeverity.WARNING
    if (errorActions.includes(action)) return AuditSeverity.ERROR

    return AuditSeverity.INFO
  }

  // Generate unique ID
  generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  // Get session ID
  getSessionId() {
    let sessionId = sessionStorage.getItem('audit_session_id')
    if (!sessionId) {
      sessionId = this.generateId()
      sessionStorage.setItem('audit_session_id', sessionId)
    }
    return sessionId
  }

  // Get client information
  getClientInfo() {
    const userAgent = navigator.userAgent
    const platform = navigator.platform

    // Detect browser
    let browser = 'Unknown'
    if (userAgent.includes('Firefox')) browser = 'Firefox'
    else if (userAgent.includes('Chrome')) browser = 'Chrome'
    else if (userAgent.includes('Safari')) browser = 'Safari'
    else if (userAgent.includes('Edge')) browser = 'Edge'

    // Detect OS
    let os = 'Unknown'
    if (platform.includes('Win')) os = 'Windows'
    else if (platform.includes('Mac')) os = 'macOS'
    else if (platform.includes('Linux')) os = 'Linux'
    else if (userAgent.includes('Android')) os = 'Android'
    else if (userAgent.includes('iOS')) os = 'iOS'

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

  // Query audit logs
  async queryLogs(filters = {}) {
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

      if (error) throw error

      return data
    } catch (error) {
      console.error('Query audit logs error:', error)
      throw error
    }
  }

  // Get security metrics
  async getSecurityMetrics(timeRange = '24h') {
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
      console.error('Get security metrics error:', error)
      throw error
    }
  }

  // Detect suspicious patterns
  async detectSuspiciousPatterns(userId) {
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
      console.error('Detect suspicious patterns error:', error)
      return null
    }
  }
}

export const auditLogger = new AuditLogger()
export default auditLogger
