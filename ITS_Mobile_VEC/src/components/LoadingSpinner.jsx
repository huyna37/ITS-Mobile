import React from 'react';
import { APP_CONFIG } from '../config.js';

export function LoadingSpinner({ size = 24, color, label }) {
  const resolved = color || APP_CONFIG.primaryColor;
  const px = `${size}px`;
  return (
    <span className="inline-flex items-center gap-2" role="status" aria-live="polite">
      <span
        className="inline-block animate-spin rounded-full border-2 border-current border-t-transparent"
        style={{ width: px, height: px, color: resolved }}
        aria-hidden
      />
      {label ? <span className="text-sm text-gray-600">{label}</span> : null}
    </span>
  );
}

export function FullScreenLoader({ label = 'Đang khởi tạo…' }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-sm text-slate-300 gap-3">
      <LoadingSpinner size={20} color="#94a3b8" />
      <span>{label}</span>
    </div>
  );
}

export function InlineLoader({ label }) {
  return (
    <div className="flex items-center justify-center gap-2 py-6 text-sm text-gray-500">
      <LoadingSpinner size={18} />
      {label ? <span>{label}</span> : null}
    </div>
  );
}
