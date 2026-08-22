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

// Dữ liệu Offline dự phòng mặc định (dùng khi mất mạng hoàn toàn)
// FirstFile_schedule.js

// Luôn khởi tạo biến global trước
window.scheduleData = window.scheduleData || {
    0: "Chủ Nhật: Nghỉ ngơi",
    1: "Thứ Hai: Chưa có lịch",
    2: "Thứ Ba: Chưa có lịch",
    3: "Thứ Tư: Chưa có lịch",
    4: "Thứ Năm: Chưa có lịch",
    5: "Thứ Sáu: Chưa có lịch",
    6: "Thứ Bảy: Chưa có lịch"
};

async function fetchScheduleFromOnline() {
    const API_URL = "https://gist.githubusercontent.com/na1293/672cb87bee7c50dd3c0c00a94a7de134/raw/scheduleAPI.json";

    try {
        const response = await fetch(API_URL, { cache: 'no-cache' });
        if (!response.ok) throw new Error("Lỗi Server");

        const data = await response.json();
        window.scheduleData = data;
        localStorage.setItem("user_schedule", JSON.stringify(data));
    } catch (error) {
        console.warn("Lỗi fetch API, dùng cache/offline:", error);
        const cached = localStorage.getItem("user_schedule");
        if (cached) window.scheduleData = JSON.parse(cached);
    } finally {
        // Bắt buộc bắn event này khi tải xong
        window.dispatchEvent(new Event('scheduleDataReady'));
    }
}

// Gọi fetch
fetchScheduleFromOnline();