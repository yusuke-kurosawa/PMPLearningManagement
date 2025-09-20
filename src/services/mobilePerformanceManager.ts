/**
 * Mobile Performance Manager
 * Advanced PWA performance optimization for mobile devices
 */

interface PerformanceMetrics {
  fcp: number // First Contentful Paint
  lcp: number // Largest Contentful Paint
  fid: number // First Input Delay
  cls: number // Cumulative Layout Shift
  ttfb: number // Time to First Byte
  memoryUsage: number
  batteryLevel?: number
  networkType: string
  renderTime: number
}

interface DeviceInfo {
  isMobile: boolean
  isLowEndDevice: boolean
  hasSlowConnection: boolean
  batteryLevel?: number
  memoryLimit: number
  cpuClass?: number
}

interface PerformanceOptimizations {
  enableImageLazyLoading: boolean
  enableComponentLazyLoading: boolean
  enableVirtualScrolling: boolean
  enableAnimationReduction: boolean
  enableBatteryOptimization: boolean
  enableMemoryOptimization: boolean
  imageQuality: 'high' | 'medium' | 'low'
  renderThrottling: boolean
}

class MobilePerformanceManager {
  private metrics: PerformanceMetrics = {
    fcp: 0,
    lcp: 0,
    fid: 0,
    cls: 0,
    ttfb: 0,
    memoryUsage: 0,
    networkType: 'unknown',
    renderTime: 0,
  }

  private deviceInfo: DeviceInfo = {
    isMobile: false,
    isLowEndDevice: false,
    hasSlowConnection: false,
    memoryLimit: 0,
  }

  private optimizations: PerformanceOptimizations = {
    enableImageLazyLoading: true,
    enableComponentLazyLoading: true,
    enableVirtualScrolling: false,
    enableAnimationReduction: false,
    enableBatteryOptimization: false,
    enableMemoryOptimization: true,
    imageQuality: 'high',
    renderThrottling: false,
  }

  private observers: PerformanceObserver[] = []
  private animationFrameId: number | null = null
  private performanceCallbacks: Set<(metrics: PerformanceMetrics) => void> = new Set()
  private batteryManager: any = null

  constructor() {
    this.initializePerformanceMonitoring()
    this.detectDeviceCapabilities()
    this.setupBatteryMonitoring()
    this.optimizeBasedOnDevice()
  }

  /**
   * Initialize performance monitoring
   */
  private initializePerformanceMonitoring(): void {
    if (typeof window === 'undefined') {
      return
    }

    // Core Web Vitals monitoring
    this.setupWebVitalsObserver()

    // Memory monitoring
    this.setupMemoryMonitoring()

    // Render performance monitoring
    this.setupRenderMonitoring()

    // Network monitoring
    this.setupNetworkMonitoring()
  }

  /**
   * Setup Web Vitals observer
   */
  private setupWebVitalsObserver(): void {
    if (!('PerformanceObserver' in window)) {
      return
    }

    try {
      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1] as PerformanceEntry & { renderTime?: number }
        this.metrics.lcp = lastEntry.renderTime || lastEntry.startTime
        this.updateOptimizations()
      })
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true })
      this.observers.push(lcpObserver)

      // First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          this.metrics.fid = entry.processingStart - entry.startTime
        })
        this.updateOptimizations()
      })
      fidObserver.observe({ type: 'first-input', buffered: true })
      this.observers.push(fidObserver)

      // Cumulative Layout Shift
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          if (!entry.hadRecentInput) {
            this.metrics.cls += entry.value
          }
        })
        this.updateOptimizations()
      })
      clsObserver.observe({ type: 'layout-shift', buffered: true })
      this.observers.push(clsObserver)

      // First Contentful Paint
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            this.metrics.fcp = entry.startTime
          }
        })
        this.updateOptimizations()
      })
      fcpObserver.observe({ type: 'paint', buffered: true })
      this.observers.push(fcpObserver)
    } catch (error) {
      console.warn('[PerformanceManager] Web Vitals monitoring setup failed:', error)
    }
  }

  /**
   * Setup memory monitoring
   */
  private setupMemoryMonitoring(): void {
    if (!('memory' in performance)) {
      return
    }

    const updateMemoryMetrics = () => {
      const memory = (performance as any).memory
      this.metrics.memoryUsage = memory.usedJSHeapSize / memory.jsHeapSizeLimit

      if (this.metrics.memoryUsage > 0.8) {
        this.enableMemoryOptimizations()
      }

      this.notifyPerformanceCallbacks()
    }

    // Update memory metrics every 30 seconds
    setInterval(updateMemoryMetrics, 30000)
    updateMemoryMetrics() // Initial check
  }

  /**
   * Setup render monitoring
   */
  private setupRenderMonitoring(): void {
    let lastTime = 0
    let frames = 0

    const measureRenderPerformance = (currentTime: number) => {
      frames++

      if (currentTime >= lastTime + 1000) {
        const fps = Math.round((frames * 1000) / (currentTime - lastTime))
        this.metrics.renderTime = 1000 / fps

        if (fps < 30) {
          this.enableRenderOptimizations()
        }

        frames = 0
        lastTime = currentTime
        this.notifyPerformanceCallbacks()
      }

      this.animationFrameId = requestAnimationFrame(measureRenderPerformance)
    }

    this.animationFrameId = requestAnimationFrame(measureRenderPerformance)
  }

  /**
   * Setup network monitoring
   */
  private setupNetworkMonitoring(): void {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection

      const updateNetworkInfo = () => {
        this.metrics.networkType = connection.effectiveType || 'unknown'
        this.deviceInfo.hasSlowConnection = ['slow-2g', '2g'].includes(connection.effectiveType)

        if (this.deviceInfo.hasSlowConnection) {
          this.enableNetworkOptimizations()
        }
      }

      connection.addEventListener('change', updateNetworkInfo)
      updateNetworkInfo() // Initial check
    }
  }

  /**
   * Setup battery monitoring
   */
  private async setupBatteryMonitoring(): Promise<void> {
    if ('getBattery' in navigator) {
      try {
        this.batteryManager = await (navigator as any).getBattery()

        const updateBatteryInfo = () => {
          this.metrics.batteryLevel = Math.round(this.batteryManager.level * 100)
          this.deviceInfo.batteryLevel = this.metrics.batteryLevel

          if (this.metrics.batteryLevel < 20) {
            this.enableBatteryOptimizations()
          }
        }

        this.batteryManager.addEventListener('levelchange', updateBatteryInfo)
        this.batteryManager.addEventListener('chargingchange', updateBatteryInfo)
        updateBatteryInfo() // Initial check
      } catch (error) {
        console.warn('[PerformanceManager] Battery API not available:', error)
      }
    }
  }

  /**
   * Detect device capabilities
   */
  private detectDeviceCapabilities(): void {
    // Detect mobile device
    this.deviceInfo.isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    )

    // Detect low-end device
    const memory = (navigator as any).deviceMemory || 4
    const hardwareConcurrency = navigator.hardwareConcurrency || 4

    this.deviceInfo.isLowEndDevice = memory <= 2 || hardwareConcurrency <= 2
    this.deviceInfo.memoryLimit = memory * 1024 * 1024 * 1024 // Convert to bytes

    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      this.deviceInfo.hasSlowConnection = ['slow-2g', '2g', '3g'].includes(connection.effectiveType)
    }

    // CPU class (legacy)
    this.deviceInfo.cpuClass = (navigator as any).cpuClass
  }

  /**
   * Optimize based on device capabilities
   */
  private optimizeBasedOnDevice(): void {
    if (this.deviceInfo.isLowEndDevice) {
      this.optimizations = {
        ...this.optimizations,
        enableImageLazyLoading: true,
        enableComponentLazyLoading: true,
        enableVirtualScrolling: true,
        enableAnimationReduction: true,
        enableMemoryOptimization: true,
        imageQuality: 'low',
        renderThrottling: true,
      }
    }

    if (this.deviceInfo.hasSlowConnection) {
      this.optimizations = {
        ...this.optimizations,
        enableImageLazyLoading: true,
        imageQuality: 'low',
      }
    }
  }

  /**
   * Enable memory optimizations
   */
  private enableMemoryOptimizations(): void {
    this.optimizations.enableMemoryOptimization = true
    this.optimizations.enableComponentLazyLoading = true
    this.optimizations.enableVirtualScrolling = true

    // Request garbage collection if available
    if ('gc' in window) {
      ;(window as any).gc()
    }

    console.log('[PerformanceManager] Memory optimizations enabled')
  }

  /**
   * Enable render optimizations
   */
  private enableRenderOptimizations(): void {
    this.optimizations.enableAnimationReduction = true
    this.optimizations.renderThrottling = true

    console.log('[PerformanceManager] Render optimizations enabled')
  }

  /**
   * Enable network optimizations
   */
  private enableNetworkOptimizations(): void {
    this.optimizations.enableImageLazyLoading = true
    this.optimizations.imageQuality = 'low'

    console.log('[PerformanceManager] Network optimizations enabled')
  }

  /**
   * Enable battery optimizations
   */
  private enableBatteryOptimizations(): void {
    this.optimizations = {
      ...this.optimizations,
      enableBatteryOptimization: true,
      enableAnimationReduction: true,
      renderThrottling: true,
      imageQuality: 'low',
    }

    console.log('[PerformanceManager] Battery optimizations enabled')
  }

  /**
   * Update optimizations based on current metrics
   */
  private updateOptimizations(): void {
    // Auto-adjust based on performance metrics
    if (this.metrics.lcp > 2500) {
      // Poor LCP
      this.optimizations.enableImageLazyLoading = true
      this.optimizations.enableComponentLazyLoading = true
    }

    if (this.metrics.fid > 100) {
      // Poor FID
      this.optimizations.renderThrottling = true
    }

    if (this.metrics.cls > 0.1) {
      // Poor CLS
      this.optimizations.enableVirtualScrolling = true
    }

    this.notifyPerformanceCallbacks()
  }

  /**
   * Notify performance callbacks
   */
  private notifyPerformanceCallbacks(): void {
    this.performanceCallbacks.forEach((callback) => {
      try {
        callback(this.metrics)
      } catch (error) {
        console.error('[PerformanceManager] Callback error:', error)
      }
    })
  }

  // Public API

  /**
   * Get current performance metrics
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics }
  }

  /**
   * Get device information
   */
  getDeviceInfo(): DeviceInfo {
    return { ...this.deviceInfo }
  }

  /**
   * Get current optimizations
   */
  getOptimizations(): PerformanceOptimizations {
    return { ...this.optimizations }
  }

  /**
   * Subscribe to performance updates
   */
  subscribe(callback: (metrics: PerformanceMetrics) => void): () => void {
    this.performanceCallbacks.add(callback)

    return () => {
      this.performanceCallbacks.delete(callback)
    }
  }

  /**
   * Check if image lazy loading is enabled
   */
  shouldLazyLoadImages(): boolean {
    return this.optimizations.enableImageLazyLoading
  }

  /**
   * Check if component lazy loading is enabled
   */
  shouldLazyLoadComponents(): boolean {
    return this.optimizations.enableComponentLazyLoading
  }

  /**
   * Check if virtual scrolling is enabled
   */
  shouldUseVirtualScrolling(): boolean {
    return this.optimizations.enableVirtualScrolling
  }

  /**
   * Check if animations should be reduced
   */
  shouldReduceAnimations(): boolean {
    return this.optimizations.enableAnimationReduction
  }

  /**
   * Get recommended image quality
   */
  getImageQuality(): 'high' | 'medium' | 'low' {
    return this.optimizations.imageQuality
  }

  /**
   * Check if render throttling is enabled
   */
  shouldThrottleRender(): boolean {
    return this.optimizations.renderThrottling
  }

  /**
   * Manually trigger memory cleanup
   */
  triggerMemoryCleanup(): void {
    this.enableMemoryOptimizations()

    // Dispatch custom event for components to clean up
    window.dispatchEvent(
      new CustomEvent('memory-cleanup', {
        detail: { memoryUsage: this.metrics.memoryUsage },
      })
    )
  }

  /**
   * Preload critical resources
   */
  preloadCriticalResources(urls: string[]): void {
    if (this.deviceInfo.hasSlowConnection) {
      // Only preload essential resources on slow connections
      urls = urls.slice(0, 3)
    }

    urls.forEach((url) => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.href = url

      if (url.endsWith('.js')) {
        link.as = 'script'
      } else if (url.endsWith('.css')) {
        link.as = 'style'
      } else if (url.match(/\.(jpg|jpeg|png|webp|svg)$/)) {
        link.as = 'image'
      }

      document.head.appendChild(link)
    })
  }

  /**
   * Optimize images based on device capabilities
   */
  getOptimizedImageUrl(originalUrl: string, width?: number, height?: number): string {
    const quality = this.getImageQuality()
    const dpr = Math.min(window.devicePixelRatio || 1, this.deviceInfo.isLowEndDevice ? 1.5 : 2)

    // Adjust dimensions based on device pixel ratio
    const optimizedWidth = width ? Math.round(width * dpr) : undefined
    const optimizedHeight = height ? Math.round(height * dpr) : undefined

    // Build optimized URL (this would integrate with your image service)
    const params = new URLSearchParams()
    if (optimizedWidth) {
      params.set('w', optimizedWidth.toString())
    }
    if (optimizedHeight) {
      params.set('h', optimizedHeight.toString())
    }
    params.set('q', quality === 'high' ? '90' : quality === 'medium' ? '75' : '60')

    return `${originalUrl}?${params.toString()}`
  }

  /**
   * Schedule task with performance consideration
   */
  scheduleTask(callback: () => void, priority: 'high' | 'normal' | 'low' = 'normal'): void {
    if (this.shouldThrottleRender() && priority === 'low') {
      // Defer low priority tasks
      setTimeout(callback, 100)
    } else if ('scheduler' in window && 'postTask' in (window as any).scheduler) {
      // Use Scheduler API if available
      const priorityMap = { high: 'user-blocking', normal: 'user-visible', low: 'background' }
      ;(window as any).scheduler.postTask(callback, { priority: priorityMap[priority] })
    } else if (priority === 'high') {
      // High priority - execute immediately
      callback()
    } else {
      // Normal/low priority - use requestIdleCallback or setTimeout
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(callback, { timeout: priority === 'normal' ? 1000 : 5000 })
      } else {
        setTimeout(callback, priority === 'normal' ? 0 : 50)
      }
    }
  }

  /**
   * Get performance score
   */
  getPerformanceScore(): number {
    const lcpScore = Math.max(0, 100 - this.metrics.lcp / 25)
    const fidScore = Math.max(0, 100 - this.metrics.fid / 10)
    const clsScore = Math.max(0, 100 - this.metrics.cls * 1000)
    const fcpScore = Math.max(0, 100 - this.metrics.fcp / 18)

    return Math.round((lcpScore + fidScore + clsScore + fcpScore) / 4)
  }

  /**
   * Cleanup and destroy
   */
  destroy(): void {
    // Clean up observers
    this.observers.forEach((observer) => observer.disconnect())
    this.observers = []

    // Cancel animation frame
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }

    // Clear callbacks
    this.performanceCallbacks.clear()

    // Remove battery event listeners
    if (this.batteryManager) {
      try {
        this.batteryManager.removeEventListener('levelchange', () => {})
        this.batteryManager.removeEventListener('chargingchange', () => {})
      } catch (error) {
        console.warn('[PerformanceManager] Error removing battery listeners:', error)
      }
    }

    console.log('[PerformanceManager] Destroyed')
  }
}

// Create singleton instance
export const mobilePerformanceManager = new MobilePerformanceManager()
export default mobilePerformanceManager
