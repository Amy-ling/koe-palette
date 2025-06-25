import React, { createContext, useContext, useReducer, useEffect } from 'react';
import dataService from '../services/dataService.js';
import localStorageService from '../services/localStorageService.js';

// 初始狀態
const initialState = {
  // 數據狀態
  loading: true,
  error: null,
  data: {
    livers: [],
    groups: [],
    voiceSeries: [],
    voiceProducts: []
  },
  
  // 篩選狀態
  filters: {
    branch: null,
    purchased_status: 'all',
    search_query: '',
    year: null,
    liver_id: null,
    group_id: null
  },
  
  // 視圖狀態
  viewMode: 'series', // 'series' | 'liver' | 'group' | 'year'
  filteredSeries: [],
  
  // 用戶數據
  purchasedProducts: new Set(),
  fileLinks: new Map(),
  customTags: new Map(),
  
  // 設定
  settings: {
    theme: 'light',
    oshi_liver_id: null,
    language: 'jp'
  }
};

// Action類型
const actionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_DATA: 'SET_DATA',
  SET_FILTERS: 'SET_FILTERS',
  SET_VIEW_MODE: 'SET_VIEW_MODE',
  SET_FILTERED_SERIES: 'SET_FILTERED_SERIES',
  SET_PURCHASED_PRODUCTS: 'SET_PURCHASED_PRODUCTS',
  SET_FILE_LINKS: 'SET_FILE_LINKS',
  SET_CUSTOM_TAGS: 'SET_CUSTOM_TAGS',
  SET_SETTINGS: 'SET_SETTINGS',
  TOGGLE_PURCHASED: 'TOGGLE_PURCHASED',
  SET_FILE_LINK: 'SET_FILE_LINK',
  SET_PRODUCT_TAGS: 'SET_PRODUCT_TAGS'
};

// Reducer
function appReducer(state, action) {
  switch (action.type) {
    case actionTypes.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case actionTypes.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    
    case actionTypes.SET_DATA:
      return { ...state, data: action.payload, loading: false, error: null };
    
    case actionTypes.SET_FILTERS:
      return { ...state, filters: { ...state.filters, ...action.payload } };
    
    case actionTypes.SET_VIEW_MODE:
      return { ...state, viewMode: action.payload };
    
    case actionTypes.SET_FILTERED_SERIES:
      return { ...state, filteredSeries: action.payload };
    
    case actionTypes.SET_PURCHASED_PRODUCTS:
      return { ...state, purchasedProducts: action.payload };
    
    case actionTypes.SET_FILE_LINKS:
      return { ...state, fileLinks: action.payload };
    
    case actionTypes.SET_CUSTOM_TAGS:
      return { ...state, customTags: action.payload };
    
    case actionTypes.SET_SETTINGS:
      return { ...state, settings: { ...state.settings, ...action.payload } };
    
    case actionTypes.TOGGLE_PURCHASED:
      const newPurchased = new Set(state.purchasedProducts);
      if (newPurchased.has(action.payload)) {
        newPurchased.delete(action.payload);
      } else {
        newPurchased.add(action.payload);
      }
      return { ...state, purchasedProducts: newPurchased };
    
    case actionTypes.SET_FILE_LINK:
      const newFileLinks = new Map(state.fileLinks);
      if (action.payload.filePath) {
        newFileLinks.set(action.payload.productId, action.payload.filePath);
      } else {
        newFileLinks.delete(action.payload.productId);
      }
      return { ...state, fileLinks: newFileLinks };
    
    case actionTypes.SET_PRODUCT_TAGS:
      const newTags = new Map(state.customTags);
      if (action.payload.tags.length > 0) {
        newTags.set(action.payload.productId, action.payload.tags);
      } else {
        newTags.delete(action.payload.productId);
      }
      return { ...state, customTags: newTags };
    
    default:
      return state;
  }
}

// Context
const AppContext = createContext();

// Provider組件
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // 初始化數據
  useEffect(() => {
    async function initializeApp() {
      try {
        dispatch({ type: actionTypes.SET_LOADING, payload: true });
        
        // 初始化IndexedDB
        await localStorageService.init();
        
        // 載入設定
        const settings = await localStorageService.getAllSettings();
        dispatch({ type: actionTypes.SET_SETTINGS, payload: settings });
        
        // 載入用戶數據
        const [purchasedProducts, customTags] = await Promise.all([
          localStorageService.getAllPurchased(),
          localStorageService.getAllTags()
        ]);
        
        dispatch({ type: actionTypes.SET_PURCHASED_PRODUCTS, payload: purchasedProducts });
        dispatch({ type: actionTypes.SET_CUSTOM_TAGS, payload: customTags });
        
        // 載入GitHub數據
        await dataService.initialize();
        dispatch({ type: actionTypes.SET_DATA, payload: dataService.data });
        
        // 初始篩選
        const filteredSeries = await dataService.filterSeries(state.filters);
        dispatch({ type: actionTypes.SET_FILTERED_SERIES, payload: filteredSeries });
        
      } catch (error) {
        console.error('App initialization failed:', error);
        dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
      }
    }

    initializeApp();
  }, []);

  // 篩選更新效果
  useEffect(() => {
    async function updateFiltered() {
      if (!state.loading && state.data.voiceSeries.length > 0) {
        try {
          const filteredSeries = await dataService.filterSeries(state.filters);
          dispatch({ type: actionTypes.SET_FILTERED_SERIES, payload: filteredSeries });
        } catch (error) {
          console.error('Filter update failed:', error);
        }
      }
    }

    updateFiltered();
  }, [state.filters, state.loading, state.data.voiceSeries.length]);

  // Action creators
  const actions = {
    setFilters: (filters) => {
      dispatch({ type: actionTypes.SET_FILTERS, payload: filters });
    },
    
    setViewMode: (mode) => {
      dispatch({ type: actionTypes.SET_VIEW_MODE, payload: mode });
    },
    
    togglePurchased: async (productId) => {
      const isPurchased = state.purchasedProducts.has(productId);
      await localStorageService.setPurchased(productId, !isPurchased);
      dispatch({ type: actionTypes.TOGGLE_PURCHASED, payload: productId });
    },
    
    setFileLink: async (productId, filePath) => {
      if (filePath) {
        await localStorageService.setFileLink(productId, filePath);
      } else {
        await localStorageService.removeFileLink(productId);
      }
      dispatch({ type: actionTypes.SET_FILE_LINK, payload: { productId, filePath } });
    },
    
    setProductTags: async (productId, tags) => {
      await localStorageService.setTags(productId, tags);
      dispatch({ type: actionTypes.SET_PRODUCT_TAGS, payload: { productId, tags } });
    },
    
    updateSettings: async (newSettings) => {
      for (const [key, value] of Object.entries(newSettings)) {
        await localStorageService.setSetting(key, value);
      }
      dispatch({ type: actionTypes.SET_SETTINGS, payload: newSettings });
    },
    
    reloadData: async () => {
      try {
        dispatch({ type: actionTypes.SET_LOADING, payload: true });
        await dataService.reloadData();
        dispatch({ type: actionTypes.SET_DATA, payload: dataService.data });
      } catch (error) {
        dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
      }
    }
  };

  return (
    <AppContext.Provider value={{ state, actions }}>
      {children}
    </AppContext.Provider>
  );
}

// Hook
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}

