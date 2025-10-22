import React, { useState, useEffect, useRef } from 'react';
import { userService } from '../../auth/userService';
import { User } from '../../types';
import { QRCodeCanvas } from 'qrcode.react';
import { bacolodCityLogo, orangeBacolodLogo } from '../../data/logo';

declare global {
    interface Window {
        jspdf: { 
            jsPDF: new (options?: any) => any;
            plugin: any;
        };
    }
}
interface jsPDFWithAutoTable extends InstanceType<typeof window.jspdf.jsPDF> {
  autoTable: (options: any) => jsPDFWithAutoTable;
}

// --- Reusable Digital ID Card Component (scoped to this file) ---
const DigitalIdCard: React.FC<{ user: User }> = ({ user }) => {
    const qrValue = "https://bit.ly/bacbcdPA";

    return (
        <div className="w-full max-w-sm mx-auto rounded-xl overflow-hidden shadow-lg bg-slate-50 font-sans relative" style={{ fontFamily: "'Inter', sans-serif" }}>
            <div className="absolute inset-x-0 bottom-20 top-20 flex items-center justify-center pointer-events-none z-0">
                <img
                    src={orangeBacolodLogo}
                    alt="Watermark"
                    className="w-48 h-48 opacity-5"
                />
            </div>
            <div className="relative z-10">
                <div className="bg-gradient-to-r from-blue-800 to-orange-500 h-20 p-3 flex justify-between items-start">
                    <img src={bacolodCityLogo} alt="Bacolod City Seal" className="h-14 w-14" />
                    <div className="text-right">
                        <p className="text-white font-bold text-base leading-tight">BACOLOD CITY</p>
                        <p className="text-white text-[10px]">OFFICE OF THE CITY MAYOR</p>
                    </div>
                </div>
                <div className="p-2 pt-0 text-center -mt-10">
                    <div className="w-20 h-20 rounded-full border-4 border-white inline-block overflow-hidden bg-gray-200">
                        <img src="https://static.vecteezy.com/system/resources/previews/036/280/651/non_2x/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg" alt="User" className="w-full h-full object-cover" />
                    </div>
                    <h2 className="text-base font-bold text-gray-800 mt-1 truncate" title={user.fullName}>{user.fullName}</h2>
                    <p className="text-xs text-gray-500 truncate" title={user.department}>{user.department}</p>
                    <p className="text-[10px] text-gray-600 mt-0.5 break-all">{user.username}</p>
                </div>
                <div className="px-3 pb-3 flex justify-between items-center">
                    <div className="text-left">
                        <p className="text-[9px] text-gray-400">ID NUMBER</p>
                        <p className="font-mono text-xs text-gray-800">{`BAC-${String(user.id).padStart(5, '0')}`}</p>
                        <p className="text-[9px] text-gray-400 mt-1">VALID UNTIL</p>
                        <p className="font-mono text-xs text-gray-800">12/31/2026</p>
                    </div>
                    <div className="text-center">
                        <div className="p-1 bg-white border rounded-md inline-block">
                            <QRCodeCanvas value={qrValue} size={60} level={"H"} />
                        </div>
                        <p className="text-[8px] font-mono mt-0.5 text-gray-600 break-all">bit.ly/bacbcdPA</p>
                    </div>
                </div>
                 <div className="bg-gray-100 p-1">
                     <svg className="w-full h-8"
                         dangerouslySetInnerHTML={{
                            __html: `<rect x="0" y="0" width="100%" height="100%" fill="none" /><g fill="#333">${Array.from({length: 30}).map((_, i) => `<rect x="${2 + i * 8}" y="5" width="${1 + Math.random() * 2}" height="20" />`).join('')}</g>`
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

const BulkIdGeneratorModal: React.FC<{ users: User[]; onClose: () => void }> = ({ users, onClose }) => {
    const handlePrint = () => {
        document.body.classList.add('is-printing-bulk-ids');
        window.print();
        document.body.classList.remove('is-printing-bulk-ids');
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-[51] flex items-center justify-center p-4" id="bulk-id-printable-area-container">
            <div className="bg-white rounded-lg shadow-2xl w-full h-full flex flex-col">
                <header className="p-3 bg-gray-100 border-b flex justify-between items-center flex-shrink-0 no-print">
                    <h3 className="font-bold text-lg text-gray-800">Bulk Digital ID Generation ({users.length} Users)</h3>
                    <div className="flex gap-2">
                        <button onClick={handlePrint} className="btn bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">Print / Export PDF</button>
                        <button onClick={onClose} className="btn bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg">Close</button>
                    </div>
                </header>
                <main className="flex-grow overflow-y-auto p-4 bg-gray-200">
                    <p className="text-center text-sm text-gray-600 mb-4 no-print">To save as PDF, choose 'Save as PDF' as the destination in your browser's print dialog.</p>
                    <div className="print-grid">
                        {users.map(user => (
                            <div key={user.id} className="break-inside-avoid">
                                <DigitalIdCard user={user} />
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
};


const UserManagementTab: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [showPasswordModal, setShowPasswordModal] = useState<User | null>(null);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success'>('idle');
    const [isBulkIdModalVisible, setIsBulkIdModalVisible] = useState(false);


    useEffect(() => {
        setUsers(userService.getUsers());
    }, []);

    const handleSave = () => {
        setSaveStatus('saving');
        userService.saveUsers(users);
        setTimeout(() => {
            setSaveStatus('success');
            setTimeout(() => setSaveStatus('idle'), 2000);
        }, 1000);
    };
    
    const handleFieldChange = (userId: number, field: keyof User, value: string) => {
        setUsers(currentUsers =>
            currentUsers.map(user =>
                user.id === userId ? { ...user, [field]: value } : user
            )
        );
    };

    const handlePasswordChange = () => {
        if (!showPasswordModal) return;
        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        
        handleFieldChange(showPasswordModal.id, 'password', newPassword);
        handleSave();
        
        setShowPasswordModal(null);
        setNewPassword('');
        setConfirmPassword('');
        setError('');
    };
    
    const handleExportPdf = () => {
        if (!window.jspdf || !window.jspdf.jsPDF) {
            alert('PDF generation library not loaded.');
            return;
        }
        
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF() as jsPDFWithAutoTable;

        doc.setFontSize(18);
        doc.text('User Management Report', 14, 22);
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

        const tableColumn = ["ID", "Username", "Full Name", "Department", "Role"];
        const tableRows = users.map(user => [
            user.id,
            user.username,
            user.fullName,
            user.department,
            user.role
        ]);

        doc.autoTable({
            startY: 40,
            head: [tableColumn],
            body: tableRows,
            theme: 'striped',
            headStyles: { fillColor: [249, 115, 22] }
        });

        doc.save('user_management_report.pdf');
    };

    return (
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                 <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 mr-3 text-orange-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.284-2.72c-2.502 0-4.533 2.03-4.533 4.533s2.031 4.533 4.533 4.533c2.502 0 4.533-2.03 4.533-4.533S14.502 18 12 18zm-7.284-2.72a3 3 0 00-4.682 2.72 9.094 9.094 0 003.741.479m-4.259 2.72C3.142 16.66 2 14.89 2 13c0-5.523 4.477-10 10-10s10 4.477 10 10c0 1.89-1.142 3.66-2.904 4.479" /></svg>
                User Management
            </h2>
            <p className="text-gray-600 mb-6">View and manage user accounts. Changes are saved for the current session.</p>

            <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full bg-white">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="p-3 text-left text-sm font-semibold text-gray-600">Username</th>
                            <th className="p-3 text-left text-sm font-semibold text-gray-600">Full Name</th>
                            <th className="p-3 text-left text-sm font-semibold text-gray-600">Department</th>
                            <th className="p-3 text-left text-sm font-semibold text-gray-600">Role</th>
                            <th className="p-3 text-center text-sm font-semibold text-gray-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {users.map(user => (
                            <tr key={user.id} className="hover:bg-gray-50">
                                <td className="p-3 text-sm text-gray-700 font-mono">{user.username}</td>
                                <td className="p-1">
                                    <input
                                        type="text"
                                        value={user.fullName}
                                        onChange={e => handleFieldChange(user.id, 'fullName', e.target.value)}
                                        className="w-full bg-transparent p-2 text-sm focus:bg-orange-50 focus:outline-none focus:ring-1 focus:ring-orange-400 rounded-md"
                                    />
                                </td>
                                <td className="p-1">
                                     <input
                                        type="text"
                                        value={user.department}
                                        onChange={e => handleFieldChange(user.id, 'department', e.target.value)}
                                        className="w-full bg-transparent p-2 text-sm focus:bg-orange-50 focus:outline-none focus:ring-1 focus:ring-orange-400 rounded-md"
                                    />
                                </td>
                                <td className="p-3 text-sm text-gray-700 capitalize">{user.role}</td>
                                <td className="p-3 text-center">
                                    <button
                                        onClick={() => setShowPasswordModal(user)}
                                        className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-semibold"
                                    >
                                        Reset Password
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="mt-6 flex justify-end gap-2 flex-wrap">
                <button
                    onClick={() => setIsBulkIdModalVisible(true)}
                    className="btn bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg text-sm"
                >
                    Generate All Digital IDs
                </button>
                 <button
                    onClick={handleExportPdf}
                    className="btn bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg text-sm"
                >
                    Export as PDF
                </button>
                <button
                    onClick={handleSave}
                    disabled={saveStatus !== 'idle'}
                    className="btn bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-lg disabled:bg-gray-400"
                >
                    {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'success' ? 'Saved!' : 'Save All Changes'}
                </button>
            </div>

            {showPasswordModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-6">
                        <h3 className="text-lg font-bold text-gray-800">Reset Password for <span className="text-orange-600">{showPasswordModal.username}</span></h3>
                        <p className="text-sm text-gray-500 mt-1 mb-4">Enter a new password for this user.</p>
                        <div className="space-y-4">
                             <div>
                                <label className="block text-sm font-medium text-gray-700">New Password</label>
                                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="mt-1 w-full p-2 border border-gray-300 rounded-md" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="mt-1 w-full p-2 border border-gray-300 rounded-md" />
                            </div>
                        </div>
                        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                        <div className="mt-6 flex justify-end gap-3">
                            <button onClick={() => setShowPasswordModal(null)} className="btn bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg">Cancel</button>
                            <button onClick={handlePasswordChange} className="btn bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg">Update Password</button>
                        </div>
                    </div>
                </div>
            )}
            
            {isBulkIdModalVisible && <BulkIdGeneratorModal users={users} onClose={() => setIsBulkIdModalVisible(false)} />}
        </div>
    );
};

export default UserManagementTab;