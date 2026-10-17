// 1. Tìm phần tử tên người dùng ngoài giao diện
const userNameSpan = document.getElementById('user-name');

// 2. Tự động kiểm tra và hiển thị tên đã lưu khi tải lại trang (F5)
window.addEventListener('DOMContentLoaded', () => {
    const savedName = localStorage.getItem('user_name');
    if (savedName) {
        userNameSpan.textContent = savedName; // Hiển thị tên cũ đã lưu
    }
});

// 3. Đăng ký sự kiện: KHI BẤM VÀO TÊN -> HIỆN POP-UP THAY TÊN
userNameSpan.addEventListener('click', () => {
    
    // Gọi hàm hiện khung nhập chữ từ thư viện Pop-up của bạn
    showTextPrompt("Đổi tên người dùng", "Nhập tên mới của bạn...", function(value) {
        
        // Kiểm tra độ dài tên
        if (value.length > 12) {
            showPopup("Thất bại", "Tên quá dài")
            return;
        }

        // Kiểm tra xem người dùng có nhập chữ hay không
        if (value && value.trim() !== "") {
            const newName = value.trim(); // Loại bỏ khoảng trắng thừa ở hai đầu

            // Thay đổi tên hiển thị trên màn hình ngay lập tức
            userNameSpan.textContent = newName;

            // Lưu tên mới vào bộ nhớ LocalStorage để không bị mất khi F5
            localStorage.setItem('user_name', newName);

            // Hiện thêm một Pop-up thông báo nhỏ báo lưu thành công (tùy chọn)
            showPopup("Thành công", "Tên của bạn đã được thay đổi!");
        }
        
    });
    
});
