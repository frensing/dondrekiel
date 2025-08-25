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

// PUSH: Notification anzeigen, wenn Server Push sendet
self.addEventListener('push', event => {
  const payload = event.data ? event.data.json() : { title: 'Dondrekiel: Neue Nachricht', body: 'Du hast eine neue Nachricht', url: '/' };
  const title = payload.title || 'Dondrekiel: Neue Nachricht';
  const options = {
    body: payload.body || '',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    data: { url: payload.url || '/' },
    vibrate: [100, 50, 100]
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification Click: öffne/fokussiere Client
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = event.notification.data && event.notification.data.url ? event.notification.data.url : '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      for (const client of windowClients) {
        if (client.url === url && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});