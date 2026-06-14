let timerDisplay = document.getElementById("timer-display");
let startBtn = document.getElementById("start-btn");
let resetBtn = document.getElementById("reset-btn");
let say = document.getElementById("say");
let event_news = document.getElementById("event_news");

let timer;
let isRunning = false;
let timeLeft = 0.1 * 60; 
let sayst = cau_noi_hay; // Tải câu nói từ file sayst.js vào biến sayst để sử dụng trong app.js

let day_week = new Date().getDay();

let alarmAudio = new Audio("Music/audley_fergine-warning-alarm.mp3");

let btnSleep = document.getElementById("btn-sleep");

if (day_week == 0 || day_week == 6) {
    event_news.innerHTML = "Hôm nay là cuối tuần, hãy nghỉ ngơi và thư giãn nhé! ☕";
} else if (day_week == 1) {
    event_news.innerHTML = "Hôm nay là Thứ Hai, bạn học Vật Lý, KTPL và HDTN nhé! 📚";
} else if (day_week == 2) {
    event_news.innerHTML = "Hôm nay là Thứ Ba, bạn học Ngoại Ngữ, Tin Học và Toán ✨";
} else if (day_week == 3) {
    event_news.innerHTML = "Hôm nay là Thứ Tư, sáng: Quốc Phòng, Thể chất - chiều: Văn, Anh và HDTN 🏃‍♂️";
} else if (day_week == 4) {
    event_news.innerHTML = "Hôm nay là Thứ Năm, hãy cẩn thận môn GDDP, chuẩn bị môn Toán và Sử nhé! 🔥";
} else if (day_week == 5) {
    event_news.innerHTML = "Hôm nay là Thứ Sáu, sắp cuối tuần rồi. Bạn có Địa Lý, Văn và sinh hoạt lớp 🎉";
}

function getRandom(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
document.getElementById("say").innerHTML = sayst[getRandom(0, sayst.length - 1)];

// 🔊 HÀM BÁO THỨC PHÁT NHẠC TỪ FILE + RUNG 5 GIÂY
function playAlarmSound() {
    // 1. Kích hoạt rung (Chỉ chạy trên Android, iOS sẽ tự bỏ qua không lỗi)
    if ('vibrate' in navigator) {
        navigator.vibrate(5000); 
    }

    // 2. Phát âm thanh đã được unlock sẵn
    try {
        alarmAudio.play().catch(e => {
            console.log("iOS vẫn chặn phát âm thanh:", e);
        });

        // Tự động tắt sau 5 giây cho đồng bộ
        setTimeout(() => {
            alarmAudio.pause();
            alarmAudio.currentTime = 0; 
        }, 5000);

    } catch (e) {
        console.log("Không thể phát file âm thanh:", e);
    }
}

// 🛡️ WAKE LOCK CHỐNG TẮT MÀN HÌNH TỰ ĐỘNG
let wakeLock = null;
async function requestWakeLock() {
    try {
        if ('wakeLock' in navigator) {
            wakeLock = await navigator.wakeLock.request('screen');
        }
    } catch (err) { console.log(err.message); }
}
function releaseWakeLock() {
    if (wakeLock !== null) { wakeLock.release().then(() => { wakeLock = null; }); }
}

function formatTime(seconds) {
    let minutes = Math.floor(seconds / 60);
    let secondsLeft = seconds % 60;
    return `${minutes < 10 ? '0' : ''}${minutes}:${secondsLeft < 10 ? '0' : ''}${secondsLeft}`;
}

function startTimer() {
    if (isRunning) {
        clearInterval(timer);
        isRunning = false;
        startBtn.textContent = "Bắt đầu học";
        startBtn.style.background = "var(--success-gradient)";
        
        // HIỆN lại nút Chế độ tối giản khi dừng học
        if (btnSleep) btnSleep.style.display = "inline-block"; 
        
        releaseWakeLock();
    } else {
        // MẸO CHO IOS: "Mồi" âm thanh ngay khi bấm nút để unlock autoplay
        alarmAudio.play().then(() => {
            alarmAudio.pause();
            alarmAudio.currentTime = 0;
        }).catch(e => console.log("Unlock audio lỗi:", e));

        requestWakeLock();
        
        // ẨN nút Chế độ tối giản đi khi bắt đầu học
        if (btnSleep) btnSleep.style.display = "none"; 

        timer = setInterval(function() {
            timeLeft--;
            timerDisplay.textContent = formatTime(timeLeft);
            if (timeLeft === 0) {
                clearInterval(timer);
                playAlarmSound(); 
                setTimeout(() => { 
                    resetTimer();
                }, 500);
            }
        }, 1000);
        isRunning = true;
        startBtn.textContent = "Dừng lại";
        startBtn.style.background = "var(--danger-gradient)";
    }
}

function resetTimer() {
    timeLeft = 25 * 60;
    timerDisplay.textContent = formatTime(timeLeft);
    if (isRunning) {
        clearInterval(timer);
        isRunning = false;
        startBtn.textContent = "Bắt đầu học";
        startBtn.style.background = "var(--success-gradient)";
        releaseWakeLock();
    }
    if (btnSleep) btnSleep.style.display = "inline-block"; 
}

startBtn.addEventListener("click", startTimer);
resetBtn.addEventListener("click", resetTimer);

// Đếm ngược mốc thời gian lớn
let targetDate = new Date('2027-06-12T00:00:00');
function updateCountdown() {
    let now = new Date();
    let timeDifference = targetDate - now;
    let days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    let hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    let minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
    let seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

    document.getElementById("countdown").innerHTML = days + " ngày";
    document.getElementById("time-conut").innerHTML = hours + " giờ " + minutes + " phút " + seconds + " giây ";

    if (timeDifference <= 0) {
        clearInterval(interval);
        document.getElementById("countdown").innerHTML = "Đã đến ngày trọng đại rồi! 🎉";
    }
}
let interval = setInterval(updateCountdown, 1000);

function timesay() {
    let now = new Date();
    let hh = now.getHours();
    let mm = now.getMinutes();
    hh = hh < 10 ? '0' + hh : hh;
    mm = mm < 10 ? '0' + mm : mm;

    document.getElementById("say-now").innerHTML = "Giờ hệ thống: " + hh + ":" + mm;
    document.getElementById("now-set").innerHTML = hh + ":" + mm;

    if (hh >= 0 && hh <= 2) { 
        document.getElementById("say-time").innerHTML = "Chào buổi đêm muộn 🦉";
        document.getElementById("talk").innerHTML = "Giờ đã rất khuya rồi, hãy đi ngủ ngay để bảo vệ làn da và sức khỏe!";
    } else if (hh >= 3 && hh <= 4) {
        document.getElementById("say-time").innerHTML = "Bạn nên nghỉ ngơi ngay 🛌";
        document.getElementById("talk").innerHTML = "Muộn lắm rồi, dừng học và lên giường đi ngủ thôi bạn ơi!";
    } else if (hh >= 5 && hh <= 6) {
        document.getElementById("say-time").innerHTML = "Chào ngày mới sớm 🌅";
        document.getElementById("talk").innerHTML = "Dậy sớm quá ta! Sắp sửa năng lượng đón ngày mới nào.";
    } else if (hh >= 7 && hh <= 9) {
        document.getElementById("say-time").innerHTML = "Chào buổi sáng tốt lành ☀️";
        document.getElementById("talk").innerHTML = "Tranh thủ giải quyết các bài tập khó nhằn lúc não tỉnh táo nhất nhé!";
    } else if (hh >= 10 && hh <= 12) {
        document.getElementById("say-time").innerHTML = "Chào buổi trưa 🌤️";
        document.getElementById("talk").innerHTML = "Nạp năng lượng ăn trưa rồi nghỉ ngơi xíu lấy sức chiều học tiếp.";
    } else if (hh >= 13 && hh <= 15) {
        document.getElementById("say-time").innerHTML = "Chào buổi chiều đầu ☀️";
        document.getElementById("talk").innerHTML = "Giữ vững sự tập trung, đừng buồn ngủ nha.";
    } else if (hh >= 16 && hh <= 17) {
        document.getElementById("say-time").innerHTML = "Chào chiều muộn 🌆";
        document.getElementById("talk").innerHTML = "Đứng dậy vươn vai, uống chút nước hoặc ăn nhẹ tí đồ ngọt đi nào.";
    } else if (hh >= 18 && hh <= 19) {
        document.getElementById("say-time").innerHTML = "Chào buổi tối 🌌";
        document.getElementById("talk").innerHTML = "Giờ cơm tối sum họp gia đình đây rồi. Ăn ngon miệng nhé!";
    } else if (hh >= 20 && hh <= 22) {
        document.getElementById("say-time").innerHTML = "Thời gian vàng để học 🌙";
        document.getElementById("talk").innerHTML = "Bật nhạc nhẹ tập trung và giải quyết hết đống To-do list thôi!";
    } else if (hh == 23) {
        document.getElementById("say-time").innerHTML = "Sắp đến giờ ngủ 💤";
        document.getElementById("talk").innerHTML = "Uống canxi, tắt thiết bị điện tử dần để chuẩn bị ngủ sớm tăng chiều cao nào!";
    }
}
timesay();
setInterval(timesay, 1000);

let countdownInterval;
function nghi_ngoi() {
    // 🔥 ÁP DỤNG TƯƠNG TỰ: Tắt volume và phát thử trước khi prompt() hiện ra
    alarmAudio.volume = 0;
    alarmAudio.play().then(() => {
        setTimeout(() => {
            alarmAudio.pause();
            alarmAudio.currentTime = 0;
            alarmAudio.volume = 1; // Trả lại volume cho Android/iOS kêu lúc hết giờ
        }, 50);
    }).catch(e => console.log("Unlock audio lỗi ở chế độ tối giản:", e));

    let settime = prompt("Bạn muốn học/nghỉ ở chế độ tối giản bao nhiêu phút?");
    if (!settime) return;
    
    let timeInMs = parseFloat(settime) * 60 * 1000; 
    let endTime = Date.now() + timeInMs; 

    if (!(settime > 65 || settime <= 0)) {
        if (!isNaN(timeInMs) && timeInMs > 0) {
            alert(`Đã thiết lập! Gặp lại bạn sau ${settime} phút.`);
            document.getElementById("AOD").style.color = "#fff";
            document.getElementById("AOD").style.display = "flex";
            document.getElementById("container").style.display = "none";
            requestWakeLock();

            if (countdownInterval) clearInterval(countdownInterval);

            countdownInterval = setInterval(() => {
                let remainingTime = endTime - Date.now();
                if (remainingTime <= 0) {
                    clearInterval(countdownInterval);
                    document.getElementById("time-count-set").innerHTML = "00:00:00"; 
                    
                    // Đảm bảo chắc chắn volume bằng 1 trước khi nổ chuông
                    alarmAudio.volume = 1; 
                    playAlarmSound();
                    
                    setTimeout(() => { 
                        document.getElementById("AOD").style.display = "none";
                        document.getElementById("container").style.display = "block";
                        releaseWakeLock();
                    }, 5000); 
                    
                } else {
                    let h = Math.floor(remainingTime / 3600000);
                    let m = Math.floor((remainingTime % 3600000) / 60000);
                    let s = Math.floor((remainingTime % 60000) / 1000); 
                    document.getElementById("time-count-set").innerHTML = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
                }
            }, 1000);
        } else { alert("Vui lòng nhập số hợp lệ!"); }
    } else { alert("Thời gian không hợp lý (1 đến 65 phút)!"); }
}

// Kiểm tra phạt khi thoát Fullscreen giữa chừng
function check() {
    if (timeLeft > 0 && timeLeft < 25 * 60) {
        alert("Ơ kìa? Bạn chưa học xong cơ mà, định lén lướt mạng xã hội đúng không? Tập trung lại ngay! 😤");
    }
}
document.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement) check(); });
document.addEventListener('webkitfullscreenchange', () => { if (!document.webkitFullscreenElement) check(); });
document.addEventListener('mozfullscreenchange', () => { if (!document.mozFullScreenElement) check(); });
document.addEventListener('msfullscreenchange', () => { if (!document.msFullscreenElement) check(); });

document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && isRunning) requestWakeLock();
});

// Widget Thời tiết tự chạy
!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src='https://weatherwidget.io/js/widget.min.js';fjs.parentNode.insertBefore(js,fjs);}}(document,'script','weatherwidget-io-js');