
// === KHỞI TẠO & LẤY PHẦN TỬ === //
const addBtn = document.getElementById('add');
const exportBtn = document.getElementById('export');
const importBtn = document.getElementById('input');
const todoList = document.getElementById('todo-list');
const titleInput = document.getElementById('schedule-title');
const daySelect = document.getElementById('day-select');

// Tạo input file ẩn cho chức năng nhập
const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.accept = '.json';
fileInput.style.display = 'none';
document.body.appendChild(fileInput);

// Tải dữ liệu cũ từ LocalStorage hoặc khởi tạo mảng rỗng
let scheduleData = JSON.parse(localStorage.getItem('scheduleData_v1')) || [];

// === CÁC HÀM CỐT LÕI === //

// 1. Lưu dữ liệu vào LocalStorage
function saveData() {
    localStorage.setItem('scheduleData_v1', JSON.stringify(scheduleData));
}

// 2. Vẽ lại danh sách từ mảng dữ liệu
function renderList() {
    todoList.innerHTML = '';
    scheduleData.forEach((item, index) => {
        const li = document.createElement("li");
        li.style.cssText = `display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #ddd; align-items: center; background-color: transparent; border-left: 5px solid #2ed573; border-radius: 4px;`;
        
        // Escape ký tự đặc biệt để tránh lỗi khi truyền vào onclick
        const safeDay = item.day.replace(/'/g, "\\'");
        const safeSubject = item.subject.replace(/'/g, "\\'");

        li.innerHTML = `
            <div class="name_tag" style="display: flex; justify-content: space-between; width: 100%; align-items: center; cursor: pointer;" onclick="toggleEdit(this, true)">
                <div style="display: flex; flex-direction: column; gap: 4px; align-items: flex-start; max-width: 70%;">
                    <span style="font-weight: 600; color: #2f3542; font-size: 15px; text-align: left;">Thứ ${item.day} - ${item.subject}</span>
                    <span style="color: #a4b0be; font-size: 12px; font-weight: normal;">Nhấn để chỉnh sửa</span>
                </div>
                <div style="display: flex; gap: 12px; align-items: center; justify-content: flex-end; flex: 1;" onclick="event.stopPropagation();">
                    <button onclick="deleteItem('${safeSubject}')" style="cursor: pointer; color: #ff6b6b; border: none; background: #fff5f5; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; transition: 0.2s;">✕</button>
                </div>
            </div>
            <div class="edit_tag" style="display: none; flex-direction: column; gap: 10px; width: 100%; margin-top: 10px;">
                <div style="display: flex; flex-direction: column; gap: 6px; width: 100%;">
                    <label style="font-size: 12px; color: #666;">Ngày: Thứ ${item.day}</label>
                    <input type="text" class="edit-name" value="${item.subject}" placeholder="Tên môn học" style="flex: 1; padding: 6px 10px; border: 1px solid #ccc; border-radius: 6px; font-size: 14px; box-sizing: border-box;">
                </div>
                <div style="display: flex; gap: 10px; width: 100%;">
                    <button onclick="saveEdit(this, '${safeDay}', '${safeSubject}')" style="flex: 1; background: #2ed573; color: white; border: none; padding: 8px; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: bold;">Lưu</button>
                    <button onclick="toggleEdit(this, false)" style="flex: 1; background: #a4b0be; color: white; border: none; padding: 8px; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: bold;">Hủy</button>
                </div>
            </div>
        `;
        todoList.appendChild(li);
    });
    saveData();
}

// === HÀM XỬ LÝ TƯƠNG TÁC === //

// Chuyển đổi chế độ xem/sửa
window.toggleEdit = function(element, isEditing) {
    const li = element.closest('li');
    const viewDiv = li.querySelector('.name_tag');
    const editDiv = li.querySelector('.edit_tag');
    if (isEditing) {
        viewDiv.style.display = 'none';
        editDiv.style.display = 'flex';
    } else {
        viewDiv.style.display = 'flex';
        editDiv.style.display = 'none';
    }
};

// Lưu thay đổi sau khi sửa
window.saveEdit = function(btn, currentDay, oldSubject) {
    const li = btn.closest('li');
    const newSubject = li.querySelector('.edit-name').value.trim();
    if (!newSubject) { alert("Tên môn học không được để trống!"); return; }

    const displaySpan = li.querySelector('.name_tag span:first-child');
    if (displaySpan) displaySpan.textContent = `Thứ ${currentDay} - ${newSubject}`;

    const index = scheduleData.findIndex(item => item.subject === oldSubject && item.day === currentDay);
    if (index !== -1) {
        scheduleData[index].subject = newSubject;
        saveData();
    }
    toggleEdit(btn, false);
};

// Xóa một mục
window.deleteItem = function(subjectName) {
    if (confirm(`Xóa môn "${subjectName}"?`)) {
        const li = event.target.closest('li');
        li.remove();
        const index = scheduleData.findIndex(item => item.subject === subjectName);
        if (index !== -1) {
            scheduleData.splice(index, 1);
            saveData();
        }
    }
};

// Thêm mới
addBtn.addEventListener('click', () => {
    const title = titleInput.value.trim();
    const day = daySelect.value;
    if (!title) { alert("Vui lòng nhập môn học!"); return; }

    const newItem = { day: day, subject: title };
    scheduleData.push(newItem);
    renderList();
    titleInput.value = '';
});

// === CHỨC NĂNG XUẤT NHẬP JSON === //

// Xuất file JSON
exportBtn.addEventListener('click', () => {
    if (scheduleData.length === 0) { alert("Không có dữ liệu để xuất!"); return; }
    const dataStr = JSON.stringify(scheduleData, null, 2);
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

// Mở hộp chọn file nhập
importBtn.addEventListener('click', () => fileInput.click());

// Xử lý khi chọn file nhập
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const importedData = JSON.parse(event.target.result);
            if (!Array.isArray(importedData)) throw new Error("File không đúng định dạng JSON mảng.");
            
            if (scheduleData.length > 0 && !confirm("Dữ liệu hiện tại sẽ bị thay thế. Có tiếp tục?")) {
                e.target.value = ''; return;
            }

            scheduleData = importedData;
            renderList();
            alert("Nhập thành công!");
        } catch (err) {
            alert("Lỗi khi đọc file: " + err.message);
        }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset để chọn lại file cùng tên
});

// Khởi chạy lần đầu
renderList();