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

    // FIX LỖI "Unexpected end of JSON input": Bọc try-catch khi parse LocalStorage
    let scheduleArray = [];
    try {
        const rawData = localStorage.getItem(STORAGE_KEY);
        if (rawData && rawData.trim() !== "") {
            scheduleArray = JSON.parse(rawData);
        }
    } catch (e) {
        console.warn("Dữ liệu LocalStorage bị lỗi, reset mảng mới:", e);
        scheduleArray = [];
    }

    // Nắn dữ liệu nếu người dùng từng lưu dạng Object cũ
    if (!Array.isArray(scheduleArray)) {
        if (typeof scheduleArray === 'object' && scheduleArray !== null) {
            scheduleArray = Object.entries(scheduleArray).map(([day, subject]) => ({ day, subject }));
        } else {
            scheduleArray = [];
        }
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

    function renderList() {
        if (!todoList) return;
        todoList.innerHTML = '';

        if (scheduleArray.length === 0) {
            todoList.innerHTML = `<li style="color: #888; text-align: center; margin-top: 10px;">Chưa có dữ liệu thời khóa biểu. Hãy thêm mới nhé! ✨</li>`;
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
            
            li.innerHTML = `
                <span><b>${dayMap[item.day] || 'Thứ ' + item.day}:</b> ${item.subject}</span>
                <button onclick="deleteItem(${index})" style="background: #ff4757; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer;">Xóa</button>
            `;
            todoList.appendChild(li);
        });
    }

    if (addBtn) {
        addBtn.addEventListener('click', () => {
            const subject = scheduleInput.value.trim();
            const day = daySelect.value;

            if (!subject) {
                alert("Nhập nội dung môn học đã nha!");
                return;
            }

            const existingIndex = scheduleArray.findIndex(item => String(item.day) === String(day));

            if (existingIndex !== -1) {
                scheduleArray[existingIndex].subject = subject;
            } else {
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
            if (confirm("Xóa sạch lịch học thiệt hả?")) {
                scheduleArray = [];
                localStorage.removeItem(STORAGE_KEY);
                renderList();
            }
        });
    }

    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            if (scheduleArray.length === 0) return alert("Chưa có lịch sao xuất được nè!");
            
            const blob = new Blob([JSON.stringify(scheduleArray, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = "thoi-khoa-bieu.json";
            a.click();
            URL.revokeObjectURL(url);
        });
    }

    if (importBtn && inputFile) {
        importBtn.addEventListener('click', () => inputFile.click());

        inputFile.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    scheduleArray = Array.isArray(data) ? data : Object.entries(data).map(([day, subject]) => ({ day, subject }));
                    saveData();
                    alert("Nhập file thành công rùi nha! 🎉");
                } catch (err) {
                    alert("File bị lỗi cấu trúc rùi: " + err.message);
                }
            };
            reader.readAsText(file);
            inputFile.value = '';
        });
    }

    renderList();
});