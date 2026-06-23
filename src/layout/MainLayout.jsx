import React, { useState } from 'react';
import Sidebar from './Sidebar';
import EditorPanel from './EditorPanel';
import BottomPanel from './BottomPanel';
import AIPanel from './AIPanel';

export default function MainLayout() {
  const [fileTree, setFileTree] = useState([]);
  const [openedFile, setOpenedFile] = useState(null); // { path, name }
  const [fileContent, setFileContent] = useState('');

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <Sidebar
        fileTree={fileTree}
        setFileTree={setFileTree}
        openedFile={openedFile}
        setOpenedFile={setOpenedFile}
        setFileContent={setFileContent}
      />
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
          <EditorPanel
            openedFile={openedFile}
            fileContent={fileContent}
            setFileContent={setFileContent}
          />
          <AIPanel />
        </div>
        <BottomPanel />
      </div>
    </div>
  );
}
