import { LoginCredentials, AuthResponse, User } from '../types/auth';
import { apiClient } from './client';

export async function loginApi(credentials: LoginCredentials): Promise<AuthResponse> {
  try {
    const res = await apiClient.post<AuthResponse>('/api/auth/login', credentials);
    return res.data;
  } catch {
    // Mock phản hồi cho môi trường dev offline khớp thiết kế
    const mockUser: User = {
      id: 'USER-001',
      username: credentials.username || 'hoang_nm',
      fullName: 'Nguyễn Minh Hoàng',
      extension: credentials.extension || '1001',
      role: 'Nhân viên tuần tra',
      department: 'Trạm NB-01',
      phone: '0912.345.678',
    };
    return {
      token: 'mock-jwt-token-its-mobile-vec-2026',
      user: mockUser,
    };
  }
}

export async function logoutApi(): Promise<void> {
  try {
    await apiClient.post('/api/auth/logout');
  } catch {
    // Ignored in offline mock
  }
}
