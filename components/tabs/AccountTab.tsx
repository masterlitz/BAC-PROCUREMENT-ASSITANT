
import React from 'react';
import { SessionUser } from '../../auth/authService';

interface AccountTabProps {
  user: SessionUser;
  onLogout: () => void;
}

const AccountTab: React.FC<AccountTabProps> = ({ user, onLogout }) => {
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

      <div className="mt-8 pt-6 border-t border-dashed border-gray-300 flex justify-end">
        <button
          onClick={onLogout}
          className="btn bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>
    </div>
  );
};

export default AccountTab;