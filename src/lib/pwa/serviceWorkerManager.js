/**
 * Service Worker Manager
 * Manages service worker registration, updates, and communication
 */

class ServiceWorkerManager {
  constructor() {
    this.registration = null
    this.isUpdateAvailable = false
    this.updateCallbacks = []
    this.analytics = {
      registrationTime: null,
      updateCount: 0,
      offlineCount: 0,
      cacheHitCount: 0,
    }

    this.initialize()
  }

  async initialize() {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker not supported')
      return
    }

    try {
      await this.registerServiceWorker()
      this.setupEventListeners()
      this.startPerformanceMonitoring()

      console.log('✅ Service Worker Manager initialized')
    } catch (error) {
      console.error('❌ Service Worker initialization failed:', error)
    }
  }

  async registerServiceWorker() {
    try {
      const swUrl = '/PMPLearningManagement/sw-optimized.js'

      this.registration = await navigator.serviceWorker.register(swUrl, {
        scope: '/PMPLearningManagement/',
        updateViaCache: 'none', // Always check for updates
      })

      this.analytics.registrationTime = Date.now()

      console.log('🔄 Service Worker registered:', this.registration)

      // Check for updates immediately and then periodically
      await this.checkForUpdate()
      this.startUpdateChecker()
    } catch (error) {
      console.error('Service Worker registration failed:', error)
      throw error
    }
  }

  setupEventListeners() {
    // Listen for service worker state changes
    if (this.registration) {
      this.registration.addEventListener('updatefound', () => {
        console.log('🔄 Service Worker update found')
        this.handleUpdateFound()
      })
    }

    // Listen for messages from service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      this.handleServiceWorkerMessage(event)
    })

    // Listen for controller change (new SW activated)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('🔄 Service Worker controller changed')
      this.handleControllerChange()
    })

    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.handleOnlineStatusChange(true)
    })

    window.addEventListener('offline', () => {
      this.handleOnlineStatusChange(false)
    })
  }

  handleUpdateFound() {
    const newWorker = this.registration.installing
    if (!newWorker) return

    newWorker.addEventListener('statechange', () => {
      if (newWorker.state === 'installed') {
        if (navigator.serviceWorker.controller) {
          // Update available
          this.isUpdateAvailable = true
          this.notifyUpdateAvailable()
        } else {
          // First install
          console.log('✅ Service Worker installed for the first time')
        }
      }
    })
  }

  handleServiceWorkerMessage(event) {
    const { type, payload, version } = event.data

    switch (type) {
      case 'SW_UPDATED':
        console.log(`🔄 Service Worker updated to version ${version}`)
        this.analytics.updateCount++
        break

      case 'ANALYTICS_RESPONSE':
        console.log('📊 Service Worker Analytics:', payload)
        this.mergeAnalytics(payload)
        break

      case 'SYNC_PROGRESS_REQUEST':
        this.handleSyncProgressRequest()
        break

      case 'SYNC_EXAM_RESULTS_REQUEST':
        this.handleSyncExamResultsRequest()
        break

      case 'CACHE_STATUS':
        this.handleCacheStatus(payload)
        break

      default:
        console.log('Unknown message from SW:', event.data)
    }
  }

  handleControllerChange() {
    // Reload page when new service worker takes control
    window.location.reload()
  }

  handleOnlineStatusChange(isOnline) {
    console.log(`📡 Network status: ${isOnline ? 'Online' : 'Offline'}`)

    if (!isOnline) {
      this.analytics.offlineCount++
    }

    // Dispatch custom event for app to handle
    window.dispatchEvent(
      new CustomEvent('networkstatuschange', {
        detail: { isOnline },
      })
    )

    if (isOnline) {
      // Trigger background sync when coming back online
      this.requestBackgroundSync(['progress-sync', 'exam-results-sync', 'analytics-sync'])
    }
  }

  async checkForUpdate() {
    if (!this.registration) return

    try {
      await this.registration.update()
      console.log('🔍 Checked for Service Worker updates')
    } catch (error) {
      console.error('Failed to check for updates:', error)
    }
  }

  startUpdateChecker() {
    // Check for updates every hour
    setInterval(
      () => {
        this.checkForUpdate()
      },
      60 * 60 * 1000
    )
  }

  startPerformanceMonitoring() {
    // Request analytics from service worker every 10 minutes
    setInterval(
      () => {
        this.requestAnalytics()
      },
      10 * 60 * 1000
    )
  }

  notifyUpdateAvailable() {
    console.log('🔔 Service Worker update available')

    // Notify all registered callbacks
    this.updateCallbacks.forEach((callback) => {
      try {
        callback()
      } catch (error) {
        console.error('Update callback error:', error)
      }
    })

    // Show update notification
    this.showUpdateNotification()
  }

  showUpdateNotification() {
    // Create update notification UI
    const notification = document.createElement('div')
    notification.className = 'sw-update-notification'
    notification.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: #2196f3;
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 9999;
        font-family: system-ui, sans-serif;
        max-width: 320px;
      ">
        <div style="font-weight: bold; margin-bottom: 8px;">
          🔄 Update Available
        </div>
        <div style="font-size: 14px; margin-bottom: 12px;">
          A new version of the app is available with performance improvements.
        </div>
        <div style="display: flex; gap: 8px;">
          <button onclick="this.closest('.sw-update-notification').remove()" style="
            background: rgba(255,255,255,0.2);
            border: none;
            color: white;
            padding: 8px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
          ">
            Later
          </button>
          <button onclick="window.serviceWorkerManager.applyUpdate()" style="
            background: white;
            border: none;
            color: #2196f3;
            padding: 8px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
            font-size: 12px;
          ">
            Update Now
          </button>
        </div>
      </div>
    `

    document.body.appendChild(notification)

    // Auto-remove after 30 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove()
      }
    }, 30000)
  }

  async applyUpdate() {
    if (!this.registration || !this.registration.waiting) {
      console.warn('No service worker update available')
      return
    }

    try {
      // Tell the waiting SW to skip waiting and become active
      this.postMessage({ type: 'SKIP_WAITING' })

      // Remove update notification
      const notification = document.querySelector('.sw-update-notification')
      if (notification) {
        notification.remove()
      }

      console.log('🔄 Applying Service Worker update...')
    } catch (error) {
      console.error('Failed to apply update:', error)
    }
  }

  onUpdateAvailable(callback) {
    this.updateCallbacks.push(callback)
  }

  removeUpdateCallback(callback) {
    const index = this.updateCallbacks.indexOf(callback)
    if (index > -1) {
      this.updateCallbacks.splice(index, 1)
    }
  }

  postMessage(message) {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage(message)
    }
  }

  // Communication methods
  requestAnalytics() {
    this.postMessage({ type: 'GET_ANALYTICS' })
  }

  cacheUrls(urls) {
    this.postMessage({
      type: 'CACHE_URLS',
      payload: urls,
    })
  }

  clearCache(cacheName = null) {
    this.postMessage({
      type: 'CLEAR_CACHE',
      payload: cacheName,
    })
  }

  prefetchRoute(route) {
    this.postMessage({
      type: 'PREFETCH_ROUTE',
      payload: route,
    })
  }

  requestBackgroundSync(tags) {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      tags.forEach((tag) => {
        this.registration.sync.register(tag).catch((error) => {
          console.error(`Background sync registration failed for ${tag}:`, error)
        })
      })
    }
  }

  // Sync handlers
  handleSyncProgressRequest() {
    // Get progress data from localStorage or state management
    const progressData = this.getProgressData()

    // Send to service worker for syncing
    this.postMessage({
      type: 'SYNC_PROGRESS_DATA',
      payload: progressData,
    })
  }

  handleSyncExamResultsRequest() {
    // Get exam results from localStorage or state management
    const examResults = this.getExamResults()

    // Send to service worker for syncing
    this.postMessage({
      type: 'SYNC_EXAM_RESULTS_DATA',
      payload: examResults,
    })
  }

  getProgressData() {
    try {
      return JSON.parse(localStorage.getItem('pmp-progress') || '{}')
    } catch (error) {
      console.error('Failed to get progress data:', error)
      return {}
    }
  }

  getExamResults() {
    try {
      return JSON.parse(localStorage.getItem('pmp-exam-results') || '[]')
    } catch (error) {
      console.error('Failed to get exam results:', error)
      return []
    }
  }

  handleCacheStatus(status) {
    console.log('📊 Cache Status:', status)
    this.analytics.cacheHitCount += status.hits || 0
  }

  mergeAnalytics(swAnalytics) {
    this.analytics = {
      ...this.analytics,
      ...swAnalytics,
      lastUpdate: Date.now(),
    }
  }

  // Performance optimization methods
  preloadCriticalRoutes() {
    const criticalRoutes = ['/flashcards', '/matrix', '/progress', '/glossary']

    criticalRoutes.forEach((route) => {
      this.prefetchRoute(route)
    })
  }

  async optimizeForRoute(route) {
    // Route-specific optimizations
    const routeOptimizations = {
      '/flashcards': () => {
        // Preload flashcard data
        this.cacheUrls(['/api/flashcards', '/data/pmbok-processes.json'])
      },
      '/visualizations': () => {
        // Preload visualization assets
        this.cacheUrls(['/assets/d3.js', '/data/network-data.json'])
      },
      '/mock-exam': () => {
        // Preload exam questions
        this.cacheUrls(['/api/exam-questions', '/data/exam-pool.json'])
      },
    }

    const optimization = routeOptimizations[route]
    if (optimization) {
      optimization()
    }
  }

  // Public API
  getAnalytics() {
    return {
      ...this.analytics,
      isUpdateAvailable: this.isUpdateAvailable,
      registrationStatus: this.registration ? 'registered' : 'not-registered',
      networkStatus: navigator.onLine ? 'online' : 'offline',
    }
  }

  isSupported() {
    return 'serviceWorker' in navigator
  }

  isControlling() {
    return !!navigator.serviceWorker.controller
  }

  getVersion() {
    return '3.0.0' // Should match SW version
  }

  // Cleanup
  async unregister() {
    if (this.registration) {
      try {
        await this.registration.unregister()
        console.log('🗑️ Service Worker unregistered')
        return true
      } catch (error) {
        console.error('Failed to unregister Service Worker:', error)
        return false
      }
    }
    return false
  }
}

// Create global instance
const serviceWorkerManager = new ServiceWorkerManager()

// Export for global access
window.serviceWorkerManager = serviceWorkerManager

export default serviceWorkerManager
