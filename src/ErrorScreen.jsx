import React from 'react';
import { Button } from '@/components/ui/button.jsx';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function ErrorScreen({ error, onRetry }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-destructive/10">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold mb-2">エラーが発生しました</h2>
        <p className="text-muted-foreground mb-6">
          データの読み込み中に問題が発生しました
        </p>
        
        <div className="bg-muted p-4 rounded-lg mb-6 text-left">
          <p className="text-sm font-mono text-muted-foreground">
            {error}
          </p>
        </div>
        
        <div className="space-y-4">
          <Button onClick={onRetry} className="w-full">
            <RefreshCw className="w-4 h-4 mr-2" />
            再試行
          </Button>
          
          <div className="text-xs text-muted-foreground space-y-2">
            <p>問題が解決しない場合：</p>
            <ul className="list-disc list-inside space-y-1">
              <li>インターネット接続を確認してください</li>
              <li>GitHub Personal Access Tokenが正しく設定されているか確認してください</li>
              <li>ブラウザのキャッシュをクリアしてください</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

