/**
 * UI & Display Constants cho phân hệ Mobile ITS VEC
 * Tuân thủ quy chuẩn: Tất cả biến và chuỗi hiển thị đều phải khai báo constants
 */

export const HIGHWAY_CONSTANTS = {
  NAME: 'CAO TỐC NỘI BÀI - LÀO CAI',
  SUBTITLE: 'VẬN HÀNH ITS',
  DEFAULT_HOTLINE: '113',
} as const;

export const VI_WEEKDAYS = [
  'Chủ Nhật',
  'Thứ Hai',
  'Thứ Ba',
  'Thứ Tư',
  'Thứ Năm',
  'Thứ Sáu',
  'Thứ Bảy',
] as const;

export const TASK_SECTION_CONSTANTS = {
  ASSIGNED_TITLE: 'Nhiệm vụ',
  ASSIGNED_SUBTITLE: 'Được giao · cập nhật theo ITS',
  ASSIGNED_UNIT: 'VIỆC',

  EVENTS_TITLE: 'Sự kiện trên tuyến',
  EVENTS_SUBTITLE: 'Theo dõi từ camera & hệ thống ITS',
  EVENTS_UNIT: 'SỰ KIỆN',
  EVENTS_BADGE_WATCH: 'THEO DÕI',

  COMPLETED_TITLE: 'Công việc gần đây',
  COMPLETED_SUBTITLE_PREFIX: 'Đã hoàn thành gần nhất',

  EMPTY_ASSIGNED: 'Chưa có nhiệm vụ nào được phân công.',
  EMPTY_EVENTS: 'Không có sự kiện nào trên tuyến.',
  EMPTY_COMPLETED: 'Chưa có công việc hoàn thành.',

  LOADING_MESSAGE: 'Đang tải dữ liệu từ TMC...',
} as const;

export const TASK_STATUS_LABELS = {
  RECEIVED: 'Đã tiếp nhận',
  IN_PROGRESS: 'Đang xử lý',
  COMPLETED: 'HOÀN THÀNH',
} as const;

export const TASK_PRIORITY_LABELS = {
  P0: 'Khẩn cấp',
  P1: 'Nghiêm trọng',
  P2: 'Trung bình',
  P3: 'Bình thường',
} as const;

export const EVENT_TAG_LABELS = {
  CONSTRUCTION: 'BẢO TRÌ',
  WEATHER: 'THỜI TIẾT',
  TRAFFIC_JAM: 'ÙN TẮC',
  ACCIDENT: 'SỰ CỐ',
} as const;

export const UI_ICONS = {
  PLANE: '✈',
  SEARCH: '🔍',
  CHECKMARK: '✓',
  CHEVRON_RIGHT: '›',
  ALERT_CRITICAL: '❗',
  ALERT_WARNING: '⚠️',
  LOCATION_PIN: '📍',
  CLOCK: '🕒',
  PHONE: '📞',
  EVENT_CONSTRUCTION: '🚧',
  EVENT_WEATHER: '🌧️',
  EVENT_TRAFFIC_JAM: '🚗',
  EVENT_ACCIDENT: '💥',
} as const;

export const THEME_CONSTANTS = {
  HEADER_BG: '#e6f4fe',
  CONTAINER_BG: '#f8fafc',
  SUCCESS_LIGHT: '#f0fdf4',
  SUCCESS_BORDER: '#bbf7d0',
  CHECK_CIRCLE_BG: '#d1fae5',
  WARNING_BADGE_BG: '#fef3c7',
  WARNING_BADGE_TEXT: '#92400e',
} as const;
