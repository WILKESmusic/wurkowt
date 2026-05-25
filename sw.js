const CACHE = 'wurkowt-v2';
const ASSETS = [
  './',
  './index.html',
  './css/styles.css',
  './js/data.js',
  './js/storage.js',
  './js/app.js',
  './manifest.webmanifest',
  './icons/icon.svg',
  './assets/exercises/incline-pushup.svg',
  './assets/exercises/pike-pushup.svg',
  './assets/exercises/plank.svg',
  './assets/exercises/backpack-row.svg',
  './assets/exercises/door-row.svg',
  './assets/exercises/prone-ytw.svg',
  './assets/exercises/reverse-fly.svg',
  './assets/exercises/squat.svg',
  './assets/exercises/lunge.svg',
  './assets/exercises/rdl.svg',
  './assets/exercises/calf.svg',
  './assets/exercises/wall-sit.svg',
  './assets/exercises/glute-bridge.svg',
  './assets/exercises/fire-hydrant.svg',
  './assets/exercises/dead-bug.svg',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then((cached) => {
      const fetched = fetch(e.request)
        .then((res) => {
          if (res && res.status === 200 && res.type === 'basic') {
            const clone = res.clone();
            caches.open(CACHE).then((c) => c.put(e.request, clone));
          }
          return res;
        })
        .catch(() => cached);
      return cached || fetched;
    })
  );
});
