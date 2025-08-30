/**
 * @file OfflineIndicator.tsx
 * @description オフライン状態を表示するインジケーターコンポーネント
 * @author Developer 6 (mobile-app-developer) - PWA/モバイル開発
 * @created 2025-08-30
 */

import React, { useEffect, useState } from 'react'
import { WifiOff, Wifi, CloudOff, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface OfflineIndicatorProps {
  className?: string
  showDetails?: boolean
}

export function OfflineIndicator({ className, showDetails = false }: OfflineIndicatorProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [syncPending, setSyncPending] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      // Trigger background sync when coming online
      if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
        navigator.serviceWorker.ready.then((registration: ServiceWorkerRegistration) => {
          // @ts-ignore - sync is not in TypeScript types yet
          registration.sync.register('offline-queue')
        })
      }
    }

    const handleOffline = () => {
      setIsOnline(false)
      setSyncPending(true)
    }

    // Service Worker message handler
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'SYNC_COMPLETE') {
        setSyncPending(false)
        setLastSyncTime(new Date(event.data.data.timestamp))
      }
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleMessage)
    }

    // Check connection quality
    const checkConnection = () => {
      // @ts-ignore - connection is not standard yet
      const connection =
        navigator.connection || navigator.mozConnection || navigator.webkitConnection
      if (connection) {
        // Check for slow connections
        if (connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g') {
          console.warn('Slow connection detected:', connection.effectiveType)
        }
      }
    }

    checkConnection()
    const interval = setInterval(checkConnection, 30000) // Check every 30 seconds

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleMessage)
      }
      clearInterval(interval)
    }
  }, [])

  if (isOnline && !syncPending && !showDetails) {
    return null // Don't show indicator when online and no sync pending
  }

  return (
    <div
      className={cn(
        'fixed bottom-20 left-4 z-50 flex items-center gap-2 rounded-lg px-3 py-2 shadow-lg transition-all',
        isOnline
          ? syncPending
            ? 'bg-yellow-500 text-white'
            : 'bg-green-500 text-white'
          : 'bg-red-500 text-white',
        className
      )}
    >
      {isOnline ? (
        syncPending ? (
          <>
            <RefreshCw className='h-4 w-4 animate-spin' />
            <span className='text-sm font-medium'>同期中...</span>
          </>
        ) : (
          <>
            <Wifi className='h-4 w-4' />
            <span className='text-sm font-medium'>オンライン</span>
          </>
        )
      ) : (
        <>
          <WifiOff className='h-4 w-4' />
          <span className='text-sm font-medium'>オフライン</span>
        </>
      )}

      {showDetails && (
        <div className='ml-2 text-xs opacity-90'>
          {!isOnline && <div>データは自動的に保存されます</div>}
          {syncPending && <div>オンライン復帰時に同期されます</div>}
          {lastSyncTime && <div>最終同期: {lastSyncTime.toLocaleTimeString('ja-JP')}</div>}
        </div>
      )}
    </div>
  )
}

export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setShowBanner(true)
      setTimeout(() => setShowBanner(false), 3000)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowBanner(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Initial check
    if (!navigator.onLine) {
      setShowBanner(true)
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (!showBanner) {
    return null
  }

  return (
    <div
      className={cn(
        'fixed left-0 right-0 top-0 z-[100] flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition-all',
        isOnline ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'
      )}
    >
      {isOnline ? (
        <>
          <Wifi className='h-4 w-4' />
          <span>インターネット接続が復旧しました</span>
        </>
      ) : (
        <>
          <CloudOff className='h-4 w-4' />
          <span>オフラインモードで動作中 - データは自動保存されます</span>
        </>
      )}
    </div>
  )
}
