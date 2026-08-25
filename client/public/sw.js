// MithilaVahan service worker — intentionally conservative.
//
// Goals: make the app installable + give a basic offline shell, WITHOUT ever
// serving stale trip/API data. So:
//   - API calls (/api, /socket.io) are never cached — always go to network.
//   - Page navigations are network-first, falling back to the cached shell
//     only when offline.
//   - Static assets are cached on first fetch (cache-first) for speed.

const CACHE = 'mithilavahan-v1';
const SHELL = ['/', '/index.html', '/icon-192.png', '/icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin GETs. Let everything else (POST, cross-origin
  // map tiles, etc.) pass straight through.
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  // Never cache API or socket traffic.
  if (url.pathname.startsWith('/api') || url.pathname.startsWith('/socket.io')) return;

  // Page navigations: network-first, fall back to cached shell offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Static assets: cache-first, then network (and cache the result).
  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(request, copy)).catch(() => {});
          return res;
        })
    )
  );
});
