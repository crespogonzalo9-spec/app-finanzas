/* eslint-disable no-restricted-globals */

// Este service worker usa estrategia "Network First" 
// para que siempre busque actualizaciones

const CACHE_NAME = 'monity-v1.0.1';

// Solo cachear assets estáticos
const STATIC_ASSETS = [
  '/static/js/',
  '/static/css/',
  '/static/media/',
];

// Install: no pre-cachear nada
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate: limpiar caches antiguos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Network First para HTML/JS, Cache First para assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Para navegación y documentos HTML: siempre ir a la red
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(
      fetch(request).catch(() => caches.match(request))
    );
    return;
  }

  // Para assets estáticos (JS/CSS compilados): Cache First
  if (STATIC_ASSETS.some(path => url.pathname.includes(path))) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // Para todo lo demás: Network First
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cachear respuestas exitosas
        if (response.ok && request.method === 'GET') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});

// Escuchar mensajes para forzar actualización
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});
