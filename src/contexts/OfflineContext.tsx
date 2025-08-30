/**
 * @file OfflineContext.tsx
 * @description オフライン機能のコンテキストプロバイダー
 * @author Developer 9 (frontend-developer) - React/状態管理
 * @created 2025-08-30
 */

import React, { createContext, useContext, ReactNode } from 'react'
import { useOffline } from '@/hooks/useOffline'
import { OfflineIndicator, OfflineBanner } from '@/components/offline/OfflineIndicator'

interface OfflineContextValue {
  isOnline: boolean
  isServiceWorkerReady: boolean
  isSyncing: boolean
  syncQueue: number
  lastSyncTime: Date | null
  offlineDataSize: number
  triggerSync: (tag?: string) => Promise<boolean>
  addToOfflineQueue: (data: {
    url: string
    method?: string
    headers?: Record<string, string>
    body?: unknown
  }) => Promise<boolean>
  clearOfflineData: () => Promise<boolean>
  prefetchData: (urls: string[]) => Promise<boolean>
}

const OfflineContext = createContext<OfflineContextValue | null>(null)

interface OfflineProviderProps {
  children: ReactNode
  showIndicator?: boolean
  showBanner?: boolean
  enableAutoSync?: boolean
  syncInterval?: number
}

export function OfflineProvider({
  children,
  showIndicator = true,
  showBanner = true,
  enableAutoSync = true,
  syncInterval = 60000,
}: OfflineProviderProps) {
  const offline = useOffline({
    enableAutoSync,
    syncInterval,
    onStatusChange: (isOnline) => {
      console.log('Network status changed:', isOnline ? 'Online' : 'Offline')
    },
    onSyncComplete: () => {
      console.log('Background sync completed')
    },
  })

  // Prefetch critical data on mount
  React.useEffect(() => {
    const criticalUrls = [
      '/PMPLearningManagement/data/pmbok-processes.json',
      '/PMPLearningManagement/data/glossary.json',
      '/PMPLearningManagement/data/exam-questions.json',
    ]

    offline.prefetchData(criticalUrls)
  }, [offline])

  return (
    <OfflineContext.Provider value={offline}>
      {showBanner && <OfflineBanner />}
      {showIndicator && <OfflineIndicator />}
      {children}
    </OfflineContext.Provider>
  )
}

export function useOfflineContext() {
  const context = useContext(OfflineContext)
  if (!context) {
    throw new Error('useOfflineContext must be used within OfflineProvider')
  }
  return context
}

// Utility components for offline-aware features
export function OfflineAware({
  children,
  fallback,
}: {
  children: ReactNode
  fallback?: ReactNode
}) {
  const { isOnline } = useOfflineContext()

  if (!isOnline && fallback) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

export function OnlineOnly({ children }: { children: ReactNode }) {
  const { isOnline } = useOfflineContext()

  if (!isOnline) {
    return (
      <div className='flex flex-col items-center justify-center p-8 text-center'>
        <div className='mb-4 text-6xl'>📵</div>
        <h3 className='mb-2 text-lg font-semibold'>オフラインでは利用できません</h3>
        <p className='text-sm text-muted-foreground'>
          この機能を使用するにはインターネット接続が必要です
        </p>
      </div>
    )
  }

  return <>{children}</>
}

export function OfflineReady({
  children,
  loadingMessage = 'データを準備中...',
}: {
  children: ReactNode
  loadingMessage?: string
}) {
  const { isServiceWorkerReady } = useOfflineContext()

  if (!isServiceWorkerReady) {
    return (
      <div className='flex items-center justify-center p-8'>
        <div className='text-center'>
          <div className='mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent' />
          <p className='text-sm text-muted-foreground'>{loadingMessage}</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

// Hook for offline-aware data fetching
export function useOfflineFetch<T>(
  url: string,
  options?: RequestInit
): {
  data: T | null
  error: Error | null
  isLoading: boolean
  refetch: () => void
} {
  const { isOnline, addToOfflineQueue } = useOfflineContext()
  const [data, setData] = React.useState<T | null>(null)
  const [error, setError] = React.useState<Error | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)

  const fetchData = React.useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      if (!isOnline && options?.method && options.method !== 'GET') {
        // Queue non-GET requests for later
        await addToOfflineQueue({
          url,
          method: options.method,
          headers: options.headers as Record<string, string>,
          body: options.body,
        })

        // Return cached data if available
        const cachedData = localStorage.getItem(`offline_cache_${url}`)
        if (cachedData) {
          setData(JSON.parse(cachedData))
        }
      } else {
        const response = await fetch(url, options)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()
        setData(result)

        // Cache the data for offline use
        localStorage.setItem(`offline_cache_${url}`, JSON.stringify(result))
      }
    } catch (err) {
      setError(err as Error)

      // Try to use cached data on error
      const cachedData = localStorage.getItem(`offline_cache_${url}`)
      if (cachedData) {
        setData(JSON.parse(cachedData))
        setError(null) // Clear error if we have cached data
      }
    } finally {
      setIsLoading(false)
    }
  }, [url, options, isOnline, addToOfflineQueue])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, error, isLoading, refetch: fetchData }
}
