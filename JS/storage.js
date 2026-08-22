// Tự động lấy tên repo từ URL (ví dụ: /game-nuoi-pet/ -> prefix: "game-nuoi-pet")
const REPO_PREFIX = window.location.pathname.split('/')[1] || 'global';

const myStorage = {
  setItem: (key, val) => localStorage.setItem(`${REPO_PREFIX}_${key}`, JSON.stringify(val)),
  getItem: (key) => {
    const d = localStorage.getItem(`${REPO_PREFIX}_${key}`);
    return d ? JSON.parse(d) : null;
  }
};