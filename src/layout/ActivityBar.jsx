import React, { useRef } from 'react';

export default function ActivityBar({ openedFiles, activeFilePath, setActiveFilePath, onClose }) {
  const scrollRef = useRef(null);

  return (
    <div
      ref={scrollRef}
      style={{ height: '35px', background: '#252526', borderBottom: '1px solid #1e1e1e', display: 'flex', alignItems: 'center', flexShrink: 0, overflowX: 'auto', overflowY: 'hidden' }}
    >
      {openedFiles.map(file => {
        const isActive = file.path === activeFilePath;
        return (
          <div
            key={file.path}
            onClick={() => setActiveFilePath(file.path)}
            title={file.path}
            style={{
              height: '100%',
              padding: '0 10px 0 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: isActive ? '#1e1e1e' : 'transparent',
              borderRight: '1px solid #1e1e1e',
              borderTop: isActive ? '1px solid #007acc' : '1px solid transparent',
              color: isActive ? '#fff' : '#888',
              fontSize: '13px',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              cursor: 'pointer',
              userSelect: 'none',
              boxSizing: 'border-box',
            }}
          >
            <span style={{ fontSize: '11px' }}>📄</span>
            <span>{file.name}</span>
            {file.dirty && (
              <span style={{ color: '#e2c08d', fontSize: '16px', lineHeight: 1, marginLeft: '2px' }}>●</span>
            )}
            <span
              onClick={e => { e.stopPropagation(); onClose(file.path); }}
              title="Close"
              style={{
                marginLeft: '4px',
                color: '#888',
                fontSize: '14px',
                lineHeight: 1,
                cursor: 'pointer',
                padding: '1px 3px',
                borderRadius: '3px',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#555'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#888'; }}
            >✕</span>
          </div>
        );
      })}
    </div>
  );
}
