









import React, { useState, useRef, useMemo } from 'react';
import { auditDocument, auditForDuplicateCatalogItems } from '../../services/geminiService';
import { DocumentAuditResult, AuditFinding, DuplicateItemAuditResult, DuplicateItemGroup } from '../../types';
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

export const AIDocumentAuditorTab: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isAuditing, setIsAuditing] = useState(false);
    const [auditResult, setAuditResult] = useState<DocumentAuditResult | null>(null);
    const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);
    const [duplicateResult, setDuplicateResult] = useState<DuplicateItemAuditResult | null>(null);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const printableResultRef = useRef<HTMLDivElement>(null);

    const groupedFindings = useMemo(() => {
        // Fix: Add optional chaining and nullish coalescing to prevent error when auditResult is null.
        return (auditResult?.findings ?? []).reduce((acc, finding) => {
            (acc[finding.type] = acc[finding.type] || []).push(finding);
            return acc;
        }, {} as Record<AuditFinding['type'], AuditFinding[]>);
    }, [auditResult]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files ? event.target.files[0] : null;
        if (selectedFile) {
            setFile(selectedFile);
            setAuditResult(null);
            setDuplicateResult(null);
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
        setDuplicateResult(null);

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
    
    const handleDuplicateCheck = async () => {
        if (!file) {
            setError('Please upload a document to check for duplicates.');
            return;
        }

        setIsCheckingDuplicates(true);
        setError('');
        setAuditResult(null);
        setDuplicateResult(null);

        try {
            const result = await auditForDuplicateCatalogItems(file);
            setDuplicateResult(result);
        } catch (e) {
            console.error(`Error checking for duplicates:`, e);
            setError(`A critical error occurred during the duplicate check: ${(e as Error).message}`);
        } finally {
            setIsCheckingDuplicates(false);
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

    const handleDownloadAuditPdf = async () => {
        if (!auditResult) return;
        const jspdfModule = window.jspdf;
        if (!jspdfModule || typeof jspdfModule.jsPDF !== 'function') {
            setError("PDF generation library is unavailable. Please try again or use the print feature.");
            return;
        }

        setIsAuditing(true);
        setError('');
        
        try {
            const { jsPDF } = jspdfModule;
            const pdf = new jsPDF({ orientation: 'p', unit: 'in', format: 'letter' }) as jsPDFWithAutoTable;
            
            if (typeof pdf.autoTable !== 'function') {
                setError("PDF autoTable plugin is not loaded. Please try again.");
                setIsAuditing(false);
                return;
            }
            
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
            
            let startY = (pdf as any).lastAutoTable.finalY + 0.2;

            // FIX: Object.entries was inferring the value as 'unknown'. Added a type assertion to correctly type 'findings' as AuditFinding[]. This resolves errors on .length and .map.
            for (const [type, findings] of Object.entries(groupedFindings) as [string, AuditFinding[]][]) {
                if (!findings || findings.length === 0) continue;
                
                pdf.autoTable({
                    head: [[`${type} Findings (${findings.length})`]],
                    startY: startY,
                    theme: 'grid',
                    headStyles: { fillColor: [52, 58, 64] }
                });

                const body = findings.map((f: AuditFinding) => [f.location, f.original, f.suggestion, f.explanation]);
                pdf.autoTable({
                    head: [['Location', 'Original Text', 'Suggestion', 'Explanation']],
                    body: body,
                    startY: (pdf as any).lastAutoTable.finalY,
                    theme: 'grid',
                    styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
                    columnStyles: { 0: { cellWidth: 1.5 }, 1: { cellWidth: 2 }, 2: { cellWidth: 2 }, 3: { cellWidth: 2 } },
                });
                startY = (pdf as any).lastAutoTable.finalY + 0.3;
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

    const handleExportDuplicatesPdf = () => {
        if (!duplicateResult) return;
    
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF() as any;
        
        doc.setFontSize(18);
        doc.text('Duplicate Item Audit Report', 14, 22);
        
        doc.setFontSize(11);
        doc.text(duplicateResult.summary, 14, 32);
    
        let startY = 45;
    
        duplicateResult.duplicates.forEach(group => {
            if (startY > 250) { // Simple page break logic
                doc.addPage();
                startY = 22;
            }
            
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text(`Suggested Standard Name: ${group.suggestedName}`, 14, startY);
            startY += 10;
            
            doc.autoTable({
                startY: startY,
                head: [['Item Code', 'Original Name', 'Price']],
                body: group.items.map(item => [item.itemCode, item.name, item.price]),
                theme: 'striped',
                headStyles: { fillColor: [249, 115, 22] },
            });
            
            startY = doc.autoTable.previous.finalY + 15;
        });
    
        doc.save('duplicate_items_findings.pdf');
    };
    
    const handleDownloadDuplicatesCsv = () => {
        if (!duplicateResult) return;
    
        const escapeCsvCell = (cell: string) => `"${cell.replace(/"/g, '""')}"`;
    
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Suggested Standard Name,Item Code,Original Name,Price\r\n";
    
        duplicateResult.duplicates.forEach(group => {
            group.items.forEach(item => {
                const row = [
                    escapeCsvCell(group.suggestedName),
                    escapeCsvCell(item.itemCode),
                    escapeCsvCell(item.name),
                    escapeCsvCell(item.price)
                ].join(",");
                csvContent += row + "\r\n";
            });
        });
    
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "duplicate_items_findings.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-8 h-8 mr-3 text-orange-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Document Checker
            </h2>
            <p className="text-gray-600 mb-6">Upload any document to check for quality issues. The AI will proofread for errors, check for numerical accuracy, assess clarity, and flag potential issues. You can also specifically check a catalog report for duplicate items.</p>
            
            <div className="bg-gray-50 p-4 rounded-lg border border-dashed border-gray-300 mb-6">
                <label htmlFor="doc-auditor-upload" className="block text-sm font-medium text-gray-700 mb-2">Upload Document</label>
                <input
                    ref={fileInputRef}
                    type="file"
                    id="doc-auditor-upload"
                    accept="image/*,.pdf"
                    capture="environment"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                    disabled={isAuditing || isCheckingDuplicates}
                />
                {file && <p className="text-sm text-gray-600 mt-2">Selected: <span className="font-semibold">{file.name}</span></p>}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                    onClick={handleAudit}
                    className="btn bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg w-full disabled:bg-gray-400"
                    disabled={isAuditing || isCheckingDuplicates || !file}
                >
                    {isAuditing ? 'Auditing...' : 'Perform Full Quality Check'}
                </button>
                <button
                    onClick={handleDuplicateCheck}
                    className="btn bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg w-full disabled:bg-gray-400"
                    disabled={isAuditing || isCheckingDuplicates || !file}
                >
                    {isCheckingDuplicates ? 'Checking...' : 'Check for Duplicates'}
                </button>
            </div>
            
            {(isAuditing || isCheckingDuplicates) && <Loader text={isAuditing ? "AI is auditing your document..." : "AI is checking for duplicates..."} />}
            {error && <div className="text-center my-4 bg-red-50 p-4 rounded-lg border border-red-200 text-red-700">{error}</div>}

            {auditResult && (
                <div ref={printableResultRef} id="audit-printable-result" className="mt-8 printable-content">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-gray-800">Quality Check Report</h3>
                        <div className="flex gap-2 no-print">
                            <button onClick={handlePrint} className="btn text-sm bg-blue-600 text-white font-semibold py-1.5 px-3 rounded-md">Print</button>
                            <button onClick={handleDownloadAuditPdf} className="btn text-sm bg-red-600 text-white font-semibold py-1.5 px-3 rounded-md">Export PDF</button>
                        </div>
                    </div>
                    
                    <div className={`p-4 rounded-lg mb-6 border-l-4 ${getOverallStatusInfo(auditResult.overallStatus).style}`}>
                        <h4 className="font-bold text-lg">Overall Status: {auditResult.overallStatus}</h4>
                        <p className="text-sm mt-1">{auditResult.summary}</p>
                    </div>

                    <div className="space-y-6">
                        {Object.entries(groupedFindings).map(([type, findings]) => (
                            <div key={type}>
                                <h4 className="text-lg font-bold mb-3 pb-2 border-b-2 flex items-center gap-2">{getFindingIcon(type as AuditFinding['type'])} {type} Findings ({findings.length})</h4>
                                <div className="space-y-4">
                                    {findings.map((finding, index) => (
                                        <div key={index} className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-sm">
                                            <p className="font-semibold text-gray-500">Location: <span className="font-bold text-gray-700">{finding.location}</span></p>
                                            <p className="text-red-600"><strong className="font-semibold">Original:</strong> <del>{finding.original}</del></p>
                                            <p className="text-green-600"><strong className="font-semibold">Suggestion:</strong> <ins>{finding.suggestion}</ins></p>
                                            <p className="text-xs italic text-gray-500 mt-2"><strong>Explanation:</strong> {finding.explanation}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            {duplicateResult && (
                <div className="mt-8">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-gray-800">Duplicate Items Report</h3>
                         <div className="flex gap-2">
                             <button onClick={handleExportDuplicatesPdf} className="btn text-sm bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg">Export PDF</button>
                            <button onClick={handleDownloadDuplicatesCsv} className="btn text-sm bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg">Export CSV</button>
                        </div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg mb-6 border-l-4 border-blue-400">
                        <p className="text-sm font-semibold text-blue-800">{duplicateResult.summary}</p>
                    </div>
                     <div className="space-y-4">
                        {duplicateResult.duplicates.length > 0 ? duplicateResult.duplicates.map((group, index) => (
                             <div key={index} className="bg-gray-50 p-4 rounded-lg border">
                                <h4 className="font-bold text-gray-700">Suggested Name: <span className="text-green-600">{group.suggestedName}</span></h4>
                                <ul className="list-disc list-inside text-sm mt-2 text-gray-600">
                                    {group.items.map(item => <li key={item.itemCode}>Item Code {item.itemCode}: "{item.name}" (Price: {item.price})</li>)}
                                </ul>
                            </div>
                        )) : (
                            <p className="text-center text-gray-500 py-4">No duplicate items were found in the document.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};