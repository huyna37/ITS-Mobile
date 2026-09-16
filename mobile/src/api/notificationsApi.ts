import { NotificationItem } from '../types/notifications';
import { apiClient } from './client';

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'NOTI-01',
    title: 'Phân công sự cố mới tại Km 124+450',
    body: 'TMC vừa phân công nhiệm vụ xử lý xe tải nổ lốp dừng đỗ khẩn cấp tại Km 124+450 hướng HN-LC cho bạn.',
    taskId: 'TASK-01',
    timestamp: '2026-09-16T08:15:00Z',
    isRead: false,
    type: 'TASK_ASSIGNED',
  },
  {
    id: 'NOTI-02',
    title: 'Cảnh báo thời tiết xấu khu vực Yên Bái',
    body: 'Mưa to kèm sương mù dày đặc từ Km 160 đến Km 210. Yêu cầu tuần tra viên bật đèn cảnh báo và giảm tốc độ tuần tra.',
    timestamp: '2026-09-16T07:30:00Z',
    isRead: false,
    type: 'HIGHWAY_ALERT',
  },
  {
    id: 'NOTI-03',
    title: 'Xác nhận hoàn thành nhiệm vụ SC-20260915-089',
    body: 'Trung tâm TMC đã nghiệm thu báo cáo xử lý chướng ngại vật rơi vãi tại Km 89+700 của bạn.',
    taskId: 'TASK-03',
    timestamp: '2026-09-15T16:10:00Z',
    isRead: true,
    type: 'TASK_STATUS_UPDATE',
  },
];

export async function getNotificationsApi(): Promise<NotificationItem[]> {
  try {
    const res = await apiClient.get<NotificationItem[]>('/api/notifications');
    return res.data;
  } catch {
    return MOCK_NOTIFICATIONS;
  }
}

export async function markNotificationReadApi(id: string, isRead: boolean): Promise<void> {
  try {
    await apiClient.patch(`/api/notifications/${id}/read`, { isRead });
  } catch {
    const noti = MOCK_NOTIFICATIONS.find((n) => n.id === id);
    if (noti) {
      noti.isRead = isRead;
    }
  }
}
