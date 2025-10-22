
import React, { useState, useMemo, useRef } from 'react';
import { directoryData, DirectoryEntry } from '../../data/directoryData';
import { QRCodeCanvas } from 'qrcode.react';
import { bacolodCityLogo, orangeBacolodLogo } from '../../data/logo';

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

interface DisplayUser {
    id: number;
    fullName: string;
    department: string;
    username: string;
}

interface DigitalIdModalProps {
    user: DisplayUser;
    onClose: () => void;
}

const DigitalIdModal: React.FC<DigitalIdModalProps> = ({ user, onClose }) => {
    const idCardRef = useRef<HTMLDivElement>(null);
    const qrValue = "https://bit.ly/bacbcdPA";

    const handlePrintId = () => {
        const printArea = document.createElement('div');
        printArea.className = 'digital-id-print-area';
        const cardNode = idCardRef.current?.cloneNode(true);
        if (cardNode) {
            printArea.appendChild(cardNode);
            document.body.appendChild(printArea);
            document.body.classList.add('is-printing-id');

            const onAfterPrint = () => {
                document.body.classList.remove('is-printing-id');
                document.body.removeChild(printArea);
                window.removeEventListener('afterprint', onAfterPrint);
            };
            window.addEventListener('afterprint', onAfterPrint, { once: true });
            
            setTimeout(() => window.print(), 50);
        }
    };
    
    const handleDownloadImage = () => {
        const cardElement = idCardRef.current;
        if (cardElement && window.html2canvas) {
            if (document.activeElement instanceof HTMLElement) {
                document.activeElement.blur();
            }
            setTimeout(() => {
                window.html2canvas(cardElement.querySelector('.id-card-capture-area'), {
                    scale: 3,
                    useCORS: true,
                    backgroundColor: null,
                }).then((canvas: HTMLCanvasElement) => {
                    const link = document.createElement('a');
                    link.download = `digital-id-${user.fullName.replace(/\s+/g, '-')}.png`;
                    link.href = canvas.toDataURL('image/png');
                    link.click();
                });
            }, 100);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg flex flex-col" onClick={e => e.stopPropagation()}>
                <div ref={idCardRef} className="p-4 bg-gray-100">
                    <div className="w-full max-w-sm mx-auto rounded-xl overflow-hidden shadow-lg bg-slate-50 font-sans relative id-card-capture-area" style={{ fontFamily: "'Inter', sans-serif" }}>
                        <div className="absolute inset-x-0 bottom-20 top-20 flex items-center justify-center pointer-events-none z-0">
                            <img
                                src={orangeBacolodLogo}
                                alt="Watermark"
                                className="w-48 h-48 opacity-5"
                            />
                        </div>
                        <div className="relative z-10">
                            <div className="bg-gradient-to-r from-blue-800 to-orange-500 h-24 p-4 flex justify-between items-start">
                                <img src={bacolodCityLogo} alt="Bacolod City Seal" className="h-16 w-16" />
                                <div className="text-right">
                                    <p className="text-white font-bold text-lg leading-tight">BACOLOD CITY</p>
                                    <p className="text-white text-xs">OFFICE OF THE CITY MAYOR</p>
                                </div>
                            </div>
                            <div className="p-4 pt-0 text-center -mt-14">
                                <div className="w-24 h-24 rounded-full border-4 border-white inline-block overflow-hidden bg-gray-200">
                                    <img src="https://static.vecteezy.com/system/resources/previews/036/280/651/non_2x/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg" alt="User" className="w-full h-full object-cover" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-800 mt-2">{user.fullName}</h2>
                                <p className="text-sm text-gray-500">{user.department}</p>
                                <p className="text-xs text-gray-600 mt-1 break-all">{user.username}</p>
                            </div>
                            <div className="px-4 pb-4 flex justify-between items-center">
                                <div className="text-left">
                                    <p className="text-xs text-gray-400">ID NUMBER</p>
                                    <p className="font-mono text-sm text-gray-800">{`BAC-${String(user.id).padStart(5, '0')}`}</p>
                                    <p className="text-xs text-gray-400 mt-2">VALID UNTIL</p>
                                    <p className="font-mono text-sm text-gray-800">12/31/2026</p>
                                </div>
                                <div className="text-center">
                                    <div className="p-1 bg-white border rounded-md inline-block">
                                        <QRCodeCanvas value={qrValue} size={80} level={"H"} />
                                    </div>
                                    <p className="text-[10px] font-mono mt-1 text-gray-600 break-all">bit.ly/bacbcdPA</p>
                                </div>
                            </div>
                            <div className="bg-gray-100 p-2">
                                 <svg className="w-full h-10"
                                     dangerouslySetInnerHTML={{
                                        __html: `<rect x="0" y="0" width="100%" height="100%" fill="none" />
                                                <g fill="#333">
                                                    ${Array.from({length: 40}).map((_, i) =>
                                                        `<rect x="${2 + i * 8}" y="5" width="${2 + Math.random() * 3}" height="30" />`
                                                    ).join('')}
                                                </g>`
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                 <div className="p-4 bg-gray-100 border-t flex justify-end gap-3">
                    <button onClick={onClose} className="btn bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg">Close</button>
                    <button onClick={handleDownloadImage} className="btn bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg">Download Image</button>
                    <button onClick={handlePrintId} className="btn bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">Print ID Card</button>
                 </div>
            </div>
        </div>
    );
};


const DirectoryTab: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [viewingUser, setViewingUser] = useState<DirectoryEntry | null>(null);

    const filteredData = useMemo(() => {
        if (!searchTerm.trim()) {
            return directoryData;
        }
        const lowercasedFilter = searchTerm.toLowerCase();
        return directoryData.filter(entry =>
            entry.department.toLowerCase().includes(lowercasedFilter) ||
            entry.officeHead.toLowerCase().includes(lowercasedFilter) ||
            entry.position.toLowerCase().includes(lowercasedFilter) ||
            entry.liaison.toLowerCase().includes(lowercasedFilter) ||
            entry.contact.toLowerCase().includes(lowercasedFilter) ||
            entry.email.toLowerCase().includes(lowercasedFilter)
        );
    }, [searchTerm]);

    const handleExportPdf = () => {
        if (filteredData.length === 0) {
            alert("No data to export based on the current filter.");
            return;
        }

        const jspdfModule = window.jspdf;
        if (!jspdfModule || typeof jspdfModule.jsPDF !== 'function') {
            alert("PDF generation library is unavailable. Please check your network or try reloading the page.");
            return;
        }

        const { jsPDF } = jspdfModule;
        const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'legal' }) as jsPDFWithAutoTable;

        if (typeof doc.autoTable !== 'function') {
            alert("PDF table plugin is unavailable. Please check your network or try reloading the page.");
            return;
        }

        const pageContent = (data: any) => {
            // HEADER
            doc.setFontSize(18);
            doc.setFont('helvetica', 'bold');
            doc.text('Bacolod City Government Office Directory', doc.internal.pageSize.getWidth() / 2, 40, { align: 'center' });
            
            try {
                 doc.addImage(bacolodCityLogo, 'PNG', 40, 25, 40, 40);
            } catch(e) {
                console.error("Could not add logo to PDF:", e);
            }

            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.text(`Generated on: ${new Date().toLocaleDateString()}`, doc.internal.pageSize.getWidth() - 40, 40, { align: 'right' });
            
            // FOOTER
            const pageCount = (doc as any).internal.getNumberOfPages();
            doc.setFontSize(8);
            doc.text(`Page ${data.pageNumber} of ${pageCount}`, data.settings.margin.left, doc.internal.pageSize.getHeight() - 20);
        };

        const head = [['Department', 'Office Head', 'Position', 'Liaison', 'Contact Number', 'Email Address']];
        const body = filteredData.map(entry => [
            entry.department,
            entry.officeHead,
            entry.position,
            entry.liaison || 'N/A',
            entry.contact,
            entry.email
        ]);

        doc.autoTable({
            startY: 80,
            head: head,
            body: body,
            theme: 'striped',
            headStyles: { fillColor: '#f97316', fontStyle: 'bold' },
            styles: { fontSize: 8, cellPadding: 5, overflow: 'linebreak' },
            columnStyles: {
                0: { cellWidth: 180 }, 
                1: { cellWidth: 130 }, 
                2: { cellWidth: 130 },
                3: { cellWidth: 130 },
                4: { cellWidth: 100 },
                5: { cellWidth: 'auto' },
            },
            didDrawPage: pageContent,
        });

        doc.save('bacolod-city-directory.pdf');
    };

    return (
        <>
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg">
                <div className="text-center mb-8">
                    <h2 className="text-2xl md:text-3xl font-extrabold text-gray-800 mb-2">Bacolod City Government Office Directory</h2>
                    <p className="text-gray-500 max-w-2xl mx-auto">A comprehensive list of departments and key personnel for easy reference and communication.</p>
                </div>
                
                <div className="mb-6 flex flex-col sm:flex-row gap-4">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by department, name, or contact..."
                        className="w-full sm:flex-grow p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                    <button
                        onClick={handleExportPdf}
                        className="btn bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 flex-shrink-0"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Export PDF
                    </button>
                </div>

                <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="min-w-full bg-white">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Department</th>
                                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Office Head / Position</th>
                                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Liaison</th>
                                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="py-3 px-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredData.length > 0 ? (
                                filteredData.map((entry) => (
                                    <tr key={entry.id} className="hover:bg-orange-50 transition-colors duration-150">
                                        <td className="py-3 px-4 text-sm font-semibold text-gray-800">{entry.department}</td>
                                        <td className="py-3 px-4 text-sm text-gray-600">
                                            <p className="font-medium text-gray-800">{entry.officeHead}</p>
                                            <p className="text-xs text-gray-500">{entry.position}</p>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-600">{entry.liaison || 'N/A'}</td>
                                        <td className="py-3 px-4 text-sm">
                                            <a href={`tel:${entry.contact.replace(/[^0-9+]/g, '')}`} className="text-blue-600 hover:underline">{entry.contact}</a>
                                        </td>
                                        <td className="py-3 px-4 text-sm">
                                            <a href={`mailto:${entry.email}`} className="text-blue-600 hover:underline break-all">{entry.email}</a>
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <button
                                                onClick={() => setViewingUser(entry)}
                                                className="p-2 text-gray-500 rounded-full hover:bg-orange-100 hover:text-orange-600 transition-colors"
                                                title="View Digital ID"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4z" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="text-center py-10 text-gray-500">
                                        No offices found matching your search criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {viewingUser && (
                <DigitalIdModal
                    user={{
                        id: viewingUser.id,
                        fullName: viewingUser.officeHead,
                        department: viewingUser.department,
                        username: viewingUser.email,
                    }}
                    onClose={() => setViewingUser(null)}
                />
            )}
        </>
    );
};

export default DirectoryTab;
