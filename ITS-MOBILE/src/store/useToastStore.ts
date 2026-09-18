import { create } from 'zustand';

export type ToastType = 'error' | 'success' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  duration?: number;
}

export interface DialogButton {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
}

export interface DialogItem {
  title: string;
  message: string;
  type?: ToastType;
  buttons?: DialogButton[];
}

interface ToastState {
  toasts: ToastItem[];
  dialog: DialogItem | null;

  showToast: (type: ToastType, title: string, message: string, duration?: number) => void;
  hideToast: (id: string) => void;
  showDialog: (title: string, message: string, buttons?: DialogButton[], type?: ToastType) => void;
  hideDialog: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  dialog: null,

  showToast: (type, title, message, duration = 2500) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
    set(() => ({
      // Giữ duy nhất 1 toast mới nhất để không chiếm diện tích màn hình
      toasts: [{ id, type, title, message, duration }],
    }));

    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, duration);
    }
  },

  hideToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  showDialog: (title, message, buttons, type = 'info') => {
    set({
      dialog: {
        title,
        message,
        buttons: buttons && buttons.length > 0 ? buttons : [{ text: 'Đóng', style: 'default' }],
        type,
      },
    });
  },

  hideDialog: () => {
    set({ dialog: null });
  },
}));

/**
 * Hàm gọi nhanh Toast từ bất kỳ đâu (Components, API services, Stores)
 */
export const showAppToast = (type: ToastType, title: string, message: string, duration?: number) => {
  useToastStore.getState().showToast(type, title, message, duration);
};

/**
 * Hàm gọi Modal Dialog thay thế cho window.alert hoặc Alert.alert
 */
export const showAppDialog = (title: string, message: string, buttons?: DialogButton[], type?: ToastType) => {
  useToastStore.getState().showDialog(title, message, buttons, type);
};
