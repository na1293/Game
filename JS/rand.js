// Kho bài giữ nguyên của bro
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

let currentDeck = null; 
let isLocking = false; // Biến cờ bảo vệ tránh user click spam lúc đang animation

function rand() {
    if (isLocking) return;

    let inputEl = document.getElementById("player_num");
    let cardText = document.getElementById("card_text");
    let cardImg = document.getElementById("card_img");
    let num = parseInt(inputEl.value);

    if (isNaN(num) || num < 4 || num > 12) {
        alert("Chỉ hỗ trợ từ 4 đến 12 player");
        return;
    }

    if (currentDeck === null) {
        currentDeck = [...cardPresets[num]]; 
        inputEl.disabled = true; 
    }

    if (currentDeck.length === 0) {
        alert("Cả bàn đã bốc xong! Làm ván mới thì F5 lại trang nha bạn êi.");
        return;
    }

    // Bốc bài ngầm
    let randomIndex = Math.floor(Math.random() * currentDeck.length);
    let pickedCard = currentDeck[randomIndex];
    currentDeck.splice(randomIndex, 1); 

    // Kiểm tra ảnh tương ứng
    let imgName = "";
    if (pickedCard.includes("Tiên tri")) imgName = "img/1.webp";
    else if (pickedCard.includes("Sói")) imgName = "img/2.webp";
    else if (pickedCard.includes("hề")) imgName = "img/3.webp";
    else if (pickedCard.includes("Thợ săn")) imgName = "img/4.webp";
    else if (pickedCard.includes("Dân làng")) imgName = "img/5.webp";
    else if (pickedCard.includes("Bảo vệ")) imgName = "img/6.webp";
    else if (pickedCard.includes("tình yêu")) imgName = "img/7.webp";
    else if (pickedCard.includes("Phù thủy")) imgName = "img/8.webp";

    // Đổ data vào mặt trước (Lúc này card vẫn đang ẩn nên user chưa thấy gì đâu)
    cardText.innerHTML = pickedCard;
    if (imgName !== "") {
        cardImg.src = imgName; 
        cardImg.style.display = "block"; 
    } else {
        cardImg.style.display = "none";
    }

    // HIỆN OVERLAY (Lá bài úp xuất hiện giữa màn hình)
    document.getElementById("card_overlay").classList.add("active");
}

// HÀM XỬ LÝ KHI USER CLICK VÀO LÁ BÀI LỚN ĐỂ LẬT
function flipCard() {
    let cardInner = document.getElementById("card_inner");
    let overlay = document.getElementById("card_overlay");
    
    // Nếu bài đã lật rồi thì không cho click lật lại nữa
    if (cardInner.classList.contains("flipped") || isLocking) return;

    isLocking = true; // Khóa click bậy bạ
    cardInner.classList.add("flipped"); // Kích hoạt hiệu ứng lật xoay 180 độ CSS

    // Đợi lật bài xong (0.6s) rồi bắt đầu đếm ngược 5 giây giấu bài
    setTimeout(() => {
        let timeLeft = 3.5;
        let countdown = setInterval(() => {
            timeLeft--;
            if (timeLeft <= 0) {
                clearInterval(countdown);
                
                // Thu hồi overlay (ẩn đi)
                overlay.classList.remove("active");

                // Đợi overlay ẩn hẳn (0.4s) rồi mới reset trạng thái thẻ bài về mặt sau
                setTimeout(() => {
                    cardInner.classList.remove("flipped");
                    isLocking = false; // Mở khóa cho người tiếp theo bốc
                    console.log(`Bài còn lại: ${currentDeck.length} lá.`);
                }, 400);
            }
        }, 1000);
    }, 600);
}