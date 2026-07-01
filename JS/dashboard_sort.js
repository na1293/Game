document.addEventListener("DOMContentLoaded", () => {
    // 1. Tìm tất cả các danh sách dạng lưới trong app của bạn
    const gridContainers = document.querySelectorAll(".link-grid-ui");

    gridContainers.forEach((container, groupIndex) => {
        // Tạo một key unique cho từng nhóm danh sách để lưu vào LocalStorage
        const storageKey = `grid_order_group_${groupIndex}`;

        // Hàm lưu thứ tự vào LocalStorage
        const saveOrder = () => {
            // Lấy ra tất cả id hoặc href của các item hiện tại để làm dấu nhận biết thứ tự
            const items = container.querySelectorAll("li a");
            const orderArray = Array.from(items).map(a => a.getAttribute("href"));
            localStorage.setItem(storageKey, JSON.stringify(orderArray));
        };

        // Hàm load và sắp xếp lại vị trí khi mở app
        const loadOrder = () => {
            const savedOrder = JSON.parse(localStorage.getItem(storageKey));
            if (!savedOrder) return; // Nếu chưa có dữ liệu lưu thì giữ nguyên mặc định

            // Tạo một map để gom các phần tử <li> hiện tại theo href của thẻ <a> bên trong
            const itemMap = {};
            const liItems = container.querySelectorAll("li");
            liItems.forEach(li => {
                const a = li.querySelector("a");
                if (a) {
                    itemMap[a.getAttribute("href")] = li;
                }
            });

            // Sắp xếp lại DOM dựa theo mảng thứ tự đã lưu
            savedOrder.forEach(href => {
                if (itemMap[href]) {
                    container.appendChild(itemMap[href]);
                }
            });
        };

        // Bước A: Load vị trí cũ ngay khi vừa tải trang xong
        loadOrder();

        // Bước B: Kích hoạt tính năng kéo thả Sortable cho lưới
        new Sortable(container, {
            animation: 150,       // Hiệu ứng di chuyển mượt mà (150ms)
            ghostClass: 'sortable-ghost', // Class CSS khi phần tử đang được kéo (để làm mờ/đổi màu)
            
            // Sự kiện kích hoạt ngay khi user thả tay ra (kéo xong)
            onEnd: () => {
                saveOrder(); // Tự động lưu thứ tự mới vào LocalStorage
            }
        });
    });
});