// --- XỬ LÝ TO-DO LIST ---
const todoInput = document.getElementById('todo-input');
const addTodoBtn = document.getElementById('add-todo-btn');
const todoList = document.getElementById('todo-list');

// Đảm bảo dùng đúng key "todos" như code import/export của ông
let todos = JSON.parse(localStorage.getItem('todos')) || [];

// 1. Hiển thị danh sách nhiệm vụ
function renderTodos() {
  if (!todoList) return;
  todoList.innerHTML = '';
  
  todos.forEach((todo, index) => {
    const li = document.createElement('li');
    li.style.cssText = `
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      padding: 8px 10px; 
      margin-bottom: 6px; 
      background: rgba(255, 255, 255, 0.1); 
      border-radius: 6px;
    `;

    const textSpan = document.createElement('span');
    textSpan.innerText = todo.text;
    textSpan.style.cursor = 'pointer';
    if (todo.completed) {
      textSpan.style.textDecoration = 'line-through';
      textSpan.style.opacity = '0.6';
    }

    // Click để gạch ngang / bỏ gạch
    textSpan.addEventListener('click', () => {
      todos[index].completed = !todos[index].completed;
      saveAndRender();
    });

    // Nút xóa
    const deleteBtn = document.createElement('button');
    deleteBtn.innerText = '❌';
    deleteBtn.style.cssText = 'background: transparent; border: none; cursor: pointer;';
    deleteBtn.addEventListener('click', () => {
      todos.splice(index, 1);
      saveAndRender();
    });

    li.appendChild(textSpan);
    li.appendChild(deleteBtn);
    todoList.appendChild(li);
  });
}

// 2. Lưu vào LocalStorage key "todos" & render lại
function saveAndRender() {
  localStorage.setItem('todos', JSON.stringify(todos));
  renderTodos();
}

// 3. Thêm nhiệm vụ mới
function addTodo() {
  const text = todoInput.value.trim();
  if (text) {
    todos.push({ text: text, completed: false });
    todoInput.value = '';
    saveAndRender();
  }
}

addTodoBtn?.addEventListener('click', addTodo);
todoInput?.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') addTodo();
});

// Chạy hiển thị ban đầu
renderTodos();