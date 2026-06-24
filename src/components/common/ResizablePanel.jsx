import React, { useRef, useCallback } from 'react';

export default function ResizablePanel({ edge, minSize, maxSize, defaultSize, style, children }) {
  const sizeRef = useRef(defaultSize);
  const panelRef = useRef(null);

  const isHorizontal = edge === 'left' || edge === 'right';

  const onMouseDown = useCallback((e) => {
    e.preventDefault();
    const startPos = isHorizontal ? e.clientX : e.clientY;
    const startSize = sizeRef.current;

    function onMouseMove(e) {
      const delta = isHorizontal ? e.clientX - startPos : e.clientY - startPos;
      let newSize;
      if (edge === 'right') newSize = startSize + delta;
      else if (edge === 'left') newSize = startSize - delta;
      else if (edge === 'top') newSize = startSize - delta;

      newSize = Math.min(Math.max(newSize, minSize), maxSize);
      sizeRef.current = newSize;
      if (panelRef.current) {
        panelRef.current.style[isHorizontal ? 'width' : 'height'] = `${newSize}px`;
      }
    }

    function onMouseUp() {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    }

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }, [edge, minSize, maxSize, isHorizontal]);

  const handleStyle = {
    position: 'absolute',
    background: 'transparent',
    zIndex: 10,
    transition: 'background 0.15s',
    ...(isHorizontal ? {
      top: 0, bottom: 0, width: '4px',
      cursor: 'col-resize',
      [edge === 'right' ? 'right' : 'left']: 0,
    } : {
      left: 0, right: 0, height: '4px',
      cursor: 'row-resize',
      top: 0,
    }),
  };

  const panelStyle = {
    position: 'relative',
    flexShrink: 0,
    [isHorizontal ? 'width' : 'height']: `${defaultSize}px`,
    ...style,
  };

  return (
    <div ref={panelRef} style={panelStyle}>
      <div
        style={handleStyle}
        onMouseDown={onMouseDown}
        onMouseEnter={e => e.currentTarget.style.background = '#0e639c'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      />
      {children}
    </div>
  );
}
