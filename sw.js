const CACHE_NAME = 'controle-pacientes-v1';
const urlsToCache = [
  '/Listadepacientes/',
  '/Listadepacientes/index.html',
  '/Listadepacientes/css/style.css',
  '/Listadepacientes/js/app.js',
  '/Listadepacientes/manifest.json',
  '/Listadepacientes/icons/icon-192x192.png',
  '/Listadepacientes/icons/icon-512x512.png'
];

// Instalar o service worker
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Cache aberto');
        return cache.addAll(urlsToCache);
      })
  );
});

// Buscar recursos do cache
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - retorna a resposta
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

// Atualizar o service worker
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});