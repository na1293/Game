let readersData = JSON.parse(localStorage.getItem('readers_book_data')) || [];
let fileHandle = null; // Lưu handle của file để ghi đè trực tiếp mà không tải lại

// === BỘ LỌC BLACKLIST (Kiểm tra các mẫu mã độc/ký tự không hợp lệ) ===
function isBlacklisted(data) {
    const blacklistPatterns = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>|javascript:|on\w+\s*=/i;
    
    if (typeof data === 'string') {
        return blacklistPatterns.test(data);
    }
    if (Array.isArray(data)) {
        return data.some(item => isBlacklisted(item));
    }
    if (data !== null && typeof data === 'object') {
        return Object.values(data).some(val => isBlacklisted(val));
    }
    return false;
}

// --- 2. LƯU VÀO LOCALSTORAGE (Chặn nếu dính blacklist) ---
function saveToLocal() {
    if (isBlacklisted(readersData)) {
        if (typeof showPopup === "function") {
            showPopup("Lỗi", "Dữ liệu có rủi do");
        }
        return false;
    }
    localStorage.setItem('readers_book_data', JSON.stringify(readersData));
    return true;
}

// --- 1. THÊM SÁCH VÀO HỒ SƠ (Giới hạn: 5 hồ sơ, 3 sách/hồ sơ, tên <= 18 ký tự, trang <= 4 ký tự) ---
function addBookRecord() {
    const readerInput = document.getElementById('reader-name').value.trim();
    const titleInput = document.getElementById('book-title').value.trim();
    const pagesRaw = document.getElementById('book-pages').value.trim();
    const pagesInput = parseInt(pagesRaw);

    // Validate cơ bản
    if (!readerInput || !titleInput || isNaN(pagesInput) || pagesInput <= 0) {
        if (typeof showPopup === "function") {
            showPopup("Thông báo", "Vui lòng điền đầy đủ và chính xác thông tin!");
        }
        return;
    }

    // Giới hạn ký tự tên hồ sơ, tên sách (tối đa n ký tự) và số trang (tối đa 4 ký tự, VD: 9999)
    const n = 40;
    if (readerInput.length > n || titleInput.length > n) {
        if (typeof showPopup === "function") {
            showPopup("Lỗi", "Tên hồ sơ hoặc tên sách không được vượt quá " + n + " ký tự!");
        }
        return;
    }

    if (pagesRaw.length > 4 || pagesInput > 9999) {
        if (typeof showPopup === "function") {
            showPopup("Lỗi", "Số trang tối đa chỉ được 4 ký tự (tối đa 9999 trang)!");
        }
        return;
    }

    // Kiểm tra đầu vào có nằm trong blacklist không
    if (isBlacklisted(readerInput) || isBlacklisted(titleInput)) {
        if (typeof showPopup === "function") {
            showPopup("Lỗi", "Chỉ nhập chữ hoặc số");
        }
        return;
    }

    let reader = readersData.find(r => r.readerName.toLowerCase() === readerInput.toLowerCase());

    // Kiểm tra giới hạn tối đa 5 hồ sơ
    if (!reader) {
        if (readersData.length >= 5) {
            if (typeof showPopup === "function") {
                showPopup("Lỗi", "Danh sách đã đạt giới hạn tối đa 5 hồ sơ!");
            }
            return;
        }

        reader = {
            id: Date.now().toString(),
            readerName: readerInput,
            books: []
        };
        readersData.push(reader);
    }

    // Kiểm tra giới hạn tối đa 3 sách cho mỗi hồ sơ
    if (reader.books.length >= 3) {
        if (typeof showPopup === "function") {
            showPopup("Lỗi", "Mỗi hồ sơ chỉ được tối đa 3 cuốn sách thôi nhé!");
        }
        return;
    }

    reader.books.push({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 4),
        title: titleInput,
        pages: pagesInput
    });

    // Lưu vào Local
    if (!saveToLocal()) {
        readersData.pop(); 
        return;
    }

    updateFilterOptions();
    renderData();

    document.getElementById('book-title').value = '';
    document.getElementById('book-pages').value = '';

    if (typeof showPopup === "function") {
        showPopup("Thành công", "Đã thêm sách vào hồ sơ người đọc!");
    }
}

// --- 3. SELECT DROPDOWN (Đã an toàn) ---
function updateFilterOptions() {
    const select = document.getElementById('reader-filter-select');
    const currentValue = select.value;
    
    select.innerHTML = '<option value="ALL">Hiện tất cả hồ sơ</option>';

    readersData.forEach(reader => {
        const option = document.createElement('option');
        option.value = reader.id;
        option.textContent = "Hồ sơ: " + reader.readerName; // An toàn tuyệt đối chống XSS
        select.appendChild(option);
    });

    if (readersData.some(r => r.id === currentValue)) {
        select.value = currentValue;
    } else {
        select.value = "ALL";
    }
}

// --- 4. HIỂN THỊ DỮ LIỆU (ĐÃ FIX XSS: Chuyển hoàn toàn sang DOM Creation) ---
function renderData() {
    const selectedReaderId = document.getElementById('reader-filter-select').value;
    const container = document.getElementById('reader-list-container');
    container.innerHTML = '';

    let filteredReaders = readersData;
    if (selectedReaderId !== "ALL") {
        filteredReaders = readersData.filter(r => r.id === selectedReaderId);
    }

    if (filteredReaders.length === 0) {
        const p = document.createElement('p');
        p.style.cssText = "text-align: center; color: var(--text-muted); padding: 15px;";
        p.textContent = "Chưa có dữ liệu hồ sơ.";
        container.appendChild(p);
    } else {
        filteredReaders.forEach(reader => {
            const readerCard = document.createElement('div');
            readerCard.className = 'can-le';
            readerCard.style.marginBottom = '15px';

            // --- Header của Card ---
            const headerDiv = document.createElement('div');
            headerDiv.className = 'reader-card-header';

            const h3 = document.createElement('h3');
            h3.style.cssText = "font-size: 1.1rem; color: #2b6cb0;";
            
            const textNode = document.createTextNode("Hồ sơ: ");
            const spanHighlight = document.createElement('span');
            spanHighlight.className = 'highlight';
            spanHighlight.textContent = reader.readerName; // Chống XSS

            h3.appendChild(textNode);
            h3.appendChild(spanHighlight);

            const deleteReaderBtn = document.createElement('button');
            deleteReaderBtn.className = 'del-btn-todo';
            deleteReaderBtn.textContent = "Xóa Hồ Sơ";
            deleteReaderBtn.onclick = () => deleteReader(reader.id);

            headerDiv.appendChild(h3);
            headerDiv.appendChild(deleteReaderBtn);

            // --- Danh sách sách ---
            const ul = document.createElement('ul');
            ul.style.cssText = "list-style: none; padding-left: 0;";

            if (!reader.books || reader.books.length === 0) {
                const pEmpty = document.createElement('p');
                pEmpty.style.cssText = "font-size: 0.85rem; color: var(--text-muted);";
                pEmpty.textContent = "Chưa có sách trong hồ sơ.";
                ul.appendChild(pEmpty);
            } else {
                reader.books.forEach(book => {
                    const li = document.createElement('li');
                    li.className = 'book-item';

                    const bookInfoDiv = document.createElement('div');
                    bookInfoDiv.className = 'book-info';

                    const strongTitle = document.createElement('strong');
                    strongTitle.textContent = "Tên sách: " + book.title; // Chống XSS

                    const spanPages = document.createElement('span');
                    spanPages.style.cssText = "font-size: 0.85rem; color: var(--text-muted); margin-left: 5px;";
                    spanPages.textContent = `(${book.pages} trang)`; // Chống XSS

                    bookInfoDiv.appendChild(strongTitle);
                    bookInfoDiv.appendChild(spanPages);

                    const bookActionsDiv = document.createElement('div');
                    bookActionsDiv.className = 'book-actions';

                    const editBtn = document.createElement('button');
                    editBtn.className = 'btn-edit-item';
                    editBtn.textContent = "Edit";
                    editBtn.onclick = () => editBook(reader.id, book.id);

                    const deleteBookBtn = document.createElement('button');
                    deleteBookBtn.className = 'del-btn-todo';
                    deleteBookBtn.textContent = "Xóa";
                    deleteBookBtn.onclick = () => deleteBook(reader.id, book.id);

                    bookActionsDiv.appendChild(editBtn);
                    bookActionsDiv.appendChild(deleteBookBtn);

                    li.appendChild(bookInfoDiv);
                    li.appendChild(bookActionsDiv);
                    ul.appendChild(li);
                });
            }

            readerCard.appendChild(headerDiv);
            readerCard.appendChild(ul);
            container.appendChild(readerCard);
        });
    }

    container.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// --- 5. CHỈNH SỬA & XÓA SÁCH (Giới hạn tên sách <= 18, trang <= 4 ký tự) ---
function editBook(readerId, bookId) {
    const reader = readersData.find(r => r.id === readerId);
    if (!reader) return;

    const book = reader.books.find(b => b.id === bookId);
    if (!book) return;

    const options = ["Sửa tên sách", "Sửa số trang"];
    
    if (typeof showDropdownPrompt === "function") {
        showDropdownPrompt("Chỉnh sửa thông tin", options, function(choice) {
            if (choice === "Sửa tên sách") {
                showTextPrompt("Đổi tên sách", "Nhập tên sách mới (tối đa 18 ký tự)...", function(newTitle) {
                    if (newTitle && newTitle.trim() !== "") {
                        const trimmedTitle = newTitle.trim();
                        if (trimmedTitle.length > 18) {
                            if (typeof showPopup === "function") showPopup("Lỗi", "Tên sách không được vượt quá số ký tự cho phép!");
                            return;
                        }
                        if (isBlacklisted(trimmedTitle)) {
                            if (typeof showPopup === "function") showPopup("Lỗi", "Dữ liệu có rủi do!");
                            return;
                        }
                        book.title = trimmedTitle;
                        saveToLocal();
                        renderData();
                        if (typeof showPopup === "function") showPopup("Thành công", "Đã cập nhật tên sách!");
                    }
                });
            } else if (choice === "Sửa số trang") {
                showTextPrompt("Sửa số trang", "Nhập số trang mới (tối đa 4 ký tự, VD: 9999)...", function(newPages) {
                    const pagesRaw = newPages ? newPages.trim() : "";
                    const pagesNum = parseInt(pagesRaw);
                    if (!isNaN(pagesNum) && pagesNum > 0 && pagesNum <= 9999 && pagesRaw.length <= 4) {
                        book.pages = pagesNum;
                        saveToLocal();
                        renderData();
                        if (typeof showPopup === "function") showPopup("Thành công", "Đã cập nhật số trang!");
                    } else {
                        if (typeof showPopup === "function") showPopup("Lỗi", "Số trang phải từ 1 đến 9999 và tối đa 4 ký tự!");
                    }
                });
            }
        });
    }
}

// Xóa sách
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

// Xóa hồ sơ
function deleteReader(readerId) {
    const isConfirmed = confirm("Cảnh báo: Hành động này sẽ xóa toàn bộ hồ sơ và danh sách sách của người đọc này. Bạn có chắc không?");
    if (!isConfirmed) return;

    readersData = readersData.filter(r => r.id !== readerId);
    saveToLocal();
    updateFilterOptions();
    renderData();
    if (typeof showPopup === "function") showPopup("Thông báo", "Đã xóa hồ sơ người đọc!");
}

// --- 6. GHI ĐÈ TRỰC TIẾP & IMPORT FILE (Kiểm định nghiêm ngặt theo giới hạn mới) ---
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

function exportJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(readersData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "danh_sach_doc_sach.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}

// Nhập dữ liệu từ file JSON (Kiểm tra Blacklist + Giới hạn 5 hồ sơ, 3 sách, tên <= 18, trang <= 9999)
async function importJSON(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            
            if (!Array.isArray(importedData)) {
                return showPopup("Lỗi", "Không khả dụng");
            }

            // Kiểm tra Blacklist trên toàn bộ file import
            if (isBlacklisted(importedData)) {
                return showPopup("Cảnh báo", "Không thể nhập");
            }
            
            // Giới hạn tối đa 5 hồ sơ
            if (importedData.length > 5) {
                return showPopup("Lỗi", "Tệp tin vượt quá giới hạn tối đa 5 hồ sơ!");
            }

            // Kiểm định chi tiết cấu trúc từng hồ sơ và từng cuốn sách bên trong file
            for (let r of importedData) {
                if (!r || typeof r !== "object" || 
                    typeof r.id !== "string" || 
                    typeof r.readerName !== "string" || r.readerName.length > 40 || 
                    !Array.isArray(r.books)) {
                    return showPopup("Lỗi", "Phát hiện cấu trúc hồ sơ sai lệch hoặc tên hồ sơ quá dài (> 40 ký tự)!");
                }

                if (r.books.length > 3) {
                    return showPopup("Lỗi", "Một hồ sơ chứa quá giới hạn 3 cuốn sách!");
                }

                for (let b of r.books) {
                    if (!b || typeof b !== "object" || 
                        typeof b.id !== "string" || 
                        typeof b.title !== "string" || b.title.length > 40 || 
                        typeof b.pages !== "number" || isNaN(b.pages) || b.pages <= 0 || b.pages > 9999) {
                        return showPopup("Lỗi", "Phát hiện thông tin sách sai cấu trúc, tên sách > 18 ký tự hoặc số trang vượt quá 9999!");
                    }
                }
            }

            readersData = importedData;
            saveToLocal();
            updateFilterOptions();
            renderData();
            if (typeof showPopup === "function") showPopup("Thành công", "Đã nhập dữ liệu từ file JSON thành công!");
        } catch (err) {
            if (typeof showPopup === "function") showPopup("Lỗi", "Lỗi định dạng");
        }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset input file
}

// Khởi chạy ứng dụng
document.addEventListener('DOMContentLoaded', function() {
    updateFilterOptions();
    renderData();
});