import React, { useState } from 'react';
import { LOGIC_TREE, DOCUMENT_CHECKLISTS } from '../../constants';
import { analyzeProcurementRequest } from '../../services/geminiService';
import Loader from '../Loader';
import ChecklistItem from '../ChecklistItem';

const ModeAdvisorTab: React.FC = () => {
    const [aiInput, setAiInput] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [aiResult, setAiResult] = useState('');
    const [aiError, setAiError] = useState('');

    const [currentStepKey, setCurrentStepKey] = useState('start');
    const [history, setHistory] = useState<string[]>([]);
    
    const handleAiAnalyze = async () => {
        if (!aiInput.trim()) {
            setAiError('Please enter your procurement items.');
            return;
        }
        setAiLoading(true);
        setAiResult('');
        setAiError('');
        try {
            const result = await analyzeProcurementRequest(aiInput);
            setAiResult(result);
        } catch (error) {
            console.error("Error calling Gemini API:", error);
            setAiError('An error occurred while contacting the AI. Please try the manual advisor or check your API key setup.');
        } finally {
            setAiLoading(false);
        }
    };

    const handleAnswer = (nextStepKey: string) => {
        setHistory([...history, currentStepKey]);
        setCurrentStepKey(nextStepKey);
    };

    const handleInput = (stepKey: string) => {
        const step = LOGIC_TREE[stepKey];
        if (!step || !step.thresholds) return;

        const inputEl = document.getElementById('abcInput') as HTMLInputElement;
        const inputVal = parseFloat(inputEl.value);

        if (isNaN(inputVal) || inputVal < 0) {
            alert('Please enter a valid, non-negative amount.');
            return;
        }

        let nextStepKey = step.defaultNext || '';
        for (const threshold of step.thresholds) {
            if (inputVal <= threshold.limit) {
                nextStepKey = threshold.next;
                break;
            }
        }
        handleAnswer(nextStepKey);
    };

    const goBack = () => {
        if (history.length > 0) {
            const prevStep = history[history.length - 1];
            setHistory(history.slice(0, -1));
            setCurrentStepKey(prevStep);
        }
    };

    const restartWizard = () => {
        setHistory([]);
        setCurrentStepKey('start');
    };

    const renderStep = () => {
        const step = LOGIC_TREE[currentStepKey];
        if (!step) return <p className="text-red-500">Error: Logic step not found.</p>;

        if (step.result) {
            let checklistKey;
            if (currentStepKey.includes('competitive_bidding')) {
                checklistKey = currentStepKey.includes('infra') ? 'public_bidding_infra' : 'public_bidding_goods';
            } else {
                checklistKey = 'alternative_modes';
            }
            const checklist = DOCUMENT_CHECKLISTS[checklistKey];

            return (
                <div>
                    <div className="text-center p-6 rounded-lg bg-green-50 border-t-4 border-green-500">
                        <svg className="w-16 h-16 mx-auto text-green-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <h2 className="text-xl font-bold text-gray-800">Recommended Procurement Mode:</h2>
                        <p className="text-3xl font-extrabold text-green-600 my-3">{step.result}</p>
                        <div className="text-left bg-white p-4 rounded-md shadow-inner mt-4">
                            <p className="text-gray-700 mb-4">{step.description}</p>
                            <p className="text-xs text-gray-500"><strong>Legal Reference:</strong> {step.reference}</p>
                        </div>
                    </div>
                    <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Document Checklist</h3>
                        {checklist && Object.keys(checklist).map(category => (
                            <div key={category} className="mb-4">
                                {category && <h4 className="font-semibold text-gray-700 mb-2">{category}</h4>}
                                <div className="bg-white rounded-md p-3">
                                    {checklist[category].map(doc => <ChecklistItem key={doc} label={doc} />)}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-8 flex justify-center items-center space-x-4">
                        <button onClick={goBack} className="text-sm text-gray-500 hover:underline">Go Back</button>
                        <button onClick={restartWizard} className="btn bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-lg">Start Over</button>
                    </div>
                </div>
            );
        }

        let content;
        switch (step.type) {
            case 'input':
                content = (
                    <>
                        <label htmlFor="abcInput" className="block text-xl text-center font-semibold text-gray-800 mb-4">{step.text}</label>
                        <div className="flex justify-center items-center space-x-2">
                            <span className="text-2xl font-semibold text-gray-600">₱</span>
                            <input type="number" id="abcInput" placeholder="Enter Amount" className="text-center text-xl p-3 border-2 border-gray-300 rounded-lg w-full max-w-xs focus:border-orange-500 focus:ring-orange-500 transition" />
                        </div>
                        <div className="mt-6 text-center">
                            <button onClick={() => handleInput(currentStepKey)} className="btn bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-8 rounded-lg">Next</button>
                        </div>
                    </>
                );
                break;
            case 'boolean':
                content = (
                    <>
                        <p className="text-xl text-center font-semibold text-gray-800 mb-6">{step.text}</p>
                        <div className="flex justify-center items-center flex-wrap gap-4">
                            <button onClick={() => handleAnswer(step.yes!)} className="btn bg-green-500 text-white font-bold py-3 px-10 rounded-lg">Yes</button>
                            <button onClick={() => handleAnswer(step.no!)} className="btn bg-red-500 text-white font-bold py-3 px-10 rounded-lg">No</button>
                        </div>
                    </>
                );
                break;
            case 'options':
                content = (
                    <>
                        <p className="text-xl text-center font-semibold text-gray-800 mb-6">{step.text}</p>
                        <div className="flex flex-col sm:flex-row justify-center items-center flex-wrap gap-4">
                            {step.options && Object.keys(step.options).map(optionText =>
                                <button key={optionText} onClick={() => handleAnswer(step.options![optionText])} className="btn bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg w-full sm:w-auto">{optionText}</button>
                            )}
                        </div>
                    </>
                );
                break;
            default:
                content = <p>No type defined for this step.</p>;
        }

        return (
            <div>
                {content}
                <div className="text-center mt-8">
                    {history.length > 0 && <button onClick={goBack} className="text-sm text-gray-500 hover:underline">Back</button>}
                </div>
            </div>
        );
    };

    return (
        <div>
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg mb-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                    <svg className="w-8 h-8 mr-3 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.528L16.5 21.75l-.398-1.222a2.997 2.997 0 00-2.122-2.122L12.75 18l1.222-.398a2.997 2.997 0 002.122-2.122L16.5 14.25l.398 1.222a2.997 2.997 0 002.122 2.122L20.25 18l-1.222.398a2.997 2.997 0 00-2.122 2.122z" /></svg>
                    AI Assist
                </h3>
                <p className="text-gray-600 mb-4">Enter your procurement items and estimated costs below. The AI will analyze your request and suggest the most likely mode of procurement based on government regulations.</p>
                <div className="mb-4">
                    <label htmlFor="ai-input" className="block text-sm font-medium text-gray-700 mb-2">Enter items and amounts (e.g., "10 boxes of bond paper at 2000, 1 laptop at 40000"):</label>
                    <textarea
                        id="ai-input"
                        rows={4}
                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                        value={aiInput}
                        onChange={(e) => setAiInput(e.target.value)}
                    ></textarea>
                </div>
                <button onClick={handleAiAnalyze} className="btn bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-lg w-full" disabled={aiLoading}>
                    {aiLoading ? 'Analyzing...' : 'Analyze with AI'}
                </button>
                <div className="mt-6">
                    {aiLoading && <Loader text="AI is analyzing your request..." />}
                    {aiError && <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-red-700">{aiError}</div>}
                    {aiResult && <div className="bg-orange-50 p-4 rounded-lg border border-orange-200" dangerouslySetInnerHTML={{ __html: aiResult.replace(/\n/g, '<br>') }}></div>}
                </div>
            </div>
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg mt-8">
                {renderStep()}
            </div>
        </div>
    );
};

export default ModeAdvisorTab;