/**
 * TypeScript型定義: Context Manager
 * 開発者: TypeScript Migration Tool
 * 言語: TypeScript
 * 型安全性: Strict Mode
 * 最終更新: 2025-08-17
 */

// Context Manager Stats
export interface ContextStats {
  totalEntries: number
  totalSizeKB: number
  cacheHitRate: number
  averageAccessCount: number
  compressionRatio: number
  memoryUsage: number
}

// Monitoring Data
export interface MonitoringData {
  status: 'healthy' | 'warning' | 'critical'
  policy: 'normal' | 'aggressive' | 'conservative'
  metrics: Record<string, unknown>
  lastCleanup: number
  nextCleanup: number
}

// Performance Metrics
export interface PerformanceMetrics {
  memory: {
    usedMB: number
    totalMB: number
    limitMB: number
  }
  cache: {
    lazyLoadCacheSize: number
  }
}

// Store Options
export interface StoreOptions {
  persist?: boolean
  ttl?: number
  compress?: boolean
  priority?: 'low' | 'normal' | 'high'
}

// Context Manager API
export interface ContextManagerAPI {
  // Storage operations
  store: (key: string, data: unknown, options?: StoreOptions) => void
  retrieve: (key: string) => unknown

  // Cleanup operations
  cleanup: () => Promise<void>
  archive: (maxAge: number) => Promise<void>
  clear: () => void

  // Performance operations
  optimizeComponent: (
    Component: React.ComponentType,
    options?: Record<string, unknown>
  ) => React.ComponentType
  lazyLoad: (componentKey: string, loader: () => Promise<unknown>) => Promise<unknown>
  observeForLazyLoading: (element: Element, loadHandler: () => void) => void
  debounce: <T extends (...args: unknown[]) => unknown>(func: T, wait: number) => T
  throttle: <T extends (...args: unknown[]) => unknown>(func: T, limit: number) => T

  // Monitoring operations
  setRotationPolicy: (policy: 'normal' | 'aggressive' | 'conservative') => void
  getDiagnostics: () => Record<string, unknown>

  // Statistics
  getStats: () => ContextStats
  getMonitoringData: () => MonitoringData
  getPerformanceMetrics: () => PerformanceMetrics
}

// Context Monitoring Hook Return Type
export interface ContextMonitoringReturn {
  setRotationPolicy: (policy: 'normal' | 'aggressive' | 'conservative') => void
  getDiagnostics: () => Record<string, unknown>
  getStats: () => ContextStats
  getMonitoringData: () => MonitoringData
  getPerformanceMetrics: () => PerformanceMetrics
  isMonitoring: boolean
  toggleMonitoring: () => void
}

// Context Storage Hook Return Type
export interface ContextStorageReturn {
  store: (key: string, data: unknown, options?: StoreOptions) => void
  retrieve: (key: string) => unknown
  cleanup: () => Promise<void>
  archive: (maxAge: number) => Promise<void>
  clear: () => void
}

// Performance Optimizer Hook Return Type
export interface PerformanceOptimizerReturn {
  optimizeComponent: (
    Component: React.ComponentType,
    options?: Record<string, unknown>
  ) => React.ComponentType
  lazyLoad: (componentKey: string, loader: () => Promise<unknown>) => Promise<unknown>
  observeForLazyLoading: (element: Element, loadHandler: () => void) => void
  debounce: <T extends (...args: unknown[]) => unknown>(func: T, wait: number) => T
  throttle: <T extends (...args: unknown[]) => unknown>(func: T, limit: number) => T
}

// Context Manager Dashboard Props
export interface ContextManagerDashboardProps {
  isOpen?: boolean
  onClose: () => void
}
