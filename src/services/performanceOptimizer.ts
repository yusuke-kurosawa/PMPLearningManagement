/**
 * Performance Optimization Service
 * Implements lazy loading, memory efficiency, and data structure optimization
 */

import React from 'react'
import { logger } from './logger'

class PerformanceOptimizer {
  constructor() {
    this.lazyLoadCache = new Map()
    this.observedElements = new WeakMap()
    this.memoryLeakDetector = new MemoryLeakDetector()
    this.dataStructureOptimizer = new DataStructureOptimizer()

    this.config = {
      intersectionThreshold: 0.1,
      rootMargin: '50px',
      debounceMs: 100,
      maxCacheSize: 25,
      memoryCheckInterval: 60000, // 1 minute
      gcSuggestionThreshold: 100 * 1024 * 1024, // 100MB
    }

    this.init()
  }

  /**
   * Initialize performance optimization
   */
  init() {
    this.setupIntersectionObserver()
    this.setupMemoryMonitoring()
    this.setupPerformanceObserver()
  }

  /**
   * Setup intersection observer for lazy loading
   */
  setupIntersectionObserver() {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      this.intersectionObserver = new IntersectionObserver(this.handleIntersection.bind(this), {
        threshold: this.config.intersectionThreshold,
        rootMargin: this.config.rootMargin,
      })
    }
  }

  /**
   * Handle intersection events for lazy loading
   */
  handleIntersection(entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const element = entry.target
        const loadHandler = this.observedElements.get(element)

        if (loadHandler && typeof loadHandler === 'function') {
          loadHandler(element)
          this.intersectionObserver.unobserve(element)
          this.observedElements.delete(element)
        }
      }
    })
  }

  /**
   * Register element for lazy loading
   */
  observeForLazyLoading(element, loadHandler) {
    if (this.intersectionObserver && element) {
      this.observedElements.set(element, loadHandler)
      this.intersectionObserver.observe(element)
    } else {
      // Fallback for browsers without IntersectionObserver
      loadHandler(element)
    }
  }

  /**
   * Lazy load component with caching
   */
  async lazyLoadComponent(componentKey, loader) {
    // Check cache first
    if (this.lazyLoadCache.has(componentKey)) {
      return this.lazyLoadCache.get(componentKey)
    }

    try {
      const startTime = performance.now()
      const component = await loader()
      const loadTime = performance.now() - startTime

      // Cache the component
      this.lazyLoadCache.set(componentKey, component)
      this.enforceMaxCacheSize()

      if (process.env.NODE_ENV === 'development') {
        logger.warn(`📦 Lazy loaded ${componentKey} in ${loadTime.toFixed(2)}ms`)
      }
      return component
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error(`❌ Failed to lazy load ${componentKey}:`, error)
      }
      throw error
    }
  }

  /**
   * Enforce maximum cache size for lazy loaded components
   */
  enforceMaxCacheSize() {
    if (this.lazyLoadCache.size > this.config.maxCacheSize) {
      const firstKey = this.lazyLoadCache.keys().next().value
      this.lazyLoadCache.delete(firstKey)
    }
  }

  /**
   * Setup memory monitoring
   */
  setupMemoryMonitoring() {
    if (typeof window !== 'undefined' && performance.memory) {
      setInterval(() => {
        this.checkMemoryUsage()
      }, this.config.memoryCheckInterval)
    }
  }

  /**
   * Check memory usage and suggest garbage collection
   */
  checkMemoryUsage() {
    if (!performance.memory) {
      return
    }

    const { usedJSHeapSize, totalJSHeapSize, jsHeapSizeLimit } = performance.memory
    const memoryPressure = usedJSHeapSize / jsHeapSizeLimit

    if (usedJSHeapSize > this.config.gcSuggestionThreshold) {
      if (process.env.NODE_ENV === 'development') {
        logger.warn('🚨 High memory usage detected, suggesting cleanup')
      }
      this.performMemoryCleanup()
    }

    // Log memory stats periodically
    if (Math.random() < 0.1) {
      // 10% chance
      if (process.env.NODE_ENV === 'development') {
        logger.warn('📊 Memory Stats:', {
          usedMB: Math.round(usedJSHeapSize / 1024 / 1024),
          totalMB: Math.round(totalJSHeapSize / 1024 / 1024),
          limitMB: Math.round(jsHeapSizeLimit / 1024 / 1024),
          pressure: Math.round(memoryPressure * 100) + '%',
        })
      }
    }
  }

  /**
   * Perform memory cleanup
   */
  performMemoryCleanup() {
    // Clear caches
    this.lazyLoadCache.clear()

    // Clear any global event listeners or timers that might be holding references
    this.memoryLeakDetector.detectAndClean()

    // Suggest garbage collection if available
    if (window.gc) {
      window.gc()
    }

    if (process.env.NODE_ENV === 'development') {
      logger.warn('🧹 Memory cleanup performed')
    }
  }

  /**
   * Setup performance observer
   */
  setupPerformanceObserver() {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          this.processPerformanceEntries(entries)
        })

        observer.observe({ entryTypes: ['measure', 'navigation', 'resource'] })
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          logger.warn('Performance Observer not supported:', error)
        }
      }
    }
  }

  /**
   * Process performance entries
   */
  processPerformanceEntries(entries) {
    entries.forEach((entry) => {
      if (entry.entryType === 'measure' && entry.duration > 100) {
        if (process.env.NODE_ENV === 'development') {
          logger.warn(`⚠️ Slow operation: ${entry.name} took ${entry.duration.toFixed(2)}ms`)
        }
      }

      if (entry.entryType === 'resource' && entry.duration > 1000) {
        if (process.env.NODE_ENV === 'development') {
          logger.warn(`🐌 Slow resource load: ${entry.name} took ${entry.duration.toFixed(2)}ms`)
        }
      }
    })
  }

  /**
   * Optimize React component rendering
   */
  optimizeComponent(Component, options = {}) {
    const {
      memoize = true,
      preload = false,
      virtualizeThreshold: _virtualizeThreshold = 100,
    } = options

    let OptimizedComponent = Component

    if (memoize) {
      OptimizedComponent = React.memo(OptimizedComponent)
    }

    if (preload) {
      // Preload component when it's likely to be needed
      this.preloadComponent(Component)
    }

    return OptimizedComponent
  }

  /**
   * Preload component
   */
  async preloadComponent(Component) {
    if (typeof Component === 'function' && Component.preload) {
      try {
        await Component.preload()
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          logger.warn('Failed to preload component:', error)
        }
      }
    }
  }

  /**
   * Create virtualized list for large datasets
   */
  createVirtualizedList(items, itemRenderer, containerHeight = 400) {
    const itemHeight: number = 50 // Estimate
    const visibleItems = Math.ceil(containerHeight / itemHeight) + 2 // Buffer

    return {
      items: items.slice(0, visibleItems),
      totalHeight: items.length * itemHeight,
      onScroll: (scrollTop) => {
        const startIndex = Math.floor(scrollTop / itemHeight)
        const endIndex = Math.min(startIndex + visibleItems, items.length)
        return {
          visibleItems: items.slice(startIndex, endIndex),
          offsetY: startIndex * itemHeight,
        }
      },
    }
  }

  /**
   * Debounce function calls
   */
  debounce(func, wait = this.config.debounceMs) {
    let timeout
    return function executedFunction(...args) {
      const later: React.FC = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }

  /**
   * Throttle function calls
   */
  throttle(func, limit) {
    let inThrottle
    return function (...args) {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const context = this
      if (!inThrottle) {
        func.apply(context, args)
        inThrottle = true
        setTimeout(() => (inThrottle = false), limit)
      }
    }
  }

  /**
   * Batch DOM operations
   */
  batchDOMOperations(operations) {
    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        const results = operations.map((op) => {
          try {
            return op()
          } catch (error) {
            if (process.env.NODE_ENV === 'development') {
              logger.error('Batched DOM operation failed:', error)
            }
            return null
          }
        })
        resolve(results)
      })
    })
  }

  /**
   * Optimize images for performance
   */
  optimizeImage(img, options = {}) {
    const { quality = 0.8, maxWidth = 1920, maxHeight = 1080, format = 'webp' } = options

    if (!img || !img.src) {
      return img
    }

    // Create optimized version
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    const { width, height } = this.calculateOptimalSize(
      img.naturalWidth,
      img.naturalHeight,
      maxWidth,
      maxHeight
    )

    canvas.width = width
    canvas.height = height

    ctx.drawImage(img, 0, 0, width, height)

    return new Promise((resolve) => {
      canvas.toBlob(resolve, `image/${format}`, quality)
    })
  }

  /**
   * Calculate optimal image size
   */
  calculateOptimalSize(naturalWidth, naturalHeight, maxWidth, maxHeight) {
    const ratio = Math.min(maxWidth / naturalWidth, maxHeight / naturalHeight)

    return {
      width: Math.round(naturalWidth * ratio),
      height: Math.round(naturalHeight * ratio),
    }
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics() {
    const memory = performance.memory || {}

    return {
      memory: {
        usedMB: Math.round((memory.usedJSHeapSize || 0) / 1024 / 1024),
        totalMB: Math.round((memory.totalJSHeapSize || 0) / 1024 / 1024),
        limitMB: Math.round((memory.jsHeapSizeLimit || 0) / 1024 / 1024),
      },
      cache: {
        lazyLoadCacheSize: this.lazyLoadCache.size,
        observedElementsCount: this.observedElements.size || 0,
      },
      config: this.config,
    }
  }

  /**
   * Clean up resources
   */
  cleanup() {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect()
    }

    this.lazyLoadCache.clear()
    this.memoryLeakDetector.cleanup()
  }
}

/**
 * Memory Leak Detector
 */
class MemoryLeakDetector {
  constructor() {
    this.eventListeners = new Set()
    this.intervals = new Set()
    this.timeouts = new Set()
  }

  /**
   * Track event listener
   */
  trackEventListener(element, event, handler) {
    const listener = { element, event, handler }
    this.eventListeners.add(listener)

    element.addEventListener(event, handler)

    return () => {
      element.removeEventListener(event, handler)
      this.eventListeners.delete(listener)
    }
  }

  /**
   * Track interval
   */
  trackInterval(callback, interval) {
    const id = setInterval(callback, interval)
    this.intervals.add(id)

    return () => {
      clearInterval(id)
      this.intervals.delete(id)
    }
  }

  /**
   * Track timeout
   */
  trackTimeout(callback, timeout) {
    const id = setTimeout(callback, timeout)
    this.timeouts.add(id)

    return () => {
      clearTimeout(id)
      this.timeouts.delete(id)
    }
  }

  /**
   * Detect and clean memory leaks
   */
  detectAndClean() {
    // Clean up event listeners
    this.eventListeners.forEach(({ element, event, handler }) => {
      if (element && element.removeEventListener) {
        element.removeEventListener(event, handler)
      }
    })
    this.eventListeners.clear()

    // Clean up intervals
    this.intervals.forEach((id) => clearInterval(id))
    this.intervals.clear()

    // Clean up timeouts
    this.timeouts.forEach((id) => clearTimeout(id))
    this.timeouts.clear()

    if (process.env.NODE_ENV === 'development') {
      logger.warn('🧹 Memory leak detection and cleanup completed')
    }
  }

  /**
   * Cleanup all tracked resources
   */
  cleanup() {
    this.detectAndClean()
  }
}

/**
 * Data Structure Optimizer
 */
class DataStructureOptimizer {
  /**
   * Optimize array operations
   */
  optimizeArray(array, operation) {
    const size = array.length

    // Use different strategies based on size
    if (size < 100) {
      return this.handleSmallArray(array, operation)
    } else if (size < 10000) {
      return this.handleMediumArray(array, operation)
    } else {
      return this.handleLargeArray(array, operation)
    }
  }

  /**
   * Handle small arrays
   */
  handleSmallArray(array, operation) {
    return operation(array)
  }

  /**
   * Handle medium arrays with chunking
   */
  handleMediumArray(array, operation) {
    const chunkSize: number = 1000
    const results = []

    for (let i = 0; i < array.length; i += chunkSize) {
      const chunk = array.slice(i, i + chunkSize)
      results.push(...operation(chunk))
    }

    return results
  }

  /**
   * Handle large arrays with web workers
   */
  async handleLargeArray(array, operation) {
    if (typeof Worker === 'undefined') {
      // Fallback to chunked processing
      return this.handleMediumArray(array, operation)
    }

    return new Promise((resolve, reject) => {
      const worker = new Worker(
        URL.createObjectURL(
          new Blob(
            [
              `
            self.onmessage = function(e) {
              const { array, operationString } = e.data;
              try {
                const operation = new Function('return ' + operationString)();
                const result = operation(array);
                self.postMessage({ success: true, result });
              } catch (error) {
                self.postMessage({ success: false, error: error.message });
              }
            }
          `,
            ],
            { type: 'application/javascript' }
          )
        )
      )

      worker.onmessage = (e) => {
        const { success, result, error } = e.data
        worker.terminate()

        if (success) {
          resolve(result)
        } else {
          reject(new Error(error))
        }
      }

      worker.postMessage({
        array,
        operationString: operation.toString(),
      })
    })
  }

  /**
   * Create efficient lookup map
   */
  createLookupMap(array, keyExtractor) {
    return array.reduce((map, item) => {
      const key = keyExtractor(item)
      map.set(key, item)
      return map
    }, new Map())
  }
}

// Create singleton instance
const performanceOptimizer = new PerformanceOptimizer()

export default performanceOptimizer
export { MemoryLeakDetector, DataStructureOptimizer }
