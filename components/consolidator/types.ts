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
    if (desc.includes('construction') || desc.includes('repair') || desc.includes('maintenance') || desc.includes('road') || desc.includes('improvement')) return 'Infrastructure & Maintenance';
    if (desc.includes('training') || desc.includes('seminar') || desc.includes('meals') || desc.includes('catering') || desc.includes('representation')) return 'Training & Representation';
    if (desc.includes('medical') || desc.includes('health') || desc.includes('drugs') || desc.includes('laboratory')) return 'Medical & Health Supplies';
    if (desc.includes('security') || desc.includes('janitorial')) return 'General & Janitorial Services';
    if (desc.includes('capital outlay')) return 'Capital Outlay';
    return 'Other Goods & Services';
};
