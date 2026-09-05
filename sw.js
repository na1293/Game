const CACHE_NAME = 'my-app-cache-v2';

// Danh sách toàn bộ file local cần lưu để chạy Offline
const STATIC_ASSETS = [
  './',
  './index.html',
  './offline.html',
  './manifest.json',
  
  // CSS
  './css/app.css',
  './css/main_app.css',
  './css/moon.css',
  './css/pop-up-main.css',
  './css/time-table-pop-up-good-ui.css',

  // JS
  './JS/todo-list.js',
  './JS/API_call/api_call.js',
  './JS/FirstFile_schedule.js',
  './JS/time-table.js',
  './JS/u-read-json-time-table.js',
  './JS/time-table-pop-up-good-ui.js',
  './JS/learn_app.js',
  './JS/sayst.js',
  './JS/btday-fr.js',
  './JS/getData.js',
  './JS/storage.js',
  './JS/System_JS/setting_pomodoro.js',
  './JS/main.js'
];

// 1. Cài đặt Service Worker & Pre-cache an toàn
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Lưu từng file một, không để 1 file lỗi làm hỏng toàn bộ
      await Promise.allSettled(
        STATIC_ASSETS.map(async (url) => {
          try {
            await cache.add(url);
          } catch (err) {
            console.warn(`[SW] Chưa lưu được file: ${url}`);
          }
        })
      );
    })
  );
});

// 2. Kích hoạt SW mới & dọn dẹp Cache cũ
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Xử lý Fetch: Cache First -> Network Fallback -> Offline Page
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Trả về file đã lưu trong Cache nếu có
      if (cachedResponse) return cachedResponse;

      // Nếu không có trong Cache thì gọi Network và lưu tự động (Runtime Cache)
      return fetch(event.request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200) {
            return networkResponse;
          }

          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return networkResponse;
        })
        .catch(() => {
          // Khi mất mạng hoàn toàn và truy cập trang chính -> Trả về index.html hoặc offline.html
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html') || caches.match('./offline.html');
          }
        });
    })
  );
});