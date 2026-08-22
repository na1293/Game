// let scheduleData = {
//     0: "Chủ Nhật: Nghỉ ngơi, thư giãn hoặc làm bài tập.",
//     1: "🎯 Thứ Hai: Lý, Tin, Toán, HĐTN.",
//     2: "🔥 Thứ Ba: Anh, Địa, Văn, HĐTN.",
//     3: "🏃‍♂️ Thứ Tư: Sáng: GDĐP, Quốc phòng, Thể chất | Chiều: KTPL, Tin, Toán, Anh.",
//     4: "⚡ Thứ Năm: KTPL, Sử, Địa.",
//     5: "🎉 Thứ Sáu: Văn, Toán, HĐTN. Sắp cuối tuần rồi cố lên!",
//     6: "Thứ Bảy: Cuối tuần rồi, hoàn thành nốt To-do list."
// };

// Code này kém hiệu quả, bất tiện khi có thay đổi nhỏ

// Thay vào đó sẽ dùng file lấy từ Server text dạng JSON

/// ==== Main code === ///

// === CẤU HÌNH VÀ KHỞI TẠO HỆ THỐNG === //
// === CẤU HÌNH VÀ NGUYÊN MẪU DỮ LIỆU === //
// === Note: Khai báo biến scheduleData ở phạm vi phù hợp để chứa dữ liệu Thời khóa biểu === //
// === Note: Khai báo biến toàn cục (Global Scope) để các file JS khác có thể truy cập === //
var scheduleData = {};

(function() {
    const STORAGE_KEY = 'scheduleData_v1';
    const GIST_BASE_URL = 'https://gist.githubusercontent.com/na1293/672cb87bee7c50dd3c0c00a94a7de134/raw/scheduleAPI.json';
    
    // === Note: Thêm Timestamp để triệt tiêu Browser & CDN Cache === //
    const GIST_URL = `${GIST_BASE_URL}?t=${Date.now()}`;

    async function initScheduleData() {
        try {
            const response = await fetch(GIST_URL);
            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

            const data = await response.json();
            scheduleData = data;
            
            // Backup vào LocalStorage
            localStorage.setItem(STORAGE_KEY, JSON.stringify(scheduleData));
            
            // === Note: Phát ra Custom Event báo hiệu cho các file JS khác biết dữ liệu đã sẵn sàng === //
            window.dispatchEvent(new CustomEvent('scheduleDataReady'));
        } catch (error) {
            console.warn('Lỗi tải API, chuyển sang đọc Cache:', error);
            
            const cachedData = localStorage.getItem(STORAGE_KEY);
            if (cachedData) {
                scheduleData = JSON.parse(cachedData);
                window.dispatchEvent(new CustomEvent('scheduleDataReady'));
            }
        }
    }

    initScheduleData();
})();