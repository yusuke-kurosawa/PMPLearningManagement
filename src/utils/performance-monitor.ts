/**
 * パフォーマンス監視ユーティリティ
 * Web Vitals計測とパフォーマンス最適化
 */

interface PerformanceMetrics {
  FCP?: number // First Contentful Paint
  LCP?: number // Largest Contentful Paint
  FID?: number // First Input Delay
  CLS?: number // Cumulative Layout Shift
  TTFB?: number // Time to First Byte
  INP?: number // Interaction to Next Paint
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {}
  private observers: Map<string, PerformanceObserver> = new Map()

  /**
   * Web Vitalsの監視開始
   */
  startMonitoring(): void {
    if (typeof window === 'undefined') {return}

    // First Contentful Paint
    this.observePaint()

    // Largest Contentful Paint
    this.observeLCP()

    // First Input Delay
    this.observeFID()

    // Cumulative Layout Shift
    this.observeCLS()

    // Time to First Byte
    this.measureTTFB()

    // Interaction to Next Paint
    this.observeINP()

    // メモリ使用量の監視
    this.monitorMemory()

    // バンドルサイズの監視
    this.monitorBundleSize()
  }

  /**
   * Paint系メトリクスの観測
   */
  private observePaint(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            this.metrics.FCP = Math.round(entry.startTime)
            this.reportMetric('FCP', this.metrics.FCP)
          }
        }
      })

      observer.observe({ entryTypes: ['paint'] })
      this.observers.set('paint', observer)
    } catch (_e) {
      console.debug('Paint observer not supported')
    }
  }

  /**
   * Largest Contentful Paintの観測
   */
  private observeLCP(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        this.metrics.LCP = Math.round(lastEntry.startTime)
        this.reportMetric('LCP', this.metrics.LCP)
      })

      observer.observe({ entryTypes: ['largest-contentful-paint'] })
      this.observers.set('lcp', observer)
    } catch (_e) {
      console.debug('LCP observer not supported')
    }
  }

  /**
   * First Input Delayの観測
   */
  private observeFID(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-input') {
            const fidEntry = entry as any
            this.metrics.FID = Math.round(fidEntry.processingStart - fidEntry.startTime)
            this.reportMetric('FID', this.metrics.FID)
          }
        }
      })

      observer.observe({ entryTypes: ['first-input'] })
      this.observers.set('fid', observer)
    } catch (_e) {
      console.debug('FID observer not supported')
    }
  }

  /**
   * Cumulative Layout Shiftの観測
   */
  private observeCLS(): void {
    try {
      let clsValue = 0
      const clsEntries: PerformanceEntry[] = []

      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const layoutShiftEntry = entry as any
          if (!layoutShiftEntry.hadRecentInput) {
            clsValue += layoutShiftEntry.value
            clsEntries.push(entry)
          }
        }
      })

      observer.observe({ entryTypes: ['layout-shift'] })
      this.observers.set('cls', observer)

      // ページアンロード時にCLSを報告
      window.addEventListener('beforeunload', () => {
        this.metrics.CLS = Math.round(clsValue * 1000) / 1000
        this.reportMetric('CLS', this.metrics.CLS)
      })
    } catch (_e) {
      console.debug('CLS observer not supported')
    }
  }

  /**
   * Time to First Byteの計測
   */
  private measureTTFB(): void {
    try {
      const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      if (navigationEntry) {
        this.metrics.TTFB = Math.round(navigationEntry.responseStart - navigationEntry.fetchStart)
        this.reportMetric('TTFB', this.metrics.TTFB)
      }
    } catch (_e) {
      console.debug('TTFB measurement not supported')
    }
  }

  /**
   * Interaction to Next Paintの観測
   */
  private observeINP(): void {
    try {
      let maxINP = 0
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const eventEntry = entry as any
          if (eventEntry.interactionId) {
            const inp = eventEntry.duration
            if (inp > maxINP) {
              maxINP = inp
              this.metrics.INP = Math.round(inp)
              this.reportMetric('INP', this.metrics.INP)
            }
          }
        }
      })

      observer.observe({ entryTypes: ['event'] })
      this.observers.set('inp', observer)
    } catch (_e) {
      console.debug('INP observer not supported')
    }
  }

  /**
   * メモリ使用量の監視
   */
  private monitorMemory(): void {
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory
        const usedMemoryMB = Math.round(memory.usedJSHeapSize / 1024 / 1024)
        const totalMemoryMB = Math.round(memory.jsHeapSizeLimit / 1024 / 1024)
        
        if (usedMemoryMB > totalMemoryMB * 0.8) {
          console.warn(`High memory usage: ${usedMemoryMB}MB / ${totalMemoryMB}MB`)
        }
      }, 30000) // 30秒ごとにチェック
    }
  }

  /**
   * バンドルサイズの監視
   */
  private monitorBundleSize(): void {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
    const jsResources = resources.filter(r => r.name.endsWith('.js'))
    
    const totalSize = jsResources.reduce((sum, r) => sum + (r.transferSize || 0), 0)
    const totalSizeMB = Math.round(totalSize / 1024 / 1024 * 100) / 100
    
    if (totalSizeMB > 1) {
      console.warn(`Large bundle size detected: ${totalSizeMB}MB`)
    }
  }

  /**
   * メトリクスのレポート
   */
  private reportMetric(name: string, value: number): void {
    // Google Analytics等への送信
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', name, {
        value: Math.round(value),
        metric_value: value,
        metric_delta: value,
      })
    }

    // コンソールログ（開発環境のみ）
    if (process.env.NODE_ENV === 'development') {
      const rating = this.getRating(name, value)
      console.log(`[Performance] ${name}: ${value}ms (${rating})`)
    }
  }

  /**
   * メトリクスの評価
   */
  private getRating(metric: string, value: number): string {
    const thresholds: Record<string, { good: number; needs_improvement: number }> = {
      FCP: { good: 1800, needs_improvement: 3000 },
      LCP: { good: 2500, needs_improvement: 4000 },
      FID: { good: 100, needs_improvement: 300 },
      CLS: { good: 0.1, needs_improvement: 0.25 },
      TTFB: { good: 800, needs_improvement: 1800 },
      INP: { good: 200, needs_improvement: 500 },
    }

    const threshold = thresholds[metric]
    if (!threshold) {return 'unknown'}

    if (value <= threshold.good) {return 'good'}
    if (value <= threshold.needs_improvement) {return 'needs improvement'}
    return 'poor'
  }

  /**
   * 現在のメトリクスを取得
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics }
  }

  /**
   * 監視を停止
   */
  stopMonitoring(): void {
    this.observers.forEach(observer => observer.disconnect())
    this.observers.clear()
  }
}

// シングルトンインスタンス
export const performanceMonitor = new PerformanceMonitor()

// 自動開始
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      performanceMonitor.startMonitoring()
    })
  } else {
    performanceMonitor.startMonitoring()
  }
}

export default performanceMonitor