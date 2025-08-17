/**
 * Enterprise SLO/SLI Management System
 * 10,000+ user scale monitoring
 */

import { EventEmitter } from 'events'
import client from 'prom-client'
import { Logger } from './logger'
import {} from './metrics'

// SLO Target Definition
interface SLOTarget {
  id: string
  name: string
  description: string
  threshold: number // 0.0 - 1.0
  timeWindow: string // '1m', '5m', '1h', '24h', '7d', '30d'
  category: SLOCategory
  severity: SLOSeverity
  query: string // Prometheus query
  alertThresholds: {
    warning: number
    critical: number
    emergency: number
  }
}

enum SLOCategory {
  AVAILABILITY = 'availability',
  PERFORMANCE = 'performance',
  QUALITY = 'quality',
  BUSINESS = 'business',
}

enum SLOSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

interface SLOViolation {
  sloId: string
  timestamp: Date
  currentValue: number
  threshold: number
  severity: SLOSeverity
  details: unknown
  resolved: boolean
  resolvedAt?: Date
}

interface AlertConfig {
  channels: string[] // ['slack', 'email', 'pagerduty']
  recipients: string[]
  cooldownPeriod: number // minutes
  escalationDelay: number // minutes
}

/**
 * SLO/SLI Management System
 */
export class SLOManager extends EventEmitter {
  private sloTargets: Map<string, SLOTarget> = new Map()
  private violations: Map<string, SLOViolation[]> = new Map()
  private alertConfigs: Map<string, AlertConfig> = new Map()
  private monitoringInterval: NodeJS.Timer | null = null
  private prometheusRegistry: client.Registry

  // SLO Compliance private sloComplianceGauge: client.Gauge<string>
  private sloViolationsCounter: client.Counter<string>
  private alertsSentCounter: client.Counter<string>
  private errorBudgetGauge: client.Gauge<string>

  constructor() {
    super()
    this.prometheusRegistry = new client.Registry()
    this.initialize()
    this.setupDefaultSLOs()
    this.startMonitoring()

    Logger.info('SLO Manager initialized with enterprise monitoring')
  }

  private initializeMetrics(): void {
    this.sloComplianceGauge = new client.Gauge({
      name: 'pmp_learning_slo_compliance_ratio',
      help: 'SLO compliance ratio (0-1)',
      labelNames: ['slo_id', 'slo_name', 'category', 'time_window'],
      registers: [this.prometheusRegistry],
    })

    this.sloViolationsCounter = new client.Counter({
      name: 'pmp_learning_slo_violations_total',
      help: 'Total number of SLO violations',
      labelNames: ['slo_id', 'severity', 'category'],
      registers: [this.prometheusRegistry],
    })

    this.alertsSentCounter = new client.Counter({
      name: 'pmp_learning_alerts_sent_total',
      help: 'Total number of alerts sent',
      labelNames: ['slo_id', 'channel', 'severity'],
      registers: [this.prometheusRegistry],
    })

    this.errorBudgetGauge = new client.Gauge({
      name: 'pmp_learning_error_budget_remaining',
      help: 'Remaining error budget (0-1)',
      labelNames: ['slo_id', 'time_window'],
      registers: [this.prometheusRegistry],
    })
  }

  private setupDefaultSLOs(): void {
    // === Availability SLO ===
    this.addSLO({
      id: 'availability_99_9',
      name: 'Service Availability 99.9%',
      description: 'API endpoints must be available 99.9% of the time',
      threshold: 0.999,
      timeWindow: '24h',
      category: SLOCategory.AVAILABILITY,
      severity: SLOSeverity.CRITICAL,
      query:
        'sum(rate(http_requests_total{status_code!~"5.."}[5m])) / sum(rate(http_requests_total[5m]))',
      alertThresholds: {
        warning: 0.995,
        critical: 0.99,
        emergency: 0.985,
      },
    })

    // === Performance SLO ===
    this.addSLO({
      id: 'latency_p95_500ms',
      name: 'Response Time P95 < 500ms',
      description: '95% of requests must complete within 500ms',
      threshold: 0.5,
      timeWindow: '5m',
      category: SLOCategory.PERFORMANCE,
      severity: SLOSeverity.HIGH,
      query: 'histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))',
      alertThresholds: {
        warning: 0.4,
        critical: 0.6,
        emergency: 1.0,
      },
    })

    this.addSLO({
      id: 'latency_p99_1s',
      name: 'Response Time P99 < 1s',
      description: '99% of requests must complete within 1 second',
      threshold: 1.0,
      timeWindow: '5m',
      category: SLOCategory.PERFORMANCE,
      severity: SLOSeverity.MEDIUM,
      query: 'histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m]))',
      alertThresholds: {
        warning: 0.8,
        critical: 1.2,
        emergency: 2.0,
      },
    })

    // === Business SLO ===
    this.addSLO({
      id: 'exam_pass_rate_75',
      name: 'Exam Pass Rate > 75%',
      description: 'Monthly exam pass rate should exceed 75%',
      threshold: 0.75,
      timeWindow: '30d',
      category: SLOCategory.BUSINESS,
      severity: SLOSeverity.MEDIUM,
      query: 'sum(exam_attempts_total{result="pass"}) / sum(exam_attempts_total)',
      alertThresholds: {
        warning: 0.7,
        critical: 0.65,
        emergency: 0.6,
      },
    })

    this.addSLO({
      id: 'learning_completion_80',
      name: 'Learning Completion Rate > 80%',
      description: 'Weekly learning completion rate should exceed 80%',
      threshold: 0.8,
      timeWindow: '7d',
      category: SLOCategory.BUSINESS,
      severity: SLOSeverity.LOW,
      query: 'sum(learning_sessions_total{completed="true"}) / sum(learning_sessions_total)',
      alertThresholds: {
        warning: 0.75,
        critical: 0.7,
        emergency: 0.65,
      },
    })

    // === Quality SLO ===
    this.addSLO({
      id: 'data_accuracy_99_5',
      name: 'Data Accuracy > 99.5%',
      description: 'Database operations must have 99.5% accuracy',
      threshold: 0.995,
      timeWindow: '1h',
      category: SLOCategory.QUALITY,
      severity: SLOSeverity.HIGH,
      query: 'sum(db_queries_total{status="success"}) / sum(db_queries_total)',
      alertThresholds: {
        warning: 0.99,
        critical: 0.985,
        emergency: 0.98,
      },
    })

    this.addSLO({
      id: 'cache_hit_rate_90',
      name: 'Cache Hit Rate > 90%',
      description: 'Cache hit rate should exceed 90%',
      threshold: 0.9,
      timeWindow: '15m',
      category: SLOCategory.PERFORMANCE,
      severity: SLOSeverity.MEDIUM,
      query: 'sum(cache_operations_total{result="hit"}) / sum(cache_operations_total)',
      alertThresholds: {
        warning: 0.85,
        critical: 0.8,
        emergency: 0.7,
      },
    })

    Logger.info(`Initialized ${this.sloTargets.size} default SLOs`)
  }

  /**
   * Add new SLO target
   */
  addSLO(slo: SLOTarget): void {
    this.sloTargets.set(slo.id, slo)
    this.violations.set(slo.id, [])

    Logger.info(`SLO added: ${slo.name}`, {
      id: slo.id,
      threshold: slo.threshold,
      timeWindow: slo.timeWindow,
    })
  }

  /**
   * Configure alerts for SLO
   */
  configureAlerts(sloId: string, config: AlertConfig): void {
    this.alertConfigs.set(sloId, config)
    Logger.info(`Alert configuration updated for SLO: ${sloId}`)
  }

  /**
   * Start SLO monitoring
   */
  private startMonitoring(): void {
    // Check SLOs every 30 seconds
    this.monitoringInterval = setInterval(() => {
      this.checkAllSLOs()
    }, 30000)

    Logger.info('SLO monitoring started (30 second intervals)')
  }

  /**
   * Check all SLO targets
   */
  private async checkAllSLOs(): Promise<void> {
    const promises = Array.from(this.sloTargets.values()).map((slo) =>
      this.checkSLO(slo).catch((error) => {
        Logger.error(`SLO check failed for ${slo.id}:`, error)
      })
    )

    await Promise.allSettled(promises)
  }

  /**
   * Check individual SLO
   */
  private async checkSLO(slo: SLOTarget): Promise<void> {
    try {
      const currentValue = await this.executeSLOQuery(slo)

      // Update compliance metric
      this.sloComplianceGauge.set(
        {
          slo_id: slo.id,
          slo_name: slo.name,
          category: slo.category,
          time_window: slo.timeWindow,
        },
        currentValue
      )

      // Calculate error budget
      const errorBudget = this.calculateErrorBudget(slo, currentValue)
      this.errorBudgetGauge.set({ slo_id: slo.id, time_window: slo.timeWindow }, errorBudget)

      // Check for violations
      await this.evaluateSLOCompliance(slo, currentValue)
    } catch (_error) {
      Logger.error(`SLO evaluation error for ${slo.id}:`, error)
    }
  }

  /**
   * Execute SLO query (simplified - would use Prometheus API in production)
   */
  private async executeSLOQuery(slo: SLOTarget): Promise<number> {
    // This is a simplified implementation
    // In production, this would query Prometheus HTTP API

    switch (slo.id) {
      case 'availability_99_9':
        return 0.9995 // 99.95% (above threshold)
      case 'latency_p95_500ms':
        return 0.45 // 450ms (below threshold)
      case 'latency_p99_1s':
        return 0.85 // 850ms (below threshold)
      case 'exam_pass_rate_75':
        return 0.78 // 78% (above threshold)
      case 'learning_completion_80':
        return 0.82 // 82% (above threshold)
      case 'data_accuracy_99_5':
        return 0.996 // 99.6% (above threshold)
      case 'cache_hit_rate_90':
        return 0.89 // 89% (below threshold - will trigger alert)
      default:
        return Math.random() // Random for unknown SLOs
    }
  }

  /**
   * Calculate error budget remaining
   */
  private calculateErrorBudget(slo: SLOTarget, currentValue: number): number {
    if (slo.category === SLOCategory.AVAILABILITY || slo.category === SLOCategory.QUALITY) {
      // For availability/quality SLOs, error budget is based on allowed failures
      const allowedFailureRate = 1 - slo.threshold
      const currentFailureRate = 1 - currentValue
      return Math.max(0, (allowedFailureRate - currentFailureRate) / allowedFailureRate)
    } else {
      // For performance SLOs, error budget is based on threshold deviation
      const deviation = Math.abs(currentValue - slo.threshold) / slo.threshold
      return Math.max(0, 1 - deviation)
    }
  }

  /**
   * Evaluate SLO compliance and handle violations
   */
  private async evaluateSLOCompliance(slo: SLOTarget, currentValue: number): Promise<void> {
    const isViolation = this.isThresholdViolated(slo, currentValue)

    if (isViolation) {
      await this.handleSLOViolation(slo, currentValue)
    } else {
      await this.handleSLOCompliance(slo, currentValue)
    }
  }

  /**
   * Check if threshold is violated
   */
  private isThresholdViolated(slo: SLOTarget, currentValue: number): boolean {
    if (slo.category === SLOCategory.AVAILABILITY || slo.category === SLOCategory.QUALITY) {
      return currentValue < slo.threshold
    } else {
      // For performance metrics (latency), values should be below threshold
      return currentValue > slo.threshold
    }
  }

  /**
   * Handle SLO violation
   */
  private async handleSLOViolation(slo: SLOTarget, currentValue: number): Promise<void> {
    const severity = this.determineSeverity(slo, currentValue)
    const existingViolations = this.violations.get(slo.id) || []

    // Check if this is a new violation or ongoing
    const latestViolation = existingViolations[existingViolations.length - 1]
    const isNewViolation = !latestViolation || latestViolation.resolved

    if (isNewViolation) {
      const violation: SLOViolation = {
        sloId: slo.id,
        timestamp: new Date(),
        currentValue,
        threshold: slo.threshold,
        severity,
        details: { category: slo.category, timeWindow: slo.timeWindow },
        resolved: false,
      }

      existingViolations.push(violation)
      this.violations.set(slo.id, existingViolations)

      // Record violation metric
      this.sloViolationsCounter.inc({
        slo_id: slo.id,
        severity: severity,
        category: slo.category,
      })

      // Send alerts
      await this.sendViolationAlert(slo, violation)

      // Emit event for external handling
      this.emit('slo_violation', {
        slo,
        violation,
        severity,
      })

      Logger.error(`SLO VIOLATION: ${slo.name}`, {
        sloId: slo.id,
        currentValue,
        threshold: slo.threshold,
        severity,
      })
    }
  }

  /**
   * Handle SLO compliance (resolve violations)
   */
  private async handleSLOCompliance(slo: SLOTarget, currentValue: number): Promise<void> {
    const violations = this.violations.get(slo.id) || []
    const activeViolations = violations.filter((v) => !v.resolved)

    if (activeViolations.length > 0) {
      // Resolve active violations
      activeViolations.forEach((violation) => {
        violation.resolved = true
        violation.resolvedAt = new Date()
      })

      this.emit('slo_compliance_restored', {
        slo,
        currentValue,
        resolvedViolations: activeViolations.length,
      })

      Logger.info(`SLO compliance restored: ${slo.name}`, {
        sloId: slo.id,
        currentValue,
        resolvedCount: activeViolations.length,
      })
    }
  }

  /**
   * Determine violation severity
   */
  private determineSeverity(slo: SLOTarget, currentValue: number): SLOSeverity {
    const { warning, critical, emergency } = slo.alertThresholds

    if (slo.category === SLOCategory.AVAILABILITY || slo.category === SLOCategory.QUALITY) {
      if (currentValue <= emergency) {return SLOSeverity.CRITICAL}
      if (currentValue <= critical) {return SLOSeverity.HIGH}
      if (currentValue <= warning) {return SLOSeverity.MEDIUM}
      return SLOSeverity.LOW
    } else {
      // For performance metrics
      if (currentValue >= emergency) {return SLOSeverity.CRITICAL}
      if (currentValue >= critical) {return SLOSeverity.HIGH}
      if (currentValue >= warning) {return SLOSeverity.MEDIUM}
      return SLOSeverity.LOW
    }
  }

  /**
   * Send violation alert
   */
  private async sendViolationAlert(slo: SLOTarget, violation: SLOViolation): Promise<void> {
    const alertConfig = this.alertConfigs.get(slo.id)

    if (!alertConfig) {
      Logger.warn(`No alert configuration found for SLO: ${slo.id}`)
      return
    }

    const alertMessage = {
      title: `🚨 SLO Violation: ${slo.name}`,
      description: slo.description,
      severity: violation.severity,
      currentValue: violation.currentValue,
      threshold: violation.threshold,
      timeWindow: slo.timeWindow,
      timestamp: violation.timestamp.toISOString(),
      runbook: this.generateRunbookUrl(slo.id),
    }

    // Send to configured channels
    for (const channel of alertConfig.channels) {
      try {
        await this.sendAlertToChannel(channel, alertMessage)

        this.alertsSentCounter.inc({
          slo_id: slo.id,
          channel,
          severity: violation.severity,
        })
      } catch (_error) {
        Logger.error(`Failed to send alert to ${channel}:`, error)
      }
    }
  }

  /**
   * Send alert to specific channel
   */
  private async sendAlertToChannel(channel: string, message: unknown): Promise<void> {
    switch (channel) {
      case 'slack':
        await this.sendSlackAlert(message)
        break
      case 'email':
        await this.sendEmailAlert(message)
        break
      case 'pagerduty':
        await this.sendPagerDutyAlert(message)
        break
      case 'teams':
        await this.sendTeamsAlert(message)
        break
      default:
        Logger.warn(`Unknown alert channel: ${channel}`)
    }
  }

  /**
   * Send Slack alert (simplified)
   */
  private async sendSlackAlert(message: unknown): Promise<void> {
    // Implementation would integrate with Slack API
    Logger.info('Slack alert sent:', message.title)
  }

  /**
   * Send email alert (simplified)
   */
  private async sendEmailAlert(message: unknown): Promise<void> {
    // Implementation would integrate with email service
    Logger.info('Email alert sent:', message.title)
  }

  /**
   * Send PagerDuty alert (simplified)
   */
  private async sendPagerDutyAlert(message: unknown): Promise<void> {
    // Implementation would integrate with PagerDuty API
    Logger.info('PagerDuty alert sent:', message.title)
  }

  /**
   * Send Microsoft Teams alert (simplified)
   */
  private async sendTeamsAlert(message: unknown): Promise<void> {
    // Implementation would integrate with Teams webhook
    Logger.info('Teams alert sent:', message.title)
  }

  /**
   * Generate runbook URL
   */
  private generateRunbookUrl(sloId: string): string {
    return `https://runbooks.pmp-learning.com/slo/${sloId}`
  }

  /**
   * Get SLO status summary
   */
  getSLOStatus(): {
    summary: {
      total: number
      healthy: number
      degraded: number
      violating: number
    }
    slos: Array<{
      id: string
      name: string
      category: string
      status: 'healthy' | 'degraded' | 'violating'
      compliance: number
      errorBudget: number
      lastViolation?: Date
    }>
  } {
    const sloStatus = Array.from(this.sloTargets.entries()).map(([id, slo]) => {
      const violations = this.violations.get(id) || []
      const activeViolations = violations.filter((v) => !v.resolved)
      const lastViolation =
        violations.length > 0 ? violations[violations.length - 1].timestamp : undefined

      let status: 'healthy' | 'degraded' | 'violating'
      if (activeViolations.length > 0) {
        status = 'violating'
      } else if (
        violations.length > 0 &&
        Date.now() - violations[violations.length - 1].timestamp.getTime() < 300000
      ) {
        status = 'degraded'
      } else {
        status = 'healthy'
      }

      return {
        id,
        name: slo.name,
        category: slo.category,
        status,
        compliance: 0.95, // Would be calculated from actual metrics
        errorBudget: 0.8, // Would be calculated from actual metrics
        lastViolation,
      }
    })

    const summary = {
      total: sloStatus.length,
      healthy: sloStatus.filter((s) => s.status === 'healthy').length,
      degraded: sloStatus.filter((s) => s.status === 'degraded').length,
      violating: sloStatus.filter((s) => s.status === 'violating').length,
    }

    return { summary, slos: sloStatus }
  }

  /**
   * Get violation history
   */
  getViolationHistory(sloId?: string, timeRange?: string): SLOViolation[] {
    if (sloId) {
      return this.violations.get(sloId) || []
    }

    // Return all violations
    const allViolations = Array.from(this.violations.values()).flat()

    if (timeRange) {
      const cutoffTime = this.parseTimeRange(timeRange)
      return allViolations.filter((v) => v.timestamp >= cutoffTime)
    }

    return allViolations
  }

  /**
   * Parse time range string
   */
  private parseTimeRange(timeRange: string): Date {
    const now = new Date()
    const value = parseInt(timeRange.slice(0, -1))
    const unit = timeRange.slice(-1)

    switch (unit) {
      case 'm':
        return new Date(now.getTime() - value * 60 * 1000)
      case 'h':
        return new Date(now.getTime() - value * 60 * 60 * 1000)
      case 'd':
        return new Date(now.getTime() - value * 24 * 60 * 60 * 1000)
      default:
        return new Date(0)
    }
  }

  /**
   * Get Prometheus metrics
   */
  async getMetrics(): Promise<string> {
    return await this.prometheusRegistry.metrics()
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = null
      Logger.info('SLO monitoring stopped')
    }
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.stopMonitoring()
    this.removeAllListeners()
    this.prometheusRegistry.clear()
  }
}

// Global SLO Manager instance
export const sloManager = new SLOManager()

// Default alert configurations
sloManager.configureAlerts('availability_99_9', {
  channels: ['slack', 'pagerduty', 'email'],
  recipients: ['sre-team@pmp-learning.com', 'on-call@pmp-learning.com'],
  cooldownPeriod: 15,
  escalationDelay: 30,
})

sloManager.configureAlerts('latency_p95_500ms', {
  channels: ['slack'],
  recipients: ['dev-team@pmp-learning.com'],
  cooldownPeriod: 10,
  escalationDelay: 20,
})

// Export for use in other modules
export default {
  SLOManager,
  sloManager,
  SLOCategory,
  SLOSeverity,
}
