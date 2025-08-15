import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { PpmpProjectItem, PurchaseRequest } from '../../types';
import { extractDetailedPpmpData } from '../../services/geminiService';
import { initialSavedPpmps } from '../../data/savedPpmps';
import DashboardView from '../consolidator/DashboardView';
import ComplianceView from '../consolidator/ComplianceView';
import ProjectsView from '../consolidator/ProjectsView';
import BudgetView from '../consolidator/BudgetView';
import SourceDocumentsView from '../consolidator/SourceDocumentsView';

interface PpmpConsolidatorTabProps {
    isVisible: boolean;
    onClose: () => void;
}

const PpmpConsolidatorTab: React.FC<PpmpConsolidatorTabProps> = ({ isVisible, onClose }) => {
    // Window state
    const [isMaximized, setIsMaximized] = useState(true);
    const [position, setPosition] = useState({ x: 80, y: 80 });
    const [size, setSize] = useState({ width: 1200, height: 800 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStartOffset = useRef({ x: 0, y: 0 });
    const nodeRef = useRef<HTMLDivElement>(null);

    // Data state
    const [consolidatedItems, setConsolidatedItems] = useState<PpmpProjectItem[]>(() => initialSavedPpmps.flatMap(p => p.items));
    const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>([]);
    
    // UI state
    const [error, setError] = useState('');
    const [activeView, setActiveView] = useState<'dashboard' | 'compliance' | 'projects' | 'budget' | 'source'>('dashboard');
    const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
    const [confirmText, setConfirmText] = useState('');
    const [loading, setLoading] = useState(false);

    // Refs for child component export functions
    const dashboardRef = useRef<{ exportToPdf: () => void }>(null);
    const projectsRef = useRef<{ exportToPdf: () => void }>(null);
    const sourceRef = useRef<{ exportToPdf: () => void; exportToExcel: () => void; }>(null);

    
    useEffect(() => {
        if (isVisible) {
            const initialWidth = Math.min(1400, window.innerWidth * 0.95);
            const initialHeight = Math.min(900, window.innerHeight * 0.95);
            setSize({ width: initialWidth, height: initialHeight });
            setPosition({ x: (window.innerWidth - initialWidth) / 2, y: (window.innerHeight * 0.95 - initialHeight) / 2 + (window.innerHeight*0.025) });
        }
    }, [isVisible]);

    const handleMouseMove = useCallback((e: MouseEvent) => { if (!isDragging || !nodeRef.current) return; let newX = e.clientX - dragStartOffset.current.x; let newY = e.clientY - dragStartOffset.current.y; const { offsetWidth, offsetHeight } = nodeRef.current; newX = Math.max(0, Math.min(newX, window.innerWidth - offsetWidth)); newY = Math.max(0, Math.min(newY, window.innerHeight - offsetHeight)); setPosition({ x: newX, y: newY }); }, [isDragging]);
    const handleMouseUp = useCallback(() => { setIsDragging(false); document.body.style.userSelect = ''; window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp); }, [handleMouseMove]);
    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => { e.preventDefault(); if (isMaximized || (e.target as HTMLElement).closest('button, input, textarea, a, [role="button"], select, .no-drag')) return; setIsDragging(true); dragStartOffset.current = { x: e.clientX - position.x, y: e.clientY - position.y }; document.body.style.userSelect = 'none'; window.addEventListener('mousemove', handleMouseMove); window.addEventListener('mouseup', handleMouseUp); };
    useEffect(() => { return () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp); }; }, [handleMouseMove, handleMouseUp]);
    
     const handleFilesAdded = async (newFiles: FileList | null) => {
        if (!newFiles || newFiles.length === 0) return;
        setLoading(true);
        setError('');

        const uniqueNewFiles = Array.from(newFiles);
        let itemsAdded = false;

        const processFile = async (file: File) => {
            try {
                const items = await extractDetailedPpmpData(file);
                if (items.length > 0) {
                    itemsAdded = true;
                }
                return items;
            } catch (e) {
                const errorMessage = (e instanceof Error) ? e.message : 'Unknown error';
                setError(prev => `${prev}\nFailed to process ${file.name}: ${errorMessage}`);
                return [];
            }
        };

        const allNewItems = (await Promise.all(uniqueNewFiles.map(processFile))).flat();
        
        if (itemsAdded) {
            setConsolidatedItems(prev => [...prev, ...allNewItems]);
        }
        
        setLoading(false);
    };

    const confirmActionWrapper = (action: () => void, text: string) => {
        setConfirmText(text);
        setConfirmAction(() => action);
        setConfirmModalOpen(true);
    };

    const handleClearAll = () => {
        setConsolidatedItems([]);
        setPurchaseRequests([]);
        setError('');
        setConfirmModalOpen(false);
    };

    const handleDeleteProject = (projectId: number) => {
        setConsolidatedItems(prev => prev.filter(item => item.id !== projectId));
        setPurchaseRequests(prev => prev.filter(pr => pr.projectId !== projectId));
        setConfirmModalOpen(false);
    };

    const handleExportPdf = () => {
        switch (activeView) {
            case 'dashboard':
                dashboardRef.current?.exportToPdf();
                break;
            case 'projects':
                projectsRef.current?.exportToPdf();
                break;
            case 'source':
                sourceRef.current?.exportToPdf();
                break;
            default:
                alert(`Export is not yet available for the "${activeView}" view.`);
        }
    };
     const handleExportExcel = () => {
        switch (activeView) {
            case 'source':
                sourceRef.current?.exportToExcel();
                break;
            default:
                alert(`Excel export is not available for the "${activeView}" view.`);
        }
    };
    
    if (!isVisible) return null;

    const windowStyle: React.CSSProperties = isMaximized ? { top: '0', left: '0', width: '100vw', height: '100vh', borderRadius: 0 } : { top: `${position.y}px`, left: `${position.x}px`, width: `${size.width}px`, height: `${size.height}px` };

    const menuItems = [
        { key: 'dashboard', label: 'Dashboard', icon: '📊' },
        { key: 'compliance', label: 'Compliance', icon: '✅' },
        { key: 'projects', label: 'Projects', icon: '📋' },
        { key: 'budget', label: 'Utilization', icon: '💰' },
        { key: 'source', label: 'Documents', icon: '📄' }
    ];
    
    const showExportButtons = ['dashboard', 'projects', 'source'].includes(activeView);

    const mainContent = () => {
        if (loading) {
            return <div className="flex items-center justify-center h-full"><div className="loader"></div><p className="ml-4">Processing files...</p></div>;
        }

        if (consolidatedItems.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-white rounded-lg border-2 border-dashed">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    <h3 className="text-xl font-bold text-gray-700">Welcome to the PPMP Consolidator</h3>
                    <p className="text-gray-500 mt-2 max-w-md">Start by uploading your PPMP documents (PDF or images) to populate the dashboard and begin your analysis.</p>
                    <div className="mt-6">
                        <label htmlFor="upload-hub-input" className="btn bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg cursor-pointer">
                            Click here to Upload Files
                        </label>
                        <input id="upload-hub-input" type="file" onChange={(e) => handleFilesAdded(e.target.files)} multiple accept=".pdf,.png,.jpg,.jpeg" className="hidden" />
                    </div>
                </div>
            );
        }

        switch(activeView) {
            case 'dashboard': return <DashboardView ref={dashboardRef} consolidatedItems={consolidatedItems} />;
            case 'compliance': return <ComplianceView consolidatedItems={consolidatedItems} />;
            case 'projects': return <ProjectsView ref={projectsRef} items={consolidatedItems} onDelete={(id) => confirmActionWrapper(() => handleDeleteProject(id), `Are you sure you want to delete project ID ${id}? This will also remove any associated purchase requests.`)} />;
            case 'budget': return <BudgetView consolidatedItems={consolidatedItems} purchaseRequests={purchaseRequests} onAddRequest={setPurchaseRequests} />;
            case 'source': return <SourceDocumentsView ref={sourceRef} consolidatedItems={consolidatedItems} purchaseRequests={purchaseRequests} />;
            default: return null;
        }
    };

    return (
        <div ref={nodeRef} className="fixed bg-gray-100 rounded-lg shadow-2xl flex flex-col z-40 overflow-hidden border border-gray-300 transition-all duration-300" style={windowStyle}>
            <header onMouseDown={handleMouseDown} className={`flex items-center justify-between p-2 bg-gray-200 border-b ${isMaximized ? '' : 'cursor-move'}`}>
                <div className="flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.5 8.25V6a2.25 2.25 0 00-2.25-2.25H6A2.25 2.25 0 003.75 6v8.25A2.25 2.25 0 006 16.5h2.25m8.25-8.25H18a2.25 2.25 0 012.25 2.25v8.25A2.25 2.25 0 0118 20.25h-7.5A2.25 2.25 0 018.25 18v-1.5m8.25-8.25h-6a2.25 2.25 0 00-2.25 2.25v6" /></svg><h2 className="text-sm font-bold text-gray-700">PPMP Consolidator</h2></div>
                <div className="flex items-center space-x-1">
                    <button onClick={() => setIsMaximized(!isMaximized)} className="p-1.5 rounded-full hover:bg-gray-300">{isMaximized ? '🗗' : '🗖'}</button>
                    <button onClick={onClose} className="p-1.5 rounded-full hover:bg-red-500 hover:text-white">✕</button>
                </div>
            </header>
            
            <div className="flex-grow flex overflow-hidden">
                <aside className="w-56 bg-white p-4 flex flex-col border-r">
                    <nav className="flex flex-col gap-2">
                        {menuItems.map(item => (
                            <button key={item.key} onClick={() => setActiveView(item.key as any)} className={`flex items-center gap-3 p-2 rounded-md text-sm font-semibold transition-all ${activeView === item.key ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}>
                                <span>{item.icon}</span> {item.label}
                            </button>
                        ))}
                    </nav>
                    <div className="mt-auto pt-4 border-t">
                        <label className="text-xs font-bold text-gray-500 block mb-2">ADD PPMP DATA</label>
                        <input type="file" onChange={(e) => handleFilesAdded(e.target.files)} multiple accept=".pdf,.png,.jpg,.jpeg" className="block w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100" />
                        {showExportButtons && (
                            <div className="mt-4 border-t pt-4">
                                <label className="text-xs font-bold text-gray-500 block mb-2">ACTIONS</label>
                                <div className="space-y-2">
                                    <button onClick={handleExportPdf} className="btn w-full text-sm bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-3 rounded-md flex items-center justify-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                        Export PDF
                                    </button>
                                     <button onClick={handleExportExcel} className="btn w-full text-sm bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-3 rounded-md flex items-center justify-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                        Export Excel
                                    </button>
                                </div>
                            </div>
                        )}
                        <button onClick={() => confirmActionWrapper(() => handleClearAll(), 'Are you sure you want to clear all consolidated data? This action cannot be undone.')} className="mt-4 text-xs text-red-500 hover:underline w-full text-center">
                            Clear All Data
                        </button>
                    </div>
                </aside>

                <main className="flex-grow p-6 overflow-y-auto">
                    {error && <div className="bg-red-100 text-red-800 p-3 rounded-md mb-4 whitespace-pre-wrap">{error}</div>}
                    {mainContent()}
                </main>
            </div>
            
            {isConfirmModalOpen && (
                <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm p-6 text-center">
                        <h3 className="text-lg font-bold text-gray-800">Confirm Action</h3>
                        <p className="text-sm text-gray-600 my-4">{confirmText}</p>
                        <div className="flex justify-center gap-3">
                            <button onClick={() => setConfirmModalOpen(false)} className="btn bg-gray-200 text-gray-800 px-4 py-2 rounded">Cancel</button>
                            <button onClick={() => confirmAction && confirmAction()} className="btn bg-red-600 text-white px-4 py-2 rounded">Confirm</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PpmpConsolidatorTab;