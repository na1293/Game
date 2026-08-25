// pop-up.js - Phiên bản sửa triệt để lỗi liệt nút & lỗi không nhập/chọn được

const popupHTML = `
  <div id="global-popup" class="popup-overlay">
    <div class="popup-content">
      <h1 id="popup-title">Tiêu đề</h1>
      <p id="popup-text">Nội dung</p>

      <div id="popup-input-container" style="margin: 1rem 0;"></div>

      <div class="popup-actions" style="display: flex; gap: 10px; justify-content: center; margin-top: 1.5rem;">
        <button id="popup-btn-cancel" class="popup-btn secondary" style="display: none;">Hủy</button>
        <button id="popup-btn-confirm" class="popup-btn primary">Đóng</button>
      </div>
    </div>
  </div>
`;

const popupCSS = `
  .popup-overlay {
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);
    display: flex; justify-content: center; align-items: center;
    opacity: 0; visibility: hidden; transition: opacity 0.25s, visibility 0.25s; z-index: 99999;
  }
  .popup-overlay.active { opacity: 1; visibility: visible; }
  .popup-content {
    background: white; padding: 2rem; border-radius: 12px;
    max-width: 500px; width: 90%; text-align: center;
    transform: scale(0.9); transition: transform 0.25s;
    box-shadow: 0 10px 25px rgba(0,0,0,0.15);
    pointer-events: auto; /* Đảm bảo nhận tương tác */
  }
  .popup-overlay.active .popup-content { transform: scale(1); }
  
  .popup-control {
    width: 100%; padding: 0.75rem; border: 1px solid #ccc;
    border-radius: 8px; font-size: 1rem; outline: none; box-sizing: border-box;
    background: #fff; color: #333; display: block;
  }
  .popup-control:focus { border-color: #007bff; box-shadow: 0 0 5px rgba(0,123,255,0.3); }
  
  .popup-btn {
    padding: 0.6rem 1.2rem; border: none; border-radius: 6px;
    font-size: 1rem; cursor: pointer; transition: background 0.2s;
    user-select: none;
  }
  .popup-btn.primary { background: #007bff; color: white; }
  .popup-btn.primary:hover { background: #0056b3; }
  .popup-btn.secondary { background: #6c757d; color: white; }
  .popup-btn.secondary:hover { background: #5a6268; }
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
      if (e.target === overlay) window.closePopup();
    });
  }
}

// Hàm đóng Popup chung
window.closePopup = function() {
  const overlay = document.getElementById('global-popup');
  if (overlay) overlay.classList.remove('active');
};

// Hàm reset nút bấm để xóa sạch event listener cũ (Tránh bị liệt nút)
function setupButtons(showCancel, confirmText, cancelText, onConfirm) {
  let btnConfirm = document.getElementById('popup-btn-confirm');
  let btnCancel = document.getElementById('popup-btn-cancel');

  // Clone node để xóa sạch các sự kiện onclick trước đó
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

// 1. Popup Thông báo (Cơ bản)
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

  // Delay nhỏ để đảm bảo DOM hiển thị xong mới Focus vào ô nhập
  setTimeout(() => {
    const input = document.getElementById('popup-text-input');
    if (input) input.focus();
  }, 100);
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