import React from 'react';
import { useApp } from '../contexts/AppContext.jsx';
import SeriesView from './views/SeriesView.jsx';
import LiverView from './views/LiverView.jsx';
import GroupView from './views/GroupView.jsx';
import YearView from './views/YearView.jsx';

export default function MainContent() {
  const { state } = useApp();

  const renderView = () => {
    switch (state.viewMode) {
      case 'series':
        return <SeriesView />;
      case 'liver':
        return <LiverView />;
      case 'group':
        return <GroupView />;
      case 'year':
        return <YearView />;
      default:
        return <SeriesView />;
    }
  };

  return (
    <main className="container mx-auto px-4 py-6">
      {renderView()}
    </main>
  );
}

