import { logger } from '../../services/logger'

/**
 * Service Worker for PWA functionality
 * Developer 6: PWA & Mobile Developer Implementation
 */

const CACHE_NAME = 'pmp-learning-v1.0.0'
const STATIC_CACHE_NAME = `${CACHE_NAME}-static`
const DYNAMIC_CACHE_NAME = `${CACHE_NAME}-dynamic`

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/offline.html',
  '/static/js/bundle.js',
  '/static/css/main.css',
]

// API endpoints to cache
const CACHE_API_ROUTES = [
  // TODO: Will be used in future
  '/api/pmbok/processes',
  '/api/flashcards/decks',
  '/api/progress/overview',
  '/api/exam/config',
]

// Install event - cache static assets
self.addEventListener('install', (event: ExtendableEvent) => {
  if (process.env.NODE_ENV === 'development') {
    logger.debug('Service Worker: Installing...')
  }

  event.waitUntil(
    caches
      .open(STATIC_CACHE_NAME)
      .then((cache) => {
        if (process.env.NODE_ENV === 'development') {
          logger.debug('Service Worker: Caching static assets')
        }
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        if (process.env.NODE_ENV === 'development') {
          logger.debug('Service Worker: Static assets cached successfully')
        }
        return self.skipWaiting()
      })
      .catch((error) => {
        if (process.env.NODE_ENV === 'development') {
          logger.error('Service Worker: Failed to cache static assets:', error)
        }
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event: ExtendableEvent) => {
  if (process.env.NODE_ENV === 'development') {
    logger.debug('Service Worker: Activating...')
  }

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Delete old cache versions
            if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
              if (process.env.NODE_ENV === 'development') {
                logger.debug('Service Worker: Deleting old cache:', cacheName)
              }
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        if (process.env.NODE_ENV === 'development') {
          logger.debug('Service Worker: Activated successfully')
        }
        return self.clients.claim()
      })
  )
})

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event: FetchEvent) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests and chrome extensions
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return
  }

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful responses
          if (response.status === 200) {
            const responseClone = response.clone()
            caches.open(DYNAMIC_CACHE_NAME).then((cache) => cache.put(request, responseClone))
          }
          return response
        })
        .catch(() => {
          // Serve cached page or offline page
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse
            }
            // Serve offline page for navigation requests
            return caches.match('/offline.html')
          })
        })
    )
    return
  }

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request))
    return
  }

  // Handle static assets
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse
      }

      // Fetch from network and cache
      return fetch(request)
        .then((response) => {
          // Only cache successful responses
          if (response.status === 200) {
            const responseClone = response.clone()
            const cacheName = STATIC_ASSETS.includes(url.pathname)
              ? STATIC_CACHE_NAME
              : DYNAMIC_CACHE_NAME

            caches.open(cacheName).then((cache) => cache.put(request, responseClone))
          }
          return response
        })
        .catch(() => {
          // Serve offline fallback if available
          if (request.destination === 'image') {
            return caches.match('/icon-192x192.png')
          }
          return new Response('Offline', { status: 503 })
        })
    })
  )
})

// Handle API requests with caching strategy
async function handleApiRequest(request: Request): Promise<Response> {
  //   const url = new URL(request.url) // TODO: Will be used in future

  // Try network first for fresh data
  try {
    const networkResponse = await fetch(request)

    if (networkResponse.ok) {
      // Cache successful API responses
      const cache = await caches.open(DYNAMIC_CACHE_NAME)
      await cache.put(request, networkResponse.clone())
      return networkResponse
    }

    throw new Error(`Network response not ok: ${networkResponse.status}`)
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      logger.debug('Service Worker: Network failed for API request, trying cache')
    }

    // Fall back to cache
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    // Return error response if no cache available
    return new Response(
      JSON.stringify({
        error: 'Offline - No cached data available',
        message: 'Please check your internet connection and try again.',
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event: React.MouseEvent) => {
  if (process.env.NODE_ENV === 'development') {
    logger.debug('Service Worker: Background sync triggered:', event.tag)
  }

  if (event.tag === 'background-sync-progress') {
    event.waitUntil(syncProgressData())
  } else if (event.tag === 'background-sync-exam-results') {
    event.waitUntil(syncExamResults())
  } else if (event.tag === 'background-sync-flashcard-progress') {
    event.waitUntil(syncFlashcardProgress())
  }
})

// Sync progress data when back online
async function syncProgressData() {
  try {
    const pendingData = await getStoredSyncData('progress-sync')

    for (const data of pendingData) {
      await fetch('/api/progress/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    }

    // Clear synced data
    await clearStoredSyncData('progress-sync')
    if (process.env.NODE_ENV === 'development') {
      logger.debug('Service Worker: Progress data synced successfully')
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      logger.error('Service Worker: Failed to sync progress data:', error)
    }
  }
}

// Sync exam results when back online
async function syncExamResults() {
  try {
    const pendingResults = await getStoredSyncData('exam-results-sync')

    for (const result of pendingResults) {
      await fetch('/api/exam/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result),
      })
    }

    await clearStoredSyncData('exam-results-sync')
    if (process.env.NODE_ENV === 'development') {
      logger.debug('Service Worker: Exam results synced successfully')
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      logger.error('Service Worker: Failed to sync exam results:', error)
    }
  }
}

// Sync flashcard progress when back online
async function syncFlashcardProgress() {
  try {
    const pendingProgress = await getStoredSyncData('flashcard-progress-sync')

    for (const progress of pendingProgress) {
      await fetch('/api/flashcards/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(progress),
      })
    }

    await clearStoredSyncData('flashcard-progress-sync')
    if (process.env.NODE_ENV === 'development') {
      logger.debug('Service Worker: Flashcard progress synced successfully')
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      logger.error('Service Worker: Failed to sync flashcard progress:', error)
    }
  }
}

// Helper functions for IndexedDB operations
async function getStoredSyncData(storeName: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('PMP-Learning-Sync', 1)

    request.onerror = () => reject(request.error)

    request.onsuccess = () => {
      const db = request.result
      const transaction = db.transaction([storeName], 'readonly')
      const store = transaction.objectStore(storeName)
      const getAllRequest = store.getAll()

      getAllRequest.onsuccess = () => resolve(getAllRequest.result)
      getAllRequest.onerror = () => reject(getAllRequest.error)
    }

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true })
      }
    }
  })
}

async function clearStoredSyncData(storeName: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('PMP-Learning-Sync', 1)

    request.onerror = () => reject(request.error)

    request.onsuccess = () => {
      const db = request.result
      const transaction = db.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const clearRequest = store.clear()

      clearRequest.onsuccess = () => resolve()
      clearRequest.onerror = () => reject(clearRequest.error)
    }
  })
}

// Push notification handling
self.addEventListener('push', (event: React.MouseEvent) => {
  if (process.env.NODE_ENV === 'development') {
    logger.debug('Service Worker: Push message received')
  }

  const options = {
    body: 'New activity in your study group!',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    tag: 'pmp-notification',
    data: { url: '/' },
    actions: [
      {
        action: 'open',
        title: 'Open App',
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
      },
    ],
  }

  if (event.data) {
    try {
      const data = event.data.json()
      options.body = data.message || options.body
      options.data = data
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('Service Worker: Error parsing push data:', error)
      }
    }
  }

  event.waitUntil(self.registration.showNotification('PMP Learning Management', options))
})

// Notification click handling
self.addEventListener('notificationclick', (event: React.MouseEvent) => {
  if (process.env.NODE_ENV === 'development') {
    logger.debug('Service Worker: Notification clicked')
  }

  event.notification.close()

  if (event.action === 'dismiss') {
    return
  }

  const urlToOpen = event.notification.data?.url || '/'

  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clientList) => {
      // Check if app is already open
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus()
        }
      }

      // Open new window if app is not open
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen)
      }
    })
  )
})

// Handle messages from main thread
self.addEventListener('message', (event: React.MouseEvent) => {
  if (process.env.NODE_ENV === 'development') {
    logger.debug('Service Worker: Message received:', event.data)
  }

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  } else if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME })
  } else if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(cacheUrls(event.data.urls))
  }
})

// Cache specific URLs on demand
async function cacheUrls(urls: string[]) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE_NAME)
    await cache.addAll(urls)
    if (process.env.NODE_ENV === 'development') {
      logger.debug('Service Worker: URLs cached successfully')
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      logger.error('Service Worker: Failed to cache URLs:', error)
    }
  }
}

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event: React.MouseEvent) => {
  if (event.tag === 'content-sync') {
    event.waitUntil(syncContent())
  }
})

async function syncContent() {
  try {
    // Sync latest PMBOK content
    await fetch('/api/pmbok/sync')

    // Sync user progress
    await syncProgressData()

    if (process.env.NODE_ENV === 'development') {
      logger.debug('Service Worker: Periodic sync completed')
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      logger.error('Service Worker: Periodic sync failed:', error)
    }
  }
}

export {}
