// sw.js

// Increment version number whenever you change the cached assets
const CACHE_NAME = 'surya-namaskar-cache-v3';

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
  'assets/Surya-Namaskar-step-9.jpg',
  // Used for pose 9
];

// Optional: List external assets separately if you want fine-grained control,
// but we will rely on the fetch handler to cache them for simplicity here.
// const EXTERNAL_ASSETS = [
//   'https://cdn.tailwindcss.com',
//   'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
// ];

// Install event: Cache only LOCAL assets initially
self.addEventListener('install', (event) => {
  console.log(`[SW] Installing Cache: ${CACHE_NAME}`);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching local assets');
        // Use addAll with catch for better error handling
        return cache.addAll(LOCAL_ASSETS).catch(err => {
          console.error('[SW] Failed to cache one or more local assets during install:', err);
        });
      })
      .then(() => {
        // Force the waiting service worker to become the active service worker.
        // This ensures updates are applied faster, especially after changes.
        return self.skipWaiting();
      })
  );
});

// Activate event: Clean up old caches
self.addEventListener('activate', (event) => {
  console.log(`[SW] Activating Cache: ${CACHE_NAME}`);
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME) // Filter out the current cache
          .map(name => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => {
        // Tell the active service worker to take control of the page immediately.
        return self.clients.claim();
    })
  );
});


// Fetch event: Cache-first strategy for all requests
self.addEventListener('fetch', (event) => {
    // We only want to handle GET requests
    if (event.request.method !== 'GET') {
        return;
    }

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Cache hit: Return response from cache
        if (cachedResponse) {
          // console.log(`[SW] Serving from Cache: ${event.request.url}`);
          return cachedResponse;
        }

        // Not in cache: Fetch from network
        // console.log(`[SW] Fetching from Network: ${event.request.url}`);
        return fetch(event.request)
          .then(response => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type === 'error') {
                // response.type 'error' occurs for CORS issues etc.
                // response.type 'opaque' is for cross-origin no-cors requests - we *could* cache these but it's risky
              return response; // Return the error response directly
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have two streams.
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                // console.log(`[SW] Caching new resource: ${event.request.url}`);
                cache.put(event.request, responseToCache);
              });

            return response; // Return the original response to the browser
          })
          .catch(error => {
            console.error(`[SW] Fetch failed for ${event.request.url}:`, error);
            // Optional: Offline fallback for specific types
            // Only return index.html for navigation requests to avoid breaking image/css/js requests
            if (event.request.mode === 'navigate') {
              console.log('[SW] Returning offline fallback page.');
              return caches.match('index.html'); // Make sure 'index.html' is cached
            }
            // For other requests (like images, audio), just let the error propagate
            // Returning nothing here effectively simulates a network error for the browser
          });
      })
  );
});
