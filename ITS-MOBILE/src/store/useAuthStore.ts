import { create } from 'zustand';
import { User, LoginCredentials } from '../types/auth';
import { loginApi, logoutApi } from '../api/authApi';
import { storage } from '../utils/storage';
import { parseApiError } from '../utils/apiError';
import { getBiometricSession, syncBiometricSessionIfEnabled } from '../services/biometricService';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (credentials: LoginCredentials) => Promise<boolean>;
  loginWithBiometrics: () => boolean;
  logout: () => Promise<void>;
  restoreSession: () => void;
  handleSessionExpired: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const res = await loginApi(credentials);
      storage.setItem('auth_token', res.token);
      storage.setJSON('auth_user', res.user);
      syncBiometricSessionIfEnabled(res.token, res.user);
      set({
        user: res.user,
        token: res.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return true;
    } catch (err: unknown) {
      const msg = parseApiError(err);
      set({ error: msg, isLoading: false, isAuthenticated: false });
      return false;
    }
  },

  loginWithBiometrics: () => {
    const session = getBiometricSession();
    if (!session || !session.token || !session.user) {
      return false;
    }
    storage.setItem('auth_token', session.token);
    storage.setJSON('auth_user', session.user);
    set({
      user: session.user,
      token: session.token,
      isAuthenticated: true,
      isLoading: false,
      error: null,
    });
    return true;
  },

  clearError: () => {
    set({ error: null });
  },

  logout: async () => {
    try {
      await logoutApi();
    } finally {
      storage.removeItem('auth_token');
      storage.removeItem('auth_user');
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        error: null,
      });
    }
  },

  handleSessionExpired: () => {
    storage.removeItem('auth_token');
    storage.removeItem('auth_user');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: 'Phiên làm việc đã hết hạn hoặc không kết nối được máy chủ. Vui lòng đăng nhập lại.',
    });
  },

  restoreSession: () => {
    const token = storage.getItem('auth_token');
    const user = storage.getJSON<User>('auth_user');
    if (token && user) {
      set({ token, user, isAuthenticated: true });
    } else {
      set({ token: null, user: null, isAuthenticated: false });
    }
  },
}));
