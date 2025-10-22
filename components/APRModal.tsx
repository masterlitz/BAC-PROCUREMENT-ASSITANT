
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { MarketItem } from '../../types';
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
  autoTable: (options: any) => jsPDFWithAutoTable;
}

const EditableField: React.FC<{ value: string, onSave: (value: string) => void, className?: string, isTextarea?: boolean, rows?: number }> = ({ value, onSave, className, isTextarea = false, rows = 1 }) => {
    const [currentValue, setCurrentValue] = useState(value);
    const ref = useRef<HTMLInputElement & HTMLTextAreaElement>(null);

    useEffect(() => { setCurrentValue(value); }, [value]);

    useEffect(() => {
        if (isTextarea && ref.current) {
            ref.current.style.height = 'auto';
            ref.current.style.height = `${ref.current.scrollHeight}px`;
        }
    }, [currentValue, isTextarea]);

    const commonProps = {
        ref: ref as any,
        value: currentValue,
        onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setCurrentValue(e.target.value),
        onBlur: () => onSave(currentValue),
        className: `w-full bg-transparent focus:bg-orange-50 focus:outline-none focus:ring-1 focus:ring-orange-300 rounded-sm p-0.5 no-print-input resize-none overflow-hidden ${className}`
    };

    return isTextarea ? <textarea {...commonProps} rows={rows} /> : <input type="text" {...commonProps} />;
};

interface APRModalProps {
    selectedItems: MarketItem[];
    onClose: () => void;
    onRemoveItem: (itemId: number) => void;
}

const AgencyProcurementRequestModal: React.FC<APRModalProps> = ({ selectedItems, onClose, onRemoveItem }) => {
    const [quantities, setQuantities] = useState<Record<number, number>>(
        selectedItems.reduce((acc, item) => ({ ...acc, [item.id]: item.quantity > 0 ? 1 : 0 }), {})
    );
    const [details, setDetails] = useState({
        agencyName: 'CITY OF BACOLOD',
        agencyAddress: 'Bacolod City Government Center',
        telNos: '(034) 432-3745',
        acctCode: '101',
        controlNo: new Date().getFullYear() + '-08-0001',
        psAprNo: '',
        datePrepared: new Date().toLocaleDateString('en-CA'),
        priceListNo: '',
        priceListDate: '',
        chargeAprNo: '',
        chargeDate: '',
        othersSpecify: '',
        propertyOfficer: 'GILDA F. LLUISMA',
        agencyHead: 'HON. GREG G. GASATAYA',
        fundsCheckNo: '',
        fundsAmount: '',
        fundsEnclosed: '',
    });
    
    const [signatories, setSignatories] = useState({
        accountant: { name: 'ATTY. JEREMAE ANN C. FLORENTINO, CPA', title: 'AGENCY CHIEF ACCOUNTANT' },
    });
    
    const [checkboxes, setCheckboxes] = useState({
        issueCommonUse: true,
        deliveryDoor: true,
        deliveryPickupFast: false,
        deliveryPickupSched: false,
        fundReduce: false,
        fundBillUs: false,
        fundCharge: false,
        purchaseNonCommon: false,
        attachSpecs: false,
        attachObr: false,
        attachCba: false,
        attachPayment: false,
        attachOthers: false,
        fundsDeposited: false,
        fundsCheck: false,
    });
    
    const printableRef = useRef<HTMLDivElement>(null);
    const totalAmount = useMemo(() => {
        return selectedItems.reduce((total, item: MarketItem) => total + item.price * (quantities[item.id] || 0), 0);
    }, [selectedItems, quantities]);

    const handleDetailChange = (field: keyof typeof details, value: string) => {
        setDetails(prev => ({ ...prev, [field]: value }));
    };

    const handleCheckboxChange = (field: keyof typeof checkboxes) => {
        setCheckboxes(prev => ({ ...prev, [field]: !prev[field] }));
    };
    
    const handleSignatoryChange = (role: keyof typeof signatories, field: 'name' | 'title', value: string) => {
        setSignatories(prev => ({ ...prev, [role]: { ...(prev[role] as any), [field]: value }}));
    };

    const handleQuantityChange = (itemId: number, qty: string) => {
        const newQty = parseInt(qty, 10);
        if (!isNaN(newQty) && newQty >= 0) {
            setQuantities(prev => ({ ...prev, [itemId]: newQty }));
        }
    };
    
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
            const pdf = new jsPDF({ orientation: 'p', unit: 'in', format: [13, 8.5] });
            const canvas = await window.html2canvas(printableArea, { scale: 3, useCORS: true, 
                onclone: (clonedDoc: Document) => {
                    clonedDoc.querySelectorAll('.no-print-input').forEach(el => {
                        const inputEl = el as HTMLInputElement | HTMLTextAreaElement;
                        const span = clonedDoc.createElement('span');
                        span.textContent = inputEl.value;
                        const computedStyle = window.getComputedStyle(inputEl);
                        span.style.font = computedStyle.font;
                        span.style.color = 'black';
                        inputEl.parentNode?.replaceChild(span, inputEl);
                    });
                } 
            });
            const imgData = canvas.toDataURL('image/png');
            pdf.addImage(imgData, 'PNG', 0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight(), undefined, 'FAST');
            pdf.save(`APR_${details.controlNo}.pdf`);
        } catch (error) {
            console.error("PDF generation failed:", error);
        } finally {
            document.body.classList.remove('is-printing');
        }
    };

    const APRPage: React.FC = () => (
        <div className="bg-white p-8 mx-auto printable-content" style={{ width: '8.5in', fontFamily: "'Times New Roman', Times, serif", fontSize: '10pt' }}>
            <div className="flex justify-between items-start text-[8pt] mb-2">
                <p>APR FORM revised May 2015</p>
                <p className="font-bold">FORM NO. 002</p>
            </div>
            <div className="grid grid-cols-2 border-2 border-black">
                <div className="p-1 border-r-2 border-black">
                    <p className="text-[8pt]">NAME AND ADDRESS OF REQUESTING AGENCY</p>
                    <EditableField value={details.agencyName} onSave={v => handleDetailChange('agencyName', v)} className="font-bold uppercase text-center" />
                    <EditableField value={details.agencyAddress} onSave={v => handleDetailChange('agencyAddress', v)} className="text-center" />
                    <div className="flex mt-2">
                        <span className="text-[8pt] mr-2">TEL. NOS.</span>
                        <EditableField value={details.telNos} onSave={v => handleDetailChange('telNos', v)} className="flex-grow border-b border-black" />
                    </div>
                </div>
                <div className="text-[8pt]">
                    <div className="flex border-b-2 border-black"><span className="p-1 w-1/3 border-r-2 border-black">AGENCY ACCT. CODE</span><div className="p-1 w-2/3"><EditableField value={details.acctCode} onSave={v => handleDetailChange('acctCode', v)} /></div></div>
                    <div className="flex border-b-2 border-black"><span className="p-1 w-1/3 border-r-2 border-black">AGENCY CONTROL No.</span><div className="p-1 w-2/3"><EditableField value={details.controlNo} onSave={v => handleDetailChange('controlNo', v)} /></div></div>
                    <div className="flex"><span className="p-1 w-1/3 border-r-2 border-black">PS APR No.</span><div className="p-1 w-2/3"><EditableField value={details.psAprNo} onSave={v => handleDetailChange('psAprNo', v)} /></div></div>
                </div>
            </div>
            <div className="text-center font-bold border-x-2 border-b-2 border-black p-1">AGENCY PROCUREMENT REQUEST</div>
            
            <div className="border-2 border-black border-t-0 p-2 text-xs">
                <div className="flex justify-between mb-4">
                    <div>
                        <p>To: PROCUREMENT SERVICE</p>
                        <p className="ml-4">DBM Compound, RR Road</p>
                        <p className="ml-4">Cristobal St., Paco, Manila</p>
                    </div>
                    <div className="text-right">
                        <div className="flex items-center gap-2">
                            <EditableField value={details.datePrepared} onSave={v => handleDetailChange('datePrepared', v)} className="border-b border-black" />
                        </div>
                        <p>(Date Prepared)</p>
                    </div>
                </div>
                <p className="text-center font-bold">PLEASE CHECK (✓) APPROPRIATE BOX ON ACTION REQUESTED ON THE ITEM/S LISTED BELOW</p>
                <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-2">
                        <input type="checkbox" checked={checkboxes.issueCommonUse} onChange={() => handleCheckboxChange('issueCommonUse')} />
                        <span>Please issue common-use supplies/materials per Price List No.</span>
                        <EditableField value={details.priceListNo} onSave={v => handleDetailChange('priceListNo', v)} className="border-b border-black w-20" />
                        <span>dated</span>
                        <EditableField value={details.priceListDate} onSave={v => handleDetailChange('priceListDate', v)} className="border-b border-black w-24" />
                    </div>
                    <div className="ml-8 flex items-center gap-4">
                        <span>Mode of delivery:</span>
                        <label><input type="checkbox" checked={checkboxes.deliveryPickupFast} onChange={() => handleCheckboxChange('deliveryPickupFast')} /> Pick-up (Fast Lane)</label>
                        <label><input type="checkbox" checked={checkboxes.deliveryPickupSched} onChange={() => handleCheckboxChange('deliveryPickupSched')} /> Pick-up (Schedule)</label>
                        <label><input type="checkbox" checked={checkboxes.deliveryDoor} onChange={() => handleCheckboxChange('deliveryDoor')} /> Delivery (door-to-door)</label>
                    </div>
                    <div className="ml-8 flex items-center gap-2">
                        <span>In case fund is not sufficient:</span>
                        <label><input type="checkbox" checked={checkboxes.fundReduce} onChange={() => handleCheckboxChange('fundReduce')} /> Reduce Quantity</label>
                        <label><input type="checkbox" checked={checkboxes.fundBillUs} onChange={() => handleCheckboxChange('fundBillUs')} /> Bill Us</label>
                        <label className="flex items-center gap-1"><input type="checkbox" checked={checkboxes.fundCharge} onChange={() => handleCheckboxChange('fundCharge')} /> Charge to Unutilized Deposit, APR No.:</label>
                        <EditableField value={details.chargeAprNo} onSave={v => handleDetailChange('chargeAprNo', v)} className="border-b border-black w-20" />
                        <span>Date:</span>
                        <EditableField value={details.chargeDate} onSave={v => handleDetailChange('chargeDate', v)} className="border-b border-black w-24" />
                    </div>
                </div>
            </div>
            
            <table className="w-full border-collapse border-2 border-black border-t-0 text-xs">
                <thead>
                    <tr className="font-bold text-center">
                        <th className="border border-black p-1 w-[8%]">ITEM No.</th>
                        <th className="border border-black p-1 w-[42%]">ITEM AND DESCRIPTION/SPECIFICATIONS/STOCK No.</th>
                        <th className="border border-black p-1 w-[10%]">QUANTITY</th>
                        <th className="border border-black p-1 w-[10%]">UNIT</th>
                        <th className="border border-black p-1 w-[15%]">UNIT PRICE</th>
                        <th className="border border-black p-1 w-[15%]">AMOUNT</th>
                    </tr>
                </thead>
                <tbody>
                    {selectedItems.map((item: MarketItem, index: number) => {
                        const quantity = quantities[item.id] || 0;
                        const totalCost = item.price * quantity;
                        return (
                            <tr key={item.id}>
                                <td className="border border-black p-1 text-center">{index + 1}</td>
                                <td className="border border-black p-1">{item.name} <br/> <em className="text-[9pt]">({item.itemCode})</em></td>
                                <td className="border border-black p-1 text-center">
                                    <EditableField value={String(quantity)} onSave={v => handleQuantityChange(item.id, v)} className="text-center" />
                                </td>
                                <td className="border border-black p-1 text-center">{item.unit}</td>
                                <td className="border border-black p-1 text-right">{item.price.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                                <td className="border border-black p-1 text-right">{totalCost.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                            </tr>
                        );
                    })}
                    {Array.from({ length: Math.max(0, 15 - selectedItems.length) }).map((_, index) => (
                        <tr key={`empty-${index}`} className="h-6"><td className="border border-black"></td><td className="border border-black"></td><td className="border border-black"></td><td className="border border-black"></td><td className="border border-black"></td><td className="border border-black"></td></tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr>
                        <td colSpan={5} className="border border-black p-1 font-bold text-right">TOTAL AMOUNT</td>
                        <td className="border border-black p-1 font-bold text-right">P {totalAmount.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                    </tr>
                </tfoot>
            </table>

            <div className="border-2 border-black border-t-0 p-1 text-xs">
                 <p className="text-center font-bold">NOTE: ALL SIGNATURES MUST BE OVER PRINTED NAME</p>
                 <div className="grid grid-cols-3 mt-2">
                    <div className="border-r-2 border-black p-2"><p>STOCKS REQUESTED ARE CERTIFIED TO BE WITHIN APPROVED PROGRAM:</p><div className="mt-16 text-center"><EditableField value={details.propertyOfficer} onSave={v => handleDetailChange('propertyOfficer', v)} className="font-bold uppercase text-center border-b border-black" /><p>AGENCY PROPERTY/SUPPLY OFFICER</p></div></div>
                    <div className="border-r-2 border-black p-2"><p>FUNDS CERTIFIED AVAILABLE:</p><div className="mt-16 text-center"><EditableField value={signatories.accountant.name} onSave={v => handleSignatoryChange('accountant', 'name', v)} className="text-center font-bold uppercase border-b border-black" /><EditableField value={signatories.accountant.title} onSave={v => handleSignatoryChange('accountant', 'title', v)} className="text-center" /></div></div>
                    <div className="p-2"><p>APPROVED:</p><div className="mt-16 text-center"><EditableField value={details.agencyHead} onSave={v => handleDetailChange('agencyHead', v)} className="font-bold uppercase text-center border-b border-black" /><p>AGENCY HEAD/AUTHORIZED SIGNATURE</p></div></div>
                 </div>
            </div>
        </div>
    );
    
    return (
        <div className="fixed inset-0 bg-black/60 z-[51] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-gray-100 rounded-lg shadow-2xl w-full max-w-6xl flex flex-col h-[95vh]" onClick={e => e.stopPropagation()}>
                <header className="p-3 bg-white border-b flex justify-between items-center no-print flex-shrink-0">
                     <h3 className="text-lg font-bold text-gray-800">Generate Agency Procurement Request (APR)</h3>
                     <div className="flex items-center gap-4">
                        <button onClick={handleDownloadPdf} className="btn text-sm bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md">Download PDF</button>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-900 text-2xl">&times;</button>
                     </div>
                </header>
                <main className="flex-grow overflow-y-auto p-4">
                    <div ref={printableRef}>
                        <APRPage />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AgencyProcurementRequestModal;
  