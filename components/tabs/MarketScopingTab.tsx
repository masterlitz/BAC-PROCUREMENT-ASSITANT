import React, { useState } from 'react';
import { scopeMarket, getAiAssistantResponse, extractItemsFromPdf } from '../../services/geminiService';
import { ScopingResult, SupplierQuote } from '../../types';

type ChatMessage = { sender: 'user' | 'ai'; text: string; };
type InputMode = 'list' | 'pdf';
type PriceConsistency = 'Low' | 'Moderate' | 'High' | 'N/A';

interface ScopingItem extends ScopingResult {
    status: 'pending' | 'loading' | 'success' | 'failed';
    error?: string;
    priceConsistency?: PriceConsistency;
}

const calculatePriceConsistency = (quotes: SupplierQuote[]): PriceConsistency => {
    const validPrices = quotes.filter(q => q.price > 0).map(q => q.price);
    if (validPrices.length < 2) return 'N/A';
    const mean = validPrices.reduce((a, b) => a + b, 0) / validPrices.length;
    if (mean === 0) return 'N/A';
    const stdDev = Math.sqrt(validPrices.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) / validPrices.length);
    const variance = stdDev / mean;
    if (variance < 0.15) return 'Low';
    if (variance <= 0.35) return 'Moderate';
    return 'High';
};

const MarketScopingTab: React.FC = () => {
    const [inputMode, setInputMode] = useState<InputMode>('list');
    const [itemList, setItemList] = useState<string>('');
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [results, setResults] = useState<ScopingItem[]>([]);
    const [isScoping, setIsScoping] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [expandedRowId, setExpandedRowId] = useState<number | null>(null);

    // Contextual Chat State
    const [chatModalOpen, setChatModalOpen] = useState(false);
    const [chatContext, setChatContext] = useState<ScopingItem | null>(null);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [chatMessage, setChatMessage] = useState('');
    const [chatLoading, setChatLoading] = useState(false);
    
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) setUploadedFile(file);
    };

    const performScopeForItem = async (item: ScopingItem) => {
        setResults(prev => prev.map(r => r.id === item.id ? { ...r, status: 'loading' } : r));
        try {
            const data = await scopeMarket(item.name);
            const realQuotes = data.quotes.filter(q => q.price > 0 && q.supplier !== 'N/A');
            const averagePrice = realQuotes.length > 0 ? realQuotes.reduce((acc, q) => acc + q.price, 0) / realQuotes.length : 0;
            const priceConsistency = calculatePriceConsistency(data.quotes);

            setResults(prev => prev.map(r => r.id === item.id ? {
                ...r,
                ...data,
                status: 'success',
                averagePrice,
                priceConsistency,
                catalogPrice: averagePrice * 1.35
            } : r));
        } catch (err: any) {
            setResults(prev => prev.map(r => r.id === item.id ? { ...r, status: 'failed', error: err.message } : r));
        }
    };

    const handleScopeItems = async () => {
        let itemsToScope: string[] = [];
        setError('');
        if (inputMode === 'list') {
            itemsToScope = itemList.split('\n').map(i => i.trim()).filter(i => i);
        } else if (uploadedFile) {
            setIsScoping(true);
            try { itemsToScope = await extractItemsFromPdf(uploadedFile); } 
            catch (e: any) { setError(`Failed to extract items from PDF: ${e.message}`); setIsScoping(false); return; }
        }

        if (itemsToScope.length === 0) { setError('Please provide items to scope.'); setIsScoping(false); return; }

        setIsScoping(true);
        const initialResults: ScopingItem[] = itemsToScope.map((name, i) => ({
             id: Date.now() + i, name, status: 'pending', quantity: 1, unit: 'unit', description: '', category: '', uacsCode: '', quotes: [], averagePrice: 0, markupPercentage: 35, catalogPrice: 0
        }));
        setResults(initialResults);

        for (const item of initialResults) {
            await performScopeForItem(item);
        }

        setIsScoping(false);
    };

    const handleRetryAll = () => {
        const failedItems = results.filter(r => r.status === 'failed');
        failedItems.forEach(performScopeForItem);
    };

    const handleAskAi = (item: ScopingItem) => {
        setChatContext(item);
        setChatHistory([]);
        setChatModalOpen(true);
    };

    const handleChatSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatMessage.trim() || chatLoading || !chatContext) return;
        const newUserMessage: ChatMessage = { sender: 'user', text: chatMessage };
        setChatHistory(prev => [...prev, newUserMessage]);
        setChatMessage('');
        setChatLoading(true);

        try {
            const context = `You are an expert procurement assistant. The user is asking about the item "${chatContext.name}". Here is the data you found for it: \nDescription: ${chatContext.description}\nCategory: ${chatContext.category}\nUACS Code: ${chatContext.uacsCode}\nAverage Price: PHP ${chatContext.averagePrice?.toFixed(2)}\nPrice Consistency: ${chatContext.priceConsistency}\nQuotes: ${chatContext.quotes?.map(q => `${q.supplier} at PHP ${q.price}`).join(', ')}. \n\nBased ONLY on this data, answer the user's question concisely.`;
            const aiResponse = await getAiAssistantResponse(context, chatMessage);
            setChatHistory(prev => [...prev, { sender: 'ai', text: aiResponse }]);
        } catch (err) {
            setChatHistory(prev => [...prev, { sender: 'ai', text: 'Sorry, I encountered an error. Please try again.' }]);
        } finally {
            setChatLoading(false);
        }
    };

    const getStatusIndicator = (status: ScopingItem['status']) => {
        const styles = {
            pending: { icon: '... ', text: 'Pending', color: 'text-gray-500' },
            loading: { icon: <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>, text: 'Scoping...', color: 'text-blue-500' },
            success: { icon: '✓', text: 'Success', color: 'text-green-500' },
            failed: { icon: '!', text: 'Failed', color: 'text-red-500' }
        };
        const current = styles[status];
        return <div className={`flex items-center gap-1.5 text-xs font-semibold ${current.color}`}> {current.icon} {current.text} </div>;
    };

    const getConsistencyBadge = (consistency?: PriceConsistency) => {
        if (!consistency || consistency === 'N/A') return null;
        const styles = {
            Low: 'bg-green-100 text-green-800',
            Moderate: 'bg-yellow-100 text-yellow-800',
            High: 'bg-red-100 text-red-800'
        };
        return <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${styles[consistency]}`}>{consistency} Variance</span>;
    };
    
    return (
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center"><svg className="w-8 h-8 mr-3 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75l-2.489-2.489m0 0a3.375 3.375 0 10-4.773-4.773 3.375 3.375 0 004.774 4.774zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>AI Market Scoping Desk</h2>
                <p className="text-gray-600 mb-6">Enter a list of items or upload a Purchase Request PDF. The AI will perform real-time market research, analyze price consistency, and allow contextual follow-up questions for each item.</p>
                
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                     <div className="flex border-b border-gray-200 mb-4">
                        <button onClick={() => setInputMode('list')} className={`px-4 py-2 text-sm font-medium transition-colors ${inputMode === 'list' ? 'border-b-2 border-orange-500 text-orange-600' : 'text-gray-500 hover:text-gray-700'}`}>Paste List</button>
                        <button onClick={() => setInputMode('pdf')} className={`px-4 py-2 text-sm font-medium transition-colors ${inputMode === 'pdf' ? 'border-b-2 border-orange-500 text-orange-600' : 'text-gray-500 hover:text-gray-700'}`}>Upload PDF</button>
                    </div>
                    {inputMode === 'list' ? (
                        <textarea value={itemList} onChange={(e) => setItemList(e.target.value)} placeholder="Paste one item per line..." className="w-full h-32 p-3 border border-gray-300 rounded-lg shadow-sm" />
                    ) : (
                        <div className="flex items-center space-x-4"><input type="file" accept=".pdf" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100" /> {uploadedFile && <span className="text-sm text-gray-600 truncate">{uploadedFile.name}</span>}</div>
                    )}
                    <button onClick={handleScopeItems} disabled={isScoping} className="btn mt-4 w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-wait">Scope Items</button>
                </div>
                {error && <pre className="text-red-600 mt-2 text-center text-sm whitespace-pre-wrap">{error}</pre>}
            </div>
            
            <div className="bg-gray-50 p-6 rounded-2xl shadow-inner">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-700">Scoping Results ({results.filter(r => r.status === 'success').length}/{results.length})</h3>
                    {results.some(r => r.status === 'failed') && <button onClick={handleRetryAll} className="btn text-sm bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-lg">Retry All Failed</button>}
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border-collapse">
                        <thead className="bg-gray-100"><tr>
                            <th className="p-3 text-left text-xs font-semibold text-gray-600 uppercase">Item Name</th>
                            <th className="p-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                            <th className="p-3 text-left text-xs font-semibold text-gray-600 uppercase">Avg. Price</th>
                            <th className="p-3 text-left text-xs font-semibold text-gray-600 uppercase">Price Consistency</th>
                            <th className="p-3 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>
                        </tr></thead>
                        <tbody>{results.map(item => (
                            <React.Fragment key={item.id}>
                                <tr className={`border-b ${item.status === 'failed' ? 'bg-red-50' : 'hover:bg-gray-50'}`}>
                                    <td className="p-3 font-semibold text-gray-800">{item.name}</td>
                                    <td className="p-3">{getStatusIndicator(item.status)}</td>
                                    <td className="p-3 font-mono text-sm">{item.averagePrice ? `₱${item.averagePrice.toFixed(2)}` : 'N/A'}</td>
                                    <td className="p-3">{getConsistencyBadge(item.priceConsistency)}</td>
                                    <td className="p-3 text-center space-x-1">
                                        {item.status === 'success' && <>
                                            <button onClick={() => setExpandedRowId(expandedRowId === item.id ? null : item.id)} className="p-1.5 text-xs text-gray-500 hover:text-black rounded hover:bg-gray-200">Details</button>
                                            <button onClick={() => handleAskAi(item)} className="p-1.5 text-xs text-gray-500 hover:text-black rounded hover:bg-gray-200">Ask AI</button>
                                        </>}
                                        {item.status === 'failed' && <button onClick={() => performScopeForItem(item)} className="p-1.5 text-xs text-yellow-600 hover:text-black rounded hover:bg-yellow-200">Retry</button>}
                                    </td>
                                </tr>
                                {expandedRowId === item.id && (
                                    <tr className="bg-gray-100"><td colSpan={5} className="p-4">
                                        <h4 className="font-bold text-gray-800 mb-2">Details for: {item.name}</h4>
                                        <p className="text-sm text-gray-600 mb-1"><span className="font-semibold">Description:</span> {item.description}</p>
                                        <p className="text-sm text-gray-600"><span className="font-semibold">Category:</span> {item.category} | <span className="font-semibold">UACS:</span> {item.uacsCode}</p>
                                        
                                        <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200 grid grid-cols-2 gap-2 text-center">
                                            <div>
                                                <p className="text-xs font-semibold text-gray-500">Average Canvassed Price</p>
                                                <p className="text-lg font-bold text-orange-600">₱{item.averagePrice.toFixed(2)}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold text-gray-500">Suggested Catalog Price (+35%)</p>
                                                <p className="text-lg font-bold text-green-600">₱{item.catalogPrice.toFixed(2)}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                            {item.quotes?.map((q, i) => (
                                                <div key={i} className="bg-white p-3 rounded-lg border shadow-sm">
                                                    <img src={q.imageUrl || 'https://i.ibb.co/x7P39M6/placeholder-thumbnail.png'} alt={q.supplier} className="w-full h-24 object-contain rounded mb-2 bg-gray-200" onError={(e) => { e.currentTarget.src = 'https://i.ibb.co/x7P39M6/placeholder-thumbnail.png'; }} />
                                                    <p className="font-semibold text-sm truncate">{q.supplier}</p>
                                                    <p className="font-bold text-lg text-green-600">₱{q.price > 0 ? q.price.toFixed(2) : 'N/A'}</p>
                                                    <a href={q.link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline truncate block">View Source</a>
                                                </div>
                                            ))}
                                        </div>
                                    </td></tr>
                                )}
                            </React.Fragment>
                        ))}
                        {results.length === 0 && <tr><td colSpan={5} className="text-center py-10 text-gray-500">No items to display.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>

            {chatModalOpen && chatContext && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setChatModalOpen(false)}>
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg flex flex-col h-[60vh]" onClick={e => e.stopPropagation()}>
                        <header className="p-3 border-b flex justify-between items-center"><h3 className="font-bold text-gray-800 truncate">Ask AI about: {chatContext.name}</h3><button onClick={() => setChatModalOpen(false)} className="text-gray-500 text-2xl">&times;</button></header>
                        <main className="flex-grow p-4 space-y-4 overflow-y-auto bg-gray-50">
                            {chatHistory.map((msg, i) => (
                                <div key={i} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-sm px-3 py-2 rounded-lg ${msg.sender === 'user' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-800'}`}><p className="text-sm whitespace-pre-wrap">{msg.text}</p></div>
                                </div>
                            ))}
                             {chatLoading && <div className="flex justify-start"><div className="px-3 py-2 rounded-lg bg-gray-200 text-gray-800"><div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></div><div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse [animation-delay:0.2s]"></div><div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse [animation-delay:0.4s]"></div></div></div></div>}
                        </main>
                        <form onSubmit={handleChatSubmit} className="p-3 border-t flex gap-2"><input type="text" value={chatMessage} onChange={e => setChatMessage(e.target.value)} placeholder="e.g., Explain the price variance..." className="flex-grow p-2 border rounded-md" /><button type="submit" disabled={chatLoading} className="btn bg-orange-500 text-white px-4 rounded-md disabled:bg-gray-400">Send</button></form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MarketScopingTab;