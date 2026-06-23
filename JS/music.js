let bgMusicAudio = new Audio();
bgMusicAudio.loop = true;

// Đồng bộ biến chuông với biến hệ thống toàn cục window để không bị trùng lặp
window.alarmAudio = window.alarmAudio || new Audio("Music/audley_fergine-warning-alarm.mp3");

const musicSelector = document.getElementById("music-selector");
const playBtn = document.getElementById("btn-play-music");
const stopBtn = document.getElementById("btn-stop-music");

function playSelectedMusic() {
    const selector = document.getElementById("music-selector");
    if (!selector) return;

    const selectedSource = selector.value;
    if (bgMusicAudio.src !== selectedSource) {
        bgMusicAudio.src = selectedSource;
    }

    if (selectedSource.includes("no-sound-but-free.mp3")) {
        bgMusicAudio.volume = 0.01;
    } else {
        bgMusicAudio.volume = 1.0;
    }
    
    bgMusicAudio.play().catch(e => console.log("Trình duyệt chặn nhạc nền:", e));
}

// Hàm kích hoạt vàng để qua mặt cơ chế chặn âm thanh của iOS/Safari
function playsoundsth() {
    const selector = document.getElementById("music-selector");
    if (selector) {
        selector.value = "Music/no-sound-but-free.mp3";
    }
    
    playSelectedMusic(); 
    
    if (window.alarmAudio) {
        window.alarmAudio.volume = 0; 
        window.alarmAudio.play()
            .then(() => {
                window.alarmAudio.pause();
                window.alarmAudio.currentTime = 0;
                window.alarmAudio.volume = 1.0; 
                console.log("Kênh chuông báo: Đã lấy vé thông hành iOS thành công!");
            })
            .catch(e => console.log("Lỗi kích hoạt trước chuông báo:", e));
    }
}

// Đổi tên hoặc tạo thêm alias để gọi kiểu gì cũng không bị crash app
function stopsound() {
    bgMusicAudio.pause();
}
function stopsoundsth() {
    bgMusicAudio.pause();
}

function stopAllAudio() {
    bgMusicAudio.pause();
    if (window.alarmAudio) {
        window.alarmAudio.pause();
        window.alarmAudio.currentTime = 0;
    }
}

// Đăng ký sự kiện lắng nghe trực tiếp cho các nút bấm âm nhạc trên giao diện HTML
if (playBtn) playBtn.addEventListener("click", playSelectedMusic);
if (stopBtn) stopBtn.addEventListener("click", stopAllAudio);