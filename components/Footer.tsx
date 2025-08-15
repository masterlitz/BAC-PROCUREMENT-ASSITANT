
import React from 'react';
import { ModalKey } from '../types';

interface FooterProps {
    setActiveModal: (modal: ModalKey) => void;
}

const Footer: React.FC<FooterProps> = ({ setActiveModal }) => {
    // Icons
    const LocationIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 text-orange-500 flex-shrink-0 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
    const PhoneIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 text-orange-500 flex-shrink-0 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>;
    const EmailIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 text-orange-500 flex-shrink-0 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;

    const feedbackFormUrl = 'https://forms.hive.com/?formId=dEqfsaS8nici4rZiQ';
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(feedbackFormUrl)}&bgcolor=ffffff&color=000000&qzone=1`;

    return (
        <footer className="mt-16 pt-8 border-t border-orange-200">
             <div className="max-w-6xl mx-auto mb-10">
                <div className="p-8 bg-white rounded-2xl shadow-lg border border-gray-200 grid grid-cols-1 lg:grid-cols-3 items-center gap-8">
                    {/* Column 1: Address */}
                    <div className="flex items-center space-x-4">
                        <LocationIcon />
                        <div className="text-left">
                            <strong className="font-bold text-base block text-gray-800">Address</strong>
                            <p className="text-gray-600 text-sm">3rd Flr, Masskara Hall, BCGC, Villamonte</p>
                        </div>
                    </div>
                    {/* Column 2: Contact */}
                    <div className="flex flex-col space-y-6 py-4 lg:py-0 lg:px-8 lg:border-l lg:border-r border-gray-200">
                        <div className="flex items-center space-x-4">
                            <PhoneIcon />
                            <div className="text-left">
                                <strong className="font-bold text-base block text-gray-800">Mobile</strong>
                                <p className="text-gray-600 text-sm">09486268509</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <EmailIcon />
                            <div className="text-left">
                                <strong className="font-bold text-base block text-gray-800">E-mail</strong>
                                <p className="text-gray-600 text-sm">bac@bacolodcity.gov.ph</p>
                            </div>
                        </div>
                    </div>
                    {/* Column 3: QR Code */}
                    <div className="flex items-center space-x-4 justify-center lg:justify-start lg:pl-8">
                        <img src={qrCodeUrl} alt="Feedback QR" className="h-[90px] w-[90px] rounded-lg flex-shrink-0" />
                        <div className="text-sm text-left">
                            <p className="font-bold text-lg text-gray-800 leading-tight">BACOLOD CITY</p>
                            <p className="font-semibold text-base text-orange-600 leading-tight">Bids and Awards Committee</p>
                            <a href={feedbackFormUrl} target="_blank" rel="noopener noreferrer" className="mt-1.5 block underline text-gray-600 hover:text-orange-600">Scan QR for Feedback</a>
                        </div>
                    </div>
                </div>
            </div>
            <div className="text-center text-sm text-gray-500">
                <p>&copy; 2025 by Lito Garin | Bids and Awards Committee Bacolod. All Rights Reserved.</p>
                <button 
                    onClick={() => setActiveModal('changelog')}
                    className="mt-2 text-gray-500 hover:text-orange-600 hover:underline font-semibold"
                >
                    Changelog & App Updates (v3.3)
                </button>
            </div>
        </footer>
    );
};

export default Footer;