/**
 * PWA Performance Monitor
 *
 * Comprehensive performance monitoring for PWA features including:
 * - Service Worker performance metrics
 * - Cache hit rates and efficiency
 * - Offline capability assessment
 * - Core Web Vitals tracking
 * - Sync performance monitoring
 */

// Types
export interface PWAMetrics {
  serviceWorker: {
    registrationTime: number
    activationTime: number
    updateCheckTime: number
    status: 'installing' | 'installed' | 'activating' | 'activated' | 'redundant'
  }
  cache: {
    hitRate: number
    totalRequests: number
    cacheHits: number
    cacheMisses: number
    avgResponseTime: number
    storageUsed: number
    storageQuota: number
  }
  network: {
    onlineTime: number
    offlineTime: number
    connectionType: string
    effectiveType: string
    downlink: number
    rtt: number
  }
  sync: {
    lastSyncTime: number
    syncDuration: number
    pendingOperations: number
    failedOperations: number
    conflictCount: number
  }
  webVitals: {
    FCP: number | null // First Contentful Paint
    LCP: number | null // Largest Contentful Paint
    FID: number | null // First Input Delay
    CLS: number | null // Cumulative Layout Shift
    TTFB: number | null // Time to First Byte
    INP: number | null // Interaction to Next Paint
  }
  offline: {
    isCapable: boolean
    cachedPages: number
    cachedAssets: number
    dataAvailable: boolean
    lastOfflineAccess: number | null
  }
}

export interface PerformanceReport {
  timestamp: number
  metrics: PWAMetrics
  recommendations: string[]
  score: number
}

/**
 * PWA Performance Monitor Class
 */
export class PWAPerformanceMonitor {
  private metrics: Partial<PWAMetrics> = {}
  private observers: Map<string, PerformanceObserver> = new Map()
  private networkInfo: any = null
  private startTime: number = performance.now()
  private cacheStats = { hits: 0, misses: 0, responseTimes: [] as number[] }
  private onlineStartTime: number = Date.now()
  private offlineTime: number = 0

  constructor() {
    this.initialize()
  }

  /**
   * Initialize performance monitoring
   */
  private initialize() {
    // Initialize metrics structure
    this.initializeMetrics()

    // Setup Service Worker monitoring
    this.monitorServiceWorker()

    // Setup cache monitoring
    this.monitorCache()

    // Setup network monitoring
    this.monitorNetwork()

    // Setup Web Vitals monitoring
    this.monitorWebVitals()

    // Setup offline capability monitoring
    this.monitorOfflineCapability()

    // Setup sync monitoring
    this.monitorSync()

    console.log('[PWAMonitor] Performance monitoring initialized')
  }

  /**
   * Initialize metrics structure
   */
  private initializeMetrics() {
    this.metrics = {
      serviceWorker: {
        registrationTime: 0,
        activationTime: 0,
        updateCheckTime: 0,
        status: 'installing',
      },
      cache: {
        hitRate: 0,
        totalRequests: 0,
        cacheHits: 0,
        cacheMisses: 0,
        avgResponseTime: 0,
        storageUsed: 0,
        storageQuota: 0,
      },
      network: {
        onlineTime: 0,
        offlineTime: 0,
        connectionType: 'unknown',
        effectiveType: 'unknown',
        downlink: 0,
        rtt: 0,
      },
      sync: {
        lastSyncTime: 0,
        syncDuration: 0,
        pendingOperations: 0,
        failedOperations: 0,
        conflictCount: 0,
      },
      webVitals: {
        FCP: null,
        LCP: null,
        FID: null,
        CLS: null,
        TTFB: null,
        INP: null,
      },
      offline: {
        isCapable: false,
        cachedPages: 0,
        cachedAssets: 0,
        dataAvailable: false,
        lastOfflineAccess: null,
      },
    }
  }

  /**
   * Monitor Service Worker performance
   */
  private monitorServiceWorker() {
    if (!('serviceWorker' in navigator)) {
      return
    }

    const swStartTime = performance.now()

    // Monitor registration
    navigator.serviceWorker.ready.then((registration) => {
      this.metrics.serviceWorker!.registrationTime = performance.now() - swStartTime

      // Monitor update checks
      registration.addEventListener('updatefound', () => {
        this.metrics.serviceWorker!.updateCheckTime = performance.now()
      })

      // Monitor state changes
      if (registration.active) {
        this.monitorWorkerState(registration.active)
      }
      if (registration.installing) {
        this.monitorWorkerState(registration.installing)
      }
      if (registration.waiting) {
        this.monitorWorkerState(registration.waiting)
      }
    })

    // Monitor controller changes
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      this.metrics.serviceWorker!.activationTime = performance.now() - swStartTime
    })

    // Listen for messages from Service Worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      this.handleServiceWorkerMessage(event.data)
    })
  }

  /**
   * Monitor worker state changes
   */
  private monitorWorkerState(worker: ServiceWorker) {
    worker.addEventListener('statechange', () => {
      this.metrics.serviceWorker!.status = worker.state as any
      console.log('[PWAMonitor] Service Worker state:', worker.state)
    })
  }

  /**
   * Handle Service Worker messages
   */
  private handleServiceWorkerMessage(data: any) {
    if (data.type === 'PERFORMANCE_METRICS') {
      // Update cache metrics from Service Worker
      this.metrics.cache!.cacheHitRate = data.data.cacheHitRate
      this.metrics.cache!.totalRequests = data.data.totalRequests
      this.metrics.cache!.cacheHits = data.data.cacheHits
      this.metrics.cache!.cacheMisses = data.data.cacheMisses
    }
  }

  /**
   * Monitor cache performance
   */
  private monitorCache() {
    // Intercept fetch to monitor cache performance
    const originalFetch = window.fetch

    window.fetch = async (...args) => {
      const startTime = performance.now()
      const request = args[0]
      const url = typeof request === 'string' ? request : request.url

      try {
        const response = await originalFetch(...args)
        const responseTime = performance.now() - startTime

        // Track response times
        this.cacheStats.responseTimes.push(responseTime)
        if (this.cacheStats.responseTimes.length > 100) {
          this.cacheStats.responseTimes.shift()
        }

        // Check if response is from cache
        const fromCache = response.headers.get('x-from-cache') === 'true' || responseTime < 50 // Assume very fast responses are from cache

        if (fromCache) {
          this.cacheStats.hits++
        } else {
          this.cacheStats.misses++
        }

        // Update metrics
        this.updateCacheMetrics()

        return response
      } catch (error) {
        this.cacheStats.misses++
        this.updateCacheMetrics()
        throw error
      }
    }

    // Monitor storage usage
    this.monitorStorageUsage()
  }

  /**
   * Update cache metrics
   */
  private updateCacheMetrics() {
    const total = this.cacheStats.hits + this.cacheStats.misses

    this.metrics.cache!.hitRate = total > 0 ? this.cacheStats.hits / total : 0
    this.metrics.cache!.totalRequests = total
    this.metrics.cache!.cacheHits = this.cacheStats.hits
    this.metrics.cache!.cacheMisses = this.cacheStats.misses

    // Calculate average response time
    if (this.cacheStats.responseTimes.length > 0) {
      const sum = this.cacheStats.responseTimes.reduce((a, b) => a + b, 0)
      this.metrics.cache!.avgResponseTime = sum / this.cacheStats.responseTimes.length
    }
  }

  /**
   * Monitor storage usage
   */
  private async monitorStorageUsage() {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      setInterval(async () => {
        const estimate = await navigator.storage.estimate()
        this.metrics.cache!.storageUsed = estimate.usage || 0
        this.metrics.cache!.storageQuota = estimate.quota || 0
      }, 60000) // Check every minute
    }
  }

  /**
   * Monitor network status
   */
  private monitorNetwork() {
    // Get network information if available
    this.networkInfo =
      (navigator as any).connection ||
      (navigator as any).mozConnection ||
      (navigator as any).webkitConnection

    if (this.networkInfo) {
      this.updateNetworkMetrics()

      // Listen for network changes
      this.networkInfo.addEventListener('change', () => {
        this.updateNetworkMetrics()
      })
    }

    // Monitor online/offline status
    window.addEventListener('online', () => {
      this.offlineTime += Date.now() - this.onlineStartTime
      this.onlineStartTime = Date.now()
      this.updateNetworkMetrics()
    })

    window.addEventListener('offline', () => {
      this.onlineStartTime = Date.now()
      this.updateNetworkMetrics()
    })
  }

  /**
   * Update network metrics
   */
  private updateNetworkMetrics() {
    if (this.networkInfo) {
      this.metrics.network!.connectionType = this.networkInfo.type || 'unknown'
      this.metrics.network!.effectiveType = this.networkInfo.effectiveType || 'unknown'
      this.metrics.network!.downlink = this.networkInfo.downlink || 0
      this.metrics.network!.rtt = this.networkInfo.rtt || 0
    }

    const totalTime = Date.now() - this.startTime
    this.metrics.network!.onlineTime = navigator.onLine
      ? totalTime - this.offlineTime
      : this.metrics.network!.onlineTime
    this.metrics.network!.offlineTime = this.offlineTime
  }

  /**
   * Monitor Core Web Vitals
   */
  private monitorWebVitals() {
    // First Contentful Paint (FCP)
    this.observePaint('first-contentful-paint', (entry) => {
      this.metrics.webVitals!.FCP = entry.startTime
    })

    // Largest Contentful Paint (LCP)
    this.observeLCP()

    // First Input Delay (FID)
    this.observeFID()

    // Cumulative Layout Shift (CLS)
    this.observeCLS()

    // Time to First Byte (TTFB)
    this.observeTTFB()

    // Interaction to Next Paint (INP)
    this.observeINP()
  }

  /**
   * Observe paint timing
   */
  private observePaint(name: string, callback: (entry: PerformanceEntry) => void) {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === name) {
            callback(entry)
          }
        }
      })

      try {
        observer.observe({ entryTypes: ['paint'] })
        this.observers.set(name, observer)
      } catch (e) {
        console.warn('[PWAMonitor] Paint observer not supported')
      }
    }
  }

  /**
   * Observe Largest Contentful Paint
   */
  private observeLCP() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1] as any
        this.metrics.webVitals!.LCP = lastEntry.renderTime || lastEntry.loadTime
      })

      try {
        observer.observe({ entryTypes: ['largest-contentful-paint'] })
        this.observers.set('LCP', observer)
      } catch (e) {
        console.warn('[PWAMonitor] LCP observer not supported')
      }
    }
  }

  /**
   * Observe First Input Delay
   */
  private observeFID() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-input') {
            const fidEntry = entry as any
            this.metrics.webVitals!.FID = fidEntry.processingStart - fidEntry.startTime
          }
        }
      })

      try {
        observer.observe({ entryTypes: ['first-input'] })
        this.observers.set('FID', observer)
      } catch (e) {
        console.warn('[PWAMonitor] FID observer not supported')
      }
    }
  }

  /**
   * Observe Cumulative Layout Shift
   */
  private observeCLS() {
    if ('PerformanceObserver' in window) {
      let clsValue = 0
      const clsEntries: any[] = []

      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsEntries.push(entry)
            clsValue += (entry as any).value
            this.metrics.webVitals!.CLS = clsValue
          }
        }
      })

      try {
        observer.observe({ entryTypes: ['layout-shift'] })
        this.observers.set('CLS', observer)
      } catch (e) {
        console.warn('[PWAMonitor] CLS observer not supported')
      }
    }
  }

  /**
   * Observe Time to First Byte
   */
  private observeTTFB() {
    if (window.performance && window.performance.timing) {
      const timing = window.performance.timing
      const ttfb = timing.responseStart - timing.navigationStart
      this.metrics.webVitals!.TTFB = ttfb
    }
  }

  /**
   * Observe Interaction to Next Paint
   */
  private observeINP() {
    if ('PerformanceObserver' in window) {
      const interactions: number[] = []

      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'event' && (entry as any).interactionId) {
            interactions.push(entry.duration)

            // Calculate INP as 98th percentile
            if (interactions.length >= 50) {
              const sorted = [...interactions].sort((a, b) => a - b)
              const index = Math.floor(sorted.length * 0.98)
              this.metrics.webVitals!.INP = sorted[index]
            }
          }
        }
      })

      try {
        observer.observe({ entryTypes: ['event'] })
        this.observers.set('INP', observer)
      } catch (e) {
        console.warn('[PWAMonitor] INP observer not supported')
      }
    }
  }

  /**
   * Monitor offline capability
   */
  private async monitorOfflineCapability() {
    try {
      // Check Service Worker
      const registration = await navigator.serviceWorker?.getRegistration()
      this.metrics.offline!.isCapable = !!registration?.active

      // Check cached resources
      if ('caches' in window) {
        const cacheNames = await caches.keys()

        for (const cacheName of cacheNames) {
          const cache = await caches.open(cacheName)
          const requests = await cache.keys()

          for (const request of requests) {
            const url = new URL(request.url)
            if (url.pathname.endsWith('.html')) {
              this.metrics.offline!.cachedPages++
            } else {
              this.metrics.offline!.cachedAssets++
            }
          }
        }
      }

      // Check IndexedDB for offline data
      if ('indexedDB' in window) {
        const databases = await (indexedDB as any).databases?.()
        this.metrics.offline!.dataAvailable = databases?.length > 0
      }

      // Track offline access
      if (!navigator.onLine) {
        this.metrics.offline!.lastOfflineAccess = Date.now()
      }
    } catch (error) {
      console.error('[PWAMonitor] Error checking offline capability:', error)
    }
  }

  /**
   * Monitor sync performance
   */
  private monitorSync() {
    // Listen for sync events
    window.addEventListener('sync-status', (event: any) => {
      const { type, result } = event.detail

      if (type === 'complete' && result) {
        this.metrics.sync!.lastSyncTime = result.timestamp
        this.metrics.sync!.conflictCount = result.conflicts
      }
    })

    // Monitor sync duration
    let syncStartTime: number | null = null

    window.addEventListener('sync-start', () => {
      syncStartTime = performance.now()
    })

    window.addEventListener('sync-complete', () => {
      if (syncStartTime) {
        this.metrics.sync!.syncDuration = performance.now() - syncStartTime
        syncStartTime = null
      }
    })
  }

  /**
   * Get current metrics
   */
  getMetrics(): PWAMetrics {
    return {
      ...this.metrics,
      timestamp: Date.now(),
    } as PWAMetrics
  }

  /**
   * Generate performance report
   */
  generateReport(): PerformanceReport {
    const metrics = this.getMetrics()
    const recommendations = this.generateRecommendations(metrics)
    const score = this.calculateScore(metrics)

    return {
      timestamp: Date.now(),
      metrics,
      recommendations,
      score,
    }
  }

  /**
   * Generate recommendations based on metrics
   */
  private generateRecommendations(metrics: PWAMetrics): string[] {
    const recommendations: string[] = []

    // Service Worker recommendations
    if (metrics.serviceWorker.registrationTime > 1000) {
      recommendations.push(
        'Service Worker registration is slow. Consider optimizing initialization.'
      )
    }

    // Cache recommendations
    if (metrics.cache.hitRate < 0.7) {
      recommendations.push(
        'Cache hit rate is low. Review caching strategies for frequently accessed resources.'
      )
    }
    if (metrics.cache.avgResponseTime > 500) {
      recommendations.push(
        'Average response time is high. Consider implementing more aggressive caching.'
      )
    }

    // Web Vitals recommendations
    if (metrics.webVitals.LCP && metrics.webVitals.LCP > 2500) {
      recommendations.push('LCP is above 2.5s. Optimize largest content element loading.')
    }
    if (metrics.webVitals.FID && metrics.webVitals.FID > 100) {
      recommendations.push('FID is above 100ms. Reduce JavaScript execution time.')
    }
    if (metrics.webVitals.CLS && metrics.webVitals.CLS > 0.1) {
      recommendations.push(
        'CLS is above 0.1. Fix layout shifts by reserving space for dynamic content.'
      )
    }

    // Offline recommendations
    if (!metrics.offline.isCapable) {
      recommendations.push(
        'Offline capability not detected. Ensure Service Worker is properly configured.'
      )
    }
    if (metrics.offline.cachedPages < 5) {
      recommendations.push('Limited offline pages cached. Consider caching more critical pages.')
    }

    // Sync recommendations
    if (metrics.sync.failedOperations > 0) {
      recommendations.push(
        'Failed sync operations detected. Review error handling and retry logic.'
      )
    }
    if (metrics.sync.conflictCount > 5) {
      recommendations.push('High number of sync conflicts. Review conflict resolution strategies.')
    }

    // Storage recommendations
    const storageUsage = metrics.cache.storageUsed / metrics.cache.storageQuota
    if (storageUsage > 0.8) {
      recommendations.push('Storage usage above 80%. Implement cache cleanup strategies.')
    }

    return recommendations
  }

  /**
   * Calculate overall performance score
   */
  private calculateScore(metrics: PWAMetrics): number {
    let score = 100

    // Service Worker penalties
    if (metrics.serviceWorker.registrationTime > 1000) {
      score -= 5
    }
    if (metrics.serviceWorker.registrationTime > 2000) {
      score -= 10
    }

    // Cache performance
    if (metrics.cache.hitRate < 0.8) {
      score -= 5
    }
    if (metrics.cache.hitRate < 0.6) {
      score -= 10
    }
    if (metrics.cache.avgResponseTime > 500) {
      score -= 5
    }

    // Web Vitals penalties
    if (metrics.webVitals.LCP) {
      if (metrics.webVitals.LCP > 2500) {
        score -= 10
      }
      if (metrics.webVitals.LCP > 4000) {
        score -= 10
      }
    }
    if (metrics.webVitals.FID) {
      if (metrics.webVitals.FID > 100) {
        score -= 5
      }
      if (metrics.webVitals.FID > 300) {
        score -= 10
      }
    }
    if (metrics.webVitals.CLS) {
      if (metrics.webVitals.CLS > 0.1) {
        score -= 5
      }
      if (metrics.webVitals.CLS > 0.25) {
        score -= 10
      }
    }

    // Offline capability
    if (!metrics.offline.isCapable) {
      score -= 20
    }
    if (metrics.offline.cachedPages < 5) {
      score -= 5
    }

    // Sync performance
    if (metrics.sync.failedOperations > 0) {
      score -= 5
    }
    if (metrics.sync.conflictCount > 5) {
      score -= 5
    }

    return Math.max(0, score)
  }

  /**
   * Report metrics to analytics
   */
  async reportToAnalytics() {
    const report = this.generateReport()

    // Use sendBeacon for reliability
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(report)], { type: 'application/json' })
      navigator.sendBeacon('/api/analytics/pwa-metrics', blob)
    } else {
      // Fallback to fetch
      try {
        await fetch('/api/analytics/pwa-metrics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(report),
          keepalive: true,
        })
      } catch (error) {
        console.error('[PWAMonitor] Failed to report metrics:', error)
      }
    }
  }

  /**
   * Clean up observers
   */
  destroy() {
    this.observers.forEach((observer) => observer.disconnect())
    this.observers.clear()
  }
}

// Create singleton instance
export const pwaMonitor = new PWAPerformanceMonitor()

// Auto-report on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      pwaMonitor.reportToAnalytics()
    }
  })

  window.addEventListener('beforeunload', () => {
    pwaMonitor.reportToAnalytics()
  })
}

// Export convenience methods
export const getPWAMetrics = () => pwaMonitor.getMetrics()
export const getPWAReport = () => pwaMonitor.generateReport()
export const reportPWAMetrics = () => pwaMonitor.reportToAnalytics()
