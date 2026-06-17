// === Chuyên phụ trách đọc và xuất data === //

let export_data_brth = document.getElementById("export_data_brth");
let import_data_brth = document.getElementById("import_data_brth");

// === 1. XỬ LÝ EXPORT (TẢI FILE .JSON VỀ MÁY) ===
export_data_brth.addEventListener("click", () => {
    const localData = localStorage.getItem("myBirthdays");
    
    if (!localData || JSON.parse(localData).length === 0) {
        alert("Chưa có dữ liệu sinh nhật nào để xuất file hết á! 😗");
        return;
    }
    
    // Tạo một Blob chứa dữ liệu JSON (định dạng đẹp với thụt lề 2 dấu cách)
    const formattedJson = JSON.stringify(JSON.parse(localData), null, 2);
    const blob = new Blob([formattedJson], { type: "application/json" });
    
    // Tạo link ảo để download file
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "my_birthdays_backup.json"; // Tên file khi tải về
    
    // Kích hoạt click ẩn để tải xuống và dọn dẹp bộ nhớ
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

// === 2. XỬ LÝ IMPORT (BẤM CHỌN FILE .JSON TỪ MÁY) ===
import_data_brth.addEventListener("click", () => {
    // Tạo một thẻ input file "vô hình" để mở cửa sổ chọn file
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".json"; // Chỉ cho phép chọn file .json nha ba

    // Lắng nghe sự kiện khi user đã chọn file xong
    fileInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (!file) return; // User không chọn gì mà tắt đi

        const reader = new FileReader();
        
        // Khi đọc file hoàn tất thì xử lý logic dữ liệu
        reader.onload = (e) => {
            try {
                const fileContent = e.target.result;
                let importedList = JSON.parse(fileContent);
                
                // Kiểm tra định dạng mảng (Array)
                if (!Array.isArray(importedList)) {
                    throw new Error("Cấu trúc file JSON phải là một danh sách");
                }

                // Lấy data cũ từ Local
                let currentLocalData = localStorage.getItem("myBirthdays");
                let currentList = currentLocalData ? JSON.parse(currentLocalData) : [];

                // Chỉ lấy tối đa 20 phần tử đầu tiên từ file import đúng yêu cầu
                let slicedImportedList = importedList.slice(0, 20);

                let countAdded = 0;

                // Kiểm tra trùng khớp
                slicedImportedList.forEach(newItem => {
                    const isDuplicate = currentList.some(
                        oldItem => oldItem.name === newItem.name && oldItem.date === newItem.date
                    );

                    if (!isDuplicate) {
                        currentList.push(newItem);
                        countAdded++;
                    }
                });

                // Cập nhật lại LocalStorage
                if (countAdded > 0) {
                    localStorage.setItem("myBirthdays", JSON.stringify(currentList));
                    alert(`Nhập thành công!`);
                    window.location.reload();
                } else {
                    alert("Lỗi trùng lặp file. Có vẻ bạn đã tải file tương tự.");
                }

            } catch (error) {
                alert("Vui lòng nhập đúng file hoặc thử lại file khác.");
            }
        };

        // Kích hoạt đọc file dưới dạng text
        reader.readAsText(file);
    });

    // Kích hoạt click để mở hộp thoại chọn file của hệ điều hành
    fileInput.click();
});