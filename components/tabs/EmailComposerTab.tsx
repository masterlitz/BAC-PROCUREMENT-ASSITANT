import React, { useState, useEffect, useRef, useCallback } from 'react';

interface EmailComposerTabProps {
    isVisible: boolean;
    onClose: () => void;
}

const EmailComposerTab: React.FC<EmailComposerTabProps> = ({ isVisible, onClose }) => {
    // Window state
    const [isMaximized, setIsMaximized] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [position, setPosition] = useState({ x: 120, y: 120 });
    const [size, setSize] = useState({ width: 700, height: 600 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStartOffset = useRef({ x: 0, y: 0 });
    const nodeRef = useRef<HTMLDivElement>(null);

    // Email state
    const [to, setTo] = useState('litogarin@gmail.com');
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [sendStatus, setSendStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
    const [sendError, setSendError] = useState('');

    useEffect(() => {
        if (isVisible) {
            setIsMaximized(false);
            setIsMinimized(false);
            const initialWidth = Math.min(700, window.innerWidth * 0.7);
            const initialHeight = Math.min(600, window.innerHeight * 0.7);
            setSize({ width: initialWidth, height: initialHeight });
            setPosition({
                x: (window.innerWidth - initialWidth) / 2,
                y: (window.innerHeight - initialHeight) / 2,
            });
        }
    }, [isVisible]);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging || !nodeRef.current) return;
        let newX = e.clientX - dragStartOffset.current.x;
        let newY = e.clientY - dragStartOffset.current.y;
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
        if (isMaximized || (e.target as HTMLElement).closest('button, input, textarea')) return;
        setIsDragging(true);
        dragStartOffset.current = { x: e.clientX - position.x, y: e.clientY - position.y };
        document.body.style.userSelect = 'none';
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    const toggleMaximize = () => { setIsMaximized(!isMaximized); if (isMinimized) setIsMinimized(false); };
    const toggleMinimize = () => { setIsMinimized(!isMinimized); if (isMaximized) setIsMaximized(false); };

    useEffect(() => {
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);
    
    const handleSendEmail = () => {
        setSendStatus('sending');
        setSendError('');

        if (!to.trim() || !subject.trim()) {
            setSendError('Please provide a recipient and a subject.');
            setSendStatus('error');
            return;
        }

        try {
            // Use mailto: for a client-side only implementation
            const mailtoLink = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            window.location.href = mailtoLink;

            setSendStatus('success');
            
            setTimeout(() => {
                 setSubject('');
                 setBody('');
                 setSendStatus('idle');
            }, 3000);

        } catch (error) {
            console.error("Failed to create mailto link:", error);
            setSendError('Could not open the email client. Please check browser settings.');
            setSendStatus('error');
        }
    };

    if (!isVisible) return null;

    const windowStyle: React.CSSProperties = isMaximized ? 
        { top: '0', left: '0', width: '100vw', height: '100vh', borderRadius: 0 } : 
        { top: `${position.y}px`, left: `${position.x}px`, width: `${size.width}px`, height: isMinimized ? 'auto' : `${size.height}px` };

    const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
    const MaximizeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4h4m12 4V4h-4M4 16v4h4m12-4v4h-4" /></svg>;
    const RestoreIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-4h4m-4 0l4-4m6 8v4h-4m4-4l-4-4" /></svg>;
    const MinimizeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>;

    return (
        <div ref={nodeRef} className="fixed bg-white rounded-lg shadow-2xl flex flex-col z-40 overflow-hidden border border-gray-300 transition-all duration-300 ease-in-out" style={windowStyle}>
            <div onMouseDown={handleMouseDown} className={`flex items-center justify-between p-2 bg-gray-100 border-b border-gray-200 flex-shrink-0 ${isMaximized ? '' : 'cursor-move'}`}>
                <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    <h2 className="text-sm font-bold text-gray-700 select-none">Email Composer</h2>
                </div>
                <div className="flex items-center space-x-1">
                    <button onClick={toggleMinimize} className="p-1.5 rounded-full hover:bg-gray-200 text-gray-600 focus:outline-none"><MinimizeIcon /></button>
                    <button onClick={toggleMaximize} className="p-1.5 rounded-full hover:bg-gray-200 text-gray-600 focus:outline-none">{isMaximized ? <RestoreIcon /> : <MaximizeIcon />}</button>
                    <button onClick={onClose} className="p-1.5 rounded-full hover:bg-red-500 hover:text-white text-gray-600 focus:outline-none"><CloseIcon /></button>
                </div>
            </div>
            
            <div className={`flex-grow w-full h-full flex flex-col p-4 bg-gray-50 transition-opacity duration-300 ${isMinimized ? 'hidden' : ''}`}>
                <div className="flex items-center border-b pb-2">
                    <label htmlFor="email-to" className="text-sm font-medium text-gray-500 mr-2">To:</label>
                    <input id="email-to" type="email" value={to} onChange={e => setTo(e.target.value)} className="flex-grow p-1 bg-transparent text-sm text-gray-800 focus:outline-none" />
                </div>
                <div className="flex items-center border-b py-2">
                    <label htmlFor="email-subject" className="text-sm font-medium text-gray-500 mr-2">Subject:</label>
                    <input id="email-subject" type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Email Subject" className="flex-grow p-1 bg-transparent text-sm text-gray-800 font-semibold focus:outline-none" />
                </div>
                <textarea
                    value={body}
                    onChange={e => setBody(e.target.value)}
                    placeholder="Compose your email..."
                    className="flex-grow w-full p-2 mt-2 bg-white border border-gray-200 rounded-md resize-none focus:ring-orange-500 focus:border-orange-500 text-sm"
                />
                <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm h-5">
                        {sendStatus === 'success' && <p className="text-green-600 font-semibold">Redirecting to your email client...</p>}
                        {sendStatus === 'error' && <p className="text-red-600">{sendError}</p>}
                    </div>
                    <button onClick={handleSendEmail} disabled={sendStatus === 'sending'} className="btn bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-lg disabled:bg-gray-400">
                        {sendStatus === 'sending' ? 'Opening...' : 'Send'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EmailComposerTab;