// Service Worker 註冊和管理
class ServiceWorkerManager {
  constructor() {
    this.registration = null;
    this.isOnline = navigator.onLine;
    this.updateAvailable = false;
    this.callbacks = {
      onUpdate: [],
      onOffline: [],
      onOnline: []
    };
  }

  // 註冊Service Worker
  async register() {
    if (!('serviceWorker' in navigator)) {
      console.log('Service Worker not supported');
      return false;
    }

    try {
      console.log('Registering Service Worker...');
      
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('Service Worker registered:', this.registration);

      // 監聽更新
      this.registration.addEventListener('updatefound', () => {
        console.log('Service Worker update found');
        this.handleUpdate();
      });

      // 檢查是否有等待中的Service Worker
      if (this.registration.waiting) {
        this.updateAvailable = true;
        this.notifyCallbacks('onUpdate');
      }

      // 監聽控制器變更
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('Service Worker controller changed');
        window.location.reload();
      });

      return true;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return false;
    }
  }

  // 處理更新
  handleUpdate() {
    const newWorker = this.registration.installing;
    
    newWorker.addEventListener('statechange', () => {
      if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
        console.log('New Service Worker installed');
        this.updateAvailable = true;
        this.notifyCallbacks('onUpdate');
      }
    });
  }

  // 應用更新
  async applyUpdate() {
    if (!this.registration || !this.registration.waiting) {
      return false;
    }

    try {
      // 告訴等待中的Service Worker跳過等待
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      return true;
    } catch (error) {
      console.error('Failed to apply update:', error);
      return false;
    }
  }

  // 監聽網路狀態
  setupNetworkListeners() {
    const handleOnline = () => {
      console.log('Network: Online');
      this.isOnline = true;
      this.notifyCallbacks('onOnline');
    };

    const handleOffline = () => {
      console.log('Network: Offline');
      this.isOnline = false;
      this.notifyCallbacks('onOffline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }

  // 註冊回調函數
  on(event, callback) {
    if (this.callbacks[event]) {
      this.callbacks[event].push(callback);
    }
  }

  // 移除回調函數
  off(event, callback) {
    if (this.callbacks[event]) {
      const index = this.callbacks[event].indexOf(callback);
      if (index > -1) {
        this.callbacks[event].splice(index, 1);
      }
    }
  }

  // 通知回調函數
  notifyCallbacks(event) {
    if (this.callbacks[event]) {
      this.callbacks[event].forEach(callback => callback());
    }
  }

  // 檢查更新
  async checkForUpdates() {
    if (!this.registration) return false;

    try {
      await this.registration.update();
      return true;
    } catch (error) {
      console.error('Failed to check for updates:', error);
      return false;
    }
  }

  // 獲取快取大小
  async getCacheSize() {
    if (!('caches' in window)) return 0;

    try {
      const cacheNames = await caches.keys();
      let totalSize = 0;

      for (const cacheName of cacheNames) {
        if (cacheName.startsWith('koe-palette-')) {
          const cache = await caches.open(cacheName);
          const requests = await cache.keys();
          
          for (const request of requests) {
            const response = await cache.match(request);
            if (response) {
              const blob = await response.blob();
              totalSize += blob.size;
            }
          }
        }
      }

      return totalSize;
    } catch (error) {
      console.error('Failed to calculate cache size:', error);
      return 0;
    }
  }

  // 清除快取
  async clearCache() {
    if (!('caches' in window)) return false;

    try {
      const cacheNames = await caches.keys();
      const koepaletteCaches = cacheNames.filter(name => 
        name.startsWith('koe-palette-')
      );

      await Promise.all(
        koepaletteCaches.map(cacheName => caches.delete(cacheName))
      );

      console.log('Cache cleared');
      return true;
    } catch (error) {
      console.error('Failed to clear cache:', error);
      return false;
    }
  }

  // 預快取重要資源
  async precacheImportantResources() {
    if (!('caches' in window)) return false;

    try {
      const cache = await caches.open('koe-palette-static-v1');
      const importantResources = [
        '/',
        '/manifest.json'
      ];

      await cache.addAll(importantResources);
      console.log('Important resources precached');
      return true;
    } catch (error) {
      console.error('Failed to precache resources:', error);
      return false;
    }
  }
}

// 建立全域實例
const swManager = new ServiceWorkerManager();

export default swManager;

