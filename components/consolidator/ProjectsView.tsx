

import React, { useState, useMemo, forwardRef, useImperativeHandle } from 'react';
import { PpmpProjectItem } from '../../types';
import { categorizeItem } from './types';

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

type SortableKeys = 'office' | 'generalDescription' | 'estimatedBudget' | 'procurementMode' | 'category';

const ProjectsView = forwardRef<({ exportToPdf: () => void; }), ProjectsViewProps>(({ items, onDelete }, ref) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [officeFilter, setOfficeFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [procurementModeFilter, setProcurementModeFilter] = useState('all');
    const [budgetFilter, setBudgetFilter] = useState<{ min: number | string, max: number | string }>({ min: '', max: '' });
    const [quarterFilter, setQuarterFilter] = useState('all');
    const [sortConfig, setSortConfig] = useState<{ key: SortableKeys; direction: 'asc' | 'desc' }>({ key: 'office', direction: 'asc' });

    const offices = useMemo(() => [...new Set(items.map(item => item.office))].sort(), [items]);
    const procurementModes = useMemo(() => [...new Set(items.map(item => item.procurementMode || 'N/A'))].sort(), [items]);
    const categories = useMemo(() => [...new Set(items.map(item => categorizeItem(item.generalDescription)))].sort(), [items]);

    const processedItems = useMemo(() => {
        const minBudget = budgetFilter.min === '' ? 0 : Number(budgetFilter.min);
        const maxBudget = budgetFilter.max === '' ? Infinity : Number(budgetFilter.max);

        let filtered = items.filter(item => {
            const itemCategory = categorizeItem(item.generalDescription);
            const matchesCategory = categoryFilter === 'all' || itemCategory === categoryFilter;
            const matchesSearch = item.generalDescription.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                  item.office.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesOffice = officeFilter === 'all' || item.office === officeFilter;
            const matchesMode = procurementModeFilter === 'all' || (item.procurementMode || 'N/A') === procurementModeFilter;
            const matchesBudget = item.estimatedBudget >= minBudget && item.estimatedBudget <= maxBudget;
            const matchesQuarter = () => {
                if (quarterFilter === 'all' || !item.schedule) return true;
                const { jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec } = item.schedule;
                switch (quarterFilter) {
                    case 'q1': return (jan || 0) + (feb || 0) + (mar || 0) > 0;
                    case 'q2': return (apr || 0) + (may || 0) + (jun || 0) > 0;
                    case 'q3': return (jul || 0) + (aug || 0) + (sep || 0) > 0;
                    case 'q4': return (oct || 0) + (nov || 0) + (dec || 0) > 0;
                    default: return true;
                }
            };
            return matchesSearch && matchesOffice && matchesMode && matchesBudget && matchesQuarter() && matchesCategory;
        });
        
        // Sorting logic
        filtered.sort((a, b) => {
            let aValue: string | number;
            let bValue: string | number;

            if (sortConfig.key === 'category') {
                aValue = categorizeItem(a.generalDescription);
                bValue = categorizeItem(b.generalDescription);
            } else {
                aValue = a[sortConfig.key as keyof PpmpProjectItem] as string | number;
                bValue = b[sortConfig.key as keyof PpmpProjectItem] as string | number;
            }

            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return sortConfig.direction === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
            } else {
                 if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                 if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });

        return filtered;
    }, [items, searchTerm, officeFilter, categoryFilter, procurementModeFilter, budgetFilter, quarterFilter, sortConfig]);

    const isFiltered = useMemo(() => 
        searchTerm || officeFilter !== 'all' || categoryFilter !== 'all' || 
        procurementModeFilter !== 'all' || 
        budgetFilter.min !== '' || budgetFilter.max !== '' || quarterFilter !== 'all',
        [searchTerm, officeFilter, categoryFilter, budgetFilter, quarterFilter, procurementModeFilter]
    );

    const groupedItems = useMemo(() => {
        if (isFiltered || sortConfig.key !== 'office') return null;
        
        return processedItems.reduce((acc, item) => {
            const office = item.office;
            if (!acc[office]) acc[office] = [];
            acc[office].push(item);
            return acc;
        }, {} as Record<string, PpmpProjectItem[]>);
    }, [processedItems, isFiltered, sortConfig.key]);

    const handleSort = (key: SortableKeys) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };
    
    const handleResetFilters = () => {
        setSearchTerm('');
        setOfficeFilter('all');
        setCategoryFilter('all');
        setProcurementModeFilter('all');
        setBudgetFilter({ min: '', max: '' });
        setQuarterFilter('all');
        setSortConfig({ key: 'office', direction: 'asc' });
    };

    useImperativeHandle(ref, () => ({
        exportToPdf: () => { /* PDF logic */ }
    }));
    
    const SortIcon: React.FC<{ column: SortableKeys }> = ({ column }) => {
        if (sortConfig.key !== column) return <span className="opacity-30">↕</span>;
        return sortConfig.direction === 'asc' ? <span>▲</span> : <span>▼</span>;
    };

    const renderTableBody = () => {
        if (groupedItems) {
            // FIX: Add explicit type to map parameters to fix type inference issue.
            return Object.entries(groupedItems).map(([office, officeItems]: [string, PpmpProjectItem[]]) => (
                <React.Fragment key={office}>
                    <tr className="bg-gray-100 sticky top-0 z-10">
                        <th colSpan={7} className="p-2 text-left font-bold text-gray-700">{office} ({officeItems.length} projects)</th>
                    </tr>
                    {officeItems.map(renderRow)}
                </React.Fragment>
            ));
        }
        return processedItems.map(renderRow);
    };

    const renderRow = (item: PpmpProjectItem) => (
        <tr key={item.id} className="border-t hover:bg-gray-50">
            <td className="p-2">{item.id}</td>
            <td className="p-2 font-semibold text-gray-600">
                 <button onClick={() => setOfficeFilter(item.office)} className="text-left hover:underline text-blue-600">
                    {item.office}
                </button>
            </td>
            <td className="p-2">{item.generalDescription}</td>
            <td className="p-2 text-gray-500">{categorizeItem(item.generalDescription)}</td>
            <td className="p-2"><span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-[10px] font-semibold">{item.procurementMode}</span></td>
            <td className="p-2 text-right font-mono">₱{item.estimatedBudget.toLocaleString()}</td>
            <td className="p-2 text-center">
                <button onClick={() => onDelete(item.id)} className="text-red-500 hover:underline">Delete</button>
            </td>
        </tr>
    );

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">All Consolidated Projects</h2>
            
            <div className="bg-white p-3 rounded-lg shadow-sm border space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
                     <input type="text" placeholder="Search projects..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="p-2 border rounded-md text-sm w-full" />
                    <select value={officeFilter} onChange={e => setOfficeFilter(e.target.value)} className="p-2 border rounded-md text-sm w-full bg-white">
                        <option value="all">All Offices</option>
                        {offices.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                    <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="p-2 border rounded-md text-sm w-full bg-white">
                        <option value="all">All Categories</option>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select value={procurementModeFilter} onChange={e => setProcurementModeFilter(e.target.value)} className="p-2 border rounded-md text-sm w-full bg-white">
                        <option value="all">All Modes</option>
                        {procurementModes.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                     <select value={quarterFilter} onChange={e => setQuarterFilter(e.target.value)} className="p-2 border rounded-md text-sm w-full bg-white">
                        <option value="all">All Quarters</option>
                        <option value="q1">Scheduled in Q1</option>
                        <option value="q2">Scheduled in Q2</option>
                        <option value="q3">Scheduled in Q3</option>
                        <option value="q4">Scheduled in Q4</option>
                    </select>
                </div>
                 <div className="flex flex-wrap items-end gap-3">
                    <div className="flex-grow">
                        <label className="text-xs font-semibold text-gray-500">Budget Range (PHP)</label>
                        <div className="flex gap-2">
                             <input type="number" placeholder="Min Budget" value={budgetFilter.min} onChange={e => setBudgetFilter(f => ({...f, min: e.target.value }))} className="p-2 border rounded-md text-sm w-full" />
                             <input type="number" placeholder="Max Budget" value={budgetFilter.max} onChange={e => setBudgetFilter(f => ({...f, max: e.target.value }))} className="p-2 border rounded-md text-sm w-full" />
                        </div>
                    </div>
                     <button onClick={handleResetFilters} className="btn bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md text-sm">
                        Reset Filters
                    </button>
                    <div className="text-sm font-semibold text-gray-600 p-2">
                        Showing {processedItems.length} of {items.length} projects
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="overflow-x-auto max-h-[55vh]">
                    <table className="min-w-full text-xs">
                        <thead className="bg-gray-100 sticky top-0">
                            <tr>
                                <th className="p-2 text-left font-semibold">ID</th>
                                <th className="p-2 text-left font-semibold cursor-pointer" onClick={() => handleSort('office')}>Office <SortIcon column="office"/></th>
                                <th className="p-2 text-left font-semibold cursor-pointer" onClick={() => handleSort('generalDescription')}>Description <SortIcon column="generalDescription"/></th>
                                <th className="p-2 text-left font-semibold cursor-pointer" onClick={() => handleSort('category')}>Category <SortIcon column="category"/></th>
                                <th className="p-2 text-left font-semibold cursor-pointer" onClick={() => handleSort('procurementMode')}>Mode <SortIcon column="procurementMode"/></th>
                                <th className="p-2 text-right font-semibold cursor-pointer" onClick={() => handleSort('estimatedBudget')}>Budget <SortIcon column="estimatedBudget"/></th>
                                <th className="p-2 text-center font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {renderTableBody()}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
});

export default ProjectsView;