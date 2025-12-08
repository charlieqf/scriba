import { User } from '../types';

/**
 * STORAGE SERVICE
 * 
 * Strictly separates data persistence from the frontend UI.
 * Simulates a local database or secure storage interface.
 */

const USER_STORAGE_KEY = 'scriba_user_session';

export const storageService = {
  /**
   * Save user session data
   */
  saveUser: (user: User): void => {
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Storage Error:', error);
    }
  },

  /**
   * Retrieve current user session
   */
  getUser: (): User | null => {
    try {
      const data = localStorage.getItem(USER_STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      return null;
    }
  },

  /**
   * Clear user session
   */
  clearUser: (): void => {
    localStorage.removeItem(USER_STORAGE_KEY);
  }
};