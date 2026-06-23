/**
 * 🔋 Chế độ siêu tiết kiệm pin cho màn hình AOD (iPhone/OLED)
 */
function toggleAodVisibility() {
    const container = document.getElementById('countdown-container');
    const btn = document.getElementById('btn-toggle-aod-view');
    
    if (!container || !btn) return;
    
    if (container.style.display !== 'none') {
        container.style.display = 'none';
        btn.innerHTML = '<span class="aod-status-dot"></span> Hiện lại tiến trình';
        btn.style.opacity = '0.2';
        btn.style.background = 'transparent';
        btn.style.border = '1px solid #222';
    } else {
        container.style.display = 'block';
        btn.innerHTML = '🔒 Tạm ẩn đồng hồ';
        btn.style.opacity = '1';
        btn.style.background = '';
        btn.style.border = '';
    }
}

// KHÓA AN TOÀN: Chỉ cho phép lắng nghe và gán sự kiện khi toàn bộ cấu trúc HTML (DOM) đã tải xong
document.addEventListener('DOMContentLoaded', () => {
    console.log("Load xong AOD check");
});