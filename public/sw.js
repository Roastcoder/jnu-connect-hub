// JNU Connect — basic offline-first service worker
const CACHE = "jnu-connect-v2";
const CORE = ["/manifest.webmanifest", "/icon-192.png", "/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  
  let url;
  try {
    url = new URL(req.url);
  } catch {
    return;
  }
  
  // Ignore unsupported schemes like chrome-extension://, moz-extension://, etc.
  if (url.protocol !== "http:" && url.protocol !== "https:") return;

  // Never cache HTML navigations (SSR), server functions, or API/webhook routes
  if (
    req.mode === "navigate" ||
    url.pathname.startsWith("/_serverFn") ||
    url.pathname.startsWith("/api/")
  ) {
    event.respondWith(
      fetch(req).catch(() => caches.match(req).then((r) => r || caches.match("/")))
    );
    return;
  }

  // Stale-while-revalidate for assets
  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req)
        .then((res) => {
          if (res.ok && (res.type === "basic" || res.type === "cors")) {
            const clone = res.clone();
            caches.open(CACHE).then((c) => {
              c.put(req, clone).catch(() => {});
            }).catch(() => {});
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
