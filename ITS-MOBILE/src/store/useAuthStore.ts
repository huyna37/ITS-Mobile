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
}

const DEFAULT_USER: User = {
  id: 'USER-001',
  username: 'hoang_nm',
  fullName: 'Nguyễn Minh Hoàng',
  extension: '1001',
  role: 'Nhân viên tuần tra',
  department: 'Trạm NB-01',
  phone: '0912.345.678',
};

export const useAuthStore = create<AuthState>((set) => ({
  user: DEFAULT_USER,
  token: 'mock-jwt-token-its-mobile-vec-2026',
  isAuthenticated: true,
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
      set({ error: msg, isLoading: false });
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
      });
    }
  },

  restoreSession: () => {
    const token = storage.getItem('auth_token');
    const user = storage.getJSON<User>('auth_user');
    if (token && user) {
      set({ token, user, isAuthenticated: true });
    }
  },
}));
