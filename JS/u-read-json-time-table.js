(function() {
    const STORAGE_KEY = 'scheduleData_v1';
    
    const daySelect = document.getElementById('day-select');
    const displayArea = document.getElementById('user-upload-json-time-table');
    const uploadInput = document.getElementById('schedule-upload');
    const exportBtn = document.getElementById('export-btn-time-table');
    const clearBtn = document.getElementById('clear-btn-time-table');

    if (!daySelect || !displayArea) return;

    let currentScheduleData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || null;

    function saveData() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentScheduleData));
    }

    // === HÀM BÓC TÁCH DỮ LIỆU THÔNG MINH (CÂN CẢ ARRAY LẪN OBJECT) === //
    function getSubjectByDay(data, targetDay) {
        if (!data) return null;

        // Trường hợp 1: Dạng Mảng như của bạn [{"day":"2","subject":"Đu idol"}, ...]
        if (Array.isArray(data)) {
            const found = data.find(item => String(item.day) === String(targetDay));
            if (!found) return null;
            
            // Lấy môn học hoặc gom tất cả thông tin lại
            if (found.subject) return found.subject;
            const { day, ...rest } = found; 
            return Object.values(rest).join(' - ');
        }

        // Trường hợp 2: Dạng Object chuẩn {"2": "Đu idol", "3": "Múa"}
        if (typeof data === 'object') {
            const val = data[targetDay];
            if (!val) return null;
            if (typeof val === 'string') return val;
            if (typeof val === 'object') return Object.values(val).join(' - ');
        }

        return null;
    }

    // === HÀM HIỂN THỊ DỮ LIỆU === //
    function renderSchedule() {
        let activeData = currentScheduleData;
        if (!activeData && typeof scheduleData !== 'undefined' && Object.keys(scheduleData).length > 0) {
            activeData = scheduleData;
        }

        if (!activeData) {
            displayArea.innerHTML = `<span class="no-data" style="color: #a4b0be;">Đang tải dữ liệu...</span>`;
            return;
        }

        const day = daySelect.value;
        const selectedOption = daySelect.options[daySelect.selectedIndex];
        const dayName = selectedOption ? selectedOption.text : "Thứ " + day;

        // Tìm môn học tương ứng với thứ đang chọn
        const subjectText = getSubjectByDay(activeData, day);

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
                
                // Chấp nhận cả Object lẫn Array
                if (typeof data !== 'object') {
                    throw new Error("File JSON không hợp lệ!");
                }

                currentScheduleData = data;
                saveData(); 
                renderSchedule(); 
                alert("Đã tải lên và ghi đè thành công! ✨");
            } catch (err) {
                alert("Lỗi khi đọc file: " + err.message);
            }
        };
        reader.readAsText(file);
        if (uploadInput) uploadInput.value = '';
    }

    if (uploadInput) uploadInput.addEventListener('change', (e) => handleFileUpload(e.target.files[0]));
    daySelect.addEventListener('change', renderSchedule);

    // === XỬ LÝ EXPORT & CLEAR === //
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            const dataToExport = currentScheduleData || (typeof scheduleData !== 'undefined' ? scheduleData : {});
            
            if (Object.keys(dataToExport).length === 0) return alert("Chưa có dữ liệu để xuất.");
            
            const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob); 
            const a = document.createElement('a');
            a.href = url;
            a.download = "thoi-khoa-bieu.json";
            a.click();
            URL.revokeObjectURL(url);
        });
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            if (confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch học đã lưu?")) {
                currentScheduleData = null;
                localStorage.removeItem(STORAGE_KEY);
                renderSchedule();
            }
        });
    }

    // Auto set ngày hiện tại cho dropdown select
    const today = new Date().getDay(); 
    daySelect.value = today.toString();

    // Lắng nghe khi API online tải xong
    window.addEventListener('scheduleDataReady', renderSchedule);
    
    // Chạy render lần đầu
    renderSchedule();
})();