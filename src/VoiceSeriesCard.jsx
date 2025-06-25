import React from 'react';
import { useApp } from '../contexts/AppContext.jsx';
import dataService from '../services/dataService.js';
import { Calendar, Users, ShoppingCart, Link, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge.jsx';

export default function VoiceSeriesCard({ series, viewType = 'grid', onClick }) {
  const { state } = useApp();
  
  // 獲取系列相關數據
  const livers = dataService.getSeriesLivers(series.series_id);
  const products = dataService.getSeriesProducts(series.series_id);
  
  // 計算購買和連結狀態
  const purchasedCount = products.filter(product => 
    state.purchasedProducts.has(product.product_id)
  ).length;
  
  const linkedCount = products.filter(product => 
    state.fileLinks.has(product.product_id)
  ).length;

  // 獲取所有標籤
  const allTags = new Set();
  products.forEach(product => {
    const tags = state.customTags.get(product.product_id) || [];
    tags.forEach(tag => allTags.add(tag));
  });

  // 格式化發售日期
  const releaseDate = new Date(series.initial_release_date);
  const formattedDate = releaseDate.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  // 獲取主要分支
  const branches = [...new Set(livers.map(liver => liver.branch))];

  if (viewType === 'list') {
    return (
      <div 
        className="voice-card cursor-pointer flex items-center space-x-4 relative"
        onClick={onClick}
      >
        {/* 封面圖片 */}
        <div className="flex-shrink-0">
          <img
            src={series.cover_image_url}
            alt={series.title}
            className="w-20 h-20 object-cover rounded-lg"
            onError={(e) => {
              e.target.src = '/placeholder-cover.jpg';
            }}
          />
        </div>

        {/* 內容 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-lg truncate">{series.title}</h3>
              <div className="flex items-center space-x-4 mt-1 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {formattedDate}
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {livers.length} Liver{livers.length > 1 ? 's' : ''}
                </div>
              </div>
            </div>
            
            {/* 分支標籤 */}
            <div className="flex space-x-1">
              {branches.map(branch => (
                <Badge key={branch} className={`branch-badge branch-${branch.toLowerCase()}`}>
                  {branch}
                </Badge>
              ))}
            </div>
          </div>

          {/* Liver頭像 */}
          <div className="flex items-center space-x-2 mt-2">
            {livers.slice(0, 5).map(liver => (
              <div
                key={liver.id}
                className="liver-avatar"
                style={{ backgroundColor: liver.oshi_color_code + '20' }}
                title={liver.name.jp}
              >
                <div 
                  className="w-full h-full rounded-full"
                  style={{ backgroundColor: liver.oshi_color_code }}
                />
              </div>
            ))}
            {livers.length > 5 && (
              <span className="text-xs text-muted-foreground">
                +{livers.length - 5}
              </span>
            )}
          </div>

          {/* 狀態和標籤 */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
              <div className="flex items-center">
                <ShoppingCart className="w-3 h-3 mr-1" />
                {purchasedCount}/{products.length} 購入済み
              </div>
              <div className="flex items-center">
                <Link className="w-3 h-3 mr-1" />
                {linkedCount} ファイル連携
              </div>
            </div>
            
            {allTags.size > 0 && (
              <div className="flex items-center space-x-1">
                <Tag className="w-3 h-3 text-muted-foreground" />
                {Array.from(allTags).slice(0, 3).map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {allTags.size > 3 && (
                  <span className="text-xs text-muted-foreground">
                    +{allTags.size - 3}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 狀態指示器 */}
        {purchasedCount > 0 && (
          <div className="purchased-indicator" title="一部購入済み" />
        )}
        {linkedCount > 0 && (
          <div className="file-linked-indicator" title="ファイル連携済み" />
        )}
      </div>
    );
  }

  // Grid視圖
  return (
    <div 
      className="voice-card cursor-pointer relative fade-in"
      onClick={onClick}
    >
      {/* 封面圖片 */}
      <div className="aspect-square mb-4 relative overflow-hidden rounded-lg">
        <img
          src={series.cover_image_url}
          alt={series.title}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
          onError={(e) => {
            e.target.src = '/placeholder-cover.jpg';
          }}
        />
        
        {/* 分支標籤 */}
        <div className="absolute top-2 right-2 flex space-x-1">
          {branches.map(branch => (
            <Badge key={branch} className={`branch-badge branch-${branch.toLowerCase()}`}>
              {branch}
            </Badge>
          ))}
        </div>
      </div>

      {/* 內容 */}
      <div className="space-y-3">
        <div>
          <h3 className="font-semibold text-lg line-clamp-2">{series.title}</h3>
          <div className="flex items-center text-sm text-muted-foreground mt-1">
            <Calendar className="w-4 h-4 mr-1" />
            {formattedDate}
          </div>
        </div>

        {/* Liver頭像 */}
        <div className="flex items-center space-x-2">
          {livers.slice(0, 4).map(liver => (
            <div
              key={liver.id}
              className="liver-avatar"
              style={{ backgroundColor: liver.oshi_color_code + '20' }}
              title={liver.name.jp}
            >
              <div 
                className="w-full h-full rounded-full"
                style={{ backgroundColor: liver.oshi_color_code }}
              />
            </div>
          ))}
          {livers.length > 4 && (
            <span className="text-xs text-muted-foreground">
              +{livers.length - 4}
            </span>
          )}
        </div>

        {/* 狀態資訊 */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center">
            <ShoppingCart className="w-3 h-3 mr-1" />
            {purchasedCount}/{products.length}
          </div>
          <div className="flex items-center">
            <Link className="w-3 h-3 mr-1" />
            {linkedCount}
          </div>
        </div>

        {/* 標籤 */}
        {allTags.size > 0 && (
          <div className="flex flex-wrap gap-1">
            {Array.from(allTags).slice(0, 2).map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {allTags.size > 2 && (
              <Badge variant="secondary" className="text-xs">
                +{allTags.size - 2}
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* 狀態指示器 */}
      {purchasedCount > 0 && (
        <div className="purchased-indicator" title="一部購入済み" />
      )}
      {linkedCount > 0 && (
        <div className="file-linked-indicator" title="ファイル連携済み" />
      )}
    </div>
  );
}

