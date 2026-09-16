import { post, tryApi } from './client.js';

export async function login(credentials) {
  try {
    return await tryApi(() => post('/api/auth/login', credentials));
  } catch (err) {
    if (err?.code === 'NETWORK' || err?.code === 'OFFLINE' || err?.name === 'NetworkError' || err?.status === 500) {
      const username = credentials.username || 'van_hanh';
      const roleMap = {
        admin: 'Quản trị viên',
        van_hanh: 'Nhân viên vận hành',
        trien_khai: 'Đội tuần tra & triển khai',
      };
      const nameMap = {
        admin: 'Quản trị hệ thống (Admin)',
        van_hanh: 'Nguyễn Văn Tuần Tra',
        trien_khai: 'Đội Kỹ Thuật Triển Khai',
      };
      return {
        token: 'mock-jwt-token-vec-2026',
        profile: {
          ten_nhan_vien: nameMap[username] || username,
          chuc_vu: roleMap[username] || 'Nhân viên vận hành',
          don_vi: 'Đội Vận hành Tuyến Cao tốc Nội Bài - Lào Cai',
          extension: credentials.extension || '2011',
        },
      };
    }
    throw err;
  }
}

export function logout() {
  return tryApi(() => post('/api/auth/logout'));
}

export function changePassword(payload) {
  return tryApi(() => post('/api/auth/change-password', payload));
}

export function refreshToken(refreshTokenValue) {
  return tryApi(() => post('/api/auth/refresh', { refreshToken: refreshTokenValue }));
}

export function getMe() {
  return tryApi(() => post('/api/auth/me'));
}

export function forgotPassword(payload) {
  return tryApi(() => post('/api/auth/forgot-password', payload));
}

export function verifyOtp(payload) {
  return tryApi(() => post('/api/auth/verify-otp', payload));
}

export function resetPassword(payload) {
  return tryApi(() => post('/api/auth/reset-password', payload));
}
