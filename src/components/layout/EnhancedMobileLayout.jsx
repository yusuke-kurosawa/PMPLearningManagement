/**
 * ファイル説明: {description}
 * 開発者: {developer}
 * 専門分野: {specialization}
 * 作成日: {created}
 * 最終更新: {updated}
 * 依存関係: {dependencies}
 * セキュリティレベル: {security_level}
 */ import React, { useState, useRef } from 'react'
import MobileBottomNavigation from './MobileBottomNavigation'

const EnhancedMobileLayout = ({ children }) => {
  const [pullToRefreshState, setPullToRefreshState] = useState('idle') // idle, pulling, triggered
  const [pullDistance, setPullDistance] = useState(0)
  const [startY, setStartY] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const containerRef = useRef(null)
  const startTimeRef = useRef(0)

  const PULL_THRESHOLD = 80
  const MAX_PULL_DISTANCE = 120

  // Pull-to-refresh handlers
  const handleTouchStart = (e) => {
    if (window.scrollY === 0) {
      setStartY(e.touches[0].clientY)
      startTimeRef.current = Date.now()
    }
  }

  const handleTouchMove = (e) => {
    if (window.scrollY > 0 || startY === 0) return

    const currentY = e.touches[0].clientY
    const diff = currentY - startY

    if (diff > 0) {
      e.preventDefault()
      const distance = Math.min(diff * 0.5, MAX_PULL_DISTANCE)
      setPullDistance(distance)

      if (distance > PULL_THRESHOLD && pullToRefreshState !== 'triggered') {
        setPullToRefreshState('triggered')
        // Haptic feedback if available
        if (navigator.vibrate) {
          navigator.vibrate(10)
        }
      } else if (distance <= PULL_THRESHOLD && pullToRefreshState === 'triggered') {
        setPullToRefreshState('pulling')
      } else if (distance > 10 && pullToRefreshState === 'idle') {
        setPullToRefreshState('pulling')
      }
    }
  }

  const handleTouchEnd = async () => {
    if (pullToRefreshState === 'triggered' && !isRefreshing) {
      setIsRefreshing(true)

      // Simulate refresh action
      try {
        await new Promise((resolve) => setTimeout(resolve, 1500))
        // Trigger page refresh or reload data
        window.location.reload()
      } catch (error) {
        console.error('Refresh failed:', error)
      } finally {
        setIsRefreshing(false)
      }
    }

    // Reset states
    setPullDistance(0)
    setPullToRefreshState('idle')
    setStartY(0)
  }

  // Swipe navigation
  const [swipeStart, setSwipeStart] = useState(null)
  const swipeThreshold = 50

  const handleSwipeStart = (e) => {
    setSwipeStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now(),
    })
  }

  const handleSwipeEnd = (e) => {
    if (!swipeStart) return

    const swipeEnd = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY,
      time: Date.now(),
    }

    const deltaX = swipeEnd.x - swipeStart.x
    const deltaY = swipeEnd.y - swipeStart.y
    const deltaTime = swipeEnd.time - swipeStart.time

    // Only consider horizontal swipes
    if (
      Math.abs(deltaX) > Math.abs(deltaY) &&
      Math.abs(deltaX) > swipeThreshold &&
      deltaTime < 500
    ) {
      if (deltaX > 0) {
        // Swipe right - go back
        if (window.history.length > 1) {
          window.history.back()
        }
      } else {
        // Swipe left - could implement forward navigation or menu
        // For now, we'll just add a subtle vibration
        if (navigator.vibrate) {
          navigator.vibrate(5)
        }
      }
    }

    setSwipeStart(null)
  }

  // Double tap to scroll to top
  const [lastTap, setLastTap] = useState(0)

  const handleDoubleTap = (_e) => {
    const now = Date.now()
    const DOUBLE_TAP_DELAY = 300

    if (now - lastTap < DOUBLE_TAP_DELAY) {
      // Double tap detected - scroll to top
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      })

      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate([10, 50, 10])
      }
    }

    setLastTap(now)
  }

  // Render pull-to-refresh indicator
  const renderPullToRefreshIndicator = () => {
    if (pullDistance === 0) return null

    const progress = Math.min(pullDistance / PULL_THRESHOLD, 1)
    const rotation = progress * 360

    return (
      <div
        className="fixed left-0 right-0 top-0 z-50 flex justify-center transition-all duration-200"
        style={{
          transform: `translateY(${Math.min(pullDistance - 60, 0)}px)`,
          opacity: pullDistance > 10 ? 1 : 0,
        }}
      >
        <div className="mt-safe-area-inset-top rounded-full bg-white p-3 shadow-lg dark:bg-gray-800">
          {isRefreshing ? (
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          ) : (
            <div
              className={`h-6 w-6 transition-all duration-200 ${
                pullToRefreshState === 'triggered' ? 'text-green-500' : 'text-gray-400'
              }`}
              style={{ transform: `rotate(${rotation}deg)` }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 4 23 10 17 10"></polyline>
                <polyline points="1 20 1 14 7 14"></polyline>
                <path d="m20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
              </svg>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gray-50 dark:bg-gray-900"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull to refresh indicator */}
      {renderPullToRefreshIndicator()}

      {/* Top safe area */}
      <div className="h-safe-area-inset-top bg-white dark:bg-gray-800" />

      {/* Main content with swipe gestures */}
      <main
        className="pb-safe-area-inset-bottom"
        onTouchStart={handleSwipeStart}
        onTouchEnd={(e) => {
          handleSwipeEnd(e)
          handleDoubleTap(e)
        }}
      >
        {children}
      </main>

      {/* Mobile bottom navigation */}
      <MobileBottomNavigation />

      {/* Swipe indicator overlay */}
      <div className="pointer-events-none fixed bottom-4 left-4 right-4">
        <div className="text-center text-xs text-gray-400 dark:text-gray-500">
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 shadow-sm dark:bg-gray-800">
            <span>← スワイプで戻る</span>
            <span>•</span>
            <span>ダブルタップで上部へ</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EnhancedMobileLayout
