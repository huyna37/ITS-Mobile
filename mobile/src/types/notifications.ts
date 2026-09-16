export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  taskId?: string;
  timestamp: string;
  isRead: boolean;
  type: 'TASK_ASSIGNED' | 'TASK_STATUS_UPDATE' | 'HIGHWAY_ALERT' | 'SYSTEM';
}
