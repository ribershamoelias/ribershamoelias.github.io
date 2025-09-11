const CACHE_NAME = 'rse-cache-v2';
const OFFLINE_URL = '/offline.html';

const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
  '/assets/img/rse-logo.png',
  '/fachbereiche.html',
  '/kontakt.html',
  '/jobs.html',
  '/karriere.html',
  '/werte-mission-vision.html',
  '/support.html',

  // Services
  '/service-webentwicklung.html',
  '/service-seo-marketing.html',
  '/service-it.html',
  '/service-reparaturen.html',
  '/service-grafiken-werbemittel.html',

  // Rechtliches
  '/legal/impressum.html',
  '/legal/datenschutz.html',
  '/legal/agb.html'
];

// INSTALL → Dateien ins Cache laden
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(FILES_TO_CACHE))
      .catch(err => console.error('Cache error during install', err))
  );
  self.skipWaiting();
});

// ACTIVATE → Alte Caches löschen
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// FETCH → Offline-Fallback & Cache-First Strategie
self.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate') {
    // HTML-Seiten
    event.respondWith(
      fetch(event.request).catch(() => caches.match(OFFLINE_URL))
    );
  } else {
    // Sonstige Assets (Bilder, CSS, JS)
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request).then(fetchRes => {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, fetchRes.clone());
            return fetchRes;
          });
        }).catch(() => {
          // Fallback für Bilder (optional)
          if (event.request.destination === 'image') {
            return caches.match('/assets/img/rse-logo.png');
          }
        });
      })
    );
  }
});
