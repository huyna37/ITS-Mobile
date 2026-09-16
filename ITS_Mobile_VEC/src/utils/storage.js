const memoryStore = new Map();

function probeLocalStorage() {
  try {
    const key = '__its_storage_probe__';
    window.localStorage.setItem(key, '1');
    window.localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

const SUPPORTS_LS = typeof window !== 'undefined' && probeLocalStorage();

export function setItem(key, value) {
  const raw = typeof value === 'string' ? value : JSON.stringify(value);
  if (SUPPORTS_LS) {
    try {
      window.localStorage.setItem(key, raw);
      return true;
    } catch (e) {
      console.warn('[storage] setItem fallback to memory:', e?.message || e);
    }
  }
  memoryStore.set(key, raw);
  return true;
}

export function getItem(key, fallback = null) {
  if (SUPPORTS_LS) {
    try {
      const v = window.localStorage.getItem(key);
      return v === null ? fallback : v;
    } catch (e) {
      console.warn('[storage] getItem error:', e?.message || e);
    }
  }
  return memoryStore.has(key) ? memoryStore.get(key) : fallback;
}

export function getJSON(key, fallback = null) {
  const raw = getItem(key, null);
  if (raw === null) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function setJSON(key, value) {
  return setItem(key, JSON.stringify(value));
}

export function removeItem(key) {
  if (SUPPORTS_LS) {
    try {
      window.localStorage.removeItem(key);
    } catch {}
  }
  memoryStore.delete(key);
}

export function clearKeys(prefix) {
  if (SUPPORTS_LS) {
    try {
      const toDelete = [];
      for (let i = 0; i < window.localStorage.length; i += 1) {
        const k = window.localStorage.key(i);
        if (k && k.startsWith(prefix)) toDelete.push(k);
      }
      toDelete.forEach((k) => window.localStorage.removeItem(k));
    } catch {}
  }
  for (const k of Array.from(memoryStore.keys())) {
    if (k.startsWith(prefix)) memoryStore.delete(k);
  }
}

export function keys() {
  const out = new Set();
  if (SUPPORTS_LS) {
    try {
      for (let i = 0; i < window.localStorage.length; i += 1) {
        const k = window.localStorage.key(i);
        if (k) out.add(k);
      }
    } catch {}
  }
  for (const k of memoryStore.keys()) out.add(k);
  return Array.from(out);
}

export function hasNativeStorage() {
  return SUPPORTS_LS;
}
