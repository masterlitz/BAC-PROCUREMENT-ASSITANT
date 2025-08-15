import React, { useState, useEffect } from 'react';
import { userService } from '../../auth/userService';
import { User } from '../../types';

const UserManagementTab: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [showPasswordModal, setShowPasswordModal] = useState<User | null>(null);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success'>('idle');

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
            <div className="mt-6 flex justify-end">
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
        </div>
    );
};

export default UserManagementTab;