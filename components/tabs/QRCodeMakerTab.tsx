
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { orangeBacolodLogo } from '../../data/logo';

declare global {
    interface Window {
        html2canvas: any;
        jspdf: { 
            jsPDF: new (options?: any) => any;
            plugin: any;
        };
    }
}

interface QrCodeItem {
    id: number;
    url: string;
    label: string;
}

interface QRCodeMakerTabProps {
    isVisible: boolean;
    onClose: () => void;
}

const ITEMS_PER_PAGE = 15; // 3 columns x 5 rows

const QRCodeMakerTab: React.FC<QRCodeMakerTabProps> = ({ isVisible, onClose }) => {
    // Floating window state
    const [isMaximized, setIsMaximized] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [position, setPosition] = useState({ x: 100, y: 100 });
    const [size, setSize] = useState({ width: 1000, height: 700 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStartOffset = useRef({ x: 0, y: 0 });
    const nodeRef = useRef<HTMLDivElement>(null);

    // QR Maker state
    const [url, setUrl] = useState('');
    const [label, setLabel] = useState('');
    const [error, setError] = useState('');
    const [qrItems, setQrItems] = useState<QrCodeItem[]>([]);
    const printableRef = useRef<HTMLDivElement>(null);

    // Window visibility and initial positioning
    useEffect(() => {
        if (isVisible) {
            setIsMaximized(false);
            setIsMinimized(false);
            const initialWidth = Math.min(1000, window.innerWidth * 0.85);
            const initialHeight = Math.min(750, window.innerHeight * 0.85);
            setSize({ width: initialWidth, height: initialHeight });
            setPosition({
                x: (window.innerWidth - initialWidth) / 2,
                y: (window.innerHeight - initialHeight) / 2,
            });
        }
    }, [isVisible]);

    // Drag handlers
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
        if (isMaximized || (e.target as HTMLElement).closest('button')) return;
        setIsDragging(true);
        dragStartOffset.current = { x: e.clientX - position.x, y: e.clientY - position.y };
        document.body.style.userSelect = 'none';
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };
    
    useEffect(() => {
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);
    
    // Window controls
    const toggleMaximize = () => { setIsMaximized(!isMaximized); if (isMinimized) setIsMinimized(false); };
    const toggleMinimize = () => { setIsMinimized(!isMinimized); if (isMaximized) setIsMaximized(false); };

    // QR Maker logic
    const isValidUrl = (urlString: string): boolean => {
        try {
            new URL(urlString);
            return true;
        } catch (e) {
            return false;
        }
    };

    const handleAddQrCode = () => {
        setError('');
        if (!url.trim()) {
            setError('Please enter a URL.');
            return;
        }
        if (!isValidUrl(url)) {
            setError('The URL is not valid. It must start with http:// or https://');
            return;
        }
        const newItem: QrCodeItem = { id: Date.now(), url, label };
        setQrItems(prev => [...prev, newItem]);
        setUrl('');
        setLabel('');
    };

    const handleRemoveItem = (id: number) => {
        setQrItems(prev => prev.filter(item => item.id !== id));
    };

    const handlePrint = () => {
        document.body.classList.add('is-printing');
        const onAfterPrint = () => {
            document.body.classList.remove('is-printing');
            window.removeEventListener('afterprint', onAfterPrint);
        };
        window.addEventListener('afterprint', onAfterPrint, { once: true });
        setTimeout(() => window.print(), 100);
    };

    const handleExportPdf = async () => {
        const printableArea = printableRef.current;
        if (!printableArea || !window.html2canvas || !window.jspdf) {
            alert('PDF export failed. A required library may not be loaded.');
            return;
        }

        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({ orientation: 'p', unit: 'in', format: [13, 8.5] }); // Folio size

        const pages = printableArea.querySelectorAll('.print-page');
        for (let i = 0; i < pages.length; i++) {
            const page = pages[i] as HTMLElement;
            const canvas = await window.html2canvas(page, { scale: 3, useCORS: true });
            const imgData = canvas.toDataURL('image/png');
            if (i > 0) pdf.addPage([13, 8.5], 'p');
            pdf.addImage(imgData, 'PNG', 0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight(), undefined, 'FAST');
        }
        
        pdf.save('BAC_QR_Code_Layout.pdf');
    };

    const totalPages = Math.ceil(qrItems.length / ITEMS_PER_PAGE) || 1;

    // Window styling
    const windowStyle: React.CSSProperties = isMaximized ? 
        { top: '0', left: '0', width: '100vw', height: '100vh', borderRadius: 0 } : 
        { top: `${position.y}px`, left: `${position.x}px`, width: `${size.width}px`, height: isMinimized ? 'auto' : `${size.height}px` };

    // Icons
    const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
    const MaximizeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4h4m12 4V4h-4M4 16v4h4m12-4v4h-4" /></svg>;
    const RestoreIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-4h4m-4 0l4-4m6 8v4h-4m4-4l-4-4" /></svg>;
    const MinimizeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>;

    if (!isVisible) return null;

    return (
        <div
            ref={nodeRef}
            className="fixed bg-white rounded-lg shadow-2xl flex flex-col z-40 overflow-hidden border border-gray-300 transition-all duration-300 ease-in-out"
            style={windowStyle}
            aria-modal="true"
            role="dialog"
            aria-label="QR Code Maker Window"
        >
            <div 
                onMouseDown={handleMouseDown}
                className={`flex items-center justify-between p-2 bg-gray-100 border-b border-gray-200 flex-shrink-0 ${isMaximized ? '' : 'cursor-move'}`}
            >
                <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm7-8V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                    <h2 className="text-sm font-bold text-gray-700 select-none">QR Code Maker</h2>
                </div>
                <div className="flex items-center space-x-1">
                    <button onClick={toggleMinimize} className="p-1.5 rounded-full hover:bg-gray-200 text-gray-600 focus:outline-none" aria-label="Minimize"><MinimizeIcon /></button>
                    <button onClick={toggleMaximize} className="p-1.5 rounded-full hover:bg-gray-200 text-gray-600 focus:outline-none" aria-label={isMaximized ? "Restore" : "Maximize"}>{isMaximized ? <RestoreIcon /> : <MaximizeIcon />}</button>
                    <button onClick={onClose} className="p-1.5 rounded-full hover:bg-red-500 hover:text-white text-gray-600 focus:outline-none" aria-label="Close"><CloseIcon /></button>
                </div>
            </div>
            
            <div className={`flex-grow w-full h-full flex transition-opacity duration-300 ${isMinimized ? 'hidden' : ''}`}>
                <div className="w-1/3 p-4 border-r border-gray-200 flex flex-col bg-gray-50 overflow-y-auto">
                    <h3 className="text-lg font-bold text-gray-700 mb-3">Controls</h3>
                    <div className="space-y-4 mb-4">
                        <div>
                            <label htmlFor="qr-url-input" className="block text-sm font-medium text-gray-600 mb-1">URL</label>
                            <input type="url" id="qr-url-input" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://www.bacolodcity.gov.ph" className="w-full p-2 border border-gray-300 rounded-md shadow-sm text-sm" />
                        </div>
                        <div>
                            <label htmlFor="qr-label-input" className="block text-sm font-medium text-gray-600 mb-1">Label (Optional)</label>
                            <input type="text" id="qr-label-input" value={label} onChange={e => setLabel(e.target.value)} placeholder="Official BAC Website" className="w-full p-2 border border-gray-300 rounded-md shadow-sm text-sm" />
                        </div>
                        {error && <p className="text-red-600 text-xs">{error}</p>}
                        <button onClick={handleAddQrCode} className="btn bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg w-full text-sm">Add to Layout</button>
                    </div>
                    
                    <div className="border-t border-gray-300 pt-3 flex-grow flex flex-col">
                        <h4 className="text-base font-bold text-gray-700 mb-2">Layout Items ({qrItems.length})</h4>
                        <div className="flex-grow space-y-2 overflow-y-auto pr-2 -mr-2">
                            {qrItems.map(item => (
                                <div key={item.id} className="flex items-center justify-between bg-white p-2 rounded-md border">
                                    <p className="text-xs text-gray-600 truncate" title={`${item.label}\n${item.url}`}>{item.label || item.url}</p>
                                    <button onClick={() => handleRemoveItem(item.id)} className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 flex-shrink-0 ml-2">&times;</button>
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-4 flex-shrink-0">
                             <button onClick={handlePrint} className="btn text-sm bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-3 rounded-md">Print</button>
                             <button onClick={handleExportPdf} className="btn text-sm bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-3 rounded-md">Export PDF</button>
                        </div>
                    </div>
                </div>
                <div className="w-2/3 p-4 bg-gray-200 overflow-auto">
                    <h3 className="text-lg font-bold text-gray-700 mb-2 text-center">Print Preview</h3>
                    <div className="space-y-4">
                        {Array.from({ length: totalPages }).map((_, pageIndex) => (
                            <div key={pageIndex} className="bg-white shadow-lg mx-auto" style={{ width: '8.5in', height: '13in', padding: '0.5in', boxSizing: 'border-box' }}>
                                <div className="flex flex-wrap gap-x-[0.25in] gap-y-[0.3in] align-content-start h-full">
                                    {qrItems.slice(pageIndex * ITEMS_PER_PAGE, (pageIndex + 1) * ITEMS_PER_PAGE).map(item => (
                                        <div key={item.id} className="flex flex-col items-center justify-center gap-[0.1in]" style={{ width: '2.33in', height: '2.5in', pageBreakInside: 'avoid' }}>
                                            <div className="flex items-center justify-center" style={{width: '2in', height: '2in'}}>
                                                <QRCodeSVG 
                                                    value={item.url} 
                                                    size={192} // approx 2in at 96dpi
                                                    level="H" 
                                                    includeMargin={true} 
                                                    imageSettings={{ src: orangeBacolodLogo, height: 35, width: 35, excavate: true }}
                                                />
                                            </div>
                                            <p className="font-sans text-xs font-bold text-gray-800 text-center w-full break-words">{item.label}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Hidden content for printing */}
            <div id="qr-maker-printable-content" className="hidden printable-content" ref={printableRef}>
                {Array.from({ length: totalPages }).map((_, pageIndex) => (
                    <div key={pageIndex} className="print-page">
                        {qrItems.slice(pageIndex * ITEMS_PER_PAGE, (pageIndex + 1) * ITEMS_PER_PAGE).map(item => (
                            <div key={item.id} className="qr-item-container">
                                <div className="qr-slot">
                                    <QRCodeSVG 
                                        value={item.url} 
                                        size={200}
                                        level="H" 
                                        includeMargin={false} 
                                        imageSettings={{ src: orangeBacolodLogo, height: 35, width: 35, excavate: true }}
                                    />
                                </div>
                                <p className="qr-label">{item.label}</p>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default QRCodeMakerTab;
