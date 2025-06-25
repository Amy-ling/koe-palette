import React, { useState } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { 
  Moon, 
  Sun, 
  Settings, 
  Search,
  Palette,
  RefreshCw
} from 'lucide-react';
import { useApp } from '../contexts/AppContext.jsx';
import SettingsDialog from './SettingsDialog.jsx';

export default function Header() {
  const { state, actions } = useApp();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(state.filters.search_query || '');

  const handleThemeToggle = () => {
    const newTheme = state.settings.theme === 'light' ? 'dark' : 'light';
    actions.updateSettings({ theme: newTheme });
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    actions.setFilters({ search_query: query });
  };

  const handleRefresh = () => {
    actions.reloadData();
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo和標題 */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                <Palette className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">KoePalette</h1>
                <p className="text-sm text-muted-foreground">
                  {state.settings.language === 'jp' ? 'こえパレット' : 'Voice Collection Manager'}
                </p>
              </div>
            </div>

            {/* 搜尋框 */}
            <div className="flex-1 max-w-md mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={state.settings.language === 'jp' ? '音聲、Liver、タグで検索...' : 'Search voices, livers, tags...'}
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-10"
                />
              </div>
            </div>

            {/* 操作按鈕 */}
            <div className="flex items-center space-x-2">
              {/* 重新載入按鈕 */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRefresh}
                disabled={state.loading}
                title={state.settings.language === 'jp' ? 'データを再読み込み' : 'Reload data'}
              >
                <RefreshCw className={`w-4 h-4 ${state.loading ? 'animate-spin' : ''}`} />
              </Button>

              {/* 主題切換按鈕 */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleThemeToggle}
                title={state.settings.language === 'jp' ? 'テーマを切り替え' : 'Toggle theme'}
              >
                {state.settings.theme === 'light' ? (
                  <Moon className="w-4 h-4" />
                ) : (
                  <Sun className="w-4 h-4" />
                )}
              </Button>

              {/* 設定按鈕 */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSettingsOpen(true)}
                title={state.settings.language === 'jp' ? '設定' : 'Settings'}
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* 統計資訊 */}
          <div className="mt-4 flex items-center space-x-6 text-sm text-muted-foreground">
            <span>
              {state.settings.language === 'jp' ? 'シリーズ' : 'Series'}: {state.filteredSeries.length}
            </span>
            <span>
              {state.settings.language === 'jp' ? '購入済み' : 'Purchased'}: {state.purchasedProducts.size}
            </span>
            <span>
              {state.settings.language === 'jp' ? 'ファイル連携' : 'Linked Files'}: {state.fileLinks.size}
            </span>
          </div>
        </div>
      </header>

      <SettingsDialog 
        open={settingsOpen} 
        onOpenChange={setSettingsOpen} 
      />
    </>
  );
}

