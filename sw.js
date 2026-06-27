const CACHE_NAME = 'timesheet-v1';
const ASSETS = [
  './index.html',
  './manifest.json'
];

// ติดตั้ง SW และ cache ไฟล์
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// ลบ cache เก่าเมื่อ SW ใหม่ activate
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ดึงจาก cache ก่อน ถ้าไม่มีค่อยดึงจาก network
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => {
      return cached || fetch(e.request).then(res => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        return res;
      });
    }).catch(() => caches.match('./index.html'))
  );
});
