import React, { useState, useRef } from 'react';
import { extractRfqData } from '../../services/geminiService';
import { ExtractedRfqData, RfqItem } from '../../types';
import Loader from '../Loader';
import { orangeBacolodLogo } from '../../data/logo';

declare global {
    interface Window {
        html2canvas: any;
    }
}

type Theme = 'light' | 'dark';
type View = 'individual' | 'consolidated';

const RFQGeneratorTab: React.FC = () => {
    const [files, setFiles] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [rfqData, setRfqData] = useState<ExtractedRfqData[]>([]);
    const [theme, setTheme] = useState<Theme>('light');
    const [view, setView] = useState<View>('individual');
    const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
    const canvasRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = event.target.files ? Array.from(event.target.files) : [];
        if (selectedFiles.length > 0) {
            setFiles(prev => [...prev, ...selectedFiles.filter(f1 => !prev.some(f2 => f1.name === f2.name && f1.size === f2.size))]);
            setRfqData([]); // Clear previous data
            setError('');
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
    };
    
    const handleGenerate = async () => {
        if (files.length === 0) {
            setError('Please upload at least one Request for Quotation document.');
            return;
        }
        setLoading(true);
        setError('');
        setView('individual');
        setSelectedItems(new Set());

        try {
            const results = await Promise.all(
                files.map(file => extractRfqData(file).catch(e => ({ file, error: e })))
            );

            const successfulData = results.filter((r): r is ExtractedRfqData => !('error' in r));
            const failedData = results.filter((r): r is { file: File; error: any } => 'error' in r);

            if (successfulData.length > 0) {
                setRfqData(successfulData);
            } else {
                setError("The AI could not extract data from any of the provided documents. Please check the file formats and try again.");
            }

            if (failedData.length > 0) {
                const errorMessages = failedData.map(f => `Could not process ${f.file.name}.`).join('\n');
                setError(prev => prev ? `${prev}\n${errorMessages}` : errorMessages);
            }
        } catch (err) {
            console.error(err);
            setError('A critical error occurred during extraction. The AI might be having issues or a network error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = () => {
        const canvasElement = canvasRef.current;
        if (canvasElement && window.html2canvas) {
            if (document.activeElement instanceof HTMLElement) {
                document.activeElement.blur();
            }
            setTimeout(() => {
                const isConsolidated = view === 'consolidated' && selectedItems.size > 0;
                const fileName = `bacolod-rfq-${isConsolidated ? 'consolidated' : rfqData[0]?.prNo || 'announcement'}.png`;

                window.html2canvas(canvasElement, {
                    width: 1080,
                    height: 1080,
                    scale: 1,
                    useCORS: true,
                    backgroundColor: null,
                }).then((canvas: HTMLCanvasElement) => {
                    const link = document.createElement('a');
                    link.download = fileName;
                    link.href = canvas.toDataURL('image/png');
                    link.click();
                });
            }, 100);
        }
    };

    const handleDataChange = (index: number, field: keyof ExtractedRfqData, value: string) => {
        setRfqData(prev => {
            const newData = [...prev];
            if (newData[index]) {
                (newData[index] as any)[field] = value;
            }
            return newData;
        });
    };

    const handleItemChange = (rfqIndex: number, itemIndex: number, field: keyof RfqItem, value: string) => {
        setRfqData(prev => {
            const newData = [...prev];
            const rfq = newData[rfqIndex];
            if (rfq && rfq.items[itemIndex]) {
                const newItems = [...rfq.items];
                newItems[itemIndex] = { ...newItems[itemIndex], [field]: value };
                newData[rfqIndex] = { ...rfq, items: newItems };
            }
            return newData;
        });
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

    const commonWhiteStroke = { textShadow: '-1.5px -1.5px 0 #FFF, 1.5px -1.5px 0 #FFF, -1.5px 1.5px 0 #FFF, 1.5px 1.5px 0 #FFF' };
    const blueTextStyle = { color: '#1d4ed8', ...commonWhiteStroke };
    const orangeTextStyle = { color: '#f97316', ...commonWhiteStroke };
    
    const lightBgPattern = `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f97316' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;
    const darkBgPattern = `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FFFFFF' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;

    const EditableField: React.FC<{ value: string; onSave: (value: string) => void; className?: string }> = ({ value, onSave, className = '' }) => (
        <span
            contentEditable
            suppressContentEditableWarning
            onBlur={e => onSave(e.currentTarget.textContent || '')}
            className={`inline-block hover:bg-orange-50/20 focus:bg-orange-100/30 focus:outline-none focus:ring-1 focus:ring-orange-400 rounded-sm px-1 -mx-1 ${className}`}
        >
            {value}
        </span>
    );

    const RfqCard: React.FC<{ item: ExtractedRfqData, index: number, theme: Theme }> = ({ item, index, theme }) => {
        const t = {
            light: { mainText: 'text-gray-900', secondaryText: 'text-gray-700', accent: 'text-orange-600', border: 'border-gray-200/80', cardBg: 'bg-white/80', shadow: 'shadow-xl', tableHead: 'bg-gray-100', deadlineBg: 'bg-red-100', deadlineText: 'text-red-800' },
            dark: { mainText: 'text-gray-100', secondaryText: 'text-gray-300', accent: 'text-orange-400', border: 'border-gray-700', cardBg: 'bg-gray-800/80', shadow: 'shadow-2xl shadow-black/30', tableHead: 'bg-gray-700/50', deadlineBg: 'bg-red-900/50', deadlineText: 'text-red-300' }
        }[theme];
        return (
             <div className={`p-8 rounded-2xl w-full h-full flex flex-col ${t.cardBg} ${t.shadow} border ${t.border}`} style={{ backdropFilter: 'blur(10px)' }}>
                <div className='space-y-4'>
                    <p className={`${t.secondaryText} text-lg`}>Purchase Request No. <EditableField value={item.prNo} onSave={v => handleDataChange(index, 'prNo', v)} className={`font-semibold ${t.mainText}`} /></p>
                    <div>
                        <p className={`text-xl font-semibold ${t.mainText}`}>Project:</p>
                        <h3 className={`text-3xl font-bold leading-tight ${t.accent}`}><EditableField value={item.projectTitle} onSave={v => handleDataChange(index, 'projectTitle', v)} className="w-full" /></h3>
                    </div>
                    <p className={`${t.secondaryText} text-lg`}>End User: <EditableField value={item.endUser} onSave={v => handleDataChange(index, 'endUser', v)} className={`font-semibold ${t.mainText}`} /></p>
                </div>
                
                <div className={`my-4 flex-grow overflow-y-auto border-y ${t.border} py-2`}>
                    <table className="w-full text-left">
                        <thead className={`sticky top-0 ${t.tableHead}`}>
                            <tr>
                                <th className={`w-1/12 p-2 text-sm font-semibold tracking-wider ${t.secondaryText}`}>No.</th>
                                <th className={`w-7/12 p-2 text-sm font-semibold tracking-wider ${t.secondaryText}`}>Item Description</th>
                                <th className={`w-2/12 p-2 text-sm font-semibold tracking-wider ${t.secondaryText}`}>Qty</th>
                                <th className={`w-2/12 p-2 text-sm font-semibold tracking-wider ${t.secondaryText}`}>Unit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {item.items.map((itemRow, itemIndex) => (
                                <tr key={itemIndex} className={`border-b ${t.border} last:border-b-0`}>
                                    <td className={`p-2 align-top ${t.mainText}`}><EditableField value={itemRow.itemNo} onSave={v => handleItemChange(index, itemIndex, 'itemNo', v)} /></td>
                                    <td className={`p-2 align-top ${t.mainText}`}><EditableField value={itemRow.description} onSave={v => handleItemChange(index, itemIndex, 'description', v)} /></td>
                                    <td className={`p-2 align-top ${t.mainText}`}><EditableField value={itemRow.qty} onSave={v => handleItemChange(index, itemIndex, 'qty', v)} /></td>
                                    <td className={`p-2 align-top ${t.mainText}`}><EditableField value={itemRow.uom} onSave={v => handleItemChange(index, itemIndex, 'uom', v)} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                 <div className="mt-auto pt-4 border-t-2 ${t.border}">
                    <div className="text-left">
                        <p className={`text-xl font-semibold ${t.secondaryText}`}>Approved Budget (ABC):</p>
                        <p className={`text-5xl font-extrabold ${t.accent}`}><EditableField value={item.abc} onSave={v => handleDataChange(index, 'abc', v)} /></p>
                    </div>
                </div>
            </div>
        );
    };

    const ConsolidatedRfqCard: React.FC<{ items: ExtractedRfqData[]; theme: Theme }> = ({ items, theme }) => {
        const t = {
            light: { mainText: 'text-gray-900', secondaryText: 'text-gray-600', accent: 'text-orange-600', border: 'border-gray-300', bg: 'bg-white', headerBg: 'bg-gray-100' },
            dark: { mainText: 'text-gray-100', secondaryText: 'text-gray-300', accent: 'text-orange-400', border: 'border-gray-700', bg: 'bg-gray-800', headerBg: 'bg-gray-900/70' }
        }[theme];

        return (
            <div className="w-full h-full flex flex-col p-8">
                <h3 className={`text-4xl font-extrabold text-center mb-6 ${t.mainText}`}>Consolidated Request for Quotations</h3>
                <div className={`flex-grow rounded-lg border ${t.border} overflow-hidden flex flex-col ${t.bg}`}>
                    <div className="overflow-y-auto h-full">
                        <table className="w-full text-left table-fixed border-collapse">
                            <thead className={`sticky top-0 ${t.headerBg}`} style={{ backdropFilter: 'blur(5px)'}}>
                                <tr>
                                    <th className={`w-[20%] p-2 text-sm font-bold tracking-wider ${t.secondaryText} border ${t.border}`}>Purchase Request No.</th>
                                    <th className={`w-[40%] p-2 text-sm font-bold tracking-wider ${t.secondaryText} border ${t.border}`}>Project</th>
                                    <th className={`w-[20%] p-2 text-sm font-bold tracking-wider ${t.secondaryText} border ${t.border}`}>End User</th>
                                    <th className={`w-[20%] p-2 text-sm font-bold tracking-wider ${t.secondaryText} border ${t.border}`}>Approved Budget (ABC)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item, index) => (
                                    <tr key={index} className={`${t.mainText}`}>
                                        <td className={`p-2 text-xs align-top border ${t.border}`}>{item.prNo}</td>
                                        <td className={`p-2 text-xs align-top font-semibold border ${t.border}`}>{item.projectTitle}</td>
                                        <td className={`p-2 text-xs align-top border ${t.border}`}>{item.endUser}</td>
                                        <td className={`p-2 text-xs align-top font-bold ${t.accent} border ${t.border}`}>{item.abc}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    const isConsolidatedView = view === 'consolidated' && selectedItems.size > 0;

    return (
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                 <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 mr-3 text-orange-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                RFQ Generator
            </h2>
            <p className="text-gray-600 mb-6">Upload a Request for Quotation (RFQ) document. The AI will extract the data to create a public announcement. Edit the details as needed and download the image.</p>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                    <label htmlFor="rfq-gen-upload" className="block text-sm font-medium text-gray-700 mb-1">1. Upload RFQ Document(s)</label>
                    <input ref={fileInputRef} type="file" id="rfq-gen-upload" accept="image/*,.pdf" capture="environment" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100" disabled={loading} multiple />
                    <div className="space-y-1 mt-2 max-h-24 overflow-y-auto pr-2">
                        {files.map((f, i) => <p key={i} className="text-xs text-gray-600 truncate bg-gray-100 p-1 rounded">{f.name}</p>)}
                    </div>
                </div>
                <div className="flex flex-col justify-end space-y-3">
                     <button onClick={handleGenerate} className="btn bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg w-full disabled:bg-gray-400" disabled={loading || files.length === 0}>{loading ? 'AI is Working...' : 'Generate from File(s)'}</button>
                     <button onClick={handleDownload} className="btn bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg w-full" disabled={rfqData.length === 0}>Download Image</button>
                </div>
            </div>

            {loading && <Loader text="AI is extracting data..." />}
            {error && <div className="text-center my-4 bg-red-50 p-4 rounded-lg border border-red-200 text-red-700">{error}</div>}

            {rfqData.length > 1 && (
                <div className="my-6 p-4 border border-dashed border-gray-300 rounded-lg">
                    <h3 className="text-lg font-bold text-gray-800 mb-2">Consolidate Posts</h3>
                    <p className="text-sm text-gray-600 mb-4">Select two or more items to create a single summary announcement. Then, use the "Download Image" button above.</p>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2 mb-4">
                        {rfqData.map((item, index) => (
                            <div key={index} className="flex items-center bg-gray-50 p-2 rounded-md">
                                <input
                                    type="checkbox"
                                    id={`select-item-${index}`}
                                    checked={selectedItems.has(index)}
                                    onChange={() => handleSelectItem(index)}
                                    className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                />
                                <label htmlFor={`select-item-${index}`} className="ml-3 text-sm text-gray-800 truncate cursor-pointer">
                                    <span className="font-semibold">{item.prNo}:</span> {item.projectTitle}
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

            <div className="p-4 border-2 border-dashed border-orange-300 rounded-lg overflow-x-auto bg-gray-100 flex justify-center">
                <div 
                    ref={canvasRef} 
                    className={`w-[1080px] h-[1080px] font-['Inter'] flex flex-col p-16 transition-colors duration-300 ${theme === 'light' ? 'bg-orange-50' : 'bg-gray-900'}`} 
                    style={{backgroundImage: theme === 'light' ? lightBgPattern : darkBgPattern}}>
                    
                    <header className="flex-shrink-0 flex items-center justify-between">
                         <div className="flex items-center space-x-6">
                            <img src={orangeBacolodLogo} alt="BAC Logo" className="h-28" />
                             <div>
                                <h1 className={`text-6xl font-black tracking-tighter ${theme === 'light' ? 'text-gray-900' : 'text-gray-100'}`}>REQUEST FOR</h1>
                                <h2 className={`text-7xl font-extrabold ${theme === 'light' ? 'text-orange-600' : 'text-orange-400'}`}>QUOTATION</h2>
                             </div>
                         </div>
                         <div className={`text-right text-2xl font-semibold ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
                            <p>Bids and Awards Committee</p>
                            <p>Bacolod City</p>
                            <p style={{ fontFamily: 'cursive, "Brush Script MT"' }} className="text-2xl font-bold mt-1">
                                <span style={blueTextStyle}>Stron</span><span style={orangeTextStyle}>g</span><span style={blueTextStyle}>er To</span><span style={orangeTextStyle}>g</span><span style={blueTextStyle}>ether</span>
                            </p>
                         </div>
                    </header>
                    
                    <main className={`flex-grow flex flex-col justify-center my-8 ${!isConsolidatedView ? 'overflow-y-hidden' : ''}`}>
                       {isConsolidatedView ? (
                           <ConsolidatedRfqCard items={Array.from(selectedItems).map(i => rfqData[i])} theme={theme} />
                       ) : rfqData.length > 0 ? (
                           <div className="space-y-6 overflow-y-auto h-full pr-4 -mr-4">
                                {rfqData.map((item, index) => <RfqCard key={index} item={item} index={index} theme={theme} />)}
                           </div>
                       ) : (
                           <div className={`text-center h-full flex items-center justify-center ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
                               <p className="text-2xl">Upload an RFQ and click "Generate from File" to begin.</p>
                           </div>
                       )}
                    </main>
                    
                    <footer className="flex-shrink-0 flex flex-col items-center justify-end text-center mt-auto pt-4 space-y-4">
                         <div className={`w-full p-4 rounded-lg ${theme === 'light' ? 'bg-gray-800' : 'bg-black/50'}`}>
                             <EditableField value={rfqData[0]?.contactInfo || 'Contact the BAC Secretariat for more details.'} onSave={v => handleDataChange(0, 'contactInfo', v)} className={`text-lg text-gray-300 w-full text-center`} />
                             <EditableField value={rfqData[0]?.hashtags || '#BacolodProcurement #RFQ'} onSave={v => handleDataChange(0, 'hashtags', v)} className={`text-base font-semibold mt-1 w-full text-center text-orange-400`} />
                        </div>
                    </footer>
                </div>
            </div>
        </div>
    );
};

export default RFQGeneratorTab;
