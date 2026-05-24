var CACHE_NAME = 'workout-v9';
var urlsToCache = ['/Workout/', '/Workout/index.html'];

self.addEventListener('install', function(e) {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE_NAME).then(function(cache) {
    return cache.addAll(urlsToCache);
  }));
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.filter(function(k) { return k !== CACHE_NAME; }).map(function(k) { return caches.delete(k); }));
    }).then(function() { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e) {
  e.respondWith(
    fetch(e.request).then(function(response) {
      var clone = response.clone();
      caches.open(CACHE_NAME).then(function(cache) { cache.put(e.request, clone); });
      return response;
    }).catch(function() {
      return caches.match(e.request);
    })
  );
});

// Таймер уведомлений
var notifTimer = null;

self.addEventListener('message', function(e) {
  if (e.data && e.data.type === 'SCHEDULE_NOTIF') {
    if (notifTimer) clearTimeout(notifTimer);
    var sec = e.data.sec;
    var label = e.data.label;
    notifTimer = setTimeout(function() {
      self.registration.showNotification('Отдых окончен! 💪', {
        body: label + ' — время следующего подхода',
        icon: '/Workout/icon.png',
        tag: 'workout-timer',
        renotify: true,
        vibrate: [200, 100, 200]
      });
    }, sec * 1000);
  }
  if (e.data && e.data.type === 'CANCEL_NOTIF') {
    if (notifTimer) clearTimeout(notifTimer);
    notifTimer = null;
  }
});
