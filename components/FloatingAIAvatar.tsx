import React, { useState, useEffect, useRef, useCallback } from 'react';
import { litzAiAvatar } from '../data/logo';

interface FloatingAIAvatarProps {
    onOpen: () => void;
}

const FloatingAIAvatar: React.FC<FloatingAIAvatarProps> = ({ onOpen }) => {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    
    const dragOffsetRef = useRef({ x: 0, y: 0 });
    const wasDraggedRef = useRef(false);

    // Set initial position on mount and handle window resize
    useEffect(() => {
        const avatarSize = 64;
        const margin = 24;

        const setInitialPosition = () => {
             setPosition({
                x: window.innerWidth - avatarSize - margin,
                y: window.innerHeight - avatarSize - margin
            });
        };
        setInitialPosition();

        const handleResize = () => {
            setPosition(prev => ({
                x: Math.max(margin, Math.min(prev.x, window.innerWidth - avatarSize - margin)),
                y: Math.max(margin, Math.min(prev.y, window.innerHeight - avatarSize - margin))
            }));
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (e.button !== 0) return;
        
        wasDraggedRef.current = false;
        setIsDragging(true);
        
        const rect = e.currentTarget.getBoundingClientRect();
        dragOffsetRef.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging) return;
        wasDraggedRef.current = true;

        const avatarSize = 64;
        const margin = 24;
        let newX = e.clientX - dragOffsetRef.current.x;
        let newY = e.clientY - dragOffsetRef.current.y;

        newX = Math.max(margin, Math.min(newX, window.innerWidth - avatarSize - margin));
        newY = Math.max(margin, Math.min(newY, window.innerHeight - avatarSize - margin));
        
        setPosition({ x: newX, y: newY });
    }, [isDragging]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
        // Use a timeout to ensure this runs after the click event handler has had a chance to fire
        setTimeout(() => {
            wasDraggedRef.current = false;
        }, 0);
    }, []);

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        } else {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);


    const handleClick = (e: React.MouseEvent) => {
        if (wasDraggedRef.current) {
            e.preventDefault();
            return;
        }
        onOpen();
    };

    return (
        <button
            onClick={handleClick}
            onMouseDown={handleMouseDown}
            className={`floating-ai-avatar ${isDragging ? 'is-dragging' : ''}`}
            aria-label="Open Litz AI Assistant"
            style={{
                bottom: 'auto', 
                right: 'auto',
                left: `${position.x}px`,
                top: `${position.y}px`,
                touchAction: 'none'
            }}
        >
            <div className="litz-avatar-container w-full h-full">
                <img src={litzAiAvatar} alt="Litz AI Assistant" draggable="false" onDragStart={(e) => e.preventDefault()} />
            </div>
        </button>
    );
};

export default FloatingAIAvatar;