import React, { useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { invoke } from '@tauri-apps/api/core';
import { useAppContext } from '../../context/AppContext';

function detectLanguage(filename) {
  if (!filename) return 'plaintext';
  const ext = filename.split('.').pop().toLowerCase();
  const map = {
    js: 'javascript', jsx: 'javascript',
    ts: 'typescript', tsx: 'typescript',
    rs: 'rust', py: 'python',
    json: 'json', md: 'markdown',
    html: 'html', css: 'css',
    java: 'java', toml: 'toml', yaml: 'yaml', yml: 'yaml',
  };
  return map[ext] || 'plaintext';
}

export default function CodeEditor({ activeFile, updateContent, markSaved }) {
  const { fontSize } = useAppContext();
  const editorRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = async (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (!activeFile) return;
        await invoke('write_file', { path: activeFile.path, content: activeFile.content });
        markSaved(activeFile.path);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeFile, markSaved]);

  if (!activeFile) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', fontSize: 'var(--app-font-size)', background: '#1e1e1e' }}>
        Open a file to start editing
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flexGrow: 1, overflow: 'hidden' }}>
        <Editor
          key={activeFile.path}
          height="100%"
          language={detectLanguage(activeFile.name)}
          theme="vs-dark"
          value={activeFile.content}
          onChange={(value) => updateContent(activeFile.path, value ?? '')}
          options={{
            fontSize,
            minimap: { enabled: true },
            automaticLayout: true,
            scrollbar: { vertical: 'visible', horizontal: 'visible' },
          }}
          onMount={(editor) => { editorRef.current = editor; }}
        />
      </div>
    </div>
  );
}