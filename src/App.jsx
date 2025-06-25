import React, { useEffect } from 'react';
import { AppProvider } from './contexts/AppContext.jsx';
import Header from './components/Header.jsx';
import FilterBar from './components/FilterBar.jsx';
import MainContent from './components/MainContent.jsx';
import LoadingScreen from './components/LoadingScreen.jsx';
import ErrorScreen from './components/ErrorScreen.jsx';
import PWAInstallPrompt from './components/PWAInstallPrompt.jsx';
import OfflineIndicator from './components/OfflineIndicator.jsx';
import { useApp } from './contexts/AppContext.jsx';
import swManager from './services/serviceWorkerManager.js';
import './App.css';

function AppContent() {
  const { state, actions } = useApp();

  // PWA初始化
  useEffect(() => {
    const initializePWA = async () => {
      try {
        // 註冊Service Worker
        const registered = await swManager.register();
        if (registered) {
          console.log('PWA: Service Worker registered successfully');
          
          // 預快取重要資源
          await swManager.precacheImportantResources();
        }
      } catch (error) {
        console.error('PWA: Initialization failed', error);
      }
    };

    initializePWA();
  }, []);

  // 應援色設定效果
  useEffect(() => {
    if (state.settings.theme === 'dark' && state.settings.oshi_liver_id) {
      const liver = state.data.livers.find(l => l.id === state.settings.oshi_liver_id);
      if (liver) {
        document.documentElement.style.setProperty('--oshi-color', liver.oshi_color_code);
      }
    }
  }, [state.settings.oshi_liver_id, state.settings.theme, state.data.livers]);

  // 主題設定效果
  useEffect(() => {
    if (state.settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.settings.theme]);

  if (state.loading) {
    return <LoadingScreen />;
  }

  if (state.error) {
    return <ErrorScreen error={state.error} onRetry={actions.reloadData} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <FilterBar />
      <MainContent />
      
      {/* PWA組件 */}
      <PWAInstallPrompt />
      <OfflineIndicator />
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;

