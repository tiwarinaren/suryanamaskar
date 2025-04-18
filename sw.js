// sw.js

// Increment version for new changes
const CACHE_NAME = 'surya-namaskar-cache-v6';

// --- List ALL local assets EXPLICITLY using relative paths ---
// Added priority for audio files to ensure they're cached properly for iOS
const LOCAL_ASSETS = [
  // Core files
  'index.html', // Assuming served from root, adjust if needed
  'icon.png',
  // Audio files - prioritized for iOS compatibility
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

// Install event: Cache local assets with special handling for audio files
self.addEventListener('install', (event) => {
  console.log(`[SW v6] Installing Cache: ${CACHE_NAME}`);
  
  // Extract audio files from LOCAL_ASSETS
  const audioAssets = LOCAL_ASSETS.filter(asset => asset.match(/\.(mp3|wav|ogg)$/i));
  const otherAssets = LOCAL_ASSETS.filter(asset => !asset.match(/\.(mp3|wav|ogg)$/i));
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(async cache => {
        console.log('[SW v6] Caching local assets');
        
        // First cache non-audio assets
        try {
          await cache.addAll(otherAssets);
          console.log('[SW v6] Non-audio assets cached successfully');
        } catch (err) {
          console.error('[SW v6] Failed to cache non-audio assets:', err);
        }
        
        // Then cache audio assets individually to ensure they're properly cached
        for (const audioAsset of audioAssets) {
          try {
            const response = await fetch(audioAsset, { cache: 'no-cache' });
            if (response.ok) {
              await cache.put(audioAsset, response);
              console.log(`[SW v6] Audio asset cached: ${audioAsset}`);
            } else {
              console.error(`[SW v6] Failed to fetch audio asset: ${audioAsset}`);
            }
          } catch (err) {
            console.error(`[SW v6] Error caching audio asset ${audioAsset}:`, err);
          }
        }
        
        return Promise.resolve(); // Continue with installation
      })
      .then(() => self.skipWaiting()) // Force activation
  );
});

// Activate event: Clean up old caches
self.addEventListener('activate', (event) => {
  console.log(`[SW v6] Activating Cache: ${CACHE_NAME}`);
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME) // Filter out the current cache
          .map(name => {
            console.log('[SW v6] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => {
      console.log('[SW v6] Claiming clients for immediate control');
      return self.clients.claim(); // Take control immediately
    })
  );
});


// Fetch event: Network-first for audio files, Cache-first for everything else
self.addEventListener('fetch', (event) => {
    // Only handle GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    // Check if the request is for an audio file
    const isAudioRequest = event.request.url.match(/\.(mp3|wav|ogg)$/i);

    // Use network-first strategy for audio files on iOS to ensure they're always fresh
    if (isAudioRequest) {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    // Clone the response to cache it
                    const responseToCache = response.clone();
                    
                    caches.open(CACHE_NAME)
                        .then(cache => {
                            console.log(`[SW v6] Caching audio resource: ${event.request.url}`);
                            cache.put(event.request, responseToCache);
                        })
                        .catch(cacheErr => {
                            console.error(`[SW v6] Failed to cache audio resource ${event.request.url}:`, cacheErr);
                        });
                    
                    return response;
                })
                .catch(error => {
                    console.log(`[SW v6] Network fetch failed for audio, using cache: ${event.request.url}`);
                    return caches.match(event.request);
                })
        );
    } else {
        // For non-audio files, use cache-first strategy
        event.respondWith(
            caches.match(event.request)
                .then(cachedResponse => {
                    // Cache hit - return response
                    if (cachedResponse) {
                        return cachedResponse;
                    }

                    // Not in cache - Fetch from network
                    return fetch(event.request)
                        .then(response => {
                            // Check if we received a valid response to cache
                            if (!response || response.status !== 200) {
                                // Don't cache errors (like 404) or redirects (3xx) by default
                                if (response && response.status === 0 && response.type === 'opaque') {
                                    // OK to cache opaque responses from CDNs
                                } else if (!response || response.type === 'error' || response.status !== 200) {
                                    console.warn(`[SW v6] Not caching invalid response for ${event.request.url}. Status: ${response?.status}, Type: ${response?.type}`);
                                    return response; // Return the potentially bad response without caching
                                }
                            }

                            // Clone the response to cache it
                            const responseToCache = response.clone();

                            caches.open(CACHE_NAME)
                                .then(cache => {
                                    cache.put(event.request, responseToCache);
                                })
                                .catch(cacheErr => {
                                    console.error(`[SW v6] Failed to cache resource ${event.request.url}:`, cacheErr);
                                });

                            return response; // Return the original response to the browser
                        })
                        .catch(error => {
                            console.error(`[SW v6] Fetch failed for ${event.request.url}:`, error);
                            // Provide offline fallback ONLY for navigation requests
                            if (event.request.mode === 'navigate') {
                                console.log('[SW v6] Returning offline fallback page.');
                                return caches.match('index.html');
                            }
                            // For failed image etc, just let the error happen
                        });
                })
        );
    }
});
