// 1. Kho bài tiêu chuẩn siêu cân bằng từ 4-12 người
const cardPresets = {
    4: ["Sói", "Tiên tri", "Phù thủy", "Dân làng"],
    5: ["Sói", "Tiên tri", "Phù thủy", "Dân làng 1", "Dân làng 2"],
    6: ["Sói", "Tiên tri", "Phù thủy", "Bảo vệ", "Dân làng 1", "Dân làng 2"],
    7: ["Sói 1", "Sói 2", "Tiên tri", "Phù thủy", "Bảo vệ", "Dân làng 1", "Dân làng 2"],
    8: ["Sói 1", "Sói 2", "Tiên tri", "Phù thủy", "Bảo vệ", "Thợ săn", "Dân làng 1", "Dân làng 2"],
    9: ["Sói 1", "Sói 2", "Tiên tri", "Phù thủy", "Bảo vệ", "Thợ săn", "Dân làng 1", "Dân làng 2", "Dân làng 3"],
    10: ["Sói 1", "Sói 2", "Tiên tri", "Phù thủy", "Bảo vệ", "Thợ săn", "Dân làng 1", "Dân làng 2", "Dân làng 3", "Tên hề"],
    11: ["Sói 1", "Sói 2", "Tiên tri", "Phù thủy", "Bảo vệ", "Thợ săn", "Dân làng 1", "Dân làng 2", "Dân làng 3", "Tên hề", "Thần tình yêu"],
    12: ["Sói 1", "Sói 2", "Tiên tri", "Phù thủy", "Bảo vệ", "Thợ săn", "Dân làng 1", "Dân làng 2", "Dân làng 3", "Tên hề", "Thần tình yêu", "Sói 3"]
};

// Biến toàn cục để lưu bộ bài đang chơi của ván hiện tại
let currentDeck = null; 

function rand() {
    let inputEl = document.getElementById("player_num");
    let cardText = document.getElementById("card_text");
    let cardImg = document.getElementById("card_img");
    let btn = document.getElementById("draw_btn"); // Lấy thêm nút bấm để tí xử lý ẩn/hiện
    let num = parseInt(inputEl.value);

    // Bước 1: Check xem có nhập đúng số người quy định không
    if (isNaN(num) || num < 4 || num > 12) {
        alert("Chỉ hỗ trợ từ 4 đến 12 player");
        return;
    }

    // Bước 2: Khởi tạo bộ bài nếu là lượt đầu tiên
    if (currentDeck === null) {
        currentDeck = [...cardPresets[num]]; 
        inputEl.disabled = true; 
    }

    // Bước 3: Kiểm tra xem hết bài chưa
    if (currentDeck.length === 0) {
        cardText.innerHTML = "Hết bài rồi!";
        cardImg.style.display = "none"; 
        alert("Cả bàn đã bốc xong! F5 lại trang để làm ván mới nha.");
        return;
    }

    // Vô hiệu hóa nút bấm tạm thời để không cho spam trong lúc đang xem bài
    btn.disabled = true;

    // Bước 4: Thao tác bốc bài ngẫu nhiên và xóa khỏi mảng
    let randomIndex = Math.floor(Math.random() * currentDeck.length);
    let pickedCard = currentDeck[randomIndex];
    currentDeck.splice(randomIndex, 1); 

    // Bước 5: Logic kiểm tra tên quân bài để render đúng ảnh
    let imgName = "";
    if (pickedCard.includes("Tiên tri")) imgName = "img/1.png";
    else if (pickedCard.includes("Sói")) imgName = "img/2.png";
    else if (pickedCard.includes("hề")) imgName = "img/3.png";
    else if (pickedCard.includes("Thợ săn")) imgName = "img/4.png";
    else if (pickedCard.includes("Dân làng")) imgName = "img/5.png";
    else if (pickedCard.includes("Bảo vệ")) imgName = "img/6.png";
    else if (pickedCard.includes("tình yêu")) imgName = "img/7.png";
    else if (pickedCard.includes("Phù thủy")) imgName = "img/8.png";

    // Bước 6: Hiển thị text và ảnh lên giao diện
    cardText.innerHTML = pickedCard;
    if (imgName !== "") {
        cardImg.src = imgName; 
        cardImg.style.display = "block"; 
    } else {
        cardImg.style.display = "none";
    }

    // ⏱️ Bước 7: Cơ chế đếm ngược 5 giây rồi ẩn bài
    let timeLeft = 5;
    btn.innerHTML = `Đang xem bài (${timeLeft}s)`;

    let countdown = setInterval(() => {
        timeLeft--;
        if (timeLeft > 0) {
            btn.innerHTML = `Đang xem bài (${timeLeft}s)`;
        } else {
            clearInterval(countdown);
            
            // Hết 5 giây: Giấu bài đi, reset giao diện thẻ bài về ban đầu
            cardText.innerHTML = "Chưa bốc bài";
            cardImg.style.display = "none";
            cardImg.src = ""; // Xóa source ảnh cũ đi cho chắc

            // Mở khóa lại nút bấm để người tiếp theo vào bốc
            btn.disabled = false;
            btn.innerHTML = "Nhận thẻ ngẫu nhiên";
        }
    }, 1000);

    console.log(`Bài còn lại trong chồng: ${currentDeck.length} lá.`);
}