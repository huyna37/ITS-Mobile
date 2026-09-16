import { useEffect, useState, useCallback } from 'react';

export const TOAST_EVENT = 'its:toast';
export const TOAST_KIND = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
};

let nextId = 1;

export function toast(message, kind = 'info', options = {}) {
  if (typeof window === 'undefined') return null;
  const detail = {
    id: `toast-${Date.now()}-${nextId++}`,
    message: String(message ?? ''),
    kind,
    durationMs: typeof options.durationMs === 'number' ? options.durationMs : 3500,
    actionLabel: options.actionLabel || null,
  };
  window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail }));
  return detail.id;
}

export function toastSuccess(message, options) {
  return toast(message, TOAST_KIND.SUCCESS, options);
}

export function toastError(message, options) {
  return toast(message, TOAST_KIND.ERROR, { durationMs: 5000, ...(options || {}) });
}

export function toastWarning(message, options) {
  return toast(message, TOAST_KIND.WARNING, options);
}

export function toastInfo(message, options) {
  return toast(message, TOAST_KIND.INFO, options);
}

export function useToastStream() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const handler = (e) => {
      const t = e.detail;
      if (!t || !t.id) return;
      setItems((prev) => [...prev, t]);
      const timer = setTimeout(() => {
        setItems((prev) => prev.filter((x) => x.id !== t.id));
      }, t.durationMs);
      t._timer = timer;
    };
    window.addEventListener(TOAST_EVENT, handler);
    return () => {
      window.removeEventListener(TOAST_EVENT, handler);
    };
  }, []);

  const dismiss = useCallback((id) => {
    setItems((prev) => prev.filter((x) => x.id !== id));
  }, []);

  return { items, dismiss };
}

export function useToast() {
  return {
    show: toast,
    success: toastSuccess,
    error: toastError,
    warning: toastWarning,
    info: toastInfo,
  };
}
