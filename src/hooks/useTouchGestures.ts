import { useEffect, useRef, useState } from 'react'

interface SwipeHandlers {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  onPinchZoom?: (_scale: number) => void
  onDoubleTap?: () => void
}

interface TouchPoint {
  x: number
  y: number
  time: number
}

export function useTouchGestures(handlers: SwipeHandlers) {
  const touchStartRef = useRef<TouchPoint | null>(null)
  const touchEndRef = useRef<TouchPoint | null>(null)
  const lastTapRef = useRef<number>(0)
  const pinchStartDistanceRef = useRef<number>(0)
  const [isPinching, setIsPinching] = useState(false)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const minSwipeDistance = 50
    const maxSwipeTime = 300
    const doubleTapDelay = 300

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        // Start pinch zoom
        setIsPinching(true)
        const touch1 = e.touches[0]
        const touch2 = e.touches[1]
        const distance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        )
        pinchStartDistanceRef.current = distance
      } else if (e.touches.length === 1) {
        const touch = e.touches[0]
        touchStartRef.current = {
          x: touch.clientX,
          y: touch.clientY,
          time: Date.now(),
        }
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (isPinching && e.touches.length === 2) {
        const touch1 = e.touches[0]
        const touch2 = e.touches[1]
        const distance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        )

        if (pinchStartDistanceRef.current > 0) {
          const scale = distance / pinchStartDistanceRef.current
          handlers.onPinchZoom?.(scale)
        }
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (isPinching) {
        setIsPinching(false)
        pinchStartDistanceRef.current = 0
        return
      }

      if (!touchStartRef.current) {
        return
      }

      const touch = e.changedTouches[0]
      touchEndRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      }

      // Check for double tap
      const currentTime = Date.now()
      const timeSinceLastTap = currentTime - lastTapRef.current

      if (timeSinceLastTap < doubleTapDelay && timeSinceLastTap > 0) {
        handlers.onDoubleTap?.()
        lastTapRef.current = 0
        return
      }

      lastTapRef.current = currentTime

      // Calculate swipe
      const deltaX = touchEndRef.current.x - touchStartRef.current.x
      const deltaY = touchEndRef.current.y - touchStartRef.current.y
      const deltaTime = touchEndRef.current.time - touchStartRef.current.time

      if (deltaTime > maxSwipeTime) {
        return
      }

      const absX = Math.abs(deltaX)
      const absY = Math.abs(deltaY)

      // Horizontal swipe
      if (absX > absY && absX > minSwipeDistance) {
        if (deltaX > 0) {
          handlers.onSwipeRight?.()
        } else {
          handlers.onSwipeLeft?.()
        }
      }

      // Vertical swipe
      if (absY > absX && absY > minSwipeDistance) {
        if (deltaY > 0) {
          handlers.onSwipeDown?.()
        } else {
          handlers.onSwipeUp?.()
        }
      }

      touchStartRef.current = null
      touchEndRef.current = null
    }

    const handleTouchCancel = () => {
      touchStartRef.current = null
      touchEndRef.current = null
      setIsPinching(false)
      pinchStartDistanceRef.current = 0
    }

    // Add event listeners
    document.addEventListener('touchstart', handleTouchStart, { passive: true })
    document.addEventListener('touchmove', handleTouchMove, { passive: true })
    document.addEventListener('touchend', handleTouchEnd, { passive: true })
    document.addEventListener('touchcancel', handleTouchCancel, { passive: true })

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
      document.removeEventListener('touchcancel', handleTouchCancel)
    }
  }, [handlers, isPinching])

  return { isPinching }
}

// Hook for pull-to-refresh functionality
export function usePullToRefresh(onRefresh: () => Promise<void>) {
  const [isPulling, setIsPulling] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const startYRef = useRef<number>(0)
  const currentYRef = useRef<number>(0)

  useEffect(() => {
    const threshold = 80
    let isRefreshing = false

    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        startYRef.current = e.touches[0].clientY
        setIsPulling(true)
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling || isRefreshing) {
        return
      }

      currentYRef.current = e.touches[0].clientY
      const distance = currentYRef.current - startYRef.current

      if (distance > 0) {
        e.preventDefault()
        setPullDistance(Math.min(distance, threshold * 1.5))
      }
    }

    const handleTouchEnd = async () => {
      if (!isPulling || isRefreshing) {
        return
      }

      if (pullDistance > threshold) {
        isRefreshing = true
        try {
          await onRefresh()
        } finally {
          isRefreshing = false
        }
      }

      setIsPulling(false)
      setPullDistance(0)
      startYRef.current = 0
      currentYRef.current = 0
    }

    document.addEventListener('touchstart', handleTouchStart, { passive: true })
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isPulling, pullDistance, onRefresh])

  return { isPulling, pullDistance }
}

// Hook for haptic feedback
export function useHapticFeedback() {
  const vibrate = (pattern: number | number[]) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern)
    }
  }

  return {
    light: () => vibrate(10),
    medium: () => vibrate(25),
    heavy: () => vibrate(50),
    success: () => vibrate([10, 20, 10]),
    warning: () => vibrate([20, 10, 20]),
    error: () => vibrate([50, 20, 50]),
  }
}
