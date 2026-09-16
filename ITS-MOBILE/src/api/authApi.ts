import { LoginCredentials, AuthResponse, User } from '../types/auth';
import { apiClient } from './client';

interface BackendLoginResponse {
  token: string;
  refreshToken: string;
  tenNhanVien: string;
  chucVu: string;
  donVi: string;
  extension: string;
  username: string;
  expiresIn: number;
}

export async function loginApi(credentials: LoginCredentials): Promise<AuthResponse> {
  const res = await apiClient.post<BackendLoginResponse>('/api/auth/login', {
    username: credentials.username,
    password: credentials.password,
    extension: credentials.extension,
  });

  const data = res.data;
  const user: User = {
    id: data.username,
    username: data.username,
    fullName: data.tenNhanVien,
    extension: data.extension,
    role: data.chucVu,
    department: data.donVi,
  };

  return {
    token: data.token,
    user: user,
  };
}

export async function logoutApi(): Promise<void> {
  try {
    await apiClient.post('/api/auth/logout');
  } catch {
    // Cho phép logout client
  }
}
