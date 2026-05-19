// 1. Kho bài tiêu chuẩn siêu cân bằng từ 4-9 người
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
    let cardDiv = document.getElementById("card");
    let cardText = document.getElementById("card_text");
    let cardImg = document.getElementById("card_img");
    let num = parseInt(inputEl.value);

    // Bước 1: Check xem có nhập đúng số người quy định không
    if (isNaN(num) || num < 4 || num > 12) {
        alert("Chỉ hỗ trợ từ 4 đến 12 player");
        return;
    }

    // Bước 2: Nếu là lượt bấm đầu tiên (currentDeck chưa có bài), khởi tạo bộ bài dựa theo số người nhập
    if (currentDeck === null) {
        currentDeck = [...cardPresets[num]]; 
        inputEl.disabled = true; 
    }

    // Bước 3: Kiểm tra xem hết bài chưa
    if (currentDeck.length === 0) {
        cardText.innerHTML = "Hết bài rồi!";
        cardImg.style.display = "none"; // Ẩn ảnh đi khi hết bài
        alert("Cả bàn đã bốc xong! F5 lại trang để làm ván mới nha.");
        return;
    }

    // Bước 4: Thao tác bốc bài ngẫu nhiên và xóa khỏi mảng
    let randomIndex = Math.floor(Math.random() * currentDeck.length);
    let pickedCard = currentDeck[randomIndex];
    currentDeck.splice(randomIndex, 1); 

    // Bước 5: Logic kiểm tra tên quân bài để render đúng ảnh
    let imgName = "";
    
    if (pickedCard.includes("Tiên tri")) {
        imgName = "img/1.png";
    } else if (pickedCard.includes("Sói")) {
        imgName = "img/2.png";
    } else if (pickedCard.includes("hề")) {
        imgName = "img/3.png";
    } else if (pickedCard.includes("Thợ săn")) {
        imgName = "img/4.png";
    } else if (pickedCard.includes("Dân làng")) {
        imgName = "img/5.png";
    } else if (pickedCard.includes("Bảo vệ")) {
        imgName = "img/6.png";
    } else if (pickedCard.includes("tình yêu")) {
        imgName = "img/7.png";
    } else if (pickedCard.includes("Phù thủy")) {
        imgName = "img/8.png";
    }

    // Bước 6: Hiển thị text và ảnh lên giao diện
    cardText.innerHTML = pickedCard;
    
    if (imgName !== "") {
        // Nếu các file ảnh 1.png, 2.png nằm chung thư mục với masoi.html thì để nguyên đường dẫn này.
        // Nếu bạn để ảnh trong thư mục "images" thì sửa thành: `images/${imgName}`
        cardImg.src = imgName; 
        cardImg.style.display = "block"; // Hiện ảnh lên
    } else {
        cardImg.style.display = "none";
    }

    // Log nhẹ check xem còn bao nhiêu lá chưa bốc
    console.log(`Bài còn lại trong chồng: ${currentDeck.length} lá.`);
}