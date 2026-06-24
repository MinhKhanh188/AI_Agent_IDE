import React, { useState, useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';

function ContextMenu({ x, y, node, onClose, onOpenTerminal }) {
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    window.addEventListener('mousedown', handler);
    return () => window.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div ref={ref} style={{
      position: 'fixed', top: y, left: x, background: '#2d2d2d', border: '1px solid #444',
      borderRadius: '4px', zIndex: 1000, minWidth: '160px', boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
    }}>
      {node.is_dir && (
        <div
          onClick={() => { onOpenTerminal(node.path); onClose(); }}
          style={{ padding: '7px 14px', fontSize: 'var(--app-font-size)', color: '#ccc', cursor: 'pointer' }}
          onMouseEnter={e => e.currentTarget.style.background = '#094771'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          Open in Terminal (PowerShell)
        </div>
      )}
    </div>
  );
}

function FileTreeNode({ node, activeFilePath, onFileClick, onOpenTerminal, depth = 0 }) {
  const [expanded, setExpanded] = useState(false);
  const [ctxMenu, setCtxMenu] = useState(null);
  const isActive = activeFilePath === node.path;
  const indent = depth * 12;

  function handleContextMenu(e) {
    e.preventDefault();
    e.stopPropagation();
    setCtxMenu({ x: e.clientX, y: e.clientY });
  }

  return (
    <>
      {ctxMenu && (
        <ContextMenu
          x={ctxMenu.x} y={ctxMenu.y}
          node={node}
          onClose={() => setCtxMenu(null)}
          onOpenTerminal={onOpenTerminal}
        />
      )}
      {node.is_dir ? (
        <div>
          <div
            onClick={() => setExpanded(p => !p)}
            onContextMenu={handleContextMenu}
            style={{ paddingLeft: `${indent + 8}px`, paddingTop: '3px', paddingBottom: '3px', cursor: 'pointer', color: '#ccc', fontSize: 'var(--app-font-size)', userSelect: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <span>{expanded ? '▾' : '▸'}</span>
            <span>📁 {node.name}</span>
          </div>
          {expanded && node.children?.map(child => (
            <FileTreeNode key={child.path} node={child} activeFilePath={activeFilePath} onFileClick={onFileClick} onOpenTerminal={onOpenTerminal} depth={depth + 1} />
          ))}
        </div>
      ) : (
        <div
          onClick={() => onFileClick(node)}
          onContextMenu={handleContextMenu}
          style={{ paddingLeft: `${indent + 8}px`, paddingTop: '3px', paddingBottom: '3px', cursor: 'pointer', fontSize: 'var(--app-font-size)', color: isActive ? '#fff' : '#aaa', background: isActive ? '#094771' : 'transparent', userSelect: 'none' }}
        >
          📄 {node.name}
        </div>
      )}
    </>
  );
}

export default function LeftSidebar({ fileTree, setFileTree, openedFiles, activeFilePath, setActiveFilePath, onOpenFile, onOpenTerminal }) {
  const [rootPath, setRootPath] = useState(null);
  const [rootExpanded, setRootExpanded] = useState(true);
  const [rootName, setRootName] = useState('');

  async function handleOpenFolder() {
    const folderPath = await invoke('open_folder');
    if (!folderPath) return;
    const tree = await invoke('read_dir', { path: folderPath });
    const name = folderPath.replace(/\\/g, '/').split('/').pop();
    setRootPath(folderPath);
    setRootName(name);
    setFileTree(tree);
    setRootExpanded(true);
  }

  async function handleFileClick(node) {
    if (openedFiles.find(f => f.path === node.path)) {
      setActiveFilePath(node.path);
      return;
    }
    const content = await invoke('read_file', { path: node.path });
    onOpenFile(node, content);
  }

  return (
    <div style={{ width: '100%', height: '100%', borderRight: '1px solid #333', display: 'flex', flexDirection: 'column', background: '#1e1e1e', overflow: 'hidden' }}>
      <div style={{ padding: '8px' }}>
        <button onClick={handleOpenFolder} style={{ width: '100%', padding: '6px', background: '#0e639c', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer', fontSize: 'var(--app-font-size)' }}>
          Open Folder
        </button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {rootPath && (
          <div>
            <div
              onClick={() => setRootExpanded(p => !p)}
              onContextMenu={(e) => { e.preventDefault(); onOpenTerminal(rootPath); }}
              style={{ paddingLeft: '8px', paddingTop: '4px', paddingBottom: '4px', cursor: 'pointer', color: '#e8e8e8', fontSize: 'var(--app-font-size)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px', userSelect: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <span>{rootExpanded ? '▾' : '▸'}</span>
              <span>{rootName}</span>
            </div>
            {rootExpanded && fileTree.map(node => (
              <FileTreeNode
                key={node.path}
                node={node}
                activeFilePath={activeFilePath}
                onFileClick={handleFileClick}
                onOpenTerminal={onOpenTerminal}
                depth={1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
