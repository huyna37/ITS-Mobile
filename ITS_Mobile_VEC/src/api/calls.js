import { get, post, del, tryApi } from './client.js';

export function getCallHistory(params = {}) {
  return tryApi(() => get('/api/calls/history', { query: params }));
}

export function recordCall(payload) {
  return tryApi(() => post('/api/calls/history', payload));
}

export function endCall(callId, payload) {
  return tryApi(() => post(`/api/calls/${encodeURIComponent(callId)}/end`, payload));
}

export function getMissedCalls(params = {}) {
  return tryApi(() => get('/api/calls/missed', { query: params }));
}

export function clearCallHistory() {
  return tryApi(() => del('/api/calls/history'));
}

export function deleteCallRecord(id) {
  return tryApi(() => del(`/api/calls/history/${encodeURIComponent(id)}`));
}

export function getCallStats(params = {}) {
  return tryApi(() => get('/api/calls/stats', { query: params }));
}
