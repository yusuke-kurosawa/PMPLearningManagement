import { logger } from '../services/logger'

// 型定義の追加
interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean
}

interface WindowWithVisualViewport extends Window {
  visualViewport?: {
    height: number
  }
}

// PWA utilities and service worker management

export interface PWAInstallPrompt {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: Event & {
      preventDefault(): void
      prompt(): Promise<void>
      userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
    }
  }
}

class PWAManager {
  private deferredPrompt: PWAInstallPrompt | null = null
  private isInstalled = false
  private registration: ServiceWorkerRegistration | null = null

  constructor() {
    if (typeof window !== 'undefined') {
      this.init()
    }
  }

  private async init() {
    // Check if already installed
    this.checkInstallStatus()

    // Listen for install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      this.deferredPrompt = e as PWAInstallPrompt
    })

    // Listen for app installed
    window.addEventListener('appinstalled', () => {
      this.isInstalled = true
      this.deferredPrompt = null
    })

    // Register service worker
    await this.registerServiceWorker()
  }

  private checkInstallStatus() {
    // Check if app is installed
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as NavigatorWithStandalone).standalone === true
    ) {
      this.isInstalled = true
    }
  }

  async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if ('serviceWorker' in navigator) {
      try {
        this.registration = await navigator.serviceWorker.register('/sw.js')

        if (process.env.NODE_ENV === 'development') {
          logger.debug('Service Worker registered successfully:', this.registration)
        }

        // Handle updates
        this.registration.addEventListener('updatefound', () => {
          const newWorker = this.registration?.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New content is available
                this.showUpdateNotification()
              }
            })
          }
        })

        return this.registration
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          logger.error('Service Worker registration failed:', error)
        }
        return null
      }
    }
    return null
  }

  async installApp(): Promise<boolean> {
    if (!this.deferredPrompt) {
      return false
    }

    try {
      await this.deferredPrompt.prompt()
      const { outcome } = await this.deferredPrompt.userChoice

      if (outcome === 'accepted') {
        this.isInstalled = true
        this.deferredPrompt = null
        return true
      }

      return false
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('Error installing PWA:', error)
      }
      return false
    }
  }

  canInstall(): boolean {
    return !!this.deferredPrompt && !this.isInstalled
  }

  isAppInstalled(): boolean {
    return this.isInstalled
  }

  private showUpdateNotification() {
    // You can customize this notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('アップデートが利用可能です', {
        body: '新しいバージョンが利用可能です。再読み込みしてください。',
        icon: '/icon-192x192.png',
        tag: 'app-update',
      })
    }
  }

  async requestNotificationPermission(): Promise<NotificationPermission> {
    if ('Notification' in window) {
      return await Notification.requestPermission()
    }
    return 'denied'
  }

  async subscribeToNotifications(): Promise<PushSubscription | null> {
    if (!this.registration || !('PushManager' in window)) {
      return null
    }

    try {
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_KEY || ''),
      })

      return subscription
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('Error subscribing to notifications:', error)
      }
      return null
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  async updateServiceWorker(): Promise<void> {
    if (this.registration) {
      await this.registration.update()
      window.location.reload()
    }
  }

  // Offline storage management
  async cacheUserData(key: string, data: unknown): Promise<void> {
    if ('caches' in window) {
      try {
        const cache = await caches.open('user-data')
        const response = new Response(JSON.stringify(data))
        await cache.put(key, response)
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          logger.error('Error caching user data:', error)
        }
      }
    }
  }

  async getCachedUserData(key: string): Promise<unknown | null> {
    if ('caches' in window) {
      try {
        const cache = await caches.open('user-data')
        const response = await cache.match(key)
        if (response) {
          return await response.json()
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          logger.error('Error retrieving cached data:', error)
        }
      }
    }
    return null
  }

  // Background sync
  async syncWhenOnline(tag: string, data?: unknown): Promise<void> {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready

        // Store data to sync later if provided
        if (data) {
          await this.cacheUserData(`sync-${tag}`, data)
        }

        await registration.sync.register(tag)
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          logger.error('Background sync registration failed:', error)
        }
      }
    }
  }
}

// Singleton instance
export const pwaManager = new PWAManager()

// Utility functions for mobile-specific features
export const isMobile = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

export const isIOS = (): boolean => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
}

export const isAndroid = (): boolean => {
  return /Android/.test(navigator.userAgent)
}

export const isStandalone = (): boolean => {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  )
}

export const getViewportHeight = (): number => {
  return window.visualViewport?.height || window.innerHeight
}

export const addToHomeScreen = {
  isSupported: () => pwaManager.canInstall(),
  install: () => pwaManager.installApp(),
  isInstalled: () => pwaManager.isAppInstalled(),
}

export default pwaManager
