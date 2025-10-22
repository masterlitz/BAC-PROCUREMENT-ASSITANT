import React, { useState, useRef, useCallback, useEffect } from 'react';

interface WindowState {
  isMaximized: boolean;
  isMinimized: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

export const useDraggableWindow = (
  isVisible: boolean,
  initialSize: { width: number; height: number }
) => {
  const [windowState, setWindowState] = useState<WindowState>({
    isMaximized: false,
    isMinimized: false,
    position: { x: 100, y: 100 },
    size: initialSize,
  });

  const [isDragging, setIsDragging] = useState(false);
  const dragStartOffset = useRef({ x: 0, y: 0 });
  const nodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible) {
      const w = Math.min(initialSize.width, window.innerWidth * 0.9);
      const h = Math.min(initialSize.height, window.innerHeight * 0.9);
      setWindowState(prev => ({
        ...prev,
        isMaximized: false,
        isMinimized: false,
        size: { width: w, height: h },
        position: {
            x: (window.innerWidth - w) / 2,
            y: (window.innerHeight - h) / 2,
        }
      }));
    }
  }, [isVisible, initialSize.width, initialSize.height]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !nodeRef.current) return;
    
    let newX = e.clientX - dragStartOffset.current.x;
    let newY = e.clientY - dragStartOffset.current.y;

    const { offsetWidth, offsetHeight } = nodeRef.current;
    newX = Math.max(0, Math.min(newX, window.innerWidth - offsetWidth));
    newY = Math.max(0, Math.min(newY, window.innerHeight - offsetHeight));

    setWindowState(prev => ({ ...prev, position: { x: newX, y: newY } }));
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    document.body.style.userSelect = '';
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (windowState.isMaximized || (e.target as HTMLElement).closest('button, input, textarea, select, a, .no-drag')) return;
    setIsDragging(true);
    dragStartOffset.current = {
      x: e.clientX - windowState.position.x,
      y: e.clientY - windowState.position.y,
    };
    document.body.style.userSelect = 'none';
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const toggleMaximize = () => {
    setWindowState(prev => ({
        ...prev,
        isMaximized: !prev.isMaximized,
        isMinimized: prev.isMaximized ? prev.isMinimized : false,
    }));
  };

  const toggleMinimize = () => {
     setWindowState(prev => ({
        ...prev,
        isMinimized: !prev.isMinimized,
        isMaximized: prev.isMinimized ? false : prev.isMaximized,
    }));
  };
  
  const setMaximized = useCallback((isMax: boolean) => {
      setWindowState(prev => ({
          ...prev,
          isMaximized: isMax,
          isMinimized: isMax ? false : prev.isMinimized,
      }));
  }, []);

  useEffect(() => {
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const getWindowStyle = (): React.CSSProperties => {
      if (windowState.isMaximized) {
          return { top: '0', left: '0', width: '100vw', height: '100vh', borderRadius: 0 };
      }
      return {
          top: `${windowState.position.y}px`,
          left: `${windowState.position.x}px`,
          width: `${windowState.size.width}px`,
          height: windowState.isMinimized ? 'auto' : `${windowState.size.height}px`,
      };
  };

  return {
    nodeRef,
    isMaximized: windowState.isMaximized,
    isMinimized: windowState.isMinimized,
    getWindowStyle,
    handleMouseDown,
    toggleMaximize,
    toggleMinimize,
    setMaximized,
  };
};
