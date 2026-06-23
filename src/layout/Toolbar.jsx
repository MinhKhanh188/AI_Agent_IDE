import React from 'react';

const btnStyle = (active) => ({
  background: active ? '#094771' : 'transparent',
  border: 'none',
  color: '#ccc',
  padding: '4px 10px',
  cursor: 'pointer',
  borderRadius: '3px',
  fontSize: '12px',
});

export default function Toolbar({ sidebarOpen, setSidebarOpen, aiPanelOpen, setAiPanelOpen, bottomPanelOpen, setBottomPanelOpen }) {
  return (
    <div style={{ height: '32px', background: '#252526', borderBottom: '1px solid #333', display: 'flex', alignItems: 'center', padding: '0 8px', gap: '4px', flexShrink: 0 }}>
      <button style={btnStyle(sidebarOpen)} onClick={() => setSidebarOpen(p => !p)} title="Toggle Sidebar">⬜ Explorer</button>
      <button style={btnStyle(aiPanelOpen)} onClick={() => setAiPanelOpen(p => !p)} title="Toggle AI Panel">🤖 AI</button>
      <button style={btnStyle(bottomPanelOpen)} onClick={() => setBottomPanelOpen(p => !p)} title="Toggle Terminal">⬛ Terminal</button>
    </div>
  );
}
