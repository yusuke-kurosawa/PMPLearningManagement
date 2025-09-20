/**
 * Advanced Cache Strategy API Implementation
 * Comprehensive caching system for PMPLearningManagement PWA
 */

// ============================================================================
// Cache Strategy Interfaces
// ============================================================================

export interface ICacheStrategy {
  name: string
  get(key: string): Promise<any | null>
  set(key: string, value: any, options?: CacheOptions): Promise<void>
  delete(key: string): Promise<void>
  clear(): Promise<void>
  size(): Promise<number>
  keys(): Promise<string[]>
}

export interface CacheOptions {
  ttl?: number // Time to live in milliseconds
  priority?: 'low' | 'normal' | 'high'
  tags?: string[] // For cache invalidation
  compress?: boolean
  maxSize?: number
}

export interface CacheEntry<T = any> {
  value: T
  timestamp: number
  ttl?: number
  priority: 'low' | 'normal' | 'high'
  tags: string[]
  size: number
  accessCount: number
  lastAccessed: number
}

export interface CacheMetrics {
  hits: number
  misses: number
  hitRate: number
  totalSize: number
  entryCount: number
  averageSize: number
  memoryPressure: number
  lastCleanup: number
}

// ============================================================================
// Multi-Layer Cache Manager
// ============================================================================

export class MultiLayerCacheManager {
  private memoryCache: Map<string, CacheEntry> = new Map()
  private indexedDBCache: IDBPMPCache
  private serviceWorkerCache: ServiceWorkerCacheStrategy
  private compressionEnabled: boolean = true
  private maxMemorySize: number = 50 * 1024 * 1024 // 50MB
  private metrics: CacheMetrics
  private cleanupInterval: number

  constructor(
    options: {
      maxMemorySize?: number
      enableCompression?: boolean
      cleanupInterval?: number
    } = {}
  ) {
    this.maxMemorySize = options.maxMemorySize || this.maxMemorySize
    this.compressionEnabled = options.enableCompression ?? true

    this.indexedDBCache = new IDBPMPCache()
    this.serviceWorkerCache = new ServiceWorkerCacheStrategy()

    this.metrics = {
      hits: 0,
      misses: 0,
      hitRate: 0,
      totalSize: 0,
      entryCount: 0,
      averageSize: 0,
      memoryPressure: 0,
      lastCleanup: Date.now(),
    }

    // Setup cleanup interval
    this.cleanupInterval = setInterval(() => {
      this.performMaintenance()
    }, options.cleanupInterval || 300000) // 5 minutes
  }

  /**
   * Get value with multi-layer fallback
   */
  async get<T>(key: string): Promise<T | null> {
    const startTime = performance.now()

    try {
      // Layer 1: Memory cache (fastest)
      const memoryEntry = this.memoryCache.get(key)
      if (memoryEntry && this.isValid(memoryEntry)) {
        memoryEntry.accessCount++
        memoryEntry.lastAccessed = Date.now()
        this.metrics.hits++
        this.updateMetrics()
        return memoryEntry.value
      }

      // Layer 2: IndexedDB cache (medium speed)
      const idbValue = await this.indexedDBCache.get(key)
      if (idbValue !== null) {
        // Promote to memory cache
        await this.setMemoryCache(key, idbValue, { priority: 'normal' })
        this.metrics.hits++
        this.updateMetrics()
        return idbValue
      }

      // Layer 3: Service Worker cache (network fallback)
      const swValue = await this.serviceWorkerCache.get(key)
      if (swValue !== null) {
        // Promote to higher layers
        await this.setMemoryCache(key, swValue, { priority: 'normal' })
        await this.indexedDBCache.set(key, swValue)
        this.metrics.hits++
        this.updateMetrics()
        return swValue
      }

      // Cache miss
      this.metrics.misses++
      this.updateMetrics()
      return null
    } finally {
      const duration = performance.now() - startTime
      this.recordPerformanceMetric('get', duration)
    }
  }

  /**
   * Set value across appropriate cache layers
   */
  async set<T>(key: string, value: T, options: CacheOptions = {}): Promise<void> {
    const entry: CacheEntry<T> = {
      value,
      timestamp: Date.now(),
      ttl: options.ttl,
      priority: options.priority || 'normal',
      tags: options.tags || [],
      size: this.calculateSize(value),
      accessCount: 1,
      lastAccessed: Date.now(),
    }

    // Compress if enabled and beneficial
    if (this.compressionEnabled && entry.size > 1024) {
      entry.value = await this.compress(value)
    }

    // Set in appropriate layers based on priority and size
    if (options.priority === 'high' || entry.size < 1024 * 1024) {
      await this.setMemoryCache(key, entry.value, options)
    }

    if (entry.size < 10 * 1024 * 1024) {
      await this.indexedDBCache.set(key, entry.value, options)
    }

    // Always set in service worker cache for offline access
    await this.serviceWorkerCache.set(key, entry.value, options)

    this.updateMetrics()
  }

  /**
   * Smart cache eviction based on LRU + priority
   */
  private async performMaintenance(): Promise<void> {
    const memorySize = this.calculateMemorySize()

    if (memorySize > this.maxMemorySize) {
      await this.evictMemoryCache()
    }

    // Cleanup expired entries
    await this.cleanupExpired()

    // Update metrics
    this.metrics.lastCleanup = Date.now()
    this.metrics.memoryPressure = (memorySize / this.maxMemorySize) * 100
    this.updateMetrics()
  }

  private async evictMemoryCache(): Promise<void> {
    const entries = Array.from(this.memoryCache.entries())

    // Sort by priority (low first) and last accessed
    entries.sort(([, a], [, b]) => {
      const priorityWeight = { low: 1, normal: 2, high: 3 }
      const priorityDiff = priorityWeight[a.priority] - priorityWeight[b.priority]

      if (priorityDiff !== 0) {
        return priorityDiff
      }

      return a.lastAccessed - b.lastAccessed
    })

    // Remove lowest priority, least recently used items
    const toEvict = Math.ceil(entries.length * 0.2) // Remove 20%

    for (let i = 0; i < toEvict; i++) {
      const [key] = entries[i]
      this.memoryCache.delete(key)
    }

    console.log(`🧹 Evicted ${toEvict} items from memory cache`)
  }

  private async cleanupExpired(): Promise<void> {
    const now = Date.now()
    const expiredKeys: string[] = []

    // Check memory cache
    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.ttl && now - entry.timestamp > entry.ttl) {
        expiredKeys.push(key)
      }
    }

    // Remove expired entries
    for (const key of expiredKeys) {
      this.memoryCache.delete(key)
      await this.indexedDBCache.delete(key)
    }

    if (expiredKeys.length > 0) {
      console.log(`🗑️ Cleaned up ${expiredKeys.length} expired cache entries`)
    }
  }

  private async setMemoryCache(key: string, value: any, options: CacheOptions): Promise<void> {
    const entry: CacheEntry = {
      value,
      timestamp: Date.now(),
      ttl: options.ttl,
      priority: options.priority || 'normal',
      tags: options.tags || [],
      size: this.calculateSize(value),
      accessCount: 1,
      lastAccessed: Date.now(),
    }

    this.memoryCache.set(key, entry)

    // Check if we need to evict immediately
    const currentSize = this.calculateMemorySize()
    if (currentSize > this.maxMemorySize) {
      await this.evictMemoryCache()
    }
  }

  private isValid(entry: CacheEntry): boolean {
    if (!entry.ttl) {
      return true
    }
    return Date.now() - entry.timestamp < entry.ttl
  }

  private calculateSize(value: any): number {
    return new Blob([JSON.stringify(value)]).size
  }

  private calculateMemorySize(): number {
    return Array.from(this.memoryCache.values()).reduce((total, entry) => total + entry.size, 0)
  }

  private async compress(value: any): Promise<any> {
    // Simple compression using JSON + gzip simulation
    const serialized = JSON.stringify(value)

    if (typeof CompressionStream !== 'undefined') {
      const stream = new CompressionStream('gzip')
      const writer = stream.writable.getWriter()
      const reader = stream.readable.getReader()

      writer.write(new TextEncoder().encode(serialized))
      writer.close()

      const chunks = []
      let done = false

      while (!done) {
        const { value: chunk, done: streamDone } = await reader.read()
        if (chunk) {
          chunks.push(chunk)
        }
        done = streamDone
      }

      return chunks
    }

    return value // Fallback if compression not available
  }

  private updateMetrics(): void {
    const total = this.metrics.hits + this.metrics.misses
    this.metrics.hitRate = total > 0 ? this.metrics.hits / total : 0
    this.metrics.entryCount = this.memoryCache.size
    this.metrics.totalSize = this.calculateMemorySize()
    this.metrics.averageSize =
      this.metrics.entryCount > 0 ? this.metrics.totalSize / this.metrics.entryCount : 0
  }

  private recordPerformanceMetric(operation: string, duration: number): void {
    // Send to analytics if needed
    if (duration > 100) {
      // Log slow operations
      console.warn(`Slow cache ${operation}: ${duration}ms`)
    }
  }

  /**
   * Get cache statistics
   */
  getMetrics(): CacheMetrics {
    return { ...this.metrics }
  }

  /**
   * Clear all cache layers
   */
  async clearAll(): Promise<void> {
    this.memoryCache.clear()
    await this.indexedDBCache.clear()
    await this.serviceWorkerCache.clear()

    this.metrics = {
      hits: 0,
      misses: 0,
      hitRate: 0,
      totalSize: 0,
      entryCount: 0,
      averageSize: 0,
      memoryPressure: 0,
      lastCleanup: Date.now(),
    }
  }

  /**
   * Invalidate cache by tags
   */
  async invalidateByTags(tags: string[]): Promise<void> {
    const keysToInvalidate: string[] = []

    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.tags.some((tag) => tags.includes(tag))) {
        keysToInvalidate.push(key)
      }
    }

    for (const key of keysToInvalidate) {
      this.memoryCache.delete(key)
      await this.indexedDBCache.delete(key)
    }

    console.log(`🏷️ Invalidated ${keysToInvalidate.length} cache entries by tags:`, tags)
  }

  /**
   * Preload content for offline access
   */
  async preloadOfflineContent(
    content: { key: string; url: string; priority: 'high' | 'medium' | 'low' }[]
  ): Promise<void> {
    const preloadPromises = content.map(async (item) => {
      try {
        const response = await fetch(item.url)
        if (response.ok) {
          const data = await response.json()
          await this.set(item.key, data, {
            priority: item.priority === 'high' ? 'high' : 'normal',
            ttl: item.priority === 'high' ? 24 * 60 * 60 * 1000 : 60 * 60 * 1000, // 24h vs 1h
            tags: ['offline-content', `priority-${item.priority}`],
          })
        }
      } catch (error) {
        console.error(`Failed to preload ${item.key}:`, error)
      }
    })

    await Promise.allSettled(preloadPromises)
    console.log(`📥 Preloaded ${content.length} offline content items`)
  }

  /**
   * Smart cache warming based on user behavior
   */
  async warmCache(userProfile: {
    knowledgeAreas: string[]
    learningStyle: string
    currentProgress: number
  }): Promise<void> {
    const warmingStrategy = this.generateWarmingStrategy(userProfile)

    for (const item of warmingStrategy) {
      await this.preloadIfNeeded(item.key, item.url, item.priority)
    }
  }

  private generateWarmingStrategy(userProfile: any): any[] {
    const strategy = []

    // High priority: Current knowledge area content
    userProfile.knowledgeAreas.forEach((area: string) => {
      strategy.push({
        key: `ka-${area.toLowerCase()}`,
        url: `/api/knowledge-areas/${area}/content`,
        priority: 'high',
      })
    })

    // Medium priority: Next knowledge areas
    const nextAreas = this.predictNextKnowledgeAreas(userProfile)
    nextAreas.forEach((area) => {
      strategy.push({
        key: `ka-next-${area.toLowerCase()}`,
        url: `/api/knowledge-areas/${area}/overview`,
        priority: 'medium',
      })
    })

    // Low priority: General resources
    strategy.push({
      key: 'pmbok-glossary',
      url: '/api/glossary',
      priority: 'low',
    })

    return strategy
  }

  private predictNextKnowledgeAreas(userProfile: any): string[] {
    // Simple prediction based on typical learning paths
    const allAreas = [
      'Integration',
      'Scope',
      'Schedule',
      'Cost',
      'Quality',
      'Resource',
      'Communications',
      'Risk',
      'Procurement',
      'Stakeholder',
    ]
    return allAreas.filter((area) => !userProfile.knowledgeAreas.includes(area)).slice(0, 2)
  }

  private async preloadIfNeeded(key: string, url: string, priority: string): Promise<void> {
    const existing = await this.get(key)
    if (existing === null) {
      try {
        const response = await fetch(url)
        if (response.ok) {
          const data = await response.json()
          await this.set(key, data, {
            priority: priority as any,
            tags: ['preloaded', `priority-${priority}`],
          })
        }
      } catch (error) {
        console.log(`Preload failed for ${key}:`, error.message)
      }
    }
  }

  /**
   * Cleanup and dispose
   */
  dispose(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
  }
}

// ============================================================================
// IndexedDB Cache Implementation
// ============================================================================

export class IDBPMPCache implements ICacheStrategy {
  name = 'IndexedDB Cache'
  private db: IDBDatabase | null = null
  private dbName = 'PMPLearningCache'
  private dbVersion = 3
  private storeName = 'cache-entries'

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'key' })
          store.createIndex('timestamp', 'timestamp')
          store.createIndex('priority', 'priority')
          store.createIndex('tags', 'tags', { multiEntry: true })
        }
      }
    })
  }

  async get(key: string): Promise<any | null> {
    if (!this.db) {
      await this.initialize()
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      const request = store.get(key)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        const result = request.result
        if (result && this.isValidEntry(result)) {
          resolve(result.value)
        } else {
          resolve(null)
        }
      }
    })
  }

  async set(key: string, value: any, options: CacheOptions = {}): Promise<void> {
    if (!this.db) {
      await this.initialize()
    }

    const entry: CacheEntry = {
      key,
      value,
      timestamp: Date.now(),
      ttl: options.ttl,
      priority: options.priority || 'normal',
      tags: options.tags || [],
      size: this.calculateSize(value),
      accessCount: 1,
      lastAccessed: Date.now(),
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.put(entry)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async delete(key: string): Promise<void> {
    if (!this.db) {
      await this.initialize()
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.delete(key)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async clear(): Promise<void> {
    if (!this.db) {
      await this.initialize()
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.clear()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async size(): Promise<number> {
    if (!this.db) {
      await this.initialize()
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      const request = store.count()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  }

  async keys(): Promise<string[]> {
    if (!this.db) {
      await this.initialize()
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      const request = store.getAllKeys()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result as string[])
    })
  }

  private isValidEntry(entry: any): boolean {
    if (!entry.ttl) {
      return true
    }
    return Date.now() - entry.timestamp < entry.ttl
  }

  private calculateSize(value: any): number {
    return new Blob([JSON.stringify(value)]).size
  }
}

// ============================================================================
// Service Worker Cache Strategy
// ============================================================================

export class ServiceWorkerCacheStrategy implements ICacheStrategy {
  name = 'Service Worker Cache'
  private cacheName = 'pmp-sw-cache-v3'

  async get(key: string): Promise<any | null> {
    if (!('caches' in window)) {
      return null
    }

    try {
      const cache = await caches.open(this.cacheName)
      const response = await cache.match(key)

      if (response) {
        return await response.json()
      }

      return null
    } catch (error) {
      console.error('Service Worker cache get failed:', error)
      return null
    }
  }

  async set(key: string, value: any, options: CacheOptions = {}): Promise<void> {
    if (!('caches' in window)) {
      return
    }

    try {
      const cache = await caches.open(this.cacheName)
      const response = new Response(JSON.stringify(value), {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Timestamp': Date.now().toString(),
          'Cache-TTL': (options.ttl || 0).toString(),
          'Cache-Priority': options.priority || 'normal',
          'Cache-Tags': JSON.stringify(options.tags || []),
        },
      })

      await cache.put(key, response)
    } catch (error) {
      console.error('Service Worker cache set failed:', error)
    }
  }

  async delete(key: string): Promise<void> {
    if (!('caches' in window)) {
      return
    }

    try {
      const cache = await caches.open(this.cacheName)
      await cache.delete(key)
    } catch (error) {
      console.error('Service Worker cache delete failed:', error)
    }
  }

  async clear(): Promise<void> {
    if (!('caches' in window)) {
      return
    }

    try {
      await caches.delete(this.cacheName)
    } catch (error) {
      console.error('Service Worker cache clear failed:', error)
    }
  }

  async size(): Promise<number> {
    if (!('caches' in window)) {
      return 0
    }

    try {
      const cache = await caches.open(this.cacheName)
      const keys = await cache.keys()
      return keys.length
    } catch (error) {
      console.error('Service Worker cache size failed:', error)
      return 0
    }
  }

  async keys(): Promise<string[]> {
    if (!('caches' in window)) {
      return []
    }

    try {
      const cache = await caches.open(this.cacheName)
      const requests = await cache.keys()
      return requests.map((request) => request.url)
    } catch (error) {
      console.error('Service Worker cache keys failed:', error)
      return []
    }
  }
}

// ============================================================================
// Cache Factory and Registry
// ============================================================================

export class CacheFactory {
  private static instance: CacheFactory
  private strategies: Map<string, ICacheStrategy> = new Map()
  private globalManager: MultiLayerCacheManager

  private constructor() {
    this.globalManager = new MultiLayerCacheManager()
  }

  static getInstance(): CacheFactory {
    if (!CacheFactory.instance) {
      CacheFactory.instance = new CacheFactory()
    }
    return CacheFactory.instance
  }

  registerStrategy(name: string, strategy: ICacheStrategy): void {
    this.strategies.set(name, strategy)
  }

  getStrategy(name: string): ICacheStrategy {
    return this.strategies.get(name) || this.globalManager
  }

  getGlobalCache(): MultiLayerCacheManager {
    return this.globalManager
  }

  /**
   * Create domain-specific cache instances
   */
  createDomainCache(
    domain: string,
    options: {
      maxSize?: number
      defaultTTL?: number
      priority?: 'low' | 'normal' | 'high'
    } = {}
  ): DomainCache {
    return new DomainCache(domain, this.globalManager, options)
  }
}

// ============================================================================
// Domain-Specific Cache
// ============================================================================

export class DomainCache {
  constructor(
    private domain: string,
    private globalManager: MultiLayerCacheManager,
    private options: any = {}
  ) {}

  async get<T>(key: string): Promise<T | null> {
    return this.globalManager.get(this.getDomainKey(key))
  }

  async set<T>(key: string, value: T, options: CacheOptions = {}): Promise<void> {
    const domainOptions = {
      ...this.options,
      ...options,
      tags: [...(options.tags || []), `domain:${this.domain}`],
    }

    return this.globalManager.set(this.getDomainKey(key), value, domainOptions)
  }

  async delete(key: string): Promise<void> {
    return this.globalManager.delete(this.getDomainKey(key))
  }

  async invalidateDomain(): Promise<void> {
    return this.globalManager.invalidateByTags([`domain:${this.domain}`])
  }

  private getDomainKey(key: string): string {
    return `${this.domain}:${key}`
  }
}

// ============================================================================
// Usage Examples and Factory Setup
// ============================================================================

// Initialize global cache factory
const cacheFactory = CacheFactory.getInstance()

// Create domain-specific caches
export const learningContentCache = cacheFactory.createDomainCache('learning-content', {
  maxSize: 20 * 1024 * 1024, // 20MB
  defaultTTL: 60 * 60 * 1000, // 1 hour
  priority: 'high',
})

export const userProgressCache = cacheFactory.createDomainCache('user-progress', {
  maxSize: 5 * 1024 * 1024, // 5MB
  defaultTTL: 10 * 60 * 1000, // 10 minutes
  priority: 'high',
})

export const analyticsCache = cacheFactory.createDomainCache('analytics', {
  maxSize: 10 * 1024 * 1024, // 10MB
  defaultTTL: 5 * 60 * 1000, // 5 minutes
  priority: 'normal',
})

export const staticContentCache = cacheFactory.createDomainCache('static-content', {
  maxSize: 30 * 1024 * 1024, // 30MB
  defaultTTL: 24 * 60 * 60 * 1000, // 24 hours
  priority: 'normal',
})

// Export main cache manager
export const globalCache = cacheFactory.getGlobalCache()

// Usage examples:
/*
// Set learning content with high priority
await learningContentCache.set('integration-processes', processData, {
  priority: 'high',
  ttl: 24 * 60 * 60 * 1000, // 24 hours
  tags: ['pmbok-content', 'integration']
});

// Get user progress with fallback
const progress = await userProgressCache.get('user-123-progress') || 
                 await fetchProgressFromAPI('user-123');

// Preload content for offline study
await globalCache.preloadOfflineContent([
  { key: 'risk-management', url: '/api/ka/risk', priority: 'high' },
  { key: 'cost-management', url: '/api/ka/cost', priority: 'medium' }
]);

// Get cache performance metrics
const metrics = globalCache.getMetrics();
console.log(`Cache hit rate: ${Math.round(metrics.hitRate * 100)}%`);
*/

export default {
  MultiLayerCacheManager,
  CacheFactory,
  DomainCache,
  IDBPMPCache,
  ServiceWorkerCacheStrategy,
  globalCache,
  learningContentCache,
  userProgressCache,
  analyticsCache,
  staticContentCache,
}
