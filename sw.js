// --- UPDATE THIS VERSION NUMBER WHENEVER YOU CHANGE YOUR CODE ---
const CACHE_NAME = "self-vs-self-v5.3";

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
      .then((response) => {
        // Only cache full 200 OK responses, ignore 206 partial streams & .mp3
        if (response.status === 200 && !e.request.url.endsWith(".mp3")) {
          const resClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, resClone);
          });
        }
        return response;
      })
      .catch(() => caches.match(e.request))
  );
});

// 4. Listen for user prompt to update immediately
self.addEventListener("message", (e) => {
  if (e.data && e.data.action === "skipWaiting") {
    self.skipWaiting();
  }
});