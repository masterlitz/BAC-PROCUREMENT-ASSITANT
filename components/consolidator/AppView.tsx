
import React, { useMemo, forwardRef, useImperativeHandle } from 'react';
import { PpmpProjectItem } from '../../types';
import { isCseItem } from './utils';
import { papCodeMap, specificKeywordMap } from '../../data/papCodeMap';

declare global {
    interface Window {
        jspdf: { 
            jsPDF: new (options?: any) => any;
            plugin: any;
        };
    }
}
interface jsPDFWithAutoTable extends InstanceType<typeof window.jspdf.jsPDF> {
  autoTable: (options: any) => jsPDFWithAutoTable;
  lastAutoTable: { finalY: number; body: any[]; };
}

const nonCseCategoryMap: Record<string, string> = {
    '50201010-00': 'Travelling Expenses',
    '50202010-00': 'Training and Scholarship Expenses',
    '50203100-00': 'Fuel, Oil and Lubricants Expenses',
    '50204010-00': 'Utility Expenses (Water)',
    '50204020-00': 'Utility Expenses (Electricity)',
    '50205020-00': 'Communication Expenses (Telephone)',
    '50205030-00': 'Communication Expenses (Internet)',
    '50206020-00': 'Awards/Rewards, Prizes and Indemnities',
    '50211030-00': 'Consultancy Services',
    '50212990-00': 'Other Professional Services',
    '50213040-00': 'Repairs and Maintenance - Buildings & Other Structures',
    '50213050-00': 'Repairs and Maintenance - Machinery & Equipment',
    '50213060-00': 'Repairs and Maintenance - Transportation Equipment',
    '50216030-00': 'Insurance/Fidelity Bond Premiums',
    '50299030-00': 'Representation Expenses',
    '50299020-00': 'Other Supplies (Construction/Electrical)',
    '50299990-00': 'Other Maintenance and Operating Expenses',
    '10700000-00': 'Capital Outlay',
};

const nonCseCategoryOrder = [
    'Travelling Expenses', 'Training and Scholarship Expenses', 'Fuel, Oil and Lubricants Expenses',
    'Utility Expenses (Water)', 'Utility Expenses (Electricity)', 'Communication Expenses (Telephone)',
    'Communication Expenses (Internet)', 'Awards/Rewards, Prizes and Indemnities', 'Consultancy Services',
    'Other Professional Services', 'Repairs and Maintenance - Buildings & Other Structures',
    'Repairs and Maintenance - Machinery & Equipment', 'Repairs and Maintenance - Transportation Equipment',
    'Insurance/Fidelity Bond Premiums', 'Representation Expenses', 'Other Supplies (Construction/Electrical)',
    'Other Maintenance and Operating Expenses', 'Capital Outlay', 'Other Non-CSE Projects',
];

const getNonCseCategory = (papCode: string = ''): string => {
    const cleanCode = (papCode || '').replace(/\s+/g, '').replace(/-/g, '');
    for (const code in nonCseCategoryMap) {
        const baseCode = code.replace(/-/g, '');
        if (cleanCode.startsWith(baseCode)) {
            return nonCseCategoryMap[code];
        }
    }
    if (cleanCode.startsWith('107')) return 'Capital Outlay';
    return 'Other Non-CSE Projects';
};

const getCodeFromDescription = (description: string): string => {
    const lowerDesc = description.toLowerCase();
    for (const keyword in specificKeywordMap) {
        if (lowerDesc.includes(keyword)) return specificKeywordMap[keyword];
    }
    for (const keyword in papCodeMap) {
        if (lowerDesc.includes(keyword)) return papCodeMap[keyword];
    }
    return '';
};

const getMergeKey = (description: string): string => {
    const lowerDesc = description.toLowerCase();
    
    const combinedMap = { ...papCodeMap, ...specificKeywordMap };
    const sortedKeywords = Object.keys(combinedMap).sort((a, b) => b.length - a.length);

    for (const keyword of sortedKeywords) {
        if (lowerDesc.includes(keyword)) {
            return keyword.charAt(0).toUpperCase() + keyword.slice(1) + " (Consolidated)";
        }
    }
    return description.trim();
};


interface AppViewProps {
    consolidatedItems: PpmpProjectItem[];
}

const AppView = forwardRef<({ exportToPdf: () => void; exportToExcel: () => void; }), AppViewProps>(({ consolidatedItems }, ref) => {
    
    const { cseItems, nonCseGroups, sortedNonCseKeys, totals } = useMemo(() => {
        const mergedItemsMap = new Map<string, PpmpProjectItem & { _offices: Set<string>, _modes: Set<string>, _papCodes: Set<string> }>();
        const monthKeys = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'] as const;

        consolidatedItems.forEach(item => {
            if (!item.generalDescription || item.projectType === 'Category Header') return;
            const key = getMergeKey(item.generalDescription);
            
            if (mergedItemsMap.has(key)) {
                const existingItem = mergedItemsMap.get(key)!;
                existingItem.estimatedBudget += item.estimatedBudget || 0;
                if (item.schedule) {
                    for (const month of monthKeys) {
                        (existingItem.schedule as any)[month] = ((existingItem.schedule as any)[month] || 0) + ((item.schedule as any)[month] || 0);
                    }
                }
                existingItem._offices.add(item.office);
                if (item.procurementMode) existingItem._modes.add(item.procurementMode);
                if (item.papCode) existingItem._papCodes.add(item.papCode.replace(/\s/g, ''));
            } else {
                const newItem = JSON.parse(JSON.stringify(item));
                newItem.generalDescription = key;
                newItem.id = mergedItemsMap.size + 1;
                const fullSchedule = { jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0, jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0 };
                newItem.schedule = { ...fullSchedule, ...(item.schedule || {}) };
                newItem._offices = new Set([item.office]);
                newItem._modes = new Set(item.procurementMode ? [item.procurementMode] : []);
                newItem._papCodes = new Set(item.papCode ? [item.papCode.replace(/\s/g, '')] : []);
                mergedItemsMap.set(key, newItem);
            }
        });
        
        const mergedItems: PpmpProjectItem[] = Array.from(mergedItemsMap.values()).map(item => {
            if (item._offices.size > 1) item.office = "Various Offices";
            if (item._modes.size > 1) item.procurementMode = "Multiple Modes";
            
            const codeFromDesc = getCodeFromDescription(item.generalDescription);
            if (codeFromDesc) item.papCode = codeFromDesc;
            else if (item._papCodes.size > 1) item.papCode = "Various";
            else if (item._papCodes.size === 1) item.papCode = [...item._papCodes][0];

            delete (item as any)._offices;
            delete (item as any)._modes;
            delete (item as any)._papCodes;
            return item;
        });

        const cse: PpmpProjectItem[] = [];
        const nonCse: PpmpProjectItem[] = [];
        mergedItems.forEach(item => {
            if (isCseItem(item.generalDescription)) { cse.push(item); } 
            else { nonCse.push(item); }
        });
        
        cse.sort((a, b) => a.generalDescription.localeCompare(b.generalDescription));

        const groups = nonCse.reduce((acc, item) => {
            const category = getNonCseCategory(item.papCode);
            if (!acc[category]) acc[category] = [];
            acc[category].push(item);
            return acc;
        }, {} as Record<string, PpmpProjectItem[]>);
        
        for (const category in groups) {
            groups[category].sort((a, b) => a.generalDescription.localeCompare(b.generalDescription));
        }

        const sortedKeys = Object.keys(groups).sort((a, b) => {
            const indexA = nonCseCategoryOrder.indexOf(a); const indexB = nonCseCategoryOrder.indexOf(b);
            if (indexA === -1 && indexB === -1) return a.localeCompare(b);
            if (indexA === -1) return 1; if (indexB === -1) return -1;
            return indexA - indexB;
        });
        
        const calculatedTotals = {
            cse: cse.reduce((sum, item) => sum + item.estimatedBudget, 0),
            nonCse: nonCse.reduce((sum, item) => sum + item.estimatedBudget, 0),
            grandTotal: mergedItems.reduce((sum, item) => sum + item.estimatedBudget, 0),
        };

        return { cseItems: cse, nonCseGroups: groups, sortedNonCseKeys: sortedKeys, totals: calculatedTotals };
    }, [consolidatedItems]);
    
    const exportToExcel = () => { alert('Excel export is under development for this view.'); };

    const exportToPdf = () => {
        const jspdfModule = window.jspdf;
        if (!jspdfModule || !jspdfModule.jsPDF) return;
        const doc = new jspdfModule.jsPDF({ orientation: 'landscape', unit: 'pt', format: 'legal' }) as jsPDFWithAutoTable;
        doc.setFont('times', 'normal');

        const head = [['Code (PAP)', 'Procurement Project', 'PMO/End-User', 'Is this an Early Procurement Activity?', 'Mode of Procurement', 'Advert/Posting of IAEB', 'Submission/Opening of Bids', 'Notice of Award', 'Contract Signing', 'Source of Funds', { content: 'Estimated Budget (PhP)', styles: { halign: 'right' } }, 'Remarks']];
        const body: any[] = [];
        const monthColumns = ['', '', '', ''];

        const addItemsToBody = (items: PpmpProjectItem[]) => { items.forEach(item => { body.push([ item.papCode || 'N/A', item.generalDescription, item.office, item.preProcCon === 'Yes' ? 'Yes' : 'No', item.procurementMode, ...monthColumns, item.sourceOfFunds || '', { content: item.estimatedBudget }, item.remarks || '' ]); }); };

        body.push([{ content: 'PART I: AVAILABLE AT PROCUREMENT SERVICE-DBM (PS-DBM) OR COMMON-USE SUPPLIES & EQUIPMENT (CSE)', colSpan: 12, styles: { halign: 'center', fontStyle: 'bold', fillColor: [211, 211, 211], textColor: [0, 0, 0] } }]);
        addItemsToBody(cseItems);
        body.push([{ content: 'Sub-Total for PART I:', colSpan: 10, styles: { halign: 'right', fontStyle: 'bold' } }, { content: totals.cse }, '']);
        
        body.push([{ content: 'PART II: OTHER ITEMS AND/OR NON-COMMON-USE SUPPLIES & EQUIPMENT (NON-CSE)', colSpan: 12, styles: { halign: 'center', fontStyle: 'bold', fillColor: [211, 211, 211], textColor: [0, 0, 0] } }]);
        sortedNonCseKeys.forEach(category => {
            const items = nonCseGroups[category] || [];
            const subtotal = items.reduce((sum, item) => sum + item.estimatedBudget, 0);
            body.push([{ content: category.toUpperCase(), colSpan: 12, styles: { fontStyle: 'bold', fillColor: [230, 230, 230], textColor: [0, 0, 0] } }]);
            addItemsToBody(items);
            body.push([{ content: `Sub-Total for ${category}:`, colSpan: 10, styles: { halign: 'right', fontStyle: 'bold' } }, { content: subtotal }, '']);
        });

        doc.autoTable({
            head: head,
            body: body,
            startY: 80,
            theme: 'grid',
            headStyles: { font: 'times', fontStyle: 'bold', fontSize: 7, halign: 'center', fillColor: [211, 211, 211], textColor: [0, 0, 0] },
            styles: { font: 'times', fontSize: 7, cellPadding: 2, overflow: 'linebreak' },
            didParseCell: (data) => {
                if (data.column.index === 10 && typeof (data.cell.raw as any)?.content === 'number') {
                    const budget = (data.cell.raw as any).content;
                    data.cell.raw = budget;
                    data.cell.text = [budget.toLocaleString('en-US', { minimumFractionDigits: 2 })];
                    data.cell.styles.halign = 'right';
                }
            },
            didDrawPage: (data) => {
                doc.setFontSize(12); doc.setFont('times', 'bold');
                doc.text("ANNUAL PROCUREMENT PLAN FOR FY 2026", doc.internal.pageSize.getWidth() / 2, 50, { align: 'center' });
                
                let totalOnPage = 0;
                data.table.body.forEach((row: any) => {
                    if (row.pageNumber === data.pageNumber) {
                        const cell = row.cells[10];
                        if (cell && typeof cell.raw === 'number' && !isNaN(cell.raw)) {
                            totalOnPage += cell.raw;
                        }
                    }
                });

                const pageHeight = doc.internal.pageSize.getHeight();
                doc.setFontSize(8);
                doc.setFont('times', 'italic');
                doc.text(`Page ${data.pageNumber} of ${data.pageCount}`, doc.internal.pageSize.getWidth() - 40, pageHeight - 20, { align: 'right' });
                
                doc.setFont('times', 'bold');
                if (data.pageNumber < data.pageCount) {
                     doc.text(`Page Subtotal: Php ${totalOnPage.toLocaleString('en-US', {minimumFractionDigits: 2})}`, doc.internal.pageSize.getWidth() - 40, pageHeight - 30, { align: 'right' });
                } else {
                    doc.setFontSize(9);
                    doc.text(`GRAND TOTAL: Php ${totals.grandTotal.toLocaleString('en-US', {minimumFractionDigits: 2})}`, doc.internal.pageSize.getWidth() - 40, pageHeight - 30, { align: 'right' });
                }
            },
            margin: { top: 80, bottom: 50 }
        });
        
        doc.save('Annual_Procurement_Plan_FY2026.pdf');
    };
    
    useImperativeHandle(ref, () => ({ exportToPdf, exportToExcel }));

    const renderTableSection = (title: string, data: PpmpProjectItem[], subtotal: number) => (
        <React.Fragment>
            <tr className="bg-gray-200 font-bold"><td colSpan={12} className="p-1 border border-black">{title}</td></tr>
            {data.length > 0 ? data.map((item, index) => (
                <tr key={`${item.id}-${index}`}>
                    <td className="border border-black p-1">{item.papCode || 'N/A'}</td>
                    <td className="border border-black p-1">{item.generalDescription}</td>
                    <td className="border border-black p-1">{item.office}</td>
                    <td className="border border-black p-1 text-center">{item.preProcCon === 'Yes' ? 'Yes' : 'No'}</td>
                    <td className="border border-black p-1">{item.procurementMode}</td>
                    <td className="border border-black p-1"></td><td className="border border-black p-1"></td><td className="border border-black p-1"></td><td className="border border-black p-1"></td>
                    <td className="border border-black p-1">{item.sourceOfFunds}</td>
                    <td className="border border-black p-1 text-right">{item.estimatedBudget.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                    <td className="border border-black p-1">{item.remarks}</td>
                </tr>
            )) : <tr><td colSpan={12} className="border border-black p-2 text-center text-gray-500 italic">No items for this category.</td></tr>}
            <tr className="bg-gray-100 font-bold">
                <td colSpan={10} className="p-1 border border-black text-right">Sub-Total for this item:</td>
                <td className="p-1 border border-black text-right">{subtotal.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                <td className="border border-black"></td>
            </tr>
        </React.Fragment>
    );

    return (
         <div className="h-full overflow-auto bg-gray-200 p-4 no-drag">
             <div id="app-view-content" className="bg-white p-4 mx-auto" style={{ width: '13in', minHeight: '8.5in', fontFamily: "'Times New Roman', Times, serif", fontSize: '9pt' }}>
                <div className="text-center font-bold text-lg mb-4">ANNUAL PROCUREMENT PLAN FOR FY 2026</div>
                <table className="w-full border-collapse border border-black mt-4 text-[7pt]">
                    <thead className="text-center font-bold">
                        <tr>
                            <th colSpan={12} className="border border-black p-1">Schedule of Procurement Activities</th>
                        </tr>
                        <tr>
                            <th rowSpan={2} className="border border-black p-1 w-[8%]">Code (PAP)</th><th rowSpan={2} className="border border-black p-1 w-[18%]">Procurement Project</th><th rowSpan={2} className="border border-black p-1 w-[12%]">PMO/End-User</th><th rowSpan={2} className="border border-black p-1 w-[5%]">Is this an Early Procurement Activity?</th><th rowSpan={2} className="border border-black p-1 w-[8%]">Mode of Procurement</th><th colSpan={4} className="border border-black p-1">Schedule for Each Procurement Activity</th><th rowSpan={2} className="border border-black p-1 w-[8%]">Source of Funds</th><th rowSpan={2} className="border border-black p-1 w-[8%]">Estimated Budget (PhP)</th><th rowSpan={2} className="border border-black p-1 w-[8%]">Remarks</th>
                        </tr>
                        <tr>
                            <th className="border border-black p-1 w-[5%]">Advert/Posting of IAEB</th><th className="border border-black p-1 w-[5%]">Submission/Opening of Bids</th><th className="border border-black p-1 w-[5%]">Notice of Award</th><th className="border border-black p-1 w-[5%]">Contract Signing</th>
                        </tr>
                    </thead>
                    <tbody>
                        {renderTableSection("PART I: AVAILABLE AT PROCUREMENT SERVICE-DBM (PS-DBM) OR COMMON-USE SUPPLIES & EQUIPMENT (CSE)", cseItems, totals.cse)}
                        {sortedNonCseKeys.map(category => {
                            const items = nonCseGroups[category];
                            const subtotal = items.reduce((sum, item) => sum + item.estimatedBudget, 0);
                            return renderTableSection(`PART II: OTHER ITEMS AND/OR NON-COMMON-USE SUPPLIES & EQUIPMENT (NON-CSE) - ${category.toUpperCase()}`, items, subtotal);
                        })}
                    </tbody>
                    <tfoot>
                        <tr className="font-bold bg-gray-300">
                            <td colSpan={10} className="p-1 border border-black text-right">GRAND TOTAL:</td>
                            <td className="p-1 border border-black text-right">{totals.grandTotal.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                            <td className="border border-black"></td>
                        </tr>
                    </tfoot>
                </table>
             </div>
        </div>
    );
});

export default AppView;
