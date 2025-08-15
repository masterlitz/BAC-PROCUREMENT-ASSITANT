
import { User } from '../types';
import { userService } from './userService';

const USER_SESSION_KEY = 'bac_procurement_assistant_user';

// The user object stored in the session should not contain the password
export type SessionUser = Omit<User, 'password'>;

export const authService = {
  login: (username: string, password: string): Promise<SessionUser> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => { // Simulate network delay
        const user = userService.getUserByUsername(username);
        if (user && user.password === password) {
          const { password, ...sessionUser } = user;
          sessionStorage.setItem(USER_SESSION_KEY, JSON.stringify(sessionUser));
          resolve(sessionUser);
        } else {
          reject(new Error('Invalid username or password.'));
        }
      }, 500);
    });
  },

  logout: (): void => {
    sessionStorage.removeItem(USER_SESSION_KEY);
  },

  getCurrentUser: (): SessionUser | null => {
    const userJson = sessionStorage.getItem(USER_SESSION_KEY);
    if (userJson) {
      try {
        return JSON.parse(userJson);
      } catch (error) {
        console.error('Failed to parse user session data:', error);
        sessionStorage.removeItem(USER_SESSION_KEY);
        return null;
      }
    }
    return null;
  },
};