const URL_NEWS_SCRIPT = "https://script.google.com/macros/s/AKfycbwa228QiCr-lyJXIQPfDPReAg--8plwRT0EM8KJwvNFLK1iw6BGbI1M0TmDy2wyDyY3/exec";

async function getNewsData() {
    try {
        
        const response = await fetch(URL_NEWS_SCRIPT);
        if (!response.ok) {
            throw new Error(`Lỗi kết nối Server: ${response.status}`);
        }

        const data = await response.json();

        // Đổ data mượt mà vào giao diện HTML
        if (document.getElementById("news-title")) {
            document.getElementById("news-title").innerText = data.tieu_de || "Không có tiêu đề";
            document.getElementById("news-content").innerText = data.noi_dung || "Nội dung trống";
            document.getElementById("news-author").innerText = `✍️ Tác giả: ${data.tac_gia || "Ẩn danh"}`;
            document.getElementById("news-date").innerText = `📅 Ngày: ${data.ngay_dang || "--/--/----"}`;
        }

    } catch (error) {
        console.error(error);
        if (document.getElementById("news-title")) {
            document.getElementById("news-title").innerText = "Lỗi tải bản tin! ❌";
            document.getElementById("news-content").innerText = "Không thể kết nối đến dữ liệu Google Sheet. Sốp check lại mạng hoặc link Deploy nhé!";
        }
    }
}

// Tự động kích hoạt lấy bản tin ngay khi vừa truy cập Web App
document.addEventListener("DOMContentLoaded", getNewsData);