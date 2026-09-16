import { get, post, patch, del, tryApi } from './client.js';

export function getContacts(params = {}) {
  return tryApi(() => get('/api/contacts', { query: params }));
}

export function getContactByExt(ext) {
  return tryApi(() => get(`/api/contacts/${encodeURIComponent(ext)}`));
}

export function addContact(payload) {
  return tryApi(() => post('/api/contacts', payload));
}

export function updateContact(ext, payload) {
  return tryApi(() => patch(`/api/contacts/${encodeURIComponent(ext)}`, payload));
}

export function deleteContact(ext) {
  return tryApi(() => del(`/api/contacts/${encodeURIComponent(ext)}`));
}

export function setContactOnline(ext, online) {
  return tryApi(() => patch(`/api/contacts/${encodeURIComponent(ext)}/online`, { online }));
}

export function searchContacts(query) {
  return tryApi(() => get('/api/contacts/search', { query: { q: query } }));
}

export function importContacts(payload) {
  return tryApi(() => post('/api/contacts/import', payload));
}

export function exportContacts() {
  return tryApi(() => get('/api/contacts/export'));
}
