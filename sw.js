const CACHE_NAME = 'hoc-app-v3'; // Mỗi lần đổi UI thì đổi số ở đây và đổi cả đuôi ?v= ở index.html nhé!

// GOM ĐỦ HÀNG: Phải có mặt toàn bộ file cốt lõi của app
const ASSETS = [
  'index.html',
  'manifest.json',
  'css/app.css',
  'css/main_app.css',     // Bổ sung file này
  'JS/learn_app.js',      // Bổ sung file này
  'JS/search.js',         // Bổ sung file này
  'JS/sayst.js'           // Bổ sung file này
];

// Cài đặt và nạp cache mới
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Kích hoạt và dọn dẹp cache cũ khi đóng app vào lại
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('Đã dọn dẹp cache cũ vứt vào sọt rác: ', key);
            return caches.delete(key); 
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