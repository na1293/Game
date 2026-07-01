const updateBtn = document.querySelector('button-update');

let newWorker;

// 1. Theo dõi quá trình đăng ký Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').then(reg => {
    // Lắng nghe sự kiện nếu có một SW mới đang nằm chờ (Waiting)
    reg.addEventListener('updatefound', () => {
      newWorker = reg.installing;
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed') {
          if (navigator.serviceWorker.controller) {
            // Có bản cập nhật mới! Bạn có thể làm nút bấm nổi bật lên (VD: đổi màu, hiện thông báo)
            console.log('Đã có giao diện mới, sẵn sàng cập nhật!');
            updateBtn.style.backgroundColor = '#ff4757'; // Tạo điểm nhấn GenZ
            updateBtn.innerText = '🔥 Có UI Mới! Cập Nhật Ngay';
          }
        }
      });
    });
  });

  // 2. BÍ KÍP CHÍ MẠNG: Khi SW mới lên nắm quyền, ép reload trang để lấy UI mới luôn
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      window.location.reload();
      refreshing = true;
    }
  });
}

// 3. Xử lý sự kiện khi bấm nút "Cập nhật mới"
updateBtn.addEventListener('click', () => {
  if (newWorker) {
    // Nếu có bản mới đang chờ, ra lệnh cho nó đè bản cũ ngay lập tức
    newWorker.postMessage('SKIP_WAITING_FORCE');
  } else {
    // Nếu không có bản mới nào đang chờ, kiểm tra thủ công xem server có gì mới không
    console.log('🔄 Đang kiểm tra bản cập nhật trên server...');
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(reg => {
        reg.update().then(() => {
          if (!reg.waiting) {
            alert('Trạm Học Tập của bạn đã ở bản mới nhất rồi nè! 😎');
          }
        });
      });
    }
  }
});