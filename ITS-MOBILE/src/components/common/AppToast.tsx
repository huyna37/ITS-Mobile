import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
  Dimensions,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useToastStore, ToastItem, DialogItem, ToastType } from '../../store/useToastStore';
import { COLORS } from '../../constants/colors';

// ==========================================
// Vector Icons cho Thông báo & Dialog
// ==========================================
const ToastIcon: React.FC<{ type: ToastType; size?: number }> = ({ type, size = 20 }) => {
  switch (type) {
    case 'error':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="10" fill="#EF4444" />
          <Path d="M12 7v6M12 16.5v.5" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
        </Svg>
      );
    case 'success':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="10" fill="#10B981" />
          <Path d="M8 12l2.5 2.5L16 9" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
    case 'warning':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="10" fill="#F59E0B" />
          <Path d="M12 8v5M12 16v.5" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
        </Svg>
      );
    case 'info':
    default:
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="10" fill="#0284C7" />
          <Path d="M12 8v.5M12 11.5v5" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
        </Svg>
      );
  }
};

const CloseIcon: React.FC<{ size?: number; color?: string }> = ({ size = 16, color = '#64748b' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M18 6L6 18M6 6l12 12" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// ==========================================
// Toast Item Component (Thẻ thông báo nổi)
// ==========================================
const ToastCard: React.FC<{ toast: ToastItem; onDismiss: () => void }> = ({ toast, onDismiss }) => {
  const isError = toast.type === 'error';
  const isSuccess = toast.type === 'success';
  const isWarning = toast.type === 'warning';

  const borderColor = isError
    ? '#FCA5A5'
    : isSuccess
    ? '#86EFAC'
    : isWarning
    ? '#FDE68A'
    : '#BAE6FD';

  const bgColor = isError
    ? '#FFF1F2'
    : isSuccess
    ? '#F0FDF4'
    : isWarning
    ? '#FFFBEB'
    : '#F0F9FF';

  const titleColor = isError
    ? '#991B1B'
    : isSuccess
    ? '#065F46'
    : isWarning
    ? '#92400E'
    : '#075985';

  return (
    <View style={[styles.toastCard, { backgroundColor: bgColor, borderColor }]}>
      <View style={styles.toastIconWrap}>
        <ToastIcon type={toast.type} size={24} />
      </View>

      <View style={styles.toastContent}>
        <Text style={[styles.toastTitle, { color: titleColor }]} numberOfLines={1}>
          {toast.title}
        </Text>
        <Text style={styles.toastMessage}>{toast.message}</Text>
      </View>

      <TouchableOpacity
        style={styles.toastCloseBtn}
        onPress={onDismiss}
        activeOpacity={0.7}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <CloseIcon size={16} color="#64748b" />
      </TouchableOpacity>
    </View>
  );
};

// ==========================================
// Dialog Modal Component (Hộp thoại xác nhận sang trọng)
// ==========================================
const DialogCard: React.FC<{ dialog: DialogItem; onClose: () => void }> = ({ dialog, onClose }) => {
  return (
    <Modal
      transparent
      visible={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <View style={styles.modalIconWrap}>
              <ToastIcon type={dialog.type || 'info'} size={32} />
            </View>
            <Text style={styles.modalTitle}>{dialog.title}</Text>
          </View>

          <Text style={styles.modalMessage}>{dialog.message}</Text>

          <View style={styles.modalActions}>
            {dialog.buttons?.map((btn, idx) => {
              const isDestructive = btn.style === 'destructive';
              const isCancel = btn.style === 'cancel';

              return (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.modalBtn,
                    isDestructive && styles.modalBtnDestructive,
                    isCancel && styles.modalBtnCancel,
                  ]}
                  activeOpacity={0.8}
                  onPress={() => {
                    onClose();
                    btn.onPress?.();
                  }}
                >
                  <Text
                    style={[
                      styles.modalBtnText,
                      isDestructive && styles.modalBtnTextDestructive,
                      isCancel && styles.modalBtnTextCancel,
                    ]}
                  >
                    {btn.text}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ==========================================
// Root Notification Container
// ==========================================
export const AppToast: React.FC = () => {
  const { toasts, dialog, hideToast, hideDialog } = useToastStore();

  return (
    <>
      {/* Toast Banner ở góc trên cùng */}
      {toasts.length > 0 ? (
        <View style={styles.toastContainer} pointerEvents="box-none">
          {toasts.map((toast) => (
            <ToastCard
              key={toast.id}
              toast={toast}
              onDismiss={() => hideToast(toast.id)}
            />
          ))}
        </View>
      ) : null}

      {/* Modal Dialog trung tâm */}
      {dialog ? <DialogCard dialog={dialog} onClose={hideDialog} /> : null}
    </>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 52 : 24,
    left: 16,
    right: 16,
    alignItems: 'center',
    zIndex: 999999,
  },
  toastCard: {
    width: Math.min(width - 32, 460),
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    marginBottom: 10,
    ...Platform.select({
      web: {
        boxShadow: '0 12px 28px -4px rgba(0, 0, 0, 0.16), 0 4px 10px -2px rgba(0, 0, 0, 0.08)',
      },
      default: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.18,
        shadowRadius: 12,
        elevation: 8,
      },
    }),
  },
  toastIconWrap: {
    marginRight: 12,
    marginTop: 1,
  },
  toastContent: {
    flex: 1,
    paddingRight: 6,
  },
  toastTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 3,
    letterSpacing: 0.2,
  },
  toastMessage: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 18,
    fontWeight: '500',
  },
  toastCloseBtn: {
    padding: 4,
    marginTop: -2,
    borderRadius: 6,
  },

  // Modal Dialog
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    zIndex: 9999999,
  },
  modalContent: {
    width: Math.min(width - 48, 420),
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    ...Platform.select({
      web: {
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
      },
      default: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.25,
        shadowRadius: 24,
        elevation: 12,
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalIconWrap: {
    marginRight: 12,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
    flex: 1,
  },
  modalMessage: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    backgroundColor: '#0097f0',
  },
  modalBtnDestructive: {
    backgroundColor: '#ef4444',
  },
  modalBtnCancel: {
    backgroundColor: '#f1f5f9',
  },
  modalBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  modalBtnTextDestructive: {
    color: '#ffffff',
  },
  modalBtnTextCancel: {
    color: '#475569',
  },
});
