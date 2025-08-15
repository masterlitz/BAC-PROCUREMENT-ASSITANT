
import { User } from '../types';

const userTabs: (User['allowedTabs']) = [
    // Features allowed for the 'user' role as per user request
    'dashboard',
    'planning',
    'catalog',
    'bac-analytics',
    'flow',
    'checklist',
    'agreements',
    'downloadable-forms',
    'account'
];

export const users: User[] = [
  // Super Admins
  {
    id: 1,
    username: 'admin',
    password: 'admin',
    role: 'admin',
    fullName: 'Administrator Prime',
    department: 'System Administration',
    allowedTabs: 'all',
  },
  {
    id: 2,
    username: 'litogarin@gmail.com',
    password: '@@Password2025',
    role: 'admin',
    fullName: 'Lito Garin',
    department: 'System Administration',
    allowedTabs: 'all',
  },
  // Department Users from the chart
 
];
