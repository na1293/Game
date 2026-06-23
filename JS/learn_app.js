let timerDisplay = document.getElementById("timer-display");
let startBtn = document.getElementById("start-btn");
let resetBtn = document.getElementById("reset-btn");
let say = document.getElementById("say");
let event_news = document.getElementById("event_news");

let timer;
let isRunning = false;
let timeLeft = 25 * 60; 
let sayst = cau_noi_hay; // Tải câu nói từ file sayst.js vào biến sayst để sử dụng trong app.js
let endTime; // Mốc thời gian kết thúc

let day_week = new Date().getDay();

let alarmAudio = new Audio("Music/audley_fergine-warning-alarm.mp3");

let btnSleep = document.getElementById("btn-sleep");

if ('Notification' in window && Notification.permission !== 'granted') {
    Notification.requestPermission();
}

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
    
    if (alarmAudio) {
        alarmAudio.volume = 1.0; // Để 100% cho chắc
        alarmAudio.play().catch(e => console.log("Không thể nổ chuông báo ngầm:", e));
    }

    // 1. Kích hoạt rung (Chỉ chạy trên Android, iOS sẽ tự bỏ qua không lỗi)
    if ('vibrate' in navigator) {
        navigator.vibrate(5000); 
    }

    // không bị ảnh hưởng bởi các lệnh hạ volume ẩn trước đó.
    alarmAudio.volume = 1.0; 

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
    // Lấy lại DOM ngay tại thời điểm bấm để đảm bảo không bao giờ bị null

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
        alarmAudio.play().then(() => {
            alarmAudio.pause();
            alarmAudio.currentTime = 0;
        }).catch(e => console.log("Unlock audio lỗi:", e));

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

            // 🍅 TỰ ĐỘNG CỘNG CÀ CHUA KHI HẾT 25 PHÚT
            console.log("🎯 Đã hoàn thành 25 phút học tập! Tự động cộng 1 quả cà chua.");
            if (typeof tomato_now === "function") {
                stopsound(); // Dừng âm thanh
                tomato_now(); // Thưởng cà chua
            } else {
                // Dự phòng nếu không gọi được hàm bên file tomato_month.js
                let count = parseInt(localStorage.getItem('tomato_count')) || 0;
                count += 1;
                localStorage.setItem('tomato_count', count);
                if(typeof tomato_count_backend !== 'undefined') tomato_count_backend = count;
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
    timerDisplay.textContent = formatTime(timeLeft);
    if (isRunning) {
        clearInterval(timer);
        isRunning = false;
        startBtn.textContent = "Bắt đầu học";
        startBtn.style.background = "var(--success-gradient)";
        releaseWakeLock();
    }
    if (btnSleep) btnSleep.style.display = "inline-block"; 

    // HỦY ĐẾM NGẦM KHI BẤM RESET
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'STOP_POMODORO' });
    }
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
        document.getElementById("talk").innerHTML = "Tắt thiết bị điện tử dần để chuẩn bị ngủ sớm tăng chiều cao nào!";
    }
}
timesay();
setInterval(timesay, 1000);

let countdownInterval;
function nghi_ngoi() {
    alarmAudio.volume = 0.01;
    alarmAudio.play().then(() => {
        setTimeout(() => {
            alarmAudio.pause();
            alarmAudio.currentTime = 0;
            alarmAudio.volume = 1; 
        }, 50);
    }).catch(e => console.log("Unlock audio lỗi ở chế độ tối giản:", e));

    let settime = prompt("Bạn muốn học/nghỉ ở chế độ tối giản bao nhiêu phút?\nBạn có thể đặt giờ học từ 25-50 phút để nhận cà chua\n\nNgoài ra, việc nghỉ ngơi từ 5-15p cũng rất tốt (Miễn là không sử dụng thiết bị điện tử)");
    if (!settime) return;

    let minutesStudied = parseFloat(settime);
    if (isNaN(minutesStudied) || minutesStudied <= 0) {
        alert("Vui lòng nhập số phút hợp lệ!");
        return;
    }

    // ⛔ KIỂM TRA CHỐNG TREO MÁY NGAY TỪ ĐẦU
    if (minutesStudied >= 240) {
        alert("Hệ thống phát hiện thời gian quá dài (treo máy)! Phiên này sẽ KHÔNG được tính cà chua.");
    } else if (minutesStudied >= 25) {
        alert("Chế độ học trồng cà chua! Hãy tập trung cao độ để nhận 1 🍅 khi hết giờ.");
    } else {
        alert("Thời gian học ngắn quá (< 25 phút), chế độ tối giản này sẽ không tính cà chua nhé!");
    }
    
    let timeInMs = minutesStudied * 60 * 1000; 
    let endTime = Date.now() + timeInMs; 

    if (minutesStudied > 0 && minutesStudied <= 600) { 
        alert(`Đã thiết lập! Gặp lại bạn sau ${settime} phút.`);
        playsoundsth();
        document.getElementById("AOD").style.color = "#fff";
        document.getElementById("AOD").style.display = "flex";
        document.getElementById("container").style.display = "none";
        requestWakeLock();

        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
                type: 'START_POMODORO',
                endTime: endTime
            });
        }

        if (countdownInterval) clearInterval(countdownInterval);

        countdownInterval = setInterval(() => {
            let remainingTime = endTime - Date.now();
            if (remainingTime <= 0) {
                clearInterval(countdownInterval);
                document.getElementById("time-count-set").innerHTML = "00:00:00"; 

                alarmAudio.volume = 1; 
                playAlarmSound();

                // Chỉ nhận đúng 1 quả nếu học từ 25 phút trở lên và dưới mốc treo máy (240 phút)
                if (minutesStudied >= 25 && minutesStudied < 240) {
                    console.log("🎯 Hoàn thành phiên học tối giản! Cộng 1 quả cà chua.");
                    if (typeof tomato_now === "function") {
                        stopsound();
                        tomato_now(); 
                    } else {
                        let count = parseInt(localStorage.getItem('tomato_count')) || 0;
                        count += 1;
                        localStorage.setItem('tomato_count', count);
                        if(typeof tomato_count_backend !== 'undefined') tomato_count_backend = count;
                        const displayElement = document.getElementById("tomato-count");
                        if (displayElement) displayElement.innerHTML = `${count}/10`;
                    }
                } else if (minutesStudied >= 240) {
                    console.log("🚫 Treo máy quá lâu, không kích hoạt thưởng cà chua.");
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

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', (event) => {
    // Trường hợp 1: Hết giờ khi tab vẫn còn thức ngầm
    if (event.data.type === 'ALARM_TRIGGER') {
      console.log("Nhận lệnh nổ chuông từ Service Worker!");
      playAlarmSound();
    }
    
    // Trường hợp 2: Ép nổ chuông khi user click thông báo màn hình khóa
    if (event.data.type === 'ALARM_TRIGGER_FORCE') {
      // Đưa đồng hồ giao diện về 00:00
      timeLeft = 0;
      timerDisplay.textContent = formatTime(timeLeft);
      
      // Phát chuông báo thức lập tức
      playAlarmSound();
      setTimeout(() => { resetTimer(); }, 500);
    }
  });
}

// ==========================================
// LOGIC CÁCH 4: TÍNH TOÁN BÙ KHI USER QUAY LẠI APP
// ==========================================
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && isRunning) {
        requestWakeLock(); // Xin lại quyền sáng màn hình cho thiết bị di động
        
        let remainingTimeMs = endTime - Date.now();
        
        if (remainingTimeMs <= 0) {
           
            clearInterval(timer);
            
            let overdueSeconds = Math.abs(Math.ceil(remainingTimeMs / 1000));
            let overdueMinutes = (overdueSeconds / 60).toFixed(1); 
            
            timeLeft = 0;
            timerDisplay.textContent = formatTime(timeLeft);
            
            if (overdueMinutes >= 90) {
                alert(`Có vẻ bạn đã bỏ lỡ đồng hồ suốt ${overdueMinutes}`)
            } else {
                alert(`Bạn đã học chăm chỉ vượt ${overdueMinutes} phút rồi đó!`);
                tomato_now(); 
            }

            playAlarmSound();
            setTimeout(() => { resetTimer(); }, 500);
        } else {
            // Thời gian vẫn còn, cập nhật lại biến chạy để đồng hồ khớp từng mili-giây, không bị lệch
            timeLeft = Math.ceil(remainingTimeMs / 1000);
            timerDisplay.textContent = formatTime(timeLeft);
        }
    }
});

function moveHome() {
    const myButton = document.getElementById('move-home');

    // Theo dõi sự kiện cuộn trang
    window.addEventListener('scroll', () => {
        // Nếu cuộn quá 500px thì hiện nút, ngược lại thì ẩn
        if (window.scrollY > 500) {
            myButton.classList.add('show');
        } else {
            myButton.classList.remove('show');
        }
    });

    // Chức năng cuộn mượt lên trên khi bấm vào nút
    myButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

moveHome()

console.log(
  '%c⚠ CẢNH BÁO QUAN TRỌNG!\n%cBạn không nên vào đây để chỉnh sửa hệ thống vì mục đích ứng dụng là tốt cho bạn. Việc chỉnh sửa có thể dẫn đến sai lệch kết quả cuối năm.\n\n%cBạn có thể tham khảo ToS.', 
  'color: red; font-size: 30px; font-weight: bold;', // Style dòng tiêu đề
  'color: red; font-size: 16px;',                   // Style dòng nội dung chính
  'color: gray; font-size: 12px; font-style: italic; text-decoration: underline;'
);