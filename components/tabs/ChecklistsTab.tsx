
import React from 'react';
import Accordion, { AccordionItem } from '../Accordion';
import ChecklistItem from '../ChecklistItem';
import { DOCUMENT_CHECKLISTS } from '../../constants';

const ChecklistsTab: React.FC = () => {
    const allChecklists = {
        "Alternative Modes": DOCUMENT_CHECKLISTS['alternative_modes'],
        "Public Bidding (Goods & Services)": DOCUMENT_CHECKLISTS['public_bidding_goods'],
        "Public Bidding (Infrastructure)": DOCUMENT_CHECKLISTS['public_bidding_infra'],
    };

    return (
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg">
            <h2 className="text-center text-2xl md:text-3xl font-extrabold text-gray-800 mb-2">Procurement Document Checklists</h2>
            <p className="text-center text-gray-500 mb-12">A guide to the required documents for each mode of procurement.</p>
            <Accordion>
                {Object.entries(allChecklists).map(([modeName, checklistData]) => (
                    <AccordionItem key={modeName} title={modeName}>
                        {checklistData && Object.entries(checklistData).map(([category, docs]) => (
                             <div key={category} className="mb-4">
                                {category && <h4 className="font-semibold text-gray-700 mb-2">{category}</h4>}
                                <div className="bg-gray-50 rounded-md p-3">
                                    {docs.map(doc => <ChecklistItem key={doc} label={doc} />)}
                                </div>
                            </div>
                        ))}
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    );
};

export default ChecklistsTab;
