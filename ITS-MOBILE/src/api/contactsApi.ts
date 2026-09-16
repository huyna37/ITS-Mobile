import { Contact, CallRecord } from '../types/contacts';
import { apiClient } from './client';

const MOCK_CONTACTS: Contact[] = [
  {
    id: 'C-01',
    name: 'Trực ban Điều phối TMC',
    extension: '1001',
    phone: '024.3987.6543',
    department: 'Trung tâm Điều hành Giao thông (TMC)',
    position: 'Trực ban 24/7',
    isOnline: true,
  },
  {
    id: 'C-02',
    name: 'Đội Tuần tra 01 (Vĩnh Phúc)',
    extension: '2011',
    phone: '0988.111.222',
    department: 'Đội Tuần tra Kiểm soát',
    position: 'Đội trưởng',
    isOnline: true,
  },
  {
    id: 'C-03',
    name: 'Đội Cứu hộ Giao thông Yên Bái',
    extension: '3022',
    phone: '0977.333.444',
    department: 'Đội Cứu hộ Cứu nạn',
    position: 'Kỹ thuật viên',
    isOnline: false,
  },
  {
    id: 'C-04',
    name: 'CSGT C08 Phụ trách Tuyến',
    extension: '1008',
    phone: '069.2342.113',
    department: 'Cục Cảnh sát Giao thông',
    position: 'Tổ trưởng tuần tra',
    isOnline: true,
  },
  {
    id: 'C-05',
    name: 'Đội Duy tu Bảo trì Mặt đường',
    extension: '4015',
    phone: '0912.555.666',
    department: 'Công ty Quản lý Vận hành Đường cao tốc VEC O&M',
    position: 'Giám sát kỹ thuật',
    isOnline: false,
  },
];

const MOCK_CALLS: CallRecord[] = [
  {
    id: 'CALL-01',
    contactName: 'Trực ban Điều phối TMC',
    extension: '1001',
    timestamp: '2026-09-16T08:14:00Z',
    durationSeconds: 145,
    type: 'INCOMING',
  },
  {
    id: 'CALL-02',
    contactName: 'Đội Tuần tra 01 (Vĩnh Phúc)',
    extension: '2011',
    timestamp: '2026-09-16T07:50:00Z',
    durationSeconds: 60,
    type: 'OUTGOING',
  },
  {
    id: 'CALL-03',
    contactName: 'Đội Cứu hộ Giao thông Yên Bái',
    extension: '3022',
    timestamp: '2026-09-15T16:20:00Z',
    durationSeconds: 0,
    type: 'MISSED',
  },
];

export async function getContactsApi(): Promise<Contact[]> {
  try {
    const res = await apiClient.get<Contact[]>('/api/contacts');
    return res.data;
  } catch {
    return MOCK_CONTACTS;
  }
}

export async function getCallHistoryApi(): Promise<CallRecord[]> {
  try {
    const res = await apiClient.get<CallRecord[]>('/api/calls/history');
    return res.data;
  } catch {
    return MOCK_CALLS;
  }
}
