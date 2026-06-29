document.addEventListener("DOMContentLoaded", () => {
    const inputDiv = document.querySelector(".input-birthdate");
    const countDiv = document.querySelector(".count-birthdate");
    const birthdateInput = document.getElementById("birthdate");
    const btnSubmit = document.getElementById("btn-submit-birthdate");
    const countdownEl = document.getElementById("countdown-birthdate");
    const timeEl = document.getElementById("time-conut-birthdate");

    if (!inputDiv || !countDiv || !birthdateInput || !btnSubmit || !countdownEl || !timeEl) return;

    let countdownInterval;

    const savedDate = localStorage.getItem("userBirthdate");

    if (savedDate) {
        inputDiv.style.display = "none";
        countDiv.style.display = "block";
        startCountdown(savedDate);
    } else {
        inputDiv.style.display = "block";
        countDiv.style.display = "none";
    }

    btnSubmit.addEventListener("click", () => {
        const val = birthdateInput.value;
        if (!val) return alert("Nhập ngày sinh đi!");

        localStorage.setItem("userBirthdate", val);
        inputDiv.style.display = "none";
        countDiv.style.display = "block";
        startCountdown(val);
    });

    function startCountdown(birthDateStr) {
        if (countdownInterval) clearInterval(countdownInterval);

        const bDate = new Date(birthDateStr);
        const bMonth = bDate.getMonth();
        const bDay = bDate.getDate();

        countdownInterval = setInterval(() => {
            const now = new Date();

            if (now.getMonth() === bMonth && now.getDate() === bDay) {
                countdownEl.innerText = "Chúc mừng sinh nhật! 🎉";
                timeEl.innerText = "Chúc bạn tuổi mới rực rỡ!";
                return;
            }

            let nextBday = new Date(now.getFullYear(), bMonth, bDay);
            if (now > nextBday) nextBday.setFullYear(now.getFullYear() + 1);

            const diff = nextBday - now;

            const days = Math.floor(diff / 86400000);
            const hours = Math.floor((diff % 86400000) / 3600000);
            const minutes = Math.floor((diff % 3600000) / 60000);
            const seconds = Math.floor((diff % 60000) / 1000);

            countdownEl.innerText = `${days} ngày`;
            timeEl.innerText = `${hours} giờ ${minutes} phút ${seconds} giây`;
        }, 1000);
    }
});