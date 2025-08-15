import React from 'react';

const CalendarIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const ActivityIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const OutputIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

const PlayersIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

const PrinciplesIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
);

const planningCycleData = [
  {
    phase: 1,
    title: "Preparation & Departmental Planning",
    timeline: "July - August",
    activities: [
      "City Budget Office issues the 'Budget Call' memo to all departments.",
      "Departments/End-Users prepare their Project Procurement Management Plans (PPMP), listing all projects, activities, and items needed for the next year.",
    ],
    output: "Draft Project Procurement Management Plans (PPMPs)",
    players: "City Budget Office, Heads of Departments, End-Users",
  },
  {
    phase: 2,
    title: "Submission & Consolidation",
    timeline: "On or before September 15",
    activities: [
        "Departments submit their finalized PPMPs to the BAC Secretariat.",
        "The BAC Secretariat reviews, validates, and consolidates all PPMPs into a city-wide Indicative Annual Procurement Plan (APP)."
    ],
    output: "Consolidated Indicative Annual Procurement Plan (APP)",
    players: "Heads of Departments, BAC Secretariat",
  },
  {
    phase: 3,
    title: "Budget Proposal",
    timeline: "On or before October 16",
    activities: [
        "The City Mayor submits the proposed Executive Budget for the next fiscal year to the Sangguniang Panlungsod (City Council).",
        "The Indicative APP is a key supporting document for the budget proposal, justifying the requested funds."
    ],
    output: "Proposed City Budget submitted to SP",
    players: "City Mayor's Office, BAC",
  },
  {
    phase: 4,
    title: "Budget Approval & APP Finalization",
    timeline: "November - December",
    activities: [
        "The Sangguniang Panlungsod deliberates and approves the Annual Budget, resulting in an Appropriation Ordinance.",
        "The BAC finalizes the APP based on the approved amounts in the Appropriation Ordinance."
    ],
    output: "Appropriation Ordinance & Finalized APP",
    players: "Sangguniang Panlungsod, BAC",
  },
  {
    phase: 5,
    title: "Final Approval & Execution",
    timeline: "January of Procurement Year",
    activities: [
        "The City Mayor gives the final approval for the APP.",
        "The approved APP is posted on the PhilGEPS website and the City's official website within 30 days.",
        "Procurement activities for the year officially commence based on the approved APP."
    ],
    output: "Final Approved & Posted APP",
    players: "City Mayor, BAC Secretariat",
  },
];

const keyPrinciples = [
    { title: "PPMP is the Foundation", description: "All procurement starts with a well-prepared Project Procurement Management Plan from the end-user department." },
    { title: "No APP, No Procurement", description: "An item must be in the approved Annual Procurement Plan to be procured. No item can be added hastily." },
    { title: "Planning & Budgeting are Linked", description: "The APP is a crucial document that supports and justifies the annual budget proposal." },
    { title: "Deadlines are Critical", description: "Following the established timeline ensures that procurement activities can start on time at the beginning of the fiscal year." }
];

const ProcurementPlanningTab: React.FC = () => {
    return (
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg">
            <div className="text-center mb-12">
                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-800 mb-2">The Annual Procurement Planning Cycle</h2>
                <p className="text-gray-500 max-w-3xl mx-auto">A step-by-step guide from departmental needs to city-wide execution, ensuring a transparent and efficient procurement process.</p>
            </div>

            <div className="relative">
                {/* Vertical Connector Line */}
                <div className="absolute left-0 md:left-8 top-8 bottom-8 w-1 bg-orange-200 rounded" aria-hidden="true"></div>

                <div className="space-y-12">
                    {planningCycleData.map((phase) => (
                        <div key={phase.phase} className="relative pl-8 md:pl-20">
                            <div className="absolute left-0 md:left-8 top-0 -translate-x-1/2 flex items-center justify-center w-12 h-12 bg-orange-500 text-white font-bold text-xl rounded-full border-4 border-white">
                                {phase.phase}
                            </div>
                            <div className="bg-orange-50 p-6 rounded-lg border-l-4 border-orange-500">
                                <h3 className="text-xl font-bold text-orange-800">{phase.title}</h3>
                                <div className="flex items-center text-sm text-gray-600 my-3">
                                    <CalendarIcon />
                                    <span className="font-semibold">{phase.timeline}</span>
                                </div>
                                
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-semibold text-gray-800 mb-2">Key Activities:</h4>
                                        <ul className="space-y-2 text-sm text-gray-700">
                                            {phase.activities.map((activity, index) => (
                                                <li key={index} className="flex items-start">
                                                    <ActivityIcon />
                                                    <span className="ml-2">{activity}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="border-t border-orange-200 pt-4 space-y-3 text-sm">
                                        <div className="flex items-center text-gray-700">
                                            <OutputIcon />
                                            <span className="font-semibold mr-2">Key Output:</span>
                                            <span>{phase.output}</span>
                                        </div>
                                        <div className="flex items-center text-gray-700">
                                            <PlayersIcon />
                                            <span className="font-semibold mr-2">Key Players:</span>
                                            <span>{phase.players}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

             <div className="mt-16 pt-8 border-t-2 border-dashed border-orange-200">
                <div className="text-center mb-12">
                    <h2 className="text-2xl md:text-3xl font-extrabold text-gray-800 mb-2">3-Year Procurement Modernization Roadmap</h2>
                    <p className="text-gray-500 max-w-3xl mx-auto">A strategic vision for enhancing procurement efficiency, transparency, and value for Bacolod City.</p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="bg-gray-50 p-6 rounded-lg border-b-4 border-orange-400 h-full flex flex-col">
                        <p className="text-lg font-bold text-orange-600">Year 1</p>
                        <h4 className="text-xl font-bold text-gray-800 mt-1">Foundational Strengthening & Digitization</h4>
                        <p className="text-sm text-gray-600 mt-2 flex-grow">Focus on building a strong base with modern tools and comprehensive training.</p>
                        <ul className="mt-4 space-y-2 text-sm text-gray-700">
                            <li className="flex items-start"><ActivityIcon /><span className="ml-2">Adopt digital procurement tools like this Assistant.</span></li>
                            <li className="flex items-start"><ActivityIcon /><span className="ml-2">Digitize document submission and tracking processes.</span></li>
                            <li className="flex items-start"><ActivityIcon /><span className="ml-2">Conduct comprehensive training on R.A. 12009 for all departments.</span></li>
                        </ul>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-lg border-b-4 border-orange-400 h-full flex flex-col">
                        <p className="text-lg font-bold text-orange-600">Year 2</p>
                        <h4 className="text-xl font-bold text-gray-800 mt-1">Process Optimization & Integration</h4>
                        <p className="text-sm text-gray-600 mt-2 flex-grow">Streamline workflows and connect procurement with other city systems.</p>
                        <ul className="mt-4 space-y-2 text-sm text-gray-700">
                            <li className="flex items-start"><ActivityIcon /><span className="ml-2">Integrate procurement system with the City's finance and budgeting systems.</span></li>
                            <li className="flex items-start"><ActivityIcon /><span className="ml-2">Introduce e-Bidding and e-Reverse Auction functionalities.</span></li>
                            <li className="flex items-start"><ActivityIcon /><span className="ml-2">Develop a centralized supplier performance database.</span></li>
                        </ul>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-lg border-b-4 border-orange-400 h-full flex flex-col">
                        <p className="text-lg font-bold text-orange-600">Year 3</p>
                        <h4 className="text-xl font-bold text-gray-800 mt-1">Strategic Sourcing & Data Analytics</h4>
                        <p className="text-sm text-gray-600 mt-2 flex-grow">Leverage data to make smarter, long-term procurement decisions.</p>
                        <ul className="mt-4 space-y-2 text-sm text-gray-700">
                            <li className="flex items-start"><ActivityIcon /><span className="ml-2">Implement data analytics to identify spending patterns and saving opportunities.</span></li>
                            <li className="flex items-start"><ActivityIcon /><span className="ml-2">Develop city-wide framework agreements for common goods and services.</span></li>
                            <li className="flex items-start"><ActivityIcon /><span className="ml-2">Launch a public procurement data portal for enhanced transparency.</span></li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="mt-16 pt-8 border-t-2 border-dashed border-orange-200">
                 <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Foundational Principles</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {keyPrinciples.map((principle, index) => (
                         <div key={index} className="bg-gray-50 p-5 rounded-lg flex items-start">
                            <PrinciplesIcon />
                            <div>
                                <h4 className="font-bold text-gray-800">{principle.title}</h4>
                                <p className="text-sm text-gray-600 mt-1">{principle.description}</p>
                            </div>
                        </div>
                    ))}
                 </div>
            </div>
        </div>
    );
};

export default ProcurementPlanningTab;