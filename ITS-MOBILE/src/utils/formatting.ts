const WEEKDAYS = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

export function formatVietnameseDate(dateInput: Date | string = new Date()): string {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const weekday = WEEKDAYS[d.getDay()];
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${weekday}, ${day}/${month}/${year}`;
}

export function formatCallDateTime(dateInput?: Date | string | number | null): string {
  if (!dateInput) {
    return formatFullNow();
  }

  if (typeof dateInput === 'string') {
    const trimmed = dateInput.trim();

    // Dạng "HH:mm:ss dd/MM/yyyy"
    if (/^\d{1,2}:\d{1,2}:\d{1,2}\s+\d{1,2}\/\d{1,2}\/\d{4}$/.test(trimmed)) {
      return trimmed;
    }

    // Dạng "dd/MM/yyyy HH:mm:ss" -> chuyển sang "HH:mm:ss dd/MM/yyyy"
    const dmyHms = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{1,2}):(\d{1,2})$/);
    if (dmyHms) {
      const [, d, mo, y, h, m, s] = dmyHms;
      return `${h.padStart(2, '0')}:${m.padStart(2, '0')}:${s.padStart(2, '0')} ${d.padStart(2, '0')}/${mo.padStart(2, '0')}/${y}`;
    }

    // Dạng "dd/MM HH:mm" (từ API cũ) -> bổ sung năm và giây
    const dmHm = trimmed.match(/^(\d{1,2})\/(\d{1,2})\s+(\d{1,2}):(\d{1,2})$/);
    if (dmHm) {
      const [, d, mo, h, m] = dmHm;
      const y = new Date().getFullYear();
      return `${h.padStart(2, '0')}:${m.padStart(2, '0')}:00 ${d.padStart(2, '0')}/${mo.padStart(2, '0')}/${y}`;
    }

    // Dạng ISO string "2026-09-17T03:38:00"
    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      return formatFromDate(parsed);
    }

    return trimmed;
  }

  const d = typeof dateInput === 'number' ? new Date(dateInput) : dateInput;
  if (!isNaN(d.getTime())) {
    return formatFromDate(d);
  }

  return formatFullNow();
}

export function formatFromDate(d: Date): string {
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds} ${day}/${month}/${year}`;
}

export function formatFullNow(): string {
  return formatFromDate(new Date());
}

export function formatTime(dateInput: Date | string = new Date()): string {
  if (typeof dateInput === 'string') {
    const trimmed = dateInput.trim();
    // Bắt giờ phút từ chuỗi bất kỳ dạng HH:mm
    const match = trimmed.match(/(\d{1,2}):(\d{1,2})/);
    if (match) {
      return `${match[1].padStart(2, '0')}:${match[2].padStart(2, '0')}`;
    }
  }

  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (!isNaN(d.getTime())) {
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

export function formatCallHistoryTime(dateInput: Date | string = new Date()): string {
  if (typeof dateInput === 'string') {
    const trimmed = dateInput.trim();
    // Handle format "17/09 15:18" -> "15:18 (17/09)"
    const parts = trimmed.split(/\s+/);
    if (parts.length === 2 && parts[0].includes('/') && parts[1].includes(':')) {
      return `${parts[1]} (${parts[0]})`;
    }
    // Handle format already "15:18 (17/09)"
    if (/^\d{1,2}:\d{2}\s*\(\d{1,2}\/\d{1,2}\)$/.test(trimmed)) {
      return trimmed;
    }
  }

  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) {
    const match = typeof dateInput === 'string' ? dateInput.match(/(\d{1,2}:\d{2})/) : null;
    return match ? match[1] : '--:--';
  }

  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${hours}:${minutes} (${day}/${month})`;
}

export function formatMilestone(
  km: number,
  m: number,
  direction?: 'HANOI_LAOCAI' | 'LAOCAI_HANOI' | string
): string {
  const mStr = String(m).padStart(3, '0');
  const base = `Km ${km}+${mStr}`;
  if (direction === 'HANOI_LAOCAI') {
    return `${base} (Hướng HN ➔ LC)`;
  }
  if (direction === 'LAOCAI_HANOI') {
    return `${base} (Hướng LC ➔ HN)`;
  }
  return base;
}
