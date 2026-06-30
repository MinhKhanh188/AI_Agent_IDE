import React, { useState, useRef, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import { AI_PROTOCOLS } from '../services/ai/ai-providers';

const categories = ['General', 'AI'];

export default function SettingsModal({ onClose }) {
  const { fontSize, setFontSize, aiProviders, setAiProviders, activeProviderId, setActiveProviderId } = useAppContext();
  const [editingId, setEditingId] = useState(null); // null = list view, id = editing that provider
  const [draft, setDraft] = useState(null);

  const startNewProvider = () => {
    const draftProvider = { id: '', label: '', protocol: 'ollama', baseUrl: '', apiKey: '', model: '' };
    setDraft(draftProvider);
    setEditingId('__new__');
  };

  const startEditProvider = (provider) => {
    setDraft({ ...provider });
    setEditingId(provider.id);
  };

  const cancelEdit = () => { setEditingId(null); setDraft(null); };

  const saveProvider = () => {
    if (!draft.id.trim() || !/^[a-z0-9-_]+$/.test(draft.id.trim())) return;
    setAiProviders(prev => {
      const exists = prev.find(p => p.id === draft.id.trim());
      const cleaned = { ...draft, id: draft.id.trim() };
      if (editingId === '__new__') {
        if (exists) return prev; // id collision, refuse silently
        return [...prev, cleaned];
      }
      return prev.map(p => (p.id === editingId ? cleaned : p));
    });
    if (activeProviderId === editingId) setActiveProviderId(draft.id.trim());
    cancelEdit();
  };

  const deleteProvider = (id) => {
    setAiProviders(prev => prev.filter(p => p.id !== id));
    if (activeProviderId === id) setActiveProviderId(prev => {
      const remaining = aiProviders.filter(p => p.id !== id);
      return remaining[0]?.id ?? '';
    });
  };
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
                {editingId === null ? (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', paddingBottom: '8px', borderBottom: '1px solid #333' }}>
                      <span style={{ color: '#ccc', fontSize: 'var(--app-font-size)', fontWeight: 500 }}>AI Providers</span>
                      <button
                        onClick={startNewProvider}
                        style={{ background: '#0e639c', color: '#fff', border: 'none', borderRadius: '4px', padding: '5px 14px', cursor: 'pointer', fontSize: 'var(--app-font-size)' }}
                      >
                        + Add provider
                      </button>
                    </div>

                    {aiProviders.length === 0 && (
                      <div style={{ color: '#666', fontSize: 'var(--app-font-size)' }}>No providers configured yet.</div>
                    )}

                    {aiProviders.map(p => (
                      <div key={p.id} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '10px 12px', marginBottom: '8px',
                        background: activeProviderId === p.id ? '#16324a' : '#2a2a2a',
                        border: `1px solid ${activeProviderId === p.id ? '#3a6ea5' : '#3c3c3c'}`,
                        borderRadius: '6px',
                      }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', cursor: 'pointer', flex: 1 }} onClick={() => setActiveProviderId(p.id)}>
                          <span style={{ color: '#ddd', fontSize: 'var(--app-font-size)', fontWeight: 500 }}>
                            {activeProviderId === p.id ? '● ' : '○ '}{p.label || p.id}
                          </span>
                          <span style={{ color: '#777', fontSize: 'calc(var(--app-font-size) - 1px)' }}>
                            {p.protocol} · {p.baseUrl} · {p.model || 'no model set'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => startEditProvider(p)} style={{ background: 'transparent', border: '1px solid #555', color: '#ccc', borderRadius: '4px', padding: '4px 10px', cursor: 'pointer', fontSize: 'calc(var(--app-font-size) - 1px)' }}>Edit</button>
                          <button onClick={() => deleteProvider(p.id)} style={{ background: 'transparent', border: '1px solid #5a3030', color: '#d77', borderRadius: '4px', padding: '4px 10px', cursor: 'pointer', fontSize: 'calc(var(--app-font-size) - 1px)' }}>Delete</button>
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <>
                    <div style={{ color: '#ccc', fontSize: 'var(--app-font-size)', fontWeight: 500, marginBottom: '6px' }}>
                      {editingId === '__new__' ? 'Add provider' : 'Edit provider'}
                    </div>
                    <div style={{ color: '#777', fontSize: 'calc(var(--app-font-size) - 1px)', marginBottom: '20px', paddingBottom: '8px', borderBottom: '1px solid #333' }}>
                      Configure a custom AI provider endpoint.
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ color: '#bbb', fontSize: 'var(--app-font-size)', marginBottom: '6px' }}>Provider ID</div>
                      <input
                        type="text"
                        value={draft.id}
                        disabled={editingId !== '__new__'}
                        onChange={e => setDraft(d => ({ ...d, id: e.target.value.toLowerCase() }))}
                        placeholder="my-local-server"
                        style={{ background: editingId !== '__new__' ? '#2a2a2a' : '#333', color: editingId !== '__new__' ? '#888' : '#ccc', border: '1px solid #555', padding: '5px 10px', borderRadius: '4px', fontSize: 'var(--app-font-size)', width: '320px' }}
                      />
                      <div style={{ color: '#666', fontSize: 'calc(var(--app-font-size) - 2px)', marginTop: '4px' }}>
                        Lowercase letters, numbers, hyphens, or underscores
                      </div>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ color: '#bbb', fontSize: 'var(--app-font-size)', marginBottom: '6px' }}>Display name</div>
                      <input
                        type="text"
                        value={draft.label}
                        onChange={e => setDraft(d => ({ ...d, label: e.target.value }))}
                        placeholder="My Local Server"
                        style={{ background: '#333', color: '#ccc', border: '1px solid #555', padding: '5px 10px', borderRadius: '4px', fontSize: 'var(--app-font-size)', width: '320px' }}
                      />
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ color: '#bbb', fontSize: 'var(--app-font-size)', marginBottom: '6px' }}>Provider API</div>
                      <select
                        value={draft.protocol}
                        onChange={e => setDraft(d => ({ ...d, protocol: e.target.value }))}
                        style={{ background: '#333', color: '#ccc', border: '1px solid #555', padding: '5px 10px', borderRadius: '4px', fontSize: 'var(--app-font-size)', width: '220px' }}
                      >
                        {AI_PROTOCOLS.map(p => (
                          <option key={p.id} value={p.id}>{p.label}</option>
                        ))}
                      </select>
                      <div style={{ color: '#666', fontSize: 'calc(var(--app-font-size) - 2px)', marginTop: '4px' }}>
                        The wire protocol this endpoint speaks
                      </div>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ color: '#bbb', fontSize: 'var(--app-font-size)', marginBottom: '6px' }}>Base URL</div>
                      <input
                        type="text"
                        value={draft.baseUrl}
                        onChange={e => setDraft(d => ({ ...d, baseUrl: e.target.value }))}
                        placeholder="http://localhost:11434"
                        style={{ background: '#333', color: '#ccc', border: '1px solid #555', padding: '5px 10px', borderRadius: '4px', fontSize: 'var(--app-font-size)', width: '320px' }}
                      />
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ color: '#bbb', fontSize: 'var(--app-font-size)', marginBottom: '6px' }}>Model</div>
                      <input
                        type="text"
                        value={draft.model}
                        onChange={e => setDraft(d => ({ ...d, model: e.target.value }))}
                        placeholder="qwen3.5:9b"
                        style={{ background: '#333', color: '#ccc', border: '1px solid #555', padding: '5px 10px', borderRadius: '4px', fontSize: 'var(--app-font-size)', width: '320px' }}
                      />
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                      <div style={{ color: '#bbb', fontSize: 'var(--app-font-size)', marginBottom: '6px' }}>API key</div>
                      <input
                        type="password"
                        value={draft.apiKey}
                        onChange={e => setDraft(d => ({ ...d, apiKey: e.target.value }))}
                        placeholder="sk-..."
                        style={{ background: '#333', color: '#ccc', border: '1px solid #555', padding: '5px 10px', borderRadius: '4px', fontSize: 'var(--app-font-size)', width: '320px' }}
                      />
                      <div style={{ color: '#666', fontSize: 'calc(var(--app-font-size) - 2px)', marginTop: '4px' }}>
                        Optional. Leave empty if the endpoint needs no auth.
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={saveProvider}
                        disabled={!draft.id.trim() || !/^[a-z0-9-_]+$/.test(draft.id.trim())}
                        style={{ background: '#0e639c', color: '#fff', border: 'none', borderRadius: '4px', padding: '6px 18px', cursor: 'pointer', fontSize: 'var(--app-font-size)' }}
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        style={{ background: 'transparent', border: '1px solid #555', color: '#ccc', borderRadius: '4px', padding: '6px 18px', cursor: 'pointer', fontSize: 'var(--app-font-size)' }}
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
