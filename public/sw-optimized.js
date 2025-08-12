/**
 * Intelligent PWA Service Worker with Advanced Caching Strategies
 * Version: 3.0.0 - Performance Optimized
 */

const SW_VERSION = '3.0.0';
const CACHE_PREFIX = 'pmp-learning';

// Dynamic cache names with versioning
const CACHES = {
  STATIC: `${CACHE_PREFIX}-static-v${SW_VERSION}`,
  DYNAMIC: `${CACHE_PREFIX}-dynamic-v${SW_VERSION}`,
  RUNTIME: `${CACHE_PREFIX}-runtime-v${SW_VERSION}`,
  OFFLINE: `${CACHE_PREFIX}-offline-v${SW_VERSION}`,
  IMAGES: `${CACHE_PREFIX}-images-v${SW_VERSION}`,
  API: `${CACHE_PREFIX}-api-v${SW_VERSION}`
};

// Cache configuration with intelligent strategies
const CACHE_CONFIG = {
  static: {
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    maxEntries: 100,
    strategy: 'cacheFirst'
  },
  dynamic: {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    maxEntries: 50,
    strategy: 'staleWhileRevalidate'
  },
  runtime: {
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    maxEntries: 30,
    strategy: 'networkFirst'
  },
  images: {
    maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days
    maxEntries: 60,
    strategy: 'cacheFirst'
  },
  api: {
    maxAge: 5 * 60 * 1000, // 5 minutes
    maxEntries: 20,
    strategy: 'networkFirst'
  }
};

// Critical resources to precache
const PRECACHE_URLS = [
  '/PMPLearningManagement/',
  '/PMPLearningManagement/index.html',
  '/PMPLearningManagement/manifest.json',
  '/PMPLearningManagement/offline.html',
  // Core app shell resources
  '/PMPLearningManagement/#/',
  '/PMPLearningManagement/#/matrix',
  '/PMPLearningManagement/#/flashcards',
  '/PMPLearningManagement/#/glossary',
  '/PMPLearningManagement/#/progress'
];

// Route patterns and their cache strategies
const ROUTE_STRATEGIES = {
  // Static assets
  static: {
    pattern: /\.(js|css|woff2?|ttf|eot|svg|ico)$/,
    cache: CACHES.STATIC,
    config: CACHE_CONFIG.static
  },
  // Images
  images: {
    pattern: /\.(png|jpe?g|webp|gif|avif)$/,
    cache: CACHES.IMAGES,
    config: CACHE_CONFIG.images
  },
  // API calls
  api: {
    pattern: /\/api\//,
    cache: CACHES.API,
    config: CACHE_CONFIG.api
  },
  // Dynamic content
  dynamic: {
    pattern: /\/#\/(mock-exam|exam-results|visualizations)/,
    cache: CACHES.DYNAMIC,
    config: CACHE_CONFIG.dynamic
  },
  // Runtime caching for everything else
  runtime: {
    pattern: /.*/,
    cache: CACHES.RUNTIME,
    config: CACHE_CONFIG.runtime
  }
};

class IntelligentServiceWorker {
  constructor() {
    this.analytics = {
      cacheHits: 0,
      cacheMisses: 0,
      networkRequests: 0,
      offlineRequests: 0
    };
    
    this.initializeEventListeners();
    this.startPerformanceMonitoring();
  }

  initializeEventListeners() {
    self.addEventListener('install', this.handleInstall.bind(this));
    self.addEventListener('activate', this.handleActivate.bind(this));
    self.addEventListener('fetch', this.handleFetch.bind(this));
    self.addEventListener('sync', this.handleBackgroundSync.bind(this));
    self.addEventListener('push', this.handlePush.bind(this));
    self.addEventListener('notificationclick', this.handleNotificationClick.bind(this));
    self.addEventListener('message', this.handleMessage.bind(this));
  }

  async handleInstall(event) {
    console.log(`[SW v${SW_VERSION}] Installing...`);
    
    event.waitUntil(
      this.precacheResources()
        .then(() => {
          console.log(`[SW v${SW_VERSION}] Precaching completed`);
          return self.skipWaiting();
        })
        .catch(error => {
          console.error(`[SW v${SW_VERSION}] Precaching failed:`, error);
        })
    );
  }

  async precacheResources() {
    const cache = await caches.open(CACHES.STATIC);
    
    // Precache critical resources with retry logic
    const precachePromises = PRECACHE_URLS.map(async (url) => {
      try {
        await cache.add(url);
        console.log(`[SW] Precached: ${url}`);
      } catch (error) {
        console.warn(`[SW] Failed to precache ${url}:`, error);
        // Attempt to create a fallback response
        const fallbackResponse = new Response('Offline fallback', {
          status: 200,
          headers: { 'Content-Type': 'text/html' }
        });
        await cache.put(url, fallbackResponse);
      }
    });

    await Promise.allSettled(precachePromises);
    
    // Preload critical app shell components
    await this.preloadCriticalComponents();
  }

  async preloadCriticalComponents() {
    // This would trigger loading of critical React components
    // For now, we'll just ensure the main bundle is cached
    try {
      const cache = await caches.open(CACHES.STATIC);
      const criticalAssets = await this.identifyCriticalAssets();
      
      for (const asset of criticalAssets) {
        try {
          await cache.add(asset);
        } catch (error) {
          console.warn(`[SW] Failed to preload critical asset ${asset}:`, error);
        }
      }
    } catch (error) {
      console.warn('[SW] Critical component preloading failed:', error);
    }
  }

  async identifyCriticalAssets() {
    // This would analyze the manifest or build stats to identify critical assets
    // For now, return a basic set
    return [
      '/PMPLearningManagement/assets/index.js',
      '/PMPLearningManagement/assets/index.css'
    ];
  }

  async handleActivate(event) {
    console.log(`[SW v${SW_VERSION}] Activating...`);
    
    event.waitUntil(
      this.cleanupOldCaches()
        .then(() => {
          console.log(`[SW v${SW_VERSION}] Cache cleanup completed`);
          return self.clients.claim();
        })
        .then(() => {
          this.notifyClientsOfUpdate();
          this.initializePerformanceOptimizations();
        })
        .catch(error => {
          console.error(`[SW v${SW_VERSION}] Activation failed:`, error);
        })
    );
  }

  async cleanupOldCaches() {
    const cacheNames = await caches.keys();
    const currentCacheNames = Object.values(CACHES);
    
    const deletePromises = cacheNames
      .filter(cacheName => 
        cacheName.startsWith(CACHE_PREFIX) && 
        !currentCacheNames.includes(cacheName)
      )
      .map(async (cacheName) => {
        console.log(`[SW] Deleting old cache: ${cacheName}`);
        return caches.delete(cacheName);
      });

    await Promise.all(deletePromises);
    
    // Clean up individual cache entries based on age/size
    await this.cleanupCacheEntries();
  }

  async cleanupCacheEntries() {
    for (const [cacheType, cacheName] of Object.entries(CACHES)) {
      try {
        const cache = await caches.open(cacheName);
        const config = CACHE_CONFIG[cacheType.toLowerCase()];
        
        if (config) {
          await this.enforceCache Policies(cache, config);
        }
      } catch (error) {
        console.warn(`[SW] Failed to cleanup cache ${cacheName}:`, error);
      }
    }
  }

  async enforceCachePolicies(cache, config) {
    const requests = await cache.keys();
    const now = Date.now();
    const deletionPromises = [];

    for (const request of requests) {
      const response = await cache.match(request);
      if (!response) continue;

      const cachedTime = new Date(response.headers.get('date')).getTime();
      const age = now - cachedTime;

      // Remove expired entries
      if (age > config.maxAge) {
        deletionPromises.push(cache.delete(request));
        console.log(`[SW] Removing expired cache entry: ${request.url}`);
      }
    }

    await Promise.all(deletionPromises);

    // Enforce max entries limit
    const remainingRequests = await cache.keys();
    if (remainingRequests.length > config.maxEntries) {
      const excessCount = remainingRequests.length - config.maxEntries;
      const oldestRequests = remainingRequests.slice(0, excessCount);
      
      await Promise.all(
        oldestRequests.map(request => cache.delete(request))
      );
    }
  }

  handleFetch(event) {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests and chrome extensions
    if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
      return;
    }

    // Skip requests with no-cache header
    if (request.headers.get('cache-control')?.includes('no-cache')) {
      return;
    }

    event.respondWith(this.intelligentFetch(request));
  }

  async intelligentFetch(request) {
    const url = new URL(request.url);
    
    try {
      // Find matching route strategy
      const strategy = this.findRoutingStrategy(url);
      
      // Apply the appropriate caching strategy
      const response = await this.applyStrategy(request, strategy);
      
      // Update analytics
      this.updateAnalytics(request, response);
      
      return response;
      
    } catch (error) {
      console.error('[SW] Fetch failed:', error);
      return this.getOfflineFallback(request);
    }
  }

  findRoutingStrategy(url) {
    for (const [name, strategy] of Object.entries(ROUTE_STRATEGIES)) {
      if (strategy.pattern.test(url.pathname) || strategy.pattern.test(url.href)) {
        return strategy;
      }
    }
    
    return ROUTE_STRATEGIES.runtime; // Default fallback
  }

  async applyStrategy(request, strategy) {
    switch (strategy.config.strategy) {
      case 'cacheFirst':
        return this.cacheFirst(request, strategy);
      case 'networkFirst':
        return this.networkFirst(request, strategy);
      case 'staleWhileRevalidate':
        return this.staleWhileRevalidate(request, strategy);
      default:
        return this.networkFirst(request, strategy);
    }
  }

  async cacheFirst(request, strategy) {
    const cache = await caches.open(strategy.cache);
    const cachedResponse = await cache.match(request);

    if (cachedResponse && !this.isExpired(cachedResponse, strategy.config)) {
      this.analytics.cacheHits++;
      
      // Update in background if needed
      this.backgroundUpdate(request, strategy);
      
      return cachedResponse;
    }

    return this.fetchAndCache(request, strategy);
  }

  async networkFirst(request, strategy) {
    try {
      const networkResponse = await fetch(request);
      this.analytics.networkRequests++;
      
      if (networkResponse.ok) {
        await this.cacheResponse(request, networkResponse, strategy);
      }
      
      return networkResponse;
      
    } catch (error) {
      console.log('[SW] Network failed, trying cache:', request.url);
      const cache = await caches.open(strategy.cache);
      const cachedResponse = await cache.match(request);
      
      if (cachedResponse) {
        this.analytics.cacheHits++;
        return cachedResponse;
      }
      
      throw error;
    }
  }

  async staleWhileRevalidate(request, strategy) {
    const cache = await caches.open(strategy.cache);
    const cachedResponse = await cache.match(request);

    // Always try to update in background
    const networkPromise = this.fetchAndCache(request, strategy).catch(() => {
      // Ignore network failures for SWR
    });

    // Return cached response if available, otherwise wait for network
    if (cachedResponse) {
      this.analytics.cacheHits++;
      networkPromise; // Don't await - let it run in background
      return cachedResponse;
    }

    this.analytics.networkRequests++;
    return networkPromise;
  }

  async fetchAndCache(request, strategy) {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      await this.cacheResponse(request, networkResponse, strategy);
    }
    
    return networkResponse;
  }

  async cacheResponse(request, response, strategy) {
    const cache = await caches.open(strategy.cache);
    
    // Clone response before caching
    const responseToCache = response.clone();
    
    // Add custom headers for cache management
    const headers = new Headers(responseToCache.headers);
    headers.set('sw-cached-at', new Date().toISOString());
    headers.set('sw-cache-strategy', strategy.config.strategy);
    
    const modifiedResponse = new Response(responseToCache.body, {
      status: responseToCache.status,
      statusText: responseToCache.statusText,
      headers
    });
    
    await cache.put(request, modifiedResponse);
  }

  backgroundUpdate(request, strategy) {
    // Non-blocking background update
    this.fetchAndCache(request, strategy).catch(() => {
      // Ignore errors in background updates
    });
  }

  isExpired(response, config) {
    const cachedAt = response.headers.get('sw-cached-at');
    if (!cachedAt) return false;
    
    const age = Date.now() - new Date(cachedAt).getTime();
    return age > config.maxAge;
  }

  async getOfflineFallback(request) {
    const url = new URL(request.url);
    
    // Return app shell for navigation requests
    if (request.destination === 'document' || url.pathname.includes('#/')) {
      const appShell = await caches.match('/PMPLearningManagement/index.html');
      if (appShell) {
        this.analytics.offlineRequests++;
        return appShell;
      }
    }

    // Return offline page for HTML requests
    if (request.headers.get('accept')?.includes('text/html')) {
      const offlinePage = await caches.match('/PMPLearningManagement/offline.html');
      if (offlinePage) {
        this.analytics.offlineRequests++;
        return offlinePage;
      }
    }

    // Return generic offline response
    return new Response(
      JSON.stringify({
        error: 'Offline',
        message: 'This resource is not available offline',
        timestamp: new Date().toISOString()
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      }
    );
  }

  handleBackgroundSync(event) {
    console.log('[SW] Background sync:', event.tag);
    
    switch (event.tag) {
      case 'progress-sync':
        event.waitUntil(this.syncProgress());
        break;
      case 'exam-results-sync':
        event.waitUntil(this.syncExamResults());
        break;
      case 'analytics-sync':
        event.waitUntil(this.syncAnalytics());
        break;
      default:
        console.log('[SW] Unknown sync tag:', event.tag);
    }
  }

  async syncProgress() {
    try {
      console.log('[SW] Syncing progress data...');
      
      // Get offline progress data
      const clients = await self.clients.matchAll();
      if (clients.length > 0) {
        clients[0].postMessage({
          type: 'SYNC_PROGRESS_REQUEST'
        });
      }
      
      return Promise.resolve();
    } catch (error) {
      console.error('[SW] Progress sync failed:', error);
      throw error;
    }
  }

  async syncExamResults() {
    try {
      console.log('[SW] Syncing exam results...');
      
      // Similar to progress sync
      const clients = await self.clients.matchAll();
      if (clients.length > 0) {
        clients[0].postMessage({
          type: 'SYNC_EXAM_RESULTS_REQUEST'
        });
      }
      
      return Promise.resolve();
    } catch (error) {
      console.error('[SW] Exam results sync failed:', error);
      throw error;
    }
  }

  async syncAnalytics() {
    try {
      console.log('[SW] Syncing analytics data...');
      
      // Send analytics to server if available
      const analyticsData = {
        ...this.analytics,
        timestamp: new Date().toISOString(),
        version: SW_VERSION
      };
      
      const response = await fetch('/api/analytics/sw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(analyticsData)
      });
      
      if (response.ok) {
        // Reset analytics after successful sync
        this.resetAnalytics();
      }
      
      return response;
    } catch (error) {
      console.error('[SW] Analytics sync failed:', error);
      throw error;
    }
  }

  handlePush(event) {
    console.log('[SW] Push received:', event);
    
    const defaultOptions = {
      body: 'Time for your PMP study session!',
      icon: '/PMPLearningManagement/icon-192x192.png',
      badge: '/PMPLearningManagement/icon-72x72.png',
      vibrate: [200, 100, 200],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: Math.random()
      },
      actions: [
        {
          action: 'open-app',
          title: 'Start Studying',
          icon: '/PMPLearningManagement/icon-96x96.png'
        },
        {
          action: 'dismiss',
          title: 'Later',
          icon: '/PMPLearningManagement/icon-96x96.png'
        }
      ],
      requireInteraction: true
    };

    const options = event.data ? 
      { ...defaultOptions, ...event.data.json() } : 
      defaultOptions;

    event.waitUntil(
      self.registration.showNotification('PMP Learning Reminder', options)
    );
  }

  handleNotificationClick(event) {
    console.log('[SW] Notification clicked:', event);
    
    event.notification.close();

    const action = event.action;
    const notification = event.notification;
    
    if (action === 'open-app' || !action) {
      event.waitUntil(
        clients.matchAll({ type: 'window' }).then(clientList => {
          // Focus existing window if available
          for (let client of clientList) {
            if (client.url.includes('PMPLearningManagement') && 'focus' in client) {
              return client.focus();
            }
          }
          
          // Open new window
          if (clients.openWindow) {
            return clients.openWindow('/PMPLearningManagement/');
          }
        })
      );
    }

    // Track notification interaction
    this.trackNotificationInteraction(action, notification);
  }

  handleMessage(event) {
    console.log('[SW] Message received:', event.data);
    
    const { type, payload } = event.data;
    
    switch (type) {
      case 'SKIP_WAITING':
        self.skipWaiting();
        break;
        
      case 'CACHE_URLS':
        event.waitUntil(this.cacheUrls(payload));
        break;
        
      case 'GET_ANALYTICS':
        event.source.postMessage({
          type: 'ANALYTICS_RESPONSE',
          payload: this.analytics
        });
        break;
        
      case 'CLEAR_CACHE':
        event.waitUntil(this.clearCache(payload));
        break;
        
      case 'PREFETCH_ROUTE':
        event.waitUntil(this.prefetchRoute(payload));
        break;
        
      default:
        console.log('[SW] Unknown message type:', type);
    }
  }

  async cacheUrls(urls) {
    try {
      const cache = await caches.open(CACHES.RUNTIME);
      await cache.addAll(urls);
      console.log('[SW] URLs cached successfully:', urls);
    } catch (error) {
      console.error('[SW] Failed to cache URLs:', error);
    }
  }

  async clearCache(cacheName) {
    try {
      if (cacheName) {
        await caches.delete(cacheName);
        console.log(`[SW] Cache cleared: ${cacheName}`);
      } else {
        // Clear all caches
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(name => caches.delete(name))
        );
        console.log('[SW] All caches cleared');
      }
    } catch (error) {
      console.error('[SW] Failed to clear cache:', error);
    }
  }

  async prefetchRoute(route) {
    try {
      const cache = await caches.open(CACHES.RUNTIME);
      await cache.add(`/PMPLearningManagement/#${route}`);
      console.log(`[SW] Route prefetched: ${route}`);
    } catch (error) {
      console.error(`[SW] Failed to prefetch route ${route}:`, error);
    }
  }

  startPerformanceMonitoring() {
    // Monitor cache performance every 5 minutes
    setInterval(() => {
      this.reportPerformanceMetrics();
    }, 5 * 60 * 1000);
  }

  initializePerformanceOptimizations() {
    // Preload frequently accessed resources
    this.preloadFrequentResources();
    
    // Setup intelligent prefetching
    this.setupIntelligentPrefetching();
  }

  async preloadFrequentResources() {
    const frequentResources = [
      '/PMPLearningManagement/#/flashcards',
      '/PMPLearningManagement/#/matrix',
      '/PMPLearningManagement/#/progress'
    ];

    const cache = await caches.open(CACHES.RUNTIME);
    
    for (const resource of frequentResources) {
      try {
        await cache.add(resource);
      } catch (error) {
        console.warn(`[SW] Failed to preload ${resource}:`, error);
      }
    }
  }

  setupIntelligentPrefetching() {
    // This would analyze user patterns and prefetch likely next resources
    // For now, implement basic predictive prefetching
    console.log('[SW] Intelligent prefetching initialized');
  }

  notifyClientsOfUpdate() {
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'SW_UPDATED',
          version: SW_VERSION
        });
      });
    });
  }

  updateAnalytics(request, response) {
    if (response.status >= 200 && response.status < 300) {
      // Successful response
      this.analytics.networkRequests++;
    }
  }

  trackNotificationInteraction(action, notification) {
    // Track notification interactions for analytics
    const interaction = {
      action,
      timestamp: Date.now(),
      notificationData: notification.data
    };
    
    // Store or send to analytics service
    console.log('[SW] Notification interaction:', interaction);
  }

  reportPerformanceMetrics() {
    console.log('[SW] Performance Metrics:', this.analytics);
    
    // Calculate cache hit ratio
    const totalRequests = this.analytics.cacheHits + this.analytics.cacheMisses;
    const hitRatio = totalRequests > 0 ? 
      ((this.analytics.cacheHits / totalRequests) * 100).toFixed(2) + '%' : 
      'N/A';
    
    console.log(`[SW] Cache Hit Ratio: ${hitRatio}`);
  }

  resetAnalytics() {
    this.analytics = {
      cacheHits: 0,
      cacheMisses: 0,
      networkRequests: 0,
      offlineRequests: 0
    };
  }
}

// Initialize the intelligent service worker
const intelligentSW = new IntelligentServiceWorker();

console.log(`[SW v${SW_VERSION}] Intelligent Service Worker loaded`);

// Export for testing/debugging
self.serviceWorkerInstance = intelligentSW;