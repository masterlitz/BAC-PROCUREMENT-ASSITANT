import React, { useState, useRef, useMemo } from 'react';
import { compareDocuments, comparePrToCatalog, auditForBrandSpecifications } from '../../services/geminiService';
import { ComparisonResult, ComparisonFinding, CatalogComparisonFinding, CatalogComparisonResult, BrandAuditResult, BrandAuditFinding } from '../../types';
import Loader from '../Loader';
import Accordion, { AccordionItem } from '../Accordion';
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

const CheckCircleIcon: React.FC<{ className?: string }> = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}> <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /> </svg> );
const ExclamationCircleIcon: React.FC<{ className?: string }> = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}> <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> </svg> );
const XCircleIcon: React.FC<{ className?: string }> = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}> <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /> </svg> );
const InfoCircleIcon: React.FC<{ className?: string }> = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}> <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> </svg> );

const getStatusIcon = (status: ComparisonFinding['status']) => {
    switch (status) { case 'match': return <CheckCircleIcon className="text-green-500" />; case 'mismatch': return <XCircleIcon className="text-red-500" />; case 'info': return <InfoCircleIcon className="text-blue-500" />; default: return null; }
};

const FileInput: React.FC<{ id: string; label: string; selectedFiles: File[]; onFilesChange: (files: File[]) => void; disabled: boolean; }> = ({ id, label, selectedFiles, onFilesChange, disabled }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newFiles = event.target.files ? Array.from(event.target.files) : [];
        if (newFiles.length > 0) { const updatedFiles = [...selectedFiles]; newFiles.forEach(newFile => { if (!updatedFiles.some(f => f.name === newFile.name && f.size === newFile.size && f.lastModified === newFile.lastModified)) { updatedFiles.push(newFile); } }); onFilesChange(updatedFiles); }
        if (fileInputRef.current) { fileInputRef.current.value = ""; }
    };
    const handleRemoveFile = (fileToRemove: File) => { onFilesChange(selectedFiles.filter(f => f !== fileToRemove)); };
    return (
        <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg h-full flex flex-col justify-start space-y-3">
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <div className="space-y-2 overflow-y-auto max-h-40 pr-2 flex-grow">
                {selectedFiles.map((file, index) => ( <div key={`${file.name}-${index}`} className="flex items-center justify-between bg-orange-50 p-2 rounded-md"> <p className="text-sm text-orange-800 truncate" title={file.name}> <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-2 text-green-600" viewBox="0 0 20 20" fill="currentColor"> <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /> </svg> {file.name} </p> <button onClick={() => handleRemoveFile(file)} disabled={disabled} className="text-gray-500 hover:text-red-600 disabled:text-gray-300 p-1 ml-2 flex-shrink-0"> <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"> <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /> </svg> </button> </div> ))}
                {selectedFiles.length === 0 && ( <div className="flex items-center justify-center h-full text-gray-400 text-sm"> No files selected. </div> )}
            </div>
            <label htmlFor={id} className="relative cursor-pointer mt-auto flex-shrink-0"> <input ref={fileInputRef} type="file" id={id} name={id} accept=".pdf,.jpg,.jpeg,.png" capture="environment" onChange={handleFileSelect} className="sr-only" disabled={disabled} multiple /> <div className="flex items-center justify-center w-full px-4 py-3 border-2 border-gray-300 border-dashed rounded-md text-orange-600 hover:text-orange-500 hover:border-orange-400 transition-colors"> <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /> </svg> <span className="text-sm font-medium">Add file(s)</span> </div> </label>
        </div>
    );
};

const ValueWithHighlight: React.FC<{
    label: string;
    finding: ComparisonFinding;
    isValueFor: 'ppmp' | 'pr';
}> = ({ label, finding, isValueFor }) => {

    const parseValues = (str: string): { [key: string]: string } => {
        if (!str || str.toLowerCase().includes('not found')) return {};
        const values: { [key: string]: string } = {};
        str.split(',').forEach(part => {
            const [key, ...val] = part.split(':');
            if (key && val.length > 0) {
                values[key.trim().toLowerCase()] = val.join(':').trim();
            }
        });
        return values;
    };

    const valueStr = isValueFor === 'ppmp' ? finding.ppmpValue : finding.prValue;

    if (!valueStr || valueStr.toLowerCase().includes('not found')) {
        return (
            <div>
                <p className="text-xs text-gray-500 font-medium">{label}</p>
                <p className="font-mono text-gray-800 break-words">{valueStr || 'N/A'}</p>
            </div>
        );
    }
    
    const ppmpValues = parseValues(finding.ppmpValue);
    const prValues = parseValues(finding.prValue);
    const displayValues = isValueFor === 'ppmp' ? ppmpValues : prValues;
    
    // Check for mismatches where PR > PPMP
    const qtyExceeds = finding.status === 'mismatch' && ppmpValues.qty && prValues.qty && (parseFloat(prValues.qty.replace(/,/g, '')) > parseFloat(ppmpValues.qty.replace(/,/g, '')));
    const totalExceeds = finding.status === 'mismatch' && ppmpValues.total && prValues.total && (parseFloat(prValues.total.replace(/,/g, '')) > parseFloat(ppmpValues.total.replace(/,/g, '')));
    
    const qtyStyle = qtyExceeds ? 'text-red-600 font-bold' : '';
    const totalStyle = totalExceeds ? 'text-red-600 font-bold' : '';

    const parts = [
        displayValues.qty ? `QTY: @@${displayValues.qty}@@` : '',
        displayValues.uom ? `UOM: ${displayValues.uom}` : '',
        displayValues['unit cost'] ? `Unit Cost: ${displayValues['unit cost']}` : '',
        displayValues.total ? `Total: ##${displayValues.total}##` : '',
    ].filter(Boolean);

    return (
        <div>
            <p className="text-xs text-gray-500 font-medium">{label}</p>
            <p className="font-mono text-gray-800 break-words text-xs sm:text-sm leading-relaxed">
                {parts.map((part, index) => (
                    <React.Fragment key={index}>
                        {part.includes('@@') ? (
                            <>QTY: <span className={qtyStyle}>{part.replace(/@@/g, '')}</span></>
                        ) : part.includes('##') ? (
                            <>Total: <span className={totalStyle}>{part.replace(/##/g, '')}</span></>
                        ) : (
                            part
                        )}
                        {index < parts.length - 1 && ', '}
                        {index === 1 && <br className="sm:hidden" />}
                    </React.Fragment>
                ))}
            </p>
        </div>
    );
};


const AIDocumentComparatorTab: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'ppmp' | 'catalog' | 'brand_audit'>('ppmp');

    // State for PPMP vs PR
    const [ppmpFiles, setPpmpFiles] = useState<File[]>([]);
    const [prFiles, setPrFiles] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState<ComparisonResult | null>(null);
    const printableResultRef = useRef<HTMLDivElement>(null);

    // State for Catalog vs PR
    const [prFileForCatalog, setPrFileForCatalog] = useState<File[]>([]);
    const [catalogLoading, setCatalogLoading] = useState(false);
    const [catalogError, setCatalogError] = useState('');
    const [catalogResult, setCatalogResult] = useState<CatalogComparisonResult | null>(null);
    const printableCatalogResultRef = useRef<HTMLDivElement>(null);

    // State for Brand Specification Audit
    const [prFileForBrandAudit, setPrFileForBrandAudit] = useState<File[]>([]);
    const [brandAuditLoading, setBrandAuditLoading] = useState(false);
    const [brandAuditError, setBrandAuditError] = useState('');
    const [brandAuditResult, setBrandAuditResult] = useState<BrandAuditResult | null>(null);
    const printableBrandAuditRef = useRef<HTMLDivElement>(null);
    
    const groupedBrandAuditFindings = useMemo(() => {
        if (!brandAuditResult?.findings) return {};
        const groups = brandAuditResult.findings.reduce((acc, finding) => {
            const key = finding.identifiedBrand === 'None' ? 'Compliant Items' : `Brand: ${finding.identifiedBrand}`;
            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push(finding);
            return acc;
        }, {} as Record<string, BrandAuditFinding[]>);

        // Ensure "Compliant Items" is last in the sorted list
        const sortedKeys = Object.keys(groups).sort((a, b) => {
            if (a === 'Compliant Items') return 1;
            if (b === 'Compliant Items') return -1;
            return a.localeCompare(b);
        });
        
        const sortedGroups: Record<string, BrandAuditFinding[]> = {};
        for (const key of sortedKeys) {
            sortedGroups[key] = groups[key];
        }
        return sortedGroups;

    }, [brandAuditResult]);
    
    // Icons
    const LocationIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
    const PhoneIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>;
    const EmailIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;

    const feedbackFormUrl = 'https://forms.hive.com/?formId=dEqfsaS8nici4rZiQ';
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=${encodeURIComponent(feedbackFormUrl)}&bgcolor=ffffff&color=000000&qzone=1`;

    const handleCompare = async () => {
        if (ppmpFiles.length === 0 || prFiles.length === 0) { setError('Please upload documents for both PPMP and PR.'); return; }
        setLoading(true); setError(''); setResult(null);
        try { const comparisonResult = await compareDocuments(ppmpFiles, prFiles); setResult(comparisonResult); } 
        catch (err) { console.error(err); setError('Failed to compare documents. The AI may have returned an invalid format. Please try again.'); } 
        finally { setLoading(false); }
    };

    const handleCatalogCompare = async () => {
        if (prFileForCatalog.length === 0) { setCatalogError('Please upload a Purchase Request document.'); return; }
        setCatalogLoading(true); setCatalogError(''); setCatalogResult(null);
        try { const comparisonResult = await comparePrToCatalog(prFileForCatalog[0]); setCatalogResult(comparisonResult); } 
        catch (err) { console.error(err); setCatalogError('Failed to compare PR to catalog. The AI may have had an issue. Please try again.'); } 
        finally { setCatalogLoading(false); }
    };

    const handleBrandAudit = async () => {
        if (prFileForBrandAudit.length === 0) { setBrandAuditError('Please upload a document to audit.'); return; }
        setBrandAuditLoading(true); setBrandAuditError(''); setBrandAuditResult(null);
        try {
            const auditResult = await auditForBrandSpecifications(prFileForBrandAudit[0]);
            setBrandAuditResult(auditResult);
        } catch (err) {
            console.error(err);
            setBrandAuditError('Failed to audit document. The AI may have returned an invalid format. Please try again.');
        } finally {
            setBrandAuditLoading(false);
        }
    };
    
    const handlePrintRequest = () => {
        const printableArea = printableResultRef.current; if (!printableArea) return;
        printableArea.classList.remove('print-discrepancies-only'); document.body.classList.add('is-printing');
        const onAfterPrint = () => { document.body.classList.remove('is-printing'); window.removeEventListener('afterprint', onAfterPrint); };
        window.addEventListener('afterprint', onAfterPrint, { once: true });
        setTimeout(() => window.print(), 100);
    };

    const handlePrintCatalogRequest = () => {
        const printableArea = printableCatalogResultRef.current; if (!printableArea) return;
        document.body.classList.add('is-printing');
        const onAfterPrint = () => { document.body.classList.remove('is-printing'); window.removeEventListener('afterprint', onAfterPrint); };
        window.addEventListener('afterprint', onAfterPrint, { once: true });
        setTimeout(() => window.print(), 100);
    };

    const handlePrintDiscrepancies = () => {
        const printableArea = printableResultRef.current; if (!printableArea) return;
        printableArea.classList.add('print-discrepancies-only'); document.body.classList.add('is-printing');
        const onAfterPrint = () => { printableArea.classList.remove('print-discrepancies-only'); document.body.classList.remove('is-printing'); window.removeEventListener('afterprint', onAfterPrint); };
        window.addEventListener('afterprint', onAfterPrint, { once: true });
        setTimeout(() => window.print(), 100);
    };

    const handleDownloadPdf = async () => {
        if (!result) return;
    
        const jspdfModule = window.jspdf;
        if (!jspdfModule || typeof jspdfModule.jsPDF !== 'function') {
            setError("PDF generation library (jsPDF) is unavailable. Please check your network or try again.");
            return;
        }
    
        setLoading(true);
        setError('');
    
        try {
            const { jsPDF } = jspdfModule;
            const doc = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' }) as jsPDFWithAutoTable;
    
            if (typeof doc.autoTable !== 'function') {
                setError("PDF plugin (autoTable) is unavailable. Please try again.");
                setLoading(false);
                return;
            }
    
            const pageWidth = doc.internal.pageSize.getWidth();
            const margin = 40;
            let startY = margin;
    
            // --- Main Header ---
            doc.setFontSize(18);
            doc.setFont('helvetica', 'bold');
            doc.text('Comparison Findings', pageWidth / 2, startY, { align: 'center' });
            startY += 25;
    
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`Purchase Request No: ${result.prNumber || 'N/A'}`, margin, startY);
            doc.text(`Date Generated: ${new Date().toLocaleDateString()}`, pageWidth - margin, startY, { align: 'right' });
            startY += 25;
    
            // --- Summary Box ---
            doc.autoTable({
                startY: startY,
                body: [[{ 
                    content: `${result.conclusion === 'Discrepancies Found' ? 'Discrepancies Found' : 'Consistent'}\n\n${result.summary}`,
                    styles: {
                        fontStyle: 'normal',
                        halign: 'left',
                        valign: 'top',
                    }
                }]],
                theme: 'plain',
                styles: {
                    fillColor: result.conclusion === 'Discrepancies Found' ? [255, 243, 205] : [212, 237, 218],
                    lineWidth: 1,
                    lineColor: result.conclusion === 'Discrepancies Found' ? [255, 238, 186] : [197, 229, 209],
                },
                didParseCell: (data) => {
                    const cell = data.cell;
                    const lines = cell.text as string[];
                    const title = lines[0];
                    const body = lines.slice(2).join('\n');
                    
                    cell.text = [title, body];
                    
                    const titleHeight = doc.getTextDimensions(title, {fontStyle: 'bold', fontSize: 12}).h;
                    cell.styles.cellPadding = { top: 15 + titleHeight, right: 15, bottom: 15, left: 15 };
                },
                didDrawCell: (data) => {
                    const cell = data.cell;
                    const isDiscrepancy = result.conclusion === 'Discrepancies Found';
                    const icon = isDiscrepancy ? '!' : '✓';
                    const iconColor = isDiscrepancy ? [255, 193, 7] : [25, 135, 84];
                    const title = (cell.text as string[])[0];

                    doc.setFontSize(22);
                    doc.setFont('helvetica', 'bold');
                    doc.setTextColor(iconColor[0], iconColor[1], iconColor[2]);
                    doc.text(icon, cell.x + 15, cell.y + 22);

                    doc.setFontSize(12);
                    doc.setFont('helvetica', 'bold');
                    doc.setTextColor(51, 51, 51);
                    doc.text(title, cell.x + 35, cell.y + 20);
                },
                margin: { left: margin, right: margin }
            });
            startY = doc.autoTable.previous!.finalY + 20;

            const checkPageBreak = (neededSpace: number) => {
                if (startY + neededSpace > doc.internal.pageSize.getHeight() - margin) {
                    doc.addPage();
                    startY = margin;
                }
            };
    
            const discrepancies = result.findings.filter(f => f.status === 'mismatch');
            const matches = result.findings.filter(f => f.status !== 'mismatch');
            const tableHeaders = ['Item Details', 'PPMP Value', 'PR Value', 'Notes'];

            const createTable = (title: string, data: ComparisonFinding[], headerColor: [number, number, number], textColor: [number, number, number]) => {
                if (data.length === 0) return;
                
                checkPageBreak(50);
                doc.setFontSize(14);
                doc.setFont('helvetica', 'bold');
                doc.text(title, margin, startY);
                startY += 25;

                const body = data.map(f => [
                    f.category,
                    f.ppmpValue.replace(/, /g, '\n'),
                    f.prValue.replace(/, /g, '\n'),
                    f.notes
                ]);

                doc.autoTable({
                    startY: startY,
                    head: [tableHeaders],
                    body: body,
                    theme: 'grid',
                    headStyles: { fillColor: headerColor, textColor: textColor, fontStyle: 'bold' },
                    styles: { fontSize: 8, cellPadding: 4, overflow: 'linebreak' },
                    columnStyles: {
                        0: { cellWidth: 140 },
                        1: { cellWidth: 100 },
                        2: { cellWidth: 100 },
                        3: { cellWidth: 'auto' },
                    },
                });
                startY = doc.autoTable.previous!.finalY + 20;
            };

            createTable(`Discrepancies Found (${discrepancies.length})`, discrepancies, [248, 215, 218], [114, 28, 36]);
            createTable(`Matched Items (${matches.length})`, matches, [212, 237, 218], [21, 87, 50]);
    
            const safePrNumber = result.prNumber ? result.prNumber.replace(/[^a-zA-Z0-9-]/g, '_') : 'Report';
            doc.save(`BAC_Compliance_Check_PR_${safePrNumber}.pdf`);
        } catch (e) {
            console.error("PDF generation failed:", e);
            setError("Sorry, there was an error creating the PDF. Please try the standard print function.");
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadCatalogPdf = async () => {
        if (!catalogResult) return;
        const jspdfModule = window.jspdf;
        if (!jspdfModule || typeof jspdfModule.jsPDF !== 'function') {
            setCatalogError("PDF generation library (jsPDF) is unavailable.");
            return;
        }
        setCatalogLoading(true); 
        setCatalogError('');
        try {
            const { jsPDF } = jspdfModule;
            const doc = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' }) as jsPDFWithAutoTable;
            if (typeof doc.autoTable !== 'function') {
                setCatalogError("PDF plugin (autoTable) is unavailable.");
                setCatalogLoading(false);
                return;
            }
            
            const pageWidth = doc.internal.pageSize.getWidth();
            const margin = 40;
            let startY = margin;
    
            // --- HEADER ---
            doc.setFontSize(20);
            doc.setFont('helvetica', 'bold');
            doc.text('Catalog Pricing Comparison Report', pageWidth / 2, startY, { align: 'center' });
            startY += 30;
            
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`Purchase Request No: ${catalogResult.prNumber || 'N/A'}`, margin, startY);
            doc.text(`Date Generated: ${new Date().toLocaleDateString()}`, pageWidth - margin, startY, { align: 'right' });
            startY += 25;
    
            // --- SUMMARY ---
            doc.setFont('helvetica', 'italic');
            const summaryLines = doc.splitTextToSize(catalogResult.summary, pageWidth - (margin * 2));
            doc.text(summaryLines, margin, startY);
            startY += (summaryLines.length * 12) + 15;
            
            // --- TABLE ---
            const tableHeaders = ['PR Item', 'PR Cost', 'Catalog Match', 'Catalog Cost', 'Variance (%)', 'Status'];
            const body = catalogResult.findings.map(f => [
                f.prItemDescription,
                `Php ${f.prUnitCost.toFixed(2)}`,
                f.catalogItemName,
                f.catalogUnitCost > 0 ? `Php ${f.catalogUnitCost.toFixed(2)}` : 'N/A',
                f.variancePercentage.toFixed(2) + '%',
                f.status
            ]);
            
            doc.autoTable({
                startY,
                head: [tableHeaders],
                body,
                theme: 'grid',
                headStyles: {
                    fillColor: [249, 115, 22], // orange-500
                    textColor: [255, 255, 255],
                    fontStyle: 'bold',
                    fontSize: 9,
                },
                alternateRowStyles: {
                    fillColor: [249, 250, 251] // gray-50
                },
                styles: {
                    fontSize: 8,
                    cellPadding: 5,
                    overflow: 'linebreak',
                    font: 'helvetica',
                    valign: 'middle',
                },
                columnStyles: {
                    0: { cellWidth: 'auto' },
                    1: { halign: 'right', cellWidth: 60 },
                    2: { cellWidth: 'auto' },
                    3: { halign: 'right', cellWidth: 60 },
                    4: { halign: 'right', cellWidth: 60 },
                    5: { halign: 'center', cellWidth: 60 },
                },
                didDrawCell: (data: any) => {
                    if (data.column.index === 5 && data.cell.section === 'body') {
                        const status = data.cell.raw;
                        let textColor: [number, number, number] | undefined;
                        if (status === 'Overpriced') textColor = [199, 50, 50]; // Red
                        else if (status === 'Underpriced') textColor = [180, 120, 0]; // Yellow-ish
                        else if (status === 'Match') textColor = [22, 101, 52]; // Green
                        
                        if (textColor) {
                            doc.setTextColor(textColor[0], textColor[1], textColor[2]);
                            doc.setFont('helvetica', 'bold');
                        }
                    }
                }
            });
            
            const safePrNumber = catalogResult.prNumber ? catalogResult.prNumber.replace(/[^a-zA-Z0-9-]/g, '_') : 'Report';
            doc.save(`BAC_Catalog_Pricing_Check_PR_${safePrNumber}.pdf`);
    
        } catch(e) {
            console.error("PDF generation failed:", e);
            setCatalogError("Sorry, there was an error creating the PDF. Please try again.");
        } finally {
            setCatalogLoading(false);
        }
    };


    const handleEmailRequest = () => {
        if (!result) return;
        const safePrNumber = result.prNumber ? result.prNumber.replace(/[^a-zA-Z0-9-]/g, '_') : 'N/A';
        const subject = `Compliance Check Findings for PR: ${safePrNumber}`;
        const findingsText = result.findings.map((finding, index) => {
            const match = finding.category.match(/Item\s*#(\S+):\s*(.*)/i);
            const itemNumberText = match ? `Item #${match[1]}` : `Finding #${index + 1}`;
            const itemName = match ? match[2]?.trim() : finding.category;
            return `\n${itemNumberText}: ${itemName}\n-----------------------------\nStatus: ${finding.status.toUpperCase()}\nPPMP Value: ${finding.ppmpValue}\nPR Value: ${finding.prValue}\nNotes: ${finding.notes}`.trim();
        }).join('\n\n');
        const body = `Hello,\n\nPlease find the AI-generated comparison findings for Purchase Request ${safePrNumber}.\n\n========================================\nOVERALL CONCLUSION: ${result.conclusion}\n========================================\n\nSUMMARY:\n${result.summary}\n\n----------------------------------------\nDETAILED FINDINGS\n----------------------------------------\n\n${findingsText}\n\nThis report was generated by the BAC Procurement Assistant.\nFor inquiries, please contact the Bids and Awards Committee at bac@bacolodcity.gov.ph.`.trim();
        const mailtoLink = `mailto:?cc=bac@bacolodcity.gov.ph&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailtoLink;
    };

    const renderFindings = (findings: ComparisonFinding[]) => (
        <div className="space-y-3">
            {findings.map((finding, index) => {
                const match = finding.category.match(/Item\s*#(\S+):\s*(.*)/i);
                const itemNumber = match ? match[1] : null;
                const itemName = match ? match[2]?.trim() : finding.category;
                return (
                    <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center mb-3">
                            <div className="flex-shrink-0">{getStatusIcon(finding.status)}</div>
                            <h6 className="font-semibold text-gray-700 ml-2 flex items-center flex-wrap">
                                {itemNumber && (
                                    <span className="bg-orange-100 text-orange-800 font-bold text-xs px-2 py-1 rounded-full mr-2 flex-shrink-0">
                                        ITEM #{itemNumber}
                                    </span>
                                )}
                                <span>{itemName}</span>
                            </h6>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-2">
                             <div className="border-r-0 md:border-r md:pr-4 border-gray-200">
                                <ValueWithHighlight label="PPMP Value" finding={finding} isValueFor="ppmp" />
                            </div>
                            <div className="pt-2 md:pt-0 border-t md:border-t-0 border-gray-200">
                                <ValueWithHighlight label="Purchase Request Value" finding={finding} isValueFor="pr" />
                            </div>
                        </div>
                        <div className="mt-2 text-xs italic text-gray-600 bg-gray-50 p-2 rounded-md">
                            <strong>Note:</strong> {finding.notes}
                        </div>
                    </div>
                );
            })}
        </div>
    );

    const footerContent = ( <> <div className="flex items-center space-x-6"> <div className="flex items-center space-x-2"> <LocationIcon /> <div className="text-xs"> <strong className="font-semibold block text-gray-800">Address</strong> <p className="text-gray-500">3rd Flr, Masskara Hall, BCGC, Brgy. Villamonte, Bacolod City</p> </div> </div> <div className="flex items-center space-x-2"> <PhoneIcon /> <div className="text-xs"> <strong className="font-semibold block text-gray-800">Mobile No.</strong> <p className="text-gray-500">09486268509</p> </div> </div> <div className="flex items-center space-x-2"> <EmailIcon /> <div className="text-xs"> <strong className="font-semibold block text-gray-800">E-mail</strong> <p className="text-gray-500">bac@bacolodcity.gov.ph</p> </div> </div> </div> <div className="flex items-center space-x-3 pl-6 border-l border-gray-200"> <img src={qrCodeUrl} alt="Feedback QR" className="h-[60px] w-[60px] rounded-md" /> <div className="text-xs text-left"> <p className="font-bold text-sm text-gray-800 leading-tight">BACOLOD CITY</p> <p className="font-semibold text-orange-600 leading-tight">Bids and Awards Committee</p> <a href={feedbackFormUrl} target="_blank" rel="noopener noreferrer" className="mt-1 block underline text-gray-500 hover:text-orange-600">Scan QR for Feedback</a> </div> </div> </> );

    const getStatusCellStyle = (status: CatalogComparisonFinding['status']) => {
        switch (status) {
            case 'Overpriced': return 'bg-red-100 text-red-800';
            case 'Underpriced': return 'bg-yellow-100 text-yellow-800';
            case 'Match': return 'bg-green-100 text-green-800';
            case 'Not found': return 'bg-gray-100 text-gray-800';
            default: return '';
        }
    };
    
    const handlePrintBrandAudit = () => {
        const printableArea = printableBrandAuditRef.current;
        if (!printableArea) return;
        document.body.classList.add('is-printing');
        const onAfterPrint = () => { document.body.classList.remove('is-printing'); window.removeEventListener('afterprint', onAfterPrint); };
        window.addEventListener('afterprint', onAfterPrint, { once: true });
        setTimeout(() => window.print(), 100);
    };

    const handleDownloadBrandAuditPdf = async () => {
        if (!brandAuditResult || !prFileForBrandAudit[0]) return;
        const jspdfModule = window.jspdf;
        if (!jspdfModule || !jspdfModule.jsPDF || !(jspdfModule.jsPDF as any).API.autoTable) { setBrandAuditError("PDF generation library is unavailable."); return; }
        setBrandAuditLoading(true); setBrandAuditError('');
        try {
            const { jsPDF } = jspdfModule;
            const doc = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' }) as jsPDFWithAutoTable;
            const pageWidth = doc.internal.pageSize.getWidth(); const margin = 40; let startY = margin;
            doc.setFontSize(18); doc.setFont('helvetica', 'bold'); doc.text('Brand Specification Audit Report', pageWidth / 2, startY, { align: 'center' }); startY += 25;
            doc.setFontSize(10); doc.setFont('helvetica', 'normal'); doc.text(`Source Document: ${prFileForBrandAudit[0]?.name || 'N/A'}`, margin, startY); doc.text(`Date Generated: ${new Date().toLocaleDateString()}`, pageWidth - margin, startY, { align: 'right' }); startY += 25;
            doc.autoTable({ startY: startY, body: [[{ content: `${brandAuditResult.overallConclusion}\n\n${brandAuditResult.summary}`, styles: { fontStyle: 'normal' } }]], theme: 'plain', styles: { fillColor: brandAuditResult.overallConclusion === 'Compliant' ? [212, 237, 218] : [255, 243, 205], lineWidth: 1, lineColor: brandAuditResult.overallConclusion === 'Compliant' ? [197, 229, 209] : [255, 238, 186] }});
            startY = doc.autoTable.previous!.finalY + 20;

            const tableHeaders = ['Original Item Description', 'Recommended Generic Name', 'Explanation'];
            for (const [groupName, findings] of Object.entries(groupedBrandAuditFindings)) {
                if (startY > doc.internal.pageSize.getHeight() - 100) { doc.addPage(); startY = margin; }
                doc.setFontSize(12); doc.setFont('helvetica', 'bold'); doc.text(groupName, margin, startY); startY += 20;
                const body = findings.map(f => [f.itemDescription, f.recommendedGenericName, f.explanation]);
                doc.autoTable({ startY: startY, head: [tableHeaders], body: body, theme: 'grid', headStyles: { fillColor: groupName === 'Compliant Items' ? [34, 139, 34] : [220, 20, 60] }, styles: { fontSize: 8, cellPadding: 4, overflow: 'linebreak' }, columnStyles: { 0: { cellWidth: 150 }, 1: { cellWidth: 120 }, 2: { cellWidth: 'auto' } }});
                startY = doc.autoTable.previous!.finalY + 20;
            }
            const safeFileName = `Brand_Audit_${prFileForBrandAudit[0]?.name.replace(/\.[^/.]+$/, '') || 'Report'}.pdf`; doc.save(safeFileName);
        } catch (e) { console.error("PDF generation failed:", e); setBrandAuditError("Sorry, there was an error creating the PDF.");
        } finally { setBrandAuditLoading(false); }
    };

    return (
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <svg className="w-8 h-8 mr-3 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15M9 12l3 3m0 0l3-3m-3 3V2.25" /></svg>
                Compliance Check
            </h2>
            <div className="flex border-b border-gray-200 mb-6">
                <button onClick={() => setActiveTab('ppmp')} className={`px-4 py-2 text-sm font-semibold transition-colors ${activeTab === 'ppmp' ? 'border-b-2 border-orange-500 text-orange-600' : 'text-gray-500 hover:text-gray-700'}`}>PPMP vs. PR Compliance</button>
                <button onClick={() => setActiveTab('catalog')} className={`px-4 py-2 text-sm font-semibold transition-colors ${activeTab === 'catalog' ? 'border-b-2 border-orange-500 text-orange-600' : 'text-gray-500 hover:text-gray-700'}`}>Catalog vs. PR Pricing</button>
                <button onClick={() => setActiveTab('brand_audit')} className={`px-4 py-2 text-sm font-semibold transition-colors ${activeTab === 'brand_audit' ? 'border-b-2 border-orange-500 text-orange-600' : 'text-gray-500 hover:text-gray-700'}`}>Brand Specification Audit</button>
            </div>
            
            {activeTab === 'ppmp' && (
            <>
                <p className="text-gray-600 mb-6">Upload Purchase Requests (PR) and their corresponding Project Procurement Management Plan (PPMP) to ensure requests are compliant with the approved plan.</p>
                <div className="grid md:grid-cols-2 gap-6 mb-6 min-h-[250px]">
                    <FileInput id="ppmp-upload" label="1. Upload PPMP(s)" selectedFiles={ppmpFiles} onFilesChange={setPpmpFiles} disabled={loading} />
                    <FileInput id="pr-upload-comparator" label="2. Upload Purchase Request(s)" selectedFiles={prFiles} onFilesChange={setPrFiles} disabled={loading} />
                </div>
                <button onClick={handleCompare} className="btn bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-lg w-full disabled:bg-gray-400 disabled:cursor-not-allowed" disabled={loading || ppmpFiles.length === 0 || prFiles.length === 0}> {loading ? 'Comparing...' : 'Compare Documents'} </button>
                {loading && <Loader text="AI is comparing the documents..." />}
                {error && <p className="text-center text-red-500 my-4">{error}</p>}
                {result && ( <> <div ref={printableResultRef} id="comparator-printable-result" className="mt-6 bg-gray-50 p-6 rounded-lg printable-content"> <div className="flex justify-between items-start mb-4 flex-wrap gap-4"> <h4 className="text-xl font-bold text-gray-800">Comparison Findings</h4> <div className="no-print flex items-center flex-wrap gap-2 justify-end"> <button onClick={handleEmailRequest} className="flex items-center space-x-2 text-sm text-gray-600 hover:text-orange-600 font-semibold p-2 rounded-lg hover:bg-orange-100 transition-colors" title="Email Findings"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg><span>Email</span></button> <button onClick={handlePrintDiscrepancies} className="flex items-center space-x-2 text-sm text-gray-600 hover:text-orange-600 font-semibold p-2 rounded-lg hover:bg-orange-100 transition-colors" title="Print Discrepancies"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm-5-4a1 1 0 11-2 0 1 1 0 012 0z" /></svg><span>Print Discrepancies</span></button> <button onClick={handlePrintRequest} className="flex items-center space-x-2 text-sm text-gray-600 hover:text-orange-600 font-semibold p-2 rounded-lg hover:bg-orange-100 transition-colors" title="Print Full Report"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm7-8V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg><span>Print</span></button> <button onClick={handleDownloadPdf} className="flex items-center space-x-2 text-sm text-gray-600 hover:text-orange-600 font-semibold p-2 rounded-lg hover:bg-orange-100 transition-colors" title="Download as PDF"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg><span>Download PDF</span></button> </div> </div> <div className={`flex items-start p-4 rounded-lg mb-6 ${result.conclusion === 'Consistent' ? 'bg-green-100 border-green-500 text-green-800' : 'bg-orange-100 border-orange-500 text-orange-800'} border-l-4`}> <div className="flex-shrink-0"> {result.conclusion === 'Consistent' ? <CheckCircleIcon className="h-8 w-8 text-green-500" /> : <ExclamationCircleIcon className="h-8 w-8 text-orange-500" />} </div> <div className="ml-4"> <h5 className="font-extrabold text-lg">{result.conclusion}</h5> <p className="text-sm">{result.summary}</p> </div> </div> <div className="space-y-6"> <div className="mismatched-findings-section"> <h5 className="text-lg font-bold text-red-600 mb-3 border-b-2 border-red-200 pb-2">Discrepancies Found ({result.findings.filter(f => f.status === 'mismatch').length})</h5> {result.findings.filter(f => f.status === 'mismatch').length > 0 ? renderFindings(result.findings.filter(f => f.status === 'mismatch')) : <p className="text-gray-500 text-sm py-4">No discrepancies were found in this comparison.</p>} </div> <div className="matched-findings-section pt-4"> <Accordion> <AccordionItem title={`Matched Items (${result.findings.filter(f => f.status !== 'mismatch').length})`}> {result.findings.filter(f => f.status !== 'mismatch').length > 0 ? renderFindings(result.findings.filter(f => f.status !== 'mismatch')) : <p className="text-gray-500 text-sm py-4">No matched items to display.</p>} </AccordionItem> </Accordion> </div> </div> <div className="hidden print:flex mt-8 pt-6 border-t border-gray-300 items-center justify-between"> {footerContent} </div> </div> <div className="no-print mt-8 p-4 bg-white rounded-xl shadow border border-gray-200 flex items-center justify-between"> {footerContent} </div> </> )}
            </>
            )}

            {activeTab === 'catalog' && (
                <>
                    <p className="text-gray-600 mb-6">Upload a Purchase Request (PR). The AI will compare each item's price against the internal Procurement Catalog to check for reasonableness.</p>
                    <div className="grid md:grid-cols-2 gap-6 mb-6 min-h-[250px]">
                        <FileInput id="pr-catalog-upload" label="Upload Purchase Request" selectedFiles={prFileForCatalog} onFilesChange={setPrFileForCatalog} disabled={catalogLoading} />
                        <div className="p-4 border-2 border-dashed border-transparent rounded-lg flex flex-col justify-center items-center text-gray-500">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
                             <p className="text-center font-semibold">Ready for Analysis</p>
                             <p className="text-center text-sm">The AI will use the full catalog data for comparison.</p>
                        </div>
                    </div>
                    <button onClick={handleCatalogCompare} className="btn bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-lg w-full disabled:bg-gray-400 disabled:cursor-not-allowed" disabled={catalogLoading || prFileForCatalog.length === 0}>
                        {catalogLoading ? 'Comparing...' : 'Compare to Catalog'}
                    </button>
                    {catalogLoading && <Loader text="AI is comparing PR against the catalog..." />}
                    {catalogError && <p className="text-center text-red-500 my-4">{catalogError}</p>}
                    {catalogResult && (
                        <div ref={printableCatalogResultRef} id="catalog-printable-result" className="mt-6 printable-content">
                             <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-gray-800">Pricing Comparison Results</h3>
                                <div className="no-print flex items-center flex-wrap gap-2 justify-end">
                                     <button onClick={handlePrintCatalogRequest} className="flex items-center space-x-2 text-sm text-gray-600 hover:text-orange-600 font-semibold p-2 rounded-lg hover:bg-orange-100 transition-colors" title="Print Report"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm7-8V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg><span>Print</span></button>
                                     <button onClick={handleDownloadCatalogPdf} className="flex items-center space-x-2 text-sm text-gray-600 hover:text-orange-600 font-semibold p-2 rounded-lg hover:bg-orange-100 transition-colors" title="Download as PDF"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg><span>Download PDF</span></button>
                                </div>
                            </div>
                             <p className="text-sm text-gray-600 mb-4">{catalogResult.summary} (PR No: {catalogResult.prNumber}) — <strong>{catalogResult.findings.length} items found.</strong></p>
                            
                            <div className="overflow-x-auto rounded-lg border border-gray-200">
                                <table className="min-w-full bg-white">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="p-3 text-left text-sm font-semibold text-gray-600">PR Item</th>
                                            <th className="p-3 text-right text-sm font-semibold text-gray-600">PR Cost</th>
                                            <th className="p-3 text-left text-sm font-semibold text-gray-600">Catalog Match</th>
                                            <th className="p-3 text-right text-sm font-semibold text-gray-600">Catalog Cost</th>
                                            <th className="p-3 text-right text-sm font-semibold text-gray-600">Variance</th>
                                            <th className="p-3 text-center text-sm font-semibold text-gray-600">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {catalogResult.findings.map((finding, index) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="p-2 text-sm text-gray-800">{finding.prItemDescription}</td>
                                                <td className="p-2 text-sm text-gray-800 text-right font-mono">Php {finding.prUnitCost.toFixed(2)}</td>
                                                <td className="p-2 text-sm text-gray-600">{finding.catalogItemName}</td>
                                                <td className="p-2 text-sm text-gray-800 text-right font-mono">Php {finding.catalogUnitCost.toFixed(2)}</td>
                                                <td className={`p-2 text-sm text-right font-semibold ${finding.variancePercentage > 15 ? 'text-red-600' : 'text-gray-700'}`}>{finding.variancePercentage.toFixed(2)}%</td>
                                                <td className={`p-2 text-center text-xs font-bold ${getStatusCellStyle(finding.status)}`}>
                                                    <span className="px-2 py-1 rounded-full">{finding.status}</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}

            {activeTab === 'brand_audit' && (
                <>
                    <p className="text-gray-600 mb-6">Upload a procurement document (e.g., Purchase Request). The AI will scan item descriptions for specific brand names, which may violate procurement laws (R.A. 9184 & R.A. 12009) that require generic specifications to ensure fair competition.</p>
                    <div className="grid md:grid-cols-2 gap-6 mb-6 min-h-[250px]">
                        <FileInput id="brand-audit-upload" label="Upload Document for Audit" selectedFiles={prFileForBrandAudit} onFilesChange={setPrFileForBrandAudit} disabled={brandAuditLoading} />
                        <div className="p-4 border-2 border-dashed border-transparent rounded-lg flex flex-col justify-center items-center text-gray-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0 3.517-1.009 6.789-2.75 9.565M12 11c3.517 0 6.789-1.009 9.565-2.75M12 11v10.25M12 11V3.75M3.75 12H12m0 0h8.25" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 110-18 9 9 0 010 18zm0 0a9 9 0 100-18 9 9 0 000 18z" />
                            </svg>
                             <p className="text-center font-semibold">Ready for Audit</p>
                             <p className="text-center text-sm">The AI will check for non-generic, brand-specific descriptions.</p>
                        </div>
                    </div>
                    <button onClick={handleBrandAudit} className="btn bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-lg w-full disabled:bg-gray-400 disabled:cursor-not-allowed" disabled={brandAuditLoading || prFileForBrandAudit.length === 0}>
                        {brandAuditLoading ? 'Auditing...' : 'Audit for Brand Specifications'}
                    </button>
                    {brandAuditLoading && <Loader text="AI is auditing the document for brand names..." />}
                    {brandAuditError && <p className="text-center text-red-500 my-4">{brandAuditError}</p>}
                    {brandAuditResult && (
                         <div id="brand-audit-printable-result" ref={printableBrandAuditRef} className="mt-6 printable-content">
                            <div className="hidden print:block mb-6 text-center">
                                <img src={bacolodCityLogo} alt="Bacolod BAC Logo" className="h-16 mx-auto mb-2" />
                                <h2 className="text-xl font-bold">Brand Specification Audit Report</h2>
                                <p className="text-sm">Bids and Awards Committee - Bacolod City</p>
                                <p className="text-sm">Document: {prFileForBrandAudit[0]?.name}</p>
                            </div>
                             <div className="flex justify-between items-center mb-4 no-print">
                                <h3 className="text-xl font-bold text-gray-800">Audit Report</h3>
                                <div className="flex items-center gap-2">
                                    <button onClick={handlePrintBrandAudit} className="flex items-center space-x-2 text-sm text-gray-600 hover:text-orange-600 font-semibold p-2 rounded-lg hover:bg-orange-100 transition-colors" title="Print Report"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm7-8V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg><span>Print</span></button>
                                    <button onClick={handleDownloadBrandAuditPdf} className="flex items-center space-x-2 text-sm text-gray-600 hover:text-orange-600 font-semibold p-2 rounded-lg hover:bg-orange-100 transition-colors" title="Download as PDF"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg><span>Download PDF</span></button>
                                </div>
                            </div>
                             <div className={`flex items-start p-4 rounded-lg mb-6 ${brandAuditResult.overallConclusion === 'Compliant' ? 'bg-green-100 border-green-500 text-green-800' : 'bg-yellow-100 border-yellow-500 text-yellow-800'} border-l-4`}>
                                 <div className="flex-shrink-0">
                                     {brandAuditResult.overallConclusion === 'Compliant' ? <CheckCircleIcon className="h-8 w-8 text-green-500" /> : <ExclamationCircleIcon className="h-8 w-8 text-yellow-500" />}
                                 </div>
                                 <div className="ml-4">
                                     <h5 className="font-extrabold text-lg">{brandAuditResult.overallConclusion}</h5>
                                     <p className="text-sm">{brandAuditResult.summary}</p>
                                 </div>
                             </div>
                             <div className="space-y-6">
                                {Object.entries(groupedBrandAuditFindings).map(([groupName, findings]) => (
                                    <div key={groupName}>
                                        <h4 className={`text-lg font-bold mb-3 border-b-2 pb-2 ${groupName === 'Compliant Items' ? 'text-green-700 border-green-200' : 'text-red-700 border-red-200'}`}>{groupName} ({findings.length})</h4>
                                        <div className="space-y-4">
                                            {findings.map((finding, index) => (
                                                <div key={index} className="bg-white p-4 rounded-lg shadow-sm border">
                                                    <p className="text-sm text-gray-700 mb-2"><strong>Original Item:</strong> {finding.itemDescription}</p>
                                                    {finding.status === 'potential_issue' ? (
                                                        <div className="border-l-4 border-red-400 pl-4 py-2 bg-red-50 space-y-1">
                                                            <p className="text-xs text-red-800"><strong>Recommended Generic Name:</strong> <span className="font-semibold">{finding.recommendedGenericName}</span></p>
                                                        </div>
                                                    ) : (
                                                        <div className="border-l-4 border-green-400 pl-4 py-2 bg-green-50">
                                                            <p className="text-xs text-green-800 font-semibold">Status: Compliant</p>
                                                        </div>
                                                    )}
                                                    <div className="mt-2 text-xs italic text-gray-600 bg-gray-100 p-2 rounded-md">
                                                        <strong>AI Note:</strong> {finding.explanation}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                             </div>
                         </div>
                    )}
                </>
            )}
        </div>
    );
};

export default AIDocumentComparatorTab;