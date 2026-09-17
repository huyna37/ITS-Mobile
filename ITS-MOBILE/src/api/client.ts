import axios, { AxiosInstance } from 'axios';
import { APP_CONFIG } from '../config';
import { storage } from '../utils/storage';

export const apiClient: AxiosInstance = axios.create({
  baseURL: APP_CONFIG.apiBaseUrl,
  timeout: APP_CONFIG.apiTimeoutMs,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

apiClient.interceptors.request.use(
  config => {
    const token = storage.getItem('auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // For FormData uploads, let the runtime/browser set multipart/form-data with boundary
    if (config.data instanceof FormData && config.headers) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  error => Promise.reject(error)
);

apiClient.interceptors.response.use(
  response => response,
  error => {
    const status = error.response?.status;
    const isLoginRequest = error.config?.url?.includes('/api/auth/login');

    // Chỉ tự động đăng xuất khi nhận mã 401 Unauthorized từ máy chủ (hết hạn token)
    if (!isLoginRequest && status === 401) {
      try {
        const { useAuthStore } = require('../store/useAuthStore');
        useAuthStore.getState().handleSessionExpired();
      } catch {
        storage.removeItem('auth_token');
        storage.removeItem('auth_user');
      }
    }
    return Promise.reject(error);
  }
);
