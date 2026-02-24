const CACHE_NAME = 'sight-reading-v3';
const ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/app.js',
  './js/config.js',
  './js/noteGenerator.js',
  './js/quizManager.js',
  './js/uiController.js',
  './js/staffRenderer.js',
  './js/midiHandler.js',
  './js/progressManager.js',
  './js/timerManager.js',
  './js/gamificationManager.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

// Cache local assets on install, fetch VexFlow from network
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Clean up old caches on activate
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-first for HTML and JS (so updates load without hard refresh), cache-first for static assets
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // Network-first for external resources (VexFlow CDN)
  if (url.origin !== location.origin) {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // Network-first for HTML and JS so code changes load on normal refresh
  const isHtmlOrJs = e.request.mode === 'navigate' ||
    url.pathname.endsWith('.html') ||
    (url.pathname.startsWith('/js/') && url.pathname.endsWith('.js'));
  if (isHtmlOrJs) {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // Cache-first for CSS, icons, and other static assets
  e.respondWith(
    caches.match(e.request).then((cached) => {
      return cached || fetch(e.request).then((res) => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
        return res;
      });
    })
  );
});
