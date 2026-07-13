// === Hệ thống kéo thả đa cấp: Long Press (>1s) mới cho phép di chuyển === //

let sortableInstances = [];
let isEditMode = false; 

document.addEventListener("DOMContentLoaded", () => {

    // CẤU HÌNH LONG PRESS CHUNG CHO CÁC CẤP
    const longPressConfig = {
        delay: 100,            //  Thời gian giữ: 100ms = 0.1 giây
        delayOnTouchOnly: false, // Bật tính năng này cho CẢ chuột trên PC và cảm ứng trên điện thoại
        touchStartThreshold: 5,  // Độ lệch pixel cho phép khi giữ (tránh việc rung tay bị hủy kích hoạt)
        animation: 250,
        ghostClass: 'sortable-ghost',
        disabled: true           // Mặc định ban đầu luôn khóa
    };

    // ==========================================
    // CẤP 1: KÉO THẢ CÁC PHẦN TỬ CHÍNH (work-mode <=> pet-mode)
    // ==========================================
    const mainWrapper = document.querySelector(".main-layout-wrapper");
    const mainStorageKey = "main_layout_modes_order";

    if (mainWrapper) {
        const saveMainOrder = () => {
            const modes = mainWrapper.children;
            const orderArray = Array.from(modes).map(el => el.getAttribute("id"));
            localStorage.setItem(mainStorageKey, JSON.stringify(orderArray));
        };

        const loadMainOrder = () => {
            const savedOrder = JSON.parse(localStorage.getItem(mainStorageKey));
            if (!savedOrder) return;

            const modeMap = {};
            Array.from(mainWrapper.children).forEach(el => {
                if (el.getAttribute("id")) modeMap[el.getAttribute("id")] = el;
            });

            savedOrder.forEach(id => {
                if (modeMap[id]) mainWrapper.appendChild(modeMap[id]);
            });
        };

        loadMainOrder();

        const mainSortable = new Sortable(mainWrapper, {
            ...longPressConfig, // Kế thừa cấu hình nhấn giữ 1s
            onEnd: saveMainOrder
        });

        sortableInstances.push(mainSortable);
    }

    // ==========================================
    // CẤP 2: KÉO THẢ CÁC LINK/ICON TRONG CÁC Ô LƯỚI
    // ==========================================
    const gridContainers = document.querySelectorAll(".link-grid-ui");
    gridContainers.forEach((container, groupIndex) => {
        const storageKey = `grid_order_group_${groupIndex}`;

        const saveOrder = () => {
            const items = container.querySelectorAll("li a");
            const orderArray = Array.from(items).map(a => a.getAttribute("href"));
            localStorage.setItem(storageKey, JSON.stringify(orderArray));
        };

        const loadOrder = () => {
            const savedOrder = JSON.parse(localStorage.getItem(storageKey));
            if (!savedOrder) return;

            const itemMap = {};
            const liItems = container.querySelectorAll("li");
            liItems.forEach(li => {
                const a = li.querySelector("a");
                if (a) itemMap[a.getAttribute("href")] = li;
            });

            savedOrder.forEach(href => {
                if (itemMap[href]) container.appendChild(itemMap[href]);
            });
        };

        loadOrder();

        const sortableInstance = new Sortable(container, {
            ...longPressConfig, // Áp dụng nhấn giữ 1s cho cả icon nhỏ nếu thích
            animation: 150,     // Ghi đè tốc độ animation cho mượt hơn với icon
            onEnd: saveOrder
        });

        sortableInstances.push(sortableInstance);
    });

    // ==========================================
    // CẤP 3: KÉO THẢ CÁC CÔNG CỤ LỚN (.pomodoro-timer)
    // ==========================================
    const widgetContainer = document.querySelector(".sortable-widgets-container") || document.querySelector(".show-then");
    const widgetStorageKey = "widgets_order_main";

    if (widgetContainer) {
        const saveWidgetOrder = () => {
            const widgets = widgetContainer.querySelectorAll(".pomodoro-timer");
            const orderArray = Array.from(widgets).map(widget => widget.getAttribute("id"));
            localStorage.setItem(widgetStorageKey, JSON.stringify(orderArray));
        };

        const loadWidgetOrder = () => {
            const savedOrder = JSON.parse(localStorage.getItem(widgetStorageKey));
            if (!savedOrder) return;

            const widgetMap = {};
            const widgets = widgetContainer.querySelectorAll(".pomodoro-timer");
            widgets.forEach(widget => {
                if (widget.getAttribute("id")) widgetMap[widget.getAttribute("id")] = widget;
            });

            savedOrder.forEach(id => {
                if (widgetMap[id]) widgetContainer.appendChild(widgetMap[id]);
            });
        };

        loadWidgetOrder();

        const widgetSortable = new Sortable(widgetContainer, {
            ...longPressConfig, // Kế thừa cấu hình nhấn giữ 1s
            draggable: '.pomodoro-timer', 
            onEnd: saveWidgetOrder
        });

        sortableInstances.push(widgetSortable);
    }

    // ==========================================
    // NÚT ĐIỀU KHIỂN CHUNG: BẬT / TẮT CHẾ ĐỘ SỬA BỐ CỤC
    // ==========================================
    const editBtn = document.getElementById("btn-edit-layout");
    if (editBtn) {
        editBtn.addEventListener("click", () => {
            isEditMode = !isEditMode; 

            // Kích hoạt hoặc Khóa toàn bộ các cấp độ kéo thả
            sortableInstances.forEach(instance => {
                instance.option("disabled", !isEditMode); 
            });

            if (isEditMode) {
                editBtn.innerHTML = "🔒 Sửa xong? Khóa bố cục";
                editBtn.style.background = "#48bb78"; 
                document.body.classList.add("is-editing"); 
            } else {
                editBtn.innerHTML = "🖋 Sửa bố cục";
                editBtn.style.background = ""; 
                document.body.classList.remove("is-editing");
            }
        });
    }
});