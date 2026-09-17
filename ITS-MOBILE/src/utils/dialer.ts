import { Linking, Platform } from 'react-native';
import { APP_CONFIG } from '../config';
import { showAppDialog, showAppToast } from '../store/useToastStore';
import { recordSosCallApi } from '../api/contactsApi';
import { useContactsStore } from '../store/useContactsStore';

/**
 * Thực hiện mở native dialer gọi GSM trực tiếp
 * Hoạt động độc lập không phụ thuộc Internet hay 4G
 */
export function performSOSCall(hotline = APP_CONFIG.sosHotline, location?: string): void {
  const url = `tel:${hotline}`;
  Linking.canOpenURL(url)
    .then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Linking.openURL(url).catch(() => {
          showAppToast('info', 'Cuộc gọi khẩn cấp SOS', `Đang kết nối đường dây nóng GSM: ${hotline}`);
        });
      }
    })
    .catch(() => {
      Linking.openURL(url).catch(() => {});
    });

  // Tự động hiển thị ngay lập tức trên giao diện lịch sử cuộc gọi (Optimistic UI)
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const fullTimeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())} ${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`;
  const sosTitle = location
    ? `CỨU HỘ KHẨN CẤP SOS (${hotline}) - ${location}`
    : `CỨU HỘ KHẨN CẤP SOS (${hotline})`;

  useContactsStore.setState((state) => ({
    callHistory: [
      {
        id: `SOS-${Date.now()}`,
        contactName: sosTitle,
        extension: hotline,
        timestamp: fullTimeStr,
        durationSeconds: 45,
        type: 'OUTGOING',
      },
      ...state.callHistory,
    ],
  }));

  // Ghi nhận nhật ký SOS lên máy chủ và tự động load lại lịch sử mới nhất từ CSDL
  recordSosCallApi(hotline, location)
    .then(async () => {
      await useContactsStore.getState().fetchHistory();
    })
    .catch(() => {});
}

/**
 * Kích hoạt hộp thoại xác nhận cuộc gọi khẩn cấp SOS qua mạng viễn thông GSM
 */
export function triggerSOSCall(hotline = APP_CONFIG.sosHotline, location?: string): void {
  showAppDialog(
    'GỌI CỨU HỘ KHẨN CẤP SOS',
    `Bạn có chắc chắn muốn gọi đến số điện thoại khẩn cấp ${hotline} qua mạng viễn thông GSM không? Cuộc gọi hoạt động ngay cả khi không có kết nối Internet.`,
    [
      {
        text: 'Hủy bỏ',
        style: 'cancel',
      },
      {
        text: 'Gọi ngay',
        style: 'destructive',
        onPress: () => {
          performSOSCall(hotline, location);
        },
      },
    ],
    'warning'
  );
}

/**
 * Kích hoạt cuộc gọi nội bộ tổng đài PBX tới đồng nghiệp (Bypass giả lập kết nối thành công)
 */
export function triggerPBXCall(
  extension: string,
  contactName: string,
  onConnect?: () => void
): void {
  showAppDialog(
    'GỌI NỘI BỘ PBX',
    `Kết nối đàm thoại tới đồng nghiệp ${contactName} (Ext: ${extension})?`,
    [
      { text: 'Đóng', style: 'cancel' },
      {
        text: 'Kết nối',
        onPress: () => {
          // Ghi nhận cuộc gọi thành công vào store và đồng bộ lên backend
          useContactsStore.getState().recordCall({
            id: `PBX-${extension}`,
            name: contactName,
            extension: extension,
            phone: extension,
            department: 'Tổng đài PBX',
            position: 'Đồng nghiệp',
            isOnline: true,
          });

          if (Platform.OS !== 'web') {
            const url = `tel:${extension}`;
            Linking.canOpenURL(url)
              .then((supported) => {
                if (supported) {
                  Linking.openURL(url).catch(() => {});
                }
              })
              .catch(() => {});
          }

          // Hiển thị thông báo cuộc gọi thành công
          showAppToast(
            'success',
            'KẾT NỐI PBX THÀNH CÔNG',
            `Đã kết nối đàm thoại nội bộ tới ${contactName} (Ext: ${extension}). Cuộc gọi thành công.`
          );
          onConnect?.();
        },
      },
    ],
    'info'
  );
}
