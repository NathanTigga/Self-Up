// --- UPDATE THIS VERSION NUMBER WHENEVER YOU CHANGE YOUR CODE ---
const CACHE_NAME = "self-vs-self-v4.9";

const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "https://cdn.jsdelivr.net/npm/chart.js"
];

// 1. Install & Cache new assets
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  // Don't wait, take over immediately when requested
  self.skipWaiting();
});

// 2. Activate: Wipe out old versions completely
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("Removing old cache:", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. Network-First Strategy: Try to get fresh code first, fall back to offline cache
self.addEventListener("fetch", (e) => {
  e.respondWith(
    fetch(e.request)
      .then((networkResponse) => {
        // If network works, update the cache silently
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, networkResponse.clone());
          return networkResponse;
        });
      })
      .catch(() => {
        // If offline, serve from cache
        return caches.match(e.request);
      })
  );
});

// 4. Listen for user prompt to update immediately
self.addEventListener("message", (e) => {
  if (e.data && e.data.action === "skipWaiting") {
    self.skipWaiting();
  }
});