const PHONE_RE = /^(?:\+?84|0)\d{9,10}$/;
const EXT_RE = /^\d{4}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VN_LICENSE_RE = /^\d{2}[A-Z]-\d{4,5}$/i;
const KM_MARKER_RE = /^Km\s*\d+(?:\+\d{1,3})?$/i;

export function isNonEmpty(v) {
  return typeof v === 'string' && v.trim().length > 0;
}

export function isValidExtension(v) {
  return typeof v === 'string' && EXT_RE.test(v.trim());
}

export function isValidPhone(v) {
  if (typeof v !== 'string') return false;
  return PHONE_RE.test(v.trim().replace(/[\s.\-()]/g, ''));
}

export function isValidEmail(v) {
  return typeof v === 'string' && EMAIL_RE.test(v.trim());
}

export function isValidLicensePlate(v) {
  return typeof v === 'string' && VN_LICENSE_RE.test(v.trim());
}

export function isValidKmMarker(v) {
  return typeof v === 'string' && KM_MARKER_RE.test(v.trim());
}

export function isValidPassword(v) {
  if (typeof v !== 'string') return false;
  return v.length >= 6;
}

export function isStrongPassword(v) {
  if (!isValidPassword(v)) return false;
  if (v.length < 8) return false;
  const hasLower = /[a-z]/.test(v);
  const hasUpper = /[A-Z]/.test(v);
  const hasDigit = /\d/.test(v);
  return hasLower && hasUpper && hasDigit;
}

export function describePasswordIssue(v) {
  if (!isNonEmpty(v)) return 'Mật khẩu không được để trống.';
  if (v.length < 6) return 'Mật khẩu tối thiểu 6 ký tự.';
  return null;
}

export function describeStrongPasswordIssue(v) {
  const basic = describePasswordIssue(v);
  if (basic) return basic;
  if (v.length < 8) return 'Mật khẩu mạnh cần tối thiểu 8 ký tự.';
  if (!/[a-z]/.test(v)) return 'Cần ít nhất 1 chữ thường (a-z).';
  if (!/[A-Z]/.test(v)) return 'Cần ít nhất 1 chữ in hoa (A-Z).';
  if (!/\d/.test(v)) return 'Cần ít nhất 1 chữ số.';
  return null;
}

export function describeExtensionIssue(v) {
  if (!isNonEmpty(v)) return 'Extension không được để trống.';
  if (!isValidExtension(v)) return 'Extension phải gồm đúng 4 chữ số.';
  return null;
}

export function describePhoneIssue(v) {
  if (!isNonEmpty(v)) return 'Số điện thoại không được để trống.';
  if (!isValidPhone(v)) return 'Số điện thoại không đúng định dạng VN.';
  return null;
}

export function describeEmailIssue(v) {
  if (!isNonEmpty(v)) return 'Email không được để trống.';
  if (!isValidEmail(v)) return 'Email không hợp lệ.';
  return null;
}

export function digitsOnly(v, maxLength) {
  const cleaned = String(v ?? '').replace(/\D/g, '');
  if (typeof maxLength === 'number') return cleaned.slice(0, maxLength);
  return cleaned;
}

export function normalizeWhitespace(v) {
  return String(v ?? '').replace(/\s+/g, ' ').trim();
}

export function clampString(v, maxLength) {
  const s = String(v ?? '');
  return s.length > maxLength ? s.slice(0, maxLength) : s;
}

export function isFileSizeAcceptable(file, maxBytes) {
  if (!file || typeof file.size !== 'number') return false;
  return file.size <= maxBytes;
}

export function isAcceptedMime(file, acceptList) {
  if (!file || typeof file.type !== 'string') return false;
  return acceptList.some((accept) => {
    if (accept.endsWith('/*')) {
      const prefix = accept.slice(0, -1);
      return file.type.startsWith(prefix);
    }
    return file.type === accept;
  });
}
