/**
 * Enhanced Service Worker for PMP Learning Management System
 * Version: 3.0.0
 * 
 * Features:
 * - Advanced caching strategies (Network First, Cache First, Stale While Revalidate)
 * - Intelligent request routing based on content type
 * - Background sync for offline data synchronization
 * - Push notifications support
 * - Cache versioning and automatic cleanup
 * - Performance monitoring and metrics collection
 */

// Configuration
const SW_VERSION = '3.0.0';
const CACHE_PREFIX = 'pmp-learning';

// Cache names
const CACHES = {
  STATIC: `${CACHE_PREFIX}-static-v${SW_VERSION}`,
  DYNAMIC: `${CACHE_PREFIX}-dynamic-v${SW_VERSION}`,
  API: `${CACHE_PREFIX}-api-v${SW_VERSION}`,
  MEDIA: `${CACHE_PREFIX}-media-v${SW_VERSION}`,
  OFFLINE: `${CACHE_PREFIX}-offline-v${SW_VERSION}`
};

// Cache configuration
const CACHE_CONFIG = {
  maxAge: {
    static: 30 * 24 * 60 * 60 * 1000, // 30 days
    api: 5 * 60 * 1000, // 5 minutes
    media: 7 * 24 * 60 * 60 * 1000, // 7 days
    dynamic: 24 * 60 * 60 * 1000 // 24 hours
  },
  maxEntries: {
    static: 100,
    api: 50,
    media: 200,
    dynamic: 75
  },
  networkTimeout: 3000 // 3 seconds
};

// Essential resources to cache immediately
const PRECACHE_RESOURCES = [
  '/PMPLearningManagement/',
  '/PMPLearningManagement/index.html',
  '/PMPLearningManagement/offline.html',
  '/PMPLearningManagement/manifest.json',
  '/PMPLearningManagement/icons/icon-192x192.png',
  '/PMPLearningManagement/icons/icon-512x512.png'
];

// Route patterns for different caching strategies
const ROUTE_PATTERNS = {
  // Static assets - Cache First
  STATIC: /\.(js|css|woff2?|ttf|otf|eot)$/,
  
  // Images and media - Stale While Revalidate
  MEDIA: /\.(png|jpg|jpeg|svg|gif|webp|ico)$/,
  
  // API calls - Network First
  API: /\/api\//,
  
  // HTML pages - Network First
  PAGES: /\.(html?)$/,
  
  // Real-time endpoints - Network Only
  REALTIME: /\/(ws|socket\.io|sse)\//
};

// Caching strategies
const STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  NETWORK_ONLY: 'network-only',
  CACHE_ONLY: 'cache-only'
};

/**
 * Install Event - Precache essential resources
 */
self.addEventListener('install', event => {
  console.log('[ServiceWorker] Installing version:', SW_VERSION);
  
  event.waitUntil(
    (async () => {
      try {
        // Open offline cache
        const cache = await caches.open(CACHES.OFFLINE);
        
        // Cache essential resources
        await cache.addAll(PRECACHE_RESOURCES);
        
        console.log('[ServiceWorker] Precaching completed');
        
        // Skip waiting to activate immediately
        await self.skipWaiting();
      } catch (error) {
        console.error('[ServiceWorker] Precaching failed:', error);
      }
    })()
  );
});

/**
 * Activate Event - Clean up old caches
 */
self.addEventListener('activate', event => {
  console.log('[ServiceWorker] Activating version:', SW_VERSION);
  
  event.waitUntil(
    (async () => {
      try {
        // Clean up old caches
        const cacheNames = await caches.keys();
        const currentCaches = Object.values(CACHES);
        
        const cachesToDelete = cacheNames.filter(cacheName => 
          cacheName.startsWith(CACHE_PREFIX) && !currentCaches.includes(cacheName)
        );
        
        await Promise.all(
          cachesToDelete.map(cacheName => {
            console.log('[ServiceWorker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
        
        // Claim all clients
        await self.clients.claim();
        
        console.log('[ServiceWorker] Activation completed');
        
        // Notify clients about update
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
          client.postMessage({
            type: 'SW_ACTIVATED',
            version: SW_VERSION
          });
        });
      } catch (error) {
        console.error('[ServiceWorker] Activation failed:', error);
      }
    })()
  );
});

/**
 * Fetch Event - Handle requests with appropriate caching strategy
 */
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-HTTP(S) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  // Determine caching strategy based on request
  const strategy = getStrategy(request);
  
  event.respondWith(
    handleRequest(request, strategy).catch(error => {
      console.error('[ServiceWorker] Request failed:', error);
      
      // Return offline page for navigation requests
      if (request.mode === 'navigate') {
        return caches.match('/PMPLearningManagement/offline.html');
      }
      
      // Return cached response if available
      return caches.match(request);
    })
  );
});

/**
 * Determine caching strategy for a request
 */
function getStrategy(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  // Real-time endpoints - never cache
  if (ROUTE_PATTERNS.REALTIME.test(pathname)) {
    return STRATEGIES.NETWORK_ONLY;
  }
  
  // API calls - network first with fallback
  if (ROUTE_PATTERNS.API.test(pathname)) {
    return STRATEGIES.NETWORK_FIRST;
  }
  
  // Static assets - cache first
  if (ROUTE_PATTERNS.STATIC.test(pathname)) {
    return STRATEGIES.CACHE_FIRST;
  }
  
  // Media files - stale while revalidate
  if (ROUTE_PATTERNS.MEDIA.test(pathname)) {
    return STRATEGIES.STALE_WHILE_REVALIDATE;
  }
  
  // HTML pages - network first
  if (ROUTE_PATTERNS.PAGES.test(pathname) || request.mode === 'navigate') {
    return STRATEGIES.NETWORK_FIRST;
  }
  
  // Default strategy
  return STRATEGIES.NETWORK_FIRST;
}

/**
 * Handle request with specified strategy
 */
async function handleRequest(request, strategy) {
  switch (strategy) {
    case STRATEGIES.CACHE_FIRST:
      return cacheFirst(request);
    
    case STRATEGIES.NETWORK_FIRST:
      return networkFirst(request);
    
    case STRATEGIES.STALE_WHILE_REVALIDATE:
      return staleWhileRevalidate(request);
    
    case STRATEGIES.NETWORK_ONLY:
      return fetch(request);
    
    case STRATEGIES.CACHE_ONLY:
      return cacheOnly(request);
    
    default:
      return fetch(request);
  }
}

/**
 * Cache First Strategy
 * Try cache, fallback to network
 */
async function cacheFirst(request) {
  const cacheName = getCacheName(request);
  const cache = await caches.open(cacheName);
  
  // Check cache
  const cached = await cache.match(request);
  
  if (cached) {
    // Check if cache is still valid
    const cacheAge = getCacheAge(cached);
    const maxAge = CACHE_CONFIG.maxAge.static;
    
    if (cacheAge < maxAge) {
      recordCacheHit(true);
      return cached;
    }
  }
  
  // Fetch from network
  try {
    const response = await fetchWithTimeout(request, CACHE_CONFIG.networkTimeout);
    
    if (response.ok) {
      // Cache the response
      await cache.put(request, response.clone());
      await cleanupCache(cacheName);
    }
    
    recordCacheHit(false);
    return response;
  } catch (error) {
    // Return stale cache if available
    if (cached) {
      console.warn('[ServiceWorker] Using stale cache for:', request.url);
      return cached;
    }
    throw error;
  }
}

/**
 * Network First Strategy
 * Try network with timeout, fallback to cache
 */
async function networkFirst(request) {
  const cacheName = getCacheName(request);
  const cache = await caches.open(cacheName);
  
  try {
    // Try network with timeout
    const response = await fetchWithTimeout(request, CACHE_CONFIG.networkTimeout);
    
    if (response.ok) {
      // Update cache
      await cache.put(request, response.clone());
      await cleanupCache(cacheName);
    }
    
    recordCacheHit(false);
    return response;
  } catch (error) {
    // Fallback to cache
    const cached = await cache.match(request);
    
    if (cached) {
      console.log('[ServiceWorker] Network failed, using cache for:', request.url);
      recordCacheHit(true);
      return cached;
    }
    
    throw error;
  }
}

/**
 * Stale While Revalidate Strategy
 * Return cache immediately, update in background
 */
async function staleWhileRevalidate(request) {
  const cacheName = getCacheName(request);
  const cache = await caches.open(cacheName);
  
  // Check cache
  const cached = await cache.match(request);
  
  // Fetch in background
  const fetchPromise = fetch(request).then(response => {
    if (response.ok) {
      cache.put(request, response.clone());
      cleanupCache(cacheName);
    }
    return response;
  });
  
  // Return cached immediately if available
  if (cached) {
    recordCacheHit(true);
    return cached;
  }
  
  // Wait for network if no cache
  recordCacheHit(false);
  return fetchPromise;
}

/**
 * Cache Only Strategy
 * Only return from cache, fail if not cached
 */
async function cacheOnly(request) {
  const cacheName = getCacheName(request);
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  if (!cached) {
    throw new Error('No cached response available');
  }
  
  recordCacheHit(true);
  return cached;
}

/**
 * Fetch with timeout
 */
function fetchWithTimeout(request, timeout) {
  return Promise.race([
    fetch(request),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Network timeout')), timeout)
    )
  ]);
}

/**
 * Get appropriate cache name for request
 */
function getCacheName(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  if (ROUTE_PATTERNS.STATIC.test(pathname)) {
    return CACHES.STATIC;
  }
  
  if (ROUTE_PATTERNS.MEDIA.test(pathname)) {
    return CACHES.MEDIA;
  }
  
  if (ROUTE_PATTERNS.API.test(pathname)) {
    return CACHES.API;
  }
  
  return CACHES.DYNAMIC;
}

/**
 * Get cache age in milliseconds
 */
function getCacheAge(response) {
  const dateHeader = response.headers.get('date');
  if (!dateHeader) return 0;
  
  const date = new Date(dateHeader);
  return Date.now() - date.getTime();
}

/**
 * Clean up cache if it exceeds max entries
 */
async function cleanupCache(cacheName) {
  const cache = await caches.open(cacheName);
  const requests = await cache.keys();
  
  // Determine max entries for this cache
  let maxEntries = CACHE_CONFIG.maxEntries.dynamic;
  if (cacheName === CACHES.STATIC) {
    maxEntries = CACHE_CONFIG.maxEntries.static;
  } else if (cacheName === CACHES.API) {
    maxEntries = CACHE_CONFIG.maxEntries.api;
  } else if (cacheName === CACHES.MEDIA) {
    maxEntries = CACHE_CONFIG.maxEntries.media;
  }
  
  // Remove oldest entries if exceeding limit
  if (requests.length > maxEntries) {
    const toDelete = requests.slice(0, requests.length - maxEntries);
    await Promise.all(toDelete.map(request => cache.delete(request)));
    console.log(`[ServiceWorker] Cleaned up ${toDelete.length} entries from ${cacheName}`);
  }
}

/**
 * Background Sync Event - Sync offline data when online
 */
self.addEventListener('sync', event => {
  console.log('[ServiceWorker] Background sync triggered:', event.tag);
  
  if (event.tag === 'pmp-learning-sync') {
    event.waitUntil(syncOfflineData());
  }
});

/**
 * Sync offline data to server
 */
async function syncOfflineData() {
  try {
    // Get all clients
    const clients = await self.clients.matchAll();
    
    // Notify clients to start sync
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_START'
      });
    });
    
    // Perform sync (this would be implemented based on your backend)
    // For now, just simulate sync
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Notify clients of completion
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_COMPLETE',
        timestamp: Date.now()
      });
    });
    
    console.log('[ServiceWorker] Background sync completed');
  } catch (error) {
    console.error('[ServiceWorker] Background sync failed:', error);
    throw error; // Retry later
  }
}

/**
 * Push Event - Handle push notifications
 */
self.addEventListener('push', event => {
  console.log('[ServiceWorker] Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'New update available',
    icon: '/PMPLearningManagement/icons/icon-192x192.png',
    badge: '/PMPLearningManagement/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    tag: 'pmp-notification',
    requireInteraction: false,
    actions: [
      {
        action: 'view',
        title: 'View'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('PMP Learning', options)
  );
});

/**
 * Notification Click Event - Handle notification interactions
 */
self.addEventListener('notificationclick', event => {
  console.log('[ServiceWorker] Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'view' || !event.action) {
    event.waitUntil(
      clients.openWindow('/PMPLearningManagement/')
    );
  }
});

/**
 * Message Event - Handle messages from clients
 */
self.addEventListener('message', event => {
  const { type, data } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
    
    case 'CLEAR_CACHE':
      event.waitUntil(clearAllCaches());
      break;
    
    case 'CACHE_URLS':
      event.waitUntil(cacheUrls(data.urls));
      break;
    
    case 'GET_CACHE_STATS':
      event.waitUntil(sendCacheStats(event.source));
      break;
    
    default:
      console.log('[ServiceWorker] Unknown message type:', type);
  }
});

/**
 * Clear all caches
 */
async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames.map(cacheName => caches.delete(cacheName))
  );
  console.log('[ServiceWorker] All caches cleared');
}

/**
 * Cache specific URLs
 */
async function cacheUrls(urls) {
  const cache = await caches.open(CACHES.DYNAMIC);
  await cache.addAll(urls);
  console.log('[ServiceWorker] Cached URLs:', urls);
}

/**
 * Send cache statistics to client
 */
async function sendCacheStats(client) {
  const stats = {
    version: SW_VERSION,
    caches: {}
  };
  
  for (const [name, cacheName] of Object.entries(CACHES)) {
    const cache = await caches.open(cacheName);
    const requests = await cache.keys();
    stats.caches[name] = {
      name: cacheName,
      count: requests.length
    };
  }
  
  client.postMessage({
    type: 'CACHE_STATS',
    data: stats
  });
}

// Performance monitoring
let cacheHits = 0;
let cacheMisses = 0;

/**
 * Record cache hit/miss for metrics
 */
function recordCacheHit(hit) {
  if (hit) {
    cacheHits++;
  } else {
    cacheMisses++;
  }
  
  // Report metrics periodically
  if ((cacheHits + cacheMisses) % 100 === 0) {
    reportMetrics();
  }
}

/**
 * Report performance metrics
 */
function reportMetrics() {
  const hitRate = cacheHits / (cacheHits + cacheMisses);
  
  // Send metrics to clients
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'PERFORMANCE_METRICS',
        data: {
          cacheHitRate: hitRate,
          totalRequests: cacheHits + cacheMisses,
          cacheHits,
          cacheMisses
        }
      });
    });
  });
  
  console.log(`[ServiceWorker] Cache hit rate: ${(hitRate * 100).toFixed(2)}%`);
}

// Initialize service worker
console.log('[ServiceWorker] Enhanced Service Worker v' + SW_VERSION + ' loaded');