// 1. Khai báo lấy element
const day_select = document.getElementById("day-select");
const schedule_title = document.getElementById("schedule_title");

// Hàm cập nhật lịch
function updateSchedule() {
    if (!day_select || !schedule_title) return;

    // === Note: Đọc theo Key chuỗi/số trực tiếp từ Object scheduleData, không trừ 1 === //
    const selectedDay = day_select.value;
    const schedule_date = scheduleData[selectedDay];
    
    if (schedule_date) {
        schedule_title.innerHTML = `<strong>${schedule_date}</strong>`;
    } else {
        schedule_title.innerHTML = "<strong>Chưa có dữ liệu</strong>";
    }
}

// === Note: Chờ Custom Event từ Server tải xong mới chạy lần đầu === //
window.addEventListener('scheduleDataReady', updateSchedule);

// Lắng nghe sự kiện thay đổi select box
if (day_select) {
    day_select.addEventListener("change", updateSchedule);
}