import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

interface InfographicsTabProps {
    isVisible: boolean;
    onClose: () => void;
}

// --- MOCK DATA ---
const MOCK_PRE_BID_SCHEDULE: { date: number; title: string; pr: string }[] = [
    { date: 5, title: 'Supply of IT Equipment', pr: '2025-07-0112' },
    { date: 12, title: 'Road Concreting Project - Brgy. Mansilingan', pr: '2025-07-0115' },
    { date: 19, title: 'Procurement of Medical Supplies for CHO', pr: '2025-07-0118' },
    { date: 26, title: 'Catering Services for LGU Events', pr: '2025-07-0121' },
];

const MOCK_FUNNEL_DATA: { [key: string]: { label: string; count: number; icon: string } } = {
    preBid: { label: 'For Pre-Bid', count: 5, icon: '📢' },
    bidsOpen: { label: 'Bids Opened', count: 8, icon: '📂' },
    postQual: { label: 'Post-Qualification', count: 3, icon: '🔍' },
    awarded: { label: 'Awarded', count: 12, icon: '🏆' },
    ntp: { label: 'Notice to Proceed', count: 9, icon: '🚀' },
    completed: { label: 'Completed', count: 50, icon: '✅' },
};

const MOCK_ANALYTICS_DATA = {
    totalProjects: 78,
    totalABC: 25750000,
    successRate: 92,
    avgTimeline: 28,
    modeBreakdown: [
        { name: 'Competitive Bidding', value: 18500000, color: '#f97316' },
        { name: 'Small Value Procurement', value: 5250000, color: '#fb923c' },
        { name: 'Direct Contracting', value: 950000, color: '#fdba74' },
        { name: 'Other AMPs', value: 1050000, color: '#fed7aa' },
    ],
};

const InfographicsTab: React.FC<InfographicsTabProps> = ({ isVisible, onClose }) => {
    // --- Window State & Handlers ---
    const [isMaximized, setIsMaximized] = useState(true);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStartOffset = useRef({ x: 0, y: 0 });
    const nodeRef = useRef<HTMLDivElement>(null);
    
    // --- View Cycling State ---
    const [currentViewIndex, setCurrentViewIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const views = ['calendar', 'funnel', 'analytics'];
    
    useEffect(() => {
        if (!isPaused && isVisible) {
            const interval = setInterval(() => {
                setCurrentViewIndex(prev => (prev + 1) % views.length);
            }, 15000);
            return () => clearInterval(interval);
        }
    }, [isPaused, isVisible, views.length]);

    // --- Window Drag Logic ---
    const handleMouseMove = useCallback((e: MouseEvent) => { if (!isDragging || !nodeRef.current) return; let newX = e.clientX - dragStartOffset.current.x; let newY = e.clientY - dragStartOffset.current.y; setPosition({ x: newX, y: newY }); }, [isDragging]);
    const handleMouseUp = useCallback(() => { setIsDragging(false); document.body.style.userSelect = ''; window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp); }, [handleMouseMove]);
    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => { if (isMaximized || (e.target as HTMLElement).closest('button')) return; setIsDragging(true); dragStartOffset.current = { x: e.clientX - position.x, y: e.clientY - position.y }; document.body.style.userSelect = 'none'; window.addEventListener('mousemove', handleMouseMove); window.addEventListener('mouseup', handleMouseUp);};
    useEffect(() => { return () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp); }; }, [handleMouseMove, handleMouseUp]);

    if (!isVisible) return null;

    const windowStyle: React.CSSProperties = isMaximized ? { top: '0', left: '0', width: '100vw', height: '100vh', borderRadius: 0 } : { top: `${position.y}px`, left: `${position.x}px`, width: '90vw', height: '90vh' };

    // --- Sub-Components for Views ---
    const CalendarView = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();
        const monthName = today.toLocaleString('default', { month: 'long' });
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
        const blanks = Array(firstDay).fill(null);
        return (
            <div className="w-full h-full flex flex-col p-8 bg-white/50 backdrop-blur-sm rounded-lg">
                <h2 className="text-4xl font-bold text-gray-800">{monthName} {year} Pre-Bid Schedule</h2>
                <div className="infographics-calendar-grid flex-grow mt-4">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day} className="font-bold text-gray-600 text-center">{day}</div>)}
                    {blanks.map((_, i) => <div key={`blank-${i}`}></div>)}
                    {days.map(day => {
                        const event = MOCK_PRE_BID_SCHEDULE.find(e => e.date === day);
                        return (
                            <div key={day} className={`infographics-calendar-day ${event ? 'has-event' : ''}`}>
                                <div className="day-number">{day}</div>
                                {event && <div className="infographics-calendar-event">{event.title}</div>}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const FunnelView = () => (
        <div className="w-full h-full flex flex-col items-center justify-center p-8">
            <h2 className="text-5xl font-extrabold text-white text-shadow-lg mb-12">Bidding Activity Funnel</h2>
            <div className="infographics-funnel-container">
                {Object.values(MOCK_FUNNEL_DATA).map((stage, index) => (
                    <React.Fragment key={stage.label}>
                        <div className="infographics-funnel-stage">
                            <div className="funnel-icon">{stage.icon}</div>
                            <div className="funnel-count">{stage.count}</div>
                            <div className="funnel-label">{stage.label}</div>
                        </div>
                        {index < Object.values(MOCK_FUNNEL_DATA).length - 1 && <div className="infographics-funnel-arrow"></div>}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
    
    const AnalyticsView = () => (
        <div className="w-full h-full flex flex-col p-8">
            <h2 className="text-5xl font-extrabold text-white text-shadow-lg mb-8">BAC Performance Analytics</h2>
            <div className="infographics-analytics-grid flex-grow">
                <div className="kpi-card main-kpi"><div className="kpi-value">{MOCK_ANALYTICS_DATA.totalProjects}</div><div className="kpi-label">Total Projects YTD</div></div>
                <div className="kpi-card"><div className="kpi-value">₱{MOCK_ANALYTICS_DATA.totalABC.toLocaleString()}</div><div className="kpi-label">Total ABC YTD</div></div>
                <div className="kpi-card"><div className="kpi-value">{MOCK_ANALYTICS_DATA.successRate}%</div><div className="kpi-label">Success Rate</div></div>
                <div className="kpi-card"><div className="kpi-value">{MOCK_ANALYTICS_DATA.avgTimeline} Days</div><div className="kpi-label">Average Timeline</div></div>
                <div className="kpi-card chart-card">
                    <h3 className="kpi-label mb-2">Procurement Modes by Value</h3>
                    <div className="w-full h-4/5 flex items-center gap-4">
                        <div className="w-2/3 h-full flex flex-col justify-center gap-2">
                            {MOCK_ANALYTICS_DATA.modeBreakdown.map(mode => (
                                <div key={mode.name} className="flex items-center text-white">
                                    <div className="w-4 h-4 rounded-sm mr-2" style={{ backgroundColor: mode.color }}></div>
                                    <span className="text-sm">{mode.name}</span>
                                    <span className="ml-auto font-bold text-sm">₱{(mode.value / 1_000_000).toFixed(1)}M</span>
                                </div>
                            ))}
                        </div>
                        <div className="w-1/3 h-full relative">
                            <svg viewBox="0 0 100 100" className="w-full h-full">
                                {(() => {
                                    let cumulativePercent = 0;
                                    const total = MOCK_ANALYTICS_DATA.modeBreakdown.reduce((sum, item) => sum + item.value, 0);
                                    return MOCK_ANALYTICS_DATA.modeBreakdown.map(item => {
                                        const percent = item.value / total;
                                        const startAngle = cumulativePercent * 360;
                                        cumulativePercent += percent;
                                        const endAngle = cumulativePercent * 360;
                                        const largeArcFlag = percent > 0.5 ? 1 : 0;
                                        const x1 = 50 + 50 * Math.cos(Math.PI * (startAngle - 90) / 180);
                                        const y1 = 50 + 50 * Math.sin(Math.PI * (startAngle - 90) / 180);
                                        const x2 = 50 + 50 * Math.cos(Math.PI * (endAngle - 90) / 180);
                                        const y2 = 50 + 50 * Math.sin(Math.PI * (endAngle - 90) / 180);
                                        const d = `M50,50 L${x1},${y1} A50,50 0 ${largeArcFlag},1 ${x2},${y2} z`;
                                        return <path key={item.name} d={d} fill={item.color} />;
                                    });
                                })()}
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div ref={nodeRef} className="infographics-modal fixed" style={windowStyle}>
            <div onMouseDown={handleMouseDown} className={`window-header ${isMaximized ? '' : 'cursor-move'}`}>
                <h2 className="text-sm font-bold select-none">BAC Infographics Display</h2>
                <div className="flex items-center space-x-1">
                    <button onClick={() => setIsMaximized(!isMaximized)} className="window-control-btn">{isMaximized ? 'Restore' : 'Maximize'}</button>
                    <button onClick={onClose} className="window-control-btn close">Close</button>
                </div>
            </div>
            
            <div className="infographics-view-container">
                {views.map((view, index) => (
                    <div key={view} className={`infographics-view-item ${index === currentViewIndex ? 'active' : ''}`}>
                        {view === 'calendar' && <CalendarView />}
                        {view === 'funnel' && <FunnelView />}
                        {view === 'analytics' && <AnalyticsView />}
                    </div>
                ))}
            </div>

            <div className="view-cycle-controls">
                <button onClick={() => setCurrentViewIndex(prev => (prev - 1 + views.length) % views.length)}>‹</button>
                <button onClick={() => setIsPaused(!isPaused)}>{isPaused ? '▶' : '❚❚'}</button>
                <button onClick={() => setCurrentViewIndex(prev => (prev + 1) % views.length)}>›</button>
            </div>
        </div>
    );
};

export default InfographicsTab;
