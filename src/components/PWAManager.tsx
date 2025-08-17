/**
 * PWA・モバイル機能実装
 * Developer 6: PWA & Mobile Developer
 * 機能: Service Worker, Cache API, Push Notifications
 * プラットフォーム: Progressive Web App
 * 最終更新: {updated}
 */
'use client'

import { useEffect } from 'react'
import { pwaManager } from '@/lib/pwa'

export function PWAManager() {
  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      pwaManager
        .registerServiceWorker()
        .then((registration) => {
          console.warn('SW registered: ', registration)
        })
        .catch((registrationError) => {
          console.error('SW registration failed: ', registrationError)
        })
    }
  }, [])

  // This component doesn't render anything
  return null
}
