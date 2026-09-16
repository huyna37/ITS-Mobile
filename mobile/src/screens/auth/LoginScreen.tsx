import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useAuthStore } from '../../store/useAuthStore';
import { COLORS } from '../../constants/colors';
import { APP_CONFIG } from '../../config';

export const LoginScreen: React.FC = () => {
  const [username, setUsername] = useState('tuan_tra_01');
  const [extension, setExtension] = useState('2011');
  const [password, setPassword] = useState('123456');
  const [extError, setExtError] = useState('');

  const { login, isLoading, error } = useAuthStore();

  const handleLogin = async () => {
    // Validate Extension đúng 4 chữ số theo yêu cầu BA/AC
    if (!/^\d{4}$/.test(extension.trim())) {
      setExtError('Số Extension tổng đài PBX phải đúng 4 chữ số (VD: 2011)');
      return;
    }
    setExtError('');

    if (!username.trim() || !password.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ tài khoản và mật khẩu');
      return;
    }

    const success = await login({
      username: username.trim(),
      extension: extension.trim(),
      password: password.trim(),
    });

    if (!success && error) {
      Alert.alert('Đăng nhập thất bại', error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Logo & Header */}
          <View style={styles.headerBox}>
            <View style={styles.iconCircle}>
              <Text style={styles.iconText}>🛣️</Text>
            </View>
            <Text style={styles.highwayTitle}>{APP_CONFIG.highwayTitle}</Text>
            <Text style={styles.subTitle}>{APP_CONFIG.highwaySubtitle}</Text>
          </View>

          {/* Form Box */}
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Đăng Nhập Tác Nghiệp</Text>

            <Input
              label="Tài khoản hệ thống"
              placeholder="VD: tuan_tra_01"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />

            <Input
              label="Số Extension tổng đài (4 chữ số)"
              placeholder="VD: 2011"
              value={extension}
              onChangeText={(text) => {
                setExtension(text);
                if (extError) setExtError('');
              }}
              keyboardType="number-pad"
              maxLength={4}
              error={extError}
              helperText="Dùng để định danh đàm thoại nội bộ PBX trên tuyến"
            />

            <Input
              label="Mật khẩu"
              placeholder="Nhập mật khẩu"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <Button
              title={isLoading ? 'Đang xác thực...' : 'ĐĂNG NHẬP'}
              onPress={handleLogin}
              loading={isLoading}
              size="lg"
              style={styles.loginBtn}
            />
          </View>

          <Text style={styles.footerNote}>
            Phiên bản Fast-Track VEC 2026 • Hỗ trợ khẩn cấp: {APP_CONFIG.sosHotline}
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.primarySubtle,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  headerBox: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  iconText: {
    fontSize: 32,
  },
  highwayTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.primaryDark,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subTitle: {
    fontSize: 13,
    color: COLORS.gray600,
    marginTop: 4,
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.gray900,
    marginBottom: 18,
    textAlign: 'center',
  },
  loginBtn: {
    marginTop: 10,
  },
  footerNote: {
    textAlign: 'center',
    fontSize: 11,
    color: COLORS.gray500,
    marginTop: 24,
  },
});
