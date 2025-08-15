import React from 'react';

interface ChecklistItemProps {
    label: string;
}

const ChecklistItem: React.FC<ChecklistItemProps> = ({ label }) => {
    const id = `checkbox-${label.replace(/\s+/g, '-')}`;
    return (
        <div className="flex items-center py-2 border-b border-orange-200 last:border-b-0">
            <input
                type="checkbox"
                id={id}
                className="w-5 h-5 mr-3 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
            />
            <label htmlFor={id} className="text-gray-600 text-sm">{label}</label>
        </div>
    );
};

export default ChecklistItem;