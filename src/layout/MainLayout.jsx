import React from 'react';
import Sidebar from './Sidebar';
import EditorPanel from './EditorPanel';
import BottomPanel from './BottomPanel';
import AIPanel from './AIPanel';

export default function MainLayout() {
  return (
    <div className="main-layout" style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <Sidebar />
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
          <EditorPanel />
          <AIPanel />
        </div>
        <BottomPanel />
      </div>
    </div>
  );
}
