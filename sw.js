/* WhaleChat service worker — offline shell + notification click routing */
const CACHE = 'whalechat-v1';
const ASSETS = [
  './whalechat.html', './manifest.webmanifest',
  './assets/logo.png', './assets/whale.jpg', './assets/hero.jpg',
  './assets/icon-192.png', './assets/icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()).catch(() => {}));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  // network-first for the app shell so updates land quickly, cache fallback offline
  if (req.mode === 'navigate' || url.pathname.endsWith('whalechat.html')) {
    e.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
        return res;
      }).catch(() => caches.match(req).then(r => r || caches.match('./whalechat.html')))
    );
    return;
  }
  e.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {}); }
      return res;
    }).catch(() => cached))
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const link = (event.notification.data && event.notification.data.link) || '#/home';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const client of list) {
        if ('focus' in client) { client.navigate(client.url.split('#')[0] + link); return client.focus(); }
      }
      return self.clients.openWindow('./whalechat.html' + link);
    })
  );
});

self.addEventListener('push', (event) => {
  let data = { title: 'WhaleChat', body: 'You have a new update.' };
  try { if (event.data) data = Object.assign(data, event.data.json()); } catch (e) {}
  event.waitUntil(self.registration.showNotification(data.title, {
    body: data.body, icon: './assets/icon-192.png', badge: './assets/icon-192.png',
    data: { link: data.link || '#/home' }
  }));
});
