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
// window.scheduleData = window.scheduleData || {
//   "0": "Nghỉ ngơi, thư giãn hoặc làm bài tập.",
//   "1": "Toán, Toán, Anh, KTPL, Chào cờ",
//   "2": "Quốc Phòng, Địa, Địa, Sử, HĐTN",
//   "3": "Tin, Sử, Sử, Toán, KTPL",
//   "4": "Toán, Lý, Tin, Văn, Văn",
//   "5": "Lý, Văn, Anh, Anh, Sinh Hoạt",
//   "6": "Sáng: Thể chất; Chiều: Chuyên đề Văn, GDDP"
// }

import { GIST_API_URL } from './API_call/api_call.js'; // Khai báo file

// 1. KHỞI TẠO TỪ LOCALSTORAGE TRƯỚC (Tránh chớp giao diện lỗi)
const savedSchedule = localStorage.getItem("user_schedule");

window.scheduleData = savedSchedule ? JSON.parse(savedSchedule) : {
  "0": "Lỗi, hãy kết nối mạng để tải thời khóa biểu lần đầu",
  "1": "Lỗi, hãy kết nối mạng để tải thời khóa biểu lần đầu",
  "2": "Lỗi, hãy kết nối mạng để tải thời khóa biểu lần đầu",
  "3": "Lỗi, hãy kết nối mạng để tải thời khóa biểu lần đầu",
  "4": "Lỗi, hãy kết nối mạng để tải thời khóa biểu lần đầu",
  "5": "Lỗi, hãy kết nối mạng để tải thời khóa biểu lần đầu",
  "6": "Lỗi, hãy kết nối mạng để tải thời khóa biểu lần đầu"
};

// Bắn event ngay nếu đã có sẵn dữ liệu cũ trong LocalStorage để UI dựng liền không phải chờ Fetch
if (savedSchedule) {
  window.dispatchEvent(new Event('scheduleDataReady'));
}

// 2. GỌI API ĐỂ CẬP NHẬT DỮ LIỆU MỚI NHẤT
async function fetchScheduleFromOnline() {
    const API_URL = `${GIST_API_URL}?t=${Date.now()}`; // URL API lấy dữ liệu JSON

    try {
        // cache: 'no-cache' ép trình duyệt phải hỏi Server xem có file mới không
        const response = await fetch(API_URL, { cache: 'no-cache' });
        if (!response.ok) throw new Error("Lỗi Server");

        const data = await response.json();
        
        // Cập nhật bộ nhớ tạm & LocalStorage
        window.scheduleData = data;
        localStorage.setItem("user_schedule", JSON.stringify(data));

        // Bắn event báo UI cập nhật bản mới nhất
        window.dispatchEvent(new Event('scheduleDataReady'));
        
    } catch (error) {
        console.warn("Không thể lấy dữ liệu mới từ Server, dùng bản cache LocalStorage hiện tại:", error);
        // Nếu lỗi thì giữ nguyên window.scheduleData đã load từ LocalStorage ở trên
    }
}

// Chạy fetch ngầm
fetchScheduleFromOnline();