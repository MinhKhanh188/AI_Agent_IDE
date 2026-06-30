import React, { useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { createPtySession } from '../services/terminal/pty-service';
import 'xterm/css/xterm.css';

export default function BottomPanel({ cwd, onClose }) {
  const termRef = useRef(null);
  const sessionRef = useRef(null);

  const { fontSize } = useAppContext();

  // Initialize terminal/pty session once
  useEffect(() => {
    if (!termRef.current) return;

    const session = createPtySession(termRef.current, { fontSize, cwd });
    sessionRef.current = session;

    return () => {
      session.dispose();
      sessionRef.current = null;
    };
  }, [cwd]);

  // Handle font size changes after mount
  useEffect(() => {
    sessionRef.current?.setFontSize(fontSize);
  }, [fontSize]);

  return (
    <div style={{ height: '100%', borderTop: '1px solid #333', background: '#1e1e1e', display: 'flex', flexDirection: 'column' }}>
      <div style={{ height: '28px', background: '#252526', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 10px', borderBottom: '1px solid #333', flexShrink: 0 }}>
        <span style={{ color: '#ccc', fontSize: 'var(--app-font-size)' }}>Terminal — PowerShell</span>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#ccc', cursor: 'pointer', fontSize: 'var(--app-font-size)' }}>✕</button>
      </div>
      <div
        ref={termRef}
        style={{ flex: 1, overflow: 'hidden' }}
        tabIndex={0}
        onFocus={() => sessionRef.current?.term.focus()}
      />
    </div>
  );
}