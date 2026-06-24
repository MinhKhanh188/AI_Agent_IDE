import React, { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { spawn } from 'tauri-pty';
import { useAppContext } from '../context/AppContext';
import 'xterm/css/xterm.css';

export default function BottomPanel({ cwd, onClose }) {
  const termRef = useRef(null);
  const xtermRef = useRef(null);
  const ptyRef = useRef(null);
  const fitAddonRef = useRef(null);

  const { fontSize } = useAppContext();

  // Initialize xterm once
  useEffect(() => {
    if (!termRef.current) return;

    const term = new Terminal({
      theme: { background: '#1e1e1e', foreground: '#cccccc' },
      fontSize: fontSize,
      cursorBlink: true,
      allowTransparency: false,
    });
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    fitAddonRef.current = fitAddon;

    term.open(termRef.current);
    fitAddon.fit();
    xtermRef.current = term;
    term.focus();

    const pty = spawn('powershell.exe', [], {
      cols: term.cols,
      rows: term.rows,
      cwd: cwd || undefined,
    });
    ptyRef.current = pty;
    pty.onData(data => term.write(data));
    term.onData(data => pty.write(data));

    const observer = new ResizeObserver(() => {
      if (!xtermRef.current) return;
      fitAddon.fit();
      ptyRef.current?.resize(xtermRef.current.cols, xtermRef.current.rows);
    });
    observer.observe(termRef.current);

    return () => {
      observer.disconnect();
      ptyRef.current?.kill();
      term.dispose();
      xtermRef.current = null;
      ptyRef.current = null;
      fitAddonRef.current = null;
    };
  }, [cwd]);

  // Handle font size changes after mount
  useEffect(() => {
    if (xtermRef.current) {
      xtermRef.current.options.fontSize = fontSize;
      fitAddonRef.current?.fit();
      ptyRef.current?.resize(xtermRef.current.cols, xtermRef.current.rows);
    }
  }, [fontSize]);

  return (
    <div style={{ height: '100%', borderTop: '1px solid #333', background: '#1e1e1e', display: 'flex', flexDirection: 'column' }}>
      <div style={{ height: '28px', background: '#252526', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 10px', borderBottom: '1px solid #333', flexShrink: 0 }}>
        <span style={{ color: '#ccc', fontSize: '12px' }}>Terminal — PowerShell</span>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#ccc', cursor: 'pointer', fontSize: '14px' }}>✕</button>
      </div>
      <div
        ref={termRef}
        style={{ flex: 1, overflow: 'hidden' }}
        tabIndex={0}
        onFocus={() => xtermRef.current?.focus()}
      />
    </div>
  );
}