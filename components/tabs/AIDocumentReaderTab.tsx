import React, { useState, useRef } from 'react';
import { extractInfoFromDocument, checkDocumentQuality } from '../../services/geminiService';
import { ExtractedDocInfo, DocumentCheckResult, DocumentCheckFinding } from '../../types';
import Loader from '../Loader';
import Accordion, { AccordionItem } from '../Accordion';

interface AnalysisResult {
  id: string;
  file: File;
  extractedData: ExtractedDocInfo | null;
  checkResult: DocumentCheckResult | null;
  error: string | null;
}

const CheckCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const ExclamationCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const XCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const AIDocumentReaderTab: React.FC = () => {
    const [files, setFiles] = useState<File[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
    const [globalError, setGlobalError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = event.target.files ? Array.from(event.target.files) : [];
        if (selectedFiles.length > 0) {
            setFiles(prevFiles => {
                const newFiles = selectedFiles.filter(newFile => 
                    !prevFiles.some(existingFile => 
                        existingFile.name === newFile.name &&
                        existingFile.size === newFile.size &&
                        existingFile.lastModified === newFile.lastModified
                    )
                );
                return [...prevFiles, ...newFiles];
            });
            setAnalysisResults([]); // Clear results when new files are added
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };
    
    const handleRemoveFile = (fileToRemove: File) => {
        setFiles(prevFiles => prevFiles.filter(file => file !== fileToRemove));
        setAnalysisResults(prevResults => prevResults.filter(result => result.file !== fileToRemove));
    };

    const handleAnalysis = async () => {
        if (files.length === 0) return;

        setIsAnalyzing(true);
        setGlobalError('');
        setAnalysisResults([]);

        const analysisPromises = files.map(async (file): Promise<AnalysisResult> => {
            const id = `${file.name}-${file.lastModified}`;
            try {
                const [extractSettled, checkSettled] = await Promise.allSettled([
                    extractInfoFromDocument(file),
                    checkDocumentQuality(file)
                ]);

                const extractedData = extractSettled.status === 'fulfilled' ? extractSettled.value : null;
                const checkResult = checkSettled.status === 'fulfilled' ? checkSettled.value : null;

                let error: string | null = null;
                if (extractSettled.status === 'rejected' || checkSettled.status === 'rejected') {
                    const extractError = extractSettled.status === 'rejected' ? `Extraction failed: ${extractSettled.reason?.toString()}` : '';
                    const checkError = checkSettled.status === 'rejected' ? `Quality check failed: ${checkSettled.reason?.toString()}` : '';
                    error = `${extractError} ${checkError}`.trim();
                    console.error(`Error processing ${file.name}:`, { extractSettled, checkSettled });
                }

                return { id, file, extractedData, checkResult, error };
            } catch (e) {
                console.error(`Critical error processing ${file.name}:`, e);
                return { id, file, extractedData: null, checkResult: null, error: 'A critical error occurred during analysis.' };
            }
        });

        const results = await Promise.all(analysisPromises);
        setAnalysisResults(results);
        setIsAnalyzing(false);
    };
    
    const getFindingStatusIcon = (status: DocumentCheckFinding['status']) => {
        switch (status) {
            case 'pass': return <CheckCircleIcon className="text-green-500" />;
            case 'warn': return <ExclamationCircleIcon className="text-yellow-500" />;
            case 'fail': return <XCircleIcon className="text-red-500" />;
            default: return null;
        }
    };
    
    const getOverallStatusInfo = (status?: DocumentCheckResult['overallStatus']) => {
        switch (status) {
            case 'Approved':
                return {
                    icon: <CheckCircleIcon className="h-8 w-8 text-green-500" />,
                    style: 'bg-green-100 border-green-500 text-green-800'
                };
            case 'Needs Review':
                return {
                    icon: <ExclamationCircleIcon className="h-8 w-8 text-orange-500" />,
                    style: 'bg-orange-100 border-orange-500 text-orange-800'
                };
            case 'Critical Issues':
                 return {
                    icon: <XCircleIcon className="h-8 w-8 text-red-500" />,
                    style: 'bg-red-100 border-red-500 text-red-800'
                };
            default:
                return { icon: null, style: 'bg-gray-100 border-gray-500 text-gray-800' };
        }
    };

    const DataGridItem: React.FC<{ label: string; value?: string; fullWidth?: boolean, isPrice?: boolean }> = ({ label, value, fullWidth = false, isPrice = false }) => (
        <div className={`${fullWidth ? 'md:col-span-2' : ''} bg-white p-3 rounded-md shadow-sm`}>
            <p className="text-sm text-gray-500">{label}</p>
            <p className={`text-gray-900 ${isPrice ? 'font-semibold text-green-600' : ''}`}>{value || 'N/A'}</p>
        </div>
    );
    
    const FileListItem: React.FC<{ file: File, onRemove: (file: File) => void, disabled: boolean }> = ({ file, onRemove, disabled }) => (
        <div className="flex items-center justify-between bg-orange-50 p-2 rounded-md">
            <p className="text-sm text-orange-800 truncate" title={file.name}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-2 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                   <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
                {file.name}
            </p>
            <button onClick={() => onRemove(file)} disabled={disabled} className="text-gray-500 hover:text-red-600 disabled:text-gray-300 p-1 ml-2 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                   <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
            </button>
        </div>
    );

    return (
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <svg className="w-8 h-8 mr-3 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                RECEIVING
            </h2>
            <p className="text-gray-600 mb-6">Receive and process procurement documents. The AI will extract key details and perform a quality check for each one.</p>
             
            <div className="bg-gray-50 p-4 rounded-lg border border-dashed border-gray-300 mb-6">
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                    {files.length > 0 ? (
                        files.map(f => <FileListItem key={`${f.name}-${f.lastModified}`} file={f} onRemove={handleRemoveFile} disabled={isAnalyzing} />)
                    ) : (
                        <div className="text-center text-gray-500 py-8">
                            <p>No documents staged for analysis.</p>
                            <p className="text-sm">Click below to add files.</p>
                        </div>
                    )}
                </div>
                <label htmlFor="doc-upload" className="relative cursor-pointer mt-4">
                    <input 
                        ref={fileInputRef}
                        type="file" 
                        id="doc-upload" 
                        accept="image/*,.pdf"
                        capture="environment"
                        onChange={handleFileChange}
                        className="sr-only"
                        disabled={isAnalyzing}
                        multiple
                    />
                    <div className="flex items-center justify-center w-full px-4 py-3 border-2 border-gray-300 border-dashed rounded-md text-orange-600 hover:text-orange-500 hover:border-orange-400 transition-colors">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span className="text-sm font-medium">Add File(s)...</span>
                    </div>
                </label>
            </div>

            <button
                onClick={handleAnalysis}
                className="btn bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-lg w-full disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={isAnalyzing || files.length === 0}
            >
                {isAnalyzing ? 'Analyzing...' : `Analyze ${files.length} Document(s)`}
            </button>
            
            {isAnalyzing && <Loader text="AI is analyzing documents, please wait..." />}
            {globalError && <div className="text-center my-4 bg-red-50 p-4 rounded-lg border border-red-200 text-red-700">{globalError}</div>}
            
            {analysisResults.length > 0 && !isAnalyzing && (
                <div className="mt-6">
                     <h3 className="text-xl font-bold text-gray-800 mb-4">Analysis Results</h3>
                     <Accordion>
                        {analysisResults.map(result => (
                             <AccordionItem key={result.id} title={result.file.name}>
                                {result.error && <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-red-700 mb-4">{result.error}</div>}
                                
                                <div className="space-y-8">
                                    {result.checkResult && (
                                        <div className="bg-gray-50 p-6 rounded-lg">
                                            <h4 className="text-xl font-bold text-gray-800 mb-4">AI Document Checker</h4>
                                            
                                            <div className={`flex items-start p-4 rounded-lg mb-6 ${getOverallStatusInfo(result.checkResult.overallStatus).style} border-l-4`}>
                                                <div className="flex-shrink-0">
                                                    {getOverallStatusInfo(result.checkResult.overallStatus).icon}
                                                </div>
                                                <div className="ml-4">
                                                    <h5 className="font-extrabold text-lg">{result.checkResult.overallStatus}</h5>
                                                    <p className="text-sm">{result.checkResult.summary}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="space-y-3">
                                                {result.checkResult.findings.map((finding, index) => (
                                                    <div key={index} className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 flex items-start">
                                                        <div className="flex-shrink-0 pt-1">{getFindingStatusIcon(finding.status)}</div>
                                                        <div className="ml-3">
                                                            <h6 className="font-semibold text-gray-700">{finding.category}</h6>
                                                            <p className="text-sm text-gray-600">{finding.message}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {result.extractedData && (
                                        <div className="bg-gray-50 p-6 rounded-lg">
                                            <h4 className="text-xl font-bold text-gray-800 mb-4">Extracted Information</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                                                <DataGridItem label="Description" value={result.extractedData.Description} fullWidth />
                                                <DataGridItem label="Purpose" value={result.extractedData.Purpose} fullWidth />
                                                <DataGridItem label="Source of Funds" value={result.extractedData['Source of Funds']} />
                                                <DataGridItem label="MOOE No." value={result.extractedData['MOOE No.']} />
                                                <DataGridItem label="Responsibility Center" value={result.extractedData['Responsibility Center']} />
                                                <DataGridItem label="Account Code" value={result.extractedData['Account Code']} />
                                                <DataGridItem label="Received Date" value={result.extractedData['Received Date']} />
                                                <DataGridItem label="PR Number" value={result.extractedData['PR Number']} />
                                                <DataGridItem label="ABC" value={`Php ${result.extractedData.ABC || 'N/A'}`} isPrice />
                                                <DataGridItem label="OBR Amount" value={result.extractedData['OBR Amount']} />
                                            </div>

                                            {result.extractedData.items && result.extractedData.items.length > 0 && (
                                                <div className="mt-6 border-t-2 border-orange-200 pt-4">
                                                    <h4 className="text-lg font-bold text-gray-800 mb-2">Extracted Items</h4>
                                                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                                                        <table className="min-w-full bg-white">
                                                            <thead className="bg-gray-100">
                                                                <tr>
                                                                    <th className="p-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Item Description</th>
                                                                    <th className="p-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Unit</th>
                                                                    <th className="p-2 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Qty</th>
                                                                    <th className="p-2 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Unit Cost</th>
                                                                    <th className="p-2 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-gray-200">
                                                                {result.extractedData.items.map((item, index) => (
                                                                    <tr key={index} className="hover:bg-gray-50">
                                                                        <td className="p-2 text-sm text-gray-800">{item.description}</td>
                                                                        <td className="p-2 text-sm text-gray-800">{item.uom}</td>
                                                                        <td className="p-2 text-sm text-gray-800 text-center">{item.qty}</td>
                                                                        <td className="p-2 text-sm text-gray-800 text-right">{item.unitCost}</td>
                                                                        <td className="p-2 text-sm text-gray-800 font-semibold text-right">{item.amount}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            )}

                                            {result.extractedData.RecommendedMode && (
                                                <div className="mt-6 border-t-2 border-orange-200 pt-4">
                                                     <h4 className="text-xl font-bold text-gray-800 mb-2">AI Recommendation</h4>
                                                     <div className="bg-white p-4 rounded-md shadow-sm">
                                                        <p className="text-sm text-gray-500">Recommended Mode</p>
                                                        <p className="font-bold text-orange-700">{result.extractedData.RecommendedMode}</p>
                                                        <p className="text-sm text-gray-500 mt-2">Justification</p>
                                                        <p className="text-sm text-gray-600">{result.extractedData.Justification}</p>
                                                     </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                             </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            )}
         </div>
    );
};

export default AIDocumentReaderTab;
