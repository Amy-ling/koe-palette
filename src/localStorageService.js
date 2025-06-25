// IndexedDB 本地存儲服務
class LocalStorageService {
  constructor() {
    this.dbName = 'KoePaletteDB';
    this.version = 1;
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // 購買狀態存儲
        if (!db.objectStoreNames.contains('purchased')) {
          db.createObjectStore('purchased', { keyPath: 'product_id' });
        }

        // 檔案連結存儲
        if (!db.objectStoreNames.contains('file_links')) {
          db.createObjectStore('file_links', { keyPath: 'product_id' });
        }

        // 自定義標籤存儲
        if (!db.objectStoreNames.contains('tags')) {
          db.createObjectStore('tags', { keyPath: 'product_id' });
        }

        // 設定存儲
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      };
    });
  }

  async ensureDB() {
    if (!this.db) {
      await this.init();
    }
  }

  // 購買狀態管理
  async setPurchased(productId, purchased = true) {
    await this.ensureDB();
    const transaction = this.db.transaction(['purchased'], 'readwrite');
    const store = transaction.objectStore('purchased');
    
    if (purchased) {
      await store.put({ product_id: productId, purchased: true });
    } else {
      await store.delete(productId);
    }
  }

  async isPurchased(productId) {
    await this.ensureDB();
    const transaction = this.db.transaction(['purchased'], 'readonly');
    const store = transaction.objectStore('purchased');
    const result = await store.get(productId);
    return !!result;
  }

  async getAllPurchased() {
    await this.ensureDB();
    const transaction = this.db.transaction(['purchased'], 'readonly');
    const store = transaction.objectStore('purchased');
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        const result = request.result;
        resolve(new Set(result.map(item => item.product_id)));
      };
      request.onerror = () => reject(request.error);
    });
  }

  // 檔案連結管理
  async setFileLink(productId, filePath) {
    await this.ensureDB();
    const transaction = this.db.transaction(['file_links'], 'readwrite');
    const store = transaction.objectStore('file_links');
    await store.put({ product_id: productId, file_path: filePath });
  }

  async getFileLink(productId) {
    await this.ensureDB();
    const transaction = this.db.transaction(['file_links'], 'readonly');
    const store = transaction.objectStore('file_links');
    const result = await store.get(productId);
    return result?.file_path || null;
  }

  async removeFileLink(productId) {
    await this.ensureDB();
    const transaction = this.db.transaction(['file_links'], 'readwrite');
    const store = transaction.objectStore('file_links');
    await store.delete(productId);
  }

  // 標籤管理
  async setTags(productId, tags) {
    await this.ensureDB();
    const transaction = this.db.transaction(['tags'], 'readwrite');
    const store = transaction.objectStore('tags');
    await store.put({ product_id: productId, tags: tags });
  }

  async getTags(productId) {
    await this.ensureDB();
    const transaction = this.db.transaction(['tags'], 'readonly');
    const store = transaction.objectStore('tags');
    const result = await store.get(productId);
    return result?.tags || [];
  }

  async getAllTags() {
    await this.ensureDB();
    const transaction = this.db.transaction(['tags'], 'readonly');
    const store = transaction.objectStore('tags');
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        const result = request.result;
        const tagMap = new Map();
        result.forEach(item => {
          tagMap.set(item.product_id, item.tags);
        });
        resolve(tagMap);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // 設定管理
  async setSetting(key, value) {
    await this.ensureDB();
    const transaction = this.db.transaction(['settings'], 'readwrite');
    const store = transaction.objectStore('settings');
    await store.put({ key, value });
  }

  async getSetting(key, defaultValue = null) {
    await this.ensureDB();
    const transaction = this.db.transaction(['settings'], 'readonly');
    const store = transaction.objectStore('settings');
    const result = await store.get(key);
    return result?.value ?? defaultValue;
  }

  async getAllSettings() {
    await this.ensureDB();
    const transaction = this.db.transaction(['settings'], 'readonly');
    const store = transaction.objectStore('settings');
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        const result = request.result;
        const settings = {};
        result.forEach(item => {
          settings[item.key] = item.value;
        });
        resolve(settings);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // 檔案Hash計算（用於自動匹配）
  async calculateFileHash(file) {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // 清除所有數據
  async clearAllData() {
    await this.ensureDB();
    const storeNames = ['purchased', 'file_links', 'tags', 'settings'];
    const transaction = this.db.transaction(storeNames, 'readwrite');
    
    await Promise.all(storeNames.map(storeName => {
      const store = transaction.objectStore(storeName);
      return store.clear();
    }));
  }
}

export default new LocalStorageService();

