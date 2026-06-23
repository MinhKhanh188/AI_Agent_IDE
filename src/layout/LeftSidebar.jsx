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
          style={{ padding: '7px 14px', fontSize: '12px', color: '#ccc', cursor: 'pointer' }}
          onMouseEnter={e => e.currentTarget.style.background = '#094771'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          Open in Terminal (PowerShell)
        </div>
      )}
    </div>
  );
}

function FileTreeNode({ node, openedFile, onFileClick, onOpenTerminal, depth = 0 }) {
  const [expanded, setExpanded] = useState(false);
  const [ctxMenu, setCtxMenu] = useState(null);
  const isActive = openedFile?.path === node.path;
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
            style={{ paddingLeft: `${indent + 8}px`, paddingTop: '3px', paddingBottom: '3px', cursor: 'pointer', color: '#ccc', fontSize: '13px', userSelect: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <span>{expanded ? '▾' : '▸'}</span>
            <span>📁 {node.name}</span>
          </div>
          {expanded && node.children?.map(child => (
            <FileTreeNode key={child.path} node={child} openedFile={openedFile} onFileClick={onFileClick} onOpenTerminal={onOpenTerminal} depth={depth + 1} />
          ))}
        </div>
      ) : (
        <div
          onClick={() => onFileClick(node)}
          onContextMenu={handleContextMenu}
          style={{ paddingLeft: `${indent + 8}px`, paddingTop: '3px', paddingBottom: '3px', cursor: 'pointer', fontSize: '13px', color: isActive ? '#fff' : '#aaa', background: isActive ? '#094771' : 'transparent', userSelect: 'none' }}
        >
          📄 {node.name}
        </div>
      )}
    </>
  );
}

export default function LeftSidebar({ fileTree, setFileTree, openedFile, setOpenedFile, setFileContent, onOpenTerminal }) {
  async function handleOpenFolder() {
    const folderPath = await invoke('open_folder');
    if (!folderPath) return;
    const tree = await invoke('read_dir', { path: folderPath });
    setFileTree(tree);
  }

  async function handleFileClick(node) {
    const content = await invoke('read_file', { path: node.path });
    setOpenedFile({ path: node.path, name: node.name });
    setFileContent(content);
  }

  return (
    <div style={{ width: '250px', borderRight: '1px solid #333', display: 'flex', flexDirection: 'column', background: '#1e1e1e', overflow: 'hidden', flexShrink: 0 }}>
      <div style={{ padding: '8px' }}>
        <button onClick={handleOpenFolder} style={{ width: '100%', padding: '6px', background: '#0e639c', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer', fontSize: '12px' }}>
          Open Folder
        </button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {fileTree.map(node => (
          <FileTreeNode key={node.path} node={node} openedFile={openedFile} onFileClick={handleFileClick} onOpenTerminal={onOpenTerminal} />
        ))}
      </div>
    </div>
  );
}
