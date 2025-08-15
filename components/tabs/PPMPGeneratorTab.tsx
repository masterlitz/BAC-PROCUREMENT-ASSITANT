import React, { useState } from 'react';
import { generatePpmpItems } from '../../services/geminiService';
import { PpmpItem } from '../../types';
import Loader from '../Loader';

const PPMPGeneratorTab: React.FC = () => {
    const [userInput, setUserInput] = useState<string>('');
    const [items, setItems] = useState<PpmpItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerate = async () => {
        if (!userInput.trim()) {
            setError('Please describe your project or needs.');
            return;
        }
        setLoading(true);
        setError('');
        setItems([]);
        try {
            const generatedItems = await generatePpmpItems(userInput);
            setItems(generatedItems);
        } catch (err: any) {
            console.error(err);
            setError(`Failed to generate PPMP items. ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleItemChange = (index: number, field: keyof PpmpItem, value: string) => {
        const newItems = [...items];
        const itemToUpdate = { ...newItems[index] };
        (itemToUpdate as any)[field] = value;
        newItems[index] = itemToUpdate;
        setItems(newItems);
    };

    const handleAddItem = () => {
        const newItem: PpmpItem = { isCategory: false, description: '', quantity: '1', uom: 'unit' };
        setItems(prev => [...prev, newItem]);
    };
    
    const handleAddCategory = () => {
        const newItem: PpmpItem = { isCategory: true, description: 'NEW CATEGORY' };
        setItems(prev => [...prev, newItem]);
    };

    const handleRemoveItem = (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
    };

    const handleExportCsv = () => {
        const headers = ['Category/Item', 'Quantity', 'Unit of Measure'];
        const rows = items.map(item => {
            const description = `"${(item.description || '').replace(/"/g, '""')}"`;
            if (item.isCategory) {
                return `${description},"",""`;
            }
            const quantity = `"${item.quantity || ''}"`;
            const uom = `"${item.uom || ''}"`;
            return [description, quantity, uom].join(',');
        });

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "draft_ppmp.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const EditableCell: React.FC<{ value: string; onChange: (value: string) => void; className?: string }> = ({ value, onChange, className }) => (
        <input
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            className={`w-full bg-transparent p-1 focus:bg-orange-100 focus:outline-none focus:ring-1 focus:ring-orange-500 rounded-sm ${className}`}
        />
    );

    return (
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 mr-3 text-orange-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
                AI-Powered PPMP Generator
            </h2>
            <p className="text-gray-600 mb-6">Describe your project or department needs in plain language. The AI will generate a draft Project Procurement Management Plan (PPMP) for you to edit and export.</p>
            
            <div className="bg-gray-50 p-4 rounded-lg border border-dashed border-gray-300 mb-6">
                <label htmlFor="project-description" className="block text-sm font-medium text-gray-700 mb-2">Project Description</label>
                <textarea
                    id="project-description"
                    rows={5}
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="e.g., 'Set up a new office for 20 people. We need computers, desks, chairs, office supplies, and a printer...'"
                />
            </div>
            
            <button
                onClick={handleGenerate}
                className="btn bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-lg w-full disabled:bg-gray-400"
                disabled={loading}
            >
                {loading ? 'Generating...' : 'Generate Draft PPMP'}
            </button>
            
            {loading && <Loader text="AI is drafting your PPMP..." />}
            {error && <p className="text-center text-red-500 my-4">{error}</p>}
            
            {items.length > 0 && (
                <div className="mt-8">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-gray-800">Draft PPMP</h3>
                        <button onClick={handleExportCsv} className="btn bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg">Export to CSV</button>
                    </div>
                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                        <table className="min-w-full bg-white">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="p-3 text-left text-sm font-semibold text-gray-600">Category / Item Description</th>
                                    <th className="p-3 text-left text-sm font-semibold text-gray-600 w-32">Quantity</th>
                                    <th className="p-3 text-left text-sm font-semibold text-gray-600 w-32">Unit</th>
                                    <th className="p-3 text-center text-sm font-semibold text-gray-600 w-24">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item, index) => (
                                    <tr key={index} className={item.isCategory ? 'bg-orange-100 font-bold' : 'hover:bg-gray-50'}>
                                        <td className="p-1">
                                            <EditableCell value={item.description || ''} onChange={v => handleItemChange(index, 'description', v)} className={item.isCategory ? 'text-orange-800' : ''} />
                                        </td>
                                        <td className="p-1">
                                            {!item.isCategory && <EditableCell value={item.quantity || ''} onChange={v => handleItemChange(index, 'quantity', v)} />}
                                        </td>
                                        <td className="p-1">
                                            {!item.isCategory && <EditableCell value={item.uom || ''} onChange={v => handleItemChange(index, 'uom', v)} />}
                                        </td>
                                        <td className="p-1 text-center">
                                            <button onClick={() => handleRemoveItem(index)} className="text-red-500 hover:text-red-700 p-1 text-xs" title="Remove Item">
                                                &times;
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-2 flex gap-2">
                        <button onClick={handleAddItem} className="text-sm text-blue-600 hover:underline">+ Add Item</button>
                        <button onClick={handleAddCategory} className="text-sm text-blue-600 hover:underline">+ Add Category</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PPMPGeneratorTab;