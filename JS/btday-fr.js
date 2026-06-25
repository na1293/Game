let birthdayList = JSON.parse(localStorage.getItem("myBirthdays")) || [];

// Hàm tính ngày còn lại
function getDaysUntil(dateStr) {
    const now = new Date();
    const bDay = new Date(dateStr);
    
    // Tạo đối tượng ngày sinh trong năm nay
    let next = new Date(now.getFullYear(), bDay.getMonth(), bDay.getDate());
    
    // Nếu ngày sinh đã qua trong năm nay, nhảy sang năm sau
    if (now.getMonth() > bDay.getMonth() || (now.getMonth() === bDay.getMonth() && now.getDate() > bDay.getDate())) {
        next.setFullYear(now.getFullYear() + 1);
    }

    // Tính toán sự chênh lệch ngày
    const oneDay = 1000 * 60 * 60 * 24;
    // Chuyển cả 2 về cùng mốc 00:00:00 để so sánh chính xác ngày
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diff = Math.round((next - startOfToday) / oneDay);
    
    return diff;
}

// Render danh sách
const renderList = () => {
    const listContainer = document.getElementById("birthdayListContainer");
    listContainer.innerHTML = "";

    // 1. Lọc lấy những phần tử hợp lệ (phải có cả name và date)
    const validBirthdays = birthdayList.filter(item => item && item.name && item.date);

    // 2. KHẮC PHỤC: Nếu số lượng bị lệch, tức là có phần tử lỗi -> Đè lại sạch vào LocalStorage luôn!
    if (validBirthdays.length !== birthdayList.length) {
        birthdayList = validBirthdays; // Cập nhật lại biến mảng hiện tại
        localStorage.setItem("myBirthdays", JSON.stringify(birthdayList)); // Ghi đè lại LocalStorage
    }

    // 3. Tiến hành sắp xếp và render danh sách sạch
    validBirthdays.sort((a, b) => getDaysUntil(a.date) - getDaysUntil(b.date))
                .forEach((item) => {
        const days = getDaysUntil(item.date);
        const isToday = days === 0;
        
        // Tạo element chứa (ở đây ví dụ là thẻ li như file cũ của bạn)
        const li = document.createElement("li");
        li.style.cssText = `
            display: flex; justify-content: space-between; padding: 10px; 
            border-bottom: 1px solid #ddd; align-items: center;
            background-color: ${isToday ? '#fff3cd' : 'transparent'};
            border-left: 5px solid ${isToday ? '#ffc107' : 'transparent'};
            border-radius: 4px;
        `;
        
        // Render cấu trúc: có sẵn cả box thông tin thường VÀ box chỉnh sửa (ẩn đi bằng display: none)
        li.innerHTML = `
            <div class="name_tag" style="display: flex; justify-content: space-between; width: 100%; align-items: center; cursor: pointer;" onclick="toggleEdit(this, true)">
                <span style="font-weight: ${isToday ? 'bold' : 'normal'}">
                    ${item.name} ${isToday ? '🎂' : ''} <small style="color: #888; font-weight: normal;">(${item.date})</small>
                </span>
                <div style="display: flex; gap: 10px; align-items: center;" onclick="event.stopPropagation(); /* Ngăn chặn kích hoạt click vào name_tag */">
                    <strong style="color: ${isToday ? '#d39e00' : '#2f3542'}">
                        ${isToday ? "HÔM NAY" : days + " ngày nữa"}
                    </strong>
                    <button onclick="deleteBirthday('${item.name.replace(/'/g, "\\'")}')" style="cursor: pointer; color: #ff6b6b; border: none; background: none; font-weight: bold;">✕</button>
                </div>
            </div>

            <div class="edit_tag" style="display: none; gap: 8px; width: 100%; align-items: center;">
                <input type="text" class="edit-name" value="${item.name}" style="padding: 4px 8px; width: 40%; border: 1px solid #ccc; border-radius: 4px;">
                <input type="date" class="edit-date" value="${item.date}" style="padding: 4px 8px; width: 35%; border: 1px solid #ccc; border-radius: 4px;">
                <button onclick="saveEdit(this, '${item.name.replace(/'/g, "\\'")}')" style="background: #2ed573; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 12px;">Lưu</button>
                <button onclick="toggleEdit(this, false)" style="background: #a4b0be; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 12px;">Hủy</button>
            </div>
        `;
        listContainer.appendChild(li);
    });
};

// Hàm xóa
window.deleteBirthday = (name) => {
    birthdayList = birthdayList.filter(item => item.name !== name);
    localStorage.setItem("myBirthdays", JSON.stringify(birthdayList));
    renderList();
};

// Sự kiện thêm
document.getElementById("addBtn").addEventListener("click", () => {
    const name = document.getElementById("nameInput").value;
    const date = document.getElementById("dateInput").value;
    if (!name || !date) return alert("Điền đủ tên và sinh nhật!");

    birthdayList.push({ name, date });
    localStorage.setItem("myBirthdays", JSON.stringify(birthdayList));
    document.getElementById("nameInput").value = "";
    renderList();
});

// Chạy lần đầu
renderList();

// === Hàm chuyển đổi qua lại giữa giao diện Xem và Sửa ===
window.toggleEdit = (element, isEditing) => {
    // Tìm thẻ cha li chứa cả 2 box
    const parentLi = element.closest('li'); 
    const nameTag = parentLi.querySelector('.name_tag');
    const editTag = parentLi.querySelector('.edit_tag');

    if (isEditing) {
        nameTag.style.display = 'none';
        editTag.style.display = 'flex';
    } else {
        nameTag.style.display = 'flex';
        editTag.style.display = 'none';
    }
};

// Hàm lưu thông tin sau khi sửa
window.saveEdit = (buttonElement, oldName) => {
    const parentLi = buttonElement.closest('li');
    const newName = parentLi.querySelector('.edit-name').value.trim();
    const newDate = parentLi.querySelector('.edit-date').value;

    if (!newName || !newDate) return alert("Không được để trống tên hoặc ngày sinh đâu nha quý vị ơi! 🤦‍♂️");

    // Tìm vị trí của item cũ dựa vào oldName
    const index = birthdayList.findIndex(item => item.name === oldName);
    
    if (index !== -1) {
        // Cập nhật lại data mới
        birthdayList[index] = { name: newName, date: newDate };
        
        // Lưu vào LocalStorage và render lại giao diện
        localStorage.setItem("myBirthdays", JSON.stringify(birthdayList));
        renderList();
    }
};