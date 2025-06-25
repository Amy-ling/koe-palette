import React from 'react';
import { Button } from '@/components/ui/button.jsx';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog.jsx';
import { useApp } from '../contexts/AppContext.jsx';

export default function SettingsDialog({ open, onOpenChange }) {
  const { state, actions } = useApp();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>設定</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* 主題設定 */}
          <div>
            <h3 className="text-sm font-medium mb-3">テーマ</h3>
            <div className="flex space-x-2">
              <Button
                variant={state.settings.theme === 'light' ? 'default' : 'outline'}
                size="sm"
                onClick={() => actions.updateSettings({ theme: 'light' })}
              >
                ライト
              </Button>
              <Button
                variant={state.settings.theme === 'dark' ? 'default' : 'outline'}
                size="sm"
                onClick={() => actions.updateSettings({ theme: 'dark' })}
              >
                ダーク
              </Button>
            </div>
          </div>

          {/* 言語設定 */}
          <div>
            <h3 className="text-sm font-medium mb-3">言語</h3>
            <div className="flex space-x-2">
              <Button
                variant={state.settings.language === 'jp' ? 'default' : 'outline'}
                size="sm"
                onClick={() => actions.updateSettings({ language: 'jp' })}
              >
                日本語
              </Button>
              <Button
                variant={state.settings.language === 'en' ? 'default' : 'outline'}
                size="sm"
                onClick={() => actions.updateSettings({ language: 'en' })}
              >
                English
              </Button>
            </div>
          </div>

          {/* 應援色設定 */}
          {state.settings.theme === 'dark' && (
            <div>
              <h3 className="text-sm font-medium mb-3">推し (応援色)</h3>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                {state.data.livers.slice(0, 10).map(liver => (
                  <Button
                    key={liver.id}
                    variant={state.settings.oshi_liver_id === liver.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => actions.updateSettings({ oshi_liver_id: liver.id })}
                    className="justify-start"
                  >
                    <div 
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: liver.oshi_color_code }}
                    />
                    {liver.name.jp}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 border-t">
            <h3 className="text-sm font-medium mb-2">GitHub設定</h3>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Owner: {import.meta.env.REACT_APP_GITHUB_OWNER || '未設定'}</p>
              <p>Repo: {import.meta.env.REACT_APP_GITHUB_REPO || '未設定'}</p>
              <p>Token: {import.meta.env.REACT_APP_GITHUB_TOKEN ? '設定済み' : '未設定'}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

