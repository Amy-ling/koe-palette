// 數據模型定義
export interface Liver {
  id: string;
  name: {
    en: string;
    jp: string;
  };
  branch: 'JP' | 'EN' | 'KR';
  oshi_color_code: string;
}

export interface Group {
  id: string;
  name: string;
  liver_ids: string[];
}

export interface VoiceSeries {
  series_id: string;
  title: string;
  liver_ids: string[];
  group_ids: string[];
  initial_release_date: string;
  rerelease_dates: string[];
  cover_image_url: string;
}

export interface VoiceProduct {
  product_id: string;
  series_id: string;
  liver_id: string;
  title: string;
  type: 'Regular' | 'EX';
  language: 'JP' | 'EN' | 'KR';
  file_hash_sha256: string | null;
}

// 本地存儲的用戶數據
export interface UserData {
  purchased_products: Set<string>; // product_id 集合
  file_links: Map<string, string>; // product_id -> 本地檔案路徑
  custom_tags: Map<string, string[]>; // product_id -> 標籤陣列
  settings: {
    theme: 'light' | 'dark';
    oshi_liver_id: string | null;
    language: 'jp' | 'en';
  };
}

// 篩選和搜尋參數
export interface FilterOptions {
  branch?: 'JP' | 'EN' | 'KR';
  purchased_status?: 'all' | 'purchased' | 'not_purchased';
  search_query?: string;
  year?: number;
  liver_id?: string;
  group_id?: string;
}

// 視圖模式
export type ViewMode = 'series' | 'liver' | 'group' | 'year';

