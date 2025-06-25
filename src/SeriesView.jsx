import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext.jsx';
import VoiceSeriesCard from '../VoiceSeriesCard.jsx';
import VoiceSeriesDetail from '../VoiceSeriesDetail.jsx';
import { Grid3X3, List } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';

export default function SeriesView() {
  const { state } = useApp();
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [viewType, setViewType] = useState('grid'); // 'grid' | 'list'

  if (selectedSeries) {
    return (
      <VoiceSeriesDetail 
        series={selectedSeries} 
        onBack={() => setSelectedSeries(null)} 
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* 視圖控制 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">音聲シリーズ</h2>
          <p className="text-muted-foreground">
            {state.filteredSeries.length} 件のシリーズ
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant={viewType === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewType('grid')}
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewType === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewType('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* 系列列表 */}
      {state.filteredSeries.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-muted-foreground">
            <p className="text-lg mb-2">該当するシリーズが見つかりません</p>
            <p className="text-sm">フィルター条件を変更してみてください</p>
          </div>
        </div>
      ) : (
        <div className={`voice-grid ${viewType === 'grid' ? 'grid' : 'space-y-4'}`}>
          {state.filteredSeries.map((series) => (
            <VoiceSeriesCard
              key={series.series_id}
              series={series}
              viewType={viewType}
              onClick={() => setSelectedSeries(series)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

