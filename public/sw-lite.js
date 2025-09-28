/**
 * Lightweight Service Worker for GitHub Pages
 * Focuses on smart caching to prevent 429 errors
 */

const CACHE_NAME = 'pmp-learning-v1';
const STATIC_CACHE_NAME = 'pmp-static-v1';
const DYNAMIC_CACHE_NAME = 'pmp-dynamic-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/PMPLearningManagement/',
  '/PMPLearningManagement/index.html',
  '/PMPLearningManagement/manifest.json',
  '/PMPLearningManagement/icon-192x192.png',
  '/PMPLearningManagement/icon-512x512.png',
  '/PMPLearningManagement/offline.html'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .catch((error) => {
        console.error('[SW] Failed to cache static assets:', error);
      })
  );
  self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - smart caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests (except for CDNs)
  if (url.origin !== location.origin && !url.hostname.includes('googleapis.com') && !url.hostname.includes('gstatic.com')) {
    return;
  }

  // Strategy selector based on resource type
  if (url.pathname.includes('/assets/')) {
    // Cache-first for assets (JS, CSS) with network fallback
    event.respondWith(cacheFirst(request, DYNAMIC_CACHE_NAME));
  } else if (url.pathname.endsWith('.png') || url.pathname.endsWith('.jpg') || url.pathname.endsWith('.svg')) {
    // Cache-first for images
    event.respondWith(cacheFirst(request, STATIC_CACHE_NAME));
  } else if (url.pathname.endsWith('.html') || url.pathname === '/PMPLearningManagement/') {
    // Network-first for HTML with cache fallback
    event.respondWith(networkFirst(request, DYNAMIC_CACHE_NAME));
  } else {
    // Stale-while-revalidate for everything else
    event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE_NAME));
  }
});

// Cache-first strategy
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  if (cached) {
    console.log('[SW] Cache hit:', request.url);
    return cached;
  }

  try {
    const response = await fetch(request, {
      cache: 'default',
      credentials: 'same-origin'
    });

    if (response.ok) {
      // Clone the response before caching
      const responseToCache = response.clone();
      cache.put(request, responseToCache);
    }

    return response;
  } catch (error) {
    console.error('[SW] Fetch failed:', error);

    // Try to return offline page for navigation requests
    if (request.mode === 'navigate') {
      const offlineResponse = await caches.match('/PMPLearningManagement/offline.html');
      if (offlineResponse) {
        return offlineResponse;
      }
    }

    // Return a basic error response
    return new Response('Network error', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: new Headers({ 'Content-Type': 'text/plain' })
    });
  }
}

// Network-first strategy
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);

  try {
    const response = await fetch(request, {
      cache: 'no-cache',
      credentials: 'same-origin'
    });

    if (response.ok) {
      const responseToCache = response.clone();
      cache.put(request, responseToCache);
    }

    return response;
  } catch (error) {
    console.log('[SW] Network failed, falling back to cache:', request.url);
    const cached = await cache.match(request);

    if (cached) {
      return cached;
    }

    // Try offline page for navigation requests
    if (request.mode === 'navigate') {
      const offlineResponse = await caches.match('/PMPLearningManagement/offline.html');
      if (offlineResponse) {
        return offlineResponse;
      }
    }

    throw error;
  }
}

// Stale-while-revalidate strategy
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request, {
    cache: 'default',
    credentials: 'same-origin'
  }).then((response) => {
    if (response.ok) {
      const responseToCache = response.clone();
      cache.put(request, responseToCache);
    }
    return response;
  }).catch((error) => {
    console.error('[SW] Background fetch failed:', error);
    return cached || new Response('Network error', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: new Headers({ 'Content-Type': 'text/plain' })
    });
  });

  return cached || fetchPromise;
}

// Message handler for cache management
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      }).then(() => {
        console.log('[SW] All caches cleared');
      })
    );
  }
});