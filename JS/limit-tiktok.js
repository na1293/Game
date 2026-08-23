// limit-tiktok.js - Bản vá lỗi sự kiện kép và tự động canh giờ
document.addEventListener('DOMContentLoaded', () => {
    const btnLimit = document.getElementById('limit-tiktok');
    const GRACE_PERIOD_MS = 3 * 60 * 1000; // Cho phép trễ tối đa 3 phút

    function getCoins() {
        return parseInt(localStorage.getItem('user_coins')) || 0;
    }
    
    function setCoins(amount) {
        localStorage.setItem('user_coins', amount);
        const coinDisplay = document.getElementById('user-coins-display');
        if (coinDisplay) coinDisplay.textContent = amount;
    }

    // Kiểm tra trạng thái ngay khi tải/F5 trang web
    function checkInitialState() {
        const savedDeadline = localStorage.getItem('tiktok_deadline');
        const savedDeposit = parseInt(localStorage.getItem('tiktok_deposit')) || 0;
        
        if (savedDeadline && btnLimit) {
            const now = Date.now();
            const deadline = parseInt(savedDeadline);

            if (now > deadline + GRACE_PERIOD_MS) {
                // Tự động phạt nếu quá hạn
                if (typeof window.showPopup === 'function') {
                    window.showPopup("Quá thời hạn", `Bạn đã không xác nhận dừng TikTok đúng hạn. Hệ thống đã thu ${savedDeposit} xu cọc.`, "Xác nhận");
                } else {
                    alert(`Bạn đã không xác nhận dừng TikTok đúng hạn. Hệ thống đã thu ${savedDeposit} xu cọc.`);
                }
                localStorage.removeItem('tiktok_deadline');
                localStorage.removeItem('tiktok_deposit');
                btnLimit.textContent = "Bắt đầu kỷ luật";
                btnLimit.style.backgroundColor = "green";
            } else {
                // Vẫn đang trong thời gian xem TikTok
                btnLimit.textContent = "Dừng";
                btnLimit.style.backgroundColor = "#dc3545";
            }
        } else if (btnLimit) {
            btnLimit.textContent = "Bắt đầu kỷ luật";
            btnLimit.style.backgroundColor = "green";
        }
    }
    
    checkInitialState();

    // Tự động tuần tra ngầm mỗi 10 giây để phạt ngay cả khi không tải lại trang
    setInterval(() => {
        const savedDeadline = localStorage.getItem('tiktok_deadline');
        if (savedDeadline) {
            const now = Date.now();
            const deadline = parseInt(savedDeadline);
            if (now > deadline + GRACE_PERIOD_MS) {
                checkInitialState(); 
            }
        }
    }, 10000);

    if (btnLimit) {
        // 🔥 FIX LỖI: Dùng onclick thay cho addEventListener để tránh lỗi kích hoạt x2 tiền
        btnLimit.onclick = () => {
            const savedDeadline = localStorage.getItem('tiktok_deadline');
            
            // --- TRẠNG THÁI 1: BẤM NÚT "DỪNG" ---
            if (savedDeadline) {
                const savedDeposit = parseInt(localStorage.getItem('tiktok_deposit')) || 0;
                const deadline = parseInt(savedDeadline);
                const now = Date.now();
                
                // Xóa dữ liệu ngay lập tức để chặn spam click
                localStorage.removeItem('tiktok_deadline');
                localStorage.removeItem('tiktok_deposit');
                
                // Reset giao diện nút
                btnLimit.textContent = "Bắt đầu kỷ luật";
                btnLimit.style.backgroundColor = "green";

                let currentCoins = getCoins();

                if (now <= deadline + GRACE_PERIOD_MS) {
                    // Trả lại cọc nếu đúng hạn (chỉ cộng 1 lần duy nhất)
                    currentCoins += savedDeposit;
                    setCoins(currentCoins);

                    const msg = `Bạn đã dừng TikTok đúng hạn! Hệ thống đã hoàn lại ${savedDeposit} xu cọc. Tổng số xu hiện tại: ${currentCoins} xu.`;
                    if (typeof window.showPopup === 'function') window.showPopup("Hoàn thành kỷ luật", msg, "Xác nhận");
                    else alert(msg);
                } else {
                    // Quá 3 phút -> Mất cọc
                    const msg = `Bạn đã quá hạn xác nhận nên không được nhận lại ${savedDeposit} xu cọc. Tổng số xu hiện tại: ${currentCoins} xu.`;
                    if (typeof window.showPopup === 'function') window.showPopup("Quá thời hạn", msg, "Xác nhận");
                    else alert(msg);
                }
                return;
            }

            // --- TRẠNG THÁI 2: BẤM NÚT "BẮT ĐẦU KỶ LUẬT" ---
            let currentCoins = getCoins();

            if (currentCoins < 4) {
                if (typeof window.showPopup === 'function') {
                    window.showPopup("Thông báo", "Bạn cần có tối thiểu 4 xu để cọc kỷ luật.", "Tôi đã hiểu");
                } else alert("Bạn cần có tối thiểu 4 xu để cọc kỷ luật.");
                return;
            }

            const depositCoins = Math.round(currentCoins * 0.3);

            // TRỪ XU NGAY LẬP TỨC LÀM CỌC
            currentCoins -= depositCoins;
            setCoins(currentCoins);

            const limitMinutes = 45; // Xài TikTok 45p
            const nowTime = new Date();
            const deadlineTimeMs = nowTime.getTime() + limitMinutes * 60 * 1000;

            // Định dạng thời gian quay lại
            const targetDate = new Date(deadlineTimeMs);
            const hours = String(targetDate.getHours()).padStart(2, '0');
            const minutes = String(targetDate.getMinutes()).padStart(2, '0');
            const stopTimeStr = `${hours}:${minutes}`;

            // Lưu dữ liệu vào localStorage
            localStorage.setItem('tiktok_deadline', deadlineTimeMs);
            localStorage.setItem('tiktok_deposit', depositCoins);

            // Đổi UI nút sang "Dừng"
            btnLimit.textContent = "Dừng";
            btnLimit.style.backgroundColor = "#dc3545";

            const msgText = `Hệ thống đã cọc ${depositCoins} xu của bạn. Hãy chủ động đặt báo thức và quay lại bấm "Dừng" lúc ${stopTimeStr} để lấy lại tiền nhé!`;

            if (typeof window.showPopup === 'function') {
                window.showPopup("Bắt đầu kỷ luật", msgText, "Tôi đã hiểu");
            } else {
                alert(msgText);
            }
        };
    }
});