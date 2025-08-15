
import React from 'react';
import ChecklistItem from '../ChecklistItem';
import { DOCUMENT_CHECKLISTS } from '../../constants';

const SpecialAgreementsTab: React.FC = () => {
    const frameworkChecklist = DOCUMENT_CHECKLISTS['framework_agreement'];

    return (
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg space-y-8">
            <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">Pakyaw Agreement Guidelines</h3>
                <div className="space-y-4 text-gray-700 text-sm p-6 bg-orange-50 rounded-lg">
                    <p><strong className="font-semibold text-gray-900">Legal Basis:</strong> Pakyaw Agreements are governed under Negotiated Procurement - Community Participation (R.A. 12009 IRR, Section 35.11).</p>
                    <p><strong className="font-semibold text-gray-900">Definition:</strong> A fixed-price (lump sum) contract for performing a specific piece of work or service, often for simple infrastructure projects like construction of a footbridge, school building, or health center.</p>
                    <p><strong className="font-semibold text-gray-900">Applicability:</strong> This method is used to engage local communities or social groups (organized or unorganized) directly, promoting local employment and ownership.</p>
                    <p><strong className="font-semibold text-gray-900">Key Guidelines:</strong></p>
                    <ul className="list-disc list-inside pl-4 space-y-1">
                        <li>The project must be simple and labor-intensive.</li>
                        <li>The BAC directly negotiates with the community or social group.</li>
                        <li>The agreement is formalized through a "Pakyaw Contract".</li>
                        <li>The community provides the labor, and the procuring entity typically provides the materials.</li>
                    </ul>
                </div>
            </div>
            <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">Framework Agreement Guidelines & Checklist</h3>
                 <div className="space-y-4 text-gray-700 text-sm p-6 bg-orange-50 rounded-lg">
                    <p><strong className="font-semibold text-gray-900">Legal Basis:</strong> R.A. 12009 and its IRR have expanded the use of Framework Agreements to Goods, Infrastructure Projects, and Consulting Services.</p>
                    <p><strong className="font-semibold text-gray-900">Definition:</strong> A Framework Agreement is entered into with a supplier (or multiple suppliers) for goods or services that are needed on a recurring basis over a specific period. It sets the terms and conditions, including price, without a guaranteed quantity.</p>
                     <p><strong className="font-semibold text-gray-900">Purpose:</strong> To streamline the procurement of frequently required items by eliminating the need to conduct a new bidding process for each instance.</p>
                </div>
                <div className="mt-4 p-6 bg-gray-50 rounded-lg">
                    {frameworkChecklist && Object.entries(frameworkChecklist).map(([category, docs]) => (
                        <div key={category} className="mb-4">
                            <h4 className="font-semibold text-gray-700 mb-2">{category}</h4>
                            <div className="bg-white rounded-md p-3">
                                {docs.map(doc => <ChecklistItem key={doc} label={doc} />)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
         </div>
    );
};

export default SpecialAgreementsTab;
