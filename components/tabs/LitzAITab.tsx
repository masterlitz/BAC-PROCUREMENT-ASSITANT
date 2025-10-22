import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveSession, LiveServerMessage, Modality, Type, FunctionDeclaration, Blob } from "@google/genai";
import { ChatMessage, TabKey, ModalKey } from '../../types';
import { litzAiAvatar } from '../../data/logo';
import { getSystemInstruction } from '../../data/aiSystemInstruction';
import LitzAIVisualizer from '../LitzAIVisualizer';
import { mockProcurementData } from '../../data/procurementData';
import { SessionUser } from '../../auth/authService';
import { useDraggableWindow } from '../../hooks/useDraggableWindow';

// Declare jsPDF on window
declare global {
    interface Window {
        jspdf: {
            jsPDF: new (options?: any) => any;
            plugin: any;
        };
    }
}
interface jsPDFWithAutoTable extends InstanceType<typeof window.jspdf.jsPDF> {
  autoTable: (options: any) => jsPDFWithAutoTable;
}

interface LitzAITabProps {
    isVisible: boolean;
    onClose: () => void;
    currentUser: SessionUser | null;
    setActiveTab: (tab: TabKey) => void;
    setActiveModal: (modal: ModalKey) => void;
}

type SessionStatus = 'STANDBY' | 'LISTENING' | 'AI RESPONDING' | 'ERROR';

// --- Window Control Icons ---
const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
const MaximizeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4h4m12 4V4h-4M4 16v4h4m12-4v4h-4" /></svg>;
const RestoreIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-4h4m-4 0l4-4m6 8v4h-4m4-4l-4-4" /></svg>;
const MinimizeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>;


const LitzAITab: React.FC<LitzAITabProps> = ({ isVisible, onClose, currentUser, setActiveTab, setActiveModal }) => {
    const { nodeRef, isMaximized, isMinimized, getWindowStyle, handleMouseDown, toggleMaximize, toggleMinimize, setMaximized } = useDraggableWindow(isVisible, { width: 450, height: 700 });
    
    const [status, setStatus] = useState<SessionStatus>('STANDBY');
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [transcript, setTranscript] = useState<ChatMessage[]>([]);
    const [error, setError] = useState('');

    const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const sourcesRef = useRef(new Set<AudioBufferSourceNode>());
    const nextStartTimeRef = useRef(0);
    const analyserNodeRef = useRef<AnalyserNode | null>(null);
    const transcriptContainerRef = useRef<HTMLDivElement>(null);

    const currentInputTranscription = useRef('');
    const currentOutputTranscription = useRef('');

    useEffect(() => {
        if (isVisible) {
            setMaximized(true);
        }
    }, [isVisible, setMaximized]);

    // --- Audio Utility Functions ---
    const decode = (base64: string) => {
      const binaryString = atob(base64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes;
    }
    
    const decodeAudioData = async (data: Uint8Array, ctx: AudioContext): Promise<AudioBuffer> => {
      const dataInt16 = new Int16Array(data.buffer);
      const frameCount = dataInt16.length;
      const buffer = ctx.createBuffer(1, frameCount, 24000);
      const channelData = buffer.getChannelData(0);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i] / 32768.0;
      }
      return buffer;
    }
    
    const encode = (bytes: Uint8Array) => {
      let binary = '';
      const len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary);
    }
    
    const createBlob = (data: Float32Array): Blob => {
      const l = data.length;
      const int16 = new Int16Array(l);
      for (let i = 0; i < l; i++) {
        int16[i] = data[i] * 32768;
      }
      return {
        data: encode(new Uint8Array(int16.buffer)),
        mimeType: 'audio/pcm;rate=16000',
      };
    }
    
    // --- Function Calling ---
    const navigateTo: FunctionDeclaration = {
        name: 'navigateTo',
        description: 'Navigates the user to a specific tool or tab within the application.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                target: { type: Type.STRING, description: 'The unique key of the feature to navigate to.' },
            },
            required: ['target'],
        },
    };

    const getProcurementStatus: FunctionDeclaration = {
        name: 'getProcurementStatus',
        description: 'Retrieves the current status of a specific procurement request using its PR number.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                prNumber: { type: Type.STRING, description: 'The full Purchase Request (PR) number, e.g., "2025-07-0005".' },
            },
            required: ['prNumber'],
        },
    };

    const handleFunctionCall = (fc: any) => {
        switch (fc.name) {
            case 'navigateTo':
                if (!currentUser) {
                    return { result: "The user needs to log in to navigate." };
                }
                let target = fc.args.target as TabKey | ModalKey;

                // Map alternate keys to their primary modal/tab key to ensure correct navigation.
                if (target === 'bac-analytics') {
                    target = 'analytics';
                }

                const modals: ModalKey[] = ['analytics', 'catalog', 'qr-maker', 'email-composer', 'ppmp-consolidator', 'changelog', 'infographics'];
                if (modals.includes(target as ModalKey)) {
                    setActiveModal(target as ModalKey);
                } else {
                    setActiveTab(target as TabKey);
                }
                onClose(); // Close AI modal after navigation
                return { result: `Successfully navigated to ${target}.` };
            case 'getProcurementStatus':
                const request = mockProcurementData.find(r => r.prNumber === fc.args.prNumber);
                return request ? { result: JSON.stringify(request) } : { result: `Could not find any procurement request with PR Number ${fc.args.prNumber}. Please check the number and try again.` };
            default:
                return { result: `Function ${fc.name} is not implemented.` };
        }
    };
    
    const startSession = async () => {
        try {
            setError('');
            setStatus('LISTENING');
            streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            
            const source = inputAudioContextRef.current.createMediaStreamSource(streamRef.current);
            analyserNodeRef.current = inputAudioContextRef.current.createAnalyser();
            analyserNodeRef.current.fftSize = 2048;
            source.connect(analyserNodeRef.current);

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

            sessionPromiseRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        setIsSessionActive(true);
                        const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
                        scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const pcmBlob = createBlob(inputData);
                            sessionPromiseRef.current?.then((session) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        };
                        source.connect(scriptProcessor);
                        scriptProcessor.connect(inputAudioContextRef.current!.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        if (message.serverContent?.inputTranscription) {
                            currentInputTranscription.current += message.serverContent.inputTranscription.text;
                        }
                        if (message.serverContent?.outputTranscription) {
                             currentOutputTranscription.current += message.serverContent.outputTranscription.text;
                             setStatus('AI RESPONDING');
                        }
                        if (message.serverContent?.turnComplete) {
                            setTranscript(prev => [
                                ...prev,
                                { id: Date.now(), sender: 'user', text: currentInputTranscription.current.trim() },
                                { id: Date.now() + 1, sender: 'ai', text: currentOutputTranscription.current.trim() },
                            ]);
                            currentInputTranscription.current = '';
                            currentOutputTranscription.current = '';
                            setStatus('LISTENING');
                        }

                        if (message.toolCall?.functionCalls) {
                            for (const fc of message.toolCall.functionCalls) {
                                const result = handleFunctionCall(fc);
                                sessionPromiseRef.current?.then(session => {
                                    session.sendToolResponse({
                                        functionResponses: { id: fc.id, name: fc.name, response: result }
                                    });
                                });
                            }
                        }

                        const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                        if (audioData && outputAudioContextRef.current) {
                            const ctx = outputAudioContextRef.current;
                            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                            const audioBuffer = await decodeAudioData(decode(audioData), ctx);
                            const sourceNode = ctx.createBufferSource();
                            sourceNode.buffer = audioBuffer;
                            sourceNode.connect(ctx.destination);
                            sourcesRef.current.add(sourceNode);
                            sourceNode.onended = () => sourcesRef.current.delete(sourceNode);
                            sourceNode.start(nextStartTimeRef.current);
                            nextStartTimeRef.current += audioBuffer.duration;
                        }

                        if (message.serverContent?.interrupted) {
                            sourcesRef.current.forEach(source => source.stop());
                            sourcesRef.current.clear();
                            nextStartTimeRef.current = 0;
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error('Session Error:', e);
                        setError('A session error occurred. Please try again.');
                        setStatus('ERROR');
                        endSession();
                    },
                    onclose: () => {
                        endSession();
                    },
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                    tools: [{ functionDeclarations: [navigateTo, getProcurementStatus] }],
                    systemInstruction: getSystemInstruction(currentUser ? 'dashboard' : 'login', !!currentUser),
                },
            });
        } catch (e) {
            console.error('Failed to start session:', e);
            setError('Could not access microphone. Please check permissions and try again.');
            setStatus('ERROR');
        }
    };
    
    const endSession = useCallback(() => {
        sessionPromiseRef.current?.then(session => session.close()).catch(e => console.warn("Error closing session:", e));
        sessionPromiseRef.current = null;
        
        streamRef.current?.getTracks().forEach(track => track.stop());
        streamRef.current = null;
        
        inputAudioContextRef.current?.close();
        outputAudioContextRef.current?.close();
        
        analyserNodeRef.current = null;
        setIsSessionActive(false);
        setStatus('STANDBY');
    }, []);

    useEffect(() => {
        return () => { endSession(); };
    }, [endSession]);

    useEffect(() => {
        if (transcriptContainerRef.current) {
            transcriptContainerRef.current.scrollTop = transcriptContainerRef.current.scrollHeight;
        }
    }, [transcript]);

    const exportTranscript = () => {
        const { jsPDF } = window.jspdf;
        if (!jsPDF) { alert("PDF library not available."); return; }
        const doc = new jsPDF() as jsPDFWithAutoTable;
        doc.setFontSize(18);
        doc.text("Litz AI Conversation Transcript", 14, 22);
        doc.setFontSize(10);
        doc.text(`Date: ${new Date().toLocaleString()}`, 14, 32);
        
        doc.autoTable({
            startY: 40,
            head: [['Sender', 'Message']],
            body: transcript.map(msg => [msg.sender.toUpperCase(), msg.text]),
            theme: 'striped',
            headStyles: { fillColor: '#f97316' }
        });
        doc.save('litz-ai-transcript.pdf');
    };

    if (!isVisible) return null;
    
    let orbStatusClass = '';
    if (status === 'LISTENING') orbStatusClass = 'status-listening';
    if (status === 'AI RESPONDING') orbStatusClass = 'status-responding';

    return (
        <div ref={nodeRef} className="litz-ai-container fixed inset-0 z-[200] flex flex-col font-mono rounded-lg shadow-2xl border" style={{...getWindowStyle(), borderColor: 'var(--litz-ai-panel-border)'}} onClick={e => e.stopPropagation()}>
            <header onMouseDown={handleMouseDown} className={`flex-shrink-0 p-4 flex justify-between items-center border-b ${isMaximized ? '' : 'cursor-move'}`} style={{ borderColor: 'var(--litz-ai-panel-border)' }}>
                <h2 className="text-lg litz-ai-header-text flex items-center gap-2">
                    <img src={litzAiAvatar} alt="Litz AI" className="w-8 h-8 rounded-full border-2 border-current" />
                    LITZ AI <span className="text-xs opacity-60">v2.0</span>
                </h2>
                <div className="flex gap-1 items-center">
                    {isSessionActive && (
                         <button onClick={exportTranscript} className="litz-ai-button text-xs bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-300 font-bold py-1 px-3 rounded-md transition-colors">
                            Export
                        </button>
                    )}
                     <button onClick={isSessionActive ? endSession : startSession} className={`litz-ai-button text-sm font-bold py-2 px-4 transition-colors ${isSessionActive ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-green-600 hover:bg-green-500 text-white'}`}>
                        {isSessionActive ? 'END' : 'START'}
                    </button>
                     <button onClick={toggleMaximize} className="p-2 rounded-full hover:bg-[var(--litz-ai-grid-line)]" title={isMaximized ? 'Restore Down' : 'Maximize'}>
                        {isMaximized ? <RestoreIcon /> : <MaximizeIcon />}
                    </button>
                     <button onClick={toggleMinimize} className="p-2 rounded-full hover:bg-[var(--litz-ai-grid-line)]" title="Minimize">
                        <MinimizeIcon />
                    </button>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-red-500/20" title="Close">
                        <CloseIcon />
                    </button>
                </div>
            </header>

             <main className={`flex-grow p-4 overflow-hidden ${isMaximized ? 'grid grid-cols-1 md:grid-cols-4 gap-4' : 'flex flex-col gap-4'} ${isMinimized ? 'hidden' : ''}`}>
                {/* Left Panel (Status & Visualizer) */}
                <div className={`litz-ai-panel rounded-lg flex p-3 ${isMaximized ? 'md:col-span-1 flex-col' : 'flex-row items-center gap-4'}`}>
                    <div className="panel-corner top-left"></div><div className="panel-corner top-right"></div><div className="panel-corner bottom-left"></div><div className="panel-corner bottom-right"></div>
                    <h3 className={`litz-ai-header-text text-flicker text-center ${isMaximized ? 'mb-4' : 'mb-0 text-sm'}`}>[SYSTEM_STATUS]</h3>
                    <div className={`litz-ai-panel rounded-md p-2 text-center flex-grow ${isMaximized ? 'mb-4' : 'mb-0'}`}>
                        <p className="litz-ai-header-text text-flicker text-xs sm:text-base">[STATUS: {status}]</p>
                        {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
                    </div>
                    <div className={`flex-grow flex items-center justify-center ${isMaximized ? 'min-h-[100px]' : ''}`}>
                       <LitzAIVisualizer analyserNode={analyserNodeRef.current} isSessionActive={isSessionActive} />
                    </div>
                </div>

                {/* Center Orb (only when maximized) */}
                {isMaximized && (
                    <div className="hidden md:col-span-2 md:flex items-center justify-center relative">
                        <svg viewBox="0 0 200 200" className={`w-full h-full max-w-[32rem] max-h-[32rem] orb-container ${orbStatusClass}`}>
                            <defs>
                                <filter id="glow">
                                    <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
                                    <feMerge>
                                        <feMergeNode in="coloredBlur" />
                                        <feMergeNode in="SourceGraphic" />
                                    </feMerge>
                                </filter>
                            </defs>
                            <circle cx="100" cy="100" r="90" fill="none" stroke="var(--litz-ai-orb-ring-1)" strokeWidth="0.5" opacity="0.3" className="orb-ring-1" />
                            <circle cx="100" cy="100" r="75" fill="none" stroke="var(--litz-ai-orb-ring-2)" strokeWidth="0.7" opacity="0.5" className="orb-ring-2" />
                            <circle cx="100" cy="100" r="60" fill="none" stroke="var(--litz-ai-orb-ring-1)" strokeWidth="1" opacity="0.7" className="orb-ring-3" />
                            <path d="M 50,100 A 50,50 0 1,1 150,100" fill="none" stroke="var(--litz-ai-orb-spark)" strokeWidth="1.5" opacity="0.8" className="orb-spark" />
                            <circle cx="100" cy="100" r="35" fill="var(--litz-ai-orb-core)" className="orb-core-bg" />
                            <circle cx="100" cy="100" r="45" fill="var(--litz-ai-orb-core)" opacity="0.3" filter="url(#glow)" className="orb-core-glow" />
                        </svg>
                    </div>
                )}

                {/* Right Panel (Transcript) */}
                <div className={`litz-ai-panel rounded-lg flex flex-col p-4 overflow-hidden ${isMaximized ? 'md:col-span-1' : 'flex-grow'}`}>
                    <div className="panel-corner top-left"></div><div className="panel-corner top-right"></div><div className="panel-corner bottom-left"></div><div className="panel-corner bottom-right"></div>
                    <h3 className="litz-ai-header-text text-flicker text-center mb-4">[LIVE_TRANSCRIPT]</h3>
                    <div ref={transcriptContainerRef} className="litz-ai-transcript flex-grow space-y-4 text-sm overflow-y-auto pr-2">
                        {transcript.map(msg => (
                            <div key={msg.id} className="flex items-start gap-3">
                                {msg.sender === 'ai' && <img src={litzAiAvatar} className="w-6 h-6 rounded-full flex-shrink-0" />}
                                <div>
                                    <span className={msg.sender === 'user' ? 'transcript-user-name font-bold' : 'transcript-ai-name font-bold'}>&gt; {msg.sender === 'user' ? (currentUser?.fullName || 'ADMIN') : 'LITZ_AI'}: </span>
                                    <span className={msg.sender === 'user' ? 'transcript-user-text' : 'transcript-ai-text'}>{msg.text}</span>
                                </div>
                            </div>
                        ))}
                         {isSessionActive && status !== 'STANDBY' && (
                            <div>
                                <span className="transcript-user-name font-bold">&gt; {currentUser?.fullName || 'ADMIN'}: </span>
                                <span className="transcript-user-text">{currentInputTranscription.current}</span>
                                <span className="blinking-cursor" style={{ color: 'var(--litz-ai-text-header)' }}>▋</span>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default LitzAITab;