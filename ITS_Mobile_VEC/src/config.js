const env = (typeof import.meta !== 'undefined' && import.meta.env) || (typeof window !== 'undefined' && window.__ENV__) || {};

const DEFAULT_WEEKDAYS = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
const DEFAULT_BG =
  'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1400&q=80';

export const APP_CONFIG = {
  apiBaseUrl: (env.VITE_API_BASE_URL || '').replace(/\/+$/, ''),
  apiTimeoutMs: Number(env.VITE_API_TIMEOUT_MS || 15000),
  highwayTitle: env.VITE_HIGHWAY_TITLE || 'VẬN HÀNH CAO TỐC NỘI BÀI - LÀO CAI',
  highwaySubtitle: env.VITE_HIGHWAY_SUBTITLE || 'Hệ thống điều hành ITS',
  primaryColor: env.VITE_PRIMARY_COLOR || '#0097f0',
  ambientBgUrl: env.VITE_ITS_BG_URL || DEFAULT_BG,
  sosTel: env.VITE_SOS_TEL || '113',
  storageKeys: {
    session: env.VITE_LS_SESSION_KEY || 'its_session_v1',
    history: env.VITE_LS_HISTORY_KEY || 'its_call_history_v1',
  },
  weekdays: DEFAULT_WEEKDAYS,
};

export function vietnameseWorkScreenDateLine(d = new Date()) {
  const weekday = APP_CONFIG.weekdays[d.getDay()];
  const day = d.getDate();
  const month = d.getMonth() + 1;
  const year = d.getFullYear();
  return `${weekday}, ${day}/${month}/${year}`;
}
