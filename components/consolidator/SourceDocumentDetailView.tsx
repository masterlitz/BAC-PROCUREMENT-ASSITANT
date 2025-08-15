import React, { useMemo, forwardRef, useImperativeHandle } from 'react';
import { PpmpProjectItem, PurchaseRequest } from '../../types';
import { bacolodCityLogo } from '../../data/logo';

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
}

// A single, reliable currency formatter used throughout the component.
const formatCurrency = (value: number) => `₱${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const ProgressBar: React.FC<{ percentage: number }> = ({ percentage }) => {
    const safePercentage = Math.min(100, Math.max(0, percentage));
    let bgColor = 'bg-green-500';
    if (safePercentage > 75) bgColor = 'bg-yellow-500';
    if (safePercentage >= 100) bgColor = 'bg-red-500';

    return (
        <div className="w-full bg-gray-200 rounded-full h-4 relative overflow-hidden">
            <div className={`h-full rounded-full ${bgColor}`} style={{ width: `${safePercentage}%` }}></div>
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-black mix-blend-screen">
                {safePercentage.toFixed(1)}%
            </span>
        </div>
    );
};


interface SourceDocumentDetailViewProps {
    items: PpmpProjectItem[];
    purchaseRequests: PurchaseRequest[];
}

const SourceDocumentDetailView = forwardRef<({ exportToPdf: () => void; exportToExcel: () => void; }), SourceDocumentDetailViewProps>(({ items, purchaseRequests }, ref) => {
    
    const consumedData = useMemo(() => {
        const consumptionMap = new Map<number, number>();
        const officeItemIds = new Set(items.map(i => i.id));
        purchaseRequests.forEach(pr => {
            if (officeItemIds.has(pr.projectId)) {
                const current = consumptionMap.get(pr.projectId) || 0;
                consumptionMap.set(pr.projectId, current + pr.actualCost);
            }
        });
        return consumptionMap;
    }, [purchaseRequests, items]);

    const officeSummary = useMemo(() => {
        const totalBudget = items.reduce((sum, item) => sum + item.estimatedBudget, 0);
        const totalConsumed = Array.from(consumedData.values()).reduce((sum, cost) => sum + cost, 0);
        return { 
            totalBudget, 
            totalConsumed, 
            remaining: totalBudget - totalConsumed,
            overallUtilization: totalBudget > 0 ? (totalConsumed / totalBudget) * 100 : 0
        };
    }, [items, consumedData]);
    
    useImperativeHandle(ref, () => ({
        exportToExcel: () => {
             const escapeCsvCell = (cellData: any) => {
                const stringData = String(cellData ?? '');
                if (stringData.includes(',') || stringData.includes('"') || stringData.includes('\n')) {
                    return `"${stringData.replace(/"/g, '""')}"`;
                }
                return stringData;
            };
            
            let csvContent = "data:text/csv;charset=utf-8,";
            
            // Summary Info with formatted currency
            csvContent += `Office,${escapeCsvCell(items[0]?.office || 'N/A')}\r\n`;
            csvContent += `Total Budget (PHP),${escapeCsvCell(formatCurrency(officeSummary.totalBudget))}\r\n`;
            csvContent += `Total Consumed (PHP),${escapeCsvCell(formatCurrency(officeSummary.totalConsumed))}\r\n`;
            csvContent += `Remaining Balance (PHP),${escapeCsvCell(formatCurrency(officeSummary.remaining))}\r\n`;
            csvContent += `Overall Utilization (%),${officeSummary.overallUtilization.toFixed(2)}\r\n\r\n`;
            
            const headers = ['ID', 'Description', 'Procurement Mode', 'Est. Budget (PHP)', 'Consumed (PHP)', 'Balance (PHP)', '% Utilized', 'Timeline', 'Source of Funds'];
            csvContent += headers.join(',') + '\r\n';
            
            items.forEach(item => {
                const consumed = consumedData.get(item.id) || 0;
                const balance = item.estimatedBudget - consumed;
                const utilization = item.estimatedBudget > 0 ? (consumed / item.estimatedBudget) * 100 : 0;
                const row = [
                    item.id,
                    escapeCsvCell(item.generalDescription),
                    item.procurementMode,
                    escapeCsvCell(formatCurrency(item.estimatedBudget)),
                    escapeCsvCell(formatCurrency(consumed)),
                    escapeCsvCell(formatCurrency(balance)),
                    utilization.toFixed(2),
                    `${item.procurementStart || ''} - ${item.procurementEnd || ''}`,
                    item.sourceOfFunds
                ];
                csvContent += row.join(',') + '\r\n';
            });

             csvContent += `\r\n,,Totals:,${escapeCsvCell(formatCurrency(officeSummary.totalBudget))},${escapeCsvCell(formatCurrency(officeSummary.totalConsumed))},${escapeCsvCell(formatCurrency(officeSummary.remaining))},,,\r\n`;
            
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `PPMP_Detail_${items[0]?.office.replace(/ /g,"_")}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        },
        exportToPdf: () => {
            if (!window.jspdf) {
                alert("PDF export library not found.");
                return;
            }
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({ orientation: 'l', unit: 'pt', format: 'legal' }) as jsPDFWithAutoTable;
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 40;

            const head = [['Code', 'Procurement Program/Project', 'Mode of Procurement', 'Schedule for Delivery/Implementation', 'Source of Funds', 'Estimated Budget', 'Remarks']];
            const body = items.map(item => [
                item.id,
                item.generalDescription,
                item.procurementMode,
                item.deliveryImplementation || `${item.procurementStart || ''} - ${item.procurementEnd || ''}`,
                item.sourceOfFunds,
                formatCurrency(item.estimatedBudget),
                item.remarks || '',
            ]);

            const totalBudget = items.reduce((sum, item) => sum + item.estimatedBudget, 0);
            const foot = [['', '', '', '', 'GRAND TOTAL', formatCurrency(totalBudget), '']];

            const drawHeaderFooter = (data: any) => {
                // Page Header
                try { doc.addImage(bacolodCityLogo, 'PNG', margin, 15, 50, 50); } catch (e) { console.error("Could not add logo to PDF:", e); }
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(10);
                doc.text("Republic of the Philippines", pageWidth / 2, 30, { align: 'center' });
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(12);
                doc.text("City of Bacolod", pageWidth / 2, 45, { align: 'center' });
                doc.setFontSize(14);
                doc.text("PROJECT PROCUREMENT MANAGEMENT PLAN (PPMP)", pageWidth / 2, 70, { align: 'center' });
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                doc.text(`End-User/Department: ${items[0]?.office || 'N/A'}`, margin, 90);
                doc.text(`Fiscal Year: 2026 (Indicative)`, pageWidth - margin, 90, { align: 'right' });
                
                // Page Footer
                const pageCount = doc.internal.getNumberOfPages();
                doc.setFontSize(8);
                doc.text(`Page ${data.pageNumber} of ${pageCount}`, data.settings.margin.left, pageHeight - 15);
            };

            doc.autoTable({
                head: head,
                body: body,
                foot: foot,
                theme: 'grid',
                headStyles: { fillColor: '#2d3748', textColor: '#FFFFFF', fontStyle: 'bold', halign: 'center', fontSize: 8 },
                footStyles: { fillColor: '#E2E8F0', textColor: '#1A202C', fontStyle: 'bold', halign: 'right', fontSize: 9 },
                styles: { fontSize: 8, cellPadding: 4, overflow: 'linebreak', font: 'helvetica' },
                columnStyles: {
                    0: { halign: 'center', cellWidth: 40 },
                    1: { cellWidth: 250 }, 
                    2: { cellWidth: 100 },
                    3: { halign: 'center', cellWidth: 80 },
                    4: { cellWidth: 70 },
                    5: { halign: 'right', cellWidth: 100 }, 
                    6: { cellWidth: 'auto' },
                },
                didDrawPage: drawHeaderFooter,
                margin: { top: 110, bottom: 80 }
            });
            
            let finalY = (doc as any).autoTable.previous.finalY;

            // --- Monthly & Quarterly Utilization ---
            const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            const monthKeys = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
            const monthlyData = monthNames.map(name => ({ month: name, budget: 0, consumed: 0 }));
            
            items.forEach(item => {
                monthKeys.forEach((key, index) => {
                    monthlyData[index].budget += (item.schedule as any)?.[key] || 0;
                });
            });

            purchaseRequests.forEach(pr => {
                const prDate = new Date(pr.date);
                const monthIndex = prDate.getMonth();
                if (monthIndex >= 0 && monthIndex < 12) {
                    monthlyData[monthIndex].consumed += pr.actualCost;
                }
            });

            const quarterlyData = [
                { quarter: 'Q1', budget: 0, consumed: 0 }, { quarter: 'Q2', budget: 0, consumed: 0 },
                { quarter: 'Q3', budget: 0, consumed: 0 }, { quarter: 'Q4', budget: 0, consumed: 0 }
            ];

            monthlyData.forEach((monthData, index) => {
                const quarterIndex = Math.floor(index / 3);
                quarterlyData[quarterIndex].budget += monthData.budget;
                quarterlyData[quarterIndex].consumed += monthData.consumed;
            });

            // Add Monthly Table
            doc.autoTable({
                startY: finalY + 20,
                head: [['Monthly Utilization Summary']],
                theme: 'plain',
                headStyles: { fontStyle: 'bold', fontSize: 12 },
            });

            doc.autoTable({
                startY: (doc as any).autoTable.previous.finalY + 5,
                head: [['Month', 'Budget', 'Consumed', 'Utilization (%)']],
                body: monthlyData.map(data => [
                    data.month,
                    formatCurrency(data.budget),
                    formatCurrency(data.consumed),
                    data.budget > 0 ? `${((data.consumed / data.budget) * 100).toFixed(2)}%` : '0.00%'
                ]),
                foot: [[
                    'Total',
                    formatCurrency(officeSummary.totalBudget),
                    formatCurrency(officeSummary.totalConsumed),
                    `${officeSummary.overallUtilization.toFixed(2)}%`
                ]],
                theme: 'grid',
                headStyles: { fillColor: '#4A5568' },
                footStyles: { fillColor: '#E2E8F0', fontStyle: 'bold' }
            });
            finalY = (doc as any).autoTable.previous.finalY;

            // Add Quarterly Table
            doc.autoTable({
                startY: finalY + 20,
                head: [['Quarterly Utilization Summary']],
                theme: 'plain',
                headStyles: { fontStyle: 'bold', fontSize: 12 },
            });
            
            doc.autoTable({
                startY: (doc as any).autoTable.previous.finalY + 5,
                head: [['Quarter', 'Budget', 'Consumed', 'Utilization (%)']],
                body: quarterlyData.map(data => [
                    data.quarter,
                    formatCurrency(data.budget),
                    formatCurrency(data.consumed),
                    data.budget > 0 ? `${((data.consumed / data.budget) * 100).toFixed(2)}%` : '0.00%'
                ]),
                 foot: [[
                    'Total',
                    formatCurrency(officeSummary.totalBudget),
                    formatCurrency(officeSummary.totalConsumed),
                    `${officeSummary.overallUtilization.toFixed(2)}%`
                ]],
                theme: 'grid',
                headStyles: { fillColor: '#4A5568' },
                footStyles: { fillColor: '#E2E8F0', fontStyle: 'bold' }
            });
            finalY = (doc as any).autoTable.previous.finalY;
            
            // Signatory Section
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.text("Prepared by:", margin, finalY + 40);
            doc.text("Approved by:", pageWidth / 2, finalY + 40);

            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text("_________________________", margin, finalY + 80);
            doc.text("END-USER/DEPARTMENT HEAD", margin, finalY + 95);
            
            doc.text("_________________________", pageWidth / 2, finalY + 80);
            doc.text("HEAD OF THE PROCURING ENTITY", pageWidth / 2, finalY + 95);

            doc.save(`PPMP_Report_${items[0]?.office.replace(/ /g,"_")}.pdf`);
        }
    }));

    return (
        <div className="space-y-4 h-full flex flex-col no-drag bg-white rounded-lg shadow-inner border">
            <div className="p-4 border-b flex-shrink-0">
                <h3 className="text-lg font-bold text-gray-800">Detailed View: {items[0]?.office}</h3>
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-2">
                    <div className="text-center bg-blue-50 p-2 rounded-md border border-blue-200">
                        <p className="text-xs text-blue-800 font-semibold">Total Budget</p>
                        <p className="text-lg font-bold text-blue-700">{formatCurrency(officeSummary.totalBudget)}</p>
                    </div>
                    <div className="text-center bg-orange-50 p-2 rounded-md border border-orange-200">
                        <p className="text-xs text-orange-800 font-semibold">Total Consumed</p>
                        <p className="text-lg font-bold text-orange-700">{formatCurrency(officeSummary.totalConsumed)}</p>
                    </div>
                     <div className="text-center bg-green-50 p-2 rounded-md border border-green-200">
                        <p className="text-xs text-green-800 font-semibold">Remaining Balance</p>
                        <p className="text-lg font-bold text-green-700">{formatCurrency(officeSummary.remaining)}</p>
                    </div>
                    <div className="text-center bg-gray-100 p-2 rounded-md border border-gray-300">
                        <p className="text-xs text-gray-800 font-semibold">Overall Utilization</p>
                        <div className="mt-1 px-2"><ProgressBar percentage={officeSummary.overallUtilization} /></div>
                    </div>
                </div>
            </div>
            
            <div className="flex-grow overflow-auto">
                <table className="min-w-full text-[10px] border-collapse">
                    <thead className="bg-gray-100 sticky top-0 z-10">
                        <tr>
                            <th className="p-1.5 border text-left font-semibold">ID</th>
                            <th className="p-1.5 border text-left font-semibold min-w-[250px]">Description</th>
                            <th className="p-1.5 border text-left font-semibold min-w-[120px]">Procurement Mode</th>
                            <th className="p-1.5 border text-right font-semibold min-w-[90px]">Est. Budget</th>
                            <th className="p-1.5 border text-right font-semibold min-w-[90px]">Consumed</th>
                            <th className="p-1.5 border text-right font-semibold min-w-[90px]">Balance</th>
                            <th className="p-1.5 border text-center font-semibold w-28 min-w-[112px]">% Utilized</th>
                            <th className="p-1.5 border text-left font-semibold">Timeline</th>
                            <th className="p-1.5 border text-left font-semibold">Source of Funds</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white">
                        {items.map(item => {
                            const consumed = consumedData.get(item.id) || 0;
                            const balance = item.estimatedBudget - consumed;
                            const utilization = item.estimatedBudget > 0 ? (consumed / item.estimatedBudget) * 100 : 0;
                            return (
                                <tr key={item.id} className="border-b hover:bg-gray-50">
                                    <td className="p-1.5 border align-top text-center font-mono">{item.id}</td>
                                    <td className="p-1.5 border align-top font-semibold" title={item.generalDescription}>{item.generalDescription}</td>
                                    <td className="p-1.5 border align-top">{item.procurementMode}</td>
                                    <td className="p-1.5 border align-top text-right font-mono">{formatCurrency(item.estimatedBudget)}</td>
                                    <td className="p-1.5 border align-top text-right font-mono text-orange-700">{formatCurrency(consumed)}</td>
                                    <td className="p-1.5 border align-top text-right font-mono font-bold text-green-700">{formatCurrency(balance)}</td>
                                    <td className="p-1.5 border align-middle"><ProgressBar percentage={utilization} /></td>
                                    <td className="p-1.5 border align-top">{item.procurementStart} - {item.procurementEnd}</td>
                                    <td className="p-1.5 border align-top">{item.sourceOfFunds}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                    <tfoot className="bg-gray-200 font-bold sticky bottom-0">
                        <tr>
                            <td colSpan={3} className="p-2 border text-right">Office Totals:</td>
                            <td className="p-2 border text-right font-mono">{formatCurrency(officeSummary.totalBudget)}</td>
                            <td className="p-2 border text-right font-mono">{formatCurrency(officeSummary.totalConsumed)}</td>
                            <td className="p-2 border text-right font-mono">{formatCurrency(officeSummary.remaining)}</td>
                            <td colSpan={3} className="p-2 border"></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
});

export default SourceDocumentDetailView;