import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { PhoneHandsetIcon } from '../icons/SvgIcons';
import { performSOSCall } from '../../utils/dialer';
import { APP_CONFIG } from '../../config';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const FloatingSOS: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 14);
  const floatingBottom = 62 + bottomInset + 14;

  const handleConfirmCall = () => {
    setModalVisible(false);
    performSOSCall(APP_CONFIG.sosHotline);
  };

  return (
    <>
      {/* Nút nổi gọi khẩn cấp hình tròn đỏ có icon điện thoại - Z-Index cao nhất */}
      <TouchableOpacity
        activeOpacity={0.85}
        style={[styles.floatingButton, { bottom: floatingBottom }]}
        onPress={() => setModalVisible(true)}
      >
        <View style={styles.phoneIconWrap}>
          <PhoneHandsetIcon size={26} color="#ffffff" />
        </View>
      </TouchableOpacity>

      {/* Modal xác nhận gọi khẩn cấp chuẩn thiết kế */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalCard}>
                <View style={styles.badgeRow}>
                  <View style={styles.sosBadge}>
                    <Text style={styles.sosBadgeText}>KHẨN CẤP GSM</Text>
                  </View>
                </View>
                <Text style={styles.modalTitle}>GỌI CỨU HỘ KHẨN CẤP SOS</Text>
                <Text style={styles.modalBody}>
                  Ứng dụng sẽ kết nối trực tiếp đến số khẩn cấp{' '}
                  <Text style={styles.hotlineHighlight}>{APP_CONFIG.sosHotline}</Text> qua mạng
                  viễn thông di động GSM. Cuộc gọi hoạt động bình thường ngay cả khi không có
                  Internet hay bật chế độ máy bay (chỉ cần có sóng di động).
                </Text>

                <View style={styles.modalButtonsRow}>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    activeOpacity={0.7}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.cancelBtnText}>Hủy bỏ</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.confirmBtn}
                    activeOpacity={0.8}
                    onPress={handleConfirmCall}
                  >
                    <Text style={styles.confirmBtnText}>Xác nhận gọi</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    right: 20,
    bottom: 86, // Nổi phía trên thanh bottom tabs
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#dc2626',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 9999,
    zIndex: 99999,
  },
  phoneIconWrap: {
    transform: [{ rotate: '-35deg' }],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 28,
    padding: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 12,
  },
  modalBody: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
    marginBottom: 24,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  confirmBtn: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#dc2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  sosBadge: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  sosBadgeText: {
    color: '#dc2626',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  hotlineHighlight: {
    fontWeight: '800',
    color: '#dc2626',
  },
});
