import { NotificationItem } from '../types/notifications';
import { apiClient } from './client';

export interface BackendNotificationResponse {
  id: string;
  title: string;
  desc: string;
  time: string;
  unread: boolean;
}

function mapNotification(n: BackendNotificationResponse): NotificationItem {
  return {
    id: n.id,
    title: n.title,
    body: n.desc,
    timestamp: n.time,
    isRead: !n.unread,
    type: 'HIGHWAY_ALERT',
  };
}

export async function getNotificationsApi(
  skipCount: number = 0,
  maxResultCount: number = 10
): Promise<NotificationItem[]> {
  try {
    const res = await apiClient.get<BackendNotificationResponse[]>('/api/notifications', {
      params: { skipCount, maxResultCount },
    });
    if (res.data && Array.isArray(res.data)) {
      return res.data.map(mapNotification);
    }
  } catch (err) {
    console.warn('Lỗi lấy danh sách thông báo từ API:', err);
  }
  return [];
}

export async function markNotificationReadApi(id: string, isRead: boolean): Promise<void> {
  try {
    await apiClient.patch(`/api/notifications/${id}/read`, { isRead });
  } catch {
    // Không chặn luồng UI nếu backend chưa hỗ trợ
  }
}
