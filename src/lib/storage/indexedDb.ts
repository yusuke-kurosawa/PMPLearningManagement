import { openDB, IDBPDatabase } from 'idb'

export interface StorageItem {
  key: string
  value: unknown
  timestamp: number
  version?: string
  userId?: string
}

export interface StorageOptions {
  encrypt?: boolean
  compress?: boolean
  ttl?: number // Time to live in milliseconds
}

export class IndexedDBStorage {
  private dbPromise: Promise<IDBPDatabase> | null = null
  private readonly DB_NAME = 'PMPLearningStorage'
  private readonly DB_VERSION = 1
  private readonly STORE_NAME = 'keyval'

  constructor() {
    this.initDB()
  }

  /**
   * Initialize IndexedDB database
   */
  private async initDB(): Promise<IDBPDatabase> {
    if (!this.dbPromise) {
      this.dbPromise = openDB(this.DB_NAME, this.DB_VERSION, {
        upgrade(db) {
          // Create main key-value store
          if (!db.objectStoreNames.contains('keyval')) {
            const store = db.createObjectStore('keyval', {
              keyPath: 'key',
            })
            store.createIndex('timestamp', 'timestamp')
            store.createIndex('userId', 'userId')
            store.createIndex('version', 'version')
          }

          // Create sync queue store
          if (!db.objectStoreNames.contains('syncQueue')) {
            const syncStore = db.createObjectStore('syncQueue', {
              keyPath: 'id',
            })
            syncStore.createIndex('timestamp', 'timestamp')
            syncStore.createIndex('type', 'type')
            syncStore.createIndex('status', 'status')
          }

          // Create metadata store
          if (!db.objectStoreNames.contains('metadata')) {
            db.createObjectStore('metadata', {
              keyPath: 'key',
            })
          }
        },

        blocked() {
          if (process.env.NODE_ENV === 'development') {
            console.warn('IndexedDB upgrade blocked')
          }
        },

        blocking() {
          if (process.env.NODE_ENV === 'development') {
            console.warn('IndexedDB is blocking a newer version')
          }
        },
      })
    }

    return this.dbPromise
  }

  /**
   * Store an item in IndexedDB
   */
  async setItem(key: string, value: unknown, options: StorageOptions = {}): Promise<void> {
    try {
      const db = await this.initDB()

      const item: StorageItem = {
        key,
        value: options.compress ? this.compress(value) : value,
        timestamp: Date.now(),
        version: '2.0.0',
        userId: 'local-user', // Will be dynamic with auth
      }

      // Add TTL if specified
      if (options.ttl) {
        ;(item as any).expiresAt = Date.now() + options.ttl
      }

      const tx = db.transaction(this.STORE_NAME, 'readwrite')
      await tx.objectStore(this.STORE_NAME).put(item)
      await tx.complete
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error(`Failed to store item ${key}:`, error)
      }
      throw new Error(`Storage failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Retrieve an item from IndexedDB
   */
  async getItem<T>(key: string): Promise<T | null> {
    try {
      const db = await this.initDB()

      const tx = db.transaction(this.STORE_NAME, 'readonly')
      const item = await tx.objectStore(this.STORE_NAME).get(key)
      await tx.complete

      if (!item) {
        return null
      }

      // Check TTL
      if ((item as any).expiresAt && Date.now() > (item as any).expiresAt) {
        await this.removeItem(key)
        return null
      }

      return typeof item.value === 'string' && item.value.startsWith('compressed:')
        ? this.decompress(item.value)
        : item.value
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error(`Failed to retrieve item ${key}:`, error)
      }
      return null
    }
  }

  /**
   * Remove an item from IndexedDB
   */
  async removeItem(key: string): Promise<void> {
    try {
      const db = await this.initDB()

      const tx = db.transaction(this.STORE_NAME, 'readwrite')
      await tx.objectStore(this.STORE_NAME).delete(key)
      await tx.complete
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error(`Failed to remove item ${key}:`, error)
      }
      throw new Error(`Remove failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get all keys
   */
  async keys(): Promise<string[]> {
    try {
      const db = await this.initDB()

      const tx = db.transaction(this.STORE_NAME, 'readonly')
      const keys = await tx.objectStore(this.STORE_NAME).getAllKeys()
      await tx.complete

      return keys as string[]
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to get keys:', error)
      }
      return []
    }
  }

  /**
   * Clear all data
   */
  async clear(): Promise<void> {
    try {
      const db = await this.initDB()

      const tx = db.transaction(this.STORE_NAME, 'readwrite')
      await tx.objectStore(this.STORE_NAME).clear()
      await tx.complete
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to clear storage:', error)
      }
      throw new Error(`Clear failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get storage size estimate
   */
  async getStorageEstimate(): Promise<{ used: number; quota: number }> {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate()
        return {
          used: estimate.usage || 0,
          quota: estimate.quota || 0,
        }
      }

      return { used: 0, quota: 0 }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to get storage estimate:', error)
      }
      return { used: 0, quota: 0 }
    }
  }

  /**
   * Get items by user ID
   */
  async getItemsByUser(userId: string): Promise<StorageItem[]> {
    try {
      const db = await this.initDB()

      const tx = db.transaction(this.STORE_NAME, 'readonly')
      const index = tx.objectStore(this.STORE_NAME).index('userId')
      const items = await index.getAll(userId)
      await tx.complete

      return items
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to get items by user:', error)
      }
      return []
    }
  }

  /**
   * Clean up expired items
   */
  async cleanup(): Promise<number> {
    try {
      const db = await this.initDB()
      const now = Date.now()
      let cleanedCount = 0

      const tx = db.transaction(this.STORE_NAME, 'readwrite')
      const store = tx.objectStore(this.STORE_NAME)
      const cursor = await store.openCursor()

      while (cursor) {
        const item = cursor.value
        if ((item as any).expiresAt && now > (item as any).expiresAt) {
          await cursor.delete()
          cleanedCount++
        }
        await cursor.continue()
      }

      await tx.complete
      return cleanedCount
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to cleanup expired items:', error)
      }
      return 0
    }
  }

  /**
   * Export data for backup
   */
  async exportData(): Promise<{ [key: string]: unknown }> {
    try {
      const db = await this.initDB()

      const tx = db.transaction(this.STORE_NAME, 'readonly')
      const items = await tx.objectStore(this.STORE_NAME).getAll()
      await tx.complete

      const exported: { [key: string]: unknown } = {}

      items.forEach((item) => {
        exported[item.key] = {
          value: item.value,
          timestamp: item.timestamp,
          version: item.version,
          userId: item.userId,
        }
      })

      return exported
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to export data:', error)
      }
      return {}
    }
  }

  /**
   * Import data from backup
   */
  async importData(data: { [key: string]: unknown }): Promise<number> {
    try {
      const db = await this.initDB()
      let importedCount = 0

      const tx = db.transaction(this.STORE_NAME, 'readwrite')
      const store = tx.objectStore(this.STORE_NAME)

      for (const [key, itemData] of Object.entries(data)) {
        const item: StorageItem = {
          key,
          value: itemData.value,
          timestamp: itemData.timestamp || Date.now(),
          version: itemData.version || '2.0.0',
          userId: itemData.userId || 'local-user',
        }

        await store.put(item)
        importedCount++
      }

      await tx.complete
      return importedCount
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to import data:', error)
      }
      throw new Error(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Simple compression using JSON and base64
   */
  private compress(data: unknown): string {
    try {
      const json = JSON.stringify(data)
      const compressed = btoa(encodeURIComponent(json))
      return `compressed:${compressed}`
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Compression failed, storing as-is:', error)
      }
      return data
    }
  }

  /**
   * Decompress data
   */
  private decompress(compressedData: string): unknown {
    try {
      if (!compressedData.startsWith('compressed:')) {
        return compressedData
      }

      const compressed = compressedData.slice('compressed:'.length)
      const json = decodeURIComponent(atob(compressed))
      return JSON.parse(json)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Decompression failed:', error)
      }
      return compressedData
    }
  }

  /**
   * Check if IndexedDB is supported
   */
  static isSupported(): boolean {
    return typeof window !== 'undefined' && 'indexedDB' in window && indexedDB !== null
  }
}

// Fallback to localStorage if IndexedDB is not supported
export class FallbackStorage {
  async setItem(key: string, value: unknown): Promise<void> {
    try {
      localStorage.setItem(
        key,
        JSON.stringify({
          value,
          timestamp: Date.now(),
          version: '2.0.0',
        })
      )
    } catch (error) {
      throw new Error(
        `LocalStorage failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  async getItem<T>(key: string): Promise<T | null> {
    try {
      const item = localStorage.getItem(key)
      if (!item) return null

      const parsed = JSON.parse(item)
      return parsed.value
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error(`Failed to get item ${key}:`, error)
      }
      return null
    }
  }

  async removeItem(key: string): Promise<void> {
    localStorage.removeItem(key)
  }

  async keys(): Promise<string[]> {
    const keys: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) keys.push(key)
    }
    return keys
  }

  async clear(): Promise<void> {
    localStorage.clear()
  }
}

export const storage = IndexedDBStorage.isSupported()
  ? new IndexedDBStorage()
  : new FallbackStorage()
