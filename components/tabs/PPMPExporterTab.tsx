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
  autoTable: (options: any) => jsPDFWithAutoTable;
}

const PPMPExporterTab: React.FC = () => {
    const [files, setFiles] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [items, setItems] = useState<PpmpItem[]>([]);
    const [analysisResult, setAnalysisResult] = useState<PpmpAnalysisResult | null>(null);
    const [analysisLoading, setAnalysisLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const EditableCell: React.FC<{ value: string; onChange: (value: string) => void; className?: string; isNumber?: boolean; }> = ({ value, onChange, className = '', isNumber = false }) => (
        <input
            type={isNumber ? "number" : "text"}
            value={value}
            onChange={e => onChange(e.target.value)}
            className={`w-full h-full bg-transparent p-1 focus:bg-orange-100 focus:outline-none focus:ring-1 focus:ring-orange-400 rounded-sm ${className}`}
        />
    );

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
            setLoading(false); 
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

    const handleItemChange = (index: number, field: keyof PpmpItem, value: string) => {
        const newItems = [...items];
        const itemToUpdate = { ...newItems[index] };
        (itemToUpdate as any)[field] = value;
        newItems[index] = itemToUpdate;
        setItems(newItems);
    };

    const totals = useMemo(() => {
        return items.reduce((acc, item) => {
            if (!item.isCategory) {
                acc.estimatedBudget += parseFloat(item.estimatedBudget?.replace(/,/g, '') || '0');
                acc.amount += parseFloat(item.amount?.replace(/,/g, '') || '0');
            }
            return acc;
        }, { estimatedBudget: 0, amount: 0 });
    }, [items]);

    const formatCurrency = (value: number) => value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const handleExportCsv = () => {
        if (!items) return;
        const headers = ["isCategory", "papCode", "description", "specificationDetails", "quantity", "uom", "estimatedBudget", "procurementMode", "jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec", "unitCost", "amount", "remarks"];
        const rows = items.map(item => headers.map(header => `"${String((item as any)[header] ?? '').replace(/"/g, '""')}"`).join(','));
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\r\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `ppmp_data_${files[0]?.name.split('.')[0] || 'export'}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportPdf = () => {
        if (!items.length) return;
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'legal' }) as jsPDFWithAutoTable;
        
        const head = [['CODE', 'GENERAL DESCRIPTION', 'SPECIFICATION DETAILS', 'QTY', 'UNIT', 'EST. BUDGET', 'MODE', 'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC', 'UNIT COST', 'TOTAL AMOUNT']];
        const body = items.map(item => {
            if (item.isCategory) {
                return [{ content: item.description, colSpan: 5, styles: { fontStyle: 'bold', fillColor: '#fff7ed' } },
                        { content: item.estimatedBudget ? formatCurrency(parseFloat(item.estimatedBudget)) : '', styles: { halign: 'right', fontStyle: 'bold', fillColor: '#fff7ed' }},
                        { content: '', colSpan: 14, styles: {fillColor: '#fff7ed'} },
                        { content: item.amount ? formatCurrency(parseFloat(item.amount)) : '', styles: { halign: 'right', fontStyle: 'bold', fillColor: '#fff7ed' } }];
            }
            return [ item.papCode, item.description, item.specificationDetails, item.quantity, item.uom, item.estimatedBudget, item.procurementMode, item.jan, item.feb, item.mar, item.apr, item.may, item.jun, item.jul, item.aug, item.sep, item.oct, item.nov, item.dec, item.unitCost, item.amount ];
        });

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text("Project Procurement Management Plan (PPMP)", doc.internal.pageSize.getWidth() / 2, 40, { align: 'center' });
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Source Document: ${files[0]?.name || 'N/A'}`, 40, 60);

        doc.autoTable({
            startY: 70,
            head: head,
            body: body,
            theme: 'grid',
            headStyles: { fillColor: '#f97316', fontSize: 6, cellPadding: 2 },
            styles: { fontSize: 6, cellPadding: 2, overflow: 'linebreak' },
            foot: [['','','','','GRAND TOTALS:', formatCurrency(totals.estimatedBudget), '', '', '', '', '', '', '', '', '', '', '', '', '', '', formatCurrency(totals.amount)]],
            footStyles: { fontStyle: 'bold', fontSize: 7, halign: 'right', fillColor: '#fed7aa'},
            columnStyles: { 5: { halign: 'right' }, 19: { halign: 'right' }, 20: { halign: 'right' } }
        });

        doc.save(`PPMP_Export_${files[0]?.name.split('.')[0] || 'report'}.pdf`);
    };

    const monthHeaders = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    
    return (
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center"> <svg className="w-8 h-8 mr-3 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg> PPMP Data Extractor & Auditor </h2>
            <p className="text-gray-600 mb-6">Upload a PPMP document (PDF/Image). The AI will extract data into an editable spreadsheet format, audit it for compliance, and generate professional reports.</p>
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
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-gray-800">Extracted PPMP Data</h3>
                        <div className="flex gap-2">
                           <button onClick={handleExportPdf} className="btn bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg text-sm">Export PDF</button>
                           <button onClick={handleExportCsv} className="btn bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg text-sm">Export CSV</button>
                        </div>
                   </div>
                    <div className="overflow-x-auto rounded-lg border border-gray-200 max-h-[60vh] text-xs">
                       <table className="min-w-full bg-white border-collapse">
                           <thead className="bg-gray-100 sticky top-0 z-10">
                               <tr>
                                   <th className="p-1 border text-left font-semibold">CODE</th>
                                   <th className="p-1 border text-left font-semibold min-w-[200px]">GENERAL DESCRIPTION</th>
                                   <th className="p-1 border text-left font-semibold min-w-[200px]">SPECIFICATION DETAILS</th>
                                   <th className="p-1 border text-left font-semibold">QTY</th>
                                   <th className="p-1 border text-left font-semibold">UNIT</th>
                                   <th className="p-1 border text-right font-semibold">EST. BUDGET</th>
                                   <th className="p-1 border text-left font-semibold">MODE</th>
                                   {monthHeaders.map(m => <th key={m} className="p-1 border text-center font-semibold capitalize">{m}</th>)}
                                   <th className="p-1 border text-right font-semibold">UNIT COST</th>
                                   <th className="p-1 border text-right font-semibold">TOTAL AMOUNT</th>
                                   <th className="p-1 border text-center font-semibold"></th>
                               </tr>
                           </thead>
                            <tbody>
                               {items.map((item, index) => 
                                 item.isCategory ? (
                                   <tr key={index} className="bg-orange-100 font-bold">
                                       <td className="p-1 border"><EditableCell value={item.papCode || ''} onChange={v => handleItemChange(index, 'papCode', v)} /></td>
                                       <td className="p-1 border" colSpan={4}><EditableCell value={item.description || ''} onChange={v => handleItemChange(index, 'description', v)} className="text-orange-800"/></td>
                                       <td className="p-1 border text-right"><EditableCell value={item.estimatedBudget || ''} onChange={v => handleItemChange(index, 'estimatedBudget', v)} isNumber className="text-right" /></td>
                                       <td className="p-1 border" colSpan={14}></td>
                                       <td className="p-1 border text-right"><EditableCell value={item.amount || ''} onChange={v => handleItemChange(index, 'amount', v)} isNumber className="text-right" /></td>
                                       <td className="p-1 border"></td>
                                   </tr>
                                 ) : (
                                   <tr key={index} className="hover:bg-gray-50">
                                       <td className="p-0 border"><EditableCell value={item.papCode || ''} onChange={v => handleItemChange(index, 'papCode', v)} /></td>
                                       <td className="p-0 border"><EditableCell value={item.description || ''} onChange={v => handleItemChange(index, 'description', v)} /></td>
                                       <td className="p-0 border"><EditableCell value={item.specificationDetails || ''} onChange={v => handleItemChange(index, 'specificationDetails', v)} /></td>
                                       <td className="p-0 border"><EditableCell value={item.quantity || ''} onChange={v => handleItemChange(index, 'quantity', v)} isNumber /></td>
                                       <td className="p-0 border"><EditableCell value={item.uom || ''} onChange={v => handleItemChange(index, 'uom', v)} /></td>
                                       <td className="p-0 border"><EditableCell value={item.estimatedBudget || ''} onChange={v => handleItemChange(index, 'estimatedBudget', v)} isNumber className="text-right"/></td>
                                       <td className="p-0 border"><EditableCell value={item.procurementMode || ''} onChange={v => handleItemChange(index, 'procurementMode', v)} /></td>
                                       {monthHeaders.map(m => <td key={m} className="p-0 border"><EditableCell value={(item as any)[m] || ''} onChange={v => handleItemChange(index, m as keyof PpmpItem, v)} isNumber className="text-right"/></td>)}
                                       <td className="p-0 border"><EditableCell value={item.unitCost || ''} onChange={v => handleItemChange(index, 'unitCost', v)} isNumber className="text-right"/></td>
                                       <td className="p-0 border"><EditableCell value={item.amount || ''} onChange={v => handleItemChange(index, 'amount', v)} isNumber className="text-right"/></td>
                                       <td className="p-0 border text-center"></td>
                                   </tr>
                               )
                               )}
                           </tbody>
                           <tfoot className="sticky bottom-0 bg-gray-200 font-bold">
                               <tr>
                                   <td colSpan={5} className="p-2 border text-right">GRAND TOTALS:</td>
                                   <td className="p-2 border text-right font-mono">{formatCurrency(totals.estimatedBudget)}</td>
                                   <td colSpan={14} className="p-2 border"></td>
                                   <td className="p-2 border text-right font-mono">{formatCurrency(totals.amount)}</td>
                                   <td className="p-2 border"></td>
                               </tr>
                           </tfoot>
                       </table>
                   </div>
                    {analysisResult && (
                        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                             <h3 className="text-xl font-bold text-blue-800 mb-2">AI Audit & Recommendations</h3>
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
                </div>
            )}
        </div>
    );
};

export default PPMPExporterTab;