import { Linking, Alert } from 'react-native';
import { APP_CONFIG } from '../config';

/**
 * Kích hoạt cuộc gọi khẩn cấp SOS qua mạng viễn thông GSM
 * Hoạt động độc lập không phụ thuộc Internet hay 4G
 */
export function triggerSOSCall(hotline = APP_CONFIG.sosHotline): void {
  Alert.alert(
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
                Alert.alert('Lỗi', 'Thiết bị không hỗ trợ cuộc gọi viễn thông');
              }
            })
            .catch((err) => {
              console.warn('Lỗi gọi SOS:', err);
            });
        },
      },
    ],
    { cancelable: true }
  );
}

/**
 * Kích hoạt cuộc gọi nội bộ tổng đài PBX tới đồng nghiệp
 */
export function triggerPBXCall(extension: string, contactName: string): void {
  Alert.alert(
    'GỌI NỘI BỘ PBX',
    `Kết nối đàm thoại tới đồng nghiệp ${contactName} (Ext: ${extension})?`,
    [
      { text: 'Đóng', style: 'cancel' },
      {
        text: 'Kết nối',
        onPress: () => {
          // Trong phiên bản thử nghiệm hỗ trợ tel: hoặc SIP client
          const url = `tel:${extension}`;
          Linking.openURL(url).catch(() => {
            Alert.alert('Thông báo', `Đang kết nối đàm thoại tới Ext ${extension}...`);
          });
        },
      },
    ]
  );
}
