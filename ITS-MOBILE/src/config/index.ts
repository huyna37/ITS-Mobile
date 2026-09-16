export interface AppConfig {
  apiBaseUrl: string;
  apiTimeoutMs: number;
  sosHotline: string;
  highwayTitle: string;
  highwaySubtitle: string;
}

/**
 * Lấy giá trị biến môi trường từ file .env
 * Hỗ trợ cả Vite (import.meta.env) và React Native / Node (process.env)
 */
const getEnvVar = (key: string, viteKey?: string): string | undefined => {
  // 1. Kiểm tra Vite import.meta.env
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    const metaEnv = (import.meta as any).env;
    if (viteKey && metaEnv[viteKey]) {
      return metaEnv[viteKey];
    }
    if (metaEnv[key]) {
      return metaEnv[key];
    }
  }

  // 2. Kiểm tra process.env
  if (typeof process !== 'undefined' && process.env) {
    if (process.env[key]) {
      return process.env[key];
    }
    if (viteKey && process.env[viteKey]) {
      return process.env[viteKey];
    }
  }

  return undefined;
};

/**
 * Tự động phân giải URL Backend:
 * - Ưu tiên 1: Đọc từ file .env (VITE_API_BASE_URL hoặc API_BASE_URL)
 * - Ưu tiên 2: Tự resolve theo Hostname nếu đang chạy trình duyệt Web (localhost / LAN IP)
 * - Ưu tiên 3: Localhost khi chạy Debug Mobile
 * - Mặc định: Server thật 10.0.229.55:32281
 */
const resolveApiBaseUrl = (): string => {
  // 1. Đọc từ file .env
  const envUrl = getEnvVar('API_BASE_URL', 'VITE_API_BASE_URL');
  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    return envUrl.trim();
  }

  // 2. Tự resolve khi chạy trên trình duyệt Web
  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1' || !hostname) {
      return 'http://localhost:32281';
    }
    return `http://${hostname}:32281`;
  }

  // 3. Tự resolve khi chạy DEV Mobile (Metro / Simulator)
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    return 'http://localhost:32281';
  }

  // 4. Mặc định cho bản Release Production
  return 'http://10.0.229.55:32281';
};

const rawTimeout = getEnvVar('API_TIMEOUT_MS');
const parsedTimeout = rawTimeout ? parseInt(rawTimeout, 10) : NaN;

export const APP_CONFIG: AppConfig = {
  apiBaseUrl: resolveApiBaseUrl(),
  apiTimeoutMs: !isNaN(parsedTimeout) ? parsedTimeout : 8000,
  sosHotline: getEnvVar('SOS_HOTLINE') || '113',
  highwayTitle: getEnvVar('HIGHWAY_TITLE') || 'VẬN HÀNH CAO TỐC NỘI BÀI - LÀO CAI',
  highwaySubtitle: getEnvVar('HIGHWAY_SUBTITLE') || 'Hệ thống điều hành tác nghiệp ITS',
};
