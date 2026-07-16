// File: sw.js
const CACHE_NAME = 'tram-hoc-tap-v1';

// Những file cực kỳ quan trọng bắt buộc phải có để chạy offline
const REQUIRED_ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

// Những file phụ (nếu lỗi 404 thì bỏ qua, không làm sập Service Worker)
const OPTIONAL_ASSETS = [
  './images/icon-192x192.png',
  './images/icon-512x512.png'
];

// 1. CÀI ĐẶT
self.addEventListener('install', function onInstall(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async function prefill(cache) {
      // Đầu tiên: Thử tải các file bắt buộc
      try {
        await cache.addAll(REQUIRED_ASSETS);
      } catch (err) {
        console.error('Lỗi cache các file bắt buộc:', err);
      }

      // Sau đó: Thử tải các file phụ từng cái một (lỗi file nào bỏ qua file đó)
      for (const asset of OPTIONAL_ASSETS) {
        try {
          await cache.add(asset);
        } catch (err) {
          console.warn(`Không thể cache file phụ (có thể do 404): ${asset}`, err);
        }
      }
    })
  );
});