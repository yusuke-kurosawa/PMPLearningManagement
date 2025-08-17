/**
 * Context Manager React Context
 * Provides context management services throughout the React application
 */

import React, { createContext, useContext, useEffect, useState, useMemo, ReactNode } from 'react'
import contextManager from '../services/contextManager.js'
import contextMonitor from '../services/contextMonitor.js'
import performanceOptimizer from '../services/performanceOptimizer.js'
import type {
  ContextManagerAPI,
  ContextStats,
  MonitoringData,
  PerformanceMetrics,
  StoreOptions,
  ContextMonitoringReturn,
  ContextStorageReturn,
  PerformanceOptimizerReturn
} from '../types/context'

const ContextManagerContext = createContext<ContextManagerAPI | null>(null)

interface ContextManagerProviderProps {
  children: ReactNode;
}

export const ContextManagerProvider: React.FC<ContextManagerProviderProps> = ({ children }) => {
  const [contextStats, setContextStats] = useState<ContextStats>({
    totalEntries: 0,
    totalSizeKB: 0,
    cacheHitRate: 0.85,
    averageAccessCount: 0,
    compressionRatio: 0,
  })

  const [monitoringData, setMonitoringData] = useState<MonitoringData>({
    status: 'healthy',
    policy: 'normal',
    metrics: {},
    lastCleanup: Date.now(),
  })

  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
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
  const contextAPI = useMemo<ContextManagerAPI>(
    () => ({
      // Storage operations
      store: (key: string, data: any, options?: StoreOptions) => {
        const start = performance.now()
        const result = contextManager.store(key, data, options)
        const duration = performance.now() - start

        contextMonitor.recordRetrievalTime(duration)
        return result
      },

      retrieve: (key: string) => {
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

      archive: async (maxAge: number) => {
        return await contextManager.archiveOldData(maxAge)
      },

      clear: () => {
        contextManager.clear()
      },

      // Performance operations
      optimizeComponent: (Component: React.ComponentType, options?: any) => {
        return performanceOptimizer.optimizeComponent(Component, options)
      },

      lazyLoad: async (componentKey: string, loader: () => Promise<any>) => {
        return await performanceOptimizer.lazyLoadComponent(componentKey, loader)
      },

      observeForLazyLoading: (element: Element, loadHandler: () => void) => {
        return performanceOptimizer.observeForLazyLoading(element, loadHandler)
      },

      debounce: <T extends (...args: any[]) => any>(func: T, wait: number) => {
        return performanceOptimizer.debounce(func, wait)
      },

      throttle: <T extends (...args: any[]) => any>(func: T, limit: number) => {
        return performanceOptimizer.throttle(func, limit)
      },

      // Monitoring operations
      setRotationPolicy: (policy: 'normal' | 'aggressive' | 'conservative') => {
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
export const useContextManager = (): ContextManagerAPI => {
  const context = useContext(ContextManagerContext)

  if (!context) {
    throw new Error('useContextManager must be used within a ContextManagerProvider')
  }

  return context
}

// Hook for performance optimization
export const usePerformanceOptimizer = (): PerformanceOptimizerReturn => {
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
export const useContextStorage = (): ContextStorageReturn => {
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
export const useContextMonitoring = (): ContextMonitoringReturn => {
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
export const withPerformanceOptimization = <P extends object>(Component: React.ComponentType<P>, options = {}) => {
  const OptimizedComponent = React.memo(Component)

  OptimizedComponent.displayName = `Optimized(${Component.displayName || Component.name})`

  const EnhancedComponent = (props) => {
    usePerformanceOptimizer() // Call hook without destructuring

    // Apply additional optimizations if needed
    useEffect(() => {
      if (options.preload) {
        // Preload related components
      }
    }, [])

    return <OptimizedComponent {...props} />
  }

  EnhancedComponent.displayName = `withPerformanceOptimization(${Component.displayName || Component.name || 'Component'})`

  return EnhancedComponent
}

export default ContextManagerContext
