let deferredPrompt = null;

// Nhận diện chuẩn iPhone / iPad
const isIOS = (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) || 
             (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

// Nhận diện Android
const isAndroid = /Android/i.test(navigator.userAgent);

// Nhận diện In-App Browser (Zalo, Facebook, TikTok, Instagram...)
const isInAppBrowser = /FBAN|FBAV|Instagram|Line|TikTok|Zalo|FB_IAB|FB4A|MessengerForiOS/i.test(navigator.userAgent);

// Nội dung giới thiệu ban đầu
const pwaDetailsHTML = `
  <div style="text-align: left; font-size: 0.95rem; line-height: 1.6; color: #2d3748;">
    <div style="margin-bottom: 12px; background: #f7fafc; padding: 12px 14px; border-radius: 8px; border-left: 4px solid #4f46e5;">
      <strong style="color: #4f46e5; display: block; margin-bottom: 4px;">Ưu điểm nổi bật</strong>
      • Cài 1 lần dùng trọn năm, tự đồng bộ Thời khóa biểu.<br>
      • Xem mượt mà ngay cả khi <b>không có mạng (Offline)</b>.
    </div>
    
    <div style="background: #f7fafc; padding: 12px 14px; border-radius: 8px; border-left: 4px solid #10b981;">
      <strong style="color: #10b981; display: block; margin-bottom: 4px;">Tối ưu dung lượng</strong>
      • Dung lượng <b>chưa tới 1MB</b> (nhẹ hơn 1 tấm ảnh).<br>
      • Không qua App Store, không tốn bộ nhớ máy.
    </div>
  </div>
`;

// Hướng dẫn chung cực kỳ ngắn gọn và bao quát cho In-App Browser (Zalo, Facebook...)
const inAppBrowserGuideHTML = `
  <div style="text-align: left; font-size: 0.95rem; line-height: 1.55; color: #1f2937;">
    <div style="background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c; padding: 12px 14px; border-radius: 10px; font-size: 0.9rem; margin-bottom: 12px;">
      <b>Đang mở trong ứng dụng nhắn tin!</b> Trình duyệt này hạn chế tính năng cài đặt.
    </div>
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px 14px; display: flex; flex-direction: column; gap: 10px;">
      <div><b>Bước 1:</b> Bấm vào biểu tượng <b>3 chấm (...)</b> hoặc nút menu ở góc màn hình.</div>
      <div><b>Bước 2:</b> Chọn <b>Mở bằng trình duyệt</b> (Safari hoặc Chrome).</div>
      <div><b>Bước 3:</b> Tại trình duyệt ngoài, chọn <b>Thêm vào Màn hình chính</b> để cài đặt App.</div>
    </div>
  </div>
`;

// Hướng dẫn chi tiết cho iPhone (khi mở đúng chuẩn Safari)
const iosGuideHTML = `
  <div style="text-align: left; font-size: 0.95rem; line-height: 1.55; color: #1f2937;">
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px 14px; display: flex; flex-direction: column; gap: 12px;">
      
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
          ở thanh công cụ Safari.
        </div>
      </div>

      <div style="display: flex; align-items: flex-start; gap: 10px;">
        <span style="background: #007aff; color: #fff; font-weight: 700; min-width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 0.85rem; margin-top: 2px;">2</span>
        <div>
          Chọn <b>Thêm vào Màn hình chính</b> 
          <span style="display: inline-flex; align-items: center; justify-content: center; background: #e2e8f0; padding: 2px 6px; border-radius: 6px; vertical-align: middle; margin: 0 2px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1f2937" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="4" ry="4"></rect>
              <line x1="12" y1="8" x2="12" y2="16"></line>
              <line x1="8" y1="12" x2="16" y2="12"></line>
            </svg>
          </span>
        </div>
      </div>

      <div style="display: flex; align-items: flex-start; gap: 10px;">
        <span style="background: #10b981; color: #fff; font-weight: 700; min-width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 0.85rem; margin-top: 2px;">3</span>
        <div>
          Bấm <b style="color: #007aff;">Thêm (Add)</b> ở góc trên bên phải để hoàn tất.
        </div>
      </div>

    </div>
  </div>
`;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
});

window.addEventListener('DOMContentLoaded', () => {
  const isPWA = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
  if (isPWA) {
    const btn = document.getElementById('btn-download-pwa');
    if (btn) btn.style.display = 'none';
  } else {
    showDownloadButton();
  }
});

function showDownloadButton() {
  const btn = document.getElementById('btn-download-pwa');
  if (btn) btn.style.display = 'inline-block';
}

function openPwaPrompt(isUserAction = true) {
  const isPWA = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
  
  if (isPWA) {
    if (isUserAction && typeof showPopup === 'function') {
      showPopup("Thông báo", "Bạn đang dùng ứng dụng phiên bản cài đặt rồi.");
    }
    return;
  }

  const confirmBtnLabel = (isInAppBrowser || isIOS) ? "Xem cách cài" : "Tải xuống ngay";

  showPwaModal("Cài đặt Trạm Tập Trung Học Tập", pwaDetailsHTML, confirmBtnLabel, "Để sau", function(isConfirm) {
    if (isConfirm) {
      executeInstallProcess();
    }
  });
}

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
  if (overlay) overlay.classList.add ? overlay.classList.add('active') : overlay.className += ' active';
}

function executeInstallProcess() {
  // Nếu đang mở trong Zalo, Facebook, TikTok... trên bất kỳ thiết bị nào -> Hiện form hướng dẫn chung ngắn gọn
  if (isInAppBrowser) {
    showPwaModal(
      "Mở trình duyệt ngoài để cài đặt",
      inAppBrowserGuideHTML,
      "Đã hiểu",
      null, 
      () => { if (typeof window.closePopup === 'function') window.closePopup(); }
    );
    return;
  }

  // Nếu có sự kiện cài đặt tự động (Chrome Android / Desktop)
  if (deferredPrompt) {
    const promptEvent = deferredPrompt;
    deferredPrompt = null; 

    promptEvent.prompt();
    promptEvent.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        const btn = document.getElementById('btn-download-pwa');
        if (btn) btn.style.display = 'none';
      }
    });
  } else if (isIOS) {
    // iPhone chuẩn Safari
    showPwaModal(
      "Cách thêm vào iPhone",
      iosGuideHTML,
      "Đã hiểu",
      null, 
      () => {
        if (typeof window.closePopup === 'function') window.closePopup();
      }
    );
  } else {
    if (typeof showPopup === 'function') {
      showPopup("Hướng dẫn", "Hãy bấm vào biểu tượng 3 chấm ở góc trên trình duyệt và chọn 'Thêm vào màn hình chính'.");
    }
  }
}