import { get, post, patch, del, tryApi } from './client.js';

export function getNotifications(params = {}) {
  return tryApi(() => get('/api/notifications', { query: params }));
}

export function getUnreadCount() {
  return tryApi(() => get('/api/notifications/unread-count'));
}

export function markRead(id) {
  return tryApi(() => patch(`/api/notifications/${encodeURIComponent(id)}/read`));
}

export function markUnread(id) {
  return tryApi(() => patch(`/api/notifications/${encodeURIComponent(id)}/unread`));
}

export function markAllRead() {
  return tryApi(() => patch('/api/notifications/read-all'));
}

export function deleteNotification(id) {
  return tryApi(() => del(`/api/notifications/${encodeURIComponent(id)}`));
}

export function registerPushToken(token, platform = 'web') {
  return tryApi(() => post('/api/notifications/push/register', { token, platform }));
}

export function unregisterPushToken(token) {
  return tryApi(() => post('/api/notifications/push/unregister', { token }));
}

export function getNotificationSettings() {
  return tryApi(() => get('/api/notifications/settings'));
}

export function updateNotificationSettings(payload) {
  return tryApi(() => patch('/api/notifications/settings', payload));
}

export function subscribeStream(onMessage) {
  if (typeof EventSource === 'undefined') return () => {};
  let source;
  try {
    source = new EventSource('/api/notifications/stream');
    source.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data);
        onMessage(data);
      } catch {}
    };
  } catch {
    return () => {};
  }
  return () => {
    try {
      source.close();
    } catch {}
  };
}
