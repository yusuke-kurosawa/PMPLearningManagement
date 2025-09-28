// PMP Learning Management System - Service Worker
// Version: 2.2.0-cache-reset
// PHASE 1: Complete cache reset - This version will uninstall all previous caches
// Updated: 2025-09-28 - Force complete cache clear
//
// DEPLOYMENT INSTRUCTIONS:
// 1. Copy this file to sw.js
// 2. Deploy to production
// 3. Wait 5-10 minutes for all users to get the update
// 4. Then deploy Phase 2 (sw-phase2.js)

const CACHE_VERSION = '2.2.0-reset';

// Install event - skip waiting immediately
self.addEventListener('install', (event) => {
  console.log('[SW Phase 1] Installing cache reset service worker v' + CACHE_VERSION);
  self.skipWaiting();
});

// Activate event - delete ALL caches
self.addEventListener('activate', (event) => {
  console.log('[SW Phase 1] Activating - clearing ALL caches');

  event.waitUntil(
    (async () => {
      try {
        // Get all cache names
        const cacheNames = await caches.keys();
        console.log('[SW Phase 1] Found ' + cacheNames.length + ' caches to delete:', cacheNames);

        // Delete ALL caches
        await Promise.all(
          cacheNames.map((cacheName) => {
            console.log('[SW Phase 1] Deleting cache:', cacheName);
            return caches.delete(cacheName);
          })
        );

        console.log('[SW Phase 1] All caches deleted successfully');

        // Take control of all clients immediately
        await self.clients.claim();

        // Notify all clients that caches have been cleared
        const allClients = await self.clients.matchAll();
        allClients.forEach(client => {
          client.postMessage({
            type: 'CACHE_CLEARED',
            version: CACHE_VERSION,
            phase: 1,
            timestamp: Date.now()
          });
        });

        console.log('[SW Phase 1] Cache reset complete. Ready for Phase 2 deployment.');
      } catch (error) {
        console.error('[SW Phase 1] Cache cleanup failed:', error);
      }
    })()
  );
});

// Fetch event - bypass cache completely, always use network
self.addEventListener('fetch', (event) => {
  // No caching at all - always fetch from network
  event.respondWith(
    fetch(event.request).catch(error => {
      console.error('[SW Phase 1] Fetch failed:', event.request.url);
      // Return a basic offline response
      return new Response('Offline - fetching from network failed', {
        status: 503,
        statusText: 'Service Unavailable',
        headers: new Headers({
          'Content-Type': 'text/plain',
        }),
      });
    })
  );
});

// Handle messages
self.addEventListener('message', (event) => {
  if (!event.data) return;

  console.log('[SW Phase 1] Message received:', event.data.type);

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data.type === 'GET_STATUS') {
    if (event.ports && event.ports[0]) {
      event.ports[0].postMessage({
        version: CACHE_VERSION,
        phase: 1,
        status: 'cache-reset'
      });
    }
  }
});

console.log('[SW Phase 1] Service Worker loaded - Version:', CACHE_VERSION);