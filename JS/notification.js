async function syncScheduledNotification() {
    try {
        const response = await fetch("https://script.google.com/macros/s/AKfycbwa228QiCr-lyJXIQPfDPReAg--8plwRT0EM8KJwvNFLK1iw6BGbI1M0TmDy2wyDyY3/exec"); // Nhớ đổi URL API mới deploy của bạn nhé
        const data = await response.json();
        
        // Đẩy thẳng dữ liệu lịch thông báo sự kiện xuống Service Worker
        if (navigator.serviceWorker.controller && data.noti_content) {
            navigator.serviceWorker.controller.postMessage({
                type: 'SET_SCHEDULED_PUSH',
                schedule: {
                    noti_content: data.noti_content,
                    push_time: data.push_time,
                    push_date: data.push_date
                }
            });
        }
    } catch (error) {
        console.error("Lỗi đồng bộ lịch thông báo lớp học:", error);
    }
}

// Tự động kích hoạt đồng bộ khi mở ứng dụng
window.addEventListener('DOMContentLoaded', syncScheduledNotification);