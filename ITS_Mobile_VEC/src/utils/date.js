import { APP_CONFIG } from '../config.js';

export function pad2(n) {
  return String(n).padStart(2, '0');
}

export function formatTime(d = new Date()) {
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

export function formatTimeWithSeconds(d = new Date()) {
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
}

export function formatDate(d = new Date()) {
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`;
}

export function formatDateTime(d = new Date()) {
  return `${formatDate(d)} · ${formatTime(d)}`;
}

export function formatShortDateTime(d = new Date()) {
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())} ${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}`;
}

export function formatShortDateTimeYear(d = new Date()) {
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())} ${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`;
}

export function weekdayName(d = new Date()) {
  return APP_CONFIG.weekdays[d.getDay()] || '';
}

export function workScreenDateLine(d = new Date()) {
  return `${weekdayName(d)}, ${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

export function parseISOSafe(s) {
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function timeAgo(input) {
  const d = typeof input === 'string' ? parseISOSafe(input) : input;
  if (!d) return '';
  const diffMs = Math.max(0, Date.now() - d.getTime());
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'vừa xong';
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ngày trước`;
  return formatDate(d);
}

export function isSameDay(a, b) {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isToday(d) {
  return isSameDay(d, new Date());
}

export function diffMinutes(a, b) {
  const da = typeof a === 'string' ? parseISOSafe(a) : a;
  const db = typeof b === 'string' ? parseISOSafe(b) : b;
  if (!da || !db) return 0;
  return Math.round((db.getTime() - da.getTime()) / 60000);
}

export function durationLabel(seconds) {
  if (typeof seconds !== 'number' || seconds < 0) return '';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h${pad2(m)}p`;
  if (m > 0) return `${m}p${pad2(s)}s`;
  return `${s}s`;
}

export function startOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function endOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

export function addMinutes(d, minutes) {
  return new Date(d.getTime() + minutes * 60000);
}
