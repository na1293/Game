let currentTimeout = null;
let targetEndTime = null;

// Quản lý thông báo sự kiện từ Sheets
let scheduledPushConfig = null;
let scheduleCheckInterval = null;

self.addEventListener('message', (event) => {
  
  // TIẾP NHẬN LỊCH THÔNG BÁO LINH HOẠT (Sự kiện lớp, thông báo nóng...)
  if (event.data.type === 'SET_SCHEDULED_PUSH') {
    scheduledPushConfig = event.data.schedule;
    
    // Khởi động bộ quét giờ ngầm (30 giây check 1 lần)
    if (scheduleCheckInterval) clearInterval(scheduleCheckInterval);
    
    scheduleCheckInterval = setInterval(() => {
      checkAndTriggerScheduledPush();
    }, 30000); 
  }

  // CODE CŨ: ĐIỀU KHIỂN POMODORO (GIỮ NGUYÊN)
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

// HÀM KIỂM TRA ĐỂ BẮN NOTI LỚP HỌC TRÙNG GIỜ
function checkAndTriggerScheduledPush() {
  if (!scheduledPushConfig) return;

  const now = new Date();
  const currentHours = String(now.getHours()).padStart(2, '0');
  const currentMinutes = String(now.getMinutes()).padStart(2, '0');
  const currentTimeStr = `${currentHours}:${currentMinutes}`;
  
  const currentDay = String(now.getDate()).padStart(2, '0');
  const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
  const currentDateStr = `${currentDay}/${currentMonth}/${now.getFullYear()}`;

  // Kiểm tra trùng ngày + giờ khớp khít từ Sheets
  if (currentDateStr === scheduledPushConfig.push_date && currentTimeStr === scheduledPushConfig.push_time) {
    
    self.registration.showNotification('Thông báo từ Trạm Học Tập 🔔', {
      body: scheduledPushConfig.noti_content, // Nội dung thông báo linh hoạt từ ô B9
      icon: 'images/icon-192x192.png',
      tag: 'scheduled-app-push',
      requireInteraction: true // Giữ thông báo hiển thị cho tới khi user nhấn đọc
    });

    // Bắn xong thì xóa cấu hình để tránh push trùng lặp trong phút đó
    scheduledPushConfig = null;
    if (scheduleCheckInterval) clearInterval(scheduleCheckInterval);
  }
}

// HÀM ALARM CHO POMODORO (GIỮ NGUYÊN 100%)
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

// SỰ KIỆN CLICK NOTI MÀN HÌNH KHÓA (GIỮ NGUYÊN 100%)
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