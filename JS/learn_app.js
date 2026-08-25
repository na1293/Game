// Đảm bảo các biến toàn cục được khởi tạo rõ ràng ngay trên đầu file
window.alarmAudio = window.alarmAudio || new Audio("Music/audley_fergine-warning-alarm.mp3");

let timerDisplay = document.getElementById("timer-display");
let startBtn = document.getElementById("start-btn");
let resetBtn = document.getElementById("reset-btn");
let breakBtn = document.getElementById("break-btn");
let say = document.getElementById("say");
let event_news = document.querySelector(".event_news");


let setting_link = document.getElementById("setting-link");

let timer;
let isRunning = false;
let isBreakMode = false; // false: Học (25p), true: Nghỉ (5p)

let pomodoroTime = Number(localStorage.getItem('pomodoroTime')) || 25;
let breakTime = Number(localStorage.getItem('breakTime')) || 5;

// 👉 THÊM KHAI BÁO BIẾN TIMELEFT Ở ĐÂY NHA:
let timeLeft = pomodoroTime * 60; 

let sayst = typeof cau_noi_hay !== 'undefined' ? cau_noi_hay : ["Đang tải câu nói..."]; 
let endTime; 

let day_week = new Date().getDay();
let btnSleep = document.getElementById("btn-sleep");

if ('Notification' in window && Notification.permission !== 'granted') {
    Notification.requestPermission();
}

// =========================================== //
// 1. Lưu trữ dữ liệu vào một Object
const schedule = scheduleData;

function updateSchedule(day_week) {
    const newsElements = document.querySelectorAll(".event_news");
    const content = schedule[day_week] || "Không có lịch học";
    newsElements.forEach(el => {
        el.innerHTML = content;
    });
}

const today = new Date().getDay(); 
updateSchedule(today);

// =========================================== //

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

// ☕ HÀM KÍCH HOẠT CHẾ ĐỘ NGHỈ 5 PHÚT
function startBreakMode() {
    setting_link.style.display = "block";

    if (isRunning) {
        clearInterval(timer);
        isRunning = false;
    }
    isBreakMode = true;
    timeLeft = breakTime * 60;
    if (breakTime == "") {
        timeLeft = 5 * 60;
    }
    if (timerDisplay) timerDisplay.textContent = formatTime(timeLeft);
    if (startBtn) {

        startBtn.textContent = "Bắt đầu nghỉ";
        startBtn.style.background = "var(--success-gradient)";
    }
    document.title = "☕ Thời gian nghỉ ngơi";
}

function startTimer() {

    setting_link.style.display = "none";

    if (isRunning) {
        clearInterval(timer);
        isRunning = false;
        startBtn.textContent = isBreakMode ? "Bắt đầu nghỉ" : "Bắt đầu học";
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
                isRunning = false;
                timeLeft = 0;
                if (timerDisplay) timerDisplay.textContent = formatTime(timeLeft);

                playAlarmSound();

                if (!isBreakMode) {
                    // 🎉 HỌC XONG 25P -> CỘNG 🍅 VÀ CHUYỂN SANG NGHỈ
                    console.log("🎯 Đã hoàn thành 25 phút học tập!");
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
                    
                    startBreakMode();
                    playAlarmSound();
                    alert("🎉 Giỏi lắm! Đã hết 25 phút học. Giờ thì chuyển sang nghỉ 5 phút nhé!");
                } else {
                    // ⚡ NGHỈ XONG 5P -> VỀ CHẾ ĐỘ HỌC BAN ĐẦU
                    alert("⚡ Hết 5 phút nghỉ rồi! Sẵn sàng cho phiên học tiếp theo nhé.");
                    resetTimer();
                }
            } else {
                if (timerDisplay) timerDisplay.textContent = formatTime(timeLeft);
                let modeText = isBreakMode ? "☕" : "⏱️";
                document.title = `${modeText} - ${formatTime(timeLeft)}`;
            }
        }, 1000);

        isRunning = true;
        startBtn.textContent = "Dừng lại";
        startBtn.style.background = "var(--danger-gradient)";
    }
}

// 🔄 HÀM RESET VỀ TRẠNG THÁI HỌC BAN ĐẦU
function resetTimer() {
    // Cập nhật lại giá trị mới nhất từ localStorage trước khi reset
    pomodoroTime = Number(localStorage.getItem('pomodoroTime')) || 25;
    breakTime = Number(localStorage.getItem('breakTime')) || 5;

    isBreakMode = false;
    timeLeft = pomodoroTime * 60;
    
    document.title = `Ứng dụng tập trung`;
    const timerDisplay = document.getElementById("timer-display");
    if (timerDisplay) timerDisplay.textContent = formatTime(timeLeft);
    
    if (isRunning) {
        clearInterval(timer);
        isRunning = false;
    }
}

// SỰ KIỆN NÚT BẤM (CHỈ GÁN 1 LẦN DỰA TRÊN ONCLICK HOẶC ADDEVENTLISTENER)
if (startBtn) startBtn.onclick = startTimer;
if (resetBtn) resetBtn.onclick = resetTimer;
if (breakBtn) breakBtn.onclick = startBreakMode;

// SỰ KIỆN CHUYỂN TAB / CHUYỂN CỬA SỔ
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && isRunning) {
        requestWakeLock();
        let remainingTimeMs = endTime - Date.now();
        if (remainingTimeMs <= 0) {
            clearInterval(timer);
            isRunning = false;
            timeLeft = 0;
            if (timerDisplay) timerDisplay.textContent = formatTime(timeLeft);
            
            playAlarmSound();

            if (!isBreakMode) {
                if (typeof tomato_now === "function") tomato_now();
                alert(`Bạn đã hoàn thành phiên học 25 phút!`);
                startBreakMode();
            } else {
                alert(`Đã hết thời gian nghỉ ngơi!`);
                resetTimer();
            }
        } else {
            timeLeft = Math.ceil(remainingTimeMs / 1000);
            if (timerDisplay) timerDisplay.textContent = formatTime(timeLeft);
        }
    }
});

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

// === 🛏️ CẬP NHẬT TIMESAY ===
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
        sayTimeEl.innerHTML = "🚨 ĐÃ ĐẾN GIỜ ĐI NGỦ! 🛌";
        talkEl.innerHTML = "Hiện tại đang rất muộn, vui lòng tắt máy đi ngủ! Học/ chơi thêm có thể suy giảm năng suất.";
    } else if (hh >= 5 && hh <= 6) {
        sayTimeEl.innerHTML = "Chào ngày mới sớm 🌅";
        talkEl.innerHTML = "Dậy sớm thế bạn? Hãy ăn sáng đủ chất nhé. Có thể thêm nước ép cam sau khi ăn sáng!";
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
        talkEl.innerHTML = "Đứng dậy vươn vai, uống chút nước hoặc làm vài động tác thể thao đi.";
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
    
    // BẮT ĐẦU SHOW POPUP
    showTextPrompt(
        "Hẹn giờ", 
        "Hẹn tối thiểu 25p để có cà chua", 
        function(val) {
            // TOÀN BỘ LOGIC XỬ LÝ NẰM Ở ĐÂY (Khi người dùng bấm "Xác nhận")
            let settime = val; 

            if (!settime) return;

            let minutesStudied = parseFloat(settime);
            if (isNaN(minutesStudied) || minutesStudied <= 0) {
                showPopup("Hẹn giờ Thất bại", "Vui lòng nhập số hợp lệ (Chỉ số)");
                return;
            }

            if (minutesStudied >= 240) {
                showPopup("Từ chối", "Bạn treo máy quá lâu, không có cà chua");
            } else if (minutesStudied >= 25) {
                showPopup("Đang học", "Chế độ học trồng cà chua! Hãy tập trung cao độ để nhận 1 🍅 khi hết giờ.");
            } else {
                showPopup("Từ chối", "Thời gian dưới 25 phút sẽ không được tính cà chua.");
            }
            
            let timeInMs = minutesStudied * 60 * 1000; 
            let endTimeLocal = Date.now() + timeInMs; 

            if (minutesStudied > 0 && minutesStudied <= 600) { 
                showPopup("Bắt đầu học", `Đã thiết lập! Gặp lại bạn sau ${settime} phút.`);
                
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
            } else { 
                showPopup("Từ chối", "Thời gian không hợp lý");
            }
        } // KẾT THÚC CALLBACK
    );
}

function check() {
    if (timeLeft > 0 && timeLeft < 25 * 60) {
        alert("Ơ kìa? Bạn chưa học xong cơ mà, định lén lướt mạng xã hội đúng không?");
    }
}
document.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement) check(); });

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