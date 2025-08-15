import React, { useState, useRef } from 'react';
import { CatalogAssistantResult, CatalogAssistantItem } from '../../types';
import { processDocumentForCatalogAssistant } from '../../services/geminiService';
import Loader from '../Loader';

// Assuming jspdf and autotable are loaded from CDN
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

const ItemCatalogAssistantTab: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState<CatalogAssistantResult | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const printableRef = useRef<HTMLDivElement>(null);

    const formatCurrency = (value: number) => `₱${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setError('');
            setResult(null);
        }
    };

    const handleProcessDocument = async () => {
        if (!file) {
            setError('Please upload a document first.');
            return;
        }
        setLoading(true);
        setError('');
        setResult(null);
        try {
            const assistantResult = await processDocumentForCatalogAssistant(file);
            setResult(assistantResult);
        } catch (err) {
            console.error(err);
            setError(`An error occurred during analysis: ${(err as Error).message}. Please try again.`);
        } finally {
            setLoading(false);
        }
    };

    const getStatusCellStyle = (status: CatalogAssistantItem['status']) => {
        switch (status) {
            case 'HIGH_VARIANCE': return 'bg-red-100 text-red-800';
            case 'MATCH': return 'bg-green-100 text-green-800';
            case 'NOT_FOUND': return 'bg-yellow-100 text-yellow-800';
            case 'DUPLICATE_CHECK': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const exportToCsv = () => {
        if (!result || !result.items) return;

        const headers = ['Image URL', 'Original Description', 'Original Unit Cost', 'Catalog Match', 'Catalog Unit Cost', 'Variance (%)', 'Status', 'Notes'];
        const rows = result.items.map(item => [
            `"${item.imageUrl || ''}"`,
            `"${item.originalDescription.replace(/"/g, '""')}"`,
            item.originalUnitCost,
            `"${item.catalogItemName.replace(/"/g, '""')}"`,
            item.catalogUnitCost,
            item.variancePercentage.toFixed(2),
            item.status,
            `"${item.notes.replace(/"/g, '""')}"`
        ].join(','));

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Item_Catalog_Assistant_Report_${file?.name.split('.')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportToPdf = () => {
        if (!result || !result.items || !printableRef.current) return;
        
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ orientation: 'l', unit: 'pt', format: 'legal' }) as jsPDFWithAutoTable;

        // Use built-in 'helvetica' font as a fallback since the custom font is broken.
        // Note: Special characters like the Peso sign '₱' may not render correctly.
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(18);
        doc.text("Item Catalog Assistant Report", 40, 60);
        
        doc.setFontSize(10);
        doc.text(`Source Document: ${file?.name || 'N/A'}`, 40, 80);
        
        // Executive Summary
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text("Executive Summary", 40, 110);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        const summaryLines = doc.splitTextToSize(result.executiveSummary, doc.internal.pageSize.getWidth() - 80);
        doc.text(summaryLines, 40, 125);
        
        let lastY = 125 + summaryLines.length * 10;
        
        // Recommendations
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text("Actionable Recommendations", 40, lastY + 20);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        const recLines = doc.splitTextToSize(result.actionableRecommendations.replace(/\*/g, '  • '), doc.internal.pageSize.getWidth() - 80);
        doc.text(recLines, 40, lastY + 35);
        
        lastY = lastY + 35 + recLines.length * 10;

        // Table
        doc.autoTable({
            startY: lastY + 20,
            head: [['Image URL', 'Original Item', 'Orig. Cost', 'Catalog Match', 'Catalog Cost', 'Variance', 'Status', 'Notes']],
            body: result.items.map(item => [
                item.imageUrl || 'N/A',
                item.originalDescription,
                formatCurrency(item.originalUnitCost),
                item.catalogItemName,
                item.catalogUnitCost > 0 ? formatCurrency(item.catalogUnitCost) : 'N/A',
                `${item.variancePercentage.toFixed(1)}%`,
                item.status.replace('_', ' '),
                item.notes
            ]),
            theme: 'striped',
            headStyles: { fillColor: [249, 115, 22], font: 'helvetica', fontStyle: 'bold' },
            styles: { fontSize: 7, cellPadding: 4, overflow: 'linebreak', font: 'helvetica' },
            columnStyles: { 0: { cellWidth: 100 }, 1: { cellWidth: 180 }, 3: { cellWidth: 150 }, 7: { cellWidth: 180 } }
        });

        doc.save(`Item_Catalog_Assistant_Report_${file?.name.split('.')[0]}.pdf`);
    };

    return (
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                 <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 mr-3 text-orange-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0h9.75m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                </svg>
                Item Catalog Assistant
            </h2>
            <p className="text-gray-600 mb-6">Upload a procurement document (e.g., Purchase Request). The AI will scan it, clean up duplicates, find a representative image, compare each item against the catalog for price variance, and generate an exportable report.</p>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg border border-dashed border-gray-300">
                    <label htmlFor="doc-upload" className="block text-sm font-medium text-gray-700 mb-2">1. Upload Document</label>
                    <input ref={fileInputRef} type="file" id="doc-upload" accept="image/*,.pdf" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100" />
                    {file && <p className="text-xs text-gray-600 mt-2 truncate">Selected: {file.name}</p>}
                </div>
                 <div className="bg-gray-50 p-4 rounded-lg border border-dashed border-gray-300 flex flex-col justify-center">
                    <label className="block text-sm font-medium text-gray-700 mb-2">2. Process & Analyze</label>
                    <button onClick={handleProcessDocument} disabled={!file || loading} className="btn bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-lg w-full disabled:bg-gray-400">
                        {loading ? 'Analyzing...' : 'Process Document'}
                    </button>
                 </div>
            </div>

            {loading && <Loader text="AI is analyzing your document..." />}
            {error && <p className="text-center text-red-500 my-4">{error}</p>}

            {result && (
                <div ref={printableRef} className="mt-8">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-gray-800">Analysis Report</h3>
                        <div className="flex gap-2">
                            <button onClick={exportToPdf} className="btn bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg text-sm">Export PDF</button>
                            <button onClick={exportToCsv} className="btn bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg text-sm">Export Excel</button>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-blue-50 p-5 rounded-xl shadow-sm border border-blue-200">
                            <h4 className="text-lg font-bold text-blue-800 mb-2">Executive Summary</h4>
                            <p className="text-sm text-blue-900 leading-relaxed whitespace-pre-wrap">{result.executiveSummary}</p>
                        </div>
                        <div className="bg-orange-50 p-5 rounded-xl shadow-sm border border-orange-200">
                            <h4 className="text-lg font-bold text-orange-800 mb-2">Actionable Recommendations</h4>
                            <ul className="text-sm text-orange-900 leading-relaxed list-disc list-inside space-y-1">
                                {result.actionableRecommendations.split('*').filter(r => r.trim()).map((rec, i) => <li key={i}>{rec.trim()}</li>)}
                            </ul>
                        </div>
                    </div>
                    
                    <div className="mt-6">
                        <h4 className="text-lg font-bold text-gray-800 mb-2">Item Details</h4>
                        <div className="overflow-x-auto rounded-lg border border-gray-200">
                            <table className="min-w-full bg-white text-xs">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="p-2 text-center font-semibold w-20">Image</th>
                                        <th className="p-2 text-left font-semibold">Original Description</th>
                                        <th className="p-2 text-right font-semibold">Original Cost</th>
                                        <th className="p-2 text-left font-semibold">Catalog Match</th>
                                        <th className="p-2 text-right font-semibold">Catalog Cost</th>
                                        <th className="p-2 text-right font-semibold">Variance</th>
                                        <th className="p-2 text-center font-semibold">Status</th>
                                        <th className="p-2 text-left font-semibold">Notes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {result.items.map((item, index) => (
                                        <tr key={index} className="border-b last:border-b-0">
                                            <td className="p-2 align-top text-center">
                                                <img
                                                    src={item.imageUrl || 'https://i.ibb.co/x7P39M6/placeholder-thumbnail.png'}
                                                    alt={item.originalDescription}
                                                    className="w-16 h-16 object-contain rounded-md bg-gray-200 inline-block"
                                                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://i.ibb.co/x7P39M6/placeholder-thumbnail.png'; }}
                                                />
                                            </td>
                                            <td className="p-2 align-top">{item.originalDescription}</td>
                                            <td className="p-2 align-top text-right font-mono">{formatCurrency(item.originalUnitCost)}</td>
                                            <td className="p-2 align-top">{item.catalogItemName}</td>
                                            <td className="p-2 align-top text-right font-mono">
                                                {item.catalogUnitCost > 0 ? formatCurrency(item.catalogUnitCost) : 'N/A'}
                                            </td>
                                            <td className={`p-2 align-top text-right font-semibold ${Math.abs(item.variancePercentage) > 15 ? 'text-red-600' : 'text-gray-700'}`}>{item.variancePercentage.toFixed(1)}%</td>
                                            <td className="p-2 align-top text-center"><span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${getStatusCellStyle(item.status)}`}>{item.status.replace('_', ' ')}</span></td>
                                            <td className="p-2 align-top">{item.notes}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ItemCatalogAssistantTab;