// GitHub API 服務
import { mockData } from '../data/mockData.js';

class GitHubDataService {
  constructor() {
    this.baseUrl = 'https://api.github.com';
    this.owner = import.meta.env.REACT_APP_GITHUB_OWNER || '';
    this.repo = import.meta.env.REACT_APP_GITHUB_REPO || '';
    this.token = import.meta.env.REACT_APP_GITHUB_TOKEN || '';
    this.devMode = import.meta.env.REACT_APP_DEV_MODE === 'true' || !this.token;
    this.cache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5分鐘快取
  }

  async fetchFromGitHub(path) {
    // 開發模式使用測試數據
    if (this.devMode) {
      console.log('Using mock data for development');
      await new Promise(resolve => setTimeout(resolve, 500)); // 模擬網路延遲
      
      switch (path) {
        case 'data/livers.json':
          return mockData.livers;
        case 'data/groups.json':
          return mockData.groups;
        case 'data/voice_series.json':
          return mockData.voiceSeries;
        case 'data/voice_products.json':
          return mockData.voiceProducts;
        default:
          throw new Error(`Unknown mock data path: ${path}`);
      }
    }

    const cacheKey = path;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/repos/${this.owner}/${this.repo}/contents/${path}`,
        {
          headers: {
            'Authorization': `token ${this.token}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const data = await response.json();
      const content = JSON.parse(atob(data.content));
      
      this.cache.set(cacheKey, {
        data: content,
        timestamp: Date.now()
      });

      return content;
    } catch (error) {
      console.error(`Error fetching ${path}:`, error);
      // 如果有快取數據，即使過期也返回
      if (cached) {
        return cached.data;
      }
      throw error;
    }
  }

  async getLivers() {
    return await this.fetchFromGitHub('data/livers.json');
  }

  async getGroups() {
    return await this.fetchFromGitHub('data/groups.json');
  }

  async getVoiceSeries() {
    return await this.fetchFromGitHub('data/voice_series.json');
  }

  async getVoiceProducts() {
    return await this.fetchFromGitHub('data/voice_products.json');
  }

  async getAllData() {
    try {
      const [livers, groups, voiceSeries, voiceProducts] = await Promise.all([
        this.getLivers(),
        this.getGroups(),
        this.getVoiceSeries(),
        this.getVoiceProducts()
      ]);

      return {
        livers,
        groups,
        voiceSeries,
        voiceProducts
      };
    } catch (error) {
      console.error('Error loading data:', error);
      throw error;
    }
  }

  clearCache() {
    this.cache.clear();
  }
}

export default new GitHubDataService();

