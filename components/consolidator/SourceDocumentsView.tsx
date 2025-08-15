import React, { useState, useMemo, useRef, forwardRef, useImperativeHandle } from 'react';
import { PpmpProjectItem, PurchaseRequest } from '../../types';
import SourceDocumentDetailView from './SourceDocumentDetailView';

interface SourceDocumentsViewProps {
    consolidatedItems: PpmpProjectItem[];
    purchaseRequests: PurchaseRequest[];
}

export interface SourceDocumentsViewHandles {
    exportToPdf: () => void;
    exportToExcel: () => void;
}

const SourceDocumentsView = forwardRef<SourceDocumentsViewHandles, SourceDocumentsViewProps>(({ consolidatedItems, purchaseRequests }, ref) => {
    const offices = useMemo(() => [...new Set(consolidatedItems.map(item => item.office))].sort(), [consolidatedItems]);
    const [selectedSourceOffice, setSelectedSourceOffice] = useState<string | null>(offices[0] || null);
    
    const detailViewRef = useRef<{ exportToPdf: () => void; exportToExcel: () => void; }>(null);

    useImperativeHandle(ref, () => ({
        exportToPdf: () => {
            if (selectedSourceOffice) {
                detailViewRef.current?.exportToPdf();
            } else {
                alert("Please select an office to export.");
            }
        },
        exportToExcel: () => {
            if (selectedSourceOffice) {
                detailViewRef.current?.exportToExcel();
            } else {
                alert("Please select an office to export.");
            }
        }
    }));

    const selectedOfficeItems = useMemo(() => {
        if (!selectedSourceOffice) return [];
        return consolidatedItems.filter(item => item.office === selectedSourceOffice);
    }, [consolidatedItems, selectedSourceOffice]);

    return (
        <div className="flex h-full gap-4 -mx-6 -my-6">
            <aside className="w-1/4 flex-shrink-0 bg-white p-3 border-r no-drag">
                <h3 className="font-bold text-gray-700 mb-2 text-sm p-2">Source Documents</h3>
                <ul className="space-y-1 overflow-y-auto max-h-[calc(100vh-150px)]">
                    {offices.map(o => (
                        <li key={o}>
                            <button
                                onClick={() => setSelectedSourceOffice(o)}
                                className={`w-full text-left p-2 text-xs rounded transition-all ${selectedSourceOffice === o ? 'bg-orange-500 text-white font-bold' : 'text-gray-600 hover:bg-gray-100 hover:text-black'}`}
                            >
                                {o}
                            </button>
                        </li>
                    ))}
                </ul>
            </aside>
            <main className="w-3/4 p-4 overflow-hidden">
                {selectedSourceOffice && selectedOfficeItems.length > 0 ? (
                    <SourceDocumentDetailView
                        ref={detailViewRef}
                        items={selectedOfficeItems}
                        purchaseRequests={purchaseRequests}
                    />
                ) : (
                    <div className="flex items-center justify-center h-full bg-white rounded-lg border">
                        <p className="text-gray-500">Select an office to view its detailed PPMP submission.</p>
                    </div>
                )}
            </main>
        </div>
    );
});

export default SourceDocumentsView;