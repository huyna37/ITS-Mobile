// In-memory / persistent storage abstraction for React Native

const memoryCache: Record<string, string> = {};

export const storage = {
  getItem(key: string): string | null {
    return memoryCache[key] ?? null;
  },
  setItem(key: string, value: string): void {
    memoryCache[key] = value;
  },
  removeItem(key: string): void {
    delete memoryCache[key];
  },
  clear(): void {
    Object.keys(memoryCache).forEach((k) => delete memoryCache[k]);
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
