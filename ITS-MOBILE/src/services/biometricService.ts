import { Platform, Dimensions } from 'react-native';
import { storage } from '../utils/storage';

// Kiểu loại biometric
export type BiometricType = 'FaceID' | 'TouchID' | 'Fingerprint' | null;

export const BIOMETRIC_KEYS = {
  ENABLED: 'biometric_enabled',
  TOKEN: 'biometric_token',
  USER: 'biometric_user',
};

/**
 * Kiểm tra xem thiết bị iOS có phải là dòng iPhone Face ID hay không.
 * Tất cả iPhone tràn viền từ iPhone X đến iPhone 16 (bao gồm cả iPhone 12 mini 780pt, iPhone 12/12 Pro 844pt, Pro Max 926pt)
 * đều có phần cứng Face ID và KHÔNG CÓ Touch ID vật lý.
 * Chỉ có các dòng iPhone nút Home (iPhone 8 trở về trước, iPhone SE 2/3) mới dùng Touch ID (chiều cao <= 736pt, aspect ratio 16:9).
 */
export function isIPhoneWithFaceId(): boolean {
  if (Platform.OS !== 'ios') return false;
  const { width, height } = Dimensions.get('window');
  const maxDim = Math.max(width, height);
  const minDim = Math.min(width, height);
  const aspectRatio = maxDim / Math.max(minDim, 1);

  return maxDim >= 780 && aspectRatio >= 1.95;
}

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
    if (!available) {
      // Nếu là iPhone Face ID nhưng sensor tạm thời trả về available=false (do chưa prompt quyền)
      if (Platform.OS === 'ios' && isIPhoneWithFaceId()) {
        return { available: true, type: 'FaceID' };
      }
      return { available: false, type: null };
    }

    const rawType: BiometricType =
      biometryType === 'FaceID'
        ? 'FaceID'
        : biometryType === 'TouchID'
          ? 'TouchID'
          : biometryType === 'Biometrics'
            ? 'Fingerprint'
            : null;

    // Chuẩn hóa thông minh: Nếu là iPhone có Face ID vật lý (như iPhone 12),
    // loại bỏ hoàn toàn khả năng thư viện native fallback nhầm thành TouchID
    const type: BiometricType =
      Platform.OS === 'ios' && isIPhoneWithFaceId()
        ? 'FaceID'
        : rawType || (Platform.OS === 'ios' ? 'FaceID' : 'Fingerprint');

    return { available: true, type };
  } catch {
    // Nếu thiết bị là iPhone Face ID nhưng module chưa bind, vẫn giữ type FaceID
    if (Platform.OS === 'ios' && isIPhoneWithFaceId()) {
      return { available: true, type: 'FaceID' };
    }
    return { available: false, type: null };
  }
}

// Hiển thị hộp thoại xác thực sinh trắc học
export async function authenticateWithBiometrics(
  promptMessage?: string,
  allowDeviceCredentials = true
): Promise<{ success: boolean; error?: string }> {
  if (Platform.OS === 'web') return { success: false, error: 'Web không hỗ trợ' };

  const defaultMsg =
    Platform.OS === 'ios' && isIPhoneWithFaceId()
      ? 'Quét Face ID để đăng nhập ITS Mobile'
      : 'Xác thực để đăng nhập ITS Mobile';

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const ReactNativeBiometrics = require('react-native-biometrics').default;
    const rnBiometrics = new ReactNativeBiometrics();
    const result = await rnBiometrics.simplePrompt({
      promptMessage: promptMessage || defaultMsg,
      fallbackPromptMessage: 'Nhập mật mã thiết bị',
      allowDeviceCredentials,
    });

    if (result && result.success) {
      return { success: true };
    }
    return { success: false, error: result?.error || 'Người dùng hủy xác thực' };
  } catch (err: any) {
    const errorStr = String(err?.message || err || '');
    console.warn('Lỗi xác thực Face ID/sinh trắc học:', errorStr);
    return { success: false, error: errorStr };
  }
}

// Kiểm tra người dùng đã bật tính năng đăng nhập sinh trắc học chưa
export function isBiometricEnabled(): boolean {
  return storage.getItem(BIOMETRIC_KEYS.ENABLED) === 'true';
}

// Kích hoạt sinh trắc học (yêu cầu quét xác thực trước khi lưu)
export async function enableBiometricLogin(
  token: string,
  user: any
): Promise<{ success: boolean; error?: string }> {
  const authResult = await authenticateWithBiometrics(
    'Xác nhận kích hoạt đăng nhập sinh trắc học'
  );
  if (!authResult.success) {
    return { success: false, error: authResult.error };
  }

  storage.setItem(BIOMETRIC_KEYS.ENABLED, 'true');
  storage.setItem(BIOMETRIC_KEYS.TOKEN, token);
  storage.setJSON(BIOMETRIC_KEYS.USER, user);
  return { success: true };
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
