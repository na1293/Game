document.addEventListener('DOMContentLoaded', () => {
    // Cache DOM an toàn khi DOM đã sẵn sàng
    const popup = document.getElementById('event-popup');
    const btn = document.getElementById('event-btn');

    if (!popup || !btn) return;

    function openPopup() {
        popup.classList.add('is-active');
    }

    function closePopup() {
        popup.classList.remove('is-active');
    }

    // Xử lý sự kiện click cho nút mở popup
    btn.addEventListener('click', (e) => {
        e.stopPropagation(); // Ngăn nổi bọt để không chạm đến sự kiện click document bên dưới
        window.open('event-tet.html', '_blank');
        openPopup();
    });

    // Đóng popup khi click ra ngoài (loại trừ trường hợp click chính cái nút bấm)
    document.addEventListener('click', (e) => {
        if (popup.classList.contains('is-active') && !popup.contains(e.target) && !btn.contains(e.target)) {
            closePopup();
        }
    });
});