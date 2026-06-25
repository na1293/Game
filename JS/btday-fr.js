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
                <div style="display: flex; flex-direction: column; gap: 4px; align-items: flex-start; max-width: 50%;">
                    <span style="font-weight: ${isToday ? 'bold' : '500'}; color: #2f3542; font-size: 15px; text-align: left;">
                        ${item.name} ${isToday ? '🎂' : ''}
                    </span>
                    <span style="color: #a4b0be; font-size: 12px; font-weight: normal;">
                        ${item.date}
                    </span>
                </div>
                
                <div style="display: flex; gap: 12px; align-items: center; justify-content: flex-end; flex: 1;" onclick="event.stopPropagation();">
                    <strong style="color: ${isToday ? '#d39e00' : 'black'}; font-size: 14px; white-space: nowrap;">
                        ${isToday ? "HÔM NAY" : days + " ngày nữa"}
                    </strong>
                    <button onclick="deleteBirthday('${item.name.replace(/'/g, "\\'")}')" style="cursor: pointer; color: #ff6b6b; border: none; background: #fff5f5; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; transition: 0.2s;">✕</button>
                </div>
            </div>

            <div class="edit_tag" style="display: none; flex-direction: column; gap: 10px; width: 100%;">
                <div style="display: flex; gap: 10px; width: 100%;">
                    <input type="text" class="edit-name" value="${item.name}" style="flex: 1; padding: 6px 10px; border: 1px solid #ccc; border-radius: 6px; font-size: 14px; box-sizing: border-box;">
                    <input type="date" class="edit-date" value="${item.date}" style="flex: 1; padding: 6px 10px; border: 1px solid #ccc; border-radius: 6px; font-size: 14px; box-sizing: border-box;">
                </div>
                <div style="display: flex; gap: 10px; width: 100%;">
                    <button onclick="saveEdit(this, '${item.name.replace(/'/g, "\\'")}')" style="flex: 1; background: #2ed573; color: white; border: none; padding: 8px; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: bold;">Lưu</button>
                    <button onclick="toggleEdit(this, false)" style="flex: 1; background: #a4b0be; color: white; border: none; padding: 8px; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: bold;">Hủy</button>
                </div>
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
    const parentLi = element.closest('li'); // Tìm thẻ li bọc ngoài cùng
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

    if (!newName || !newDate) return alert("Không được để trống tên hoặc ngày sinh");

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