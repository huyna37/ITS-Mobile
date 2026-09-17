import { apiClient } from './client';

export interface ProfileData {
  fullName: string;
  role: string;
  department: string;
  extension: string;
  username: string;
}

interface BackendProfileResponse {
  tenNhanVien?: string;
  chucVu?: string;
  donVi?: string;
  extension?: string;
  username?: string;
  fullName?: string;
  role?: string;
  department?: string;
}

export async function getProfileApi(): Promise<ProfileData> {
  const res = await apiClient.get<BackendProfileResponse>('/api/profile');
  const data = res.data;
  return {
    fullName: data.tenNhanVien || data.fullName || '',
    role: data.chucVu || data.role || '',
    department: data.donVi || data.department || '',
    extension: data.extension || '',
    username: data.username || '',
  };
}
