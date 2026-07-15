let searchInput = document.getElementById('search-input');
let searchBtn = document.getElementById('search-btn');
let searchTool = document.getElementById('search-tool');

// 1. Tách logic ra thành một hàm riêng
function performSearch() {
    let query = searchInput.value.trim();
    let selectedTool = searchTool.value;

    if (!query) { 
        alert('Vui lòng nhập nội dung tìm kiếm! 🔍');
        return;
    }

    let searchUrl = '';
    // ... (Giữ nguyên logic if/else của cưng ở đây)
    
    // Ví dụ mẫu cho 1 trường hợp
    if (selectedTool === 'coccoc.com') {
        searchUrl = `https://coccoc.com/search?query=${encodeURIComponent(query)}`;
    } else {
        searchUrl = `https://${selectedTool}/search?q=${encodeURIComponent(query)}`;
    }

    searchInput.value = ''; 
    window.open(searchUrl, '_blank');
}

// 2. Gán sự kiện click cho nút
searchBtn.addEventListener('click', performSearch);

// 3. Gán sự kiện nhấn Enter cho input
searchInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        performSearch();
    }
});