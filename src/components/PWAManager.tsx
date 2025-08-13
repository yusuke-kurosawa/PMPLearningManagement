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
          if (process.env.NODE_ENV === 'development') {
            console.warn('SW registered: ', registration)
          }
        })
        .catch((registrationError) => {
          if (process.env.NODE_ENV === 'development') {
            console.error('SW registration failed: ', registrationError)
          }
        })
    }
  }, [])

  // This component doesn't render anything
  return null
}
