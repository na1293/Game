const day_select = document.getElementById("day-select");
const schedule_title = document.getElementById("schedule_title");

function updateDetailSchedule() {
    if (!day_select || !schedule_title) return;

    const selectedDay = day_select.value;
    const schedule_date = window.scheduleData[selectedDay];
    
    if (schedule_date) {
        schedule_title.innerHTML = `<strong>${schedule_date}</strong>`;
    } else {
        schedule_title.innerHTML = "<strong>Chưa có dữ liệu lịch học</strong>";
    }
}

function initDetailSchedule() {
    if (day_select) {
        // Tự động set Dropdown về ngày hôm nay
        const today = new Date().getDay();
        day_select.value = today.toString();
    }
    updateDetailSchedule();
}

// 1. Khởi tạo ngay khi giao diện ready
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initDetailSchedule);
} else {
    initDetailSchedule();
}

// 2. Lắng nghe sự kiện thay đổi select box
if (day_select) {
    day_select.addEventListener("change", updateDetailSchedule);
}

// 3. Lắng nghe khi Server tải xong -> Tự động Render lại dữ liệu mới từ Server
window.addEventListener('scheduleDataReady', updateDetailSchedule);