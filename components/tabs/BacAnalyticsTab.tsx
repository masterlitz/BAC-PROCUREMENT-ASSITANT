
import React, { useState, useEffect, useRef, useCallback } from 'react';

interface BacAnalyticsTabProps {
    isVisible: boolean;
    onClose: () => void;
}

const BacAnalyticsTab: React.FC<BacAnalyticsTabProps> = ({ isVisible, onClose }) => {
    const iframeSrc = "https://pages.hive.com/?shareToken=dpvt_aW2mx98Z4HuxKF3qX2DenMdzsui2DkzxATg8Mt5gFgWjy8cuMpDXSbtMdL78bXbZ";

    const [isMaximized, setIsMaximized] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [position, setPosition] = useState({ x: 100, y: 100 });
    const [size, setSize] = useState({ width: 800, height: 600 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStartOffset = useRef({ x: 0, y: 0 });
    const nodeRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isVisible) {
            setIsMaximized(false);
            setIsMinimized(false);
            const initialWidth = Math.min(1200, window.innerWidth * 0.8);
            const initialHeight = Math.min(800, window.innerHeight * 0.8);
            setSize({ width: initialWidth, height: initialHeight });
            setPosition({
                x: (window.innerWidth - initialWidth) / 2,
                y: (window.innerHeight - initialHeight) / 2
            });
        }
    }, [isVisible]);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging || !nodeRef.current) return;
        
        let newX = e.clientX - dragStartOffset.current.x;
        let newY = e.clientY - dragStartOffset.current.y;

        // Boundary checks to keep the window on screen
        const { offsetWidth, offsetHeight } = nodeRef.current;
        newX = Math.max(0, Math.min(newX, window.innerWidth - offsetWidth));
        newY = Math.max(0, Math.min(newY, window.innerHeight - offsetHeight));

        setPosition({ x: newX, y: newY });
    }, [isDragging]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
        document.body.style.userSelect = '';
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    }, [handleMouseMove]);

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault(); // Prevent default browser drag behavior
        if (isMaximized || (e.target as HTMLElement).closest('button')) return;
        setIsDragging(true);
        dragStartOffset.current = {
            x: e.clientX - position.x,
            y: e.clientY - position.y,
        };
        document.body.style.userSelect = 'none';
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    const toggleMaximize = () => {
        setIsMaximized(!isMaximized);
        if (isMinimized) setIsMinimized(false);
    };

    const toggleMinimize = () => {
        setIsMinimized(!isMinimized);
        if (isMaximized) setIsMaximized(false);
    };
    
    // Cleanup listeners on unmount
    useEffect(() => {
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);

    if (!isVisible) {
        return null;
    }

    const windowStyle: React.CSSProperties = isMaximized ? {
        top: '0', left: '0', width: '100vw', height: '100vh', borderRadius: 0,
    } : {
        top: `${position.y}px`, left: `${position.x}px`, width: `${size.width}px`, height: isMinimized ? 'auto' : `${size.height}px`,
    };

    const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
    const MaximizeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4h4m12 4V4h-4M4 16v4h4m12-4v4h-4" /></svg>;
    const RestoreIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-4h4m-4 0l4-4m6 8v4h-4m4-4l-4-4" /></svg>;
    const MinimizeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>;

    return (
        <div 
            ref={nodeRef}
            className="fixed bg-white rounded-lg shadow-2xl flex flex-col z-50 overflow-hidden border border-gray-300 transition-all duration-300 ease-in-out"
            style={windowStyle}
        >
            <div 
                onMouseDown={handleMouseDown}
                className={`flex items-center justify-between p-2 bg-gray-100 border-b border-gray-200 flex-shrink-0 ${isMaximized ? '' : 'cursor-move'}`}
            >
                <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
                    </svg>
                    <h2 className="text-sm font-bold text-gray-700 select-none">BAC Analytics Dashboard</h2>
                </div>
                <div className="flex items-center space-x-1">
                    <button onClick={toggleMinimize} className="p-1.5 rounded-full hover:bg-gray-200 text-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-400"><MinimizeIcon /></button>
                    <button onClick={toggleMaximize} className="p-1.5 rounded-full hover:bg-gray-200 text-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-400">
                        {isMaximized ? <RestoreIcon /> : <MaximizeIcon />}
                    </button>
                    <button onClick={onClose} className="p-1.5 rounded-full hover:bg-red-500 hover:text-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-red-400"><CloseIcon /></button>
                </div>
            </div>

            <div className={`flex-grow w-full h-full overflow-hidden transition-all duration-300 ${isMinimized ? 'hidden' : 'block'}`}>
                <iframe
                    src={iframeSrc}
                    title="BAC Analytics Dashboard"
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    allowFullScreen
                    scrolling="yes"
                    className="select-none"
                ></iframe>
            </div>
        </div>
    );
};

export default BacAnalyticsTab;
