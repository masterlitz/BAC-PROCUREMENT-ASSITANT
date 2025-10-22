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
import { AIDocumentComparatorTab } from './components/tabs/AIDocumentComparatorTab';
import { AIDocumentAuditorTab } from './components/tabs/AIDocumentAuditorTab';
import PostGeneratorTab from './components/tabs/PostGeneratorTab';
// FIX: Changed import to a named import to resolve the "no default export" error. This is a common issue when module bundlers get confused or when a component is refactored from a default to a named export.
import { DocumentGeneratorTab } from './components/tabs/DocumentGeneratorTab';
import SocialMediaTriviaTab from './components/tabs/SocialMediaTriviaTab';
import WebVideoScraperTab from './components/tabs/WebVideoScraperTab';
import PPMPExporterTab from './components/tabs/PPMPExporterTab';
import RFQGeneratorTab from './components/tabs/RFQGeneratorTab';
import QRCodeMakerTab from './components/tabs/QRCodeMakerTab';
import { CatalogTab } from './components/tabs/CatalogTab';
import BacAnalyticsTab from './components/tabs/BacAnalyticsTab';
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
import AIContractAuditorTab from './components/tabs/AIContractAuditorTab';
import SupplierPerformanceTab from './components/tabs/SupplierPerformanceTab';
import DirectoryTab from './components/tabs/DirectoryTab';
import CatalogTutorialTab from './components/tabs/CatalogTutorialTab';
import LitzAITab from './components/tabs/LitzAITab';
import FloatingAIAvatar from './components/FloatingAIAvatar';
import SystemAuditorTab from './components/tabs/SystemAuditorTab';


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
    const [startCatalogMaximized, setStartCatalogMaximized] = useState(false);
    const [shareView, setShareView] = useState<string | null>(null);
    const [showLoginInfographics, setShowLoginInfographics] = useState(true);
    const [isLitzAiOpen, setIsLitzAiOpen] = useState(false);
    const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(() => {
        const storedTheme = localStorage.getItem('theme');
        return storedTheme ? storedTheme as 'light' | 'dark' | 'system' : 'system';
    });

    useEffect(() => {
        const root = window.document.documentElement;
        const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        
        root.classList.toggle('dark', isDark);
        localStorage.setItem('theme', theme);
    }, [theme]);
    
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            if (theme === 'system') {
                const root = window.document.documentElement;
                root.classList.toggle('dark', mediaQuery.matches);
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme]);
    
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const shareParam = params.get('share');
        if (shareParam === 'catalog' || shareParam === 'infographics') {
            setShareView(shareParam);
        }
    }, []);

    const handleLoginSuccess = (user: SessionUser) => {
        setCurrentUser(user);
        setActiveTab(getInitialTab(user));
        setShowLoginInfographics(false);
    };

    const handleLogout = () => {
        authService.logout();
        setCurrentUser(null);
        setShowLoginInfographics(true);
    };

    const renderContent = () => {
        // FIX: Replaced JSX.Element with React.ReactElement to resolve "Cannot find namespace 'JSX'" error.
        const TAB_MAP: { [key in TabKey]?: React.ReactElement | null } = {
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
            'directory': <DirectoryTab />,
            'catalog-tutorial': <CatalogTutorialTab />,
            'resolution-generator': <DocumentGeneratorTab />,
            'comparator': <AIDocumentComparatorTab />,
            'auditor': <AIDocumentAuditorTab />,
            'contract-auditor': <AIContractAuditorTab />,
            'item-catalog-assistant': <ItemCatalogAssistantTab />,
            'specification-generator': <SpecificationGeneratorTab />,
            'post-generator': <PostGeneratorTab />,
            'rfq-generator': <RFQGeneratorTab />,
            'trivia-generator': <SocialMediaTriviaTab />,
            'web-scraper': <WebVideoScraperTab />,
            'ppmp-exporter': <PPMPExporterTab />,
            'pdf-to-image': <PdfToImageTab />,
            'supplier-performance': <SupplierPerformanceTab />,
            'account': currentUser ? <AccountTab user={currentUser} onLogout={handleLogout} setActiveModal={setActiveModal} /> : null,
            'user-management': <UserManagementTab />,
        };

        return TAB_MAP[activeTab] ?? <DashboardTab setActiveTab={setActiveTab} setActiveModal={setActiveModal} currentUser={currentUser!} />;
    };
    
    const renderModals = () => {
        if (!activeModal) return null;

        const commonProps = { 
            onClose: () => {
                setActiveModal(null);
                setStartCatalogMaximized(false); // Reset the maximization trigger on close
            } 
        };
        // FIX: Replaced JSX.Element with React.ReactElement to resolve "Cannot find namespace 'JSX'" error.
        const MODAL_MAP: { [key in NonNullableModalKey]: React.ReactElement } = {
            'analytics': <BacAnalyticsTab isVisible={true} {...commonProps} />,
            'catalog': <CatalogTab isVisible={true} {...commonProps} startMaximized={startCatalogMaximized} currentUser={currentUser!} />,
            'qr-maker': <QRCodeMakerTab isVisible={true} {...commonProps} />,
            'email-composer': <EmailComposerTab isVisible={true} {...commonProps} />,
            'ppmp-consolidator': <PpmpConsolidatorTab isVisible={true} {...commonProps} />,
            'changelog': <ChangelogModal isVisible={true} {...commonProps} />,
            'infographics': <InfographicsTab isVisible={true} {...commonProps} />,
            'system-auditor': <SystemAuditorTab isVisible={true} {...commonProps} />,
        };
        
        return MODAL_MAP[activeModal] ?? null;
    };

    if (shareView === 'catalog') {
        return (
            <div className="p-4 sm:p-6 min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
                <CatalogTab isVisible={true} onClose={() => {}} isShared={true} />
            </div>
        );
    }

    if (shareView === 'infographics') {
        return (
            <>
                <InfographicsTab isVisible={true} onClose={() => setShareView(null)} isPublicView={true} />
                <FloatingAIAvatar onOpen={() => setIsLitzAiOpen(true)} />
                {isLitzAiOpen && <LitzAITab isVisible={isLitzAiOpen} onClose={() => setIsLitzAiOpen(false)} currentUser={currentUser} setActiveTab={setActiveTab} setActiveModal={setActiveModal}/>}
            </>
        );
    }
    
    if (!currentUser) {
        return (
            <div className="bg-gray-100 dark:bg-gray-900 min-h-screen">
                {showLoginInfographics && <InfographicsTab isVisible={true} onClose={() => setShowLoginInfographics(false)} isPublicView={true} />}
                <Login onLoginSuccess={handleLoginSuccess} onShowPublicView={() => setShowLoginInfographics(true)} />
                <FloatingAIAvatar onOpen={() => setIsLitzAiOpen(true)} />
                {isLitzAiOpen && <LitzAITab isVisible={isLitzAiOpen} onClose={() => setIsLitzAiOpen(false)} currentUser={currentUser} setActiveTab={setActiveTab} setActiveModal={setActiveModal}/>}
            </div>
        );
    }

    return (
        <div className="p-2 sm:p-6 min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
            <div className="container mx-auto max-w-7xl flex flex-col flex-1">
                <Header />
                 <div className="flex flex-col flex-1">
                    <Navbar
                        currentUser={currentUser}
                        menuItems={MENU_ITEMS}
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        setActiveModal={setActiveModal}
                        setStartCatalogMaximized={setStartCatalogMaximized}
                    />
                    <main className="flex-1 mt-4 lg:mt-8">
                        <div id="tab-content" className="content-card">
                            {renderContent()}
                        </div>
                    </main>
                </div>
                <Footer setActiveModal={setActiveModal} theme={theme} setTheme={setTheme} />
            </div>
            {renderModals()}
            <FloatingAIAvatar onOpen={() => setIsLitzAiOpen(true)} />
            {isLitzAiOpen && <LitzAITab isVisible={isLitzAiOpen} onClose={() => setIsLitzAiOpen(false)} currentUser={currentUser} setActiveTab={setActiveTab} setActiveModal={setActiveModal}/>}
        </div>
    );
};

export default App;