export function truncate(s, max = 60) {
  if (typeof s !== 'string') return '';
  if (s.length <= max) return s;
  return s.slice(0, Math.max(0, max - 1)).trimEnd() + '…';
}

export function ellipsisMiddle(s, max = 24) {
  if (typeof s !== 'string') return '';
  if (s.length <= max) return s;
  const half = Math.floor((max - 1) / 2);
  return s.slice(0, half) + '…' + s.slice(s.length - half);
}

export function initials(name) {
  if (!name) return '?';
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function formatExtension(ext) {
  const digits = String(ext ?? '').replace(/\D/g, '');
  if (digits.length !== 4) return ext;
  return digits;
}

export function formatPhone(phone) {
  const digits = String(phone ?? '').replace(/\D/g, '');
  if (digits.length === 10 && digits.startsWith('0')) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  }
  if (digits.length === 11 && digits.startsWith('84')) {
    return `+84 ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
  }
  return phone;
}

export function formatBytes(bytes) {
  if (typeof bytes !== 'number' || bytes < 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i += 1;
  }
  const decimals = value < 10 && i > 0 ? 1 : 0;
  return `${value.toFixed(decimals)} ${units[i]}`;
}

export function pluralizeVN(count, singular, plural) {
  return `${count} ${count <= 1 ? singular : plural || singular}`;
}

export function capitalize(s) {
  if (typeof s !== 'string' || s.length === 0) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function levelColor(level) {
  switch (level) {
    case 'Nghiêm trọng':
      return { bg: 'bg-red-50', text: 'text-red-600', ring: 'ring-red-100', solid: 'bg-red-500' };
    case 'Trung bình':
      return { bg: 'bg-amber-50', text: 'text-amber-600', ring: 'ring-amber-100', solid: 'bg-amber-500' };
    case 'Thấp':
      return { bg: 'bg-slate-50', text: 'text-slate-600', ring: 'ring-slate-100', solid: 'bg-slate-500' };
    default:
      return { bg: 'bg-gray-50', text: 'text-gray-600', ring: 'ring-gray-100', solid: 'bg-gray-500' };
  }
}

export function statusBadgeClass(status) {
  switch (status) {
    case 1:
      return 'bg-amber-100 text-amber-700';
    case 2:
      return 'bg-blue-100 text-blue-700';
    case 3:
      return 'bg-green-100 text-green-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

export function statusLabel(status) {
  switch (status) {
    case 1:
      return 'Đã tiếp nhận';
    case 2:
      return 'Đang xử lý';
    case 3:
      return 'Hoàn thành';
    default:
      return 'Chưa xử lý';
  }
}

export function joinNonEmpty(parts, sep = ' · ') {
  return parts.filter((x) => typeof x === 'string' && x.trim().length > 0).join(sep);
}

export function maskExtension(ext) {
  const s = String(ext ?? '');
  if (s.length < 2) return s;
  return s.slice(0, 1) + '•'.repeat(s.length - 2) + s.slice(-1);
}
