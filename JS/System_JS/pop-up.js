// pop-up.js - Phiên bản sửa lỗi export

const popupHTML = `
  <div id="global-popup" class="popup-overlay">
    <div class="popup-content">
      <h1 id="popup-title">Tiêu đề</h1>
      <p id="popup-text">Nội dung</p>
      <button id="popup-btn">Đóng</button>
    </div>
  </div>
`;

const popupCSS = `
  .popup-overlay {
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);
    display: flex; justify-content: center; align-items: center;
    opacity: 0; visibility: hidden; transition: all 0.3s; z-index: 9999;
  }
  .popup-overlay.active { opacity: 1; visibility: visible; }
  .popup-content {
    background: white; padding: 2rem; border-radius: 12px;
    max-width: 500px; width: 90%; text-align: center;
    transform: scale(0.9); transition: transform 0.3s;
  }
  .popup-overlay.active .popup-content { transform: scale(1); }
`;

function initPopup() {
  if (document.getElementById('global-popup')) return;
  
  const style = document.createElement('style');
  style.textContent = popupCSS;
  document.head.appendChild(style);
  
  document.body.insertAdjacentHTML('beforeend', popupHTML);
  
  const btn = document.getElementById('popup-btn');
  const overlay = document.getElementById('global-popup');
  
  const closePopup = () => overlay.classList.remove('active');
  
  // Gán sự kiện an toàn
  if (btn) btn.onclick = closePopup;
  if (overlay) {
    overlay.onclick = (e) => { 
      if(e.target === overlay) closePopup(); 
    };
  }
}

// Hàm chính: Không dùng export, gán thẳng vào window
window.showPopup = function(title, text, btnText = "Đóng") {
  initPopup();
  
  const titleEl = document.getElementById('popup-title');
  const textEl = document.getElementById('popup-text');
  const btnEl = document.getElementById('popup-btn');
  const overlay = document.getElementById('global-popup');

  if (titleEl) titleEl.textContent = title;
  if (textEl) textEl.textContent = text;
  if (btnEl) btnEl.textContent = btnText;
  if (overlay) overlay.classList.add('active');
};