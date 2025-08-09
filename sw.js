// PMP Learning Management System - Service Worker
// Version: 2.0.0
// Mobile-optimized PWA with advanced caching strategies

const CACHE_NAME = 'pmp-learning-v2.0.0';
const OFFLINE_CACHE = 'pmp-learning-offline-v2.0.0';
const RUNTIME_CACHE = 'pmp-learning-runtime-v2.0.0';

// Assets to cache immediately (shell resources)
const PRECACHE_ASSETS = [
  '/PMPLearningManagement/',
  '/PMPLearningManagement/index.html',
  '/PMPLearningManagement/manifest.json',
  // Core routes for offline access
  '/PMPLearningManagement/#/',
  '/PMPLearningManagement/#/matrix',
  '/PMPLearningManagement/#/flashcards',
  '/PMPLearningManagement/#/glossary'
];

// Network-first resources (dynamic content)
const NETWORK_FIRST = [
  '/api/',
  '/PMPLearningManagement/#/mock-exam',
  '/PMPLearningManagement/#/progress'
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
  '.ttf'
];

// Install event - precache essential resources
self.addEventListener('install', event => {
  console.log('[SW] Install event');
  
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        console.log('[SW] Caching shell resources');
        await cache.addAll(PRECACHE_ASSETS);
        
        // Skip waiting to activate immediately
        self.skipWaiting();
      } catch (error) {
        console.error('[SW] Precaching failed:', error);
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
    default:
      console.log('[SW] Unknown sync tag:', event.tag);
  }
});

// Sync progress data when online
async function syncProgress() {
  try {
    console.log('[SW] Syncing progress data');
    // This would sync with a backend API if available
    // For now, just ensure localStorage data integrity
    return Promise.resolve();
  } catch (error) {
    console.error('[SW] Progress sync failed:', error);
  }
}

// Sync exam results when online
async function syncExamResults() {
  try {
    console.log('[SW] Syncing exam results');
    // This would sync exam results with a backend API if available
    return Promise.resolve();
  } catch (error) {
    console.error('[SW] Exam results sync failed:', error);
  }
}

// Handle push notifications (for future use)
self.addEventListener('push', event => {
  console.log('[SW] Push received:', event);
  
  const options = {
    body: event.data ? event.data.text() : 'Study reminder from PMP Learning',
    icon: '/PMPLearningManagement/icons/icon-192x192.png',
    badge: '/PMPLearningManagement/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'open-app',
        title: 'Open App',
        icon: '/PMPLearningManagement/icons/icon-96x96.png'
      },
      {
        action: 'close',
        title: 'Dismiss',
        icon: '/PMPLearningManagement/icons/icon-96x96.png'
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

// Cache additional URLs on demand
async function cacheUrls(urls) {
  try {
    const cache = await caches.open(RUNTIME_CACHE);
    await cache.addAll(urls);
    console.log('[SW] URLs cached on demand:', urls);
  } catch (error) {
    console.error('[SW] On-demand caching failed:', error);
  }
}