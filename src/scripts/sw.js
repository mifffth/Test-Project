import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute, setCatchHandler } from 'workbox-routing';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';

const manifest = self.__WB_MANIFEST;
precacheAndRoute(manifest);

registerRoute(
  ({ url }) => url.origin === 'https://cdnjs.cloudflare.com' || url.origin.includes('fontawesome'),
  new CacheFirst({
    cacheName: 'fontawesome',
    plugins: [new CacheableResponsePlugin({ statuses: [200] })],
  })
);

registerRoute(
  ({ request }) => ['script', 'style'].includes(request.destination),
  new CacheFirst({
    cacheName: 'assets-cache',
    plugins: [new CacheableResponsePlugin({ statuses: [200] })],
  })
);

registerRoute(
  ({ url }) => url.origin.includes('tile.openstreetmap.org'),
  new StaleWhileRevalidate({
    cacheName: 'osm-tiles',
    plugins: [new CacheableResponsePlugin({ statuses: [200] })],
  })
);

registerRoute(
  ({ url }) => url.origin === 'https://firebasestorage.googleapis.com',
  new StaleWhileRevalidate({
    cacheName: 'firebase-storage-images',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

registerRoute(
  ({ request }) => request.destination === 'image',
  new StaleWhileRevalidate({
    cacheName: 'local-images',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

registerRoute(
  ({ request, url }) => request.mode === 'navigate' && !url.pathname.includes('/login'),
  new NetworkFirst({
    cacheName: 'pages-cache',
    plugins: [new CacheableResponsePlugin({ statuses: [200] })],
  })
);

setCatchHandler(async ({ event }) => {
  if (event.request.mode === 'navigate') {
    return caches.match('/offline.html');
  }
  return Response.error();
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('/') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

// Force activate & claim on install
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());
