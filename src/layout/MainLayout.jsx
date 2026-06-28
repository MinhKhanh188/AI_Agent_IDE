import React, { useState, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import LeftSideToolbar from './LeftSideToolbar';
import ActivityBar from './ActivityBar';
import LeftSidebar from './LeftSidebar';
import EditorPanel from './EditorPanel';
import AIPanel from './AIPanel';
import BottomPanel from './BottomPanel';
import ResizablePanel from '../components/common/ResizablePanel';

export default function MainLayout() {
  // ── Global project state from context ─────────────────────────────────────
  const {
    fileTree, setFileTree,
    openedFiles, setOpenedFiles,
    activeFilePath, setActiveFilePath,
    openFile,
  } = useAppContext();

  // ── UI toggle state (local — not needed globally) ─────────────────────────
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [aiPanelOpen, setAiPanelOpen] = useState(true);
  const [bottomPanelOpen, setBottomPanelOpen] = useState(false);
  const [terminalCwd, setTerminalCwd] = useState(null);

  // ── Derived ───────────────────────────────────────────────────────────────
  const activeFile = openedFiles.find(f => f.path === activeFilePath) ?? null;

  // ── File operations (stay local — they only mutate openedFiles/activeFilePath) ──
  const closeFile = useCallback((path) => {
    setOpenedFiles(prev => {
      const idx = prev.findIndex(f => f.path === path);
      const next = prev.filter(f => f.path !== path);
      setActiveFilePath(ap => {
        if (ap !== path) return ap;
        if (next.length === 0) return null;
        return next[Math.min(idx, next.length - 1)].path;
      });
      return next;
    });
  }, [setOpenedFiles, setActiveFilePath]);

  const updateContent = useCallback((path, content) => {
    setOpenedFiles(prev => prev.map(f =>
      f.path === path ? { ...f, content, dirty: content !== f.savedContent } : f
    ));
  }, [setOpenedFiles]);

  const markSaved = useCallback((path) => {
    setOpenedFiles(prev => prev.map(f =>
      f.path === path ? { ...f, savedContent: f.content, dirty: false } : f
    ));
  }, [setOpenedFiles]);

  function handleOpenTerminal(folderPath) {
    setTerminalCwd(folderPath);
    setBottomPanelOpen(true);
  }

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: '#1e1e1e' }}>
      <LeftSideToolbar
        sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}
        aiPanelOpen={aiPanelOpen} setAiPanelOpen={setAiPanelOpen}
        bottomPanelOpen={bottomPanelOpen} setBottomPanelOpen={setBottomPanelOpen}
      />
      <div style={{ display: 'flex', flex: 1, minWidth: 0 }}>
        {sidebarOpen && (
          <ResizablePanel edge="right" minSize={150} maxSize={500} defaultSize={250}>
            <LeftSidebar
              fileTree={fileTree} setFileTree={setFileTree}
              openedFiles={openedFiles}
              activeFilePath={activeFilePath}
              setActiveFilePath={setActiveFilePath}
              onOpenFile={openFile}
              onOpenTerminal={handleOpenTerminal}
            />
          </ResizablePanel>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
          <ActivityBar
            openedFiles={openedFiles}
            activeFilePath={activeFilePath}
            setActiveFilePath={setActiveFilePath}
            onClose={closeFile}
          />
          <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
            <EditorPanel
              activeFile={activeFile}
              updateContent={updateContent}
              markSaved={markSaved}
            />
            {aiPanelOpen && (
              <ResizablePanel edge="left" minSize={200} maxSize={600} defaultSize={300}>
                <AIPanel />
              </ResizablePanel>
            )}
          </div>
          {bottomPanelOpen && (
            <ResizablePanel edge="top" minSize={120} maxSize={600} defaultSize={240}>
              <BottomPanel cwd={terminalCwd} onClose={() => setBottomPanelOpen(false)} />
            </ResizablePanel>
          )}
        </div>
      </div>
    </div>
  );
}
