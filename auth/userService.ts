import { User } from '../types';
import { users as initialUsers } from './users';

const USER_DATA_KEY = 'bac_procurement_assistant_all_users';

let memoryUsers: User[] | null = null;

const loadUsers = (): User[] => {
    if (memoryUsers) {
        return memoryUsers;
    }
    const storedUsersJson = sessionStorage.getItem(USER_DATA_KEY);
    if (storedUsersJson) {
        try {
            memoryUsers = JSON.parse(storedUsersJson);
            return memoryUsers!;
        } catch (e) {
            console.error("Failed to parse stored user data, falling back to initial.", e);
        }
    }
    // Deep copy to avoid mutating the original read-only array
    memoryUsers = JSON.parse(JSON.stringify(initialUsers)); 
    return memoryUsers;
}

export const userService = {
    getUsers: (): User[] => {
        return loadUsers();
    },

    saveUsers: (updatedUsers: User[]): void => {
        memoryUsers = updatedUsers;
        sessionStorage.setItem(USER_DATA_KEY, JSON.stringify(updatedUsers));
    },

    getUserByUsername: (username: string): User | undefined => {
        return loadUsers().find(u => u.username.toLowerCase() === username.toLowerCase());
    }
};