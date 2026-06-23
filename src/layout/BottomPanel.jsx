import React, { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { spawn } from 'tauri-pty';
import 'xterm/css/xterm.css';

export default function BottomPanel({ cwd, onClose }) {
  const termRef = useRef(null);
  const xtermRef = useRef(null);
  const ptyRef = useRef(null);

  useEffect(() => {
    const term = new Terminal({ theme: { background: '#1e1e1e', foreground: '#cccccc' }, fontSize: 13, cursorBlink: true });
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(termRef.current);
    fitAddon.fit();
    xtermRef.current = term;

    const pty = spawn('powershell.exe', [], {
      cols: term.cols,
      rows: term.rows,
      cwd: cwd || undefined,
    });
    ptyRef.current = pty;

    pty.onData(data => term.write(data));
    term.onData(data => pty.write(data));

    const observer = new ResizeObserver(() => {
      fitAddon.fit();
      pty.resize(term.cols, term.rows);
    });
    observer.observe(termRef.current);

    return () => {
      observer.disconnect();
      term.dispose();
    };
  }, [cwd]);

  return (
    <div style={{ height: '240px', borderTop: '1px solid #333', background: '#1e1e1e', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
      <div style={{ height: '28px', background: '#252526', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 10px', borderBottom: '1px solid #333', flexShrink: 0 }}>
        <span style={{ color: '#ccc', fontSize: '12px' }}>Terminal — PowerShell</span>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#ccc', cursor: 'pointer', fontSize: '14px' }}>✕</button>
      </div>
      <div ref={termRef} style={{ flex: 1, overflow: 'hidden', padding: '4px' }} />
    </div>
  );
}
