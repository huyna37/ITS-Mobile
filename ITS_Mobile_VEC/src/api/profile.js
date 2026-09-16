import { request, get, patch, tryApi } from './client.js';

export function getProfile() {
  return tryApi(() => get('/api/profile'));
}

export function updateProfile(payload) {
  return tryApi(() => patch('/api/profile', payload));
}

export function uploadAvatar(file) {
  const form = new FormData();
  form.append('avatar', file);
  return tryApi(() => request('/api/profile/avatar', { method: 'POST', body: form }));
}

export function removeAvatar() {
  return tryApi(() => request('/api/profile/avatar', { method: 'DELETE' }));
}

export function getActivityLog(params = {}) {
  return tryApi(() => get('/api/profile/activity', { query: params }));
}

export function getPreferences() {
  return tryApi(() => get('/api/profile/preferences'));
}

export function updatePreferences(payload) {
  return tryApi(() => patch('/api/profile/preferences', payload));
}
