/**
 * Prompt Log Service
 * Comprehensive logging system for AI prompts and responses
 * Captures, processes, and stores all prompt-related interactions
 */

import { v4 as uuidv4 } from 'uuid'
import type {
  IPromptLogService,
  PromptLogConfig,
  DEFAULT_PROMPT_LOG_CONFIG,
  PromptData,
  ResponseData,
  InteractionData,
  PromptLogEntry,
  ResponseLogEntry,
  InteractionLogEntry,
  BaseLogEntry,
  LogQueryFilters,
  QueryResult,
  LogStatistics,
  ExportOptions,
  ExportResult,
  ExportFormat,
  CostBreakdown,
  EnvironmentInfo,
  PaginationInfo,
  TagStatistics,
  UserActivitySummary,
  UserActivity,
  CostAnalysis,
  ModelCostBreakdown,
} from '../types/services/prompt-log'
import type { UserId, Count, Percentage } from '../types/common/base'

class PromptLogService implements IPromptLogService {
  private dbName: string = 'PromptLogDB'
  private dbVersion: number = 1
  private storeName: string = 'promptLogs'
  private db: IDBDatabase | null = null
  private queue: BaseLogEntry[] = []
  private isProcessing: boolean = false
  private config: PromptLogConfig
  private sessionId: string
  private flushTimer?: NodeJS.Timeout

  constructor() {
    this.config = { ...DEFAULT_PROMPT_LOG_CONFIG }
    this.sessionId = this.generateSessionId()
    this.initializeDB()
    this.startFlushTimer()
  }

  /**
   * Initialize IndexedDB for log storage
   */
  private async initializeDB(): Promise<void> {
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
        const db = (event.target as IDBOpenDBRequest).result

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
  private generateSessionId(): string {
    return `session_${Date.now()}_${uuidv4()}`
  }

  /**
   * Log a prompt interaction
   */
  async logPrompt(data: PromptData): Promise<string> {
    const logEntry: PromptLogEntry = {
      id: uuidv4(),
      timestamp: Date.now(),
      sessionId: this.sessionId,
      type: 'prompt',
      userId: data.userId || ('anonymous' as UserId),
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
  async logResponse(promptId: string, data: ResponseData): Promise<string> {
    const logEntry: ResponseLogEntry = {
      id: uuidv4(),
      timestamp: Date.now(),
      sessionId: this.sessionId,
      type: 'response',
      promptId: promptId,
      userId: data.userId || ('anonymous' as UserId),
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
  async logInteraction(data: InteractionData): Promise<string> {
    const logEntry: InteractionLogEntry = {
      id: uuidv4(),
      timestamp: Date.now(),
      sessionId: this.sessionId,
      type: 'interaction',
      userId: data.userId || ('anonymous' as UserId),
      promptId: data.promptId,
      responseId: data.responseId,
      action: data.action,
      feedback: data.feedback,
      rating: data.rating,
      metadata: {
        source: data.source,
        context: data.context,
      },
      status: 'completed',
    }

    return this.addToQueue(logEntry)
  }

  /**
   * Add log entry to queue for batch processing
   */
  private async addToQueue(entry: BaseLogEntry): Promise<string> {
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
  async flush(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0 || !this.db) {
      return
    }

    this.isProcessing = true
    const logsToProcess = [...this.queue]
    this.queue = []

    try {
      const transaction = this.db.transaction([this.storeName], 'readwrite')
      const objectStore = transaction.objectStore(this.storeName)

      for (const log of logsToProcess) {
        // Apply compression if enabled
        if (this.config.enableCompression) {
          ;(log as any).compressed = true
          ;(log as any).data = this.compress(log)
        }

        // Apply encryption if enabled
        if (this.config.enableEncryption) {
          ;(log as any).encrypted = true
          ;(log as any).data = await this.encrypt((log as any).data || log)
        }

        objectStore.add(log)
      }

      await new Promise<void>((resolve, reject) => {
        transaction.oncomplete = () => resolve()
        transaction.onerror = () => reject(transaction.error)
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
  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flush()
    }, this.config.flushInterval)
  }

  /**
   * Query logs with filters
   */
  async queryLogs(filters: LogQueryFilters = {}): Promise<QueryResult<BaseLogEntry>> {
    if (!this.db) {
      throw new Error('Database not initialized')
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly')
      const objectStore = transaction.objectStore(this.storeName)
      const results: BaseLogEntry[] = []

      let request: IDBRequest<IDBCursorWithValue | null>
      if (filters.index && filters.value) {
        const index = objectStore.index(filters.index)
        request = index.openCursor(IDBKeyRange.only(filters.value))
      } else if (filters.range) {
        request = objectStore.openCursor(filters.range)
      } else {
        request = objectStore.openCursor()
      }

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue | null>).result
        if (cursor) {
          const log = cursor.value as BaseLogEntry

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
  async getStatistics(timeRange?: { start: number; end: number }): Promise<LogStatistics> {
    const queryResult = await this.queryLogs({
      range: timeRange ? IDBKeyRange.bound(timeRange.start, timeRange.end) : undefined,
    })
    const logs = queryResult.data

    return {
      totalLogs: logs.length as Count,
      promptCount: logs.filter((l) => l.type === 'prompt').length as Count,
      responseCount: logs.filter((l) => l.type === 'response').length as Count,
      interactionCount: logs.filter((l) => l.type === 'interaction').length as Count,
      averageResponseTime: this.calculateAverageResponseTime(logs),
      averageTokenUsage: this.calculateAverageTokenUsage(logs),
      errorRate: this.calculateErrorRate(logs),
      topTags: this.getTopTags(logs),
      userActivity: this.getUserActivity(logs),
      costAnalysis: this.analyzeCosts(logs),
      timeRange: timeRange || { start: 0, end: Date.now() },
    }
  }

  /**
   * Export logs in specified format
   */
  async exportLogs(options: ExportOptions = { format: 'json' }): Promise<ExportResult> {
    const queryResult = await this.queryLogs(options.filters)
    const logs = queryResult.data

    let exportedData: string
    switch (options.format) {
      case 'json':
        exportedData = JSON.stringify(logs, null, 2)
        break
      case 'jsonl':
        exportedData = logs.map((log) => JSON.stringify(log)).join('\n')
        break
      case 'csv':
        exportedData = this.convertToCSV(logs)
        break
      case 'markdown':
        exportedData = this.convertToMarkdown(logs)
        break
      default:
        throw new Error(`Unsupported export format: ${options.format}`)
    }

    return {
      data: exportedData,
      format: options.format,
      recordCount: logs.length as Count,
      size: new Blob([exportedData]).size,
      generatedAt: new Date().toISOString() as any,
    }
  }

  /**
   * Clean up old logs based on retention policy
   */
  async cleanupOldLogs(): Promise<Count> {
    if (!this.db) {
      throw new Error('Database not initialized')
    }

    const cutoffTime = Date.now() - this.config.maxLogAge

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite')
      const objectStore = transaction.objectStore(this.storeName)
      const index = objectStore.index('timestamp')
      const range = IDBKeyRange.upperBound(cutoffTime)
      let deletedCount = 0

      const request = index.openCursor(range)

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue | null>).result
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
          resolve(deletedCount as Count)
        }
      }

      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Clear all logs
   */
  async clearAllLogs(): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized')
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite')
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
  updateConfig(newConfig: Partial<PromptLogConfig>): void {
    this.config = { ...this.config, ...newConfig }
    console.info('PromptLog configuration updated:', this.config)
  }

  /**
   * Get current configuration
   */
  getConfig(): PromptLogConfig {
    return { ...this.config }
  }

  /**
   * Destroy service and clean up resources
   */
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
    }
    if (this.db) {
      this.db.close()
    }
  }

  // ==================== Private Helper Methods ====================

  /**
   * Sanitize content for privacy
   */
  private sanitizeContent(content: string): string {
    if (!this.config.privacyMode) {
      return content
    }

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
  private estimateTokens(content: string): number {
    // Simple estimation: ~4 characters per token
    return Math.ceil(content.length / 4)
  }

  /**
   * Calculate cost based on token usage
   */
  private calculateCost(data: ResponseData): CostBreakdown | undefined {
    if (!data.model || !data.promptTokens || !data.completionTokens) {
      return undefined
    }

    const rates: Record<string, { prompt: number; completion: number }> = {
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
  private compress(data: unknown): string {
    // Simple compression using base64 encoding
    // In production, use a proper compression library like pako
    const jsonString = JSON.stringify(data)
    return btoa(encodeURIComponent(jsonString))
  }

  /**
   * Decompress log data
   */
  private decompress(compressedData: string): unknown {
    return JSON.parse(decodeURIComponent(atob(compressedData)))
  }

  /**
   * Encrypt log data (placeholder - implement actual encryption)
   */
  private async encrypt(data: unknown): Promise<string> {
    // Placeholder - implement actual encryption using Web Crypto API
    return btoa(JSON.stringify(data))
  }

  /**
   * Decrypt log data (placeholder - implement actual decryption)
   */
  private async decrypt(encryptedData: string): Promise<unknown> {
    // Placeholder - implement actual decryption using Web Crypto API
    return JSON.parse(atob(encryptedData))
  }

  /**
   * Process log for reading (decompress/decrypt)
   */
  private processLogForReading(log: any): BaseLogEntry {
    let processedLog = { ...log }

    if (log.compressed && log.data) {
      processedLog = this.decompress(log.data) as BaseLogEntry
    }

    if (log.encrypted && log.data) {
      // Note: This should be async in production
      processedLog = JSON.parse(atob(log.data)) as BaseLogEntry
    }

    return processedLog
  }

  /**
   * Check if log matches filters
   */
  private matchesFilters(log: BaseLogEntry, filters: LogQueryFilters): boolean {
    if (filters.userId && log.userId !== filters.userId) {
      return false
    }
    if (filters.type && log.type !== filters.type) {
      return false
    }
    if (filters.status && log.status !== filters.status) {
      return false
    }
    if (filters.tags && !filters.tags.some((tag) => log.metadata?.tags?.includes(tag))) {
      return false
    }
    if (filters.startTime && log.timestamp < filters.startTime) {
      return false
    }
    if (filters.endTime && log.timestamp > filters.endTime) {
      return false
    }

    return true
  }

  /**
   * Sort logs
   */
  private sortLogs(
    logs: BaseLogEntry[],
    sortConfig: { field: string; order: 'asc' | 'desc' } = { field: 'timestamp', order: 'desc' }
  ): BaseLogEntry[] {
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
  private paginateLogs(
    logs: BaseLogEntry[],
    page: number = 1,
    limit: number = 50
  ): QueryResult<BaseLogEntry> {
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
      totalCount: logs.length,
      hasMore: end < logs.length,
    }
  }

  /**
   * Get nested value from object
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj)
  }

  /**
   * Calculate average response time
   */
  private calculateAverageResponseTime(logs: BaseLogEntry[]): number {
    const responses = logs.filter(
      (l): l is ResponseLogEntry => l.type === 'response' && 'metrics' in l && !!l.metrics?.latency
    )
    if (responses.length === 0) {
      return 0
    }

    const totalLatency = responses.reduce((sum, r) => sum + (r.metrics.latency || 0), 0)
    return totalLatency / responses.length
  }

  /**
   * Calculate average token usage
   */
  private calculateAverageTokenUsage(logs: BaseLogEntry[]): number {
    const responses = logs.filter(
      (l): l is ResponseLogEntry =>
        l.type === 'response' && 'metadata' in l && !!l.metadata?.totalTokens
    )
    if (responses.length === 0) {
      return 0
    }

    const totalTokens = responses.reduce((sum, r) => sum + (r.metadata.totalTokens || 0), 0)
    return totalTokens / responses.length
  }

  /**
   * Calculate error rate
   */
  private calculateErrorRate(logs: BaseLogEntry[]): Percentage {
    const responses = logs.filter((l) => l.type === 'response')
    if (responses.length === 0) {
      return 0 as Percentage
    }

    const errors = responses.filter((r) => r.status === 'error' || ('error' in r && r.error))
    return ((errors.length / responses.length) * 100) as Percentage
  }

  /**
   * Get top tags
   */
  private getTopTags(logs: BaseLogEntry[], limit: number = 10): TagStatistics[] {
    const tagCounts: Record<string, number> = {}

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
      .map(([tag, count]) => ({
        tag,
        count: count as Count,
        percentage: ((count / logs.length) * 100) as Percentage,
      }))
  }

  /**
   * Analyze user activity
   */
  private getUserActivity(logs: BaseLogEntry[]): UserActivitySummary {
    const userActivity: UserActivitySummary = {}

    logs.forEach((log) => {
      const userId = String(log.userId || 'anonymous')
      if (!userActivity[userId]) {
        userActivity[userId] = {
          promptCount: 0 as Count,
          responseCount: 0 as Count,
          interactionCount: 0 as Count,
          totalTokens: 0 as Count,
          errors: 0 as Count,
          averageSessionDuration: 0,
          lastActiveTime: 0,
        }
      }

      if (log.type === 'prompt') {
        userActivity[userId].promptCount++
      }
      if (log.type === 'response') {
        userActivity[userId].responseCount++
        if ('metadata' in log && log.metadata?.totalTokens) {
          userActivity[userId].totalTokens += log.metadata.totalTokens as Count
        }
        if (log.status === 'error') {
          userActivity[userId].errors++
        }
      }
      if (log.type === 'interaction') {
        userActivity[userId].interactionCount++
      }

      if (log.timestamp > userActivity[userId].lastActiveTime) {
        userActivity[userId].lastActiveTime = log.timestamp
      }
    })

    return userActivity
  }

  /**
   * Analyze costs
   */
  private analyzeCosts(logs: BaseLogEntry[]): CostAnalysis {
    const responses = logs.filter(
      (l): l is ResponseLogEntry => l.type === 'response' && 'metrics' in l && !!l.metrics?.cost
    )

    return {
      totalCost: responses.reduce((sum, r) => sum + (r.metrics.cost?.total || 0), 0),
      promptCost: responses.reduce((sum, r) => sum + (r.metrics.cost?.prompt || 0), 0),
      completionCost: responses.reduce((sum, r) => sum + (r.metrics.cost?.completion || 0), 0),
      averageCostPerRequest:
        responses.length > 0
          ? responses.reduce((sum, r) => sum + (r.metrics.cost?.total || 0), 0) / responses.length
          : 0,
      costByModel: this.groupCostsByModel(responses),
    }
  }

  /**
   * Group costs by model
   */
  private groupCostsByModel(responses: ResponseLogEntry[]): ModelCostBreakdown {
    const costByModel: ModelCostBreakdown = {}

    responses.forEach((response) => {
      const model = response.model || 'unknown'
      if (!costByModel[model]) {
        costByModel[model] = {
          total: 0,
          count: 0 as Count,
          average: 0,
        }
      }

      costByModel[model].total += response.metrics.cost?.total || 0
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
  private convertToCSV(logs: BaseLogEntry[]): string {
    if (logs.length === 0) {
      return ''
    }

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
      const responseLog = log as ResponseLogEntry
      return [
        log.id,
        new Date(log.timestamp).toISOString(),
        log.type,
        log.userId,
        log.sessionId,
        log.status || '',
        responseLog.model || '',
        responseLog.metadata?.totalTokens || '',
        responseLog.metrics?.cost?.total || '',
      ]
    })

    return [headers, ...rows].map((row) => row.join(',')).join('\n')
  }

  /**
   * Convert logs to Markdown format
   */
  private convertToMarkdown(logs: BaseLogEntry[]): string {
    let markdown = '# Prompt Logs\n\n'

    logs.forEach((log) => {
      markdown += `## ${log.type.toUpperCase()}: ${log.id}\n\n`
      markdown += `- **Timestamp**: ${new Date(log.timestamp).toISOString()}\n`
      markdown += `- **User**: ${log.userId}\n`
      markdown += `- **Session**: ${log.sessionId}\n`

      if (log.type === 'prompt') {
        const promptLog = log as PromptLogEntry
        markdown += `- **Prompt**: ${promptLog.prompt}\n`
      } else if (log.type === 'response') {
        const responseLog = log as ResponseLogEntry
        markdown += `- **Model**: ${responseLog.model}\n`
        markdown += `- **Response**: ${responseLog.response?.substring(0, 200)}...\n`
        markdown += `- **Tokens**: ${responseLog.metadata?.totalTokens || 'N/A'}\n`
        markdown += `- **Cost**: $${responseLog.metrics?.cost?.total || 'N/A'}\n`
      }

      markdown += '\n---\n\n'
    })

    return markdown
  }

  /**
   * Archive log to external storage
   */
  private async archiveLog(log: BaseLogEntry): Promise<void> {
    // Implement external storage archival (e.g., to server, cloud storage)
    console.info(`Archiving log: ${log.id}`)
  }

  /**
   * Analyze recent logs for insights
   */
  private async analyzeRecentLogs(): Promise<void> {
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
  private getEnvironment(): EnvironmentInfo {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timestamp: Date.now(),
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
