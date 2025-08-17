/**
 * フロントエンドサービス・状態管理実装
 * Developer 9: React専門・状態管理
 * 技術スタック: React Context, Zustand, Custom Hooks
 * セキュリティレベル: Medium
 * 最終更新: {updated}
 */

import { v4 as uuidv4 } from 'uuid'

class PromptLogService {
  constructor() {
    this.dbName = 'PromptLogDB'
    this.dbVersion = 1
    this.storeName = 'promptLogs'
    this.db = null
    this.queue = []
    this.isProcessing = false
    this.config = {
      maxQueueSize: 100,
      flushInterval: 5000, // 5 seconds
      maxLogAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      enableCompression: true,
      enableEncryption: false,
      enableAnalytics: true,
      privacyMode: false,
      retentionPolicy: 'rolling', // 'rolling' | 'archive' | 'delete'
    }
    this.sessionId = this.generateSessionId()
    this.initializeDB()
    this.startFlushTimer()
  }

  /**
   * Initialize IndexedDB for log storage
   */
  async initializeDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion)

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error)
        reject(request.error)
      }

      request.onsuccess = () => {
        this.db = request.result
        console.info('PromptLog DB initialized successfully')
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = event.target.result

        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(this.storeName)) {
          const objectStore = db.createObjectStore(this.storeName, {
            keyPath: 'id',
            autoIncrement: false,
          })

          // Create indexes for efficient querying
          objectStore.createIndex('timestamp', 'timestamp', { unique: false })
          objectStore.createIndex('sessionId', 'sessionId', { unique: false })
          objectStore.createIndex('userId', 'userId', { unique: false })
          objectStore.createIndex('type', 'type', { unique: false })
          objectStore.createIndex('status', 'status', { unique: false })
          objectStore.createIndex('tags', 'tags', { unique: false, multiEntry: true })
        }
      }
    })
  }

  /**
   * Generate unique session ID
   */
  generateSessionId() {
    return `session_${Date.now()}_${uuidv4()}`
  }

  /**
   * Log a prompt interaction
   */
  async logPrompt(data) {
    const logEntry = {
      id: uuidv4(),
      timestamp: Date.now(),
      sessionId: this.sessionId,
      type: 'prompt',
      userId: data.userId || 'anonymous',
      prompt: this.sanitizeContent(data.prompt),
      context: data.context || {},
      metadata: {
        source: data.source || 'user',
        category: data.category || 'general',
        tags: data.tags || [],
        version: data.version || '1.0.0',
        environment: this.getEnvironment(),
      },
      status: 'pending',
      metrics: {
        tokenCount: this.estimateTokens(data.prompt),
        characterCount: data.prompt.length,
      },
    }

    return this.addToQueue(logEntry)
  }

  /**
   * Log an AI response
   */
  async logResponse(promptId, data) {
    const logEntry = {
      id: uuidv4(),
      timestamp: Date.now(),
      sessionId: this.sessionId,
      type: 'response',
      promptId: promptId,
      userId: data.userId || 'anonymous',
      response: this.sanitizeContent(data.response),
      model: data.model || 'unknown',
      metadata: {
        completionTime: data.completionTime,
        totalTokens: data.totalTokens,
        promptTokens: data.promptTokens,
        completionTokens: data.completionTokens,
        temperature: data.temperature,
        maxTokens: data.maxTokens,
        topP: data.topP,
        frequencyPenalty: data.frequencyPenalty,
        presencePenalty: data.presencePenalty,
      },
      status: data.status || 'completed',
      error: data.error || null,
      metrics: {
        latency: data.latency,
        throughput: data.throughput,
        cost: this.calculateCost(data),
      },
    }

    return this.addToQueue(logEntry)
  }

  /**
   * Log user interaction/feedback
   */
  async logInteraction(data) {
    const logEntry = {
      id: uuidv4(),
      timestamp: Date.now(),
      sessionId: this.sessionId,
      type: 'interaction',
      userId: data.userId || 'anonymous',
      promptId: data.promptId,
      responseId: data.responseId,
      action: data.action, // 'like', 'dislike', 'flag', 'copy', 'share', etc.
      feedback: data.feedback,
      rating: data.rating,
      metadata: {
        source: data.source,
        context: data.context,
      },
    }

    return this.addToQueue(logEntry)
  }

  /**
   * Add log entry to queue for batch processing
   */
  async addToQueue(entry) {
    this.queue.push(entry)

    // Auto-flush if queue is full
    if (this.queue.length >= this.config.maxQueueSize) {
      await this.flush()
    }

    return entry.id
  }

  /**
   * Flush queued logs to storage
   */
  async flush() {
    if (this.isProcessing || this.queue.length === 0) return

    this.isProcessing = true
    const logsToProcess = [...this.queue]
    this.queue = []

    try {
      const transaction = this.db.transaction([this.storeName], 'readwrite')
      const objectStore = transaction.objectStore(this.storeName)

      for (const log of logsToProcess) {
        // Apply compression if enabled
        if (this.config.enableCompression) {
          log.compressed = true
          log.data = this.compress(log)
        }

        // Apply encryption if enabled
        if (this.config.enableEncryption) {
          log.encrypted = true
          log.data = await this.encrypt(log.data || log)
        }

        objectStore.add(log)
      }

      await new Promise((resolve, reject) => {
        transaction.oncomplete = resolve
        transaction.onerror = reject
      })

      console.info(`Flushed ${logsToProcess.length} logs to storage`)

      // Trigger analytics if enabled
      if (this.config.enableAnalytics) {
        this.analyzeRecentLogs()
      }
    } catch (error) {
      console.error('Failed to flush logs:', error)
      // Re-queue failed logs
      this.queue.unshift(...logsToProcess)
    } finally {
      this.isProcessing = false
    }
  }

  /**
   * Start automatic flush timer
   */
  startFlushTimer() {
    setInterval(() => {
      this.flush()
    }, this.config.flushInterval)
  }

  /**
   * Query logs with filters
   */
  async queryLogs(filters = {}) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly')
      const objectStore = transaction.objectStore(this.storeName)
      const results = []

      let request
      if (filters.index && filters.value) {
        const index = objectStore.index(filters.index)
        request = index.openCursor(IDBKeyRange.only(filters.value))
      } else if (filters.range) {
        request = objectStore.openCursor(filters.range)
      } else {
        request = objectStore.openCursor()
      }

      request.onsuccess = (event) => {
        const cursor = event.target.result
        if (cursor) {
          const log = cursor.value

          // Apply additional filters
          if (this.matchesFilters(log, filters)) {
            // Decompress/decrypt if needed
            const processedLog = this.processLogForReading(log)
            results.push(processedLog)
          }

          cursor.continue()
        } else {
          // Apply sorting and pagination
          const sortedResults = this.sortLogs(results, filters.sort)
          const paginatedResults = this.paginateLogs(sortedResults, filters.page, filters.limit)
          resolve(paginatedResults)
        }
      }

      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Get log statistics
   */
  async getStatistics(timeRange = null) {
    const logs = await this.queryLogs({
      range: timeRange ? IDBKeyRange.bound(timeRange.start, timeRange.end) : null,
    })

    return {
      totalLogs: logs.length,
      promptCount: logs.filter((l) => l.type === 'prompt').length,
      responseCount: logs.filter((l) => l.type === 'response').length,
      interactionCount: logs.filter((l) => l.type === 'interaction').length,
      averageResponseTime: this.calculateAverageResponseTime(logs),
      averageTokenUsage: this.calculateAverageTokenUsage(logs),
      errorRate: this.calculateErrorRate(logs),
      topTags: this.getTopTags(logs),
      userActivity: this.getUserActivity(logs),
      costAnalysis: this.analyzeCosts(logs),
    }
  }

  /**
   * Export logs in specified format
   */
  async exportLogs(format = 'json', filters = {}) {
    const logs = await this.queryLogs(filters)

    switch (format) {
      case 'json':
        return JSON.stringify(logs, null, 2)

      case 'jsonl':
        return logs.map((log) => JSON.stringify(log)).join('\n')

      case 'csv':
        return this.convertToCSV(logs)

      case 'markdown':
        return this.convertToMarkdown(logs)

      default:
        throw new Error(`Unsupported export format: ${format}`)
    }
  }

  /**
   * Clean up old logs based on retention policy
   */
  async cleanupOldLogs() {
    const cutoffTime = Date.now() - this.config.maxLogAge

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite')
      const objectStore = transaction.objectStore(this.storeName)
      const index = objectStore.index('timestamp')
      const range = IDBKeyRange.upperBound(cutoffTime)
      let deletedCount = 0

      const request = index.openCursor(range)

      request.onsuccess = (event) => {
        const cursor = event.target.result
        if (cursor) {
          if (this.config.retentionPolicy === 'archive') {
            // Archive before deletion
            this.archiveLog(cursor.value)
          }
          cursor.delete()
          deletedCount++
          cursor.continue()
        } else {
          console.info(`Cleaned up ${deletedCount} old logs`)
          resolve(deletedCount)
        }
      }

      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Sanitize content for privacy
   */
  sanitizeContent(content) {
    if (!this.config.privacyMode) return content

    // Remove PII patterns
    const patterns = [
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Email
      /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, // Phone
      /\b\d{3}-\d{2}-\d{4}\b/g, // SSN
      /\b(?:\d{4}[-\s]?){3}\d{4}\b/g, // Credit card
    ]

    let sanitized = content
    patterns.forEach((pattern) => {
      sanitized = sanitized.replace(pattern, '[REDACTED]')
    })

    return sanitized
  }

  /**
   * Estimate token count for content
   */
  estimateTokens(content) {
    // Simple estimation: ~4 characters per token
    return Math.ceil(content.length / 4)
  }

  /**
   * Calculate cost based on token usage
   */
  calculateCost(data) {
    const rates = {
      'gpt-4': { prompt: 0.03, completion: 0.06 },
      'gpt-3.5-turbo': { prompt: 0.001, completion: 0.002 },
      'claude-3': { prompt: 0.015, completion: 0.075 },
      default: { prompt: 0.001, completion: 0.002 },
    }

    const modelRates = rates[data.model] || rates.default
    const promptCost = (data.promptTokens / 1000) * modelRates.prompt
    const completionCost = (data.completionTokens / 1000) * modelRates.completion

    return {
      prompt: promptCost,
      completion: completionCost,
      total: promptCost + completionCost,
      currency: 'USD',
    }
  }

  /**
   * Compress log data
   */
  compress(data) {
    // Simple compression using base64 encoding
    // In production, use a proper compression library like pako
    const jsonString = JSON.stringify(data)
    return btoa(encodeURIComponent(jsonString))
  }

  /**
   * Decompress log data
   */
  decompress(compressedData) {
    return JSON.parse(decodeURIComponent(atob(compressedData)))
  }

  /**
   * Encrypt log data (placeholder - implement actual encryption)
   */
  async encrypt(data) {
    // Placeholder - implement actual encryption using Web Crypto API
    return btoa(JSON.stringify(data))
  }

  /**
   * Decrypt log data (placeholder - implement actual decryption)
   */
  async decrypt(encryptedData) {
    // Placeholder - implement actual decryption using Web Crypto API
    return JSON.parse(atob(encryptedData))
  }

  /**
   * Process log for reading (decompress/decrypt)
   */
  processLogForReading(log) {
    let processedLog = { ...log }

    if (log.compressed && log.data) {
      processedLog = this.decompress(log.data)
    }

    if (log.encrypted && log.data) {
      // Note: This should be async in production
      processedLog = JSON.parse(atob(log.data))
    }

    return processedLog
  }

  /**
   * Check if log matches filters
   */
  matchesFilters(log, filters) {
    if (filters.userId && log.userId !== filters.userId) return false
    if (filters.type && log.type !== filters.type) return false
    if (filters.status && log.status !== filters.status) return false
    if (filters.tags && !filters.tags.some((tag) => log.metadata?.tags?.includes(tag))) return false
    if (filters.startTime && log.timestamp < filters.startTime) return false
    if (filters.endTime && log.timestamp > filters.endTime) return false

    return true
  }

  /**
   * Sort logs
   */
  sortLogs(logs, sortConfig = { field: 'timestamp', order: 'desc' }) {
    return logs.sort((a, b) => {
      const aValue = this.getNestedValue(a, sortConfig.field)
      const bValue = this.getNestedValue(b, sortConfig.field)

      if (sortConfig.order === 'desc') {
        return bValue > aValue ? 1 : -1
      } else {
        return aValue > bValue ? 1 : -1
      }
    })
  }

  /**
   * Paginate logs
   */
  paginateLogs(logs, page = 1, limit = 50) {
    const start = (page - 1) * limit
    const end = start + limit

    return {
      data: logs.slice(start, end),
      pagination: {
        page,
        limit,
        total: logs.length,
        totalPages: Math.ceil(logs.length / limit),
        hasNext: end < logs.length,
        hasPrev: page > 1,
      },
    }
  }

  /**
   * Get nested value from object
   */
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj)
  }

  /**
   * Calculate average response time
   */
  calculateAverageResponseTime(logs) {
    const responses = logs.filter((l) => l.type === 'response' && l.metrics?.latency)
    if (responses.length === 0) return 0

    const totalLatency = responses.reduce((sum, r) => sum + r.metrics.latency, 0)
    return totalLatency / responses.length
  }

  /**
   * Calculate average token usage
   */
  calculateAverageTokenUsage(logs) {
    const responses = logs.filter((l) => l.type === 'response' && l.metadata?.totalTokens)
    if (responses.length === 0) return 0

    const totalTokens = responses.reduce((sum, r) => sum + r.metadata.totalTokens, 0)
    return totalTokens / responses.length
  }

  /**
   * Calculate error rate
   */
  calculateErrorRate(logs) {
    const responses = logs.filter((l) => l.type === 'response')
    if (responses.length === 0) return 0

    const errors = responses.filter((r) => r.status === 'error' || r.error)
    return (errors.length / responses.length) * 100
  }

  /**
   * Get top tags
   */
  getTopTags(logs, limit = 10) {
    const tagCounts = {}

    logs.forEach((log) => {
      if (log.metadata?.tags) {
        log.metadata.tags.forEach((tag) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1
        })
      }
    })

    return Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([tag, count]) => ({ tag, count }))
  }

  /**
   * Analyze user activity
   */
  getUserActivity(logs) {
    const userActivity = {}

    logs.forEach((log) => {
      const userId = log.userId || 'anonymous'
      if (!userActivity[userId]) {
        userActivity[userId] = {
          promptCount: 0,
          responseCount: 0,
          interactionCount: 0,
          totalTokens: 0,
          errors: 0,
        }
      }

      if (log.type === 'prompt') userActivity[userId].promptCount++
      if (log.type === 'response') {
        userActivity[userId].responseCount++
        if (log.metadata?.totalTokens) {
          userActivity[userId].totalTokens += log.metadata.totalTokens
        }
        if (log.status === 'error') userActivity[userId].errors++
      }
      if (log.type === 'interaction') userActivity[userId].interactionCount++
    })

    return userActivity
  }

  /**
   * Analyze costs
   */
  analyzeCosts(logs) {
    const responses = logs.filter((l) => l.type === 'response' && l.metrics?.cost)

    return {
      totalCost: responses.reduce((sum, r) => sum + r.metrics.cost.total, 0),
      promptCost: responses.reduce((sum, r) => sum + r.metrics.cost.prompt, 0),
      completionCost: responses.reduce((sum, r) => sum + r.metrics.cost.completion, 0),
      averageCostPerRequest:
        responses.length > 0
          ? responses.reduce((sum, r) => sum + r.metrics.cost.total, 0) / responses.length
          : 0,
      costByModel: this.groupCostsByModel(responses),
    }
  }

  /**
   * Group costs by model
   */
  groupCostsByModel(responses) {
    const costByModel = {}

    responses.forEach((response) => {
      const model = response.model || 'unknown'
      if (!costByModel[model]) {
        costByModel[model] = {
          total: 0,
          count: 0,
          average: 0,
        }
      }

      costByModel[model].total += response.metrics.cost.total
      costByModel[model].count++
    })

    // Calculate averages
    Object.keys(costByModel).forEach((model) => {
      costByModel[model].average = costByModel[model].total / costByModel[model].count
    })

    return costByModel
  }

  /**
   * Convert logs to CSV format
   */
  convertToCSV(logs) {
    if (logs.length === 0) return ''

    const headers = [
      'ID',
      'Timestamp',
      'Type',
      'User ID',
      'Session ID',
      'Status',
      'Model',
      'Tokens',
      'Cost',
    ]

    const rows = logs.map((log) => {
      return [
        log.id,
        new Date(log.timestamp).toISOString(),
        log.type,
        log.userId,
        log.sessionId,
        log.status || '',
        log.model || '',
        log.metadata?.totalTokens || '',
        log.metrics?.cost?.total || '',
      ]
    })

    return [headers, ...rows].map((row) => row.join(',')).join('\n')
  }

  /**
   * Convert logs to Markdown format
   */
  convertToMarkdown(logs) {
    let markdown = '# Prompt Logs\n\n'

    logs.forEach((log) => {
      markdown += `## ${log.type.toUpperCase()}: ${log.id}\n\n`
      markdown += `- **Timestamp**: ${new Date(log.timestamp).toISOString()}\n`
      markdown += `- **User**: ${log.userId}\n`
      markdown += `- **Session**: ${log.sessionId}\n`

      if (log.type === 'prompt') {
        markdown += `- **Prompt**: ${log.prompt}\n`
      } else if (log.type === 'response') {
        markdown += `- **Model**: ${log.model}\n`
        markdown += `- **Response**: ${log.response?.substring(0, 200)}...\n`
        markdown += `- **Tokens**: ${log.metadata?.totalTokens || 'N/A'}\n`
        markdown += `- **Cost**: $${log.metrics?.cost?.total || 'N/A'}\n`
      }

      markdown += '\n---\n\n'
    })

    return markdown
  }

  /**
   * Archive log to external storage
   */
  async archiveLog(log) {
    // Implement external storage archival (e.g., to server, cloud storage)
    console.info(`Archiving log: ${log.id}`)
  }

  /**
   * Analyze recent logs for insights
   */
  async analyzeRecentLogs() {
    // Implement real-time analytics
    const recentLogs = await this.queryLogs({
      range: IDBKeyRange.lowerBound(Date.now() - 3600000), // Last hour
    })

    if (recentLogs.data.length > 10) {
      const stats = await this.getStatistics({
        start: Date.now() - 3600000,
        end: Date.now(),
      })

      // Trigger alerts or notifications based on analysis
      if (stats.errorRate > 10) {
        console.warn(`High error rate detected: ${stats.errorRate}%`)
      }
    }
  }

  /**
   * Get environment information
   */
  getEnvironment() {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timestamp: Date.now(),
    }
  }

  /**
   * Clear all logs
   */
  async clearAllLogs() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite')
      const objectStore = transaction.objectStore(this.storeName)
      const request = objectStore.clear()

      request.onsuccess = () => {
        console.info('All logs cleared')
        resolve()
      }

      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig }
    console.info('PromptLog configuration updated:', this.config)
  }

  /**
   * Get current configuration
   */
  getConfig() {
    return { ...this.config }
  }

  /**
   * Destroy service and clean up resources
   */
  destroy() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
    }
    if (this.db) {
      this.db.close()
    }
  }
}

// Create singleton instance
const promptLogService = new PromptLogService()

// Export service
export default promptLogService

// Named exports for convenience
export const {
  logPrompt,
  logResponse,
  logInteraction,
  queryLogs,
  getStatistics,
  exportLogs,
  clearAllLogs,
  updateConfig,
} = promptLogService
