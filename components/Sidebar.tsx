
import React, { useMemo, useState, useRef, useEffect } from 'react';
import { MenuItem, TabKey, ModalKey } from '../types';
import { SessionUser } from '../auth/authService';

interface NavbarProps {
    currentUser: SessionUser;
    menuItems: MenuItem[];
    activeTab: TabKey;
    setActiveTab: (tab: TabKey) => void;
    setActiveModal: (modal: ModalKey) => void;
    setStartCatalogMaximized: (isMax: boolean) => void;
}

interface MenuGroup {
    header: MenuItem;
    items: MenuItem[];
}

const Navbar: React.FC<NavbarProps> = ({ currentUser, menuItems, activeTab, setActiveTab, setActiveModal, setStartCatalogMaximized }) => {
    
    const [openMenu, setOpenMenu] = useState<string | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const navbarRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (navbarRef.current && !navbarRef.current.contains(event.target as Node)) {
                setOpenMenu(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);


    const visibleMenuItems = useMemo(() => {
        const accountMenu: MenuItem[] = [
            { isHeader: true, id: 'header-account', label: 'Account' },
            {
                id: 'account',
                label: 'My Account',
                icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
                description: "View your account details and log out."
            }
        ];

        const roleFilteredItems = currentUser.role === 'admin'
            ? menuItems
            : menuItems.filter(item => !item.adminOnly);

        if (currentUser.allowedTabs === 'all') {
            return [...roleFilteredItems, ...accountMenu];
        }

        const isAllowed = (id: string) => currentUser.allowedTabs.includes(id as TabKey);

        const result: MenuItem[] = [];
        for (let i = 0; i < roleFilteredItems.length; i++) {
            const item = roleFilteredItems[i];
            if (item.isHeader) {
                let hasVisibleChild = false;
                for (let j = i + 1; j < roleFilteredItems.length; j++) {
                    const nextItem = roleFilteredItems[j];
                    if (nextItem.isHeader) break;
                    if (isAllowed(nextItem.id)) {
                        hasVisibleChild = true;
                        break;
                    }
                }
                if (hasVisibleChild) {
                    result.push(item);
                }
            } else {
                if (isAllowed(item.id)) {
                    result.push(item);
                }
            }
        }
        return [...result, ...accountMenu];
    }, [currentUser, menuItems]);

    const { mainGroups, accountGroup } = useMemo(() => {
        const groups: MenuGroup[] = [];
        let currentGroup: MenuGroup | null = null;
        visibleMenuItems.forEach(item => {
            if (item.isHeader) {
                if (currentGroup) groups.push(currentGroup);
                currentGroup = { header: item, items: [] };
            } else if (currentGroup) {
                currentGroup.items.push(item);
            }
        });
        if (currentGroup) groups.push(currentGroup);
        
        const main = groups.filter(g => g.header.id !== 'header-account');
        const account = groups.find(g => g.header.id === 'header-account');

        return { mainGroups: main, accountGroup: account };
    }, [visibleMenuItems]);

    const handleItemClick = (item: MenuItem) => {
        const modals: { [key: string]: ModalKey } = {
            'bac-analytics': 'analytics', 'catalog': 'catalog', 'qr-maker': 'qr-maker',
            'email-composer': 'email-composer', 'ppmp-consolidator': 'ppmp-consolidator',
            'infographics': 'infographics'
        };

        if (modals[item.id]) {
            setActiveModal(modals[item.id]);
        } else {
            setActiveTab(item.id as TabKey);
        }
        setOpenMenu(null);
        setIsMobileMenuOpen(false);
    };
    
    const handleItemHover = (item: MenuItem) => {
        if (item.id === 'catalog') {
            setStartCatalogMaximized(true);
        }
    };

    const DropdownItem: React.FC<{ 
        item: MenuItem; 
        activeTab: TabKey; 
        onClick: (item: MenuItem) => void;
        onHover: (item: MenuItem) => void;
        style?: React.CSSProperties;
    }> = ({ item, activeTab, onClick, onHover, style }) => {
        const isFloatingButton = ['bac-analytics', 'catalog', 'qr-maker', 'email-composer', 'ppmp-consolidator', 'infographics'].includes(item.id);
        const isActive = activeTab === item.id && !isFloatingButton;
        return (
            <button 
                onClick={() => onClick(item)} 
                onMouseEnter={() => onHover(item)}
                className={`dropdown-item ${isActive ? 'active' : ''}`} 
                role="menuitem"
                style={style}
            >
                <div className="dropdown-item-icon">{item.icon}</div>
                <div className="dropdown-item-text-container">
                    <span className="dropdown-item-label">{item.label}</span>
                    <span className="dropdown-item-description">{item.description}</span>
                </div>
            </button>
        );
    };
    
    const NavMenuContent: React.FC<{isMobile: boolean}> = ({ isMobile }) => {
        const activeGroup = mainGroups.find(group => group.items.some(item => item.id === activeTab));
        const classes = isMobile ? "flex flex-col space-y-2" : "flex justify-between items-center w-full";
        return (
            <div className={classes}>
                <div className={isMobile ? "flex flex-col space-y-1" : "flex items-center"}>
                    {mainGroups.map((group) => (
                        <div key={group.header.id} className={isMobile ? "" : "nav-item"}>
                            <button
                                onClick={() => setOpenMenu(prev => prev === group.header.id ? null : group.header.id)}
                                className={`nav-button ${activeGroup?.header.id === group.header.id ? 'active' : ''}`}
                                aria-haspopup="true"
                                aria-expanded={openMenu === group.header.id}
                            >
                                {group.header.label}
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transition-transform" style={{ transform: openMenu === group.header.id ? 'rotate(180deg)' : 'rotate(0deg)'}} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                            </button>
                            {(openMenu === group.header.id || isMobile) && (
                                <div className={isMobile ? "pl-4" : "dropdown-menu"}>
                                    {group.items.map((item, index) => (
                                        <DropdownItem key={item.id} item={item} activeTab={activeTab} onClick={handleItemClick} onHover={handleItemHover} style={{ animationDelay: `${index * 0.03}s` }}/>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                 {accountGroup && (
                    <div className={isMobile ? "border-t pt-2 mt-2" : "nav-item"}>
                        <button
                            onClick={() => setOpenMenu(prev => prev === accountGroup.header.id ? null : accountGroup.header.id)}
                            className="nav-button"
                            aria-haspopup="true"
                            aria-expanded={openMenu === accountGroup.header.id}
                        >
                            {accountGroup.header.label}
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transition-transform"  style={{ transform: openMenu === accountGroup.header.id ? 'rotate(180deg)' : 'rotate(0deg)'}} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                        </button>
                        {(openMenu === accountGroup.header.id || isMobile) && (
                            <div className={isMobile ? "pl-4" : "dropdown-menu dropdown-menu-right"}>
                                {accountGroup.items.map((item, index) => (
                                    <DropdownItem key={item.id} item={item} activeTab={activeTab} onClick={handleItemClick} onHover={() => {}} style={{ animationDelay: `${index * 0.03}s` }} />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    }

    return (
        <header ref={navbarRef} className={`navbar ${isScrolled ? 'navbar-scrolled' : ''}`}>
            <div className="navbar-menu hidden lg:flex w-full">
                <NavMenuContent isMobile={false} />
            </div>
            <div className="mobile-nav-toggle lg:hidden">
                 <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
                </button>
            </div>
            {isMobileMenuOpen && (
                <div className="mobile-nav-menu" onClick={() => setIsMobileMenuOpen(false)}>
                    <div className="mobile-nav-content" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center pb-4 mb-4 border-b">
                            <h2 className="font-bold text-lg text-gray-800">Menu</h2>
                            <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-500 hover:text-gray-800 text-2xl leading-none">&times;</button>
                        </div>
                        <NavMenuContent isMobile={true} />
                    </div>
                </div>
            )}
        </header>
    );
};

export default Navbar;