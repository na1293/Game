// 1. Khởi tạo đối tượng Audio chung
let loopAudio = new Audio();
loopAudio.loop = true;

const musicSelector = document.getElementById("music-selector");
const playBtn = document.getElementById("btn-play-music");
const stopBtn = document.getElementById("btn-stop-music");

// Hàm thực thi phát nhạc (dùng cho cả nút Start và nút Phát)
function playSelectedMusic() {
    // Tìm lại selector ngay trong hàm để đảm bảo luôn cập nhật
    const musicSelector = document.getElementById("music-selector");
    
    // Kiểm tra xem có tìm thấy selector không
    if (!musicSelector) {
        console.error("Lỗi: Không tìm thấy thẻ select với ID 'music-selector'");
        return; // Dừng lại ở đây, không chạy tiếp nữa
    }

    const selectedSource = musicSelector.value;
    
    if (loopAudio.src !== selectedSource) {
        loopAudio.src = selectedSource;
    }

    // --- TÍNH NĂNG MỚI: Cấu hình âm lượng ---
    // Thuộc tính .volume nhận giá trị từ 0.0 (tắt tiếng) đến 1.0 (100% âm lượng)
    if (selectedSource.includes("no-sound-but-free.mp3")) {
        loopAudio.volume = 0.01; // 10% âm lượng để giữ trình duyệt không sleep
    } else {
        loopAudio.volume = 1.0;  // 100% âm lượng cho các sound khác
    }
    // ----------------------------------------
    
    loopAudio.play().catch(e => console.log("Trình duyệt chặn:", e));
}

// 2. Nút "Bắt đầu học" trong Pomodoro
function playsoundsth() {
    // Mặc định luôn là no-sound khi bắt đầu
    musicSelector.value = "Music/no-sound-but-free.mp3";
    playSelectedMusic();
}

// 3. Nút "Phát" trong phần nhạc
playBtn.addEventListener("click", playSelectedMusic);

// 4. Nút "Dừng" trong phần nhạc
function stopsound() {
    loopAudio.pause();
    loopAudio.currentTime = 0;
}
stopBtn.addEventListener("click", stopsound);