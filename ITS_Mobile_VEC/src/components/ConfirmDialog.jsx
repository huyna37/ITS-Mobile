import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { APP_CONFIG } from '../config.js';

export function ConfirmDialog({
  open,
  title = 'Xác nhận',
  description = '',
  confirmLabel = 'Xác nhận',
  cancelLabel = 'Hủy',
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  const confirmClass = destructive
    ? 'bg-red-600 text-white'
    : 'text-white';
  const confirmStyle = destructive ? undefined : { backgroundColor: APP_CONFIG.primaryColor };

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
        <div className="flex items-start gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
              destructive ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
            }`}
          >
            <AlertTriangle size={20} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-black text-gray-900">{title}</h3>
            {description ? (
              <p className="mt-1 text-sm text-gray-600 whitespace-pre-line">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-1 text-gray-400"
            aria-label="Đóng"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-3 rounded-2xl border border-gray-200 font-bold text-gray-700 disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 py-3 rounded-2xl font-bold disabled:opacity-60 ${confirmClass}`}
            style={confirmStyle}
          >
            {loading ? 'Đang xử lý…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
