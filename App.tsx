
import React, { useState, useEffect } from 'react';
import { TabKey, ModalKey, NonNullableModalKey } from './types';
import { MENU_ITEMS } from './constants';
import { authService, SessionUser } from './auth/authService';

import Header from './components/Header';
import Navbar from './components/Sidebar'; // Renamed to Navbar conceptually
import Footer from './components/Footer';
import Login from './components/Login';
import DashboardTab from './components/tabs/DashboardTab';
import ModeAdvisorTab from './components/tabs/ModeAdvisorTab';
import MarketScopingTab from './components/tabs/MarketScopingTab';
import ProcurementPlanningTab from './components/tabs/ProcurementPlanningTab';
import ProcessFlowTab from './components/tabs/ProcessFlowTab';
import TimelineCalculatorTab from './components/tabs/TimelineCalculatorTab';
import ChecklistsTab from './components/tabs/ChecklistsTab';
import SpecialAgreementsTab from './components/tabs/SpecialAgreementsTab';
import AIDocumentComparatorTab from './components/tabs/AIDocumentComparatorTab';
import AIDocumentAuditorTab from './components/tabs/AIDocumentAuditorTab';
import PostGeneratorTab from './components/tabs/PostGeneratorTab';
import DocumentGeneratorTab from './components/tabs/DocumentGeneratorTab';
import SocialMediaTriviaTab from './components/tabs/SocialMediaTriviaTab';
import WebVideoScraperTab from './components/tabs/WebVideoScraperTab';
import PPMPExporterTab from './components/tabs/PPMPExporterTab';
import RFQGeneratorTab from './components/tabs/RFQGeneratorTab';
import QRCodeMakerTab from './components/tabs/QRCodeMakerTab';
import { CatalogTab } from './components/tabs/CatalogTab';
import BacAnalyticsTab from './components/tabs/BacAnalyticsTab';
import AIAssistant from './components/AIAssistant';
import PPMPGeneratorTab from './components/tabs/PPMPGeneratorTab';
import AccountTab from './components/tabs/AccountTab';
import UserManagementTab from './components/tabs/UserManagementTab';
import EmailComposerTab from './components/tabs/EmailComposerTab';
import DownloadableFormsTab from './components/tabs/DownloadableFormsTab';
import SpecificationGeneratorTab from './components/tabs/SpecificationGeneratorTab';
import PdfToImageTab from './components/tabs/PdfToImageTab';
import PpmpConsolidatorTab from './components/tabs/PpmpConsolidatorTab';
import ChangelogModal from './components/ChangelogModal';
import ItemCatalogAssistantTab from './components/tabs/ItemCatalogAssistantTab';
import InfographicsTab from './components/tabs/InfographicsTab';


const App: React.FC = () => {
    const getInitialTab = (user: SessionUser | null): TabKey => {
        if (user && user.role === 'user') {
            if (user.allowedTabs !== 'all' && user.allowedTabs.length > 0) {
                return user.allowedTabs[0];
            }
            return 'account'; // Fallback for user role
        }
        return 'dashboard'; // Default for admin or when not logged in
    };
    
    const [currentUser, setCurrentUser] = useState<SessionUser | null>(() => authService.getCurrentUser());
    const [activeTab, setActiveTab] = useState<TabKey>(() => getInitialTab(currentUser));
    const [activeModal, setActiveModal] = useState<ModalKey>(null);
    const [isShareView, setIsShareView] = useState(false);
    
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('share') === 'catalog') {
            setIsShareView(true);
        }
    }, []);

    const handleLoginSuccess = (user: SessionUser) => {
        setCurrentUser(user);
        setActiveTab(getInitialTab(user));
    };

    const handleLogout = () => {
        authService.logout();
        setCurrentUser(null);
    };

    const renderContent = () => {
        const TAB_MAP: { [key in TabKey]?: JSX.Element | null } = {
            'dashboard': <DashboardTab setActiveTab={setActiveTab} setActiveModal={setActiveModal} currentUser={currentUser!} />,
            'advisor': <ModeAdvisorTab />,
            'scoping': <MarketScopingTab />,
            'planning': <ProcurementPlanningTab />,
            'ppmp-generator': <PPMPGeneratorTab />,
            'flow': <ProcessFlowTab />,
            'timeline-calc': <TimelineCalculatorTab />,
            'checklist': <ChecklistsTab />,
            'agreements': <SpecialAgreementsTab />,
            'downloadable-forms': <DownloadableFormsTab />,
            'resolution-generator': <DocumentGeneratorTab />,
            'comparator': <AIDocumentComparatorTab />,
            'auditor': <AIDocumentAuditorTab />,
            'item-catalog-assistant': <ItemCatalogAssistantTab />,
            'specification-generator': <SpecificationGeneratorTab />,
            'post-generator': <PostGeneratorTab />,
            'rfq-generator': <RFQGeneratorTab />,
            'trivia-generator': <SocialMediaTriviaTab />,
            'web-scraper': <WebVideoScraperTab />,
            'ppmp-exporter': <PPMPExporterTab />,
            'pdf-to-image': <PdfToImageTab />,
            'account': currentUser ? <AccountTab user={currentUser} onLogout={handleLogout} /> : null,
            'user-management': <UserManagementTab />,
        };

        return TAB_MAP[activeTab] ?? <DashboardTab setActiveTab={setActiveTab} setActiveModal={setActiveModal} currentUser={currentUser!} />;
    };
    
    const renderModals = () => {
        if (!activeModal) return null;

        const commonProps = { onClose: () => setActiveModal(null) };
        const MODAL_MAP: { [key in NonNullableModalKey]: JSX.Element } = {
            'analytics': <BacAnalyticsTab isVisible={true} {...commonProps} />,
            'catalog': <CatalogTab isVisible={true} {...commonProps} />,
            'qr-maker': <QRCodeMakerTab isVisible={true} {...commonProps} />,
            'email-composer': <EmailComposerTab isVisible={true} {...commonProps} />,
            'ppmp-consolidator': <PpmpConsolidatorTab isVisible={true} {...commonProps} />,
            'changelog': <ChangelogModal isVisible={true} {...commonProps} />,
            'infographics': <InfographicsTab isVisible={true} {...commonProps} />,
        };
        
        return MODAL_MAP[activeModal] ?? null;
    };

    if (isShareView) {
        return (
            <div className="p-4 sm:p-6 min-h-screen bg-gray-50 flex flex-col">
                <CatalogTab isVisible={true} onClose={() => {}} isShared={true} />
            </div>
        );
    }
    
    if (!currentUser) {
        return <Login onLoginSuccess={handleLoginSuccess} />;
    }

    return (
        <div className="p-2 sm:p-6 min-h-screen flex flex-col">
            <div className="container mx-auto max-w-7xl flex flex-col flex-1">
                <Header />
                 <div className="flex flex-col flex-1">
                    <Navbar
                        currentUser={currentUser}
                        menuItems={MENU_ITEMS}
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        setActiveModal={setActiveModal}
                    />
                    <main className="flex-1 mt-4 lg:mt-8">
                        <div id="tab-content" className="content-card">
                            {renderContent()}
                        </div>
                    </main>
                </div>
                <Footer setActiveModal={setActiveModal} />
            </div>
            {renderModals()}
            <AIAssistant />
        </div>
    );
};

export default App;
