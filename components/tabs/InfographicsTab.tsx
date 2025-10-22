

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { scheduleData, ScheduleItem } from '../../data/infographicsData';
import { orangeBacolodLogo, bacolodCityLogo } from '../../data/logo';
import { CHANGELOG_DATA } from '../../constants';
import { newlyAddedItems } from '../../data/items/newlyAdded';
import { QRCodeCanvas } from 'qrcode.react';

interface InfographicsTabProps {
    isVisible: boolean;
    onClose: () => void;
    isTvMode?: boolean;
    isPublicView?: boolean;
}

// Define view types for a discriminated union to ensure type safety.
type CalendarViewInfo = { type: 'calendar'; date: Date };
type ActivityProjectionViewInfo = { type: 'activity_projection'; event: ScheduleItem };
type FunnelViewInfo = { type: 'funnel' };
type AnalyticsViewInfo = { type: 'analytics' };
type BidDocsRequirementsViewInfo = { type: 'bid_docs_requirements' };
type ScheduleTableViewInfo = { type: 'schedule_table' };
type MemoViewInfo = { type: 'memo' };
type NewlyAddedItemsViewInfo = { type: 'newly_added_items' };
type AppUpdatesViewInfo = { type: 'app_updates' };
type ImageViewInfo = { type: 'image'; imageUrl: string };
type ResolutionViewInfo = { type: 'resolution' };


type InfoView = CalendarViewInfo | ActivityProjectionViewInfo | FunnelViewInfo | AnalyticsViewInfo | BidDocsRequirementsViewInfo | ScheduleTableViewInfo | MemoViewInfo | NewlyAddedItemsViewInfo | AppUpdatesViewInfo | ImageViewInfo | ResolutionViewInfo;


// --- Sub-Components (defined outside and memoized for performance) ---

const LiveClock = React.memo(() => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timerId = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timerId);
    }, []);

    const timeString = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    const dateString = time.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    // Mock weather data for Bacolod City
    const weather = {
        temp: 31,
        description: "Partly Cloudy",
        icon: (
            <svg viewBox="0 0 24 24" className="weather-icon">
                <path fill="#FFC107" d="M12,8a4,4,0,1,1-4,4A4,4,0,0,1,12,8m0-2a6,6,0,1,0,6,6A6,6,0,0,0,12,6Z"></path>
                <path fill="#FFFFFF" d="M19.13,14.2a6.32,6.32,0,0,0-5.46-4.11,5.34,5.34,0,0,0-5.23,5.16,4.5,4.5,0,0,0,1.4,8.69H19.2c2.4,0,3.8-2.33,3.8-4.4A5.22,5.22,0,0,0,19.13,14.2Z"></path>
            </svg>
        )
    };

    return (
        <div className="live-clock">
            <div className="live-clock-time">{timeString}</div>
            <div className="live-clock-date">{dateString}</div>
            <div className="live-weather">
                {weather.icon}
                <div className="weather-info">
                    <div className="weather-temp">{weather.temp}°C</div>
                    <div className="weather-desc">{weather.description}</div>
                </div>
            </div>
        </div>
    );
});

const ScheduleFeed = React.memo(() => {
    const upcomingActivities = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return scheduleData.filter(event => {
            const eventDate = new Date(event.date);
            eventDate.setHours(0, 0, 0, 0);
            return eventDate.getTime() >= today.getTime();
        }).slice(0, 5); // Take top 5 upcoming
    }, []);

    if (upcomingActivities.length === 0) {
        return null;
    }

    return (
        <div className="sidebar-widget">
            <div className="widget-header">BAC Schedule of Activities</div>
            <div className="widget-content">
                <div className="gppb-feed-list">
                    {upcomingActivities.map((event, index) => (
                        <div key={index} className="gppb-feed-item">
                            <p className="feed-item-date">{event.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} @ {event.time}</p>
                            <p className="feed-item-title">{event.activity}: {event.title.substring(0, 50)}...</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
});

const ChangelogFeed = React.memo(() => {
    const recentUpdates = CHANGELOG_DATA.slice(0, 5);
    if (recentUpdates.length === 0) return null;

    return (
        <div className="sidebar-widget">
            <div className="widget-header">App Updates (v{CHANGELOG_DATA[0].version})</div>
            <div className="widget-content">
                <div className="gppb-feed-list">
                    {recentUpdates.map((entry) => (
                         <div key={entry.version} className="gppb-feed-item">
                            <p className="feed-item-date">{entry.date}</p>
                            <p className="feed-item-title"><strong>v{entry.version}:</strong> {entry.changes[0]}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
});

const QrAdWidget = React.memo(() => {
    return (
        <div className="sidebar-widget qr-ad-widget">
            <div className="widget-header">Inquiry & Feedback</div>
            <a href="https://ibb.co/nqg599XG" target="_blank" rel="noopener noreferrer">
                <div className="widget-content text-center p-4">
                    <img 
                        src="https://i.ibb.co/Y4Rqmm5C/bac-concern-qr-code.png" 
                        alt="BAC Concern QR Code" 
                        className="mx-auto rounded-lg w-40 h-40 border-2 border-white shadow-lg"
                    />
                    <p className="text-sm mt-3 font-semibold text-white/90">
                        Scan this QR for immediate response to your inquiry.
                    </p>
                </div>
            </a>
        </div>
    );
});

const Branding = React.memo(() => {
    return (
        <div className="infographics-branding">
             <p className="infographics-stronger-text">
                <span className="stronger-text-blue">Stron</span>
                <span className="stronger-text-orange">g</span>
                <span className="stronger-text-blue">er To</span>
                <span className="stronger-text-orange">g</span>
                <span className="stronger-text-blue">ether!</span>
            </p>
            <img src={orangeBacolodLogo} alt="Bacolod City Logo" />
        </div>
    );
});

const CalendarView: React.FC<{ displayDate: Date }> = ({ displayDate }) => {
    const year = displayDate.getFullYear();
    const month = displayDate.getMonth();
    const monthName = displayDate.toLocaleString('default', { month: 'long' });
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const blanks = Array(firstDay).fill(null);
    return (
        <div className="w-full h-full flex flex-col p-8 bg-white/50 backdrop-blur-sm rounded-lg">
            <h2 className="text-4xl font-bold text-gray-800">{monthName} {year} Schedule</h2>
            <div className="infographics-calendar-grid flex-grow mt-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day} className="font-bold text-gray-600 text-center">{day}</div>)}
                {blanks.map((_, i) => <div key={`blank-${i}`}></div>)}
                {days.map(day => {
                    const eventsForDay = scheduleData.filter(e => 
                        e.date.getFullYear() === year &&
                        e.date.getMonth() === month &&
                        e.date.getDate() === day
                    );
                    
                    const tooltipContent = eventsForDay.length > 0
                        ? eventsForDay.map(e => `• ${e.title}`).join('\n')
                        : '';

                    return (
                        <div 
                            key={day} 
                            className={`infographics-calendar-day ${eventsForDay.length > 0 ? 'has-event' : ''}`}
                            data-tooltip={tooltipContent}
                        >
                            <div className="day-number flex-shrink-0">{day}</div>
                            <div className="flex-grow overflow-y-auto pr-1">
                                {eventsForDay.map((event, index) => {
                                    const buttonActivities = ['PRE-PROC Conference', 'PRE-BID Conference', 'BID-EVALUATION', 'Consultative Meeting'];
                                    const showButton = buttonActivities.includes(event.activity);

                                    return (
                                        <div key={index} className="infographics-calendar-event" title={event.title}>
                                            <span className="infographics-calendar-event-activity">{event.activity}</span>
                                            {event.title}
                                            {showButton && (
                                                <button
                                                    className="calendar-event-button"
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // Prevent tooltip from interfering
                                                        alert(`Viewing details for: ${event.activity}`);
                                                    }}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                                                    </svg>
                                                    View
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const ActivityProjectionView: React.FC<{ event: ScheduleItem }> = ({ event }) => {
    const formattedDate = event.date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const formattedTime = event.time;
    const formattedAbc = new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(event.abc);

    return (
        <div className="w-full h-full flex items-center justify-center p-8">
            <div className="bg-slate-50 rounded-2xl shadow-2xl p-12 w-full max-w-5xl text-center flex flex-col justify-center gap-6">
                
                <h2 className="text-7xl font-black text-orange-500 tracking-tighter leading-none uppercase">{event.activity.replace(/ /g, '-')}</h2>
                
                <p className="text-2xl font-bold text-gray-700 -mt-2">{formattedDate} at {formattedTime}</p>
                
                <hr className="w-1/3 mx-auto border-t border-gray-300" />

                <p className="text-lg text-gray-600 max-w-4xl mx-auto px-4">{event.title}</p>
                
                <div className="mt-8 flex flex-col md:flex-row justify-center items-stretch gap-8">
                    <div className="bg-orange-500 text-white rounded-xl p-6 shadow-lg flex flex-col items-center justify-center w-full md:w-auto min-w-[280px]">
                        <p className="text-base font-semibold tracking-wider">END USER</p>
                        <p className="text-4xl font-extrabold mt-1">{event.endUser}</p>
                    </div>
                    
                    {event.activity !== 'Consultative Meeting' && (
                        <div className="bg-blue-800 text-white rounded-xl p-6 shadow-lg flex flex-col items-center justify-center w-full md:w-auto min-w-[320px]">
                            <p className="text-base font-semibold tracking-wider">APPROVED BUDGET (ABC)</p>
                            <p className="text-4xl font-extrabold mt-2">{formattedAbc}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const FunnelView = React.memo(() => {
    const funnelData = useMemo(() => {
        const counts = scheduleData.reduce((acc, item) => {
            if (item.activity.includes('PRE-PROC')) acc.preProc = (acc.preProc || 0) + 1;
            if (item.activity.includes('PRE-BID')) acc.preBid = (acc.preBid || 0) + 1;
            if (item.activity.includes('BID-EVAL')) acc.bidEval = (acc.bidEval || 0) + 1;
            return acc;
        }, { preProc: 0, preBid: 0, bidEval: 0 });

        return [
            { label: 'Pre-Procurement', count: counts.preProc, icon: '📢' },
            { label: 'Pre-Bid Conference', count: counts.preBid, icon: '📂' },
            { label: 'Bid Evaluation', count: counts.bidEval, icon: '🔍' },
            { label: 'For Awarding', count: 0, icon: '🏆' },
            { label: 'For NTP', count: 0, icon: '🚀' },
        ];
    }, []);

    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-8">
            <h2 className="text-5xl font-extrabold text-white text-shadow-lg mb-12">Procurement Activity Funnel</h2>
            <div className="infographics-funnel-container">
                {funnelData.map((stage, index) => (
                    <React.Fragment key={stage.label}>
                        <div className="infographics-funnel-stage">
                            <div className="funnel-icon">{stage.icon}</div>
                            <div className="funnel-count">{stage.count}</div>
                            <div className="funnel-label">{stage.label}</div>
                        </div>
                        {index < funnelData.length - 1 && <div className="infographics-funnel-arrow"></div>}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
});

const AnalyticsView = React.memo(() => (
    <div className="w-full h-full flex flex-col p-8 items-center justify-center">
        <h2 className="text-5xl font-extrabold text-white text-shadow-lg mb-8 text-center flex-shrink-0">BAC Performance Analytics</h2>
        <div className="w-full flex-grow bg-white/80 backdrop-blur-sm rounded-lg overflow-hidden border border-white/30 shadow-2xl">
            <iframe
                src="https://pages.hive.com/?shareToken=dpvt_aW2mx98Z4HuxKF3qX2DenMdzsui2DkzxATg8Mt5gFgWjy8cuMpDXSbtMdL78bXbZ"
                title="BAC Performance Analytics"
                width="100%"
                height="100%"
                frameBorder="0"
                allowFullScreen
                scrolling="yes"
            ></iframe>
        </div>
    </div>
));

const BidDocsRequirementsView = React.memo(() => {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 landscape:p-8">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 w-full max-w-6xl landscape:p-10 landscape:max-w-5xl landscape:-mt-8">
                <h2 className="text-4xl lg:text-5xl font-extrabold text-center text-orange-600 mb-6 tracking-tight">
                    Requirements for Purchase of Bid Documents
                </h2>
                <div className="space-y-4 text-lg">
                    <div className="flex items-start gap-3">
                         <svg className="w-7 h-7 text-orange-500 mt-1 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4z" /></svg>
                        <div><h4 className="font-bold text-gray-800">Mayor's / Business Permit</h4></div>
                    </div>
                     <div className="flex items-start gap-3">
                         <svg className="w-7 h-7 text-orange-500 mt-1 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 4h3" /></svg>
                         <div><h4 className="font-bold text-gray-800">SEC / DTI / CDA Certificate</h4></div>
                    </div>
                     <div className="flex items-start gap-3">
                         <svg className="w-7 h-7 text-orange-500 mt-1 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                         <div>
                            <h4 className="font-bold text-gray-800">Letter of Intent</h4>
                            <p className="text-sm text-gray-600">(Project Name, PR No. & ABC)</p>
                        </div>
                    </div>
                     <div className="flex items-start gap-3">
                         <svg className="w-7 h-7 text-orange-500 mt-1 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4z" /></svg>
                         <div>
                            <h4 className="font-bold text-gray-800">Secretary's Certificate / SPA</h4>
                            <p className="text-sm text-gray-600">(For authorized representative)</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                         <svg className="w-7 h-7 text-orange-500 mt-1 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4z" /></svg>
                         <div>
                            <h4 className="font-bold text-gray-800">Valid ID of Representative (Photocopy)</h4>
                        </div>
                    </div>
                </div>
                <div className="mt-8 bg-orange-50 p-4 rounded-lg border-t-4 border-orange-400">
                    <h4 className="text-lg font-bold text-orange-800 mb-2">Important Reminders</h4>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                        <li>Ensure all photocopies are clear and readable.</li>
                        <li>Submit one (1) complete set of documents to the BAC Secretariat.</li>
                        <li>Incomplete requirements will not be processed to avoid delays.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
});

const ScheduleTableView = React.memo(() => {
    const currencyFormatter = new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
    });

    return (
        <div className="w-full h-full flex flex-col p-8 bg-gray-100/80 backdrop-blur-lg rounded-xl text-slate-800">
            <h2 className="text-4xl font-extrabold text-center text-slate-900 mb-6 flex-shrink-0">
                BAC Schedule of Procurement Activities
            </h2>
            <div className="flex-grow overflow-y-auto rounded-lg border border-slate-300 bg-white/70 shadow-inner">
                <table className="min-w-full">
                    <thead className="bg-slate-200/80 sticky top-0 backdrop-blur-sm">
                        <tr>
                            <th className="py-2 px-3 text-left text-sm font-semibold text-slate-600 uppercase tracking-wider">Date</th>
                            <th className="py-2 px-3 text-left text-sm font-semibold text-slate-600 uppercase tracking-wider">Activity & Time</th>
                            <th className="py-2 px-3 text-left text-sm font-semibold text-slate-600 uppercase tracking-wider">Project Title</th>
                            <th className="py-2 px-3 text-center text-sm font-semibold text-slate-600 uppercase tracking-wider">End User</th>
                            <th className="py-2 px-3 text-right text-sm font-semibold text-slate-600 uppercase tracking-wider">ABC</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {scheduleData.map((event, index) => (
                            <tr key={index} className="hover:bg-slate-100/50 transition-colors">
                                <td className="py-3 px-3 align-top whitespace-nowrap text-slate-700">
                                    {event.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </td>
                                <td className="py-3 px-3 align-top whitespace-nowrap">
                                    <div className="font-bold text-orange-700">{event.activity}</div>
                                    <div className="text-xs text-slate-600">{event.time}</div>
                                </td>
                                <td className="py-3 px-3 align-top text-xs text-slate-800">{event.title}</td>
                                <td className="py-3 px-3 align-top text-center font-semibold text-slate-700">{event.endUser}</td>
                                <td className="py-3 px-3 align-top text-right whitespace-nowrap font-mono font-semibold text-slate-800">
                                    {currencyFormatter.format(event.abc)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
});

const MemoView = React.memo(() => {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-8">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-4xl p-10 flex flex-col gap-6 text-slate-800">
                {/* Header */}
                <div className="text-center border-b-2 pb-4 border-slate-200">
                    <h2 className="text-5xl font-extrabold text-red-600 tracking-tight">PUBLIC ADVISORY</h2>
                    <p className="text-lg font-semibold text-slate-600 mt-1">Memorandum No. BAC-SEC-25-M-0004</p>
                </div>

                {/* Main Content */}
                <div className="flex flex-col md:flex-row gap-8 items-center">
                    {/* Date Section */}
                    <div className="flex-shrink-0 text-center bg-red-50 border-4 border-red-500 rounded-2xl p-6 shadow-lg">
                        <p className="text-2xl font-bold text-red-700">OCT</p>
                        <p className="text-8xl font-black text-red-600 leading-none tracking-tighter">17</p>
                        <p className="text-2xl font-bold text-red-700">2025</p>
                        <div className="mt-4 bg-red-600 text-white font-bold py-2 px-4 rounded-full">
                            NO EXTENSIONS
                        </div>
                    </div>

                    {/* Details Section */}
                    <div className="flex-grow">
                        <h3 className="text-3xl font-bold text-slate-900 leading-tight">Deadline for Submission of FY 2025 Purchase Requests</h3>
                        <p className="text-slate-600 mt-2">All offices, agencies, and departments must submit their Purchase Requests (PRs) for goods, services, and infrastructure projects for Fiscal Year 2025 on or before the final deadline.</p>

                        <div className="mt-6 bg-slate-100 p-4 rounded-lg">
                            <h4 className="font-bold text-slate-800 mb-2">Checklist of Required Documents:</h4>
                            <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
                                <li>Project Procurement Management Plan (PPMP) details</li>
                                <li>Approved Obligation Request (OBR)</li>
                                <li>Detailed Technical Specifications / Terms of Reference (ToR)</li>
                                <li>Approved Program of Works (PoW)</li>
                                <li>Other necessary supporting documents</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Footer/Signatories */}
                <div className="text-center mt-4 pt-4 border-t-2 border-slate-200 text-xs text-slate-500">
                    <p>Strict compliance is enjoined to ensure timely completion of all procurement activities.</p>
                    <div className="flex justify-around items-start mt-8">
                        <div className="text-center">
                            <p className="font-bold text-sm text-slate-700 mt-6">(Sgd.) ATTY. HERMILO B. PA-OYON</p>
                            <p>Chairperson, Bids and Awards Committee</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-slate-600">Noted by:</p>
                            <p className="font-bold text-sm text-slate-700 mt-2">(Sgd.) ATTY. MARK STEVEN S. MAYO</p>
                            <p>City Administrator</p>
                        </div>
                    </div>
                    <p className="mt-8 italic text-slate-500">Note: The original hard copy of this memorandum is signed.</p>
                </div>
            </div>
        </div>
    );
});

const NewlyAddedItemsView = React.memo(() => {
    const itemsToShow = newlyAddedItems.slice(0, 6);
    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-8">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-6xl p-12 flex flex-col gap-8 text-slate-800">
                <div className="text-center border-b-2 pb-6 border-slate-200">
                    <h2 className="text-8xl font-extrabold text-green-600 tracking-tighter">CATALOG UPDATE</h2>
                    <p className="text-2xl font-semibold text-slate-600 mt-2">Newly Added Items</p>
                </div>
                <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                    {itemsToShow.map(item => (
                        <div key={item.id} className="flex items-center gap-4 border-b pb-3">
                            <div className="w-16 h-16 bg-gray-200 rounded-md flex-shrink-0">
                                <img src={('imageUrl' in item && item.imageUrl) || orangeBacolodLogo} alt={item.name} className="w-full h-full object-contain p-1"/>
                            </div>
                            <div>
                                <p className="font-bold text-lg">{item.name}</p>
                                <p className="text-sm text-gray-500">{item.category}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="text-center mt-4 pt-4 border-t-2 border-slate-200 text-lg text-slate-500">
                    <p>Log in to the <strong className="text-orange-600">Procurement Catalog</strong> to view details, add to your PR, and see all available items.</p>
                </div>
            </div>
        </div>
    );
});

const AppUpdatesView = React.memo(() => {
    const latestUpdate = CHANGELOG_DATA[0];
    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-8">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-6xl p-12 flex flex-col gap-8 text-slate-800">
                <div className="text-center border-b-2 pb-6 border-slate-200">
                    <h2 className="text-8xl font-extrabold text-blue-600 tracking-tight">APP UPDATE</h2>
                    <p className="text-2xl font-semibold text-slate-600 mt-2">Version {latestUpdate.version} - {latestUpdate.date}</p>
                </div>
                <div className="space-y-6">
                    <h3 className="font-bold text-3xl text-slate-800">What's New:</h3>
                    <ul className="list-disc list-inside space-y-3 text-slate-700 text-xl">
                        {latestUpdate.changes.map((change, index) => (
                            <li key={index}>{change}</li>
                        ))}
                    </ul>
                </div>
                <div className="text-center mt-4 pt-4 border-t-2 border-slate-200 text-lg text-slate-500">
                    <p>Check the full <strong className="text-orange-600">Changelog</strong> in the footer for a complete history of updates.</p>
                </div>
            </div>
        </div>
    );
});

const ImageView: React.FC<{ imageUrl: string }> = ({ imageUrl }) => {
    const isEnlarged = imageUrl.includes('CONGRATULATIONS-1.png');
    return (
        <div className={`w-full h-full flex items-center justify-center ${isEnlarged ? 'p-0' : 'p-8'}`}>
            <img src={imageUrl} alt="Infographics slide" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"/>
        </div>
    );
};

const ResolutionView = React.memo(() => {
    const resolutionUrl = "https://hv-hive-drive.s3-accelerate.amazonaws.com/6ofLb6eovcoAtWiK4/bnwTqJjKHWYAWRsd6/bac%20reso%20no%20b-0266.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAV6UM3WX3YE26XTWY%2F20251016%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20251016T030157Z&X-Amz-Expires=144000&X-Amz-Signature=df704b34a59af5471f1ececf46759382c652eb80f3ff8120a4f30012b9f1fa4f&x-id=GetObject";

    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-8">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-5xl p-10 flex flex-col gap-6 text-slate-800">
                {/* Header */}
                <div className="text-center border-b-2 pb-4 border-slate-200">
                    <img src={bacolodCityLogo} alt="Bacolod City Seal" className="h-20 mx-auto mb-2"/>
                    <p className="font-semibold text-slate-600">Republic of the Philippines</p>
                    <h2 className="text-4xl font-extrabold text-blue-800 tracking-tight mt-1">BIDS AND AWARDS COMMITTEE</h2>
                    <p className="text-lg font-semibold text-slate-600">Bacolod City</p>
                    <p className="text-2xl font-bold text-slate-800 mt-4">BAC RESOLUTION NO. B-0266</p>
                    <p className="text-md font-semibold text-slate-500">Series of 2025</p>
                </div>

                {/* Main Content */}
                <div className="text-center">
                    <h3 className="text-xl font-bold text-slate-900 leading-tight uppercase">
                        Resolution to Direct the BAC-Secretariat to Create a Registry for Suppliers and to Establish a Schedule of Fees and Other Charges for Services Availed by the Public
                    </h3>
                </div>
                
                <div className="mt-4 bg-orange-50 p-6 rounded-lg border-t-4 border-orange-400">
                    <h4 className="text-2xl font-bold text-orange-800 mb-4 text-center">Schedule of Fees</h4>
                    <div className="space-y-4 text-lg">
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="font-semibold text-gray-700">Supplier Registration</span>
                            <span className="font-bold text-gray-900">P 1,000.00 / Registrant</span>
                        </div>
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="font-semibold text-gray-700">Copies of Minutes of Meetings</span>
                            <span className="font-bold text-gray-900">P 500.00 / Minutes</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="font-semibold text-gray-700">Certified Copies of BAC Documents</span>
                            <span className="font-bold text-gray-900">P 10.00 / Page</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-4 pt-4 border-t-2 border-slate-200 flex items-center justify-between">
                     <div className="text-xs text-slate-500 text-left">
                        <p><strong>WHEREAS</strong>, maintaining a supplier registry proves beneficial for permanent qualification records.</p>
                        <p><strong>RESOLVED</strong>, to direct the BAC Secretariat to create a supplier registry and establish this schedule of fees.</p>
                        <p className="mt-2">Done this 10th day of October, 2025.</p>
                    </div>
                    <div className="text-center">
                        <QRCodeCanvas value={resolutionUrl} size={80} bgColor={"#ffffff"} fgColor={"#000000"} />
                        <p className="text-[10px] font-mono mt-1 text-gray-600">Scan for Full Document</p>
                    </div>
                </div>
            </div>
        </div>
    );
});


const RealtimeMarquee = React.memo(() => {
    const marqueeData = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const upcomingActivities = scheduleData.filter(event => {
            const eventDate = new Date(event.date);
            eventDate.setHours(0, 0, 0, 0); // Normalize event date
            return eventDate.getTime() >= today.getTime();
        });
        
        if (!upcomingActivities || upcomingActivities.length === 0) {
            return [{ type: 'SYSTEM', text: 'No current or upcoming activities scheduled. Monitoring for updates...' }];
        }
        return upcomingActivities.map(event => ({
            type: event.activity.replace(/ conference/i, '').replace(/-/g, ' '),
            text: `${event.title.substring(0, 100)}... scheduled for ${event.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
        }));
    }, []);

    // Double the data for a seamless scrolling effect
    const marqueeContent = [...marqueeData, ...marqueeData];

    return (
        <div className="infographics-marquee">
            <div className="live-indicator">
                <div className="live-dot"></div>
                <span className="live-text">Live Feed</span>
            </div>
            <div className="marquee-content">
                {marqueeContent.map((item, index) => (
                    <span key={index} className="marquee-item">
                        <strong className="text-orange-300">[{item.type}]</strong> {item.text}
                    </span>
                ))}
            </div>
        </div>
    );
});


export const InfographicsTab: React.FC<InfographicsTabProps> = ({ isVisible, onClose, isTvMode = false, isPublicView = false }) => {
    const [isMaximized, setIsMaximized] = useState(isTvMode || isPublicView);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStartOffset = useRef({ x: 0, y: 0 });
    const nodeRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLDivElement>(null);
    const [error, setError] = useState('');
    
    const [isPaused, setIsPaused] = useState(false);
    
    const [isCropping, setIsCropping] = useState(false);
    const [cropBox, setCropBox] = useState({ x: 150, y: 150, width: 500, height: 500 });
    const dragInfoRef = useRef<{ type: 'move' | 'resize-tl' | 'resize-tr' | 'resize-bl' | 'resize-br' | 'resize-t' | 'resize-r' | 'resize-b' | 'resize-l', startX: number, startY: number, startBox: typeof cropBox } | null>(null);

    useEffect(() => {
        if (isTvMode && isVisible) {
            document.body.classList.add('tv-mode-active');
            setIsMaximized(true);
        }
        return () => {
            document.body.classList.remove('tv-mode-active');
        };
    }, [isTvMode, isVisible]);
    
    useEffect(() => {
        if (!isCropping) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsCropping(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isCropping]);

    const availableMonths = useMemo(() => {
        const october = 9;
        const year = 2025;
        return [new Date(year, october, 1)];
    }, []);

    const views: InfoView[] = useMemo(() => {
        const calendarViews: CalendarViewInfo[] = availableMonths.map(date => ({ type: 'calendar', date }));
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const upcomingActivities = scheduleData.filter(event => {
            const eventDate = new Date(event.date);
            eventDate.setHours(0, 0, 0, 0);
            return eventDate.getTime() >= today.getTime();
        });
        const activityViews: ActivityProjectionViewInfo[] = upcomingActivities.map(event => ({ type: 'activity_projection', event }));
        return [
            { type: 'resolution' },
            { type: 'schedule_table'}, 
            { type: 'memo' }, 
            { type: 'bid_docs_requirements' },
            { type: 'newly_added_items' },
            { type: 'app_updates' },
            { type: 'image', imageUrl: 'https://i.ibb.co/0Vvj3W9g/CONGRATULATIONS-1.png' },
            ...calendarViews, 
            ...activityViews, 
            { type: 'funnel' }, 
            { type: 'analytics' }
        ];
    }, [availableMonths]);

    const [currentViewIndex, setCurrentViewIndex] = useState(0);

    useEffect(() => {
        if (!isPaused && isVisible && !isCropping) {
            const currentView = views[currentViewIndex];
            const duration = currentView.type === 'analytics' ? 15000 : 10000;
            const timer = setTimeout(() => {
                setCurrentViewIndex(prev => (prev + 1) % views.length);
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [isPaused, isVisible, currentViewIndex, views, isCropping]);
    
    const getFilename = (extension: 'jpeg' | 'pdf'): string => {
        const currentView = views[currentViewIndex];
        let baseName = 'bac-infographic';
        if (currentView.type === 'activity_projection') {
            const activityName = currentView.event.activity.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            baseName = `activity_${activityName}`;
        } else if (currentView.type === 'calendar') {
            baseName = `calendar_${currentView.date.getFullYear()}_${currentView.date.getMonth() + 1}`;
        } else {
            baseName = `${currentView.type}_view`;
        }
        return `${baseName}.${extension}`;
    };

    const handleFullCapture = () => {
        const canvasElement = canvasRef.current;
        if (!canvasElement || !(window as any).html2canvas) {
            setError('Could not export image. A required library is not available.'); return;
        }
        if (document.activeElement instanceof HTMLElement) { document.activeElement.blur(); }

        setTimeout(() => {
            (window as any).html2canvas(canvasElement, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff'
            }).then((capturedCanvas: HTMLCanvasElement) => {
                const link = document.createElement('a');
                link.download = `full-capture_${getFilename('jpeg')}`;
                link.href = capturedCanvas.toDataURL('image/jpeg', 0.95);
                link.click();
            });
        }, 100);
    };

    const handleExportPdf = () => {
        const canvasElement = canvasRef.current;
        if (!canvasElement || !(window as any).html2canvas || !(window as any).jspdf) {
             alert('Could not export PDF. A required library is not available.'); return;
        }
        if (document.activeElement instanceof HTMLElement) { document.activeElement.blur(); }
        setTimeout(() => {
            (window as any).html2canvas(canvasElement, { scale: 2, useCORS: true, backgroundColor: '#ffffff' }).then((canvas: HTMLCanvasElement) => {
                const imgData = canvas.toDataURL('image/png');
                const { jsPDF } = (window as any).jspdf;
                const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                const margin = 10;
                const drawSize = Math.min(pdfWidth - 2 * margin, pdfHeight - 2 * margin);
                const x = (pdfWidth - drawSize) / 2;
                const y = (pdfHeight - drawSize) / 2;
                pdf.addImage(imgData, 'PNG', x, y, drawSize, drawSize);
                pdf.save(getFilename('pdf'));
            });
        }, 100);
    };

    const handleCropMouseMove = useCallback((e: MouseEvent) => {
        if (!dragInfoRef.current || !canvasRef.current) return;
        e.preventDefault();
        
        const bounds = canvasRef.current.getBoundingClientRect();
        const { type, startX, startY, startBox } = dragInfoRef.current;
    
        let newX = startBox.x;
        let newY = startBox.y;
        let newWidth = startBox.width;
        let newHeight = startBox.height;
    
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
    
        if (type === 'move') {
            newX = startBox.x + dx;
            newY = startBox.y + dy;
        } else {
            if (type.includes('l')) {
                newWidth = startBox.width - dx;
                newX = startBox.x + dx;
            }
            if (type.includes('r')) {
                newWidth = startBox.width + dx;
            }
            if (type.includes('t')) {
                newHeight = startBox.height - dy;
                newY = startBox.y + dy;
            }
            if (type.includes('b')) {
                newHeight = startBox.height + dy;
            }
        }
        
        const minSize = 50;
        
        if (newWidth < minSize) {
            if (type.includes('l')) {
                newX = startBox.x + startBox.width - minSize;
            }
            newWidth = minSize;
        }
        if (newHeight < minSize) {
            if (type.includes('t')) {
                newY = startBox.y + startBox.height - minSize;
            }
            newHeight = minSize;
        }
    
        newX = Math.max(0, Math.min(newX, bounds.width - newWidth));
        newY = Math.max(0, Math.min(newY, bounds.height - newHeight));
        
        if (newX + newWidth > bounds.width) {
            newWidth = bounds.width - newX;
        }
        if (newY + newHeight > bounds.height) {
            newHeight = bounds.height - newY;
        }
    
        setCropBox({ x: newX, y: newY, width: newWidth, height: newHeight });
    }, []);

    const handleCropMouseUp = useCallback(() => {
        dragInfoRef.current = null;
        window.removeEventListener('mousemove', handleCropMouseMove);
        window.removeEventListener('mouseup', handleCropMouseUp);
    }, [handleCropMouseMove]);
    
    const handleCropMouseDown = (type: 'move' | 'resize-tl' | 'resize-tr' | 'resize-bl' | 'resize-br' | 'resize-t' | 'resize-r' | 'resize-b' | 'resize-l') => (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        dragInfoRef.current = {
            type,
            startX: e.clientX,
            startY: e.clientY,
            startBox: { ...cropBox }
        };
        window.addEventListener('mousemove', handleCropMouseMove);
        window.addEventListener('mouseup', handleCropMouseUp);
    };

    useEffect(() => {
        return () => {
            window.removeEventListener('mousemove', handleCropMouseMove);
            window.removeEventListener('mouseup', handleCropMouseUp);
        };
    }, [handleCropMouseMove, handleCropMouseUp]);

    const handleCropAndExport = async () => {
        const mainContainer = canvasRef.current;
        if (!mainContainer) return;
        
        setIsCropping(false);
        // Wait for state to update and UI to re-render without crop box
        await new Promise(resolve => setTimeout(resolve, 50));
        
        try {
            const fullCanvas = await (window as any).html2canvas(mainContainer, { useCORS: true, backgroundColor: '#ffffff', scale: 2 });
            const croppedCanvas = document.createElement('canvas');
            const ctx = croppedCanvas.getContext('2d');
            if (!ctx) return;

            const scale = 2; // Match the capture scale
            croppedCanvas.width = cropBox.width * scale;
            croppedCanvas.height = cropBox.height * scale;

            ctx.drawImage(
                fullCanvas,
                cropBox.x * scale, cropBox.y * scale, // source x, y
                cropBox.width * scale, cropBox.height * scale, // source width, height
                0, 0, // destination x, y
                cropBox.width * scale, cropBox.height * scale // destination width, height
            );

            const link = document.createElement('a');
            link.download = `cropped_${getFilename('jpeg')}`;
            link.href = croppedCanvas.toDataURL('image/jpeg', 0.95);
            link.click();
        } catch (e) {
            console.error("Cropping failed:", e);
            setError("Failed to capture image. Please try again.");
        }
    };
    
    const handleMouseMove = useCallback((e: MouseEvent) => { if (!isDragging || !nodeRef.current) return; let newX = e.clientX - dragStartOffset.current.x; let newY = e.clientY - dragStartOffset.current.y; setPosition({ x: newX, y: newY }); }, [isDragging]);
    const handleMouseUp = useCallback(() => { setIsDragging(false); document.body.style.userSelect = ''; window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp); }, [handleMouseMove]);
    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => { if (isMaximized || (e.target as HTMLElement).closest('button')) return; setIsDragging(true); dragStartOffset.current = { x: e.clientX - position.x, y: e.clientY - position.y }; document.body.style.userSelect = 'none'; window.addEventListener('mousemove', handleMouseMove); window.addEventListener('mouseup', handleMouseUp);};
    useEffect(() => { return () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp); }; }, [handleMouseMove, handleMouseUp]);

    if (!isVisible) return null;
    const windowStyle: React.CSSProperties = isMaximized ? { top: '0', left: '0', width: '100vw', height: '100vh', borderRadius: 0 } : { top: `${position.y}px`, left: `${position.x}px`, width: '90vw', height: '90vh' };
    const showHeader = !isTvMode || isPublicView;

    return (
        <div ref={nodeRef} className="infographics-modal fixed" style={windowStyle}>
            {showHeader && (
              <div onMouseDown={handleMouseDown} className={`window-header ${isMaximized ? '' : 'cursor-move'}`}>
                  <h2 className="text-sm font-bold select-none">BAC Infographics Display</h2>
                  <div className="flex items-center space-x-1">
                      <button onClick={handleFullCapture} className="window-control-btn">Capture Full View</button>
                      <button onClick={() => setIsCropping(true)} className="window-control-btn">Crop & Export</button>
                      <button onClick={handleExportPdf} className="window-control-btn">Export PDF</button>
                      {!isPublicView && <button onClick={() => setIsMaximized(!isMaximized)} className="window-control-btn">{isMaximized ? 'Restore' : 'Maximize'}</button>}
                      <button onClick={onClose} className="window-control-btn close">Close</button>
                  </div>
              </div>
            )}

            <div className="infographics-container">
                <aside className="infographics-sidebar">
                    <div className="sidebar-widget">
                        <div className="widget-content">
                            <LiveClock />
                        </div>
                    </div>
                    <QrAdWidget />
                    <ScheduleFeed />
                    <ChangelogFeed />
                </aside>

                <main ref={canvasRef} className="infographics-view-container">
                    {views.map((view, index) => (
                        <div key={`${view.type}-${'date' in view ? view.date.getTime() : ('event' in view ? view.event.title : ('imageUrl' in view ? view.imageUrl : index))}`} className={`infographics-view-item ${index === currentViewIndex ? 'active' : ''}`}>
                            {view.type === 'calendar' && <CalendarView displayDate={view.date} />}
                            {view.type === 'activity_projection' && <ActivityProjectionView event={view.event} />}
                            {view.type === 'funnel' && <FunnelView />}
                            {view.type === 'analytics' && <AnalyticsView />}
                            {view.type === 'bid_docs_requirements' && <BidDocsRequirementsView />}
                            {view.type === 'schedule_table' && <ScheduleTableView />}
                            {view.type === 'memo' && <MemoView />}
                            {view.type === 'newly_added_items' && <NewlyAddedItemsView />}
                            {view.type === 'app_updates' && <AppUpdatesView />}
                            {view.type === 'image' && <ImageView imageUrl={view.imageUrl} />}
                            {view.type === 'resolution' && <ResolutionView />}
                        </div>
                    ))}
                     {isCropping && (
                        <div className="crop-overlay no-drag" onClick={() => setIsCropping(false)}>
                            <div
                                className="crop-box"
                                style={{
                                    left: cropBox.x,
                                    top: cropBox.y,
                                    width: cropBox.width,
                                    height: cropBox.height,
                                }}
                                onClick={(e) => e.stopPropagation()}
                                onMouseDown={handleCropMouseDown('move')}
                                onDoubleClick={handleCropAndExport}
                            >
                                <div className="crop-hint">Double-click to capture</div>
                                <div className="crop-handle tl" onMouseDown={handleCropMouseDown('resize-tl')} />
                                <div className="crop-handle tr" onMouseDown={handleCropMouseDown('resize-tr')} />
                                <div className="crop-handle bl" onMouseDown={handleCropMouseDown('resize-bl')} />
                                <div className="crop-handle br" onMouseDown={handleCropMouseDown('resize-br')} />
                                <div className="crop-handle t" onMouseDown={handleCropMouseDown('resize-t')} />
                                <div className="crop-handle r" onMouseDown={handleCropMouseDown('resize-r')} />
                                <div className="crop-handle b" onMouseDown={handleCropMouseDown('resize-b')} />
                                <div className="crop-handle l" onMouseDown={handleCropMouseDown('resize-l')} />
                            </div>
                        </div>
                    )}
                    <Branding />
                </main>
            </div>

            <RealtimeMarquee />
            
            {(!isTvMode || isPublicView) && (
              <div className="view-cycle-controls">
                  <button onClick={() => setCurrentViewIndex(prev => (prev - 1 + views.length) % views.length)}>‹</button>
                  <button onClick={() => setIsPaused(!isPaused)}>{isPaused ? '▶' : '❚❚'}</button>
                  <button onClick={() => setCurrentViewIndex(prev => (prev + 1) % views.length)}>›</button>
              </div>
            )}
        </div>
    );
};

export default InfographicsTab;