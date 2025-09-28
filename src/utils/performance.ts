import { logger } from '../services/logger'

/**
 * Performance utilities for optimization
 */

/**
 * Advanced throttle function with leading and trailing options
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number,
  options?: { leading?: boolean; trailing?: boolean }
): (...args: Parameters<T>) => void {
  let waiting = false
  let lastArgs: Parameters<T> | null = null
  let lastThis: unknown = null
  let timeout: NodeJS.Timeout | null = null
  const leading = options?.leading ?? true
  const trailing = options?.trailing ?? true

  const later = () => {
    if (trailing && lastArgs) {
      func.apply(lastThis, lastArgs)
      lastArgs = lastThis = null
      timeout = setTimeout(later, limit)
    } else {
      waiting = false
      lastArgs = lastThis = null
    }
  }

  return function (this: unknown, ...args: Parameters<T>) {
    if (!waiting) {
      if (leading) {
        func.apply(this, args)
      } else {
        lastArgs = args
        lastThis = this
      }
      waiting = true
      timeout = setTimeout(later, limit)
    } else if (trailing) {
      lastArgs = args
      lastThis = this
    }
  }
}

/**
 * Advanced debounce function with immediate option and cancel/flush methods
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number,
  options?: { immediate?: boolean; maxWait?: number }
): ((...args: Parameters<T>) => void) & { cancel: () => void; flush: () => void } {
  let timeoutId: NodeJS.Timeout | null = null
  let maxTimeoutId: NodeJS.Timeout | null = null
  let lastArgs: Parameters<T> | null = null
  let lastThis: unknown = null
  let lastCallTime: number | null = null
  const immediate = options?.immediate ?? false
  const maxWait = options?.maxWait

  const invokeFunc = () => {
    if (lastArgs && lastThis) {
      func.apply(lastThis, lastArgs)
      lastArgs = lastThis = null
    }
  }

  const cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    if (maxTimeoutId) {
      clearTimeout(maxTimeoutId)
    }
    timeoutId = maxTimeoutId = null
    lastArgs = lastThis = lastCallTime = null
  }

  const flush = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      invokeFunc()
    }
    cancel()
  }

  const debounced = function (this: unknown, ...args: Parameters<T>) {
    lastArgs = args
    lastThis = this
    const now = Date.now()

    if (!lastCallTime) {
      lastCallTime = now
    }

    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    if (immediate && !timeoutId) {
      func.apply(this, args)
      lastArgs = null
    }

    timeoutId = setTimeout(() => {
      if (!immediate) {
        invokeFunc()
      }
      cancel()
    }, delay)

    if (maxWait && !maxTimeoutId) {
      maxTimeoutId = setTimeout(() => {
        invokeFunc()
        cancel()
      }, maxWait)
    }
  }

  debounced.cancel = cancel
  debounced.flush = flush

  return debounced
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
    logger.info(`${label}: ${end - start} milliseconds`)
  }

  return result
}

/**
 * Memoize function results to avoid expensive recalculations
 */
export function memoize<T extends (...args: any[]) => any>(
  func: T,
  resolver?: (...args: Parameters<T>) => string
): T & { cache: Map<string, ReturnType<T>> } {
  const cache = new Map<string, ReturnType<T>>()

  const memoized = function (this: any, ...args: Parameters<T>): ReturnType<T> {
    const key = resolver ? resolver(...args) : JSON.stringify(args)

    if (cache.has(key)) {
      return cache.get(key)!
    }

    const result = func.apply(this, args)
    cache.set(key, result)

    // Limit cache size to prevent memory leaks
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value
      cache.delete(firstKey)
    }

    return result
  } as T

  ;(memoized as any).cache = cache
  return memoized as T & { cache: Map<string, ReturnType<T>> }
}

/**
 * LRU Cache implementation for efficient caching
 */
export class LRUCache<K, V> {
  private cache: Map<K, V>
  private maxSize: number

  constructor(maxSize: number = 100) {
    this.cache = new Map()
    this.maxSize = maxSize
  }

  get(key: K): V | undefined {
    const value = this.cache.get(key)
    if (value !== undefined) {
      // Move to end (most recently used)
      this.cache.delete(key)
      this.cache.set(key, value)
    }
    return value
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key)
    } else if (this.cache.size >= this.maxSize) {
      // Remove least recently used (first item)
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }
    this.cache.set(key, value)
  }

  has(key: K): boolean {
    return this.cache.has(key)
  }

  delete(key: K): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  get size(): number {
    return this.cache.size
  }
}

/**
 * Virtual scrolling helper for large lists
 */
export interface VirtualScrollOptions {
  itemHeight: number | ((index: number) => number)
  containerHeight: number
  totalItems: number
  overscan?: number
  scrollTop?: number
}

export interface VirtualScrollResult {
  startIndex: number
  endIndex: number
  offsetY: number
  totalHeight: number
}

export function calculateVirtualScroll(options: VirtualScrollOptions): VirtualScrollResult {
  const { itemHeight, containerHeight, totalItems, overscan = 3, scrollTop = 0 } = options

  const getItemHeight = typeof itemHeight === 'function' ? itemHeight : () => itemHeight

  // Calculate cumulative heights
  const heights: number[] = []
  let totalHeight = 0

  for (let i = 0; i < totalItems; i++) {
    const height = getItemHeight(i)
    heights.push(totalHeight)
    totalHeight += height
  }

  // Find start index
  let startIndex = 0
  for (let i = 0; i < heights.length; i++) {
    if (heights[i] >= scrollTop) {
      startIndex = Math.max(0, i - 1)
      break
    }
  }

  // Apply overscan
  startIndex = Math.max(0, startIndex - overscan)

  // Find end index
  let endIndex = startIndex
  let accumulatedHeight = 0

  for (let i = startIndex; i < totalItems; i++) {
    if (accumulatedHeight >= containerHeight) {
      endIndex = Math.min(totalItems - 1, i + overscan)
      break
    }
    accumulatedHeight += getItemHeight(i)
  }

  // If we didn't fill the container, include all remaining items
  if (accumulatedHeight < containerHeight) {
    endIndex = totalItems - 1
  }

  return {
    startIndex,
    endIndex,
    offsetY: heights[startIndex] || 0,
    totalHeight,
  }
}

/**
 * Request idle callback with fallback
 */
export const requestIdleCallback: (
  callback: IdleRequestCallback,
  options?: IdleRequestOptions
) => number =
  typeof window !== 'undefined' && 'requestIdleCallback' in window
    ? (window as any).requestIdleCallback
    : (callback: () => void, options?: { timeout?: number }) => {
        const timeout = options?.timeout ?? 1
        const start = Date.now()
        return window.setTimeout(() => {
          callback({
            didTimeout: false,
            timeRemaining: () => Math.max(0, 50 - (Date.now() - start)),
          } as IdleDeadline)
        }, timeout)
      }

/**
 * Cancel idle callback with fallback
 */
export const cancelIdleCallback: (handle: number) => void =
  typeof window !== 'undefined' && 'cancelIdleCallback' in window
    ? (window as any).cancelIdleCallback
    : (handle: number) => window.clearTimeout(handle)
