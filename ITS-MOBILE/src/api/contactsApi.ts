import { Contact, CallRecord } from '../types/contacts';
import { apiClient } from './client';

export interface BackendContactResponse {
  id: string;
  name: string;
  ext: string;
  online: boolean;
}

export interface BackendCallHistoryResponse {
  id: string;
  extension: string;
  name: string;
  time: string;
  duration: string;
  status: string;
}

function mapContact(c: BackendContactResponse): Contact {
  return {
    id: c.id,
    name: c.name,
    extension: c.ext,
    phone: c.ext,
    department: 'Nội Bài - Lào Cai',
    position: 'Điều hành tuyến',
    isOnline: c.online,
  };
}

function parseDurationString(durationStr?: string | null): number {
  if (!durationStr) return 45;
  if (durationStr.includes(':')) {
    const parts = durationStr.split(':');
    const min = parseInt(parts[0], 10) || 0;
    const sec = parseInt(parts[1], 10) || 0;
    const total = min * 60 + sec;
    return total > 0 ? total : 45;
  }
  const num = parseInt(durationStr, 10);
  return isNaN(num) || num <= 0 ? 45 : num;
}

function mapCallRecord(r: BackendCallHistoryResponse): CallRecord {
  let callType: 'INCOMING' | 'OUTGOING' | 'MISSED' = 'OUTGOING';
  if (r.status === 'Nhỡ cuộc' || r.status === 'MISSED') {
    callType = 'MISSED';
  } else if (r.status === 'INCOMING') {
    callType = 'INCOMING';
  }

  const dur = callType === 'MISSED' ? 0 : parseDurationString(r.duration);
  return {
    id: r.id,
    contactName: r.name,
    extension: r.extension,
    timestamp: r.time,
    durationSeconds: dur,
    type: callType,
  };
}

export async function getContactsApi(): Promise<Contact[]> {
  const res = await apiClient.get<BackendContactResponse[]>('/api/contacts');
  return res.data.map(mapContact);
}

export async function getCallHistoryApi(): Promise<CallRecord[]> {
  const res = await apiClient.get<BackendCallHistoryResponse[]>('/api/calls/history');
  return res.data.map(mapCallRecord);
}

export async function bypassPbxCallApi(
  extension: string,
  name: string,
  duration = 45
): Promise<CallRecord | null> {
  try {
    const res = await apiClient.post<BackendCallHistoryResponse>('/api/calls/bypass-pbx', {
      extension,
      name,
      duration,
      status: 1,
    });
    return mapCallRecord(res.data);
  } catch (err) {
    console.warn('Lỗi gọi API bypass tổng đài PBX, fallback mô phỏng client:', err);
    return {
      id: `BYPASS-${Date.now()}`,
      contactName: name,
      extension,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      durationSeconds: duration,
      type: 'OUTGOING',
    };
  }
}

export async function recordCallApi(payload: {
  extension: string;
  name: string;
  duration?: number;
  status?: number;
}): Promise<CallRecord | null> {
  try {
    const res = await apiClient.post<BackendCallHistoryResponse>('/api/calls/history', {
      ...payload,
      duration: payload.duration && payload.duration > 0 ? payload.duration : 45,
      status: payload.status !== undefined && payload.status > 0 ? payload.status : 1,
    });
    return mapCallRecord(res.data);
  } catch (err) {
    console.warn('Lỗi ghi nhật ký cuộc gọi tới máy chủ:', err);
    return null;
  }
}

export async function recordSosCallApi(hotline: string, location?: string): Promise<CallRecord | null> {
  try {
    const res = await apiClient.post<BackendCallHistoryResponse>('/api/calls/sos', {
      hotline,
      location,
    });
    return mapCallRecord(res.data);
  } catch (err) {
    // Hoạt động offline qua sóng di động GSM không phụ thuộc internet
    console.warn('Gửi log SOS tới máy chủ không thành công (hoạt động offline GSM):', err);
    return null;
  }
}

