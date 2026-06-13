const CACHE_NAME = 'hoc-app-v1';
const ASSETS = [
  'index.html',
  'manifest.json',
  'css/app.css'
];

// Cài đặt Service Worker và lưu tài nguyên vào bộ nhớ cache
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Kích hoạt và xóa cache cũ nếu có update
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});

// Bắt các yêu cầu mạng để phản hồi từ cache nếu đang offline
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      return cachedResponse || fetch(e.request);
    })
  );
});