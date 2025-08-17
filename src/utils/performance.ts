/**
 * Performance utilities for optimization
 */

/**
 * Throttle function to limit the rate of function execution
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return function (this: unknown, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * Debounce function to delay function execution
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout
  return function (this: unknown, ...args: Parameters<T>) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(this, args), delay)
  }
}

/**
 * Request animation frame wrapper for smooth animations
 */
export function requestAnimationFrameWrapper(callback: () => void): void {
  if (typeof window !== 'undefined' && window.requestAnimationFrame) {
    window.requestAnimationFrame(callback)
  } else {
    setTimeout(callback, 16) // Fallback for 60fps
  }
}

/**
 * Measure performance of a function
 */
export function measurePerformance<T>(func: () => T, label: string = 'Performance'): T {
  const start = performance.now()
  const result = func()
  const end = performance.now()

  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    if (process.env.NODE_ENV === 'development') {
      console.log(`${label}: ${end - start} milliseconds`)
    }
  }

  return result
}
