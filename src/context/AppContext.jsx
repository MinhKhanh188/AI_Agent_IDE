import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // ── Font size ──────────────────────────────────────────────────────────────
  const [fontSize, setFontSizeRaw] = useState(() => {
    try {
      const val = localStorage.getItem('aiide_fontSize');
      return val ? Number(val) : 13;
    } catch {
      return 13;
    }
  });
  const setFontSize = useCallback((updater) => {
    setFontSizeRaw(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      try { localStorage.setItem('aiide_fontSize', String(next)); } catch {}
      return next;
    });
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty('--app-font-size', `${fontSize}px`);
    document.documentElement.style.setProperty('--app-icon-size', `${fontSize + 4}px`);
  }, [fontSize]);

  // ── Project / file state ───────────────────────────────────────────────────
  const [rootPath, setRootPathRaw] = useState(() => {
    try { return localStorage.getItem('aiide_rootPath') || null; }
    catch { return null; }
  });
  const setRootPath = useCallback((updater) => {
    setRootPathRaw(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      try { localStorage.setItem('aiide_rootPath', next ?? ''); } catch {}
      return next;
    });
  }, []);

  const [fileTree, setFileTreeRaw] = useState(() => {
    try {
      const val = localStorage.getItem('aiide_fileTree');
      return val ? JSON.parse(val) : [];
    } catch {
      return [];
    }
  });
  const setFileTree = useCallback((updater) => {
    setFileTreeRaw(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      try { localStorage.setItem('aiide_fileTree', JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const [openedFiles, setOpenedFilesRaw] = useState(() => {
    try {
      const val = localStorage.getItem('aiide_openedFiles');
      return val ? JSON.parse(val) : [];
    } catch {
      return [];
    }
  });
  const setOpenedFiles = useCallback((updater) => {
    setOpenedFilesRaw(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      try {
        const stripped = next.map(({ path, name, dirty }) => ({ path, name, dirty }));
        localStorage.setItem('aiide_openedFiles', JSON.stringify(stripped));
      } catch {}
      return next;
    });
  }, []);

  const [activeFilePath, setActiveFilePathRaw] = useState(() => {
    try { return localStorage.getItem('aiide_activeFilePath') || null; }
    catch { return null; }
  });
  const setActiveFilePath = useCallback((updater) => {
    setActiveFilePathRaw(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      try { localStorage.setItem('aiide_activeFilePath', next ?? ''); } catch {}
      return next;
    });
  }, []);

  // ── Terminal CWD ───────────────────────────────────────────────────────────
  const [terminalCwd, setTerminalCwdRaw] = useState(() => {
    try { return localStorage.getItem('aiide_terminalCwd') || null; }
    catch { return null; }
  });
  const setTerminalCwd = useCallback((updater) => {
    setTerminalCwdRaw(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      try { localStorage.setItem('aiide_terminalCwd', next ?? ''); } catch {}
      return next;
    });
  }, []);

  // ── AI config ──────────────────────────────────────────────────────────────
  const [aiConfig, setAiConfigRaw] = useState(() => {
    try {
      const val = localStorage.getItem('aiide_ai_config');
      return val ? JSON.parse(val) : {
        provider: 'ollama',
        model: 'qwen3.5:9b',
        apiKey: '',
        customBaseUrl: '',
      };
    } catch {
      return { provider: 'ollama', model: 'qwen3.5:9b', apiKey: '', customBaseUrl: '' };
    }
  });
  const setAiConfig = useCallback((updater) => {
    setAiConfigRaw(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      try { localStorage.setItem('aiide_ai_config', JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  /** Open a file node in the editor. Appends to openedFiles if not already present. */
  const openFile = useCallback((node, content = null) => {
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
        // terminal
        terminalCwd, setTerminalCwd,
        // AI
        aiConfig, setAiConfig,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
