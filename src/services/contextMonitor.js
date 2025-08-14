/**
 * Context Monitoring and Rotation Service
 * Monitors context usage and implements automatic rotation policies
 */

import contextManager from './contextManager.js'
import { logger } from './logger'

class ContextMonitor {
  constructor() {
    this.metrics = {
      memoryUsage: [],
      retrievalTimes: [],
      cacheHitRate: 0.85,
      errorCount: 0,
      lastCleanup: Date.now(),
    }

    this.thresholds = {
      memoryWarning: 128 * 1024, // 128KB
      memoryCritical: 256 * 1024, // 256KB
      slowRetrievalMs: 100,
      maxErrorRate: 0.05, // 5%
      cleanupIntervalMs: 6 * 60 * 60 * 1000, // 6 hours
    }

    this.rotationPolicies = {
      aggressive: {
        maxAge: 2 * 60 * 60 * 1000, // 2 hours
        maxSize: 20,
        archiveThreshold: 0.8,
      },
      normal: {
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        maxSize: 50,
        archiveThreshold: 0.9,
      },
      conservative: {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        maxSize: 100,
        archiveThreshold: 0.95,
      },
    }

    this.currentPolicy = 'normal'
    this.startMonitoring()
  }

  /**
   * Start continuous monitoring
   */
  startMonitoring() {
    // Monitor every 30 seconds
    this.monitoringInterval = setInterval(() => {
      this.collectMetrics()
      this.checkThresholds()
      this.performRotationIfNeeded()
    }, 30000)

    // Cleanup every 6 hours
    this.cleanupInterval = setInterval(() => {
      this.performCleanup()
    }, this.thresholds.cleanupIntervalMs)
  }

  /**
   * Stop monitoring
   */
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = null
    }

    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
  }

  /**
   * Collect performance metrics
   */
  collectMetrics() {
    const stats = contextManager.getStats()
    const memoryUsage = this.estimateMemoryUsage()

    this.metrics.memoryUsage.push({
      timestamp: Date.now(),
      usage: memoryUsage,
      entries: stats.totalEntries,
    })

    // Keep only last 100 measurements
    if (this.metrics.memoryUsage.length > 100) {
      this.metrics.memoryUsage.shift()
    }

    this.metrics.cacheHitRate = stats.cacheHitRate
  }

  /**
   * Estimate current memory usage
   */
  estimateMemoryUsage() {
    try {
      if (performance.memory) {
        return performance.memory.usedJSHeapSize
      }

      // Fallback estimation
      const stats = contextManager.getStats()
      return stats.totalSizeKB * 1024
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.warn('Memory estimation failed:', error)
      }
      return 0
    }
  }

  /**
   * Check if thresholds are exceeded
   */
  checkThresholds() {
    const currentMemory = this.getCurrentMemoryUsage()
    const avgRetrievalTime = this.getAverageRetrievalTime()

    // Check memory thresholds
    if (currentMemory > this.thresholds.memoryCritical) {
      this.handleCriticalMemory()
    } else if (currentMemory > this.thresholds.memoryWarning) {
      this.handleWarningMemory()
    }

    // Check performance thresholds
    if (avgRetrievalTime > this.thresholds.slowRetrievalMs) {
      this.handleSlowRetrieval()
    }

    // Check error rate
    const errorRate = this.calculateErrorRate()
    if (errorRate > this.thresholds.maxErrorRate) {
      this.handleHighErrorRate()
    }
  }

  /**
   * Get current memory usage
   */
  getCurrentMemoryUsage() {
    const recent = this.metrics.memoryUsage.slice(-5)
    if (recent.length === 0) return 0

    return recent.reduce((sum, metric) => sum + metric.usage, 0) / recent.length
  }

  /**
   * Get average retrieval time
   */
  getAverageRetrievalTime() {
    const recent = this.metrics.retrievalTimes.slice(-10)
    if (recent.length === 0) return 0

    return recent.reduce((sum, time) => sum + time, 0) / recent.length
  }

  /**
   * Calculate error rate
   */
  calculateErrorRate() {
    // This would be based on actual error tracking
    return this.metrics.errorCount / Math.max(1, this.metrics.retrievalTimes.length)
  }

  /**
   * Handle critical memory situation
   */
  async handleCriticalMemory() {
    if (process.env.NODE_ENV === 'development') {
      logger.warn('🚨 Critical memory usage detected, switching to aggressive rotation')
    }

    this.currentPolicy = 'aggressive'
    await this.performEmergencyCleanup()
    await this.forceArchiveOldData()
  }

  /**
   * Handle warning memory situation
   */
  async handleWarningMemory() {
    if (process.env.NODE_ENV === 'development') {
      logger.warn('⚠️ High memory usage detected, performing cleanup')
    }

    await contextManager.cleanup()
    await contextManager.archiveOldData()
  }

  /**
   * Handle slow retrieval performance
   */
  handleSlowRetrieval() {
    if (process.env.NODE_ENV === 'development') {
      logger.warn('🐌 Slow retrieval detected, optimizing cache')
    }

    // Switch to more aggressive caching
    this.currentPolicy = 'aggressive'
  }

  /**
   * Handle high error rate
   */
  handleHighErrorRate() {
    if (process.env.NODE_ENV === 'development') {
      logger.error('❌ High error rate detected in context operations')
    }

    // Reset context manager and clear corrupted data
    this.performDiagnostics()
  }

  /**
   * Perform rotation if needed based on current policy
   */
  async performRotationIfNeeded() {
    const policy = this.rotationPolicies[this.currentPolicy]
    const stats = contextManager.getStats()
    const memoryUsage = this.getCurrentMemoryUsage()

    const shouldRotate =
      stats.totalEntries > policy.maxSize ||
      memoryUsage > this.thresholds.memoryWarning * policy.archiveThreshold

    if (shouldRotate) {
      await this.performRotation(policy)
    }
  }

  /**
   * Perform context rotation
   */
  async performRotation(policy) {
    if (process.env.NODE_ENV === 'development') {
      logger.warn(`🔄 Performing context rotation with policy: ${this.currentPolicy}`)
    }

    const archived = await contextManager.archiveOldData(policy.maxAge)
    const cleaned = await contextManager.cleanup()

    if (process.env.NODE_ENV === 'development') {
      logger.warn(`✅ Rotation complete: archived ${archived}, cleaned ${cleaned}`)
    }

    // Record the cleanup
    this.metrics.lastCleanup = Date.now()
  }

  /**
   * Perform emergency cleanup
   */
  async performEmergencyCleanup() {
    if (process.env.NODE_ENV === 'development') {
      logger.warn('🆘 Performing emergency context cleanup')
    }

    // Archive everything older than 1 hour
    await contextManager.archiveOldData(60 * 60 * 1000)

    // Force cleanup
    await contextManager.cleanup()

    // Clear metrics history to free memory
    this.metrics.memoryUsage = this.metrics.memoryUsage.slice(-10)
    this.metrics.retrievalTimes = this.metrics.retrievalTimes.slice(-10)
  }

  /**
   * Force archive old data
   */
  async forceArchiveOldData() {
    // Archive data with very short age threshold
    await contextManager.archiveOldData(30 * 60 * 1000) // 30 minutes
  }

  /**
   * Perform regular cleanup
   */
  async performCleanup() {
    if (process.env.NODE_ENV === 'development') {
      logger.warn('🧹 Performing scheduled context cleanup')
    }

    const cleaned = await contextManager.cleanup()
    const archived = await contextManager.archiveOldData()

    if (process.env.NODE_ENV === 'development') {
      logger.warn(`✅ Cleanup complete: archived ${archived}, cleaned ${cleaned}`)
    }
  }

  /**
   * Perform diagnostics
   */
  performDiagnostics() {
    if (process.env.NODE_ENV === 'development') {
      logger.warn('🔍 Running context diagnostics...')
    }

    const stats = contextManager.getStats()
    const memoryUsage = this.getCurrentMemoryUsage()

    const diagnostics = {
      timestamp: Date.now(),
      contextStats: stats,
      memoryUsage: memoryUsage,
      currentPolicy: this.currentPolicy,
      thresholds: this.thresholds,
      metrics: {
        avgMemoryUsage:
          this.metrics.memoryUsage.slice(-10).reduce((sum, m) => sum + m.usage, 0) / 10,
        avgRetrievalTime: this.getAverageRetrievalTime(),
        errorRate: this.calculateErrorRate(),
        cacheHitRate: this.metrics.cacheHitRate,
      },
    }

    if (process.env.NODE_ENV === 'development') {
      logger.warn('📊 Context Diagnostics:', diagnostics)
    }
    return diagnostics
  }

  /**
   * Get monitoring dashboard data
   */
  getDashboardData() {
    const stats = contextManager.getStats()

    return {
      status: this.getHealthStatus(),
      policy: this.currentPolicy,
      metrics: {
        totalEntries: stats.totalEntries,
        totalSizeKB: stats.totalSizeKB,
        cacheHitRate: this.metrics.cacheHitRate,
        memoryUsage: this.getCurrentMemoryUsage(),
        avgRetrievalTime: this.getAverageRetrievalTime(),
        errorRate: this.calculateErrorRate(),
      },
      thresholds: this.thresholds,
      lastCleanup: this.metrics.lastCleanup,
      nextCleanup: this.metrics.lastCleanup + this.thresholds.cleanupIntervalMs,
    }
  }

  /**
   * Get overall health status
   */
  getHealthStatus() {
    const memoryUsage = this.getCurrentMemoryUsage()
    const errorRate = this.calculateErrorRate()
    const avgRetrievalTime = this.getAverageRetrievalTime()

    if (
      memoryUsage > this.thresholds.memoryCritical ||
      errorRate > this.thresholds.maxErrorRate ||
      avgRetrievalTime > this.thresholds.slowRetrievalMs * 2
    ) {
      return 'critical'
    }

    if (
      memoryUsage > this.thresholds.memoryWarning ||
      avgRetrievalTime > this.thresholds.slowRetrievalMs
    ) {
      return 'warning'
    }

    return 'healthy'
  }

  /**
   * Set rotation policy
   */
  setRotationPolicy(policy) {
    if (this.rotationPolicies[policy]) {
      this.currentPolicy = policy
      if (process.env.NODE_ENV === 'development') {
        logger.warn(`🔧 Context rotation policy changed to: ${policy}`)
      }
    }
  }

  /**
   * Record retrieval time for monitoring
   */
  recordRetrievalTime(timeMs) {
    this.metrics.retrievalTimes.push(timeMs)

    // Keep only last 50 measurements
    if (this.metrics.retrievalTimes.length > 50) {
      this.metrics.retrievalTimes.shift()
    }
  }

  /**
   * Record error for monitoring
   */
  recordError() {
    this.metrics.errorCount++
  }

  /**
   * Export monitoring data
   */
  exportMetrics() {
    return {
      metrics: this.metrics,
      thresholds: this.thresholds,
      policies: this.rotationPolicies,
      currentPolicy: this.currentPolicy,
      timestamp: Date.now(),
    }
  }
}

// Create singleton instance
const contextMonitor = new ContextMonitor()

export default contextMonitor

// Export utility functions
export const {
  getDashboardData,
  setRotationPolicy,
  recordRetrievalTime,
  recordError,
  performDiagnostics,
  exportMetrics,
} = contextMonitor
