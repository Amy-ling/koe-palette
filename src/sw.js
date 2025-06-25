// KoePalette Service Worker
const CACHE_NAME = 'koe-palette-v1';
const STATIC_CACHE_NAME = 'koe-palette-static-v1';
const DYNAMIC_CACHE_NAME = 'koe-palette-dynamic-v1';

// 需要快取的靜態資源
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/src/main.jsx',
  '/src/App.jsx',
  '/src/App.css',
  // 添加其他重要的靜態資源
];

// 需要快取的API端點
const API_CACHE_PATTERNS = [
  /^https:\/\/api\.github\.com\/repos\/.+\/contents\/data\/.+\.json$/,
  /^https:\/\/via\.placeholder\.com\/.+$/
];

// 安裝事件 - 快取靜態資源
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Static assets cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Failed to cache static assets', error);
      })
  );
});

// 啟動事件 - 清理舊快取
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME &&
                cacheName.startsWith('koe-palette-')) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated');
        return self.clients.claim();
      })
  );
});

// 攔截網路請求
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 跳過非GET請求
  if (request.method !== 'GET') {
    return;
  }

  // 跳過Chrome擴展請求
  if (url.protocol === 'chrome-extension:') {
    return;
  }

  // 處理導航請求（頁面請求）
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match('/')
        .then((response) => {
          return response || fetch(request);
        })
        .catch(() => {
          return caches.match('/');
        })
    );
    return;
  }

  // 處理靜態資源請求
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request)
        .then((response) => {
          if (response) {
            return response;
          }
          
          return fetch(request)
            .then((fetchResponse) => {
              // 快取新的靜態資源
              if (fetchResponse.status === 200) {
                const responseClone = fetchResponse.clone();
                caches.open(STATIC_CACHE_NAME)
                  .then((cache) => {
                    cache.put(request, responseClone);
                  });
              }
              return fetchResponse;
            });
        })
        .catch(() => {
          // 離線時返回快取的資源
          return caches.match('/');
        })
    );
    return;
  }

  // 處理API請求
  const isApiRequest = API_CACHE_PATTERNS.some(pattern => pattern.test(request.url));
  
  if (isApiRequest) {
    event.respondWith(
      // 網路優先策略
      fetch(request)
        .then((response) => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseClone);
              });
          }
          return response;
        })
        .catch(() => {
          // 網路失敗時返回快取
          return caches.match(request)
            .then((response) => {
              if (response) {
                return response;
              }
              // 如果沒有快取，返回離線頁面或錯誤
              throw new Error('No cached response available');
            });
        })
    );
    return;
  }

  // 處理圖片請求
  if (request.destination === 'image') {
    event.respondWith(
      caches.match(request)
        .then((response) => {
          if (response) {
            return response;
          }
          
          return fetch(request)
            .then((fetchResponse) => {
              if (fetchResponse.status === 200) {
                const responseClone = fetchResponse.clone();
                caches.open(DYNAMIC_CACHE_NAME)
                  .then((cache) => {
                    cache.put(request, responseClone);
                  });
              }
              return fetchResponse;
            })
            .catch(() => {
              // 返回預設圖片或佔位符
              return new Response(
                '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="#f0f0f0"/><text x="200" y="200" text-anchor="middle" fill="#999" font-family="Arial" font-size="16">画像が読み込めません</text></svg>',
                { headers: { 'Content-Type': 'image/svg+xml' } }
              );
            });
        })
    );
    return;
  }
});

// 後台同步（如果支援）
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // 執行後台同步任務
      syncData()
    );
  }
});

// 推送通知（如果需要）
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push received', event);
  
  const options = {
    body: event.data ? event.data.text() : 'KoePaletteからの通知',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: '開く',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: '閉じる',
        icon: '/icons/xmark.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('KoePalette', options)
  );
});

// 通知點擊處理
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification click', event);
  
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// 同步數據函數
async function syncData() {
  try {
    console.log('Service Worker: Syncing data...');
    // 這裡可以實現數據同步邏輯
    // 例如：上傳離線時的更改、下載最新數據等
  } catch (error) {
    console.error('Service Worker: Sync failed', error);
  }
}

// 快取管理
async function cleanupCaches() {
  const cacheNames = await caches.keys();
  const oldCaches = cacheNames.filter(name => 
    name.startsWith('koe-palette-') && 
    name !== STATIC_CACHE_NAME && 
    name !== DYNAMIC_CACHE_NAME
  );
  
  await Promise.all(oldCaches.map(name => caches.delete(name)));
}

// 定期清理快取
setInterval(cleanupCaches, 24 * 60 * 60 * 1000); // 每24小時清理一次

