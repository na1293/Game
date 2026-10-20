document.addEventListener("DOMContentLoaded", () => {
    const STORAGE_KEY = 'scheduleData_v1';
    
    const scheduleInput = document.getElementById('schedule-title');
    const daySelect = document.getElementById('day-select');
    const addBtn = document.getElementById('add');
    const clearBtn = document.getElementById('clear');
    const exportBtn = document.getElementById('export');
    const importBtn = document.getElementById('input');
    const inputFile = document.getElementById('input-file');
    const todoList = document.getElementById('todo-list');

    // === VÁ 1: GIỚI HẠN UI MAXLENGTH NGAY TRÊN Ô INPUT ===
    if (scheduleInput) {
        scheduleInput.maxLength = 30; // Khóa cứng tối đa 30 ký tự ngay trên giao diện
    }

    // Tải và validate dữ liệu từ LocalStorage
    let scheduleArray = [];
    try {
        const rawData = localStorage.getItem(STORAGE_KEY);
        if (rawData && rawData.trim() !== "") {
            const parsed = JSON.parse(rawData);
            if (Array.isArray(parsed)) {
                // Kiểm tra cấu trúc và giới hạn khi load từ bộ nhớ lên
                for (let item of parsed) {
                    if (!item || typeof item !== "object" || typeof item.subject !== "string" || item.subject.length > 30) {
                        throw new Error("Dữ liệu trong bộ nhớ không hợp lệ hoặc vượt quá 30 ký tự!");
                    }
                }
                scheduleArray = parsed.slice(0, 20); // Giới hạn cứng tối đa 20 task
            }
        }
    } catch (e) {
        console.warn("Dữ liệu bị lỗi hoặc vượt giới hạn, reset mảng mới:", e);
        scheduleArray = [];
        localStorage.removeItem(STORAGE_KEY);
    }

    const dayMap = {
        "1": "Thứ 2",
        "2": "Thứ 3",
        "3": "Thứ 4",
        "4": "Thứ 5",
        "5": "Thứ 6",
        "6": "Thứ 7",
        "0": "Chủ nhật"
    };

    function saveData() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(scheduleArray));
        renderList();
    }

    // === RENDER AN TOÀN TUYỆT ĐỐI CHỐNG XSS (Dùng textContent) ===
    function renderList() {
        if (!todoList) return;
        todoList.innerHTML = '';

        if (scheduleArray.length === 0) {
            const emptyLi = document.createElement('li');
            emptyLi.style.cssText = "color: #888; text-align: center; margin-top: 10px;";
            emptyLi.textContent = "Chưa có dữ liệu thời khóa biểu. Hãy thêm mới nhé! ✨";
            todoList.appendChild(emptyLi);
            return;
        }

        // Sắp xếp Thứ 2 -> Chủ nhật
        scheduleArray.sort((a, b) => {
            const orderA = a.day === "0" ? 7 : parseInt(a.day);
            const orderB = b.day === "0" ? 7 : parseInt(b.day);
            return orderA - orderB;
        });

        scheduleArray.forEach((item, index) => {
            const li = document.createElement('li');
            li.style.cssText = "margin: 8px 0; padding: 10px; background: #f1f2f6; border-radius: 6px; display: flex; justify-content: space-between; align-items: center;";
            
            const span = document.createElement('span');
            const boldDay = document.createElement('b');
            boldDay.textContent = (dayMap[item.day] || 'Thứ ' + item.day) + ": ";
            
            const subjectText = document.createTextNode(item.subject); // Chống XSS chuẩn bài

            span.appendChild(boldDay);
            span.appendChild(subjectText);

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = "Xóa";
            deleteBtn.style.cssText = "background: #ff4757; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer;";
            deleteBtn.onclick = () => deleteItem(index);

            li.appendChild(span);
            li.appendChild(deleteBtn);
            todoList.appendChild(li);
        });
    }

    // === VÁ 2: KIỂM TRA ĐIỀU KIỆN KHI BẤM THÊM ===
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            const subject = scheduleInput.value.trim();
            const day = daySelect.value;

            if (!subject) {
                if (typeof showPopup === 'function') showPopup("Lỗi", "Nhập nội dung môn học đã nha!");
                else alert("Nhập nội dung môn học đã nha!");
                return;
            }

            // Chặn ký tự vượt quá 30
            if (subject.length > 30) {
                if (typeof showPopup === 'function') showPopup("Lỗi", "Tên môn học tối đa chỉ được 30 ký tự!");
                else alert("Tên môn học tối đa chỉ được 30 ký tự!");
                return;
            }

            const existingIndex = scheduleArray.findIndex(item => String(item.day) === String(day));

            if (existingIndex !== -1) {
                scheduleArray[existingIndex].subject = subject;
            } else {
                // Kiểm tra giới hạn 20 task khi thêm mới
                if (scheduleArray.length >= 20) {
                    if (typeof showPopup === 'function') showPopup("Lỗi", "Danh sách đã đạt giới hạn tối đa 20 mục!");
                    else alert("Danh sách đã đạt giới hạn tối đa 20 mục!");
                    return;
                }
                scheduleArray.push({ day, subject });
            }

            scheduleInput.value = '';
            saveData();
        });
    }

    window.deleteItem = function(index) {
        scheduleArray.splice(index, 1);
        saveData();
    };

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            // Thay confirm bằng hành động trực tiếp hoặc thông báo gọn gàng hơn
            scheduleArray = [];
            localStorage.removeItem(STORAGE_KEY);
            renderList();
        });
    }

    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            if (scheduleArray.length === 0) {
                if (typeof showPopup === 'function') showPopup("Thông báo", "Chưa có lịch sao xuất được nè!");
                else alert("Chưa có lịch sao xuất được nè!");
                return;
            }
            
            const blob = new Blob([JSON.stringify(scheduleArray, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = "thoi-khoa-bieu.json";
            a.click();
            URL.revokeObjectURL(url);
        });
    }

    // === VÁ 3: KIỂM ĐỊNH NGHIÊM NGẶT KHI NHẬP FILE JSON ===
    if (importBtn && inputFile) {
        importBtn.addEventListener('click', () => inputFile.click());

        inputFile.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    let parsedList = Array.isArray(data) ? data : Object.entries(data).map(([day, subject]) => ({ day, subject }));

                    // Kiểm tra giới hạn số lượng tối đa 20 task
                    if (parsedList.length > 20) {
                        throw new Error("Tệp tin vượt quá giới hạn tối đa 20 mục cho phép!");
                    }

                    // Kiểm tra cấu trúc và độ dài từng item (<= 30 ký tự)
                    for (let item of parsedList) {
                        if (!item || typeof item !== "object" || typeof item.subject !== "string" || item.subject.length > 30) {
                            throw new Error("Phát hiện dữ liệu sai cấu trúc hoặc môn học dài hơn 30 ký tự!");
                        }
                    }

                    scheduleArray = parsedList;
                    saveData();
                    if (typeof showPopup === 'function') showPopup("Thành công", "Nhập file thành công rùi nha! 🎉");
                    else alert("Nhập file thành công rùi nha! 🎉");
                } catch (err) {
                    if (typeof showPopup === 'function') showPopup("Lỗi", err.message);
                    else alert("File bị lỗi cấu trúc rùi: " + err.message);
                }
            };
            reader.readAsText(file);
            inputFile.value = '';
        });
    }

    renderList();
});