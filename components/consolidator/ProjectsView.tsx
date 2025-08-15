import React, { useState, useMemo, forwardRef, useImperativeHandle } from 'react';
import { PpmpProjectItem } from '../../types';

interface ProjectsViewProps {
    items: PpmpProjectItem[];
    onDelete: (projectId: number) => void;
}

// Augment the jsPDF instance type with the autoTable method from the plugin
declare global {
    interface Window {
        jspdf: { 
            jsPDF: new (options?: any) => any;
            plugin: any;
        };
    }
}
interface jsPDFWithAutoTable extends InstanceType<typeof window.jspdf.jsPDF> {
  autoTable: (options: any) => jsPDFWithAutoTable;
}

const ProjectsView = forwardRef<({ exportToPdf: () => void; }), ProjectsViewProps>(({ items, onDelete }, ref) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [officeFilter, setOfficeFilter] = useState('all');

    const offices = [...new Set(items.map(item => item.office))].sort();

    const filteredItems = useMemo(() => items.filter(item =>
        (item.generalDescription.toLowerCase().includes(searchTerm.toLowerCase()) || item.office.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (officeFilter === 'all' || item.office === officeFilter)
    ), [items, searchTerm, officeFilter]);

    useImperativeHandle(ref, () => ({
        exportToPdf: () => {
            if (filteredItems.length === 0) {
                alert("There are no projects in the current view to export.");
                return;
            }
            if (!window.jspdf || !window.jspdf.jsPDF) {
                alert("PDF export library not loaded. Please check your connection and try again.");
                return;
            }

            const doc = new window.jspdf.jsPDF({ orientation: 'l' }) as jsPDFWithAutoTable;

            doc.setFontSize(18);
            doc.setFont('helvetica', 'bold');
            doc.text("Consolidated Projects Report", 14, 22);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`Filters: Office - ${officeFilter}, Search - "${searchTerm || 'None'}"`, 14, 30);
            doc.text(`Total Projects: ${filteredItems.length}`, doc.internal.pageSize.getWidth() - 14, 30, { align: 'right' });

            doc.autoTable({
                startY: 40,
                head: [['ID', 'Office', 'Description', 'Procurement Mode', 'Estimated Budget']],
                body: filteredItems.map(item => [
                    item.id,
                    item.office,
                    item.generalDescription,
                    item.procurementMode,
                    `₱${item.estimatedBudget.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`
                ]),
                theme: 'striped',
                headStyles: { fillColor: '#f97316' },
                columnStyles: {
                    0: { cellWidth: 40 },
                    1: { cellWidth: 120 },
                    2: { cellWidth: 'auto' },
                    3: { cellWidth: 100 },
                    4: { cellWidth: 80, halign: 'right' }
                },
                didParseCell: (data) => {
                    // For long descriptions, you might want to adjust font size, but autotable handles wrapping well.
                }
            });

            doc.save('PPMP_Projects_Report.pdf');
        }
    }));
    
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">All Projects</h2>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border flex flex-wrap gap-4 items-center">
                <input 
                    type="text" 
                    placeholder="Search projects..." 
                    value={searchTerm} 
                    onChange={e => setSearchTerm(e.target.value)} 
                    className="p-2 border rounded-md text-sm flex-grow"
                />
                <select 
                    value={officeFilter} 
                    onChange={e => setOfficeFilter(e.target.value)} 
                    className="p-2 border rounded-md text-sm"
                >
                    <option value="all">All Offices</option>
                    {offices.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
                <div className="text-sm font-semibold text-gray-600">
                    Showing {filteredItems.length} of {items.length} projects
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-xs">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-2 text-left font-semibold">ID</th>
                                <th className="p-2 text-left font-semibold">Office</th>
                                <th className="p-2 text-left font-semibold">Description</th>
                                <th className="p-2 text-left font-semibold">Mode</th>
                                <th className="p-2 text-right font-semibold">Budget</th>
                                <th className="p-2 text-center font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredItems.map(item => (
                                <tr key={item.id} className="border-t hover:bg-gray-50">
                                    <td className="p-2">{item.id}</td>
                                    <td className="p-2 font-semibold text-gray-600">{item.office}</td>
                                    <td className="p-2">{item.generalDescription}</td>
                                    <td className="p-2"><span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-[10px] font-semibold">{item.procurementMode}</span></td>
                                    <td className="p-2 text-right font-mono">₱{item.estimatedBudget.toLocaleString()}</td>
                                    <td className="p-2 text-center">
                                        <button onClick={() => onDelete(item.id)} className="text-red-500 hover:underline">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
});

export default ProjectsView;