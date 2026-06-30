import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { DEFAULT_PROVIDERS } from '../services/ai/ai-providers';
import { readDir } from '../services/fs/file-service';

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

  // ── AI providers (user-defined, fully custom) ───────────────────────────────
  const [aiProviders, setAiProvidersRaw] = useState(() => {
    try {
      const val = localStorage.getItem('aiide_ai_providers');
      return val ? JSON.parse(val) : DEFAULT_PROVIDERS;
    } catch {
      return DEFAULT_PROVIDERS;
    }
  });
  const setAiProviders = useCallback((updater) => {
    setAiProvidersRaw(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      try { localStorage.setItem('aiide_ai_providers', JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const [activeProviderId, setActiveProviderIdRaw] = useState(() => {
    try { return localStorage.getItem('aiide_active_provider_id') || DEFAULT_PROVIDERS[0].id; }
    catch { return DEFAULT_PROVIDERS[0].id; }
  });
  const setActiveProviderId = useCallback((updater) => {
    setActiveProviderIdRaw(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      try { localStorage.setItem('aiide_active_provider_id', next ?? ''); } catch {}
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

  /** Update an open tab's content and set dirty flag based on savedContent diff. */
  const updateContent = useCallback((path, content) => {
    setOpenedFiles(prev => prev.map(f =>
      f.path === path ? { ...f, content, dirty: content !== f.savedContent } : f
    ));
  }, [setOpenedFiles]);

  /** Mark a tab as saved (clear dirty flag, set savedContent = current content). */
  const markSaved = useCallback((path) => {
    setOpenedFiles(prev => prev.map(f =>
      f.path === path ? { ...f, savedContent: f.content, dirty: false } : f
    ));
  }, [setOpenedFiles]);

  /** Refresh the file tree from disk for a given root path. */
  const refreshTree = useCallback(async (path) => {
    if (!path) return;
    try {
      const tree = await readDir(path);
      setFileTree(tree);
    } catch (err) {
      console.error('Failed to refresh file tree:', err);
    }
  }, [setFileTree]);

  return (
    <AppContext.Provider
      value={{
        // font
        fontSize, setFontSize,
        // project
        rootPath, setRootPath,
        rootFolderPath: rootPath,
        fileTree, setFileTree,
        openedFiles, setOpenedFiles,
        activeFilePath, setActiveFilePath,
        openFile,
        // editor tab helpers
        updateContent, markSaved,
        refreshTree,
        // terminal
        terminalCwd, setTerminalCwd,
        // AI
        aiProviders, setAiProviders,
        activeProviderId, setActiveProviderId,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
