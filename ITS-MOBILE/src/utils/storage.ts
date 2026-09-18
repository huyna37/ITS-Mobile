// Persistent & In-memory storage abstraction for React Native & Web Preview
import AsyncStorage from '@react-native-async-storage/async-storage';

const memoryCache: Record<string, string> = {};
let isInitialized = false;
let initPromise: Promise<void> | null = null;

const hasLocalStorage = (): boolean => {
  try {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  } catch {
    return false;
  }
};

/**
 * Khởi tạo và nạp trước toàn bộ dữ liệu từ Persistent Storage vào RAM cache
 */
export async function initStorage(): Promise<void> {
  if (isInitialized) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      // 1. Nếu trên Web: Nạp từ window.localStorage
      if (hasLocalStorage()) {
        try {
          for (let i = 0; i < window.localStorage.length; i++) {
            const k = window.localStorage.key(i);
            if (k) {
              const val = window.localStorage.getItem(k);
              if (val !== null) memoryCache[k] = val;
            }
          }
        } catch {
          // Bỏ qua nếu môi trường cấm duyệt localStorage
        }
      }

      // 2. Trên Native (hoặc fallback): Nạp từ AsyncStorage
      try {
        const keys = await AsyncStorage.getAllKeys();
        if (keys && keys.length > 0) {
          const entries = await AsyncStorage.getMany(keys);
          for (const [k, val] of Object.entries(entries)) {
            if (val !== null && val !== undefined) {
              memoryCache[k] = typeof val === 'string' ? val : String(val);
            }
          }
        }
      } catch (nativeErr) {
        console.warn('Không thể đọc AsyncStorage khi khởi tạo:', nativeErr);
      }
    } finally {
      isInitialized = true;
    }
  })();

  return initPromise;
}

// Khởi chạy nạp storage nền ngay khi bundle được nạp
initStorage().catch((err) => {
  console.warn('Lỗi khởi tạo storage nền:', err);
});

export const storage = {
  /**
   * Đọc dữ liệu đồng bộ (0ms latency) từ RAM cache
   */
  getItem(key: string): string | null {
    if (key in memoryCache) {
      return memoryCache[key];
    }
    if (hasLocalStorage()) {
      try {
        const val = window.localStorage.getItem(key);
        if (val !== null) {
          memoryCache[key] = val;
          return val;
        }
      } catch {
        // Fallback sang memoryCache nếu localStorage bị chặn
      }
    }
    return null;
  },

  /**
   * Ghi dữ liệu đồng bộ vào RAM cache và ghi ngầm bền vững xuống Storage
   */
  setItem(key: string, value: string): void {
    memoryCache[key] = value;

    if (hasLocalStorage()) {
      try {
        window.localStorage.setItem(key, value);
      } catch {
        // Tránh lỗi bảo mật trên môi trường cấm storage
      }
    }

    AsyncStorage.setItem(key, value).catch((err: unknown) => {
      console.warn(`Lỗi ghi AsyncStorage cho key [${key}]:`, err);
    });
  },

  /**
   * Xóa key đồng bộ trong RAM cache và xóa ngầm dưới Storage
   */
  removeItem(key: string): void {
    delete memoryCache[key];

    if (hasLocalStorage()) {
      try {
        window.localStorage.removeItem(key);
      } catch {
        // Bỏ qua lỗi
      }
    }

    AsyncStorage.removeItem(key).catch((err: unknown) => {
      console.warn(`Lỗi xóa AsyncStorage cho key [${key}]:`, err);
    });
  },

  /**
   * Xóa toàn bộ dữ liệu trong RAM cache và Storage
   */
  clear(): void {
    Object.keys(memoryCache).forEach((k) => delete memoryCache[k]);

    if (hasLocalStorage()) {
      try {
        window.localStorage.clear();
      } catch {
        // Bỏ qua lỗi
      }
    }

    AsyncStorage.clear().catch((err: unknown) => {
      console.warn('Lỗi dọn sạch AsyncStorage:', err);
    });
  },

  getJSON<T>(key: string): T | null {
    const item = this.getItem(key);
    if (!item) return null;
    try {
      return JSON.parse(item) as T;
    } catch {
      return null;
    }
  },

  setJSON<T>(key: string, value: T): void {
    this.setItem(key, JSON.stringify(value));
  },

  isReady(): boolean {
    return isInitialized;
  },
};

