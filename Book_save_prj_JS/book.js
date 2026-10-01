let readersData = JSON.parse(localStorage.getItem('readers_book_data')) || [];
let fileHandle = null; // Lưu handle của file để ghi đè trực tiếp mà không tải lại

// --- 1. THÊM SÁCH VÀO HỒ SƠ ---
function addBookRecord() {
    const readerInput = document.getElementById('reader-name').value.trim();
    const titleInput = document.getElementById('book-title').value.trim();
    const pagesInput = parseInt(document.getElementById('book-pages').value);

    if (!readerInput || !titleInput || isNaN(pagesInput) || pagesInput <= 0) {
        if (typeof showPopup === "function") {
            showPopup("Thông báo", "Vui lòng điền đầy đủ và chính xác thông tin!");
        }
        return;
    }

    let reader = readersData.find(r => r.readerName.toLowerCase() === readerInput.toLowerCase());

    if (!reader) {
        reader = {
            id: Date.now().toString(),
            readerName: readerInput,
            books: []
        };
        readersData.push(reader);
    }

    reader.books.push({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 4),
        title: titleInput,
        pages: pagesInput
    });

    saveToLocal();
    updateFilterOptions();
    renderData();

    document.getElementById('book-title').value = '';
    document.getElementById('book-pages').value = '';

    if (typeof showPopup === "function") {
        showPopup("Thành công", "Đã thêm sách vào hồ sơ người đọc!");
    }
}

// --- 2. LƯU VÀO LOCALSTORAGE ---
function saveToLocal() {
    localStorage.setItem('readers_book_data', JSON.stringify(readersData));
}

// --- 3. SELECT DROPDOWN ---
function updateFilterOptions() {
    const select = document.getElementById('reader-filter-select');
    const currentValue = select.value;
    
    select.innerHTML = '<option value="ALL">Hiện tất cả hồ sơ</option>';

    readersData.forEach(reader => {
        const option = document.createElement('option');
        option.value = reader.id;
        option.textContent = "Hồ sơ: " + reader.readerName;
        select.appendChild(option);
    });

    if (readersData.some(r => r.id === currentValue)) {
        select.value = currentValue;
    } else {
        select.value = "ALL";
    }
}

// --- 4. HIỂN THỊ DỮ LIỆU ---
function renderData() {
    const selectedReaderId = document.getElementById('reader-filter-select').value;
    const container = document.getElementById('reader-list-container');
    container.innerHTML = '';

    let filteredReaders = readersData;
    if (selectedReaderId !== "ALL") {
        filteredReaders = readersData.filter(r => r.id === selectedReaderId);
    }

    if (filteredReaders.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 15px;">Chưa có dữ liệu hồ sơ.</p>';
    } else {
        filteredReaders.forEach(reader => {
            const readerCard = document.createElement('div');
            readerCard.className = 'can-le';
            readerCard.style.marginBottom = '15px';

            let booksHTML = '';
            if (reader.books.length === 0) {
                booksHTML = '<p style="font-size: 0.85rem; color: var(--text-muted);">Chưa có sách trong hồ sơ.</p>';
            } else {
                booksHTML = reader.books.map(book => `
                    <li class="book-item">
                        <div class="book-info">
                            <strong>Tên sách: ${book.title}</strong> 
                            <span style="font-size: 0.85rem; color: var(--text-muted);">(${book.pages} trang)</span>
                        </div>
                        <div class="book-actions">
                            <button onclick="editBook('${reader.id}', '${book.id}')" class="btn-edit-item">Edit</button>
                            <button onclick="deleteBook('${reader.id}', '${book.id}')" class="del-btn-todo">Xóa</button>
                        </div>
                    </li>
                `).join('');
            }

            readerCard.innerHTML = `
                <div class="reader-card-header">
                    <h3 style="font-size: 1.1rem; color: #2b6cb0;">Hồ sơ: <span class="highlight">${reader.readerName}</span></h3>
                    <button onclick="deleteReader('${reader.id}')" class="del-btn-todo">Xóa Hồ Sơ</button>
                </div>
                <ul style="list-style: none; padding-left: 0;">
                    ${booksHTML}
                </ul>
            `;

            container.appendChild(readerCard);
        });
    }

    // Tự động cuộn mượt xuống khu vực hiển thị danh sách hồ sơ
    container.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// --- 5. CHỈNH SỬA & XÓA SÁCH (SỬ DỤNG POP-UP VÀ CONFIRM) ---
function editBook(readerId, bookId) {
    const reader = readersData.find(r => r.id === readerId);
    if (!reader) return;

    const book = reader.books.find(b => b.id === bookId);
    if (!book) return;

    const options = ["Sửa tên sách", "Sửa số trang"];
    
    if (typeof showDropdownPrompt === "function") {
        showDropdownPrompt("Chỉnh sửa thông tin", options, function(choice) {
            if (choice === "Sửa tên sách") {
                showTextPrompt("Đổi tên sách", "Nhập tên sách mới...", function(newTitle) {
                    if (newTitle && newTitle.trim() !== "") {
                        book.title = newTitle.trim();
                        saveToLocal();
                        renderData();
                        if (typeof showPopup === "function") showPopup("Thành công", "Đã cập nhật tên sách!");
                    }
                });
            } else if (choice === "Sửa số trang") {
                showTextPrompt("Sửa số trang", "Nhập số trang mới...", function(newPages) {
                    const pagesNum = parseInt(newPages);
                    if (!isNaN(pagesNum) && pagesNum > 0) {
                        book.pages = pagesNum;
                        saveToLocal();
                        renderData();
                        if (typeof showPopup === "function") showPopup("Thành công", "Đã cập nhật số trang!");
                    } else if (newPages) {
                        if (typeof showPopup === "function") showPopup("Lỗi", "Số trang phải là con số hợp lệ!");
                    }
                });
            }
        });
    }
}

// Xóa sách với bước hỏi xác nhận bằng confirm
function deleteBook(readerId, bookId) {
    const isConfirmed = confirm("Bạn có chắc chắn muốn xóa cuốn sách này không?");
    if (!isConfirmed) return;

    const reader = readersData.find(r => r.id === readerId);
    if (!reader) return;

    reader.books = reader.books.filter(b => b.id !== bookId);
    saveToLocal();
    renderData();
    if (typeof showPopup === "function") showPopup("Thông báo", "Đã xóa sách khỏi hồ sơ!");
}

// Xóa hồ sơ với bước hỏi xác nhận bằng confirm
function deleteReader(readerId) {
    const isConfirmed = confirm("Cảnh báo: Hành động này sẽ xóa toàn bộ hồ sơ và danh sách sách của người đọc này. Bạn có chắc không?");
    if (!isConfirmed) return;

    readersData = readersData.filter(r => r.id !== readerId);
    saveToLocal();
    updateFilterOptions();
    renderData();
    if (typeof showPopup === "function") showPopup("Thông báo", "Đã xóa hồ sơ người đọc!");
}

// --- 6. GHI ĐÈ TRỰC TIẾP LÊN FILE THỰC TẾ ---
async function saveOverFile() {
    const dataStr = JSON.stringify(readersData, null, 2);

    if ('showSaveFilePicker' in window) {
        try {
            if (!fileHandle) {
                fileHandle = await window.showSaveFilePicker({
                    suggestedName: 'danh_sach_doc_sach.json',
                    types: [{
                        description: 'JSON File',
                        accept: { 'application/json': ['.json'] },
                    }],
                });
            }
            
            const writable = await fileHandle.createWritable();
            await writable.write(dataStr);
            await writable.close();

            if (typeof showPopup === "function") {
                showPopup("Thành công", "Đã ghi đè trực tiếp dữ liệu lên file!");
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                exportJSON();
            }
        }
    } else {
        exportJSON();
    }
}

// Tải file xuống theo cách truyền thống
function exportJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(readersData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "danh_sach_doc_sach.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}

// Nhập dữ liệu từ file JSON
async function importJSON(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            if (Array.isArray(importedData)) {
                readersData = importedData;
                saveToLocal();
                updateFilterOptions();
                renderData();
                if (typeof showPopup === "function") showPopup("Thành công", "Đã nhập dữ liệu từ file JSON!");
            } else {
                if (typeof showPopup === "function") showPopup("Lỗi", "Cấu trúc file JSON không hợp lệ!");
            }
        } catch (err) {
            if (typeof showPopup === "function") showPopup("Lỗi", "Không thể đọc file JSON!");
        }
    };
    reader.readAsText(file);
}

// Khởi chạy ứng dụng
document.addEventListener('DOMContentLoaded', function() {
    updateFilterOptions();
    renderData();
});