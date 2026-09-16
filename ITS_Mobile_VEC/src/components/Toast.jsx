import React from 'react';
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';
import { useToastStream, TOAST_KIND } from '../hooks/useToast.jsx';

function iconFor(kind) {
  switch (kind) {
    case TOAST_KIND.SUCCESS:
      return <CheckCircle2 size={18} className="text-emerald-500" />;
    case TOAST_KIND.ERROR:
      return <AlertCircle size={18} className="text-red-500" />;
    case TOAST_KIND.WARNING:
      return <AlertTriangle size={18} className="text-amber-500" />;
    default:
      return <Info size={18} className="text-sky-500" />;
  }
}

function shellFor(kind) {
  switch (kind) {
    case TOAST_KIND.SUCCESS:
      return 'border-emerald-100 bg-emerald-50/95 text-emerald-900';
    case TOAST_KIND.ERROR:
      return 'border-red-100 bg-red-50/95 text-red-900';
    case TOAST_KIND.WARNING:
      return 'border-amber-100 bg-amber-50/95 text-amber-900';
    default:
      return 'border-slate-100 bg-white/95 text-slate-900';
  }
}

export function ToastContainer() {
  const { items, dismiss } = useToastStream();
  if (items.length === 0) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[80] flex flex-col items-center gap-2 px-4">
      {items.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-2xl border px-4 py-3 shadow-lg backdrop-blur ${shellFor(t.kind)}`}
          role="status"
        >
          <div className="mt-0.5 shrink-0">{iconFor(t.kind)}</div>
          <p className="flex-1 text-sm font-medium leading-snug">{t.message}</p>
          <button
            type="button"
            onClick={() => dismiss(t.id)}
            className="-mr-1 -mt-1 shrink-0 rounded-lg p-1 text-current/60 hover:text-current"
            aria-label="Đóng thông báo"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
