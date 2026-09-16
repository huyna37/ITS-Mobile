import { NotificationItem } from '../types/notifications';
import { apiClient } from './client';

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'NOTI-01',
    title: 'Phân công nhiệm vụ mới',
    body: 'Có sự cố Km 45+200 hướng Hà Nội',
    taskId: 'TASK-8821',
    timestamp: '10 phút trước',
    isRead: false,
    type: 'TASK_ASSIGNED',
  },
  {
    id: 'NOTI-02',
    title: 'Nhắc cập nhật hiện trường',
    body: 'TASK-8825 chờ báo cáo ảnh',
    taskId: 'TASK-8825',
    timestamp: '35 phút trước',
    isRead: false,
    type: 'TASK_STATUS_UPDATE',
  },
  {
    id: 'NOTI-03',
    title: 'Cập nhật hệ thống',
    body: 'Hệ thống Camera IC12 đã hoạt động trở lại',
    timestamp: '2 giờ trước',
    isRead: true,
    type: 'HIGHWAY_ALERT',
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
