import { get, post, tryApi } from './client.js';

export function getAssignedTasks(params = {}) {
  return tryApi(() => get('/api/tasks/assigned', { query: params }));
}

export function getRecentCompletedTasks(params = {}) {
  return tryApi(() => get('/api/tasks/completed-recent', { query: params }));
}

export function getTaskById(id) {
  return tryApi(() => get(`/api/tasks/${encodeURIComponent(id)}`));
}

export function acceptTask(id, payload = {}) {
  return tryApi(() => post(`/api/tasks/${encodeURIComponent(id)}/accept`, payload));
}

export function reassignTask(id, payload) {
  return tryApi(() => post(`/api/tasks/${encodeURIComponent(id)}/reassign`, payload));
}

export function searchTasks(query, params = {}) {
  return tryApi(() => get('/api/tasks/search', { query: { q: query, ...params } }));
}
