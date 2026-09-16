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

export async function getNotificationsApi(): Promise<NotificationItem[]> {
  const res = await apiClient.get<BackendNotificationResponse[]>('/api/notifications');
  return res.data.map(mapNotification);
}

export async function markNotificationReadApi(id: string, isRead: boolean): Promise<void> {
  await apiClient.patch(`/api/notifications/${id}/read`, { isRead });
}
