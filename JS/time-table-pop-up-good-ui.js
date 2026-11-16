/* 
==== Overview ====
Tối ưu UI dạng danh sách từng Tiết (vuốt dọc), fix nhảy +1 ngày và quản lý Bật/Tắt Pop-up
- Không có "||": Hiện 1 khối mặc định (ẩn Ca Chiều, giữ nguyên Ca Sáng làm khối chính)
- Có "||": Chia thành 2 khối Sáng (trước "||") và Chiều (sau "||")
- Tự động tách dấu "," thành các hàng Tiết 1, Tiết 2, Tiết 3...
*/

document.addEventListener("DOMContentLoaded", () => {
    const triggerBtns = document.querySelectorAll("a[href='#time-table'], #time-table a");
    const popupOverlay = document.getElementById("pop-up-animation-full-screen");
    const closeBtn = document.getElementById("closePopupBtn");

    triggerBtns.forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            updateSchedule(getCurrentSelectedDay());
            if (popupOverlay) {
                popupOverlay.style.display = "flex";
            }
        });
    });

    const prevBtn = document.getElementById("prev-day-btn");
    const nextBtn = document.getElementById("next-day-btn");

    // Hàm biến chuỗi "Toán, Lý, Hóa" thành HTML từng hàng Tiết 1, Tiết 2...
    function buildScheduleHTML(rawText) {
        if (!rawText) return `<div class="off-day-text">Trống lịch 🎉</div>`;

        // Nhận diện câu thông báo ngày nghỉ để không bị tách nhầm dấu phẩy trong câu văn
        const lowerText = rawText.toLowerCase();
        const isOffMessage =
            lowerText.includes("không có lịch") ||
            lowerText.includes("nghỉ ngơi") ||
            lowerText.includes("chưa có dữ liệu") ||
            lowerText.includes("trống lịch");

        if (isOffMessage) {
            return {
                isOff: true,
                html: `<div class="off-day-text">${rawText}</div>`
            };
        }

        // Tách chuỗi theo dấu phẩy và loại bỏ khoảng trắng thừa
        const subjects = rawText
            .split(",")
            .map(item => item.trim())
            .filter(item => item !== "");

        const rowsHTML = subjects
            .map((subject, index) => `
                <div class="period-row">
                    <span class="period-badge">Tiết ${index + 1}</span>
                    <span class="subject-name">${subject}</span>
                </div>
            `)
            .join("");

        return {
            isOff: false,
            html: rowsHTML
        };
    }

    function updateSchedule(dayValue) {
        const targetDay = dayValue.toString();

        const daySelects = document.querySelectorAll(".day-select");
        daySelects.forEach(select => {
            select.value = targetDay;
        });

        const scheduleData = window.scheduleData || {};
        const dayData = scheduleData[targetDay];

        const morningBoxes = document.querySelectorAll(".morning-box");
        const afternoonBoxes = document.querySelectorAll(".afternoon-box");
        const morningElements = document.querySelectorAll(".schedule-morning-display");
        const afternoonElements = document.querySelectorAll(".schedule-afternoon-display");

        // Reset trạng thái ngày nghỉ trước khi render
        morningBoxes.forEach(box => box.classList.remove("is-off-day"));
        afternoonBoxes.forEach(box => box.classList.remove("is-off-day"));

        if (typeof dayData === "string" && dayData.includes("||")) {
            // === TRƯỜNG HỢP 1: CÓ "||" -> CHIA 2 KHỐI SÁNG VÀ CHIỀU ===
            const parts = dayData.split("||");
            const morningText = parts[0].trim() || "Trống lịch sáng 🎉";
            const afternoonText = parts[1].trim() || "Trống lịch chiều 🏖️";

            const morningRendered = buildScheduleHTML(morningText);
            const afternoonRendered = buildScheduleHTML(afternoonText);

            morningBoxes.forEach(box => {
                const title = box.querySelector(".session-title");
                if (title) title.style.display = "inline-block";
                if (morningRendered.isOff) box.classList.add("is-off-day");
            });

            afternoonBoxes.forEach(box => {
                box.style.display = "flex";
                if (afternoonRendered.isOff) box.classList.add("is-off-day");
            });

            morningElements.forEach(el => {
                el.innerHTML = morningRendered.html;
            });
            afternoonElements.forEach(el => {
                el.innerHTML = afternoonRendered.html;
            });

        } else {
            // === TRƯỜNG HỢP 2: KHÔNG CÓ "||" -> HIỂN THỊ 1 KHỐI ===
            let defaultText = "Chưa có dữ liệu lịch học";

            if (typeof dayData === "string" && dayData.trim() !== "") {
                defaultText = dayData.trim();
            } else if (typeof dayData === "object" && dayData !== null) {
                defaultText = dayData.morning || dayData.afternoon || "Chưa có dữ liệu lịch học";
            }

            const rendered = buildScheduleHTML(defaultText);

            morningBoxes.forEach(box => {
                const title = box.querySelector(".session-title");
                // Nếu là ngày nghỉ thì ẩn chữ "Sáng", còn ngày đi học 1 ca vẫn hiện "Sáng" cho rõ
                if (title) {
                    title.style.display = rendered.isOff ? "none" : "inline-block";
                }
                if (rendered.isOff) box.classList.add("is-off-day");
            });

            afternoonBoxes.forEach(box => {
                box.style.display = "none";
            });

            morningElements.forEach(el => {
                el.innerHTML = rendered.html;
            });
        }
    }

    function getCurrentSelectedDay() {
        const refSelect = document.querySelector(".day-select");
        if (refSelect && refSelect.value !== "") {
            return parseInt(refSelect.value, 10);
        }
        return new Date().getDay();
    }

    if (closeBtn && popupOverlay) {
        const closePopup = () => {
            popupOverlay.style.display = "none";
        };
        closeBtn.onclick = closePopup;
        popupOverlay.onclick = (e) => {
            if (e.target === popupOverlay) closePopup();
        };
    }

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

    document.addEventListener("change", (e) => {
        if (e.target && e.target.classList.contains("day-select")) {
            updateSchedule(e.target.value);
        }
    });

    window.addEventListener('scheduleDataReady', () => {
        updateSchedule(getCurrentSelectedDay());
    });

    updateSchedule(new Date().getDay());
});