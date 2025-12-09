import { User, AuthResponse } from '../types';
import { storageService } from './storageService';

/**
 * AUTH SERVICE
 * 
 * Abstraction layer for all authentication providers.
 * Decouples UI from API implementation details.
 */

const mockLogin = async (provider: User['provider'] | 'face_id'): Promise<AuthResponse> => {
  // Simulating API network delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  const mockUser: User = {
    id: `user_${Date.now()}`,
    name: 'Dr. Jane Doe',
    email: 'jane.doe@clinic.com.au',
    provider: provider === 'face_id' ? 'email' : provider, // Face ID usually links to an existing account
    token: 'mock_jwt_token_12345',
  };

  // Persist data using the separated storage module
  storageService.saveUser(mockUser);

  return { success: true, user: mockUser };
};

export const authService = {
  loginWithApple: () => mockLogin('apple'),
  loginWithGoogle: () => mockLogin('google'),
  loginWithFacebook: () => mockLogin('facebook'),
  loginWithFaceId: () => mockLogin('face_id'),

  /**
   * Check if an email is already registered.
   */
  checkEmail: async (email: string): Promise<boolean> => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const response = await fetch(`${apiUrl}/api/auth/check-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      return data.exists;
    } catch (e) {
      console.error(e);
      return false;
    }
  },

  /**
   * Login with email and password
   */
  loginWithEmail: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (data.success) {
        const user: User = { ...data.user, token: data.token };
        storageService.saveUser(user);
        return { success: true, user };
      }
      return { success: false, error: data.message };
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  },

  /**
   * Register a new user
   */
  registerWithEmail: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const response = await fetch(`${apiUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (data.success) {
        // Registration successful but NOT logged in yet.
        return { success: true, message: data.message };
      }
      return { success: false, error: data.message };
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  },

  /**
   * Verify email with token
   */
  verifyEmail: async (token: string): Promise<AuthResponse> => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const response = await fetch(`${apiUrl}/api/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await response.json();

      if (data.success) {
        const user: User = { ...data.user, token: data.token };
        storageService.saveUser(user);
        return { success: true, user };
      }
      return { success: false, error: data.message };
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  },

  logout: () => {
    storageService.clearUser();
  },

  getCurrentUser: () => storageService.getUser(),

  socialLogin: async (provider: 'google' | 'apple' | 'facebook', token: string): Promise<AuthResponse> => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const response = await fetch(`${apiUrl}/api/auth/social-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ provider, token }),
      });

      const data = await response.json();

      if (data.success) {
        // Adapt backend user to frontend user type if needed
        const user: User = {
          ...data.user,
          token: data.token
        };
        storageService.saveUser(user);
        return { success: true, user };
      }

      return { success: false, error: data.message || 'Login failed' };
    } catch (error) {
      console.error('Social login error:', error);
      return { success: false, error: 'Network connection failed' };
    }
  }
};