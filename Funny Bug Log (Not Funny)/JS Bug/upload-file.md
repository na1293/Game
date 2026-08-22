Bug Title: Lỗi crash trang upload.html do gọi tệp CSS không tồn tại và xung đột cú pháp parse localStorage rỗng [source: 3]

Mô tả sự cố:

Khi mở trang upload.html, console báo lỗi 404 không tìm thấy file css/update.css [source: 3]. Đồng thời, trang web bị crash toàn bộ JavaScript với lỗi Uncaught SyntaxError: Unexpected end of JSON input tại file upload-time-table.js.

Nguyên nhân (Root Cause):

Thiếu File Tài Nguyên: Thẻ <link rel="stylesheet" href="css/update.css"> gọi một tệp CSS không có trong dự án [source: 3].

Dữ Liệu Hỏng / Rỗng Trong Storage: Chuỗi lấy từ localStorage.getItem('scheduleData_v1') bị rỗng ("") hoặc undefined, nhưng hàm JSON.parse() vẫn thực thi trực tiếp mà không qua kiểm tra (validation), gây ra lỗi ngắt luồng JavaScript.

Giải pháp đã xử lý:

Xóa bỏ liên kết tới css/update.css trong <head> [source: 3].

Bọc lệnh JSON.parse() trong khối try...catch và thêm điều kiện kiểm tra chuỗi rỗng trước khi parse; tự động khởi tạo mảng [] an toàn nếu dữ liệu lỗi.

Chuẩn hóa lại cơ chế ép kiểu dữ liệu scheduleArray để đảm bảo luôn là dạng Mảng (Array), tránh xung đột cấu trúc dữ liệu với trang chủ.