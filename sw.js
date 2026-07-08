/* Service worker — app shell cache agar aplikasi ringan & bisa dibuka offline. */
const CACHE = 'pondokone-v3';
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/tokens.css',
  './css/app.css',
  './js/app.js',
  './js/core/i18n.js',
  './js/core/store.js',
  './js/core/ui.js',
  './js/core/auth.js',
  './js/core/settings.js',
  './js/portals/master.js',
  './js/portals/yayasan.js',
  './js/portals/admin.js',
  './js/portals/guru.js',
  './js/portals/ortu.js',
  './assets/icon.svg',
  './assets/icon-maskable.svg',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/icon-maskable-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* Strategi: network-first untuk navigasi & API, cache-first untuk aset shell. */
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;

  if (url.pathname.includes('/v1/')) {
    // API: network only — data final selalu dari server (spesifikasi: status pembayaran dari webhook).
    return;
  }

  e.respondWith(
    caches.match(e.request).then((cached) => {
      const fetched = fetch(e.request)
        .then((res) => {
          if (res.ok) caches.open(CACHE).then((c) => c.put(e.request, res.clone()));
          return res;
        })
        .catch(() => cached);
      return cached || fetched;
    })
  );
});
