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

function mapCallRecord(r: BackendCallHistoryResponse): CallRecord {
  let callType: 'INCOMING' | 'OUTGOING' | 'MISSED' = 'OUTGOING';
  if (r.status === 'INCOMING') {
    callType = 'INCOMING';
  } else if (r.status === 'MISSED') {
    callType = 'MISSED';
  }

  const dur = parseInt(r.duration, 10);
  return {
    id: r.id,
    contactName: r.name,
    extension: r.extension,
    timestamp: r.time,
    durationSeconds: isNaN(dur) ? 0 : dur,
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
