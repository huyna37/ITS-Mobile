import { Linking } from 'react-native';
import { APP_CONFIG } from '../config';
import { showAppDialog, showAppToast } from '../store/useToastStore';

/**
 * Kích hoạt cuộc gọi khẩn cấp SOS qua mạng viễn thông GSM
 * Hoạt động độc lập không phụ thuộc Internet hay 4G
 */
export function triggerSOSCall(hotline = APP_CONFIG.sosHotline): void {
  showAppDialog(
    'GỌI CỨU HỘ KHẨN CẤP SOS',
    `Bạn có chắc chắn muốn gọi đến số điện thoại khẩn cấp ${hotline} qua mạng viễn thông GSM không?`,
    [
      {
        text: 'Hủy bỏ',
        style: 'cancel',
      },
      {
        text: 'Gọi ngay',
        style: 'destructive',
        onPress: () => {
          const url = `tel:${hotline}`;
          Linking.canOpenURL(url)
            .then((supported) => {
              if (supported) {
                Linking.openURL(url);
              } else {
                showAppToast('error', 'Lỗi', 'Thiết bị không hỗ trợ cuộc gọi viễn thông');
              }
            })
            .catch((err) => {
              console.warn('Lỗi gọi SOS:', err);
            });
        },
      },
    ],
    'warning'
  );
}

/**
 * Kích hoạt cuộc gọi nội bộ tổng đài PBX tới đồng nghiệp
 */
export function triggerPBXCall(extension: string, contactName: string): void {
  showAppDialog(
    'GỌI NỘI BỘ PBX',
    `Kết nối đàm thoại tới đồng nghiệp ${contactName} (Ext: ${extension})?`,
    [
      { text: 'Đóng', style: 'cancel' },
      {
        text: 'Kết nối',
        onPress: () => {
          const url = `tel:${extension}`;
          Linking.openURL(url).catch(() => {
            showAppToast('info', 'Thông báo', `Đang kết nối đàm thoại tới Ext ${extension}...`);
          });
        },
      },
    ],
    'info'
  );
}
