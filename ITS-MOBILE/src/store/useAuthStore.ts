import { create } from 'zustand';
import { User, LoginCredentials } from '../types/auth';
import { loginApi, logoutApi } from '../api/authApi';
import { storage } from '../utils/storage';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => Promise<void>;
  restoreSession: () => void;
  handleSessionExpired: () => void;
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
      set({
        user: res.user,
        token: res.token,
        isAuthenticated: true,
        isLoading: false,
      });
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Đăng nhập không thành công';
      set({ error: msg, isLoading: false, isAuthenticated: false });
      return false;
    }
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
