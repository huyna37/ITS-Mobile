import { NativeModules, NativeEventEmitter, Platform } from 'react-native';
import { apiClient } from '../api/client';
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

export async function getCurrentBundleInfo(): Promise<OtaBundleInfo> {
  if (Platform.OS === 'android' && OtaUpdateModule?.getBundleInfo) {
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
  try {
    const res = await apiClient.get<OtaCheckResult>(
      `/api/ota/check?currentVersion=${encodeURIComponent(currentInfo.bundleVersion)}`
    );
    return res.data;
  } catch {
    return {
      hasUpdate: false,
      latestVersion: currentInfo.bundleVersion,
      bundleUrl: '',
      changeLog: '',
      mandatory: false,
      releaseDate: '',
    };
  }
}

export async function downloadAndApplyOta(
  downloadUrl: string,
  targetVersion: string,
  onProgress?: (progress: DownloadProgress) => void
): Promise<boolean> {
  if (Platform.OS === 'android' && OtaUpdateModule?.downloadAndApplyBundle) {
    const eventEmitter = new NativeEventEmitter(OtaUpdateModule);
    const sub = eventEmitter.addListener('OtaDownloadProgress', (event: unknown) => {
      onProgress?.(event as DownloadProgress);
    });

    try {
      await OtaUpdateModule.downloadAndApplyBundle(downloadUrl, targetVersion);
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
  if (Platform.OS === 'android' && OtaUpdateModule?.reloadApp) {
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
  if (Platform.OS === 'android' && OtaUpdateModule?.resetToFactory) {
    await OtaUpdateModule.resetToFactory();
  }
  storage.removeItem(STORAGE_KEY_BUNDLE_VER);
  await reloadApp();
}
