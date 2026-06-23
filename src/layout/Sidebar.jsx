import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';

function FileTreeNode({ node, openedFile, onFileClick, depth = 0 }) {
  const [expanded, setExpanded] = useState(false);

  const isActive = openedFile?.path === node.path;
  const indent = depth * 12;

  if (node.is_dir) {
    return (
      <div>
        <div
          onClick={() => setExpanded(p => !p)}
          style={{
            paddingLeft: `${indent + 8}px`,
            paddingTop: '3px',
            paddingBottom: '3px',
            cursor: 'pointer',
            color: '#ccc',
            fontSize: '13px',
            userSelect: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <span>{expanded ? '▾' : '▸'}</span>
          <span>📁 {node.name}</span>
        </div>
        {expanded && node.children?.map(child => (
          <FileTreeNode
            key={child.path}
            node={child}
            openedFile={openedFile}
            onFileClick={onFileClick}
            depth={depth + 1}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      onClick={() => onFileClick(node)}
      style={{
        paddingLeft: `${indent + 8}px`,
        paddingTop: '3px',
        paddingBottom: '3px',
        cursor: 'pointer',
        fontSize: '13px',
        color: isActive ? '#fff' : '#aaa',
        background: isActive ? '#094771' : 'transparent',
        userSelect: 'none',
      }}
    >
      📄 {node.name}
    </div>
  );
}

export default function Sidebar({ fileTree, setFileTree, openedFile, setOpenedFile, setFileContent }) {
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
    <div style={{ width: '250px', borderRight: '1px solid #333', display: 'flex', flexDirection: 'column', background: '#1e1e1e', overflow: 'hidden' }}>
      <div style={{ padding: '8px' }}>
        <button
          onClick={handleOpenFolder}
          style={{ width: '100%', padding: '6px', background: '#0e639c', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer', fontSize: '12px' }}
        >
          Open Folder
        </button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {fileTree.map(node => (
          <FileTreeNode
            key={node.path}
            node={node}
            openedFile={openedFile}
            onFileClick={handleFileClick}
          />
        ))}
      </div>
    </div>
  );
}
