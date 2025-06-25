import React from 'react';
import { Button } from '@/components/ui/button.jsx';
import { 
  Grid3X3, 
  User, 
  Users, 
  Calendar,
  Filter,
  X
} from 'lucide-react';
import { useApp } from '../contexts/AppContext.jsx';
import dataService from '../services/dataService.js';

export default function FilterBar() {
  const { state, actions } = useApp();

  const viewModes = [
    { id: 'series', label: 'シリーズ', icon: Grid3X3 },
    { id: 'liver', label: 'Liver', icon: User },
    { id: 'group', label: '組合', icon: Users },
    { id: 'year', label: '年別', icon: Calendar }
  ];

  const branches = [
    { id: 'JP', label: 'JP', color: 'bg-red-500' },
    { id: 'EN', label: 'EN', color: 'bg-blue-500' },
    { id: 'KR', label: 'KR', color: 'bg-green-500' }
  ];

  const purchaseStatuses = [
    { id: 'all', label: 'すべて' },
    { id: 'purchased', label: '購入済み' },
    { id: 'not_purchased', label: '未購入' }
  ];

  const handleViewModeChange = (mode) => {
    actions.setViewMode(mode);
  };

  const handleBranchFilter = (branch) => {
    const newBranch = state.filters.branch === branch ? null : branch;
    actions.setFilters({ branch: newBranch });
  };

  const handlePurchaseStatusFilter = (status) => {
    actions.setFilters({ purchased_status: status });
  };

  const clearFilters = () => {
    actions.setFilters({
      branch: null,
      purchased_status: 'all',
      search_query: '',
      year: null,
      liver_id: null,
      group_id: null
    });
  };

  const hasActiveFilters = state.filters.branch || 
                          state.filters.purchased_status !== 'all' ||
                          state.filters.search_query ||
                          state.filters.year ||
                          state.filters.liver_id ||
                          state.filters.group_id;

  return (
    <div className="sticky top-[73px] z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-3">
        {/* 視圖模式切換 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-muted-foreground">表示:</span>
            {viewModes.map((mode) => {
              const Icon = mode.icon;
              return (
                <Button
                  key={mode.id}
                  variant={state.viewMode === mode.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleViewModeChange(mode.id)}
                  className="h-8"
                >
                  <Icon className="w-4 h-4 mr-1" />
                  {mode.label}
                </Button>
              );
            })}
          </div>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4 mr-1" />
              フィルター解除
            </Button>
          )}
        </div>

        {/* 篩選器 */}
        <div className="flex items-center space-x-6">
          {/* 分支篩選 */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-muted-foreground">分支:</span>
            {branches.map((branch) => (
              <Button
                key={branch.id}
                variant={state.filters.branch === branch.id ? "default" : "outline"}
                size="sm"
                onClick={() => handleBranchFilter(branch.id)}
                className="h-7 px-3"
              >
                <div className={`w-2 h-2 rounded-full ${branch.color} mr-1`} />
                {branch.label}
              </Button>
            ))}
          </div>

          {/* 購買狀態篩選 */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-muted-foreground">状態:</span>
            {purchaseStatuses.map((status) => (
              <Button
                key={status.id}
                variant={state.filters.purchased_status === status.id ? "default" : "outline"}
                size="sm"
                onClick={() => handlePurchaseStatusFilter(status.id)}
                className="h-7 px-3"
              >
                {status.label}
              </Button>
            ))}
          </div>

          {/* 年份篩選 (僅在年別視圖時顯示) */}
          {state.viewMode === 'year' && (
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-muted-foreground">年:</span>
              {dataService.getAllYears().slice(0, 5).map((year) => (
                <Button
                  key={year}
                  variant={state.filters.year === year ? "default" : "outline"}
                  size="sm"
                  onClick={() => actions.setFilters({ year: state.filters.year === year ? null : year })}
                  className="h-7 px-3"
                >
                  {year}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* 活動篩選器指示 */}
        {hasActiveFilters && (
          <div className="mt-3 flex items-center space-x-2 text-xs text-muted-foreground">
            <Filter className="w-3 h-3" />
            <span>フィルター適用中</span>
            <span className="text-primary font-medium">
              {state.filteredSeries.length} 件表示
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

