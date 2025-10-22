
import React from 'react';

export const ConsolidatorKPI: React.FC<{ title: string; value: string }> = ({ title, value }) => (
    React.createElement('div', { className: "bg-white p-4 rounded-lg shadow-sm border" },
        React.createElement('p', { className: "text-sm text-gray-500" }, title),
        React.createElement('p', { className: "text-2xl font-bold text-gray-800" }, value)
    )
);

export const categorizeItem = (description: string): string => {
    const desc = description.toLowerCase();
    if (desc.includes('it') || desc.includes('computer') || desc.includes('laptop') || desc.includes('printer') || desc.includes('ict')) return 'IT Equipment & Supplies';
    if (desc.includes('office supplies')) return 'General Office Supplies';
    if (desc.includes('vehicle') || desc.includes('motorcycle') || desc.includes('fuel')) return 'Transportation & Fuel';
    if (desc.includes('medical') || desc.includes('dental') || desc.includes('laboratory') || desc.includes('drugs') || desc.includes('medicines')) return 'Medical & Health';
    if (desc.includes('repair') || desc.includes('maintenance')) return 'Repairs & Maintenance';
    if (desc.includes('construction') || desc.includes('electrical') || desc.includes('materials')) return 'Construction & Electrical';
    if (desc.includes('food') || desc.includes('catering') || desc.includes('meals') || desc.includes('snacks')) return 'Food & Catering';
    if (desc.includes('janitorial') || desc.includes('cleaning')) return 'Janitorial Supplies';
    if (desc.includes('training') || desc.includes('seminar')) return 'Training & Seminars';
    if (desc.includes('travel')) return 'Travel & Accommodation';
    if (desc.includes('services')) return 'Professional & General Services';
    return 'Other Categories';
};
