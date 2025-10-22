
import React, { useMemo, useRef } from 'react';
import { TabKey, MenuItem, ModalKey } from '../../types';
import { SessionUser } from '../../auth/authService';
import { MENU_ITEMS } from '../../constants';
import { marketData, marketCategories } from '../../data/marketData';
import { scheduleData } from '../../data/infographicsData';

declare global {
    interface Window {
        html2canvas: any;
    }
}

interface DashboardTabProps {
    currentUser: SessionUser;
    setActiveTab: (tab: TabKey) => void;
    setActiveModal: (modal: ModalKey) => void;
}

const CatalogAnalytics: React.FC = () => {
    const analyticsData = useMemo(() => {
        const data = marketCategories.map(category => ({
            name: category,
            count: marketData[category]?.length || 0,
        })).sort((a, b) => b.count - a.count);
        
        const totalItems = data.reduce((sum, item) => sum + item.count, 0);
        const maxCount = Math.max(...data.map(item => item.count));

        return { data, totalItems, maxCount };
    }, []);

    const barColors = ['bg-orange-500', 'bg-orange-400', 'bg-blue-500', 'bg-blue-400', 'bg-gray-400'];

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-1">Catalog at a Glance</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">A summary of all items available in the procurement catalog.</p>
            <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-2/3 space-y-3 pr-4">
                    {analyticsData.data.slice(0, 5).map((item, index) => (
                        <div key={item.name} className="flex items-center gap-3 group">
                            <div className="w-2/5 text-xs font-semibold text-gray-600 dark:text-gray-300 truncate text-right">{item.name}</div>
                            <div className="w-3/5 bg-gray-200 dark:bg-gray-700 rounded-full h-5 overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ease-out flex items-center justify-end pr-2 ${barColors[index % barColors.length]} bar-chart-bar`}
                                    style={{ width: `${(item.count / analyticsData.maxCount) * 100}%` }}
                                >
                                    <span className="text-white text-xs font-bold">{item.count}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="w-full md:w-1/3 flex flex-col justify-center items-center bg-orange-50 dark:bg-gray-700/50 p-4 rounded-lg border border-orange-200 dark:border-gray-600">
                    <p className="text-5xl font-extrabold text-orange-600 dark:text-orange-400">{analyticsData.totalItems.toLocaleString()}</p>
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 mt-1">Total Catalog Items</p>
                    <hr className="w-1/2 my-3 border-orange-200 dark:border-gray-600" />
                    <p className="text-3xl font-bold text-orange-500 dark:text-orange-400">{analyticsData.data.length}</p>
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">Categories</p>
                </div>
            </div>
        </div>
    );
};

const ProcurementSchedule: React.FC = () => {
    const scheduleRef = useRef<HTMLDivElement>(null);
    const allActivities = useMemo(() => scheduleData, []);

    // FIX: Define type for grouped activity to resolve type errors.
    type GroupedActivity = {
        activity: string;
        time: string;
        projects: { title: string; endUser: string; abc: number }[];
        dates: Date[];
        dateDisplay: string;
        sortDate: Date;
    };

    const groupedSchedule = useMemo(() => {
        const grouped = allActivities.reduce((acc, current) => {
            const key = `${current.date.toISOString().split('T')[0]}_${current.activity}`;
            if (!acc[key]) {
                acc[key] = {
                    activity: current.activity,
                    time: current.time,
                    projects: [],
                    dates: []
                };
            }
            acc[key].projects.push({ title: current.title, endUser: current.endUser, abc: current.abc });
            acc[key].dates.push(current.date);
            return acc;
        }, {} as Record<string, Omit<GroupedActivity, 'dateDisplay' | 'sortDate'>>);

        return Object.values(grouped).map((group: Omit<GroupedActivity, 'dateDisplay' | 'sortDate'>): GroupedActivity => {
            const minDate = new Date(Math.min(...group.dates.map(d => d.getTime())));
            
            const formatDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();

            let dateDisplay = formatDate(minDate);
            return { ...group, dateDisplay, sortDate: minDate };
        }).sort((a,b) => a.sortDate.getTime() - b.sortDate.getTime());

    }, [allActivities]);

    const currencyFormatter = new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
    });

    const handlePrint = () => {
        const scheduleElement = scheduleRef.current;
        if (!scheduleElement) return;
        
        const printContainer = document.createElement('div');
        printContainer.className = 'printable-content';

        const contentToPrint = scheduleElement.cloneNode(true) as HTMLElement;
        contentToPrint.querySelector('.no-print-section')?.remove();
        
        printContainer.appendChild(contentToPrint);
        document.body.appendChild(printContainer);
        document.body.classList.add('is-printing');

        const onAfterPrint = () => {
            document.body.classList.remove('is-printing');
            document.body.removeChild(printContainer);
            window.removeEventListener('afterprint', onAfterPrint);
        };
        window.addEventListener('afterprint', onAfterPrint, { once: true });
        
        setTimeout(() => window.print(), 100);
    };

    const handleExportImage = () => {
        const scheduleElement = scheduleRef.current;
        if (scheduleElement && window.html2canvas) {
            const buttons = scheduleElement.querySelector('.no-print-section') as HTMLElement;
            if (buttons) buttons.style.display = 'none';

            window.html2canvas(scheduleElement, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff',
            }).then((canvas: HTMLCanvasElement) => {
                const link = document.createElement('a');
                link.download = 'bac-procurement-schedule.png';
                link.href = canvas.toDataURL('image/png');
                link.click();
            }).catch(err => {
                console.error("Error exporting image: ", err);
            }).finally(() => {
                if (buttons) buttons.style.display = 'flex';
            });
        }
    };

    return (
        <div ref={scheduleRef} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">BAC Schedule of Procurement Activities</h3>
                <div className="no-print-section flex items-center gap-2">
                    <button onClick={handlePrint} className="btn text-sm bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1.5 px-3 rounded-md flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm7-8V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                        Print
                    </button>
                    <button onClick={handleExportImage} className="btn text-sm bg-green-500 hover:bg-green-600 text-white font-semibold py-1.5 px-3 rounded-md flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        Export Image
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                <table className="min-w-full">
                    <thead className="bg-gray-100 dark:bg-gray-700">
                        <tr>
                            <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase p-3 w-1/3">Schedule</th>
                            <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase p-3">Project Title & End User</th>
                            <th className="text-right text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase p-3 w-48">ABC</th>
                        </tr>
                    </thead>
                    {groupedSchedule.map((group) => (
                        <tbody key={group.dateDisplay + group.activity} className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {group.projects.map((project, projectIndex) => (
                                <tr key={projectIndex}>
                                    {projectIndex === 0 && (
                                        <td rowSpan={group.projects.length} className="p-3 align-top border-r dark:border-gray-700">
                                            <h4 className="font-bold text-base text-orange-600 dark:text-orange-400">{group.activity}</h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-300 font-semibold">{group.dateDisplay} @ {group.time}</p>
                                        </td>
                                    )}
                                    <td className="p-3 align-top">
                                        <p className="font-medium text-sm text-gray-800 dark:text-gray-100">{project.title}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{project.endUser}</p>
                                    </td>
                                    <td className="p-3 align-top text-right font-mono text-sm font-semibold text-gray-700 dark:text-gray-200">
                                        {currencyFormatter.format(project.abc).replace('₱', 'P ')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    ))}
                </table>
            </div>
        </div>
    );
};


const DashboardTab: React.FC<DashboardTabProps> = ({ currentUser, setActiveTab, setActiveModal }) => {
    
    const toolSections = useMemo(() => {
        const sections: { title: string; items: MenuItem[] }[] = [];
        let currentSection: { title: string; items: MenuItem[] } | null = null;

        const visibleItems = currentUser.role === 'admin' 
            ? MENU_ITEMS 
            : MENU_ITEMS.filter(item => !item.adminOnly);

        for (const item of visibleItems) {
            if (item.isHeader) {
                if (currentSection) sections.push(currentSection);
                currentSection = { title: item.label, items: [] };
            } else if (currentSection && item.id !== 'dashboard') {
                currentSection.items.push(item);
            }
        }
        if (currentSection) sections.push(currentSection);
        
        return sections;
    }, [currentUser]);
    
    const handleCardClick = (item: MenuItem) => {
        if (item.id === 'bac-analytics') {
            setActiveModal('analytics');
        } else if (item.id === 'catalog') {
            setActiveModal('catalog');
        } else if (item.id === 'qr-maker') {
            setActiveModal('qr-maker');
        } else if (item.id === 'email-composer') {
            setActiveModal('email-composer');
        } else if (item.id === 'ppmp-consolidator') {
            setActiveModal('ppmp-consolidator');
        } else {
            setActiveTab(item.id as TabKey);
        }
    };

    return (
        <div className="space-y-8">
            <div className="bg-orange-500 text-white p-6 rounded-2xl shadow-lg">
                <h2 className="text-3xl font-extrabold">Welcome back, {currentUser.fullName.split(' ')[0]}!</h2>
                <p className="opacity-90 mt-1">Your central hub for efficient and transparent procurement is ready.</p>
            </div>

            <ProcurementSchedule />
            <CatalogAnalytics />
            
            {currentUser.role === 'admin' && toolSections.map(section => (
                <div key={section.title}>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 pb-2 border-b-2 border-orange-200 dark:border-gray-700">{section.title}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {section.items.map(item => (
                            <button 
                                key={item.id}
                                onClick={() => handleCardClick(item)}
                                className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:border-orange-500 dark:hover:border-orange-400 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-in-out text-left flex items-start space-x-4"
                            >
                                <div className="flex-shrink-0 w-10 h-10 text-orange-500 dark:text-orange-400 bg-orange-50 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                    {item.icon}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-800 dark:text-gray-100 text-base">{item.label}</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.description}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default DashboardTab;
