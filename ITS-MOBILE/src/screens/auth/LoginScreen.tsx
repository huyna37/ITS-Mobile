import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  EyeIcon,
  EyeOffIcon,
  FaceIdIcon,
  FingerprintIcon,
  PaperPlaneIcon,
} from '../../components/icons/SvgIcons';
import { APP_CONFIG } from '../../config';
import {
  authenticateWithBiometrics,
  BiometricType,
  checkBiometricAvailable,
  isBiometricEnabled,
} from '../../services/biometricService';
import { useAuthStore } from '../../store/useAuthStore';
import { showAppToast } from '../../store/useToastStore';
import { styles } from './LoginScreen.styles';

export const LoginScreen: React.FC = () => {
  const [username, setUsername] = useState('');
  const [extension, setExtension] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    username?: string;
    extension?: string;
    password?: string;
  }>({});
  const [biometricType, setBiometricType] = useState<BiometricType>(null);
  const [showBiometric, setShowBiometric] = useState<boolean>(false);
  const biometricScale = useRef(new Animated.Value(1)).current;

  const extensionInputRef = useRef<any>(null);
  const passwordInputRef = useRef<any>(null);

  const { login, loginWithBiometrics, isLoading, error, clearError } = useAuthStore();

  const autoPromptedRef = useRef<boolean>(false);

  // Xử lý đăng nhập bằng Face ID / vân tay
  const handleBiometricLogin = useCallback(
    async (isAuto = false, overrideType?: BiometricType) => {
      if (!isAuto) {
        // Hiệu ứng nhấn
        Animated.sequence([
          Animated.timing(biometricScale, { toValue: 0.92, duration: 100, useNativeDriver: true }),
          Animated.timing(biometricScale, { toValue: 1, duration: 100, useNativeDriver: true }),
        ]).start();
      }

      const activeType = overrideType ?? biometricType;
      const label = activeType === 'FaceID' ? 'Face ID' : 'vân tay';
      const authResult = await authenticateWithBiometrics(`Đăng nhập bằng ${label}`);
      if (authResult.success) {
        const loggedIn = loginWithBiometrics();
        if (loggedIn) {
          showAppToast('success', 'Thành công', 'Đăng nhập thành công');
        } else {
          showAppToast(
            'warning',
            'Chưa kích hoạt',
            'Vui lòng đăng nhập mật khẩu và bật sinh trắc học'
          );
        }
      } else {
        // Nếu là thao tác chủ động bấm tay, hiển thị thông báo lỗi
        if (!isAuto) {
          const msg = authResult.error?.includes('Cancel')
            ? 'Đã hủy thao tác xác thực'
            : `Không nhận diện được ${label}`;
          showAppToast('error', 'Thất bại', msg);
        }
      }
    },
    [biometricType, biometricScale, loginWithBiometrics]
  );

  // Kiểm tra biometric và trạng thái kích hoạt trong cài đặt khi mở màn hình
  useEffect(() => {
    let isMounted = true;
    checkBiometricAvailable().then(({ available, type }) => {
      if (!isMounted) return;
      setBiometricType(type);
      const enabled = isBiometricEnabled();
      setShowBiometric(available && enabled);

      // Tự động kích hoạt Face ID 1 lần khi vừa mở màn hình nếu đã bật
      if (available && enabled && !autoPromptedRef.current) {
        autoPromptedRef.current = true;
        setTimeout(() => {
          if (isMounted) {
            handleBiometricLogin(true, type);
          }
        }, 300);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [handleBiometricLogin]);

  const validateForm = (): boolean => {
    const errors: { username?: string; extension?: string; password?: string } = {};

    const cleanUsername = username.trim();
    if (!cleanUsername) {
      errors.username = 'Vui lòng nhập tài khoản nội bộ';
    }

    const cleanExtension = extension.trim();
    if (!cleanExtension) {
      errors.extension = 'Vui lòng nhập số Extension PBX';
    } else if (!/^\d{4}$/.test(cleanExtension)) {
      errors.extension = 'Số Extension PBX phải đúng 4 chữ số';
    }

    const cleanPassword = password.trim();
    if (!cleanPassword) {
      errors.password = 'Vui lòng nhập mật khẩu';
    } else if (cleanPassword.length < 6) {
      errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      showAppToast('warning', 'Thiếu thông tin', 'Vui lòng điền đúng và đủ các trường bắt buộc');
      return;
    }

    const success = await login({
      username: username.trim(),
      extension: extension.trim(),
      password: password.trim(),
    });

    if (!success) {
      const err = useAuthStore.getState().error;
      const errorMsg = err
        ? err
        : `Không thể kết nối đến máy chủ ITS TMC (${APP_CONFIG.apiBaseUrl}). Vui lòng kiểm tra địa chỉ máy chủ hoặc kết nối mạng.`;
      showAppToast('error', 'Đăng nhập thất bại', errorMsg);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo Squircle hệ thống ITS - Nhấn giữ 2s để khôi phục bản gốc khẩn cấp nếu gặp lỗi bundle */}
          <TouchableOpacity
            activeOpacity={0.85}
            onLongPress={async () => {
              try {
                const { resetOtaToFactory } = require('../../services/otaService');
                showAppToast(
                  'info',
                  'Khôi phục bản gốc',
                  'Đang xóa bản cập nhật lỗi và khởi động lại ứng dụng...'
                );
                await resetOtaToFactory();
              } catch (e) {
                // Fallback
              }
            }}
            style={styles.logoSquircle}
          >
            <PaperPlaneIcon size={48} color="#ffffff" />
          </TouchableOpacity>

          {/* Tiêu đề ứng dụng */}
          <Text style={styles.titleLine1}>VẬN HÀNH CAO TỐC</Text>
          <Text style={styles.titleLine2}>NỘI BÀI - LÀO CAI</Text>
          <Text style={styles.subtitle}>Hệ thống điều hành ITS</Text>

          {/* Form đăng nhập */}
          <View style={styles.formContainer}>
            {/* Banner hiển thị lỗi đăng nhập trực quan từ máy chủ */}
            {error ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Input 1: Tài khoản nội bộ */}
            <Text style={styles.inputLabel}>TÀI KHOẢN NỘI BỘ</Text>
            <TextInput
              style={[styles.textInput, fieldErrors.username ? styles.inputErrorBorder : null]}
              placeholder="Nhập tài khoản"
              placeholderTextColor="#94a3b8"
              value={username}
              onChangeText={val => {
                setUsername(val);
                if (fieldErrors.username) {
                  setFieldErrors(prev => ({ ...prev, username: undefined }));
                }
                if (error) clearError();
              }}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              onSubmitEditing={() => extensionInputRef.current?.focus()}
            />
            {fieldErrors.username ? (
              <Text style={styles.inlineErrorText}>{fieldErrors.username}</Text>
            ) : null}

            {/* Input 2: Extension PBX */}
            <Text style={styles.inputLabel}>EXTENSION PBX (4 SỐ)</Text>
            <TextInput
              ref={extensionInputRef}
              style={[styles.textInput, fieldErrors.extension ? styles.inputErrorBorder : null]}
              placeholder="Ví dụ: 2011"
              placeholderTextColor="#94a3b8"
              value={extension}
              onChangeText={val => {
                // Tự động lọc chỉ cho phép nhập số
                const sanitized = val.replace(/[^0-9]/g, '');
                setExtension(sanitized);
                if (fieldErrors.extension) {
                  setFieldErrors(prev => ({ ...prev, extension: undefined }));
                }
                if (error) clearError();
              }}
              keyboardType="number-pad"
              maxLength={4}
              returnKeyType="next"
              onSubmitEditing={() => passwordInputRef.current?.focus()}
            />
            {fieldErrors.extension ? (
              <Text style={styles.inlineErrorText}>{fieldErrors.extension}</Text>
            ) : null}

            {/* Input 3: Mật khẩu (Có nút ẩn/hiện) */}
            <Text style={styles.inputLabel}>MẬT KHẨU</Text>
            <View
              style={[styles.passwordWrap, fieldErrors.password ? styles.inputErrorBorder : null]}
            >
              <TextInput
                ref={passwordInputRef}
                style={styles.passwordInput}
                placeholder="••••••••"
                placeholderTextColor="#94a3b8"
                value={password}
                onChangeText={val => {
                  setPassword(val);
                  if (fieldErrors.password) {
                    setFieldErrors(prev => ({ ...prev, password: undefined }));
                  }
                  if (error) clearError();
                }}
                secureTextEntry={!showPassword}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                activeOpacity={0.7}
                onPress={() => setShowPassword(prev => !prev)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                {showPassword ? (
                  <EyeOffIcon size={22} color="#64748b" />
                ) : (
                  <EyeIcon size={22} color="#64748b" />
                )}
              </TouchableOpacity>
            </View>
            {fieldErrors.password ? (
              <Text style={styles.inlineErrorText}>{fieldErrors.password}</Text>
            ) : null}

            {/* Nút Đăng nhập */}
            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
              activeOpacity={0.85}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text style={styles.loginButtonText}>
                {isLoading ? 'ĐANG KẾT NỐI MÁY CHỦ...' : 'ĐĂNG NHẬP'}
              </Text>
            </TouchableOpacity>

            {/* Nút đăng nhập sinh trắc học (chỉ hiện khi thiết bị hỗ trợ VÀ đã bật trong Hồ sơ) */}
            {showBiometric ? (
              <View style={styles.biometricRow}>
                <View style={styles.biometricDivider} />
                <Text style={styles.biometricDividerText}>HOẶC</Text>
                <View style={styles.biometricDivider} />
              </View>
            ) : null}
            {showBiometric ? (
              <Animated.View style={{ transform: [{ scale: biometricScale }] }}>
                <TouchableOpacity
                  style={styles.biometricButton}
                  activeOpacity={0.8}
                  onPress={() => handleBiometricLogin(false)}
                >
                  {biometricType === 'FaceID' ? (
                    <FaceIdIcon size={28} color="#0090e7" />
                  ) : (
                    <FingerprintIcon size={28} color="#0090e7" />
                  )}
                  <Text style={styles.biometricButtonText}>
                    {biometricType === 'FaceID'
                      ? 'Đăng nhập bằng Face ID'
                      : 'Đăng nhập bằng vân tay'}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
