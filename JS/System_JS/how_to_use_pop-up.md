# How to use Pop-up (JS)?

## I. Cách gọi/ triển khai:

### 1. Thông báo cơ bản:

Sử dụng để hiênh thông báo cơ bản:

```JS
showPopup("Thành công", "Dữ liệu đã được lưu thành công!");
```

### 2. Hiện khung nhập chữ:

```JS
showTextPrompt("Đổi tên người dùng", "Nhập tên mới của bạn...", function(value) {
  if (value) {
    console.log("Tên mới nhập là:", value);
    // Xử lý tiếp theo (Ví dụ: lưu vào CSDL)
  } else {
    console.log("Người dùng không nhập gì!");
  }
});
```

### 3. Hiện Dropdown danh sách lựa chọn:

```JS
showDropdownPrompt("Chọn vai trò", ["Admin", "User", "Editor"], function(selectedVal) {
  console.log("Vai trò đã chọn:", selectedVal);
});
```

## II. Cách kiểm tra kết quả:

### 1. Nhập prompt:

```JS
let textDaNhap = "";

showTextPrompt("Nhập văn bản", "Ví dụ: Hello", function(val) {
  textDaNhap = val; // Gán dữ liệu vào biến
});
```

### 2. Dropbox:

```JS
showDropdownPrompt("Chọn môn học", ["Toán", "Văn", "Anh"], function(val) {
  // val chính là giá trị của tùy chọn mà người dùng vừa chọn!
  console.log("Người dùng đã chọn:", val);

  if (val === "Toán") {
    console.log("Bạn đã chọn môn Toán 📐");
  } else if (val === "Văn") {
    console.log("Bạn đã chọn môn Văn 📖");
  } else {
    console.log("Bạn đã chọn môn Anh 🔤");
  }
});
```

Hoặc:

```JS
showDropdownPrompt("Chọn môn học", ["Toán", "Văn", "Anh"], function(val) {
    ket_qua = val;
});
console.log(ket_qua);
```