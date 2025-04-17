// sw.js

// Increment version AGAIN to ensure update
const CACHE_NAME = 'surya-namaskar-cache-v4';

// --- List ALL local assets EXPLICITLY using relative paths ---
const LOCAL_ASSETS = [
  // Core files (relative paths from where sw.js is served)
  'index.html', // Or '/' if index.html is the root document
  'icon.png',
  // Audio files
  'assets/exhale.mp3',
  'assets/hold.mp3',
  'assets/inhale.mp3',
  'assets/soft_beep.mp3',
  // Image files (List ONLY the unique ones needed)
  'assets/Surya-Namaskar-step-1.jpg',
  'assets/Surya-Namaskar-step-2.jpg',
  'assets/Surya-Namaskar-step-3.jpg',
  'assets/Surya-Namaskar-step-4.jpg',
  'assets/Surya-Namaskar-step-5.jpg', // Used for pose 5 & 8
  'assets/Surya-Namaskar-step-6.jpg',
  'assets/Surya-Namaskar-step-7.jpg',
  'assets/Surya-Namaskar-step-9.jpg'  // Used for pose 9
];

// Install event: Cache only LOCAL assets initially
self.addEventListener('install', (event) => {
  console.log(`[SW] Installing Cache: ${CACHE_NAME}`);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching local assets');
        return cache.addAll(LOCAL_ASSETS).catch(err => {
          console.error('[SW] Failed to cache one or more local assets during install:', err);
        });
      })
      .then(() => self.skipWaiting()) // Activate immediately
  );
});

// Activate event: Clean up old caches
self.addEventListener('activate', (event) => {
  console.log(`[SW] Activating Cache: ${CACHE_NAME}`);
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME)
          .map(name => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim()) // Take control immediately
  );
});


// Fetch event: Cache-first strategy, BUT BYPASS for .mp3 files
self.addEventListener('fetch', (event) => {
    // --- ADD THIS CHECK ---
    // If the request is for an MP3 file, let the browser handle it directly
    if (event.request.url.endsWith('.mp3')) {
        // console.log(`[SW] Bypassing SW for: ${event.request.url}`);
        return; // Exit the fetch handler
    }
    // ----------------------

    // We only want to handle GET requests for other assets
    if (event.request.method !== 'GET') {
        return;
    }

    // Proceed with Cache-First for non-MP3 assets
    event.respondWith(
        caches.match(event.request)
          .then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse;
            }
            return fetch(event.request)
              .then(response => {
                if (!response || response.status !== 200 || response.type === 'error') {
                  return response;
                }
                const responseToCache = response.clone();
                caches.open(CACHE_NAME)
                  .then(cache => {
                    cache.put(event.request, responseToCache);
                  });
                return response;
              })
              .catch(error => {
                console.error(`[SW] Fetch failed for ${event.request.url}:`, error);
                if (event.request.mode === 'navigate') {
                  return caches.match('index.html');
                }
              });
          })
      );
});
