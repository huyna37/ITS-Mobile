import { create } from 'zustand';
import { NotificationItem } from '../types/notifications';
import {
  getNotificationsApi,
  markNotificationReadApi,
} from '../api/notificationsApi';

interface NotificationsState {
  notifications: NotificationItem[];
  unreadCount: number;
  isLoading: boolean;

  fetchNotifications: () => Promise<void>;
  toggleNotificationRead: (id: string) => Promise<void>;
  markAllAsRead: () => void;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const notifications = await getNotificationsApi();
      const unreadCount = notifications.filter((n) => !n.isRead).length;
      set({ notifications, unreadCount, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  toggleNotificationRead: async (id: string) => {
    const currentList = get().notifications;
    const target = currentList.find((n) => n.id === id);
    if (!target) return;

    const newReadState = !target.isRead;
    const updatedList = currentList.map((n) =>
      n.id === id ? { ...n, isRead: newReadState } : n
    );
    const unreadCount = updatedList.filter((n) => !n.isRead).length;
    set({ notifications: updatedList, unreadCount });

    try {
      await markNotificationReadApi(id, newReadState);
    } catch {
      // Revert if error
    }
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }));
  },
}));
