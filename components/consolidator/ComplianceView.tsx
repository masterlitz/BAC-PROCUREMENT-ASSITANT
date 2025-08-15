import React, { useMemo } from 'react';
import { PpmpProjectItem } from '../../types';
import { officeActionData } from '../../data/officeActionData';

interface ComplianceViewProps {
    consolidatedItems: PpmpProjectItem[];
}

const ComplianceView: React.FC<ComplianceViewProps> = ({ consolidatedItems }) => {
    
    const complianceData = useMemo(() => {
        const allOffices = new Set(officeActionData.map(o => o.fullName));
        const submittedOffices = new Set(consolidatedItems.map(item => item.office));

        const complied = Array.from(submittedOffices).sort();
        const pending = Array.from(allOffices).filter(office => !submittedOffices.has(office)).sort();
        
        return { complied, pending, complianceRate: (complied.length / allOffices.size) * 100 };
    }, [consolidatedItems]);

    const budgetByOffice = useMemo(() => {
        const budgetMap: { [key: string]: number } = {};
        consolidatedItems.forEach(item => {
            budgetMap[item.office] = (budgetMap[item.office] || 0) + item.estimatedBudget;
        });
        return Object.entries(budgetMap).map(([name, budget]) => ({ name, budget })).sort((a,b) => b.budget - a.budget);
    }, [consolidatedItems]);

    const maxBudget = Math.max(...budgetByOffice.map(o => o.budget), 0);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">PPMP Compliance</h2>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border">
                <h3 className="font-bold text-gray-700 mb-2">Submission Status</h3>
                 <div className="flex items-center gap-4">
                    <div className="text-5xl font-extrabold text-orange-600">{complianceData.complianceRate.toFixed(0)}%</div>
                    <div>
                        <p className="font-bold text-gray-800">Compliance Rate</p>
                        <p className="text-sm text-gray-500">{complianceData.complied.length} of {officeActionData.length} offices have submitted.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <h3 className="font-bold text-green-700 mb-2">Offices Complied ({complianceData.complied.length})</h3>
                    <ul className="text-xs space-y-1 max-h-48 overflow-y-auto pr-2">
                        {complianceData.complied.map(office => <li key={office} className="bg-green-50 p-1 rounded-sm">{office}</li>)}
                    </ul>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <h3 className="font-bold text-red-700 mb-2">Pending Submission ({complianceData.pending.length})</h3>
                    <ul className="text-xs space-y-1 max-h-48 overflow-y-auto pr-2">
                         {complianceData.pending.map(office => <li key={office} className="bg-red-50 p-1 rounded-sm">{office}</li>)}
                    </ul>
                </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border">
                <h3 className="font-bold text-gray-700 mb-4">Total Budget by Office (Top 10)</h3>
                <div className="space-y-3">
                    {budgetByOffice.slice(0, 10).map(office => (
                        <div key={office.name} className="flex items-center gap-3 text-xs">
                            <div className="w-1/3 text-right font-semibold text-gray-600 truncate" title={office.name}>{office.name}</div>
                            <div className="w-2/3 bg-gray-200 rounded-full h-4">
                                <div
                                    className="bg-orange-500 h-4 rounded-full flex items-center justify-end pr-2 bar-chart-bar"
                                    style={{ width: `${(office.budget / maxBudget) * 100}%`, transformOrigin: 'left' }}
                                >
                                    <span className="text-white font-bold">₱{office.budget.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ComplianceView;
