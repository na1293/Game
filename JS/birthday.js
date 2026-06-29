document.addEventListener("DOMContentLoaded", () => {
    const inputDiv = document.querySelector(".input-birthdate");
    const countDiv = document.querySelector(".count-birthdate");
    const birthdateInput = document.getElementById("birthdate");
    const btnSubmit = document.getElementById("btn-submit-birthdate");
    const countdownEl = document.getElementById("countdown-birthdate");
    const timeEl = document.getElementById("time-conut-birthdate");

    // 1. Kiểm tra localStorage khi load trang
    const savedDate = localStorage.getItem("userBirthdate");
    const date_now_ = new Date(savedDate);

    if (!savedDate || isNaN(date_now_.getTime())) {
        countdownEl.innerText = "Không thể tải";
        timeEl.innerText = "";
        return;
    }

    if (savedDate) {
        inputDiv.style.display = "none";
        countDiv.style.display = "block";
        startCountdown(savedDate);
    } else {
        inputDiv.style.display = "block";
        countDiv.style.display = "none";
    }

    // 2. Xử lý khi nhấn nút xác nhận
    btnSubmit.addEventListener("click", () => {
        const val = birthdateInput.value;
        if (!val) return alert("Nhập ngày sinh đi ông ơi!");
        
        localStorage.setItem("userBirthdate", val);
        inputDiv.style.display = "none";
        countDiv.style.display = "block";
        startCountdown(val);
    });

    // 3. Hàm đếm ngược
    function startCountdown(birthDateStr) {
        const bDate = new Date(birthDateStr);
        const bMonth = bDate.getUTCMonth(); // Dùng UTC để tránh sai lệch múi giờ khi lưu
        const bDay = bDate.getUTCDate();

        setInterval(() => {
            const now = new Date();
            const nowMonth = now.getMonth();
            const nowDate = now.getDate();

            // Kiểm tra sinh nhật hôm nay
            if (nowMonth === bMonth && nowDate === bDay) {
                countdownEl.innerText = "Chúc mừng sinh nhật! 🎉";
                timeEl.innerText = "Chúc bạn tuổi mới rực rỡ!";
                return; // Dừng chạy đếm ngược để hiển thị lời chúc
            }

            // Logic đếm ngược như cũ
            let nextBday = new Date(now.getFullYear(), bMonth, bDay);
            if (now > nextBday) nextBday.setFullYear(now.getFullYear() + 1);

            const diff = nextBday - now;
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            countdownEl.innerText = `${days} ngày`;
            timeEl.innerText = `${hours} giờ ${minutes} phút ${seconds} giây`;
        }, 1000);
    }
});