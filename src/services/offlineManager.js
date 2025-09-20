/**
 * @fileoverview Offline Manager Service
 * @module services/offlineManager
 * @requires lib/pwa/serviceWorkerManager
 *
 * PMPLearningManagement - Offline Learning Management System
 *
 * @description
 * 包括的なオフライン学習機能を提供するマネージャーサービス。
 * IndexedDBを使用した大容量データ管理、バックグラウンド同期、
 * インテリジェントキャッシングを実装。
 *
 * @features
 * - IndexedDB による大容量データ永続化
 * - バックグラウンド同期機能
 * - オフライン学習セッション管理
 * - インテリジェントプリフェッチ
 * - ネットワーク状態監視と適応
 *
 * @author OfflineManager Development Team
 * @created 2025-08-30
 */

import { openDB } from 'idb'
const { logger } = require('/logger')

// Configuration
const DB_NAME = 'pmp-learning-offline-db'
const DB_VERSION = 1
const SYNC_TAG = 'pmp-learning-sync'
const CACHE_NAME = 'pmp-offline-v1'

// Store Names
const STORES = {
  LEARNING_DATA: 'learning-data',
  EXAM_QUESTIONS: 'exam-questions',
  PROGRESS: 'progress',
  STUDY_SESSIONS: 'study-sessions',
  PENDING_SYNC: 'pending-sync',
  CACHED_RESPONSES: 'cached-responses',
}

/**
 * Offline Manager Class
 *
 * @class OfflineManager
 * @description Complete offline learning management system
 */
class OfflineManager {
  constructor() {
    this.db = null
    this.isOnline = navigator.onLine
    this.syncPending = false
    this.prefetchQueue = []
    this.cacheStrategies = new Map()

    this.init()
  }

  /**
   * Initialize offline manager
   * @async
   * @returns {Promise<void>}
   */
  async init() {
    try {
      // Initialize IndexedDB
      await this.initDatabase()

      // Setup event listeners
      this.setupEventListeners()

      // Register background sync
      await this.registerBackgroundSync()

      // Prefetch critical data
      await this.prefetchCriticalData()

      // Initialize cache strategies
      this.initializeCacheStrategies()

      logger.info('✅ Offline Manager initialized successfully')
    } catch (error) {
      logger.error('❌ Offline Manager initialization failed:', error)
    }
  }

  /**
   * Initialize IndexedDB
   * @async
   * @returns {Promise<void>}
   */
  async initDatabase() {
    this.db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // _oldVersion, _newVersion, _transaction not used
        // Create stores if they don't exist
        if (!db.objectStoreNames.contains(STORES.LEARNING_DATA)) {
          const learningStore = db.createObjectStore(STORES.LEARNING_DATA, {
            keyPath: 'id',
            autoIncrement: true,
          })
          learningStore.createIndex('type', 'type')
          learningStore.createIndex('timestamp', 'timestamp')
        }

        if (!db.objectStoreNames.contains(STORES.EXAM_QUESTIONS)) {
          const examStore = db.createObjectStore(STORES.EXAM_QUESTIONS, {
            keyPath: 'questionId',
          })
          examStore.createIndex('category', 'category')
          examStore.createIndex('difficulty', 'difficulty')
        }

        if (!db.objectStoreNames.contains(STORES.PROGRESS)) {
          const progressStore = db.createObjectStore(STORES.PROGRESS, {
            keyPath: 'userId',
          })
          progressStore.createIndex('lastUpdated', 'lastUpdated')
        }

        if (!db.objectStoreNames.contains(STORES.STUDY_SESSIONS)) {
          const sessionStore = db.createObjectStore(STORES.STUDY_SESSIONS, {
            keyPath: 'sessionId',
            autoIncrement: true,
          })
          sessionStore.createIndex('userId', 'userId')
          sessionStore.createIndex('date', 'date')
        }

        if (!db.objectStoreNames.contains(STORES.PENDING_SYNC)) {
          const syncStore = db.createObjectStore(STORES.PENDING_SYNC, {
            keyPath: 'id',
            autoIncrement: true,
          })
          syncStore.createIndex('timestamp', 'timestamp')
          syncStore.createIndex('type', 'type')
        }

        if (!db.objectStoreNames.contains(STORES.CACHED_RESPONSES)) {
          const cacheStore = db.createObjectStore(STORES.CACHED_RESPONSES, {
            keyPath: 'url',
          })
          cacheStore.createIndex('timestamp', 'timestamp')
          cacheStore.createIndex('expiry', 'expiry')
        }
      },
    })
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Network status monitoring
    window.addEventListener('online', () => this.handleOnline())
    window.addEventListener('offline', () => this.handleOffline())

    // Visibility change for sync optimization
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.isOnline) {
        this.performBackgroundSync()
      }
    })

    // Service worker message handling
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        this.handleServiceWorkerMessage(event)
      })
    }
  }

  /**
   * Handle online status
   * @async
   */
  async handleOnline() {
    this.isOnline = true
    logger.info('🌐 Network connected - starting sync')

    // Perform immediate sync
    await this.performBackgroundSync()

    // Notify user
    this.notifyUser('オンラインになりました。データを同期中...', 'success')
  }

  /**
   * Handle offline status
   */
  handleOffline() {
    this.isOnline = false
    logger.info('📴 Network disconnected - offline mode activated')

    // Notify user
    this.notifyUser('オフラインモードが有効です。学習を続けられます。', 'info')
  }

  /**
   * Register background sync
   * @async
   * @returns {Promise<void>}
   */
  async registerBackgroundSync() {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready
        await registration.sync.register(SYNC_TAG)
        logger.info('✅ Background sync registered')
      } catch (error) {
        logger.error('❌ Background sync registration failed:', error)
      }
    }
  }

  /**
   * Perform background sync
   * @async
   * @returns {Promise<void>}
   */
  async performBackgroundSync() {
    if (!this.isOnline || this.syncPending) {
      return
    }

    this.syncPending = true

    try {
      // Get pending sync items
      const pendingItems = await this.getPendingSyncItems()

      if (pendingItems.length === 0) {
        logger.info('✅ No pending items to sync')
        return
      }

      logger.info(`🔄 Syncing ${pendingItems.length} items...`)

      // Sync each item
      for (const item of pendingItems) {
        await this.syncItem(item)
      }

      logger.info('✅ Background sync completed')
      this.notifyUser('データ同期が完了しました', 'success')
    } catch (error) {
      logger.error('❌ Background sync failed:', error)
      this.notifyUser('同期に失敗しました。後で再試行します。', 'error')
    } finally {
      this.syncPending = false
    }
  }

  /**
   * Get pending sync items
   * @async
   * @returns {Promise<Array>}
   */
  async getPendingSyncItems() {
    const tx = this.db.transaction(STORES.PENDING_SYNC, 'readonly')
    const store = tx.objectStore(STORES.PENDING_SYNC)
    return await store.getAll()
  }

  /**
   * Sync individual item
   * @async
   * @param {Object} item - Item to sync
   * @returns {Promise<void>}
   */
  async syncItem(item) {
    try {
      const response = await fetch(item.url, {
        method: item.method || 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...item.headers,
        },
        body: JSON.stringify(item.data),
      })

      if (response.ok) {
        // Remove from pending sync
        await this.removePendingSyncItem(item.id)
        logger.info(`✅ Synced item: ${item.id}`)
      } else {
        logger.error(`❌ Failed to sync item: ${item.id}`)
      }
    } catch (error) {
      logger.error(`❌ Error syncing item ${item.id}:`, error)
    }
  }

  /**
   * Remove pending sync item
   * @async
   * @param {number} id - Item ID
   * @returns {Promise<void>}
   */
  async removePendingSyncItem(id) {
    const tx = this.db.transaction(STORES.PENDING_SYNC, 'readwrite')
    const store = tx.objectStore(STORES.PENDING_SYNC)
    await store.delete(id)
  }

  /**
   * Prefetch critical data
   * @async
   * @returns {Promise<void>}
   */
  async prefetchCriticalData() {
    const criticalUrls = [
      '/api/pmbok/processes',
      '/api/pmbok/itto',
      '/api/glossary/terms',
      '/api/exam/questions-basic',
    ]

    logger.info('📥 Prefetching critical data...')

    for (const url of criticalUrls) {
      try {
        await this.prefetchUrl(url)
      } catch (error) {
        logger.error(`Failed to prefetch ${url}:`, error)
      }
    }

    logger.info('✅ Critical data prefetch completed')
  }

  /**
   * Prefetch URL
   * @async
   * @param {string} url - URL to prefetch
   * @returns {Promise<void>}
   */
  async prefetchUrl(url) {
    if (!this.isOnline) {
      return
    }

    try {
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        await this.cacheResponse(url, data)
      }
    } catch (error) {
      logger.error(`Prefetch failed for ${url}:`, error)
    }
  }

  /**
   * Cache response in IndexedDB
   * @async
   * @param {string} url - URL
   * @param {*} data - Response data
   * @param {number} ttl - Time to live in milliseconds
   * @returns {Promise<void>}
   */
  async cacheResponse(url, data, ttl = 3600000) {
    // 1 hour default
    const tx = this.db.transaction(STORES.CACHED_RESPONSES, 'readwrite')
    const store = tx.objectStore(STORES.CACHED_RESPONSES)

    await store.put({
      url,
      data,
      timestamp: Date.now(),
      expiry: Date.now() + ttl,
    })
  }

  /**
   * Get cached response
   * @async
   * @param {string} url - URL
   * @returns {Promise<*|null>}
   */
  async getCachedResponse(url) {
    const tx = this.db.transaction(STORES.CACHED_RESPONSES, 'readonly')
    const store = tx.objectStore(STORES.CACHED_RESPONSES)
    const cached = await store.get(url)

    if (cached && cached.expiry > Date.now()) {
      return cached.data
    }

    // Remove expired cache
    if (cached) {
      await this.removeCachedResponse(url)
    }

    return null
  }

  /**
   * Remove cached response
   * @async
   * @param {string} url - URL
   * @returns {Promise<void>}
   */
  async removeCachedResponse(url) {
    const tx = this.db.transaction(STORES.CACHED_RESPONSES, 'readwrite')
    const store = tx.objectStore(STORES.CACHED_RESPONSES)
    await store.delete(url)
  }

  /**
   * Initialize cache strategies
   */
  initializeCacheStrategies() {
    // Cache-first strategy for static content
    this.cacheStrategies.set('cache-first', async (request) => {
      const cached = await caches.match(request)
      if (cached) {
        return cached
      }

      const response = await fetch(request)
      if (response.ok) {
        const cache = await caches.open(CACHE_NAME)
        cache.put(request, response.clone())
      }
      return response
    })

    // Network-first strategy for dynamic content
    this.cacheStrategies.set('network-first', async (request) => {
      try {
        const response = await fetch(request)
        if (response.ok) {
          const cache = await caches.open(CACHE_NAME)
          cache.put(request, response.clone())
        }
        return response
      } catch (error) {
        const cached = await caches.match(request)
        if (cached) {
          return cached
        }
        throw error
      }
    })

    // Stale-while-revalidate strategy
    this.cacheStrategies.set('stale-while-revalidate', async (request) => {
      const cached = await caches.match(request)

      const fetchPromise = fetch(request).then((response) => {
        if (response.ok) {
          const cache = caches.open(CACHE_NAME)
          cache.then((c) => c.put(request, response.clone()))
        }
        return response
      })

      return cached || fetchPromise
    })
  }

  /**
   * Save learning progress offline
   * @async
   * @param {Object} progressData - Progress data
   * @returns {Promise<void>}
   */
  async saveProgressOffline(progressData) {
    const tx = this.db.transaction(STORES.PROGRESS, 'readwrite')
    const store = tx.objectStore(STORES.PROGRESS)

    await store.put({
      ...progressData,
      lastUpdated: Date.now(),
      syncStatus: this.isOnline ? 'synced' : 'pending',
    })

    // Add to pending sync if offline
    if (!this.isOnline) {
      await this.addToPendingSync({
        type: 'progress',
        url: '/api/progress/save',
        data: progressData,
      })
    }
  }

  /**
   * Add item to pending sync
   * @async
   * @param {Object} item - Item to sync
   * @returns {Promise<void>}
   */
  async addToPendingSync(item) {
    const tx = this.db.transaction(STORES.PENDING_SYNC, 'readwrite')
    const store = tx.objectStore(STORES.PENDING_SYNC)

    await store.add({
      ...item,
      timestamp: Date.now(),
    })
  }

  /**
   * Save exam result offline
   * @async
   * @param {Object} examResult - Exam result data
   * @returns {Promise<void>}
   */
  async saveExamResultOffline(examResult) {
    const tx = this.db.transaction(STORES.STUDY_SESSIONS, 'readwrite')
    const store = tx.objectStore(STORES.STUDY_SESSIONS)

    await store.add({
      ...examResult,
      type: 'exam',
      date: Date.now(),
      syncStatus: this.isOnline ? 'synced' : 'pending',
    })

    // Add to pending sync if offline
    if (!this.isOnline) {
      await this.addToPendingSync({
        type: 'exam-result',
        url: '/api/exam/save-result',
        data: examResult,
      })
    }
  }

  /**
   * Get offline exam questions
   * @async
   * @param {Object} filters - Filter criteria
   * @returns {Promise<Array>}
   */
  async getOfflineExamQuestions(filters = {}) {
    const tx = this.db.transaction(STORES.EXAM_QUESTIONS, 'readonly')
    const store = tx.objectStore(STORES.EXAM_QUESTIONS)

    let questions = await store.getAll()

    // Apply filters
    if (filters.category) {
      questions = questions.filter((q) => q.category === filters.category)
    }

    if (filters.difficulty) {
      questions = questions.filter((q) => q.difficulty === filters.difficulty)
    }

    if (filters.limit) {
      questions = questions.slice(0, filters.limit)
    }

    return questions
  }

  /**
   * Cache exam questions for offline use
   * @async
   * @param {Array} questions - Exam questions
   * @returns {Promise<void>}
   */
  async cacheExamQuestions(questions) {
    const tx = this.db.transaction(STORES.EXAM_QUESTIONS, 'readwrite')
    const store = tx.objectStore(STORES.EXAM_QUESTIONS)

    for (const question of questions) {
      await store.put(question)
    }

    logger.info(`✅ Cached ${questions.length} exam questions for offline use`)
  }

  /**
   * Get learning statistics
   * @async
   * @returns {Promise<Object>}
   */
  async getLearningStatistics() {
    const stats = {
      totalSessions: 0,
      totalTime: 0,
      questionsAnswered: 0,
      averageScore: 0,
      lastStudyDate: null,
    }

    const tx = this.db.transaction(STORES.STUDY_SESSIONS, 'readonly')
    const store = tx.objectStore(STORES.STUDY_SESSIONS)
    const sessions = await store.getAll()

    if (sessions.length > 0) {
      stats.totalSessions = sessions.length
      stats.totalTime = sessions.reduce((sum, s) => sum + (s.duration || 0), 0)
      stats.questionsAnswered = sessions.reduce((sum, s) => sum + (s.questionsAnswered || 0), 0)

      const examSessions = sessions.filter((s) => s.type === 'exam' && s.score)
      if (examSessions.length > 0) {
        stats.averageScore = examSessions.reduce((sum, s) => sum + s.score, 0) / examSessions.length
      }

      stats.lastStudyDate = Math.max(...sessions.map((s) => s.date))
    }

    return stats
  }

  /**
   * Clear offline data
   * @async
   * @param {string} storeName - Store to clear (optional)
   * @returns {Promise<void>}
   */
  async clearOfflineData(storeName = null) {
    if (storeName) {
      const tx = this.db.transaction(storeName, 'readwrite')
      const store = tx.objectStore(storeName)
      await store.clear()
      logger.info(`✅ Cleared store: ${storeName}`)
    } else {
      // Clear all stores
      for (const store of Object.values(STORES)) {
        const tx = this.db.transaction(store, 'readwrite')
        const objectStore = tx.objectStore(store)
        await objectStore.clear()
      }
      logger.info('✅ Cleared all offline data')
    }
  }

  /**
   * Get storage usage
   * @async
   * @returns {Promise<Object>}
   */
  async getStorageUsage() {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate()
      return {
        usage: estimate.usage,
        quota: estimate.quota,
        percentage: (estimate.usage / estimate.quota) * 100,
      }
    }
    return null
  }

  /**
   * Notify user
   * @param {string} message - Notification message
   * @param {string} type - Notification type
   */
  notifyUser(message, type = 'info') {
    // Dispatch custom event for UI notification
    window.dispatchEvent(
      new CustomEvent('offline-notification', {
        detail: { message, type },
      })
    )

    // Console log
    const emoji = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'
    logger.info(`${emoji} ${message}`)
  }

  /**
   * Handle service worker message
   * @param {MessageEvent} event - Message event
   */
  handleServiceWorkerMessage(event) {
    const { type, data } = event.data

    switch (type) {
      case 'sync-complete':
        this.notifyUser('バックグラウンド同期が完了しました', 'success')
        break
      case 'cache-updated':
        logger.info('Cache updated:', data)
        break
      case 'offline-ready':
        this.notifyUser('オフライン学習の準備ができました', 'success')
        break
      default:
        logger.info('Service Worker message:', type, data)
    }
  }

  /**
   * Check if offline mode is available
   * @returns {boolean}
   */
  isOfflineAvailable() {
    return 'serviceWorker' in navigator && 'caches' in window && 'indexedDB' in window
  }

  /**
   * Get offline readiness status
   * @async
   * @returns {Promise<Object>}
   */
  async getOfflineReadiness() {
    const status = {
      serviceWorker: false,
      caches: false,
      indexedDB: false,
      dataCached: false,
      storageAvailable: false,
    }

    // Check service worker
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration()
      status.serviceWorker = !!registration
    }

    // Check caches
    if ('caches' in window) {
      const cacheNames = await caches.keys()
      status.caches = cacheNames.length > 0
    }

    // Check IndexedDB
    status.indexedDB = !!this.db

    // Check data availability
    const questions = await this.getOfflineExamQuestions({ limit: 1 })
    status.dataCached = questions.length > 0

    // Check storage
    const usage = await this.getStorageUsage()
    status.storageAvailable = usage && usage.percentage < 90

    return status
  }
}

// Create singleton instance
const offlineManager = new OfflineManager()

// Export for use in other modules
export default offlineManager

// Export individual functions for convenience
export const {
  saveProgressOffline,
  saveExamResultOffline,
  getOfflineExamQuestions,
  cacheExamQuestions,
  getLearningStatistics,
  performBackgroundSync,
  getOfflineReadiness,
  isOfflineAvailable,
} = offlineManager
