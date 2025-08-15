import React, { useRef } from 'react';
import { CHANGELOG_DATA } from '../constants';

interface ChangelogModalProps {
    isVisible: boolean;
    onClose: () => void;
}

const ChangelogModal: React.FC<ChangelogModalProps> = ({ isVisible, onClose }) => {
    const printableRef = useRef<HTMLDivElement>(null);
    
    const handleExport = () => {
        const data = CHANGELOG_DATA;
        let textContent = "BAC Procurement Assistant - Changelog\n";
        textContent += "========================================\n\n";

        data.forEach(entry => {
            textContent += `Version: ${entry.version}\n`;
            textContent += `Date: ${entry.date}\n`;
            textContent += "Changes:\n";
            entry.changes.forEach(change => {
                textContent += `- ${change}\n`;
            });
            textContent += "\n----------------------------------------\n\n";
        });

        const blob = new Blob([textContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'changelog.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    if (!isVisible) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black/60 z-[51] flex items-center justify-center p-4 flow-modal">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl flex flex-col h-[80vh]" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
                    <h3 className="font-bold text-gray-800 text-lg">What's New & Changelog</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-900 text-2xl">&times;</button>
                </header>
                <main ref={printableRef} className="flex-grow p-6 overflow-y-auto bg-gray-100">
                    <div className="space-y-8">
                        {CHANGELOG_DATA.map(entry => (
                            <div key={entry.version} className="bg-white p-4 rounded-lg shadow-sm border">
                                <div className="flex justify-between items-baseline">
                                    <h4 className="text-xl font-bold text-orange-600">Version {entry.version}</h4>
                                    <p className="text-sm text-gray-500">{entry.date}</p>
                                </div>
                                <ul className="mt-3 list-disc list-inside space-y-2 text-gray-700 text-sm">
                                    {entry.changes.map((change, index) => (
                                        <li key={index}>{change}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </main>
                <footer className="p-3 border-t bg-gray-50 rounded-b-lg flex justify-end">
                    <button onClick={handleExport} className="btn bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg">
                        Export to Text File
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default ChangelogModal;
