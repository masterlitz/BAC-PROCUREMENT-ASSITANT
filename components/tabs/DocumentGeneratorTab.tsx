import React, { useState, useRef, useMemo } from 'react';
import { ProcurementProjectData, SupplierBid, ProcurementProjectItem, DocumentType } from '../../types';
import { analyzeDocumentForGenerator, generateSupplierQuote } from '../../services/geminiService';
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

// Reusable Editable Components
const EditableTextarea: React.FC<{ initialValue: string; onSave: (value: string) => void; className?: string; rows?: number }> = ({ initialValue, onSave, className, rows = 1 }) => {
    const [value, setValue] = useState(initialValue);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const resize = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    };

    React.useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);

    React.useEffect(() => {
        resize();
    }, [value]);

    return (
        <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={(e) => onSave(e.target.value)}
            className={`bg-transparent hover:bg-orange-100/50 focus:bg-orange-100 border border-transparent focus:border-orange-300 rounded p-1 w-full focus:outline-none resize-none overflow-hidden pdf-editable ${className}`}
            rows={rows}
        />
    );
};

const EditableInline: React.FC<{ initialValue: string; onSave: (value: string) => void; className?: string }> = ({ initialValue, onSave, className }) => {
    const [value, setValue] = useState(initialValue);
    
    React.useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);

    return (
        <input
            type="text"
            value={value}
            onChange={e => setValue(e.target.value)}
            onBlur={e => onSave(e.target.value)}
            className={`bg-transparent hover:bg-orange-100/50 focus:bg-orange-100 border border-transparent focus:border-orange-300 rounded p-0.5 focus:outline-none pdf-editable ${className}`}
            style={{ width: `${(value.length || 1) * 0.6}em`, minWidth: '50px' }}
        />
    );
};

const EditableCell: React.FC<{ value: string | number; onSave: (value: string) => void; className?: string }> = ({ value, onSave, className='' }) => (
    <input
        type="text"
        defaultValue={value}
        onBlur={e => onSave(e.target.value)}
        className={`w-full h-full text-left p-1 bg-transparent hover:bg-orange-100/50 focus:bg-orange-100 focus:outline-none focus:ring-1 focus:ring-orange-500 rounded-sm pdf-editable ${className}`}
    />
);

const initialProjectData: ProcurementProjectData = {
    prNo: "2025-07-0005",
    projectTitle: "Procurement of Various Office Supplies for various offices of the LGU",
    endUser: "City Mayor's Office",
    location: "Bacolod City",
    abc: 48205.00,
    abcInWords: "FORTY-EIGHT THOUSAND TWO HUNDRED FIVE PESOS",
    procurementMode: "SMALL VALUE PROCUREMENT",
    items: [
        { itemNo: 1, description: "Printer Ink BT D60", qty: 23, uom: "Bottle", brandName: "EPSON", unitCost: 450, totalCost: 10350 },
        { itemNo: 2, description: "Printer Ink BT 5000", qty: 23, uom: "Bottle", brandName: "EPSON", unitCost: 450, totalCost: 10350 },
        { itemNo: 3, description: "Printer Ink 664", qty: 23, uom: "Bottle", brandName: "EPSON", unitCost: 350, totalCost: 8050 },
        { itemNo: 4, description: "Printer Ink 663", qty: 23, uom: "Bottle", brandName: "EPSON", unitCost: 350, totalCost: 8050 },
        { itemNo: 5, description: "Air Freshner Spray", qty: 15, uom: "Piece", brandName: "GLADE", unitCost: 370, totalCost: 5550 },
        { itemNo: 6, description: "Toilet Bowl Cleaner", qty: 13, uom: "Piece", brandName: "DOMEX", unitCost: 160, totalCost: 2080 },
        { itemNo: 7, description: "Broom", qty: 10, uom: "Piece", brandName: "N/A", unitCost: 250, totalCost: 2500 },
        { itemNo: 8, description: "Laundry Powder", qty: 85, uom: "Piece", brandName: "ARIEL", unitCost: 15, totalCost: 1275 },
    ],
    suppliers: [
        { name: "NBM CONSTRUCTION SUPPLY INC.", address: "Bacolod City", tin: "123-456-789-000", contactNo: "09123456789", 
          bids: [
              {unitPrice: 440, totalPrice: 10120}, {unitPrice: 445, totalPrice: 10235},
              {unitPrice: 340, totalPrice: 7820}, {unitPrice: 345, totalPrice: 7935},
              {unitPrice: 360, totalPrice: 5400}, {unitPrice: 155, totalPrice: 2015},
              {unitPrice: 240, totalPrice: 2400}, {unitPrice: 14, totalPrice: 1190}
          ], totalBid: 47115.00 
        },
        { name: "SOME OTHER SUPPLIER", address: "Bacolod City", tin: "987-654-321-000", contactNo: "09987654321",
          bids: [
              {unitPrice: 445, totalPrice: 10235}, {unitPrice: 448, totalPrice: 10304},
              {unitPrice: 345, totalPrice: 7935}, {unitPrice: 348, totalPrice: 8004},
              {unitPrice: 365, totalPrice: 5475}, {unitPrice: 158, totalPrice: 2054},
              {unitPrice: 245, totalPrice: 2450}, {unitPrice: 14.5, totalPrice: 1232.5}
          ], totalBid: 47689.50
        },
        { name: "SUPPLIER C ENTERPRISES", address: "Bacolod City", tin: "111-222-333-000", contactNo: "09171234567",
          bids: [
              {unitPrice: 442, totalPrice: 10166}, {unitPrice: 446, totalPrice: 10258},
              {unitPrice: 342, totalPrice: 7866}, {unitPrice: 346, totalPrice: 7958},
              {unitPrice: 368, totalPrice: 5520}, {unitPrice: 159, totalPrice: 2067},
              {unitPrice: 248, totalPrice: 2480}, {unitPrice: 14.8, totalPrice: 1258}
          ], totalBid: 47573.00
        },
    ],
    resolutionNo: "A-0001",
    resolutionSeries: "2025",
    resolutionDate: "4th day of July 2025",
    poNo: "BAC-AP-25-07-0005",
    poDate: "July 7, 2025",
    deliveryTerm: "7 calendar days upon receipt of Purchase Order",
    paymentTerm: "Payment upon full delivery of items",
    poSanggunianReso: "N/A",
    poNegotiatedClause: "",
    chairperson: "ATTY. HERMILO B. PA-OYON",
    viceChairperson: "ATTY. ALLYN LUV Z. DIGNADICE",
    members: ["DR. SHIRLEY P. RODRIGAZO", "ENGR. AMY TENTI", "ENGR. JOSEPH M. DATO-ON"],
    endUserSignatory: "FSUPT. JENNY MAE C. MASIP",
    preparedBy: "ATTY. OMAR FRANCIS P. DEMONTEVERDE",
    cityMayor: "HON. GREG GASATAYA",
    poCertifiedCorrectSignatory: "Secretary to the Sanggunian",
    isApproved: true,
    noaDate: "July 8, 2025",
    performanceSecurity: "five percent (5%)",
};

const numberToWords = (num: number): string => {
    // Basic implementation for demo purposes
    // A full library would be needed for a robust solution
    const a = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
    const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

    const toWords = (n: number): string => {
        if (n < 20) return a[n];
        const digit = n % 10;
        return `${b[Math.floor(n / 10)]}${digit ? '-' + a[digit] : ''}`;
    };

    if (num === 0) return 'zero';
    if (num > 999999999) return 'Number too large';

    let words = '';
    const numberParts = String(num.toFixed(2)).split('.');
    const integerPart = parseInt(numberParts[0], 10);
    const decimalPart = parseInt(numberParts[1], 10);

    const intToWords = (n: number): string => {
        if (n === 0) return '';
        let str = '';
        if (Math.floor(n / 1000000000) > 0) {
            str += toWords(Math.floor(n / 1000000000)) + ' billion ';
            n %= 1000000000;
        }
        if (Math.floor(n / 1000000) > 0) {
            str += intToWords(Math.floor(n / 1000000)) + ' million ';
            n %= 1000000;
        }
        if (Math.floor(n / 1000) > 0) {
            str += intToWords(Math.floor(n / 1000)) + ' thousand ';
            n %= 1000;
        }
        if (Math.floor(n / 100) > 0) {
            str += intToWords(Math.floor(n / 100)) + ' hundred ';
            n %= 100;
        }
        if (n > 0) {
            str += toWords(n);
        }
        return str;
    }

    if (integerPart > 0) {
        words += intToWords(integerPart) + ' Pesos';
    }

    if (decimalPart > 0) {
        words += (integerPart > 0 ? ' and ' : '') + intToWords(decimalPart) + ' Centavos';
    } else {
        words += ' Only';
    }
    
    return words.trim().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ').replace(/\s+/g, ' ');
};


const DocumentGeneratorTab: React.FC = () => {
    const [activeDoc, setActiveDoc] = useState<DocumentType>('resolution');
    const [projectData, setProjectData] = useState<ProcurementProjectData>(initialProjectData);
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [quotingSupplierIndex, setQuotingSupplierIndex] = useState<number | null>(null);
    const [fontSize, setFontSize] = useState(12);
    const printableRef = useRef<HTMLDivElement>(null);

    const handleDataChange = (field: keyof ProcurementProjectData, value: any) => {
        setProjectData(prev => {
            const newState = { ...prev, [field]: value };
            if (field === 'abc') {
                newState.abcInWords = `${numberToWords(Number(value) || 0)}`.toUpperCase();
            }
            return newState;
        });
    };
    
    const handleItemChange = (index: number, field: keyof ProcurementProjectItem, value: any) => {
        const newItems = [...projectData.items];
        const item = {...newItems[index]};
        (item as any)[field] = value;
        if (field === 'qty' || field === 'unitCost') {
            item.totalCost = (Number(item.qty) || 0) * (Number(item.unitCost) || 0);
        }
        newItems[index] = item;
        handleDataChange('items', newItems);
    };

    const handleSupplierChange = (index: number, field: keyof SupplierBid, value: any) => {
        const newSuppliers = [...projectData.suppliers];
        (newSuppliers[index] as any)[field] = value;
        handleDataChange('suppliers', newSuppliers);
    };
    
    const handleSupplierBidChange = (supplierIndex: number, itemIndex: number, field: 'unitPrice' | 'totalPrice', value: number) => {
        const newSuppliers = JSON.parse(JSON.stringify(projectData.suppliers));
        const supplier = newSuppliers[supplierIndex];
        const item = projectData.items[itemIndex];

        if (supplier.bids[itemIndex]) {
             supplier.bids[itemIndex][field] = value;
             if (field === 'unitPrice') {
                 supplier.bids[itemIndex].totalPrice = (item.qty || 0) * value;
             }
        }

        supplier.totalBid = supplier.bids.reduce((acc: number, curr: {totalPrice: number}) => acc + (curr.totalPrice || 0), 0);
        handleDataChange('suppliers', newSuppliers);
    };

    const handleAiQuote = async (supplierIndex: number) => {
        setQuotingSupplierIndex(supplierIndex);
        setError('');
        try {
            const supplier = projectData.suppliers[supplierIndex];
            const quotes = await generateSupplierQuote(projectData.items, supplier.name);
    
            if (quotes.length !== projectData.items.length) {
                throw new Error(`AI returned an incorrect number of quotes. Expected ${projectData.items.length}, got ${quotes.length}.`);
            }
    
            const newSuppliers = JSON.parse(JSON.stringify(projectData.suppliers));
            const newSupplierData = newSuppliers[supplierIndex];
    
            let totalBid = 0;
            quotes.forEach((quote, itemIndex) => {
                const item = projectData.items[itemIndex];
                const unitPrice = quote.unitPrice || 0;
                const totalPrice = (item.qty || 0) * unitPrice;
                
                if (newSupplierData.bids[itemIndex]) {
                    newSupplierData.bids[itemIndex] = { unitPrice, totalPrice };
                } else {
                    newSupplierData.bids.push({ unitPrice, totalPrice });
                }
                totalBid += totalPrice;
            });
    
            newSupplierData.totalBid = totalBid;
            handleDataChange('suppliers', newSuppliers);
    
        } catch (err: any) {
            console.error("AI Quoting failed:", err);
            setError(`Failed to generate AI quote: ${err.message}`);
        } finally {
            setQuotingSupplierIndex(null);
        }
    };


    const getWinningBidder = useMemo(() => {
        if (projectData.suppliers.length === 0) return null;
        return [...projectData.suppliers].sort((a,b) => a.totalBid - b.totalBid)[0];
    }, [projectData.suppliers]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setFile(file);
            const prMatch = file.name.match(/(\d{4}-\d{2}-\d{4})/);
            if (prMatch && prMatch[1]) {
                handleDataChange('prNo', prMatch[1]);
            } else {
                const basicMatch = file.name.replace(/\.[^/.]+$/, "").replace(/[^0-9-]/g, '');
                if (basicMatch) {
                    handleDataChange('prNo', basicMatch);
                }
            }
            setError('');
        }
    };
    
    const handleAnalyzeDocument = async () => {
        if (!file) {
            setError(`Please select a file to analyze.`);
            return;
        }
        setLoading(true);
        setError('');
        try {
            const extracted = await analyzeDocumentForGenerator(file, 'rfq');
            
            setProjectData(prev => {
                const updated = { ...prev };
                
                if (extracted.prNo) updated.prNo = extracted.prNo;
                if (extracted.projectTitle) updated.projectTitle = extracted.projectTitle;
                if (extracted.endUser) updated.endUser = extracted.endUser;
                if (extracted.abc) {
                    updated.abc = extracted.abc;
                    updated.abcInWords = `${numberToWords(extracted.abc)}`.toUpperCase();
                }
                
                if (extracted.items && extracted.items.length > 0) {
                    updated.items = extracted.items.map((item, index) => ({
                        itemNo: (item as any).itemNo || index + 1,
                        description: item.description,
                        qty: (item as any).qty || 0,
                        uom: (item as any).uom || 'unit',
                        unitCost: (item as any).unitCost || 0,
                        totalCost: (item as any).totalCost || ((item as any).amount || 0),
                        brandName: 'N/A'
                    }));
                     // Reset supplier bids to match new item structure
                    updated.suppliers.forEach(sup => {
                        sup.bids = updated.items.map(() => ({ unitPrice: 0, totalPrice: 0 }));
                        sup.totalBid = 0;
                    });
                }
                return updated;
            });

        } catch (err: any) {
            console.error("Error analyzing document:", err);
            setError(`Failed to analyze the document: ${err.message}. Please ensure it is a valid document and try again.`);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        document.body.classList.add('is-printing');
        const onAfterPrint = () => {
            document.body.classList.remove('is-printing');
            window.removeEventListener('afterprint', onAfterPrint);
        };
        window.addEventListener('afterprint', onAfterPrint, { once: true });
        setTimeout(() => window.print(), 100);
    };
    
    const exportTo = async (type: 'pdf' | 'word' | 'excel') => {
        const input = printableRef.current;
        if (!input) return;

        const isLandscape = activeDoc === 'abstract';

        if (type === 'pdf') {
             if (!window.html2canvas || !window.jspdf) {
                handlePrint();
                return;
            }
            if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
            await new Promise(resolve => setTimeout(resolve, 50));

            try {
                const { jsPDF } = window.jspdf;
                // Folio size: 215.9mm x 330.2mm
                const pdf = new jsPDF({ orientation: isLandscape ? 'l' : 'p', unit: 'mm', format: [330.2, 215.9] });
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
    
                const canvas = await window.html2canvas(input, { 
                    scale: 3, 
                    useCORS: true,
                    onclone: (clonedDoc) => {
                        clonedDoc.querySelectorAll('.pdf-editable').forEach(el => {
                            const inputEl = el as HTMLInputElement | HTMLTextAreaElement;
                            const span = clonedDoc.createElement('span');
                            span.textContent = inputEl.value;
                            
                            span.className = inputEl.className;
                            span.classList.remove('pdf-editable', 'hover:bg-orange-100/50', 'focus:bg-orange-100', 'focus:border-orange-300', 'focus:outline-none', 'focus:ring-1', 'focus:ring-orange-500', 'rounded-sm', 'bg-transparent', 'border-transparent', 'rounded', 'p-0.5', 'p-1', 'resize-none', 'overflow-hidden');
                            
                            span.style.color = 'black';
                            span.style.backgroundColor = 'transparent';
                            span.style.border = 'none';
                            span.style.padding = '1px';
        
                            if (inputEl.tagName === 'TEXTAREA') {
                                span.style.whiteSpace = 'pre-wrap';
                                span.style.display = 'block';
                            } else if (inputEl.classList.contains('w-full')) {
                                span.style.display = 'block';
                            } else {
                                span.style.display = 'inline';
                            }
                            
                            inputEl.parentNode?.replaceChild(span, inputEl);
                        });
                    }
                });
        
                const imgData = canvas.toDataURL('image/png');
                const imgProps = pdf.getImageProperties(imgData);
                const ratio = imgProps.height / imgProps.width;
                const imgHeight = pdfWidth * ratio;

                let currentHeight = 0;
                const pageHeight = pdfHeight;
                let pageCount = Math.ceil(imgHeight / pageHeight);

                for (let i = 0; i < pageCount; i++) {
                    if (i > 0) pdf.addPage();
                    pdf.addImage(imgData, 'PNG', 0, -currentHeight, pdfWidth, imgHeight, undefined, 'FAST');
                    currentHeight += pageHeight;
                }
                
                pdf.save(`BAC_${activeDoc.toUpperCase()}_${projectData.prNo}.pdf`);
            } finally {
                // No cleanup needed
            }
            return;
        }

        if (type === 'excel' && (activeDoc === 'abstract' || activeDoc === 'resolution') ) {
            let csvContent = "data:text/csv;charset=utf-8,";
            csvContent += "SUPPLIER,AMOUNT (in PhP)\n";
            projectData.suppliers.forEach(row => {
                csvContent += `"${row.name.replace(/"/g, '""')}",${row.totalBid}\n`;
            });
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `BAC_${activeDoc.toUpperCase()}_Bids_${projectData.prNo}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            return;
        }
        
        if (type === 'word') {
            const clonedNode = input.cloneNode(true) as HTMLElement;
            clonedNode.style.width = isLandscape ? '13in' : '8.5in'; 
            clonedNode.querySelectorAll('.watermark-container').forEach(el => el.remove());
            clonedNode.querySelectorAll('.text-red-600').forEach(el => { (el as HTMLElement).style.color = 'black'; });
            clonedNode.querySelectorAll('.no-print').forEach(el => el.remove());
            clonedNode.style.fontSize = `${fontSize}pt`;

            // Replace interactive form elements with static text for Word export
            clonedNode.querySelectorAll('textarea').forEach(textarea => {
                const div = document.createElement('div');
                div.style.cssText = textarea.style.cssText;
                div.className = textarea.className;
                div.style.whiteSpace = 'pre-wrap';
                div.style.wordWrap = 'break-word';
                div.style.height = 'auto'; // Let Word handle height
                div.classList.remove('hover:bg-orange-100/50', 'focus:bg-orange-100', 'focus:border-orange-300', 'resize-none', 'overflow-hidden');
                div.innerHTML = textarea.value.replace(/\n/g, '<br />');
                textarea.parentNode?.replaceChild(div, textarea);
            });

            clonedNode.querySelectorAll('input[type="text"], input[type="number"]').forEach(inputEl => {
                const input = inputEl as HTMLInputElement;
                const span = document.createElement('span');
                span.style.cssText = input.style.cssText;
                span.className = input.className;
                span.classList.remove('hover:bg-orange-100/50', 'focus:bg-orange-100', 'focus:ring-1', 'focus:ring-orange-500', 'rounded-sm', 'p-0.5');
                span.innerText = input.value;
                input.parentNode?.replaceChild(span, input);
            });

            const content = clonedNode.innerHTML;

            const pageSize = isLandscape ? '13in 8.5in' : '8.5in 13in';
            const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export HTML to Word</title><style>@page { size: ${pageSize}; margin: 1in; } body{font-family: 'Times New Roman', serif;} .text-justify { text-align: justify; text-justify: inter-word; } .font-bold { font-weight: bold; } .text-center { text-align: center; } .grid { display: block; } .grid-cols-2 { display: block; } table, th, td {border: 1px solid black; border-collapse: collapse; padding: 2px; vertical-align: top;} p, div, span, th, td { font-size: ${fontSize}pt; line-height: 1.5;} </style></head><body>`;
            const footer = "</body></html>";
            const sourceHTML = header + content + footer;
            
            const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
            const fileDownload = document.createElement("a");
            document.body.appendChild(fileDownload);
            fileDownload.href = source;
            fileDownload.download = `BAC_${activeDoc.toUpperCase()}_${projectData.prNo}.doc`;
            fileDownload.click();
            document.body.removeChild(fileDownload);
        }
    };
    
    // Components for each document type
    const ResolutionContent = () => (
        <div className="prose prose-sm max-w-none font-serif leading-snug relative bg-white" style={{ fontFamily: "'Times New Roman', Times, serif", width: '8.5in', minHeight: '13in', padding: '1in', fontSize: `${fontSize}pt` }}>
            <div className="watermark-container" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 0, overflow: 'hidden' }}><img src={bacolodCityLogo} alt="Watermark" style={{ width: '60%', height: 'auto', opacity: 0.08 }} /></div>
            <div className="relative z-10">
                <div className="text-center">
                    <img src={bacolodCityLogo} alt="Bacolod BAC Logo" className="h-20 mx-auto mb-2 header-logo" />
                    <p>Republic of the Philippines<br />BIDS AND AWARDS COMMITTEE<br />Bacolod City</p><br/>
                    <p className="font-bold">BAC RESOLUTION NO. <EditableInline initialValue={projectData.resolutionNo} onSave={v => handleDataChange('resolutionNo', v)} /></p>
                    <p>Series of <EditableInline initialValue={projectData.resolutionSeries} onSave={v => handleDataChange('resolutionSeries', v)} /></p>
                </div>
                <p className="font-bold text-center mt-4">RESOLUTION TO RECOMMEND FOR THE APPROVAL OF THE CITY MAYOR TO UTILIZE <EditableInline initialValue={projectData.procurementMode.toUpperCase()} onSave={v => handleDataChange('procurementMode', v)} /> AS THE MODE OF PROCUREMENT AND TO RECOMMEND THE AWARD OF CONTRACT TO <EditableInline initialValue={(getWinningBidder?.name || '').toUpperCase()} onSave={v => {}} /> AS HAVING THE SINGLE/LOWEST CALCULATED AND RESPONSIVE QUOTATION FOR PURCHASE REQUEST (PR) NO. <EditableInline initialValue={projectData.prNo} onSave={v => handleDataChange('prNo', v)} /> WITH AN APPROVED BUDGET OF CONTRACT (ABC) OF <EditableInline initialValue={projectData.abcInWords.toUpperCase()} onSave={v => handleDataChange('abcInWords', v)} /> (PHP {projectData.abc.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2})}).</p>
                <p className="text-justify mt-4 mb-4"><strong className="font-bold">WHEREAS,</strong> the <EditableInline initialValue={projectData.endUser} onSave={v => handleDataChange('endUser', v)} /> submitted Purchase Request for <EditableTextarea initialValue={projectData.projectTitle} onSave={v => handleDataChange('projectTitle', v)} className="w-full font-bold" /> which is included in the Annual Procurement Plan;</p>
                <p className="text-justify mt-8"><strong className="font-bold">NOW THEREFORE,</strong> we, the members of the Bids & Awards Committee, adopted the following resolution:</p>
                <p className="text-justify mt-4"><strong className="font-bold">RESOLVE AS IT IS HEREBY RESOLVED</strong> to Recommend for the approval of the City Mayor to utilize <EditableInline initialValue={projectData.procurementMode} onSave={v => handleDataChange('procurementMode', v)} /> as the Mode of Procurement and to recommend the award of contract to <EditableInline initialValue={(getWinningBidder?.name || '').toUpperCase()} onSave={v => {}} /> as having the Single/Lowest Calculated and Responsive Quotation for Purchase Request (PR) No. <EditableInline initialValue={projectData.prNo} onSave={v => handleDataChange('prNo', v)} /> with an Approved Budget of Contract (ABC) of <EditableInline initialValue={projectData.abcInWords.toUpperCase()} onSave={v => handleDataChange('abcInWords', v)} /> (PHP {projectData.abc.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2})}).</p>
                <p className="text-justify mt-8">Done this <EditableInline initialValue={projectData.resolutionDate} onSave={v => handleDataChange('resolutionDate', v)} /> in Bacolod City, Philippines.</p>
                <div className="mt-8">
                    <p>Prepared By:</p>
                    <div className="mt-8"><p className="font-bold uppercase"><EditableInline initialValue={projectData.preparedBy} onSave={v => handleDataChange('preparedBy', v)} /></p><p>Head of BAC-Secretariat</p></div>
                </div>
                <div className="mt-8">
                     <div className="text-center mb-8"><p className="font-bold uppercase"><EditableInline initialValue={projectData.chairperson} onSave={v => handleDataChange('chairperson', v)} /></p><p>Chairperson</p></div>
                    <div className="grid grid-cols-2 gap-x-16">
                        <div className="text-center"><p className="font-bold uppercase"><EditableInline initialValue={projectData.viceChairperson} onSave={v => handleDataChange('viceChairperson', v)} /></p><p>Vice-Chairperson</p></div>
                        {projectData.members.map((member, i) => <div className="text-center mt-8" key={i}><p className="font-bold uppercase"><EditableInline initialValue={member} onSave={v => { const m = [...projectData.members]; m[i] = v; handleDataChange('members', m);}} /></p><p>Member</p></div>)}
                    </div>
                </div>
                <div className="border-t border-black mt-8 pt-2">
                    <div className="flex justify-around items-center"><input type="checkbox" id="approved-check" checked={projectData.isApproved} onChange={e => handleDataChange('isApproved', e.target.checked)} /><label htmlFor="approved-check" className="ml-2 font-bold">APPROVED</label><input type="checkbox" id="disapproved-check" checked={!projectData.isApproved} onChange={e => handleDataChange('isApproved', !e.target.checked)} /><label htmlFor="disapproved-check" className="ml-2 font-bold">DISAPPROVED</label></div>
                     <div className="text-center mt-8"><p className="font-bold uppercase"><EditableInline initialValue={projectData.cityMayor} onSave={v => handleDataChange('cityMayor', v)} /></p><p>City Mayor</p></div>
                </div>
            </div>
        </div>
    );
    
    const RfqContent = () => (
        <div className="font-serif bg-white" style={{ fontFamily: "'Times New Roman', Times, serif", fontSize: `${fontSize}pt` }}>
            {/* Page 1 */}
            <div className="prose prose-sm max-w-none leading-snug relative" style={{ width: '8.5in', minHeight: '13in', padding: '1in' }}>
                 <div className="watermark-container" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 0, overflow: 'hidden' }}><img src={bacolodCityLogo} alt="Watermark" style={{ width: '60%', height: 'auto', opacity: 0.08 }} /></div>
                 <div className="relative z-10">
                    <div className="text-center mb-4">
                        <img src={bacolodCityLogo} alt="Bacolod BAC Logo" className="h-20 mx-auto mb-2 header-logo" />
                        <p>Republic of the Philippines<br />BIDS AND AWARDS COMMITTEE<br />Bacolod City</p>
                        <p className="font-bold mt-4">REQUEST FOR QUOTATION</p>
                    </div>
                    <div className="border-2 border-black p-2">
                        <p>The City Government of Bacolod, through its Bids and Awards Committee (BAC), will undertake <EditableInline initialValue={projectData.procurementMode} onSave={v => handleDataChange('procurementMode', v)} /> in accordance with the Implementing Rules and Regulations of R.A. 12009 for the purchase of the specified goods/services below:</p>
                    </div>
                    <table className="w-full border-collapse border border-black mt-2">
                        <tbody>
                            <tr><td className="border border-black p-1 w-1/3">Purchase Request No.:</td><td className="border border-black p-1 font-bold"><EditableInline initialValue={projectData.prNo} onSave={v => handleDataChange('prNo', v)} /></td></tr>
                            <tr><td className="border border-black p-1">Name of Project:</td><td className="border border-black p-1 font-bold"><EditableTextarea initialValue={projectData.projectTitle} onSave={v => handleDataChange('projectTitle', v)} /></td></tr>
                            <tr><td className="border border-black p-1">Implementing Office/End User:</td><td className="border border-black p-1 font-bold"><EditableInline initialValue={projectData.endUser} onSave={v => handleDataChange('endUser', v)} /></td></tr>
                            <tr><td className="border border-black p-1">Approved Budget for the Contract:</td><td className="border border-black p-1 font-bold">P <EditableInline initialValue={projectData.abc.toLocaleString()} onSave={v => handleDataChange('abc', parseFloat(v.replace(/,/g, '')))} /></td></tr>
                        </tbody>
                    </table>
                    <p className="mt-2">Please quote your best offer for the goods/services prescribed herein, subject to the Terms and Conditions provided at the last page of Request for Quotation.</p>
                    <table className="w-full border-collapse border border-black mt-2">
                        <thead>
                            <tr className="font-bold text-center"><td rowSpan={2} className="border border-black p-1">Item No.</td><td rowSpan={2} className="border border-black p-1">Item Description</td><td colSpan={3} className="border border-black p-1">APPROVED BUDGET</td><td colSpan={2} className="border border-black p-1">PRICE OFFER</td></tr>
                            <tr className="font-bold text-center"><td className="border border-black p-1">QTY</td><td className="border border-black p-1">UOM</td><td className="border border-black p-1">UNIT COST</td><td className="border border-black p-1">UNIT COST</td><td className="border border-black p-1">TOTAL COST</td></tr>
                        </thead>
                        <tbody>
                            {projectData.items.map((item, index) => (
                                <tr key={index}>
                                    <td className="border border-black p-0 text-center"><EditableCell value={item.itemNo} onSave={v => handleItemChange(index, 'itemNo', parseInt(v))}/></td>
                                    <td className="border border-black p-0"><EditableCell value={item.description} onSave={v => handleItemChange(index, 'description', v)}/></td>
                                    <td className="border border-black p-0 text-center"><EditableCell value={item.qty} onSave={v => handleItemChange(index, 'qty', parseInt(v))}/></td>
                                    <td className="border border-black p-0 text-center"><EditableCell value={item.uom} onSave={v => handleItemChange(index, 'uom', v)}/></td>
                                    <td className="border border-black p-0 text-right"><EditableCell value={item.unitCost.toFixed(2)} onSave={v => handleItemChange(index, 'unitCost', parseFloat(v))}/></td>
                                    <td className="border border-black p-1"></td>
                                    <td className="border border-black p-1"></td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot><tr><td colSpan={4} className="border border-black p-1 font-bold text-right">TOTAL</td><td className="border border-black p-1 font-bold text-right">{projectData.abc.toFixed(2)}</td><td></td><td></td></tr></tfoot>
                    </table>
                 </div>
            </div>
             {/* Page 2 */}
            <div className="prose prose-sm max-w-none leading-snug relative" style={{ width: '8.5in', minHeight: '13in', padding: '1in', breakBefore: 'page' }}>
                 <h4 className="text-center font-bold">TERMS AND CONDITIONS</h4>
                 <ol className="list-decimal list-inside text-sm space-y-2">
                    <li>Only duly authorized representative/s are allowed to submit the Request for Quotations, failure to do so would result to rejection of quotations.</li>
                    <li>Items in this project shall be grouped as one lot and awarded the same as one contract. Bids or quotations exceeding the Approved Budget for the Contract shall be automatically rejected.</li>
                    <li>Interested Suppliers shall provide correct and accurate information required in this form.</li>
                    <li>Interested suppliers are required to indicate the BRAND of each item being offered. Failure to indicate the Brand shall be a ground for disqualification.</li>
                    <li>Price quotation/s must be valid for a period of thirty (30) calendar days from the date of submission of quotation.</li>
                    <li>Quotations exceeding the Approved Budget for the Contract shall be rejected.</li>
                    <li>Award of contract shall be made to the lowest calculated and responsive quotation which complies with the minimum technical specifications and other terms and conditions stated.</li>
                    <li>Should this quotation be awarded, the item/s shall be delivered according to the requirements specified in the detailed description or Technical Specifications, if available.</li>
                    <li>Payment shall be processed after delivery and upon the submission of the required supporting documents, in accordance with existing government accounting rules and regulations.</li>
                    <li>Liquidated damages equivalent to one tenth of one percent (0.1%) of the value of the goods not delivered within the prescribed delivery period shall be imposed per day of delay. The Head of the Procuring Entity may rescind the contract once the cumulative amount of liquidated damages reaches ten percent (10%) of the amount of the contract, without prejudice to other courses of action and remedies open to it.</li>
                 </ol>
            </div>
        </div>
    );
    
    const AbstractContent = () => (
        <div className="prose prose-sm max-w-none font-serif leading-snug relative bg-white" style={{ fontFamily: "'Times New Roman', Times, serif", width: '13in', minHeight: '8.5in', padding: '0.5in', fontSize: `${fontSize}pt` }}>
             <div className="watermark-container" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 0, overflow: 'hidden' }}><img src={bacolodCityLogo} alt="Watermark" style={{ width: '40%', height: 'auto', opacity: 0.08 }} /></div>
             <div className="relative z-10">
                <div className="text-center">
                    <p>Republic of the Philippines<br/>City of Bacolod</p>
                    <p className="font-bold mt-2 text-xl">ABSTRACT OF BIDS/CANVASS</p>
                </div>
                <table className="w-full mt-4 text-xs">
                    <tbody>
                        <tr>
                            <td className="w-1/2 pr-4">
                                <table className="w-full border-collapse border border-black">
                                    <tr><td className="p-1 border border-black w-1/4">Location:</td><td className="p-1 border border-black"><EditableInline initialValue={projectData.location} onSave={v => handleDataChange('location', v)} /></td></tr>
                                    <tr><td className="p-1 border border-black">ABC (P):</td><td className="p-1 border border-black"><EditableInline initialValue={projectData.abc.toLocaleString()} onSave={v => handleDataChange('abc', parseFloat(v.replace(/,/g, '')))} /></td></tr>
                                </table>
                            </td>
                             <td className="w-1/2 pl-4">
                                <table className="w-full border-collapse border border-black">
                                     <tr><td className="p-1 border border-black w-1/4" colSpan={2}></td></tr>
                                     <tr><td className="p-1 border border-black" colSpan={2}></td></tr>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <table className="w-full border-collapse border border-black mt-2 text-xs">
                    <thead>
                        <tr>
                            <th className="border-t-0 border-l-0 border-b border-black"></th>
                             {projectData.suppliers.map((sup, supIdx) => <th key={supIdx} className="border border-black p-1 align-top"><EditableInline initialValue={sup.name} onSave={v => handleSupplierChange(supIdx, 'name', v)} /></th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {projectData.items.map((item, itemIdx) => (
                            <tr key={itemIdx}>
                                 <td className="border-t-0 border-l-0 border-b-0 border-r border-black p-1 text-right"></td>
                                {projectData.suppliers.map((sup, supIdx) => (
                                    <td key={supIdx} className="border border-black p-0 text-right"><EditableCell value={(sup.bids[itemIdx]?.totalPrice || 0).toFixed(2)} onSave={v => handleSupplierBidChange(supIdx, itemIdx, 'totalPrice', parseFloat(v))} className="text-right" /></td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td className="border-t border-b-0 border-l-0 border-r border-black p-1 font-bold text-right"></td>
                            {projectData.suppliers.map((sup, supIdx) => <td key={supIdx} className="border border-black p-1 font-bold text-right">{(sup.totalBid || 0).toFixed(2)}</td>)}
                        </tr>
                    </tfoot>
                </table>
                 <div className="mt-12 text-center text-xs" style={{ pageBreakInside: 'avoid' }}>
                    <p className="font-bold">BAC COMMITTEE</p>
                    
                    <div className="flex justify-center" style={{marginTop: '6rem'}}>
                        <div className="text-center">
                            <p className="font-bold uppercase border-t border-black px-12 pt-1 inline-block">
                                <EditableInline initialValue={projectData.chairperson} onSave={v => handleDataChange('chairperson', v)} />
                            </p>
                            <p>Chairperson</p>
                        </div>
                    </div>
                    
                    <div className="flex justify-between" style={{marginTop: '6rem'}}>
                        <div className="text-center">
                            <p className="font-bold uppercase border-t border-black px-12 pt-1 inline-block">
                                <EditableInline 
                                    initialValue={projectData.members[1]} // ENGR. AMY TENTI
                                    onSave={v => { 
                                        const m = [...projectData.members];
                                        m[1] = v;
                                        handleDataChange('members', m);
                                    }} />
                            </p>
                            <p>Member</p>
                        </div>
                        <div className="text-center">
                            <p className="font-bold uppercase border-t border-black px-12 pt-1 inline-block">
                                <EditableInline 
                                    initialValue={projectData.members[2]} // ENGR. JOSEPH M. DATO-ON
                                    onSave={v => { 
                                        const m = [...projectData.members];
                                        m[2] = v;
                                        handleDataChange('members', m);
                                    }} />
                            </p>
                            <p>Member</p>
                        </div>
                    </div>
                </div>
             </div>
        </div>
    );
    
    const PoContent = () => {
        const winningBidder = getWinningBidder;
        if (!winningBidder) return <div className="p-8 text-center text-red-600">No winning bidder found. Please ensure there is at least one supplier with a valid bid.</div>;
        const totalAmount = winningBidder.totalBid;

        return (
            <div className="prose prose-sm max-w-none font-serif leading-snug relative bg-white" style={{ fontFamily: "'Times New Roman', Times, serif", width: '8.5in', minHeight: '13in', padding: '0.75in', fontSize: `${fontSize}pt` }}>
                 <div className="text-center">
                    <img src={bacolodCityLogo} alt="Bacolod BAC Logo" className="h-20 mx-auto mb-2 header-logo" />
                    <p>Republic of the Philippines<br/>City of Bacolod</p>
                    <p className="font-bold mt-2 text-2xl">PURCHASE ORDER</p>
                </div>
                <table className="w-full mt-2">
                    <tr>
                        <td className="w-2/3 pr-2 align-top">
                            <table className="w-full border-collapse border border-black">
                                <tr><td className="p-1 border border-black w-1/4">Supplier:</td><td className="p-1 border border-black font-bold"><EditableInline initialValue={winningBidder.name} onSave={v => handleSupplierChange(0, 'name', v)} /></td></tr>
                                <tr><td className="p-1 border border-black">Address:</td><td className="p-1 border border-black"><EditableInline initialValue={winningBidder.address} onSave={v => handleSupplierChange(0, 'address', v)} /></td></tr>
                                <tr><td className="p-1 border border-black">TIN:</td><td className="p-1 border border-black"><EditableInline initialValue={winningBidder.tin || ''} onSave={v => handleSupplierChange(0, 'tin', v)} /></td></tr>
                            </table>
                        </td>
                        <td className="w-1/3 pl-2 align-top">
                             <table className="w-full border-collapse border border-black">
                                <tr><td className="p-1 border border-black w-1/3">P.O. No.:</td><td className="p-1 border border-black font-bold"><EditableInline initialValue={projectData.poNo} onSave={v => handleDataChange('poNo', v)} /></td></tr>
                                <tr><td className="p-1 border border-black">Date:</td><td className="p-1 border border-black"><EditableInline initialValue={projectData.poDate} onSave={v => handleDataChange('poDate', v)} /></td></tr>
                                <tr><td className="p-1 border border-black">Mode of Procurement:</td><td className="p-1 border border-black"><EditableInline initialValue={projectData.procurementMode} onSave={v => handleDataChange('procurementMode', v)} /></td></tr>
                            </table>
                        </td>
                    </tr>
                </table>
                <p className="mt-1">Gentlemen: Please furnish this office the following articles subject to the terms and conditions contained herein:</p>
                <table className="w-full mt-1">
                    <tr>
                        <td className="w-1/2 pr-2"><table className="w-full border-collapse border border-black"><tr><td className="p-1 border border-black w-1/3">Place of Delivery:</td><td className="p-1 border border-black"><EditableInline initialValue={projectData.location} onSave={v => handleDataChange('location', v)} /></td></tr></table></td>
                        <td className="w-1/2 pl-2"><table className="w-full border-collapse border border-black"><tr><td className="p-1 border border-black w-1/3">Delivery Term:</td><td className="p-1 border border-black"><EditableInline initialValue={projectData.deliveryTerm} onSave={v => handleDataChange('deliveryTerm', v)} /></td></tr></table></td>
                    </tr>
                     <tr>
                        <td className="pr-2 pt-1"><table className="w-full border-collapse border border-black"><tr><td className="p-1 border border-black w-1/3">Date of Delivery:</td><td className="p-1 border border-black"></td></tr></table></td>
                        <td className="pl-2 pt-1"><table className="w-full border-collapse border border-black"><tr><td className="p-1 border border-black w-1/3">Payment Term:</td><td className="p-1 border border-black"><EditableInline initialValue={projectData.paymentTerm} onSave={v => handleDataChange('paymentTerm', v)} /></td></tr></table></td>
                    </tr>
                </table>
                <table className="w-full border-collapse border border-black mt-2 text-xs">
                    <thead><tr><th className="p-1 border border-black">Item No.</th><th className="p-1 border border-black">Unit</th><th className="p-1 border border-black w-1/2">Description of Articles</th><th className="p-1 border border-black">Quantity</th><th className="p-1 border border-black">Unit Cost</th><th className="p-1 border border-black">Amount</th></tr></thead>
                    <tbody>
                        {projectData.items.map((item, index) => (
                            <tr key={index}>
                                <td className="p-1 border border-black text-center">{item.itemNo}</td>
                                <td className="p-1 border border-black text-center">{item.uom}</td>
                                <td className="p-1 border border-black">{item.description} ({item.brandName})</td>
                                <td className="p-1 border border-black text-center">{item.qty}</td>
                                <td className="p-1 border border-black text-right">{(winningBidder.bids[index]?.unitPrice || 0).toFixed(2)}</td>
                                <td className="p-1 border border-black text-right">{(winningBidder.bids[index]?.totalPrice || 0).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr><td colSpan={5} className="p-1 border border-black text-right font-bold">TOTAL</td><td className="p-1 border border-black text-right font-bold">{totalAmount.toFixed(2)}</td></tr>
                    </tfoot>
                </table>
                <p className="mt-1">(Total Amount in Words): <EditableInline initialValue={numberToWords(totalAmount).toUpperCase()} onSave={() => {}} className="font-bold" /></p>
                <p className="mt-2 text-justify">In case of failure to make the full delivery within the time specified above, a penalty of one-tenth (1/10) of one percent for every day of delay shall be imposed on the undelivered item/s.</p>
                <div className="flex justify-between mt-4">
                    <p className="font-bold">Conforme:</p>
                    <p className="font-bold">Very truly yours,</p>
                </div>
                <div className="flex justify-between mt-12 items-end">
                    <div>
                        <p className="border-t border-black px-12 pt-1 font-bold text-center"><EditableInline initialValue={winningBidder.name} onSave={() => {}} /></p>
                        <p className="text-center">Signature over Printed Name of Supplier</p>
                    </div>
                     <div>
                        <p className="border-t border-black px-12 pt-1 font-bold text-center"><EditableInline initialValue={projectData.cityMayor} onSave={v => handleDataChange('cityMayor', v)} /></p>
                        <p className="text-center">City Mayor</p>
                    </div>
                </div>
                 <div className="flex mt-8">
                    <div className="w-1/2 pr-2 text-center">
                        <p>Funds Available:</p>
                        <p className="font-bold uppercase mt-8 border-t border-black pt-1 mx-4">JOSE MARIA T. GECOSALA</p>
                        <p>Acting City Treasurer</p>
                    </div>
                    <div className="w-1/2 pl-2 text-center">
                        <p>OR/BURS No.:</p>
                        <p className="font-bold uppercase mt-8 border-t border-black pt-1 mx-4">&nbsp;</p>
                         <p>Date:</p>
                    </div>
                 </div>
            </div>
        );
    };

    const NoaContent = () => {
        const winningBidder = getWinningBidder;
        if (!winningBidder) return <div className="p-8 text-center text-red-600">No winning bidder found. Please ensure there is at least one supplier with a valid bid.</div>;
        const totalAmount = winningBidder.totalBid;

        return(
            <div className="prose prose-sm max-w-none font-serif leading-snug relative bg-white" style={{ fontFamily: "'Times New Roman', Times, serif", width: '8.5in', minHeight: '13in', padding: '1in', fontSize: `${fontSize}pt` }}>
                 <div className="watermark-container" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 0, overflow: 'hidden' }}><img src={bacolodCityLogo} alt="Watermark" style={{ width: '60%', height: 'auto', opacity: 0.08 }} /></div>
                 <div className="relative z-10">
                    <div className="text-center">
                        <img src={bacolodCityLogo} alt="Bacolod BAC Logo" className="h-20 mx-auto mb-2 header-logo" />
                        <p>Republic of the Philippines<br/>City of Bacolod</p>
                        <p className="font-bold mt-4">NOTICE OF AWARD</p>
                    </div>
                    <p className="mt-8"><EditableInline initialValue={projectData.noaDate || ''} onSave={v => handleDataChange('noaDate', v)} /></p>
                    <div className="mt-4">
                        <p className="font-bold"><EditableInline initialValue={winningBidder.name} onSave={v => handleSupplierChange(0, 'name', v)} /></p>
                        <p><EditableInline initialValue={winningBidder.address} onSave={v => handleSupplierChange(0, 'address', v)} /></p>
                    </div>
                    <p className="mt-4">Dear Sir/Madame:</p>
                    <p className="mt-4 text-justify indent-8">We are happy to notify you that your Bid for the project: <strong className="font-bold"><EditableTextarea initialValue={projectData.projectTitle} onSave={v => handleDataChange('projectTitle', v)} /></strong>, is hereby awarded to you as the Bidder with the Lowest Calculated and Responsive Bid at a Contract Price equivalent to <strong className="font-bold">{numberToWords(totalAmount).toUpperCase()} (P {totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2})})</strong>.</p>
                    <p className="mt-4 text-justify indent-8">You are therefore required, within ten (10) days from the receipt of this Notice of Award, to formally enter into contract with us, and to submit the Performance Security in the form and the amount stipulated in the Instructions to Bidders. Failure to enter into the said contract or provide the Performance Security shall constitute a sufficient ground for cancellation of this award and forfeiture of your Bid Security.</p>
                    <p className="mt-8">Very truly yours,</p>
                    <div className="mt-12">
                        <p className="font-bold uppercase"><EditableInline initialValue={projectData.cityMayor} onSave={v => handleDataChange('cityMayor', v)} /></p>
                        <p>City Mayor</p>
                    </div>
                     <div className="mt-12">
                        <p>Conforme:</p>
                        <p className="mt-8 font-bold border-b border-black"><EditableInline initialValue={winningBidder.name} onSave={() => {}} /></p>
                        <p>(Name of Representative of the Bidder)</p>
                        <p className="mt-4">Date: ________________</p>
                    </div>
                 </div>
            </div>
        )
    };

    return (
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <svg className="w-8 h-8 mr-3 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
                Document Generator
            </h2>
            <p className="text-gray-600 mb-6">
                Upload a source document (like an RFQ) to auto-populate data, or fill in the details manually. Then, generate, edit, and export various procurement documents.
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-6 p-4 border border-dashed rounded-lg">
                <div>
                    <label htmlFor="doc-gen-upload" className="block text-sm font-medium text-gray-700 mb-2">1. Upload Source Document (Optional)</label>
                    <div className="flex gap-2">
                        <input type="file" id="doc-gen-upload" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100" />
                        <button onClick={handleAnalyzeDocument} disabled={!file || loading} className="btn bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-400">Analyze</button>
                    </div>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">2. Export Document</label>
                     <div className="flex flex-wrap gap-2">
                         <button onClick={() => exportTo('word')} className="btn text-sm bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-3 rounded-md">Export Word</button>
                         <button onClick={() => exportTo('pdf')} className="btn text-sm bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-3 rounded-md">Export PDF</button>
                         <button onClick={handlePrint} className="btn text-sm bg-gray-600 hover:bg-gray-700 text-white font-semibold py-1 px-3 rounded-md">Print</button>
                     </div>
                </div>
            </div>

             <div className="flex justify-center border-b border-gray-200 mb-4">
                {(['resolution', 'rfq', 'abstract', 'po', 'noa'] as DocumentType[]).map(doc => (
                    <button
                        key={doc}
                        onClick={() => setActiveDoc(doc)}
                        className={`px-4 py-2 text-sm font-semibold transition-colors capitalize ${activeDoc === doc ? 'border-b-2 border-orange-500 text-orange-600' : 'text-gray-500 hover:text-orange-600'}`}
                    >
                        {doc}
                    </button>
                ))}
            </div>

            {loading && <Loader text="AI is analyzing your document..." />}
            {error && <p className="text-center text-red-500 my-4">{error}</p>}
            
             <div className="p-4 bg-gray-200 overflow-x-auto flex justify-center">
                <div ref={printableRef} id="printable-doc-generator">
                    {activeDoc === 'resolution' && <ResolutionContent />}
                    {activeDoc === 'rfq' && <RfqContent />}
                    {activeDoc === 'abstract' && <AbstractContent />}
                    {activeDoc === 'po' && <PoContent />}
                    {activeDoc === 'noa' && <NoaContent />}
                </div>
            </div>
        </div>
    );
};

export default DocumentGeneratorTab;
