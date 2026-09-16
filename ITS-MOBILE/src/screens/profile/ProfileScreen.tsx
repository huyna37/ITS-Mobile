import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HighwayHeader } from '../../components/shared/HighwayHeader';
import { LogoutIcon } from '../../components/icons/SvgIcons';
import { useAuthStore } from '../../store/useAuthStore';

export const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert(
      'ĐĂNG XUẤT HỆ THỐNG',
      'Bạn có chắc chắn muốn đăng xuất khỏi ứng dụng tác nghiệp không?',
      [
        { text: 'Hủy bỏ', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: () => logout(),
        },
      ]
    );
  };

  const displayName = user?.fullName ? user.fullName : 'Nguyễn Minh Hoàng';
  const displayRole = user?.role ? user.role : 'Nhân viên tuần tra';
  const displayExt = user?.extension ? user.extension : '1001';
  const displayDept = user?.department ? user.department : 'Trạm NB-01';

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Header cao tốc chuẩn thiết kế */}
        <HighwayHeader showSearch={false} />

        {/* Card hồ sơ cán bộ */}
        <View style={styles.profileCard}>
          {/* Avatar squircle xanh nhạt chữ N */}
          <View style={styles.avatarSquircle}>
            <Text style={styles.avatarLetter}>
              {displayName.charAt(0).toUpperCase()}
            </Text>
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

        {/* Nút Đăng xuất hệ thống đỏ nhạt */}
        <TouchableOpacity
          style={styles.logoutButton}
          activeOpacity={0.8}
          onPress={handleLogout}
        >
          <LogoutIcon size={20} color="#ef4444" />
          <Text style={styles.logoutText}>Đăng xuất hệ thống</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
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
    paddingBottom: 120,
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
    fontSize: 36,
    fontWeight: '900',
    color: '#0090e7',
  },
  fullName: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: -0.4,
    marginBottom: 4,
    textAlign: 'center',
  },
  roleText: {
    fontSize: 15,
    fontWeight: '600',
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
    fontSize: 11,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  extValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0090e7',
  },
  verticalDivider: {
    width: 1,
    height: 38,
    backgroundColor: '#f1f5f9',
  },
  deptValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0f172a',
  },
  logoutButton: {
    marginHorizontal: 16,
    marginTop: 20,
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
