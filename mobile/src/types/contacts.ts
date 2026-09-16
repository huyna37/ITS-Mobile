export interface Contact {
  id: string;
  name: string;
  extension: string; // 4 chữ số
  phone: string;
  department: string;
  position: string;
  isOnline: boolean;
  avatar?: string;
}

export interface CallRecord {
  id: string;
  contactName: string;
  extension: string;
  timestamp: string;
  durationSeconds: number;
  type: 'INCOMING' | 'OUTGOING' | 'MISSED';
}
