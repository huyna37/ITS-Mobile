import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
}

/** Biểu tượng phi thuyền / Paper Airplane chuẩn thiết kế VEC (cân đối chính tâm 100%) */
export const PaperPlaneIcon: React.FC<IconProps> = ({ size = 20, color = '#ffffff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21.286 3.164a1 1 0 00-1.077-.225l-17.5 6.806a1 1 0 00.041 1.882l6.81 2.553 2.553 6.81a1 1 0 001.882.041l6.806-17.5a1 1 0 00-.225-1.077z"
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
    <Path
      d="M9 4V3a1 1 0 011-1h4a1 1 0 011 1v1"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
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
    <Path
      d="M9 18l6-6-6-6"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

/** Biểu tượng Quay lại Mũi tên trái */
export const ChevronLeftIcon: React.FC<IconProps> = ({ size = 22, color = '#0f172a' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M15 19l-7-7 7-7"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

/** Biểu tượng Checkmark hình tròn */
export const CheckCircleIcon: React.FC<IconProps> = ({ size = 28, color = '#16a34a' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2.2" />
    <Path
      d="M8 12.5l2.5 2.5 5.5-5.5"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

/** Biểu tượng Rào chắn bảo trì */
export const BarrierIcon: React.FC<IconProps> = ({ size = 22, color = '#f59e0b' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 6h16M4 12h16M7 6v12M17 6v12M5 18h4M15 18h4"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
    />
    <Path d="M8 6l4 6M12 6l4 6M8 12l4 6" stroke={color} strokeWidth="1.8" />
  </Svg>
);

/** Biểu tượng Đám mây mưa thời tiết */
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

/** Biểu tượng Đóng / Xóa dấu X */
export const CloseIcon: React.FC<IconProps> = ({ size = 20, color = '#64748b' }) => (
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

/** Biểu tượng Thùng rác Xóa */
export const TrashIcon: React.FC<IconProps> = ({ size = 18, color = '#ef4444' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

/** Biểu tượng Mắt Mở (Hiện mật khẩu) */
export const EyeIcon: React.FC<IconProps> = ({ size = 20, color = '#64748b' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle
      cx="12"
      cy="12"
      r="3"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

/** Biểu tượng Mắt Đóng / Gạch chéo (Ẩn mật khẩu) */
export const EyeOffIcon: React.FC<IconProps> = ({ size = 20, color = '#64748b' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

/** Biểu tượng Thử lại / Refresh */
export const RefreshCwIcon: React.FC<IconProps> = ({ size = 16, color = '#0284c7' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M23 4v6h-6M1 20v-6h6"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

/** Biểu tượng Bảng tính Excel / XLS */
export const FileExcelIcon: React.FC<IconProps> = ({ size = 24, color = '#16a34a' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M14 2v6h6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M8 13l3 4M11 13l-3 4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M14 13h3M14 17h3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

/** Biểu tượng Tài liệu PDF */
export const FilePdfIcon: React.FC<IconProps> = ({ size = 24, color = '#dc2626' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M14 2v6h6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M9 13v4M9 13h2a1 1 0 011 1v0a1 1 0 01-1 1H9M15 13v4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

/** Biểu tượng Văn bản Word / DOC */
export const FileWordIcon: React.FC<IconProps> = ({ size = 24, color = '#2563eb' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M14 2v6h6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M8 13l1.5 4 1.5-3 1.5 3 1.5-4" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

/** Biểu tượng Hình ảnh / Khung ảnh Image */
export const FileImageIcon: React.FC<IconProps> = ({ size = 24, color = '#0284c7' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="3" width="18" height="18" rx="3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="8.5" cy="8.5" r="1.8" fill={color} />
    <Path d="M21 15l-5-5L5 21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

/** Biểu tượng Tệp tin tài liệu chung / Generic Document */
export const FileGenericDocIcon: React.FC<IconProps> = ({ size = 24, color = '#d97706' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M14 2v6h6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M8 13h8M8 17h5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

/** Biểu tượng Tệp nén Zip / Archive */
export const FileZipIcon: React.FC<IconProps> = ({ size = 24, color = '#9333ea' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M14 2v6h6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M10 7h1M10 9h1M10 11h1M10 13h1M9 15h3v2H9z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

/** Biểu tượng Face ID / khuôn mặt xác thực sinh trắc học */
export const FaceIdIcon: React.FC<IconProps> = ({ size = 24, color = '#0090e7' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect
      x="2"
      y="2"
      width="7"
      height="4"
      rx="1.5"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <Rect
      x="15"
      y="2"
      width="7"
      height="4"
      rx="1.5"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <Rect
      x="2"
      y="18"
      width="7"
      height="4"
      rx="1.5"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <Rect
      x="15"
      y="18"
      width="7"
      height="4"
      rx="1.5"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <Path
      d="M9 9v0a1 1 0 011-1h0a1 1 0 011 1v0"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <Path
      d="M13 9v0a1 1 0 011-1h0a1 1 0 011 1v0"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <Path
      d="M9 15c.83.63 1.79.97 3 .97s2.17-.34 3-.97"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);

/** Biểu tượng Vân tay xác thực sinh trắc học */
export const FingerprintIcon: React.FC<IconProps> = ({ size = 24, color = '#0090e7' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2a9 9 0 00-9 9c0 2.4.96 4.58 2.5 6.18M21 11a9 9 0 00-6-8.48M18.5 17.18A8.96 8.96 0 0021 11"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <Path
      d="M12 6a5 5 0 00-5 5c0 1.66.67 3.16 1.76 4.24M17 11a5 5 0 00-2.5-4.33"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <Path
      d="M12 10a1 1 0 00-1 1c0 .83.34 1.58.88 2.12M12 14v4M8 18v2M16 18v1"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);
