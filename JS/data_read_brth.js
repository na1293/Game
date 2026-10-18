// === Chuyên phụ trách đọc và xuất data === //

// Sinh nhật
let export_data_brth = document.getElementById("export_data_brth");
let import_data_brth = document.getElementById("import_data_brth");

// Todo-list
let export_btn_todo = document.getElementById("export-btn-todo");
let import_btn_todo = document.getElementById("import-btn-todo");


// ==========================================
// THỦ THUẬT DÙNG CHUNG (TỐI ƯU CODE)
// ==========================================

// 1. Hàm Export dùng chung

/* 
storageKey: Tên ngăn chứa dữ liệu
defaultFileName: Tên
emptyAlertMessage: Mẫu tin nhắn
*/

function exportLocalStorage(storageKey, defaultFileName, emptyAlertMessage) {
    const localData = localStorage.getItem(storageKey);
    
    if (!localData || JSON.parse(localData).length === 0) {
        alert(emptyAlertMessage);
        return;
    }
    
    const formattedJson = JSON.stringify(JSON.parse(localData), null, 2);
    const blob = new Blob([formattedJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = defaultFileName;
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ==========================================
// 2. Hàm Import dùng chung (Đã bọc giáp bảo vệ)
// ==========================================
function importLocalStorage(storageKey, compareKeys = [], maxLimit = 20, validateFn = null) {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".json";

    fileInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const fileContent = e.target.result;
                let importedList = JSON.parse(fileContent);
                
                // 1. Kiểm tra có phải mảng không
                if (!Array.isArray(importedList)) {
                    return showPopup("Lỗi", "Cấu trúc file JSON phải là một danh sách hợp lệ!");
                }

                // 2. Validate cấu trúc từng phần tử bên trong (Nếu có truyền hàm check riêng)
                if (validateFn) {
                    for (let item of importedList) {
                        if (!validateFn(item)) {
                            return showPopup("Lỗi", "Phát hiện dữ liệu sai định dạng hoặc không hợp lệ trong file!");
                        }
                    }
                }

                let currentLocalData = localStorage.getItem(storageKey);
                let currentList = currentLocalData ? JSON.parse(currentLocalData) : [];

                // 3. Kiểm tra tổng số lượng sau khi gộp có vượt giới hạn maxLimit không
                let countAdded = 0;
                let tempMergedList = [...currentList];

                importedList.forEach(newItem => {
                    const isDuplicate = tempMergedList.some(oldItem => {
                        return compareKeys.every(key => oldItem[key] === newItem[key]);
                    });

                    if (!isDuplicate) {
                        tempMergedList.push(newItem);
                        countAdded++;
                    }
                });

                if (tempMergedList.length > maxLimit) {
                    return showPopup("Lỗi", `Danh sách sau khi nhập vượt quá giới hạn tối đa cho phép là ${maxLimit} mục!`);
                }

                if (countAdded > 0) {
                    localStorage.setItem(storageKey, JSON.stringify(tempMergedList));
                    showPopup("Thành công", "Nhập dữ liệu thành công!");
                    setTimeout(() => window.location.reload(), 1000);
                } else {
                    showPopup("Thông báo", "Dữ liệu bị trùng lặp hoặc không có gì mới để thêm.");
                }

            } catch (error) {
                showPopup("Lỗi", "Tệp tin JSON bị lỗi cú pháp hoặc không thể giải mã.");
            }
        };

        reader.readAsText(file);
    });

    fileInput.click();
}


// ==========================================
// GÁN SỰ KIỆN KÍCH HOẠT
// ==========================================

// --- MÔN SINH NHẬT ---

// --- MÔN SINH NHẬT ---
export_data_brth.addEventListener("click", () => {
    exportLocalStorage("myBirthdays", "birthdays_backup.json", "Không có dữ liệu sinh nhật");
});

import_data_brth.addEventListener("click", () => {
    // Truyền thêm hàm validate: bắt buộc có name (<=17 ký tự) và date
    importLocalStorage("myBirthdays", ["name", "date"], 15, (item) => {
        return item && typeof item === "object" && 
               typeof item.name === "string" && item.name.length <= 17 && 
               typeof item.date === "string";
    }); 
});

// --- TO-DO LIST ---
export_btn_todo.addEventListener("click", () => {
    exportLocalStorage("todos", "my_todos_backup.json", "To-do list trống");
});

import_btn_todo.addEventListener("click", () => {
    // Giả sử Todo giới hạn tối đa 50 task, check thuộc tính text
    importLocalStorage("todos", ["text"], 50, (item) => {
        return item && typeof item === "object" && 
               typeof item.text === "string" && 
               typeof item.completed === "boolean";
    }); 
});