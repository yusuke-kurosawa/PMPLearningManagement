/**
 * Offline-First Data Synchronization Manager
 *
 * Provides comprehensive offline data management with:
 * - Optimistic updates
 * - Conflict resolution strategies
 * - Incremental synchronization
 * - Data versioning and integrity checks
 */

import { openDB, IDBPDatabase } from 'idb'

// Types
export interface SyncOperation {
  id: string
  type: 'CREATE' | 'UPDATE' | 'DELETE' | 'BATCH'
  entity: string
  entityId?: string
  data: any
  timestamp: number
  version: number
  retries: number
  status: 'pending' | 'syncing' | 'completed' | 'failed' | 'conflict'
  error?: string
  conflictData?: any
}

export interface ConflictResolution {
  strategy: 'client-wins' | 'server-wins' | 'merge' | 'manual' | 'timestamp'
  resolver?: (client: any, server: any) => any
  autoResolve: boolean
}

export interface SyncConfig {
  batchSize: number
  maxRetries: number
  retryDelay: number
  syncInterval: number
  conflictStrategy: ConflictResolution
}

export interface EntityVersion {
  entity: string
  version: string
  lastSync: number
  checksum: string
}

export interface SyncResult {
  success: boolean
  operations: number
  conflicts: number
  errors: number
  timestamp: number
}

// Database configuration
const DB_NAME = 'PMPSyncDB'
const DB_VERSION = 1

// Store names
const STORES = {
  SYNC_QUEUE: 'syncQueue',
  CONFLICTS: 'conflicts',
  VERSIONS: 'versions',
  ENTITIES: 'entities',
  METADATA: 'metadata',
}

/**
 * Offline Sync Manager Class
 */
export class OfflineSyncManager {
  private db: IDBPDatabase | null = null
  private syncQueue: Map<string, SyncOperation> = new Map()
  private conflictStrategies: Map<string, ConflictResolution> = new Map()
  private syncInProgress = false
  private syncInterval: NodeJS.Timeout | null = null
  private config: SyncConfig

  constructor(config?: Partial<SyncConfig>) {
    this.config = {
      batchSize: 10,
      maxRetries: 3,
      retryDelay: 1000,
      syncInterval: 30000, // 30 seconds
      conflictStrategy: {
        strategy: 'timestamp',
        autoResolve: true,
      },
      ...config,
    }

    this.initialize()
  }

  /**
   * Initialize the sync manager
   */
  private async initialize() {
    try {
      // Initialize IndexedDB
      await this.initializeDB()

      // Setup conflict resolution strategies
      this.setupConflictStrategies()

      // Setup event listeners
      this.setupEventListeners()

      // Start periodic sync
      this.startPeriodicSync()

      // Load pending operations
      await this.loadPendingOperations()

      console.log('[SyncManager] Initialized successfully')
    } catch (error) {
      console.error('[SyncManager] Initialization failed:', error)
    }
  }

  /**
   * Initialize IndexedDB
   */
  private async initializeDB() {
    this.db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Sync queue store
        if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
          const syncStore = db.createObjectStore(STORES.SYNC_QUEUE, {
            keyPath: 'id',
          })
          syncStore.createIndex('status', 'status')
          syncStore.createIndex('entity', 'entity')
          syncStore.createIndex('timestamp', 'timestamp')
        }

        // Conflicts store
        if (!db.objectStoreNames.contains(STORES.CONFLICTS)) {
          const conflictStore = db.createObjectStore(STORES.CONFLICTS, {
            keyPath: 'id',
          })
          conflictStore.createIndex('entity', 'entity')
          conflictStore.createIndex('resolved', 'resolved')
          conflictStore.createIndex('timestamp', 'timestamp')
        }

        // Version tracking store
        if (!db.objectStoreNames.contains(STORES.VERSIONS)) {
          const versionStore = db.createObjectStore(STORES.VERSIONS, {
            keyPath: 'entity',
          })
          versionStore.createIndex('lastSync', 'lastSync')
        }

        // Entity data store
        if (!db.objectStoreNames.contains(STORES.ENTITIES)) {
          const entityStore = db.createObjectStore(STORES.ENTITIES, {
            keyPath: 'id',
          })
          entityStore.createIndex('entity', 'entity')
          entityStore.createIndex('lastModified', 'lastModified')
        }

        // Metadata store
        if (!db.objectStoreNames.contains(STORES.METADATA)) {
          db.createObjectStore(STORES.METADATA, { keyPath: 'key' })
        }
      },
    })
  }

  /**
   * Setup conflict resolution strategies
   */
  private setupConflictStrategies() {
    // Learning progress - merge strategy
    this.conflictStrategies.set('progress', {
      strategy: 'merge',
      autoResolve: true,
      resolver: (client: any, server: any) => ({
        ...server,
        ...client,
        completedTopics: Array.from(
          new Set([...(server.completedTopics || []), ...(client.completedTopics || [])])
        ),
        totalTime: Math.max(server.totalTime || 0, client.totalTime || 0),
        score: Math.max(server.score || 0, client.score || 0),
        lastUpdated: Math.max(
          new Date(server.lastUpdated).getTime(),
          new Date(client.lastUpdated).getTime()
        ),
      }),
    })

    // Exam results - client wins
    this.conflictStrategies.set('examResults', {
      strategy: 'client-wins',
      autoResolve: true,
    })

    // User preferences - server wins
    this.conflictStrategies.set('preferences', {
      strategy: 'server-wins',
      autoResolve: true,
    })

    // Notes - manual resolution required
    this.conflictStrategies.set('notes', {
      strategy: 'manual',
      autoResolve: false,
    })

    // Flashcards - timestamp based
    this.conflictStrategies.set('flashcards', {
      strategy: 'timestamp',
      autoResolve: true,
    })
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners() {
    // Online/offline events
    window.addEventListener('online', () => this.handleOnline())
    window.addEventListener('offline', () => this.handleOffline())

    // Visibility change
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && navigator.onLine) {
        this.syncNow()
      }
    })

    // Before unload - attempt final sync
    window.addEventListener('beforeunload', () => {
      if (this.syncQueue.size > 0) {
        this.syncNow()
      }
    })
  }

  /**
   * Handle online status
   */
  private async handleOnline() {
    console.log('[SyncManager] Connection restored, starting sync...')
    await this.syncNow()
    this.startPeriodicSync()
  }

  /**
   * Handle offline status
   */
  private handleOffline() {
    console.log('[SyncManager] Connection lost, entering offline mode')
    this.stopPeriodicSync()
  }

  /**
   * Start periodic sync
   */
  private startPeriodicSync() {
    if (this.syncInterval) {
      return
    }

    this.syncInterval = setInterval(() => {
      if (navigator.onLine && !this.syncInProgress) {
        this.syncNow()
      }
    }, this.config.syncInterval)
  }

  /**
   * Stop periodic sync
   */
  private stopPeriodicSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
  }

  /**
   * Queue an operation for sync
   */
  async queueOperation(
    type: SyncOperation['type'],
    entity: string,
    data: any,
    entityId?: string
  ): Promise<string> {
    const operation: SyncOperation = {
      id: crypto.randomUUID(),
      type,
      entity,
      entityId,
      data,
      timestamp: Date.now(),
      version: 1,
      retries: 0,
      status: 'pending',
    }

    // Store in IndexedDB
    if (this.db) {
      await this.db.put(STORES.SYNC_QUEUE, operation)
    }

    // Add to memory queue
    this.syncQueue.set(operation.id, operation)

    // Attempt immediate sync if online
    if (navigator.onLine && !this.syncInProgress) {
      this.syncNow()
    }

    return operation.id
  }

  /**
   * Perform synchronization
   */
  async syncNow(): Promise<SyncResult> {
    if (this.syncInProgress || !navigator.onLine) {
      return {
        success: false,
        operations: 0,
        conflicts: 0,
        errors: 0,
        timestamp: Date.now(),
      }
    }

    this.syncInProgress = true
    const result: SyncResult = {
      success: true,
      operations: 0,
      conflicts: 0,
      errors: 0,
      timestamp: Date.now(),
    }

    try {
      // Get pending operations
      const pendingOps = await this.getPendingOperations()

      if (pendingOps.length === 0) {
        console.log('[SyncManager] No pending operations')
        return result
      }

      console.log(`[SyncManager] Syncing ${pendingOps.length} operations...`)

      // Process in batches
      const batches = this.createBatches(pendingOps, this.config.batchSize)

      for (const batch of batches) {
        const batchResult = await this.processBatch(batch)
        result.operations += batchResult.operations
        result.conflicts += batchResult.conflicts
        result.errors += batchResult.errors
      }

      // Perform incremental sync for entities
      await this.performIncrementalSync()

      console.log('[SyncManager] Sync completed:', result)

      // Notify success
      this.notifySync('complete', result)
    } catch (error) {
      console.error('[SyncManager] Sync failed:', error)
      result.success = false
      this.notifySync('error', result)
    } finally {
      this.syncInProgress = false
    }

    return result
  }

  /**
   * Process a batch of operations
   */
  private async processBatch(
    operations: SyncOperation[]
  ): Promise<Omit<SyncResult, 'success' | 'timestamp'>> {
    const result = {
      operations: 0,
      conflicts: 0,
      errors: 0,
    }

    // Send batch to server
    try {
      const response = await fetch('/api/sync/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Sync-Version': '1.0',
        },
        body: JSON.stringify({
          operations: operations.map((op) => ({
            id: op.id,
            type: op.type,
            entity: op.entity,
            entityId: op.entityId,
            data: op.data,
            timestamp: op.timestamp,
            version: op.version,
          })),
        }),
      })

      if (!response.ok) {
        throw new Error(`Sync failed: ${response.statusText}`)
      }

      const results = await response.json()

      // Process results
      for (const opResult of results) {
        const operation = operations.find((op) => op.id === opResult.id)
        if (!operation) {
          continue
        }

        if (opResult.success) {
          await this.markOperationComplete(operation.id)
          result.operations++
        } else if (opResult.conflict) {
          await this.handleConflict(operation, opResult.serverData)
          result.conflicts++
        } else {
          await this.handleSyncError(operation, opResult.error)
          result.errors++
        }
      }
    } catch (error) {
      // Handle batch failure
      for (const operation of operations) {
        await this.handleSyncError(operation, error)
        result.errors++
      }
    }

    return result
  }

  /**
   * Handle conflict resolution
   */
  private async handleConflict(operation: SyncOperation, serverData: any): Promise<void> {
    const strategy = this.conflictStrategies.get(operation.entity) || this.config.conflictStrategy

    console.log(`[SyncManager] Conflict detected for ${operation.entity}:`, {
      client: operation.data,
      server: serverData,
    })

    switch (strategy.strategy) {
      case 'client-wins':
        // Retry with force flag
        operation.data._forceOverwrite = true
        await this.retryOperation(operation)
        break

      case 'server-wins':
        // Accept server version
        await this.acceptServerVersion(operation.entity, serverData)
        await this.markOperationComplete(operation.id)
        break

      case 'merge':
        if (strategy.resolver) {
          const merged = strategy.resolver(operation.data, serverData)
          operation.data = merged
          await this.retryOperation(operation)
        }
        break

      case 'timestamp':
        // Compare timestamps
        const clientTime = operation.data.lastModified || operation.timestamp
        const serverTime = serverData.lastModified || Date.now()

        if (clientTime > serverTime) {
          operation.data._forceOverwrite = true
          await this.retryOperation(operation)
        } else {
          await this.acceptServerVersion(operation.entity, serverData)
          await this.markOperationComplete(operation.id)
        }
        break

      case 'manual':
        // Store conflict for user resolution
        await this.storeConflict(operation, serverData)
        break
    }
  }

  /**
   * Store conflict for manual resolution
   */
  private async storeConflict(operation: SyncOperation, serverData: any): Promise<void> {
    const conflict = {
      id: crypto.randomUUID(),
      operationId: operation.id,
      entity: operation.entity,
      entityId: operation.entityId,
      clientData: operation.data,
      serverData,
      timestamp: Date.now(),
      resolved: false,
    }

    if (this.db) {
      await this.db.put(STORES.CONFLICTS, conflict)
    }

    // Update operation status
    operation.status = 'conflict'
    operation.conflictData = serverData
    await this.updateOperation(operation)

    // Notify user
    this.notifyConflict(conflict)
  }

  /**
   * Retry a failed operation
   */
  private async retryOperation(operation: SyncOperation): Promise<void> {
    operation.retries++

    if (operation.retries >= this.config.maxRetries) {
      operation.status = 'failed'
      await this.updateOperation(operation)
      return
    }

    // Exponential backoff
    const delay = this.config.retryDelay * Math.pow(2, operation.retries - 1)

    setTimeout(() => {
      this.syncQueue.set(operation.id, operation)
      if (navigator.onLine && !this.syncInProgress) {
        this.syncNow()
      }
    }, delay)
  }

  /**
   * Handle sync error
   */
  private async handleSyncError(operation: SyncOperation, error: any): Promise<void> {
    operation.error = error?.message || 'Unknown error'

    if (operation.retries < this.config.maxRetries) {
      await this.retryOperation(operation)
    } else {
      operation.status = 'failed'
      await this.updateOperation(operation)

      // Notify user
      this.notifyError(operation, error)
    }
  }

  /**
   * Perform incremental sync for entities
   */
  private async performIncrementalSync(): Promise<void> {
    if (!this.db) {
      return
    }

    const versions = await this.db.getAll(STORES.VERSIONS)

    for (const version of versions) {
      try {
        const response = await fetch(`/api/sync/${version.entity}/incremental`, {
          method: 'GET',
          headers: {
            'X-Last-Sync': version.lastSync.toString(),
            'X-Client-Version': version.version,
          },
        })

        if (!response.ok) {
          continue
        }

        const { changes, deletions, timestamp, fullSyncRequired } = await response.json()

        if (fullSyncRequired) {
          await this.performFullSync(version.entity)
        } else {
          await this.applyIncrementalChanges(version.entity, changes, deletions)

          // Update version info
          version.lastSync = timestamp
          version.version = await this.calculateEntityHash(version.entity)
          await this.db.put(STORES.VERSIONS, version)
        }
      } catch (error) {
        console.error(`[SyncManager] Incremental sync failed for ${version.entity}:`, error)
      }
    }
  }

  /**
   * Apply incremental changes to local data
   */
  private async applyIncrementalChanges(
    entity: string,
    changes: any[],
    deletions: string[]
  ): Promise<void> {
    if (!this.db) {
      return
    }

    const tx = this.db.transaction([STORES.ENTITIES], 'readwrite')
    const store = tx.objectStore(STORES.ENTITIES)

    // Apply changes
    for (const change of changes) {
      await store.put({
        ...change,
        entity,
        lastModified: Date.now(),
      })
    }

    // Apply deletions
    for (const id of deletions) {
      await store.delete(id)
    }

    await tx.done

    console.log(
      `[SyncManager] Applied ${changes.length} changes and ${deletions.length} deletions for ${entity}`
    )
  }

  /**
   * Perform full sync for an entity
   */
  private async performFullSync(entity: string): Promise<void> {
    console.log(`[SyncManager] Performing full sync for ${entity}`)

    try {
      const response = await fetch(`/api/sync/${entity}/full`)
      if (!response.ok) {
        throw new Error('Full sync failed')
      }

      const data = await response.json()

      // Clear existing data
      if (this.db) {
        const tx = this.db.transaction([STORES.ENTITIES], 'readwrite')
        const store = tx.objectStore(STORES.ENTITIES)
        const index = store.index('entity')

        // Delete all existing records for this entity
        const keys = await index.getAllKeys(entity)
        for (const key of keys) {
          await store.delete(key)
        }

        // Add new data
        for (const item of data) {
          await store.put({
            ...item,
            entity,
            lastModified: Date.now(),
          })
        }

        await tx.done
      }

      // Update version
      await this.updateEntityVersion(entity)
    } catch (error) {
      console.error(`[SyncManager] Full sync failed for ${entity}:`, error)
    }
  }

  /**
   * Calculate entity hash for version tracking
   */
  private async calculateEntityHash(entity: string): Promise<string> {
    if (!this.db) {
      return ''
    }

    const tx = this.db.transaction([STORES.ENTITIES], 'readonly')
    const store = tx.objectStore(STORES.ENTITIES)
    const index = store.index('entity')

    const data = await index.getAll(entity)

    // Create hash from data
    const dataString = JSON.stringify(
      data.map((item) => ({
        id: item.id,
        lastModified: item.lastModified,
      }))
    )

    const encoder = new TextEncoder()
    const dataBuffer = encoder.encode(dataString)
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)

    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  }

  /**
   * Update entity version information
   */
  private async updateEntityVersion(entity: string): Promise<void> {
    if (!this.db) {
      return
    }

    const version: EntityVersion = {
      entity,
      version: await this.calculateEntityHash(entity),
      lastSync: Date.now(),
      checksum: '',
    }

    await this.db.put(STORES.VERSIONS, version)
  }

  /**
   * Helper methods
   */

  private async getPendingOperations(): Promise<SyncOperation[]> {
    if (!this.db) {
      return []
    }

    const index = this.db
      .transaction([STORES.SYNC_QUEUE], 'readonly')
      .objectStore(STORES.SYNC_QUEUE)
      .index('status')

    return index.getAll('pending')
  }

  private async loadPendingOperations(): Promise<void> {
    const operations = await this.getPendingOperations()
    operations.forEach((op) => {
      this.syncQueue.set(op.id, op)
    })
  }

  private async updateOperation(operation: SyncOperation): Promise<void> {
    if (this.db) {
      await this.db.put(STORES.SYNC_QUEUE, operation)
    }
    this.syncQueue.set(operation.id, operation)
  }

  private async markOperationComplete(id: string): Promise<void> {
    if (this.db) {
      const operation = await this.db.get(STORES.SYNC_QUEUE, id)
      if (operation) {
        operation.status = 'completed'
        await this.db.put(STORES.SYNC_QUEUE, operation)
      }
    }
    this.syncQueue.delete(id)
  }

  private async acceptServerVersion(entity: string, data: any): Promise<void> {
    if (!this.db) {
      return
    }

    await this.db.put(STORES.ENTITIES, {
      ...data,
      entity,
      lastModified: Date.now(),
    })
  }

  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = []
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize))
    }
    return batches
  }

  /**
   * Notification methods
   */

  private notifySync(type: 'start' | 'complete' | 'error', result?: SyncResult) {
    window.dispatchEvent(
      new CustomEvent('sync-status', {
        detail: { type, result },
      })
    )
  }

  private notifyConflict(conflict: any) {
    window.dispatchEvent(
      new CustomEvent('sync-conflict', {
        detail: conflict,
      })
    )
  }

  private notifyError(operation: SyncOperation, error: any) {
    window.dispatchEvent(
      new CustomEvent('sync-error', {
        detail: { operation, error },
      })
    )
  }

  /**
   * Public API
   */

  async getConflicts(entity?: string): Promise<any[]> {
    if (!this.db) {
      return []
    }

    if (entity) {
      const index = this.db
        .transaction([STORES.CONFLICTS], 'readonly')
        .objectStore(STORES.CONFLICTS)
        .index('entity')
      return index.getAll(entity)
    }

    return this.db.getAll(STORES.CONFLICTS)
  }

  async resolveConflict(
    conflictId: string,
    resolution: 'client' | 'server' | 'custom',
    customData?: any
  ): Promise<void> {
    if (!this.db) {
      return
    }

    const conflict = await this.db.get(STORES.CONFLICTS, conflictId)
    if (!conflict) {
      return
    }

    let resolvedData: any

    switch (resolution) {
      case 'client':
        resolvedData = conflict.clientData
        break
      case 'server':
        resolvedData = conflict.serverData
        break
      case 'custom':
        resolvedData = customData
        break
    }

    // Apply resolved data
    await this.db.put(STORES.ENTITIES, {
      ...resolvedData,
      entity: conflict.entity,
      lastModified: Date.now(),
    })

    // Mark conflict as resolved
    conflict.resolved = true
    conflict.resolvedAt = Date.now()
    conflict.resolution = resolution
    await this.db.put(STORES.CONFLICTS, conflict)

    // Remove from sync queue if exists
    if (conflict.operationId) {
      await this.db.delete(STORES.SYNC_QUEUE, conflict.operationId)
    }
  }

  async clearSyncQueue(): Promise<void> {
    if (!this.db) {
      return
    }

    const tx = this.db.transaction([STORES.SYNC_QUEUE], 'readwrite')
    await tx.objectStore(STORES.SYNC_QUEUE).clear()
    this.syncQueue.clear()
  }

  async getSyncStatus(): Promise<{
    pending: number
    conflicts: number
    lastSync: number
    isOnline: boolean
    isSyncing: boolean
  }> {
    const pending = this.syncQueue.size
    const conflicts = this.db
      ? (await this.db.getAll(STORES.CONFLICTS)).filter((c) => !c.resolved).length
      : 0

    const metadata = this.db ? await this.db.get(STORES.METADATA, 'lastSync') : null

    return {
      pending,
      conflicts,
      lastSync: metadata?.value || 0,
      isOnline: navigator.onLine,
      isSyncing: this.syncInProgress,
    }
  }

  destroy() {
    this.stopPeriodicSync()
    if (this.db) {
      this.db.close()
    }
  }
}

// Create singleton instance
export const syncManager = new OfflineSyncManager()

// Export convenience methods
export const queueSync = (
  type: SyncOperation['type'],
  entity: string,
  data: any,
  entityId?: string
) => syncManager.queueOperation(type, entity, data, entityId)

export const syncNow = () => syncManager.syncNow()
export const getSyncStatus = () => syncManager.getSyncStatus()
export const getConflicts = (entity?: string) => syncManager.getConflicts(entity)
export const resolveConflict = (
  conflictId: string,
  resolution: 'client' | 'server' | 'custom',
  customData?: any
) => syncManager.resolveConflict(conflictId, resolution, customData)
