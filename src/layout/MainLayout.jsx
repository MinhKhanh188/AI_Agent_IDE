import React, { useState } from 'react';
import Toolbar from './Toolbar';
import LeftSidebar from './LeftSidebar';
import EditorPanel from './EditorPanel';
import AIPanel from './AIPanel';
import BottomPanel from './BottomPanel';
import ResizablePanel from '../components/common/ResizablePanel';

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
          <ResizablePanel edge="right" minSize={150} maxSize={500} defaultSize={250}>
            <LeftSidebar
              fileTree={fileTree}
              setFileTree={setFileTree}
              openedFile={openedFile}
              setOpenedFile={setOpenedFile}
              setFileContent={setFileContent}
              onOpenTerminal={handleOpenTerminal}
            />
          </ResizablePanel>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
            <EditorPanel
              openedFile={openedFile}
              fileContent={fileContent}
              setFileContent={setFileContent}
            />
            {aiPanelOpen && (
              <ResizablePanel edge="left" minSize={200} maxSize={600} defaultSize={300}>
                <AIPanel />
              </ResizablePanel>
            )}
          </div>
          {bottomPanelOpen && (
            <ResizablePanel edge="top" minSize={120} maxSize={600} defaultSize={240}>
              <BottomPanel
                cwd={terminalCwd}
                onClose={() => setBottomPanelOpen(false)}
              />
            </ResizablePanel>
          )}
        </div>
      </div>
    </div>
  );
}
