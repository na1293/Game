// === CẤU HÌNH VÀ KHỞI TẠO === //
(function() {
    const STORAGE_KEY = 'myCustomTimetable_v1';
    
    // Lấy các phần tử cần thiết từ DOM
    const daySelect = document.getElementById('day-select');
    const displayArea = document.getElementById('user-upload-json-time-table'); // ID theo yêu cầu của bạn
    const uploadInput = document.getElementById('schedule-upload');
    const exportBtn = document.getElementById('export-btn-time-table');
    const clearBtn = document.getElementById('clear-btn-time-table');

    // Kiểm tra xem các phần tử có tồn tại không (để tránh lỗi nếu file JS chạy trước khi HTML load)
    if (!daySelect || !displayArea) {
        console.error('Không tìm thấy các phần tử ID cần thiết (day-select hoặc user-upload-json-time-table).');
        return;
    }

    // Khởi tạo dữ liệu từ LocalStorage
    let currentScheduleData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

    // === HÀM LƯU DỮ LIỆU (PERSISTENT) === //
    function saveData() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentScheduleData));
    }

    // === HÀM HIỂN THỊ DỮ LIỆU === //
    function renderSchedule() {
        const day = daySelect.value;
        const selectedOption = daySelect.options[daySelect.selectedIndex];
        const dayName = selectedOption ? selectedOption.text : "Thứ " + day;

        // Lọc và gom nhóm các môn học theo ngày
        // Giả sử dữ liệu JSON có cấu trúc: [{ day: "2", subject: "Toán" }, { day: "2", subject: "Lý" }]
        const subjects = currentScheduleData
            .filter(item => item.day === day)
            .map(item => item.subject);

        if (subjects.length === 0) {
            displayArea.innerHTML = `<span class="no-data" style="color: #a4b0be;">${dayName}: Chưa có dữ liệu.</span>`;
            return;
        }

        // Tạo chuỗi hiển thị: "Thứ 3: Toán, Lý, Hóa"
        const subjectText = subjects.join(', ');
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
                
                // Validate dữ liệu
                if (!Array.isArray(data)) throw new Error("File JSON phải là một mảng.");
                const isValid = data.every(item => item.day && item.subject);
                if (!isValid) throw new Error("Dữ liệu thiếu trường 'day' hoặc 'subject'.");

                currentScheduleData = data;
                saveData(); // Lưu vào bộ nhớ
                renderSchedule(); // Cập nhật giao diện
                alert("Đã tải lên và lưu thành công!");
            } catch (err) {
                alert("Lỗi khi đọc file: " + err.message);
            }
        };
        reader.readAsText(file);
        if (uploadInput) uploadInput.value = ''; // Reset input
    }

    // Sự kiện khi chọn file
    if (uploadInput) {
        uploadInput.addEventListener('change', (e) => handleFileUpload(e.target.files[0]));
    }

    // Sự kiện khi thay đổi ngày
    daySelect.addEventListener('change', renderSchedule);

    // === XỬ LÝ XUẤT FILE (EXPORT) === //
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            if (currentScheduleData.length === 0) {
                alert("Chưa có dữ liệu để xuất.");
                return;
            }
            const dataStr = JSON.stringify(currentScheduleData, null, 2);
            const blob = new Blob([dataStr], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = "thoi-khoa-bieu.json";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    }

    // === XỬ LÝ XÓA DỮ LIỆU (CLEAR) === //
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            if (currentScheduleData.length === 0) return;
            if (confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch học đã lưu? Dữ liệu sẽ mất vĩnh viễn.")) {
                currentScheduleData = [];
                localStorage.removeItem(STORAGE_KEY);
                renderSchedule();
            }
        });
    }

    // Tự động chọn ngày hôm nay khi load trang
    const today = new Date().getDay();
    const dayValue = today === 0 ? '1' : today.toString(); // 0 = CN -> 1, 1 = T2 -> 2...
    if (daySelect.options[daySelect.selectedIndex].value !== dayValue) {
        daySelect.value = dayValue;
    }

    // Khởi chạy lần đầu
    renderSchedule();
})();