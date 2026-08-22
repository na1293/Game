**Bug Title:** Lỗi hiển thị `[object Object]` khi người dùng tải lên tệp JSON thời khóa biểu dạng mảng (Array of Objects)

**Mô tả sự cố:**

Khi người dùng tải lên file JSON cá nhân có cấu trúc dạng mảng (ví dụ: `[{"day":"2","subject":"Đu idol"}, ...]`), giao diện tại ô **Lịch của bạn** (`#user-upload-json-time-table`) hiển thị chuỗi `[object Object]` thay vì nội dung môn học.

**Nguyên nhân (Root Cause):**

* **Xung đột cấu trúc dữ liệu (Data Structure Mismatch):** Code xử lý mặc định xem dữ liệu tải lên là dạng Object key-value (`data["2"]`).
* **Lỗi ép kiểu ngầm định:** Khi `activeData` là một Array, lệnh ép chuỗi template string `${activeData[day]}` vô tình lấy phần tử theo chỉ số index mảng (trả về một Object) và ép kiểu thành `"[object Object]"`.

**Giải pháp đã xử lý:**

* Viết lại hàm truy xuất dữ liệu `getSubjectByDay(data, targetDay)` có khả năng tự động nhận diện cả 2 định dạng:
* **Dạng Array:** Dùng `Array.find()` tìm item có `item.day === targetDay` và trích xuất thuộc tính `subject`.
* **Dạng Object:** Truy cập trực tiếp theo key `data[targetDay]`.


* Ép kiểu dữ liệu trả về thành dạng String an toàn trước khi render lên HTML.