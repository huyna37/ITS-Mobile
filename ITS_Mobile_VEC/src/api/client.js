import { APP_CONFIG } from '../config.js';
import * as storage from '../utils/storage.js';

export const UNAUTHORIZED_EVENT_NAME = 'its:unauthorized';
export const NETWORK_ERROR_EVENT = 'its:network-error';

export function getToken() {
  const session = storage.getJSON(APP_CONFIG.storageKeys.session);
  return session?.token || null;
}

export class ApiError extends Error {
  constructor(message, { status, body } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

export class OfflineError extends Error {
  constructor() {
    super('API_OFFLINE');
    this.name = 'OfflineError';
    this.code = 'OFFLINE';
  }
}

export class NetworkError extends Error {
  constructor(reason) {
    super(reason || 'NETWORK');
    this.name = 'NetworkError';
    this.code = reason === 'TIMEOUT' ? 'TIMEOUT' : 'NETWORK';
  }
}

function buildHeaders(custom = {}, body) {
  const token = getToken();
  const out = {
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...custom,
  };
  if (body !== undefined && !(body instanceof FormData) && !('Content-Type' in out)) {
    out['Content-Type'] = 'application/json';
  }
  return out;
}

function serializeBody(body) {
  if (body === undefined) return undefined;
  if (body instanceof FormData) return body;
  if (typeof body === 'string') return body;
  return JSON.stringify(body);
}

function buildUrl(path, query) {
  let url = APP_CONFIG.apiBaseUrl + path;
  if (query && typeof query === 'object') {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v === undefined || v === null) return;
      if (Array.isArray(v)) {
        v.forEach((item) => params.append(k, String(item)));
      } else {
        params.append(k, String(v));
      }
    });
    const qs = params.toString();
    if (qs) url += (url.includes('?') ? '&' : '?') + qs;
  }
  return url;
}

export async function request(path, options = {}) {
  const { method = 'GET', body, headers = {}, signal, query } = options;
  if (!APP_CONFIG.apiBaseUrl) {
    throw new OfflineError();
  }
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), APP_CONFIG.apiTimeoutMs);
  let res;
  try {
    res = await fetch(buildUrl(path, query), {
      method,
      headers: buildHeaders(headers, body),
      body: serializeBody(body),
      signal: signal || ctrl.signal,
    });
  } catch (e) {
    clearTimeout(timer);
    const err = new NetworkError(e?.name === 'AbortError' ? 'TIMEOUT' : 'NETWORK');
    window.dispatchEvent(new CustomEvent(NETWORK_ERROR_EVENT, { detail: err }));
    throw err;
  }
  clearTimeout(timer);
  if (res.status === 401) {
    storage.removeItem(APP_CONFIG.storageKeys.session);
    window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT_NAME));
    throw new ApiError('Phiên đăng nhập hết hạn', { status: 401 });
  }
  if (!res.ok) {
    let text = '';
    try {
      text = await res.text();
    } catch {}
    throw new ApiError(`HTTP ${res.status}: ${text || res.statusText}`, {
      status: res.status,
      body: text,
    });
  }
  if (res.status === 204) return null;
  const ct = res.headers.get('Content-Type') || '';
  if (ct.includes('application/json')) return res.json();
  return res.text();
}

export async function tryApi(apiCall) {
  return await apiCall();
}

export function get(path, opts = {}) {
  return request(path, { ...opts, method: 'GET' });
}

export function post(path, body, opts = {}) {
  return request(path, { ...opts, method: 'POST', body });
}

export function patch(path, body, opts = {}) {
  return request(path, { ...opts, method: 'PATCH', body });
}

export function put(path, body, opts = {}) {
  return request(path, { ...opts, method: 'PUT', body });
}

export function del(path, opts = {}) {
  return request(path, { ...opts, method: 'DELETE' });
}
