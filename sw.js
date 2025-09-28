// PMP Learning Management System - Service Worker
// Version: 2.1.0
// Mobile-optimized PWA with advanced caching and IndexedDB integration

const CACHE_VERSION = '2.1.1';
const CACHE_NAME = `pmp-learning-v${CACHE_VERSION}`;
const OFFLINE_CACHE = `pmp-learning-offline-v${CACHE_VERSION}`;
const RUNTIME_CACHE = `pmp-learning-runtime-v${CACHE_VERSION}`;
const IMAGE_CACHE = `pmp-learning-images-v${CACHE_VERSION}`;
const DATA_CACHE = `pmp-learning-data-v${CACHE_VERSION}`;

// Development mode detection
const IS_DEVELOPMENT = self.location.hostname === 'localhost' ||
                        self.location.hostname === '127.0.0.1' ||
                        self.location.port === '5173';

// Rate limiting for cache operations
const CACHE_RATE_LIMIT = new Map();
const RATE_LIMIT_WINDOW = 5000; // 5 seconds
const MAX_RETRIES_PER_WINDOW = 3;

// Failed URLs tracking to avoid repeated attempts
const FAILED_URLS = new Map();
const FAILED_URL_RETRY_DELAY = 60000; // 1 minute

// IndexedDB configuration
const DB_NAME = 'PMPLearningOfflineDB';
const DB_VERSION = 1;

// Assets to cache immediately (shell resources)
const PRECACHE_ASSETS = [
  '/PMPLearningManagement/',
  '/PMPLearningManagement/index.html',
  '/PMPLearningManagement/manifest.json',
  // Core routes for offline access
  '/PMPLearningManagement/#/',
  '/PMPLearningManagement/#/matrix',
  '/PMPLearningManagement/#/network',
  '/PMPLearningManagement/#/integrated',
  '/PMPLearningManagement/#/visualizations',
  '/PMPLearningManagement/#/flashcards',
  '/PMPLearningManagement/#/glossary',
  '/PMPLearningManagement/#/pmbok7-principles',
  '/PMPLearningManagement/#/pmbok7-domains'
];

// Network-first resources (dynamic content)
const NETWORK_FIRST = [
  '/api/',
  '/PMPLearningManagement/#/mock-exam',
  '/PMPLearningManagement/#/progress',
  '/PMPLearningManagement/#/collaboration',
  '/PMPLearningManagement/#/ai-coaching'
];

// Cache-first resources (static assets)
const CACHE_FIRST = [
  '.js',
  '.css',
  '.png',
  '.jpg',
  '.jpeg',
  '.svg',
  '.woff',
  '.woff2',
  '.ttf',
  '.ico'
];

// Maximum cache sizes (in entries)
const MAX_CACHE_SIZE = {
  [RUNTIME_CACHE]: 50,
  [IMAGE_CACHE]: 100,
  [DATA_CACHE]: 30
};

// Install event - precache essential resources
self.addEventListener('install', event => {
  console.log('[SW] Install event');
  
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        console.log('[SW] Caching shell resources');

        // Cache assets individually to prevent one failure from blocking all
        const cachePromises = PRECACHE_ASSETS.map(url =>
          cache.add(url).catch(err => {
            console.error('[SW] Failed to precache:', url, err);
            return null; // Continue despite individual failures
          })
        );

        await Promise.allSettled(cachePromises);
        console.log('[SW] Precaching completed');

        // Skip waiting to activate immediately
        self.skipWaiting();
      } catch (error) {
        console.error('[SW] Precaching failed:', error);
        // Still skip waiting to allow SW to activate
        self.skipWaiting();
      }
    })()
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', event => {
  console.log('[SW] Activate event');
  
  event.waitUntil(
    (async () => {
      try {
        // Clean up old caches
        const cacheNames = await caches.keys();
        const oldCaches = cacheNames.filter(cacheName => 
          (cacheName.startsWith('pmp-learning-') && 
           cacheName !== CACHE_NAME && 
           cacheName !== OFFLINE_CACHE && 
           cacheName !== RUNTIME_CACHE)
        );
        
        await Promise.all(
          oldCaches.map(cacheName => {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
        
        // Claim all clients
        self.clients.claim();
      } catch (error) {
        console.error('[SW] Cache cleanup failed:', error);
      }
    })()
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Skip chrome-extension requests
  if (url.protocol === 'chrome-extension:') return;
  
  event.respondWith(handleFetch(request));
});

// Handle fetch requests with appropriate caching strategy
async function handleFetch(request) {
  const url = new URL(request.url);
  
  try {
    // Network-first strategy for dynamic content
    if (NETWORK_FIRST.some(pattern => url.pathname.includes(pattern))) {
      return await networkFirst(request);
    }
    
    // Cache-first strategy for static assets
    if (CACHE_FIRST.some(ext => url.pathname.endsWith(ext))) {
      return await cacheFirst(request);
    }
    
    // Stale-while-revalidate for HTML pages
    if (request.destination === 'document' || 
        url.pathname.endsWith('/') || 
        url.pathname.includes('#/')) {
      return await staleWhileRevalidate(request);
    }
    
    // Default: Network with cache fallback
    return await networkWithCacheFallback(request);
    
  } catch (error) {
    console.error('[SW] Fetch error:', error);
    return await getOfflineFallback(request);
  }
}

// Network-first strategy
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) return cachedResponse;
    throw error;
  }
}

// Cache-first strategy
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    // Update cache in background for next time
    fetch(request).then(response => {
      if (response.ok) {
        const cache = caches.open(CACHE_NAME);
        cache.then(c => c.put(request, response));
      }
    }).catch(() => {
      // Ignore network errors in background update
    });
    
    return cachedResponse;
  }
  
  // Not in cache, fetch from network
  const networkResponse = await fetch(request);
  
  if (networkResponse.ok) {
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, networkResponse.clone());
  }
  
  return networkResponse;
}

// Stale-while-revalidate strategy
async function staleWhileRevalidate(request) {
  const cachedResponse = await caches.match(request);
  
  // Always try to fetch fresh content
  const networkPromise = fetch(request).then(response => {
    if (response.ok) {
      const cache = caches.open(CACHE_NAME);
      cache.then(c => c.put(request, response.clone()));
    }
    return response;
  }).catch(() => {
    // Network failed, return cached version if available
    return cachedResponse;
  });
  
  // Return cached version immediately if available, otherwise wait for network
  return cachedResponse || networkPromise;
}

// Network with cache fallback
async function networkWithCacheFallback(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) return cachedResponse;
    throw error;
  }
}

// Offline fallback
async function getOfflineFallback(request) {
  const url = new URL(request.url);
  
  // Return main app shell for navigation requests
  if (request.destination === 'document' || url.pathname.includes('#/')) {
    const appShell = await caches.match('/PMPLearningManagement/index.html');
    if (appShell) return appShell;
  }
  
  // Return cached offline page if available
  const offlinePage = await caches.match('/PMPLearningManagement/offline.html');
  if (offlinePage && request.destination === 'document') {
    return offlinePage;
  }
  
  // For other resources, return a generic offline response
  return new Response('Offline - Resource not available', {
    status: 503,
    statusText: 'Service Unavailable',
    headers: new Headers({
      'Content-Type': 'text/plain',
    }),
  });
}

// Background sync for offline actions
self.addEventListener('sync', event => {
  console.log('[SW] Background sync:', event.tag);
  
  switch (event.tag) {
    case 'progress-sync':
      event.waitUntil(syncProgress());
      break;
    case 'exam-results-sync':
      event.waitUntil(syncExamResults());
      break;
    case 'flashcard-sync':
      event.waitUntil(syncFlashcardProgress());
      break;
    case 'notes-sync':
      event.waitUntil(syncUserNotes());
      break;
    case 'offline-queue':
      event.waitUntil(processOfflineQueue());
      break;
    default:
      console.log('[SW] Unknown sync tag:', event.tag);
  }
});

// IndexedDB helper functions
async function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains('syncQueue')) {
        db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('offlineData')) {
        db.createObjectStore('offlineData', { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains('progress')) {
        db.createObjectStore('progress', { keyPath: 'userId' });
      }
      if (!db.objectStoreNames.contains('examResults')) {
        db.createObjectStore('examResults', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

// Sync progress data when online
async function syncProgress() {
  try {
    console.log('[SW] Syncing progress data');
    
    const db = await openDatabase();
    const tx = db.transaction(['progress'], 'readonly');
    const store = tx.objectStore('progress');
    const allProgress = await new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    
    // Sync each progress record
    for (const progressData of allProgress) {
      await syncToServer('/api/progress', progressData);
    }
    
    // Notify clients of successful sync
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_COMPLETE',
        data: { syncType: 'progress', timestamp: Date.now() }
      });
    });
    
    return Promise.resolve();
  } catch (error) {
    console.error('[SW] Progress sync failed:', error);
    // Re-throw to trigger retry
    throw error;
  }
}

// Sync exam results when online
async function syncExamResults() {
  try {
    console.log('[SW] Syncing exam results');
    
    const db = await openDatabase();
    const tx = db.transaction(['examResults'], 'readwrite');
    const store = tx.objectStore('examResults');
    const allResults = await new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    
    // Sync each exam result
    for (const examResult of allResults) {
      const synced = await syncToServer('/api/exam-results', examResult);
      if (synced) {
        // Remove from local store after successful sync
        await store.delete(examResult.id);
      }
    }
    
    return Promise.resolve();
  } catch (error) {
    console.error('[SW] Exam results sync failed:', error);
    throw error;
  }
}

// Sync flashcard progress
async function syncFlashcardProgress() {
  try {
    console.log('[SW] Syncing flashcard progress');
    
    const db = await openDatabase();
    const tx = db.transaction(['offlineData'], 'readonly');
    const store = tx.objectStore('offlineData');
    const flashcardData = await new Promise((resolve, reject) => {
      const request = store.get('flashcard-progress');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    
    if (flashcardData && flashcardData.value) {
      await syncToServer('/api/flashcards/progress', flashcardData.value);
    }
    
    return Promise.resolve();
  } catch (error) {
    console.error('[SW] Flashcard sync failed:', error);
    throw error;
  }
}

// Sync user notes
async function syncUserNotes() {
  try {
    console.log('[SW] Syncing user notes');
    
    const db = await openDatabase();
    const tx = db.transaction(['offlineData'], 'readonly');
    const store = tx.objectStore('offlineData');
    const notesData = await new Promise((resolve, reject) => {
      const request = store.get('user-notes');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    
    if (notesData && notesData.value) {
      await syncToServer('/api/notes', notesData.value);
    }
    
    return Promise.resolve();
  } catch (error) {
    console.error('[SW] Notes sync failed:', error);
    throw error;
  }
}

// Process offline queue
async function processOfflineQueue() {
  try {
    console.log('[SW] Processing offline queue');
    
    const db = await openDatabase();
    const tx = db.transaction(['syncQueue'], 'readwrite');
    const store = tx.objectStore('syncQueue');
    const queue = await new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    
    // Process each queued request
    for (const queueItem of queue) {
      try {
        const response = await fetch(queueItem.url, {
          method: queueItem.method || 'POST',
          headers: queueItem.headers || { 'Content-Type': 'application/json' },
          body: JSON.stringify(queueItem.data)
        });
        
        if (response.ok) {
          // Remove from queue after successful sync
          await store.delete(queueItem.id);
        }
      } catch (error) {
        console.error('[SW] Failed to sync queue item:', queueItem.id, error);
      }
    }
    
    return Promise.resolve();
  } catch (error) {
    console.error('[SW] Queue processing failed:', error);
    throw error;
  }
}

// Helper function to sync data to server
async function syncToServer(endpoint, data) {
  try {
    // For now, just simulate the sync since we don't have a backend
    // In production, this would make actual API calls
    console.log('[SW] Would sync to:', endpoint, data);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Store in localStorage as fallback for now
    const syncKey = `sync_${endpoint}_${Date.now()}`;
    localStorage.setItem(syncKey, JSON.stringify(data));
    
    return true;
  } catch (error) {
    console.error('[SW] Server sync failed:', error);
    return false;
  }
}

// Handle push notifications (for future use)
self.addEventListener('push', event => {
  console.log('[SW] Push received:', event);
  
  const options = {
    body: event.data ? event.data.text() : 'Study reminder from PMP Learning',
    icon: '/PMPLearningManagement/icon-192x192.png',
    badge: '/PMPLearningManagement/icon-192x192.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'open-app',
        title: 'Open App',
        icon: '/PMPLearningManagement/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'Dismiss',
        icon: '/PMPLearningManagement/icon-192x192.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('PMP Learning', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  console.log('[SW] Notification clicked:', event);
  
  event.notification.close();
  
  if (event.action === 'open-app' || !event.action) {
    event.waitUntil(
      clients.openWindow('/PMPLearningManagement/')
    );
  }
});

// Handle message events
self.addEventListener('message', event => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(cacheUrls(event.data.payload));
  }
});

// Helper function to check rate limiting
function isRateLimited(url) {
  const now = Date.now();
  const attempts = CACHE_RATE_LIMIT.get(url) || [];

  // Remove old attempts outside the window
  const recentAttempts = attempts.filter(time => now - time < RATE_LIMIT_WINDOW);

  if (recentAttempts.length >= MAX_RETRIES_PER_WINDOW) {
    return true;
  }

  // Add current attempt
  recentAttempts.push(now);
  CACHE_RATE_LIMIT.set(url, recentAttempts);
  return false;
}

// Helper function to check if URL recently failed
function isRecentlyFailed(url) {
  const failedTime = FAILED_URLS.get(url);
  if (!failedTime) return false;

  const now = Date.now();
  if (now - failedTime < FAILED_URL_RETRY_DELAY) {
    return true;
  }

  // Enough time has passed, remove from failed list
  FAILED_URLS.delete(url);
  return false;
}

// Helper function to mark URL as failed
function markUrlAsFailed(url) {
  FAILED_URLS.set(url, Date.now());
}

// Cache additional URLs on demand
async function cacheUrls(urls) {
  // In development mode, disable aggressive caching
  if (IS_DEVELOPMENT) {
    console.log('[SW] Development mode: Skipping aggressive caching');
    return;
  }

  if (!urls || !Array.isArray(urls) || urls.length === 0) {
    console.warn('[SW] No valid URLs provided for caching');
    return;
  }

  try {
    const cache = await caches.open(RUNTIME_CACHE);
    const validUrls = [];
    const skippedUrls = [];

    for (const url of urls) {
      try {
        // Check if URL is rate limited
        if (isRateLimited(url)) {
          skippedUrls.push({ url, reason: 'rate-limited' });
          continue;
        }

        // Check if URL recently failed
        if (isRecentlyFailed(url)) {
          skippedUrls.push({ url, reason: 'recently-failed' });
          continue;
        }

        // Validate URL format
        const parsedUrl = new URL(url, self.location.origin);

        // Skip chrome-extension and other non-http(s) protocols
        if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
          skippedUrls.push({ url, reason: 'invalid-protocol' });
          continue;
        }

        // Skip external URLs (different origin)
        if (parsedUrl.origin !== self.location.origin) {
          skippedUrls.push({ url, reason: 'external-url' });
          continue;
        }

        // Check if resource exists using HEAD request with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

        try {
          const response = await fetch(url, {
            method: 'HEAD',
            cache: 'no-cache',
            signal: controller.signal
          });
          clearTimeout(timeoutId);

          if (response.ok) {
            validUrls.push(url);
          } else {
            skippedUrls.push({ url, reason: `status-${response.status}` });
            markUrlAsFailed(url);
          }
        } catch (fetchError) {
          clearTimeout(timeoutId);
          if (fetchError.name === 'AbortError') {
            skippedUrls.push({ url, reason: 'timeout' });
          } else {
            skippedUrls.push({ url, reason: fetchError.message });
          }
          markUrlAsFailed(url);
        }
      } catch (err) {
        skippedUrls.push({ url, reason: err.message });
        markUrlAsFailed(url);
      }
    }

    // Log skipped URLs only in development or if there are many failures
    if (IS_DEVELOPMENT || skippedUrls.length > 0) {
      console.log('[SW] Skipped URLs:', skippedUrls.length, skippedUrls.slice(0, 5));
    }

    if (validUrls.length > 0) {
      // Cache URLs individually to prevent one failure from blocking all
      const cachePromises = validUrls.map(url =>
        cache.add(url).catch(err => {
          console.error('[SW] Failed to cache URL:', url, err.message);
          markUrlAsFailed(url);
        })
      );

      await Promise.allSettled(cachePromises);
      console.log('[SW] Successfully cached:', validUrls.length, '/', urls.length);
    }
  } catch (error) {
    console.error('[SW] On-demand caching failed:', error);
  }
}