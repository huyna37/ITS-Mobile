import { APP_CONFIG } from '../config.js';
import { request, get, del, tryApi, getToken } from './client.js';

export function uploadFile(file, metadata = {}) {
  const form = new FormData();
  form.append('file', file);
  Object.entries(metadata).forEach(([k, v]) => {
    if (v !== undefined && v !== null) form.append(k, String(v));
  });
  return tryApi(() => request('/api/files/upload', { method: 'POST', body: form }));
}

export function uploadMultiple(files, metadata = {}) {
  const form = new FormData();
  Array.from(files).forEach((file) => form.append('files', file));
  Object.entries(metadata).forEach(([k, v]) => {
    if (v !== undefined && v !== null) form.append(k, String(v));
  });
  return tryApi(() => request('/api/files/upload-multiple', { method: 'POST', body: form }));
}

export function deleteFile(fileId) {
  return tryApi(() => del(`/api/files/${encodeURIComponent(fileId)}`));
}

export function getFileUrl(fileId) {
  if (!APP_CONFIG.apiBaseUrl) return null;
  return `${APP_CONFIG.apiBaseUrl}/api/files/${encodeURIComponent(fileId)}/download`;
}

export function getFileMetadata(fileId) {
  return tryApi(() => get(`/api/files/${encodeURIComponent(fileId)}`));
}

export async function downloadFile(fileId) {
  if (!APP_CONFIG.apiBaseUrl) return null;
  const token = getToken();
  const url = getFileUrl(fileId);
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.blob();
}

export function uploadWithProgress(file, metadata = {}, onProgress) {
  return new Promise((resolve, reject) => {
    if (!APP_CONFIG.apiBaseUrl) {
      reject(new Error('API_OFFLINE'));
      return;
    }
    const form = new FormData();
    form.append('file', file);
    Object.entries(metadata).forEach(([k, v]) => {
      if (v !== undefined && v !== null) form.append(k, String(v));
    });
    const xhr = new XMLHttpRequest();
    xhr.open('POST', APP_CONFIG.apiBaseUrl + '/api/files/upload');
    const token = getToken();
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && typeof onProgress === 'function') {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText));
        } catch {
          resolve(xhr.responseText);
        }
      } else {
        reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
      }
    };
    xhr.onerror = () => reject(new Error('NETWORK'));
    xhr.ontimeout = () => reject(new Error('TIMEOUT'));
    xhr.send(form);
  });
}
