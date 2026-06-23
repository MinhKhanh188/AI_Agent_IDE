import React, { useState } from 'react';
import Toolbar from './Toolbar';
import LeftSidebar from './LeftSidebar';
import EditorPanel from './EditorPanel';
import AIPanel from './AIPanel';
import BottomPanel from './BottomPanel';

export default function MainLayout() {
  const [fileTree, setFileTree] = useState([]);
  const [openedFile, setOpenedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [aiPanelOpen, setAiPanelOpen] = useState(true);
  const [bottomPanelOpen, setBottomPanelOpen] = useState(false);
  const [terminalCwd, setTerminalCwd] = useState(null);

  function handleOpenTerminal(folderPath) {
    setTerminalCwd(folderPath);
    setBottomPanelOpen(true);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden', background: '#1e1e1e' }}>
      <Toolbar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        aiPanelOpen={aiPanelOpen}
        setAiPanelOpen={setAiPanelOpen}
        bottomPanelOpen={bottomPanelOpen}
        setBottomPanelOpen={setBottomPanelOpen}
      />
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {sidebarOpen && (
          <LeftSidebar
            fileTree={fileTree}
            setFileTree={setFileTree}
            openedFile={openedFile}
            setOpenedFile={setOpenedFile}
            setFileContent={setFileContent}
            onOpenTerminal={handleOpenTerminal}
          />
        )}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
            <EditorPanel
              openedFile={openedFile}
              fileContent={fileContent}
              setFileContent={setFileContent}
            />
            {aiPanelOpen && <AIPanel />}
          </div>
          {bottomPanelOpen && (
            <BottomPanel
              cwd={terminalCwd}
              onClose={() => setBottomPanelOpen(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
