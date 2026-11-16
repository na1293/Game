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
  /* 1. Overlay: Nền tối mờ đơn giản chuẩn Material */
  .popup-overlay {
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex; justify-content: center; align-items: center;
    opacity: 0; visibility: hidden; 
    transition: opacity 0.2s ease, visibility 0.2s; 
    z-index: 99999;
    pointer-events: none;
  }
  
  .popup-overlay.active { 
    opacity: 1; 
    visibility: visible; 
    pointer-events: auto; 
  }

  /* 2. Main Popup Content: Phẳng, bo góc vừa vặn, nền trắng tinh gọn */
  .popup-content {
    position: relative;
    background: #ffffff;
    color: #1f1f1f;
    border-radius: 24px;
    padding: 24px;
    max-width: 400px; width: 88%;
    text-align: left;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
    
    transform: scale(0.95);
    transition: transform 0.2s cubic-bezier(0, 0, 0.2, 1);
    pointer-events: auto;
  }

  .popup-overlay.active .popup-content { 
    transform: scale(1); 
  }

  /* Tiêu đề & Nội dung */
  #popup-title {
    margin: 0 0 8px 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #111111;
    letter-spacing: -0.2px;
  }

  #popup-text {
    margin: 0;
    font-size: 0.95rem;
    color: #444444;
    line-height: 1.5;
  }

  /* 3. Input & Select: Viền phẳng gọn gàng */
  .popup-control {
    width: 100%; 
    padding: 12px 16px;
    border: 1.5px solid #d1d5db;
    border-radius: 12px;
    font-size: 0.95rem; 
    outline: none; 
    box-sizing: border-box;
    background: #f9fafb;
    color: #111827; 
    display: block;
    transition: border-color 0.15s ease, background-color 0.15s ease;
  }

  .popup-control::placeholder {
    color: #9ca3af;
  }

  .popup-control:focus { 
    background: #ffffff;
    border-color: #1a73e8; 
  }

  .popup-control option {
    background: #ffffff;
    color: #000000;
  }

  /* 4. Action Buttons Container */
  .popup-actions {
    display: flex; 
    gap: 10px; 
    justify-content: flex-end; 
    margin-top: 24px;
  }

  /* 5. Buttons kiểu Material Design */
  .popup-btn {
    padding: 10px 20px; 
    border-radius: 100px;
    font-size: 0.9rem; 
    font-weight: 600;
    cursor: pointer; 
    user-select: none;
    border: none;
    outline: none;
    transition: background-color 0.15s ease, transform 0.1s ease;
  }

  .popup-btn:active { 
    transform: scale(0.96); 
  }

  /* Primary Button (Xanh dương Android) */
  .popup-btn.primary { 
    background: #1a73e8;
    color: #ffffff;
  }
  .popup-btn.primary:hover { 
    background: #1557b0;
  }

  /* Secondary Button (Nút phụ xám nhạt) */
  .popup-btn.secondary { 
    background: #f1f3f4;
    color: #3c4043;
  }
  .popup-btn.secondary:hover { 
    background: #e8eaed;
  }
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
// Vá hàm showTextPrompt an toàn hơn
window.showTextPrompt = function(title, placeholder, onConfirm) {
  initPopup();

  document.getElementById('popup-title').textContent = title;
  document.getElementById('popup-text').textContent = '';

  const container = document.getElementById('popup-input-container');
  container.innerHTML = ''; // Xóa sạch nội dung cũ

  const input = document.createElement('input');
  input.type = 'text';
  input.id = 'popup-text-input';
  input.className = 'popup-control';
  input.placeholder = placeholder || ''; // An toàn tuyệt đối khỏi Attribute Injection
  input.autocomplete = 'off';
  container.appendChild(input);

  setupButtons(true, "Xác nhận", "Hủy", () => {
    const val = input.value;
    if (typeof onConfirm === 'function') onConfirm(val);
  });

  document.getElementById('global-popup').classList.add('active');

  setTimeout(() => input.focus(), 120);
};

// 3. Popup Dropdown List
// 3. Popup Dropdown List (Đã vá lỗi XSS)
window.showDropdownPrompt = function(title, optionsArray, onConfirm) {
  initPopup();

  document.getElementById('popup-title').textContent = title;
  document.getElementById('popup-text').textContent = '';

  const container = document.getElementById('popup-input-container');
  container.innerHTML = ''; // Xóa sạch nội dung cũ

  // Tạo thẻ select an toàn bằng DOM API
  const select = document.createElement('select');
  select.id = 'popup-select-input';
  select.className = 'popup-control';

  optionsArray.forEach(opt => {
    const val = typeof opt === 'object' ? opt.value : opt;
    const label = typeof opt === 'object' ? opt.label : opt;

    const option = document.createElement('option');
    option.value = val;
    option.textContent = label; // Chống XSS
    select.appendChild(option);
  });

  container.appendChild(select);

  setupButtons(true, "Chọn", "Hủy", () => {
    const val = select.value;
    if (typeof onConfirm === 'function') onConfirm(val);
  });

  document.getElementById('global-popup').classList.add('active');
};