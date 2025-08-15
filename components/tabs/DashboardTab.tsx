import React, { useMemo } from 'react';
import { TabKey, MenuItem, ModalKey } from '../../types';
import { SessionUser } from '../../auth/authService';
import { MENU_ITEMS } from '../../constants';
import { marketData, marketCategories } from '../../data/marketData';

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
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-1">Catalog at a Glance</h3>
            <p className="text-sm text-gray-500 mb-4">A summary of all items available in the procurement catalog.</p>
            <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-2/3 space-y-3 pr-4">
                    {analyticsData.data.slice(0, 5).map((item, index) => (
                        <div key={item.name} className="flex items-center gap-3 group">
                            <div className="w-2/5 text-xs font-semibold text-gray-600 truncate text-right">{item.name}</div>
                            <div className="w-3/5 bg-gray-200 rounded-full h-5 overflow-hidden">
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
                <div className="w-full md:w-1/3 flex flex-col justify-center items-center bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <p className="text-5xl font-extrabold text-orange-600">{analyticsData.totalItems.toLocaleString()}</p>
                    <p className="text-sm font-semibold text-gray-600 mt-1">Total Catalog Items</p>
                    <hr className="w-1/2 my-3 border-orange-200" />
                    <p className="text-3xl font-bold text-orange-500">{analyticsData.data.length}</p>
                    <p className="text-sm font-semibold text-gray-600">Categories</p>
                </div>
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

            <CatalogAnalytics />
            
            {currentUser.role === 'admin' && toolSections.map(section => (
                <div key={section.title}>
                    <h3 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-orange-200">{section.title}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {section.items.map(item => (
                            <button 
                                key={item.id}
                                onClick={() => handleCardClick(item)}
                                className="bg-white p-5 rounded-xl shadow-lg border border-gray-200 hover:border-orange-500 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-in-out text-left flex items-start space-x-4"
                            >
                                <div className="flex-shrink-0 w-10 h-10 text-orange-500 bg-orange-50 rounded-lg flex items-center justify-center">
                                    {item.icon}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-800 text-base">{item.label}</h4>
                                    <p className="text-xs text-gray-500 mt-1">{item.description}</p>
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