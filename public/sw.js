// Parseltongue Academy's service worker: keeps the castle open offline.
// - Python (public/pyodide) is cached once per Pyodide version (?pyodide= in our URL).
// - Hashed build files (/assets/) never change, so they're cache-first.
// - Pages are network-first, falling back to the cache when offline.
// - Music, the LLM proxy and other sites are never touched.
const PYODIDE = new URL(self.location.href).searchParams.get("pyodide") || "unknown";
const CACHES = { python: `python-${PYODIDE}`, assets: "assets-v1", pages: "pages-v1" };

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keep = new Set(Object.values(CACHES));
      for (const name of await caches.keys()) if (!keep.has(name)) await caches.delete(name);
      await self.clients.claim();
    })(),
  );
});

async function cacheFirst(cacheName, request) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request);
  if (hit) return hit;
  const res = await fetch(request);
  if (res.ok) await cache.put(request, res.clone());
  return res;
}

async function networkFirst(request) {
  const cache = await caches.open(CACHES.pages);
  try {
    const res = await fetch(request);
    if (res.ok) await cache.put(request, res.clone());
    return res;
  } catch (err) {
    const hit = (await cache.match(request)) || (request.mode === "navigate" && (await cache.match(new URL("./", self.registration.scope).href)));
    if (hit) return hit;
    throw err;
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;
  if (request.headers.has("range") || /\.(mp3|ogg|wav|m4a)$/i.test(url.pathname) || url.pathname.includes("/llm/")) return;
  const scope = new URL(self.registration.scope).pathname;
  const path = url.pathname.slice(scope.length);
  if (path.startsWith("pyodide/")) event.respondWith(cacheFirst(CACHES.python, request));
  else if (path.startsWith("assets/")) event.respondWith(cacheFirst(CACHES.assets, request));
  else event.respondWith(networkFirst(request));
});
