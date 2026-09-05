function updateDetailSchedule(selectedDay) {
    const titleElements = document.querySelectorAll(".schedule-title-display");
    const daySelects = document.querySelectorAll(".day-select");

    // 1. Đồng bộ giá trị của tất cả các dropdown .day-select
    daySelects.forEach(select => {
        if (select.value !== selectedDay) {
            select.value = selectedDay;
        }
    });

    // 2. Lấy dữ liệu theo ngày
    const schedule_date = window.scheduleData ? window.scheduleData[selectedDay] : null;
    const contentHtml = schedule_date 
        ? `<strong>${schedule_date}</strong>` 
        : "<strong>Chưa có dữ liệu lịch học</strong>";

    // 3. Cập nhật tiêu đề ở tất cả các vị trí
    titleElements.forEach(el => {
        el.innerHTML = contentHtml;
    });
}

function initDetailSchedule() {
    const today = new Date().getDay().toString();
    
    // Gán sự kiện change cho tất cả dropdown .day-select trên trang
    const daySelects = document.querySelectorAll(".day-select");
    daySelects.forEach(select => {
        select.addEventListener("change", (e) => {
            updateDetailSchedule(e.target.value);
        });
    });

    // Set dữ liệu ban đầu cho ngày hôm nay
    updateDetailSchedule(today);
}

// Khởi tạo app
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initDetailSchedule);
} else {
    initDetailSchedule();
}

// Lắng nghe khi Server / File JSON tải xong
window.addEventListener('scheduleDataReady', () => {
    const firstSelect = document.querySelector(".day-select");
    const currentDay = firstSelect ? firstSelect.value : new Date().getDay().toString();
    updateDetailSchedule(currentDay);
});