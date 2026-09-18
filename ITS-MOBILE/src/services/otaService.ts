import { NativeModules, NativeEventEmitter, Platform } from 'react-native';
import { apiClient } from '../api/client';
import { APP_CONFIG } from '../config';
import { storage } from '../utils/storage';

const { OtaUpdateModule } = NativeModules;

export interface OtaCheckResult {
  hasUpdate: boolean;
  latestVersion: string;
  bundleUrl: string;
  changeLog: string;
  mandatory: boolean;
  releaseDate: string;
}

export interface OtaBundleInfo {
  isOtaActive: boolean;
  bundleVersion: string;
  lastUpdatedAt: number;
  bundleSize: number;
}

export interface DownloadProgress {
  percent: number;
  downloadedBytes: number;
  totalBytes: number;
}

const STORAGE_KEY_BUNDLE_VER = 'its_current_bundle_version';

/**
 * Chuẩn hóa URL bundle OTA, đảm bảo luôn là URL HTTP/HTTPS đầy đủ và hợp lệ
 */
export function resolveBundleUrl(bundleUrl: string): string {
  if (!bundleUrl) return '';
  if (bundleUrl.startsWith('http://') || bundleUrl.startsWith('https://')) {
    // Nếu URL trỏ về localhost/127.0.0.1 khi chạy trên thiết bị di động thật, đổi sang apiBaseUrl
    if (Platform.OS !== 'web' && (bundleUrl.includes('://localhost') || bundleUrl.includes('://127.0.0.1'))) {
      try {
        const parsed = new URL(bundleUrl);
        const apiBase = new URL(APP_CONFIG.apiBaseUrl);
        parsed.protocol = apiBase.protocol;
        parsed.host = apiBase.host;
        return parsed.toString();
      } catch {
        // Bỏ qua lỗi parse
      }
    }
    return bundleUrl;
  }
  const base = APP_CONFIG.apiBaseUrl.replace(/\/+$/, '');
  const path = bundleUrl.startsWith('/') ? bundleUrl : `/${bundleUrl}`;
  return `${base}${path}`;
}

export async function getCurrentBundleInfo(): Promise<OtaBundleInfo> {
  if (OtaUpdateModule?.getBundleInfo) {
    try {
      return await OtaUpdateModule.getBundleInfo();
    } catch {
      // Fallback
    }
  }

  const savedVer = storage.getItem(STORAGE_KEY_BUNDLE_VER) || '1.0.0-base';
  return {
    isOtaActive: savedVer !== '1.0.0-base',
    bundleVersion: savedVer,
    lastUpdatedAt: Date.now(),
    bundleSize: 2450000,
  };
}

export async function checkOtaUpdate(): Promise<OtaCheckResult> {
  const currentInfo = await getCurrentBundleInfo();
  const platform = Platform.OS === 'ios' ? 'ios' : 'android';
  const res = await apiClient.get<OtaCheckResult>(
    `/api/ota/check?currentVersion=${encodeURIComponent(currentInfo.bundleVersion)}&platform=${platform}`
  );
  const data = res.data;
  if (data && data.bundleUrl) {
    data.bundleUrl = resolveBundleUrl(data.bundleUrl);
  }
  return data;
}

export async function downloadAndApplyOta(
  downloadUrl: string,
  targetVersion: string,
  onProgress?: (progress: DownloadProgress) => void
): Promise<boolean> {
  const fullUrl = resolveBundleUrl(downloadUrl);

  if (OtaUpdateModule?.downloadAndApplyBundle) {
    const eventEmitter = new NativeEventEmitter(OtaUpdateModule);
    const sub = eventEmitter.addListener('OtaDownloadProgress', (event: unknown) => {
      onProgress?.(event as DownloadProgress);
    });

    try {
      await OtaUpdateModule.downloadAndApplyBundle(fullUrl, targetVersion);
      storage.setItem(STORAGE_KEY_BUNDLE_VER, targetVersion);
      return true;
    } finally {
      sub.remove();
    }
  }

  // Web / Dev simulation progress
  for (let p = 10; p <= 100; p += 20) {
    await new Promise((r) => setTimeout(r, 200));
    onProgress?.({
      percent: p,
      downloadedBytes: (p / 100) * 2400000,
      totalBytes: 2400000,
    });
  }
  storage.setItem(STORAGE_KEY_BUNDLE_VER, targetVersion);
  return true;
}

export async function reloadApp(): Promise<void> {
  if (OtaUpdateModule?.reloadApp) {
    try {
      await OtaUpdateModule.reloadApp();
      return;
    } catch {
      // Fallback
    }
  }
  if (typeof window !== 'undefined' && window.location) {
    window.location.reload();
  }
}

export async function resetOtaToFactory(): Promise<void> {
  if (OtaUpdateModule?.resetToFactory) {
    await OtaUpdateModule.resetToFactory();
  }
  storage.removeItem(STORAGE_KEY_BUNDLE_VER);
  await reloadApp();
}
