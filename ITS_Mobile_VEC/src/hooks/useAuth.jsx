import { useState, useEffect, useCallback } from 'react';
import { APP_CONFIG } from '../config.js';
import * as storage from '../utils/storage.js';
import {
  login as apiLogin,
  logout as apiLogout,
  changePassword as apiChangePassword,
  refreshToken as apiRefreshToken,
  getMe as apiGetMe,
} from '../api/auth.js';
import { UNAUTHORIZED_EVENT_NAME } from '../api/client.js';

function loadSession() {
  return storage.getJSON(APP_CONFIG.storageKeys.session, null);
}

export function useAuth() {
  const [session, setSession] = useState(null);
  const [booting, setBooting] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setSession(loadSession());
    setBooting(false);
  }, []);

  useEffect(() => {
    const handler = () => {
      setSession(null);
      storage.removeItem(APP_CONFIG.storageKeys.session);
    };
    window.addEventListener(UNAUTHORIZED_EVENT_NAME, handler);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT_NAME, handler);
  }, []);

  const login = useCallback(async (credentials) => {
    setError(null);
    try {
      const result = await apiLogin(credentials);
      if (!result?.token || !result?.profile) {
        throw new Error('Phản hồi đăng nhập không hợp lệ');
      }
      storage.setJSON(APP_CONFIG.storageKeys.session, result);
      setSession(result);
      return result;
    } catch (e) {
      setError(e?.message || 'Đăng nhập thất bại');
      throw e;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch {}
    storage.removeItem(APP_CONFIG.storageKeys.session);
    storage.removeItem(APP_CONFIG.storageKeys.history);
    setSession(null);
  }, []);

  const changePassword = useCallback(async ({ current, next }) => {
    return apiChangePassword({ currentPassword: current, newPassword: next });
  }, []);

  const refresh = useCallback(async () => {
    if (!session?.refreshToken) return null;
    try {
      const result = await apiRefreshToken(session.refreshToken);
      const merged = { ...session, ...result };
      storage.setJSON(APP_CONFIG.storageKeys.session, merged);
      setSession(merged);
      return merged;
    } catch (e) {
      console.warn('[useAuth] refresh failed:', e?.message || e);
      return null;
    }
  }, [session]);

  const reloadMe = useCallback(async () => {
    if (!session) return null;
    try {
      const profile = await apiGetMe();
      const merged = { ...session, profile: { ...session.profile, ...profile } };
      storage.setJSON(APP_CONFIG.storageKeys.session, merged);
      setSession(merged);
      return merged.profile;
    } catch (e) {
      console.warn('[useAuth] reloadMe failed:', e?.message || e);
      return null;
    }
  }, [session]);

  return {
    session,
    profile: session?.profile || null,
    isLoggedIn: !!session,
    booting,
    error,
    login,
    logout,
    changePassword,
    refresh,
    reloadMe,
  };
}
