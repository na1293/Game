// pop-up.js - Phiên bản Liquid Glassmorphism Siêu Thực & Tối Ưu Tương Tác

const popupHTML = `
  <div id="global-popup" class="popup-overlay">
    <div class="popup-content">
      <h1 id="popup-title">Tiêu đề</h1>
      <p id="popup-text">Nội dung</p>

      <div id="popup-input-container" style="margin: 1.2rem 0 0 0;"></div>

      <div class="popup-actions">
        <button id="popup-btn-cancel" class="popup-btn secondary" style="display: none;">Hủy</button>
        <button id="popup-btn-confirm" class="popup-btn primary">Đóng</button>
      </div>
    </div>
  </div>
`;

const popupCSS = `
  /* 1. Overlay: Trong suốt hoàn toàn, xóa bỏ hiệu ứng mờ ảo phía sau */
  .popup-overlay {
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: transparent; /* Xóa màu nền tối */
    backdrop-filter: none; /* Xóa mờ nền phía sau */
    -webkit-backdrop-filter: none;
    display: flex; justify-content: center; align-items: center;
    opacity: 0; visibility: hidden; 
    transition: opacity 0.3s cubic-bezier(0.25, 1, 0.5, 1), visibility 0.3s; 
    z-index: 99999;
    pointer-events: none; /* Tránh cản trở click khi ẩn */
  }
  
  .popup-overlay.active { 
    opacity: 1; 
    visibility: visible; 
    pointer-events: auto; 
  }

  /* 2. Main Popup Content: Liquid Glass 3D Siêu Thực */
  .popup-content {
    /* Nền kính lỏng sáng & Đọc chữ đen chuẩn */
    background: rgba(255, 255, 255, 0.55); 
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    
    color: #000000;
    border: 1px solid rgba(255, 255, 255, 0.7);
    border-radius: 28px; /* Bo góc giọt nước */
    padding: 2rem;
    max-width: 460px; width: 88%;
    text-align: center;
    
    /* Hiệu ứng bóng nổi 3D & khúc xạ ánh sáng lỏng */
    box-shadow: 
      0 20px 50px rgba(0, 0, 0, 0.15),
      inset 0 2px 3px rgba(255, 255, 255, 0.9),
      inset 0 -2px 5px rgba(0, 0, 0, 0.08);

    /* Animation biến dạng giọt nước khi xuất hiện */
    transform: scale(0.85) translateY(20px);
    transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    pointer-events: auto;
  }

  .popup-overlay.active .popup-content { 
    transform: scale(1) translateY(0); 
  }

  /* Định dạng Tiêu đề & Nội dung */
  #popup-title {
    margin: 0 0 0.5rem 0;
    font-size: 1.35rem;
    font-weight: 700;
    color: #000000;
    letter-spacing: -0.3px;
  }

  #popup-text {
    margin: 0;
    font-size: 0.98rem;
    color: #222222;
    line-height: 1.5;
  }

  /* 3. Input & Select: Đồng bộ phong cách Kính lỏng chìm */
  .popup-control {
    width: 100%; padding: 0.8rem 1rem;
    border: 1px solid rgba(255, 255, 255, 0.8);
    border-radius: 16px;
    font-size: 0.95rem; outline: none; box-sizing: border-box;
    background: rgba(255, 255, 255, 0.5);
    color: #000000; display: block;
    backdrop-filter: blur(8px);
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.06);
    transition: all 0.25s ease;
  }

  .popup-control:focus { 
    background: rgba(255, 255, 255, 0.85);
    border-color: rgba(0, 122, 255, 0.6); 
    box-shadow: 0 0 12px rgba(0, 122, 255, 0.25), inset 0 1px 2px rgba(0,0,0,0.05); 
  }

  /* 4. Action Buttons Container */
  .popup-actions {
    display: flex; gap: 12px; justify-content: center; margin-top: 1.8rem;
  }

  /* 5. Liquid Buttons */
  .popup-btn {
    padding: 10px 22px; 
    border-radius: 50px; /* Nút hình viên thuốc / giọt nước */
    font-size: 0.9rem; font-weight: 600;
    cursor: pointer; 
    user-select: none;
    letter-spacing: 0.3px;
    transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
    outline: none;
  }

  /* Primary Button (Nổi bật) */
  .popup-btn.primary { 
    background: rgba(0, 122, 255, 0.85); 
    color: #ffffff;
    border: 1px solid rgba(255, 255, 255, 0.5);
    box-shadow: 0 6px 20px rgba(0, 122, 255, 0.35), inset 0 1px 2px rgba(255, 255, 255, 0.6);
  }
  .popup-btn.primary:hover { 
    background: rgba(0, 122, 255, 1);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 122, 255, 0.45), inset 0 1px 2px rgba(255, 255, 255, 0.8);
  }
  .popup-btn.primary:active { transform: translateY(0); }

  /* Secondary Button (Kính trong nhẹ) */
  .popup-btn.secondary { 
    background: rgba(255, 255, 255, 0.4); 
    color: #000000;
    border: 1px solid rgba(255, 255, 255, 0.7);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05), inset 0 1px 2px rgba(255, 255, 255, 0.8);
  }
  .popup-btn.secondary:hover { 
    background: rgba(255, 255, 255, 0.7);
    transform: translateY(-2px);
  }
  .popup-btn.secondary:active { transform: translateY(0); }
`;

function initPopup() {
  if (document.getElementById('global-popup')) return;

  const style = document.createElement('style');
  style.textContent = popupCSS;
  document.head.appendChild(style);

  document.body.insertAdjacentHTML('beforeend', popupHTML);

  const overlay = document.getElementById('global-popup');
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      // Click ra ngoài vùng popup-content sẽ đóng
      if (e.target === overlay) window.closePopup();
    });
  }
}

// Hàm đóng Popup
window.closePopup = function() {
  const overlay = document.getElementById('global-popup');
  if (overlay) overlay.classList.remove('active');
};

// Hàm reset nút bấm (Chống đè event listener)
function setupButtons(showCancel, confirmText, cancelText, onConfirm) {
  let btnConfirm = document.getElementById('popup-btn-confirm');
  let btnCancel = document.getElementById('popup-btn-cancel');

  const newConfirm = btnConfirm.cloneNode(true);
  const newCancel = btnCancel.cloneNode(true);
  
  btnConfirm.parentNode.replaceChild(newConfirm, btnConfirm);
  btnCancel.parentNode.replaceChild(newCancel, btnCancel);

  newConfirm.textContent = confirmText || "Đóng";
  newCancel.textContent = cancelText || "Hủy";
  newCancel.style.display = showCancel ? 'inline-block' : 'none';

  newCancel.onclick = () => window.closePopup();
  newConfirm.onclick = () => {
    window.closePopup();
    if (typeof onConfirm === 'function') onConfirm();
  };
}

// 1. Popup Thông báo
window.showPopup = function(title, text, btnText = "Đóng") {
  initPopup();

  document.getElementById('popup-title').textContent = title;
  document.getElementById('popup-text').textContent = text;
  document.getElementById('popup-input-container').innerHTML = '';

  setupButtons(false, btnText, null, null);

  document.getElementById('global-popup').classList.add('active');
};

// 2. Popup Nhập Text
window.showTextPrompt = function(title, placeholder, onConfirm) {
  initPopup();

  document.getElementById('popup-title').textContent = title;
  document.getElementById('popup-text').textContent = '';

  const container = document.getElementById('popup-input-container');
  container.innerHTML = `<input type="text" id="popup-text-input" class="popup-control" placeholder="${placeholder || ''}" autocomplete="off">`;

  setupButtons(true, "Xác nhận", "Hủy", () => {
    const input = document.getElementById('popup-text-input');
    const val = input ? input.value : '';
    if (typeof onConfirm === 'function') onConfirm(val);
  });

  document.getElementById('global-popup').classList.add('active');

  setTimeout(() => {
    const input = document.getElementById('popup-text-input');
    if (input) input.focus();
  }, 120);
};

// 3. Popup Dropdown List
window.showDropdownPrompt = function(title, optionsArray, onConfirm) {
  initPopup();

  document.getElementById('popup-title').textContent = title;
  document.getElementById('popup-text').textContent = '';

  const optionsHTML = optionsArray.map(opt => {
    const val = typeof opt === 'object' ? opt.value : opt;
    const label = typeof opt === 'object' ? opt.label : opt;
    return `<option value="${val}">${label}</option>`;
  }).join('');

  const container = document.getElementById('popup-input-container');
  container.innerHTML = `<select id="popup-select-input" class="popup-control">${optionsHTML}</select>`;

  setupButtons(true, "Chọn", "Hủy", () => {
    const select = document.getElementById('popup-select-input');
    const val = select ? select.value : '';
    if (typeof onConfirm === 'function') onConfirm(val);
  });

  document.getElementById('global-popup').classList.add('active');
};