const URL_TOMATO_SCRIPT = "https://calm-wildflower-6232.namhai456n.workers.dev/";

let tomato_count_backend = parseInt(localStorage.getItem('tomato_count')) || 0;
let lastClickTime = 0;
let timeOffset = 0; 
let tomatoPrice = null; // Để null ban đầu để nhận diện trạng thái chưa tải xong

// 🌟 Hàm cập nhật giao diện hiển thị ra màn hình chính
function updateTomatoUI() {
    // 1. Cập nhật số cà chua trong kho
    const countDisplay = document.getElementById("tomato-count");
    if (countDisplay) countDisplay.innerHTML = `${tomato_count_backend}/10`;

    // 2. Cập nhật giá cà chua (Chỉ hiện số khi đã fetch thành công, nếu không thì báo Đang tải...)
    const priceDisplay = document.getElementById("tomato-price-display");
    if (priceDisplay) {
        if (tomatoPrice !== null) {
            priceDisplay.innerHTML = `${tomatoPrice} xu/quả`;
        } else {
            priceDisplay.innerHTML = "Đang tải...";
        }
    }

    // 3. Cập nhật số xu đang sở hữu
    const coinsDisplay = document.getElementById("user-coins-display");
    const currentCoins = parseInt(localStorage.getItem('user_coins')) || 0;
    if (coinsDisplay) coinsDisplay.innerText = `${currentCoins} xu`;
}

// 🌟 Hàm lấy giá mới nhất từ Server công khai ban đầu
async function fetchLatestPriceFromServer() {
    try {
        const sheetRes = await fetch(URL_TOMATO_SCRIPT);
        const sheetData = await sheetRes.json();
        if (sheetData && sheetData.gia_ca_chua !== undefined && sheetData.gia_ca_chua !== null) {
            tomatoPrice = parseInt(sheetData.gia_ca_chua);
            console.log(`🔄 Đồng bộ giá từ Server thành công: ${tomatoPrice} xu`);
        } else {
            tomatoPrice = 0; // Giá dự phòng nếu server lỗi cấu trúc dữ liệu
        }
    } catch (e) {
        console.warn("⚠️ Không kết nối được server, dùng dữ liệu dự phòng:", e);
        tomatoPrice = 12; // Giá dự phòng nếu sập mạng
    }
    // Cập nhật giao diện lập tức ngay sau khi có kết quả
    updateTomatoUI();
}

// 💰 Bán bất cứ lúc nào
async function sellTomatoesAnytime() {
    if (tomato_count_backend <= 0) {
        alert("🍅 Bạn chưa có quả cà chua nào trong kho để bán hết á sốp!");
        return;
    }

    // Nếu lúc bấm nút mà vì lý do nào đó vẫn đang tải, bắt hệ thống đợi fetch xong
    if (tomatoPrice === null) {
        const priceDisplay = document.getElementById("tomato-price-display");
        if (priceDisplay) priceDisplay.innerHTML = "Đang kiểm tra giá...";
        await fetchLatestPriceFromServer();
    }
    
    const confirmSell = confirm(`Bạn đang có ${tomato_count_backend} quả cà chua. Bạn có muốn bán với giá ${tomatoPrice} xu/quả không?`);
    if (!confirmSell) return;

    let coins = parseInt(localStorage.getItem('user_coins')) || 0;
    const totalEarnings = tomato_count_backend * tomatoPrice;
    
    coins += totalEarnings;
    localStorage.setItem('user_coins', coins);
    
    tomato_count_backend = 0;
    localStorage.setItem('tomato_count', 0);
    
    updateTomatoUI();
    alert(`💰 Bán thành công! Bạn thu về ${totalEarnings} xu.`);
}

// 1. Đồng bộ thời gian server quốc tế + Tự động Fetch giá ngay lập tức khi load trang
async function initTomatoSystem() {
    try {
        // Đồng bộ thời gian thực chống đổi giờ máy user
        const timeRes = await fetch('https://worldtimeapi.org/api/ip');
        const timeData = await timeRes.json();
        timeOffset = new Date(timeData.datetime).getTime() - Date.now();
        console.log("🕒 Đã đồng bộ thời gian máy chủ!");
    } catch (e) {
        console.warn("⚠️ Lỗi đồng bộ thời gian:", e);
    }

    // Tự động chạy fetch giá luôn không cần đợi trigger gì hết
    await fetchLatestPriceFromServer();
    checkMonthlyReset();
}

// 2. Hàm xử lý khi thu hoạch cà chua
function tomato_now() {
    const displayElement = document.getElementById("tomato-count");
    if (!displayElement) return;

    const now = Date.now() + timeOffset;

    if (now - lastClickTime < 200) {
        console.warn("Bình tĩnh nào sốp, hái nhanh nát hết cà chua! 🍅");
        return;
    }
    lastClickTime = now;

    const stored = parseInt(localStorage.getItem('tomato_count')) || 0;
    if (tomato_count_backend > stored + 1) {
        console.error("Cảnh báo: Phát hiện can thiệp dữ liệu!");
        tomato_count_backend = stored + 1;
    }

    tomato_count_backend += 1;
    localStorage.setItem('tomato_count', tomato_count_backend);
    
    updateTomatoUI();
}

// 3. Kiểm tra chu kỳ 30 ngày kết thúc mùa vụ
function checkMonthlyReset() {
    const lastReset = localStorage.getItem('last_reset_date');
    const now = Date.now() + timeOffset;
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;

    if (!lastReset) {
        localStorage.setItem('last_reset_date', now);
        return;
    }

    if (now - parseInt(lastReset) >= thirtyDays) {
        showMonthlyPopup();
    }
}

// 4. Hiển thị Pop-up thông minh kết thúc tháng
async function showMonthlyPopup() {
    if (tomatoPrice === null) {
        await fetchLatestPriceFromServer();
    }

    let modal = document.getElementById('monthly-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'monthly-modal';
        modal.style = "display: flex; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 9999; justify-content: center; align-items: center; font-family: sans-serif;";
        modal.innerHTML = `
            <div style="background: white; padding: 30px; border-radius: 20px; text-align: center; max-width: 400px; box-shadow: 0 10px 25px rgba(0,0,0,0.3);">
                <h2 id="modal-msg" style="color: tomato; margin-bottom: 15px; font-size: 1.4rem;"></h2>
                <p style="color: #4a5568; font-size: 0.95rem; margin-bottom: 20px;">Giá thị trường hiện tại: <strong style="color: #e53e3e;"><span id="modal-price-display-popup">${tomatoPrice}</span> xu</strong>/quả.</p>
                <div style="display: flex; justify-content: center; gap: 15px;">
                    <button onclick="sellTomatoes()" style="padding: 12px 24px; background: #48bb78; color: white; border: none; border-radius: 12px; cursor: pointer; font-weight: bold; transition: 0.2s;">Bán hết</button>
                    <button onclick="keepTomatoes()" style="padding: 12px 24px; background: #a0aec0; color: white; border: none; border-radius: 12px; cursor: pointer; font-weight: bold; transition: 0.2s;">Giữ lại</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    const msg = document.getElementById('modal-msg');
    const priceDisplayPopup = document.getElementById('modal-price-display-popup');
    const currentCount = tomato_count_backend;

    if (msg) {
        if (currentCount <= 10) {
            msg.innerText = `Tháng này bạn đã thu ${currentCount}/10 quả cà chua.`;
        } else {
            msg.innerText = `Bạn đã bội thu ${currentCount} quả cà chua!`;
        }
    }
    
    if (priceDisplayPopup) {
        priceDisplayPopup.innerText = tomatoPrice;
    }
}

// 5. Hàm xử lý khi chọn BÁN HẾT (Popup cuối tháng)
function sellTomatoes() {
    let coins = parseInt(localStorage.getItem('user_coins')) || 0;
    const totalEarnings = tomato_count_backend * tomatoPrice;
    
    coins += totalEarnings;
    localStorage.setItem('user_coins', coins);
    
    alert(`💰 Thành công! Bạn đã bán toàn bộ cà chua thu về ${totalEarnings} xu.`);
    resetSeason(true);
}

// 6. Hàm xử lý khi chọn GIỮ LẠI
function keepTomatoes() {
    alert("🍅 Bạn chọn giữ lại số cà chua này để tích lũy tiếp cho tháng sau!");
    resetSeason(false);
}

// 7. Reset mùa vụ mới
function resetSeason(shouldResetCount) {
    const now = Date.now() + timeOffset;
    localStorage.setItem('last_reset_date', now);
    
    if (shouldResetCount) {
        tomato_count_backend = 0;
        localStorage.setItem('tomato_count', 0);
    }

    updateTomatoUI();

    const modal = document.getElementById('monthly-modal');
    if (modal) modal.remove();
}

// 8. Hệ thống lệnh Admin đặc quyền
function executeAdminCommand(command) {
    const cmd = command.trim().toLowerCase();

    if (cmd === "admin") {
        console.log("⚡ Admin Mode: Kích hoạt thẳng đến Pop-up mùa vụ!");
        showMonthlyPopup();
        return true;
    }

    if (cmd.startsWith("set_tomato ")) {
        const value = parseInt(cmd.split(" ")[1]);
        if (!isNaN(value)) {
            tomato_count_backend = value;
            localStorage.setItem('tomato_count', tomato_count_backend);
            updateTomatoUI();
            
            console.log("⚡ Admin Mode: Cập nhật số lượng thành công!");
            return true;
        }
    }
    return false;
}

// Khởi chạy hệ thống lắng nghe
document.addEventListener('DOMContentLoaded', () => {
    // Gọi updateUI trước để lấy tạm số lượng cà chua và số xu cũ trong localStorage ra màn hình
    updateTomatoUI();
    
    // Kích hoạt tiến trình đồng bộ ngầm với Server
    initTomatoSystem();

    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');

    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const isCmd = executeAdminCommand(searchInput.value);
                if (isCmd) {
                    e.preventDefault();
                    searchInput.value = '';
                }
            }
        });
    }

    if (searchBtn) {
        searchBtn.addEventListener('click', (e) => {
            const isCmd = executeAdminCommand(searchInput.value);
            if (isCmd) {
                e.stopImmediatePropagation();
                searchInput.value = '';
            }
        });
    }
});