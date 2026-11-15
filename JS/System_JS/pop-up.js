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
  /* 1. Overlay: Nền trong suốt hoàn toàn */
  .popup-overlay {
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: transparent;
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    display: flex; justify-content: center; align-items: center;
    opacity: 0; visibility: hidden; 
    transition: opacity 0.35s cubic-bezier(0.22, 1, 0.36, 1), visibility 0.35s; 
    z-index: 99999;
    pointer-events: none;
  }
  
  .popup-overlay.active { 
    opacity: 1; 
    visibility: visible; 
    pointer-events: auto; 
  }

  /* 2. Main Popup Content: Giọt nước pha lê gần trong suốt */
  .popup-content {
    position: relative;
    overflow: hidden;
    
    /* Độ trong suốt cực cao, chỉ phớt nhẹ sắc nước để tách nền trắng */
    background: radial-gradient(
      130% 130% at 22% 15%, 
      rgba(255, 255, 255, 0.38) 0%, 
      rgba(235, 246, 255, 0.14) 55%, 
      rgba(215, 236, 255, 0.25) 100%
    );
    
    /* Khúc xạ nhẹ: nhìn rõ chữ/ảnh bên dưới nhưng hơi bẻ cong ánh sáng */
    backdrop-filter: blur(8px) saturate(165%) contrast(106%);
    -webkit-backdrop-filter: blur(8px) saturate(165%) contrast(106%);
    
    color: #060b14;
    
    /* Bo góc hữu cơ mềm mại */
    border-radius: 38px 36px 40px 37px / 37px 39px 36px 38px;
    padding: 2.2rem 2.1rem;
    max-width: 440px; width: 88%;
    text-align: center;
    
    /* Vành khúc xạ mảnh định hình giọt nước trên nền trắng */
    border: 1px solid rgba(115, 160, 215, 0.32);
    
    /* Đổ bóng tinh tế mô phỏng mép nước trong suốt và ánh sáng hội tụ */
    box-shadow: 
      0 22px 45px -12px rgba(10, 35, 75, 0.18),          /* Bóng đổ mềm tạo độ nổi */
      0 6px 14px -4px rgba(10, 30, 65, 0.1),             /* Bóng tiếp xúc sát đáy */
      inset 0 2px 3px rgba(255, 255, 255, 0.95),         /* Viền sáng sắc nét đỉnh nước */
      inset 2px 4px 10px rgba(255, 255, 255, 0.45),      /* Độ phồng trong suốt */
      inset 0 -5px 12px rgba(110, 170, 235, 0.22),       /* Ánh sáng hội tụ đáy */
      inset 0 -1.5px 3px rgba(15, 50, 100, 0.14);        /* Vành tối khúc xạ mép dưới */

    /* Animation đàn hồi sức căng bề mặt */
    transform: scale(0.84) translateY(24px);
    transition: transform 0.55s cubic-bezier(0.34, 1.68, 0.64, 1);
    pointer-events: auto;
  }

  /* Vệt phản chiếu ánh sáng bóng loáng ở đỉnh giọt nước */
  .popup-content::before {
    content: "";
    position: absolute;
    top: 7px;
    left: 12%;
    width: 55%;
    height: 24px;
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.92) 0%,
      rgba(255, 255, 255, 0.2) 65%,
      rgba(255, 255, 255, 0) 100%
    );
    border-radius: 50%;
    transform: rotate(-3.5deg);
    filter: blur(1px);
    pointer-events: none;
    z-index: 0;
  }

  /* Vệt ánh sáng tụ quang (Caustic) hắt ngược ở đáy */
  .popup-content::after {
    content: "";
    position: absolute;
    bottom: -12px;
    right: 12%;
    width: 62%;
    height: 28px;
    background: radial-gradient(
      ellipse at center,
      rgba(255, 255, 255, 0.9) 0%,
      rgba(160, 215, 255, 0.28) 55%,
      rgba(255, 255, 255, 0) 75%
    );
    filter: blur(3px);
    pointer-events: none;
    z-index: 0;
  }

  .popup-content > * {
    position: relative;
    z-index: 1;
  }

  .popup-overlay.active .popup-content { 
    transform: scale(1) translateY(0); 
  }

  /* Định dạng Tiêu đề & Nội dung với hào quang trắng nhẹ để luôn dễ đọc khi nhìn xuyên thấu */
  #popup-title {
    margin: 0 0 0.55rem 0;
    font-size: 1.38rem;
    font-weight: 700;
    color: #050a12;
    letter-spacing: -0.4px;
    text-shadow: 0 0 12px rgba(255, 255, 255, 0.95), 0 1px 1px rgba(255, 255, 255, 0.9);
  }

  #popup-text {
    margin: 0;
    font-size: 0.98rem;
    color: #111827;
    line-height: 1.55;
    font-weight: 500;
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.9);
  }

  /* 3. Input & Select: Lõm nước trong suốt */
  .popup-control {
    width: 100%; padding: 0.85rem 1.15rem;
    border: 1px solid rgba(115, 160, 215, 0.36);
    border-bottom-color: rgba(255, 255, 255, 0.95);
    border-radius: 20px;
    font-size: 0.96rem; outline: none; box-sizing: border-box;
    background: rgba(255, 255, 255, 0.35);
    color: #050a12; display: block;
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    box-shadow: 
      inset 0 2px 5px rgba(15, 45, 90, 0.09),
      inset 0 -1px 2px rgba(255, 255, 255, 0.85);
    transition: all 0.25s ease;
  }

  .popup-control::placeholder {
    color: rgba(25, 40, 65, 0.55);
  }

  .popup-control:focus { 
    background: rgba(255, 255, 255, 0.75);
    border-color: rgba(0, 122, 255, 0.75); 
    box-shadow: 
      0 0 0 3.5px rgba(0, 122, 255, 0.14), 
      inset 0 1px 3px rgba(15, 45, 90, 0.05); 
  }

  .popup-control option {
    background: #ffffff;
    color: #000000;
  }

  /* 4. Action Buttons Container */
  .popup-actions {
    display: flex; gap: 12px; justify-content: center; margin-top: 1.85rem;
  }

  /* 5. Liquid Droplet Buttons */
  .popup-btn {
    position: relative;
    padding: 11px 26px; 
    border-radius: 50px;
    font-size: 0.93rem; font-weight: 600;
    cursor: pointer; 
    user-select: none;
    letter-spacing: 0.2px;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    outline: none;
    overflow: hidden;
  }

  /* Vệt bóng loáng trên nút */
  .popup-btn::after {
    content: "";
    position: absolute;
    top: 2px; left: 15%;
    width: 70%; height: 42%;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0) 100%);
    border-radius: 50px;
    pointer-events: none;
  }

  /* Primary Button (Giọt nước xanh trong trẻo) */
  .popup-btn.primary { 
    background: radial-gradient(100% 100% at 50% 0%, rgba(40, 150, 255, 0.85) 0%, rgba(0, 108, 235, 0.92) 100%);
    color: #ffffff;
    border: 1px solid rgba(0, 95, 210, 0.45);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    box-shadow: 
      0 8px 18px -4px rgba(0, 110, 240, 0.38),
      inset 0 2px 2px rgba(255, 255, 255, 0.85),
      inset 0 -2px 4px rgba(0, 35, 100, 0.25);
  }
  .popup-btn.primary:hover { 
    transform: translateY(-2px) scale(1.03);
    box-shadow: 
      0 12px 22px -4px rgba(0, 110, 240, 0.48),
      inset 0 2px 3px rgba(255, 255, 255, 0.95);
  }
  .popup-btn.primary:active { 
    transform: translateY(1px) scale(0.95); 
  }

  /* Secondary Button (Giọt nước pha lê trong suốt) */
  .popup-btn.secondary { 
    background: radial-gradient(100% 100% at 50% 0%, rgba(255, 255, 255, 0.65) 0%, rgba(225, 240, 255, 0.35) 100%);
    color: #0f172a;
    border: 1px solid rgba(115, 160, 215, 0.42);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    box-shadow: 
      0 5px 12px -2px rgba(15, 40, 80, 0.1),
      inset 0 1.5px 2px rgba(255, 255, 255, 0.95),
      inset 0 -1.5px 3px rgba(15, 45, 90, 0.1);
  }
  .popup-btn.secondary:hover { 
    background: rgba(255, 255, 255, 0.85);
    transform: translateY(-2px) scale(1.03);
  }
  .popup-btn.secondary:active { 
    transform: translateY(1px) scale(0.95); 
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