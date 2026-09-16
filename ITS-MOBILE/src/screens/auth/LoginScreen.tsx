import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PaperPlaneIcon } from '../../components/icons/SvgIcons';
import { useAuthStore } from '../../store/useAuthStore';
import { showAppToast } from '../../store/useToastStore';
import { APP_CONFIG } from '../../config';

export const LoginScreen: React.FC = () => {
  const [username, setUsername] = useState('hoangnm');
  const [extension, setExtension] = useState('1001');
  const [password, setPassword] = useState('123456');

  const { login, isLoading, error, clearError } = useAuthStore();

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      showAppToast('warning', 'Yêu cầu thông tin', 'Vui lòng nhập đầy đủ tài khoản và mật khẩu');
      return;
    }

    if (!/^\d{4}$/.test(extension.trim())) {
      showAppToast('warning', 'Định dạng Extension', 'Số Extension tổng đài PBX phải đúng 4 chữ số (Ví dụ: 1001)');
      return;
    }

    const success = await login({
      username: username.trim(),
      extension: extension.trim(),
      password: password.trim(),
    });

    if (!success) {
      const err = useAuthStore.getState().error;
      const errorMsg = err ? err : `Không thể kết nối đến máy chủ ITS TMC (${APP_CONFIG.apiBaseUrl}). Vui lòng kiểm tra địa chỉ máy chủ hoặc kết nối mạng.`;
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
          {/* Logo Squircle xanh với phi thuyền trắng */}
          <View style={styles.logoSquircle}>
            <View style={styles.planeWrap}>
              <PaperPlaneIcon size={44} color="#ffffff" />
            </View>
          </View>

          {/* Tiêu đề ứng dụng */}
          <Text style={styles.titleLine1}>VẬN HÀNH CAO TỐC</Text>
          <Text style={styles.titleLine2}>NỘI BÀI - LÀO CAI</Text>
          <Text style={styles.subtitle}>Hệ thống điều hành ITS</Text>

          {/* Form đăng nhập */}
          <View style={styles.formContainer}>
            {/* Banner hiển thị lỗi đăng nhập trực quan */}
            {error ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Input 1: Tài khoản nội bộ */}
            <Text style={styles.inputLabel}>TÀI KHOẢN NỘI BỘ</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Nhập username"
              placeholderTextColor="#94a3b8"
              value={username}
              onChangeText={(val) => {
                setUsername(val);
                if (error) clearError();
              }}
              autoCapitalize="none"
              autoCorrect={false}
            />

            {/* Input 2: Extension PBX */}
            <Text style={styles.inputLabel}>EXTENSION PBX (4 SỐ)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Ví dụ: 8011"
              placeholderTextColor="#94a3b8"
              value={extension}
              onChangeText={(val) => {
                setExtension(val);
                if (error) clearError();
              }}
              keyboardType="number-pad"
              maxLength={4}
            />

            {/* Input 3: Mật khẩu */}
            <Text style={styles.inputLabel}>MẬT KHẨU</Text>
            <TextInput
              style={styles.textInput}
              placeholder="••••••••"
              placeholderTextColor="#94a3b8"
              value={password}
              onChangeText={(val) => {
                setPassword(val);
                if (error) clearError();
              }}
              secureTextEntry
            />

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
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
    alignItems: 'center',
  },
  logoSquircle: {
    width: 96,
    height: 96,
    borderRadius: 28,
    backgroundColor: '#0090e7',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0090e7',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 24,
  },
  planeWrap: {
    transform: [{ rotate: '-45deg' }],
    marginLeft: 4,
    marginTop: 4,
  },
  titleLine1: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0090e7',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  titleLine2: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0090e7',
    letterSpacing: 0.5,
    textAlign: 'center',
    marginTop: 2,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 36,
  },
  formContainer: {
    width: '100%',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  textInput: {
    height: 52,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 20,
  },
  loginButton: {
    height: 54,
    backgroundColor: '#0090e7',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#0090e7',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 4,
  },
  loginButtonDisabled: {
    backgroundColor: '#94a3b8',
    shadowOpacity: 0.1,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 1,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 20,
  },
  errorIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: '#b91c1c',
    lineHeight: 18,
  },
});
