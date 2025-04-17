// sw.js

// Increment version AGAIN
const CACHE_NAME = 'surya-namaskar-cache-v5';

// --- List ALL local assets EXPLICITLY using relative paths ---
// (Copied from v4 - this part is correct)
const LOCAL_ASSETS = [
  // Core files
  'index.html', // Assuming served from root, adjust if needed
  'icon.png',
  // Audio files
  'assets/exhale.mp3',
  'assets/hold.mp3',
  'assets/inhale.mp3',
  'assets/soft_beep.mp3',
  // Image files
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
  console.log(`[SW v5] Installing Cache: ${CACHE_NAME}`);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW v5] Caching local assets');
        // Cache ONLY the explicitly listed local assets
        return cache.addAll(LOCAL_ASSETS).catch(err => {
          console.error('[SW v5] Failed to cache one or more local assets during install:', err);
          // Optional: You might want to throw the error to prevent installation if core assets fail
          // throw err;
        });
      })
      .then(() => self.skipWaiting()) // Force activation
  );
});

// Activate event: Clean up old caches
self.addEventListener('activate', (event) => {
  console.log(`[SW v5] Activating Cache: ${CACHE_NAME}`);
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME) // Filter out the current cache
          .map(name => {
            console.log('[SW v5] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim()) // Take control immediately
  );
});


// Fetch event: Cache-first, then Network & Cache strategy for ALL requests
// (Similar to your original v1, but install is more robust)
self.addEventListener('fetch', (event) => {
    // Only handle GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        caches.match(event.request)
          .then(cachedResponse => {
            // Cache hit - return response
            if (cachedResponse) {
                // console.log(`[SW v5] Serving from Cache: ${event.request.url}`);
                return cachedResponse;
            }

            // Not in cache - Fetch from network
            // console.log(`[SW v5] Fetching from Network: ${event.request.url}`);
            return fetch(event.request)
              .then(response => {
                // Check if we received a valid response to cache
                // Allow basic (same-origin) and opaque (cross-origin no-cors like CDNs) responses
                if (!response || response.status !== 200 ) {
                    // Don't cache errors (like 404) or redirects (3xx) by default
                    // If type is 'error', it might be CORS issue or network failure
                    if(response && response.status === 0 && response.type === 'opaque') {
                         // OK to cache opaque responses from CDNs, but be aware you can't inspect them
                    } else if (!response || response.type === 'error' || response.status !== 200) {
                         console.warn(`[SW v5] Not caching invalid response for ${event.request.url}. Status: ${response?.status}, Type: ${response?.type}`);
                         return response; // Return the potentially bad response without caching
                    }
                }

                // Clone the response to cache it
                const responseToCache = response.clone();

                caches.open(CACHE_NAME)
                  .then(cache => {
                    // console.log(`[SW v5] Caching new resource: ${event.request.url}`);
                    cache.put(event.request, responseToCache);
                  })
                  .catch(cacheErr => {
                     console.error(`[SW v5] Failed to cache resource ${event.request.url}:`, cacheErr);
                  });

                return response; // Return the original response to the browser
              })
              .catch(error => {
                console.error(`[SW v5] Fetch failed for ${event.request.url}:`, error);
                // Provide offline fallback ONLY for navigation requests
                if (event.request.mode === 'navigate') {
                  console.log('[SW v5] Returning offline fallback page.');
                  // Ensure 'index.html' is definitely in LOCAL_ASSETS
                  return caches.match('index.html');
                }
                // For failed audio/image etc, just let the error happen
              });
          })
      );
});
