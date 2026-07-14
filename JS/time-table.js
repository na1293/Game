// 1. Khai báo lấy element trước (Chỉ chạy 1 lần khi load trang)
const day_select = document.getElementById("day-select");
const schedule_title = document.getElementById("schedule_title");

// Hàm cập nhật lịch (Tách ra để tái sử dụng)
function updateSchedule() {
    const schedule_date = schedule[Number(day_select.value - 1)];
    
    if (schedule_date) {
        schedule_title.innerHTML = `<strong>${schedule_date}</strong>`;
    } else {
        schedule_title.innerHTML = "<strong>Chưa có dữ liệu</strong>";
    }
}

// 2. Chạy lần đầu tiên khi vừa load trang để hiển thị luôn lịch của option đang chọn mặc định
updateSchedule();

// 3. Lắng nghe sự kiện thay đổi: Cứ mỗi khi đổi ngày là tự động cập nhật, siêu nhẹ!
day_select.addEventListener("change", updateSchedule);