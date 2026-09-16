import { create } from 'zustand';
import { Contact, CallRecord } from '../types/contacts';
import { getContactsApi, getCallHistoryApi } from '../api/contactsApi';

interface ContactsState {
  contacts: Contact[];
  callHistory: CallRecord[];
  searchQuery: string;
  isLoading: boolean;

  fetchContacts: () => Promise<void>;
  setSearchQuery: (query: string) => void;
  recordCall: (contact: Contact) => void;
}

export const useContactsStore = create<ContactsState>((set) => ({
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

  setSearchQuery: (searchQuery) => {
    set({ searchQuery });
  },

  recordCall: (contact) => {
    const newRecord: CallRecord = {
      id: `CALL-${Date.now()}`,
      contactName: contact.name,
      extension: contact.extension,
      timestamp: new Date().toISOString(),
      durationSeconds: 15,
      type: 'OUTGOING',
    };
    set((state) => ({
      callHistory: [newRecord, ...state.callHistory],
    }));
  },
}));
