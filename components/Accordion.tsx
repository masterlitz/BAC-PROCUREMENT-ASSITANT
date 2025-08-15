import React, { useState } from 'react';

interface AccordionItemProps {
    title: string;
    children: React.ReactNode;
}

export const AccordionItem: React.FC<AccordionItemProps> = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border border-orange-200 rounded-lg accordion-item">
            <button
                className="w-full text-left p-4 bg-orange-100 hover:bg-orange-200 focus:outline-none flex justify-between items-center accordion-button"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="font-bold text-lg text-orange-800">{title}</span>
                <svg
                    className={`w-5 h-5 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
            </button>
            <div className={`accordion-content p-4 bg-white ${!isOpen ? 'hidden' : ''}`}>
                {children}
            </div>
        </div>
    );
};

interface AccordionProps {
    children: React.ReactNode;
}

const Accordion: React.FC<AccordionProps> = ({ children }) => {
    return <div className="space-y-4">{children}</div>;
};

export default Accordion;