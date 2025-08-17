/**
 * API Client Configuration for PMP Learning Management System
 * Provides unified API client with authentication, error handling, and caching
 */

import { createTRPCReact } from '@trpc/react-query'
import { createTRPCMsw } from 'msw-trpc'
import { httpBatchLink, loggerLink } from '@trpc/client'
import { QueryClient, QueryCache } from '@tanstack/react-query'
import superjson from 'superjson'
import type { AppRouter } from '../trpc/server'
import { logger } from '../../services/logger'

// tRPC Error types
interface TRPCError {
  message: string
  data?: {
    code: string
    httpStatus: number
    [key: string]: unknown
  }
}

// Create tRPC React hooks
export const api = createTRPCReact<AppRouter>()

// Create MSW handler for testing
export const trpcMsw = createTRPCMsw<AppRouter>()

// Base URL configuration
const getBaseUrl = () => {
  if (typeof window !== 'undefined') {return ''} // browser should use relative url
  if (process.env.VERCEL_URL) {return `https://${process.env.VERCEL_URL}`} // Vercel
  return `http://localhost:${process.env.PORT ?? 3000}` // dev SSR should use localhost
}

// Query client configuration with error handling
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error?.data?.httpStatus >= 400 && error?.data?.httpStatus < 500) {
          return false
        }
        return failureCount < 3
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (process.env.NODE_ENV === 'development') {
        logger.error(`Query error for key ${query.queryKey}:`, error)
      }
    },
  }),
})

// tRPC client configuration
export const trpcClient = api.createClient({
  transformer: superjson,
  links: [
    loggerLink({
      enabled: (opts) =>
        process.env.NODE_ENV === 'development' ||
        (opts.direction === 'down' && opts.result instanceof Error),
    }),
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
      // You can pass any HTTP headers here
      async headers() {
        const headers: Record<string, string> = {}

        // Add auth token if available
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('auth-token')
          if (token) {
            headers['Authorization'] = `Bearer ${token}`
          }
        }

        return headers
      },
    }),
  ],
})

// API Error types
export interface ApiError {
  message: string
  code: string
  status: number
  details?: unknown
}

// API Response wrapper
export interface ApiResponse<T = unknown> {
  data?: T
  error?: ApiError
  success: boolean
  message?: string
}

// Utility function to handle API errors
export const handleApiError = (error: unknown): ApiError => {
  if (error instanceof Error) {
    return {
      message: error.message,
      code: 'UNKNOWN_ERROR',
      status: 500,
      details: error,
    }
  }

  if (typeof error === 'object' && error !== null && 'data' in error) {
    const trpcError = error as TRPCError
    return {
      message: trpcError.message || 'An error occurred',
      code: trpcError.data?.code || 'UNKNOWN_ERROR',
      status: trpcError.data?.httpStatus || 500,
      details: trpcError.data,
    }
  }

  return {
    message: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
    status: 500,
    details: error,
  }
}

// Cache invalidation helpers
export const invalidateQueries = {
  exam: () => queryClient.invalidateQueries({ queryKey: ['exam'] }),
  progress: () => queryClient.invalidateQueries({ queryKey: ['progress'] }),
  flashcards: () => queryClient.invalidateQueries({ queryKey: ['flashcards'] }),
  pmbok: () => queryClient.invalidateQueries({ queryKey: ['pmbok'] }),
  collaboration: () => queryClient.invalidateQueries({ queryKey: ['collaboration'] }),
  user: () => queryClient.invalidateQueries({ queryKey: ['user'] }),
  all: () => queryClient.invalidateQueries(),
}

// Offline support utilities
export const offlineUtils = {
  isOnline: () => typeof window !== 'undefined' && navigator.onLine,

  queueMutation: (mutation: string, data: unknown) => {
    if (typeof window !== 'undefined') {
      const queue = JSON.parse(localStorage.getItem('offline-mutations') || '[]')
      queue.push({ mutation, data, timestamp: Date.now() })
      localStorage.setItem('offline-mutations', JSON.stringify(queue))
    }
  },

  processPendingMutations: async () => {
    if (typeof window !== 'undefined' && offlineUtils.isOnline()) {
      const queue = JSON.parse(localStorage.getItem('offline-mutations') || '[]')

      for (const item of queue) {
        try {
          // Process queued mutations
          if (process.env.NODE_ENV === 'development') {
            logger.debug('Processing offline mutation:', item)
          }
          // Implementation would depend on specific mutation types
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            logger.error('Failed to process offline mutation:', error)
          }
        }
      }

      // Clear processed mutations
      localStorage.setItem('offline-mutations', '[]')
    }
  },
}

// Performance monitoring
export const performanceUtils = {
  measureApiCall: (name: string) => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const start = performance.now()

      return {
        end: () => {
          const duration = performance.now() - start
          if (process.env.NODE_ENV === 'development') {
            logger.debug(`API call ${name} took ${duration.toFixed(2)}ms`)
          }

          // Report to analytics if configured
          if (window.gtag) {
            window.gtag('event', 'api_call_duration', {
              event_category: 'Performance',
              event_label: name,
              value: Math.round(duration),
            })
          }
        },
      }
    }

    return { end: () => {} }
  },
}

export default api
