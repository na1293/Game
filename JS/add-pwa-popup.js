let deferredPrompt = null;

// Check thiết bị iOS
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

// 1. Bắt sự kiện cài PWA (Cho Android / Windows / macOS / Chrome / Edge)
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  
  // Tự động gọi check sau khi đã bắt được event
  checkAndPromptPWA();
});

// 2. Tự động check khi trang load xong (Dành riêng cho iOS)
window.addEventListener('DOMContentLoaded', () => {
  if (isIOS) {
    checkAndPromptPWA();
  }
});

// 3. Hàm kiểm tra và hiện Prompt
function checkAndPromptPWA() {
  const isPWA = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

  if (isPWA) {
    console.log("User đã cài và đang dùng PWA rồi nè! 🎉");
    return;
  }

  // Đảm bảo UI custom đã sẵn sàng
  if (typeof showDropdownPrompt !== 'function') return;

  showDropdownPrompt(
    "Nhẹ hơn 1 tấm ảnh – Tự động cập nhật TKB không tốn dung lượng. Tải ngay.", 
    ["Ok", "Để sau"], 
    function(val) {
      console.log("Người dùng đã chọn:", val);

      if (val === "Ok") {
        if (deferredPrompt) {
          const promptEvent = deferredPrompt;
          deferredPrompt = null; // Xóa ngay để tránh bấm đúp

          promptEvent.prompt();
          promptEvent.userChoice.then((choiceResult) => {
            console.log(choiceResult.outcome === 'accepted' ? 'Đã cài PWA ✅' : 'Đã hủy cài ❌');
          });
        } else {
          // Trường hợp là iOS hoặc trình duyệt không support prompt tự động
          if (typeof showPopup === 'function') {
            showPopup("Hướng dẫn cài đặt", "Nhấn vào nút 'Chia sẻ' (biểu tượng ô vuông có mũi tên) ➔ Chọn 'Thêm vào Màn hình chính' (Add to Home Screen).");
          }
        }
      } else {
        console.log("Người dùng chọn Để sau ⏱️");
      }
    }
  );
}