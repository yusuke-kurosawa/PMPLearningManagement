/**
 * Advanced Storage Manager for PWA Offline Functionality
 * Handles IndexedDB, cache management, and conflict resolution
 */

import { openDB, IDBPDatabase } from 'idb'

interface StorageQuota {
  usage: number
  quota: number
  percentage: number
}

interface ConflictData {
  id: string
  entityType: string
  conflictType: 'timestamp' | 'version' | 'data_mismatch'
  localData: any
  remoteData: any
  timestamp: number
  resolved: boolean
}

interface SyncQueueItem {
  id: string
  endpoint: string
  method: string
  data: any
  priority: 'high' | 'medium' | 'low'
  timestamp: number
  attempts: number
  maxAttempts: number
  lastError?: string
}

interface StudyContent {
  id: string
  type: string
  data: any
  version: number
  lastModified: number
  size: number
  priority: string
  accessCount: number
  lastAccessed: number
}

class StorageManager {
  private db: IDBPDatabase | null = null
  private readonly DB_NAME = 'PMPLearningAdvancedDB'
  private readonly DB_VERSION = 3
  private readonly CLEANUP_THRESHOLD = 0.85 // 85% storage usage
  private readonly MAX_STORAGE_SIZE = 100 * 1024 * 1024 // 100MB

  constructor() {
    this.initializeDatabase()
  }

  /**
   * Initialize IndexedDB with enhanced schema
   */
  private async initializeDatabase(): Promise<void> {
    try {
      this.db = await openDB(this.DB_NAME, this.DB_VERSION, {
        upgrade: (db) => {
          // Study content store
          if (!db.objectStoreNames.contains('studyContent')) {
            const studyStore = db.createObjectStore('studyContent', { keyPath: 'id' })
            studyStore.createIndex('type', 'type', { unique: false })
            studyStore.createIndex('priority', 'priority', { unique: false })
            studyStore.createIndex('lastAccessed', 'lastAccessed', { unique: false })
            studyStore.createIndex('size', 'size', { unique: false })
          }

          // Sync queue with priority
          if (!db.objectStoreNames.contains('syncQueue')) {
            const syncStore = db.createObjectStore('syncQueue', {
              keyPath: 'id',
              autoIncrement: true,
            })
            syncStore.createIndex('priority', 'priority', { unique: false })
            syncStore.createIndex('timestamp', 'timestamp', { unique: false })
            syncStore.createIndex('attempts', 'attempts', { unique: false })
          }

          // Progress tracking with versioning
          if (!db.objectStoreNames.contains('progressData')) {
            const progressStore = db.createObjectStore('progressData', { keyPath: 'userId' })
            progressStore.createIndex('version', 'version', { unique: false })
            progressStore.createIndex('lastModified', 'lastModified', { unique: false })
            progressStore.createIndex('syncStatus', 'syncStatus', { unique: false })
          }

          // Conflict resolution
          if (!db.objectStoreNames.contains('conflicts')) {
            const conflictStore = db.createObjectStore('conflicts', {
              keyPath: 'id',
              autoIncrement: true,
            })
            conflictStore.createIndex('entityType', 'entityType', { unique: false })
            conflictStore.createIndex('conflictType', 'conflictType', { unique: false })
            conflictStore.createIndex('resolved', 'resolved', { unique: false })
          }

          // Cache metadata
          if (!db.objectStoreNames.contains('cacheMetadata')) {
            const cacheStore = db.createObjectStore('cacheMetadata', { keyPath: 'key' })
            cacheStore.createIndex('lastUsed', 'lastUsed', { unique: false })
            cacheStore.createIndex('size', 'size', { unique: false })
            cacheStore.createIndex('priority', 'priority', { unique: false })
          }
        },
      })

      console.log('[StorageManager] Database initialized successfully')
      await this.performInitialCleanup()
    } catch (error) {
      console.error('[StorageManager] Database initialization failed:', error)
      throw error
    }
  }

  /**
   * Store study content with smart caching
   */
  async storeStudyContent(
    content: Omit<StudyContent, 'lastModified' | 'accessCount' | 'lastAccessed'>
  ): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized')
    }

    const enhancedContent: StudyContent = {
      ...content,
      lastModified: Date.now(),
      accessCount: 0,
      lastAccessed: Date.now(),
    }

    try {
      const tx = this.db.transaction(['studyContent'], 'readwrite')
      await tx.objectStore('studyContent').put(enhancedContent)

      // Check storage usage and cleanup if needed
      await this.checkAndCleanupStorage()

      console.log(`[StorageManager] Stored content: ${content.id}`)
    } catch (error) {
      console.error('[StorageManager] Failed to store content:', error)
      throw error
    }
  }

  /**
   * Retrieve study content with access tracking
   */
  async getStudyContent(id: string): Promise<StudyContent | null> {
    if (!this.db) {
      return null
    }

    try {
      const tx = this.db.transaction(['studyContent'], 'readwrite')
      const store = tx.objectStore('studyContent')
      const content = await store.get(id)

      if (content) {
        // Update access tracking
        content.accessCount++
        content.lastAccessed = Date.now()
        await store.put(content)
      }

      return content || null
    } catch (error) {
      console.error('[StorageManager] Failed to get content:', error)
      return null
    }
  }

  /**
   * Get all study content with filtering
   */
  async getAllStudyContent(filter?: {
    type?: string
    priority?: string
    minAccessCount?: number
  }): Promise<StudyContent[]> {
    if (!this.db) {
      return []
    }

    try {
      const tx = this.db.transaction(['studyContent'], 'readonly')
      const store = tx.objectStore('studyContent')
      let contents: StudyContent[] = []

      if (filter?.type) {
        const index = store.index('type')
        contents = await index.getAll(filter.type)
      } else {
        contents = await store.getAll()
      }

      // Apply additional filters
      if (filter?.priority) {
        contents = contents.filter((c) => c.priority === filter.priority)
      }
      if (filter?.minAccessCount) {
        contents = contents.filter((c) => c.accessCount >= filter.minAccessCount)
      }

      return contents
    } catch (error) {
      console.error('[StorageManager] Failed to get all content:', error)
      return []
    }
  }

  /**
   * Add item to sync queue with priority
   */
  async addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'attempts'>): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized')
    }

    const queueItem: Omit<SyncQueueItem, 'id'> = {
      ...item,
      timestamp: Date.now(),
      attempts: 0,
    }

    try {
      const tx = this.db.transaction(['syncQueue'], 'readwrite')
      await tx.objectStore('syncQueue').add(queueItem)
      console.log(`[StorageManager] Added to sync queue: ${item.endpoint}`)
    } catch (error) {
      console.error('[StorageManager] Failed to add to sync queue:', error)
      throw error
    }
  }

  /**
   * Get sync queue items ordered by priority
   */
  async getSyncQueue(priority?: 'high' | 'medium' | 'low'): Promise<SyncQueueItem[]> {
    if (!this.db) {
      return []
    }

    try {
      const tx = this.db.transaction(['syncQueue'], 'readonly')
      const store = tx.objectStore('syncQueue')

      let items: SyncQueueItem[] = []

      if (priority) {
        const index = store.index('priority')
        items = await index.getAll(priority)
      } else {
        items = await store.getAll()
        // Sort by priority: high -> medium -> low
        const priorityOrder = { high: 0, medium: 1, low: 2 }
        items.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
      }

      return items
    } catch (error) {
      console.error('[StorageManager] Failed to get sync queue:', error)
      return []
    }
  }

  /**
   * Remove item from sync queue
   */
  async removeFromSyncQueue(id: string): Promise<void> {
    if (!this.db) {
      return
    }

    try {
      const tx = this.db.transaction(['syncQueue'], 'readwrite')
      await tx.objectStore('syncQueue').delete(id)
      console.log(`[StorageManager] Removed from sync queue: ${id}`)
    } catch (error) {
      console.error('[StorageManager] Failed to remove from sync queue:', error)
    }
  }

  /**
   * Store progress data with conflict detection
   */
  async storeProgressData(userId: string, data: any, version: number = 1): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized')
    }

    try {
      const tx = this.db.transaction(['progressData'], 'readwrite')
      const store = tx.objectStore('progressData')

      // Check for existing data
      const existing = await store.get(userId)

      if (existing && existing.version > version) {
        // Potential conflict - newer version exists locally
        await this.createConflict({
          entityType: 'progress',
          conflictType: 'version',
          localData: existing,
          remoteData: { userId, data, version, lastModified: Date.now() },
        })
        return
      }

      const progressData = {
        userId,
        data,
        version,
        lastModified: Date.now(),
        syncStatus: 'pending',
      }

      await store.put(progressData)
      console.log(`[StorageManager] Stored progress for user: ${userId}`)
    } catch (error) {
      console.error('[StorageManager] Failed to store progress:', error)
      throw error
    }
  }

  /**
   * Create a conflict for later resolution
   */
  private async createConflict(
    conflict: Omit<ConflictData, 'id' | 'timestamp' | 'resolved'>
  ): Promise<void> {
    if (!this.db) {
      return
    }

    try {
      const conflictData: Omit<ConflictData, 'id'> = {
        ...conflict,
        timestamp: Date.now(),
        resolved: false,
      }

      const tx = this.db.transaction(['conflicts'], 'readwrite')
      await tx.objectStore('conflicts').add(conflictData)
      console.log(`[StorageManager] Created conflict: ${conflict.entityType}`)
    } catch (error) {
      console.error('[StorageManager] Failed to create conflict:', error)
    }
  }

  /**
   * Get unresolved conflicts
   */
  async getConflicts(): Promise<ConflictData[]> {
    if (!this.db) {
      return []
    }

    try {
      const tx = this.db.transaction(['conflicts'], 'readonly')
      const index = tx.objectStore('conflicts').index('resolved')
      return await index.getAll(false)
    } catch (error) {
      console.error('[StorageManager] Failed to get conflicts:', error)
      return []
    }
  }

  /**
   * Resolve conflict
   */
  async resolveConflict(
    conflictId: string,
    resolution: 'local' | 'remote' | 'merge',
    resolvedData?: any
  ): Promise<void> {
    if (!this.db) {
      return
    }

    try {
      const tx = this.db.transaction(['conflicts', 'progressData'], 'readwrite')
      const conflictStore = tx.objectStore('conflicts')
      const conflict = await conflictStore.get(conflictId)

      if (!conflict) {
        throw new Error('Conflict not found')
      }

      let finalData
      switch (resolution) {
        case 'local':
          finalData = conflict.localData
          break
        case 'remote':
          finalData = conflict.remoteData
          break
        case 'merge':
          finalData = resolvedData || this.mergeData(conflict.localData, conflict.remoteData)
          break
      }

      // Update the main data
      if (conflict.entityType === 'progress') {
        const progressStore = tx.objectStore('progressData')
        await progressStore.put({
          ...finalData,
          lastModified: Date.now(),
          version: Math.max(conflict.localData.version || 0, conflict.remoteData.version || 0) + 1,
        })
      }

      // Mark conflict as resolved
      conflict.resolved = true
      await conflictStore.put(conflict)

      console.log(`[StorageManager] Resolved conflict: ${conflictId} using ${resolution}`)
    } catch (error) {
      console.error('[StorageManager] Failed to resolve conflict:', error)
      throw error
    }
  }

  /**
   * Simple data merging strategy
   */
  private mergeData(localData: any, remoteData: any): any {
    // Use the most recent timestamp as the base
    const base = localData.lastModified > remoteData.lastModified ? localData : remoteData
    const other = localData.lastModified > remoteData.lastModified ? remoteData : localData

    // Merge data objects
    return {
      ...base,
      data: { ...other.data, ...base.data },
      lastModified: Date.now(),
      version: Math.max(localData.version || 0, remoteData.version || 0) + 1,
    }
  }

  /**
   * Get storage usage statistics
   */
  async getStorageStats(): Promise<StorageQuota | null> {
    if (!('storage' in navigator) || !('estimate' in navigator.storage)) {
      return null
    }

    try {
      const estimate = await navigator.storage.estimate()
      return {
        usage: estimate.usage || 0,
        quota: estimate.quota || 0,
        percentage: ((estimate.usage || 0) / (estimate.quota || 1)) * 100,
      }
    } catch (error) {
      console.error('[StorageManager] Failed to get storage stats:', error)
      return null
    }
  }

  /**
   * Check storage usage and trigger cleanup if needed
   */
  private async checkAndCleanupStorage(): Promise<void> {
    const stats = await this.getStorageStats()

    if (stats && stats.percentage > this.CLEANUP_THRESHOLD * 100) {
      console.log('[StorageManager] Storage threshold exceeded, starting cleanup...')
      await this.performSmartCleanup()
    }
  }

  /**
   * Perform smart cleanup based on usage patterns
   */
  private async performSmartCleanup(): Promise<void> {
    if (!this.db) {
      return
    }

    try {
      const tx = this.db.transaction(['studyContent', 'cacheMetadata'], 'readwrite')
      const contentStore = tx.objectStore('studyContent')
      const metadataStore = tx.objectStore('cacheMetadata')

      // Get all content sorted by last accessed (oldest first)
      const allContent = await contentStore.getAll()
      const sortedContent = allContent.sort((a, b) => a.lastAccessed - b.lastAccessed)

      // Remove least accessed content until under threshold
      const targetSize = this.MAX_STORAGE_SIZE * 0.7 // Clean to 70%
      let currentSize = allContent.reduce((sum, item) => sum + item.size, 0)

      for (const content of sortedContent) {
        if (currentSize <= targetSize) {
          break
        }

        // Don't remove high priority or recently accessed content
        if (
          content.priority === 'high' ||
          Date.now() - content.lastAccessed < 24 * 60 * 60 * 1000
        ) {
          continue
        }

        await contentStore.delete(content.id)
        currentSize -= content.size
        console.log(`[StorageManager] Cleaned up content: ${content.id}`)
      }

      // Clean up old cache metadata
      const oldMetadata = await metadataStore.index('lastUsed').getAll()
      const cutoffTime = Date.now() - 7 * 24 * 60 * 60 * 1000 // 7 days

      for (const metadata of oldMetadata) {
        if (metadata.lastUsed < cutoffTime) {
          await metadataStore.delete(metadata.key)
        }
      }

      console.log('[StorageManager] Smart cleanup completed')
    } catch (error) {
      console.error('[StorageManager] Smart cleanup failed:', error)
    }
  }

  /**
   * Perform initial cleanup on database initialization
   */
  private async performInitialCleanup(): Promise<void> {
    if (!this.db) {
      return
    }

    try {
      // Clean up resolved conflicts older than 30 days
      const cutoffTime = Date.now() - 30 * 24 * 60 * 60 * 1000
      const tx = this.db.transaction(['conflicts'], 'readwrite')
      const store = tx.objectStore('conflicts')
      const oldConflicts = await store.getAll()

      for (const conflict of oldConflicts) {
        if (conflict.resolved && conflict.timestamp < cutoffTime) {
          await store.delete(conflict.id)
        }
      }

      console.log('[StorageManager] Initial cleanup completed')
    } catch (error) {
      console.error('[StorageManager] Initial cleanup failed:', error)
    }
  }

  /**
   * Export data for backup
   */
  async exportData(): Promise<{ [storeName: string]: any[] }> {
    if (!this.db) {
      return {}
    }

    try {
      const data: { [storeName: string]: any[] } = {}
      const storeNames = ['studyContent', 'progressData', 'syncQueue', 'conflicts']

      for (const storeName of storeNames) {
        const tx = this.db.transaction([storeName], 'readonly')
        const store = tx.objectStore(storeName)
        data[storeName] = await store.getAll()
      }

      return data
    } catch (error) {
      console.error('[StorageManager] Export failed:', error)
      return {}
    }
  }

  /**
   * Import data from backup
   */
  async importData(data: { [storeName: string]: any[] }): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized')
    }

    try {
      const storeNames = Object.keys(data)
      const tx = this.db.transaction(storeNames, 'readwrite')

      for (const storeName of storeNames) {
        const store = tx.objectStore(storeName)
        await store.clear() // Clear existing data

        for (const item of data[storeName]) {
          await store.add(item)
        }
      }

      console.log('[StorageManager] Data import completed')
    } catch (error) {
      console.error('[StorageManager] Import failed:', error)
      throw error
    }
  }

  /**
   * Clear all data
   */
  async clearAllData(): Promise<void> {
    if (!this.db) {
      return
    }

    try {
      const storeNames = ['studyContent', 'progressData', 'syncQueue', 'conflicts', 'cacheMetadata']
      const tx = this.db.transaction(storeNames, 'readwrite')

      for (const storeName of storeNames) {
        await tx.objectStore(storeName).clear()
      }

      console.log('[StorageManager] All data cleared')
    } catch (error) {
      console.error('[StorageManager] Failed to clear data:', error)
      throw error
    }
  }

  /**
   * Get database statistics
   */
  async getDatabaseStats(): Promise<{
    studyContent: number
    progressData: number
    syncQueue: number
    conflicts: number
    unresolvedConflicts: number
    totalSize: number
  }> {
    if (!this.db) {
      return {
        studyContent: 0,
        progressData: 0,
        syncQueue: 0,
        conflicts: 0,
        unresolvedConflicts: 0,
        totalSize: 0,
      }
    }

    try {
      const tx = this.db.transaction(
        ['studyContent', 'progressData', 'syncQueue', 'conflicts'],
        'readonly'
      )

      const [studyContent, progressData, syncQueue, conflicts] = await Promise.all([
        tx.objectStore('studyContent').count(),
        tx.objectStore('progressData').count(),
        tx.objectStore('syncQueue').count(),
        tx.objectStore('conflicts').count(),
      ])

      // Count unresolved conflicts
      const unresolvedConflicts = await tx.objectStore('conflicts').index('resolved').count(false)

      // Calculate total size
      const allContent = await tx.objectStore('studyContent').getAll()
      const totalSize = allContent.reduce((sum, item) => sum + (item.size || 0), 0)

      return {
        studyContent,
        progressData,
        syncQueue,
        conflicts,
        unresolvedConflicts,
        totalSize,
      }
    } catch (error) {
      console.error('[StorageManager] Failed to get database stats:', error)
      return {
        studyContent: 0,
        progressData: 0,
        syncQueue: 0,
        conflicts: 0,
        unresolvedConflicts: 0,
        totalSize: 0,
      }
    }
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    if (this.db) {
      this.db.close()
      this.db = null
      console.log('[StorageManager] Database connection closed')
    }
  }
}

// Create singleton instance
export const storageManager = new StorageManager()
export default storageManager
