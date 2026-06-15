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
        `;
        
        li.innerHTML = `
            <span style="font-weight: ${isToday ? 'bold' : 'normal'}">${item.name} ${isToday ? '🎂' : ''}</span>
            <div style="display: flex; gap: 10px; align-items: center;">
                <strong style="color: ${isToday ? '#d39e00' : '#2f3542'}">
                    ${isToday ? "HÔM NAY" : days + " ngày nữa"}
                </strong>
                <button onclick="deleteBirthday('${item.name}')" style="cursor: pointer; color: #ff6b6b; border: none; background: none; font-weight: bold;">✕</button>
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