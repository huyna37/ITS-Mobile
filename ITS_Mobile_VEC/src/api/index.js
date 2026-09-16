export {
  ApiError,
  OfflineError,
  NetworkError,
  UNAUTHORIZED_EVENT_NAME,
  NETWORK_ERROR_EVENT,
  tryApi,
  getToken,
  request,
  get,
  post,
  patch,
  put,
  del,
} from './client.js';

export {
  login,
  logout,
  changePassword,
  refreshToken,
  getMe,
  forgotPassword,
  verifyOtp,
  resetPassword,
} from './auth.js';

export {
  getAssignedTasks,
  getRecentCompletedTasks,
  getTaskById,
  acceptTask,
  reassignTask,
  searchTasks,
} from './tasks.js';

export {
  getIncidents,
  getIncidentDetail,
  updateIncident,
  createIncident,
  deleteIncident,
  addIncidentNote,
  getIncidentTimeline,
  getIncidentsByLocation,
  getIncidentStats,
} from './incidents.js';

export {
  getContacts,
  getContactByExt,
  addContact,
  updateContact,
  deleteContact,
  setContactOnline,
  searchContacts,
  importContacts,
  exportContacts,
} from './contacts.js';

export {
  getCallHistory,
  recordCall,
  endCall,
  getMissedCalls,
  clearCallHistory,
  deleteCallRecord,
  getCallStats,
} from './calls.js';

export {
  getNotifications,
  getUnreadCount,
  markRead,
  markUnread,
  markAllRead,
  deleteNotification,
  registerPushToken,
  unregisterPushToken,
  getNotificationSettings,
  updateNotificationSettings,
  subscribeStream,
} from './notifications.js';

export {
  uploadFile,
  uploadMultiple,
  deleteFile,
  getFileUrl,
  getFileMetadata,
  downloadFile,
  uploadWithProgress,
} from './files.js';

export {
  getProfile,
  updateProfile,
  uploadAvatar,
  removeAvatar,
  getActivityLog,
  getPreferences,
  updatePreferences,
} from './profile.js';
