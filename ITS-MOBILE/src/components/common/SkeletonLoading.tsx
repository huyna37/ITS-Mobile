import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Platform, StyleProp, ViewStyle } from 'react-native';

interface ShimmerElementProps {
  width: number | string;
  height: number | string;
  borderRadius?: number;
  variant?: 'default' | 'call' | 'missed' | 'avatar';
  style?: StyleProp<ViewStyle>;
}

export const ShimmerElement: React.FC<ShimmerElementProps> = ({
  width,
  height,
  borderRadius = 8,
  variant = 'default',
  style,
}) => {
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [pulseAnim]);

  const opacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.45, 0.95],
  });

  const getVariantClass = () => {
    switch (variant) {
      case 'call':
        return 'shimmer-box-call';
      case 'missed':
        return 'shimmer-box-missed';
      case 'avatar':
        return 'shimmer-box-avatar';
      default:
        return 'shimmer-box';
    }
  };

  const getVariantBaseStyle = () => {
    switch (variant) {
      case 'call':
        return styles.shimmerCall;
      case 'missed':
        return styles.shimmerMissed;
      case 'avatar':
        return styles.shimmerAvatar;
      default:
        return styles.shimmerDefault;
    }
  };

  return (
    <Animated.View
      // @ts-ignore on web className applies rich CSS linear-gradient shimmer wave
      className={getVariantClass()}
      style={[
        getVariantBaseStyle(),
        {
          width: width as any,
          height: height as any,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
};

// Cấu hình ngẫu nhiên/linh hoạt theo từng hàng trong tab Danh bạ (Directory)
const DIRECTORY_ROW_PRESETS = [
  { nameWidth: '45%', extWidth: '35%', isOnline: true },
  { nameWidth: '58%', extWidth: '40%', isOnline: true },
  { nameWidth: '36%', extWidth: '32%', isOnline: false },
  { nameWidth: '64%', extWidth: '42%', isOnline: true },
  { nameWidth: '48%', extWidth: '36%', isOnline: false },
  { nameWidth: '52%', extWidth: '38%', isOnline: true },
];

// Cấu hình ngẫu nhiên/linh hoạt theo từng hàng trong tab Lịch sử (History)
// Mô phỏng chuẩn xác các loại cuộc gọi: tên ngắn, tên sự cố khẩn cấp SOS dài, cuộc gọi nhỡ, v.v.
const HISTORY_ROW_PRESETS = [
  { nameWidth: '44%', extWidth: '58%', durationWidth: 32, isMissed: false }, // Hoai Anh · 15:18 · 45s
  { nameWidth: '82%', extWidth: '64%', durationWidth: 34, isMissed: false }, // CỨU HỘ KHẨN CẤP SOS (113) - ... · 45s
  { nameWidth: '78%', extWidth: '62%', durationWidth: 32, isMissed: false }, // CỨU HỘ KHẨN CẤP SOS (113) - ... · 45s
  { nameWidth: '54%', extWidth: '66%', durationWidth: 26, isMissed: true },  // Nguyen Van Hung · Nhỡ (đỏ)
  { nameWidth: '80%', extWidth: '60%', durationWidth: 32, isMissed: false }, // CỨU HỘ KHẨN CẤP SOS (113) - ... · 45s
  { nameWidth: '50%', extWidth: '56%', durationWidth: 42, isMissed: false }, // Nguyen Van Hung · 1p 20s
];

interface ContactItemSkeletonProps {
  type?: 'DIRECTORY' | 'HISTORY';
  rowIndex?: number;
}

export const ContactItemSkeleton: React.FC<ContactItemSkeletonProps> = ({
  type = 'DIRECTORY',
  rowIndex = 0,
}) => {
  if (type === 'DIRECTORY') {
    const preset = DIRECTORY_ROW_PRESETS[rowIndex % DIRECTORY_ROW_PRESETS.length];

    return (
      <View style={styles.rowContainer}>
        {/* Avatar Squircle (có chấm xanh online mô phỏng giống thật) */}
        <View style={styles.avatarWrapper}>
          <ShimmerElement
            width={52}
            height={52}
            borderRadius={18}
            variant="avatar"
            style={styles.avatar}
          />
          {preset.isOnline ? <View style={styles.onlineDot} /> : null}
        </View>

        {/* Thông tin Contact (Tên + Số Extension) */}
        <View style={styles.infoCol}>
          <ShimmerElement
            width={preset.nameWidth}
            height={16}
            borderRadius={6}
            style={styles.nameLine}
          />
          <ShimmerElement
            width={preset.extWidth}
            height={12}
            borderRadius={5}
            style={styles.extLine}
          />
        </View>

        {/* Nút gọi điện PBX bo tròn màu xanh nhạt */}
        <ShimmerElement
          width={48}
          height={48}
          borderRadius={16}
          variant="call"
          style={styles.callButton}
        />
      </View>
    );
  }

  // Type: HISTORY
  const preset = HISTORY_ROW_PRESETS[rowIndex % HISTORY_ROW_PRESETS.length];

  return (
    <View style={styles.rowContainer}>
      {/* Avatar Squircle (Lịch sử không có chấm xanh) */}
      <View style={styles.avatarWrapper}>
        <ShimmerElement
          width={52}
          height={52}
          borderRadius={18}
          variant="avatar"
          style={styles.avatar}
        />
      </View>

      {/* Thông tin cuộc gọi (Tên đồng nghiệp/sự cố + Ext & Giờ gọi VN) */}
      <View style={styles.infoCol}>
        <ShimmerElement
          width={preset.nameWidth}
          height={16}
          borderRadius={6}
          style={styles.nameLine}
        />
        <ShimmerElement
          width={preset.extWidth}
          height={12}
          borderRadius={5}
          style={styles.extLine}
        />
      </View>

      {/* Nhãn thời lượng cuộc gọi bên phải (ví dụ: 45s, hoặc cuộc gọi Nhỡ màu đỏ) */}
      <View style={styles.durationWrapper}>
        <ShimmerElement
          width={preset.durationWidth}
          height={15}
          borderRadius={5}
          variant={preset.isMissed ? 'missed' : 'default'}
        />
      </View>
    </View>
  );
};

interface ContactListSkeletonProps {
  count?: number;
  type?: 'DIRECTORY' | 'HISTORY';
}

interface NotificationItemSkeletonProps {
  rowIndex?: number;
}

const NOTIFICATION_ROW_PRESETS = [
  { titleWidth: '62%', timeWidth: 42, body1Width: '95%', body2Width: '68%' },
  { titleWidth: '78%', timeWidth: 38, body1Width: '88%', body2Width: '54%' },
  { titleWidth: '52%', timeWidth: 46, body1Width: '92%', body2Width: '70%' },
  { titleWidth: '70%', timeWidth: 40, body1Width: '86%', body2Width: '58%' },
  { titleWidth: '58%', timeWidth: 44, body1Width: '90%', body2Width: '48%' },
];

export const NotificationItemSkeleton: React.FC<NotificationItemSkeletonProps> = ({
  rowIndex = 0,
}) => {
  const preset = NOTIFICATION_ROW_PRESETS[rowIndex % NOTIFICATION_ROW_PRESETS.length];

  return (
    <View style={styles.notifCard}>
      {/* Icon Squircle chuông thông báo */}
      <ShimmerElement
        width={48}
        height={48}
        borderRadius={16}
        variant="call"
        style={styles.notifIcon}
      />

      {/* Nội dung thông báo (Tiêu đề + Giờ + 2 dòng nội dung) */}
      <View style={styles.notifContent}>
        <View style={styles.notifTopRow}>
          <ShimmerElement
            width={preset.titleWidth}
            height={16}
            borderRadius={6}
            style={styles.notifTitle}
          />
          <ShimmerElement
            width={preset.timeWidth}
            height={12}
            borderRadius={5}
          />
        </View>

        <ShimmerElement
          width={preset.body1Width}
          height={12}
          borderRadius={5}
          style={styles.notifBodyLine1}
        />
        <ShimmerElement
          width={preset.body2Width}
          height={12}
          borderRadius={5}
        />
      </View>
    </View>
  );
};

interface NotificationListSkeletonProps {
  count?: number;
}

export const NotificationListSkeleton: React.FC<NotificationListSkeletonProps> = ({
  count = 5,
}) => {
  return (
    <View style={styles.listContainer}>
      {Array.from({ length: count }).map((_, index) => (
        <NotificationItemSkeleton key={index} rowIndex={index} />
      ))}
    </View>
  );
};

export const ContactListSkeleton: React.FC<ContactListSkeletonProps> = ({
  count = 6,
  type = 'DIRECTORY',
}) => {
  return (
    <View style={styles.listContainer}>
      {Array.from({ length: count }).map((_, index) => (
        <React.Fragment key={index}>
          <ContactItemSkeleton type={type} rowIndex={index} />
          {index < count - 1 ? <View style={styles.rowDivider} /> : null}
        </React.Fragment>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    width: '100%',
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 14,
  },
  avatar: {
    marginRight: 0,
  },
  onlineDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22c55e',
    borderWidth: 2,
    borderColor: '#ffffff',
    zIndex: 2,
  },
  infoCol: {
    flex: 1,
    justifyContent: 'center',
  },
  nameLine: {
    marginBottom: 7,
  },
  extLine: {
    marginTop: 2,
  },
  callButton: {
    marginLeft: 12,
  },
  durationWrapper: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginLeft: 12,
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
  },
  notifCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#f1f5f9',
  },
  notifIcon: {
    marginRight: 14,
  },
  notifContent: {
    flex: 1,
  },
  notifTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  notifTitle: {
    marginRight: 8,
  },
  notifBodyLine1: {
    marginBottom: 6,
  },
  shimmerDefault: {
    backgroundColor: '#e2e8f0',
    overflow: 'hidden',
  },
  shimmerAvatar: {
    backgroundColor: '#f1f5f9',
    overflow: 'hidden',
  },
  shimmerCall: {
    backgroundColor: '#e0f2fe',
    overflow: 'hidden',
  },
  shimmerMissed: {
    backgroundColor: '#fee2e2',
    overflow: 'hidden',
  },
});
