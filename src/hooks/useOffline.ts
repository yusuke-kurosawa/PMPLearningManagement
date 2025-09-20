/**
 * @file useOffline.ts
 * @description オフライン機能を管理するカスタムフック
 * @author Developer 9 (frontend-developer) - React/状態管理
 * @created 2025-08-30
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { logger } from '../services/logger'

interface OfflineState {
  isOnline: boolean
  isServiceWorkerReady: boolean
  isSyncing: boolean
  syncQueue: number
  lastSyncTime: Date | null
  offlineDataSize: number
}

interface UseOfflineOptions {
  enableAutoSync?: boolean
  syncInterval?: number
  onStatusChange?: (isOnline: boolean) => void
  onSyncComplete?: () => void
}

export function useOffline(options: UseOfflineOptions = {}) {
  const {
    enableAutoSync = true,
    syncInterval = 60000, // 1 minute
    onStatusChange,
    onSyncComplete,
  } = options

  const [state, setState] = useState<OfflineState>({
    isOnline: navigator.onLine,
    isServiceWorkerReady: false,
    isSyncing: false,
    syncQueue: 0,
    lastSyncTime: null,
    offlineDataSize: 0,
  })

  const syncTimeoutRef = useRef<NodeJS.Timeout>()
  const dbRef = useRef<IDBDatabase | null>(null)

  // Initialize IndexedDB connection
  const initDatabase = useCallback(async () => {
    try {
      const request = indexedDB.open('PMPLearningOfflineDB', 1)

      request.onsuccess = () => {
        dbRef.current = request.result
        checkOfflineDataSize()
      }

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result

        if (!db.objectStoreNames.contains('syncQueue')) {
          db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true })
        }
        if (!db.objectStoreNames.contains('offlineData')) {
          db.createObjectStore('offlineData', { keyPath: 'key' })
        }
      }
    } catch (error) {
      logger.error('Failed to initialize IndexedDB:', error)
    }
  }, [])

  // Check offline data size
  const checkOfflineDataSize = useCallback(async () => {
    if (!dbRef.current) {
      return
    }

    try {
      // Estimate storage usage
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate()
        const usageInMB = ((estimate.usage || 0) / (1024 * 1024)).toFixed(2)

        setState((prev) => ({
          ...prev,
          offlineDataSize: parseFloat(usageInMB),
        }))
      }

      // Check sync queue size
      const tx = dbRef.current.transaction(['syncQueue'], 'readonly')
      const store = tx.objectStore('syncQueue')
      const countRequest = store.count()

      countRequest.onsuccess = () => {
        setState((prev) => ({
          ...prev,
          syncQueue: countRequest.result,
        }))
      }
    } catch (error) {
      logger.error('Failed to check offline data size:', error)
    }
  }, [])

  // Register service worker
  const registerServiceWorker = useCallback(async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/PMPLearningManagement/sw.js')

        setState((prev) => ({
          ...prev,
          isServiceWorkerReady: true,
        }))

        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'activated') {
                logger.info('Service Worker updated')
                // Optionally reload the page or notify the user
              }
            })
          }
        })

        return registration
      } catch (error) {
        logger.error('Service Worker registration failed:', error)
      }
    }
  }, [])

  // Trigger background sync
  const triggerSync = useCallback(async (tag: string = 'offline-queue') => {
    if (!('serviceWorker' in navigator) || !('sync' in ServiceWorkerRegistration.prototype)) {
      logger.warn('Background sync not supported')
      return false
    }

    try {
      const registration = await navigator.serviceWorker.ready
      // @ts-expect-error - sync is not in TypeScript types yet
      await registration.sync.register(tag)

      setState((prev) => ({
        ...prev,
        isSyncing: true,
      }))

      return true
    } catch (error) {
      logger.error('Failed to trigger sync:', error)
      return false
    }
  }, [])

  // Add item to offline queue
  const addToOfflineQueue = useCallback(
    async (data: {
      url: string
      method?: string
      headers?: Record<string, string>
      body?: any
    }) => {
      if (!dbRef.current) {
        logger.error('Database not initialized')
        return false
      }

      try {
        const tx = dbRef.current.transaction(['syncQueue'], 'readwrite')
        const store = tx.objectStore('syncQueue')

        const request = store.add({
          ...data,
          timestamp: Date.now(),
          retries: 0,
        })

        return new Promise<boolean>((resolve) => {
          request.onsuccess = () => {
            checkOfflineDataSize()
            resolve(true)
          }
          request.onerror = () => {
            logger.error('Failed to add to offline queue')
            resolve(false)
          }
        })
      } catch (error) {
        logger.error('Failed to add to offline queue:', error)
        return false
      }
    },
    [checkOfflineDataSize]
  )

  // Clear offline data
  const clearOfflineData = useCallback(async () => {
    if (!dbRef.current) {
      return false
    }

    try {
      const stores = ['syncQueue', 'offlineData']

      for (const storeName of stores) {
        const tx = dbRef.current.transaction([storeName], 'readwrite')
        const store = tx.objectStore(storeName)
        await store.clear()
      }

      checkOfflineDataSize()
      return true
    } catch (error) {
      logger.error('Failed to clear offline data:', error)
      return false
    }
  }, [checkOfflineDataSize])

  // Prefetch critical data
  const prefetchData = useCallback(async (urls: string[]) => {
    if (!('serviceWorker' in navigator)) {
      return false
    }

    try {
      const controller = navigator.serviceWorker.controller
      if (controller) {
        controller.postMessage({
          type: 'CACHE_URLS',
          payload: urls,
        })
        return true
      }
      return false
    } catch (error) {
      logger.error('Failed to prefetch data:', error)
      return false
    }
  }, [])

  // Setup event listeners
  // eslint-disable-next-line react-hooks/exhaustive-deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const handleOnline = () => {
      setState((prev) => ({ ...prev, isOnline: true }))
      onStatusChange?.(true)

      if (enableAutoSync) {
        triggerSync()
      }
    }

    const handleOffline = () => {
      setState((prev) => ({ ...prev, isOnline: false }))
      onStatusChange?.(false)
    }

    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'SYNC_COMPLETE') {
        setState((prev) => ({
          ...prev,
          isSyncing: false,
          lastSyncTime: new Date(event.data.data.timestamp),
          syncQueue: 0,
        }))
        onSyncComplete?.()
        checkOfflineDataSize()
      }
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleMessage)
    }

    // Initialize
    initDatabase()
    registerServiceWorker()

    // Setup auto-sync
    if (enableAutoSync && navigator.onLine) {
      syncTimeoutRef.current = setInterval(() => {
        if (state.syncQueue > 0 && navigator.onLine) {
          triggerSync()
        }
      }, syncInterval)
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)

      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleMessage)
      }

      if (syncTimeoutRef.current) {
        clearInterval(syncTimeoutRef.current)
      }

      if (dbRef.current) {
        dbRef.current.close()
      }
    }
  }, [
    enableAutoSync,
    syncInterval,
    onStatusChange,
    onSyncComplete,
    initDatabase,
    registerServiceWorker,
    triggerSync,
    checkOfflineDataSize,
    state.syncQueue,
  ])

  return {
    ...state,
    triggerSync,
    addToOfflineQueue,
    clearOfflineData,
    prefetchData,
    checkOfflineDataSize,
  }
}

// Export convenience hooks
export function useIsOnline() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}

export function useNetworkStatus() {
  const [status, setStatus] = useState<{
    online: boolean
    effectiveType?: string
    downlink?: number
    rtt?: number
    saveData?: boolean
  }>({
    online: navigator.onLine,
  })

  useEffect(() => {
    const updateStatus = () => {
      // @ts-expect-error - connection is not standard yet
      const connection =
        navigator.connection || navigator.mozConnection || navigator.webkitConnection

      setStatus({
        online: navigator.onLine,
        effectiveType: connection?.effectiveType,
        downlink: connection?.downlink,
        rtt: connection?.rtt,
        saveData: connection?.saveData,
      })
    }

    updateStatus()

    window.addEventListener('online', updateStatus)
    window.addEventListener('offline', updateStatus)

    // @ts-expect-error - Navigator.connection is not typed in TypeScript
    if (navigator.connection) {
      // @ts-expect-error - Navigator.connection is not typed in TypeScript
      navigator.connection.addEventListener('change', updateStatus)
    }

    return () => {
      window.removeEventListener('online', updateStatus)
      window.removeEventListener('offline', updateStatus)

      // @ts-expect-error - Navigator.connection is not typed in TypeScript
      if (navigator.connection) {
        // @ts-expect-error - Navigator.connection is not typed in TypeScript
        navigator.connection.removeEventListener('change', updateStatus)
      }
    }
  }, [])

  return status
}
