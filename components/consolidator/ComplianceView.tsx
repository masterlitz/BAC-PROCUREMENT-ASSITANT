
import React, { useMemo, forwardRef, useImperativeHandle } from 'react';
import { PpmpProjectItem } from '../../types';
import { officeActionData } from '../../data/officeActionData';

// Augment the jsPDF instance type
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

interface ComplianceViewProps {
    consolidatedItems: PpmpProjectItem[];
}

type ComplianceStatus = 'Complied' | 'Partial Submission' | 'Pending Submission' | 'Not in Masterlist';

interface ComplianceData {
    office: string;
    fullName: string;
    status: ComplianceStatus;
    submitted: number;
    expected: number;
    budget: number;
    notes: string;
}

const getStatusStyle = (status: ComplianceStatus) => {
    switch (status) {
        case 'Complied': return 'bg-green-100 text-green-800';
        case 'Partial Submission': return 'bg-yellow-100 text-yellow-800';
        case 'Pending Submission': return 'bg-red-100 text-red-800';
        case 'Not in Masterlist': return 'bg-purple-100 text-purple-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const ComplianceView = forwardRef<({ exportToPdf: () => void; }), ComplianceViewProps>(({ consolidatedItems }, ref) => {
    
    const complianceData = useMemo(() => {
        const submittedOfficeData = new Map<string, { count: number; budget: number }>();
        consolidatedItems.forEach(item => {
            const officeData = submittedOfficeData.get(item.office) || { count: 0, budget: 0 };
            officeData.count += 1;
            officeData.budget += item.estimatedBudget;
            submittedOfficeData.set(item.office, officeData);
        });

        const masterOfficeMap = new Map(officeActionData.map(o => [o.fullName, { expected: o.count, shortName: o.shortName }]));
        
        const results: ComplianceData[] = [];

        masterOfficeMap.forEach((data, fullName) => {
            const submitted = submittedOfficeData.get(fullName) || { count: 0, budget: 0 };
            let status: ComplianceStatus;
            let notes = '';

            if (submitted.count === 0) {
                status = 'Pending Submission';
                notes = 'No PPMP projects found for this office.';
            } else if (submitted.count < data.expected) {
                status = 'Partial Submission';
                notes = `Submitted ${submitted.count} of ${data.expected} expected projects.`;
            } else {
                status = 'Complied';
                notes = `Submitted ${submitted.count} of ${data.expected} expected projects.`;
            }
            
            results.push({
                office: data.shortName,
                fullName,
                status,
                submitted: submitted.count,
                expected: data.expected,
                budget: submitted.budget,
                notes
            });
        });

        submittedOfficeData.forEach((data, officeName) => {
            if (!masterOfficeMap.has(officeName)) {
                results.push({
                    office: officeName,
                    fullName: officeName,
                    status: 'Not in Masterlist',
                    submitted: data.count,
                    expected: 0,
                    budget: data.budget,
                    notes: 'This office is not in the master list. Please verify the department name.'
                });
            }
        });
        
        return results.sort((a, b) => a.fullName.localeCompare(b.fullName));
    }, [consolidatedItems]);
    
    const summary = useMemo(() => {
        const compliedCount = complianceData.filter(d => d.status === 'Complied').length;
        const totalOffices = officeActionData.length;
        return {
            totalOffices,
            compliedCount,
            pendingCount: complianceData.filter(d => d.status === 'Pending Submission').length,
            partialCount: complianceData.filter(d => d.status === 'Partial Submission').length,
            unlistedCount: complianceData.filter(d => d.status === 'Not in Masterlist').length,
            complianceRate: totalOffices > 0 ? (compliedCount / totalOffices) * 100 : 0,
        };
    }, [complianceData]);

    const budgetByOffice = useMemo(() => {
        return complianceData
            .filter(d => d.budget > 0)
            .map(d => ({ name: d.office, budget: d.budget }))
            .sort((a, b) => b.budget - a.budget);
    }, [complianceData]);

    const maxBudget = Math.max(...budgetByOffice.map(o => o.budget), 0);

    useImperativeHandle(ref, () => ({
        exportToPdf: () => {
            if (!window.jspdf || !window.jspdf.jsPDF) {
                alert("PDF export library not loaded.");
                return;
            }

            const doc = new window.jspdf.jsPDF({ orientation: 'landscape' }) as jsPDFWithAutoTable;
            
            doc.setFontSize(18);
            doc.setFont('helvetica', 'bold');
            doc.text("PPMP Compliance Report", doc.internal.pageSize.getWidth() / 2, 40, { align: 'center' });
            
            const head = [['Office', 'Status', 'Projects Submitted', 'Total Budget (PHP)', 'Notes']];
            const body = complianceData.map(d => [
                d.office,
                d.status,
                `${d.submitted}/${d.expected > 0 ? d.expected : '-'}`,
                d.budget.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}),
                d.notes
            ]);

            doc.autoTable({
                startY: 60,
                head: head,
                body: body,
                theme: 'striped',
                headStyles: { fillColor: '#f97316' },
                columnStyles: { 
                    0: { cellWidth: 100 },
                    3: { halign: 'right' },
                    4: { cellWidth: 'auto' }
                },
            });

            doc.save("PPMP_Compliance_Report.pdf");
        }
    }));

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">PPMP Compliance Dashboard</h2>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                 <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
                    <p className="text-3xl font-extrabold text-orange-600">{summary.complianceRate.toFixed(0)}%</p>
                    <p className="text-sm text-gray-500 font-semibold">Compliance Rate</p>
                </div>
                 <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
                    <p className="text-3xl font-bold text-green-600">{summary.compliedCount}</p>
                    <p className="text-sm text-gray-500 font-semibold">Offices Complied</p>
                </div>
                 <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
                    <p className="text-3xl font-bold text-red-600">{summary.pendingCount}</p>
                    <p className="text-sm text-gray-500 font-semibold">Pending Submission</p>
                </div>
                 <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
                    <p className="text-3xl font-bold text-yellow-600">{summary.partialCount}</p>
                    <p className="text-sm text-gray-500 font-semibold">Partial Submissions</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-4 rounded-lg shadow-sm border">
                    <h3 className="font-bold text-gray-700 mb-4">Compliance Status Overview</h3>
                    <div className="overflow-x-auto max-h-[50vh]">
                        <table className="min-w-full text-xs border-collapse">
                            <thead className="bg-gray-100 sticky top-0">
                                <tr>
                                    <th className="p-2 text-left font-semibold">Office Name</th>
                                    <th className="p-2 text-center font-semibold">Status</th>
                                    <th className="p-2 text-center font-semibold">Projects Submitted</th>
                                    <th className="p-2 text-right font-semibold">Total Budget</th>
                                    <th className="p-2 text-left font-semibold">Notes</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white">
                                {complianceData.map(data => (
                                    <tr key={data.fullName} className="border-t hover:bg-gray-50">
                                        <td className="p-2 font-bold text-gray-800" title={data.fullName}>{data.office}</td>
                                        <td className="p-2 text-center">
                                            <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${getStatusStyle(data.status)}`}>
                                                {data.status.replace(/ /g, '\u00A0')}
                                            </span>
                                        </td>
                                        <td className="p-2 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <span className="font-mono">{data.submitted}/{data.expected > 0 ? data.expected : '-'}</span>
                                                {data.expected > 0 && (
                                                    <div className="w-16 bg-gray-200 rounded-full h-2.5">
                                                        <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${Math.min(100, (data.submitted / data.expected) * 100)}%` }}></div>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-2 text-right font-mono">₱{data.budget.toLocaleString()}</td>
                                        <td className="p-2 text-gray-500 italic">{data.notes}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                 <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <h3 className="font-bold text-gray-700 mb-4">Total Budget by Office</h3>
                    <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
                        {budgetByOffice.map(office => (
                            <div key={office.name} className="flex items-center gap-3 text-xs">
                                <div className="w-1/3 text-right font-semibold text-gray-600 truncate" title={office.name}>{office.name}</div>
                                <div className="w-2/3 bg-gray-200 rounded-full h-4 relative overflow-hidden">
                                    <div
                                        className="bg-orange-500 h-4 rounded-full flex items-center justify-end pr-2 transition-all duration-500"
                                        style={{ width: `${(office.budget / maxBudget) * 100}%` }}
                                    >
                                        <span className="text-white font-bold text-[9px]">₱{office.budget.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
});

export default ComplianceView;
