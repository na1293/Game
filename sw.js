const CACHE_NAME = 'tram-hoc-tap-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/images/icon-192x192.png',
  '/images/icon-512x512.png',
];

// 1. CÀI ĐẶT
self.addEventListener('install', function onInstall(event) {
  event.waitUntil(
    caches.open(CACHE_NAME + 'offline').then(function prefill(cache) {
      return cache.addAll([
        '/index.html',
        '/manifest.json',
        '/images/icon-192x192.png',
        '/images/icon-512x512.png',
        // etc
      ]);
    })
  );
});

// 2. KÍCH HOẠT
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) return caches.delete(cache);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. ĐÁNH CHẶN REQUEST
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch((error) => {
            if (cachedResponse) return cachedResponse; 
            throw error; 
          });

        return cachedResponse || fetchPromise;
      });
    })
  );
});

// === Pomodoro & Notification Logic ===
let currentTimeout = null;

self.addEventListener('message', (event) => {
  if (event.data.type === 'START_POMODORO') {
    const delay = event.data.endTime - Date.now();
    if (currentTimeout) clearTimeout(currentTimeout);
    
    currentTimeout = setTimeout(triggerAlarm, Math.max(0, delay));
  }

  if (event.data.type === 'STOP_POMODORO') {
    if (currentTimeout) clearTimeout(currentTimeout);
    currentTimeout = null;
  }
});

function triggerAlarm() {
  self.registration.showNotification('Hết giờ học rồi 🎉', {
    body: 'Đứng dậy vươn vai, uống nước xíu rồi nghỉ ngơi nào!',
    icon: 'images/icon-192x192.png',
    vibrate: [200, 100, 200],
    actions: [{ action: 'stop-alarm', title: '🔕 Nghỉ Ngơi' }]
  });
  currentTimeout = null;
}

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(self.clients.openWindow('/'));
});