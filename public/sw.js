// Service Worker: einfacher Cache-first-Strategie mit Aktivierungsbereinigung
const CACHE_NAME = 'dondrekiel-cache-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
  // Füge hier weitere Assets hinzu, z. B. '/css/main.css', '/js/main.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Cache-first, fallback auf Netzwerk
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).catch(() => {
      // Optional: Rückgabe einer Offline-Seite bei HTML-Anfragen
      if (event.request.mode === 'navigate' || (event.request.destination === 'document')) {
        return caches.match('/index.html');
      }
    }))
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow("/nachrichten")
  );
});