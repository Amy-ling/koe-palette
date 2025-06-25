import React from 'react';
import { useApp } from '../../contexts/AppContext.jsx';

export default function GroupView() {
  const { state } = useApp();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">組合一覧</h2>
        <p className="text-muted-foreground">
          {state.data.groups.length} 個の組合
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {state.data.groups.map((group) => (
          <div key={group.id} className="voice-card">
            <h3 className="font-semibold text-lg mb-3">{group.name}</h3>
            <div className="flex flex-wrap gap-2">
              {group.liver_ids.map((liverId) => {
                const liver = state.data.livers.find(l => l.id === liverId);
                return liver ? (
                  <div key={liverId} className="flex items-center space-x-2 bg-muted rounded-full px-3 py-1">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: liver.oshi_color_code }}
                    />
                    <span className="text-sm">{liver.name.jp}</span>
                  </div>
                ) : null;
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

