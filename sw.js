const CACHE_NAME = 'tram-hoc-tap-v1';
// Liệt kê các file quan trọng cần chạy offline ở đây
const ASSETS_TO_CACHE = [
  '/',              // Đại diện cho trang chủ (nó sẽ tự hiểu là index.html)
  '/index.html',    // Chỉ định đích danh file HTML gốc
  '/manifest.json',  // File cấu hình PWA để cài đặt app
  '/images/icon-192x192.png', // Icon PWA
  '/images/icon-512x512.png', // Icon PWA
];
let currentTimeout = null;
let targetEndTime = null;

// Quản lý thông báo sự kiện từ Sheets
let scheduledPushConfig = null;
let scheduleCheckInterval = null;

// 1. CÀI ĐẶT: Lưu các file vào bộ nhớ Cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => {
      // Ép SW mới kích hoạt ngay lập tức, không bắt user tắt hết tab cũ
      return self.skipWaiting();
    })
  );
});

// 2. KÍCH HOẠT: Dọn dẹp cache cũ khi có version mới
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('🗑️ Đang xóa cache cũ:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => {
      // Giúp SW kiểm soát app ngay lập tức mà không cần reload
      return self.clients.claim();
    })
  );
});

// 3. ĐÁNH CHẶN REQUEST: Trả file offline nếu mất mạng (Network First, Fallback to Cache)
self.addEventListener('fetch', (event) => {
  // Chỉ handle các request GET thông thường, bỏ qua các request đến Sheets API hoặc Chrome extensions
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Nếu mạng ngon, lưu lại bản mới nhất vào cache rồi trả về cho user
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Nếu sập mạng, lôi từ trong cache ra dùng
        return caches.match(event.request);
      })
  );
});

// === Pomodoro code ===
self.addEventListener('message', (event) => {
  // TIẾP NHẬN LỊCH THÔNG BÁO LINH HOẠT
  if (event.data.type === 'SET_SCHEDULED_PUSH') {
    scheduledPushConfig = event.data.schedule;
    if (scheduleCheckInterval) clearInterval(scheduleCheckInterval);
    scheduleCheckInterval = setInterval(() => {
      checkAndTriggerScheduledPush();
    }, 30000); 
  }

  if (event.data === 'SKIP_WAITING_FORCE') {
    self.skipWaiting();
  }

  // ĐIỀU KHIỂN POMODORO
  if (event.data.type === 'START_POMODORO') {
    targetEndTime = event.data.endTime;
    const delay = targetEndTime - Date.now();
    if (currentTimeout) clearTimeout(currentTimeout);
    if (delay > 0) {
      if (event.waitUntil) {
        event.waitUntil(
          new Promise((resolve) => {
            currentTimeout = setTimeout(() => { triggerAlarm(); resolve(); }, delay);
          })
        );
      } else { currentTimeout = setTimeout(triggerAlarm, delay); }
    }
  }

  if (event.data.type === 'STOP_POMODORO') {
    if (currentTimeout) clearTimeout(currentTimeout);
    currentTimeout = null;
    targetEndTime = null;
  }
});

function checkAndTriggerScheduledPush() {
  if (!scheduledPushConfig) return;

  const now = new Date();
  const currentHours = String(now.getHours()).padStart(2, '0');
  const currentMinutes = String(now.getMinutes()).padStart(2, '0');
  const currentTimeStr = `${currentHours}:${currentMinutes}`;
  
  const currentDay = String(now.getDate()).padStart(2, '0');
  const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
  const currentDateStr = `${currentDay}/${currentMonth}/${now.getFullYear()}`;

  if (currentDateStr === scheduledPushConfig.push_date && currentTimeStr === scheduledPushConfig.push_time) {
    self.registration.showNotification('Thông báo từ Trạm Học Tập 🔔', {
      body: scheduledPushConfig.noti_content,
      icon: 'images/icon-192x192.png',
      tag: 'scheduled-app-push',
      requireInteraction: true
    });
    scheduledPushConfig = null;
    if (scheduleCheckInterval) clearInterval(scheduleCheckInterval);
  }
}

function triggerAlarm() {
  self.registration.showNotification('Hết giờ học rồi 🎉', {
    body: 'Đứng dậy vươn vai, uống nước xíu rồi nghỉ ngơi nào! Bấm vào đây để nghe nhạc chuông.',
    icon: 'images/icon-192x192.png',
    vibrate: [500, 200, 500, 200, 500],
    tag: 'pomodoro-alarm',
    requireInteraction: true,
    actions: [ { action: 'stop-alarm', title: '🔕 Tắt Chuông & Nghỉ Ngơi' } ]
  });

  self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
    clients.forEach((client) => { client.postMessage({ type: 'ALARM_TRIGGER' }); });
  });
  currentTimeout = null;
  targetEndTime = null;
}

self.addEventListener('notificationclick', (event) => {
  event.notification.close(); 
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let client of windowClients) {
        if ('focus' in client) {
          return client.focus().then(() => { client.postMessage({ type: 'ALARM_TRIGGER_FORCE' }); });
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow('/');
    })
  );
});