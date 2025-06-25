import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import swManager from '../services/serviceWorkerManager.js';

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    // 設定網路狀態監聽器
    const cleanup = swManager.setupNetworkListeners();

    // 註冊回調函數
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineMessage(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineMessage(true);
      // 5秒後隱藏離線訊息
      setTimeout(() => setShowOfflineMessage(false), 5000);
    };

    const handleUpdate = () => {
      setUpdateAvailable(true);
    };

    swManager.on('onOnline', handleOnline);
    swManager.on('onOffline', handleOffline);
    swManager.on('onUpdate', handleUpdate);

    return () => {
      cleanup();
      swManager.off('onOnline', handleOnline);
      swManager.off('onOffline', handleOffline);
      swManager.off('onUpdate', handleUpdate);
    };
  }, []);

  const handleUpdate = async () => {
    const success = await swManager.applyUpdate();
    if (success) {
      setUpdateAvailable(false);
    }
  };

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <>
      {/* 離線指示器 */}
      {!isOnline && (
        <div className="offline-indicator">
          <WifiOff className="w-4 h-4 mr-1" />
          オフライン
        </div>
      )}

      {/* 離線訊息 */}
      {showOfflineMessage && (
        <div className="fixed top-20 left-4 right-4 bg-yellow-500 text-white p-3 rounded-lg shadow-lg z-50 flex items-center justify-between">
          <div className="flex items-center">
            <WifiOff className="w-5 h-5 mr-2" />
            <div>
              <p className="font-medium text-sm">オフラインモード</p>
              <p className="text-xs opacity-90">
                キャッシュされたデータを表示しています
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRetry}
            className="text-white hover:bg-white/20"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* 更新可用通知 */}
      {updateAvailable && (
        <div className="fixed top-20 left-4 right-4 bg-blue-500 text-white p-3 rounded-lg shadow-lg z-50 flex items-center justify-between">
          <div className="flex items-center">
            <RefreshCw className="w-5 h-5 mr-2" />
            <div>
              <p className="font-medium text-sm">アップデート利用可能</p>
              <p className="text-xs opacity-90">
                新しいバージョンが利用できます
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleUpdate}
            className="text-white hover:bg-white/20"
          >
            更新
          </Button>
        </div>
      )}

      {/* 網路狀態恢復通知 */}
      {isOnline && showOfflineMessage === false && (
        <div className="fixed top-20 left-4 right-4 bg-green-500 text-white p-3 rounded-lg shadow-lg z-50 flex items-center animate-in slide-in-from-top duration-300">
          <Wifi className="w-5 h-5 mr-2" />
          <div>
            <p className="font-medium text-sm">オンラインに復帰</p>
            <p className="text-xs opacity-90">
              インターネット接続が復旧しました
            </p>
          </div>
        </div>
      )}
    </>
  );
}

