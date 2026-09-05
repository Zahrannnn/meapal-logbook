const CACHE_VERSION = 'activity-report-pwa-v1';
const APP_SHELL_CACHE = `${CACHE_VERSION}-shell`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;
const APP_SHELL = ['/', '/index.html', '/manifest.webmanifest', '/icons/icon-192.png', '/icons/icon-512.png', '/icons/icon-192.svg', '/icons/icon-512.svg', '/icons/maskable-icon.svg'];
const IS_LOCAL_DEV = ['localhost', '127.0.0.1'].includes(self.location.hostname);

const isApiRequest = (request) => {
  const url = new URL(request.url);
  return url.pathname.startsWith('/api/') || url.port === '3000';
};

const isStaticAsset = (request) => {
  const url = new URL(request.url);
  return request.destination === 'script' || request.destination === 'style' || request.destination === 'font' || request.destination === 'image' || url.pathname.startsWith('/assets/');
};

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(APP_SHELL_CACHE)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => !key.startsWith(CACHE_VERSION)).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET' || isApiRequest(request)) {
    return;
  }

  if (IS_LOCAL_DEV) {
    if (request.mode === 'navigate') {
      event.respondWith(fetch(request).catch(() => caches.match('/index.html')));
    }

    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(APP_SHELL_CACHE).then((cache) => cache.put('/index.html', copy));
          return response;
        })
        .catch(() => caches.match('/index.html')),
    );
    return;
  }

  if (isStaticAsset(request)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) {
          return cached;
        }

        return fetch(request).then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
          }

          return response;
        });
      }),
    );
  }
});
