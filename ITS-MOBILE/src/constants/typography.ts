import { Platform, TextStyle } from 'react-native';

/**
 * Hệ thống font chữ chuẩn quốc tế tối ưu riêng cho tiếng Việt.
 * - Web: Ưu tiên 'Be Vietnam Pro' (font thiết kế chuyên biệt cho dấu thanh tiếng Việt).
 * - iOS: 'System' (San Francisco / SF Pro của Apple, chuẩn 100% native, không lỗi link font, hiển thị dấu cực đẹp).
 * - Android: 'sans-serif' (Roboto chuẩn Google, không lỗi link file TTF khi build APK/AAB).
 */
export const FONT_FAMILY = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  web: "'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  default: 'System',
});

export const FONT_WEIGHTS = {
  regular: '400' as TextStyle['fontWeight'],
  medium: '500' as TextStyle['fontWeight'],
  semiBold: '600' as TextStyle['fontWeight'],
  bold: '700' as TextStyle['fontWeight'],
  extraBold: '800' as TextStyle['fontWeight'],
};

export const TYPOGRAPHY = {
  headerTitle: {
    fontFamily: FONT_FAMILY,
    fontSize: 24,
    fontWeight: '700' as TextStyle['fontWeight'],
    letterSpacing: -0.4,
    color: '#0f172a',
  },
  sectionTitle: {
    fontFamily: FONT_FAMILY,
    fontSize: 22,
    fontWeight: '700' as TextStyle['fontWeight'],
    letterSpacing: -0.3,
    color: '#0f172a',
  },
  sectionSubtitle: {
    fontFamily: FONT_FAMILY,
    fontSize: 13,
    fontWeight: '500' as TextStyle['fontWeight'],
    color: '#64748b',
    marginTop: 3,
  },
  cardTitle: {
    fontFamily: FONT_FAMILY,
    fontSize: 16,
    fontWeight: '700' as TextStyle['fontWeight'],
    letterSpacing: -0.2,
    color: '#0f172a',
  },
  subHeaderTitle: {
    fontFamily: FONT_FAMILY,
    fontSize: 17,
    fontWeight: '700' as TextStyle['fontWeight'],
    color: '#0f172a',
  },
  body: {
    fontFamily: FONT_FAMILY,
    fontSize: 14,
    fontWeight: '400' as TextStyle['fontWeight'],
    color: '#334155',
  },
  bodyMedium: {
    fontFamily: FONT_FAMILY,
    fontSize: 14,
    fontWeight: '500' as TextStyle['fontWeight'],
    color: '#334155',
  },
  caption: {
    fontFamily: FONT_FAMILY,
    fontSize: 13,
    fontWeight: '500' as TextStyle['fontWeight'],
    color: '#64748b',
  },
  meta: {
    fontFamily: FONT_FAMILY,
    fontSize: 12,
    fontWeight: '500' as TextStyle['fontWeight'],
    color: '#64748b',
  },
  badge: {
    fontFamily: FONT_FAMILY,
    fontSize: 11,
    fontWeight: '700' as TextStyle['fontWeight'],
    letterSpacing: 0.3,
  },
};
