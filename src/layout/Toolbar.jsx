import React from 'react';
import { useAppContext } from '../context/AppContext';

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
  const { fontSize, setFontSize } = useAppContext();

  function decreaseFont() { setFontSize(s => Math.max(10, s - 1)); }
  function increaseFont() { setFontSize(s => Math.min(24, s + 1)); }

  return (
    <div style={{ height: '32px', background: '#252526', borderBottom: '1px solid #333', display: 'flex', alignItems: 'center', padding: '0 8px', gap: '4px', flexShrink: 0, justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', gap: '4px' }}>
        <button style={btnStyle(sidebarOpen)} onClick={() => setSidebarOpen(p => !p)} title="Toggle Sidebar">⬜ Explorer</button>
        <button style={btnStyle(aiPanelOpen)} onClick={() => setAiPanelOpen(p => !p)} title="Toggle AI Panel">🤖 AI</button>
        <button style={btnStyle(bottomPanelOpen)} onClick={() => setBottomPanelOpen(p => !p)} title="Toggle Terminal">⬛ Terminal</button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <button onClick={decreaseFont} title="Decrease font size" style={{ background: 'transparent', border: '1px solid #444', color: '#ccc', cursor: 'pointer', borderRadius: '3px', padding: '2px 7px', fontSize: '12px' }}>A-</button>
        <span style={{ color: '#888', fontSize: '11px', minWidth: '24px', textAlign: 'center' }}>{fontSize}</span>
        <button onClick={increaseFont} title="Increase font size" style={{ background: 'transparent', border: '1px solid #444', color: '#ccc', cursor: 'pointer', borderRadius: '3px', padding: '2px 7px', fontSize: '12px' }}>A+</button>
      </div>
    </div>
  );
}
