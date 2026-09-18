import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { FaceIdIcon, FingerprintIcon, LogoutIcon } from '../../components/icons/SvgIcons';
import { HighwayHeader } from '../../components/shared/HighwayHeader';
import { OtaUpdateModal } from '../../components/shared/OtaUpdateModal';
import { FONT_FAMILY } from '../../constants';
import {
  checkOtaUpdate,
  getCurrentBundleInfo,
  OtaBundleInfo,
  OtaCheckResult,
} from '../../services/otaService';
import {
  BiometricType,
  checkBiometricAvailable,
  disableBiometricLogin,
  enableBiometricLogin,
  isBiometricEnabled,
} from '../../services/biometricService';
import { useAuthStore } from '../../store/useAuthStore';
import { showAppDialog, showAppToast } from '../../store/useToastStore';
import { getProfileApi, ProfileData } from '../../api/profileApi';

export const ProfileScreen: React.FC = () => {
  const { user, token, logout } = useAuthStore();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loadingProfile, setLoadingProfile] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [bundleInfo, setBundleInfo] = useState<OtaBundleInfo | null>(null);
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [updateResult, setUpdateResult] = useState<OtaCheckResult | null>(null);
  const [showOtaModal, setShowOtaModal] = useState(false);

  // Trạng thái cài đặt sinh trắc học
  const [biometricAvailable, setBiometricAvailable] = useState<boolean>(false);
  const [biometricType, setBiometricType] = useState<BiometricType>(null);
  const [biometricActive, setBiometricActive] = useState<boolean>(false);
  const [switchingBiometric, setSwitchingBiometric] = useState<boolean>(false);

  useEffect(() => {
    loadBundleInfo();
    loadProfile();
    loadBiometricSettings();
  }, []);

  const loadBiometricSettings = async () => {
    const { available, type } = await checkBiometricAvailable();
    setBiometricAvailable(available);
    setBiometricType(type);
    setBiometricActive(isBiometricEnabled());
  };

  const handleToggleBiometric = async (value: boolean) => {
    if (value) {
      const currentToken = token || useAuthStore.getState().token;
      const currentUser = user || useAuthStore.getState().user;

      if (!currentToken || !currentUser) {
        showAppToast('warning', 'Chưa đăng nhập', 'Vui lòng đăng nhập lại');
        return;
      }

      setSwitchingBiometric(true);
      const success = await enableBiometricLogin(currentToken, currentUser);
      setSwitchingBiometric(false);

      if (success) {
        setBiometricActive(true);
        const name = biometricType === 'FaceID' ? 'Face ID' : 'vân tay';
        showAppToast('success', 'Thành công', `Đã bật ${name}`);
      } else {
        setBiometricActive(false);
        showAppToast('error', 'Thất bại', 'Xác thực không thành công');
      }
    } else {
      disableBiometricLogin();
      setBiometricActive(false);
      showAppToast('info', 'Thông báo', 'Đã tắt sinh trắc học');
    }
  };

  const loadProfile = async () => {
    try {
      const data = await getProfileApi();
      setProfileData(data);
    } catch (err) {
      console.warn('Lỗi tải thông tin cá nhân từ API /api/profile:', err);
    } finally {
      setLoadingProfile(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadProfile();
  };

  const loadBundleInfo = async () => {
    const info = await getCurrentBundleInfo();
    setBundleInfo(info);
  };

  const handleCheckUpdate = async () => {
    setCheckingUpdate(true);
    try {
      const result = await checkOtaUpdate();
      setUpdateResult(result);
      if (result.hasUpdate) {
        setShowOtaModal(true);
      } else {
        showAppToast(
          'info',
          'ĐÃ LÀ BẢN MỚI NHẤT',
          `Ứng dụng đang hoạt động với phiên bản mới nhất (v${bundleInfo?.bundleVersion || '1.0.0-base'}). Không cần cập nhật.`
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể kiểm tra bản cập nhật vào lúc này.';
      showAppToast('warning', 'LỖI KẾT NỐI', msg);
    } finally {
      setCheckingUpdate(false);
    }
  };

  const handleLogout = () => {
    showAppDialog(
      'ĐĂNG XUẤT HỆ THỐNG',
      'Bạn có chắc chắn muốn đăng xuất khỏi ứng dụng tác nghiệp không?',
      [
        { text: 'Hủy bỏ', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: () => logout(),
        },
      ],
      'warning'
    );
  };

  const displayName = profileData?.fullName || user?.fullName || '---';
  const displayRole = profileData?.role || user?.role || '---';
  const displayExt = profileData?.extension || user?.extension || '---';
  const displayDept = profileData?.department || user?.department || '---';

  return (
    <View style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0090e7']} />
        }
      >
        {/* Header cao tốc chuẩn thiết kế */}
        <HighwayHeader showSearch={false} />

        {/* Card hồ sơ cán bộ */}
        <View style={styles.profileCard}>
          {/* Avatar squircle xanh nhạt chữ N */}
          <View style={styles.avatarSquircle}>
            <Text style={styles.avatarLetter}>{displayName.charAt(0).toUpperCase()}</Text>
          </View>

          {/* Tên và chức danh */}
          <Text style={styles.fullName}>{displayName}</Text>
          <Text style={styles.roleText}>{displayRole}</Text>

          {/* Đường kẻ ngang */}
          <View style={styles.divider} />

          {/* 2 Cột Extension & Đơn vị */}
          <View style={styles.metaRow}>
            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>EXTENSION</Text>
              <Text style={styles.extValue}>{displayExt}</Text>
            </View>

            <View style={styles.verticalDivider} />

            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>ĐƠN VỊ</Text>
              <Text style={styles.deptValue}>{displayDept}</Text>
            </View>
          </View>
        </View>

        {/* Card Cài đặt Bảo mật & Sinh trắc học */}
        <View style={styles.securityCard}>
          <View style={styles.securityHeaderRow}>
            <View style={styles.securityIconBadge}>
              {biometricType === 'FaceID' ? (
                <FaceIdIcon size={24} color="#0090e7" />
              ) : (
                <FingerprintIcon size={24} color="#0090e7" />
              )}
            </View>
            <View style={styles.securityTitleContainer}>
              <Text style={styles.securityTitle}>
                {biometricType === 'FaceID' ? 'Face ID' : 'Vân tay'}
              </Text>
              <Text style={styles.securitySub}>
                {biometricActive ? 'Đang bật' : 'Đã tắt'}
              </Text>
            </View>
            <Switch
              value={biometricActive}
              onValueChange={handleToggleBiometric}
              disabled={switchingBiometric || !biometricAvailable}
              trackColor={{ false: '#cbd5e1', true: '#bae6fd' }}
              thumbColor={biometricActive ? '#0090e7' : '#f8fafc'}
            />
          </View>
          <Text style={styles.securityDesc}>
            {biometricAvailable
              ? 'Đăng nhập nhanh không cần nhập mật khẩu.'
              : 'Thiết bị không hỗ trợ sinh trắc học.'}
          </Text>
        </View>

        {/* Card Cập nhật trực tuyến (OTA Hot Update) */}
        <View style={styles.otaCard}>
          <View style={styles.otaHeaderRow}>
            <View style={styles.otaIconBadge}>
              <Text style={styles.otaIconText}>⚡</Text>
            </View>
            <View style={styles.otaTitleContainer}>
              <Text style={styles.otaTitle}>Cập nhật trực tuyến (OTA)</Text>
              <Text style={styles.otaSub}>
                Phiên bản Bundle: {bundleInfo?.bundleVersion || '1.0.0-base'}
              </Text>
            </View>
            {bundleInfo?.isOtaActive && (
              <View style={styles.activeOtaBadge}>
                <Text style={styles.activeOtaText}>Đang dùng OTA</Text>
              </View>
            )}
          </View>

          <Text style={styles.otaDesc}>
            Cập nhật tức thì giao diện, xử lý nghiệp vụ và sửa lỗi trực tuyến mà không cần cài lại ứng dụng.
          </Text>

          <View style={styles.otaActionRow}>
            <TouchableOpacity
              style={[styles.otaButton, checkingUpdate && styles.otaButtonDisabled]}
              activeOpacity={0.8}
              onPress={handleCheckUpdate}
              disabled={checkingUpdate}
            >
              {checkingUpdate ? (
                <ActivityIndicator color="#007AFF" size="small" />
              ) : (
                <Text style={styles.otaButtonText}>Kiểm tra cập nhật ngay</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Nút Đăng xuất hệ thống đỏ nhạt */}
        <TouchableOpacity style={styles.logoutButton} activeOpacity={0.8} onPress={handleLogout}>
          <LogoutIcon size={20} color="#ef4444" />
          <Text style={styles.logoutText}>Đăng xuất hệ thống</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal Cập nhật OTA */}
      <OtaUpdateModal
        visible={showOtaModal}
        updateInfo={updateResult}
        onClose={() => setShowOtaModal(false)}
        onSuccess={() => {
          setShowOtaModal(false);
          loadBundleInfo();
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#dff1fd',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  contentContainer: {
    paddingBottom: 150,
  },
  profileCard: {
    marginHorizontal: 16,
    marginTop: 20,
    backgroundColor: '#ffffff',
    borderRadius: 32,
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  avatarSquircle: {
    width: 96,
    height: 96,
    borderRadius: 30,
    backgroundColor: '#f0f7ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarLetter: {
    fontFamily: FONT_FAMILY,
    fontSize: 34,
    fontWeight: '700',
    color: '#0090e7',
  },
  fullName: {
    fontFamily: FONT_FAMILY,
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.3,
    marginBottom: 4,
    textAlign: 'center',
  },
  roleText: {
    fontFamily: FONT_FAMILY,
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
    marginBottom: 24,
    textAlign: 'center',
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#f1f5f9',
    marginBottom: 20,
  },
  metaRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaCol: {
    flex: 1,
    alignItems: 'center',
  },
  metaLabel: {
    fontFamily: FONT_FAMILY,
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  extValue: {
    fontFamily: FONT_FAMILY,
    fontSize: 20,
    fontWeight: '700',
    color: '#0090e7',
  },
  verticalDivider: {
    width: 1,
    height: 38,
    backgroundColor: '#f1f5f9',
  },
  deptValue: {
    fontFamily: FONT_FAMILY,
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  otaCard: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  otaHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  otaIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  otaIconText: {
    fontSize: 20,
  },
  otaTitleContainer: {
    flex: 1,
  },
  otaTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  otaSub: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 2,
  },
  activeOtaBadge: {
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  activeOtaText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  otaDesc: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
    marginBottom: 14,
  },
  otaActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  otaButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#f0f7ff',
    borderWidth: 1,
    borderColor: '#bae6fd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  otaButtonDisabled: {
    opacity: 0.6,
  },
  otaButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0284c7',
  },
  resetButton: {
    paddingHorizontal: 14,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
  },
  securityCard: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  securityHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  securityIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f0f7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  securityTitleContainer: {
    flex: 1,
  },
  securityTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  securitySub: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0284c7',
    marginTop: 2,
  },
  securityDesc: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
  },
  logoutButton: {
    marginHorizontal: 16,
    marginTop: 16,
    height: 56,
    borderRadius: 20,
    backgroundColor: '#fef2f2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ef4444',
    marginLeft: 8,
  },
});
