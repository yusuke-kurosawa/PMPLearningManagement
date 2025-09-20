/**
 * PMPLearningManagement - Optimized Service Worker v3.0.0
 * Advanced caching strategies and offline functionality
 */

const CACHE_VERSION = 'v3.0.0';
const CACHE_NAMES = {
  static: `pmp-static-${CACHE_VERSION}`,
  dynamic: `pmp-dynamic-${CACHE_VERSION}`,
  api: `pmp-api-${CACHE_VERSION}`,
  images: `pmp-images-${CACHE_VERSION}`,
  fonts: `pmp-fonts-${CACHE_VERSION}`,
  offline: `pmp-offline-${CACHE_VERSION}`
};

const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  NETWORK_ONLY: 'network-only',
  CACHE_ONLY: 'cache-only'
};

// Performance optimization settings
const PERFORMANCE_CONFIG = {
  maxCacheSize: {
    static: 50 * 1024 * 1024,    // 50MB for static assets
    dynamic: 25 * 1024 * 1024,   // 25MB for dynamic content
    api: 10 * 1024 * 1024,       // 10MB for API responses
    images: 100 * 1024 * 1024,   // 100MB for images
    fonts: 5 * 1024 * 1024       // 5MB for fonts
  },
  cacheTimeout: {
    static: 24 * 60 * 60 * 1000,     // 24 hours
    dynamic: 60 * 60 * 1000,         // 1 hour
    api: 5 * 60 * 1000,              // 5 minutes
    images: 7 * 24 * 60 * 60 * 1000, // 7 days
    fonts: 30 * 24 * 60 * 60 * 1000  // 30 days
  },
  networkTimeout: 3000, // 3 seconds
  retryAttempts: 3,
  backgroundSyncTag: 'pmp-background-sync'
};

// Route patterns for different caching strategies
const ROUTE_PATTERNS = {
  static: [
    /.*\.(js|css|html)$/,
    /.*\/static\/.*/,
    /.*\/assets\/.*/
  ],
  api: [
    /.*\/api\/.*/,
    /.*\/supabase\/.*/
  ],
  images: [
    /.*\.(png|jpg|jpeg|gif|svg|webp|ico)$/
  ],
  fonts: [
    /.*\.(woff|woff2|ttf|eot)$/
  ],
  pmbok: [
    /.*\/pmbok\/.*/,
    /.*\/processes\/.*/,
    /.*\/itto\/.*/
  ]
};

// Performance monitoring
let performanceMetrics = {
  cacheHits: 0,
  cacheMisses: 0,
  networkRequests: 0,
  offlineRequests: 0,
  averageResponseTime: 0,
  errorCount: 0
};

// Background sync queue
let backgroundSyncQueue = [];

// ============================================================================
// Service Worker Event Handlers
// ============================================================================

self.addEventListener('install', (event) => {
  console.log(`🚀 SW ${CACHE_VERSION}: Installing...`);
  
  event.waitUntil(
    Promise.all([
      precacheStaticAssets(),
      precacheEssentialContent(),
      initializePerformanceMonitoring()
    ]).then(() => {
      console.log(`✅ SW ${CACHE_VERSION}: Installation completed`);
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', (event) => {
  console.log(`🔄 SW ${CACHE_VERSION}: Activating...`);
  
  event.waitUntil(
    Promise.all([
      cleanupOldCaches(),
      setupBackgroundSync(),
      initializeNotifications()
    ]).then(() => {
      console.log(`✅ SW ${CACHE_VERSION}: Activation completed`);
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Skip non-GET requests and chrome-extension requests
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return;
  }

  event.respondWith(handleFetchRequest(request));
});

self.addEventListener('sync', (event) => {
  if (event.tag === PERFORMANCE_CONFIG.backgroundSyncTag) {
    console.log('🔄 Background sync triggered');
    event.waitUntil(handleBackgroundSync());
  }
});

self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    event.waitUntil(handlePushNotification(data));
  }
});

self.addEventListener('message', (event) => {
  handleMessage(event);
});

// ============================================================================
// Caching Strategy Implementation
// ============================================================================

async function handleFetchRequest(request) {
  const startTime = performance.now();
  const url = new URL(request.url);
  
  try {
    let response;
    
    // Determine caching strategy based on request type
    if (matchesPattern(url, ROUTE_PATTERNS.static)) {
      response = await cacheFirstStrategy(request, CACHE_NAMES.static);
    } else if (matchesPattern(url, ROUTE_PATTERNS.api)) {
      response = await networkFirstStrategy(request, CACHE_NAMES.api);
    } else if (matchesPattern(url, ROUTE_PATTERNS.images)) {
      response = await staleWhileRevalidateStrategy(request, CACHE_NAMES.images);
    } else if (matchesPattern(url, ROUTE_PATTERNS.fonts)) {
      response = await cacheFirstStrategy(request, CACHE_NAMES.fonts);
    } else if (matchesPattern(url, ROUTE_PATTERNS.pmbok)) {
      response = await networkFirstStrategy(request, CACHE_NAMES.dynamic);
    } else {
      response = await networkFirstStrategy(request, CACHE_NAMES.dynamic);
    }
    
    // Update performance metrics
    updatePerformanceMetrics(startTime, true, response.status);
    
    return response;
  } catch (error) {
    console.error('Fetch request failed:', error);
    updatePerformanceMetrics(startTime, false, 0);
    
    // Return offline fallback
    return getOfflineFallback(request);
  }
}

// Cache-First Strategy (for static assets)
async function cacheFirstStrategy(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    performanceMetrics.cacheHits++;
    
    // Background update for stale content
    const age = Date.now() - new Date(cachedResponse.headers.get('date') || 0).getTime();
    if (age > PERFORMANCE_CONFIG.cacheTimeout.static) {
      fetchAndCache(request, cache);
    }
    
    return cachedResponse;
  }
  
  performanceMetrics.cacheMisses++;
  const networkResponse = await fetchWithTimeout(request);
  
  if (networkResponse && networkResponse.ok) {
    await cacheResponse(cache, request, networkResponse.clone());
  }
  
  return networkResponse;
}

// Network-First Strategy (for API and dynamic content)
async function networkFirstStrategy(request, cacheName) {
  const cache = await caches.open(cacheName);
  
  try {
    const networkResponse = await fetchWithTimeout(request);
    performanceMetrics.networkRequests++;
    
    if (networkResponse && networkResponse.ok) {
      await cacheResponse(cache, request, networkResponse.clone());
      return networkResponse;
    }
  } catch (error) {
    console.log('Network request failed, falling back to cache');
  }
  
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    performanceMetrics.cacheHits++;
    return cachedResponse;
  }
  
  performanceMetrics.cacheMisses++;
  return getOfflineFallback(request);
}

// Stale-While-Revalidate Strategy (for images)
async function staleWhileRevalidateStrategy(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    performanceMetrics.cacheHits++;
    
    // Background update
    fetchAndCache(request, cache);
    
    return cachedResponse;
  }
  
  performanceMetrics.cacheMisses++;
  const networkResponse = await fetchWithTimeout(request);
  
  if (networkResponse && networkResponse.ok) {
    await cacheResponse(cache, request, networkResponse.clone());
  }
  
  return networkResponse || getOfflineFallback(request);
}

// ============================================================================
// Cache Management
// ============================================================================

async function cacheResponse(cache, request, response) {
  // Check cache size limits
  const cacheSize = await getCacheSize(cache);
  const maxSize = getMaxCacheSize(cache);
  
  if (cacheSize > maxSize) {
    await cleanupOldestEntries(cache);
  }
  
  // Add timestamp header for cache management
  const responseToCache = new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: {
      ...Object.fromEntries(response.headers.entries()),
      'sw-cache-time': Date.now().toString()
    }
  });
  
  await cache.put(request, responseToCache);
}

async function cleanupOldestEntries(cache) {
  const requests = await cache.keys();
  const entries = await Promise.all(
    requests.map(async (request) => {
      const response = await cache.match(request);
      const cacheTime = response.headers.get('sw-cache-time') || '0';
      return { request, cacheTime: parseInt(cacheTime) };
    })
  );
  
  // Sort by cache time and remove oldest 20%
  entries.sort((a, b) => a.cacheTime - b.cacheTime);
  const toDelete = entries.slice(0, Math.floor(entries.length * 0.2));
  
  await Promise.all(toDelete.map(entry => cache.delete(entry.request)));
}

// ============================================================================
// Offline Functionality
// ============================================================================

async function precacheEssentialContent() {
  const cache = await caches.open(CACHE_NAMES.offline);
  
  const essentialUrls = [
    '/',
    '/offline',
    '/manifest.json',
    // Core learning content
    '/api/pmbok/processes',
    '/api/knowledge-areas',
    '/api/user/progress',
    // Critical assets
    '/static/js/main.js',
    '/static/css/main.css',
    '/static/icons/icon-192x192.png'
  ];
  
  const responses = await Promise.allSettled(
    essentialUrls.map(url => fetch(url))
  );
  
  for (let i = 0; i < responses.length; i++) {
    const response = responses[i];
    if (response.status === 'fulfilled' && response.value.ok) {
      await cache.put(essentialUrls[i], response.value);
    }
  }
  
  console.log(`📦 Precached ${essentialUrls.length} essential resources`);
}

async function getOfflineFallback(request) {
  const url = new URL(request.url);
  
  // API fallbacks
  if (url.pathname.startsWith('/api/')) {
    return new Response(
      JSON.stringify({ 
        error: 'Offline', 
        message: 'This feature requires an internet connection',
        offline: true 
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
  
  // HTML fallbacks
  if (request.destination === 'document') {
    const offlineCache = await caches.open(CACHE_NAMES.offline);
    return (await offlineCache.match('/offline')) || 
           new Response('<html><body><h1>Offline</h1><p>Please check your internet connection.</p></body></html>', {
             headers: { 'Content-Type': 'text/html' }
           });
  }
  
  return new Response('Resource not available offline', { status: 503 });
}

// ============================================================================
// Background Sync
// ============================================================================

async function handleBackgroundSync() {
  console.log('🔄 Processing background sync queue...');
  
  while (backgroundSyncQueue.length > 0) {
    const item = backgroundSyncQueue.shift();
    
    try {
      await processBackgroundSyncItem(item);
      console.log('✅ Background sync item processed:', item.type);
    } catch (error) {
      console.error('❌ Background sync failed:', error);
      // Re-queue for retry
      backgroundSyncQueue.push(item);
      break; // Exit to avoid infinite loop
    }
  }
  
  // Notify client of sync completion
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({
      type: 'BACKGROUND_SYNC_COMPLETE',
      queueLength: backgroundSyncQueue.length
    });
  });
}

async function processBackgroundSyncItem(item) {
  switch (item.type) {
    case 'PROGRESS_UPDATE':
      return syncProgressUpdate(item.data);
    case 'QUIZ_RESULT':
      return syncQuizResult(item.data);
    case 'STUDY_SESSION':
      return syncStudySession(item.data);
    case 'ANALYTICS_EVENT':
      return syncAnalyticsEvent(item.data);
    default:
      console.warn('Unknown sync item type:', item.type);
  }
}

async function syncProgressUpdate(data) {
  const response = await fetch('/api/progress/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    throw new Error(`Progress sync failed: ${response.status}`);
  }
  
  return response.json();
}

async function syncQuizResult(data) {
  const response = await fetch('/api/quiz/results', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    throw new Error(`Quiz result sync failed: ${response.status}`);
  }
  
  return response.json();
}

// ============================================================================
// Push Notifications
// ============================================================================

async function handlePushNotification(data) {
  const { title, body, icon, badge, actions, tag, data: notificationData } = data;
  
  const options = {
    body,
    icon: icon || '/static/icons/icon-192x192.png',
    badge: badge || '/static/icons/badge-72x72.png',
    actions: actions || [],
    tag: tag || 'default',
    data: notificationData,
    requireInteraction: data.priority === 'high',
    silent: data.priority === 'low'
  };
  
  // Smart notification scheduling
  const userSettings = await getUserNotificationSettings();
  if (userSettings && !isWithinQuietHours(userSettings)) {
    await self.registration.showNotification(title, options);
    
    // Track notification delivery
    await recordNotificationEvent('delivered', data);
  } else {
    // Queue for later delivery
    await queueNotificationForLater(data);
  }
}

async function getUserNotificationSettings() {
  try {
    const cache = await caches.open(CACHE_NAMES.dynamic);
    const response = await cache.match('/api/user/notification-settings');
    return response ? await response.json() : null;
  } catch (error) {
    return null;
  }
}

function isWithinQuietHours(settings) {
  if (!settings.quietHours) return false;
  
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  const startQuiet = timeStringToMinutes(settings.quietHours.start);
  const endQuiet = timeStringToMinutes(settings.quietHours.end);
  
  if (startQuiet < endQuiet) {
    return currentTime >= startQuiet && currentTime <= endQuiet;
  } else {
    // Quiet hours span midnight
    return currentTime >= startQuiet || currentTime <= endQuiet;
  }
}

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const action = event.action;
  const data = event.notification.data;
  
  event.waitUntil(
    handleNotificationClick(action, data)
  );
});

async function handleNotificationClick(action, data) {
  const clients = await self.clients.matchAll({ type: 'window' });
  
  if (action === 'study_now') {
    const url = data.studyUrl || '/dashboard';
    await openOrFocusWindow(url, clients);
  } else if (action === 'dismiss') {
    await recordNotificationEvent('dismissed', data);
  } else {
    // Default action - open app
    await openOrFocusWindow('/', clients);
  }
  
  await recordNotificationEvent('clicked', data);
}

async function openOrFocusWindow(url, clients) {
  for (const client of clients) {
    if (client.url.includes(url) && 'focus' in client) {
      return client.focus();
    }
  }
  
  if (self.clients.openWindow) {
    return self.clients.openWindow(url);
  }
}

// ============================================================================
// Performance Optimization
// ============================================================================

async function fetchWithTimeout(request, timeout = PERFORMANCE_CONFIG.networkTimeout) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(request, {
      signal: controller.signal,
      cache: 'no-cache' // Let SW handle caching
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

async function fetchAndCache(request, cache) {
  try {
    const response = await fetchWithTimeout(request);
    if (response && response.ok) {
      await cacheResponse(cache, request, response.clone());
    }
  } catch (error) {
    console.log('Background cache update failed:', error.message);
  }
}

async function getCacheSize(cache) {
  const requests = await cache.keys();
  let totalSize = 0;
  
  for (const request of requests) {
    const response = await cache.match(request);
    if (response) {
      const blob = await response.blob();
      totalSize += blob.size;
    }
  }
  
  return totalSize;
}

function getMaxCacheSize(cache) {
  const cacheName = (await cache.keys())[0]; // Get cache name from first key
  
  if (cacheName.includes('static')) return PERFORMANCE_CONFIG.maxCacheSize.static;
  if (cacheName.includes('dynamic')) return PERFORMANCE_CONFIG.maxCacheSize.dynamic;
  if (cacheName.includes('api')) return PERFORMANCE_CONFIG.maxCacheSize.api;
  if (cacheName.includes('images')) return PERFORMANCE_CONFIG.maxCacheSize.images;
  if (cacheName.includes('fonts')) return PERFORMANCE_CONFIG.maxCacheSize.fonts;
  
  return 10 * 1024 * 1024; // Default 10MB
}

// ============================================================================
// Initialization Functions
// ============================================================================

async function precacheStaticAssets() {
  const cache = await caches.open(CACHE_NAMES.static);
  
  const staticAssets = [
    '/',
    '/static/js/main.js',
    '/static/css/main.css',
    '/manifest.json'
  ];
  
  const responses = await Promise.allSettled(
    staticAssets.map(url => fetch(url))
  );
  
  for (let i = 0; i < responses.length; i++) {
    const response = responses[i];
    if (response.status === 'fulfilled' && response.value.ok) {
      await cache.put(staticAssets[i], response.value);
    }
  }
}

async function cleanupOldCaches() {
  const cacheNames = await caches.keys();
  const currentCaches = Object.values(CACHE_NAMES);
  
  const deletePromises = cacheNames.map(cacheName => {
    if (!currentCaches.includes(cacheName)) {
      console.log(`🗑️ Deleting old cache: ${cacheName}`);
      return caches.delete(cacheName);
    }
  });
  
  await Promise.all(deletePromises);
}

async function setupBackgroundSync() {
  if ('sync' in self.registration) {
    console.log('✅ Background sync available');
  } else {
    console.log('❌ Background sync not supported');
  }
}

async function initializeNotifications() {
  console.log('🔔 Notification system initialized');
}

async function initializePerformanceMonitoring() {
  // Initialize performance tracking
  performanceMetrics = {
    cacheHits: 0,
    cacheMisses: 0,
    networkRequests: 0,
    offlineRequests: 0,
    averageResponseTime: 0,
    errorCount: 0,
    startTime: Date.now()
  };
  
  // Send performance data every 5 minutes
  setInterval(sendPerformanceData, 5 * 60 * 1000);
}

async function sendPerformanceData() {
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({
      type: 'PERFORMANCE_METRICS',
      data: {
        ...performanceMetrics,
        cacheHitRate: performanceMetrics.cacheHits / (performanceMetrics.cacheHits + performanceMetrics.cacheMisses),
        uptime: Date.now() - performanceMetrics.startTime
      }
    });
  });
}

// ============================================================================
// Utility Functions
// ============================================================================

function matchesPattern(url, patterns) {
  return patterns.some(pattern => pattern.test(url.pathname));
}

function updatePerformanceMetrics(startTime, success, statusCode) {
  const responseTime = performance.now() - startTime;
  
  if (success) {
    const totalRequests = performanceMetrics.networkRequests + performanceMetrics.cacheHits;
    performanceMetrics.averageResponseTime = 
      (performanceMetrics.averageResponseTime * totalRequests + responseTime) / (totalRequests + 1);
  } else {
    performanceMetrics.errorCount++;
  }
}

async function recordNotificationEvent(event, data) {
  // Queue analytics event
  backgroundSyncQueue.push({
    type: 'ANALYTICS_EVENT',
    data: {
      eventType: 'notification',
      action: event,
      notificationData: data,
      timestamp: Date.now()
    }
  });
  
  // Trigger background sync
  if ('serviceWorker' in navigator && 'sync' in self.registration) {
    await self.registration.sync.register(PERFORMANCE_CONFIG.backgroundSyncTag);
  }
}

function timeStringToMinutes(timeString) {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
}

async function handleMessage(event) {
  const { type, data } = event.data;
  
  switch (type) {
    case 'QUEUE_BACKGROUND_SYNC':
      backgroundSyncQueue.push(data);
      try {
        await self.registration.sync.register(PERFORMANCE_CONFIG.backgroundSyncTag);
      } catch (error) {
        console.log('Background sync registration failed:', error);
      }
      break;
      
    case 'GET_PERFORMANCE_METRICS':
      event.ports[0].postMessage(performanceMetrics);
      break;
      
    case 'CLEAR_CACHE':
      await caches.delete(data.cacheName);
      event.ports[0].postMessage({ success: true });
      break;
      
    case 'PRELOAD_CONTENT':
      await preloadContent(data.urls);
      event.ports[0].postMessage({ success: true });
      break;
  }
}

async function preloadContent(urls) {
  const cache = await caches.open(CACHE_NAMES.dynamic);
  
  const preloadPromises = urls.map(async (url) => {
    try {
      const response = await fetch(url);
      if (response.ok) {
        await cache.put(url, response);
      }
    } catch (error) {
      console.log(`Preload failed for ${url}:`, error.message);
    }
  });
  
  await Promise.allSettled(preloadPromises);
  console.log(`📥 Preloaded ${urls.length} resources`);
}

// ============================================================================
// Service Worker Lifecycle
// ============================================================================

console.log(`🚀 PMPLearningManagement Service Worker ${CACHE_VERSION} loaded`);
console.log('📊 Features: Advanced Caching, Background Sync, Push Notifications, Performance Monitoring');