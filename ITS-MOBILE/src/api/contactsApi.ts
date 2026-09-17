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

function parseDuration(durationStr?: string | null): number {
  if (!durationStr) return 0;
  if (durationStr.includes(':')) {
    const parts = durationStr.split(':').map((p) => parseInt(p, 10) || 0);
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    } else if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
  }
  const dur = parseInt(durationStr, 10);
  return isNaN(dur) || dur < 0 ? 0 : dur;
}

function mapCallRecord(r: BackendCallHistoryResponse): CallRecord {
  let callType: 'INCOMING' | 'OUTGOING' | 'MISSED' = 'OUTGOING';
  const statusLower = (r.status || '').toLowerCase();
  if (statusLower.includes('nhỡ') || statusLower === 'missed') {
    callType = 'MISSED';
  } else if (statusLower.includes('đến') || statusLower === 'incoming') {
    callType = 'INCOMING';
  }

  const durationSeconds = callType === 'MISSED' ? 0 : parseDuration(r.duration);
  return {
    id: r.id,
    contactName: r.name,
    extension: r.extension,
    timestamp: r.time,
    durationSeconds,
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
      duration: payload.duration !== undefined && payload.duration > 0 ? payload.duration : 45,
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
    console.warn('Gửi log SOS tới máy chủ không thành công (hoạt động offline GSM):', err);
    return null;
  }
}

export async function deleteCallRecordApi(id: string): Promise<boolean> {
  try {
    const res = await apiClient.delete(`/api/calls/history/${id}`);
    return res.status === 200;
  } catch (err) {
    console.warn('Lỗi xóa lịch sử cuộc gọi trên máy chủ:', err);
    return false;
  }
}
