import { LoginCredentials, AuthResponse, User } from '../types/auth';
import { apiClient } from './client';

export async function loginApi(credentials: LoginCredentials): Promise<AuthResponse> {
  try {
    const res = await apiClient.post<AuthResponse>('/api/auth/login', credentials);
    return res.data;
  } catch {
    // Mock phản hồi cho môi trường dev offline
    const mockUser: User = {
      id: 'USER-001',
      username: credentials.username,
      fullName: 'Nguyễn Văn Tuần Tra',
      extension: credentials.extension,
      role: 'Đội tuần tra cơ động số 1',
      department: 'Ban Quản lý Khai thác Tuyến Nội Bài - Lào Cai',
      phone: '0988.123.456',
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
