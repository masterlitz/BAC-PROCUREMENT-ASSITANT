
import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { marketData as initialMarketData, marketCategories as initialMarketCategories } from '../../data/marketData';
import { MarketItem, CatalogItem, VariantMarketItem } from '../../types';
import { generatePurchasePurpose, getSignatoryInfo, generateImageForItem } from '../../services/geminiService';
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

// Augment the jsPDF instance type with the autoTable method from the plugin
// The plugin is loaded via CDN in index.html
interface jsPDFWithAutoTable extends InstanceType<typeof window.jspdf.jsPDF> {
  autoTable: {
    (options: any): jsPDFWithAutoTable;
    previous?: { finalY: number };
  };
}

const PLACEHOLDER_IMAGE = 'https://i.ibb.co/x7P39M6/placeholder-thumbnail.png';
const LOCAL_STORAGE_KEY = 'generatedCatalogImages';

interface CatalogTabProps {
    isVisible: boolean;
    onClose: () => void;
    isShared?: boolean;
}

const EditableField: React.FC<{ value: string, onSave: (value: string) => void, className?: string, isTextarea?: boolean }> = ({ value, onSave, className, isTextarea = false }) => {
    const [currentValue, setCurrentValue] = useState(value);
    useEffect(() => { setCurrentValue(value); }, [value]);

    const commonProps = {
        value: currentValue,
        onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setCurrentValue(e.target.value),
        onBlur: () => onSave(currentValue),
        className: `w-full bg-transparent focus:bg-orange-50 focus:outline-none focus:ring-1 focus:ring-orange-300 rounded-sm p-0.5 no-print-input ${className}`
    };

    if (isTextarea) {
        return <textarea {...commonProps} rows={3} />;
    }
    return <input type="text" {...commonProps} />;
};

const AddItemModal: React.FC<{ categories: string[]; onClose: () => void; }> = ({ categories, onClose }) => {
    const initialFormState = {
        itemName: '',
        category: categories[0] || '',
        isNewCategory: false,
        newCategoryName: '',
        uom: '',
        description: '',
        techSpecs: '',
        uacsCode: '',
        requestingUser: '',
        requestingDept: '',
        justification: '',
        quotes: [{ supplier: '', price: '', link: '' }],
    };
    const [formData, setFormData] = useState(initialFormState);
    const [isPreview, setIsPreview] = useState(false);
    const [formError, setFormError] = useState('');
    const printableRef = useRef<HTMLDivElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (value === '--new--') {
            setFormData(prev => ({ ...prev, isNewCategory: true, category: '' }));
        } else {
            setFormData(prev => ({ ...prev, isNewCategory: false, category: value, newCategoryName: '' }));
        }
    };

    const handleQuoteChange = (index: number, field: 'supplier' | 'price' | 'link', value: string) => {
        const newQuotes = [...formData.quotes];
        newQuotes[index][field] = value;
        setFormData(prev => ({ ...prev, quotes: newQuotes }));
    };

    const addQuote = () => {
        if (formData.quotes.length < 3) {
            setFormData(prev => ({ ...prev, quotes: [...prev.quotes, { supplier: '', price: '', link: '' }] }));
        }
    };

    const removeQuote = (index: number) => {
        if (formData.quotes.length > 1) {
            setFormData(prev => ({ ...prev, quotes: prev.quotes.filter((_, i) => i !== index) }));
        }
    };

    const handleGeneratePreview = (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');
        const finalCategory = formData.isNewCategory ? formData.newCategoryName.trim() : formData.category;
        if (!formData.itemName.trim() || !finalCategory || !formData.uom.trim() || !formData.requestingUser.trim() || !formData.requestingDept.trim() || !formData.justification.trim()) {
            setFormError('Please fill all required fields (*).');
            return;
        }
        if (formData.quotes.some(q => !q.supplier.trim() || !q.price.trim())) {
            setFormError('Please complete all fields for at least one market scoping quote.');
            return;
        }
        setIsPreview(true);
    };

    const handleExportPdf = async () => {
        const input = printableRef.current;
        if (!input || !window.html2canvas || !window.jspdf) {
            alert('PDF generation library not found.');
            return;
        }

        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({ orientation: 'p', unit: 'in', format: 'a4' });
        
        const canvas = await window.html2canvas(input, { scale: 2, useCORS: true });
        const imgData = canvas.toDataURL('image/png');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`Request_for_Item_Inclusion_${formData.itemName.replace(/ /g, '_')}.pdf`);
    };

    const handlePrint = () => { document.body.classList.add('is-printing'); const onAfterPrint = () => { document.body.classList.remove('is-printing'); window.removeEventListener('afterprint', onAfterPrint); }; window.addEventListener('afterprint', onAfterPrint, { once: true }); setTimeout(() => window.print(), 100); };
    
    return (
        <div className="fixed inset-0 bg-black/60 z-[51] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl flex flex-col h-[95vh]" onClick={e => e.stopPropagation()}>
                <header className="p-3 bg-gray-100 border-b flex justify-between items-center flex-shrink-0">
                    <h3 className="text-lg font-bold text-gray-800">Request for New Catalog Item</h3>
                    <div className="flex items-center gap-2">
                        {isPreview && (
                            <>
                                <button onClick={() => setIsPreview(false)} className="btn text-sm bg-gray-500 hover:bg-gray-600 text-white font-semibold py-1.5 px-3 rounded-md">Back to Edit</button>
                                <button onClick={handlePrint} className="btn text-sm bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1.5 px-3 rounded-md">Print</button>
                                <button onClick={handleExportPdf} className="btn text-sm bg-red-600 hover:bg-red-700 text-white font-semibold py-1.5 px-3 rounded-md">Export PDF</button>
                            </>
                        )}
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-900 text-2xl">&times;</button>
                    </div>
                </header>
                {isPreview ? (
                     <main className="flex-grow overflow-y-auto p-4 bg-gray-200">
                        <div ref={printableRef} id="printable-item-request" className="printable-content bg-white p-8 mx-auto relative overflow-hidden" style={{ width: '8.5in', minHeight: '11in', fontFamily: "'Times New Roman', Times, serif", fontSize: '12pt' }}>
                             {/* Watermark Layer */}
                            <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none select-none">
                                <div className="text-center text-gray-200 font-black transform -rotate-45 opacity-50">
                                    <p className="text-[6rem] leading-none whitespace-nowrap">Bacolod City BAC</p>
                                    <p className="text-[2rem] leading-none tracking-widest whitespace-nowrap">OFFICIAL USE ONLY</p>
                                    <p className="text-[1.5rem] leading-none mt-2 whitespace-nowrap">PA V3.1</p>
                                </div>
                            </div>
                            
                            {/* Content Layer */}
                            <div className="relative z-10">
                                <div className="text-center mb-6">
                                    <img src={bacolodCityLogo} alt="Bacolod Logo" className="h-20 mx-auto mb-2" />
                                    <p className="text-sm">Republic of the Philippines</p><p className="font-bold">CITY OF BACOLOD</p><p className="font-bold">Bids and Awards Committee</p>
                                    <h4 className="font-bold text-xl mt-4 underline">REQUEST FOR ITEM INCLUSION IN PROCUREMENT CATALOG</h4>
                                </div>
                                <table className="w-full text-sm mb-4"><tbody><tr><td><strong>Date of Request:</strong></td><td className="text-right">{new Date().toLocaleDateString()}</td></tr><tr><td><strong>Requesting Department:</strong></td><td className="text-right">{formData.requestingDept}</td></tr></tbody></table>
                                <div className="border-2 border-black p-2"><h5 className="font-bold text-center mb-2">PROPOSED ITEM DETAILS</h5>
                                    <table className="w-full text-sm"><tbody>
                                        <tr className="border-b"><td className="font-semibold p-1 w-1/4">Item Name:</td><td className="p-1">{formData.itemName}</td></tr>
                                        <tr className="border-b"><td className="font-semibold p-1">Category:</td><td className="p-1">{formData.isNewCategory ? formData.newCategoryName : formData.category}</td></tr>
                                        <tr className="border-b"><td className="font-semibold p-1">Unit of Measure:</td><td className="p-1">{formData.uom}</td></tr>
                                        <tr className="border-b"><td className="font-semibold p-1">UACS Code:</td><td className="p-1">{formData.uacsCode || 'N/A'}</td></tr>
                                        <tr className="border-b"><td className="font-semibold p-1 align-top">Description:</td><td className="p-1">{formData.description || 'N/A'}</td></tr>
                                        <tr><td className="font-semibold p-1 align-top">Technical Specifications:</td><td className="p-1 whitespace-pre-wrap">{formData.techSpecs || 'N/A'}</td></tr>
                                    </tbody></table>
                                </div>
                                <div className="border-2 border-black p-2 mt-4"><h5 className="font-bold text-center mb-2">MARKET SCOPING / PRICE JUSTIFICATION</h5>
                                    <table className="w-full text-sm"><thead><tr className="border-b-2 border-black"><th className="p-1 text-left">Supplier</th><th className="p-1 text-right">Price (PHP)</th><th className="p-1 text-left">Source / Link</th></tr></thead>
                                        <tbody>{formData.quotes.map((q, i) => <tr key={i} className="border-b"><td className="p-1">{q.supplier}</td><td className="p-1 text-right">{parseFloat(q.price).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td><td className="p-1 truncate">{q.link}</td></tr>)}</tbody>
                                    </table>
                                </div>
                                <div className="border-2 border-black p-2 mt-4"><h5 className="font-bold text-center mb-2">JUSTIFICATION FOR INCLUSION</h5><p className="text-sm p-1">{formData.justification}</p></div>
                                <div className="mt-20 text-sm flex justify-around items-end">
                                    <div className="text-center"><p className="font-bold uppercase pb-1 border-b-2 border-black px-8">{formData.requestingUser}</p><p>Requested by (End-User)</p></div>
                                    <div className="text-center"><p className="font-bold uppercase pb-1 border-b-2 border-black px-8">&nbsp;</p><p>Approved by (Head of Office)</p></div>
                                </div>
                            </div>
                        </div>
                    </main>
                ) : (
                    <form onSubmit={handleGeneratePreview} className="flex-grow p-6 overflow-y-auto space-y-4">
                        {formError && <p className="text-red-600 bg-red-50 p-3 rounded-md text-sm">{formError}</p>}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label className="text-sm font-semibold text-gray-600">Requesting Department*</label><input type="text" name="requestingDept" value={formData.requestingDept} onChange={handleChange} className="w-full p-2 border rounded-md" required /></div>
                            <div><label className="text-sm font-semibold text-gray-600">Requested by (Full Name)*</label><input type="text" name="requestingUser" value={formData.requestingUser} onChange={handleChange} className="w-full p-2 border rounded-md" required /></div>
                        </div>
                         <div className="border-t pt-4"><label className="text-sm font-semibold text-gray-600">Item Name*</label><input type="text" name="itemName" value={formData.itemName} onChange={handleChange} className="w-full p-2 border rounded-md" required /></div>
                        <div><label className="text-sm font-semibold text-gray-600">Description</label><textarea name="description" value={formData.description} onChange={handleChange} className="w-full p-2 border rounded-md" rows={2}></textarea></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label className="text-sm font-semibold text-gray-600">Category*</label><select value={formData.isNewCategory ? '--new--' : formData.category} onChange={handleCategoryChange} className="w-full p-2 border rounded-md" required={!formData.isNewCategory}>{categories.map(c => <option key={c} value={c}>{c}</option>)}<option value="--new--">--- Add New Category ---</option></select></div>
                            {formData.isNewCategory && <div><label className="text-sm font-semibold text-gray-600">New Category Name*</label><input type="text" value={formData.newCategoryName} onChange={e => setFormData(p=>({...p, newCategoryName: e.target.value}))} className="w-full p-2 border rounded-md" required /></div>}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div><label className="text-sm font-semibold text-gray-600">Unit of Measure*</label><input type="text" name="uom" value={formData.uom} onChange={handleChange} className="w-full p-2 border rounded-md" required /></div>
                            <div><label className="text-sm font-semibold text-gray-600">UACS Code</label><input type="text" name="uacsCode" value={formData.uacsCode} onChange={handleChange} className="w-full p-2 border rounded-md" /></div>
                        </div>
                        <div><label className="text-sm font-semibold text-gray-600">Technical Specifications</label><textarea name="techSpecs" value={formData.techSpecs} onChange={handleChange} className="w-full p-2 border rounded-md font-mono text-xs" rows={4}></textarea></div>
                        <div className="border-t pt-4">
                            <h4 className="text-base font-bold text-gray-700 mb-2">Market Scoping / Price Justification*</h4>
                            {formData.quotes.map((quote, index) => (
                                <div key={index} className="grid grid-cols-1 md:grid-cols-8 gap-2 mb-2 items-end">
                                    <div className="md:col-span-3"><label className="text-xs font-medium text-gray-500">Supplier</label><input type="text" value={quote.supplier} onChange={e => handleQuoteChange(index, 'supplier', e.target.value)} className="w-full p-1 border rounded-md text-sm" placeholder="e.g., Shopee, NBM Hardware" required /></div>
                                    <div className="md:col-span-2"><label className="text-xs font-medium text-gray-500">Price (PHP)</label><input type="number" value={quote.price} onChange={e => handleQuoteChange(index, 'price', e.target.value)} className="w-full p-1 border rounded-md text-sm" placeholder="e.g., 250.00" required step="0.01" /></div>
                                    <div className="md:col-span-2"><label className="text-xs font-medium text-gray-500">Source/Link</label><input type="url" value={quote.link} onChange={e => handleQuoteChange(index, 'link', e.target.value)} className="w-full p-1 border rounded-md text-sm" placeholder="https://..." /></div>
                                    <button type="button" onClick={() => removeQuote(index)} disabled={formData.quotes.length <= 1} className="p-1 text-red-500 disabled:text-gray-300">Remove</button>
                                </div>
                            ))}
                            <button type="button" onClick={addQuote} disabled={formData.quotes.length >= 3} className="text-sm text-blue-600 hover:underline disabled:text-gray-400">+ Add another quote</button>
                        </div>
                        <div><label className="text-sm font-semibold text-gray-600">Justification for Inclusion*</label><textarea name="justification" value={formData.justification} onChange={handleChange} className="w-full p-2 border rounded-md" rows={3} required placeholder="Explain why this item is needed for government procurement..."></textarea></div>
                         <div className="pt-4 flex justify-end"> <button type="submit" className="btn bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-lg">Generate Request Form</button> </div>
                    </form>
                )}
            </div>
        </div>
    );
};

const PurchaseRequestModal: React.FC<{
    selectedItems: MarketItem[];
    onClose: () => void;
}> = ({ selectedItems, onClose }) => {
    const [quantities, setQuantities] = useState<Record<number, number>>(
        selectedItems.reduce((acc, item) => ({ ...acc, [item.id]: 1 }), {})
    );
    const [prDetails, setPrDetails] = useState({
        department: 'City Department of Agriculture',
        section: '',
        prNo: 'CDA-25-07-0005',
        date: 'July 11, 2025',
        purpose: ''
    });
    const [signatories, setSignatories] = useState({
        requestedBy: { name: 'MARICAR P. QUIRO', title: 'End User' },
        fundsAvailable: { name: 'JOSE MARIA T. GECOSALA', title: 'Acting City Treasurer' },
        approvedBy: { name: 'HON. GREG G. GASATAYA', title: 'City Mayor' },
    });
    
    const [loadingPurpose, setLoadingPurpose] = useState(true);
    const printableRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const generatePurpose = async () => {
            if (selectedItems.length === 0) {
                setPrDetails(prev => ({ ...prev, purpose: "Please add items to generate a purpose." }));
                setLoadingPurpose(false);
                return;
            };
            setLoadingPurpose(true);
            try {
                const itemsForPrompt = selectedItems.map(item => ({
                    name: item.name,
                    quantity: quantities[item.id] || 1,
                }));
                const generatedPurpose = await generatePurchasePurpose(itemsForPrompt);
                setPrDetails(prev => ({ ...prev, purpose: generatedPurpose }));
            } catch (error) {
                console.error("Failed to generate purpose:", error);
                setPrDetails(prev => ({...prev, purpose: "For the operational needs of the requesting department."}));
            } finally {
                setLoadingPurpose(false);
            }
        };
        generatePurpose();
    }, [selectedItems, quantities]);


    const handleQuantityChange = (itemId: number, qty: string) => {
        const newQty = parseInt(qty, 10);
        if (!isNaN(newQty) && newQty >= 0) {
            setQuantities(prev => ({ ...prev, [itemId]: newQty }));
        }
    };
    
    const handleDetailChange = (field: keyof typeof prDetails, value: string) => {
        setPrDetails(prev => ({ ...prev, [field]: value }));
    };

    const handleSignatoryChange = (role: keyof typeof signatories, field: 'name' | 'title', value: string) => {
        setSignatories(prev => ({
            ...prev,
            [role]: { ...prev[role], [field]: value }
        }));
    };

    const itemsInPr = useMemo(() => {
        return selectedItems.filter(item => (quantities[item.id] || 0) > 0);
    }, [selectedItems, quantities]);
    
    const totalPages = Math.ceil(itemsInPr.length / 14) || 1;

    const grandTotal = useMemo(() => {
        return itemsInPr.reduce((total, item) => {
            return total + item.price * (quantities[item.id] || 0);
        }, 0);
    }, [itemsInPr, quantities]);
    
    const handlePrint = () => {
        document.body.classList.add('is-printing');
        const onAfterPrint = () => {
            document.body.classList.remove('is-printing');
            window.removeEventListener('afterprint', onAfterPrint);
        };
        window.addEventListener('afterprint', onAfterPrint, { once: true });
        setTimeout(() => window.print(), 100);
    };

    const handleDownloadPdf = async () => {
        const input = printableRef.current;
        if (!input || !window.html2canvas || !window.jspdf) {
            alert('PDF generation library not found. Using browser print instead.');
            handlePrint();
            return;
        }
        
        document.body.classList.add('is-printing');
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
        
        try {
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({ orientation: 'p', unit: 'in', format: 'a4' });
            const pages = input.querySelectorAll('.print-page');

            for (let i = 0; i < pages.length; i++) {
                const page = pages[i] as HTMLElement;
                const canvas = await window.html2canvas(page, { 
                    scale: 3, 
                    useCORS: true,
                    onclone: (clonedDoc: Document) => {
                        clonedDoc.querySelectorAll('.no-print-input').forEach(el => {
                            const inputEl = el as HTMLInputElement | HTMLTextAreaElement;
                            const span = clonedDoc.createElement('span');
                            span.textContent = inputEl.value;
                            
                            span.className = inputEl.className;
                            
                            span.classList.remove('no-print-input', 'focus:bg-orange-50', 'focus:outline-none', 'focus:ring-1', 'focus:ring-orange-300', 'rounded-sm');
                            
                            span.style.border = 'none';
                            span.style.backgroundColor = 'transparent';
                            span.style.color = 'black';
                            span.style.padding = '0px';
                
                            if (inputEl.tagName === 'TEXTAREA') {
                                span.style.whiteSpace = 'pre-wrap';
                                span.style.height = 'auto';
                            }
                
                            if (inputEl.classList.contains('w-full') || inputEl.tagName === 'TEXTAREA') {
                                span.style.display = 'block';
                            }
                
                            inputEl.parentNode?.replaceChild(span, inputEl);
                        });
                    }
                });
                const imgData = canvas.toDataURL('image/png');
                
                if (i > 0) {
                    pdf.addPage();
                }
                
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
            }
            
            pdf.save(`Purchase_Request_${prDetails.prNo || Date.now()}.pdf`);
        } catch (e) {
            console.error("PDF generation failed:", e);
            alert("Sorry, there was an error creating the PDF.");
        } finally {
            document.body.classList.remove('is-printing');
        }
    };
    
    const PRPage: React.FC<{ pageIndex: number }> = ({ pageIndex }) => {
        const startIndex = pageIndex * 14;
        const endIndex = startIndex + 14;
        const pageItems = itemsInPr.slice(startIndex, endIndex);
        const isLastPage = pageIndex === totalPages - 1;

        return (
            <div className="bg-white p-8 mx-auto print-page" style={{ width: '8.27in', minHeight: '11.69in', fontFamily: "'Times New Roman', Times, serif" }}>
                <div className="text-center">
                    <img src={bacolodCityLogo} alt="Bacolod Logo" className="h-20 mx-auto mb-2" />
                    <p className="text-sm">Republic of the Philippines</p>
                    <p className="font-bold">CITY OF BACOLOD</p>
                    <p className="text-sm">Bacolod City, Philippines</p>
                    <h4 className="font-bold text-xl mt-4">PURCHASE REQUEST</h4>
                </div>
                
                <table className="w-full mt-4 text-xs">
                   <tbody>
                       <tr>
                           <td className="w-1/2 pr-2 align-top">
                               <table className="w-full border-collapse border border-black">
                                   <tr><td className="p-1 border border-black align-middle h-8"><strong>LGU:</strong></td><td className="p-1 border border-black align-middle h-8 text-center">Bacolod City</td></tr>
                                   <tr><td className="p-1 border border-black align-middle h-8"><strong>Department:</strong></td><td className="p-1 border border-black align-middle h-8 text-center"><EditableField value={prDetails.department} onSave={v => handleDetailChange('department', v)} className="text-center" /></td></tr>
                                   <tr><td className="p-1 border border-black align-middle h-8"><strong>Section:</strong></td><td className="p-1 border border-black align-middle h-8 text-center"><EditableField value={prDetails.section} onSave={v => handleDetailChange('section', v)} className="text-center" /></td></tr>
                               </table>
                           </td>
                           <td className="w-1/2 pl-2 align-top">
                               <table className="w-full border-collapse border border-black">
                                   <tr><td className="p-1 border border-black align-middle h-8"><strong>PR No.:</strong></td><td className="p-1 border border-black align-middle h-8 text-center"><EditableField value={prDetails.prNo} onSave={v => handleDetailChange('prNo', v)} className="text-center" /></td></tr>
                                   <tr><td className="p-1 border border-black align-middle h-8"><strong>Date:</strong></td><td className="p-1 border border-black align-middle h-8 text-center"><EditableField value={prDetails.date} onSave={v => handleDetailChange('date', v)} className="text-center" /></td></tr>
                                   <tr><td className="p-1 border border-black align-middle h-8"><strong>Fund:</strong></td><td className="p-1 border border-black align-middle h-8"></td></tr>
                               </table>
                           </td>
                       </tr>
                   </tbody>
               </table>

                <table className="w-full mt-1 text-xs border-collapse border border-black">
                     <thead>
                        <tr>
                            <th className="border border-black p-1 w-[8%]">Item No.</th>
                            <th className="border border-black p-1 w-[8%]">Unit</th>
                            <th className="border border-black p-1 w-[44%]">Item Description</th>
                            <th className="border border-black p-1 w-[8%]">Quantity</th>
                            <th className="border border-black p-1 w-[16%]">Unit Cost</th>
                            <th className="border border-black p-1 w-[16%]">Total Cost</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: 14 }).map((_, index) => {
                            const item = pageItems[index];
                            const itemNumber = startIndex + index + 1;

                            if (item) {
                                const quantity = quantities[item.id] || 0;
                                const totalCost = item.price * quantity;
                                return (
                                    <tr key={item.id}>
                                        <td className="border border-black p-1 text-center h-6">{itemNumber}</td>
                                        <td className="border border-black p-1 text-center">{item.unit}</td>
                                        <td className="border border-black p-1">{item.name}</td>
                                        <td className="border border-black p-1 text-center"><input type="number" value={quantity} onChange={e => handleQuantityChange(item.id, e.target.value)} className="w-full text-center bg-transparent no-print-input" /></td>
                                        <td className="border border-black p-1 text-right">{item.price.toFixed(2)}</td>
                                        <td className="border border-black p-1 text-right">{totalCost.toFixed(2)}</td>
                                    </tr>
                                );
                            } else {
                                if (isLastPage && index === pageItems.length) {
                                    return (
                                        <tr key={`empty-${index}`}>
                                            <td colSpan={6} className="border border-black p-1 h-6 text-center italic">
                                                *** nothing follows ***
                                            </td>
                                        </tr>
                                    );
                                } else {
                                    return (
                                        <tr key={`empty-${index}`}>
                                            <td className="border border-black p-1 h-6"></td>
                                            <td className="border border-black p-1"></td>
                                            <td className="border border-black p-1"></td>
                                            <td className="border border-black p-1"></td>
                                            <td className="border border-black p-1"></td>
                                            <td className="border border-black p-1"></td>
                                        </tr>
                                    );
                                }
                            }
                        })}
                    </tbody>
                     {isLastPage && (
                        <tfoot>
                            <tr>
                                <td colSpan={5} className="border border-black p-1 text-right font-bold">GRAND TOTAL</td>
                                <td className="border border-black p-1 text-right font-bold">₱{grandTotal.toFixed(2)}</td>
                            </tr>
                        </tfoot>
                     )}
                </table>
                <div className="mt-2 p-1 border border-black text-xs h-24">
                    <strong>Purpose:</strong> {loadingPurpose ? <span className="italic">AI is generating purpose...</span> : <EditableField value={prDetails.purpose} onSave={v => handleDetailChange('purpose', v)} isTextarea={true} />}
                </div>
                <div className="mt-8 text-xs flex justify-between" style={{pageBreakInside: 'avoid'}}>
                    <div className="w-1/3 text-center px-2">
                        <p>Requested By:</p>
                        <div className="mt-12 pt-1 border-t border-black">
                            <div>
                                <div className="h-6"><EditableField value={signatories.requestedBy.name} onSave={v => handleSignatoryChange('requestedBy', 'name', v)} className="font-bold text-center uppercase" /></div>
                                <div className="h-4"><EditableField value={signatories.requestedBy.title} onSave={v => handleSignatoryChange('requestedBy', 'title', v)} className="text-center" /></div>
                            </div>
                        </div>
                    </div>
                    <div className="w-1/3 text-center px-2">
                        <p>Funds Available:</p>
                         <div className="mt-12 pt-1 border-t border-black">
                             <div>
                                <div className="h-6"><EditableField value={signatories.fundsAvailable.name} onSave={v => handleSignatoryChange('fundsAvailable', 'name', v)} className="font-bold text-center uppercase" /></div>
                                <div className="h-4"><EditableField value={signatories.fundsAvailable.title} onSave={v => handleSignatoryChange('fundsAvailable', 'title', v)} className="text-center" /></div>
                            </div>
                        </div>
                    </div>
                     <div className="w-1/3 text-center px-2">
                        <p>Approved By:</p>
                         <div className="mt-12 pt-1 border-t border-black">
                            <div>
                                <div className="h-6"><EditableField value={signatories.approvedBy.name} onSave={v => handleSignatoryChange('approvedBy', 'name', v)} className="font-bold text-center uppercase" /></div>
                                <div className="h-4"><EditableField value={signatories.approvedBy.title} onSave={v => handleSignatoryChange('approvedBy', 'title', v)} className="text-center" /></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    };
    
    return (
        <div className="fixed inset-0 bg-black/60 z-[51] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-gray-100 rounded-lg shadow-2xl w-full max-w-5xl flex flex-col h-[95vh]" onClick={e => e.stopPropagation()}>
                <div className="p-3 bg-white border-b flex justify-between items-center no-print flex-shrink-0">
                     <h3 className="text-lg font-bold text-gray-800">Generate Purchase Request</h3>
                     <div className="flex items-center gap-4">
                        <p className="text-sm text-gray-600">Page 1 of {totalPages}</p>
                        <button onClick={handlePrint} className="btn text-sm bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-md">Print</button>
                        <button onClick={handleDownloadPdf} className="btn text-sm bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md">Download PDF</button>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-900 text-2xl">&times;</button>
                     </div>
                </div>
                <div className="flex-grow overflow-y-auto p-4">
                    <div ref={printableRef} id="pr-printable-content" className="printable-content space-y-4">
                         {Array.from({ length: totalPages }).map((_, i) => <PRPage key={i} pageIndex={i} />)}
                    </div>
                </div>
            </div>
        </div>
    );
};

const ProductPreviewModal: React.FC<{ item: MarketItem; onClose: () => void; onAddToPr: (itemId: number) => void; isSelected: boolean; onDownloadImage: (imageUrl: string, itemName: string) => void; }> = ({ item, onClose, onAddToPr, isSelected, onDownloadImage }) => {
    const [showSpecs, setShowSpecs] = useState(false);
    const DownloadIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>);
    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl flex overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="w-1/2 bg-gray-100 p-8 flex items-center justify-center relative group">
                    <img src={item.imageUrl || 'https://i.ibb.co/x7P39M6/placeholder-thumbnail.png'} alt={item.name} className="max-w-full max-h-[400px] object-contain" onError={(e) => { e.currentTarget.src = 'https://i.ibb.co/x7P39M6/placeholder-thumbnail.png'; }} />
                    <button onClick={() => onDownloadImage(item.imageUrl || '', item.name)} className="absolute top-4 right-4 bg-white/80 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity text-gray-700 hover:bg-white hover:text-orange-600">
                        <DownloadIcon />
                    </button>
                </div>
                <div className="w-1/2 p-8 flex flex-col">
                    <h3 className="text-2xl font-bold text-gray-800">{item.name}</h3>
                    <p className="text-4xl font-extrabold text-blue-600 my-3">₱{item.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    <div className="space-y-3 text-sm text-gray-600 border-t pt-4">
                        <div className="flex justify-between"><span className="font-semibold text-gray-500">Item Code:</span> <strong>{item.itemCode || 'N/A'}</strong></div>
                        <div className="flex justify-between"><span className="font-semibold text-gray-500">UACS Code:</span> <strong>{item.uacsCode || 'N/A'}</strong></div>
                        <div className="flex justify-between"><span className="font-semibold text-gray-500">Unit:</span> <strong>{item.unit}</strong></div>
                        <div className="flex justify-between items-center">
                            <span className="font-semibold text-gray-500">Stock:</span>
                            <span className={`px-2 py-1 rounded text-white text-xs font-bold ${item.quantity > 0 ? 'bg-green-500' : 'bg-red-500'}`}>
                                {item.quantity > 0 ? 'Available' : 'Not Available'}
                            </span>
                        </div>
                    </div>
                    <div className="mt-4 border-t pt-4">
                        <button onClick={() => setShowSpecs(!showSpecs)} className="text-blue-600 hover:underline text-sm font-semibold">{showSpecs ? 'Hide' : 'See'} technical specification here.</button>
                        {showSpecs && <div className="mt-2 p-3 bg-gray-50 rounded-md border text-xs text-gray-700 whitespace-pre-wrap">{item.technicalSpecifications || 'No technical specifications available.'}</div>}
                    </div>
                    <div className="mt-auto pt-6 flex justify-end items-center gap-3">
                        <button onClick={onClose} className="btn bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-5 rounded-lg">Close</button>
                        <button onClick={() => onAddToPr(item.id)} className={`btn font-bold py-2 px-5 rounded-lg text-white ${isSelected ? 'bg-green-500 hover:bg-green-600' : 'bg-orange-500 hover:bg-orange-600'}`}>{isSelected ? 'Added ✓' : 'Add to PR'}</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const PieChartAnalytics: React.FC<{
    marketData: Record<string, MarketItem[]>;
    marketCategories: string[];
    activeCategory: string;
    setActiveCategory: (category: string) => void;
}> = ({ marketData, marketCategories, activeCategory, setActiveCategory }) => {
    const chartData = useMemo(() => {
        const totalItems = marketCategories.reduce((sum, cat) => sum + (marketData[cat]?.length || 0), 0);
        if (totalItems === 0) return [];
        return marketCategories.map(cat => ({
            name: cat,
            count: marketData[cat]?.length || 0,
            percentage: ((marketData[cat]?.length || 0) / totalItems) * 100,
        })).sort((a, b) => b.count - a.count);
    }, [marketData, marketCategories]);

    const colors = useMemo(() => [
        '#f97316', '#fb923c', '#fdba74', '#fed7aa', '#ffedd5',
        '#ea580c', '#d97706', '#c2410c', '#b45309', '#9a3412',
        '#7c2d12', '#78350f', '#451a03', '#6b21a8', '#a855f7', '#c084fc', '#d8b4fe'
    ], []);

    const getCoordinatesForPercent = (percent: number) => {
        const x = Math.cos(2 * Math.PI * percent);
        const y = Math.sin(2 * Math.PI * percent);
        return [x, y];
    };

    let cumulativePercent = 0;
    const slices = chartData.map((d, i) => {
        const [startX, startY] = getCoordinatesForPercent(cumulativePercent);
        cumulativePercent += d.percentage / 100;
        const [endX, endY] = getCoordinatesForPercent(cumulativePercent);
        const largeArcFlag = d.percentage > 50 ? 1 : 0;

        const pathData = [
            `M ${startX * 40 + 50} ${startY * 40 + 50}`, // Move
            `A 40 40 0 ${largeArcFlag} 1 ${endX * 40 + 50} ${endY * 40 + 50}`, // Arc
            `L 50 50`, // Line
        ].join(' ');

        return {
            ...d,
            pathData,
            color: colors[i % colors.length],
        };
    });

    const activeSliceData = slices.find(s => s.name === activeCategory);

    return (
        <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border">
            <h3 className="font-bold text-lg text-gray-700 mb-2">Item Count by Category</h3>
            <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="w-full md:w-1/2">
                    <svg viewBox="0 0 100 100" className="w-full h-auto max-h-64">
                        {slices.map((slice) => (
                            <path
                                key={slice.name}
                                d={slice.pathData}
                                fill={slice.color}
                                className="cursor-pointer transition-transform duration-200 ease-in-out"
                                style={{ transform: activeCategory === slice.name ? 'scale(1.05)' : 'scale(1)', transformOrigin: '50% 50%' }}
                                onClick={() => setActiveCategory(slice.name)}
                            >
                                <title>{`${slice.name}: ${slice.count} items (${slice.percentage.toFixed(1)}%)`}</title>
                            </path>
                        ))}
                    </svg>
                </div>
                <div className="w-full md:w-1/2">
                    <h4 className="font-bold text-gray-700">Forecast & Data</h4>
                    {activeSliceData ? (
                        <div className="mt-2 p-3 bg-gray-50 rounded-md border">
                            <p className="font-bold text-orange-600">{activeSliceData.name}</p>
                            <p className="text-gray-600 text-sm">Contains <span className="font-bold">{activeSliceData.count}</span> items.</p>
                            <p className="text-gray-600 text-sm">Comprising <span className="font-bold">{activeSliceData.percentage.toFixed(2)}%</span> of total catalog items.</p>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 mt-2">Click on a pie slice to see details.</p>
                    )}
                    <div className="mt-4 max-h-40 overflow-y-auto pr-2">
                        {slices.map(slice => (
                            <div key={slice.name} className="flex items-center gap-2 mb-1 cursor-pointer" onClick={() => setActiveCategory(slice.name)}>
                                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: slice.color }}></div>
                                <span className={`text-xs font-medium ${activeCategory === slice.name ? 'text-orange-600 font-bold' : 'text-gray-600'}`}>
                                    {slice.name} ({slice.count})
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const processMarketData = (data: Record<string, CatalogItem[]>): Record<string, MarketItem[]> => {
    const flattenedData: Record<string, MarketItem[]> = {};
    for (const category in data) {
        flattenedData[category] = data[category].flatMap(item => {
            if ('variants' in item) {
                // It's a VariantMarketItem, create a MarketItem for each variant
                return item.variants.map((variant, index) => ({
                    id: item.id + (index + 1) / 100, // create a unique fractional ID
                    name: `${item.name} (${variant.description})`,
                    description: item.baseDescription,
                    category: item.category,
                    uacsCode: item.uacsCode,
                    quantity: variant.stockStatus.toLowerCase() === 'available' ? 1 : 0,
                    unit: variant.unit,
                    price: variant.price,
                    referenceLinks: [], 
                    itemCode: variant.itemCode,
                    technicalSpecifications: variant.technicalSpecifications || item.baseDescription,
                    isVariant: false, // Mark as a flattened MarketItem
                }));
            } else {
                // It's already a MarketItem
                return [item];
            }
        });
    }
    return flattenedData;
};

export const CatalogTab: React.FC<CatalogTabProps> = ({ isVisible, onClose, isShared = false }) => {
    // Window State
    const [isMaximized, setIsMaximized] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [position, setPosition] = useState({ x: 50, y: 50 });
    const [size, setSize] = useState({ width: 1200, height: 800 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStartOffset = useRef({ x: 0, y: 0 });
    const nodeRef = useRef<HTMLDivElement>(null);

    // Catalog State
    const [marketData, setMarketData] = useState<Record<string, MarketItem[]>>(() => processMarketData(initialMarketData));
    const [marketCategories, setMarketCategories] = useState<string[]>(initialMarketCategories);
    const [previewItem, setPreviewItem] = useState<MarketItem | null>(null);
    const [selectedItemIds, setSelectedItemIds] = useState<Set<number>>(new Set());
    const [activeCategory, setActiveCategory] = useState<string>(marketCategories[0]);
    const [isPrModalOpen, setIsPrModalOpen] = useState(false);
    const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
    
    // Filtering & Sorting State
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [maxPrice, setMaxPrice] = useState(10000);
    const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 10000 });
    const [sortBy, setSortBy] = useState<'name' | 'price-asc' | 'price-desc'>('name');
    const [stockStatus, setStockStatus] = useState<'all' | 'in_stock' | 'out_of_stock'>('all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    
    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 15;

    // Export State
    const [isExportingPdf, setIsExportingPdf] = useState(false);
    
    // AI Image Generation State
    const [generatedImages, setGeneratedImages] = useState<Record<number, string>>({});
    const [loadingImages, setLoadingImages] = useState<Set<number>>(new Set());

    const DownloadIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>);

    useEffect(() => {
        try {
            const storedImages = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (storedImages) {
                setGeneratedImages(JSON.parse(storedImages));
            }
        } catch (error) {
            console.error("Failed to load generated images from local storage:", error);
        }
    }, []);

    const handleGenerateImage = async (itemId: number, itemName: string) => {
        setLoadingImages(prev => new Set(prev).add(itemId));
        try {
            const newImageUrl = await generateImageForItem(itemName);
            
            setGeneratedImages(prev => {
                const updatedImages = { ...prev, [itemId]: newImageUrl };
                try {
                    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedImages));
                } catch (error) {
                    console.error("Failed to save image to local storage:", error);
                }
                return updatedImages;
            });

        } catch (error) {
            console.error("Failed to generate image:", error);
            alert(`Sorry, the AI could not generate an image for "${itemName}". Please try again.`);
        } finally {
            setLoadingImages(prev => {
                const newSet = new Set(prev);
                newSet.delete(itemId);
                return newSet;
            });
        }
    };

    const handleDownloadImage = async (imageUrl: string, itemName: string) => {
        if (!imageUrl) return;
        try {
            const response = await fetch(imageUrl);
            if (!response.ok) throw new Error('Network response was not ok');
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            const safeName = itemName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            const extension = blob.type.split('/')[1] || 'jpg';
            a.download = `${safeName}.${extension}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
        } catch (error) {
            console.error('Failed to download image:', error);
            window.open(imageUrl, '_blank');
        }
    };

    useEffect(() => {
        const allItems = Object.values(marketData).flat();
        if (allItems.length > 0) {
            const max = Math.ceil(Math.max(...allItems.map(item => item.price), 0));
            setMaxPrice(max);
            setPriceRange({ min: 0, max: max });
        }
    }, [marketData]);

    const filteredItems = useMemo(() => {
        let items = (marketData[activeCategory] || []);

        if (stockStatus === 'in_stock') {
            items = items.filter(item => item.quantity > 0);
        } else if (stockStatus === 'out_of_stock') {
            items = items.filter(item => item.quantity === 0);
        }

        items = items.filter(item =>
            item.price >= priceRange.min &&
            item.price <= priceRange.max &&
            (
                item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (item.itemCode && item.itemCode.toLowerCase().includes(searchTerm.toLowerCase()))
            )
        );
        return [...items].sort((a, b) => {
            switch (sortBy) {
                case 'price-asc': return a.price - b.price;
                case 'price-desc': return b.price - a.price;
                case 'name': default: return a.name.localeCompare(b.name);
            }
        });
    }, [activeCategory, searchTerm, marketData, priceRange, sortBy, stockStatus]);
    
    const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
    
    const paginatedItems = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredItems, currentPage]);

    useEffect(() => { setCurrentPage(1); }, [activeCategory, searchTerm, priceRange, sortBy, stockStatus]);
    
    const handleToggleSelection = (itemId: number) => {
        setSelectedItemIds(prev => {
            const newSelection = new Set(prev);
            if (newSelection.has(itemId)) newSelection.delete(itemId); else newSelection.add(itemId);
            return newSelection;
        });
    };
    
    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging || !nodeRef.current) return;
        let newX = e.clientX - dragStartOffset.current.x;
        let newY = e.clientY - dragStartOffset.current.y;
        const { offsetWidth, offsetHeight } = nodeRef.current;
        newX = Math.max(0, Math.min(newX, window.innerWidth - offsetWidth));
        newY = Math.max(0, Math.min(newY, window.innerHeight - offsetHeight));
        setPosition({ x: newX, y: newY });
    }, [isDragging]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
        document.body.style.userSelect = '';
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    }, [handleMouseMove]);
    
    const toggleMaximize = () => {
      setIsMaximized(!isMaximized);
      if (isMinimized) setIsMinimized(false);
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault(); // Prevent default browser drag behavior
        if (isMaximized || (e.target as HTMLElement).closest('button, input, select, textarea, a, [role="button"]')) return;
        setIsDragging(true);
        dragStartOffset.current = { x: e.clientX - position.x, y: e.clientY - position.y };
        document.body.style.userSelect = 'none';
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    useEffect(() => {
        if (isVisible && !isShared) {
            const initialWidth = Math.min(1400, window.innerWidth * 0.9);
            const initialHeight = Math.min(900, window.innerHeight * 0.9);
            setSize({ width: initialWidth, height: initialHeight });
            setPosition({ x: (window.innerWidth - initialWidth) / 2, y: (window.innerHeight * 0.9 - initialHeight) / 2 + (window.innerHeight*0.05) });
        }
    }, [isVisible, isShared]);
    
    const handleExportExcel = () => {
        const escapeCsvCell = (cellData: any) => {
            const stringData = String(cellData || '');
            if (stringData.includes(',') || stringData.includes('"') || stringData.includes('\n')) {
                return `"${stringData.replace(/"/g, '""')}"`;
            }
            return stringData;
        };

        const headers = ['Category', 'Item Code', 'Name', 'Description', 'Unit', 'Price', 'Stock Status', 'UACS Code', 'Technical Specifications'];
        const rows = marketCategories.flatMap(category => {
            const items = marketData[category] || [];
            return items.map(item => [
                category,
                item.itemCode || `CAT-${item.id}`,
                item.name,
                item.description,
                item.unit,
                item.price,
                item.quantity > 0 ? 'Available' : 'Not Available',
                item.uacsCode,
                item.technicalSpecifications || ''
            ].map(escapeCsvCell).join(','));
        });

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "procurement_catalog.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportPdf = async () => {
        const jspdfModule = window.jspdf;
        if (!jspdfModule || typeof jspdfModule.jsPDF !== 'function' || !(jspdfModule.jsPDF as any).API.autoTable) {
            alert("PDF generation library is not available. Please try again later.");
            return;
        }
        if (filteredItems.length === 0) {
            alert("There are no items in the current view to export.");
            return;
        }
    
        setIsExportingPdf(true);
        try {
            const { jsPDF } = jspdfModule;
            const pdf = new jsPDF({ orientation: 'p', unit: 'in', format: 'legal' }) as jsPDFWithAutoTable;
    
            const head = [['Item Code', 'Name', 'Unit', 'Price', 'Stock']];
            const body = filteredItems.map(item => [
                item.itemCode || `CAT-${item.id}`,
                item.name,
                item.unit,
                `PHP ${item.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                item.quantity > 0 ? 'Available' : 'Out of Stock'
            ]);
    
            pdf.autoTable({
                head,
                body,
                startY: 1.5,
                theme: 'striped',
                headStyles: { fillColor: [249, 115, 22] }, // orange-500
                styles: { fontSize: 8, cellPadding: 0.05, overflow: 'linebreak' },
                columnStyles: {
                    0: { cellWidth: 1.2 }, 
                    1: { cellWidth: 3.3 }, 
                    2: { cellWidth: 0.8 },
                    3: { cellWidth: 1.2, halign: 'right' }, 
                    4: { cellWidth: 1.2, halign: 'center' }
                },
                didDrawPage: (data) => {
                    // Page Header
                    pdf.setFontSize(16);
                    pdf.setFont('helvetica', 'bold');
                    pdf.text('Procurement Catalog Report', pdf.internal.pageSize.getWidth() / 2, 0.7, { align: 'center' });
                    
                    pdf.setFontSize(10);
                    pdf.setFont('helvetica', 'normal');
                    pdf.text(`Category: ${activeCategory}`, 0.5, 1.0);
                    pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, pdf.internal.pageSize.getWidth() - 0.5, 1.0, { align: 'right' });
    
                    let filterInfo = `Filters: Stock (${stockStatus.replace('_', ' ')}), Price (PHP ${priceRange.min.toLocaleString()} - PHP ${priceRange.max.toLocaleString()}), Sort (${sortBy})`;
                    if (searchTerm) filterInfo += `, Search ("${searchTerm}")`;
                    pdf.text(filterInfo, 0.5, 1.2);

                    // Page Footer
                    const pageStr = `Page ${data.pageNumber}`;
                    pdf.setFontSize(8);
                    pdf.text(pageStr, data.settings.margin.left, pdf.internal.pageSize.getHeight() - 0.5);
                },
                margin: { top: 1.5, bottom: 0.8 } 
            });
            
            const safeCategoryName = activeCategory.replace(/[^a-zA-Z0-9]/g, '_');
            pdf.save(`Catalog_View_${safeCategoryName}.pdf`);
    
        } catch (error) {
            console.error("PDF export failed:", error);
            alert("An error occurred while exporting to PDF.");
        } finally {
            setIsExportingPdf(false);
        }
    };
    
    const areAllFilteredItemsSelected = useMemo(() => {
        if (filteredItems.length === 0) return false;
        return filteredItems.every(item => selectedItemIds.has(item.id));
    }, [filteredItems, selectedItemIds]);

    const handleToggleSelectAll = () => {
        if (areAllFilteredItemsSelected) {
            setSelectedItemIds(new Set());
        } else {
            const allFilteredIds = new Set(filteredItems.map(item => item.id));
            setSelectedItemIds(allFilteredIds);
        }
    };

    const handleSyncPrices = () => {
        alert("Price Synchronization Feature:\n\nThis feature is designed to fetch real-time prices from whitelisted market sources (e.g., bacolodpages.com) and update the catalog, including applying the standard 35% markup.\n\nNOTE: A backend server is required for this functionality to handle cross-origin requests and data parsing reliably. In this frontend-only version, prices are static. The items you requested have been added with the markup applied based on the latest available data.");
    };
    
    if (!isVisible && !isShared) return null;
    
    const windowStyle: React.CSSProperties = isShared ? {} : (isMaximized ? { top: '0', left: '0', width: '100vw', height: '100vh', borderRadius: 0 } : { top: `${position.y}px`, left: `${position.x}px`, width: `${size.width}px`, height: isMinimized ? 'auto' : `${size.height}px` });
    const containerClasses = isShared ? "relative bg-white flex flex-col w-full h-full" : "fixed bg-white rounded-lg shadow-2xl flex flex-col z-40 overflow-hidden border border-gray-300 transition-all duration-300 ease-in-out";

    return (
        <div ref={nodeRef} className={containerClasses} style={windowStyle} aria-modal={!isShared} role={!isShared ? "dialog" : undefined}>
            {/* Window Header */}
            {!isShared && (
                <div onMouseDown={handleMouseDown} className={`flex items-center justify-between p-2 bg-gray-100 border-b border-gray-200 flex-shrink-0 ${isMaximized ? '' : 'cursor-move'}`}>
                    <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
                        <h2 className="text-sm font-bold text-gray-700 select-none">Procurement Catalog</h2>
                    </div>
                    <div className="flex items-center space-x-1">
                        <button onClick={() => setIsMinimized(!isMinimized)} className="p-1.5 rounded-full hover:bg-gray-200"><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg></button>
                        <button onClick={toggleMaximize} className="p-1.5 rounded-full hover:bg-gray-200">{isMaximized ? <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-4h4m-4 0l4-4m6 8v4h-4m4-4l-4-4" /></svg> : <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4h4m12 4V4h-4M4 16v4h4m12-4v4h-4" /></svg>}</button>
                        <button onClick={onClose} className="p-1.5 rounded-full hover:bg-red-500 hover:text-white"><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                    </div>
                </div>
            )}
            
            {/* Content */}
            <div className={`flex-grow w-full h-full overflow-y-auto bg-gray-50 transition-opacity duration-300 ${isMinimized ? 'hidden' : ''}`}>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-6">
                    <aside className="lg:col-span-1 lg:sticky top-0 self-start space-y-6">
                        <div className="p-4 bg-white rounded-lg shadow-sm border">
                            <h3 className="font-bold text-gray-700 mb-2">Categories</h3>
                            <ul className="space-y-1 max-h-60 overflow-y-auto">
                                {marketCategories.map(cat => (
                                    <li key={cat}><button onClick={() => setActiveCategory(cat)} className={`w-full text-left px-3 py-1.5 rounded-md text-sm font-medium transition-all ${activeCategory === cat ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-orange-100'}`}>{cat} ({marketData[cat]?.length || 0})</button></li>
                                ))}
                            </ul>
                        </div>
                        <div className="p-4 bg-white rounded-lg shadow-sm border">
                            <h3 className="font-bold text-gray-700 mb-2">Filter by Stock</h3>
                            <select value={stockStatus} onChange={e => setStockStatus(e.target.value as any)} className="w-full p-2 border border-gray-300 rounded-md text-sm">
                                <option value="all">All Items</option>
                                <option value="in_stock">In Stock</option>
                                <option value="out_of_stock">Out of Stock</option>
                            </select>
                        </div>
                        <div className="p-4 bg-white rounded-lg shadow-sm border">
                            <h3 className="font-bold text-gray-700 mb-2">Filter by Price</h3>
                            <div className="text-sm font-semibold text-center text-gray-600 mb-2">₱{priceRange.min.toLocaleString()} - ₱{priceRange.max.toLocaleString()}</div>
                            <div className="space-y-2">
                                <div><label className="text-xs text-gray-500">Min Price</label><input type="range" min="0" max={maxPrice} value={priceRange.min} onChange={e => setPriceRange(r => ({ ...r, min: Math.min(Number(e.target.value), r.max) }))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" /></div>
                                <div><label className="text-xs text-gray-500">Max Price</label><input type="range" min="0" max={maxPrice} value={priceRange.max} onChange={e => setPriceRange(r => ({ ...r, max: Math.max(Number(e.target.value), r.min) }))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" /></div>
                            </div>
                        </div>
                        {!isShared && (
                            <div className="p-4 bg-white rounded-lg shadow-sm border">
                                 <button onClick={() => setIsPrModalOpen(true)} disabled={selectedItemIds.size === 0} className="btn w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed">Generate PR ({selectedItemIds.size})</button>
                            </div>
                        )}
                    </aside>
                    <main className="lg:col-span-3 space-y-4">
                        <PieChartAnalytics 
                            marketData={marketData}
                            marketCategories={marketCategories}
                            activeCategory={activeCategory}
                            setActiveCategory={setActiveCategory}
                        />
                        <div className="bg-white p-4 rounded-lg shadow-sm border space-y-4">
                            <div className="flex justify-between items-center flex-wrap gap-2">
                                <h4 className="font-bold text-gray-700 text-lg">Browse Items in "{activeCategory}"</h4>
                                <div className="flex items-center gap-2">
                                    <button onClick={handleSyncPrices} className="btn bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-4 rounded-md text-sm flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5M4 20h5v-5M20 4h-5v5" /></svg>
                                        Sync Market Prices
                                    </button>
                                    <button onClick={() => setIsAddItemModalOpen(true)} className="btn bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md text-sm">Request New Item Inclusion</button>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                <input type="text" placeholder={`Search in ${activeCategory}...`} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="p-2 border border-gray-300 rounded-md text-sm w-full sm:w-1/3" />
                                <div className="flex items-center gap-4 w-full sm:w-auto">
                                    <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} className="p-2 border border-gray-300 rounded-md text-sm w-full sm:w-auto">
                                        <option value="name">Sort by Name</option>
                                        <option value="price-asc">Price: Low to High</option>
                                        <option value="price-desc">Price: High to Low</option>
                                    </select>
                                    <div className="flex items-center p-1 bg-gray-200 rounded-lg">
                                        <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-orange-500 text-white shadow' : 'text-gray-600 hover:bg-gray-300'}`} aria-label="Grid View">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                                        </button>
                                        <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-orange-500 text-white shadow' : 'text-gray-600 hover:bg-gray-300'}`} aria-label="List View">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-2 border-l pl-4">
                                        <button onClick={handleToggleSelectAll} className="btn text-sm p-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold rounded-md">{areAllFilteredItemsSelected ? 'Deselect All' : `Select All (${filteredItems.length})`}</button>
                                        <button onClick={handleExportExcel} className="btn text-sm p-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md flex items-center gap-1.5" title="Export as Excel (CSV)">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M2 3a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1-1H3a1 1 0 01-1-1V3zm2 2v2h12V5H4zm0 4v2h12V9H4zm0 4v2h12v-2H4z" /></svg>
                                            Excel
                                        </button>
                                        <button onClick={handleExportPdf} disabled={isExportingPdf || filteredItems.length === 0} className="btn text-sm p-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md flex items-center gap-1.5 disabled:bg-gray-400" title="Export Current View as PDF">
                                            {isExportingPdf ? <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                                            {isExportingPdf ? '...' : 'PDF'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {viewMode === 'grid' ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                                {paginatedItems.map(item => {
                                    const isSelected = selectedItemIds.has(item.id);
                                    const imageUrl = generatedImages[item.id] || item.imageUrl;
                                    const showGenerateButton = !imageUrl;
                                    return (
                                        <div key={item.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow flex flex-col overflow-hidden border">
                                            <div className="h-32 bg-gray-100 flex items-center justify-center p-2 cursor-pointer" onClick={() => setPreviewItem(item)}><img src={imageUrl || PLACEHOLDER_IMAGE} alt={item.name} className="max-h-full max-w-full object-contain" onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMAGE; }} /></div>
                                            <div className="p-3 flex flex-col flex-grow">
                                                <p className="text-xs font-bold text-gray-800 flex-grow cursor-pointer line-clamp-2" title={item.name} onClick={() => setPreviewItem(item)}>{item.name}</p>
                                                <p className="text-lg font-bold text-blue-600 mt-1">₱{item.price.toFixed(2)}</p>
                                                <div className="text-[10px] text-gray-500 mt-1 flex justify-between items-center">
                                                    <div>
                                                        <p><strong>Code:</strong> {item.itemCode || 'N/A'}</p>
                                                        <p><strong>UOM:</strong> {item.unit}</p>
                                                    </div>
                                                    <span className={`px-1.5 py-0.5 rounded text-white text-[9px] font-bold ${item.quantity > 0 ? 'bg-green-500' : 'bg-red-500'}`}>
                                                        {item.quantity > 0 ? 'Available' : 'Not Available'}
                                                    </span>
                                                </div>
                                                <div className="mt-auto pt-2 flex flex-col gap-1.5">
                                                     {showGenerateButton && (
                                                        <button onClick={() => handleGenerateImage(item.id, item.name)} disabled={loadingImages.has(item.id)} className="w-full text-center px-2 py-1.5 rounded text-xs font-semibold text-white transition-colors bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 flex items-center justify-center gap-1">
                                                            {loadingImages.has(item.id) ? ( <><svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> <span>Generating...</span></> ) : 'Generate AI Image'}
                                                        </button>
                                                     )}
                                                    <button onClick={() => handleToggleSelection(item.id)} className={`w-full text-center px-2 py-1.5 rounded text-xs font-semibold text-white transition-colors ${isSelected ? 'bg-green-500 hover:bg-green-600' : 'bg-orange-500 hover:bg-orange-600'}`}>{isSelected ? 'Added ✓' : 'Add to PR'}</button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                           <div className="space-y-3">
                                {paginatedItems.map(item => {
                                    const isSelected = selectedItemIds.has(item.id);
                                    const imageUrl = generatedImages[item.id] || item.imageUrl;
                                    const showGenerateButton = !imageUrl;
                                    return (
                                        <div key={item.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow flex items-center p-3 border">
                                            <img src={imageUrl || PLACEHOLDER_IMAGE} alt={item.name} className="w-20 h-20 object-contain bg-gray-100 rounded-md flex-shrink-0" onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMAGE; }} />
                                            <div className="flex-grow mx-4">
                                                <p className="font-bold text-gray-800 text-sm cursor-pointer" onClick={() => setPreviewItem(item)}>{item.name}</p>
                                                <p className="text-xs text-gray-500">{item.itemCode || 'N/A'}</p>
                                            </div>
                                            <div className="text-center w-24 flex-shrink-0"><p className="font-bold text-blue-600 text-base">₱{item.price.toFixed(2)}</p><span className={`mt-1 px-2 py-0.5 rounded text-white text-[10px] font-bold ${item.quantity > 0 ? 'bg-green-500' : 'bg-red-500'}`}>{item.quantity > 0 ? 'In Stock' : 'Out of Stock'}</span></div>
                                            <div className="flex flex-col items-end gap-2 ml-4 w-40 flex-shrink-0">
                                                {showGenerateButton && (
                                                    <button onClick={() => handleGenerateImage(item.id, item.name)} disabled={loadingImages.has(item.id)} className="w-full text-center px-2 py-1.5 rounded text-xs font-semibold text-white transition-colors bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 flex items-center justify-center gap-1">
                                                        {loadingImages.has(item.id) ? ( <><svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> <span>Generating...</span></> ) : 'Generate AI Image'}
                                                    </button>
                                                )}
                                                <button onClick={() => handleToggleSelection(item.id)} className={`w-full text-center px-2 py-1.5 rounded text-xs font-semibold text-white transition-colors ${isSelected ? 'bg-green-500 hover:bg-green-600' : 'bg-orange-500 hover:bg-orange-600'}`}>{isSelected ? 'Added ✓' : 'Add to PR'}</button>
                                            </div>
                                        </div>
                                    );
                                })}
                           </div>
                        )}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2 mt-6">
                                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-md bg-white border disabled:opacity-50">Prev</button>
                                <span className="text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
                                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-md bg-white border disabled:opacity-50">Next</button>
                            </div>
                        )}
                        {filteredItems.length === 0 && <p className="text-center text-gray-500 py-10">No items found matching your criteria.</p>}
                    </main>
                </div>
            </div>

            {/* Modals */}
            {previewItem && <ProductPreviewModal item={previewItem} onClose={() => setPreviewItem(null)} onAddToPr={handleToggleSelection} isSelected={selectedItemIds.has(previewItem.id)} onDownloadImage={handleDownloadImage} />}
            {isPrModalOpen && <PurchaseRequestModal selectedItems={Object.values(marketData).flat().filter(item => selectedItemIds.has(item.id))} onClose={() => setIsPrModalOpen(false)} />}
            {isAddItemModalOpen && <AddItemModal categories={marketCategories} onClose={() => setIsAddItemModalOpen(false)} />}
        </div>
    );
};
