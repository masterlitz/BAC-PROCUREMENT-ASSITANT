
import React, { forwardRef, useImperativeHandle } from 'react';
import { PpmpProjectItem, PurchaseRequest } from '../../types';

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

interface BudgetViewProps {
    consolidatedItems: PpmpProjectItem[];
    purchaseRequests: PurchaseRequest[];
    onAddRequest: (requests: PurchaseRequest[]) => void;
}

const BudgetView = forwardRef<({ exportToPdf: () => void; }), BudgetViewProps>(({ consolidatedItems, purchaseRequests, onAddRequest }, ref) => {

    const handleCreatePr = (item: PpmpProjectItem) => {
        const newPr: PurchaseRequest = {
            id: Date.now(),
            projectId: item.id,
            prNumber: `PR-${item.office.substring(0,3).toUpperCase()}-${Date.now().toString().slice(-4)}`,
            date: new Date().toISOString().split('T')[0],
            quantity: 1, 
            actualCost: item.estimatedBudget * 0.9, // Simulate a cost 10% lower than budget
        };
        onAddRequest([...purchaseRequests, newPr]);
    };

    useImperativeHandle(ref, () => ({
        exportToPdf: () => {
             if (!window.jspdf || !window.jspdf.jsPDF) {
                alert("PDF export library not loaded.");
                return;
            }

            const doc = new window.jspdf.jsPDF({ orientation: 'landscape' }) as jsPDFWithAutoTable;
            
            doc.setFontSize(18);
            doc.setFont('helvetica', 'bold');
            doc.text("Budget Utilization Report", doc.internal.pageSize.getWidth() / 2, 40, { align: 'center' });
            
            const head = [['Project ID', 'Description', 'Budget (PHP)', 'Consumed (PHP)', 'Balance (PHP)']];
            const body = consolidatedItems.map(item => {
                const consumed = purchaseRequests
                    .filter(pr => pr.projectId === item.id)
                    .reduce((sum, pr) => sum + pr.actualCost, 0);
                const balance = item.estimatedBudget - consumed;

                return [
                    item.id,
                    item.generalDescription,
                    item.estimatedBudget.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}),
                    consumed.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}),
                    balance.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})
                ];
            });

            doc.autoTable({
                startY: 60,
                head: head,
                body: body,
                theme: 'striped',
                headStyles: { fillColor: '#f97316' },
                columnStyles: { 
                    0: { cellWidth: 50 },
                    1: { cellWidth: 'auto' },
                    2: { halign: 'right' },
                    3: { halign: 'right' },
                    4: { halign: 'right' },
                },
            });
            
            doc.save("PPMP_Budget_Utilization_Report.pdf");
        }
    }));

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Budget Utilization</h2>
             <div className="bg-white p-4 rounded-lg shadow-sm border">
                <h3 className="font-bold text-gray-700 mb-2">Created Purchase Requests</h3>
                {purchaseRequests.length > 0 ? (
                    <ul className="text-xs space-y-1 max-h-48 overflow-y-auto">
                        {purchaseRequests.map(pr => {
                            const project = consolidatedItems.find(p => p.id === pr.projectId);
                            return (
                                <li key={pr.id} className="bg-gray-50 p-2 rounded-sm flex justify-between">
                                    <span><strong>{pr.prNumber}</strong> for "{project?.generalDescription}"</span>
                                    <span className="font-mono">₱{pr.actualCost.toLocaleString()}</span>
                                </li>
                            );
                        })}
                    </ul>
                ) : <p className="text-sm text-gray-500">No Purchase Requests created yet.</p>}
            </div>
             <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                 <div className="overflow-x-auto">
                    <table className="min-w-full text-xs">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-2 text-left font-semibold">Project ID</th>
                                <th className="p-2 text-left font-semibold">Description</th>
                                <th className="p-2 text-right font-semibold">Budget</th>
                                <th className="p-2 text-right font-semibold">Consumed</th>
                                <th className="p-2 text-right font-semibold">Balance</th>
                                <th className="p-2 text-center font-semibold">Action</th>
                            </tr>
                        </thead>
                         <tbody>
                            {consolidatedItems.map(item => {
                                const consumed = purchaseRequests
                                    .filter(pr => pr.projectId === item.id)
                                    .reduce((sum, pr) => sum + pr.actualCost, 0);
                                const balance = item.estimatedBudget - consumed;
                                return (
                                    <tr key={item.id} className="border-t hover:bg-gray-50">
                                        <td className="p-2">{item.id}</td>
                                        <td className="p-2">{item.generalDescription}</td>
                                        <td className="p-2 text-right font-mono">₱{item.estimatedBudget.toLocaleString()}</td>
                                        <td className="p-2 text-right font-mono text-orange-700">₱{consumed.toLocaleString()}</td>
                                        <td className="p-2 text-right font-mono font-bold text-green-700">₱{balance.toLocaleString()}</td>
                                        <td className="p-2 text-center">
                                            <button onClick={() => handleCreatePr(item)} className="text-blue-600 hover:underline text-xs">Create PR</button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
});

export default BudgetView;
