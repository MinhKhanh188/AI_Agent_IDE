import React from 'react';

export default function ActivityBar({ openedFile }) {
  return (
    <div style={{ height: '35px', background: '#252526', borderBottom: '1px solid #1e1e1e', display: 'flex', alignItems: 'center', flexShrink: 0, overflowX: 'auto' }}>
      {openedFile && (
        <div style={{
          height: '100%',
          padding: '0 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: '#1e1e1e',
          borderRight: '1px solid #333',
          color: '#ccc',
          fontSize: '13px',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}>
          <span>📄</span>
          <span>{openedFile.name}</span>
        </div>
      )}
    </div>
  );
}
