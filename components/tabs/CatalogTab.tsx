







import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { marketData, marketCategories } from '../../data/marketData';
import { MarketItem, CatalogItem, VariantMarketItem } from '../../types';
import { generatePurchasePurpose, getUacsCodeSuggestion, generateItemDescriptionAndSpecs, generateRequestJustification, generateImageForItem } from '../../services/geminiService';
import Loader from '../Loader';
import { bacolodCityLogo, orangeBacolodLogo } from '../../data/logo';
import { useDraggableWindow } from '../../hooks/useDraggableWindow';
import AgencyProcurementRequestModal from '../APRModal';
import { newlyAddedItems } from '../../data/items/newlyAdded';
import { SessionUser } from '../../auth/authService';


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
    startMaximized?: boolean;
    currentUser?: SessionUser;
}

const EditableField: React.FC<{ value: string, onSave: (value: string) => void, className?: string, isTextarea?: boolean, rows?: number }> = ({ value, onSave, className, isTextarea = false, rows=1 }) => {
    const [currentValue, setCurrentValue] = useState(value);
    const ref = useRef<HTMLInputElement & HTMLTextAreaElement>(null);
    useEffect(() => { setCurrentValue(value); }, [value]);

    const handleResize = useCallback(() => {
        if (isTextarea && ref.current) {
            ref.current.style.height = 'auto';
            ref.current.style.height = `${ref.current.scrollHeight}px`;
        }
    }, [isTextarea]);

    useEffect(() => {
        handleResize();
    }, [currentValue, handleResize]);


    const commonProps = {
        ref: ref as any,
        value: currentValue,
        onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setCurrentValue(e.target.value),
        onBlur: () => onSave(currentValue),
        className: `w-full bg-transparent focus:bg-orange-50 focus:outline-none focus:ring-1 focus:ring-orange-300 rounded-sm p-0.5 no-print-input resize-none overflow-hidden ${className}`
    };

    if (isTextarea) {
        return <textarea {...commonProps} rows={rows} />;
    }
    return <input type="text" {...commonProps} />;
};

const AddItemModal: React.FC<{ categories: string[]; onClose: () => void; }> = ({ categories, onClose }) => {
    const getInitialItemState = () => ({
        itemName: '',
        category: categories[0] || '',
        isNewCategory: false,
        newCategoryName: '',
        uom: '',
        description: '',
        techSpecs: '',
        uacsCode: '',
        quotes: [{ supplier: '', price: '', link: '' }],
        uacsLoading: false,
        descriptionLoading: false,
    });

    const initialFormState = {
        requestingUser: '',
        requestingDept: 'BIDS AND AWARDS COMMITTEE',
        justification: '',
        items: [getInitialItemState()],
    };

    const [formData, setFormData] = useState(initialFormState);
    const [isPreview, setIsPreview] = useState(false);
    const [formError, setFormError] = useState('');
    const [justificationLoading, setJustificationLoading] = useState(false);
    const printableRef = useRef<HTMLDivElement>(null);
    const debounceTimeout = useRef<number | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleItemChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const newItems = [...formData.items];
        (newItems[index] as any)[name] = value;
        setFormData(prev => ({ ...prev, items: newItems }));

        if (name === 'itemName') {
            if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
            debounceTimeout.current = window.setTimeout(() => {
                handleSuggestUacs(index, value);
            }, 1000);
        }
    };
    
    const handleSuggestUacs = async (index: number, itemName: string) => {
        if (!itemName.trim()) return;

        const newItems = [...formData.items];
        newItems[index].uacsLoading = true;
        setFormData(prev => ({ ...prev, items: newItems }));

        try {
            const uacsCode = await getUacsCodeSuggestion(itemName);
            const updatedItems = [...formData.items];
            updatedItems[index].uacsCode = uacsCode !== 'N/A' ? uacsCode : '';
            setFormData(prev => ({ ...prev, items: updatedItems }));
        } catch (error) {
            console.error("UACS suggestion failed:", error);
        } finally {
             const finalItems = [...formData.items];
             finalItems[index].uacsLoading = false;
             setFormData(prev => ({...prev, items: finalItems}));
        }
    };

    const handleGenerateDescription = async (index: number) => {
        const itemName = formData.items[index].itemName;
        if (!itemName.trim()) return;
        
        const newItems = [...formData.items];
        newItems[index].descriptionLoading = true;
        setFormData(prev => ({ ...prev, items: newItems }));

        try {
            const { description, techSpecs } = await generateItemDescriptionAndSpecs(itemName);
            const updatedItems = [...formData.items];
            updatedItems[index].description = description;
            updatedItems[index].techSpecs = techSpecs;
             setFormData(prev => ({ ...prev, items: updatedItems }));
        } catch (error) {
            console.error("Description generation failed:", error);
        } finally {
            const finalItems = [...formData.items];
            finalItems[index].descriptionLoading = false;
            setFormData(prev => ({ ...prev, items: finalItems }));
        }
    };

    const handleGenerateJustification = async () => {
        if (!formData.requestingDept.trim() || formData.items.some(i => !i.itemName.trim())) {
             setFormError("Please fill in the requesting department and at least one item name before generating the justification.");
            return;
        }
        setFormError('');
        setJustificationLoading(true);
        try {
            const itemsToJustify = formData.items.map(i => ({ itemName: i.itemName, description: i.description }));
            const justification = await generateRequestJustification(itemsToJustify, formData.requestingDept);
            setFormData(prev => ({ ...prev, justification }));
        } catch (error) {
            console.error("Justification generation failed:", error);
        } finally {
            setJustificationLoading(false);
        }
    };


    const handleCategoryChange = (index: number, e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        const newItems = [...formData.items];
        if (value === '--new--') {
            newItems[index] = { ...newItems[index], isNewCategory: true, category: '' };
        } else {
            newItems[index] = { ...newItems[index], isNewCategory: false, category: value, newCategoryName: '' };
        }
        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const handleNewCategoryNameChange = (index: number, value: string) => {
        const newItems = [...formData.items];
        newItems[index].newCategoryName = value;
        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const handleQuoteChange = (itemIndex: number, quoteIndex: number, field: 'supplier' | 'price' | 'link', value: string) => {
        const newItems = [...formData.items];
        const newQuotes = [...newItems[itemIndex].quotes];
        newQuotes[quoteIndex][field] = value;
        newItems[itemIndex].quotes = newQuotes;
        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const addQuote = (itemIndex: number) => {
        const newItems = [...formData.items];
        if (newItems[itemIndex].quotes.length < 3) {
            newItems[itemIndex].quotes.push({ supplier: '', price: '', link: '' });
            setFormData(prev => ({ ...prev, items: newItems }));
        }
    };
    
    const removeQuote = (itemIndex: number, quoteIndex: number) => {
        const newItems = [...formData.items];
        if (newItems[itemIndex].quotes.length > 1) {
            newItems[itemIndex].quotes = newItems[itemIndex].quotes.filter((_, i) => i !== quoteIndex);
            setFormData(prev => ({ ...prev, items: newItems }));
        }
    };
    
    const addItem = () => {
        setFormData(prev => ({ ...prev, items: [...prev.items, getInitialItemState()] }));
    };

    const removeItem = (index: number) => {
        if (formData.items.length > 1) {
            setFormData(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
        }
    };

    const handleGeneratePreview = (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');
        if (!formData.requestingUser.trim() || !formData.requestingDept.trim() || !formData.justification.trim()) {
            setFormError('Please fill in all requester details and the justification.');
            return;
        }

        for (const [index, item] of formData.items.entries()) {
            const finalCategory = item.isNewCategory ? item.newCategoryName.trim() : item.category;
            if (!item.itemName.trim() || !finalCategory || !item.uom.trim()) {
                setFormError(`Please fill all required fields (*) for Item #${index + 1}.`);
                return;
            }
            if (item.quotes.some(q => !q.supplier.trim() || !q.price.trim())) {
                setFormError(`Please complete all fields for at least one market scoping quote for Item #${index + 1}.`);
                return;
            }
        }
        setIsPreview(true);
    };

    const handleExportPdf = async () => {
        const printableArea = printableRef.current;
        if (!printableArea || !window.html2canvas || !window.jspdf) {
            alert('PDF export failed. A required library may not be loaded.');
            return;
        }
        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }
        await new Promise(resolve => setTimeout(resolve, 50));
    
        try {
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({ orientation: 'p', unit: 'in', format: [13, 8.5] }); // Folio size

            const canvas = await window.html2canvas(printableArea, {
                scale: 3,
                useCORS: true,
                onclone: (clonedDoc) => {
                    clonedDoc.querySelectorAll('.no-print-input').forEach(el => {
                        const inputEl = el as HTMLInputElement | HTMLTextAreaElement;
                        const span = clonedDoc.createElement('span');
                        span.textContent = inputEl.value;
                        
                        span.className = inputEl.className;
                        span.classList.remove('no-print-input', 'hover:bg-orange-50', 'focus:bg-orange-50', 'focus:outline-none', 'focus:ring-1', 'focus:ring-orange-300', 'resize-none', 'overflow-hidden');
                        
                        const computedStyle = window.getComputedStyle(inputEl);
                        span.style.font = computedStyle.font;
                        span.style.color = 'black';
                        span.style.textAlign = computedStyle.textAlign;
                        span.style.lineHeight = computedStyle.lineHeight;
                        
                        if (inputEl.tagName === 'TEXTAREA') {
                            span.style.whiteSpace = 'pre-wrap';
                        }
                        
                        inputEl.parentNode?.replaceChild(span, inputEl);
                    });
                }
            });

            const imgData = canvas.toDataURL('image/png');
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            const pageHeight = pdf.internal.pageSize.getHeight();
            let heightLeft = pdfHeight;
            let position = 0;
            
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
            heightLeft -= pageHeight;
            
            while (heightLeft > 0) {
                position -= pageHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
                heightLeft -= pageHeight;
            }

            const safeItemName = formData.items[0]?.itemName.replace(/[^a-zA-Z0-9]/g, '_') || 'report';
            pdf.save(`Request_for_Item_Inclusion_${safeItemName}.pdf`);

        } catch (error) {
            console.error("PDF generation failed:", error);
            alert("An error occurred while generating the PDF. Please try again.");
        }
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
                        <div ref={printableRef} id="printable-item-request" className="printable-content bg-white p-8 mx-auto relative" style={{ width: '8.5in', fontFamily: "'Times New Roman', Times, serif", fontSize: '12pt' }}>
                             <div className="relative z-10">
                                <div className="mb-8">
                                    <div className="flex items-start pb-2">
                                        <img src={bacolodCityLogo} alt="Bacolod Logo" className="h-20 w-20" />
                                        <div className="text-center flex-grow">
                                            <p className="text-sm">Republic of the Philippines</p>
                                            <p className="font-bold">CITY OF BACOLOD</p>
                                            <p className="font-bold">Bids and Awards Committee</p>
                                        </div>
                                    </div>
                                    <hr className="border-t-2 border-black" />
                                    <h4 className="font-bold text-xl mt-4 text-center">REQUEST FOR ITEM INCLUSION IN PROCUREMENT CATALOG</h4>
                                </div>
                                <table className="w-full text-sm mb-4"><tbody><tr><td className='w-1/3'><strong>Date of Request:</strong></td><td className="w-2/3 text-left">{new Date().toLocaleDateString()}</td></tr><tr><td><strong>Requesting Department:</strong></td><td className="text-left"><EditableField value={formData.requestingDept} onSave={v => setFormData(p => ({...p, requestingDept: v}))} /></td></tr></tbody></table>
                                
                                {formData.items.map((item, index) => (
                                    <div key={index} className="mb-4 pt-4" style={{pageBreakInside: 'avoid'}}>
                                        <h5 className="font-bold mb-2 border-t-2 border-b-2 py-1">PROPOSED ITEM #{index + 1}: <EditableField value={item.itemName} onSave={v => { const newItems = [...formData.items]; newItems[index].itemName = v; setFormData(p => ({...p, items: newItems})); }} className="inline-block font-bold" /></h5>
                                        <div className="border border-gray-400">
                                            <table className="w-full text-[10pt] border-collapse"><tbody>
                                                <tr className="border-b border-gray-400"><td className="font-bold p-1 w-1/4 border-r border-gray-400">Category:</td><td className="p-1"><EditableField value={item.isNewCategory ? item.newCategoryName : item.category} onSave={v => { const newItems = [...formData.items]; if(item.isNewCategory) newItems[index].newCategoryName = v; else newItems[index].category = v; setFormData(p => ({...p, items: newItems})); }} /></td></tr>
                                                <tr className="border-b border-gray-400"><td className="font-bold p-1 border-r border-gray-400">Unit of Measure (UOM):</td><td className="p-1"><EditableField value={item.uom} onSave={v => { const newItems = [...formData.items]; newItems[index].uom = v; setFormData(p => ({...p, items: newItems})); }} /></td></tr>
                                                <tr className="border-b border-gray-400"><td className="font-bold p-1 border-r border-gray-400">UACS Code Suggestion:</td><td className="p-1"><EditableField value={item.uacsCode} onSave={v => { const newItems = [...formData.items]; newItems[index].uacsCode = v; setFormData(p => ({...p, items: newItems})); }} /></td></tr>
                                                <tr className="border-b border-gray-400"><td className="font-bold p-1 border-r border-gray-400">Description:</td><td className="p-1"><EditableField value={item.description} onSave={v => { const newItems = [...formData.items]; newItems[index].description = v; setFormData(p => ({...p, items: newItems})); }} isTextarea rows={2} /></td></tr>
                                                <tr className=""><td className="font-bold p-1 border-r border-gray-400">Technical Specifications:</td><td className="p-1"><EditableField value={item.techSpecs.replace(/\\n/g, '\n')} onSave={v => { const newItems = [...formData.items]; newItems[index].techSpecs = v.replace(/\n/g, '\\n'); setFormData(p => ({...p, items: newItems})); }} isTextarea rows={4} /></td></tr>
                                            </tbody></table>
                                        </div>
                                        <div className="mt-2">
                                             <h6 className="font-bold mb-1 border-t-2 border-b-2 py-1">Market Scoping / Price Justification</h6>
                                             <table className="w-full text-[10pt] border-collapse border border-gray-400">
                                                <thead>
                                                    <tr className="border-b border-gray-400 font-bold bg-gray-100">
                                                        <th className="p-1 text-left border-r border-gray-400">Supplier</th>
                                                        <th className="p-1 text-center border-r border-gray-400">Price (PHP)</th>
                                                        <th className="p-1 text-left">Source / Link</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {item.quotes.filter(q=>q.supplier && q.price).map((q, qIndex) => 
                                                        <tr key={qIndex} className="border-b border-gray-400 last:border-b-0">
                                                            <td className="p-1 border-r border-gray-400"><EditableField value={q.supplier} onSave={v => { const newItems = [...formData.items]; newItems[index].quotes[qIndex].supplier = v; setFormData(p => ({...p, items: newItems})); }} /></td>
                                                            <td className="p-1 text-right border-r border-gray-400"><EditableField value={q.price} onSave={v => { const newItems = [...formData.items]; newItems[index].quotes[qIndex].price = v; setFormData(p => ({...p, items: newItems})); }} /></td>
                                                            <td className="p-1 truncate"><EditableField value={q.link} onSave={v => { const newItems = [...formData.items]; newItems[index].quotes[qIndex].link = v; setFormData(p => ({...p, items: newItems})); }} /></td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                             </table>
                                        </div>
                                    </div>
                                ))}

                                <div className="mt-4" style={{pageBreakInside: 'avoid'}}><h5 className="font-bold mb-1 border-t-2 border-b-2 py-1">JUSTIFICATION FOR INCLUSION</h5><div className="border border-gray-400 p-2 min-h-[100px]"><EditableField value={formData.justification} onSave={v => setFormData(p => ({...p, justification: v}))} isTextarea rows={4} className="text-sm p-1" /></div></div>
                                <div className="mt-12 text-sm flex justify-around items-end" style={{pageBreakInside: 'avoid'}}>
                                    <div className="text-center"><p>Requested by:</p><p className="font-bold uppercase pt-12 border-b-2 border-black px-8"><EditableField value={formData.requestingUser} onSave={v => setFormData(p => ({...p, requestingUser: v}))} className="text-center font-bold uppercase" /></p><p>(End-User / Requesting Personnel)</p></div>
                                    <div className="text-center"><p>Approved by:</p><p className="font-bold uppercase pt-12 border-b-2 border-black px-8">&nbsp;</p><p>(Head of the Procuring Entity / Department Head)</p></div>
                                </div>
                            </div>
                        </div>
                    </main>
                ) : (
                    <form onSubmit={handleGeneratePreview} className="flex-grow p-6 overflow-y-auto space-y-4">
                        {formError && <p className="text-red-600 bg-red-50 p-3 rounded-md text-sm">{formError}</p>}
                        <div className="p-4 bg-gray-50 border rounded-lg">
                            <h4 className="text-base font-bold text-gray-700 mb-2">Requester Information</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><label className="text-sm font-semibold text-gray-600">Requesting Department*</label><input type="text" name="requestingDept" value={formData.requestingDept} onChange={handleChange} className="w-full p-2 border rounded-md" required /></div>
                                <div><label className="text-sm font-semibold text-gray-600">Requested by (Full Name)*</label><input type="text" name="requestingUser" value={formData.requestingUser} onChange={handleChange} className="w-full p-2 border rounded-md" required /></div>
                            </div>
                        </div>

                        {formData.items.map((item, index) => (
                            <div key={index} className="p-4 border border-orange-200 rounded-lg space-y-3 relative">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-base font-bold text-orange-700">Item #{index + 1}</h4>
                                    {formData.items.length > 1 && <button type="button" onClick={() => removeItem(index)} className="text-red-500 hover:text-red-700 text-xs font-bold">Remove Item</button>}
                                </div>
                                <div><label className="text-sm font-semibold text-gray-600">Item Name*</label><input type="text" name="itemName" value={item.itemName} onChange={(e) => handleItemChange(index, e)} className="w-full p-2 border rounded-md" required /></div>
                                <div className="relative">
                                    <label className="text-sm font-semibold text-gray-600">Description & Technical Specs</label>
                                    <button type="button" onClick={() => handleGenerateDescription(index)} disabled={item.descriptionLoading || !item.itemName.trim()} className="absolute top-0 right-0 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 font-semibold px-2 py-1 rounded-full disabled:opacity-50"> {item.descriptionLoading ? 'Generating...' : 'Generate with AI ✨'} </button>
                                    <textarea name="description" value={item.description} onChange={(e) => handleItemChange(index, e)} className="w-full p-2 border rounded-md mt-1" rows={2} placeholder="AI-generated description will appear here..."></textarea>
                                    <textarea name="techSpecs" value={item.techSpecs} onChange={(e) => handleItemChange(index, e)} className="w-full p-2 border rounded-md mt-1" rows={3} placeholder="AI-generated tech specs will appear here..."></textarea>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div><label className="text-sm font-semibold text-gray-600">Category*</label><select value={item.isNewCategory ? '--new--' : item.category} onChange={(e) => handleCategoryChange(index, e)} className="w-full p-2 border rounded-md" required={!item.isNewCategory}>{categories.map(c => <option key={c} value={c}>{c}</option>)}<option value="--new--">--- Add New Category ---</option></select></div>
                                    {item.isNewCategory && <div><label className="text-sm font-semibold text-gray-600">New Category Name*</label><input type="text" value={item.newCategoryName} onChange={e => handleNewCategoryNameChange(index, e.target.value)} className="w-full p-2 border rounded-md" required /></div>}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div><label className="text-sm font-semibold text-gray-600">Unit of Measure*</label><input type="text" name="uom" value={item.uom} onChange={(e) => handleItemChange(index, e)} className="w-full p-2 border rounded-md" required /></div>
                                    <div className="relative"><label className="text-sm font-semibold text-gray-600">UACS Code</label>
                                        <input type="text" name="uacsCode" value={item.uacsCode} onChange={(e) => handleItemChange(index, e)} className="w-full p-2 border rounded-md" />
                                        {item.uacsLoading && <span className="absolute right-2 top-7 text-xs text-gray-500">...</span>}
                                    </div>
                                </div>
                                <div className="border-t pt-4">
                                    <h5 className="text-sm font-bold text-gray-700 mb-2">Market Scoping / Price Justification*</h5>
                                    {item.quotes.map((quote, quoteIndex) => (
                                        <div key={quoteIndex} className="grid grid-cols-1 md:grid-cols-8 gap-2 mb-2 items-end">
                                            <div className="md:col-span-3"><label className="text-xs font-medium text-gray-500">Supplier</label><input type="text" value={quote.supplier} onChange={e => handleQuoteChange(index, quoteIndex, 'supplier', e.target.value)} className="w-full p-1 border rounded-md text-sm" placeholder="e.g., Shopee, NBM Hardware" required /></div>
                                            <div className="md:col-span-2"><label className="text-xs font-medium text-gray-500">Price (PHP)</label><input type="number" value={quote.price} onChange={e => handleQuoteChange(index, quoteIndex, 'price', e.target.value)} className="w-full p-1 border rounded-md text-sm" placeholder="e.g., 250.00" required step="0.01" /></div>
                                            <div className="md:col-span-2"><label className="text-xs font-medium text-gray-500">Source/Link</label><input type="url" value={quote.link} onChange={e => handleQuoteChange(index, quoteIndex, 'link', e.target.value)} className="w-full p-1 border rounded-md text-sm" placeholder="https://..." /></div>
                                            <button type="button" onClick={() => removeQuote(index, quoteIndex)} disabled={item.quotes.length <= 1} className="p-1 text-red-500 disabled:text-gray-300">Remove</button>
                                        </div>
                                    ))}
                                    <button type="button" onClick={() => addQuote(index)} disabled={item.quotes.length >= 3} className="text-sm text-blue-600 hover:underline disabled:text-gray-400">+ Add another quote</button>
                                </div>
                            </div>
                        ))}
                        <button type="button" onClick={addItem} className="w-full btn border-2 border-dashed border-orange-400 text-orange-600 font-bold py-2 rounded-lg hover:bg-orange-50">+ Add Another Item</button>
                        
                        <div className="relative">
                            <label className="text-sm font-semibold text-gray-600">Overall Justification for Inclusion*</label>
                            <button type="button" onClick={handleGenerateJustification} disabled={justificationLoading} className="absolute top-0 right-0 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 font-semibold px-2 py-1 rounded-full disabled:opacity-50">
                                {justificationLoading ? 'Generating...' : 'Generate with AI ✨'}
                            </button>
                            <textarea name="justification" value={formData.justification} onChange={handleChange} className="w-full p-2 border rounded-md mt-1" rows={3} required placeholder="Explain why these items are needed for government procurement, or click 'Generate with AI'..."></textarea>
                        </div>
                         <div className="pt-4 flex justify-end"> <button type="submit" className="btn bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-lg">Generate Request Form</button> </div>
                    </form>
                )}
            </div>
        </div>
    );
};

interface PurchaseRequestModalProps {
    selectedItems: MarketItem[];
    onClose: () => void;
    onRemoveItem: (itemId: number) => void;
    currentUser?: SessionUser;
}

const PurchaseRequestModal: React.FC<PurchaseRequestModalProps> = ({ selectedItems, onClose, onRemoveItem, currentUser }) => {
    const [quantities, setQuantities] = useState<Record<number, number>>(
        // FIX: Add explicit MarketItem type to the 'item' parameter to resolve TypeScript's 'unknown' type inference issue on the array method.
        selectedItems.reduce((acc, item: MarketItem) => ({ ...acc, [item.id]: item.quantity > 0 ? 1 : 0 }), {} as Record<number, number>)
    );
    const [details, setDetails] = useState(() => {
        const today = new Date();
        const prNum = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-XXXX`;
        return {
            lgu: 'Bacolod',
            department: currentUser?.department || '',
            section: '',
            prNo: prNum,
            date: today.toLocaleDateString('en-CA'),
            purpose: '',
            fund: ''
        };
    });

    const [signatories, setSignatories] = useState({
        certAvailabilityBy: { name: 'MARICAR P. QUIRO', title: 'Signature Over Printed Name of End-User' },
        certCertificationBy: { name: 'ATTY. OMAR FRANCIS P. DEMONTEVERDE', title: 'Head of the BAC Secretariat' },
        requestedBy: { name: 'MARICAR P. QUIRO', title: 'End User' },
        fundsAvailable: { name: 'JOSE MARIA T. GECOSALA', title: 'Acting City Treasurer' },
        approvedBy: { name: 'HON. GREG G. GASATAYA', title: 'City Mayor' },
    });
    
    const [loadingPurpose, setLoadingPurpose] = useState(false);
    const printableRef = useRef<HTMLDivElement>(null);

    const isCsePurchase = useMemo(() => {
        const cseCategories = [
            "Office Supplies", 
            "PS DBM Commonly used Supplies",
            "ACCOUNTABLE FORMS",
            "Janitorial and Cleaning Supplies",
            "IT Equipment and Peripherals"
        ];
        // FIX: Add explicit MarketItem type to the 'item' parameter to resolve TypeScript's 'unknown' type inference issue on the array method.
        return selectedItems.some((item: MarketItem) => cseCategories.includes(item.category));
    }, [selectedItems]);

    const handleGeneratePurpose = async () => {
        if (itemsInPr.length === 0 || !currentUser?.department) return;
        setLoadingPurpose(true);
        try {
            // FIX: Add explicit MarketItem type to the 'item' parameter to resolve TypeScript's 'unknown' type inference issue on the array method.
            const itemsForPrompt = itemsInPr.map((item: MarketItem) => ({ name: item.name, quantity: quantities[item.id] || 1 }));
            const generatedPurpose = await generatePurchasePurpose(itemsForPrompt, currentUser.department);
            setDetails(prev => ({ ...prev, purpose: generatedPurpose }));
        } catch (error) {
            console.error("Failed to generate purpose:", error);
            setDetails(prev => ({...prev, purpose: "For the operational needs of the requesting department."}));
        } finally {
            setLoadingPurpose(false);
        }
    };

    useEffect(() => {
        if (selectedItems.length > 0) {
            handleGeneratePurpose();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedItems]);

    const handleQuantityChange = (itemId: number, qty: string) => {
        const newQty = parseInt(qty, 10);
        if (!isNaN(newQty) && newQty >= 0) {
            setQuantities(prev => ({ ...prev, [itemId]: newQty }));
        }
    };
    
    const handleDetailChange = (field: keyof typeof details, value: string) => {
        setDetails(prev => ({ ...prev, [field]: value }));
    };

    const handleSignatoryChange = (role: keyof typeof signatories, field: 'name' | 'title', value: string) => {
        setSignatories(prev => ({ ...prev, [role]: { ...prev[role], [field]: value }}));
    };

    const itemsInPr = useMemo(() => {
        // FIX: Add explicit MarketItem type to the 'item' parameter to resolve TypeScript's 'unknown' type inference issue on the array method.
        return selectedItems.filter((item: MarketItem) => (quantities[item.id] || 0) > 0);
    }, [selectedItems, quantities]);
    
    const totalPages = Math.ceil(itemsInPr.length / 14) || 1;

    const grandTotal = useMemo(() => {
        // FIX: Add explicit MarketItem type to the 'item' parameter to resolve TypeScript's 'unknown' type inference issue on the array method.
        return itemsInPr.reduce((total, item: MarketItem) => total + item.price * (quantities[item.id] || 0), 0);
    }, [itemsInPr, quantities]);
    
    const handleDownloadPdf = async () => {
        const printableArea = printableRef.current;
        if (!printableArea || !window.html2canvas || !window.jspdf) {
            alert('PDF export failed. A required library may not be loaded.');
            return;
        }
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
        await new Promise(resolve => setTimeout(resolve, 50));
    
        document.body.classList.add('is-printing');
    
        try {
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({ orientation: 'p', unit: 'in', format: [13, 8.5] }); // Folio portrait
    
            const onclone = (clonedDoc: Document) => {
                clonedDoc.querySelectorAll('.no-print-input').forEach(el => {
                    const inputEl = el as HTMLInputElement | HTMLTextAreaElement;
                    const span = clonedDoc.createElement('span');
                    span.textContent = inputEl.value;
                    const computedStyle = window.getComputedStyle(inputEl);
                    span.style.font = computedStyle.font;
                    span.style.color = 'black';
                    inputEl.parentNode?.replaceChild(span, inputEl);
                });
            };
    
            const pages = printableArea.querySelectorAll('.print-page');
    
            for (let i = 0; i < pages.length; i++) {
                const page = pages[i] as HTMLElement;
                const canvas = await window.html2canvas(page, { 
                    scale: 3, 
                    useCORS: true,
                    onclone: onclone
                });
                const imgData = canvas.toDataURL('image/png');
                
                if (i > 0) {
                    pdf.addPage([13, 8.5], 'p');
                }
                pdf.addImage(imgData, 'PNG', 0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight(), undefined, 'FAST');
            }
    
            pdf.save(`Purchase_Request_${details.prNo || 'document'}.pdf`);
        } catch (error) {
            console.error("PDF generation failed:", error);
        } finally {
            document.body.classList.remove('is-printing');
        }
    };
    
    const PRPage: React.FC<{ pageIndex: number }> = ({ pageIndex }) => {
        const startIndex = pageIndex * 14;
        const endIndex = startIndex + 14;
        const pageItems = itemsInPr.slice(startIndex, endIndex);
        const isLastPage = pageIndex === totalPages - 1;
        const carriedOverSubtotal = useMemo(() => {
            if (isLastPage) return 0;
            // FIX: Add explicit MarketItem type to the 'item' parameter to resolve TypeScript's 'unknown' type inference issue on the array method.
            return itemsInPr.slice(0, endIndex).reduce((sum, item: MarketItem) => sum + item.price * (quantities[item.id] || 0), 0);
        }, [isLastPage, endIndex, itemsInPr, quantities]);
    
        return (
            <div className="bg-white mx-auto print-page relative" style={{ width: '8.5in', minHeight: '13in', padding: '0.5in', fontFamily: "'Times New Roman', Times, serif" }}>
                <div className="border-2 border-black p-2 relative">
                    <div className="flex justify-between items-start">
                        <div className="w-1/4">
                            <img src={bacolodCityLogo} alt="Bacolod City Logo" className="h-20 w-20" />
                        </div>
                        <div className="text-center w-1/2">
                            <p>Republic of the Philippines</p>
                            <p className="font-bold">CITY OF BACOLOD</p>
                            <p>Bacolod City, Philippines</p>
                            <h4 className="font-bold text-xl mt-4">PURCHASE REQUEST</h4>
                        </div>
                        <div className="w-1/4"></div>
                    </div>
                </div>

                <div className="border-2 border-black mt-1">
                    <table className="w-full text-xs">
                        <tbody>
                            <tr>
                                <td className="w-[15%] p-1 pb-2">LGU :</td>
                                <td className="w-[35%] p-1 pb-2 border-b border-black font-semibold">
                                    <EditableField value={details.lgu} onSave={v => handleDetailChange('lgu', v)} className="w-full !p-0 text-center" />
                                </td>
                                <td className="w-[15%] p-1 pb-2 text-left">Fund :</td>
                                <td className="w-[35%] p-1 pb-2 border-b border-black font-semibold">
                                    <EditableField value={details.fund} onSave={v => handleDetailChange('fund', v)} className="w-full !p-0 text-center" />
                                </td>
                            </tr>
                            <tr>
                                <td className="p-1 pb-2">Department :</td>
                                <td className="p-1 pb-2 border-b border-black font-semibold">
                                    <EditableField value={details.department} onSave={v => handleDetailChange('department', v)} className="w-full !p-0 text-center" />
                                </td>
                                <td className="p-1 pb-2 text-left">Date :</td>
                                <td className="p-1 pb-2 border-b border-black font-semibold">
                                    <EditableField value={details.date} onSave={v => handleDetailChange('date', v)} className="w-full !p-0 text-center" />
                                </td>
                            </tr>
                            <tr>
                                <td className="p-1 pb-2">Section :</td>
                                <td className="p-1 pb-2 border-b border-black font-semibold">
                                    <EditableField value={details.section} onSave={v => handleDetailChange('section', v)} className="w-full !p-0 text-center" />
                                </td>
                                <td className="p-1 pb-2 text-left">PR No. :</td>
                                <td className="p-1 pb-2 border-b border-black font-semibold">
                                    <EditableField value={details.prNo} onSave={v => handleDetailChange('prNo', v)} className="w-full !p-0 text-center" />
                                </td>
                            </tr>
                            <tr>
                                <td className="p-1 pb-2"></td>
                                <td className="p-1"></td>
                                <td className="p-1 pb-2 text-left">FPP :</td>
                                <td className="p-1 pb-2 border-b border-black font-semibold">&nbsp;</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <table className="w-full mt-1 text-xs border-collapse border border-black">
                    <thead className="bg-white font-bold">
                        <tr>
                            <th className="border border-black p-1 w-[8%] text-center align-middle">Item No.</th>
                            <th className="border border-black p-1 w-[8%] text-center align-middle">Unit</th>
                            <th className="border border-black p-1 w-[42%] text-center align-middle">Item Description</th>
                            <th className="border border-black p-1 w-[8%] text-center align-middle">Quantity</th>
                            <th className="border border-black p-1 w-[12%] text-center align-middle">Unit Cost</th>
                            <th className="border border-black p-1 w-[12%] text-center align-middle">Total Cost</th>
                            <th className="border border-black p-1 w-[12%] no-print text-center align-middle">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* FIX: Add explicit MarketItem type to the 'item' parameter to resolve TypeScript's 'unknown' type inference issue on the array method. */}
                        {pageItems.map((item: MarketItem, index: number) => {
                            const itemNumber = startIndex + index + 1; const quantity = quantities[item.id] || 0; const totalCost = item.price * quantity;
                            return (<tr key={item.id}><td className="border border-black p-2 text-center align-middle">{itemNumber}</td><td className="border border-black p-2 text-center align-middle">{item.unit}</td><td className="border border-black p-2 text-left align-middle">{item.name}</td><td className="border border-black p-2 text-center align-middle"><input type="number" value={quantity} onChange={e => handleQuantityChange(item.id, e.target.value)} className="w-full text-center bg-transparent no-print-input" /></td><td className="border border-black p-2 text-right align-middle">P {item.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td><td className="border border-black p-2 text-right align-middle">P {totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td><td className="border border-black p-2 text-center align-middle no-print"><button onClick={() => onRemoveItem(item.id)} className="text-red-500 hover:text-red-700 font-bold text-lg" title="Remove Item">&times;</button></td></tr>);
                        })}
                        {isLastPage && itemsInPr.length > 0 && <tr><td colSpan={7} className="border-x border-black p-2 h-10 text-center italic align-middle">*** nothing follows ***</td></tr>}
                        {Array.from({ length: Math.max(0, 14 - pageItems.length - (isLastPage && itemsInPr.length > 0 ? 1 : 0)) }).map((_, index) => (<tr key={`empty-${index}`} className="h-10"><td className="border border-black p-2 align-middle">&nbsp;</td><td className="border border-black p-2 align-middle">&nbsp;</td><td className="border border-black p-2 align-middle">&nbsp;</td><td className="border border-black p-2 align-middle">&nbsp;</td><td className="border border-black p-2 align-middle">&nbsp;</td><td className="border border-black p-2 align-middle">&nbsp;</td><td className="border border-black p-2 no-print align-middle">&nbsp;</td></tr>))}
                    </tbody>
                    <tfoot>
                        {isLastPage ? (<tr><td colSpan={5} className="border border-black p-1 text-right font-bold text-base">GRAND TOTAL</td><td className="border border-black p-1 text-right font-bold text-base">P {grandTotal.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td><td className="border border-black no-print"></td></tr>) : (<tr><td colSpan={5} className="border border-black p-1 text-right font-bold text-base">Subtotal (carried over to next page)...</td><td className="border border-black p-1 text-right font-bold text-base">P {carriedOverSubtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td><td className="border border-black no-print"></td></tr>)}
                    </tfoot>
                </table>
                <div className="mt-2 p-1 border border-black text-xs h-24 relative"><strong>Purpose:</strong><button onClick={handleGeneratePurpose} disabled={loadingPurpose} className="absolute top-1 right-1 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 font-semibold px-2 py-1 rounded-full disabled:opacity-50 flex items-center gap-1 no-print"> {loadingPurpose ? 'Generating...' : '✨ Generate with AI'} </button><EditableField value={details.purpose} onSave={v => handleDetailChange('purpose', v)} isTextarea={true} className="!p-1" /></div>
                <div className="mt-2 flex text-[9pt] gap-2 items-stretch" style={{ pageBreakInside: 'avoid' }}>
                    <div className="w-1/2 border border-black p-2 flex flex-col mr-1">
                        <p className="font-bold text-center text-[10pt]">CERTIFICATION OF AVAILABILITY</p>
                        {isCsePurchase ? (
                            <>
                                <p className="text-justify text-[7pt] mt-1 indent-4 flex-grow">
                                    This is to certify that the items listed herein are not available in the Procurement Service - Department of Budget and Management (PS-DBM) at the time of request. Furthermore, the technical specifications of the Common-use Supplies and Equipment (CSE) are not sufficient to meet the specific needs and requirements of the office. Pursuing conventional procurement methods is requested to promote efficiency and economy.
                                </p>
                                <div className="mt-auto text-center pt-4">
                                    <div className="inline-block border-b border-black w-4/5 pb-1">
                                        <EditableField value={signatories.certAvailabilityBy.name} onSave={v => handleSignatoryChange('certAvailabilityBy', 'name', v)} className="font-bold text-center uppercase text-[9pt]" />
                                    </div>
                                    <p className="text-[8pt] mt-1">
                                        <EditableField value={signatories.certAvailabilityBy.title} onSave={v => handleSignatoryChange('certAvailabilityBy', 'title', v)} className="text-center" />
                                    </p>
                                </div>
                            </>
                        ) : (
                            <div className="flex-grow flex items-center justify-center">
                                <p className="text-center text-[8pt] italic p-4 text-gray-600">
                                    Not applicable. The requested items are not considered Common-Use Supplies and Equipment (CSE).
                                </p>
                            </div>
                        )}
                    </div>
                    <div className="w-1/2 border border-black p-2 flex flex-col"><p className="font-bold text-center text-[10pt]">CERTIFICATION</p><p className="text-center text-[8pt] mt-2 flex-grow flex items-center justify-center">This is to certify that the items listed in the PR/OBR are included in the Annual Procurement Plan (APP).</p><div className="mt-auto text-center pt-4"><div className="inline-block border-b border-black w-full pb-1"><EditableField value={signatories.certCertificationBy.name} onSave={v => handleSignatoryChange('certCertificationBy', 'name', v)} className="text-center font-bold uppercase text-[8pt] tracking-tighter whitespace-nowrap" /></div><div className="mt-1"><EditableField value={signatories.certCertificationBy.title} onSave={v => handleSignatoryChange('certCertificationBy', 'title', v)} className="text-center text-[8pt]" /></div></div></div>
                </div>
                <div className="flex mt-2 text-xs gap-2" style={{pageBreakInside: 'avoid'}}>
                    <div className="w-1/3 border border-black p-2 flex flex-col justify-between" style={{ minHeight: '100px' }}><p className="text-left text-[8pt]">Requested By:</p><div className="text-center"><div className="h-8"><EditableField value={signatories.requestedBy.name} onSave={v => handleSignatoryChange('requestedBy', 'name', v)} className="font-bold text-center uppercase" /></div><div className="h-4 border-t border-black mx-4 mt-1"><EditableField value={signatories.requestedBy.title} onSave={v => handleSignatoryChange('requestedBy', 'title', v)} className="text-center" /></div></div></div>
                    <div className="w-1/3 border border-black p-2 flex flex-col justify-between" style={{ minHeight: '100px' }}><p className="text-left text-[8pt]">Funds Available:</p><div className="text-center"><div className="h-8"><EditableField value={signatories.fundsAvailable.name} onSave={v => handleSignatoryChange('fundsAvailable', 'name', v)} className="font-bold text-center uppercase" /></div><div className="h-4 border-t border-black mx-4 mt-1"><EditableField value={signatories.fundsAvailable.title} onSave={v => handleSignatoryChange('fundsAvailable', 'title', v)} className="text-center" /></div></div></div>
                    <div className="w-1/3 border border-black p-2 flex flex-col justify-between" style={{ minHeight: '100px' }}><p className="text-left text-[8pt]">Approved By:</p><div className="text-center"><div className="h-8"><EditableField value={signatories.approvedBy.name} onSave={v => handleSignatoryChange('approvedBy', 'name', v)} className="font-bold text-center uppercase" /></div><div className="h-4 border-t border-black mx-4 mt-1"><EditableField value={signatories.approvedBy.title} onSave={v => handleSignatoryChange('approvedBy', 'title', v)} className="text-center" /></div></div></div>
                </div>
                <div className="absolute bottom-4 right-8 text-xs italic text-gray-700">Page {pageIndex + 1} of {totalPages}</div>
            </div>
        )
    };
    
    return (
        <div className="fixed inset-0 bg-black/60 z-[51] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-gray-100 rounded-lg shadow-2xl w-full max-w-6xl flex flex-col h-[95vh]" onClick={e => e.stopPropagation()}>
                <header className="p-3 bg-white border-b flex justify-between items-center no-print flex-shrink-0">
                     <h3 className="text-lg font-bold text-gray-800">Generate Purchase Request (Non-CSE)</h3>
                     <div className="flex items-center gap-4">
                        <button onClick={handleDownloadPdf} className="btn text-sm bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md">Download PDF</button>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-900 text-2xl">&times;</button>
                     </div>
                </header>
                <main className="flex-grow overflow-y-auto p-4">
                    <div ref={printableRef}>
                        {Array.from({ length: totalPages }).map((_, index) => (
                            <PRPage key={index} pageIndex={index} />
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
};


// ... (rest of the CatalogTab component remains unchanged)
const ProductPreviewModal: React.FC<{ item: MarketItem; onClose: () => void; onAddToPr: (itemId: number) => void; isSelected: boolean; onDownloadImage: (imageUrl: string, itemName: string) => void; }> = ({ item, onClose, onAddToPr, isSelected, onDownloadImage }) => {
    const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'sourcing'>('description');
    const DownloadIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>);
    const isPsDbmItem = item.category === "PS DBM Commonly used Supplies";
    
    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 lg:p-8" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col lg:flex-row overflow-hidden relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-3 right-3 z-20 bg-gray-100/80 hover:bg-gray-200 p-2 rounded-full text-gray-800">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <div className="w-full lg:w-1/2 h-1/2 lg:h-full bg-gray-100 p-8 flex items-center justify-center relative group">
                    <img 
                        src={item.imageUrl || 'https://i.ibb.co/x7P39M6/placeholder-thumbnail.png'} 
                        alt={item.name} 
                        className="max-w-full max-h-full object-contain" 
                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://i.ibb.co/x7P39M6/placeholder-thumbnail.png'; }} 
                    />
                     <button onClick={() => onDownloadImage(item.imageUrl || '', item.name)} className="absolute top-4 right-14 bg-white/80 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity text-gray-700 hover:bg-orange-600 hover:text-white">
                        <DownloadIcon />
                    </button>
                </div>
                <div className="w-full lg:w-1/2 h-1/2 lg:h-full p-8 flex flex-col overflow-y-auto">
                    <h3 className="text-3xl font-bold text-gray-800">{item.name}</h3>
                    <p className="text-5xl font-extrabold text-blue-600 my-4">PHP {item.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
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
                    
                    <div className="mt-6 border-t pt-4 flex-grow flex flex-col">
                        <div className="flex border-b">
                            <button onClick={() => setActiveTab('description')} className={`px-4 py-2 text-sm font-semibold transition-colors ${activeTab === 'description' ? 'border-b-2 border-orange-500 text-orange-600' : 'text-gray-500 hover:text-gray-700'}`}>Description</button>
                            <button onClick={() => setActiveTab('specs')} className={`px-4 py-2 text-sm font-semibold transition-colors ${activeTab === 'specs' ? 'border-b-2 border-orange-500 text-orange-600' : 'text-gray-500 hover:text-gray-700'}`}>Specifications</button>
                            <button onClick={() => setActiveTab('sourcing')} className={`px-4 py-2 text-sm font-semibold transition-colors ${activeTab === 'sourcing' ? 'border-b-2 border-orange-500 text-orange-600' : 'text-gray-500 hover:text-gray-700'}`}>Sourcing</button>
                        </div>
                         <div className="py-4 text-sm text-gray-700 flex-grow">
                             {activeTab === 'description' && <p>{item.description}</p>}
                             {activeTab === 'specs' && <p className="whitespace-pre-wrap font-mono text-xs">{item.technicalSpecifications || 'No technical specifications available.'}</p>}
                             {activeTab === 'sourcing' && (
                                <div>
                                    {item.referenceLinks && item.referenceLinks.length > 0 && item.referenceLinks[0] ? (
                                        <a href={item.referenceLinks[0]} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View Market Scoping Document</a>
                                    ) : (
                                        <p>No specific market scoping document is linked to this item.</p>
                                    )}
                                </div>
                             )}
                        </div>
                    </div>

                    <div className="mt-auto pt-6 flex justify-end items-center gap-3">
                        <button 
                            onClick={() => onAddToPr(item.id)}
                            title={isSelected ? "Item is in your list" : "Add this item to your list"}
                            className={`btn font-bold py-2 px-5 rounded-lg text-white ${isSelected ? 'bg-green-500 hover:bg-green-600' : 'bg-orange-500 hover:bg-orange-600'}`}
                        >
                            {isSelected ? 'Added ✓' : (isPsDbmItem ? 'Add to APR' : 'Add to PR')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


// ... (rest of the CatalogTab component remains unchanged)
const PieChartAnalytics: React.FC<{
    marketData: Record<string, MarketItem[]>;
    marketCategories: string[];
    activeCategory: string;
    setActiveCategory: (category: string) => void;
}> = ({ marketData, marketCategories, activeCategory, setActiveCategory }) => {
    const analyticsData = useMemo(() => {
        const data = marketCategories.map(category => ({
            name: category,
            count: marketData[category]?.length || 0,
        })).sort((a, b) => b.count - a.count);
        
        const totalItems = data.reduce((sum, item) => sum + item.count, 0);
        const maxCount = Math.max(...data.map(item => item.count));

        return { data, totalItems, maxCount };
    }, [marketData, marketCategories]);

    const colors = useMemo(() => ['#f97316', '#fb923c', '#fdba74', '#fed7aa', '#ffedd5',
        '#ea580c', '#d97706', '#c2410c', '#b45309', '#9a3412',
        '#7c2d12', '#78350f', '#451a03', '#6b21a8', '#a855f7', '#c084fc', '#d8b4fe'
    ], []);

    const chartData = useMemo(() => {
        if (analyticsData.totalItems === 0) return [];
        return analyticsData.data.map(item => ({
            name: item.name,
            count: item.count,
            percentage: (item.count / analyticsData.totalItems) * 100,
        }));
    }, [analyticsData]);

    const getCoordinatesForPercent = useCallback((percent: number) => {
        const x = Math.cos(2 * Math.PI * percent);
        const y = Math.sin(2 * Math.PI * percent);
        return [x, y];
    }, []);

    const slices = useMemo(() => {
        let cumulativePercent = 0;
        return chartData.map((d, i) => {
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
    }, [chartData, colors, getCoordinatesForPercent]);

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

export const CatalogTab: React.FC<CatalogTabProps> = ({ isVisible, onClose, isShared = false, startMaximized = false, currentUser }) => {
    // Window State
    const { 
        nodeRef, 
        isMaximized, 
        isMinimized, 
        getWindowStyle, 
        handleMouseDown, 
        toggleMaximize, 
        toggleMinimize,
        setMaximized
    } = useDraggableWindow(isVisible, { width: 1200, height: 800 });

    useEffect(() => {
        if (isVisible && startMaximized) {
            setMaximized(true);
        }
    }, [isVisible, startMaximized, setMaximized]);

    // Catalog State
    const [marketDataState, setMarketDataState] = useState<Record<string, MarketItem[]>>(marketData);
    const [marketCategoriesState, setMarketCategoriesState] = useState<string[]>(marketCategories);
    const [previewItem, setPreviewItem] = useState<MarketItem | null>(null);
    const [selectedItemIds, setSelectedItemIds] = useState<Set<number>>(new Set());
    const [isPrModalOpen, setIsPrModalOpen] = useState(false);
    const [isAprModalOpen, setIsAprModalOpen] = useState(false);
    const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
    
    // Filtering & Sorting State
    const [activeCategory, setActiveCategory] = useState<string>('All Categories');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [maxPrice, setMaxPrice] = useState(10000);
    const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 10000 });
    const [sortBy, setSortBy] = useState<'name' | 'price-asc' | 'price-desc'>('name');
    const [stockStatus, setStockStatus] = useState<'all' | 'in_stock' | 'out_of_stock'>('all');
    
    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 15;

    // Export State
    const [isExportingPdf, setIsExportingPdf] = useState(false);
    
    // AI Image Generation State
    const [generatedImages, setGeneratedImages] = useState<Record<number, string>>({});
    const [loadingImages, setLoadingImages] = useState<Set<number>>(new Set());
    
    // New Items Notification State
    const [showNewItemsBanner, setShowNewItemsBanner] = useState(true);
    const [showOnlyNew, setShowOnlyNew] = useState(false);
    
    const newItemsIds = useMemo(() => {
        const ids = new Set<number>();
        newlyAddedItems.forEach(item => {
            ids.add(item.id);
        });
        return ids;
    }, []);


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
        const allItems = Object.values(marketDataState).flat();
        if (allItems.length > 0) {
            const max = Math.ceil(Math.max(...allItems.map(item => item.price), 0));
            setMaxPrice(max);
            setPriceRange({ min: 0, max: max });
        }
    }, [marketDataState]);

    const totalCatalogItems = useMemo(() => Object.values(marketDataState).flat().length, [marketDataState]);

    const filteredItems = useMemo(() => {
        let items: MarketItem[] = activeCategory === 'All Categories'
            ? Object.values(marketDataState).flat()
            : (marketDataState[activeCategory] || []);

        if (showOnlyNew) {
            items = items.filter(item => newItemsIds.has(item.id));
        }

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
    }, [activeCategory, searchTerm, marketDataState, priceRange, sortBy, stockStatus, showOnlyNew, newItemsIds]);

    const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
    
    const paginatedItems = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredItems, currentPage]);

    useEffect(() => { setCurrentPage(1); }, [activeCategory, searchTerm, priceRange, sortBy, stockStatus, showOnlyNew]);
    
    const handleToggleSelection = (itemId: number) => {
        setSelectedItemIds(prev => {
            const newSelection = new Set(prev);
            if (newSelection.has(itemId)) {
                newSelection.delete(itemId);
            } else {
                const allItems = Object.values(marketDataState).flat();
                const item = allItems.find(i => i.id === itemId);
                if (item && item.category === "PS DBM Commonly used Supplies") {
                    alert("This is a PS DBM Common-Use Supply. It will be added to the APR list. Please use the 'Generate APR' button for these items.");
                }
                newSelection.add(itemId);
            }
            return newSelection;
        });
    };
    
    const selectedItems = useMemo(() => {
        const allItems = Object.values(marketDataState).flat();
        return Array.from(selectedItemIds)
            .map(id => allItems.find(item => item.id === id))
            .filter((item): item is MarketItem => Boolean(item));
    }, [selectedItemIds, marketDataState]);

    const selectedPsmItems = useMemo(() => {
        // FIX: Add explicit MarketItem type to the 'item' parameter to resolve TypeScript's 'unknown' type inference issue on the array method.
        return selectedItems.filter((item: MarketItem) => item.category === "PS DBM Commonly used Supplies");
    }, [selectedItems]);

    const selectedNonPsmItems = useMemo(() => {
        // FIX: Add explicit MarketItem type to the 'item' parameter to resolve TypeScript's 'unknown' type inference issue on the array method.
        return selectedItems.filter((item: MarketItem) => item.category !== "PS DBM Commonly used Supplies");
    }, [selectedItems]);
    
    const handleClosePrModal = () => {
        setIsPrModalOpen(false);
        setSelectedItemIds(prev => {
            const newSelection = new Set(prev);
            // FIX: Add explicit MarketItem type to the 'item' parameter to resolve TypeScript's 'unknown' type inference issue on the array method.
            selectedNonPsmItems.forEach((item: MarketItem) => newSelection.delete(item.id));
            return newSelection;
        });
    };

    const handleCloseAprModal = () => {
        setIsAprModalOpen(false);
        setSelectedItemIds(prev => {
            const newSelection = new Set(prev);
            // FIX: Add explicit MarketItem type to the 'item' parameter to resolve TypeScript's 'unknown' type inference issue on the array method.
            selectedPsmItems.forEach((item: MarketItem) => newSelection.delete(item.id));
            return newSelection;
        });
    };

    const handleRemoveItemFromPr = (itemId: number) => {
        setSelectedItemIds(prev => {
            const newSelection = new Set(prev);
            newSelection.delete(itemId);
            return newSelection;
        });
    };

    const handleExportExcel = () => {
        const escapeCsvCell = (cellData: any) => {
            const stringData = String(cellData || '');
            if (stringData.includes(',') || stringData.includes('"') || stringData.includes('\n')) {
                return `"${stringData.replace(/"/g, '""')}"`;
            }
            return stringData;
        };

        const headers = ['Category', 'Item Code', 'Name', 'Description', 'Unit', 'Price', 'Stock Status', 'UACS Code', 'Technical Specifications'];
        const rows = marketCategoriesState.flatMap(category => {
            const items = marketDataState[category] || [];
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
                styles: { fontSize: 8, cellPadding: 0.05, overflow: 'linebreak', font: 'helvetica' },
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
            const psDbmItemsInFilter = filteredItems.some(item => item.category === "PS DBM Commonly used Supplies");
            if (psDbmItemsInFilter) {
                 alert("PS-DBM items will also be selected. These will be added to the APR list, while others go to the PR list.");
            }
            const allIds = new Set(filteredItems.map(item => item.id));
            setSelectedItemIds(allIds);
        }
    };

    const handleSyncPrices = () => {
        alert("Price Synchronization Feature:\n\nThis feature is designed to fetch real-time prices from whitelisted market sources (e.g., bacolodpages.com) and update the catalog, including applying the standard 35% markup.\n\nNOTE: A backend server is required for this functionality to handle cross-origin requests and data parsing reliably. In this frontend-only version, prices are static. The items you requested have been added with the markup applied based on the latest available data.");
    };
    
    if (!isVisible && !isShared) return null;
    
    const containerClasses = isShared ? "relative bg-white flex flex-col w-full h-full" : "fixed bg-white rounded-lg shadow-2xl flex flex-col z-40 overflow-hidden border border-gray-300 transition-all duration-300 ease-in-out";

    return (
        <div ref={nodeRef} className={containerClasses} style={getWindowStyle()}>
            {/* Window Header */}
            {!isShared && (
                <div onMouseDown={handleMouseDown} className={`flex items-center justify-between p-2 bg-gray-100 border-b border-gray-200 flex-shrink-0 ${isMaximized ? '' : 'cursor-move'}`}>
                    <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
                        <h2 className="text-sm font-bold text-gray-700 select-none">Procurement Catalog</h2>
                    </div>
                    <div className="flex items-center space-x-1">
                        <button onClick={toggleMinimize} className="p-1.5 rounded-full hover:bg-gray-200"><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg></button>
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
                                <li>
                                    <button onClick={() => setActiveCategory('All Categories')} className={`w-full text-left px-3 py-1.5 rounded-md text-sm font-medium transition-all ${activeCategory === 'All Categories' ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-orange-100'}`}>
                                        All Categories ({totalCatalogItems})
                                    </button>
                                </li>
                                {marketCategoriesState.map(cat => (
                                    <li key={cat}><button onClick={() => setActiveCategory(cat)} className={`w-full text-left px-3 py-1.5 rounded-md text-sm font-medium transition-all ${activeCategory === cat ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-orange-100'}`}>{cat} ({marketDataState[cat]?.length || 0})</button></li>
                                ))}
                            </ul>
                        </div>
                         <div className="p-4 bg-white rounded-lg shadow-sm border">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="show-new-items"
                                    checked={showOnlyNew}
                                    onChange={(e) => {
                                        setShowOnlyNew(e.target.checked);
                                        if (e.target.checked) {
                                            setActiveCategory('All Categories');
                                        }
                                    }}
                                    className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                />
                                <label htmlFor="show-new-items" className="ml-2 text-sm font-medium text-gray-700">
                                    ✨ Show Only New Items ({newItemsIds.size})
                                </label>
                            </div>
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
                             <div className="p-4 bg-white rounded-lg shadow-sm border space-y-2">
                                <button onClick={() => setIsAprModalOpen(true)} disabled={selectedPsmItems.length === 0} className="btn w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed">Generate APR (PS-DBM) ({selectedPsmItems.length})</button>
                                <button onClick={() => setIsPrModalOpen(true)} disabled={selectedNonPsmItems.length === 0} className="btn w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed">Generate PR (Non-CSE) ({selectedNonPsmItems.length})</button>
                                <button onClick={() => setSelectedItemIds(new Set())} disabled={selectedItemIds.size === 0} className="btn w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed">Clear Selection</button>
                            </div>
                        )}
                    </aside>
                    <main className="lg:col-span-3 space-y-4">
                        {showNewItemsBanner && newItemsIds.size > 0 && !showOnlyNew && (
                            <div className="bg-orange-100 border-l-4 border-orange-500 text-orange-800 p-4 rounded-r-lg shadow-md flex justify-between items-center transition-all duration-300">
                                <div>
                                    <p className="font-bold flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                        Catalog Update!
                                    </p>
                                    <p className="text-sm mt-1">{newItemsIds.size} new items have been added.
                                        <button
                                            onClick={() => {
                                                setShowOnlyNew(true);
                                                setActiveCategory('All Categories');
                                                setShowNewItemsBanner(false);
                                            }}
                                            className="font-semibold underline hover:text-orange-900 ml-2"
                                        >
                                            View them now
                                        </button>
                                    </p>
                                </div>
                                <button onClick={() => setShowNewItemsBanner(false)} className="text-orange-600 hover:text-orange-800 font-bold text-2xl p-2">&times;</button>
                            </div>
                        )}
                        <PieChartAnalytics 
                            marketData={marketDataState}
                            marketCategories={marketCategoriesState}
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
                        
                        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                            <table className="min-w-full text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="p-3 text-left font-semibold text-gray-600">Item Name</th>
                                        <th className="p-3 text-left font-semibold text-gray-600">Item Code</th>
                                        <th className="p-3 text-left font-semibold text-gray-600">Category</th>
                                        <th className="p-3 text-right font-semibold text-gray-600">Price</th>
                                        <th className="p-3 text-center font-semibold text-gray-600">Stock</th>
                                        <th className="p-3 text-center font-semibold text-gray-600">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {paginatedItems.map(item => {
                                        const isSelected = selectedItemIds.has(item.id);
                                        const isNew = newItemsIds.has(item.id);
                                        return (
                                            <tr key={item.id} className="hover:bg-orange-50">
                                                <td className="p-3 font-bold text-gray-800 cursor-pointer" onClick={() => setPreviewItem(item)}>
                                                    <div className="flex items-center gap-2">
                                                        {item.name}
                                                        {isNew && (
                                                            <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none">NEW</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-3 text-gray-500 font-mono cursor-pointer" onClick={() => setPreviewItem(item)}>{item.itemCode || 'N/A'}</td>
                                                <td className="p-3 text-gray-600 cursor-pointer" onClick={() => setPreviewItem(item)}>{item.category}</td>
                                                <td className="p-3 text-right font-mono text-blue-600 font-semibold cursor-pointer" onClick={() => setPreviewItem(item)}>PHP {item.price.toFixed(2)}</td>
                                                <td className="p-3 text-center cursor-pointer" onClick={() => setPreviewItem(item)}>
                                                    <span className={`px-2 py-1 rounded-full text-white text-xs font-bold ${item.quantity > 0 ? 'bg-green-500' : 'bg-red-500'}`}>
                                                        {item.quantity > 0 ? 'Available' : 'Out of Stock'}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-center">
                                                    <button 
                                                        onClick={() => handleToggleSelection(item.id)}
                                                        className={`btn text-xs font-bold py-1 px-3 rounded-full ${isSelected ? 'bg-green-500 text-white' : 'bg-orange-100 text-orange-700'}`}
                                                    >
                                                        {isSelected ? 'Selected' : 'Select'}
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Pagination */}
                        <div className="flex justify-between items-center mt-4">
                            <p className="text-sm text-gray-600">Showing {paginatedItems.length} of {filteredItems.length} items</p>
                            <div className="flex gap-1">
                                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 border rounded-md disabled:opacity-50">‹</button>
                                <span className="px-3 py-1 text-sm">Page {currentPage} of {totalPages}</span>
                                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 border rounded-md disabled:opacity-50">›</button>
                            </div>
                        </div>

                    </main>
                </div>
            </div>
            {previewItem && (
                <ProductPreviewModal 
                    item={previewItem} 
                    onClose={() => setPreviewItem(null)} 
                    onAddToPr={handleToggleSelection} 
                    isSelected={selectedItemIds.has(previewItem.id)}
                    onDownloadImage={handleDownloadImage}
                />
            )}
            {!isShared && isPrModalOpen && (
                <PurchaseRequestModal 
                    selectedItems={selectedNonPsmItems}
                    onClose={handleClosePrModal}
                    onRemoveItem={handleRemoveItemFromPr}
                    currentUser={currentUser}
                />
            )}
            {!isShared && isAprModalOpen && (
                <AgencyProcurementRequestModal
                    selectedItems={selectedPsmItems}
                    onClose={handleCloseAprModal}
                    onRemoveItem={handleRemoveItemFromPr}
                />
            )}
             {!isShared && isAddItemModalOpen && (
                <AddItemModal 
                    categories={marketCategoriesState}
                    onClose={() => setIsAddItemModalOpen(false)}
                />
            )}
        </div>
    );
};
