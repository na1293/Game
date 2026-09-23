/* Bộ đếm thời gian tính thời gian nghỉ theo công thức học 45p, nghỉ 5p. Nghỉ 10p ở giữa tiết 2 và tiết 3 và sau đó nghỉ 5 phút. Tổng có 5 tiết.*/

let element_time_id_break_time = document.getElementById("element-time-id-break-time");

function send_time_id_break_time_when() {
    let time_value = element_time_id_break_time.value;
    if (!time_value) return alert("Vui lòng chọn giờ vào tiết 1!");

    let [hourTime, minuteTime] = time_value.split(":").map(Number);

    let now = new Date();
    
    // Tạo đối tượng Date mốc bắt đầu học chính xác theo ngày hôm nay
    let startTime = new Date();
    startTime.setHours(hourTime, minuteTime, 0, 0);

    // Tính khoảng cách thời gian chính xác (tính bằng phút)
    let totalMinutes = Math.floor((now - startTime) / (1000 * 60));

    // Hàm cộng phút siêu chuẩn, tự nhảy ngày nếu user nhập giờ đêm/rạng sáng
    function getTargetTime(addMinutes) {
        let target = new Date(startTime.getTime() + addMinutes * 60 * 1000);
        let h = String(target.getHours()).padStart(2, '0');
        let m = String(target.getMinutes()).padStart(2, '0');
        return `${h}:${m}`;
    }

    const schedule = [
        { tiet: 1, study: 45, break: 5 },
        { tiet: 2, study: 45, break: 10 },
        { tiet: 3, study: 45, break: 5 },
        { tiet: 4, study: 45, break: 5 },
        { tiet: 5, study: 45, break: 0 }
    ];

    let totalSchoolTime = schedule.reduce((sum, item) => sum + item.study + item.break, 0);
    let finishTime = getTargetTime(totalSchoolTime);

    // Xử lý khi giờ hiện tại chưa tới giờ học đã nhập
    if (totalMinutes < 0) {
        showPopup("Thông báo", `Chưa tới giờ học! Tiết 1 bắt đầu lúc ${time_value}. Tan học lúc ${finishTime}`);
        return;
    }

    let accumulatedTime = 0;
    let status = "";

    for (let period of schedule) {
        // 1. Trong giờ HỌC
        accumulatedTime += period.study;
        if (totalMinutes < accumulatedTime) {
            let breakAt = getTargetTime(accumulatedTime);
            status = `Đang trong Tiết ${period.tiet}. Đúng ${breakAt} ra chơi.`;
            break;
        }

        // 2. Trong giờ NGHỈ
        accumulatedTime += period.break;
        if (totalMinutes < accumulatedTime) {
            let nextClassAt = getTargetTime(accumulatedTime);
            status = `Đang ra chơi sau Tiết ${period.tiet}. Đúng ${nextClassAt} vào tiết.`;
            break;
        }
    }

    if (!status) {
        status = `Hết giờ học rồi! Buổi học đã kết thúc lúc ${finishTime}.`;
    }

    showPopup("Thông báo", status);
}