// Persistent & In-memory storage abstraction for React Native & Web Preview

const memoryCache: Record<string, string> = {};

const hasLocalStorage = (): boolean => {
  try {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  } catch {
    return false;
  }
};

export const storage = {
  getItem(key: string): string | null {
    if (hasLocalStorage()) {
      try {
        const val = window.localStorage.getItem(key);
        if (val !== null) return val;
      } catch {
        // Fallback sang memoryCache nếu localStorage bị chặn
      }
    }
    return memoryCache[key] ?? null;
  },

  setItem(key: string, value: string): void {
    memoryCache[key] = value;
    if (hasLocalStorage()) {
      try {
        window.localStorage.setItem(key, value);
      } catch {
        // Tránh lỗi bảo mật trên môi trường cấm storage
      }
    }
  },

  removeItem(key: string): void {
    delete memoryCache[key];
    if (hasLocalStorage()) {
      try {
        window.localStorage.removeItem(key);
      } catch {
        // Bỏ qua lỗi
      }
    }
  },

  clear(): void {
    Object.keys(memoryCache).forEach((k) => delete memoryCache[k]);
    if (hasLocalStorage()) {
      try {
        window.localStorage.clear();
      } catch {
        // Bỏ qua lỗi
      }
    }
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
};

