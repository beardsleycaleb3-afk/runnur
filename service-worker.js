/**
 * Service Worker for SOVEREIGN ENGINE PWA
 * Enables offline gameplay and asset caching
 * Version: 1.0.0
 */

const CACHE_NAME = 'sovereign-engine-v1';
const RUNTIME_CACHE = 'sovereign-runtime-v1';
const STATIC_ASSETS = [
  '/runnur/',
  '/runnur/index.html',
  '/runnur/manifest.json',
  'https://esm.sh/three@0.177.0'
];

// Install: Cache essential assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching static assets');
      return cache.addAll(STATIC_ASSETS).catch(err => {
        console.warn('[Service Worker] Some assets failed to cache:', err);
        return cache.addAll(STATIC_ASSETS.filter(url => !url.includes('esm.sh')));
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate: Clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Network first, then cache fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip external URLs (unless Three.js)
  if (!url.pathname.includes('/runnur') && !url.hostname.includes('esm.sh')) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache successful responses for runtime assets
        if (response.ok && (url.hostname.includes('esm.sh') || url.pathname.includes('/runnur'))) {
          const cache = caches.open(RUNTIME_CACHE);
          cache.then((c) => c.put(request, response.clone()));
        }
        return response;
      })
      .catch(() => {
        // Fall back to cache on network error
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            console.log('[Service Worker] Serving from cache:', request.url);
            return cachedResponse;
          }
          // Return offline page if available
          return caches.match('/runnur/index.html');
        });
      })
  );
});

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.delete(RUNTIME_CACHE).then(() => {
      console.log('[Service Worker] Runtime cache cleared');
    });
  }
});

console.log('[Service Worker] Loaded');