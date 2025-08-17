/**
 * TypeScript型定義: Context Manager
 * 開発者: TypeScript Migration Tool
 * 言語: TypeScript
 * 型安全性: Strict Mode
 * 最終更新: 2025-08-17
 */

// Context Manager Stats
export interface ContextStats {
  totalEntries: number;
  totalSizeKB: number;
  cacheHitRate: number;
  averageAccessCount: number;
  compressionRatio: number;
}

// Monitoring Data
export interface MonitoringData {
  status: 'healthy' | 'warning' | 'critical';
  policy: 'normal' | 'aggressive' | 'conservative';
  metrics: Record<string, any>;
  lastCleanup: number;
  nextCleanup?: number;
}

// Performance Metrics
export interface PerformanceMetrics {
  memory: {
    usedMB: number;
    totalMB: number;
    limitMB: number;
  };
  cache: {
    lazyLoadCacheSize: number;
  };
}

// Store Options
export interface StoreOptions {
  persist?: boolean;
  ttl?: number;
  compress?: boolean;
  priority?: 'low' | 'normal' | 'high';
}

// Context Manager API
export interface ContextManagerAPI {
  // Storage operations
  store: (key: string, data: any, options?: StoreOptions) => void;
  retrieve: (key: string) => any;
  
  // Cleanup operations
  cleanup: () => Promise<void>;
  archive: (maxAge: number) => Promise<void>;
  clear: () => void;
  
  // Performance operations
  optimizeComponent: (Component: React.ComponentType, options?: any) => React.ComponentType;
  lazyLoad: (componentKey: string, loader: () => Promise<any>) => Promise<any>;
  observeForLazyLoading: (element: Element, loadHandler: () => void) => void;
  debounce: <T extends (...args: any[]) => any>(func: T, wait: number) => T;
  throttle: <T extends (...args: any[]) => any>(func: T, limit: number) => T;
  
  // Monitoring operations
  setRotationPolicy: (policy: 'normal' | 'aggressive' | 'conservative') => void;
  getDiagnostics: () => any;
  
  // Statistics
  getStats: () => ContextStats;
  getMonitoringData: () => MonitoringData;
  getPerformanceMetrics: () => PerformanceMetrics;
}

// Context Monitoring Hook Return Type
export interface ContextMonitoringReturn {
  setRotationPolicy: (policy: 'normal' | 'aggressive' | 'conservative') => void;
  getDiagnostics: () => any;
  getStats: () => ContextStats;
  getMonitoringData: () => MonitoringData;
  getPerformanceMetrics: () => PerformanceMetrics;
  isMonitoring: boolean;
  toggleMonitoring: () => void;
}

// Context Storage Hook Return Type
export interface ContextStorageReturn {
  store: (key: string, data: any, options?: StoreOptions) => void;
  retrieve: (key: string) => any;
  cleanup: () => Promise<void>;
  archive: (maxAge: number) => Promise<void>;
  clear: () => void;
}

// Performance Optimizer Hook Return Type
export interface PerformanceOptimizerReturn {
  optimizeComponent: (Component: React.ComponentType, options?: any) => React.ComponentType;
  lazyLoad: (componentKey: string, loader: () => Promise<any>) => Promise<any>;
  observeForLazyLoading: (element: Element, loadHandler: () => void) => void;
  debounce: <T extends (...args: any[]) => any>(func: T, wait: number) => T;
  throttle: <T extends (...args: any[]) => any>(func: T, limit: number) => T;
}