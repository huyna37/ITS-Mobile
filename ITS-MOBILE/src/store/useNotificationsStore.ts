import { create } from 'zustand';
import { NotificationItem } from '../types/notifications';
import {
  getNotificationsApi,
  markNotificationReadApi,
} from '../api/notificationsApi';

const PAGE_SIZE = 6;

interface NotificationsState {
  notifications: NotificationItem[];
  unreadCount: number;
  isLoading: boolean;
  isRefreshing: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;

  fetchNotifications: (isRefresh?: boolean) => Promise<void>;
  loadMoreNotifications: () => Promise<void>;
  toggleNotificationRead: (id: string) => Promise<void>;
  markAllAsRead: () => void;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  isRefreshing: false,
  isLoadingMore: false,
  hasMore: true,

  fetchNotifications: async (isRefresh = false) => {
    if (isRefresh) {
      set({ isRefreshing: true });
    } else {
      set({ isLoading: true });
    }

    try {
      const notifications = await getNotificationsApi(0, PAGE_SIZE);
      const unreadCount = notifications.filter((n) => !n.isRead).length;
      set({
        notifications,
        unreadCount,
        isLoading: false,
        isRefreshing: false,
        hasMore: notifications.length >= PAGE_SIZE,
      });
    } catch {
      set({ isLoading: false, isRefreshing: false });
    }
  },

  loadMoreNotifications: async () => {
    const { notifications, isLoading, isLoadingMore, hasMore } = get();
    if (isLoading || isLoadingMore || !hasMore) return;

    set({ isLoadingMore: true });

    try {
      const newItems = await getNotificationsApi(notifications.length, PAGE_SIZE);
      if (newItems.length === 0) {
        set({ hasMore: false, isLoadingMore: false });
        return;
      }

      // Lọc bỏ trùng lặp nếu có
      const existingIds = new Set(notifications.map((n) => n.id));
      const uniqueNewItems = newItems.filter((n) => !existingIds.has(n.id));

      const updatedList = [...notifications, ...uniqueNewItems];
      const unreadCount = updatedList.filter((n) => !n.isRead).length;

      set({
        notifications: updatedList,
        unreadCount,
        isLoadingMore: false,
        hasMore: newItems.length >= PAGE_SIZE,
      });
    } catch {
      set({ isLoadingMore: false });
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
