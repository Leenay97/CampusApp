self.addEventListener('push', function (event) {
  console.log('[SW] Push получено:', event);

  let data = {
    title: 'Новое уведомление',
    body: 'У вас новое сообщение',
    url: '/',
  };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [200, 100, 200],
    timestamp: Date.now(),
    data: {
      url: data.url || '/',
    },
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  event.waitUntil(clients.openWindow(event.notification.data.url));
});

self.addEventListener('install', function (event) {
  console.log('[SW] Установлен');
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  console.log('[SW] Активирован');
  // event.waitUntil(clients.claim());
});
