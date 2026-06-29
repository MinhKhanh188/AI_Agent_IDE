import React, { useState, useRef, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import AI_PROVIDERS from '../services/ai-providers';

const categories = ['General', 'AI'];

export default function SettingsModal({ onClose }) {
  const { fontSize, setFontSize, aiConfig, setAiConfig } = useAppContext();

  const [localAi, setLocalAi] = useState({ ...aiConfig });
  const currentProvider = AI_PROVIDERS[localAi.provider] ?? AI_PROVIDERS.ollama;

  const saveAi = () => setAiConfig(localAi);
  const [activeCategory, setActiveCategory] = useState('General');
  const [pos, setPos] = useState({ x: window.innerWidth / 2 - 360, y: window.innerHeight / 2 - 260 });
  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const onMouseDown = useCallback((e) => {
    dragging.current = true;
    dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };

    function onMouseMove(e) {
      if (!dragging.current) return;
      setPos({ x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y });
    }
    function onMouseUp() {
      dragging.current = false;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    }
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }, [pos]);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, pointerEvents: 'none' }}>
      <div style={{
        position: 'absolute',
        top: pos.y,
        left: pos.x,
        width: '720px',
        height: '520px',
        background: '#252526',
        border: '1px solid #444',
        borderRadius: '6px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        display: 'flex',
        flexDirection: 'column',
        pointerEvents: 'all',
        overflow: 'hidden',
      }}>
        {/* Title bar */}
        <div
          onMouseDown={onMouseDown}
          style={{ height: '40px', background: '#2d2d2d', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', cursor: 'grab', flexShrink: 0, borderBottom: '1px solid #333', userSelect: 'none' }}
        >
          <span style={{ color: '#ccc', fontSize: 'var(--app-font-size)', fontWeight: 500 }}>Settings</span>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', fontSize: 'var(--app-font-size)', lineHeight: 1, padding: '2px 4px' }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
          {/* Category list */}
          <div style={{ width: '180px', background: '#252526', borderRight: '1px solid #333', flexShrink: 0, paddingTop: '8px' }}>
            {categories.map(cat => (
              <div
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '7px 16px',
                  fontSize: 'var(--app-font-size)',
                  cursor: 'pointer',
                  color: activeCategory === cat ? '#fff' : '#ccc',
                  background: activeCategory === cat ? '#094771' : 'transparent',
                  borderLeft: activeCategory === cat ? '2px solid #007acc' : '2px solid transparent',
                  userSelect: 'none',
                }}
              >
                {cat}
              </div>
            ))}
          </div>

          {/* Content */}
          <div style={{ flex: 1, padding: '24px 28px', overflowY: 'auto' }}>
            {activeCategory === 'General' && (
              <>
                <div style={{ color: '#ccc', fontSize: 'var(--app-font-size)', fontWeight: 500, marginBottom: '20px', paddingBottom: '8px', borderBottom: '1px solid #333' }}>
                  General
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ color: '#bbb', fontSize: 'var(--app-font-size)', marginBottom: '10px' }}>Editor & Terminal Font Size</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button onClick={() => setFontSize(s => Math.max(10, s - 1))} style={{ background: 'transparent', border: '1px solid #555', color: '#ccc', cursor: 'pointer', borderRadius: '3px', padding: '3px 10px', fontSize: 'var(--app-font-size)' }}>A-</button>
                    <input
                      type="range" min={10} max={24} value={fontSize}
                      onChange={e => setFontSize(Number(e.target.value))}
                      style={{ width: '140px', accentColor: '#007acc' }}
                    />
                    <button onClick={() => setFontSize(s => Math.min(24, s + 1))} style={{ background: 'transparent', border: '1px solid #555', color: '#ccc', cursor: 'pointer', borderRadius: '3px', padding: '3px 10px', fontSize: 'var(--app-font-size)' }}>A+</button>
                    <span style={{ color: '#888', fontSize: 'var(--app-font-size)', minWidth: '32px' }}>{fontSize}px</span>
                  </div>
                </div>
              </>
            )}
            {activeCategory === 'AI' && (
              <>
                <div style={{ color: '#ccc', fontSize: 'var(--app-font-size)', fontWeight: 500, marginBottom: '20px', paddingBottom: '8px', borderBottom: '1px solid #333' }}>
                  AI Provider
                </div>

                {/* Provider */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ color: '#bbb', fontSize: 'var(--app-font-size)', marginBottom: '8px' }}>Provider</div>
                  <select
                    value={localAi.provider}
                    onChange={e => setLocalAi(p => ({ ...p, provider: e.target.value, model: AI_PROVIDERS[e.target.value].models[0] }))}
                    style={{ background: '#333', color: '#ccc', border: '1px solid #555', padding: '5px 10px', borderRadius: '4px', fontSize: 'var(--app-font-size)', width: '220px' }}
                  >
                    {Object.values(AI_PROVIDERS).map(p => (
                      <option key={p.id} value={p.id}>{p.label}</option>
                    ))}
                  </select>
                </div>

                {/* Model */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ color: '#bbb', fontSize: 'var(--app-font-size)', marginBottom: '8px' }}>Model</div>
                  <select
                    value={localAi.model}
                    onChange={e => setLocalAi(p => ({ ...p, model: e.target.value }))}
                    style={{ background: '#333', color: '#ccc', border: '1px solid #555', padding: '5px 10px', borderRadius: '4px', fontSize: 'var(--app-font-size)', width: '220px' }}
                  >
                    {currentProvider.models.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                {/* API Key */}
                {currentProvider.requiresApiKey && (
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ color: '#bbb', fontSize: 'var(--app-font-size)', marginBottom: '8px' }}>API Key</div>
                    <input
                      type="password"
                      value={localAi.apiKey}
                      onChange={e => setLocalAi(p => ({ ...p, apiKey: e.target.value }))}
                      placeholder="Enter API key"
                      style={{ background: '#333', color: '#ccc', border: '1px solid #555', padding: '5px 10px', borderRadius: '4px', fontSize: 'var(--app-font-size)', width: '320px' }}
                    />
                    <div style={{ color: '#666', fontSize: 'calc(var(--app-font-size) - 2px)', marginTop: '4px' }}>
                      Stored locally, only sent to the selected provider.
                    </div>
                  </div>
                )}

                {/* Custom base URL */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ color: '#bbb', fontSize: 'var(--app-font-size)', marginBottom: '8px' }}>Base URL override <span style={{ color: '#555' }}>(optional)</span></div>
                  <input
                    type="text"
                    value={localAi.customBaseUrl}
                    onChange={e => setLocalAi(p => ({ ...p, customBaseUrl: e.target.value }))}
                    placeholder={currentProvider.baseUrl}
                    style={{ background: '#333', color: '#ccc', border: '1px solid #555', padding: '5px 10px', borderRadius: '4px', fontSize: 'var(--app-font-size)', width: '320px' }}
                  />
                </div>

                {/* Save */}
                <button
                  onClick={saveAi}
                  style={{ background: '#0e639c', color: '#fff', border: 'none', borderRadius: '4px', padding: '6px 20px', cursor: 'pointer', fontSize: 'var(--app-font-size)' }}
                >
                  Save
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
