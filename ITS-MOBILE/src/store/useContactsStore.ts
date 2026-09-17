import { create } from 'zustand';
import { Contact, CallRecord } from '../types/contacts';
import { getContactsApi, getCallHistoryApi, bypassPbxCallApi } from '../api/contactsApi';

interface ContactsState {
  contacts: Contact[];
  callHistory: CallRecord[];
  searchQuery: string;
  isLoading: boolean;

  fetchContacts: () => Promise<void>;
  fetchHistory: () => Promise<void>;
  setSearchQuery: (query: string) => void;
  recordCall: (contact: Contact) => void;
}

export const useContactsStore = create<ContactsState>((set, get) => ({
  contacts: [],
  callHistory: [],
  searchQuery: '',
  isLoading: false,

  fetchContacts: async () => {
    set({ isLoading: true });
    try {
      const [contacts, callHistory] = await Promise.all([
        getContactsApi(),
        getCallHistoryApi(),
      ]);
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

  setSearchQuery: (searchQuery) => {
    set({ searchQuery });
  },

  recordCall: (contact) => {
    const simulatedDuration = 45;
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const fullTimeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())} ${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`;

    const newRecord: CallRecord = {
      id: `CALL-${Date.now()}`,
      contactName: contact.name,
      extension: contact.extension,
      timestamp: fullTimeStr,
      durationSeconds: simulatedDuration,
      type: 'OUTGOING',
    };
    set((state) => ({
      callHistory: [newRecord, ...state.callHistory],
    }));

    // Bypass đồng bộ cuộc gọi lên Backend API và tự động tải lại danh sách mới nhất từ server
    bypassPbxCallApi(contact.extension, contact.name, simulatedDuration)
      .then(async () => {
        await get().fetchHistory();
      })
      .catch((err) => {
        console.warn('Lỗi ghi log cuộc gọi bypass:', err);
      });
  },
}));
