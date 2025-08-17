/**
 * フロントエンドサービス・状態管理実装
 * Developer 9: React専門・状態管理
 * 技術スタック: React Context, Zustand, Custom Hooks
 * セキュリティレベル: Medium
 * 最終更新: {updated}
 */

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react'
import contextManager from '../services/contextManager.js'
import contextMonitor from '../services/contextMonitor.js'
import performanceOptimizer from '../services/performanceOptimizer.js'

const ContextManagerContext = createContext(null)

export const ContextManagerProvider = ({ children }) => {
  const [contextStats, setContextStats] = useState({
    totalEntries: 0,
    totalSizeKB: 0,
    cacheHitRate: 0.85,
    averageAccessCount: 0,
    compressionRatio: 0,
  })

  const [monitoringData, setMonitoringData] = useState({
    status: 'healthy',
    policy: 'normal',
    metrics: {},
    lastCleanup: Date.now(),
  })

  const [performanceMetrics, setPerformanceMetrics] = useState({
    memory: { usedMB: 0, totalMB: 0, limitMB: 0 },
    cache: { lazyLoadCacheSize: 0 },
  })

  // Update stats periodically
  useEffect(() => {
    const updateStats = () => {
      setContextStats(contextManager.getStats())
      setMonitoringData(contextMonitor.getDashboardData())
      setPerformanceMetrics(performanceOptimizer.getPerformanceMetrics())
    }

    // Initial update
    updateStats()

    // Update every 30 seconds
    const interval = setInterval(updateStats, 30000)

    return () => clearInterval(interval)
  }, [])

  // Context management API
  const contextAPI = useMemo(
    () => ({
      // Storage operations
      store: (key, data, options) => {
        const start = performance.now()
        const result = contextManager.store(key, data, options)
        const duration = performance.now() - start

        contextMonitor.recordRetrievalTime(duration)
        return result
      },

      retrieve: (key) => {
        const start = performance.now()
        try {
          const result = contextManager.retrieve(key)
          const duration = performance.now() - start

          contextMonitor.recordRetrievalTime(duration)
          return result
        } catch (error) {
          contextMonitor.recordError()
          throw error
        }
      },

      // Cleanup operations
      cleanup: async () => {
        return await contextManager.cleanup()
      },

      archive: async (maxAge) => {
        return await contextManager.archiveOldData(maxAge)
      },

      clear: () => {
        contextManager.clear()
      },

      // Performance operations
      optimizeComponent: (Component, options) => {
        return performanceOptimizer.optimizeComponent(Component, options)
      },

      lazyLoad: async (componentKey, loader) => {
        return await performanceOptimizer.lazyLoadComponent(componentKey, loader)
      },

      observeForLazyLoading: (element, loadHandler) => {
        return performanceOptimizer.observeForLazyLoading(element, loadHandler)
      },

      debounce: (func, wait) => {
        return performanceOptimizer.debounce(func, wait)
      },

      throttle: (func, limit) => {
        return performanceOptimizer.throttle(func, limit)
      },

      // Monitoring operations
      setRotationPolicy: (policy) => {
        contextMonitor.setRotationPolicy(policy)
      },

      getDiagnostics: () => {
        return contextMonitor.performDiagnostics()
      },

      // Statistics
      getStats: () => contextStats,
      getMonitoringData: () => monitoringData,
      getPerformanceMetrics: () => performanceMetrics,
    }),
    [contextStats, monitoringData, performanceMetrics]
  )

  return (
    <ContextManagerContext.Provider value={contextAPI}>{children}</ContextManagerContext.Provider>
  )
}

// Custom hook to use context manager
export const useContextManager = () => {
  const context = useContext(ContextManagerContext)

  if (!context) {
    throw new Error('useContextManager must be used within a ContextManagerProvider')
  }

  return context
}

// Hook for performance optimization
export const usePerformanceOptimizer = () => {
  const { optimizeComponent, lazyLoad, observeForLazyLoading, debounce, throttle } =
    useContextManager()

  return {
    optimizeComponent,
    lazyLoad,
    observeForLazyLoading,
    debounce,
    throttle,
  }
}

// Hook for context storage
export const useContextStorage = () => {
  const { store, retrieve, cleanup, archive, clear } = useContextManager()

  return {
    store,
    retrieve,
    cleanup,
    archive,
    clear,
  }
}

// Hook for monitoring
export const useContextMonitoring = () => {
  const { setRotationPolicy, getDiagnostics, getStats, getMonitoringData, getPerformanceMetrics } =
    useContextManager()

  const [isMonitoring, setIsMonitoring] = useState(true)

  const toggleMonitoring = () => {
    setIsMonitoring(!isMonitoring)
  }

  return {
    setRotationPolicy,
    getDiagnostics,
    getStats,
    getMonitoringData,
    getPerformanceMetrics,
    isMonitoring,
    toggleMonitoring,
  }
}

// HOC for automatic performance optimization
export const withPerformanceOptimization = (Component, options = {}) => {
  const OptimizedComponent = React.memo(Component)

  OptimizedComponent.displayName = `Optimized(${Component.displayName || Component.name})`

  return (props) => {
    const { optimizeComponent } = usePerformanceOptimizer()

    // Apply additional optimizations if needed
    useEffect(() => {
      if (options.preload) {
        // Preload related components
      }
    }, [])

    return <OptimizedComponent {...props} />
  }
}

export default ContextManagerContext
