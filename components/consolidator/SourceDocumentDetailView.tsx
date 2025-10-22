
import React, { useMemo, useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { PpmpProjectItem, PurchaseRequest } from '../../types';
import { bacolodCityLogo } from '../../data/logo';

declare global {
    interface Window {
        jspdf: { 
            jsPDF: new (options?: any) => any;
            plugin: any;
        };
        html2canvas: any;
    }
}

interface jsPDFWithAutoTable extends InstanceType<typeof window.jspdf.jsPDF> {
  autoTable: (options: any) => jsPDFWithAutoTable;
}


const EditableInline: React.FC<{ value: string | number; onSave: (value: string) => void; className?: string; isNumber?: boolean; }> = ({ value, onSave, className, isNumber = false }) => {
    const [currentValue, setCurrentValue] = useState(String(value));
    useEffect(() => { setCurrentValue(String(value)); }, [value]);
    return <input type={isNumber ? "number" : "text"} value={currentValue} onChange={e => setCurrentValue(e.target.value)} onBlur={() => onSave(currentValue)} className={`bg-transparent hover:bg-orange-100/50 focus:bg-orange-100 border border-transparent focus:border-orange-300 rounded p-0.5 focus:outline-none no-print-input text-inherit font-inherit ${className}`} style={{ width: `${(String(currentValue).length || 1) * 0.6}em`, minWidth: '50px' }} />;
};

const EditableTextarea: React.FC<{ value: string | undefined; onSave: (value: string) => void; className?: string; }> = ({ value, onSave, className }) => {
    const [currentValue, setCurrentValue] = useState(value || '');
    const ref = useRef<HTMLTextAreaElement>(null);
    useEffect(() => { setCurrentValue(value || ''); }, [value]);
    useEffect(() => { if (ref.current) { ref.current.style.height = 'auto'; ref.current.style.height = `${ref.current.scrollHeight}px`; } }, [currentValue]);
    return <textarea ref={ref} value={currentValue} onChange={e => setCurrentValue(e.target.value)} onBlur={() => onSave(currentValue)} className={`bg-transparent hover:bg-orange-100/50 focus:bg-orange-100 border border-transparent focus:border-orange-300 rounded p-1 w-full focus:outline-none no-print-input resize-none overflow-hidden text-inherit font-inherit ${className}`} />;
};

interface SourceDocumentDetailViewProps {
    items: PpmpProjectItem[];
    purchaseRequests: PurchaseRequest[];
}

const SourceDocumentDetailView = forwardRef<({ exportToPdf: () => void; exportToExcel: () => void; }), SourceDocumentDetailViewProps>(({ items }, ref) => {
    
    const [editableItems, setEditableItems] = useState<PpmpProjectItem[]>([]);
    const [headerData, setHeaderData] = useState({ fiscalYear: '2026', endUser: '', status: 'final' as 'indicative' | 'final' });
    const [footerData, setFooterData] = useState({ preparedBy: { name: 'SIGNATORY NAME', position: 'Position / Designation' }, submittedBy: { name: 'SIGNATORY NAME', position: 'Head of the End-User or Implementing Unit' } });
    const viewRef = useRef<HTMLDivElement>(null);

    useEffect(() => { 
        setEditableItems(JSON.parse(JSON.stringify(items))); 
        if (items.length > 0) {
            setHeaderData(prev => ({...prev, endUser: items[0].office || "Bacolod City"}));
        }
    }, [items]);

    const handleItemChange = (itemId: number, field: keyof PpmpProjectItem, value: string | number) => {
        setEditableItems(currentItems => 
            currentItems.map(item => item.id === itemId ? { ...item, [field]: value } : item)
        );
    };

    const totalBudget = useMemo(() => editableItems.filter(item => item.projectType !== 'Category Header').reduce((sum, item) => sum + (Number(item.estimatedBudget) || 0), 0), [editableItems]);

    const exportToExcel = () => { alert('Excel export is under development for this view.'); };

    const exportToPdf = () => {
        const jspdfModule = window.jspdf;
        if (!jspdfModule || !jspdfModule.jsPDF || !(jspdfModule.jsPDF as any).API.autoTable) {
            alert("PDF generation library is not available.");
            return;
        }

        const doc = new jspdfModule.jsPDF({ orientation: 'landscape', unit: 'pt', format: 'legal' }) as jsPDFWithAutoTable;
        
        doc.autoTable({
            html: '#ppmp-view-content table',
            startY: 100,
            theme: 'grid',
            headStyles: { font: 'times', fontStyle: 'bold', fontSize: 7, halign: 'center', valign: 'middle', fillColor: [211, 211, 211], textColor: [0,0,0] },
            styles: { font: 'times', fontSize: 7 },
            footStyles: { font: 'times', fontStyle: 'bold', fillColor: [211, 211, 211], textColor: [0,0,0] },
            didDrawPage: (data) => {
                doc.setFontSize(12); doc.setFont('times', 'bold');
                doc.text("PROJECT PROCUREMENT MANAGEMENT PLAN (PPMP)", doc.internal.pageSize.getWidth() / 2, 40, { align: 'center' });
                doc.setFontSize(10); doc.setFont('times', 'normal');
                doc.text(`Fiscal Year: ${headerData.fiscalYear}`, data.settings.margin.left, 60);
                doc.text(`End-User: ${headerData.endUser}`, data.settings.margin.left, 75);
            },
            margin: { top: 100 }
        });

        // Add footer manually after table is drawn
        const finalY = (doc as any).lastAutoTable.finalY || 120;
        const footerElement = document.getElementById('ppmp-footer-block')?.cloneNode(true) as HTMLElement;
        if (footerElement) {
            footerElement.style.fontSize = '8pt';
            footerElement.style.fontFamily = 'Times New Roman';
            const html2canvas = window.html2canvas;
            if(html2canvas){
                html2canvas(footerElement).then(canvas => {
                    const imgData = canvas.toDataURL('image/png');
                    const imgWidth = 10 * 72 / 25.4; // 10 inches wide
                    const pageHeight = doc.internal.pageSize.getHeight();
                    const imgHeight = canvas.height * imgWidth / canvas.width;
                    
                    if (finalY + imgHeight > pageHeight - 40) {
                        doc.addPage();
                        doc.addImage(imgData, 'PNG', 40, 40, imgWidth, imgHeight);
                    } else {
                        doc.addImage(imgData, 'PNG', 40, finalY + 20, imgWidth, imgHeight);
                    }
                    doc.save(`PPMP_${headerData.endUser.replace(/\s/g, '_')}.pdf`);
                });
            } else {
                 doc.save(`PPMP_${headerData.endUser.replace(/\s/g, '_')}.pdf`);
            }
        } else {
            doc.save(`PPMP_${headerData.endUser.replace(/\s/g, '_')}.pdf`);
        }
    };

    useImperativeHandle(ref, () => ({ exportToPdf, exportToExcel }));

    return (
         <div ref={viewRef} className="h-full overflow-auto bg-gray-200 p-4 no-drag">
             <div id="ppmp-view-content" className="bg-white p-6 mx-auto" style={{ width: '13in', minHeight: '8.5in', fontFamily: "'Times New Roman', Times, serif", fontSize: '9pt' }}>
                 <div className="text-center font-bold">
                     <p>PROJECT PROCUREMENT MANAGEMENT PLAN (PPMP)</p>
                 </div>
                 <div className="flex justify-between mt-4 text-sm">
                     <div>Fiscal Year: <EditableInline value={headerData.fiscalYear} onSave={v => setHeaderData(p => ({...p, fiscalYear: v}))} /></div>
                     <div className="flex items-center gap-2"><input type="checkbox" checked={headerData.status === 'indicative'} onChange={() => setHeaderData(p => ({...p, status: 'indicative'}))} /> INDICATIVE</div>
                     <div className="flex items-center gap-2"><input type="checkbox" checked={headerData.status === 'final'} onChange={() => setHeaderData(p => ({...p, status: 'final'}))} /> FINAL</div>
                 </div>
                 <div className="text-sm mt-2">End-User or Implementing Unit: <EditableInline value={headerData.endUser} onSave={v => setHeaderData(p => ({...p, endUser: v}))} className="w-full" /></div>

                 <table className="w-full border-collapse border border-black mt-2 text-xs">
                     <thead className="text-center font-bold">
                        <tr>
                            <th colSpan={4} className="border border-black p-1">PROCUREMENT PROJECT DETAILS</th>
                            <th colSpan={4} className="border border-black p-1">PROJECTED TIMELINE (MM/YYYY)</th>
                            <th colSpan={2} className="border border-black p-1">FUNDING DETAILS</th>
                            <th rowSpan={2} className="border border-black p-1 align-middle">ATTACHED SUPPORTING DOCUMENTS</th>
                            <th rowSpan={2} className="border border-black p-1 align-middle">REMARKS</th>
                        </tr>
                        <tr>
                            <th className="border border-black p-1">General Description and Objective of the Project to be Procured</th>
                            <th className="border border-black p-1">Type of the Project to be Procured</th>
                            <th className="border border-black p-1">Quantity and Size of the Project to be Procured</th>
                            <th className="border border-black p-1">Recommended Mode of Procurement</th>
                            <th className="border border-black p-1">Pre-Procurement Conference, if applicable (Yes/No)</th>
                            <th className="border border-black p-1">Start of Procurement Activity</th>
                            <th className="border border-black p-1">End of Procurement Activity</th>
                            <th className="border border-black p-1">Expected Delivery/ Implementation Period</th>
                            <th className="border border-black p-1">Source of Funds</th>
                            <th className="border border-black p-1">Estimated Budget / Authorized Budgetary Allocation (PhP)</th>
                        </tr>
                     </thead>
                     <tbody>
                        {editableItems.map((item) => (
                            item.projectType === 'Category Header' ? (
                                <tr key={item.id} className="bg-gray-200 font-bold">
                                    <td colSpan={9} className="border border-black p-1">
                                        <EditableTextarea value={item.generalDescription} onSave={v => handleItemChange(item.id, 'generalDescription', v)} />
                                    </td>
                                    <td className="border border-black p-1 text-right">
                                        <EditableTextarea value={(Number(item.estimatedBudget) || 0).toLocaleString('en-US', {minimumFractionDigits: 2})} onSave={v => handleItemChange(item.id, 'estimatedBudget', parseFloat(v.replace(/,/g, '')) || 0)} className="text-right"/>
                                    </td>
                                    <td colSpan={2} className="border border-black"></td>
                                </tr>
                            ) : (
                                <tr key={item.id}>
                                    <td className="border border-black p-0"><EditableTextarea value={item.generalDescription} onSave={v => handleItemChange(item.id, 'generalDescription', v)} /></td>
                                    <td className="border border-black p-0"><EditableTextarea value={item.projectType} onSave={v => handleItemChange(item.id, 'projectType', v)} /></td>
                                    <td className="border border-black p-0"><EditableTextarea value={`${item.quantity} ${item.uom}`} onSave={v => { const parts = v.split(' '); handleItemChange(item.id, 'quantity', Number(parts[0]) || 0); handleItemChange(item.id, 'uom', parts.slice(1).join(' ')); }} /></td>
                                    <td className="border border-black p-0"><EditableTextarea value={item.procurementMode} onSave={v => handleItemChange(item.id, 'procurementMode', v)} /></td>
                                    <td className="border border-black p-0"><EditableTextarea value={item.preProcCon} onSave={v => handleItemChange(item.id, 'preProcCon', v as any)} /></td>
                                    <td className="border border-black p-0"><EditableTextarea value={item.procurementStart} onSave={v => handleItemChange(item.id, 'procurementStart', v)} /></td>
                                    <td className="border border-black p-0"><EditableTextarea value={item.procurementEnd} onSave={v => handleItemChange(item.id, 'procurementEnd', v)} /></td>
                                    <td className="border border-black p-0"><EditableTextarea value={item.deliveryImplementation} onSave={v => handleItemChange(item.id, 'deliveryImplementation', v)} /></td>
                                    <td className="border border-black p-0"><EditableTextarea value={item.sourceOfFunds} onSave={v => handleItemChange(item.id, 'sourceOfFunds', v)} /></td>
                                    <td className="border border-black p-0 text-right"><EditableTextarea value={item.estimatedBudget?.toLocaleString('en-US', {minimumFractionDigits: 2})} onSave={v => handleItemChange(item.id, 'estimatedBudget', parseFloat(v.replace(/,/g, '')) || 0)} className="text-right"/></td>
                                    <td className="border border-black p-0"><EditableTextarea value={item.supportingDocuments} onSave={v => handleItemChange(item.id, 'supportingDocuments', v)} /></td>
                                    <td className="border border-black p-0"><EditableTextarea value={item.remarks} onSave={v => handleItemChange(item.id, 'remarks', v)} /></td>
                                </tr>
                            )
                        ))}
                    </tbody>
                     <tfoot>
                         <tr>
                             <td colSpan={9} className="border border-black p-1 text-right font-bold">GRAND TOTAL:</td>
                             <td className="border border-black p-1 text-right font-bold">{totalBudget.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                             <td colSpan={2} className="border border-black"></td>
                         </tr>
                     </tfoot>
                 </table>

                 <div id="ppmp-footer-block" className="flex justify-around mt-12 text-sm" style={{ pageBreakInside: 'avoid' }}>
                     <div className="text-center">
                         <p>Prepared by:</p>
                         <div className="mt-12 border-b border-black"><EditableInline value={footerData.preparedBy.name} onSave={v => setFooterData(p => ({ ...p, preparedBy: { ...p.preparedBy, name: v } }))} className="font-bold uppercase" /></div>
                         <EditableInline value={footerData.preparedBy.position} onSave={v => setFooterData(p => ({ ...p, preparedBy: { ...p.preparedBy, position: v } }))} />
                         <p>[End-User or Implementing Unit]</p>
                     </div>
                      <div className="text-center">
                         <p>Submitted by:</p>
                         <div className="mt-12 border-b border-black"><EditableInline value={footerData.submittedBy.name} onSave={v => setFooterData(p => ({ ...p, submittedBy: { ...p.submittedBy, name: v } }))} className="font-bold uppercase" /></div>
                         <EditableInline value={footerData.submittedBy.position} onSave={v => setFooterData(p => ({ ...p, submittedBy: { ...p.submittedBy, position: v } }))} />
                         <p>[Head of the End-User or Implementing Unit]</p>
                     </div>
                 </div>
             </div>
         </div>
    );
});

export default SourceDocumentDetailView;
