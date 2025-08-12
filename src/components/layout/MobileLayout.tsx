'use client'

import React, { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import MobileNavigation from './MobileNavigation'
import { pwaManager, isMobile, isStandalone } from '@/lib/pwa'
import { Button } from '@/components/ui/button'
import { Download, X, Wifi, WifiOff } from 'lucide-react'

interface MobileLayoutProps {
  children: React.ReactNode
}

export function MobileLayout({ children }: MobileLayoutProps) {
  const pathname = usePathname()
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [showOfflineBanner, setShowOfflineBanner] = useState(false)

  useEffect(() => {
    // Check if can show install prompt
    if (isMobile() && !isStandalone()) {
      const timer = setTimeout(() => {
        if (pwaManager.canInstall()) {
          setShowInstallPrompt(true)
        }
      }, 3000) // Show after 3 seconds

      return () => clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    // Monitor online/offline status
    const handleOnline = () => {
      setIsOnline(true)
      setShowOfflineBanner(false)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowOfflineBanner(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Check initial state
    setIsOnline(navigator.onLine)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleInstallApp = async () => {
    const installed = await pwaManager.installApp()
    if (installed) {
      setShowInstallPrompt(false)
    }
  }

  const handleDismissInstall = () => {
    setShowInstallPrompt(false)
    // Don't show again for this session
    sessionStorage.setItem('installPromptDismissed', 'true')
  }

  const hideBottomNav = pathname?.startsWith('/exam') || pathname?.includes('/fullscreen')

  return (
    <div className="flex h-screen flex-col bg-gray-50 dark:bg-gray-900">
      {/* Offline Banner */}
      {showOfflineBanner && (
        <div className="flex items-center justify-between bg-orange-600 px-4 py-2 text-sm text-white">
          <div className="flex items-center space-x-2">
            <WifiOff className="h-4 w-4" />
            <span>オフラインモード - 一部機能が制限されます</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowOfflineBanner(false)}
            className="h-6 w-6 text-white hover:bg-orange-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Install App Banner */}
      {showInstallPrompt && (
        <div className="bg-blue-600 px-4 py-3 text-white">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium">ホーム画面に追加</p>
              <p className="text-xs opacity-90">
                より快適に利用するためアプリをインストールしてください
              </p>
            </div>
            <div className="ml-3 flex items-center space-x-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleInstallApp}
                className="text-blue-600"
              >
                <Download className="mr-1 h-4 w-4" />
                追加
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDismissInstall}
                className="h-6 w-6 text-white hover:bg-blue-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation for mobile */}
      <MobileNavigation />

      {/* Main Content */}
      <main
        className={`
          flex-1 overflow-hidden
          ${!hideBottomNav ? 'pb-16' : ''} /* Account for bottom nav */
          /* Account for top nav on mobile */ /*
          Reset padding on desktop */ pt-14 lg:pb-0 lg:pt-0
        `}
      >
        {children}
      </main>

      {/* Network Status Indicator */}
      <div className="fixed right-4 top-16 z-30 lg:hidden">
        <div
          className={`
          rounded-full p-1 transition-colors
          ${
            isOnline
              ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
              : 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'
          }
        `}
        >
          {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
        </div>
      </div>

      {/* Safe area adjustments for iOS */}
      <style>{`
        .safe-area-top {
          padding-top: env(safe-area-inset-top);
        }

        .safe-area-bottom {
          padding-bottom: env(safe-area-inset-bottom);
        }

        .safe-area-left {
          padding-left: env(safe-area-inset-left);
        }

        .safe-area-right {
          padding-right: env(safe-area-inset-right);
        }

        /* Prevent zoom on input focus */
        @media screen and (max-width: 768px) {
          input,
          select,
          textarea {
            font-size: 16px !important;
          }
        }

        /* Smooth scroll behavior */
        html {
          scroll-behavior: smooth;
        }

        /* Hide scrollbar on mobile for better UX */
        @media (max-width: 768px) {
          ::-webkit-scrollbar {
            display: none;
          }

          * {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        }

        /* Touch-friendly tap targets */
        button,
        a,
        input,
        select,
        textarea {
          min-height: 44px;
          min-width: 44px;
        }

        /* Prevent text selection on touch */
        .touch-none {
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          -khtml-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }

        /* Prevent pull-to-refresh on body */
        body {
          overscroll-behavior: none;
        }

        /* Viewport height for mobile browsers */
        .min-h-screen-mobile {
          min-height: 100vh;
          min-height: -webkit-fill-available;
        }

        /* Fix for mobile viewport units */
        @supports (-webkit-touch-callout: none) {
          .h-screen {
            height: -webkit-fill-available;
          }
        }

        /* Disable text size adjust on mobile */
        html {
          -webkit-text-size-adjust: 100%;
          -moz-text-size-adjust: 100%;
          -ms-text-size-adjust: 100%;
        }
      `}</style>
    </div>
  )
}

export default MobileLayout
