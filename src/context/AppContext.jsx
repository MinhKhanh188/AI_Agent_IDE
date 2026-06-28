import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // ── Font size ──────────────────────────────────────────────────────────────
  const [fontSize, setFontSize] = useState(13);

  useEffect(() => {
    document.documentElement.style.setProperty('--app-font-size', `${fontSize}px`);
    document.documentElement.style.setProperty('--app-icon-size', `${fontSize + 4}px`);
  }, [fontSize]);

  // ── Project / file state ───────────────────────────────────────────────────
  const [rootPath, setRootPath] = useState(null);
  const [fileTree, setFileTree] = useState([]);
  const [openedFiles, setOpenedFiles] = useState([]);
  const [activeFilePath, setActiveFilePath] = useState(null);

  /** Open a file node in the editor. Appends to openedFiles if not already present. */
  const openFile = useCallback((node, content) => {
    setOpenedFiles(prev => {
      if (prev.find(f => f.path === node.path)) return prev;
      return [...prev, { path: node.path, name: node.name, content, savedContent: content, dirty: false }];
    });
    setActiveFilePath(node.path);
  }, []);

  return (
    <AppContext.Provider
      value={{
        // font
        fontSize, setFontSize,
        // project
        rootPath, setRootPath,
        fileTree, setFileTree,
        openedFiles, setOpenedFiles,
        activeFilePath, setActiveFilePath,
        openFile,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
