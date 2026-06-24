import React, { useState } from 'react';
import SettingsModal from './SettingsModal';

const iconBtn = (active) => ({
  background: 'transparent',
  border: 'none',
  color: active ? '#fff' : '#858585',
  cursor: 'pointer',
  width: '48px',
  height: '48px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 'var(--app-icon-size)',
  borderLeft: active ? '2px solid #007acc' : '2px solid transparent',
  flexShrink: 0,
  boxSizing: 'border-box',
});

export default function LeftSideToolbar({ sidebarOpen, setSidebarOpen, aiPanelOpen, setAiPanelOpen, bottomPanelOpen, setBottomPanelOpen }) {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <div style={{ width: '48px', background: '#333333', display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, borderRight: '1px solid #252526' }}>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <button style={iconBtn(sidebarOpen)} title="Explorer" onClick={() => setSidebarOpen(p => !p)}>📁</button>
          <button style={iconBtn(aiPanelOpen)} title="AI Assistant" onClick={() => setAiPanelOpen(p => !p)}>🤖</button>
          <button style={iconBtn(bottomPanelOpen)} title="Terminal" onClick={() => setBottomPanelOpen(p => !p)}>⬛</button>
        </div>
        <button
          style={{ ...iconBtn(settingsOpen), marginBottom: '4px' }}
          title="Settings"
          onClick={() => setSettingsOpen(true)}
        >⚙️</button>
      </div>
      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
    </>
  );
}
