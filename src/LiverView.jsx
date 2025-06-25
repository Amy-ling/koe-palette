import React from 'react';
import { useApp } from '../../contexts/AppContext.jsx';

export default function LiverView() {
  const { state } = useApp();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Liver一覧</h2>
        <p className="text-muted-foreground">
          {state.data.livers.length} 人のLiver
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {state.data.livers.map((liver) => (
          <div key={liver.id} className="voice-card">
            <div className="flex items-center space-x-3">
              <div 
                className="w-12 h-12 rounded-full"
                style={{ backgroundColor: liver.oshi_color_code }}
              />
              <div>
                <h3 className="font-semibold">{liver.name.jp}</h3>
                <p className="text-sm text-muted-foreground">{liver.name.en}</p>
                <div className={`branch-badge branch-${liver.branch.toLowerCase()} inline-block mt-1`}>
                  {liver.branch}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

