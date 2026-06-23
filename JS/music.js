
// Kênh 1: Chuyên trị nhạc nền (Mưa, Cafe, No-sound...)
let bgMusicAudio = new Audio();
bgMusicAudio.loop = true;

// Kênh 2: Chuyên trị chuông báo (Độc lập hoàn toàn, không sợ bị ghi đè)
let alarmAudio = new Audio("Music/audley_fergine-warning-alarm.mp3");

// Lấy các phần tử giao diện
const musicSelector = document.getElementById("music-selector");
const playBtn = document.getElementById("btn-play-music");
const stopBtn = document.getElementById("btn-stop-music");

// Hàm thực thi phát nhạc nền (Không đụng chạm vào kênh chuông)
function playSelectedMusic() {
    const musicSelector = document.getElementById("music-selector");
    if (!musicSelector) {
        console.error("Lỗi: Không tìm thấy thẻ select với ID 'music-selector'");
        return;
    }

    const selectedSource = musicSelector.value;
    
    // Cập nhật nguồn nhạc nền nếu có thay đổi
    if (bgMusicAudio.src !== selectedSource) {
        bgMusicAudio.src = selectedSource;
    }

    // Cấu hình âm lượng thông minh để chống sleep trình duyệt
    if (selectedSource.includes("no-sound-but-free.mp3")) {
        bgMusicAudio.volume = 0.01;
    } else {
        bgMusicAudio.volume = 1.0;  // 100% âm lượng cho các sound khác
    }
    
    bgMusicAudio.play().catch(e => console.log("Trình duyệt chặn nhạc nền:", e));
}

// Hàm kích hoạt khi bấm nút "Bắt đầu học" từ Pomodoro
function playsoundsth() {
    const musicSelector = document.getElementById("music-selector");
    if (musicSelector) {
        // Mặc định ép chọn no-sound khi bắt đầu để giữ app chạy ngầm an toàn
        musicSelector.value = "Music/no-sound-but-free.mp3";
    }
    
    // 🔥 ĐOẠN KHÓA VÀNG: Bấm một phát, kích hoạt luôn cả 2 kênh để iOS cấp "vé thông hành"
    playSelectedMusic(); // Mở khóa kênh nhạc nền
    
    // Kích hoạt nhử kênh chuông rồi tắt ngay (nhận vé chạy ngầm trước)
    alarmAudio.volume = 0; // Tạm thời tắt tiếng
    alarmAudio.play()
        .then(() => {
            alarmAudio.pause();
            alarmAudio.currentTime = 0;
            alarmAudio.volume = 1.0; // Đẩy volume lại 100% chờ thời
            console.log("Kênh chuông báo: Đã lấy vé thông hành iOS thành công!");
        })
        .catch(e => console.log("Lỗi kích hoạt trước chuông báo:", e));
}

// Hàm tắt nhạc nền
function stopsoundsth() {
    bgMusicAudio.pause();
}

// Hàm dừng toàn bộ (Cả chuông cả nhạc - Dùng khi kết thúc hoặc reset)
function stopAllAudio() {
    bgMusicAudio.pause();
    alarmAudio.pause();
    alarmAudio.currentTime = 0;
}