/* 
==== Overview ====
Tối ưu UI, fix nhảy +1 ngày và quản lý Bật/Tắt Pop-up theo thẻ <a> id="time-table"
*/

document.addEventListener("DOMContentLoaded", () => {
    // 1. Element Pop-up & Nút kích hoạt
   const triggerBtns = document.querySelectorAll("a#time-table, #time-table a, a[href='#time-table']");
    const popupOverlay = document.getElementById("pop-up-animation-full-screen");
    const closeBtn = document.getElementById("closePopupBtn");

    // Lắng nghe click cho tất cả các thẻ <a> khớp điều kiện trên
    triggerBtns.forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault(); // Chống nhảy trang
            
            // Cập nhật ngày hiện tại trước khi mở
            updateSchedule(getCurrentSelectedDay());
            
            // Hiện Pop-up
            if (popupOverlay) {
                popupOverlay.style.display = "flex"; 
            }
        });
    });

    // Element điều hướng ngày
    const prevBtn = document.getElementById("prev-day-btn");
    const nextBtn = document.getElementById("next-day-btn");

    // 2. Hàm cập nhật dữ liệu lịch học & đồng bộ UI
    function updateSchedule(dayValue) {
        const targetDay = dayValue.toString();

        // Đồng bộ tất cả dropdown .day-select
        const daySelects = document.querySelectorAll(".day-select");
        daySelects.forEach(select => {
            select.value = targetDay;
        });

        // Lấy dữ liệu từ window.scheduleData
        const scheduleData = window.scheduleData || {};
        const scheduleText = scheduleData[targetDay];
        const contentHtml = scheduleText 
            ? `<strong>${scheduleText}</strong>` 
            : "<strong>Chưa có dữ liệu lịch học</strong>";

        // Cập nhật tiêu đề hiển thị
        const titleElements = document.querySelectorAll(".schedule-title-display");
        titleElements.forEach(el => {
            el.innerHTML = contentHtml;
        });
    }

    // Lấy value ngày đang chọn hiện tại (0 -> 6)
    function getCurrentSelectedDay() {
        const refSelect = document.querySelector(".day-select");
        if (refSelect && refSelect.value !== "") {
            return parseInt(refSelect.value, 10);
        }
        return new Date().getDay();
    }

    // 3. Xử lý MỞ POP-UP khi click vào thẻ <a id="time-table">
    triggerBtns.forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault(); // Chống nhảy trang nếu thẻ <a> có href="#"
            
            // Cập nhật lại ngày hiện tại/đang chọn trước khi mở
            updateSchedule(getCurrentSelectedDay());
            
            // Hiện Pop-up
            if (popupOverlay) {
                popupOverlay.style.display = "flex"; 
            }
        });
    });

    // 4. Xử lý ĐÓNG POP-UP
    if (closeBtn && popupOverlay) {
        // Nút X
        closeBtn.onclick = () => {
            popupOverlay.style.display = "none";
        };

        // Click ra ngoài vùng card (bấm vào nền đen mờ) cũng tự đóng
        popupOverlay.onclick = (e) => {
            if (e.target === popupOverlay) {
                popupOverlay.style.display = "none";
            }
        };
    }

    // 5. Điều hướng ngày (Khóa chuẩn +1 / -1)
    if (prevBtn) {
        prevBtn.onclick = (e) => {
            e.preventDefault();
            let currentDay = getCurrentSelectedDay();
            let prevDay = (currentDay - 1 + 7) % 7;
            updateSchedule(prevDay);
        };
    }

    if (nextBtn) {
        nextBtn.onclick = (e) => {
            e.preventDefault();
            let currentDay = getCurrentSelectedDay();
            let nextDay = (currentDay + 1) % 7;
            updateSchedule(nextDay);
        };
    }

    // 6. Lắng nghe thay đổi trên tất cả các Dropdown (.day-select)
    document.addEventListener("change", (e) => {
        if (e.target && e.target.classList.contains("day-select")) {
            updateSchedule(e.target.value);
        }
    });

    // 7. Lắng nghe khi Server / File JSON nạp xong dữ liệu mới
    window.addEventListener('scheduleDataReady', () => {
        updateSchedule(getCurrentSelectedDay());
    });

    // Set dữ liệu ban đầu
    updateSchedule(new Date().getDay());
});

