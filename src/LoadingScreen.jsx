import React from 'react';
import { Palette } from 'lucide-react';

export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 animate-pulse">
            <Palette className="w-8 h-8 text-white" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold mb-2">KoePalette</h2>
        <p className="text-muted-foreground mb-6">こえパレット</p>
        
        <div className="flex items-center justify-center space-x-2">
          <div className="loading-spinner"></div>
          <span className="text-sm text-muted-foreground">
            データを読み込み中...
          </span>
        </div>
        
        <div className="mt-8 text-xs text-muted-foreground max-w-md">
          <p>Nijisanji音聲コレクションを管理するPWAアプリです</p>
          <p className="mt-2">初回読み込みには少し時間がかかる場合があります</p>
        </div>
      </div>
    </div>
  );
}

