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

// 2. Hàm Import dùng chung
function importLocalStorage(storageKey, compareKeys = []) {
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
                
                if (!Array.isArray(importedList)) {
                    throw new Error("Cấu trúc file JSON phải là một danh sách");
                }

                let currentLocalData = localStorage.getItem(storageKey);
                let currentList = currentLocalData ? JSON.parse(currentLocalData) : [];

                // Chỉ lấy tối đa 20 phần tử đầu tiên từ file import
                let slicedImportedList = importedList.slice(0, 20);
                let countAdded = 0;

                slicedImportedList.forEach(newItem => {
                    // Check trùng dựa trên các trường truyền vào (ví dụ: name, date hoặc text)
                    const isDuplicate = currentList.some(oldItem => {
                        return compareKeys.every(key => oldItem[key] === newItem[key]);
                    });

                    if (!isDuplicate) {
                        currentList.push(newItem);
                        countAdded++;
                    }
                });

                if (countAdded > 0) {
                    localStorage.setItem(storageKey, JSON.stringify(currentList));
                    alert(`Nhập thành công!`);
                    window.location.reload();
                } else {
                    alert("Lỗi trùng lặp dữ liệu hoặc không có gì mới để thêm.");
                }

            } catch (error) {
                alert("Vui lòng nhập đúng file hoặc thử lại file khác.");
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

export_data_brth.addEventListener("click", () => {
    exportLocalStorage("myBirthdays", "birthdays_backup.json", "Không có dữ liệu sinh nhật");
});

import_data_brth.addEventListener("click", () => {
    // Check trùng dựa trên cả 'name' và 'date'
    importLocalStorage("myBirthdays", ["name", "date"]); 
});

export_btn_todo.addEventListener("click", () => {
    exportLocalStorage("todos", "my_todos_backup.json", "To-do list trống");
});

import_btn_todo.addEventListener("click", () => {
    importLocalStorage("todos", ["text"]); 
});