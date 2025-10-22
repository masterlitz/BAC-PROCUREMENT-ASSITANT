import React, { useState, useRef } from 'react';
import { auditSystemFeatures } from '../../services/geminiService';
import { SystemAuditResult, SystemAuditFinding } from '../../types';
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

interface SystemAuditorTabProps {
    isVisible: boolean;
    onClose: () => void;
}

const SystemAuditorTab: React.FC<SystemAuditorTabProps> = ({ isVisible, onClose }) => {
    const [file, setFile] = useState<File | null>(null);
    const [isAuditing, setIsAuditing] = useState(false);
    const [auditResult, setAuditResult] = useState<SystemAuditResult | null>(null);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setAuditResult(null);
            setError('');
        }
    };

    const handleAudit = async () => {
        if (!file) {
            setError('Please upload a Terms of Reference document to audit.');
            return;
        }
        setIsAuditing(true);
        setError('');
        setAuditResult(null);

        try {
            const result = await auditSystemFeatures(file);
            setAuditResult(result);
        } catch (e) {
            console.error(`Error auditing system features:`, e);
            setError(`A critical error occurred during the audit: ${(e as Error).message}`);
        } finally {
            setIsAuditing(false);
        }
    };

    const getStatusStyle = (status: SystemAuditFinding['featureStatus']) => {
        switch (status) {
            case 'Implemented': return 'bg-green-100 text-green-800 border-green-400';
            case 'Partially Implemented': return 'bg-yellow-100 text-yellow-800 border-yellow-400';
            case 'Missing': return 'bg-red-100 text-red-800 border-red-400';
            case 'Discrepancy': return 'bg-purple-100 text-purple-800 border-purple-400';
            default: return 'bg-gray-100 text-gray-800 border-gray-400';
        }
    };

    const handleExportPdf = () => {
        if (!auditResult) return;
        const jspdfModule = window.jspdf;
        if (!jspdfModule || typeof jspdfModule.jsPDF !== 'function' || !(jspdfModule.jsPDF as any).API.autoTable) {
            alert("PDF generation library is unavailable.");
            return;
        }

        const { jsPDF } = jspdfModule;
        const doc = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' }) as jsPDFWithAutoTable;
        
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('System Development Audit Report', doc.internal.pageSize.getWidth() / 2, 40, { align: 'center' });
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Source Document: ${file?.name || 'N/A'}`, 40, 60);

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text("Overall Assessment:", 40, 80);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const assessmentLines = doc.splitTextToSize(auditResult.overallAssessment, doc.internal.pageSize.getWidth() - 80);
        doc.text(assessmentLines, 40, 92);
        
        let startY = 92 + (assessmentLines.length * 12) + 10;

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text("Summary:", 40, startY);
        startY += 12;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const summaryLines = doc.splitTextToSize(auditResult.summary, doc.internal.pageSize.getWidth() - 80);
        doc.text(summaryLines, 40, startY);
        startY += (summaryLines.length * 12) + 20;

        const tableHead = [['Requirement (from TOR)', 'Status', 'Analysis & Recommendation']];
        const tableBody = auditResult.findings.map(finding => [
            finding.requirement,
            finding.featureStatus,
            `Analysis: ${finding.analysis}\nRecommendation: ${finding.recommendation}`
        ]);

        doc.autoTable({
            startY: startY,
            head: tableHead,
            body: tableBody,
            theme: 'grid',
            headStyles: { fillColor: '#4A5568' },
            styles: { fontSize: 8, cellPadding: 5, overflow: 'linebreak' },
            columnStyles: { 0: { cellWidth: 'auto'}, 1: { cellWidth: 80 }, 2: { cellWidth: 'auto'} },
        });

        doc.save(`System_Audit_Report_${file?.name.split('.')[0] || 'report'}.pdf`);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl flex flex-col h-[90vh]" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
                    <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M12 6V3m0 18v-3M5.636 5.636l-1.414-1.414M18.364 18.364l-1.414-1.414M5.636 18.364l-1.414 1.414M18.364 5.636l-1.414 1.414M12 12a3 3 0 100-6 3 3 0 000 6z" />
                        </svg>
                        System Development Audit
                    </h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-900 text-2xl">&times;</button>
                </header>
                <main className="flex-grow p-6 overflow-y-auto">
                    <p className="text-gray-600 mb-6 text-sm">Upload a Terms of Reference (TOR) or feature list document. The AI will compare it against the application's current capabilities and generate a gap analysis report.</p>

                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div className="bg-gray-50 p-4 rounded-lg border border-dashed border-gray-300">
                            <label htmlFor="tor-upload" className="block text-sm font-medium text-gray-700 mb-2">Upload TOR Document</label>
                            <input
                                ref={fileInputRef} type="file" id="tor-upload" accept="image/*,.pdf,.doc,.docx,.txt"
                                onChange={handleFileChange}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                                disabled={isAuditing}
                            />
                            {file && <p className="text-xs text-gray-600 mt-2 truncate">Selected: {file.name}</p>}
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg border border-dashed border-gray-300 flex flex-col justify-center">
                            <button onClick={handleAudit} disabled={!file || isAuditing} className="btn bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg w-full disabled:bg-gray-400">
                                {isAuditing ? 'Analyzing...' : 'Analyze System Compliance'}
                            </button>
                        </div>
                    </div>

                    {isAuditing && <Loader text="AI is performing system audit..." />}
                    {error && <div className="text-center my-4 bg-red-50 p-4 rounded-lg border border-red-200 text-red-700">{error}</div>}
                    
                    {auditResult && (
                        <div className="mt-8">
                             <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-gray-800">Audit Report</h3>
                                <button onClick={handleExportPdf} className="btn bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg text-sm">
                                    Export to PDF
                                </button>
                            </div>
                            <div className="bg-purple-50 p-5 rounded-xl shadow-sm border border-purple-200 mb-6 space-y-3">
                                <div>
                                    <h4 className="text-lg font-bold text-purple-800">Overall Assessment</h4>
                                    <p className="text-sm text-purple-900 font-semibold">{auditResult.overallAssessment}</p>
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-purple-800">Summary</h4>
                                    <p className="text-sm text-purple-900 leading-relaxed">{auditResult.summary}</p>
                                </div>
                            </div>
                             <div className="space-y-4">
                                {auditResult.findings.map((finding, index) => (
                                    <div key={index} className={`p-4 rounded-lg border-l-4 ${getStatusStyle(finding.featureStatus)}`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <h5 className="font-bold text-base text-gray-800">{finding.requirement}</h5>
                                            <span className="text-xs font-bold px-2 py-1 rounded-full">{finding.featureStatus}</span>
                                        </div>
                                         <div className="text-sm space-y-2">
                                            <p><strong className="font-semibold">Analysis:</strong> {finding.analysis}</p>
                                            <p className="text-green-800"><strong className="font-semibold text-green-900">Recommendation:</strong> {finding.recommendation}</p>
                                        </div>
                                    </div>
                                ))}
                                {auditResult.findings.length === 0 && (
                                    <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                                        <p>No specific findings were generated. The document may be empty or the AI could not identify distinct requirements.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                </main>
            </div>
        </div>
    );
};

export default SystemAuditorTab;
