import React from 'react';
import CodeEditor from '../components/editor/CodeEditor';

export default function EditorPanel({ openedFile, fileContent, setFileContent }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: '#1e1e1e' }}>
      <CodeEditor
        openedFile={openedFile}
        fileContent={fileContent}
        setFileContent={setFileContent}
      />
    </div>
  );
}
