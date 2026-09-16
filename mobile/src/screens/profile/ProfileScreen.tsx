import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useAuthStore } from '../../store/useAuthStore';
import { COLORS } from '../../constants/colors';
import { APP_CONFIG } from '../../config';

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

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <Header title="Hồ Sơ Cán Bộ Tác Nghiệp" />

      <ScrollView contentContainerStyle={styles.content}>
        {/* User Card */}
        <Card style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.fullName?.slice(0, 1) || 'U'}
            </Text>
          </View>
          <Text style={styles.fullName}>{user?.fullName || 'Cán bộ tuần tra'}</Text>
          <Text style={styles.role}>{user?.role || 'Đội tuần tra'}</Text>

          <View style={styles.extensionBadge}>
            <Text style={styles.extensionLabel}>Số Extension PBX:</Text>
            <Text style={styles.extensionValue}>{user?.extension || '2011'}</Text>
          </View>
        </Card>

        {/* Details Card */}
        <Card style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Thông Tin Đơn Vị</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Tài khoản:</Text>
            <Text style={styles.value}>{user?.username || 'tuan_tra_01'}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Đơn vị:</Text>
            <Text style={styles.value}>{user?.department || 'Ban Vận Hành VEC'}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Hotline cứu hộ:</Text>
            <Text style={[styles.value, { color: COLORS.danger, fontWeight: '700' }]}>
              {APP_CONFIG.sosHotline}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Tuyến phụ trách:</Text>
            <Text style={styles.value}>{APP_CONFIG.highwayTitle}</Text>
          </View>
        </Card>

        {/* App Info Card */}
        <Card style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Thông Tin Ứng Dụng</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Tên app:</Text>
            <Text style={styles.value}>ITS Mobile VEC (MF-MobiSuite)</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Phiên bản:</Text>
            <Text style={styles.value}>1.0.0 Fast-Track (RN CLI)</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Cổng máy chủ:</Text>
            <Text style={styles.value}>{APP_CONFIG.apiBaseUrl}</Text>
          </View>
        </Card>

        {/* Logout Button */}
        <Button
          title="ĐĂNG XUẤT"
          variant="danger"
          onPress={handleLogout}
          size="lg"
          style={styles.logoutBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.gray50,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  profileCard: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 16,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  fullName: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.gray900,
    marginBottom: 4,
  },
  role: {
    fontSize: 13,
    color: COLORS.gray500,
    marginBottom: 14,
  },
  extensionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primarySubtle,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  extensionLabel: {
    fontSize: 12,
    color: COLORS.gray600,
    marginRight: 6,
  },
  extensionValue: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  infoCard: {
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.gray800,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
    paddingBottom: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  label: {
    fontSize: 13,
    color: COLORS.gray500,
    flex: 1,
  },
  value: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.gray800,
    flex: 2,
    textAlign: 'right',
  },
  logoutBtn: {
    marginTop: 8,
  },
});
