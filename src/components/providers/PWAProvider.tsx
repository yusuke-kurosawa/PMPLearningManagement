/**
 * PWA Provider for managing Progressive Web App features
 * Developer 6: PWA & Mobile Developer Implementation
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { logger } from '../../services/logger'
import {
  getInstallPromptManager,
  PWAInstallPromptManager,
  InstallPromptState,
} from '../../lib/pwa/installPrompt'
import { useToast } from '../../hooks/use-toast'

interface PWAContextType {
  // Install state
  canInstall: boolean
  isInstalled: boolean
  isStandalone: boolean
  installationScore: number

  // Network state
  isOnline: boolean
  connectionType: string
  saveData: boolean

  // App state
  isUpdateAvailable: boolean
  isUpdating: boolean

  // Capabilities
  capabilities: {
    hasNotifications: boolean
    hasPushNotifications: boolean
    hasBackgroundSync: boolean
    hasPeriodicBackgroundSync: boolean
    hasShare: boolean
    hasVibration: boolean
    hasWakeLock: boolean
    hasBatteryAPI: boolean
    hasStorageQuota: boolean
    hasFileSystemAccess: boolean
  }

  // Methods
  installApp: () => Promise<'accepted' | 'dismissed' | 'unavailable'>
  dismissInstallPrompt: () => void
  updateApp: () => Promise<void>
  requestNotificationPermission: () => Promise<boolean>
  shareApp: (data?: ShareData) => Promise<boolean>
  vibrate: (pattern?: number | number[]) => void
  requestWakeLock: () => Promise<void>
  releaseWakeLock: () => void
  getStorageUsage: () => Promise<StorageEstimate | null>
  registerForPush: () => Promise<PushSubscription | null>
  syncWhenOnline: (data: unknown, endpoint: string) => void
}

interface PWAProviderProps {
  children: ReactNode
  config?: {
    enableInstallPrompt?: boolean
    enableUpdatePrompt?: boolean
    enablePushNotifications?: boolean
    enableBackgroundSync?: boolean
    enablePeriodicSync?: boolean
    syncInterval?: number
    offlineStorageQuota?: number
  }
}

const PWAContext = createContext<PWAContextType | null>(null)

export const usePWA = (): PWAContextType => {
  const context = useContext(PWAContext)
  if (!context) {
    throw new Error('usePWA must be used within a PWAProvider')
  }
  return context
}

export const PWAProvider: React.FC<PWAProviderProps> = ({ children, config = {} }) => {
  const { toast } = useToast()

  // State
  const [installManager] = useState(() => getInstallPromptManager())
  const [installState, setInstallState] = useState<InstallPromptState>(installManager.getState())
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [connectionType, setConnectionType] = useState('unknown')
  const [saveData, setSaveData] = useState(false)
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [serviceWorkerReg, setServiceWorkerReg] = useState<ServiceWorkerRegistration | null>(null)
  const [wakeLock, setWakeLock] = useState<WakeLockSentinel | null>(null)
  const [offlineQueue, setOfflineQueue] = useState<
    Array<{ data: unknown; endpoint: string; timestamp: number }>
  >([])

  // Default config
  const defaultConfig = {
    enableInstallPrompt: true,
    enableUpdatePrompt: true,
    enablePushNotifications: false,
    enableBackgroundSync: true,
    enablePeriodicSync: false,
    syncInterval: 300000, // 5 minutes
    offlineStorageQuota: 50 * 1024 * 1024, // 50MB
    ...config,
  }

  // Capabilities detection
  const capabilities = {
    hasNotifications: 'Notification' in window,
    hasPushNotifications: 'PushManager' in window && 'serviceWorker' in navigator,
    hasBackgroundSync:
      'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype,
    hasPeriodicBackgroundSync:
      'serviceWorker' in navigator && 'periodicSync' in window.ServiceWorkerRegistration.prototype,
    hasShare: 'share' in navigator,
    hasVibration: 'vibrate' in navigator,
    hasWakeLock: 'wakeLock' in navigator,
    hasBatteryAPI: 'getBattery' in navigator,
    hasStorageQuota: 'storage' in navigator && 'estimate' in navigator.storage,
    hasFileSystemAccess: 'showOpenFilePicker' in window,
  }

  useEffect(() => {
    initializePWA()
    setupEventListeners()

    return () => {
      cleanup()
    }
  }, [])

  const initializePWA = async () => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none',
        })

        setServiceWorkerReg(registration)

        // Check for updates
        if (defaultConfig.enableUpdatePrompt) {
          checkForUpdates(registration)
        }

        // Setup background sync
        if (defaultConfig.enableBackgroundSync && capabilities.hasBackgroundSync) {
          setupBackgroundSync(registration)
        }

        // Setup periodic sync
        if (defaultConfig.enablePeriodicSync && capabilities.hasPeriodicBackgroundSync) {
          setupPeriodicSync(registration)
        }

        if (process.env.NODE_ENV === 'development') {
          logger.debug('PWA: Service Worker registered successfully')
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          logger.error('PWA: Service Worker registration failed:', error)
        }
      }
    }

    // Initialize install prompt manager
    if (defaultConfig.enableInstallPrompt) {
      installManager.onStateChange(setInstallState)
      installManager.onInstalled(() => {
        toast({
          title: 'App Installed',
          description: 'PMP Learning Management is now installed on your device!',
        })
      })
    }

    // Initialize network monitoring
    updateNetworkInfo()

    // Load offline queue
    loadOfflineQueue()
  }

  const setupEventListeners = () => {
    // Network status
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Connection change (mobile)
    if ('connection' in navigator) {
      ;(navigator as any).connection.addEventListener('change', updateNetworkInfo)
    }

    // Visibility change for wake lock management
    document.addEventListener('visibilitychange', handleVisibilityChange)
  }

  const cleanup = () => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)

    if ('connection' in navigator) {
      ;(navigator as any).connection.removeEventListener('change', updateNetworkInfo)
    }

    document.removeEventListener('visibilitychange', handleVisibilityChange)

    // Release wake lock
    if (wakeLock) {
      wakeLock.release()
    }

    // Destroy install manager
    installManager.destroy()
  }

  const checkForUpdates = (registration: ServiceWorkerRegistration) => {
    // Check for updates immediately
    registration.update()

    // Listen for new service worker
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            setIsUpdateAvailable(true)

            toast({
              title: 'Update Available',
              description: 'A new version of the app is available. Tap to update.',
              action: {
                altText: 'Update',
                onClick: updateApp,
              },
            })
          }
        })
      }
    })

    // Check for updates periodically
    setInterval(() => {
      registration.update()
    }, 60000) // Every minute
  }

  const setupBackgroundSync = (registration: ServiceWorkerRegistration) => {
    // Register background sync for offline queue
    if (offlineQueue.length > 0) {
      registration.sync.register('background-sync-offline-queue')
    }
  }

  const setupPeriodicSync = async (registration: ServiceWorkerRegistration) => {
    try {
      // Request permission for periodic background sync
      const status = await navigator.permissions.query({ name: 'periodic-background-sync' as any })

      if (status.state === 'granted' && 'periodicSync' in registration) {
        await (registration as any).periodicSync.register('content-sync', {
          minInterval: defaultConfig.syncInterval,
        })
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.debug('PWA: Periodic background sync not supported or permission denied')
      }
    }
  }

  const handleOnline = () => {
    setIsOnline(true)
    updateNetworkInfo()
    processOfflineQueue()

    toast({
      title: 'Back Online',
      description: 'Syncing your data...',
    })
  }

  const handleOffline = () => {
    setIsOnline(false)

    toast({
      title: "You're Offline",
      description: "Your progress will be saved locally and synced when you're back online.",
      variant: 'destructive',
    })
  }

  const handleVisibilityChange = () => {
    if (document.hidden && wakeLock) {
      // Release wake lock when app goes to background
      wakeLock.release()
      setWakeLock(null)
    }
  }

  const updateNetworkInfo = () => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      setConnectionType(connection.effectiveType || 'unknown')
      setSaveData(connection.saveData || false)
    }
  }

  const loadOfflineQueue = () => {
    try {
      const stored = localStorage.getItem('pwa-offline-queue')
      if (stored) {
        setOfflineQueue(JSON.parse(stored))
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('PWA: Failed to load offline queue:', error)
      }
    }
  }

  const saveOfflineQueue = (queue: typeof offlineQueue) => {
    try {
      localStorage.setItem('pwa-offline-queue', JSON.stringify(queue))
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('PWA: Failed to save offline queue:', error)
      }
    }
  }

  const processOfflineQueue = async () => {
    if (offlineQueue.length === 0) return

    const processedItems: number[] = []

    for (let i = 0; i < offlineQueue.length; i++) {
      const item = offlineQueue[i]

      try {
        await fetch(item.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(item.data),
        })

        processedItems.push(i)
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          logger.error('PWA: Failed to sync offline item:', error)
        }
        // Keep items that failed to sync
      }
    }

    // Remove successfully processed items
    const newQueue = offlineQueue.filter((_, index) => !processedItems.includes(index))
    setOfflineQueue(newQueue)
    saveOfflineQueue(newQueue)

    if (processedItems.length > 0) {
      toast({
        title: 'Data Synced',
        description: `${processedItems.length} offline changes have been synced.`,
      })
    }
  }

  // Public methods
  const installApp = async (): Promise<'accepted' | 'dismissed' | 'unavailable'> => {
    return installManager.showInstallPrompt()
  }

  const dismissInstallPrompt = () => {
    installManager.dismissPrompt()
  }

  const updateApp = async (): Promise<void> => {
    if (!serviceWorkerReg) return

    setIsUpdating(true)

    try {
      // Skip waiting for the new service worker
      if (serviceWorkerReg.waiting) {
        serviceWorkerReg.waiting.postMessage({ type: 'SKIP_WAITING' })

        // Wait for the new service worker to take control
        await new Promise<void>((resolve) => {
          navigator.serviceWorker.addEventListener(
            'controllerchange',
            () => {
              resolve()
            },
            { once: true }
          )
        })

        // Reload the page to get the new version
        window.location.reload()
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('PWA: Failed to update app:', error)
      }
      toast({
        title: 'Update Failed',
        description: 'Please refresh the page manually to get the latest version.',
        variant: 'destructive',
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const requestNotificationPermission = async (): Promise<boolean> => {
    if (!capabilities.hasNotifications) return false

    try {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('PWA: Failed to request notification permission:', error)
      }
      return false
    }
  }

  const shareApp = async (data?: ShareData): Promise<boolean> => {
    if (!capabilities.hasShare) {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href)
        toast({
          title: 'Link Copied',
          description: 'App link copied to clipboard',
        })
        return true
      } catch (error) {
        return false
      }
    }

    try {
      await navigator.share(
        data || {
          title: 'PMP Learning Management',
          text: 'Check out this awesome PMP study app!',
          url: window.location.href,
        }
      )
      return true
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        if (process.env.NODE_ENV === 'development') {
          logger.error('PWA: Share failed:', error)
        }
      }
      return false
    }
  }

  const vibrate = (pattern: number | number[] = 200): void => {
    if (capabilities.hasVibration) {
      navigator.vibrate(pattern)
    }
  }

  const requestWakeLock = async (): Promise<void> => {
    if (!capabilities.hasWakeLock || wakeLock) return

    try {
      const lock = await (navigator as any).wakeLock.request('screen')
      setWakeLock(lock)

      lock.addEventListener('release', () => {
        setWakeLock(null)
        if (process.env.NODE_ENV === 'development') {
          logger.debug('PWA: Wake lock released')
        }
      })

      if (process.env.NODE_ENV === 'development') {
        logger.debug('PWA: Wake lock acquired')
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('PWA: Failed to acquire wake lock:', error)
      }
    }
  }

  const releaseWakeLock = (): void => {
    if (wakeLock) {
      wakeLock.release()
      setWakeLock(null)
    }
  }

  const getStorageUsage = async (): Promise<StorageEstimate | null> => {
    if (!capabilities.hasStorageQuota) return null

    try {
      return await navigator.storage.estimate()
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('PWA: Failed to get storage usage:', error)
      }
      return null
    }
  }

  const registerForPush = async (): Promise<PushSubscription | null> => {
    if (!capabilities.hasPushNotifications || !serviceWorkerReg) return null

    try {
      const subscription = await serviceWorkerReg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.REACT_APP_VAPID_PUBLIC_KEY,
      })

      // Send subscription to server
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription),
      })

      return subscription
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('PWA: Failed to register for push notifications:', error)
      }
      return null
    }
  }

  const syncWhenOnline = (data: unknown, endpoint: string): void => {
    if (isOnline) {
      // Try to sync immediately
      fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }).catch(() => {
        // If immediate sync fails, add to queue
        addToOfflineQueue(data, endpoint)
      })
    } else {
      // Add to offline queue
      addToOfflineQueue(data, endpoint)
    }
  }

  const addToOfflineQueue = (data: unknown, endpoint: string) => {
    const newQueue = [
      ...offlineQueue,
      {
        data,
        endpoint,
        timestamp: Date.now(),
      },
    ]

    setOfflineQueue(newQueue)
    saveOfflineQueue(newQueue)

    // Register background sync if available
    if (capabilities.hasBackgroundSync && serviceWorkerReg) {
      serviceWorkerReg.sync.register('background-sync-offline-queue')
    }
  }

  const contextValue: PWAContextType = {
    // Install state
    canInstall: installState.canInstall,
    isInstalled: installState.isInstalled,
    isStandalone: installState.isStandalone,
    installationScore: installManager.getInstallationScore(),

    // Network state
    isOnline,
    connectionType,
    saveData,

    // App state
    isUpdateAvailable,
    isUpdating,

    // Capabilities
    capabilities,

    // Methods
    installApp,
    dismissInstallPrompt,
    updateApp,
    requestNotificationPermission,
    shareApp,
    vibrate,
    requestWakeLock,
    releaseWakeLock,
    getStorageUsage,
    registerForPush,
    syncWhenOnline,
  }

  return <PWAContext.Provider value={contextValue}>{children}</PWAContext.Provider>
}

export default PWAProvider
