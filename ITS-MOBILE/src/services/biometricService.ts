import { Platform } from 'react-native';
import { storage } from '../utils/storage';

// Kiểu loại biometric
export type BiometricType = 'FaceID' | 'TouchID' | 'Fingerprint' | null;

export const BIOMETRIC_KEYS = {
  ENABLED: 'biometric_enabled',
  TOKEN: 'biometric_token',
  USER: 'biometric_user',
};

// Kiểm tra thiết bị có hỗ trợ sinh trắc học không
export async function checkBiometricAvailable(): Promise<{
  available: boolean;
  type: BiometricType;
}> {
  // Trên môi trường Web preview: Cho phép mô phỏng Face ID để dev test giao diện
  if (Platform.OS === 'web') {
    return { available: true, type: 'FaceID' };
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const ReactNativeBiometrics = require('react-native-biometrics').default;
    const rnBiometrics = new ReactNativeBiometrics();
    const { available, biometryType } = await rnBiometrics.isSensorAvailable();
    if (!available) return { available: false, type: null };

    const type: BiometricType =
      biometryType === 'FaceID'
        ? 'FaceID'
        : biometryType === 'TouchID'
          ? 'TouchID'
          : biometryType === 'Biometrics'
            ? 'Fingerprint'
            : null;

    return { available: !!type, type };
  } catch {
    // Thư viện chưa cài hoặc thiết bị không hỗ trợ
    return { available: false, type: null };
  }
}

// Hiển thị hộp thoại xác thực sinh trắc học
export async function authenticateWithBiometrics(
  promptMessage = 'Xác thực để đăng nhập ITS Mobile'
): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const ReactNativeBiometrics = require('react-native-biometrics').default;
    const rnBiometrics = new ReactNativeBiometrics();
    const { success } = await rnBiometrics.simplePrompt({ promptMessage });
    return !!success;
  } catch {
    return false;
  }
}

// Kiểm tra người dùng đã bật tính năng đăng nhập sinh trắc học chưa
export function isBiometricEnabled(): boolean {
  return storage.getItem(BIOMETRIC_KEYS.ENABLED) === 'true';
}

// Kích hoạt sinh trắc học (yêu cầu quét xác thực trước khi lưu)
export async function enableBiometricLogin(token: string, user: any): Promise<boolean> {
  const verified = await authenticateWithBiometrics('Xác nhận kích hoạt đăng nhập sinh trắc học');
  if (!verified) return false;

  storage.setItem(BIOMETRIC_KEYS.ENABLED, 'true');
  storage.setItem(BIOMETRIC_KEYS.TOKEN, token);
  storage.setJSON(BIOMETRIC_KEYS.USER, user);
  return true;
}

// Tắt đăng nhập sinh trắc học
export function disableBiometricLogin(): void {
  storage.removeItem(BIOMETRIC_KEYS.ENABLED);
  storage.removeItem(BIOMETRIC_KEYS.TOKEN);
  storage.removeItem(BIOMETRIC_KEYS.USER);
}

// Lấy thông tin phiên đã lưu cho sinh trắc học
export function getBiometricSession(): { token: string; user: any } | null {
  if (!isBiometricEnabled()) return null;
  const token = storage.getItem(BIOMETRIC_KEYS.TOKEN);
  const user = storage.getJSON<any>(BIOMETRIC_KEYS.USER);
  if (!token || !user) return null;
  return { token, user };
}

// Tự động đồng bộ token/user mới nếu sinh trắc học đang bật
export function syncBiometricSessionIfEnabled(token: string, user: any): void {
  if (isBiometricEnabled()) {
    storage.setItem(BIOMETRIC_KEYS.TOKEN, token);
    storage.setJSON(BIOMETRIC_KEYS.USER, user);
  }
}
