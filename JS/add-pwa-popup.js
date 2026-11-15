let deferredPrompt = null;

// Nhận diện chuẩn iPhone / iPad (bao gồm cả iPadOS đời mới)
const isIOS = (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) || 
              (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

// Nhận diện trình duyệt mở bên trong Zalo, Facebook, TikTok... trên iPhone
const isInAppBrowser = /FBAN|FBAV|Zalo|TikTok|Instagram|Line/i.test(navigator.userAgent);

// Nội dung giới thiệu ban đầu
const pwaDetailsHTML = `
  <div style="text-align: left; font-size: 0.95rem; line-height: 1.6; color: #2d3748;">
    <div style="margin-bottom: 12px; background: #f7fafc; padding: 10px 12px; border-radius: 8px; border-left: 4px solid #4f46e5;">
      <strong style="color: #4f46e5; display: block; margin-bottom: 4px;">📌 App này có thể làm gì?</strong>
      • Cài 1 lần dùng trọn năm, tự đồng bộ Thời khóa biểu.<br>
      • Mở xem mượt mà ngay cả khi <b>không có mạng (Offline)</b>.
    </div>
    
    <div style="background: #f7fafc; padding: 10px 12px; border-radius: 8px; border-left: 4px solid #10b981;">
      <strong style="color: #10b981; display: block; margin-bottom: 4px;">⚡ Siêu nhẹ cho iPhone:</strong>
      • Dung lượng <b>chưa tới 1MB</b> (nhẹ hơn 1 tấm ảnh chụp).<br>
      • Không qua App Store, không tốn bộ nhớ máy.
    </div>
  </div>
`;

// Hướng dẫn trực quan từng bước dành riêng cho iPhone
const iosGuideHTML = `
  <div style="text-align: left; font-size: 0.95rem; line-height: 1.55; color: #1f2937;">
    ${isInAppBrowser ? `
      <div style="margin-bottom: 12px; background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c; padding: 10px 12px; border-radius: 10px; font-size: 0.88rem;">
        ⚠️ Bạn đang mở trang này trong ứng dụng khác. Hãy bấm nút <b>Mở bằng Safari</b> ở góc màn hình trước nhé!
      </div>
    ` : ''}

    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px 14px; display: flex; flex-direction: column; gap: 12px;">
      
      <!-- Bước 1 -->
      <div style="display: flex; align-items: flex-start; gap: 10px;">
        <span style="background: #007aff; color: #fff; font-weight: 700; min-width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 0.85rem; margin-top: 2px;">1</span>
        <div>
          Bấm vào nút <b>Chia sẻ</b> 
          <span style="display: inline-flex; align-items: center; justify-content: center; background: #e2e8f0; padding: 2px 6px; border-radius: 6px; vertical-align: middle; margin: 0 2px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#007aff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
              <polyline points="16 6 12 2 8 6"></polyline>
              <line x1="12" y1="2" x2="12" y2="15"></line>
            </svg>
          </span>
          ở thanh dưới cùng của Safari.
        </div>
      </div>

      <!-- Bước 2 -->
      <div style="display: flex; align-items: flex-start; gap: 10px;">
        <span style="background: #007aff; color: #fff; font-weight: 700; min-width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 0.85rem; margin-top: 2px;">2</span>
        <div>
          Vuốt xuống dưới và chọn <b>Thêm vào MH chính</b> 
          <span style="display: inline-flex; align-items: center; justify-content: center; background: #e2e8f0; padding: 2px 6px; border-radius: 6px; vertical-align: middle; margin: 0 2px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1f2937" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="4" ry="4"></rect>
              <line x1="12" y1="8" x2="12" y2="16"></line>
              <line x1="8" y1="12" x2="16" y2="12"></line>
            </svg>
          </span>
          <span style="color: #64748b; font-size: 0.85rem;">(Add to Home Screen)</span>.
        </div>
      </div>

      <!-- Bước 3 -->
      <div style="display: flex; align-items: flex-start; gap: 10px;">
        <span style="background: #10b981; color: #fff; font-weight: 700; min-width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 0.85rem; margin-top: 2px;">3</span>
        <div>
          Bấm chữ <b style="color: #007aff;">Thêm (Add)</b> ở góc trên bên phải là xong!
        </div>
      </div>

    </div>
  </div>
`;

// 1. Bắt sự kiện cài PWA (Android / Chrome PC)
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  
  showDownloadButton();

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
 * @param {boolean} isUserAction - true nếu do người dùng chủ động bấm nút trên Header
 */
function openPwaPrompt(isUserAction = false) {
  const isPWA = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
  
  if (isPWA) {
    if (isUserAction && typeof showPopup === 'function') {
      showPopup("Thông báo", "Bạn đã cài đặt và đang dùng App rồi nhé! 🎉");
    }
    return;
  }

  if (!isUserAction && localStorage.getItem('pwa_prompt_dismissed') === 'true') {
    return;
  }

  // Đổi nhãn nút chính cho thân thiện với người dùng iPhone
  const confirmBtnLabel = isIOS ? "Xem cách cài (5 giây)" : "Tải xuống ngay";

  showPwaModal("Cài đặt Trạm Tập Trung Học Tập", pwaDetailsHTML, confirmBtnLabel, "Để sau", function(isConfirm) {
    if (isConfirm) {
      executeInstallProcess();
    } else {
      localStorage.setItem('pwa_prompt_dismissed', 'true');
    }
  });
}

/**
 * Hàm dựng Modal tận dụng khung #global-popup của pop-up.js
 */
function showPwaModal(title, htmlContent, confirmText = "Tải xuống ngay", cancelText = "Hủy", onResult = null) {
  if (typeof initPopup === 'function') initPopup();

  const titleElem = document.getElementById('popup-title');
  const textElem = document.getElementById('popup-text');
  const container = document.getElementById('popup-input-container');

  if (titleElem) titleElem.textContent = title;
  if (textElem) textElem.textContent = '';
  if (container) container.innerHTML = htmlContent;

  if (typeof setupButtons === 'function') {
    const showCancel = Boolean(cancelText);
    setupButtons(showCancel, confirmText, cancelText, () => {
      if (typeof onResult === 'function') onResult(true);
    });

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
    // Hiển thị bảng hướng dẫn 3 bước có icon ngay trên Modal hiện tại
    showPwaModal(
      "Cách thêm vào iPhone (3 bước)",
      iosGuideHTML,
      "Đã hiểu",
      null, // Ẩn nút Hủy ở bước hướng dẫn cuối
      () => {
        if (typeof window.closePopup === 'function') window.closePopup();
      }
    );
  } else {
    if (typeof showPopup === 'function') {
      showPopup("Thông báo", "Vui lòng bấm biểu tượng dấu 3 chấm ở góc trình duyệt và chọn 'Thêm vào màn hình chính'.");
    }
  }
}
