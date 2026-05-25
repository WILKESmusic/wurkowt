const CACHE = 'wurkowt-v3';

self.addEventListener('install', function (e) {
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  var url = e.request.url;
  var isPage = e.request.mode === 'navigate' ||
    url.indexOf('.html') !== -1 ||
    url.endsWith('/wurkowt') ||
    url.endsWith('/wurkowt/');

  if (isPage) {
    e.respondWith(
      fetch(e.request).catch(function () { return caches.match(e.request); })
    );
    return;
  }

  e.respondWith(
    fetch(e.request).then(function (res) {
      return res;
    }).catch(function () {
      return caches.match(e.request);
    })
  );
});
