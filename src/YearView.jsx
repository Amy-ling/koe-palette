import React from 'react';
import { useApp } from '../../contexts/AppContext.jsx';
import VoiceSeriesCard from '../VoiceSeriesCard.jsx';

export default function YearView() {
  const { state } = useApp();

  // 按年份分組系列
  const seriesByYear = state.filteredSeries.reduce((acc, series) => {
    const year = new Date(series.initial_release_date).getFullYear();
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(series);
    return acc;
  }, {});

  const years = Object.keys(seriesByYear).sort((a, b) => b - a);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">年別表示</h2>
        <p className="text-muted-foreground">
          {years.length} 年間のシリーズ
        </p>
      </div>

      {years.map((year) => (
        <div key={year} className="space-y-4">
          <div className="flex items-center space-x-4">
            <h3 className="text-xl font-semibold">{year}年</h3>
            <span className="text-sm text-muted-foreground">
              {seriesByYear[year].length} シリーズ
            </span>
          </div>
          
          <div className="voice-grid grid">
            {seriesByYear[year].map((series) => (
              <VoiceSeriesCard
                key={series.series_id}
                series={series}
                viewType="grid"
                onClick={() => {/* TODO: 詳細表示 */}}
              />
            ))}
          </div>
        </div>
      ))}

      {years.length === 0 && (
        <div className="text-center py-12">
          <div className="text-muted-foreground">
            <p className="text-lg mb-2">該当するシリーズが見つかりません</p>
            <p className="text-sm">フィルター条件を変更してみてください</p>
          </div>
        </div>
      )}
    </div>
  );
}

