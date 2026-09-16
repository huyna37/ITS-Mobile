import React from 'react';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
}

/** Biểu tượng phi thuyền / Paper Airplane chuẩn thiết kế VEC */
export const PaperPlaneIcon: React.FC<IconProps> = ({ size = 20, color = '#ffffff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"
      fill={color}
    />
  </Svg>
);

/** Biểu tượng kính lúp tìm kiếm */
export const SearchIcon: React.FC<IconProps> = ({ size = 20, color = '#475569' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="11" cy="11" r="7" stroke={color} strokeWidth="2.2" />
    <Path d="M20 20L16 16" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
  </Svg>
);

/** Biểu tượng tai nghe điện thoại */
export const PhoneHandsetIcon: React.FC<IconProps> = ({ size = 22, color = '#ffffff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a1 1 0 00-1.01.24l-2.2 2.2a15.05 15.05 0 01-6.59-6.59l2.2-2.21a1 1 0 00.25-1.01A11.36 11.36 0 018.57 3.99c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.61c0-.55-.45-1-.99-1z"
      fill={color}
    />
  </Svg>
);

/** Biểu tượng Clipboard / Nhiệm vụ tab */
export const TaskClipboardIcon: React.FC<IconProps> = ({ size = 24, color = '#94a3b8' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="5" y="4" width="14" height="17" rx="2.5" stroke={color} strokeWidth="2" />
    <Path d="M9 4V3a1 1 0 011-1h4a1 1 0 011 1v1" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M9 9h6M9 13h6M9 17h4" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

/** Biểu tượng Chuông thông báo */
export const BellIcon: React.FC<IconProps> = ({ size = 24, color = '#94a3b8' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

/** Biểu tượng Tài khoản / Tôi */
export const UserIcon: React.FC<IconProps> = ({ size = 24, color = '#94a3b8' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="12" cy="7" r="4" stroke={color} strokeWidth="2" />
  </Svg>
);

/** Biểu tượng Mũi tên qua phải Chevron */
export const ChevronRightIcon: React.FC<IconProps> = ({ size = 18, color = '#cbd5e1' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M9 18l6-6-6-6" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

/** Biểu tượng Quay lại Mũi tên trái */
export const ChevronLeftIcon: React.FC<IconProps> = ({ size = 22, color = '#0f172a' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M15 19l-7-7 7-7" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

/** Biểu tượng Checkmark hình tròn */
export const CheckCircleIcon: React.FC<IconProps> = ({ size = 28, color = '#16a34a' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2.2" />
    <Path d="M8 12.5l2.5 2.5 5.5-5.5" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

/** Biểu tượng Rào chắn bảo trì 🚧 */
export const BarrierIcon: React.FC<IconProps> = ({ size = 22, color = '#f59e0b' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M4 6h16M4 12h16M7 6v12M17 6v12M5 18h4M15 18h4" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
    <Path d="M8 6l4 6M12 6l4 6M8 12l4 6" stroke={color} strokeWidth="1.8" />
  </Svg>
);

/** Biểu tượng Đám mây mưa thời tiết 🌧️ */
export const CloudRainIcon: React.FC<IconProps> = ({ size = 22, color = '#0284c7' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 16.58A5 5 0 0018 7h-1.26A8 8 0 104 15.25"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path d="M8 19v2M12 18v3M16 19v2" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

/** Biểu tượng Máy ảnh Camera */
export const CameraIcon: React.FC<IconProps> = ({ size = 24, color = '#475569' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="12" cy="13" r="4" stroke={color} strokeWidth="2" />
  </Svg>
);

/** Biểu tượng Máy quay Video */
export const VideoIcon: React.FC<IconProps> = ({ size = 24, color = '#475569' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M23 7l-7 5 7 5V7z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Rect x="1" y="5" width="15" height="14" rx="2" stroke={color} strokeWidth="2" />
  </Svg>
);

/** Biểu tượng Kẹp giấy Paperclip Đính kèm */
export const PaperclipIcon: React.FC<IconProps> = ({ size = 24, color = '#d97706' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

/** Biểu tượng Đăng xuất */
export const LogoutIcon: React.FC<IconProps> = ({ size = 22, color = '#ef4444' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
