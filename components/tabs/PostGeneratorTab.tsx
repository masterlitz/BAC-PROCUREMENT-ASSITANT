import React, { useState, useRef } from 'react';
import { extractPostDataFromDocuments } from '../../services/geminiService';
import { SocialMediaPostItem } from '../../types';
import Loader from '../Loader';
import { orangeBacolodLogo } from '../../data/logo';

// Make html2canvas available in the window scope for the script tag
declare global {
    interface Window {
        html2canvas: any;
    }
}

type Theme = 'light' | 'dark';

const PostGeneratorTab: React.FC = () => {
    const [files, setFiles] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [postItems, setPostItems] = useState<SocialMediaPostItem[]>([]);
    const [theme, setTheme] = useState<Theme>('light');
    const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
    const [view, setView] = useState<'individual' | 'consolidated'>('individual');
    const canvasRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = event.target.files ? Array.from(event.target.files) : [];
        if (selectedFiles.length > 0) {
            setFiles(prev => [...prev, ...selectedFiles]);
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleGenerateFromFiles = async () => {
        if (files.length === 0) return;
        setLoading(true);
        setError('');
        setView('individual'); // Reset to individual view
        setSelectedItems(new Set()); // Clear selection
        try {
            const extractedData = await extractPostDataFromDocuments(files);
            if (extractedData.length > 0) {
              setPostItems(extractedData);
            } else {
              setError("No Purchase Order document was found in the uploaded files. Please upload a valid PO to generate a post.");
            }
        } catch (err) {
            console.error(err);
            setError('Failed to extract data. The AI might have had trouble with the document format or a network error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = () => {
        const canvasElement = canvasRef.current;
        if (canvasElement && window.html2canvas) {
            // Blur any active element to remove focus states before capturing
            if (document.activeElement instanceof HTMLElement) {
                document.activeElement.blur();
            }

            // Use a short timeout to allow the DOM to update after blur
            setTimeout(() => {
                window.html2canvas(canvasElement, {
                    width: 1080,
                    height: 1080,
                    scale: 1,
                    useCORS: true,
                    backgroundColor: null, // Use the element's background
                }).then((canvas: HTMLCanvasElement) => {
                    const link = document.createElement('a');
                    link.download = 'bacolod-procurement-notice.png';
                    link.href = canvas.toDataURL('image/png');
                    link.click();
                });
            }, 100);
        }
    };

    const handleItemChange = (index: number, field: keyof SocialMediaPostItem, value: string) => {
        const updatedItems = [...postItems];
        if (updatedItems[index]) {
            updatedItems[index] = { ...updatedItems[index], [field]: value };
            setPostItems(updatedItems);
        }
    };

    const handleSelectItem = (index: number) => {
        const newSelection = new Set(selectedItems);
        if (newSelection.has(index)) {
            newSelection.delete(index);
        } else {
            newSelection.add(index);
        }
        setSelectedItems(newSelection);
    };

    // Style objects for the "Stronger Together" text, copied from SocialMediaTriviaTab
    const commonWhiteStroke = {
        textShadow: '-1.5px -1.5px 0 #FFF, 1.5px -1.5px 0 #FFF, -1.5px 1.5px 0 #FFF, 1.5px 1.5px 0 #FFF',
    };
    const blueTextStyle = {
        color: '#1d4ed8', // blue-700
        ...commonWhiteStroke
    };
    const orangeTextStyle = {
        color: '#f97316', // orange-500
        ...commonWhiteStroke
    };
    
    // Icons
    const RefIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
    const TitleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>;
    const SupplierIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 4h3" /></svg>;
    const PriceIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 8v5a2 2 0 002 2h.586a1 1 0 01.707.293l.414.414a1 1 0 00.707.293h3.172a1 1 0 00.707-.293l.414-.414a1 1 0 01.707-.293H21" /></svg>;
    const DateIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
    const LocationIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
    const PhoneIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>;
    const EmailIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;

    const PostItemCard: React.FC<{ item: SocialMediaPostItem; index: number; theme: Theme }> = ({ item, index, theme }) => {
        const t = {
            light: {
                accent: 'text-orange-600',
                mainText: 'text-gray-800',
                secondaryText: 'text-gray-700',
                priceText: 'text-green-600',
                cardBg1: 'bg-white',
                cardBg2: 'bg-gray-100',
                border: 'border-gray-300/70',
                focusRing: 'focus:ring-orange-300',
                editBg: 'hover:bg-orange-50 focus:bg-orange-100',
                shadow: 'shadow-lg',
                borderFull: 'border-gray-200/50'
            },
            dark: {
                accent: 'text-orange-400',
                mainText: 'text-gray-100',
                secondaryText: 'text-gray-300',
                priceText: 'text-green-400',
                cardBg1: 'bg-gray-800',
                cardBg2: 'bg-gray-700/50',
                border: 'border-gray-600',
                focusRing: 'focus:ring-orange-500',
                editBg: 'hover:bg-gray-700 focus:bg-gray-600',
                shadow: 'shadow-lg shadow-black/20',
                borderFull: 'border-gray-700'
            }
        }[theme];
        
        const editClass = `p-1 rounded-md focus:outline-none focus:ring-1 transition-colors duration-200 ${t.focusRing} ${t.editBg}`;

        return (
            <div className={`flex rounded-2xl overflow-hidden border ${t.shadow} ${t.borderFull}`}>
                {/* Left Part - Reference No */}
                <div className={`${t.cardBg1} w-1/3 p-8 flex flex-col justify-center space-y-3`}>
                     <div className={`flex items-center space-x-2 ${t.accent}`}>
                        <RefIcon />
                        <h4 className="font-semibold text-base tracking-wider">REFERENCE NO.</h4>
                    </div>
                    <p contentEditable suppressContentEditableWarning onBlur={e => handleItemChange(index, 'referenceNo', e.currentTarget.textContent || '')} className={`font-bold text-2xl leading-tight ${t.mainText} ${editClass}`}>{item.referenceNo}</p>
                </div>

                {/* Right Part - Details */}
                <div className={`${t.cardBg2} w-2/3 p-8 space-y-6`}>
                    {/* Project Title */}
                    <div>
                        <div className={`flex items-center space-x-2 ${t.accent}`}>
                            <TitleIcon />
                            <h4 className="font-semibold text-base tracking-wider">PROJECT TITLE</h4>
                        </div>
                        <p contentEditable suppressContentEditableWarning onBlur={e => handleItemChange(index, 'projectTitle', e.currentTarget.textContent || '')} className={`text-2xl leading-snug mt-2 ${t.secondaryText} ${editClass}`}>{item.projectTitle}</p>
                    </div>

                    {/* Supplier */}
                    <div>
                         <div className={`flex items-center space-x-2 ${t.accent}`}>
                            <SupplierIcon />
                            <h4 className="font-semibold text-base tracking-wider">SUPPLIER</h4>
                        </div>
                        <p contentEditable suppressContentEditableWarning onBlur={e => handleItemChange(index, 'supplier', e.currentTarget.textContent || '')} className={`text-lg leading-snug mt-2 whitespace-pre-wrap ${t.secondaryText} ${editClass}`}>{item.supplier}</p>
                    </div>
                    
                    {/* Price and Date */}
                    <div className={`grid grid-cols-2 gap-8 pt-4 border-t ${t.border}`}>
                         <div>
                            <div className={`flex items-center space-x-2 ${t.accent}`}>
                                <PriceIcon />
                                <h4 className="font-semibold text-base tracking-wider">TOTAL CONTRACT PRICE</h4>
                            </div>
                            <p contentEditable suppressContentEditableWarning onBlur={e => handleItemChange(index, 'contractPrice', e.currentTarget.textContent || '')} className={`font-bold text-3xl leading-none mt-2 ${t.priceText} ${editClass}`}>{item.contractPrice}</p>
                        </div>
                         <div>
                            <div className={`flex items-center space-x-2 ${t.accent}`}>
                                <DateIcon />
                                <h4 className="font-semibold text-base tracking-wider">DATE OF ISSUANCE</h4>
                            </div>
                            <p contentEditable suppressContentEditableWarning onBlur={e => handleItemChange(index, 'dateOfIssuance', e.currentTarget.textContent || '')} className={`font-bold text-3xl leading-none mt-2 ${t.mainText} ${editClass}`}>{item.dateOfIssuance}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const ConsolidatedPostCard: React.FC<{ items: SocialMediaPostItem[]; theme: Theme }> = ({ items, theme }) => {
        const t = {
            light: { mainText: 'text-gray-800', secondaryText: 'text-gray-700', border: 'border-gray-200', bg: 'bg-white/50', headerBg: 'bg-gray-100' },
            dark: { mainText: 'text-gray-100', secondaryText: 'text-gray-300', border: 'border-gray-700', bg: 'bg-black/20', headerBg: 'bg-gray-700/50' }
        }[theme];
    
        return (
            <div className="w-full h-full flex flex-col">
                <h3 className={`text-4xl font-extrabold text-center mb-6 ${t.mainText}`}>Consolidated Procurement Notice</h3>
                <div className={`rounded-lg border ${t.border} ${t.bg}`}>
                    <table className="w-full text-left table-fixed">
                        <thead className={`sticky top-0 ${t.headerBg}`}>
                            <tr>
                                <th className={`w-2/5 p-4 text-sm font-semibold tracking-wider ${t.mainText}`}>Project Title</th>
                                <th className={`w-1/5 p-4 text-sm font-semibold tracking-wider ${t.mainText}`}>Reference No.</th>
                                <th className={`w-1/5 p-4 text-sm font-semibold tracking-wider ${t.mainText}`}>Supplier</th>
                                <th className={`w-1/5 p-4 text-sm font-semibold tracking-wider ${t.mainText}`}>Total Price</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${t.border}`}>
                            {items.map((item, index) => (
                                <tr key={index} className={`${t.secondaryText}`}>
                                    <td className="p-3 text-sm font-medium align-top">{item.projectTitle}</td>
                                    <td className="p-3 text-sm align-top">{item.referenceNo}</td>
                                    <td className="p-3 text-sm align-top whitespace-pre-wrap">{item.supplier.split('\n')[0]}</td>
                                    <td className="p-3 text-sm font-semibold align-top">{item.contractPrice}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };
    
    const lightBgPattern = `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f97316' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;
    const darkBgPattern = `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FFFFFF' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;

    const t = {
        light: {
            mainText: 'text-gray-800',
            secondaryText: 'text-gray-700',
            accent: 'text-orange-600',
            communiqueBg: 'bg-gray-800',
            communiqueText: 'text-white',
            communiqueAccent: 'text-orange-400',
            communiqueHashtag: 'text-orange-300',
            footerText: 'text-gray-600',
            border: 'border-gray-200',
            shadow: 'shadow-md',
        },
        dark: {
            mainText: 'text-white',
            secondaryText: 'text-gray-300',
            accent: 'text-orange-400',
            communiqueBg: 'bg-black/50',
            communiqueText: 'text-gray-200',
            communiqueAccent: 'text-orange-400',
            communiqueHashtag: 'text-orange-400',
            footerText: 'text-gray-400',
            border: 'border-gray-700',
            shadow: 'shadow-lg shadow-black/20',
        }
    }[theme];

    const feedbackFormUrl = 'https://forms.hive.com/?formId=dEqfsaS8nici4rZiQ';
    const qrCodeUrl = theme === 'light' 
        ? `https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=${encodeURIComponent(feedbackFormUrl)}&bgcolor=ffffff&color=000000&qzone=1`
        : `https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=${encodeURIComponent(feedbackFormUrl)}&bgcolor=1f2937&color=ffffff&qzone=1`;

    const isConsolidatedView = view === 'consolidated' && selectedItems.size > 0;

    return (
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <svg className="w-8 h-8 mr-3 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" /></svg>
                Social Media Post Generator
            </h2>
            <p className="text-gray-600 mb-6">Upload Purchase Orders (PDF or Image). The AI will extract the data and generate posts. You can create a consolidated post for bulk announcements.</p>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="p-4 border border-dashed border-gray-300 rounded-lg flex flex-col justify-start space-y-3">
                     <label htmlFor="post-gen-upload" className="block text-sm font-medium text-gray-700">1. Upload Documents</label>
                     <input ref={fileInputRef} type="file" id="post-gen-upload" accept="image/*,.pdf" capture="environment" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100" multiple disabled={loading} />
                     <div className="space-y-2 overflow-y-auto max-h-24 pr-2 flex-grow">
                        {files.length > 0 ? files.map((f, i) => <p key={i} className="text-xs text-gray-600 truncate">{f.name}</p>) : <p className="text-xs text-gray-400 text-center pt-4">No files selected.</p>}
                     </div>
                </div>
                <div className="flex flex-col justify-between p-4 border border-dashed border-gray-300 rounded-lg">
                     <div>
                        <label className="block text-sm font-medium text-gray-700">2. Generate & Download</label>
                        <p className="text-xs text-gray-500 mt-1">First, use the AI to populate the template. Then, download the final image.</p>
                     </div>
                     <div className="flex flex-col space-y-3 mt-4">
                        <button onClick={handleGenerateFromFiles} className="btn bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg w-full disabled:bg-gray-400" disabled={loading || files.length === 0}>
                            {loading ? 'AI is Working...' : 'Generate from Files'}
                        </button>
                        <button onClick={handleDownload} className="btn bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg w-full">Download Image</button>
                    </div>
                </div>
            </div>

            {loading && <Loader text="AI is extracting data..." />}
            {error && <div className="text-center my-4 bg-red-50 p-4 rounded-lg border border-red-200 text-red-700">{error}</div>}

            {postItems.length > 1 && (
                <div className="my-6 p-4 border border-dashed border-gray-300 rounded-lg">
                    <h3 className="text-lg font-bold text-gray-800 mb-2">Consolidate Posts</h3>
                    <p className="text-sm text-gray-600 mb-4">Select two or more items to create a single summary announcement. Then, use the "Download Image" button above.</p>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2 mb-4">
                        {postItems.map((item, index) => (
                            <div key={index} className="flex items-center bg-gray-50 p-2 rounded-md">
                                <input
                                    type="checkbox"
                                    id={`select-item-${index}`}
                                    checked={selectedItems.has(index)}
                                    onChange={() => handleSelectItem(index)}
                                    className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                />
                                <label htmlFor={`select-item-${index}`} className="ml-3 text-sm text-gray-800 truncate cursor-pointer">
                                    <span className="font-semibold">{item.referenceNo}:</span> {item.projectTitle}
                                </label>
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-4">
                        <button 
                            onClick={() => setView('consolidated')} 
                            disabled={selectedItems.size < 2}
                            className="btn bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg w-full disabled:bg-gray-400">
                            View Consolidated ({selectedItems.size})
                        </button>
                        <button 
                            onClick={() => { setView('individual'); setSelectedItems(new Set()); }}
                            className="btn bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg w-full">
                            View Individual Posts
                        </button>
                    </div>
                </div>
            )}

            <div className="flex justify-end items-center mb-4">
                <span className="text-sm font-medium text-gray-700 mr-3">Theme:</span>
                <div className="flex rounded-lg p-1 bg-gray-200">
                    <button onClick={() => setTheme('light')} className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${theme === 'light' ? 'bg-white text-orange-600 shadow' : 'text-gray-600'}`}>Light</button>
                    <button onClick={() => setTheme('dark')} className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${theme === 'dark' ? 'bg-gray-800 text-white shadow' : 'text-gray-600'}`}>Dark</button>
                </div>
            </div>

            <div className="p-4 border-2 border-dashed border-orange-300 rounded-lg overflow-x-auto bg-gray-100">
                <div 
                    ref={canvasRef} 
                    className={`w-[1080px] h-[1080px] font-['Inter'] flex flex-col p-16 transition-colors duration-300 ${theme === 'light' ? 'bg-orange-50' : 'bg-gray-900'}`} 
                    style={{backgroundImage: theme === 'light' ? lightBgPattern : darkBgPattern}}>
                    
                    <header className="flex-shrink-0 flex items-center justify-between">
                         <div className="flex items-center space-x-6">
                            <img src={orangeBacolodLogo} alt="BAC Logo" className="h-28" />
                             <div>
                                <h1 className={`text-6xl font-black tracking-tighter ${t.mainText}`}>PROCUREMENT</h1>
                                <h2 className={`text-7xl font-extrabold ${t.accent}`}>NOTICE OF AWARD</h2>
                             </div>
                         </div>
                         <div className={`text-right text-2xl font-semibold`}>
                            <p className={`${t.secondaryText}`}>Bids and Awards Committee</p>
                            <p className={`${t.secondaryText}`}>Bacolod City</p>
                            <p style={{ fontFamily: 'cursive, "Brush Script MT"' }} className="text-2xl font-bold mt-1">
                                <span style={blueTextStyle}>Stron</span>
                                <span style={orangeTextStyle}>g</span>
                                <span style={blueTextStyle}>er To</span>
                                <span style={orangeTextStyle}>g</span>
                                <span style={blueTextStyle}>ether</span>
                            </p>
                         </div>
                    </header>
                    
                    <main className={`flex-grow flex flex-col justify-center my-8 ${!isConsolidatedView ? 'overflow-y-auto' : ''}`}>
                       {isConsolidatedView ? (
                            <ConsolidatedPostCard 
                                items={Array.from(selectedItems).map(index => postItems[index])}
                                theme={theme}
                            />
                        ) : postItems.length > 0 ? (
                            <div className="space-y-6">
                                {postItems.map((item, index) => <PostItemCard key={index} item={item} index={index} theme={theme} />)}
                            </div>
                       ) : (
                           <div className={`text-center h-full flex items-center justify-center ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                               <p>Upload a Purchase Order and click "Generate from Files" to populate.</p>
                           </div>
                       )}
                    </main>
                    
                    <footer className="flex-shrink-0 flex flex-col items-center justify-end text-center mt-auto pt-4 space-y-4">
                        {postItems.length > 0 && (
                            <div className={`w-full p-6 rounded-lg ${t.communiqueBg}`}>
                                <h3 className={`text-lg font-bold tracking-widest ${t.communiqueAccent}`}>COMMUNIQUÉ:</h3>
                                <p contentEditable suppressContentEditableWarning onBlur={e => handleItemChange(0, 'communique', e.currentTarget.textContent || '')} className={`p-1 rounded-md text-lg mt-2 transition-colors duration-200 ${t.communiqueText} hover:bg-white/10 focus:bg-white/20 focus:outline-none focus:ring-1 focus:ring-orange-300`}>
                                    {postItems[0]?.communique || ''}
                                </p>
                                <p contentEditable suppressContentEditableWarning onBlur={e => handleItemChange(0, 'hashtags', e.currentTarget.textContent || '')} className={`p-1 rounded-md text-base font-semibold mt-3 transition-colors duration-200 ${t.communiqueHashtag} hover:bg-white/10 focus:bg-white/20 focus:outline-none focus:ring-1 focus:ring-orange-300`}>
                                    {postItems[0]?.hashtags || ''}
                                </p>
                            </div>
                        )}
                        <div className={`w-full p-6 rounded-xl flex items-center ${theme === 'light' ? 'bg-white' : 'bg-gray-800'} ${t.shadow}`}>
                            <div className="w-2/3 pr-6">
                                <div className="grid grid-cols-3 gap-x-5 text-left">
                                    <div className="flex items-start space-x-3">
                                        <LocationIcon />
                                        <div>
                                            <strong className={`font-semibold block text-sm ${t.mainText}`}>Address</strong>
                                            <p className={`text-xs ${t.footerText}`}>3rd Flr, Masskara Hall, BCGC, Brgy. Villamonte, Bacolod City</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <PhoneIcon />
                                        <div>
                                            <strong className={`font-semibold block text-sm ${t.mainText}`}>Mobile No.</strong>
                                            <p className={`text-xs ${t.footerText}`}>09486268509</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <EmailIcon />
                                        <div>
                                            <strong className={`font-semibold block text-sm ${t.mainText}`}>E-mail</strong>
                                            <p className={`text-xs ${t.footerText}`}>bac@bacolodcity.gov.ph</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className={`w-1/3 pl-6 flex items-center space-x-4 border-l ${t.border}`}>
                                <img 
                                    src={qrCodeUrl}
                                    alt="Feedback Form QR Code"
                                    className="h-[90px] w-[90px] rounded-md flex-shrink-0"
                                />
                                <div className="text-left">
                                    <p className={`font-black text-xl leading-tight ${t.mainText}`}>BACOLOD CITY</p>
                                    <p className={`font-semibold text-base leading-tight ${t.accent}`}>Bids and Awards Committee</p>
                                    <a href={feedbackFormUrl} target="_blank" rel="noopener noreferrer" className={`text-xs mt-1 underline ${t.footerText}`}>Scan QR for Feedback</a>
                                </div>
                            </div>
                        </div>
                    </footer>
                </div>
            </div>
        </div>
    );
};

export default PostGeneratorTab;
