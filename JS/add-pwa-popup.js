let deferredPrompt = null;
let fallbackGuideTimer = null;

// Nhận diện chuẩn iPhone / iPad
const isIOS = (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) ||
             (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

// Nhận diện Android
const isAndroid = /Android/i.test(navigator.userAgent);

// Nhận diện riêng Zalo và nhóm Meta (Facebook, Messenger, Instagram)
const isZalo = /Zalo/i.test(navigator.userAgent);
const isIOSWebView = isIOS && !window.safari && !/CriOS|FxiOS|EdgiOS|OPiOS|Safari\//i.test(navigator.userAgent);
const isMetaInApp = /FBAN|FBAV|FB_IAB|FB4A|FBIOS|Messenger|Instagram/i.test(navigator.userAgent) || isIOSWebView;


// Nhận diện chung tất cả In-App Browser / WebView
const isInAppBrowser = isZalo || isMetaInApp || /Line|TikTok|wv/i.test(navigator.userAgent);

// Hàm tạo chuỗi báo lỗi chi tiết chuẩn Console
function buildConsoleErrorAlert(errorCode, reason, errObj = null) {
  const osName = isIOS ? 'iOS / iPadOS' : (isAndroid ? 'Android' : 'Desktop / Other');
  let appName = 'Unknown WebView';
  if (isZalo) appName = 'Zalo In-App Browser';
  else if (/Messenger|FB_IAB|FB4A|FBIOS/i.test(navigator.userAgent)) appName = 'Facebook / Messenger WebView';
  else if (/Instagram/i.test(navigator.userAgent)) appName = 'Instagram WebView';
  else if (/TikTok/i.test(navigator.userAgent)) appName = 'TikTok WebView';

  const stackTrace = errObj ? `\n[Exception]: ${errObj.name}: ${errObj.message}` : '';

  return [
    `❌ [CONSOLE ERROR] ${errorCode}`,
    `----------------------------------------`,
    `• Reason: ${reason}`,
    `• OS: ${osName}`,
    `• App: ${appName}`,
    `• Hidden State: ${document.hidden}`,
    `• Target URL: ${window.location.href}`,
    `• UserAgent: ${navigator.userAgent}${stackTrace}`,
    `----------------------------------------`,
    `👉 Action: Bấm dấu 3 chấm (•••) ở góc màn hình -> Chọn "Mở bằng trình duyệt" (Safari/Chrome).`
  ].join('\n');
}

// Nội dung giới thiệu ban đầu
const pwaDetailsHTML = `
  <div style="text-align: left; font-family: system-ui, -apple-system, BlinkMacSystemFont, Helvetica, Arial, sans-serif; color: #1e293b;">
    
    <!-- Header App: Khối chữ đại diện + Tên + Mô tả ngắn -->
    <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 16px;">
      <img src="img/icon-192x192.png" alt="Thời Khóa Biểu" style="width: 72px; height: 72px; border-radius: 18px; object-fit: cover; flex-shrink: 0; box-shadow: 0 8px 20px -4px rgba(15, 23, 42, 0.12); border: 1px solid #f1f5f9;">
      
      <div style="flex: 1; min-width: 0;">
        <div style="font-size: 1.15rem; font-weight: 700; color: #0f172a; line-height: 1.25; margin-bottom: 3px;">
          Thời Khóa Biểu
        </div>
        <div style="font-size: 0.85rem; font-weight: 600; color: #2563eb; margin-bottom: 2px;">
          Ứng dụng web
        </div>
        <div style="font-size: 0.75rem; color: #64748b;">
          Ứng dụng học tập
        </div>
      </div>
    </div>

    <!-- Thanh thông số 3 cột tối giản -->
    <div style="display: flex; gap: 10px; overflow-x: auto; padding: 2px 2px 10px; margin-bottom: 16px; scroll-snap-type: x mandatory; scrollbar-width: none; -ms-overflow-style: none;">
      
      <!-- Ô 1: Siêu nhẹ -->
      <div style="flex: 0 0 135px; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 14px; padding: 12px 14px; scroll-snap-align: start;">
        <div style="font-size: 0.95rem; font-weight: 700; color: #0284c7; white-space: nowrap;">Siêu nhẹ &lt; 1 MB</div>
        <div style="font-size: 0.75rem; color: #0369a1; margin-top: 4px; line-height: 1.3;">Nhẹ hơn 1 tấm ảnh</div>
      </div>

      <!-- Ô 2: Offline -->
      <div style="flex: 0 0 135px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 12px 14px; scroll-snap-align: start;">
        <div style="font-size: 0.95rem; font-weight: 700; color: #0f172a; white-space: nowrap;">Xem Offline</div>
        <div style="font-size: 0.75rem; color: #64748b; margin-top: 4px; line-height: 1.3;">Mở được khi mất mạng</div>
      </div>

      <!-- Ô 3: Tự động cập nhật -->
      <div style="flex: 0 0 155px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 12px 14px; scroll-snap-align: start;">
        <div style="font-size: 0.95rem; font-weight: 700; color: #0f172a; white-space: nowrap;">Tự động cập nhật</div>
        <div style="font-size: 0.75rem; color: #64748b; margin-top: 4px; line-height: 1.3;">Không cần thao tác thêm</div>
      </div>

    </div>

    <!-- Khu vực Ảnh xem trước (Screenshots) cuộn ngang -->
    <div style="font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 8px;">
      Xem trước giao diện
    </div>
    
    <div style="display: flex; gap: 10px; overflow-x: auto; padding-bottom: 6px; margin-bottom: 12px; scroll-snap-type: x mandatory;">
      
      <!-- Ảnh mẫu 1 -->
      <div style="flex: 0 0 130px; height: 210px; border-radius: 10px; overflow: hidden; border: 1px solid #cbd5e1; background: #f1f5f9; scroll-snap-align: start;">
        <img src="img/1.jpg" alt="Xem trước 1" style="width: 100%; height: 100%; object-fit: cover; display: block;">
      </div>

      <!-- Ảnh mẫu 2 -->
      <div style="flex: 0 0 130px; height: 210px; border-radius: 10px; overflow: hidden; border: 1px solid #cbd5e1; background: #f1f5f9; scroll-snap-align: start;">
        <img src="img/2.jpg" alt="Xem trước 2" style="width: 100%; height: 100%; object-fit: cover; display: block;">
      </div>

      <!-- Ảnh mẫu 3 -->
      <div style="flex: 0 0 130px; height: 210px; border-radius: 10px; overflow: hidden; border: 1px solid #cbd5e1; background: #f1f5f9; scroll-snap-align: start;">
        <img src="img/3.jpg" alt="Xem trước 3" style="width: 100%; height: 100%; object-fit: cover; display: block;">
      </div>

    </div>

  </div>
`;

// Hướng dẫn dự phòng nếu WebView chặn tự mở trình duyệt ngoài

const inAppBrowserGuideHTML = `
  <div style="text-align: left; font-size: 0.92rem; line-height: 1.5; color: #1f2937;">
    <div style="background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c; padding: 10px 12px; border-radius: 10px; font-size: 0.86rem; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" style="flex-shrink: 0;">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <span><b>Messenger đang khóa cài đặt!</b> Làm theo 3 bước sau để mở qua Safari:</span>
    </div>

    <div style="display: flex; flex-direction: column; gap: 10px;">
      
      <!-- BƯỚC 1: XANH DƯƠNG -->
      <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 12px; padding: 11px 13px; display: flex; align-items: center; gap: 11px;">
        <span style="background: #0284c7; color: #fff; font-weight: 800; width: 25px; height: 25px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 0.85rem; flex-shrink: 0;">1</span>
        <div style="color: #0c4a6e;">
          Bấm vào nút <b>3 chấm</b> 
          <span style="display: inline-flex; align-items: center; justify-content: center; background: #e0f2fe; border: 1px solid #7dd3fc; padding: 2px 7px; border-radius: 6px; vertical-align: middle; margin: 0 2px;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="#0284c7">
              <circle cx="5" cy="12" r="2.2"></circle>
              <circle cx="12" cy="12" r="2.2"></circle>
              <circle cx="19" cy="12" r="2.2"></circle>
            </svg>
          </span>
          ở góc trên hoặc dưới màn hình Messenger.
        </div>
      </div>

      <!-- BƯỚC 2: CAM VÀNG -->
      <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 11px 13px; display: flex; align-items: center; gap: 11px;">
        <span style="background: #d97706; color: #fff; font-weight: 800; width: 25px; height: 25px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 0.85rem; flex-shrink: 0;">2</span>
        <div style="color: #78350f;">
          Chọn <b>Mở bằng trình duyệt bên ngoài</b> 
          <span style="display: inline-flex; align-items: center; justify-content: center; background: #fef3c7; border: 1px solid #fcd34d; padding: 2px 6px; border-radius: 6px; vertical-align: middle; margin: 0 2px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </span>
        </div>
      </div>

      <!-- BƯỚC 3: XANH LÁ -->
      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 11px 13px; display: flex; align-items: center; gap: 11px;">
        <span style="background: #16a34a; color: #fff; font-weight: 800; width: 25px; height: 25px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 0.85rem; flex-shrink: 0;">3</span>
        <div style="color: #14532d;">
          Tại trình duyệt Safari, bấm lại nút <b>Tải App</b> 
          <span style="display: inline-flex; align-items: center; justify-content: center; background: #dcfce7; border: 1px solid #86efac; padding: 2px 6px; border-radius: 6px; vertical-align: middle; margin: 0 2px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
          </span>
          để cài đặt.
        </div>
      </div>

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

// Nếu trang chuyển sang ẩn (vì đã nhảy sang trình duyệt ngoài) thì hủy timer bật alert & modal
document.addEventListener('visibilitychange', () => {
if (document.hidden && fallbackGuideTimer) {
clearTimeout(fallbackGuideTimer);
fallbackGuideTimer = null;
}
});
function showDownloadButton() {
const btn = document.getElementById('btn-download-pwa');
if (btn) btn.style.display = 'inline-block';
}
function openExternalBrowser(targetUrl = window.location.href) {
const cleanUrl = targetUrl.replace(/^https?:\/\//i, '');
// 1. Android: Dùng Intent gọi trình duyệt mặc định
if (isAndroid) {
try {
const intentUrl = `intent://${cleanUrl}#Intent;scheme=https;action=android.intent.action.VIEW;S.browser_fallback_url=${encodeURIComponent(targetUrl)};end`;

window.location.href = intentUrl;
return { ok: true };
} catch (err) {
return { ok: false, code: 'ERR_ANDROID_INTENT_FAILED', reason: 'Không thể kích hoạt Android Intent', err };
}
}

// 2. iOS: Chỉ nhảy khi là Zalo (Messenger iOS bị chặn cứng nên trả lỗi ngay để không reload trang)
if (isIOS) {
if (isZalo) {
try {
window.location.href = 'x-safari-' + targetUrl;

return { ok: true };
} catch (err) {
return { ok: false, code: 'ERR_ZALO_IOS_SCHEME_FAILED', reason: 'Zalo iOS từ chối scheme x-safari-', err };
}
}
return {
ok: false,
code: 'ERR_IOS_WKWEBVIEW_SANDBOX_BLOCKED',
reason: 'WKWebView của Meta (Messenger/FB/IG) trên iOS chặn mọi lệnh mở Safari từ bên ngoài (x-safari / window.open bị vô hiệu hóa để tránh reload lỗi).'
};
}
return {
ok: false,
code: 'ERR_UNSUPPORTED_WEBVIEW',
reason: 'Trình duyệt nhúng không hỗ trợ tự động chuyển hướng ra ngoài.'
};
}
function showInAppFallbackGuide(debugMsg = '') {
  const safeLog = debugMsg.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const consoleBox = debugMsg
    ? '<pre style="background:#0f172a;color:#f87171;padding:10px;border-radius:8px;font-size:11px;white-space:pre-wrap;word-break:break-all;margin-bottom:10px;">' + safeLog + '</pre>'
    : '';

  showPwaModal(
    "Mở trình duyệt ngoài để cài đặt",
    consoleBox + inAppBrowserGuideHTML,
    "Đã hiểu",
    null,
    () => { if (typeof window.closePopup === 'function') window.closePopup(); }
  );
}

function triggerExternalBrowserWithFallback() {
  if (fallbackGuideTimer) {
    clearTimeout(fallbackGuideTimer);
    fallbackGuideTimer = null;
  }

  const result = openExternalBrowser(window.location.href);

  // Nếu là Messenger/FB iOS (không thể tự nhảy) -> Hiện thẳng hướng dẫn mở Safari
  if (!result.ok) {
    console.warn(buildConsoleErrorAlert(result.code, result.reason, result.err));
    showInAppFallbackGuide();
    return;
  }

  // Nếu là Android hoặc Zalo iOS -> Chờ 1.2s, nếu bị chặn ngầm thì hiện hướng dẫn
  fallbackGuideTimer = setTimeout(() => {
    if (!document.hidden) {
      showInAppFallbackGuide();
    }
    fallbackGuideTimer = null;
  }, 1200);
}


function openPwaPrompt(isUserAction = true) {
const isPWA = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
if (isPWA) {
if (isUserAction && typeof showPopup === 'function') {
showPopup("Thông báo", "Bạn đang dùng ứng dụng phiên bản cài đặt rồi.");
}
return;
}
// Khi người dùng bấm nút tải trên WebView -> thử mở trình duyệt ngoài ngay
if (isUserAction && isInAppBrowser) {
triggerExternalBrowserWithFallback();
return;
}
const confirmBtnLabel = isIOS ? "Xem cách cài" : "Tải xuống ngay";
showPwaModal("Tải xuống ứng dụng", pwaDetailsHTML, confirmBtnLabel, "Để sau", function(isConfirm) {
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
  if (isInAppBrowser) {
    triggerExternalBrowserWithFallback();
    return;
  }

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
// <--- XÓA SẠCH MỌI THỨ PHÍA DƯỚI DẤU NGOẶC NÀY

/*
// Hộp thoại Alert tự tạo (vượt qua việc Messenger iOS chặn window.alert)
function customDebugAlert(debugMsg, onOkCallback = null) {
  // // Vẫn thử gọi alert gốc của trình duyệt phòng trường hợp máy cho phép
  // try { window.alert(debugMsg); } catch (_) {}

  // // Xóa alert cũ nếu đang mở
  // const oldAlert = document.getElementById('custom-debug-alert-overlay');
  // if (oldAlert) oldAlert.remove();

  // const overlay = document.createElement('div');
  // overlay.id = 'custom-debug-alert-overlay';
  // overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.65);z-index:999999;display:flex;align-items:center;justify-content:center;padding:16px;font-family:system-ui,-apple-system,sans-serif;';

  // const box = document.createElement('div');
  // box.style.cssText = 'background:#1e293b;color:#f8fafc;width:100%;max-width:360px;border-radius:14px;overflow:hidden;box-shadow:0 20px 25px -5px rgba(0,0,0,0.5);border:1px solid #334155;';

  // const header = document.createElement('div');
  // header.style.cssText = 'padding:12px 16px;background:#0f172a;font-weight:700;font-size:15px;color:#f87171;border-bottom:1px solid #334155;';
  // header.textContent = '⚠️ Debug Console Alert';

  // const body = document.createElement('pre');
  // body.style.cssText = 'padding:14px 16px;margin:0;font-size:11.5px;line-height:1.45;white-space:pre-wrap;word-break:break-all;max-height:55vh;overflow-y:auto;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:#e2e8f0;';
  // body.textContent = debugMsg;

  // const footer = document.createElement('div');
  // footer.style.cssText = 'display:flex;border-top:1px solid #334155;';

  // const btnCopy = document.createElement('button');
  // btnCopy.textContent = 'Copy Log';
  // btnCopy.style.cssText = 'flex:1;padding:12px;background:transparent;border:none;border-right:1px solid #334155;color:#38bdf8;font-weight:600;font-size:14px;cursor:pointer;';
  // btnCopy.onclick = () => {
  //   if (navigator.clipboard) navigator.clipboard.writeText(debugMsg);
  //   btnCopy.textContent = 'Đã Copy!';
  // };

  // const btnOk = document.createElement('button');
  // btnOk.textContent = 'OK';
  // btnOk.style.cssText = 'flex:1;padding:12px;background:transparent;border:none;color:#ffffff;font-weight:700;font-size:14px;cursor:pointer;';
  // btnOk.onclick = () => {
  //   overlay.remove();
  //   if (typeof onOkCallback === 'function') onOkCallback();
  // };

  // footer.appendChild(btnCopy);
  // footer.appendChild(btnOk);
  // box.appendChild(header);
  // box.appendChild(body);
  // box.appendChild(footer);
  // overlay.appendChild(box);
  // document.body.appendChild(overlay);
}

function triggerExternalBrowserWithFallback() {
  if (fallbackGuideTimer) {
    clearTimeout(fallbackGuideTimer);
    fallbackGuideTimer = null;
  }

  const result = openExternalBrowser(window.location.href);

  // Bị chặn ngay từ đầu (Messenger iOS) -> Bật Debug Alert trước, bấm OK mới hiện hướng dẫn
  if (!result.ok) {
    const debugMsg = buildConsoleErrorAlert(result.code, result.reason, result.err);
    console.error(debugMsg);
    customDebugAlert(debugMsg, () => {
      showInAppFallbackGuide();
    });
    return;
  }

  // Đã kích hoạt nhảy (Android hoặc Zalo iOS) -> Chờ 1.2s kiểm tra nếu vẫn kẹt thì bật Debug Alert
  fallbackGuideTimer = setTimeout(() => {
    if (!document.hidden) {
      const timeoutMsg = buildConsoleErrorAlert(
        'ERR_EXTERNAL_REDIRECT_TIMEOUT',
        'Đã gọi URL Scheme/Intent nhưng sau 1200ms trình duyệt ngoài vẫn không mở (document.hidden === false).'
      );
      console.error(timeoutMsg);
      customDebugAlert(timeoutMsg, () => {
        showInAppFallbackGuide();
      });
    }
    fallbackGuideTimer = null;
  }, 1200);
}
*/