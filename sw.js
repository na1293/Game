let currentTimeout = null;
let targetEndTime = null;

self.addEventListener('message', (event) => {
  if (event.data.type === 'START_POMODORO') {
    targetEndTime = event.data.endTime;
    const delay = targetEndTime - Date.now();

    if (currentTimeout) clearTimeout(currentTimeout);

    if (delay > 0) {
      if (event.waitUntil) {
        event.waitUntil(
          new Promise((resolve) => {
            currentTimeout = setTimeout(() => {
              triggerAlarm();
              resolve();
            }, delay);
          })
        );
      } else {
        currentTimeout = setTimeout(triggerAlarm, delay);
      }
    }
  }

  if (event.data.type === 'STOP_POMODORO') {
    if (currentTimeout) clearTimeout(currentTimeout);
    currentTimeout = null;
    targetEndTime = null;
  }
});

// Hàm kích hoạt thông báo đẩy khi hết giờ
function triggerAlarm() {
  self.registration.showNotification('Hết giờ học rồi 🎉', {
    body: 'Đứng dậy vươn vai, uống nước xíu rồi nghỉ ngơi nào! Bấm vào đây để nghe nhạc chuông.',
    icon: 'images/icon-192x192.png',
    vibrate: [500, 200, 500, 200, 500], // Rung cực mạnh trên Android
    tag: 'pomodoro-alarm',
    requireInteraction: true,
    actions: [
      { action: 'stop-alarm', title: '🔕 Tắt Chuông & Nghỉ Ngơi' }
    ]
  });

  // Bắn tín hiệu thời gian thực nếu tab vẫn còn đang mở ngầm (Chưa bị freeze sâu)
  self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
    clients.forEach((client) => {
      client.postMessage({ type: 'ALARM_TRIGGER' });
    });
  });
  
  currentTimeout = null;
  targetEndTime = null;
}

// LẮNG NGHE SỰ KIỆN CLICK THÔNG BÁO MÀN HÌNH KHÓA (Cứu cánh nhạc chuông cho iOS & Android)
self.addEventListener('notificationclick', (event) => {
  event.notification.close(); 

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Tìm xem tab ứng dụng có đang mở ngầm không để kéo nó lên
      for (let client of windowClients) {
        if ('focus' in client) {
          return client.focus().then(() => {
            // Sau khi focus thành công (Đã có tương tác user), ra lệnh cho tab FORCE phát nhạc chuông ngay
            client.postMessage({ type: 'ALARM_TRIGGER_FORCE' });
          });
        }
      }
      // Nếu ứng dụng đã bị tắt hẳn trước đó, tiến hành mở lại trang chủ
      if (self.clients.openWindow) {
        return self.clients.openWindow('/');
      }
    })
  );
});