import React, { useState, useRef } from 'react';
import { SessionUser } from '../../auth/authService';
import { QRCodeCanvas } from 'qrcode.react';
import { bacolodCityLogo, orangeBacolodLogo } from '../../data/logo';
import { ModalKey } from '../../types';

interface AccountTabProps {
  user: SessionUser;
  onLogout: () => void;
  setActiveModal: (modal: ModalKey) => void;
}

const DigitalIdModal: React.FC<{ user: SessionUser; onClose: () => void }> = ({ user, onClose }) => {
    const idCardRef = useRef<HTMLDivElement>(null);
    const qrValue = "https://bit.ly/bacbcdPA";

    const handlePrintId = () => {
        const printArea = document.createElement('div');
        printArea.className = 'digital-id-print-area';
        const cardNode = idCardRef.current?.cloneNode(true);
        if (cardNode) {
            printArea.appendChild(cardNode);
            document.body.appendChild(printArea);
            document.body.classList.add('is-printing-id');

            const onAfterPrint = () => {
                document.body.classList.remove('is-printing-id');
                document.body.removeChild(printArea);
                window.removeEventListener('afterprint', onAfterPrint);
            };
            window.addEventListener('afterprint', onAfterPrint, { once: true });
            
            setTimeout(() => window.print(), 50); // Small timeout to ensure styles are applied
        }
    };
    
    const handleDownloadImage = () => {
        const cardElement = idCardRef.current;
        if (cardElement && window.html2canvas) {
            if (document.activeElement instanceof HTMLElement) {
                document.activeElement.blur();
            }
            setTimeout(() => {
                window.html2canvas(cardElement.querySelector('.id-card-capture-area'), {
                    scale: 3, // Increase scale for higher quality
                    useCORS: true,
                    backgroundColor: null,
                }).then((canvas: HTMLCanvasElement) => {
                    const link = document.createElement('a');
                    link.download = `digital-id-${user.fullName.replace(/\s+/g, '-')}.png`;
                    link.href = canvas.toDataURL('image/png');
                    link.click();
                });
            }, 100);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg flex flex-col" onClick={e => e.stopPropagation()}>
                <div ref={idCardRef} className="p-4 bg-gray-100">
                    <div className="w-full max-w-sm mx-auto rounded-xl overflow-hidden shadow-lg bg-slate-50 font-sans relative id-card-capture-area" style={{ fontFamily: "'Inter', sans-serif" }}>
                        <div className="absolute inset-x-0 bottom-20 top-20 flex items-center justify-center pointer-events-none z-0">
                            <img
                                src={orangeBacolodLogo}
                                alt="Watermark"
                                className="w-48 h-48 opacity-5"
                            />
                        </div>
                        <div className="relative z-10">
                            <div className="bg-gradient-to-r from-blue-800 to-orange-500 h-24 p-4 flex justify-between items-start">
                                <img src={bacolodCityLogo} alt="Bacolod City Seal" className="h-16 w-16" />
                                <div className="text-right">
                                    <p className="text-white font-bold text-lg leading-tight">BACOLOD CITY</p>
                                    <p className="text-white text-xs">OFFICE OF THE CITY MAYOR</p>
                                </div>
                            </div>
                            <div className="p-4 pt-0 text-center -mt-14">
                                <div className="w-24 h-24 rounded-full border-4 border-white inline-block overflow-hidden bg-gray-200">
                                    <img src="https://static.vecteezy.com/system/resources/previews/036/280/651/non_2x/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg" alt="User" className="w-full h-full object-cover" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-800 mt-2">{user.fullName}</h2>
                                <p className="text-sm text-gray-500">{user.department}</p>
                                <p className="text-xs text-gray-600 mt-1 break-all">{user.username}</p>
                            </div>
                            <div className="px-4 pb-4 flex justify-between items-center">
                                <div className="text-left">
                                    <p className="text-xs text-gray-400">ID NUMBER</p>
                                    <p className="font-mono text-sm text-gray-800">{`BAC-${String(user.id).padStart(5, '0')}`}</p>
                                    <p className="text-xs text-gray-400 mt-2">VALID UNTIL</p>
                                    <p className="font-mono text-sm text-gray-800">12/31/2026</p>
                                </div>
                                <div className="text-center">
                                    <div className="p-1 bg-white border rounded-md inline-block">
                                        <QRCodeCanvas value={qrValue} size={80} level={"H"} />
                                    </div>
                                    <p className="text-[10px] font-mono mt-1 text-gray-600 break-all">bit.ly/bacbcdPA</p>
                                </div>
                            </div>
                            <div className="bg-gray-100 p-2">
                                 <svg className="w-full h-10"
                                     dangerouslySetInnerHTML={{
                                        __html: `<rect x="0" y="0" width="100%" height="100%" fill="none" />
                                                <g fill="#333">
                                                    ${Array.from({length: 40}).map((_, i) =>
                                                        `<rect x="${2 + i * 8}" y="5" width="${2 + Math.random() * 3}" height="30" />`
                                                    ).join('')}
                                                </g>`
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                 <div className="p-4 bg-gray-100 border-t flex justify-end gap-3">
                    <button onClick={onClose} className="btn bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg">Close</button>
                    <button onClick={handleDownloadImage} className="btn bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg">Download Image</button>
                    <button onClick={handlePrintId} className="btn bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">Print ID Card</button>
                 </div>
            </div>
        </div>
    );
};


const AccountTab: React.FC<AccountTabProps> = ({ user, onLogout, setActiveModal }) => {
  const [isIdVisible, setIsIdVisible] = useState(false);
  const cityBudgetPpmpLink = "https://docs.google.com/spreadsheets/d/1Tf0iSNfpuSx90_KJ3szJgI48lBocCLZ3/edit?usp=sharing&ouid=106461165163419131469&rtpof=true&sd=true";
  const adminPpmpLink = "https://drive.google.com/drive/folders/1xfu1t3F5VBafIjrlOaaDMEI6RSVP6var?usp=sharing";
  const bccPpmpLink = "https://docs.google.com/spreadsheets/d/1jCBItoa-U9_qOiCe1Ybh9ZyNWje2TCkd/edit?usp=sharing&ouid=106461165163419131469&rtpof=true&sd=true";

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 mr-3 text-orange-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        My Account
      </h2>
      
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-500">Full Name</label>
          <p className="text-lg font-semibold text-gray-800">{user.fullName}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Username / Email</label>
          <p className="text-lg text-gray-800">{user.username}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Department</label>
          <p className="text-lg text-gray-800">{user.department}</p>
        </div>
         <div>
          <label className="text-sm font-medium text-gray-500">Role</label>
          <p className="text-lg text-gray-800 capitalize">{user.role}</p>
        </div>
      </div>

      {user.username === 'citybudget@bacolodcity.gov.ph' && (
        <div className="mt-6 pt-6 border-t border-dashed border-gray-300">
            <h3 className="text-lg font-bold text-gray-700 mb-2">Department Features</h3>
            <button
                onClick={() => window.open(cityBudgetPpmpLink, '_blank', 'noopener,noreferrer')}
                className="btn bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                View Cloud PPMP
            </button>
            <p className="text-xs text-gray-500 mt-2">Access your department's cloud-based PPMP for procurement activities.</p>
        </div>
      )}
      
      {user.username === 'admin' && (
        <div className="mt-6 pt-6 border-t border-dashed border-gray-300">
            <h3 className="text-lg font-bold text-gray-700 mb-2">Admin Features</h3>
            <button
                onClick={() => window.open(adminPpmpLink, '_blank', 'noopener,noreferrer')}
                className="btn bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2-2H4a2 2 0 01-2-2V6z" />
                </svg>
                View Procurement Drive
            </button>
            <p className="text-xs text-gray-500 mt-2">Access the shared drive for procurement activities and PPMPs.</p>
        </div>
      )}

      {user.username === 'bcc@bacolodcity.gov.ph' && (
        <div className="mt-6 pt-6 border-t border-dashed border-gray-300">
            <h3 className="text-lg font-bold text-gray-700 mb-2">Department Features</h3>
            <button
                onClick={() => window.open(bccPpmpLink, '_blank', 'noopener,noreferrer')}
                className="btn bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                BCC REALTIME PPMP
            </button>
            <p className="text-xs text-gray-500 mt-2">Access your department's real-time cloud-based PPMP.</p>
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-dashed border-gray-300 flex justify-between items-center flex-wrap gap-4">
        <div className="flex gap-4">
            <button
                onClick={() => setIsIdVisible(true)}
                className="btn bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
                View Digital ID
            </button>
            {user.role === 'admin' && (
                <button
                    onClick={() => setActiveModal('system-auditor')}
                    className="btn bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M12 6V3m0 18v-3M5.636 5.636l-1.414-1.414M18.364 18.364l-1.414-1.414M5.636 18.364l-1.414 1.414M18.364 5.636l-1.414 1.414M12 12a3 3 0 100-6 3 3 0 000 6z" />
                    </svg>
                    System Development Audit
                </button>
            )}
        </div>
        <button
          onClick={onLogout}
          className="btn bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>

      {isIdVisible && <DigitalIdModal user={user} onClose={() => setIsIdVisible(false)} />}
    </div>
  );
};

export default AccountTab;