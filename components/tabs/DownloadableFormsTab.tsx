import React, { useState } from 'react';

type FormCategory = {
    title: string;
    items: {
        name: string;
        wordUrl?: string;
        pdfUrl?: string;
    }[];
};

type FormData = {
    [key: string]: FormCategory[];
};

const formsData: FormData = {
    ngpa_pbd: [
        {
            title: '',
            items: [
                { name: 'Philippine Bidding Documents – Goods', wordUrl: 'https://www.gppb.gov.ph/wp-content/uploads/2025/07/NGPA_PBDs_Goods.docx', pdfUrl: 'https://www.gppb.gov.ph/wp-content/uploads/2025/07/NGPA_PBDs_Goods.pdf' },
                { name: 'Philippine Bidding Documents – Infrastructure Projects', wordUrl: 'https://www.gppb.gov.ph/wp-content/uploads/2025/07/NGPA_PBDs_Infrastructure-Projects.docx', pdfUrl: 'https://www.gppb.gov.ph/wp-content/uploads/2025/07/NGPA_PBDs_Infrastructure-Projects.pdf' },
                { name: 'Philippine Bidding Documents – Consulting Services', wordUrl: 'https://www.gppb.gov.ph/wp-content/uploads/2025/07/NGPA_PBDs_Consulting-Services.docx', pdfUrl: 'https://www.gppb.gov.ph/wp-content/uploads/2025/07/NGPA_PBDs-Consulting-Services.pdf' },
            ]
        }
    ],
    ngpa_forms: [
        {
            title: 'Strategic Planning Forms',
            items: [
                {
                    name: 'Indicative, Updated APP',
                    wordUrl: 'https://www.gppb.gov.ph/wp-content/uploads/2025/07/NGPA_Indicative-Updated-APP.xlsx',
                    pdfUrl: 'https://www.gppb.gov.ph/wp-content/uploads/2025/07/NGPA_Indicative-Updated-APP.pdf'
                },
                {
                    name: 'Market Scoping Form',
                    wordUrl: 'https://www.gppb.gov.ph/wp-content/uploads/2025/08/NGPA_Market-Scoping-Form.docx',
                    pdfUrl: 'https://www.gppb.gov.ph/wp-content/uploads/2025/08/NGPA_Market-Scoping-Form.pdf'
                },
                {
                    name: 'Project Procurement Management Plan (PPMP)',
                    wordUrl: 'https://www.gppb.gov.ph/wp-content/uploads/2025/08/NGPA_PPMP.xlsx',
                    pdfUrl: 'https://www.gppb.gov.ph/wp-content/uploads/2025/08/NGPA_PPMP.pdf'
                },
            ]
        },
        {
            title: 'Philippine Bidding Document Related Forms',
            items: [
                {
                    name: 'Bid Form for the Procurement of Goods and Infrastructure Projects',
                    wordUrl: 'https://www.gppb.gov.ph/wp-content/uploads/2025/07/NGPA_Bid-Form-for-the-Procurement-of-Goods-and-Infrastructure-Projects.docx',
                    pdfUrl: 'https://www.gppb.gov.ph/wp-content/uploads/2025/07/NGPA_Bid-Form-for-the-Procurement-of-Goods-and-Infrastructure-Projects.pdf'
                },
                {
                    name: 'Bid Securing Declaration',
                    wordUrl: 'https://www.gppb.gov.ph/wp-content/uploads/2025/07/NGPA_Bid-Securing-Declaration.docx',
                    pdfUrl: 'https://www.gppb.gov.ph/wp-content/uploads/2025/07/NGPA_Bid-Securing-Declaration.pdf'
                },
                {
                    name: 'Contract Form',
                    wordUrl: 'https://www.gppb.gov.ph/wp-content/uploads/2025/07/NGPA_Contract-Form.docx',
                    pdfUrl: 'https://www.gppb.gov.ph/wp-content/uploads/2025/07/NGPA_Contract-Form.pdf'
                },
                {
                    name: 'Omnibus Sworn Statement',
                    wordUrl: 'https://www.gppb.gov.ph/wp-content/uploads/2025/07/NGPA_Omnibus-Sworn-Statement.docx',
                    pdfUrl: 'https://www.gppb.gov.ph/wp-content/uploads/2025/07/NGPA_Omnibus-Sworn-Statement.pdf'
                },
                {
                    name: 'Performance Securing Declaration',
                    wordUrl: 'https://www.gppb.gov.ph/wp-content/uploads/2025/07/NGPA_Performance-Securing-Declaration.docx',
                    pdfUrl: 'https://www.gppb.gov.ph/wp-content/uploads/2025/07/NGPA_Performance-Securing-Declaration.pdf'
                },
                {
                    name: 'Price Schedule for Goods Offered from within the Philippines',
                    wordUrl: 'https://www.gppb.gov.ph/wp-content/uploads/2025/07/NGPA_Price-Schedule-for-Goods-Offered-from-within-the-Philippines.docx',
                    pdfUrl: 'https://www.gppb.gov.ph/wp-content/uploads/2025/07/NGPA_Price-Schedule-for-Goods-Offered-from-within-the-Philippines.pdf'
                },
                {
                    name: 'Price Schedule for Goods Offered Abroad',
                    wordUrl: 'https://www.gppb.gov.ph/wp-content/uploads/2025/07/NGPA_Price-Schedule-for-Goods-Offered-Abroad.docx',
                    pdfUrl: 'https://www.gppb.gov.ph/wp-content/uploads/2025/07/NGPA_Price-Schedule-for-Goods-Offered-Abroad.pdf'
                },
            ]
        }
    ],
    ra9184_pbd: [
        {
            title: '6th Edition',
            items: [
                { name: 'Goods', wordUrl: 'https://www.gppb.gov.ph/wp-content/uploads/2023/06/Goods-6th-Edition.docx' },
                { name: 'Infrastructure Works', wordUrl: 'https://www.gppb.gov.ph/wp-content/uploads/2023/06/Infrastructure-Works-6th-Edition.docx' },
            ]
        },
        {
            title: '5th Edition',
            items: [
                 { name: 'Goods (As Harmonized with Development Partners)', wordUrl: 'https://www.gppb.gov.ph/wp-content/uploads/2023/06/Goods-As-Harmonized-with-Development-Partners-5th-Edition.doc' },
                 { name: 'Infrastructure Works (As Harmonized with Development Partners)', wordUrl: 'https://www.gppb.gov.ph/wp-content/uploads/2023/06/Infrastructure-Works-As-Harmonized-with-Development-Partners-5th-Edition.doc' },
                 { name: 'Consulting Services (As Harmonized with Development Partners)', wordUrl: 'https://www.gppb.gov.ph/wp-content/uploads/2023/06/Consulting-Services-As-Harmonized-with-Development-Partners-5th-Edition.doc' },
            ]
        },
        {
            title: '4th Edition',
            items: [
                 { name: 'Goods (As Harmonized with Development Partners)', wordUrl: 'https://www.gppb.gov.ph/wp-content/uploads/2023/06/Goods-As-Harmonized-with-Development-Partners-4th-Edition.doc' },
                 { name: 'Infrastructure Works (As Harmonized with Development Partners)', wordUrl: 'https://www.gppb.gov.ph/wp-content/uploads/2023/06/Infrastructure-Works-As-Harmonized-with-Development-Partners-4th-Edition.doc' },
                 { name: 'Consulting Services (As Harmonized with Development Partners)', wordUrl: 'https://www.gppb.gov.ph/wp-content/uploads/2023/06/Consulting-Services-As-Harmonized-with-Development-Partners-4th-Edition.doc' },
            ]
        },
        {
            title: '3rd Edition',
            items: [
                 { name: 'Goods', wordUrl: 'https://www.gppb.gov.ph/wp-content/uploads/2023/06/Goods-3rd-Edition.doc' },
                 { name: 'Infrastructure Works', wordUrl: 'https://www.gppb.gov.ph/wp-content/uploads/2023/06/Infrastructure-Works-3rd-Edition.doc' },
                 { name: 'Consulting Services' },
            ]
        },
    ],
    ra9184_forms: [
        {
            title: 'Different Sample Forms',
            items: [
                { name: 'Early Procurement Activity (EPA) Certificate Templates', wordUrl: 'https://www.gppb.gov.ph/wp-content/uploads/2024/11/2022-EPA-Certification-Templates-Annex-A-1.docx' },
                { name: 'APP Posting Certification', wordUrl: 'https://www.gppb.gov.ph/wp-content/uploads/2024/06/APP-Posting-Certification.docx' },
                { name: 'PMR Posting Certification', wordUrl: 'https://www.gppb.gov.ph/wp-content/uploads/2024/06/PMR-Posting-Certification.docx' },
                { name: 'Annual Procurement Plan', wordUrl: 'https://www.gppb.gov.ph/wp-content/uploads/2025/03/APP-Format-2025.xlsx' },
                { name: 'Procurement Monitoring Report', wordUrl: 'https://www.gppb.gov.ph/wp-content/uploads/2025/07/GPPB-prescribed-PMR-Form.xlsx' },
                { name: 'Project Procurement Management Plan (PPMP)', wordUrl: 'https://www.gppb.gov.ph/wp-content/uploads/2023/06/2015-PPMP-format.xlsx' },
                { name: 'Blacklisting Order Prescribed Form', wordUrl: 'https://www.gppb.gov.ph/wp-content/uploads/2023/06/BOForm.docx' },
                { name: 'Sample Suspension Form', wordUrl: 'https://www.gppb.gov.ph/wp-content/uploads/2023/06/Sample_Suspension_Form.docx' },
                { name: 'Agency Procurement Compliance and Performance Indicator System', wordUrl: 'https://www.gppb.gov.ph/agency-procurement-compliance-and-performance-indicator-system-apcpi/' },
                { name: 'Contract Agreement Form for the Procurement of Goods (Revised)', wordUrl: 'https://www.gppb.gov.ph/wp-content/uploads/2023/06/Contract-Agreement-Form-for-the-Procurement-of-Goods-Revised.docx' },
                { name: 'Contract Agreement Form for the Procurement of Infrastructure Projects (Revised)', wordUrl: 'https://www.gppb.gov.ph/wp-content/uploads/2023/06/Contract-Agreement-Form-for-the-Procurement-of-Infrastructure-Projects-Revised.docx' },
                { name: 'Omnibus Sworn Statement (Revised)', wordUrl: 'https://www.gppb.gov.ph/wp-content/uploads/2023/07/07032023Omnibus-Sworn-StatementRevised-as-of-07.03.2023.docx' },
                { name: 'Performance Securing Declaration (Revised)', wordUrl: 'https://www.gppb.gov.ph/wp-content/uploads/2023/06/Performance-Securing-Declaration-Revised.docx' },
                { name: 'Price Schedule for Goods Offered from Abroad', wordUrl: 'https://www.gppb.gov.ph/wp-content/uploads/2023/06/Price-Schedule-for-Goods-Offered-from-Abroad.docx' },
                { name: 'Price Schedule for Goods Offered from Within the Philippines', wordUrl: 'https://www.gppb.gov.ph/wp-content/uploads/2023/06/Price-Schedule-for-Goods-Offered-from-Within-the-Philippines.docx' },
                { name: 'Bid Form for the Procurement of Goods', wordUrl: 'https://www.gppb.gov.ph/wp-content/uploads/2023/06/Bid-Form-for-the-Procurement-of-Goods.docx' },
                { name: 'Bid Form for the Procurement of Infrastructure Projects', wordUrl: 'https://www.gppb.gov.ph/wp-content/uploads/2023/06/Bid-Form-for-the-Procurement-of-Infrastructure-Projects.docx' },
                { name: 'Bid Securing Declaration', wordUrl: 'https://www.gppb.gov.ph/wp-content/uploads/2023/06/Bid-Securing-Declaration.docx' },
            ]
        }
    ]
};

const TABS = [
    { key: 'ngpa_pbd', label: 'NGPA Philippine Bidding Documents' },
    { key: 'ngpa_forms', label: 'NGPA Forms/Templates' },
    { key: 'ra9184_pbd', label: 'RA 9184 Philippine Bidding Documents' },
    { key: 'ra9184_forms', label: 'RA 9184 Forms/Templates' },
];

const DownloadableFormsTab: React.FC = () => {
    const [activeTab, setActiveTab] = useState(TABS[0].key);

    const renderDefaultTable = (category: FormCategory) => (
        <div key={category.title} className="mb-8">
            {category.title && <h3 className="text-xl font-bold text-gray-800 mb-2">{category.title}</h3>}
            <div className="overflow-x-auto shadow-md rounded-lg">
                <table className="min-w-full bg-white">
                    <thead className="bg-blue-800 text-white">
                        <tr>
                            <th className="py-3 px-6 text-left">Document Title</th>
                            <th className="py-3 px-6 text-center w-40">Editable File</th>
                            <th className="py-3 px-6 text-center w-40">PDF File</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700">
                        {category.items.map((item, index) => (
                            <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="py-3 px-6">{item.name}</td>
                                <td className="py-3 px-6 text-center">
                                    {item.wordUrl ? (
                                        <a href={item.wordUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-semibold">
                                            Download
                                        </a>
                                    ) : (
                                        <span className="text-gray-400">N/A</span>
                                    )}
                                </td>
                                <td className="py-3 px-6 text-center">
                                    {item.pdfUrl ? (
                                        <a href={item.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline font-semibold">
                                            Download
                                        </a>
                                    ) : (
                                        <span className="text-gray-400">N/A</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
    
    const content = formsData[activeTab];

    return (
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg">
            <h2 className="text-center text-2xl md:text-3xl font-extrabold text-gray-800 mb-2">Downloadable Forms</h2>
            <p className="text-center text-gray-500 mb-8">Official templates and forms from the GPPB.</p>
            
            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                    {TABS.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`${
                                activeTab === tab.key
                                ? 'border-orange-500 text-orange-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm focus:outline-none`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            <div>
                {activeTab === 'ra9184_pbd' ? (
                    content.map(category => (
                        <div key={category.title} className="mb-4">
                             <div className="overflow-x-auto shadow-md rounded-lg">
                                <table className="min-w-full bg-white">
                                    <thead className="bg-blue-800 text-white">
                                        <tr>
                                            <th className="py-3 px-6 text-left">Philippine Bidding Documents</th>
                                            <th className="py-3 px-6 text-left w-60">{category.title}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-gray-700">
                                        {category.items.map((item, index) => (
                                            <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                                                <td className="py-3 px-6">
                                                     {item.wordUrl ? (
                                                        <a href={item.wordUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{item.name}</a>
                                                     ) : (
                                                        item.name
                                                     )}
                                                </td>
                                                <td className="py-3 px-6 text-left">{category.title}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                             </div>
                        </div>
                    ))
                ) : activeTab === 'ra9184_forms' ? (
                    content.map(category => (
                        <div key={category.title} className="mb-8">
                            <div className="overflow-x-auto shadow-md rounded-lg">
                                <table className="min-w-full bg-white">
                                    <thead className="bg-blue-800 text-white">
                                        <tr>
                                            <th className="py-3 px-6 text-left">{category.title}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-gray-700 divide-y divide-gray-200">
                                        {category.items.map((item, index) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="py-3 px-6">
                                                    {item.wordUrl ? (
                                                        <a href={item.wordUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                                            {item.name}
                                                        </a>
                                                    ) : (
                                                        item.name
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))
                ) : content && content.length > 0 ? (
                    content.map(renderDefaultTable)
                ) : (
                    <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
                        <p className="font-semibold">Coming Soon</p>
                        <p className="text-sm mt-1">No forms are available under this category at the moment.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DownloadableFormsTab;