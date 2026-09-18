import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { FONT_FAMILY } from '../../constants';
import { DialogItem, ToastItem, ToastType, useToastStore } from '../../store/useToastStore';

// ==========================================
// Vector Icons Cao Cấp Cho Toast
// ==========================================
const ToastIcon: React.FC<{ type: ToastType; size?: number }> = ({ type, size = 22 }) => {
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
          <Path
            d="M8 12.2l2.6 2.6L16.2 9"
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
    case 'warning':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="10" fill="#F59E0B" />
          <Path d="M12 8v5M12 16.2v.5" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
        </Svg>
      );
    case 'info':
    default:
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="10" fill="#0090E7" />
          <Path d="M12 8v.5M12 11.5v5" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
        </Svg>
      );
  }
};

const CloseIcon: React.FC<{ size?: number; color?: string }> = ({ size = 16, color = '#94a3b8' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 6L6 18M6 6l12 12"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ==========================================
// Swipeable Toast Card (Vuốt trái / phải để xóa)
// ==========================================
const SwipeableToastCard: React.FC<{ toast: ToastItem; onDismiss: () => void }> = ({
  toast,
  onDismiss,
}) => {
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-60)).current;
  const isDismissing = useRef(false);

  // Hiệu ứng trượt mượt mà từ trên xuống khi xuất hiện
  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        tension: 70,
        friction: 9,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const triggerDismiss = (direction: 'left' | 'right' | 'up' = 'right') => {
    if (isDismissing.current) return;
    isDismissing.current = true;

    const targetX = direction === 'right' ? 500 : direction === 'left' ? -500 : 0;
    const targetY = direction === 'up' ? -100 : 0;

    Animated.parallel([
      Animated.timing(pan, {
        toValue: { x: targetX, y: targetY },
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  // Cấu hình cử chỉ vuốt ngang / vuốt lên
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Chỉ nhận khi kéo ngang đáng kể (> 8px) hoặc kéo lên
        return Math.abs(gestureState.dx) > 8 || gestureState.dy < -8;
      },
      onPanResponderMove: (_, gestureState) => {
        if (isDismissing.current) return;
        // Cho phép trượt tự do theo chiều ngang, giới hạn chiều dọc chỉ kéo lên
        const dy = gestureState.dy < 0 ? gestureState.dy : gestureState.dy * 0.15;
        pan.setValue({ x: gestureState.dx, y: dy });
      },
      onPanResponderRelease: (_, gestureState) => {
        if (isDismissing.current) return;
        const { dx, dy, vx } = gestureState;

        const isQuickFlingRight = dx > 25 && vx > 0.35;
        const isQuickFlingLeft = dx < -25 && vx < -0.35;
        const isDragRight = dx > 70;
        const isDragLeft = dx < -70;
        const isDragUp = dy < -35;

        if (isQuickFlingRight || isDragRight) {
          triggerDismiss('right');
        } else if (isQuickFlingLeft || isDragLeft) {
          triggerDismiss('left');
        } else if (isDragUp) {
          triggerDismiss('up');
        } else {
          // Bật trở lại vị trí cũ khi chưa đạt ngưỡng vuốt
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            tension: 80,
            friction: 8,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  // Kiểu màu sắc theo từng loại Toast (chỉ giữ màu sắc cho Icon và Tiêu đề)
  const theme = {
    error: {
      badgeBg: '#fef2f2',
      titleColor: '#ef4444',
    },
    success: {
      badgeBg: '#f0fdf4',
      titleColor: '#10b981',
    },
    warning: {
      badgeBg: '#fffbeb',
      titleColor: '#f59e0b',
    },
    info: {
      badgeBg: '#f0f9ff',
      titleColor: '#0090e7',
    },
  }[toast.type || 'info'];

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.toastCard,
        {
          transform: [
            { translateX: pan.x },
            { translateY: Animated.add(translateY, pan.y) },
          ],
          opacity,
        },
      ]}
    >
      {/* Icon squircle bo tròn */}
      <View
        style={[
          styles.toastIconWrap,
          { backgroundColor: theme.badgeBg },
        ]}
      >
        <ToastIcon type={toast.type} size={22} />
      </View>

      {/* Nội dung thông báo */}
      <View style={styles.toastContent}>
        <Text style={[styles.toastTitle, { color: theme.titleColor }]} numberOfLines={1}>
          {toast.title}
        </Text>
        <Text style={styles.toastMessage}>{toast.message}</Text>
      </View>

      {/* Nút đóng nhanh */}
      <TouchableOpacity
        style={styles.toastCloseBtn}
        onPress={() => triggerDismiss('right')}
        activeOpacity={0.6}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <CloseIcon size={16} color="#94a3b8" />
      </TouchableOpacity>

      {/* Vạch nhỏ chỉ dẫn vuốt tắt ở cạnh dưới */}
      <View style={styles.swipeIndicatorWrap}>
        <View style={styles.swipeIndicatorBar} />
      </View>
    </Animated.View>
  );
};

// ==========================================
// Dialog Modal Component (Hộp thoại xác nhận)
// ==========================================
const DialogCard: React.FC<{ dialog: DialogItem; onClose: () => void }> = ({ dialog, onClose }) => {
  return (
    <Modal transparent visible={true} animationType="fade" onRequestClose={onClose}>
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
      {/* Toast Notification Container nổi ở đỉnh màn hình */}
      {toasts.length > 0 ? (
        <View style={styles.toastContainer} pointerEvents="box-none">
          {toasts.map((toast) => (
            <SwipeableToastCard
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
    top: Platform.OS === 'ios' ? 56 : Platform.OS === 'web' ? 24 : 36,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 999999,
  },
  toastCard: {
    width: Math.min(width - 32, 420),
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    overflow: 'hidden',
    position: 'relative',
    ...Platform.select({
      web: {
        boxShadow:
          '0 20px 32px -8px rgba(15, 23, 42, 0.12), 0 6px 14px -4px rgba(15, 23, 42, 0.05)',
        cursor: 'pointer',
        userSelect: 'none',
      },
      default: {
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 8,
      },
    }),
  },
  toastIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginLeft: 2,
  },
  toastContent: {
    flex: 1,
    paddingRight: 8,
  },
  toastTitle: {
    fontFamily: FONT_FAMILY,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
    letterSpacing: 0.1,
  },
  toastMessage: {
    fontFamily: FONT_FAMILY,
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    fontWeight: '500',
  },
  toastCloseBtn: {
    padding: 6,
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  swipeIndicatorWrap: {
    position: 'absolute',
    bottom: 3,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swipeIndicatorBar: {
    width: 28,
    height: 2.5,
    borderRadius: 2,
    backgroundColor: '#e2e8f0',
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
    borderRadius: 24,
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
    fontFamily: FONT_FAMILY,
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
    flex: 1,
  },
  modalMessage: {
    fontFamily: FONT_FAMILY,
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
    paddingVertical: 11,
    paddingHorizontal: 18,
    borderRadius: 12,
    backgroundColor: '#0090e7',
  },
  modalBtnDestructive: {
    backgroundColor: '#ef4444',
  },
  modalBtnCancel: {
    backgroundColor: '#f1f5f9',
  },
  modalBtnText: {
    fontFamily: FONT_FAMILY,
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  modalBtnTextDestructive: {
    color: '#ffffff',
  },
  modalBtnTextCancel: {
    color: '#475569',
  },
});
