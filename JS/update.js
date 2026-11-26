const UPDATE_CONFIG = {
  jsonUrl: "https://gist.githubusercontent.com/na1293/0af7478cbae8398c2bde6245f06b468d/raw/",
  storageKey: "app_update_state",
  reloadFlagKey: "app_just_reloaded",
  expireDays: 14,
  remindAfterHours: 24
};

let currentServerVer = null;

async function syncVersionOnReload() {
  try {
    // Gắn timestamp vào URL + no-store để ép trình duyệt luôn tải bản Gist mới nhất
    const freshUrl = `${UPDATE_CONFIG.jsonUrl}?t=${Date.now()}`;
    const res = await fetch(freshUrl, { cache: "no-store" });
    if (!res.ok) return;

    const rawText = await res.text();
    // Tự động loại bỏ dấu phẩy thừa trước dấu ] hoặc }
    const cleanJsonText = rawText.replace(/,\s*([\]}])/g, "$1");
    const data = JSON.parse(cleanJsonText);

    const update = data?.update;
    if (!update || !update.ver) return;

    currentServerVer = String(update.ver).trim();
    const savedState = getSavedUpdateState();
    const justReloaded = sessionStorage.getItem(UPDATE_CONFIG.reloadFlagKey);

    // Nếu vừa reload do bấm "Cập nhật" -> Lưu lại ver mới vào Local và ẩn
    if (justReloaded === "true") {
      sessionStorage.removeItem(UPDATE_CONFIG.reloadFlagKey);
      saveUpdateState(currentServerVer, "dismissed");
      hideUpdatePopup();
      return;
    }

    // ĐỐI CHIẾU VER: Nếu ver Server BẰNG ver Local
    if (savedState && savedState.ver === currentServerVer) {
      if (savedState.status === "dismissed") {
        hideUpdatePopup();
        return;
      }

      if (savedState.status === "remind") {
        const hoursPassed = (Date.now() - savedState.time) / (1000 * 60 * 60);
        if (hoursPassed < UPDATE_CONFIG.remindAfterHours) {
          hideUpdatePopup();
          return;
        }
      }
    }

    // Nếu là bản mới hoặc đã quá hạn nhắc lại -> Kiểm tra hạn 14 ngày (trừ khi forceUpdate = true)
    if (!update.forceUpdate && isUpdateExpired(update.date, UPDATE_CONFIG.expireDays)) {
      saveUpdateState(currentServerVer, "dismissed");
      hideUpdatePopup();
      return;
    }

    // Hiện pop-up với dữ liệu mới nhất
    renderUpdatePopup(update);

  } catch (err) {
    // Bỏ qua khi offline hoặc lỗi mạng
  }
}

function renderUpdatePopup(update) {
  const titleEl = document.getElementById("title-update-popup");
  const dateEl = document.getElementById("date-update-popup");
  const verEl = document.getElementById("ver-update");
  const contentEl = document.getElementById("ver-content");

  if (titleEl) titleEl.textContent = update.title || "Bản cập nhật mới";
  if (dateEl) dateEl.textContent = `Ngày phát hành: ${formatDateVN(update.date)}`;
  if (verEl) verEl.textContent = `v${currentServerVer}`;

  // CHẶN XSS: Dùng createElement và textContent thay vì innerHTML
  if (contentEl) {
    contentEl.textContent = ""; // Xóa sạch nội dung cũ an toàn
    if (Array.isArray(update.changes) && update.changes.length > 0) {
      const ul = document.createElement("ul");
      ul.style.margin = "0";
      ul.style.paddingLeft = "18px";

      update.changes.forEach((item) => {
        const li = document.createElement("li");
        li.style.marginBottom = "4px";
        li.textContent = String(item); // Ép kiểu chuỗi thuần, vô hiệu hóa mọi thẻ HTML/JS
        ul.appendChild(li);
      });

      contentEl.appendChild(ul);
    } else {
      contentEl.textContent = update.content ? String(update.content) : "";
    }
  }

  const moreWrapper = document.getElementById("update-more-wrapper");
  if (moreWrapper) {
    moreWrapper.style.display = update.forceUpdate ? "none" : "block";
  }

  const overlay = document.getElementById("update-overlay");
  if (overlay) overlay.style.display = "flex";
}

function getSavedUpdateState() {
  try {
    const raw = localStorage.getItem(UPDATE_CONFIG.storageKey);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveUpdateState(ver, status) {
  if (!ver) return;
  localStorage.setItem(
    UPDATE_CONFIG.storageKey,
    JSON.stringify({ ver, status, time: Date.now() })
  );
}

function hideUpdatePopup() {
  const overlay = document.getElementById("update-overlay");
  if (overlay) overlay.style.display = "none";
}

function isUpdateExpired(dateStr, maxDays) {
  if (!dateStr) return false;
  const releaseDate = new Date(`${dateStr}T00:00:00`);
  if (isNaN(releaseDate.getTime())) return false;
  const diffDays = (Date.now() - releaseDate.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays > maxDays;
}

function formatDateVN(dateStr) {
  if (!dateStr || typeof dateStr !== "string" || !dateStr.includes("-")) return dateStr || "";
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
}

function initUpdateEvents() {
  // Đóng/mở menu "Tùy chọn mở rộng"
  document.getElementById("btn-toggle-more")?.addEventListener("click", function () {
    const menu = document.getElementById("update-more-menu");
    if (!menu) return;
    const isHidden = menu.style.display === "none" || menu.style.display === "";
    menu.style.display = isHidden ? "flex" : "none";
    this.classList.toggle("open", isHidden);
  });

  // Nút 1: Cập nhật ngay
  document.getElementById("btn-update-now")?.addEventListener("click", function (e) {
    sessionStorage.setItem(UPDATE_CONFIG.reloadFlagKey, "true");
    saveUpdateState(currentServerVer, "dismissed");

    // Nếu nút không có href chuyển trang riêng thì tự động reload trang
    const href = this.getAttribute("href");
    if (!href || href === "#") {
      e.preventDefault();
      window.location.reload();
    }
  });

  // Nút 2: Nhắc tôi sau 24 giờ
  document.getElementById("btn-remind-later")?.addEventListener("click", () => {
    saveUpdateState(currentServerVer, "remind");
    hideUpdatePopup();
  });

  // Nút 3: Bỏ qua bản cập nhật này
  document.getElementById("btn-skip-forever")?.addEventListener("click", (e) => {
    e.preventDefault();
    saveUpdateState(currentServerVer, "dismissed");
    hideUpdatePopup();
  });

  // Kiểm tra phiên bản ngay khi khởi chạy
  syncVersionOnReload();
}

// Đảm bảo HTML đã tải xong mới gắn sự kiện và kiểm tra bản cập nhật
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initUpdateEvents);
} else {
  initUpdateEvents();
}
