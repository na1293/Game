const CACHE_NAME = 'hoc-app-v3'; // Mỗi lần đổi UI thì đổi tên ver ở đây
const ASSETS = [
  'index.html',
  'manifest.json',
  'css/app.css'
];

// Cài đặt và nạp cache mới (chạy ngầm, user không hề biết)
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  // KHÔNG dùng self.skipWaiting() ở đây nhé!
});

// Kích hoạt và dọn dẹp cache cũ
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('Đã dọn dẹp cache cũ vứt vào sọt rác: ', key);
            return caches.delete(key); // Xóa sạch ver cũ
          }
        })
      );
    })
  );
});

// Phản hồi từ cache
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      return cachedResponse || fetch(e.request);
    })
  );
});