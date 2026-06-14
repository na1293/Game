let searchInput = document.getElementById('search-input');
let searchBtn = document.getElementById('search-btn');
let searchTool = document.getElementById('search-tool');

searchBtn.addEventListener('click', function() {    
    let query = searchInput.value.trim();
    let selectedTool = searchTool.value;

    // Bước 1: Chặn ngay nếu user lười không chịu nhập gì
    if (!query) { 
        alert('Vui lòng nhập nội dung tìm kiếm! 🔍');
        return; // Dừng hàm luôn, không chạy xuống dưới nữa
    }

    // Bước 2: Đã có chữ, giờ check xem ông nào "khó ở" để xử lý
    let searchUrl = '';
    if (selectedTool === 'coccoc.com') {
        searchUrl = `https://coccoc.com/search?query=${encodeURIComponent(query)}`;
    } else {
        // Tất cả các ông còn lại dùng chung công thức ?q=
        searchUrl = `https://${selectedTool}/search?q=${encodeURIComponent(query)}`;
    }

    // Bước 3: Mở tab
    window.open(searchUrl, '_blank');
});