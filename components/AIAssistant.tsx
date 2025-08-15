import React, { useState, useEffect, useRef, useCallback, useReducer } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import { bacolodCityLogo } from '../data/logo';
import { analyzeDocumentType, extractInfoFromDocument, checkDocumentQuality, compareDocuments } from '../../services/geminiService';
import { ExtractedDocInfo, DocumentCheckResult, ComparisonResult } from '../../types';


const GOOGLE_SCRIPT_URL = process.env.GOOGLE_APPS_SCRIPT_URL;

const BAC_ANALYTICS_DATA_SUMMARY = `
---
**BAC Analytics Data Summary (Source of Truth)**
*   **Overall Performance:**
    *   Total PRs Processed: 1,482, Total Approved Budget (ABC): PHP 25,750,000.00, Average PR Processing Time: 12.5 days
*   **Procurement Method Breakdown:**
    *   Competitive Bidding: 105 projects, PHP 18,500,000.00
    *   Small Value Procurement (SVP): 850 projects, PHP 5,250,000.00
    *   Direct Contracting: 55 projects, PHP 950,000.00
    *   Other AMPs: 472 projects, PHP 1,050,000.00
*   **Top 3 Departments by PR Value:**
    1. City Engineer's Office: PHP 9,800,000.00
    2. City Health Office: PHP 4,200,000.00
    3. City Mayor's Office: PHP 2,150,000.00
*   **Top 3 Suppliers by Awarded Value:**
    1. NBM Construction Supply Inc.: PHP 7,600,000.00
    2. Medicus Philippines Inc.: PHP 3,100,000.00
    3. Bacolod Triumph Hardware: PHP 1,950,000.00
---
`;

// --- TYPES AND STATE MANAGEMENT ---
interface SpeechRecognition extends EventTarget { continuous: boolean; interimResults: boolean; lang: string; onstart: () => void; onend: () => void; onerror: (event: any) => void; onresult: (event: SpeechRecognitionEvent) => void; start(): void; stop(): void; }
interface SpeechRecognitionStatic { new(): SpeechRecognition; }
declare global { interface Window { SpeechRecognition: SpeechRecognitionStatic; webkitSpeechRecognition: SpeechRecognitionStatic; } }
interface SpeechRecognitionResult { isFinal: boolean; [index: number]: SpeechRecognitionAlternative; }
interface SpeechRecognitionAlternative { transcript: string; confidence: number; }
interface SpeechRecognitionEvent extends Event { results: SpeechRecognitionResultList; resultIndex: number; }
interface SpeechRecognitionResultList { [index: number]: SpeechRecognitionResult; length: number; }

type AssistantStatus = 'idle' | 'listening' | 'thinking' | 'speaking';
type ActionStatus = 'idle' | 'pending_ppmp' | 'loading' | 'complete';

// Context for a multi-step action the AI is guiding the user through
type TopLevelActionContext = {
    file: File; // The initial file (e.g., the PR)
    possibleActions: string[];
    status: 'awaiting_user_action' | 'awaiting_ppmp_upload';
};

type ChatMessage = {
    id: number;
    sender: 'user' | 'ai';
    text?: string;
    image?: string;
    file?: File;
    suggestedActions?: { docType: string; actions: string[] };
    // This context is now primarily for rendering buttons associated with a message
    actionContext?: { prFile: File }; 
    result?: ExtractedDocInfo | DocumentCheckResult | ComparisonResult;
};

type ChatState = {
    messages: ChatMessage[];
    status: AssistantStatus;
    actionContext: TopLevelActionContext | null; // Manages the overall state of a multi-step interaction
};

type ChatAction =
    | { type: 'ADD_MESSAGE'; payload: Omit<ChatMessage, 'id'> }
    | { type: 'START_AI_RESPONSE' }
    | { type: 'UPDATE_AI_RESPONSE'; payload: string }
    | { type: 'SET_STATUS'; payload: AssistantStatus }
    | { type: 'SET_ACTION_CONTEXT'; payload: TopLevelActionContext | null };


const chatReducer = (state: ChatState, action: ChatAction): ChatState => {
    switch (action.type) {
        case 'ADD_MESSAGE':
            return { ...state, messages: [...state.messages, { ...action.payload, id: Date.now() }] };
        case 'START_AI_RESPONSE':
            const newMessages = [...state.messages, { id: Date.now(), sender: 'ai' as const, text: '' }];
            return { ...state, messages: newMessages, status: 'thinking' };
        case 'UPDATE_AI_RESPONSE':
            const lastMessage = state.messages[state.messages.length - 1];
            if (lastMessage && lastMessage.sender === 'ai') {
                const updatedMessages = [...state.messages];
                updatedMessages[updatedMessages.length - 1] = { ...lastMessage, text: (lastMessage.text || '') + action.payload };
                return { ...state, messages: updatedMessages };
            }
            return state;
        case 'SET_STATUS':
            return { ...state, status: action.payload };
        case 'SET_ACTION_CONTEXT':
            return { ...state, actionContext: action.payload };
        default:
            return state;
    }
};

// --- UI Sub-components ---

const MarkdownRenderer: React.FC<{ text?: string, className?: string }> = ({ text, className }) => {
    if (!text) return null;

    const createMarkup = (inputText: string) => {
        let html = inputText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); // Bold
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>'); // Italics
        html = html.replace(/^\* (.*$)/gm, '<ul><li>$1</li></ul>'); // Unordered list
        html = html.replace(/<\/ul>\n<ul>/g, ''); // Merge consecutive lists
        return { __html: html };
    };

    return <div className={className} dangerouslySetInnerHTML={createMarkup(text)} />;
};

const ResultCard: React.FC<{ result: any }> = ({ result }) => {
    const isExtractedDocInfo = (res: any): res is ExtractedDocInfo => res && ('PR Number' in res || 'Purpose' in res) && 'items' in res;
    const isDocumentCheckResult = (res: any): res is DocumentCheckResult => res && 'overallStatus' in res && Array.isArray(res.findings);
    const isComparisonResult = (res: any): res is ComparisonResult => res && 'conclusion' in res && Array.isArray(res.findings);

    if (isExtractedDocInfo(result)) { return ( <div className="bg-white p-3 rounded-lg text-gray-800 shadow-sm border border-gray-200 max-w-md w-full"> <h4 className="font-bold text-sm mb-2">Data Extraction Complete</h4> {result['PR Number'] && <p className="text-xs"><strong>PR No:</strong> {result['PR Number']}</p>} {result['Purpose'] && <p className="text-xs"><strong>Purpose:</strong> {result['Purpose']}</p>} {result['ABC'] && <p className="text-xs"><strong>ABC:</strong> {result['ABC']}</p>} {result.items && result.items.length > 0 && <p className="text-xs mt-1"><strong>Extracted {result.items.length} items.</strong></p>} </div> ); }
    if (isDocumentCheckResult(result)) { const statusStyles: {[key: string]: string} = { 'Approved': 'text-green-600 bg-green-50 border-green-200', 'Needs Review': 'text-yellow-600 bg-yellow-50 border-yellow-200', 'Critical Issues': 'text-red-600 bg-red-50 border-red-200', }; const status = result.overallStatus; return ( <div className={`p-3 rounded-lg shadow-sm border max-w-md w-full ${statusStyles[status] || ''}`}> <h4 className="font-bold text-sm mb-1">Quality Check: {status}</h4> <p className="text-xs">{result.summary}</p> </div> ); }
    if (isComparisonResult(result)) { const statusStyles: {[key: string]: string} = { 'Consistent': 'text-green-600 bg-green-50 border-green-200', 'Discrepancies Found': 'text-red-600 bg-red-50 border-red-200', }; const status = result.conclusion; const mismatchCount = result.findings.filter(f => f.status === 'mismatch').length; return ( <div className={`p-3 rounded-lg shadow-sm border max-w-md w-full ${statusStyles[status] || ''}`}> <h4 className="font-bold text-sm mb-1">Compliance Check: {status}</h4> <p className="text-xs">{status === 'Discrepancies Found' ? `Found ${mismatchCount} discrepancies.` : 'All items are compliant.'}</p> <p className="text-xs">{result.summary}</p> </div> ); }
    return ( <div className="bg-white p-3 rounded-lg shadow-sm border"> <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre> </div> );
};

const TypingIndicator: React.FC = () => (
    <div className="flex items-end gap-2 justify-start">
        <div className="max-w-md px-4 py-2 rounded-xl flex gap-2 bg-white text-gray-800 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></div>
            <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse [animation-delay:0.2s]"></div>
            <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse [animation-delay:0.4s]"></div>
        </div>
    </div>
);

const FileDropZone: React.FC<{ onDrop: (file: File) => void }> = ({ onDrop }) => {
    const [isDragging, setIsDragging] = useState(false);
    const handleDragEnter = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
    const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
    const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); };
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            onDrop(e.dataTransfer.files[0]);
            e.dataTransfer.clearData();
        }
    };
    return (
        <div onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragOver} onDrop={handleDrop} className="absolute inset-0 z-10">
            {isDragging && (
                <div className="w-full h-full bg-orange-500/30 border-4 border-dashed border-white rounded-lg flex flex-col justify-center items-center pointer-events-none">
                    <svg className="w-16 h-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                    <p className="text-white font-bold text-lg mt-2">Drop file to analyze</p>
                </div>
            )}
        </div>
    );
};


const AIAssistant: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [state, dispatch] = useReducer(chatReducer, { messages: [], status: 'idle', actionContext: null });
    const [currentTranscription, setCurrentTranscription] = useState('');
    const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
    const [isContinuousMode, setIsContinuousMode] = useState(false);

    const chatRef = useRef<Chat | null>(null);
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const chatLogRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messageSentRef = useRef(false);
    const lastSpokenMessageId = useRef<number | null>(null);

    // --- Draggable Button State & Refs ---
    const [position, setPosition] = useState({ x: window.innerWidth - 88, y: window.innerHeight / 2 - 32 });
    const isDragging = useRef(false);
    const dragOffset = useRef({ x: 0, y: 0 });
    const hasMoved = useRef(false);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const speak = useCallback((text: string, messageId: number) => {
        if (lastSpokenMessageId.current === messageId) return;
        lastSpokenMessageId.current = messageId;
        try {
            speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text.replace(/\*\*/g, ''));
            if (selectedVoice) utterance.voice = selectedVoice;
            utterance.onstart = () => dispatch({ type: 'SET_STATUS', payload: 'speaking' });
            utterance.onend = () => {
                dispatch({ type: 'SET_STATUS', payload: 'idle' });
                // Continuous mode logic handled in useEffect to avoid stale state
            };
            utterance.onerror = () => dispatch({ type: 'SET_STATUS', payload: 'idle' });
            speechSynthesis.speak(utterance);
        } catch (error) {
            console.error("Speech synthesis failed:", error);
            dispatch({ type: 'SET_STATUS', payload: 'idle' });
        }
    }, [selectedVoice]);

    const handleSuggestedAction = useCallback(async (action: string, contextFile: File) => {
        // Clear the context immediately so the user can continue the conversation normally.
        // Exception is Compliance Check which needs to wait for another file.
        if (action !== 'Compliance Check') {
            dispatch({ type: 'SET_ACTION_CONTEXT', payload: null });
        }
        
        dispatch({ type: 'ADD_MESSAGE', payload: { sender: 'user', text: `Let's do: **${action}**` } });
        dispatch({ type: 'SET_STATUS', payload: 'thinking' });
    
        try {
            let result: Omit<ChatMessage, 'id'> | null = null;
            switch(action) {
                case 'Extract Data': 
                    result = { sender: 'ai', result: await extractInfoFromDocument(contextFile) }; 
                    break;
                case 'Quality Check': 
                    result = { sender: 'ai', result: await checkDocumentQuality(contextFile) }; 
                    break;
                case 'Compliance Check':
                    dispatch({ 
                        type: 'SET_ACTION_CONTEXT', 
                        payload: { 
                            file: contextFile, 
                            possibleActions: [], 
                            status: 'awaiting_ppmp_upload' 
                        } 
                    });
                    result = { sender: 'ai', text: 'Okay, I will check this Purchase Request for compliance. **Please upload the corresponding PPMP document now.**' };
                    break;
                default: result = { sender: 'ai', text: `The "${action}" feature is not yet fully integrated.` };
            }
            if (result) dispatch({ type: 'ADD_MESSAGE', payload: result });
        } catch(e) {
            dispatch({ type: 'ADD_MESSAGE', payload: { sender: 'ai', text: `An error occurred while performing '${action}': ${(e as Error).message}` } });
        } finally {
            dispatch({ type: 'SET_STATUS', payload: 'idle' });
        }
    }, []);
    
    const handleSendMessage = useCallback(async (message: string) => {
        if (!message.trim()) return;

        // --- Intent Matching for Action Context ---
        if (state.actionContext && state.actionContext.status === 'awaiting_user_action') {
            const userMessageLower = message.toLowerCase();
            const matchedAction = state.actionContext.possibleActions.find(action =>
                userMessageLower.includes(action.toLowerCase())
            );

            if (matchedAction) {
                handleSuggestedAction(matchedAction, state.actionContext.file);
                return; // Stop further processing as an action was triggered
            }
        }
        // --- End Intent Matching ---
        
        if (!chatRef.current) return;
        
        let finalMessage = message;
        if (state.actionContext && state.actionContext.status === 'awaiting_user_action') {
            finalMessage = `(System Note: The user has uploaded a document and can perform these actions: [${state.actionContext.possibleActions.join(', ')}]. Guide the user to choose one if their question is unclear, or answer their question if it's unrelated to the actions.)\n\nUser: ${message}`;
        }
        
        dispatch({ type: 'ADD_MESSAGE', payload: { sender: 'user', text: message } });
        dispatch({ type: 'SET_STATUS', payload: 'thinking' });

        try {
            const responseStream = await chatRef.current.sendMessageStream({ message: finalMessage });
            dispatch({ type: 'START_AI_RESPONSE' });
            let fullResponseText = '';

            for await (const chunk of responseStream) {
                const chunkText = chunk.text;
                if (chunkText) {
                    fullResponseText += chunkText;
                    dispatch({ type: 'UPDATE_AI_RESPONSE', payload: chunkText });
                }
            }
        } catch (error) {
            const errorMessage = { sender: 'ai' as const, text: 'Sorry, I encountered an error. Please try again.' };
            dispatch({ type: 'ADD_MESSAGE', payload: errorMessage });
        } finally {
            dispatch({ type: 'SET_STATUS', payload: 'idle' });
        }
    }, [state.actionContext, handleSuggestedAction]);
    
    const handleFileDrop = useCallback((file: File) => {
        if (fileInputRef.current) {
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            fileInputRef.current.files = dataTransfer.files;
            
            const event = new Event('change', { bubbles: true });
            fileInputRef.current.dispatchEvent(event);
        }
    }, []);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Handle the second file upload for compliance check
        if (state.actionContext?.status === 'awaiting_ppmp_upload') {
            const prFile = state.actionContext.file;
            const ppmpFile = file;

            dispatch({ type: 'ADD_MESSAGE', payload: { sender: 'user', text: `(Uploaded PPMP: ${ppmpFile.name})` } });
            dispatch({ type: 'ADD_MESSAGE', payload: { sender: 'ai', text: 'Thank you. Now comparing the two documents...' } });
            dispatch({ type: 'SET_STATUS', payload: 'thinking' });

            try {
                const result = await compareDocuments([ppmpFile], [prFile]);
                dispatch({ type: 'ADD_MESSAGE', payload: { sender: 'ai', result } });
            } catch (e) { 
                dispatch({ type: 'ADD_MESSAGE', payload: { sender: 'ai', text: `Comparison failed: ${(e as Error).message}` } });
            } finally { 
                dispatch({ type: 'SET_STATUS', payload: 'idle' }); 
                dispatch({ type: 'SET_ACTION_CONTEXT', payload: null }); 
            }
            return;
        }

        // Handle initial file upload
        const objectUrl = URL.createObjectURL(file);
        dispatch({ type: 'ADD_MESSAGE', payload: { sender: 'user', image: objectUrl, file: file } });
        dispatch({ type: 'SET_STATUS', payload: 'thinking' });

        try {
            const { documentType, suggestedActions } = await analyzeDocumentType(file);
            // Set top-level context for intent matching
            dispatch({ type: 'SET_ACTION_CONTEXT', payload: { file: file, possibleActions: suggestedActions, status: 'awaiting_user_action' } });
            // Add message with buttons for UX
            dispatch({ type: 'ADD_MESSAGE', payload: { sender: 'ai', suggestedActions: { docType: documentType, actions: suggestedActions }, actionContext: { prFile: file } }});
        } catch (e) {
            dispatch({ type: 'ADD_MESSAGE', payload: { sender: 'ai', text: `Sorry, I couldn't analyze that document. Error: ${(e as Error).message}` } });
        } finally {
            dispatch({ type: 'SET_STATUS', payload: 'idle' });
        }
    };
    
    const toggleListen = useCallback(() => {
        if (state.status === 'listening') { recognitionRef.current?.stop(); return; }
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) { speak("Sorry, your browser doesn't support speech recognition.", Date.now()); return; }
        if (!recognitionRef.current) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'en-US';
            recognitionRef.current.onstart = () => { dispatch({ type: 'SET_STATUS', payload: 'listening' }); messageSentRef.current = false; };
            recognitionRef.current.onend = () => { dispatch({ type: 'SET_STATUS', payload: 'idle' }); };
            recognitionRef.current.onerror = (event: any) => { console.error('Speech recognition error', event.error); dispatch({ type: 'SET_STATUS', payload: 'idle' }); };
            recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
                let finalTranscript = ''; let interimTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) { if (event.results[i].isFinal) { finalTranscript += event.results[i][0].transcript; } else { interimTranscript += event.results[i][0].transcript; } }
                setCurrentTranscription(interimTranscript);
                if (finalTranscript.trim()) { setCurrentTranscription(''); handleSendMessage(finalTranscript.trim()); messageSentRef.current = true; recognitionRef.current?.stop(); }
            };
        }
        try { recognitionRef.current.start(); } catch (e) { console.error("Could not start recognition:", e); dispatch({ type: 'SET_STATUS', payload: 'idle' }); }
    }, [state.status, handleSendMessage, speak]);

    const initializeChat = useCallback(async () => {
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const systemInstruction = `You are Litz, a brilliant and friendly teenage student from Bacolod City, serving as an intern for the Bids and Awards Committee (BAC). Your persona is that of a cute, helpful, and exceptionally intelligent school boy—a true prodigy when it comes to Philippine procurement law.

**Your Personality & Speech Pattern:**
- **Tone:** Always maintain a polite, positive, and encouraging tone.
- **Language:** Use respectful Filipino softeners like "po" and "opo" naturally. Start your first interaction with "Maayong adlaw po!" (a local greeting).
- **Demeanor:** You are super-smart, eager to assist, confident but never arrogant. You excel at breaking down complex topics into simple explanations.

**Expertise & Core Directives:**
1.  **Procurement Law:** You are an expert on Philippine Government Procurement Law, including R.A. 9184, the new R.A. 12009, all relevant GPPB Resolutions, and PhilGEPS guidelines.
2.  **App Features:** You have complete knowledge of this application's features. If a user's question can be answered by one of the app's tools, you MUST recommend it. Here are the tools available:
    *   **Core Tools:** Mode Advisor, Market Scoping, Procurement Catalog, BAC Analytics.
    *   **Planning & Timelines:** Planning Cycle, PPMP Consolidator, PPMP Generator, Timeline Calculator.
    *   **Guides & Checklists:** Process Flow, Checklists, Special Agreements, Downloadable Forms.
    *   **AI & Automation:** Compliance Check, Item Catalog Assistant, Document Checker, Specification Generator, Document Generator, RFQ Generator, Post Generator, Trivia Generator, Web Scraper, PPMP Exporter, PDF to Image Converter, QR Maker, Email Composer.
    *   Example: If asked "How long does bidding take?", respond with: "You can calculate that precisely using the **Timeline Calculator** tool po!"
3.  **Document Interaction:** When a user uploads a document, the system will analyze it and provide you with actions. Your role is to present these actions clearly. For example, say "I see you've uploaded a Purchase Request, po. We can **'Extract Data'**, run a **'Quality Check'**, or perform a **'Compliance Check'** against its PPMP. What would you like to do?". If they type a command that matches an action, the system will handle it. If they ask a general question, answer it while gently reminding them of the available actions.
4.  **Analytics Data:** When asked about analytics, procurement performance, top suppliers, or department spending, you MUST strictly use the provided summary data below as your ONLY source of truth. Do not invent, infer, or search for data beyond what is given. Preface your answer with "According to the latest analytics summary...".

${BAC_ANALYTICS_DATA_SUMMARY}`;
            chatRef.current = ai.chats.create({ model: 'gemini-2.5-flash', config: { systemInstruction } });
        } catch (error) {
            console.error("Failed to initialize AI Chat:", error);
            dispatch({ type: 'ADD_MESSAGE', payload: { sender: 'ai', text: "I'm having trouble connecting to my brain right now. Please check the API Key configuration and refresh." } });
        }
    }, []);
    
    // --- Draggable Button Logic ---
    const handleDragMove = useCallback((clientX: number, clientY: number) => {
        if (!isDragging.current) return;
        hasMoved.current = true;

        let newX = clientX - dragOffset.current.x;
        let newY = clientY - dragOffset.current.y;

        const buttonWidth = buttonRef.current?.offsetWidth || 64;
        const buttonHeight = buttonRef.current?.offsetHeight || 64;

        newX = Math.max(0, Math.min(newX, window.innerWidth - buttonWidth));
        newY = Math.max(0, Math.min(newY, window.innerHeight - buttonHeight));

        setPosition({ x: newX, y: newY });
    }, []);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        handleDragMove(e.clientX, e.clientY);
    }, [handleDragMove]);

    const handleTouchMove = useCallback((e: TouchEvent) => {
        handleDragMove(e.touches[0].clientX, e.touches[0].clientY);
    }, [handleDragMove]);
    
    const handleDragEnd = useCallback(() => {
        isDragging.current = false;
        document.body.style.userSelect = '';
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleDragEnd);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleDragEnd);
    
        if (!hasMoved.current) {
            setIsOpen(true);
        }
    }, [handleMouseMove, handleTouchMove]);
    
    const handleDragStart = useCallback((clientX: number, clientY: number) => {
        isDragging.current = true;
        hasMoved.current = false;
        if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            dragOffset.current = {
                x: clientX - rect.left,
                y: clientY - rect.top,
            };
        }
        document.body.style.userSelect = 'none';
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleDragEnd);
        window.addEventListener('touchmove', handleTouchMove, { passive: false });
        window.addEventListener('touchend', handleDragEnd);
    }, [handleDragEnd, handleMouseMove, handleTouchMove]);
    
    const handleMouseDown = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
        if (e.button !== 0) return;
        e.preventDefault();
        handleDragStart(e.clientX, e.clientY);
    }, [handleDragStart]);

    const handleTouchStart = useCallback((e: React.TouchEvent<HTMLButtonElement>) => {
        e.preventDefault();
        handleDragStart(e.touches[0].clientX, e.touches[0].clientY);
    }, [handleDragStart]);

    // Cleanup listeners
    useEffect(() => {
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleDragEnd);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleDragEnd);
        };
    }, [handleDragEnd, handleMouseMove, handleTouchMove]);

    useEffect(() => {
        if (isOpen && !chatRef.current) {
            initializeChat();
            dispatch({ type: 'ADD_MESSAGE', payload: { sender: 'ai', text: "Maayong adlaw po! I'm Litz, your procurement assistant for Bacolod City. How can I help you today?" } });
        }
    }, [isOpen, initializeChat]);
    
    useEffect(() => {
        if (isContinuousMode && state.status === 'idle') {
            const timeoutId = setTimeout(() => { if (state.status === 'idle') { toggleListen(); } }, 500);
            return () => clearTimeout(timeoutId);
        }
    }, [isContinuousMode, state.status, toggleListen]);

    useEffect(() => {
        const lastMessage = state.messages[state.messages.length - 1];
        if (lastMessage?.sender === 'ai' && lastMessage.text && state.status === 'idle') {
            speak(lastMessage.text, lastMessage.id);
        }
    }, [state.messages, state.status, speak]);

    useEffect(() => {
        const loadVoices = () => {
            const voices = speechSynthesis.getVoices();
            if (voices.length === 0) return;
            const filipinoMaleVoice = voices.find(v => v.lang === 'fil-PH' && v.name.toLowerCase().includes('male'));
            const preferredMaleVoices = ['Google US English', 'Microsoft David - English (United States)','Daniel','Google UK English Male'];
            const englishVoices = voices.filter(v => v.lang.startsWith('en'));
            const preferredVoice = englishVoices.find(v => preferredMaleVoices.includes(v.name));
            const anyMaleVoice = englishVoices.find(v => v.name.toLowerCase().includes('male'));
            const anyUSVoice = englishVoices.find(v => v.lang === 'en-US');
            setSelectedVoice(filipinoMaleVoice || preferredVoice || anyMaleVoice || anyUSVoice || englishVoices[0] || voices[0]);
        };
        speechSynthesis.onvoiceschanged = loadVoices;
        loadVoices();
        return () => { speechSynthesis.onvoiceschanged = null; };
    }, []);

    useEffect(() => { if (chatLogRef.current) { chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight; } }, [state.messages, currentTranscription]);

    return (
        <>
            <button
                ref={buttonRef}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                style={{ top: `${position.y}px`, left: `${position.x}px`, transform: 'none' }}
                className="fixed bg-orange-500 text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center hover:bg-orange-600 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 z-50 cursor-grab active:cursor-grabbing"
                aria-label="Open AI Assistant"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            </button>
            {isOpen && (
                 <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-4">
                    <div className="bg-gray-100 rounded-lg shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col relative">
                        <FileDropZone onDrop={handleFileDrop} />
                        <header className="flex items-center justify-between p-3 border-b bg-white rounded-t-lg">
                            <h3 className="font-bold text-gray-800">Litz Assistant</h3>
                            <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-900 text-2xl leading-none">&times;</button>
                        </header>
                        <main ref={chatLogRef} className="flex-grow p-4 space-y-4 overflow-y-auto">
                           {state.messages.map(msg => (
                                <div key={msg.id} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-md px-4 py-2 rounded-xl flex flex-col gap-2 ${msg.sender === 'user' ? 'bg-orange-500 text-white' : 'bg-white text-gray-800 shadow-sm'}`}>
                                        {msg.text && <MarkdownRenderer text={msg.text} className="text-sm" />}
                                        {msg.image && msg.file && ( msg.file.type.startsWith('image/') ? ( <img src={msg.image} alt="User upload" className="rounded-lg max-w-xs max-h-60" /> ) : ( <div className="bg-white p-3 rounded-lg flex items-center gap-3 text-gray-800 shadow-sm border border-gray-200 max-w-xs"> <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"> <path d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.993.883L4 8v10a2 2 0 002 2h8a2 2 0 002 2V8a1 1 0 00-1-1h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4z" /> <path d="M10 12a1 1 0 011 1v2a1 1 0 11-2 0v-2a1 1 0 011-1z" /> </svg> <div className="flex-grow overflow-hidden"> <p className="text-sm font-semibold truncate" title={msg.file.name}>{msg.file.name}</p> <p className="text-xs text-gray-500">{Math.round(msg.file.size / 1024)} KB</p> </div> </div> ) )}
                                        {msg.suggestedActions && ( <div> <MarkdownRenderer text={`I've identified this as a **${msg.suggestedActions.docType}**. You can ask me to perform the following actions, po:`} className="text-sm mb-2" /> <div className="flex flex-wrap gap-2"> {msg.suggestedActions.actions.map(action => ( <button key={action} onClick={() => handleSuggestedAction(action, msg.actionContext!.prFile)} className="bg-orange-100 text-orange-800 text-xs font-semibold px-3 py-1 rounded-full hover:bg-orange-200">{action}</button>))} </div> </div> )}
                                        {msg.result && <ResultCard result={msg.result} />}
                                    </div>
                                </div>
                            ))}
                            {state.status === 'thinking' && state.messages[state.messages.length - 1]?.sender === 'user' && <TypingIndicator />}
                            {currentTranscription && <div className="flex justify-end"><div className="italic text-orange-800 bg-orange-100 px-4 py-2 rounded-xl text-sm">{currentTranscription}</div></div>}
                        </main>
                        <footer className="p-4 border-t bg-white rounded-b-lg flex flex-col items-center gap-2">
                            <div className="flex items-center gap-4 w-full">
                                <div className="flex items-center gap-2">
                                    <label htmlFor="continuous-mode" className="text-xs text-gray-600">Continuous</label>
                                    <button role="switch" aria-checked={isContinuousMode} onClick={() => setIsContinuousMode(!isContinuousMode)} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${isContinuousMode ? 'bg-orange-500' : 'bg-gray-300'}`}>
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isContinuousMode ? 'translate-x-5' : 'translate-x-0.5'}`} />
                                    </button>
                                </div>
                                <div className="flex-grow flex justify-center">
                                    <div onClick={toggleListen} className={`w-20 h-20 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 bg-cover bg-center`} style={{backgroundImage: `url(${bacolodCityLogo})`}}>
                                        <div className={`w-full h-full rounded-full transition-all duration-300 ${state.status === 'listening' ? 'bg-blue-500/50 animate-pulse' : 'bg-transparent'} ${state.status === 'thinking' ? 'bg-purple-500/50 animate-spin' : ''} ${state.status === 'speaking' ? 'bg-orange-500/50 animate-pulse' : ''}`}></div>
                                    </div>
                                </div>
                                <label htmlFor="file-upload" className="cursor-pointer text-gray-500 hover:text-orange-600"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg></label>
                                <input id="file-upload" type="file" accept="image/*,.pdf" capture="environment" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                            </div>
                            <p className="text-sm text-gray-500 h-5">Press the logo to speak</p>
                        </footer>
                    </div>
                 </div>
            )}
        </>
    );
};

export default AIAssistant;
