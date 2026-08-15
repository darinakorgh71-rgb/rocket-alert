self.addEventListener('push', event => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch(e) {}
  const code = data.rocket_code || data.code;
  if (code !== 'ROCKET_KRYVYI_RIH') return;

  const title = data.title || '🚀 РАКЕТА — КРИВИЙ РІГ';
  const options = {
    body: data.body || 'Ракетна загроза. Перевір офіційні повідомлення.',
    tag: 'ROCKET_KRYVYI_RIH',
    renotify: true,
    requireInteraction: true,
    data: { rocket_code: code }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(clients.openWindow('/'));
});
