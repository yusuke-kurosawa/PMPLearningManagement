import { openDB, IDBPDatabase } from 'idb'
import { logger } from '../../services/logger'

export interface SyncQueueItem {
  id: string
  type:
    | 'progress-update'
    | 'exam-result-create'
    | 'flashcard-update'
    | 'setting-update'
    | 'user-action'
  data: unknown
  timestamp: number
  retryCount: number
  maxRetries: number
  status: 'pending' | 'in-progress' | 'completed' | 'failed'
  error?: string
  priority: 'low' | 'medium' | 'high'
  userId?: string
}

export interface SyncOptions {
  priority?: 'low' | 'medium' | 'high'
  maxRetries?: number
  delay?: number
}

export class SyncQueue {
  private dbPromise: Promise<IDBPDatabase> | null = null
  private readonly DB_NAME = 'PMPSyncQueue'
  private readonly DB_VERSION = 1
  private readonly STORE_NAME = 'syncQueue'
  private isProcessing = false
  private processingInterval: NodeJS.Timeout | null = null

  constructor() {
    this.initDB()
    this.startProcessing()
  }

  /**
   * Initialize IndexedDB for sync queue
   */
  private async initDB(): Promise<IDBPDatabase> {
    if (!this.dbPromise) {
      this.dbPromise = openDB(this.DB_NAME, this.DB_VERSION, {
        upgrade(db) {
          if (!db.objectStoreNames.contains('syncQueue')) {
            const store = db.createObjectStore('syncQueue', {
              keyPath: 'id',
            })
            store.createIndex('timestamp', 'timestamp')
            store.createIndex('type', 'type')
            store.createIndex('status', 'status')
            store.createIndex('priority', 'priority')
            store.createIndex('userId', 'userId')
          }
        },
      })
    }
    return this.dbPromise
  }

  /**
   * Add item to sync queue
   */
  async add(
    type: SyncQueueItem['type'],
    data: unknown,
    options: SyncOptions = {}
  ): Promise<string> {
    try {
      const db = await this.initDB()

      const item: SyncQueueItem = {
        id: this.generateId(),
        type,
        data,
        timestamp: Date.now(),
        retryCount: 0,
        maxRetries: options.maxRetries || 3,
        status: 'pending',
        priority: options.priority || 'medium',
        userId: data.userId || 'local-user',
      }

      const tx = db.transaction(this.STORE_NAME, 'readwrite')
      await tx.objectStore(this.STORE_NAME).put(item)
      await tx.complete

      // Trigger immediate processing for high priority items
      if (options.priority === 'high') {
        setTimeout(() => this.processQueue(), 100)
      }

      return item.id
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('Failed to add item to sync queue:', error)
      }
      throw new Error(
        `Queue add failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * Get pending items from queue
   */
  async getPendingItems(limit: number = 10): Promise<SyncQueueItem[]> {
    try {
      const db = await this.initDB()

      const tx = db.transaction(this.STORE_NAME, 'readonly')
      const index = tx.objectStore(this.STORE_NAME).index('status')
      const items = await index.getAll('pending')
      await tx.complete

      // Sort by priority and timestamp
      return items
        .sort((a, b) => {
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
            return priorityOrder[b.priority] - priorityOrder[a.priority]
          }
          return a.timestamp - b.timestamp
        })
        .slice(0, limit)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('Failed to get pending items:', error)
      }
      return []
    }
  }

  /**
   * Update item status
   */
  async updateItemStatus(
    id: string,
    status: SyncQueueItem['status'],
    error?: string
  ): Promise<void> {
    try {
      const db = await this.initDB()

      const tx = db.transaction(this.STORE_NAME, 'readwrite')
      const store = tx.objectStore(this.STORE_NAME)
      const item = await store.get(id)

      if (item) {
        item.status = status
        if (error) {
          item.error = error
          item.retryCount++
        }
        if (status === 'completed') {
          item.error = undefined
        }

        await store.put(item)
      }

      await tx.complete
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('Failed to update item status:', error)
      }
    }
  }

  /**
   * Remove item from queue
   */
  async removeItem(id: string): Promise<void> {
    try {
      const db = await this.initDB()

      const tx = db.transaction(this.STORE_NAME, 'readwrite')
      await tx.objectStore(this.STORE_NAME).delete(id)
      await tx.complete
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('Failed to remove item from queue:', error)
      }
    }
  }

  /**
   * Process sync queue
   */
  async processQueue(): Promise<void> {
    if (this.isProcessing || !navigator.onLine) {
      return
    }

    this.isProcessing = true

    try {
      const pendingItems = await this.getPendingItems(5)

      for (const item of pendingItems) {
        if (item.retryCount >= item.maxRetries) {
          await this.updateItemStatus(item.id, 'failed', 'Max retries exceeded')
          continue
        }

        await this.updateItemStatus(item.id, 'in-progress')

        try {
          await this.processItem(item)
          await this.updateItemStatus(item.id, 'completed')
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          await this.updateItemStatus(item.id, 'pending', errorMessage)

          // Exponential backoff for retries
          const delay = Math.pow(2, item.retryCount) * 1000
          setTimeout(() => {}, delay)
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('Queue processing error:', error)
      }
    } finally {
      this.isProcessing = false
    }
  }

  /**
   * Process individual sync item
   */
  private async processItem(item: SyncQueueItem): Promise<void> {
    switch (item.type) {
      case 'progress-update':
        await this.syncProgressUpdate(item.data)
        break
      case 'exam-result-create':
        await this.syncExamResult(item.data)
        break
      case 'flashcard-update':
        await this.syncFlashCardUpdate(item.data)
        break
      case 'setting-update':
        await this.syncSettingUpdate(item.data)
        break
      case 'user-action':
        await this.syncUserAction(item.data)
        break
      default:
        throw new Error(`Unknown sync type: ${item.type}`)
    }
  }

  /**
   * Sync progress update to server
   */
  private async syncProgressUpdate(data: unknown): Promise<void> {
    // Mock API call - replace with actual API endpoint
    const response = await fetch('/api/progress', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-ID': data.userId,
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Progress sync failed: ${response.statusText}`)
    }
  }

  /**
   * Sync exam result to server
   */
  private async syncExamResult(data: unknown): Promise<void> {
    // Mock API call - replace with actual API endpoint
    const response = await fetch('/api/exam-results', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-ID': data.userId,
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Exam result sync failed: ${response.statusText}`)
    }
  }

  /**
   * Sync flashcard update to server
   */
  private async syncFlashCardUpdate(data: unknown): Promise<void> {
    // Mock API call - replace with actual API endpoint
    const response = await fetch('/api/flashcards', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-User-ID': data.userId,
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Flashcard sync failed: ${response.statusText}`)
    }
  }

  /**
   * Sync setting update to server
   */
  private async syncSettingUpdate(data: unknown): Promise<void> {
    // Mock API call - replace with actual API endpoint
    const response = await fetch('/api/settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-User-ID': data.userId,
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Setting sync failed: ${response.statusText}`)
    }
  }

  /**
   * Sync user action to server
   */
  private async syncUserAction(data: unknown): Promise<void> {
    // Mock API call - replace with actual API endpoint
    const response = await fetch('/api/user-actions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-ID': data.userId,
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`User action sync failed: ${response.statusText}`)
    }
  }

  /**
   * Start queue processing interval
   */
  private startProcessing(): void {
    // Process queue every 30 seconds
    this.processingInterval = setInterval(() => {
      if (navigator.onLine) {
        this.processQueue()
      }
    }, 30000)

    // Process immediately when coming back online
    window.addEventListener('online', () => {
      setTimeout(() => this.processQueue(), 1000)
    })
  }

  /**
   * Stop queue processing
   */
  stopProcessing(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval)
      this.processingInterval = null
    }
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(): Promise<{
    pending: number
    inProgress: number
    completed: number
    failed: number
    total: number
  }> {
    try {
      const db = await this.initDB()

      const tx = db.transaction(this.STORE_NAME, 'readonly')
      const items = await tx.objectStore(this.STORE_NAME).getAll()
      await tx.complete

      const stats = items.reduce(
        (acc, item) => {
          acc[item.status]++
          acc.total++
          return acc
        },
        {
          pending: 0,
          'in-progress': 0,
          completed: 0,
          failed: 0,
          total: 0,
        }
      )

      return {
        pending: stats.pending,
        inProgress: stats['in-progress'],
        completed: stats.completed,
        failed: stats.failed,
        total: stats.total,
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('Failed to get queue stats:', error)
      }
      return {
        pending: 0,
        inProgress: 0,
        completed: 0,
        failed: 0,
        total: 0,
      }
    }
  }

  /**
   * Clear all completed items
   */
  async clearCompleted(): Promise<number> {
    try {
      const db = await this.initDB()
      let removedCount = 0

      const tx = db.transaction(this.STORE_NAME, 'readwrite')
      const store = tx.objectStore(this.STORE_NAME)
      const index = store.index('status')
      const items = await index.getAll('completed')

      for (const item of items) {
        await store.delete(item.id)
        removedCount++
      }

      await tx.complete
      return removedCount
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('Failed to clear completed items:', error)
      }
      return 0
    }
  }

  /**
   * Clear entire queue
   */
  async clear(): Promise<void> {
    try {
      const db = await this.initDB()

      const tx = db.transaction(this.STORE_NAME, 'readwrite')
      await tx.objectStore(this.STORE_NAME).clear()
      await tx.complete
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('Failed to clear queue:', error)
      }
    }
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `sync-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Retry failed items
   */
  async retryFailedItems(): Promise<void> {
    try {
      const db = await this.initDB()

      const tx = db.transaction(this.STORE_NAME, 'readwrite')
      const store = tx.objectStore(this.STORE_NAME)
      const index = store.index('status')
      const failedItems = await index.getAll('failed')

      for (const item of failedItems) {
        if (item.retryCount < item.maxRetries) {
          item.status = 'pending'
          item.retryCount = 0 // Reset retry count for manual retry
          item.error = undefined
          await store.put(item)
        }
      }

      await tx.complete

      // Trigger immediate processing
      setTimeout(() => this.processQueue(), 100)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('Failed to retry failed items:', error)
      }
    }
  }
}

export const syncQueue = new SyncQueue()
