let birthdayList = [];

// === 1. TẢI VÀ VALIDATE CẤU TRÚC + GIỚI HẠN TÊN TỪ LOCALSTORAGE ===
try {
    const rawData = localStorage.getItem("myBirthdays");
    if (rawData) {
        const parsed = JSON.parse(rawData);
        if (!Array.isArray(parsed)) {
            throw new Error("Dữ liệu lưu trữ không phải là mảng!");
        }
        // Kiểm tra cấu trúc và độ dài tên <= 17 ký tự
        for (let item of parsed) {
            if (!item || typeof item !== "object" || typeof item.name !== "string" || item.name.length > 17 || typeof item.date !== "string") {
                throw new Error("Cấu trúc hoặc độ dài tên không hợp lệ!");
            }
        }
        birthdayList = parsed;
    }
} catch (e) {
    showPopup("Lỗi", "Dữ liệu sinh nhật không hợp lệ hoặc vượt quá giới hạn!");
    birthdayList = [];
}

// Hàm tính ngày còn lại
function getDaysUntil(dateStr) {
    const now = new Date();
    const bDay = new Date(dateStr);
    
    let next = new Date(now.getFullYear(), bDay.getMonth(), bDay.getDate());
    if (now.getMonth() > bDay.getMonth() || (now.getMonth() === bDay.getMonth() && now.getDate() > bDay.getDate())) {
        next.setFullYear(now.getFullYear() + 1);
    }

    const oneDay = 1000 * 60 * 60 * 24;
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diff = Math.round((next - startOfToday) / oneDay);
    
    return diff;
}

// === 2. RENDER AN TOÀN (Dùng DOM API + textContent chống XSS) ===
const renderList = () => {
    const listContainer = document.getElementById("birthdayListContainer");
    listContainer.innerHTML = ""; // Clear an toàn

    birthdayList.sort((a, b) => getDaysUntil(a.date) - getDaysUntil(b.date))
                .forEach((item) => {
        const days = getDaysUntil(item.date);
        const isToday = days === 0;
        
        const li = document.createElement("li");
        li.style.cssText = `
            display: flex; justify-content: space-between; padding: 10px; 
            border-bottom: 1px solid #ddd; align-items: center;
            background-color: ${isToday ? '#fff3cd' : 'transparent'};
            border-left: 5px solid ${isToday ? '#ffc107' : 'transparent'};
            border-radius: 4px;
            flex-direction: column;
        `;
        
        // --- View Mode (Name Tag) ---
        const nameTag = document.createElement("div");
        nameTag.className = "name_tag";
        nameTag.style.cssText = "display: flex; justify-content: space-between; width: 100%; align-items: center; cursor: pointer;";
        nameTag.onclick = () => toggleEdit(nameTag, true);

        const infoBox = document.createElement("div");
        infoBox.style.cssText = "display: flex; flex-direction: column; gap: 4px; align-items: flex-start; max-width: 50%;";

        const nameSpan = document.createElement("span");
        nameSpan.style.cssText = `font-weight: ${isToday ? 'bold' : '500'}; color: #2f3542; font-size: 15px; text-align: left;`;
        nameSpan.textContent = item.name + (isToday ? ' 🎂' : ''); // Chống XSS chuẩn bài

        const dateSpan = document.createElement("span");
        dateSpan.style.cssText = "color: #a4b0be; font-size: 12px; font-weight: normal;";
        dateSpan.textContent = item.date; // Chống XSS chuẩn bài

        infoBox.appendChild(nameSpan);
        infoBox.appendChild(dateSpan);

        const rightBox = document.createElement("div");
        rightBox.style.cssText = "display: flex; gap: 12px; align-items: center; justify-content: flex-end; flex: 1;";
        rightBox.onclick = (e) => e.stopPropagation();

        const daysStrong = document.createElement("strong");
        daysStrong.style.cssText = `color: ${isToday ? '#d39e00' : 'black'}; font-size: 14px; white-space: nowrap;`;
        daysStrong.textContent = isToday ? "HÔM NAY" : days + " ngày nữa";

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "✕";
        deleteBtn.style.cssText = "cursor: pointer; color: #ff6b6b; border: none; background: #fff5f5; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; transition: 0.2s;";
        deleteBtn.onclick = () => deleteBirthday(item.name);

        rightBox.appendChild(daysStrong);
        rightBox.appendChild(deleteBtn);

        nameTag.appendChild(infoBox);
        nameTag.appendChild(rightBox);

        // --- Edit Mode (Edit Tag) ---
        const editTag = document.createElement("div");
        editTag.className = "edit_tag";
        editTag.style.cssText = "display: none; flex-direction: column; gap: 10px; width: 100%;";

        const inputsDiv = document.createElement("div");
        inputsDiv.style.cssText = "display: flex; gap: 10px; width: 100%;";

        const editNameInput = document.createElement("input");
        editNameInput.type = "text";
        editNameInput.className = "edit-name";
        editNameInput.value = item.name;
        editNameInput.maxLength = 17; // Giới hạn trực tiếp trên thẻ input UI
        editNameInput.style.cssText = "flex: 1; padding: 6px 10px; border: 1px solid #ccc; border-radius: 6px; font-size: 14px; box-sizing: border-box;";

        const editDateInput = document.createElement("input");
        editDateInput.type = "date";
        editDateInput.className = "edit-date";
        editDateInput.value = item.date;
        editDateInput.style.cssText = "flex: 1; padding: 6px 10px; border: 1px solid #ccc; border-radius: 6px; font-size: 14px; box-sizing: border-box;";

        inputsDiv.appendChild(editNameInput);
        inputsDiv.appendChild(editDateInput);

        const btnsDiv = document.createElement("div");
        btnsDiv.style.cssText = "display: flex; gap: 10px; width: 100%;";

        const saveBtn = document.createElement("button");
        saveBtn.textContent = "Lưu";
        saveBtn.style.cssText = "flex: 1; background: #2ed573; color: white; border: none; padding: 8px; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: bold;";
        saveBtn.onclick = () => saveEdit(saveBtn, item.name);

        const cancelBtn = document.createElement("button");
        cancelBtn.textContent = "Hủy";
        cancelBtn.style.cssText = "flex: 1; background: #a4b0be; color: white; border: none; padding: 8px; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: bold;";
        cancelBtn.onclick = () => toggleEdit(cancelBtn, false);

        btnsDiv.appendChild(saveBtn);
        btnsDiv.appendChild(cancelBtn);

        editTag.appendChild(inputsDiv);
        editTag.appendChild(btnsDiv);

        li.appendChild(nameTag);
        li.appendChild(editTag);

        listContainer.appendChild(li);
    });
};

// === 3. XỬ LÝ NHẬP FILE JSON (Chặn XSS + Kiểm tra cấu trúc + Tên <= 17 ký tự + Max 15 người) ===
document.getElementById("fileInput")?.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const parsed = JSON.parse(e.target.result);
            
            if (!Array.isArray(parsed)) {
                return showPopup("Lỗi", "Không đúng file");
            }
            if (parsed.length > 15) {
                return showPopup("Lỗi", "Danh sách vượt quá giới hạn 15 người!");
            }
            
            // Kiểm tra cấu trúc và độ dài tên trong file
            for (let item of parsed) {
                if (!item || typeof item !== "object" || typeof item.name !== "string" || item.name.length > 17 || typeof item.date !== "string") {
                    return showPopup("Lỗi", "Cấu trúc không hợp lệ hoặc tên vượt quá 17 ký tự!");
                }
            }

            birthdayList = parsed;
            localStorage.setItem("myBirthdays", JSON.stringify(birthdayList));
            renderList();
            showPopup("Thành công", "Đã nhập file dữ liệu thành công!");
        } catch (err) {
            showPopup("Lỗi", "Dữ liệu bị lỗi");
        }
    };
    reader.readAsText(file);
});

// Hàm xóa
window.deleteBirthday = (name) => {
    birthdayList = birthdayList.filter(item => item.name !== name);
    localStorage.setItem("myBirthdays", JSON.stringify(birthdayList));
    renderList();
};

// === 4. SỰ KIỆN THÊM (Giới hạn 15 người + Tên tối đa 17 ký tự) ===
document.getElementById("addBtn").addEventListener("click", () => {
    const name = document.getElementById("nameInput").value.trim();
    const date = document.getElementById("dateInput").value;
    
    if (!name || !date) return showPopup("Lỗi", "Điền đủ tên và sinh nhật!");

    if (name.length > 17) {
        return showPopup("Lỗi", "Tên tối đa chỉ được 17 ký tự thôi nha!");
    }

    if (birthdayList.length >= 15) {
        return showPopup("Lỗi", "Danh sách đã đạt giới hạn tối đa 15 người!");
    }

    birthdayList.push({ name, date });
    localStorage.setItem("myBirthdays", JSON.stringify(birthdayList));
    
    document.getElementById("nameInput").value = "";
    document.getElementById("dateInput").value = "";
    renderList();
});

// === CHUYỂN ĐỔI GIAO DIỆN XEM / SỬA ===
window.toggleEdit = (element, isEditing) => {
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

// === HÀM LƯU KHI SỬA (Kiểm tra độ dài tên mới <= 17) ===
window.saveEdit = (buttonElement, oldName) => {
    const parentLi = buttonElement.closest('li');
    const newName = parentLi.querySelector('.edit-name').value.trim();
    const newDate = parentLi.querySelector('.edit-date').value;

    if (!newName || !newDate) return showPopup("Lỗi", "Không được để trống tên hoặc ngày sinh!");

    if (newName.length > 17) {
        return showPopup("Lỗi", "Tên mới không được vượt quá 17 ký tự!");
    }

    const index = birthdayList.findIndex(item => item.name === oldName);
    if (index !== -1) {
        birthdayList[index] = { name: newName, date: newDate };
        localStorage.setItem("myBirthdays", JSON.stringify(birthdayList));
        renderList();
    }
};

// Chạy lần đầu
renderList();