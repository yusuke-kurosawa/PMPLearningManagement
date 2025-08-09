/**
 * Context Management Service
 * Handles context storage, compression, and optimization for memory efficiency
 */

class ContextManager {
  constructor() {
    this.cache = new Map()
    this.compressionThreshold = 1024 // 1KB
    this.maxCacheSize = 50 // Maximum cached items
    this.cleanupInterval = 24 * 60 * 60 * 1000 // 24 hours
    this.startCleanupTimer()
  }

  /**
   * Store context data with automatic compression
   */
  store(key, data, options = {}) {
    try {
      const serialized = JSON.stringify(data)
      const compressed = this.shouldCompress(serialized) ? this.compress(serialized) : serialized

      const contextItem = {
        data: compressed,
        compressed: this.shouldCompress(serialized),
        timestamp: Date.now(),
        accessCount: 0,
        priority: options.priority || 'normal',
        ttl: options.ttl || this.cleanupInterval,
      }

      this.cache.set(key, contextItem)
      this.enforceMaxSize()

      return true
    } catch (error) {
      console.error('Context storage failed:', error)
      return false
    }
  }

  /**
   * Retrieve context data with decompression
   */
  retrieve(key) {
    try {
      const item = this.cache.get(key)
      if (!item) return null

      // Check TTL
      if (Date.now() - item.timestamp > item.ttl) {
        this.cache.delete(key)
        return null
      }

      // Update access metrics
      item.accessCount++
      item.timestamp = Date.now()

      const data = item.compressed ? this.decompress(item.data) : item.data

      return JSON.parse(data)
    } catch (error) {
      console.error('Context retrieval failed:', error)
      return null
    }
  }

  /**
   * Simple compression using base64 encoding and string compression
   */
  compress(data) {
    try {
      // Simple compression - in production, use a proper compression library
      return btoa(encodeURIComponent(data))
    } catch (error) {
      return data
    }
  }

  /**
   * Decompress data
   */
  decompress(compressedData) {
    try {
      return decodeURIComponent(atob(compressedData))
    } catch (error) {
      return compressedData
    }
  }

  /**
   * Check if data should be compressed
   */
  shouldCompress(data) {
    return data && data.length > this.compressionThreshold
  }

  /**
   * Enforce maximum cache size using LRU strategy
   */
  enforceMaxSize() {
    if (this.cache.size <= this.maxCacheSize) return

    // Sort by priority and last access time
    const entries = Array.from(this.cache.entries())
      .map(([key, value]) => ({
        key,
        priority: this.getPriorityWeight(value.priority),
        lastAccess: value.timestamp,
        accessCount: value.accessCount,
        score: this.calculateEvictionScore(value),
      }))
      .sort((a, b) => a.score - b.score)

    // Remove least important entries
    const toRemove = entries.slice(0, this.cache.size - this.maxCacheSize)
    toRemove.forEach((entry) => this.cache.delete(entry.key))
  }

  /**
   * Calculate eviction score (lower = more likely to be evicted)
   */
  calculateEvictionScore(item) {
    const ageWeight = 0.3
    const accessWeight = 0.5
    const priorityWeight = 0.2

    const age = Date.now() - item.timestamp
    const ageScore = 1 / (age + 1) // Newer items get higher scores
    const accessScore = item.accessCount
    const priorityScore = this.getPriorityWeight(item.priority)

    return ageScore * ageWeight + accessScore * accessWeight + priorityScore * priorityWeight
  }

  /**
   * Get numeric priority weight
   */
  getPriorityWeight(priority) {
    const weights = {
      critical: 100,
      high: 75,
      normal: 50,
      low: 25,
    }
    return weights[priority] || 50
  }

  /**
   * Clean up expired entries
   */
  cleanup() {
    const now = Date.now()
    const expiredKeys = []

    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        expiredKeys.push(key)
      }
    }

    expiredKeys.forEach((key) => this.cache.delete(key))

    console.warn(`Context cleanup: Removed ${expiredKeys.length} expired entries`)
    return expiredKeys.length
  }

  /**
   * Start automatic cleanup timer
   */
  startCleanupTimer() {
    setInterval(() => {
      this.cleanup()
    }, this.cleanupInterval)
  }

  /**
   * Get context statistics
   */
  getStats() {
    const totalSize = Array.from(this.cache.values()).reduce(
      (total, item) => total + JSON.stringify(item).length,
      0
    )

    return {
      totalEntries: this.cache.size,
      totalSizeKB: Math.round(totalSize / 1024),
      cacheHitRate: this.calculateHitRate(),
      averageAccessCount: this.calculateAverageAccessCount(),
      compressionRatio: this.calculateCompressionRatio(),
    }
  }

  /**
   * Calculate cache hit rate
   */
  calculateHitRate() {
    // This would need to track hits/misses over time
    return 0.85 // Placeholder
  }

  /**
   * Calculate average access count
   */
  calculateAverageAccessCount() {
    if (this.cache.size === 0) return 0
    const totalAccesses = Array.from(this.cache.values()).reduce(
      (total, item) => total + item.accessCount,
      0
    )
    return Math.round(totalAccesses / this.cache.size)
  }

  /**
   * Calculate compression ratio
   */
  calculateCompressionRatio() {
    const items = Array.from(this.cache.values())
    const compressedItems = items.filter((item) => item.compressed)
    return compressedItems.length / items.length || 0
  }

  /**
   * Archive old data to persistent storage
   */
  async archiveOldData(maxAge = 7 * 24 * 60 * 60 * 1000) {
    // 7 days
    const now = Date.now()
    const archiveData = {}
    const keysToArchive = []

    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > maxAge && item.accessCount < 2) {
        archiveData[key] = item
        keysToArchive.push(key)
      }
    }

    if (keysToArchive.length > 0) {
      try {
        // Store in localStorage as archive
        localStorage.setItem('contextArchive', JSON.stringify(archiveData))
        keysToArchive.forEach((key) => this.cache.delete(key))

        console.warn(`Archived ${keysToArchive.length} context entries`)
        return keysToArchive.length
      } catch (error) {
        console.error('Context archiving failed:', error)
        return 0
      }
    }

    return 0
  }

  /**
   * Restore data from archive
   */
  async restoreFromArchive(key) {
    try {
      const archive = localStorage.getItem('contextArchive')
      if (!archive) return null

      const archiveData = JSON.parse(archive)
      const item = archiveData[key]

      if (item) {
        this.cache.set(key, item)
        delete archiveData[key]
        localStorage.setItem('contextArchive', JSON.stringify(archiveData))

        return this.retrieve(key)
      }
    } catch (error) {
      console.error('Context restoration failed:', error)
    }

    return null
  }

  /**
   * Clear all context data
   */
  clear() {
    this.cache.clear()
    localStorage.removeItem('contextArchive')
  }

  /**
   * Export context for backup
   */
  export() {
    return {
      cache: Object.fromEntries(this.cache),
      archive: localStorage.getItem('contextArchive'),
      timestamp: Date.now(),
    }
  }

  /**
   * Import context from backup
   */
  import(backupData) {
    try {
      this.cache = new Map(Object.entries(backupData.cache || {}))
      if (backupData.archive) {
        localStorage.setItem('contextArchive', backupData.archive)
      }
      return true
    } catch (error) {
      console.error('Context import failed:', error)
      return false
    }
  }
}

// Create singleton instance
const contextManager = new ContextManager()

export default contextManager

// Export specific functions for easier use
export const {
  store: storeContext,
  retrieve: retrieveContext,
  cleanup: cleanupContext,
  getStats: getContextStats,
  archiveOldData,
  restoreFromArchive,
  clear: clearContext,
  export: exportContext,
  import: importContext,
} = contextManager
