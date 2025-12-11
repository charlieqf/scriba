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
    console.log(`[Mock] Processing social login for ${provider}...`);

    // Default mock user
    let user: User = {
      id: `user_${Date.now()}`,
      name: 'Guest User',
      email: 'guest@example.com',
      provider: provider,
      token: 'mock_jwt_token_' + Date.now(),
    };

    // Try to decode JWT or Fetch Profile (for Access Token)
    if (provider === 'google' && token) {
      // Method 1: Try decoding as JWT (ID Token)
      let decoded = null;
      try {
        const payloadPart = token.split('.')[1];
        if (payloadPart) {
          decoded = JSON.parse(atob(payloadPart));
          if (decoded.name) user.name = decoded.name;
          if (decoded.email) user.email = decoded.email;
          if (decoded.picture) user.avatar = decoded.picture;
          console.log('Decoded Google JWT:', user.name);
        }
      } catch (e) {
        // Not a JWT, likely an Access Token
      }

      // Method 2: If no name found, try finding via UserInfo Endpoint (Access Token)
      if (!decoded || !user.name || user.name === 'Guest User') {
        try {
          console.log('Fetching Google Profile via Access Token...');
          const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (userInfoRes.ok) {
            const userInfo = await userInfoRes.json();
            if (userInfo.name) user.name = userInfo.name;
            if (userInfo.email) user.email = userInfo.email;
            if (userInfo.picture) user.avatar = userInfo.picture;
            console.log('Fetched Google Profile:', user.name);
          }
        } catch (fetchErr) {
          console.error('Failed to fetch Google profile', fetchErr);
        }
      }
    } else {
      // Fallback for others or if decoding fails
      const mockDefaults = await mockLogin(provider);
      if (mockDefaults.success && mockDefaults.user) {
        user = mockDefaults.user;
      }
    }

    storageService.saveUser(user);
    return { success: true, user };
  }
};