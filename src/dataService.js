// 數據處理和篩選服務
import githubService from './githubService.js';
import localStorageService from './localStorageService.js';

class DataService {
  constructor() {
    this.data = {
      livers: [],
      groups: [],
      voiceSeries: [],
      voiceProducts: []
    };
    this.liverMap = new Map();
    this.groupMap = new Map();
    this.seriesMap = new Map();
    this.productMap = new Map();
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      // 載入GitHub數據
      const data = await githubService.getAllData();
      this.data = data;

      // 建立快速查詢映射
      this.buildMaps();
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize data service:', error);
      throw error;
    }
  }

  buildMaps() {
    // 建立Liver映射
    this.liverMap.clear();
    this.data.livers.forEach(liver => {
      this.liverMap.set(liver.id, liver);
    });

    // 建立Group映射
    this.groupMap.clear();
    this.data.groups.forEach(group => {
      this.groupMap.set(group.id, group);
    });

    // 建立Series映射
    this.seriesMap.clear();
    this.data.voiceSeries.forEach(series => {
      this.seriesMap.set(series.series_id, series);
    });

    // 建立Product映射
    this.productMap.clear();
    this.data.voiceProducts.forEach(product => {
      this.productMap.set(product.product_id, product);
    });
  }

  // 獲取系列的所有參與Liver
  getSeriesLivers(seriesId) {
    const series = this.seriesMap.get(seriesId);
    if (!series) return [];

    const liverIds = new Set(series.liver_ids);
    
    // 添加組合中的Liver
    series.group_ids.forEach(groupId => {
      const group = this.groupMap.get(groupId);
      if (group) {
        group.liver_ids.forEach(liverId => liverIds.add(liverId));
      }
    });

    return Array.from(liverIds).map(id => this.liverMap.get(id)).filter(Boolean);
  }

  // 獲取系列的所有產品
  getSeriesProducts(seriesId) {
    return this.data.voiceProducts.filter(product => product.series_id === seriesId);
  }

  // 獲取Liver的所有系列
  getLiverSeries(liverId) {
    const series = this.data.voiceSeries.filter(s => {
      // 直接包含該Liver
      if (s.liver_ids.includes(liverId)) return true;
      
      // 通過組合包含該Liver
      return s.group_ids.some(groupId => {
        const group = this.groupMap.get(groupId);
        return group && group.liver_ids.includes(liverId);
      });
    });

    return series;
  }

  // 篩選和搜尋
  async filterSeries(options = {}) {
    await this.initialize();
    
    let filtered = [...this.data.voiceSeries];

    // 分支篩選
    if (options.branch) {
      filtered = filtered.filter(series => {
        const livers = this.getSeriesLivers(series.series_id);
        return livers.some(liver => liver.branch === options.branch);
      });
    }

    // 年份篩選
    if (options.year) {
      filtered = filtered.filter(series => {
        const year = new Date(series.initial_release_date).getFullYear();
        return year === options.year;
      });
    }

    // Liver篩選
    if (options.liver_id) {
      filtered = filtered.filter(series => {
        const livers = this.getSeriesLivers(series.series_id);
        return livers.some(liver => liver.id === options.liver_id);
      });
    }

    // 組合篩選
    if (options.group_id) {
      filtered = filtered.filter(series => 
        series.group_ids.includes(options.group_id)
      );
    }

    // 購買狀態篩選
    if (options.purchased_status && options.purchased_status !== 'all') {
      const purchasedProducts = await localStorageService.getAllPurchased();
      
      filtered = filtered.filter(series => {
        const products = this.getSeriesProducts(series.series_id);
        const hasPurchased = products.some(product => 
          purchasedProducts.has(product.product_id)
        );
        
        return options.purchased_status === 'purchased' ? hasPurchased : !hasPurchased;
      });
    }

    // 搜尋篩選
    if (options.search_query) {
      const query = options.search_query.toLowerCase();
      const allTags = await localStorageService.getAllTags();
      
      filtered = filtered.filter(series => {
        // 搜尋系列標題
        if (series.title.toLowerCase().includes(query)) return true;
        
        // 搜尋參與Liver名稱
        const livers = this.getSeriesLivers(series.series_id);
        if (livers.some(liver => 
          liver.name.jp.toLowerCase().includes(query) ||
          liver.name.en.toLowerCase().includes(query)
        )) return true;
        
        // 搜尋組合名稱
        if (series.group_ids.some(groupId => {
          const group = this.groupMap.get(groupId);
          return group && group.name.toLowerCase().includes(query);
        })) return true;
        
        // 搜尋自定義標籤
        const products = this.getSeriesProducts(series.series_id);
        return products.some(product => {
          const tags = allTags.get(product.product_id) || [];
          return tags.some(tag => tag.toLowerCase().includes(query));
        });
      });
    }

    return filtered;
  }

  // 獲取所有年份
  getAllYears() {
    const years = new Set();
    this.data.voiceSeries.forEach(series => {
      const year = new Date(series.initial_release_date).getFullYear();
      years.add(year);
    });
    return Array.from(years).sort((a, b) => b - a);
  }

  // 獲取所有分支
  getAllBranches() {
    const branches = new Set();
    this.data.livers.forEach(liver => {
      branches.add(liver.branch);
    });
    return Array.from(branches);
  }

  // 檔案匹配功能
  async matchFilesByHash(files) {
    const matches = [];
    const unmatched = [];

    for (const file of files) {
      try {
        const hash = await localStorageService.calculateFileHash(file);
        const matchedProduct = this.data.voiceProducts.find(
          product => product.file_hash_sha256 === hash
        );

        if (matchedProduct) {
          matches.push({
            file,
            product: matchedProduct,
            confidence: 'high'
          });
        } else {
          unmatched.push(file);
        }
      } catch (error) {
        console.error('Error calculating hash for file:', file.name, error);
        unmatched.push(file);
      }
    }

    return { matches, unmatched };
  }

  // 檔名模糊匹配
  matchFilesByName(files) {
    const matches = [];
    const unmatched = [];

    files.forEach(file => {
      const fileName = file.name.toLowerCase();
      const suggestions = [];

      // 搜尋包含Liver名稱的產品
      this.data.livers.forEach(liver => {
        const jpName = liver.name.jp.toLowerCase();
        const enName = liver.name.en.toLowerCase();
        
        if (fileName.includes(jpName) || fileName.includes(enName)) {
          const liverProducts = this.data.voiceProducts.filter(
            product => product.liver_id === liver.id
          );
          suggestions.push(...liverProducts);
        }
      });

      if (suggestions.length > 0) {
        matches.push({
          file,
          suggestions: suggestions.slice(0, 5), // 最多5個建議
          confidence: 'medium'
        });
      } else {
        unmatched.push(file);
      }
    });

    return { matches, unmatched };
  }

  // 重新載入數據
  async reloadData() {
    githubService.clearCache();
    this.initialized = false;
    await this.initialize();
  }
}

export default new DataService();

