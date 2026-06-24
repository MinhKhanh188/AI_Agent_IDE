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

export default function CodeEditor({ openedFile, fileContent, setFileContent }) {
  const editorRef = useRef(null);
  const { fontSize } = useAppContext();

  useEffect(() => {
    const handleKeyDown = async (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (!openedFile) return;
        await invoke('write_file', { path: openedFile.path, content: fileContent });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openedFile, fileContent]);

  if (!openedFile) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', fontSize: '14px', background: '#1e1e1e' }}>
        Open a file to start editing
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '6px 12px', background: '#252526', color: '#ccc', fontSize: '12px', borderBottom: '1px solid #333' }}>
        {openedFile.name}
      </div>
      <div style={{ flexGrow: 1, overflow: 'hidden' }}>
        <Editor
          height="100%"
          language={detectLanguage(openedFile.name)}
          theme="vs-dark"
          value={fileContent}
          onChange={(value) => setFileContent(value ?? '')}
          options={{
            fontSize: fontSize,
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