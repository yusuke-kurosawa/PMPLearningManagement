/**
 * Core Web Vitals Optimization System
 * Automatically measures and optimizes LCP, FID, and CLS
 */

import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

class CoreWebVitalsOptimizer {
  constructor() {
    this.metrics = new Map()
    this.observers = []
    this.isOptimizationEnabled = true
    this.thresholds = {
      lcp: { good: 2500, needsImprovement: 4000 },
      fid: { good: 100, needsImprovement: 300 },
      cls: { good: 0.1, needsImprovement: 0.25 },
      fcp: { good: 1800, needsImprovement: 3000 },
      ttfb: { good: 800, needsImprovement: 1800 },
    }

    this.initializeTracking()
  }

  initializeTracking() {
    if (typeof window === 'undefined') return

    console.log('🚀 Core Web Vitals optimization system initialized')

    // Track all Core Web Vitals
    this.trackLCP()
    this.trackFID()
    this.trackCLS()
    this.trackFCP()
    this.trackTTFB()

    // Initialize optimization strategies
    this.optimizeLCP()
    this.optimizeFID()
    this.optimizeCLS()

    // Send metrics to analytics
    this.setupAnalyticsReporting()
  }

  trackLCP() {
    getLCP((metric) => {
      this.metrics.set('lcp', metric)
      this.analyzeMetric('lcp', metric.value)
      this.sendToAnalytics('lcp', metric)
    }, true)
  }

  trackFID() {
    getFID((metric) => {
      this.metrics.set('fid', metric)
      this.analyzeMetric('fid', metric.value)
      this.sendToAnalytics('fid', metric)
    }, true)
  }

  trackCLS() {
    getCLS((metric) => {
      this.metrics.set('cls', metric)
      this.analyzeMetric('cls', metric.value)
      this.sendToAnalytics('cls', metric)
    }, true)
  }

  trackFCP() {
    getFCP((metric) => {
      this.metrics.set('fcp', metric)
      this.analyzeMetric('fcp', metric.value)
      this.sendToAnalytics('fcp', metric)
    }, true)
  }

  trackTTFB() {
    getTTFB((metric) => {
      this.metrics.set('ttfb', metric)
      this.analyzeMetric('ttfb', metric.value)
      this.sendToAnalytics('ttfb', metric)
    }, true)
  }

  analyzeMetric(metricName, value) {
    const thresholds = this.thresholds[metricName]
    if (!thresholds) return

    let status = 'poor'
    if (value <= thresholds.good) {
      status = 'good'
    } else if (value <= thresholds.needsImprovement) {
      status = 'needs-improvement'
    }

    console.log(
      `📊 ${metricName.toUpperCase()}: ${value}${metricName === 'cls' ? '' : 'ms'} (${status})`
    )

    // Trigger optimization if needed
    if (status !== 'good' && this.isOptimizationEnabled) {
      this.triggerOptimization(metricName, value, status)
    }
  }

  triggerOptimization(metricName, value, status) {
    const optimizations = {
      lcp: () => this.optimizeLCPDynamic(),
      fid: () => this.optimizeFIDDynamic(),
      cls: () => this.optimizeCLSDynamic(),
      fcp: () => this.optimizeFCPDynamic(),
      ttfb: () => this.optimizeTTFBDynamic(),
    }

    if (optimizations[metricName]) {
      console.log(`🔧 Triggering ${metricName.toUpperCase()} optimization...`)
      optimizations[metricName]()
    }
  }

  // LCP Optimization Strategies
  optimizeLCP() {
    // Preload critical resources
    this.preloadCriticalResources()

    // Optimize images
    this.optimizeImages()

    // Eliminate render-blocking resources
    this.eliminateRenderBlocking()
  }

  optimizeLCPDynamic() {
    // Dynamic LCP optimization based on current page
    const largestElements = this.findLargestContentfulElements()

    largestElements.forEach((element) => {
      if (element.tagName === 'IMG') {
        this.optimizeImageElement(element)
      } else if (element.tagName === 'VIDEO') {
        this.optimizeVideoElement(element)
      }
    })
  }

  findLargestContentfulElements() {
    const elements = []
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.element) {
          elements.push(entry.element)
        }
      }
    })

    try {
      observer.observe({ entryTypes: ['largest-contentful-paint'] })
    } catch (e) {
      console.warn('LCP observer not supported')
    }

    return elements
  }

  preloadCriticalResources() {
    const criticalResources = [
      '/assets/css/critical.css',
      '/assets/fonts/inter-var.woff2',
      '/assets/js/critical.js',
    ]

    criticalResources.forEach((resource) => {
      if (!document.querySelector(`link[href="${resource}"]`)) {
        const link = document.createElement('link')
        link.rel = 'preload'
        link.href = resource

        if (resource.endsWith('.css')) {
          link.as = 'style'
        } else if (resource.endsWith('.woff2')) {
          link.as = 'font'
          link.type = 'font/woff2'
          link.crossOrigin = 'anonymous'
        } else if (resource.endsWith('.js')) {
          link.as = 'script'
        }

        document.head.appendChild(link)
      }
    })
  }

  optimizeImages() {
    const images = document.querySelectorAll('img[data-src], img[loading="lazy"]')

    // Implement intersection observer for lazy loading
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target
              if (img.dataset.src) {
                img.src = img.dataset.src
                img.removeAttribute('data-src')
              }
              imageObserver.unobserve(img)
            }
          })
        },
        {
          rootMargin: '50px',
        }
      )

      images.forEach((img) => imageObserver.observe(img))
    }
  }

  optimizeImageElement(img) {
    // Add responsive image attributes if not present
    if (!img.srcset && img.src) {
      const baseSrc = img.src.replace(/\.[^/.]+$/, '')
      const ext = img.src.split('.').pop()

      img.srcset = [
        `${baseSrc}_400w.${ext} 400w`,
        `${baseSrc}_800w.${ext} 800w`,
        `${baseSrc}_1200w.${ext} 1200w`,
      ].join(', ')

      img.sizes = '(max-width: 400px) 400px, (max-width: 800px) 800px, 1200px'
    }

    // Add loading attribute
    if (!img.loading) {
      img.loading = 'lazy'
    }

    // Add decode attribute
    if (!img.decode) {
      img.decode = 'async'
    }
  }

  eliminateRenderBlocking() {
    // Move non-critical CSS to load asynchronously
    const nonCriticalCSS = document.querySelectorAll('link[rel="stylesheet"]:not([data-critical])')

    nonCriticalCSS.forEach((link) => {
      const newLink = document.createElement('link')
      newLink.rel = 'preload'
      newLink.as = 'style'
      newLink.href = link.href
      newLink.onload = function () {
        this.onload = null
        this.rel = 'stylesheet'
      }

      document.head.appendChild(newLink)
      link.remove()
    })
  }

  // FID Optimization Strategies
  optimizeFID() {
    // Break up long tasks
    this.breakUpLongTasks()

    // Use web workers for heavy computations
    this.delegateToWebWorkers()

    // Optimize event handlers
    this.optimizeEventHandlers()
  }

  optimizeFIDDynamic() {
    // Monitor long tasks and break them up
    if ('PerformanceLongTaskTiming' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            console.warn(`Long task detected: ${entry.duration}ms`)
            // Could implement task scheduling here
          }
        }
      })

      try {
        observer.observe({ entryTypes: ['longtask'] })
      } catch (e) {
        console.warn('Long task observer not supported')
      }
    }
  }

  breakUpLongTasks() {
    // Implement task scheduler for breaking up long tasks
    window.yieldToMain = function () {
      return new Promise((resolve) => {
        setTimeout(resolve, 0)
      })
    }
  }

  delegateToWebWorkers() {
    // Create web worker for heavy computations
    if (typeof Worker !== 'undefined') {
      try {
        const workerBlob = new Blob(
          [
            `
          self.onmessage = function(e) {
            const { type, data } = e.data;
            
            switch(type) {
              case 'heavy-computation':
                // Perform heavy computation
                const result = performHeavyComputation(data);
                self.postMessage({ type: 'computation-result', result });
                break;
            }
          };
          
          function performHeavyComputation(data) {
            // Placeholder for heavy computation
            return data;
          }
        `,
          ],
          { type: 'application/javascript' }
        )

        this.worker = new Worker(URL.createObjectURL(workerBlob))
        this.worker.onmessage = (e) => {
          const { type, result } = e.data
          if (type === 'computation-result') {
            // Handle result
            console.log('Web worker computation completed')
          }
        }
      } catch (e) {
        console.warn('Web worker creation failed:', e)
      }
    }
  }

  optimizeEventHandlers() {
    // Add passive event listeners where appropriate
    const passiveEvents = ['touchstart', 'touchmove', 'wheel', 'scroll']

    passiveEvents.forEach((eventType) => {
      // Override addEventListener to use passive listeners
      const originalAddEventListener = EventTarget.prototype.addEventListener
      EventTarget.prototype.addEventListener = function (type, listener, options) {
        if (passiveEvents.includes(type) && typeof options !== 'object') {
          options = { passive: true }
        }
        return originalAddEventListener.call(this, type, listener, options)
      }
    })
  }

  // CLS Optimization Strategies
  optimizeCLS() {
    // Set explicit dimensions for dynamic content
    this.setExplicitDimensions()

    // Preload fonts
    this.preloadFonts()

    // Reserve space for ads/embeds
    this.reserveSpaceForDynamicContent()
  }

  optimizeCLSDynamic() {
    // Monitor layout shifts and fix them
    if ('LayoutShift' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.hadRecentInput) continue

          console.warn(`Layout shift detected: ${entry.value}`)
          this.fixLayoutShift(entry)
        }
      })

      try {
        observer.observe({ entryTypes: ['layout-shift'] })
      } catch (e) {
        console.warn('Layout shift observer not supported')
      }
    }
  }

  setExplicitDimensions() {
    // Set dimensions for images without them
    const images = document.querySelectorAll('img:not([width]):not([height])')
    images.forEach((img) => {
      img.style.aspectRatio = '16 / 9' // Default aspect ratio
    })

    // Set min-height for dynamic content containers
    const dynamicContainers = document.querySelectorAll('[data-dynamic-content]')
    dynamicContainers.forEach((container) => {
      if (!container.style.minHeight) {
        container.style.minHeight = '200px' // Default minimum height
      }
    })
  }

  preloadFonts() {
    const criticalFonts = ['/assets/fonts/inter-var.woff2', '/assets/fonts/inter-bold.woff2']

    criticalFonts.forEach((fontUrl) => {
      if (!document.querySelector(`link[href="${fontUrl}"]`)) {
        const link = document.createElement('link')
        link.rel = 'preload'
        link.as = 'font'
        link.type = 'font/woff2'
        link.crossOrigin = 'anonymous'
        link.href = fontUrl
        document.head.appendChild(link)
      }
    })
  }

  reserveSpaceForDynamicContent() {
    // Reserve space for components that load asynchronously
    const asyncComponents = document.querySelectorAll('[data-async-component]')

    asyncComponents.forEach((component) => {
      const placeholder = document.createElement('div')
      placeholder.style.height = component.dataset.expectedHeight || '300px'
      placeholder.style.backgroundColor = '#f0f0f0'
      placeholder.style.borderRadius = '4px'
      placeholder.className = 'async-placeholder'

      component.parentNode.insertBefore(placeholder, component)

      // Remove placeholder when component loads
      const observer = new MutationObserver(() => {
        if (component.children.length > 0) {
          placeholder.remove()
          observer.disconnect()
        }
      })

      observer.observe(component, { childList: true })
    })
  }

  fixLayoutShift(entry) {
    // Attempt to fix layout shifts automatically
    entry.sources.forEach((source) => {
      if (source.node) {
        const element = source.node

        // Add transition to smooth layout changes
        if (!element.style.transition) {
          element.style.transition = 'all 0.2s ease-out'
        }
      }
    })
  }

  // Analytics and Reporting
  setupAnalyticsReporting() {
    // Send metrics to Google Analytics or custom analytics
    this.sendToGoogleAnalytics()

    // Send to custom dashboard
    this.sendToCustomDashboard()
  }

  sendToAnalytics(metricName, metric) {
    // Google Analytics 4
    if (typeof gtag !== 'undefined') {
      gtag('event', metricName, {
        event_category: 'Core Web Vitals',
        event_label: metricName.toUpperCase(),
        value: Math.round(metric.value),
        custom_map: { metric_id: metric.id },
      })
    }

    // Custom analytics
    this.sendToCustomAnalytics(metricName, metric)
  }

  sendToGoogleAnalytics() {
    // Enhanced ecommerce tracking for performance
    if (typeof gtag !== 'undefined') {
      gtag('config', 'GA_MEASUREMENT_ID', {
        custom_map: {
          lcp: 'largest_contentful_paint',
          fid: 'first_input_delay',
          cls: 'cumulative_layout_shift',
        },
      })
    }
  }

  sendToCustomAnalytics(metricName, metric) {
    // Send to custom performance monitoring service
    const payload = {
      metric: metricName,
      value: metric.value,
      id: metric.id,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      connectionType: navigator.connection?.effectiveType || 'unknown',
    }

    // Use sendBeacon for reliable delivery
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/analytics/core-web-vitals', JSON.stringify(payload))
    } else {
      // Fallback to fetch
      fetch('/api/analytics/core-web-vitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(console.error)
    }
  }

  sendToCustomDashboard() {
    // Aggregate metrics and send to dashboard
    setTimeout(() => {
      const allMetrics = {}
      this.metrics.forEach((metric, name) => {
        allMetrics[name] = {
          value: metric.value,
          rating: this.getMetricRating(name, metric.value),
          timestamp: metric.entries?.[0]?.startTime || Date.now(),
        }
      })

      this.sendToDashboard(allMetrics)
    }, 5000) // Wait 5 seconds to collect all metrics
  }

  getMetricRating(metricName, value) {
    const thresholds = this.thresholds[metricName]
    if (!thresholds) return 'unknown'

    if (value <= thresholds.good) return 'good'
    if (value <= thresholds.needsImprovement) return 'needs-improvement'
    return 'poor'
  }

  sendToDashboard(metrics) {
    const payload = {
      url: window.location.href,
      timestamp: Date.now(),
      metrics,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      connection: navigator.connection
        ? {
            effectiveType: navigator.connection.effectiveType,
            downlink: navigator.connection.downlink,
            rtt: navigator.connection.rtt,
          }
        : null,
    }

    fetch('/api/dashboard/core-web-vitals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(console.error)
  }

  // Optimization Features
  optimizeFCPDynamic() {
    // Remove unused CSS
    this.removeUnusedCSS()

    // Optimize critical rendering path
    this.optimizeCriticalRenderingPath()
  }

  optimizeTTFBDynamic() {
    // Implement service worker caching
    this.optimizeServerResponse()

    // Use CDN for static assets
    this.optimizeCDN()
  }

  removeUnusedCSS() {
    // This would require a more sophisticated implementation
    // For now, we'll add a performance hint
    console.info('💡 Consider using PurgeCSS to remove unused CSS')
  }

  optimizeCriticalRenderingPath() {
    // Inline critical CSS
    const criticalCSS = this.extractCriticalCSS()
    if (criticalCSS) {
      const style = document.createElement('style')
      style.textContent = criticalCSS
      document.head.insertBefore(style, document.head.firstChild)
    }
  }

  extractCriticalCSS() {
    // This is a simplified version - real implementation would be more complex
    return `
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
      .critical { display: block; }
      .loader { animation: spin 1s linear infinite; }
      @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    `
  }

  optimizeServerResponse() {
    console.info('💡 Consider implementing server-side caching and CDN')
  }

  optimizeCDN() {
    console.info('💡 Consider using a CDN for static assets')
  }

  // Cleanup
  cleanup() {
    this.observers.forEach((observer) => observer.disconnect())
    this.observers = []

    if (this.worker) {
      this.worker.terminate()
      this.worker = null
    }
  }
}

// Initialize when DOM is loaded
const webVitalsOptimizer = new CoreWebVitalsOptimizer()

// Export for use in other modules
export default webVitalsOptimizer
