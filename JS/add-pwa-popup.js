let deferredPrompt = null;
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

// Nội dung thuyết phục dạng HTML
const pwaDetailsHTML = `
  <div style="text-align: left; font-size: 0.95rem; line-height: 1.6; color: #2d3748;">
    <div style="margin-bottom: 12px; background: #f7fafc; padding: 10px 12px; border-radius: 8px; border-left: 4px solid #4f46e5;">
      <strong style="color: #4f46e5; display: block; margin-bottom: 4px;">📌 App này có thể làm gì?</strong>
      • Tải 1 lần dùng trọn năm, tự đồng bộ Thời khóa biểu.<br>
      • Hoạt động mượt mà ngay cả khi <b>không có mạng (Offline)</b>.
    </div>
    
    <div style="background: #f7fafc; padding: 10px 12px; border-radius: 8px; border-left: 4px solid #10b981;">
      <strong style="color: #10b981; display: block; margin-bottom: 4px;">⚡ App này nhẹ như nào?</strong>
      • Dung lượng <b>chưa tới 1MB</b> (nhẹ hơn 1 bức ảnh).<br>
      • Không tốn dung lượng máy, không chạy ngầm hao pin.
    </div>
  </div>
`;

// 1. Bắt sự kiện cài PWA
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  
  showDownloadButton();

  // Tự động gợi ý pop-up đúng 1 lần
  setTimeout(() => {
    openPwaPrompt(false);
  }, 1500); 
});

// 2. Kiểm tra iOS
window.addEventListener('DOMContentLoaded', () => {
  const isPWA = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
  if (isIOS && !isPWA) {
    showDownloadButton();
    setTimeout(() => {
      openPwaPrompt(false);
    }, 1500);
  }
});

// Hiển thị nút Tải xuống trên Header
function showDownloadButton() {
  const btn = document.getElementById('btn-download-pwa');
  if (btn) btn.style.display = 'inline-block';
}

/**
 * Hàm kiểm tra và kích hoạt Pop-up
 * @param {boolean} isUserAction - true nếu do người dùng chủ động bấm nút "Tải xuống" trên Header
 */
function openPwaPrompt(isUserAction = false) {
  const isPWA = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
  
  if (isPWA) {
    if (isUserAction && typeof showPopup === 'function') {
      showPopup("Thông báo", "Bạn đã cài đặt và đang dùng App rồi nhé! 🎉");
    }
    return;
  }

  // Nếu là tự động mở mà user đã từng bấm "Hủy" -> Bỏ qua hẳn
  if (!isUserAction && localStorage.getItem('pwa_prompt_dismissed') === 'true') {
    return;
  }

  // Mở Custom Modal hỗ trợ render HTML
  showPwaModal("Cài đặt Trạm Tập Trung Học Tập", pwaDetailsHTML, function(isConfirm) {
    if (isConfirm) {
      executeInstallProcess();
    } else {
      // Khi chọn "Hủy": Đánh dấu vĩnh viễn để không tự động hiện lại
      localStorage.setItem('pwa_prompt_dismissed', 'true');
    }
  });
}

/**
 * Hàm dựng Modal riêng biệt tận dụng khung #global-popup của pop-up.js
 */
function showPwaModal(title, htmlContent, onResult) {
  if (typeof initPopup === 'function') initPopup();

  const titleElem = document.getElementById('popup-title');
  const textElem = document.getElementById('popup-text');
  const container = document.getElementById('popup-input-container');

  if (titleElem) titleElem.textContent = title;
  if (textElem) textElem.textContent = '';
  if (container) container.innerHTML = htmlContent;

  // Dùng lại setupButtons của pop-up.js
  if (typeof setupButtons === 'function') {
    setupButtons(true, "Tải xuống ngay", "Hủy", () => {
      if (typeof onResult === 'function') onResult(true);
    });

    // Bắt sự kiện bấm nút Hủy
    const btnCancel = document.getElementById('popup-btn-cancel');
    if (btnCancel) {
      btnCancel.onclick = () => {
        if (typeof window.closePopup === 'function') window.closePopup();
        if (typeof onResult === 'function') onResult(false);
      };
    }
  }

  const overlay = document.getElementById('global-popup');
  if (overlay) overlay.classList.add('active');
}

// Thực thi việc cài đặt PWA
function executeInstallProcess() {
  if (deferredPrompt) {
    const promptEvent = deferredPrompt;
    deferredPrompt = null; 

    promptEvent.prompt();
    promptEvent.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('Đã cài PWA ✅');
        const btn = document.getElementById('btn-download-pwa');
        if (btn) btn.style.display = 'none';
      }
    });
  } else if (isIOS) {
    if (typeof showPopup === 'function') {
      showPopup(
        "Hướng dẫn cài đặt trên iOS 🍏", 
        "1. Bấm vào nút 'Chia sẻ' (biểu tượng ô vuông có mũi tên ở góc trình duyệt).\n2. Chọn 'Thêm vào Màn hình chính' (Add to Home Screen)."
      );
    }
  } else {
    if (typeof showPopup === 'function') {
      showPopup("Thông báo", "Vui lòng chọn 'Thêm vào màn hình chính' từ menu tùy chọn của trình duyệt.");
    }
  }
}