const WEEKDAYS = [
  'Chủ Nhật',
  'Thứ Hai',
  'Thứ Ba',
  'Thứ Tư',
  'Thứ Năm',
  'Thứ Sáu',
  'Thứ Bảy',
];

export function formatVietnameseDate(dateInput: Date | string = new Date()): string {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const weekday = WEEKDAYS[d.getDay()];
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${weekday}, ${day}/${month}/${year}`;
}

export function formatTime(dateInput: Date | string = new Date()): string {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
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
