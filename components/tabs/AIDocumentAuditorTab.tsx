import React, { useState, useRef } from 'react';
import { auditDocument } from '../../services/geminiService';
import { DocumentAuditResult, AuditFinding } from '../../types';
import Loader from '../Loader';
import { bacolodCityLogo } from '../../data/logo';

declare global {
    interface Window {
        html2canvas: any;
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


// Icons for different finding types
const SpellingIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
const GrammarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066 2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.096 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const ClarityIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
const FormattingIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" /></svg>;
const CompletenessIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const NumericalIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 21h6a2 2 0 002-2V5a2 2 0 00-2-2H9a2 2 0 00-2 2v14a2 2 0 002 2zM9 7h6m-6 4h6m-6 4h6" />
    </svg>
);


const getFindingIcon = (type: AuditFinding['type']) => {
    switch(type) {
        case 'Typographical': return <SpellingIcon />;
        case 'Grammatical': return <GrammarIcon />;
        case 'Clarity': return <ClarityIcon />;
        case 'Formatting': return <FormattingIcon />;
        case 'Completeness': return <CompletenessIcon />;
        case 'Numerical': return <NumericalIcon />;
        default: return <ClarityIcon />;
    }
};

const getOverallStatusInfo = (status?: DocumentAuditResult['overallStatus']) => {
    switch (status) {
        case 'Excellent': return { style: 'bg-green-100 border-green-500 text-green-800' };
        case 'Good': return { style: 'bg-blue-100 border-blue-500 text-blue-800' };
        case 'Needs Improvement': return { style: 'bg-yellow-100 border-yellow-500 text-yellow-800' };
        default: return { style: 'bg-gray-100 border-gray-500 text-gray-800' };
    }
};

const AIDocumentAuditorTab: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isAuditing, setIsAuditing] = useState(false);
    const [auditResult, setAuditResult] = useState<DocumentAuditResult | null>(null);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const printableResultRef = useRef<HTMLDivElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files ? event.target.files[0] : null;
        if (selectedFile) {
            setFile(selectedFile);
            setAuditResult(null);
            setError('');
        }
    };

    const handleAudit = async () => {
        if (!file) {
            setError('Please upload a document to check.');
            return;
        }

        setIsAuditing(true);
        setError('');
        setAuditResult(null);

        try {
            const result = await auditDocument(file);
            setAuditResult(result);
        } catch (e) {
            console.error(`Error auditing document:`, e);
            setError('A critical error occurred during the check. The AI may be experiencing issues. Please try again.');
        } finally {
            setIsAuditing(false);
        }
    };

     const handlePrint = () => {
        const printableArea = printableResultRef.current;
        if (!printableArea) return;
        document.body.classList.add('is-printing');
        const onAfterPrint = () => {
            document.body.classList.remove('is-printing');
            window.removeEventListener('afterprint', onAfterPrint);
        };
        window.addEventListener('afterprint', onAfterPrint, { once: true });
        setTimeout(() => window.print(), 100);
    };

    const handleDownloadPdf = async () => {
        if (!auditResult) return;
        const jspdfModule = window.jspdf;
        if (!jspdfModule || typeof jspdfModule.jsPDF !== 'function' || !(jspdfModule.jsPDF as any).API.autoTable) {
            setError("PDF generation library is unavailable. Please try again or use the print feature.");
            return;
        }

        setIsAuditing(true);
        setError('');
        
        try {
            const { jsPDF } = jspdfModule;
            const pdf = new jsPDF({ orientation: 'p', unit: 'in', format: 'letter' }) as jsPDFWithAutoTable;
            
            pdf.setFontSize(16);
            pdf.setFont('helvetica', 'bold');
            pdf.text('BAC Document Check Report', pdf.internal.pageSize.getWidth() / 2, 0.7, { align: 'center' });
            
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            pdf.text(`Document: ${file?.name || 'N/A'}`, 0.5, 1.2);
            pdf.text(`Date Generated: ${new Date().toLocaleDateString()}`, pdf.internal.pageSize.getWidth() - 0.5, 1.2, { align: 'right' });
            
            const statusInfo = getOverallStatusInfo(auditResult.overallStatus);
            
            pdf.autoTable({
                startY: 1.5,
                body: [
                    [{ content: `Overall Status: ${auditResult.overallStatus}`, styles: { fontStyle: 'bold', fillColor: statusInfo.style.includes('green') ? [232, 245, 233] : statusInfo.style.includes('yellow') ? [255, 243, 205] : [248, 231, 235] } }],
                    [{ content: `Summary: ${auditResult.summary}` }]
                ],
                theme: 'plain',
            });
            
            let startY = pdf.autoTable.previous!.finalY + 0.2;

            const groupedFindings = auditResult.findings.reduce((acc, finding) => {
                (acc[finding.type] = acc[finding.type] || []).push(finding);
                return acc;
            }, {} as Record<AuditFinding['type'], AuditFinding[]>);

            for (const [type, findings] of Object.entries(groupedFindings)) {
                pdf.autoTable({
                    head: [[`${type} Findings (${findings.length})`]],
                    startY: startY,
                    theme: 'grid',
                    headStyles: { fillColor: [52, 58, 64] }
                });

                const body = findings.map(f => [f.location, f.original, f.suggestion, f.explanation]);
                pdf.autoTable({
                    head: [['Location', 'Original Text', 'Suggestion', 'Explanation']],
                    body: body,
                    startY: pdf.autoTable.previous!.finalY,
                    theme: 'grid',
                    styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
                    columnStyles: { 0: { cellWidth: 1.5 }, 1: { cellWidth: 2 }, 2: { cellWidth: 2 }, 3: { cellWidth: 2 } },
                });
                startY = pdf.autoTable.previous!.finalY + 0.3;
            }

            const fileName = `BAC_Document_Check_${file?.name.replace(/\.[^/.]+$/, "") || 'Report'}.pdf`;
            pdf.save(fileName);

        } catch (e) {
            console.error("PDF generation failed:", e);
            setError("Sorry, there was an error creating the PDF. Please try the standard print function.");
        } finally {
            setIsAuditing(false);
        }
    };

    const groupedFindings = auditResult?.findings.reduce((acc, finding) => {
        (acc[finding.type] = acc[finding.type] || []).push(finding);
        return acc;
    }, {} as Record<AuditFinding['type'], AuditFinding[]>);

    return (
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-8 h-8 mr-3 text-orange-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75" />
                    <path strokeLinecap="round" strokeLinejoin="round"d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Document Checker
            </h2>
            <p className="text-gray-600 mb-6">Upload a procurement document (PDF or Image). The AI will check it for typographical errors, grammatical correctness, clarity, and completeness.</p>

            <div className="bg-gray-50 p-4 rounded-lg border border-dashed border-gray-300 mb-6">
                <label htmlFor="doc-audit-upload" className="block text-sm font-medium text-gray-700 mb-2">Upload Document for Checking</label>
                <input
                    ref={fileInputRef}
                    type="file"
                    id="doc-audit-upload"
                    accept="image/*,.pdf"
                    capture="environment"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                    disabled={isAuditing}
                />
                {file && <p className="text-sm text-gray-600 mt-2">Selected: <span className="font-semibold">{file.name}</span></p>}
            </div>

            <button
                onClick={handleAudit}
                className="btn bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-lg w-full disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={isAuditing || !file}
            >
                {isAuditing ? 'Checking...' : 'Check Document'}
            </button>

            {isAuditing && <Loader text="AI is checking your document..." />}
            {error && <div className="text-center my-4 bg-red-50 p-4 rounded-lg border border-red-200 text-red-700">{error}</div>}

            {auditResult && !isAuditing && (
                <div className="mt-8">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-gray-800">Check Report</h3>
                        <div className="flex items-center gap-2">
                            <button onClick={handlePrint} className="flex items-center space-x-2 text-sm text-gray-600 hover:text-orange-600 font-semibold p-2 rounded-lg hover:bg-orange-100 transition-colors" title="Print Report">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm7-8V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                                <span>Print</span>
                            </button>
                            <button onClick={handleDownloadPdf} className="flex items-center space-x-2 text-sm text-gray-600 hover:text-orange-600 font-semibold p-2 rounded-lg hover:bg-orange-100 transition-colors" title="Download as PDF">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                <span>Download PDF</span>
                            </button>
                        </div>
                    </div>
                     <div id="auditor-printable-result" ref={printableResultRef} className="printable-content bg-gray-50 p-6 rounded-lg">
                        {/* Print-only Header */}
                        <div className="hidden print:block mb-6">
                            <div className="text-center">
                                <img src={bacolodCityLogo} alt="Bacolod BAC Logo" className="h-16 mx-auto mb-2" />
                                <h2 className="text-xl font-bold">Document Check Report</h2>
                                <p className="text-sm">Bids and Awards Committee - Bacolod City</p>
                                <p className="text-sm">Document: {file?.name}</p>
                            </div>
                            <hr className="my-4" />
                        </div>
                        
                        <div className={`p-4 rounded-lg mb-6 border-l-4 ${getOverallStatusInfo(auditResult.overallStatus).style}`}>
                            <h4 className="font-extrabold text-lg">{auditResult.overallStatus}</h4>
                            <p className="text-sm">{auditResult.summary}</p>
                        </div>

                        <div className="space-y-6">
                            {groupedFindings && Object.entries(groupedFindings).map(([type, findings]) => (
                                <div key={type}>
                                    <h4 className="text-lg font-bold text-gray-800 mb-3 flex items-center">{getFindingIcon(type as AuditFinding['type'])} <span className="ml-2">{type} ({findings.length})</span></h4>
                                    <div className="space-y-4">
                                        {findings.map((finding, index) => (
                                            <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                                <div className="mb-3">
                                                    <span className="text-xs font-semibold text-orange-700 bg-orange-100 px-2 py-1 rounded-full">LOCATION HINT</span>
                                                    <p className="font-semibold text-gray-700 mt-1">{finding.location}</p>
                                                </div>

                                                <p className="text-sm text-gray-500 mb-2">Original Text:</p>
                                                <blockquote className="border-l-4 border-red-300 pl-4 py-1 bg-red-50 text-red-800 italic rounded">
                                                    "{finding.original}"
                                                </blockquote>
                                                
                                                <p className="text-sm text-gray-500 mt-3 mb-2">Suggestion:</p>
                                                <blockquote className="border-l-4 border-green-300 pl-4 py-1 bg-green-50 text-green-800 rounded">
                                                    "{finding.suggestion}"
                                                </blockquote>

                                                <p className="text-xs text-gray-600 mt-3 bg-gray-100 p-2 rounded">
                                                    <span className="font-bold">Explanation:</span> {finding.explanation}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                        {/* Print-only Footer */}
                        <div className="hidden print:block mt-8 pt-4 border-t text-xs text-gray-500 text-center">
                            <p>Report generated on {new Date().toLocaleString()} by the BAC Procurement Assistant.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIDocumentAuditorTab;
