import React, { useState, useRef, useMemo } from 'react';
import { extractPpmpData, analyzePpmpForImprovements } from '../../services/geminiService';
import { PpmpItem, PpmpAnalysisResult } from '../../types';
import Loader from '../Loader';

declare global {
    interface Window {
        jspdf: { 
            jsPDF: new (options?: any) => any;
            plugin: any;
        };
    }
}

interface jsPDFWithAutoTable extends InstanceType<typeof window.jspdf.jsPDF> {
  autoTable: {
    (options: any): jsPDFWithAutoTable;
    previous?: { finalY: number };
  };
}

const PPMPExporterTab: React.FC = () => {
    const [files, setFiles] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [items, setItems] = useState<PpmpItem[]>([]);
    const [analysisResult, setAnalysisResult] = useState<PpmpAnalysisResult | null>(null);
    const [analysisLoading, setAnalysisLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const summaryData = useMemo(() => {
        if (!items || items.length === 0) return null;

        const projectItems = items.filter(item => !item.isCategory && item.amount);
        const totalBudget = projectItems.reduce((sum, item) => sum + parseFloat(item.amount?.replace(/,/g, '') || '0'), 0);
        const modeBreakdown = projectItems.reduce((acc, item) => {
            const mode = item.procurementMode?.trim() || 'Unspecified';
            const amount = parseFloat(item.amount?.replace(/,/g, '') || '0');
            acc[mode] = (acc[mode] || 0) + amount;
            return acc;
        }, {} as Record<string, number>);

        const quarterlyBudget = { Q1: 0, Q2: 0, Q3: 0, Q4: 0 };
        const monthMap: { [key: string]: keyof typeof quarterlyBudget } = { jan: 'Q1', feb: 'Q1', mar: 'Q1', apr: 'Q2', may: 'Q2', jun: 'Q2', jul: 'Q3', aug: 'Q3', sep: 'Q3', oct: 'Q4', nov: 'Q4', dec: 'Q4' };

        projectItems.forEach(item => {
            const unitCost = parseFloat(item.unitCost?.replace(/,/g, '') || '0');
            const totalAmount = parseFloat(item.amount?.replace(/,/g, '') || '0');
            let scheduledAmount = 0;
            let scheduledQty = 0;
            
            Object.keys(monthMap).forEach(month => {
                const qty = parseFloat((item as any)[month] || '0');
                if (qty > 0) {
                    scheduledQty += qty;
                    const monthAmount = qty * unitCost;
                    quarterlyBudget[monthMap[month]] += monthAmount;
                    scheduledAmount += monthAmount;
                }
            });

            // If no schedule found, distribute total amount evenly
            if (scheduledQty === 0 && totalAmount > 0) {
                for (const q of ['Q1', 'Q2', 'Q3', 'Q4']) {
                    quarterlyBudget[q as keyof typeof quarterlyBudget] += totalAmount / 4;
                }
            }
        });

        return { totalBudget, modeBreakdown, quarterlyBudget, totalProjects: projectItems.length };
    }, [items]);


    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = event.target.files ? Array.from(event.target.files) : [];
        if (selectedFiles.length > 0) {
            setFiles(selectedFiles);
            setItems([]);
            setError('');
            setAnalysisResult(null);
        }
    };

    const handleAnalyze = async () => {
        if (files.length === 0) { setError('Please upload at least one document.'); return; }
        setLoading(true); setAnalysisLoading(true); setError(''); setItems([]); setAnalysisResult(null);
        try {
            const extractedItems = await extractPpmpData(files);
            setItems(extractedItems);
            setLoading(false); // Stop main loader, start analysis loader

            const analysis = await analyzePpmpForImprovements(extractedItems);
            setAnalysisResult(analysis);
        } catch (err: any) {
            console.error(err);
            setError(`Failed to process document: ${err.message}`);
            setLoading(false);
        } finally {
            setAnalysisLoading(false);
        }
    };

    const handleExportCsv = () => {
        if (!items) return;
        const headers = ["isCategory", "papCode", "description", "specificationDetails", "earlyProcurementActivity", "procurementMode", "quantity", "uom", "unitCost", "amount", "jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec", "remarks"];
        const rows = items.map(item => headers.map(header => `"${String((item as any)[header] ?? '').replace(/"/g, '""')}"`).join(','));
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\r\n');
        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csvContent));
        link.setAttribute("download", "ppmp_data.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportPdf = () => {
        if (items.length === 0 || !summaryData) { setError("No data to export."); return; }
        if (!window.jspdf || !(window.jspdf.jsPDF as any).API.autoTable) { setError("PDF generation library not available."); return; }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ orientation: 'landscape', unit: 'in', format: [13, 8.5] }) as jsPDFWithAutoTable;
        
        // --- Page 1: Summary Page ---
        doc.setFontSize(20).setFont('helvetica', 'bold');
        doc.text('PPMP Analysis Report & Executive Summary', 0.5, 0.7);
        doc.setFontSize(10).setFont('helvetica', 'normal');
        doc.text(`Source Document(s): ${files.map(f => f.name).join(', ')}`, 0.5, 0.9);
        
        doc.autoTable({
            startY: 1.1, theme: 'plain',
            body: [[ `Total Budget: ${summaryData.totalBudget.toLocaleString('en-US', {style:'currency', currency:'PHP'})}`, `Total Line Items: ${summaryData.totalProjects}` ]],
            styles: { fontSize: 12, fontStyle: 'bold' }
        });
        
        if (analysisResult) {
            doc.setFontSize(12).setFont('helvetica', 'bold');
            doc.text("AI Executive Summary", 0.5, (doc as any).autoTable.previous.finalY + 0.4);
            const summaryLines = doc.splitTextToSize(analysisResult.executiveSummary, 12);
            doc.setFontSize(10).setFont('helvetica', 'normal');
            doc.text(summaryLines, 0.5, (doc as any).autoTable.previous.finalY + 0.6);
            
            doc.autoTable({
                startY: (doc as any).autoTable.previous.finalY + 0.4 + (summaryLines.length * 0.2),
                head: [['AI Audit Findings & Recommendations']],
                body: analysisResult.keyFindings.map(f => [ `${f.findingType}: ${f.itemDescription}\nDetails: ${f.details}\nRecommendation: ${f.recommendation}` ]),
                headStyles: { fillColor: '#f97316' }, theme: 'striped'
            });
        }
        
        // --- Subsequent Pages: Data Tables ---
        const drawHeaderFooter = (data: any) => {
            doc.setFontSize(10).setFont('helvetica', 'bold');
            doc.text('GOVERNMENT PROCUREMENT POLICY BOARD-TECHNICAL SUPPORT OFFICE', doc.internal.pageSize.getWidth() / 2, 0.4, { align: 'center' });
            doc.setFontSize(8).setFont('helvetica', 'normal');
            doc.text('Unit 2506, Raffles Corporate Center, Fortigas Jr. Road, Ortigas Center, Pasig City', doc.internal.pageSize.getWidth() / 2, 0.55, { align: 'center' });
            doc.setFontSize(12).setFont('helvetica', 'bold');
            doc.text('PROJECT PROCUREMENT MANAGEMENT PLAN (PPMP) 2026', doc.internal.pageSize.getWidth() / 2, 0.8, { align: 'center' });
            doc.setFontSize(10);
            doc.text("END-USER: CITY DEPARTMENT OF AGRICULTURE", 0.5, 1.1);
        };
        
        const head = [ ['PAP Code', 'Project/Activity/Program 2025 FY', 'Specification Details', 'Is this an Early Procurement Activity? (Yes/No)', 'Mode of Procurement', 'Qty', { content: 'Amount (Php)/ Estimated Budget', styles: { halign: 'right' } }, 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Remarks'] ];
        const body = items.map(item => {
            if (item.isCategory) return [{ content: item.description, colSpan: 20, styles: { fontStyle: 'bold', fillColor: '#f3f4f6' } }];
            return [ item.papCode || '', item.description || '', item.specificationDetails || '', item.earlyProcurementActivity || 'No', item.procurementMode || '', item.quantity || '', { content: item.amount || '', styles: { halign: 'right' } }, item.jan || '', item.feb || '', item.mar || '', item.apr || '', item.may || '', item.jun || '', item.jul || '', item.aug || '', item.sep || '', item.oct || '', item.nov || '', item.dec || '', item.remarks || '' ];
        });

        doc.addPage();
        doc.autoTable({
            head, body, startY: 1.3, theme: 'grid',
            didDrawPage: drawHeaderFooter,
            styles: { fontSize: 5, cellPadding: 0.03, valign: 'middle' },
            headStyles: { fillColor: '#e5e7eb', textColor: '#111827', fontStyle: 'bold', halign: 'center', fontSize: 6, cellPadding: 0.05 },
            columnStyles: {
                0: { cellWidth: 0.6 }, 1: { cellWidth: 1.5 }, 2: { cellWidth: 1.5 }, 3: { cellWidth: 0.7, halign: 'center' },
                4: { cellWidth: 0.8 }, 5: { cellWidth: 0.3, halign: 'center' }, 6: { cellWidth: 0.8 },
                ...Object.fromEntries(Array.from({ length: 12 }, (_, i) => [i + 7, { cellWidth: 0.3, halign: 'center' }])),
                19: { cellWidth: 'auto' }
            },
            margin: { top: 1.3, right: 0.3, bottom: 1.0, left: 0.3 },
        });

        const finalY = (doc.autoTable.previous?.finalY || doc.internal.pageSize.getHeight() - 1) + 0.3;
        doc.setFontSize(8).setFont('helvetica', 'normal');
        doc.text('Prepared and submitted by:', 1, finalY);
        doc.text('Verified by:', doc.internal.pageSize.getWidth() / 2, finalY);
        doc.text("_________________________", 1, finalY + 0.4);
        doc.text("OIC, City Agriculture Department", 1.2, finalY + 0.5);
        doc.text("_________________________", doc.internal.pageSize.getWidth() / 2, finalY + 0.4);
        doc.text("City Budget Officer", doc.internal.pageSize.getWidth() / 2 + 0.5, finalY + 0.5);

        doc.save(`PPMP_Report_${files.map(f=>f.name.split('.')[0]).join('_')}.pdf`);
    };

    return (
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center"> <svg className="w-8 h-8 mr-3 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg> PPMP Data Extractor & Auditor </h2>
            <p className="text-gray-600 mb-6">Upload a PPMP document (PDF/Image). The AI will extract data, audit it for compliance, and generate a professional, exportable report.</p>
            <div className="bg-gray-50 p-4 rounded-lg border border-dashed border-gray-300 mb-6">
                <label htmlFor="ppmp-upload" className="block text-sm font-medium text-gray-700 mb-2">Upload PPMP Document(s)</label>
                <input ref={fileInputRef} type="file" id="ppmp-upload" accept="image/*,.pdf" multiple onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100" disabled={loading || analysisLoading} />
                {files.length > 0 && <div className="mt-2 text-xs text-gray-600">Selected: {files.map(f => f.name).join(', ')}</div>}
            </div>
            <button onClick={handleAnalyze} className="btn bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-lg w-full disabled:bg-gray-400" disabled={loading || analysisLoading || files.length === 0}>
                {loading ? 'Extracting...' : analysisLoading ? 'Auditing...' : `Analyze ${files.length} Document(s)`}
            </button>
            {(loading || analysisLoading) && <Loader text={loading ? "AI is extracting data..." : "AI is auditing the plan..."} />}
            {error && <p className="text-center text-red-500 my-4">{error}</p>}
            
            {items.length > 0 && (
                <div className="mt-8">
                    {summaryData && (
                        <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Summary Dashboard</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white p-3 rounded-md shadow-sm"><p className="text-xs text-gray-500">Total Budget</p><p className="font-bold text-lg">{summaryData.totalBudget.toLocaleString('en-US',{style:'currency', currency:'PHP'})}</p></div>
                                <div className="bg-white p-3 rounded-md shadow-sm"><p className="text-xs text-gray-500">Total Line Items</p><p className="font-bold text-lg">{summaryData.totalProjects}</p></div>
                            </div>
                        </div>
                    )}
                    {analysisResult && (
                        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                             <h3 className="text-xl font-bold text-blue-800 mb-2">AI Recommendations</h3>
                             <p className="text-sm italic text-blue-700 mb-3">{analysisResult.executiveSummary}</p>
                             <div className="space-y-2">
                                {analysisResult.keyFindings.map((finding, i) => (
                                    <div key={i} className="bg-white p-2 rounded-md text-xs border-l-4 border-orange-400">
                                        <p><strong>{finding.findingType}:</strong> {finding.itemDescription}</p>
                                        <p className="text-gray-600">{finding.details} <span className="font-semibold">Recommendation: {finding.recommendation}</span></p>
                                    </div>
                                ))}
                             </div>
                        </div>
                    )}
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-gray-800">Extracted Data</h3>
                        <div className="flex gap-2">
                           <button onClick={handleExportPdf} className="btn bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg text-sm">Export PDF</button>
                           <button onClick={handleExportCsv} className="btn bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg text-sm">Export CSV</button>
                        </div>
                   </div>
                    <div className="overflow-x-auto rounded-lg border border-gray-200 max-h-96">
                       <table className="min-w-full bg-white text-xs">
                           <thead className="bg-gray-100 sticky top-0"><tr><th className="p-2 text-left font-semibold">Description</th><th className="p-2 text-left font-semibold">Mode</th><th className="p-2 text-right font-semibold">Amount</th></tr></thead>
                            <tbody>
                               {items.map((item, index) => (
                                   <tr key={index} className={item.isCategory ? 'bg-orange-100 font-bold' : 'hover:bg-gray-50'}>
                                       <td className="p-1.5 border-t" colSpan={item.isCategory ? 3 : 1}>{item.description}</td>
                                       {!item.isCategory && (<>
                                           <td className="p-1.5 border-t">{item.procurementMode}</td>
                                           <td className="p-1.5 border-t text-right font-mono font-semibold">{item.amount}</td>
                                       </>)}
                                   </tr>
                               ))}
                           </tbody>
                       </table>
                   </div>
                </div>
            )}
        </div>
    );
};

export default PPMPExporterTab;
