# Lỗi khi cố gắng ép TKB vào biến scheduleData từ Githubusercontent (scheduleAPI.json)

Bug Type: Mismatch Data Type & Asynchronous timing (Siêu sơ đẳng)

Lỗi nằm ở 3 điểm lệch pha về kiểu dữ liệu và luồng bất đồng bộ giữa 3 file

## 1. u-read-json-time-table.js: Ép mảng vào Object
Lỗi: Trong FirstFile_schedule.js, API trả về một Object dạng { "0": "...", "1": "..." }. Nhưng file này lại dùng .filter() — hàm vốn chỉ dành riêng cho Mảng (Array).  Hậu quả: Trình duyệt văng lỗi ngay lập tức: `TypeError: currentScheduleData.filter is not a function.`

## 2. time-table.js: Chạy trước khi có dữ liệu + Lệch Index
### Lỗi 1 (Chạy vội): 
- Gọi updateSchedule() ngay khi file vừa load. Lúc này fetch() từ Gist chưa kịp trả dữ liệu về nên scheduleData đang bằng {} rỗng.  
### Lỗi 2 (Lệch Index): 
- Dùng `day_select.value - 1`. Nếu người dùng chọn Thứ 2 (value = "1"), code lấy 1 - 0 = 0 (thành Chủ Nhật), làm lệch hết thứ trong tuần.  

### 3. Khởi tạo LocalStorage sai kiểu
- Lỗi: File 2 khởi tạo let currentScheduleData = ... || [] (mặc định là Mảng rỗng). Khi ghé dữ liệu Object từ Gist đè vào, cấu trúc bị loạn xạ giữa Mảng và Object.  