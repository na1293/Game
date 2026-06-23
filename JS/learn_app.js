// Đảm bảo các biến toàn cục được khởi tạo rõ ràng ngay trên đầu file
window.alarmAudio = window.alarmAudio || new Audio("Music/audley_fergine-warning-alarm.mp3");

let timerDisplay = document.getElementById("timer-display");
let startBtn = document.getElementById("start-btn");
let resetBtn = document.getElementById("reset-btn");
let say = document.getElementById("say");
let event_news = document.getElementById("event_news");

let timer;
let isRunning = false;
let timeLeft = 25 * 60; 
let sayst = typeof cau_noi_hay !== 'undefined' ? cau_noi_hay : ["Đang tải câu nói..."]; 
let endTime; 

let day_week = new Date().getDay();
let btnSleep = document.getElementById("btn-sleep");

if ('Notification' in window && Notification.permission !== 'granted') {
    Notification.requestPermission();
}

if (day_week == 0) {
    event_news.innerHTML = "Chủ Nhật: Nghỉ ngơi trọn vẹn, skincare 🧴 dưỡng da và ngủ sớm nạp năng lượng nhé!";
} else if (day_week == 1) {
    event_news.innerHTML = "🎯 Thứ Hai: Lý, Tin, Toán, HĐTN.";
} else if (day_week == 2) {
    event_news.innerHTML = "🔥 Thứ Ba: Anh, Địa, Văn, HĐTN. ";
} else if (day_week == 3) {
    event_news.innerHTML = "🏃‍♂️ Thứ Tư: Sáng: GDĐP, Quốc phòng, Thể chất | Chiều: KTPL, Tin, Toán, Anh.";
} else if (day_week == 4) {
    event_news.innerHTML = "⚡ Thứ Năm: KTPL, Sử, Địa.";
} else if (day_week == 5) {
    event_news.innerHTML = "🎉 Thứ Sáu: Văn, Toán, HĐTN. Sắp cuối tuần rồi cố lên!";
} else if (day_week == 6) {
    event_news.innerHTML = "Thứ Bảy: Cuối tuần rồi, hoàn thành nốt To-do list.";
}

function getRandom(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
if(document.getElementById("say") && sayst.length > 0) {
    document.getElementById("say").innerHTML = sayst[getRandom(0, sayst.length - 1)];
}

// 🔊 HÀM BÁO THỨC PHÁT NHẠC TỪ FILE + RUNG 5 GIÂY
function playAlarmSound() {
    if (window.alarmAudio) {
        window.alarmAudio.volume = 1.0; 
        window.alarmAudio.play().catch(e => console.log("Không thể nổ chuông báo ngầm:", e));
    }

    if ('vibrate' in navigator) {
        navigator.vibrate(5000); 
    }

    try {
        setTimeout(() => {
            if (window.alarmAudio) {
                window.alarmAudio.pause();
                window.alarmAudio.currentTime = 0; 
            }
        }, 5000);
    } catch (e) {
        console.log("Không thể điều khiển file âm thanh:", e);
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
        startBtn.style.background = "var(--primary-gradient)";
    
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({ type: 'STOP_POMODORO' });
        }
        releaseWakeLock();
    } else {
        if (window.alarmAudio) {
            window.alarmAudio.play().then(() => {
                window.alarmAudio.pause();
                window.alarmAudio.currentTime = 0;
            }).catch(e => console.log("Unlock audio lỗi:", e));
        }

        requestWakeLock();
        if (btnSleep) btnSleep.style.display = "none"; 

        endTime = Date.now() + timeLeft * 1000;

        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
                type: 'START_POMODORO',
                endTime: endTime
            });
        }

        timer = setInterval(function() {
            let remainingTimeMs = endTime - Date.now();
            timeLeft = Math.ceil(remainingTimeMs / 1000);

            if (timeLeft <= 0) {
                clearInterval(timer);
                timeLeft = 0;
                timerDisplay.textContent = formatTime(timeLeft);

                console.log("🎯 Đã hoàn thành 25 phút học tập! Tự động cộng 1 quả cà chua.");
                if (typeof tomato_now === "function") {
                    if (typeof stopAllAudio === "function") stopAllAudio(); 
                    tomato_now(); 
                } else {
                    let count = parseInt(localStorage.getItem('tomato_count')) || 0;
                    count += 1;
                    localStorage.setItem('tomato_count', count);
                    const displayElement = document.getElementById("tomato-count");
                    if (displayElement) displayElement.innerHTML = `${count}/10`;
                }

                playAlarmSound(); 
                setTimeout(() => { resetTimer(); }, 500);
            } else {
                timerDisplay.textContent = formatTime(timeLeft);
            }
        }, 1000);
        isRunning = true;
        startBtn.textContent = "Dừng lại";
        startBtn.style.background = "var(--danger-gradient)";
    }
}

function resetTimer() {
    timeLeft = 25 * 60;
    if (timerDisplay) timerDisplay.textContent = formatTime(timeLeft);
    if (isRunning) {
        clearInterval(timer);
        isRunning = false;
        startBtn.textContent = "Bắt đầu học";
        startBtn.style.background = "var(--success-gradient)";
        releaseWakeLock();
    }
    if (btnSleep) btnSleep.style.display = "inline-block"; 

    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'STOP_POMODORO' });
    }
}

if (startBtn) startBtn.addEventListener("click", startTimer);
if (resetBtn) resetBtn.addEventListener("click", resetTimer);

// Đếm ngược mốc thời gian lớn THPTQG 2027
let targetDate = new Date('2027-06-12T00:00:00');
function updateCountdown() {
    let now = new Date();
    let timeDifference = targetDate - now;
    let days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    let hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    let minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
    let seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

    if(document.getElementById("countdown")) document.getElementById("countdown").innerHTML = days + " ngày";
    if(document.getElementById("time-conut")) document.getElementById("time-conut").innerHTML = hours + " giờ " + minutes + " phút " + seconds + " giây ";

    if (timeDifference <= 0) {
        clearInterval(interval);
        if(document.getElementById("countdown")) document.getElementById("countdown").innerHTML = "Đã đến ngày trọng đại rồi! 🎉";
    }
}
let interval = setInterval(updateCountdown, 1000);

// === 🛏️ CẬP NHẬT TIMESAY: THIẾT LẬP KỶ LUẬT NGỦ LÚC 23H ĐỂ PHÁT TRIỂN CHIỀU CAO ===
function timesay() {
    let now = new Date();
    let hh = now.getHours();
    let mm = now.getMinutes();
    let displayHH = hh < 10 ? '0' + hh : hh;
    let displayMM = mm < 10 ? '0' + mm : mm;

    if(document.getElementById("say-now")) document.getElementById("say-now").innerHTML = "Giờ hệ thống: " + displayHH + ":" + displayMM;
    if(document.getElementById("now-set")) document.getElementById("now-set").innerHTML = displayHH + ":" + displayMM;

    let sayTimeEl = document.getElementById("say-time");
    let talkEl = document.getElementById("talk");

    if (!sayTimeEl || !talkEl) return;

    if (hh >= 23 || (hh >= 0 && hh <= 4)) { 
        // 🚨 KHÓA QUY ĐỊNH BẮT BUỘC NGỦ ĐÚNG CHIỀU CAO & SKINCARE
        sayTimeEl.innerHTML = "🚨 ĐÃ ĐẾN GIỜ ĐI NGỦ BẮT BUỘC! 🛌";
        talkEl.innerHTML = "Quá 23:00 rồi bạn ơi! Gập máy, tắt điện thoại và ĐI NGỦ NGAY để thúc đẩy chiều cao tối đa, da đẹp hết mụn nào! Đừng cố quá nha! 🌙";
    } else if (hh >= 5 && hh <= 6) {
        sayTimeEl.innerHTML = "Chào ngày mới sớm 🌅";
        talkEl.innerHTML = "Dậy sớm thế bạn ơi! Nhớ uống cốc nước ấm và bổ sung Canxi trước khi đi học nhé! 🔥";
    } else if (hh >= 7 && hh <= 9) {
        sayTimeEl.innerHTML = "Chào buổi sáng tốt lành ☀️";
        talkEl.innerHTML = "Tranh thủ giải quyết các bài tập khó nhằn lúc não tỉnh táo nhất nhé!";
    } else if (hh >= 10 && hh <= 12) {
        sayTimeEl.innerHTML = "Chào buổi trưa 🌤️";
        talkEl.innerHTML = "Nạp năng lượng ăn trưa rồi nghỉ ngơi xíu lấy sức chiều đi học lúc 12:20 nha.";
    } else if (hh >= 13 && hh <= 15) {
        sayTimeEl.innerHTML = "Chào buổi chiều đầu ☀️";
        talkEl.innerHTML = "Giữ vững sự tập trung ở trường, đừng lén ngủ gật trong giờ Văn nha. 🤫";
    } else if (hh >= 16 && hh <= 17) {
        sayTimeEl.innerHTML = "Chào chiều muộn 🌆";
        talkEl.innerHTML = "Đứng dậy vươn vai, uống chút nước hoặc làm vài động tác thể thao đi nào.";
    } else if (hh >= 18 && hh <= 19) {
        sayTimeEl.innerHTML = "Chào buổi tối 🌌";
        talkEl.innerHTML = "Giờ cơm tối sum họp gia đình đây rồi. Ăn ngon miệng nhé!";
    } else if (hh >= 20 && hh <= 22) {
        sayTimeEl.innerHTML = "Thời gian vàng để học 🌙";
        talkEl.innerHTML = "Bật nhạc nhẹ tập trung và giải quyết hết đống To-do list thôi!";
    }
}
timesay();
setInterval(timesay, 1000);

let countdownInterval;
function nghi_ngoi() {
    if (window.alarmAudio) {
        window.alarmAudio.volume = 0.01;
        window.alarmAudio.play().then(() => {
            setTimeout(() => {
                if (window.alarmAudio) {
                    window.alarmAudio.pause();
                    window.alarmAudio.currentTime = 0;
                    window.alarmAudio.volume = 1; 
                }
            }, 50);
        }).catch(e => console.log("Unlock audio lỗi ở chế độ tối giản:", e));
    }

    let settime = prompt("Bạn muốn học/nghỉ ở chế độ tối giản bao nhiêu phút?\nBạn có thể đặt giờ học từ 25-50 phút để nhận cà chua\n\nNgoài ra, việc nghỉ ngơi từ 5-15p cũng rất tốt (Miễn là không sử dụng thiết bị điện tử)");
    if (!settime) return;

    let minutesStudied = parseFloat(settime);
    if (isNaN(minutesStudied) || minutesStudied <= 0) {
        alert("Vui lòng nhập số phút hợp lệ!");
        return;
    }

    if (minutesStudied >= 240) {
        alert("Hệ thống phát hiện thời gian quá dài (treo máy)! Phiên này sẽ KHÔNG được tính cà chua.");
    } else if (minutesStudied >= 25) {
        alert("Chế độ học trồng cà chua! Hãy tập trung cao độ để nhận 1 🍅 khi hết giờ.");
    } else {
        alert("Thời gian học ngắn quá (< 25 phút), chế độ tối giản này sẽ không tính cà chua nhé!");
    }
    
    let timeInMs = minutesStudied * 60 * 1000; 
    let endTimeLocal = Date.now() + timeInMs; 

    if (minutesStudied > 0 && minutesStudied <= 600) { 
        alert(`Đã thiết lập! Gặp lại bạn sau ${settime} phút.`);
        
        // Gọi an toàn hàm playSelectedMusic từ music.js nếu có
        if (typeof playSelectedMusic === "function") {
            playSelectedMusic();
        }
        
        document.getElementById("AOD").style.color = "#fff";
        document.getElementById("AOD").style.display = "flex";
        document.getElementById("container").style.display = "none";
        requestWakeLock();

        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
                type: 'START_POMODORO',
                endTime: endTimeLocal
            });
        }

        if (countdownInterval) clearInterval(countdownInterval);

        countdownInterval = setInterval(() => {
            let remainingTime = endTimeLocal - Date.now();
            if (remainingTime <= 0) {
                clearInterval(countdownInterval);
                document.getElementById("time-count-set").innerHTML = "00:00:00"; 

                playAlarmSound();

                if (minutesStudied >= 25 && minutesStudied < 240) {
                    console.log("🎯 Hoàn thành phiên học tối giản! Cộng 1 quả cà chua.");
                    if (typeof tomato_now === "function") {
                        if (typeof stopAllAudio === "function") stopAllAudio();
                        tomato_now(); 
                    } else {
                        let count = parseInt(localStorage.getItem('tomato_count')) || 0;
                        count += 1;
                        localStorage.setItem('tomato_count', count);
                        const displayElement = document.getElementById("tomato-count");
                        if (displayElement) displayElement.innerHTML = `${count}/10`;
                    }
                }

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
    } else { alert("Thời gian nhập vào không hợp lý!"); }
}

function check() {
    if (timeLeft > 0 && timeLeft < 25 * 60) {
        alert("Ơ kìa? Bạn chưa học xong cơ mà, định lén lướt mạng xã hội đúng không? Tập trung lại ngay! 😤");
    }
}
document.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement) check(); });

document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && isRunning) {
        requestWakeLock();
        let remainingTimeMs = endTime - Date.now();
        if (remainingTimeMs <= 0) {
            clearInterval(timer);
            timeLeft = 0;
            timerDisplay.textContent = formatTime(timeLeft);
            alert(`Bạn đã học chăm chỉ xong phiên rồi đó!`);
            if (typeof tomato_now === "function") tomato_now();
            playAlarmSound();
            setTimeout(() => { resetTimer(); }, 500);
        } else {
            timeLeft = Math.ceil(remainingTimeMs / 1000);
            timerDisplay.textContent = formatTime(timeLeft);
        }
    }
});

function moveHome() {
    const myButton = document.getElementById('move-home');
    if (!myButton) return;
    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) { myButton.classList.add('show'); } 
        else { myButton.classList.remove('show'); }
    });
    myButton.addEventListener('click', () => { window.scrollTo({ top: 0, behavior: 'smooth' }); });
}
moveHome();