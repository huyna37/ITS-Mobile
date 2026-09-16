import React from 'react';
import { Inbox } from 'lucide-react';

export function EmptyState({
  icon,
  title = 'Chưa có dữ liệu',
  description,
  actionLabel,
  onAction,
  tone = 'light',
}) {
  const toneClasses =
    tone === 'dark'
      ? 'text-slate-300'
      : tone === 'card'
        ? 'text-gray-500'
        : 'text-gray-400';

  const titleClass =
    tone === 'dark'
      ? 'text-slate-100'
      : tone === 'card'
        ? 'text-gray-800'
        : 'text-gray-700';

  return (
    <div className={`flex flex-col items-center justify-center text-center px-4 py-8 ${toneClasses}`}>
      <div className="mb-3 opacity-80">{icon || <Inbox size={36} />}</div>
      <p className={`text-sm font-bold ${titleClass}`}>{title}</p>
      {description ? <p className="mt-1 max-w-xs text-xs">{description}</p> : null}
      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 rounded-full bg-blue-500 px-4 py-2 text-xs font-bold text-white shadow active:bg-blue-600"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

export function EmptyDirectory({ onAdd }) {
  return (
    <EmptyState
      title="Danh bạ trống"
      description="Bấm “Thêm liên hệ” để bổ sung số máy nhánh nội bộ vào danh bạ."
      actionLabel={onAdd ? 'Thêm liên hệ' : null}
      onAction={onAdd}
      tone="card"
    />
  );
}

export function EmptyTasks() {
  return <EmptyState title="Chưa có nhiệm vụ" description="ITS sẽ tự đẩy nhiệm vụ mới khi có sự cố." tone="dark" />;
}

export function EmptyHistory() {
  return <EmptyState title="Chưa có lịch sử cuộc gọi" description="Lịch sử sẽ xuất hiện sau khi bạn gọi qua PBX." tone="card" />;
}

export function EmptyNotifications() {
  return <EmptyState title="Không có thông báo" description="Mọi việc đã được cập nhật." tone="dark" />;
}
