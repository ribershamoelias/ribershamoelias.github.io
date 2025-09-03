const CACHE_NAME = 'rse-cache-v1';
const OFFLINE_URL = '/offline.html';

const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/img/rse-logo.png',
  '/offline.html',
  '/fachbereiche.html',
  '/kontakt.html',
  '/jobs.html',
  '/karriere.html',
  '/service-grafiken-werbemittel.png',
  '/legal/impressum.html',
  '/legal/datenschutz.html',
  '/service-webentwicklung.html',
  '/service-seo-marketing.html',
  '/service-it.html',
  '/service-reparaturen.html',
  '/support.html',
  '/werte-mission-vision.html',
  '/legal/agb.html'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keyList =>
      Promise.all(keyList.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key);
      }))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match(OFFLINE_URL))
    );
  } else {
    event.respondWith(
      caches.match(event.request)
        .then(response => response || fetch(event.request))
    );
  }
});