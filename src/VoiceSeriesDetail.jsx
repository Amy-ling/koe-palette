import React from 'react';
import { Button } from '@/components/ui/button.jsx';
import { ArrowLeft, Calendar, Users, ShoppingCart } from 'lucide-react';
import { useApp } from '../contexts/AppContext.jsx';
import dataService from '../services/dataService.js';

export default function VoiceSeriesDetail({ series, onBack }) {
  const { state, actions } = useApp();
  
  const livers = dataService.getSeriesLivers(series.series_id);
  const products = dataService.getSeriesProducts(series.series_id);
  
  const releaseDate = new Date(series.initial_release_date);
  const formattedDate = releaseDate.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="space-y-6">
      {/* 返回按鈕 */}
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        戻る
      </Button>

      {/* 系列資訊 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 封面圖片 */}
        <div className="lg:col-span-1">
          <img
            src={series.cover_image_url}
            alt={series.title}
            className="w-full aspect-square object-cover rounded-lg"
            onError={(e) => {
              e.target.src = '/placeholder-cover.jpg';
            }}
          />
        </div>

        {/* 詳細資訊 */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{series.title}</h1>
            <div className="flex items-center space-x-4 text-muted-foreground">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {formattedDate}
              </div>
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                {livers.length} Liver{livers.length > 1 ? 's' : ''}
              </div>
              <div className="flex items-center">
                <ShoppingCart className="w-4 h-4 mr-1" />
                {products.length} 商品
              </div>
            </div>
          </div>

          {/* 參與Liver */}
          <div>
            <h3 className="text-lg font-semibold mb-3">参加Liver</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {livers.map((liver) => (
                <div key={liver.id} className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                  <div 
                    className="w-8 h-8 rounded-full"
                    style={{ backgroundColor: liver.oshi_color_code }}
                  />
                  <div>
                    <p className="font-medium text-sm">{liver.name.jp}</p>
                    <p className="text-xs text-muted-foreground">{liver.name.en}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 商品列表 */}
          <div>
            <h3 className="text-lg font-semibold mb-3">商品一覧</h3>
            <div className="space-y-3">
              {products.map((product) => {
                const liver = state.data.livers.find(l => l.id === product.liver_id);
                const isPurchased = state.purchasedProducts.has(product.product_id);
                const isLinked = state.fileLinks.has(product.product_id);
                
                return (
                  <div key={product.product_id} className="flex items-center justify-between p-4 bg-card border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-6 h-6 rounded-full"
                        style={{ backgroundColor: liver?.oshi_color_code || '#ccc' }}
                      />
                      <div>
                        <p className="font-medium">{product.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {liver?.name.jp} • {product.type} • {product.language}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant={isPurchased ? "default" : "outline"}
                        size="sm"
                        onClick={() => actions.togglePurchased(product.product_id)}
                      >
                        {isPurchased ? '購入済み' : '未購入'}
                      </Button>
                      
                      {isLinked && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full" title="ファイル連携済み" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

