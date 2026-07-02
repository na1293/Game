const CACHE_NAME = 'tram-hoc-tap-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/images/icon-192x192.png',
  '/images/icon-512x512.png',
];

// 1. CÀI ĐẶT
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
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

// 3. ĐÁNH CHẶN REQUEST (Vá lỗi Chiến lược Stale-While-Revalidate)
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        
        // Tạo request mạng để cập nhật cache ngầm
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch((error) => {
            // Nếu CÓ cache, kệ lỗi mạng, ngầm nuốt lỗi để không phá hỏng luồng
            if (cachedResponse) return cachedResponse; 
            
            // Nếu KHÔNG có cache, ném lỗi hoặc trả về giao diện offline chuẩn
            throw error; 
          });

        // TRẢ VỀ NGAY: Nếu có cache thì trả về luôn, mạng tính sau. 
        // Nếu không có cache, đợi fetchPromise (có thể fail và ném lỗi mạng chuẩn)
        return cachedResponse || fetchPromise;
      });
    })
  );
});

// === Pomodoro & Notification Logic ===
// CẢNH BÁO: Biến này chắc chắn sẽ bị xóa khi SW ngủ đông (Idling)!
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