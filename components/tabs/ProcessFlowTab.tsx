import React, { useState } from 'react';
import { getProcessStepExplanation } from '../../services/geminiService';
import Loader from '../Loader';

type Step = {
    id: number;
    phase: string;
    lane: number;
    title: string;
    details: string;
    docs: string[];
    icon: React.ReactNode;
    aiContextPrompt: string;
};

// Reusable component for rendering markdown-like text
const MarkdownRenderer: React.FC<{ text: string }> = ({ text }) => {
    const createMarkup = (inputText: string) => {
        let html = inputText
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br />');

        // Handle bullet points
        const listItems = html.match(/^\s*\*\s.*$/gm);
        if (listItems) {
            const listHtml = '<ul>' + listItems.map(item => `<li>${item.replace(/^\s*\*\s/, '')}</li>`).join('') + '</ul>';
            // Replace all list items with a single <ul> block
            html = html.replace(/^\s*\*\s.*$/gm, '').replace(/(\r\n|\n|\r){2,}/g, '$1').trim() + listHtml;
        }
        return { __html: html };
    };

    return <div dangerouslySetInnerHTML={createMarkup(text)} />;
};


const ProcessFlowTab: React.FC = () => {
    const [selectedStep, setSelectedStep] = useState<Step | null>(null);
    
    // AI Modal State
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [aiQuestion, setAiQuestion] = useState('');
    const [aiResponse, setAiResponse] = useState('');
    const [aiLoading, setAiLoading] = useState(false);


    const lanes = [
        { id: 1, title: 'End User / Dept.' },
        { id: 2, title: 'BAC Secretariat' },
        { id: 3, title: 'BAC Committee' },
        { id: 4, title: 'Approving Authority' },
        { id: 5, title: 'Supplier / Public' },
    ];
    
    const steps: Step[] = [
        // Phase 1: Planning
        { id: 1, phase: "Planning", lane: 1, title: "PPMP Creation", details: "Departments create their Project Procurement Management Plan, listing all needs for the next fiscal year.", docs: ["Draft PPMP"], icon: '📝', aiContextPrompt: "Explain the importance and process of creating a PPMP." },
        { id: 2, phase: "Planning", lane: 2, title: "Consolidate into APP", details: "BAC Secretariat gathers all PPMPs and consolidates them into the Annual Procurement Plan (APP).", docs: ["PPMPs", "Indicative APP"], icon: '📂', aiContextPrompt: "Describe the role of the BAC Secretariat in consolidating PPMPs into the APP." },
        { id: 3, phase: "Planning", lane: 4, title: "Budget & APP Approval", details: "The final APP is approved alongside the City's annual budget, authorizing the procurements.", docs: ["Final APP", "Appropriation Ordinance"], icon: '🏛️', aiContextPrompt: "Explain the relationship between the APP and the LGU's budget approval process." },
        // Phase 2: Request
        { id: 4, phase: "Request", lane: 1, title: "Submit Purchase Request", details: "The End User submits a formal Purchase Request (PR) for items listed in the approved APP.", docs: ["Purchase Request"], icon: '📨', aiContextPrompt: "What are the essential elements of a valid Purchase Request in government procurement?" },
        { id: 5, phase: "Request", lane: 2, title: "Receive & Check PR", details: "BAC Secretariat receives the PR and verifies its compliance against the approved APP and budget.", docs: ["PR", "APP"], icon: '🔍', aiContextPrompt: "Detail the compliance check performed by the BAC Secretariat when a PR is received." },
        // Phase 3: Execution (Branching)
        { id: 6, phase: "Execution", lane: 2, title: "Prepare Bidding Docs", details: "For high-value items, prepare the Invitation to Bid and Philippine Bidding Documents (PBDs).", docs: ["Invitation to Bid", "PBDs"], icon: '📚', aiContextPrompt: "What are the mandatory components of the Philippine Bidding Documents (PBDs)?" },
        { id: 7, phase: "Execution", lane: 5, title: "Submit Bids", details: "Suppliers attend a Pre-Bid Conference (if any) and submit their sealed bids on or before the deadline.", docs: ["Bid Proposal"], icon: '📥', aiContextPrompt: "Explain the process and importance of the two-envelope system for bid submission." },
        { id: 8, phase: "Execution", lane: 3, title: "Bid Opening & Evaluation", details: "The BAC opens bids, checks for eligibility and technical compliance, and determines the Lowest Calculated Bid (LCB).", docs: ["Abstract of Bids", "TWG Report"], icon: '🧮', aiContextPrompt: "Describe the difference between bid evaluation and post-qualification." },
        { id: 9, phase: "Execution", lane: 3, title: "Post-Qualification", details: "The technical, legal, and financial capabilities of the bidder with the LCB are thoroughly verified.", docs: ["Post-Qualification Report"], icon: '🏅', aiContextPrompt: "What happens if the bidder with the Lowest Calculated Bid fails post-qualification?" },
        // --- Alternative Path ---
        { id: 10, phase: "Execution", lane: 2, title: "Issue RFQ (Alt. Mode)", details: "For low-value items (e.g., SVP), issue a Request for Quotation to at least three suppliers.", docs: ["Request for Quotation"], icon: '📧', aiContextPrompt: "Explain the rules and thresholds for using Small Value Procurement (SVP) under R.A. 12009." },
        { id: 11, phase: "Execution", lane: 5, title: "Submit Quotations", details: "Suppliers submit their price quotations for the requested goods or services.", docs: ["Supplier's Quotation"], icon: '💵', aiContextPrompt: "What should suppliers ensure when submitting a quotation for government projects?" },
        { id: 12, phase: "Execution", lane: 2, title: "Abstract of Quotations", details: "BAC Secretariat prepares a summary of all received quotations to identify the lowest price.", docs: ["Abstract of Quotations"], icon: '📊', aiContextPrompt: "What is an Abstract of Quotations and what is its purpose?" },
        // Phase 4: Awarding
        { id: 13, phase: "Awarding", lane: 3, title: "BAC Resolution", details: "BAC issues a resolution recommending the award of the contract to the Lowest Calculated and Responsive Bidder/Quotation.", docs: ["BAC Resolution"], icon: '🏆', aiContextPrompt: "What is the legal significance of a BAC Resolution to Award?" },
        { id: 14, phase: "Awarding", lane: 4, title: "Issue Notice of Award", details: "The Head of the Procuring Entity (HOPE) approves the award and issues the NOA to the winning supplier.", docs: ["Notice of Award (NOA)"], icon: '🎉', aiContextPrompt: "Explain the 'no-contact rule' and when it applies during the procurement process." },
        { id: 15, phase: "Awarding", lane: 5, title: "Post Performance Security", details: "The winning supplier posts a performance security and signs the contract or Purchase Order (PO).", docs: ["Performance Security", "Contract/PO"], icon: '📜', aiContextPrompt: "What are the different forms of Performance Security acceptable under procurement law?" },
        { id: 16, phase: "Awarding", lane: 4, title: "Sign PO / Contract", details: "The HOPE signs the final Purchase Order or contract, formalizing the agreement.", docs: ["Signed PO/Contract"], icon: '✍️', aiContextPrompt: "What is the difference between a Purchase Order and a formal Contract?" },
        // Phase 5: Implementation
        { id: 17, phase: "Implementation", lane: 2, title: "Issue Notice to Proceed", details: "BAC Secretariat issues the NTP, signaling the official start of the contract.", docs: ["Notice to Proceed (NTP)"], icon: '🚀', aiContextPrompt: "When should the Notice to Proceed be issued, and what does it trigger?" },
        { id: 18, phase: "Implementation", lane: 5, title: "Deliver Goods/Services", details: "The supplier delivers the goods or performs the services as specified in the contract.", docs: ["Delivery Receipt"], icon: '🚚', aiContextPrompt: "What are the consequences of late delivery in government contracts?" },
        { id: 19, phase: "Implementation", lane: 1, title: "Inspect & Accept", details: "The End User's Inspection Committee inspects the delivery and formally accepts if compliant.", docs: ["Inspection & Acceptance Report"], icon: '✅', aiContextPrompt: "Who should be part of the Inspection and Acceptance Committee and what are their responsibilities?" },
        { id: 20, phase: "Implementation", lane: 4, title: "Process Payment", details: "The accounting and treasury departments process the payment to the supplier upon completion.", docs: ["Disbursement Voucher"], icon: '💰', aiContextPrompt: "What are the typical documents required for a supplier to be paid by a government agency?" },
    ];
    
    const handleAskAi = async () => {
        if (!selectedStep || !aiQuestion.trim()) return;
        setAiLoading(true);
        setAiResponse('');
        try {
            const response = await getProcessStepExplanation(selectedStep.title, aiQuestion);
            setAiResponse(response);
        } catch (error) {
            setAiResponse("Sorry, I couldn't fetch an explanation. Please try again.");
        } finally {
            setAiLoading(false);
        }
    };
    
    const openAiModal = (e: React.MouseEvent) => {
        e.stopPropagation();
        setAiQuestion(selectedStep?.aiContextPrompt || '');
        setAiResponse('');
        setIsAiModalOpen(true);
    };

    const groupedSteps = steps.reduce((acc, step) => {
        (acc[step.phase] = acc[step.phase] || []).push(step);
        return acc;
    }, {} as Record<string, Step[]>);

    const orderedPhases = ["Planning", "Request", "Execution", "Awarding", "Implementation"];

    const renderStepCard = (step: Step) => (
        <div key={step.id} onClick={() => setSelectedStep(step)} className="step-card">
            <div className="step-card-header">
                <span className="step-card-icon">{step.icon}</span>
                <div>
                    <h4 className="step-card-title">{step.title}</h4>
                    <p className="step-card-lane">{lanes.find(l => l.id === step.lane)?.title}</p>
                </div>
            </div>
            <p className="step-card-details">{step.details}</p>
        </div>
    );

    return (
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg">
             <h2 className="text-center text-2xl md:text-3xl font-extrabold text-gray-800 mb-2">The Complete Procurement Lifecycle</h2>
            <p className="text-center text-gray-500 mb-8 max-w-3xl mx-auto">An interactive, AI-powered guide to the end-to-end procurement process. Click any step for details.</p>
            
            <div className="process-timeline">
                <div className="timeline-line"></div>
                {orderedPhases.map((phaseName, index) => {
                    const phaseSteps = groupedSteps[phaseName] || [];
                    const phaseNumber = index + 1;

                    if (phaseName === "Execution") {
                        return (
                            <div key={phaseName} className="phase-section">
                                <div className="phase-marker">{phaseNumber}</div>
                                <div className="phase-content">
                                    <h2 className="phase-title">{phaseName}</h2>
                                    <div className="execution-branch-container">
                                        <div>
                                            <h3 className="branch-title">Path A: Public Bidding</h3>
                                            {phaseSteps.filter(s => s.id >= 6 && s.id <= 9).map(renderStepCard)}
                                        </div>
                                        <div className="branch-divider">
                                            <div className="branch-divider-text">OR</div>
                                        </div>
                                        <div>
                                            <h3 className="branch-title">Path B: Alternative Mode</h3>
                                            {phaseSteps.filter(s => s.id >= 10 && s.id <= 12).map(renderStepCard)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    }

                    return (
                        <div key={phaseName} className="phase-section">
                            <div className="phase-marker">{phaseNumber}</div>
                            <div className="phase-content">
                                <h2 className="phase-title">{phaseName}</h2>
                                {phaseSteps.map(renderStepCard)}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Step Detail Modal */}
            {selectedStep && (
                <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4" onClick={() => setSelectedStep(null)}>
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg flow-modal" onClick={e => e.stopPropagation()}>
                        <div className="p-5 border-b flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3"><span className="text-3xl">{selectedStep.icon}</span> {selectedStep.title}</h3>
                                <p className="text-sm text-gray-500 mt-1">{selectedStep.details}</p>
                            </div>
                             <button onClick={() => setSelectedStep(null)} className="text-gray-400 hover:text-gray-800">&times;</button>
                        </div>
                        <div className="p-5 bg-gray-50">
                            <h4 className="font-semibold text-gray-700 mb-2">Associated Documents:</h4>
                            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                {selectedStep.docs.map(doc => <li key={doc}>{doc}</li>)}
                            </ul>
                        </div>
                        <div className="p-4 bg-gray-100 rounded-b-lg">
                            <button onClick={openAiModal} className="btn bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg w-full flex items-center justify-center gap-2">
                                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>
                                Ask AI about this step...
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* AI Chat Modal */}
            {isAiModalOpen && selectedStep && (
                 <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setIsAiModalOpen(false)}>
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl flex flex-col h-[70vh] flow-modal" onClick={e => e.stopPropagation()}>
                        <header className="p-3 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
                            <h3 className="font-bold text-gray-800 truncate">AI Assistant: {selectedStep.title}</h3>
                            <button onClick={() => setIsAiModalOpen(false)} className="text-gray-500 text-2xl">&times;</button>
                        </header>
                        <main className="flex-grow p-4 space-y-4 overflow-y-auto bg-gray-100">
                           <div className="ai-chat-bubble-user p-3 rounded-lg max-w-lg ml-auto">
                                <p className="text-sm font-semibold mb-1">Your Question:</p>
                                <p className="text-sm">{aiQuestion}</p>
                           </div>
                           {aiLoading && <div className="p-3 rounded-lg max-w-lg mr-auto"><Loader text="Litz is thinking..." /></div>}
                           {aiResponse && (
                               <div className="ai-chat-bubble-ai p-4 rounded-lg max-w-lg mr-auto prose prose-sm">
                                    <MarkdownRenderer text={aiResponse} />
                               </div>
                           )}
                        </main>
                        <form onSubmit={(e) => { e.preventDefault(); handleAskAi(); }} className="p-3 border-t flex gap-2 bg-gray-50 rounded-b-lg">
                            <input type="text" value={aiQuestion} onChange={e => setAiQuestion(e.target.value)} placeholder="Ask a follow-up question..." className="flex-grow p-2 border rounded-md text-sm" />
                            <button type="submit" disabled={aiLoading} className="btn bg-orange-500 text-white px-4 rounded-md disabled:bg-gray-400">Send</button>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default ProcessFlowTab;
