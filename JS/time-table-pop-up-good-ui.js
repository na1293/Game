document.addEventListener("DOMContentLoaded", () => {
    const triggerBtns = document.querySelectorAll("a[href='#time-table'], #time-table a");
    const popupOverlay = document.getElementById("pop-up-animation-full-screen");
    popupOverlay.style.display = "none";
    
    const closeBtn = document.getElementById("closePopupBtn");

    // Tu tao khung chon mua cho ca chieu neu chua co (khong co emoji)
    const popupContent = document.querySelector(".popup-content, .popup-card") || popupOverlay;

    if (popupContent && !document.getElementById("season-select-container")) {
        let headerBar = popupContent.querySelector(".popup-header-bar");

        if (headerBar) {
            const seasonDiv = document.createElement("div");
            seasonDiv.id = "season-select-container";
            seasonDiv.className = "season-wrapper";
            seasonDiv.innerHTML = `
                <label for="season-select-type">Ca Chieu:</label>
                <select id="season-select-type" class="season-dropdown">
                    <option value="winter">Mua Dong (13:00)</option>
                    <option value="summer">Mua He (13:10)</option>
                </select>
            `;
            headerBar.appendChild(seasonDiv);
        }
    }

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

    function buildScheduleHTML(rawText, sessionType = 'morning') {
        if (!rawText) return `<div class="off-day-text">Trong lich</div>`;

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

        const subjects = rawText
            .split(",")
            .map(item => item.trim())
            .filter(item => item !== "");

        const rowsHTML = subjects
            .map((subject, index) => `
                <div class="period-row" onclick="checkPeriodStatus(${index + 1}, '${subject}', '${sessionType}')">
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

        morningBoxes.forEach(box => box.classList.remove("is-off-day"));
        afternoonBoxes.forEach(box => box.classList.remove("is-off-day"));

        if (typeof dayData === "string" && dayData.includes("||")) {
            const parts = dayData.split("||");
            const morningText = parts[0].trim() || "Trong lich sang";
            const afternoonText = parts[1].trim() || "Trong lich chieu";

            const morningRendered = buildScheduleHTML(morningText, 'morning');
            const afternoonRendered = buildScheduleHTML(afternoonText, 'afternoon');

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
            let defaultText = "Chua co du lieu lich hoc";

            if (typeof dayData === "string" && dayData.trim() !== "") {
                defaultText = dayData.trim();
            } else if (typeof dayData === "object" && dayData !== null) {
                defaultText = dayData.morning || dayData.afternoon || "Chua co du lieu lich hoc";
            }

            const rendered = buildScheduleHTML(defaultText, 'morning');

            morningBoxes.forEach(box => {
                const title = box.querySelector(".session-title");
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