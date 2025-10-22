
import React, { useState, useRef } from 'react';
import { auditContract } from '../../services/geminiService';
import { ContractAuditResult, ContractFinding } from '../../types';
import Loader from '../Loader';

const AIContractAuditorTab: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isAuditing, setIsAuditing] = useState(false);
    const [auditResult, setAuditResult] = useState<ContractAuditResult | null>(null);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setAuditResult(null);
            setError('');
        }
    };

    const handleAudit = async () => {
        if (!file) {
            setError('Please upload a contract document to audit.');
            return;
        }
        setIsAuditing(true);
        setError('');
        setAuditResult(null);

        try {
            const result = await auditContract(file);
            setAuditResult(result);
        } catch (e) {
            console.error(`Error auditing contract:`, e);
            setError(`A critical error occurred during the audit: ${(e as Error).message}`);
        } finally {
            setIsAuditing(false);
        }
    };

    const getRiskLevelStyle = (level: ContractFinding['risk_level']) => {
        switch (level) {
            case 'High': return 'bg-red-100 text-red-800 border-red-400';
            case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-400';
            case 'Low': return 'bg-blue-100 text-blue-800 border-blue-400';
            case 'Info': return 'bg-gray-100 text-gray-800 border-gray-400';
            default: return 'bg-gray-100 text-gray-800 border-gray-400';
        }
    };

    return (
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                 <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 mr-3 text-orange-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.231 13.5h1.832c.414 0 .79-.143 1.087-.393l.001-.001c.338-.266.616-.589.828-.944l.468-1.036c.14-.309.14-.657 0-.966l-.468-1.036a1.875 1.875 0 00-.828-.944l.001-.001c-.297-.25-.673-.393-1.087-.393h-1.832c-.414 0-.79.143-1.087.393l-.001.001c-.338.266-.616.589-.828.944l-.468 1.036c-.14.309-.14.657 0 .966l.468 1.036c.212.355.49.678.828.944l-.001.001c.297.25.673-.393 1.087.393z" /></svg>
                AI Contract Auditor
            </h2>
            <p className="text-gray-600 mb-6">Upload a draft contract (PDF or image). The AI will analyze it for potential risks, ambiguous clauses, and compliance with Philippine procurement laws.</p>

            <div className="bg-gray-50 p-4 rounded-lg border border-dashed border-gray-300 mb-6">
                <label htmlFor="contract-upload" className="block text-sm font-medium text-gray-700 mb-2">Upload Contract Document</label>
                <input
                    ref={fileInputRef}
                    type="file"
                    id="contract-upload"
                    accept="image/*,.pdf"
                    capture="environment"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                    disabled={isAuditing}
                />
                {file && <p className="text-sm text-gray-600 mt-2">Selected: <span className="font-semibold">{file.name}</span></p>}
            </div>

            <button
                onClick={handleAudit}
                className="btn bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-lg w-full disabled:bg-gray-400"
                disabled={isAuditing || !file}
            >
                {isAuditing ? 'Auditing...' : 'Audit Contract'}
            </button>

            {isAuditing && <Loader text="AI is auditing your contract..." />}
            {error && <div className="text-center my-4 bg-red-50 p-4 rounded-lg border border-red-200 text-red-700">{error}</div>}

            {auditResult && (
                <div className="mt-8">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Contract Audit Report</h3>
                    <div className="bg-blue-50 p-5 rounded-xl shadow-sm border border-blue-200 mb-6">
                        <h4 className="text-lg font-bold text-blue-800 mb-2">Overall Assessment</h4>
                        <p className="text-sm text-blue-900 leading-relaxed font-semibold">{auditResult.overall_assessment}</p>
                        <h4 className="text-lg font-bold text-blue-800 mt-4 mb-2">Executive Summary</h4>
                        <p className="text-sm text-blue-900 leading-relaxed">{auditResult.executive_summary}</p>
                    </div>

                    <div className="space-y-4">
                        {auditResult.findings.map((finding, index) => (
                            <div key={index} className={`p-4 rounded-lg border-l-4 ${getRiskLevelStyle(finding.risk_level)}`}>
                                <div className="flex justify-between items-start">
                                    <h5 className="font-bold text-base">{finding.category}</h5>
                                    <span className="text-xs font-bold px-2 py-1 rounded-full">{finding.risk_level} Risk</span>
                                </div>
                                <blockquote className="border-l-4 border-gray-300 pl-3 my-2 text-sm italic text-gray-600">
                                    "{finding.clause_text}"
                                </blockquote>
                                <div className="text-sm mt-2">
                                    <p><strong className="font-semibold">Issue:</strong> {finding.issue}</p>
                                    <p className="mt-1"><strong className="font-semibold">Recommendation:</strong> {finding.recommendation}</p>
                                </div>
                            </div>
                        ))}
                         {auditResult.findings.length === 0 && (
                            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                                <p className="font-semibold">No significant issues found.</p>
                                <p className="text-sm">The AI did not detect any high-risk clauses in the document.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIContractAuditorTab;
