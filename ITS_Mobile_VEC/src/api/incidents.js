import { get, post, patch, del, tryApi } from './client.js';

export function getIncidents(params = {}) {
  return tryApi(() => get('/api/incidents', { query: params }));
}

export function getIncidentDetail(id) {
  return tryApi(() => get(`/api/incidents/${encodeURIComponent(id)}`));
}

export function updateIncident(id, payload) {
  return tryApi(() => patch(`/api/incidents/${encodeURIComponent(id)}`, payload));
}

export function createIncident(payload) {
  return tryApi(() => post('/api/incidents', payload));
}

export function deleteIncident(id) {
  return tryApi(() => del(`/api/incidents/${encodeURIComponent(id)}`));
}

export function addIncidentNote(id, payload) {
  return tryApi(() => post(`/api/incidents/${encodeURIComponent(id)}/notes`, payload));
}

export function getIncidentTimeline(id) {
  return tryApi(() => get(`/api/incidents/${encodeURIComponent(id)}/timeline`));
}

export function getIncidentsByLocation(km, params = {}) {
  return tryApi(() => get('/api/incidents/by-location', { query: { km, ...params } }));
}

export function getIncidentStats(params = {}) {
  return tryApi(() => get('/api/incidents/stats', { query: params }));
}
