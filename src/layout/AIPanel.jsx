import React from 'react';

export default function AIPanel() {
  return (
    <div style={{ width: '100%', height: '100%', borderLeft: '1px solid #333', background: '#1e1e1e', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '8px 12px', borderBottom: '1px solid #333', color: '#ccc', fontSize: '12px' }}>
        AI Assistant
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', fontSize: '13px' }}>
        Coming soon
      </div>
    </div>
  );
}
