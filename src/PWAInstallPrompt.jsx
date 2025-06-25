import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Download, X } from 'lucide-react';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // 檢查是否已經安裝
    const checkInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches || 
          window.navigator.standalone === true) {
        setIsInstalled(true);
        return;
      }
    };

    checkInstalled();

    // 監聽安裝提示事件
    const handleBeforeInstallPrompt = (e) => {
      console.log('PWA: Install prompt available');
      e.preventDefault();
      setDeferredPrompt(e);
      
      // 延遲顯示提示，讓用戶先體驗應用
      setTimeout(() => {
        if (!isInstalled) {
          setShowPrompt(true);
        }
      }, 30000); // 30秒後顯示
    };

    // 監聽安裝完成事件
    const handleAppInstalled = () => {
      console.log('PWA: App installed');
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isInstalled]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      // 顯示安裝提示
      deferredPrompt.prompt();
      
      // 等待用戶選擇
      const { outcome } = await deferredPrompt.userChoice;
      
      console.log('PWA: User choice:', outcome);
      
      if (outcome === 'accepted') {
        console.log('PWA: User accepted install');
      } else {
        console.log('PWA: User dismissed install');
      }
      
      setDeferredPrompt(null);
      setShowPrompt(false);
    } catch (error) {
      console.error('PWA: Install failed', error);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // 24小時後再次顯示
    setTimeout(() => {
      if (!isInstalled && deferredPrompt) {
        setShowPrompt(true);
      }
    }, 24 * 60 * 60 * 1000);
  };

  // 如果已安裝或沒有提示，不顯示
  if (isInstalled || !showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="pwa-install-prompt">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
            <Download className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">KoePaletteをインストール</h3>
            <p className="text-xs text-muted-foreground">
              ホーム画面に追加して、より快適にご利用いただけます
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDismiss}
            className="h-8"
          >
            <X className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            onClick={handleInstall}
            className="h-8 oshi-bg"
          >
            <Download className="w-4 h-4 mr-1" />
            インストール
          </Button>
        </div>
      </div>
    </div>
  );
}

