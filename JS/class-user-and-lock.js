// Khai báo mảng toàn cục để quản lý các thực thể Sortable
let sortableInstances = [];
let isEditMode = false; // Mặc định vừa vào app là CHƯA cho sửa (Khóa)

document.addEventListener("DOMContentLoaded", () => {
    // 1. Tìm tất cả các danh sách dạng lưới trong app
    const gridContainers = document.querySelectorAll(".link-grid-ui");
    const editBtn = document.getElementById("btn-edit-layout");

    gridContainers.forEach((container, groupIndex) => {
        // Tạo một key unique cho từng nhóm danh sách để lưu vào LocalStorage
        const storageKey = `grid_order_group_${groupIndex}`;

        // Hàm lưu thứ tự vào LocalStorage
        const saveOrder = () => {
            const items = container.querySelectorAll("li a");
            const orderArray = Array.from(items).map(a => a.getAttribute("href"));
            localStorage.setItem(storageKey, JSON.stringify(orderArray));
        };

        // Hàm load và sắp xếp lại vị trí khi mở app
        const loadOrder = () => {
            const savedOrder = JSON.parse(localStorage.getItem(storageKey));
            if (!savedOrder) return;

            const itemMap = {};
            const liItems = container.querySelectorAll("li");
            liItems.forEach(li => {
                const a = li.querySelector("a");
                if (a) {
                    itemMap[a.getAttribute("href")] = li;
                }
            });

            savedOrder.forEach(href => {
                if (itemMap[href]) {
                    container.appendChild(itemMap[href]);
                }
            });
        };

        // Bước A: Load vị trí cũ ngay khi vừa tải trang xong
        loadOrder();

        // Bước B: Kích hoạt Sortable và LƯU thực thể vào mảng sortableInstances
        const sortableInstance = new Sortable(container, {
            animation: 150,       
            ghostClass: 'sortable-ghost', 
            disabled: true, // 🌟 QUAN TRỌNG: Mặc định khóa kéo thả khi mới tải trang!
            onEnd: () => {
                saveOrder(); 
            }
        });

        // Đẩy thực thể vừa tạo vào mảng quản lý chung
        sortableInstances.push(sortableInstance);
    });

    // 2. XỬ LÝ SỰ KIỆN BẤM NÚT EDIT
    if (editBtn) {
        editBtn.addEventListener("click", () => {
            isEditMode = !isEditMode; // Đảo trạng thái (True <-> False)

            // Duyệt qua tất cả các thực thể để Bật/Tắt tính năng kéo thả
            sortableInstances.forEach(instance => {
                // Nếu đang edit (isEditMode = true) -> disabled = false (Mở khóa để kéo)
                // Nếu bấm Xong (isEditMode = false) -> disabled = true (Khóa lại không cho kéo)
                instance.option("disabled", !isEditMode); 
            });

            // Thay đổi giao diện nút bấm để báo hiệu cho user
            if (isEditMode) {
                editBtn.innerHTML = "✅ Xong";
                editBtn.style.background = "var(--success-gradient, #48bb78)"; 
                document.body.classList.add("is-editing"); 
            } else {
                editBtn.innerHTML = "⚙️ Sửa giao diện";
                editBtn.style.background = ""; 
                document.body.classList.remove("is-editing");
            }
        });
    }
});