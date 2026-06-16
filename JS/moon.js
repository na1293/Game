function moondate() {
    // 1. Lấy ngày dương lịch hiện tại của hệ thống
    let today = new Date(); 
    
    // 2. Ném vào thư viện để nó tự tính (Chạy đến vô tận năm, không bao giờ hết hạn)
    let solar = Solar.fromDate(today);
    let lunar = Lunar.fromSolar(solar);

    // 3. Bốc đầu kết quả ra xài luôn, không tính toán gì cho mệt đầu!
    let ngayAm = lunar.getDay();      // Ví dụ: 2
    let thangAm = lunar.getMonth();  // Ví dụ: 5
    let namAm = lunar.getYear();      // Ví dụ: 2026
    
    // In ra chuỗi đẹp đẽ
    let chuoiLichAm = `🌙 Âm lịch: Ngày ${ngayAm}/${thangAm}/${namAm}`;
    console.log(chuoiLichAm);

    let lunarDisplay = document.getElementById('lunar-display-moondate');
    let lunarDisplayMonth = document.getElementById('lunar-display-moondate-month');
    let lunarDisplayYear = document.getElementById('lunar-display-moondate-year');

    lunarDisplay.textContent = `Ngày ${ngayAm}`;
    lunarDisplayMonth.textContent = `Tháng ${thangAm}`;
    lunarDisplayYear.textContent = `Năm ${namAm}`;
}

// Chạy thử luôn khi tải trang
moondate();