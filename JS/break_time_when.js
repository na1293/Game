/* Bo dem thoi gian tinh thoi gian nghi theo cong thuc hoc 45p, nghi 5p. Nghi 10p o giua tiet 2 va tiet 3 va sau do nghi 5 phut. Tong co 5 tiet. */

function checkPeriodStatus(tietNumber, subjectName, sessionType) {

    // 🎯 Lấy trực tiếp giá trị từ dropdown mùa để quyết định giờ chuẩn ca chiều
    let seasonSelect = document.getElementById("season-select-type");
    let isSummer = seasonSelect ? seasonSelect.value === 'summer' : false;

    let defaultTime = "07:20";
    if (sessionType === 'afternoon') {
        // Lấy đúng giờ theo dropdown mùa ngay tại thời điểm bấm
        defaultTime = isSummer ? "13:10" : "13:00";
    }

    let timeInput = document.getElementById("element-time-id-break-time");
    let time_value = defaultTime;

    // Cập nhật thẳng giá trị mới nhất vào input để các hàm khác dùng chung nếu cần
    if (timeInput) {
        let val = timeInput.value;
        if (val) {
            let [hVal] = val.split(":").map(Number);
            let isValAfternoon = hVal >= 12;
            let isTargetAfternoon = sessionType === 'afternoon';

            // Nếu ca khớp nhưng giờ bị lệch mùa (ví dụ đang chọn mùa đông 13:00 mà input vẫn lưu 13:10), ép về defaultTime mới nhất
            if (isValAfternoon === isTargetAfternoon) {
                if (sessionType === 'afternoon' && val !== defaultTime) {
                    time_value = defaultTime;
                    timeInput.value = defaultTime;
            
                } else {
                    time_value = val;
                
                }
            } else {
                timeInput.value = defaultTime;
                time_value = defaultTime;
               
            }
        } else {
            timeInput.value = defaultTime;
         
        }
    }

    let [hourTime, minuteTime] = time_value.split(":").map(Number);
    let startTime = new Date();
    startTime.setHours(hourTime, minuteTime, 0, 0);

    function getTargetTime(addMinutes) {
        let target = new Date(startTime.getTime() + addMinutes * 60 * 1000);
        let h = String(target.getHours()).padStart(2, '0');
        let m = String(target.getMinutes()).padStart(2, '0');
        return `${h}:${m}`;
    }

    const schedule = [
        { study: 45, break: 5 },
        { study: 45, break: 10 },
        { study: 45, break: 5 },
        { study: 45, break: 5 },
        { study: 45, break: 0 }
    ];

    let accumulatedStart = 0;
    for (let i = 0; i < tietNumber - 1; i++) {
        accumulatedStart += schedule[i].study + schedule[i].break;
    }
    
    let startThisPeriodAt = getTargetTime(accumulatedStart);
    let endThisPeriodAt = getTargetTime(accumulatedStart + schedule[tietNumber - 1].study);

    let notificationText = `Tiết ${tietNumber} (${subjectName}): ${startThisPeriodAt} - ${endThisPeriodAt}`;

    if (typeof showPopup === "function") {
        showPopup("Thông báo", notificationText);
    } else {
        alert(notificationText);
    }
}