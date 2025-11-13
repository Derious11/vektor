// --------------------------------------------------------
// VEKTOR SERVICE WORKER
// Purpose:
// • Precache core assets
// • Provide offline support
// • Enable lightning-fast reloads
// • Support future push notifications
//
// Safe & production-ready.
// --------------------------------------------------------

const CACHE_NAME = "vektor-cache-v1";

// Files to precache immediately (must be safe to fail)
const PRECACHE_FILES = [
  "/",           
  "/favicon.ico",
  "/manifest.json",  // OK if missing — handled safely
];

// --------------------------------------------------------
// INSTALL — Precache files (safe addAll)
// --------------------------------------------------------
self.addEventListener("install", (event) => {
  console.log("[SW] Install event…");

  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      // Fetch and store each file individually
      const tasks = PRECACHE_FILES.map(async (url) => {
        try {
          const res = await fetch(url);
          if (!res.ok) throw new Error(`Fetch error: ${url}`);
          await cache.put(url, res.clone());
          console.log(`[SW] Cached: ${url}`);
        } catch (err) {
          console.warn(`[SW] Failed to precache: ${url}`, err);
        }
      });

      await Promise.allSettled(tasks);
      self.skipWaiting();
      console.log("[SW] Install complete.");
    })()
  );
});

// --------------------------------------------------------
// ACTIVATE — Clean old caches
// --------------------------------------------------------
self.addEventListener("activate", (event) => {
  console.log("[SW] Activate event…");

  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("[SW] Deleting old cache:", key);
            return caches.delete(key);
          }
        })
      )
    )
  );

  self.clients.claim();
  console.log("[SW] Ready.");
});

// --------------------------------------------------------
// FETCH — Network-first strategy with cache fallback
// --------------------------------------------------------
self.addEventListener("fetch", (event) => {
  // Only cache GET requests
  if (event.request.method !== "GET") return;

  event.respondWith(
    (async () => {
      try {
        // Try network first
        const networkResponse = await fetch(event.request);

        // Update cache in background
        const cache = await caches.open(CACHE_NAME);
        cache.put(event.request, networkResponse.clone());

        return networkResponse;
      } catch (error) {
        // Fallback to cache if offline
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) return cachedResponse;

        // Optional: offline fallback page
        // return caches.match("/offline.html");

        throw error; // Let browser handle failure
      }
    })()
  );
});

// --------------------------------------------------------
// PUSH NOTIFICATIONS (optional but ready)
// --------------------------------------------------------
self.addEventListener("push", (event) => {
  console.log("[SW] Push event received", event.data);

  const data = event.data?.json() || {};
  const title = data.title || "New Notification";
  const body = data.body || "You have an update.";
  const icon = data.icon || "/icon-192.png";

  const options = {
    body,
    icon,
    badge: "/badge-72.png",
    data: data.url || "/",
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// --------------------------------------------------------
// CLICK ON NOTIFICATION
// --------------------------------------------------------
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data || "/";

  event.waitUntil(
    clients.openWindow(targetUrl)
  );
});
