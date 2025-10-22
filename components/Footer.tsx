
import React from 'react';
import { ModalKey } from '../types';
import { CHANGELOG_DATA } from '../constants';

interface FooterProps {
    setActiveModal: (modal: ModalKey) => void;
    theme: 'light' | 'dark' | 'system';
    setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

const Footer: React.FC<FooterProps> = ({ setActiveModal, theme, setTheme }) => {
    const latestVersion = CHANGELOG_DATA[0]?.version || '3.8';
    
    // Icons
    const LocationIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 text-orange-500 dark:text-orange-400 flex-shrink-0 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
    const PhoneIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 text-orange-500 dark:text-orange-400 flex-shrink-0 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>;
    const EmailIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 text-orange-500 dark:text-orange-400 flex-shrink-0 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;

    const feedbackFormUrl = 'https://forms.hive.com/?formId=dEqfsaS8nici4rZiQ';
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(feedbackFormUrl)}&bgcolor=ffffff&color=000000&qzone=1`;

    return (
        <footer className="mt-16 pt-8 border-t border-orange-200 dark:border-gray-700">
             <div className="max-w-6xl mx-auto mb-10">
                <div className="p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 grid grid-cols-1 lg:grid-cols-3 items-center gap-8">
                    {/* Column 1: Address */}
                    <div className="flex items-center space-x-4">
                        <LocationIcon />
                        <div className="text-left">
                            <strong className="font-bold text-base block text-gray-800 dark:text-gray-100">Address</strong>
                            <p className="text-gray-600 dark:text-gray-300 text-sm">3rd Flr, Masskara Hall, BCGC, Villamonte</p>
                        </div>
                    </div>
                    {/* Column 2: Contact */}
                    <div className="flex flex-col space-y-6 py-4 lg:py-0 lg:px-8 lg:border-l lg:border-r border-gray-200 dark:border-gray-600">
                        <div className="flex items-center space-x-4">
                            <PhoneIcon />
                            <div className="text-left">
                                <strong className="font-bold text-base block text-gray-800 dark:text-gray-100">Mobile</strong>
                                <p className="text-gray-600 dark:text-gray-300 text-sm">09486268509</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <EmailIcon />
                            <div className="text-left">
                                <strong className="font-bold text-base block text-gray-800 dark:text-gray-100">E-mail</strong>
                                <p className="text-gray-600 dark:text-gray-300 text-sm">bac@bacolodcity.gov.ph</p>
                            </div>
                        </div>
                    </div>
                    {/* Column 3: QR Code */}
                    <div className="flex items-center space-x-4 justify-center lg:justify-start lg:pl-8">
                        <img src={qrCodeUrl} alt="Feedback QR" className="h-[90px] w-[90px] rounded-lg flex-shrink-0" />
                        <div className="text-sm text-left">
                            <p className="font-bold text-lg text-gray-800 dark:text-gray-100 leading-tight">BACOLOD CITY</p>
                            <p className="font-semibold text-base text-orange-600 dark:text-orange-400 leading-tight">Bids and Awards Committee</p>
                            <a href={feedbackFormUrl} target="_blank" rel="noopener noreferrer" className="mt-1.5 block underline text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400">Scan QR for Feedback</a>
                        </div>
                    </div>
                </div>
            </div>
            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                <p>&copy; 2025 by <a href="https://www.facebook.com/tamis.litz" target="_blank" rel="noopener noreferrer" className="text-orange-600 dark:text-orange-400 hover:underline">Lito Garin</a> | Bids and Awards Committee Bacolod. All Rights Reserved.</p>
                <p className="mt-2">
                    <a href="https://www.facebook.com/profile.php?id=61577834145424" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-1.5c-1 0-1.5.5-1.5 1.5V12h3l-.5 3h-2.5v6.8A10 10 0 0 0 22 12z"/></svg>
                        Follow us on Facebook
                    </a>
                </p>
                <div className="mt-4 flex justify-center items-center gap-4">
                    <button 
                        onClick={() => setActiveModal('changelog')}
                        className="text-gray-500 hover:text-orange-600 hover:underline font-semibold dark:text-gray-400 dark:hover:text-orange-400"
                    >
                        Changelog & App Updates (v{latestVersion})
                    </button>
                    {/* Theme switcher */}
                    <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-full border dark:border-gray-700">
                        <button onClick={() => setTheme('light')} className={`p-1.5 rounded-full text-sm transition-colors ${theme === 'light' ? 'bg-white text-orange-500 shadow' : 'text-gray-500 hover:bg-gray-200'}`} title="Light Mode">☀️</button>
                        <button onClick={() => setTheme('dark')} className={`p-1.5 rounded-full text-sm transition-colors ${theme === 'dark' ? 'bg-blue-950 text-yellow-300 shadow' : 'text-gray-500 hover:bg-gray-200'}`} title="Dark Mode">🌙</button>
                        <button onClick={() => setTheme('system')} className={`p-1.5 rounded-full text-sm transition-colors ${theme === 'system' ? 'bg-white dark:bg-gray-600 shadow' : 'text-gray-500 hover:bg-gray-200'}`} title="System Default">💻</button>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;