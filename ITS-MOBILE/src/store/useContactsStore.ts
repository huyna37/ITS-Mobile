import { create } from 'zustand';
import { Contact, CallRecord } from '../types/contacts';
import {
  getContactsApi,
  getCallHistoryApi,
  recordCallApi,
  bypassPbxCallApi,
  deleteCallRecordApi,
} from '../api/contactsApi';

interface ContactsState {
  contacts: Contact[];
  callHistory: CallRecord[];
  searchQuery: string;
  isLoading: boolean;

  fetchContacts: () => Promise<void>;
  fetchHistory: () => Promise<void>;
  setSearchQuery: (query: string) => void;
  recordCall: (contact: Contact, duration?: number, status?: number) => Promise<CallRecord>;
  deleteCallRecord: (id: string) => Promise<boolean>;
}

export const useContactsStore = create<ContactsState>((set, get) => ({
  contacts: [],
  callHistory: [],
  searchQuery: '',
  isLoading: false,

  fetchContacts: async () => {
    set({ isLoading: true });
    try {
      const [contacts, callHistory] = await Promise.all([getContactsApi(), getCallHistoryApi()]);
      set({ contacts, callHistory, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchHistory: async () => {
    try {
      const callHistory = await getCallHistoryApi();
      set({ callHistory });
    } catch (err) {
      console.warn('Lỗi tải lại lịch sử cuộc gọi:', err);
    }
  },

  setSearchQuery: (searchQuery: string) => {
    set({ searchQuery });
  },

  recordCall: async (contact: Contact, duration = 45, status = 1): Promise<CallRecord> => {
    const pad = (n: number) => String(n).padStart(2, '0');
    const now = new Date();
    const fallbackTimeStr = `${pad(now.getDate())}/${pad(now.getMonth() + 1)} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

    const fallbackRecord: CallRecord = {
      id: `CALL-${Date.now()}`,
      contactName: contact.name,
      extension: contact.extension,
      timestamp: fallbackTimeStr,
      durationSeconds: duration,
      type: 'OUTGOING',
    };

    try {
      const res = await recordCallApi({
        extension: contact.extension,
        name: contact.name,
        duration,
        status,
      });
      const finalRecord = res || fallbackRecord;
      set((state) => ({
        callHistory: [finalRecord, ...state.callHistory.filter((c) => c.id !== finalRecord.id)],
      }));
      return finalRecord;
    } catch {
      set((state) => ({
        callHistory: [fallbackRecord, ...state.callHistory],
      }));
      return fallbackRecord;
    }
  },

  deleteCallRecord: async (id: string): Promise<boolean> => {
    set((state) => ({
      callHistory: state.callHistory.filter((c) => c.id !== id),
    }));
    try {
      return await deleteCallRecordApi(id);
    } catch {
      return false;
    }
  },
}));
