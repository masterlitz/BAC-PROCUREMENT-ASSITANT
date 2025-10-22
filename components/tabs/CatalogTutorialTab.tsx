import React from 'react';

const TutorialStep: React.FC<{
    icon: React.ReactNode;
    title: string;
    description: string;
    isLast?: boolean;
}> = ({ icon, title, description, isLast = false }) => {
    return (
        <div className="relative pl-12 pb-8">
            <div className="absolute left-0 top-1 w-6 h-6 bg-white border-4 border-orange-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            </div>
            {!isLast && <div className="absolute left-3 top-8 bottom-0 w-0.5 bg-orange-200"></div>}

            <div className="flex items-center gap-3">
                <div className="bg-orange-100 p-2 rounded-lg text-orange-600 flex-shrink-0">
                    {icon}
                </div>
                <h4 className="text-xl font-bold text-gray-800">{title}</h4>
            </div>
            <p className="mt-2 ml-1 text-gray-600" dangerouslySetInnerHTML={{ __html: description }}></p>
        </div>
    );
};

const CatalogTutorialTab: React.FC = () => {
    return (
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg">
            <div className="text-center mb-12">
                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-800 mb-2">Procurement Catalog Tutorial</h2>
                <p className="text-gray-500 max-w-3xl mx-auto">Step-by-step guides on how to effectively use the catalog features.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">
                <div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b-2 border-orange-300">How to Navigate the Catalog</h3>
                    <div className="relative">
                        <TutorialStep
                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>}
                            title="1. Log In to the Assistant"
                            description="Open your browser and go to <strong class='font-semibold text-orange-600'><a href='https://bit.ly/bacbcdPA' target='_blank' rel='noopener noreferrer'>bit.ly/bacbcdPA</a></strong>. Log in using your official LGU email (e.g., <code class='text-sm bg-gray-200 p-1 rounded'>bac@bacolodcity.gov.ph</code>) and the default password: <code class='text-sm bg-gray-200 p-1 rounded'>password</code>."
                        />
                        <TutorialStep
                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>}
                            title="2. Access the Catalog"
                            description="From the main navigation bar, click on the <strong class='font-semibold text-orange-600'>'Core Tools'</strong> menu, then select <strong class='font-semibold text-orange-600'>'Procurement Catalog'</strong> to open the catalog window."
                        />
                        <TutorialStep
                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>}
                            title="3. Filter & Search"
                            description="Use the controls in the left sidebar to browse categories. In the main view, use the search bar, price sliders, and sorting options to quickly find specific items."
                        />
                        <TutorialStep
                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
                            title="4. View Item Details"
                            description="Click on any item's image or name to open a detailed preview modal. This modal shows technical specifications, a larger image, and reference links."
                        />
                        <TutorialStep
                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                            title="5. Generate a Purchase Request"
                            description="Click the <strong class='font-semibold text-orange-600'>'Add to PR'</strong> button on items you need. When finished, click the green <strong class='font-semibold text-green-600'>'Generate PR'</strong> button in the sidebar to create a formal Purchase Request document."
                            isLast={true}
                        />
                    </div>
                </div>

                <div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b-2 border-blue-300">How to Request a New Item</h3>
                     <div className="relative">
                        <TutorialStep
                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>}
                            title="1. Open the Request Form"
                            description="In the Catalog, click the blue <strong class='font-semibold text-blue-600'>'Request New Item Inclusion'</strong> button located at the top right of the main content area."
                        />
                        <TutorialStep
                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>}
                            title="2. Fill in Details & Market Scoping"
                            description="Fill in your details and the new item's info. Crucially, provide at least one supplier quote under the <strong class='font-semibold'>Market Scoping</strong> section to justify the request."
                        />
                        <TutorialStep
                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>}
                            title="3. Use AI Assistants"
                            description="Click the <strong class='font-semibold text-blue-600'>'Generate with AI ✨'</strong> buttons to automatically create a detailed description, suggest a UACS code, and write a formal justification for your request."
                        />
                         <TutorialStep
                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>}
                            title="4. Generate & Export"
                            description="After completing all fields, click <strong class='font-semibold text-orange-600'>'Generate Request Form'</strong>. A preview of the official PDF will appear, which you can then print or export for submission."
                            isLast={true}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CatalogTutorialTab;