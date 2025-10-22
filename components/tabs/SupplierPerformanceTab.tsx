
import React, { useState, useMemo } from 'react';

// Mock Data for demonstration purposes
const mockSuppliers = [
  { id: 1, name: 'NBM Construction Supply Inc.', projects: 15, onTimeRate: 93, qualityScore: 4.8, complianceRate: 100, status: 'Accredited' },
  { id: 2, name: 'Medicus Philippines Inc.', projects: 22, onTimeRate: 98, qualityScore: 4.9, complianceRate: 100, status: 'Accredited' },
  { id: 3, name: 'Bacolod Triumph Hardware', projects: 31, onTimeRate: 88, qualityScore: 4.5, complianceRate: 97, status: 'Accredited' },
  { id: 4, 'name': 'Generic IT Solutions Co.', projects: 8, onTimeRate: 100, qualityScore: 4.9, complianceRate: 100, status: 'Accredited' },
  { id: 5, 'name': 'Visayan Catering Services', projects: 45, onTimeRate: 95, qualityScore: 4.7, complianceRate: 100, status: 'Accredited' },
  { id: 6, 'name': 'Negros Occidental Office Hub', projects: 18, onTimeRate: 85, qualityScore: 4.2, complianceRate: 95, status: 'Warning' },
  { id: 7, name: 'Pan-Asiatic Solutions', projects: 3, onTimeRate: 75, qualityScore: 3.8, complianceRate: 90, status: 'Under Review' },
];

type SortableColumn = 'name' | 'projects' | 'onTimeRate' | 'qualityScore' | 'complianceRate';

const SupplierPerformanceTab: React.FC = () => {
    const [suppliers, setSuppliers] = useState(mockSuppliers);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<SortableColumn>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    const filteredAndSortedSuppliers = useMemo(() => {
        return [...suppliers]
            .filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .sort((a, b) => {
                const aValue = a[sortBy];
                const bValue = b[sortBy];
                
                if (aValue === bValue) return 0;

                if (sortOrder === 'asc') {
                    return aValue > bValue ? 1 : -1;
                } else {
                    return aValue < bValue ? 1 : -1;
                }
            });
    }, [suppliers, searchTerm, sortBy, sortOrder]);

    const handleSort = (column: SortableColumn) => {
        if (sortBy === column) {
            setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortOrder('asc');
        }
    };
    
    const SortIcon: React.FC<{ column: SortableColumn }> = ({ column }) => {
        if (sortBy !== column) return <span className="opacity-30">↕</span>;
        return sortOrder === 'asc' ? <span>▲</span> : <span>▼</span>;
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Accredited': return 'bg-green-100 text-green-800';
            case 'Warning': return 'bg-yellow-100 text-yellow-800';
            case 'Under Review': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 mr-3 text-orange-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>
                Supplier Performance Module (Beta)
            </h2>
            <p className="text-gray-600 mb-6">Track and evaluate supplier performance based on key metrics. This module helps in making informed decisions for future procurement activities.</p>

            <div className="bg-gray-50 p-4 rounded-lg border mb-6">
                <input
                    type="text"
                    placeholder="Search for a supplier..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                />
            </div>

            <div className="overflow-x-auto rounded-lg border">
                <table className="min-w-full bg-white">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-3 text-left text-sm font-semibold text-gray-600 cursor-pointer" onClick={() => handleSort('name')}>Supplier Name <SortIcon column="name" /></th>
                            <th className="p-3 text-center text-sm font-semibold text-gray-600 cursor-pointer" onClick={() => handleSort('projects')}>Projects <SortIcon column="projects" /></th>
                            <th className="p-3 text-center text-sm font-semibold text-gray-600 cursor-pointer" onClick={() => handleSort('onTimeRate')}>On-Time Rate <SortIcon column="onTimeRate" /></th>
                            <th className="p-3 text-center text-sm font-semibold text-gray-600 cursor-pointer" onClick={() => handleSort('qualityScore')}>Quality Score <SortIcon column="qualityScore" /></th>
                            <th className="p-3 text-center text-sm font-semibold text-gray-600 cursor-pointer" onClick={() => handleSort('complianceRate')}>Compliance <SortIcon column="complianceRate" /></th>
                            <th className="p-3 text-center text-sm font-semibold text-gray-600">Status</th>
                            <th className="p-3 text-center text-sm font-semibold text-gray-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredAndSortedSuppliers.map(supplier => (
                            <tr key={supplier.id} className="hover:bg-gray-50">
                                <td className="p-3 text-sm font-bold text-gray-800">{supplier.name}</td>
                                <td className="p-3 text-center text-sm font-mono">{supplier.projects}</td>
                                <td className="p-3 text-center text-sm font-mono">{supplier.onTimeRate}%</td>
                                <td className="p-3 text-center text-sm font-mono">{supplier.qualityScore}/5.0</td>
                                <td className="p-3 text-center text-sm font-mono">{supplier.complianceRate}%</td>
                                <td className="p-3 text-center">
                                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${getStatusStyle(supplier.status)}`}>
                                        {supplier.status}
                                    </span>
                                </td>
                                <td className="p-3 text-center">
                                    <button className="text-blue-600 hover:underline text-sm font-semibold">View Details</button>
                                </td>
                            </tr>
                        ))}
                         {filteredAndSortedSuppliers.length === 0 && (
                            <tr>
                                <td colSpan={7} className="text-center py-10 text-gray-500">
                                    No suppliers found matching your search.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SupplierPerformanceTab;
