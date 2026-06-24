import React from 'react';
import CodeEditor from '../components/editor/CodeEditor';

export default function EditorPanel({ activeFile, updateContent, markSaved }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: '#1e1e1e' }}>
      <CodeEditor
        activeFile={activeFile}
        updateContent={updateContent}
        markSaved={markSaved}
      />
    </div>
  );
}
