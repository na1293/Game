(function() {
    const STORAGE_KEY = 'scheduleData_v1';
    
    const daySelect = document.getElementById('day-select');
    const displayArea = document.getElementById('user-upload-json-time-table');
    const uploadInput = document.getElementById('schedule-upload');
    const exportBtn = document.getElementById('export-btn-time-table');
    const clearBtn = document.getElementById('clear-btn-time-table');

    if (!daySelect || !displayArea) return;

    // === Note: Khởi tạo là Object {} thay vì Array [] === //
    let currentScheduleData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};

    function saveData() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentScheduleData));
    }

    // === HÀM HIỂN THỊ DỮ LIỆU (Đã loại bỏ .filter() gây lỗi) === //
    function renderSchedule() {
        // Đồng bộ dữ liệu mới nhất từ biến toàn cục scheduleData nếu có
        if (typeof scheduleData !== 'undefined' && Object.keys(scheduleData).length > 0) {
            currentScheduleData = scheduleData;
        }

        const day = daySelect.value;
        const selectedOption = daySelect.options[daySelect.selectedIndex];
        const dayName = selectedOption ? selectedOption.text : "Thứ " + day;

        // === Note: Lấy nội dung trực tiếp từ Key của Object === //
        const subjectText = currentScheduleData[day];

        if (!subjectText) {
            displayArea.innerHTML = `<span class="no-data" style="color: #a4b0be;">${dayName}: Chưa có dữ liệu.</span>`;
            return;
        }

        displayArea.innerHTML = `<b>${dayName}:</b> ${subjectText}`;
        displayArea.style.color = '#2f3542';
    }

    // === XỬ LÝ UPLOAD FILE JSON === //
    function handleFileUpload(file) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                // === Note: Kiểm tra dữ liệu upload phải là Object === //
                if (typeof data !== 'object' || Array.isArray(data)) {
                    throw new Error("File JSON phải có cấu trúc Object { \"0\": \"...\", \"1\": \"...\" }");
                }

                currentScheduleData = data;
                scheduleData = data; // Cập nhật luôn biến global
                saveData(); 
                renderSchedule(); 
                alert("Đã tải lên và ghi đè thành công!");
            } catch (err) {
                alert("Lỗi khi đọc file: " + err.message);
            }
        };
        reader.readAsText(file);
        if (uploadInput) uploadInput.value = '';
    }

    if (uploadInput) uploadInput.addEventListener('change', (e) => handleFileUpload(e.target.files[0]));
    daySelect.addEventListener('change', renderSchedule);

    // Xử lý Export & Clear
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            if (Object.keys(currentScheduleData).length === 0) return alert("Chưa có dữ liệu để xuất.");
            const blob = new Blob([JSON.stringify(currentScheduleData, null, 2)], { type: "application/json" });
            const url = URL.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = "thoi-khoa-bieu.json";
            a.click();
            URL.revokeObjectURL(url);
        });
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            if (confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch học?")) {
                currentScheduleData = {};
                scheduleData = {};
                localStorage.removeItem(STORAGE_KEY);
                renderSchedule();
            }
        });
    }

    // Lắng nghe khi API tải xong thì render
    window.addEventListener('scheduleDataReady', renderSchedule);
})();