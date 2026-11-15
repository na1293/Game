/* 
==== Overview ====
Tối ưu UI, fix nhảy +1 ngày và quản lý Bật/Tắt Pop-up theo thẻ <a> id="time-table"
- Không có "||": Hiện 1 khối mặc định (ẩn Ca Chiều, giữ nguyên Ca Sáng làm khối chính)
- Có "||": Chia thành 2 khối Sáng (trước "||") và Chiều (sau "||")
*/

document.addEventListener("DOMContentLoaded", () => {
    // 1. Element Pop-up & Nút kích hoạt
    const triggerBtns = document.querySelectorAll("a[href='#time-table'], #time-table a");
    const popupOverlay = document.getElementById("pop-up-animation-full-screen");
    const closeBtn = document.getElementById("closePopupBtn");
    const timeTableContainer = document.getElementById("time-table");

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
        const dayData = scheduleData[targetDay];

        const morningBoxes = document.querySelectorAll(".morning-box");
        const afternoonBoxes = document.querySelectorAll(".afternoon-box");
        const morningElements = document.querySelectorAll(".schedule-morning-display");
        const afternoonElements = document.querySelectorAll(".schedule-afternoon-display");

        // Kiểm tra xem dữ liệu có chứa dấu phân cách "||" không
        if (typeof dayData === "string" && dayData.includes("||")) {
            // === TRƯỜNG HỢP 1: CÓ "||" -> CHIA 2 KHỐI SÁNG VÀ CHIỀU ===
            const parts = dayData.split("||");
            const morningText = parts[0].trim() || "Trống lịch sáng 🎉";
            const afternoonText = parts[1].trim() || "Trống lịch chiều 🏖️";

            // Hiện cả 2 khối Sáng & Chiều, khôi phục tiêu đề Ca Sáng
            morningBoxes.forEach(box => {
                const title = box.querySelector(".session-title");
                if (title) title.style.display = "block";
            });
            afternoonBoxes.forEach(box => {
                box.style.display = "block";
            });

            // Đổ dữ liệu Sáng & Chiều
            morningElements.forEach(el => {
                el.innerHTML = `<strong>${morningText}</strong>`;
            });
            afternoonElements.forEach(el => {
                el.innerHTML = `<strong>${afternoonText}</strong>`;
            });

        } else {
            // === TRƯỜNG HỢP 2: KHÔNG CÓ "||" -> HIỂN THỊ 1 CHUỖI MẶC ĐỊNH ===
            let defaultText = "Chưa có dữ liệu lịch học";

            if (typeof dayData === "string" && dayData.trim() !== "") {
                defaultText = dayData.trim();
            } else if (typeof dayData === "object" && dayData !== null) {
                defaultText = dayData.morning || dayData.afternoon || "Chưa có dữ liệu lịch học";
            }

            // Ẩn khối Ca Chiều và ẩn nhãn "🌅 Ca Sáng" để khối đầu tiên thành 1 khung mặc định
            morningBoxes.forEach(box => {
                const title = box.querySelector(".session-title");
                if (title) title.style.display = "none";
            });
            afternoonBoxes.forEach(box => {
                box.style.display = "none";
            });

            // Đổ dữ liệu chuỗi mặc định vào khung chính
            morningElements.forEach(el => {
                el.innerHTML = `<strong>${defaultText}</strong>`;
            });
        }
    }

    // Lấy value ngày đang chọn hiện tại (0 -> 6)
    function getCurrentSelectedDay() {
        const refSelect = document.querySelector(".day-select");
        if (refSelect && refSelect.value !== "") {
            return parseInt(refSelect.value, 10);
        }
        return new Date().getDay();
    }

    // 4. Xử lý ĐÓNG POP-UP
    if (closeBtn && popupOverlay) {
        const closePopup = () => {
            if (popupOverlay) popupOverlay.style.display = "none";
        };

        closeBtn.onclick = closePopup;

        popupOverlay.onclick = (e) => {
            if (e.target === popupOverlay) {
                closePopup();
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
