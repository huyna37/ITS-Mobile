import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Phone,
  AlertCircle,
  ClipboardList,
  Bell,
  User,
  ChevronRight,
  Camera,
  MapPin,
  Clock,
  PhoneCall,
  LogOut,
  Search,
  Navigation,
  Construction,
  CloudRain,
  History,
  CheckCircle2,
  Video,
  Paperclip,
  Send,
  Plus,
  Pencil,
  Trash2,
  KeyRound,
  X,
  RefreshCw,
} from 'lucide-react';

// ============================================================
// 1) CẤU HÌNH RUNTIME — đọc từ biến môi trường Vite (.env / .env.local).
//    Toàn bộ giá trị trước đây hardcode đều có thể override qua VITE_*.
//    Xem .env.example để biết danh mục đầy đủ.
// ============================================================
import {
  login,
  logout,
  changePassword,
  refreshToken,
  getMe,
  getAssignedTasks,
  getRecentCompletedTasks,
  getIncidents,
  getIncidentDetail,
  updateIncident,
  createIncident,
  deleteIncident,
  addIncidentNote,
  getIncidentTimeline,
  getContacts,
  getContactByExt,
  addContact,
  updateContact,
  deleteContact,
  setContactOnline,
  searchContacts,
  importContacts,
  exportContacts,
  getCallHistory,
  recordCall,
  endCall,
  getMissedCalls,
  clearCallHistory,
  deleteCallRecord,
  getCallStats,
  getNotifications,
  getUnreadCount,
  markRead,
  markUnread,
  markAllRead,
  deleteNotification,
  registerPushToken,
  unregisterPushToken,
  subscribeStream,
  uploadFile,
  uploadMultiple,
  deleteFile,
  getFileUrl,
  getFileMetadata,
  downloadFile,
  uploadWithProgress,
  getProfile,
  updateProfile,
  uploadAvatar,
  removeAvatar,
  getActivityLog,
  getPreferences,
  updatePreferences,
  tryApi,
  get,
  post,
  patch,
  put,
  del,
  getToken,
  UNAUTHORIZED_EVENT_NAME,
  NETWORK_ERROR_EVENT,
} from './api/';

const ENV = import.meta.env || {};

const PRIMARY = ENV.VITE_PRIMARY_COLOR || '#0097f0';
const HIGHWAY_TITLE =
  ENV.VITE_HIGHWAY_TITLE || ENV.VITE_APP_TITLE || 'VẬN HÀNH CAO TỐC NỘI BÀI - LÀO CAI';
const APP_SUBTITLE =
  ENV.VITE_HIGHWAY_SUBTITLE || ENV.VITE_APP_SUBTITLE || 'Hệ thống điều hành ITS';
const ITS_AMBIENT_BG = ENV.VITE_ITS_BG_URL || 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1400&q=80';
const SOS_TEL = ENV.VITE_SOS_TEL || '113';
const LS_SESSION = ENV.VITE_LS_SESSION_KEY || 'its_session_v1';
const LS_HISTORY = ENV.VITE_LS_HISTORY_KEY || 'its_call_history_v1';
const TMC_NAME = ENV.VITE_TMC_NAME || 'Trung tâm điều hành (TMC)';

// ============================================================
// 2) ĐỊNH DẠNG NGÀY GIỜ
// ============================================================
const VI_WEEKDAYS = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

function vietnameseWorkScreenDateLine(d = new Date()) {
  const weekday = VI_WEEKDAYS[d.getDay()];
  return `${weekday}, ${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

function pad2(n) {
  return String(n).padStart(2, '0');
}

function formatVnDateTime(date) {
  const d = date instanceof Date ? date : new Date(date);
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())} ${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`;
}

// ============================================================
// 3) LƯU PHIÊN ĐĂNG NHẬP + CACHE LỊCH SỬ
// ============================================================
function loadSession() {
  try {
    const raw = localStorage.getItem(LS_SESSION);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveSession(s) {
  if (s) localStorage.setItem(LS_SESSION, JSON.stringify(s));
  else localStorage.removeItem(LS_SESSION);
}

function loadLocalCallHistory() {
  try {
    const raw = localStorage.getItem(LS_HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function loadToken() {
  const s = loadSession();
  return s?.token || null;
}

// ============================================================
// 5) TIỆN ÍCH UI
// ============================================================
function getTaskStatusInfo(status) {
  switch (status) {
    case 1:
      return { label: 'Đã tiếp nhận', color: 'bg-amber-100 text-amber-700' };
    case 2:
      return { label: 'Đang xử lý', color: 'bg-blue-100 text-blue-700' };
    case 3:
      return { label: 'Hoàn thành', color: 'bg-green-100 text-green-700' };
    default:
      return { label: 'Chưa xử lý', color: 'bg-gray-100 text-gray-700' };
  }
}

function getIncidentIcon(kind) {
  switch (kind) {
    case 'weather':
      return <CloudRain size={18} className="text-blue-500" />;
    case 'accident':
      return <AlertCircle size={18} className="text-red-500" />;
    case 'maintenance':
    default:
      return <Construction size={18} className="text-amber-500" />;
  }
}

function initialStatusHistory(task, operatorName) {
  const op = operatorName || 'Người vận hành';
  const rows = [
    {
      id: 'init-1',
      time: task.time,
      text: 'Phân công nhiệm vụ từ ITS/TMC',
      actor: 'Hệ thống',
    },
  ];
  if (task.status >= 1) {
    rows.push({ id: 'init-2', time: '13:55 25/05', text: 'Đã tiếp nhận (1)', actor: op });
  }
  if (task.status >= 2) {
    rows.push({ id: 'init-3', time: '14:05 25/05', text: 'Chuyển sang Đang xử lý (2)', actor: op });
  }
  return rows;
}

// ============================================================
// 7) TaskDetailViewPanel — chi tiết sự cố + cập nhật trạng thái
//    GET /incidents/:id để lấy bản đầy đủ; PATCH để gửi update.
// ============================================================
function TaskDetailViewPanel({ task, operatorName, onBack, onUpdated }) {
  const urlsRef = useRef(new Set());
  const photoCamRef = useRef(null);
  const videoCamRef = useRef(null);
  const attachRef = useRef(null);

  const [enriched, setEnriched] = useState(task);
  const [fieldNotes, setFieldNotes] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [detailStatus, setDetailStatus] = useState(task.status);
  const [statusLog, setStatusLog] = useState(() => initialStatusHistory(task, operatorName));
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const [detailNotFound, setDetailNotFound] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState([]);
  const [fileUploadError, setFileUploadError] = useState('');
  const [fileUploadSuccess, setFileUploadSuccess] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function loadDetail() {
      setLoadingDetail(true);
      setDetailNotFound(false);
      try {
        const detail = await getIncidentDetail(task.id);
        if (cancelled) return;
        if (!detail) {
          setDetailNotFound(true);
          setLoadingDetail(false);
          return;
        }
        setEnriched((prev) => ({ ...prev, ...detail }));
        if (Array.isArray(detail.statusLog) && detail.statusLog.length) {
          setStatusLog(detail.statusLog);
        }
        if (typeof detail.status === 'number') setDetailStatus(detail.status);
      } catch (e) {
        if (!cancelled) {
          setErrMsg(`Không tải được chi tiết sự cố: ${e?.message || e}`);
        }
      } finally {
        if (!cancelled) setLoadingDetail(false);
      }
    }
    loadDetail();
    return () => {
      cancelled = true;
    };
  }, [task.id]);

  useEffect(() => {
    const urls = urlsRef.current;
    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u));
      urls.clear();
    };
  }, [task.id]);

  const pushStatusLog = (text, actor) => {
    setStatusLog((prev) => [
      ...prev,
      { id: `log-${Date.now()}`, time: formatVnDateTime(new Date()), text, actor },
    ]);
  };

  const addFilesFromInput = async (e) => {
    const files = e.target.files;
    if (!files?.length) return;
    setFileUploadError('');
    const newAttachments = [];
    for (const file of Array.from(files)) {
      const isVideo = file.type.startsWith('video');
      const acceptTypes = isVideo ? 'video/*' : 'image/*';
      if (!file.type.match(/^image\/.*$/i) && !file.type.match(/^video\/.*$/i)) {
        setFileUploadError(`"${file.name}" không phải ảnh/video. Chỉ chấp nhận file ảnh hoặc video.`);
        continue;
      }
      if (file.size > 50 * 1024 * 1024) {
        setFileUploadError(`"${file.name}" vượt quá 50MB. File quá lớn.`);
        continue;
      }
      const fakeId = `f-${Date.now()}-${newAttachments.length}`;
      setUploadingFiles((prev) => [...prev, fakeId]);
      try {
        const uploaded = await uploadFile(file, {
          kind: isVideo ? 'video' : 'image',
          taskId: task.id,
        });
        const attachment = {
          id: uploaded?.id || fakeId,
          url: uploaded?.url || uploaded?.downloadUrl || `${APP_CONFIG.apiBaseUrl}/api/files/${encodeURIComponent(uploaded?.id || fakeId)}/download`,
          file,
          name: file.name || (isVideo ? 'video.mp4' : 'anh.jpg'),
          kind: isVideo ? 'video' : 'image',
          remote: true,
        };
        newAttachments.push(attachment);
        setFileUploadSuccess(`Đã tải lên "${file.name}"`);
        setTimeout(() => setFileUploadSuccess(''), 2000);
      } catch (e) {
        const fallbackAttachment = {
          id: fakeId,
          url: URL.createObjectURL(file),
          urlsRef: urlsRef,
          file,
          name: file.name || (isVideo ? 'video.mp4' : 'anh.jpg'),
          kind: isVideo ? 'video' : 'image',
          remote: false,
        };
        newAttachments.push(fallbackAttachment);
        setFileUploadError(`Không tải lên được "${file.name}": ${e?.message || e}. Đã lưu cục bộ.`);
        setTimeout(() => setFileUploadError(''), 5000);
      } finally {
        setUploadingFiles((prev) => prev.filter((id) => id !== fakeId));
      }
    }
    if (newAttachments.length) {
      setAttachments((prev) => [...prev, ...newAttachments]);
    }
    e.target.value = '';
  };

  const removeAttachment = async (id) => {
    setAttachments((prev) => {
      const item = prev.find((x) => x.id === id);
      if (item) {
        if (item.url) URL.revokeObjectURL(item.url);
        urlsRef.current.delete(item.url);
      }
      return prev.filter((x) => x.id !== id);
    });
    const attachment = attachments.find((a) => a.id === id);
    if (attachment?.remote) {
      try {
        await deleteFile(id);
        setFileUploadSuccess(`Đã xóa tệp "${id}" khỏi máy chủ`);
        setTimeout(() => setFileUploadSuccess(''), 2000);
      } catch (e) {
        setFileUploadError(`Không xóa được trên máy chủ: ${e?.message || e}`);
        setTimeout(() => setFileUploadError(''), 5000);
      }
    }
  };

  const applyStatus = async (s) => {
    if (s === detailStatus) return;
    const prev = detailStatus;
    setDetailStatus(s);
    const label = s === 1 ? 'Đã tiếp nhận (1)' : s === 2 ? 'Đang xử lý (2)' : 'Hoàn thành (3)';
    pushStatusLog(`Chuyển trạng thái: ${label}`, operatorName);
    try {
      await updateIncident(task.id, { status: s, actor: operatorName });
      onUpdated?.({ ...enriched, status: s });
    } catch (e) {
      setErrMsg(`Không cập nhật được trạng thái: ${e?.message || e}`);
      setDetailStatus(prev);
    }
  };

  const submitToTmc = async () => {
    const bits = [];
    if (fieldNotes.trim()) bits.push('ghi nhận hiện trường');
    if (attachments.length) bits.push(`${attachments.length} tệp ảnh/video`);
    const summary = bits.length
      ? `Gửi báo cáo về TMC (${bits.join(', ')})`
      : 'Gửi xác nhận cập nhật về TMC';
    pushStatusLog(summary, operatorName);
    setErrMsg('');

    setSubmitting(true);
    try {
      await updateIncident(task.id, {
        notes: fieldNotes.trim(),
        attachments: attachments.map((a) => ({ name: a.name, kind: a.kind })),
        status: detailStatus,
        actor: operatorName,
      });
      onUpdated?.({ ...enriched, status: detailStatus });
      window.alert('Đã gửi thông tin về Trung tâm điều hành (TMC).');
    } catch (e) {
      setErrMsg(`Gửi báo cáo thất bại: ${e?.message || e}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="sticky top-0 z-20 flex items-center justify-between border-b bg-white p-4">
        <button type="button" onClick={onBack} className="-ml-2 p-2">
          <ChevronRight size={24} className="rotate-180" />
        </button>
        <span className="font-bold text-gray-800">
          Chi tiết sự cố{loadingDetail ? ' …' : ''}
        </span>
        <button type="button" className="-mr-2 p-2">
          <PhoneCall size={20} style={{ color: PRIMARY }} />
        </button>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto p-4 pb-44">
        {errMsg ? (
          <p className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-600">{errMsg}</p>
        ) : null}

        {loadingDetail && !detailNotFound ? (
          <div className="flex items-center justify-center py-12 space-x-2">
            <RefreshCw size={20} className="animate-spin text-blue-500" />
            <span className="text-sm text-gray-500">Đang tải chi tiết sự cố…</span>
          </div>
        ) : null}

        {detailNotFound ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <AlertCircle size={32} className="text-red-400" />
            <p className="text-sm font-bold text-gray-700">Không tìm thấy sự cố</p>
            <p className="text-xs text-gray-400">Mã sự cố không tồn tại hoặc đã bị xóa.</p>
          </div>
        ) : null}

        {(!loadingDetail && !detailNotFound) ? (
          <>
            <div className="space-y-4 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    enriched.level === 'Nghiêm trọng' ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'
                  }`}
                >
                  {enriched.level}
                </span>
                <span className="text-xs font-medium text-gray-400">Mã: {enriched.id}</span>
              </div>
              <h2 className="text-2xl font-black text-gray-800">{enriched.type}</h2>

              <div className="grid grid-cols-2 gap-4 border-t border-gray-50 pt-2">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase text-gray-400">Vị trí</p>
                  <p className="text-sm font-bold">{enriched.location}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase text-gray-400">Hướng</p>
                  <p className="text-sm font-bold">{enriched.direction}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase text-gray-400">Mô tả ban đầu</p>
                <p className="rounded-xl bg-gray-50 p-3 text-sm text-gray-600">{enriched.description}</p>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase text-gray-400">Phương án xử lý (Script)</p>
                <p className="rounded-xl bg-blue-50 p-3 text-sm font-bold text-blue-700">{enriched.script}</p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="ml-2 text-sm font-bold text-gray-800">Lịch sử cập nhật trạng thái</h3>
              <div className="relative ml-3 border-l-2 border-slate-200 pl-5">
                {statusLog.map((entry) => (
                  <div key={entry.id} className="relative pb-5 last:pb-0">
                    <div className="absolute -left-[23px] top-1.5 h-3 w-3 rounded-full border-2 border-white bg-blue-500 shadow ring-1 ring-blue-200" />
                    <p className="text-[11px] font-semibold text-gray-400">{entry.time}</p>
                    <p className="mt-0.5 text-sm font-bold text-gray-900">{entry.text}</p>
                    <p className="text-xs text-gray-500">{entry.actor}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="ml-2 text-sm font-bold text-gray-800">Cập nhật trạng thái (1 → 2 → 3)</h3>
              <p className="ml-2 text-xs text-gray-500">Hiện tại: {getTaskStatusInfo(detailStatus).label}</p>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((s) => {
                  const isPast = s < detailStatus;
                  const isCurrent = s === detailStatus;
                  const isFuture = s > detailStatus;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => isFuture && applyStatus(s)}
                      disabled={!isFuture}
                      className={`rounded-2xl border p-3 text-xs font-bold transition-all ${
                        isCurrent
                          ? s === 1
                            ? 'border-amber-500 bg-amber-500 text-white'
                            : s === 2
                              ? 'border-blue-500 bg-blue-500 text-white'
                              : 'border-green-500 bg-green-500 text-white'
                          : isPast
                            ? 'border-green-300 bg-green-50 text-green-600 cursor-default'
                            : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {s === 1 ? 'Đã nhận (1)' : s === 2 ? 'Đang xử lý (2)' : 'Hoàn thành (3)'}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="ml-2 text-sm font-bold text-gray-800">Ghi nhận hiện trường</h3>
              <p className="ml-2 text-xs text-gray-500">
                Nhập diễn biến, quan sát tại hiện trường để gửi kèm báo cáo về TMC.
              </p>
              <textarea
                value={fieldNotes}
                onChange={(e) => setFieldNotes(e.target.value)}
                rows={4}
                placeholder="Ví dụ: Đã phân luồng, 2 làn lưu thông; đang chờ cứu hộ…"
                className="w-full resize-y rounded-2xl border border-gray-200 bg-gray-50/80 p-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="space-y-3">
              <h3 className="ml-2 text-sm font-bold text-gray-800">Ảnh &amp; video gửi TMC</h3>
              <p className="ml-2 text-xs text-gray-500">Chụp mới hoặc đính kèm từ thư viện thiết bị.</p>
              <input
                ref={photoCamRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={addFilesFromInput}
              />
              <input
                ref={videoCamRef}
                type="file"
                accept="video/*"
                capture="environment"
                className="hidden"
                onChange={addFilesFromInput}
              />
              <input
                ref={attachRef}
                type="file"
                accept="image/*,video/*"
                multiple
                className="hidden"
                onChange={addFilesFromInput}
              />
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => photoCamRef.current?.click()}
                  className="flex aspect-square flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 text-gray-600 active:bg-gray-100"
                >
                  <Camera size={22} />
                  <span className="mt-1 text-center text-[10px] font-bold leading-tight">Chụp ảnh</span>
                </button>
                <button
                  type="button"
                  onClick={() => videoCamRef.current?.click()}
                  className="flex aspect-square flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 text-gray-600 active:bg-gray-100"
                >
                  <Video size={22} />
                  <span className="mt-1 text-center text-[10px] font-bold leading-tight">Quay / video</span>
                </button>
                <button
                  type="button"
                  onClick={() => attachRef.current?.click()}
                  className="flex aspect-square flex-col items-center justify-center rounded-2xl border-2 border-dashed border-amber-200 bg-amber-50/80 text-amber-800 active:bg-amber-100"
                >
                  <Paperclip size={22} />
                  <span className="mt-1 text-center text-[10px] font-bold leading-tight">Đính kèm</span>
                </button>
              </div>

              {attachments.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {attachments.map((a) => (
                    <div
                      key={a.id}
                      className="relative aspect-square overflow-hidden rounded-xl border border-gray-200 bg-black/5"
                    >
                      {a.kind === 'video' ? (
                        <video src={a.url} className="h-full w-full object-cover" muted playsInline controls />
                      ) : (
                        <img src={a.url} alt="" className="h-full w-full object-cover" />
                      )}
                      <button
                        type="button"
                        onClick={() => removeAttachment(a.id)}
                        className="absolute right-1 top-1 rounded-lg bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white shadow"
                      >
                        ✕
                      </button>
                      <span className="absolute bottom-1 left-1 right-1 truncate rounded bg-black/60 px-1 text-[9px] text-white">
                        {a.name}
                      </span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </>
        ) : null}
      </div>

      <div className="sticky bottom-0 z-20 border-t bg-white p-4 shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.15)]">
        <button
          type="button"
          onClick={submitToTmc}
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-bold text-white shadow-lg disabled:opacity-60"
          style={{ backgroundColor: PRIMARY }}
        >
          <Send size={18} />
          {submitting ? 'Đang gửi…' : 'Gửi báo cáo về TMC'}
        </button>
      </div>
    </div>
  );
}

// ============================================================
// 8) LoginScreen — extract khỏi App để tránh remount mất focus
// ============================================================
function LoginScreen({
  loginAccount,
  setLoginAccount,
  loginExt,
  setLoginExt,
  loginPass,
  setLoginPass,
  loginErr,
  loginSubmitting,
  onSubmit,
}) {
  return (
    <div
      className="login-app-mode relative mx-auto flex min-h-[100dvh] w-full max-w-md flex-col justify-center bg-white [-webkit-overflow-scrolling:touch]"
      style={{
        paddingTop: 'max(2rem, env(safe-area-inset-top, 0px))',
        paddingBottom: 'max(2rem, env(safe-area-inset-bottom, 0px))',
        paddingLeft: 'max(2rem, env(safe-area-inset-left, 0px))',
        paddingRight: 'max(2rem, env(safe-area-inset-right, 0px))',
      }}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[env(safe-area-inset-top,0px)] opacity-90"
        style={{ backgroundColor: PRIMARY }}
        aria-hidden
      />
      <div className="relative z-[1] mb-12 flex flex-col items-center">
        <div
          className="mb-4 flex h-24 w-24 items-center justify-center rounded-3xl text-white shadow-xl"
          style={{ backgroundColor: PRIMARY }}
        >
          <Navigation size={48} fill="white" />
        </div>
        <h1
          className="w-full max-w-full px-1 text-center text-[0.95rem] font-black uppercase leading-snug tracking-wide text-balance sm:text-lg md:text-xl"
          style={{ color: PRIMARY }}
        >
          {HIGHWAY_TITLE}
        </h1>
        <p className="mt-2 text-center text-sm text-gray-500">{APP_SUBTITLE}</p>
      </div>

      <form className="relative z-[1] space-y-4" onSubmit={onSubmit}>
        {loginErr ? (
          <p className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-600">{loginErr}</p>
        ) : null}
        <div className="space-y-1">
          <label className="ml-1 text-xs font-bold uppercase text-gray-500">Tài khoản nội bộ</label>
          <input
            type="text"
            autoComplete="username"
            value={loginAccount}
            onChange={(e) => setLoginAccount(e.target.value)}
            className="w-full rounded-2xl border-none bg-gray-50 p-4 focus:ring-2 focus:ring-blue-400"
            placeholder="Nhập username"
          />
        </div>
        <div className="space-y-1">
          <label className="ml-1 text-xs font-bold uppercase text-gray-500">Extension PBX (4 số)</label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={4}
            value={loginExt}
            onChange={(e) => setLoginExt(e.target.value.replace(/\D/g, '').slice(0, 4))}
            className="w-full rounded-2xl border-none bg-gray-50 p-4 focus:ring-2 focus:ring-blue-400"
            placeholder="Ví dụ: 8011"
          />
        </div>
        <div className="space-y-1">
          <label className="ml-1 text-xs font-bold uppercase text-gray-500">Mật khẩu</label>
          <input
            type="password"
            autoComplete="current-password"
            value={loginPass}
            onChange={(e) => setLoginPass(e.target.value)}
            className="w-full rounded-2xl border-none bg-gray-50 p-4 focus:ring-2 focus:ring-blue-400"
            placeholder="••••••••"
          />
        </div>
        <button
          type="submit"
          disabled={loginSubmitting}
          className="mt-4 min-h-[48px] w-full rounded-2xl py-4 font-bold text-white shadow-lg transition-transform active:scale-[0.98] disabled:opacity-60"
          style={{ backgroundColor: PRIMARY }}
        >
          {loginSubmitting ? 'Đang đăng nhập…' : 'ĐĂNG NHẬP'}
        </button>
      </form>
    </div>
  );
}

// ============================================================
// 9) ContactFormModal — thêm / sửa liên hệ
// ============================================================
function ContactFormModal({ open, editing, onClose, onSubmit, saving, errMsg }) {
  const [name, setName] = useState('');
  const [ext, setExt] = useState('');

  useEffect(() => {
    if (open) {
      setName(editing?.name || '');
      setExt(editing?.ext || '');
    }
  }, [open, editing]);

  if (!open) return null;
  const isEdit = !!editing;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-gray-900">
            {isEdit ? 'Sửa liên hệ' : 'Thêm liên hệ mới'}
          </h3>
          <button type="button" onClick={onClose} className="p-1 text-gray-400 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit({ name, ext });
          }}
        >
          {errMsg ? (
            <p className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-600">{errMsg}</p>
          ) : null}
          <div className="space-y-1">
            <label className="ml-1 text-xs font-bold uppercase text-gray-500">Tên liên hệ</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-2xl border-none bg-gray-50 p-3 focus:ring-2 focus:ring-blue-400"
              placeholder="Ví dụ: Đội tuần tra IC5"
            />
          </div>
          <div className="space-y-1">
            <label className="ml-1 text-xs font-bold uppercase text-gray-500">Extension PBX</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={ext}
              onChange={(e) => setExt(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full rounded-2xl border-none bg-gray-50 p-3 focus:ring-2 focus:ring-blue-400"
              placeholder="Ví dụ: 8021"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl border border-gray-200 font-bold text-gray-700"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 rounded-2xl text-white font-bold disabled:opacity-60"
              style={{ backgroundColor: PRIMARY }}
            >
              {saving ? 'Đang lưu…' : isEdit ? 'Lưu thay đổi' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================
// 10) APP — root component
// ============================================================
export default function App() {
  const [session, setSession] = useState(null);
  const [booting, setBooting] = useState(true);

  const [activeTab, setActiveTab] = useState('calls');
  const [currentView, setCurrentView] = useState('list');
  const [selectedTask, setSelectedTask] = useState(null);
  const [callsSubTab, setCallsSubTab] = useState('directory');

  const [tasks, setTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifError, setNotifError] = useState('');
  const [contacts, setContacts] = useState([]);
  const [callHistory, setCallHistory] = useState([]);

  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState('');

  const [loginAccount, setLoginAccount] = useState('');
  const [loginExt, setLoginExt] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginErr, setLoginErr] = useState('');
  const [loginSubmitting, setLoginSubmitting] = useState(false);

  const [profile, setProfile] = useState(null);
  const [profileErr, setProfileErr] = useState('');
  const [pref, setPref] = useState(null);
  const [prefLoading, setPrefLoading] = useState(false);
  const [prefSaved, setPrefSaved] = useState(false);

  const [sosOpen, setSosOpen] = useState(false);

  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [contactEditing, setContactEditing] = useState(null);
  const [contactSaving, setContactSaving] = useState(false);
  const [contactErr, setContactErr] = useState('');

  const [callRecording, setCallRecording] = useState(false);
  const [callUploadProgress, setCallUploadProgress] = useState(0);
  const [callUploadError, setCallUploadError] = useState('');
  const [callUploadSuccess, setCallUploadSuccess] = useState('');

  const [pwOpen, setPwOpen] = useState(false);
  const [prefOpen, setPrefOpen] = useState(false);
  const [pwOld, setPwOld] = useState('');
  const [pwNew, setPwNew] = useState('');
  const [pwConfirm, setPwConfirm] = useState('');
  const [pwErr, setPwErr] = useState('');
  const [pwOk, setPwOk] = useState('');
  const [pwSubmitting, setPwSubmitting] = useState(false);

  const isLoggedIn = !!session;

  // ---- Tải toàn bộ dữ liệu sau đăng nhập ----
  const reloadData = useCallback(async () => {
    setDataLoading(true);
    setDataError('');
    try {
      const [t, ct, inc, notif, cts, ch] = await Promise.all([
        getAssignedTasks(),
        getRecentCompletedTasks(),
        getIncidents(),
        getNotifications(),
        getContacts(),
        getCallHistory(),
      ]);
      setTasks(Array.isArray(t) ? t : []);
      setCompletedTasks(Array.isArray(ct) ? ct : []);
      setIncidents(Array.isArray(inc) ? inc : []);
      setNotifications(Array.isArray(notif) ? notif : []);
      setContacts(Array.isArray(cts) ? cts : []);
      setCallHistory(Array.isArray(ch) ? ch : []);
    } catch (e) {
      if (e?.status === 401 || e?.code === 'UNAUTHORIZED') {
        saveSession(null);
        setSession(null);
        return;
      }
      setDataError(`Tải dữ liệu thất bại: ${e?.message || e}`);
    } finally {
      setDataLoading(false);
    }
  }, []);

  // ---- Boot: khôi phục phiên đã lưu ----
  useEffect(() => {
    const s = loadSession();
    if (s) setSession(s);
    setBooting(false);
  }, []);

  // ---- Khi có session -> nạp data ----
  useEffect(() => {
    if (session) reloadData();
  }, [session, reloadData]);

  // ---- Cache lịch sử cuộc gọi cục bộ ----
  useEffect(() => {
    if (!isLoggedIn) return;
    try {
      localStorage.setItem(LS_HISTORY, JSON.stringify(callHistory));
    } catch {
      /* ignore */
    }
  }, [callHistory, isLoggedIn]);

  const unreadNotificationCount = useMemo(
    () => notifications.filter((n) => n.unread).length,
    [notifications]
  );

  // ---- Đăng nhập ----
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginErr('');
    if (!loginAccount.trim() || !loginPass.trim()) {
      setLoginErr('Vui lòng nhập đủ tài khoản và mật khẩu.');
      return;
    }
    if (loginExt.trim() && !/^\d{4}$/.test(loginExt.trim())) {
      setLoginErr('Extension phải gồm đúng 4 chữ số (hoặc để trống).');
      return;
    }
    setLoginSubmitting(true);
    try {
      const res = await login({
        username: loginAccount.trim(),
        password: loginPass.trim(),
        extension: loginExt.trim(),
      });
      const token = res?.token || res?.access_token;
      if (!token) throw new Error('Server không trả token.');
      const p = res?.profile || res?.user || {};
      const sessionPayload = {
        token,
        profile: {
          ten_nhan_vien: p.ten_nhan_vien || p.full_name || p.fullName || '',
          chuc_vu: p.chuc_vu || p.role || '',
          don_vi: p.don_vi || p.unit || '',
          extension: p.extension || loginExt.trim(),
        },
      };
      saveSession(sessionPayload);
      setSession(sessionPayload);
      setActiveTab('calls');
      setCallsSubTab('directory');
      setCurrentView('list');
    } catch (e2) {
      if (e2?.status === 400 || e2?.status === 401) {
        setLoginErr('Sai tài khoản hoặc mật khẩu.');
      } else {
        setLoginErr(`Đăng nhập thất bại: ${e2?.message || e2}`);
      }
    } finally {
      setLoginSubmitting(false);
    }
  };

  // ---- Đăng xuất ----
  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      /* ignore */
    }
    saveSession(null);
    localStorage.removeItem(LS_HISTORY);
    setSession(null);
    setCallHistory([]);
    setTasks([]);
    setCompletedTasks([]);
    setIncidents([]);
    setNotifications([]);
    setContacts([]);
    setLoginAccount('');
    setLoginExt('');
    setLoginPass('');
    setActiveTab('calls');
    setCurrentView('list');
    setPwOld('');
    setPwNew('');
    setPwConfirm('');
    setPwOpen(false);
    setPwOk('');
    setPwErr('');
  };

  // ---- Ghi nhận cuộc gọi qua API ----
  const addCallHistory = async (contact) => {
    try {
      const result = await recordCall({ extension: contact.ext, name: contact.name, type: 'outgoing' });
      const now = new Date();
      const timeStr = `${pad2(now.getHours())}:${pad2(now.getMinutes())} ${pad2(now.getDate())}/${pad2(now.getMonth() + 1)}`;
      setCallHistory((prev) => [
        {
          id: result?.id || 'h-' + Date.now(),
          extension_nguoi_nhan: contact.ext,
          ten_nguoi_nhan: contact.name,
          thoi_gian: timeStr,
          thoi_luong: null,
          trang_thai: 'ringing',
        },
        ...prev,
      ]);
    } catch (e) {
      setDataError(`Ghi nhận cuộc gọi thất bại: ${e?.message || e}`);
    }
  };

  const confirmSos = () => {
    setSosOpen(false);
    window.location.href = `tel:${SOS_TEL}`;
  };

  // ---- CRUD danh bạ ----
  const openNewContact = () => {
    setContactEditing(null);
    setContactErr('');
    setContactModalOpen(true);
  };

  const openEditContact = (c) => {
    setContactEditing(c);
    setContactErr('');
    setContactModalOpen(true);
  };

  const submitContact = async ({ name, ext }) => {
    setContactErr('');
    const trimmedName = (name || '').trim();
    const trimmedExt = (ext || '').trim();
    if (!trimmedName) {
      setContactErr('Tên liên hệ không được trống.');
      return;
    }
    if (!/^\d{3,6}$/.test(trimmedExt)) {
      setContactErr('Extension phải gồm 3–6 chữ số.');
      return;
    }
    setContactSaving(true);
    try {
      if (contactEditing) {
        const originalExt = contactEditing.ext;
        const updated = await updateContact(originalExt, {
          name: trimmedName,
          ext: trimmedExt,
        });
        setContacts((prev) =>
          prev.map((x) =>
            x.id === contactEditing.id
              ? { ...x, ...(updated || {}), name: trimmedName, ext: trimmedExt }
              : x
          )
        );
      } else {
        if (contacts.some((x) => x.ext === trimmedExt)) {
          setContactErr(`Extension ${trimmedExt} đã có trong danh bạ.`);
          setContactSaving(false);
          return;
        }
        const created = await addContact({ name: trimmedName, ext: trimmedExt });
        setContacts((prev) => [
          created || {
            id: `c-${trimmedExt}`,
            name: trimmedName,
            ext: trimmedExt,
            online: false,
          },
          ...prev,
        ]);
      }
      setContactModalOpen(false);
    } catch (e) {
      setContactErr(`Lưu thất bại: ${e?.message || e}`);
    } finally {
      setContactSaving(false);
    }
  };

  const removeContact = async (c) => {
    if (!window.confirm(`Xóa liên hệ "${c.name}"?`)) return;
    try {
      await deleteContact(c.ext);
      setContacts((prev) => prev.filter((x) => x.id !== c.id));
    } catch (e) {
      window.alert(`Xóa thất bại: ${e?.message || e}`);
    }
  };

  // ---- Đổi mật khẩu ----
  const submitPasswordChange = async (e) => {
    e.preventDefault();
    setPwErr('');
    setPwOk('');
    if (!pwOld || !pwNew) {
      setPwErr('Vui lòng nhập đầy đủ.');
      return;
    }
    if (pwNew.length < 6) {
      setPwErr('Mật khẩu mới phải tối thiểu 6 ký tự.');
      return;
    }
    if (pwNew !== pwConfirm) {
      setPwErr('Xác nhận mật khẩu không khớp.');
      return;
    }
    setPwSubmitting(true);
    try {
      await changePassword({ CurrentPassword: pwOld, NewPassword: pwNew });
      setPwOld('');
      setPwNew('');
      setPwConfirm('');
      setPwOk('Đã đổi mật khẩu thành công.');
    } catch (e2) {
      if (e2?.status === 400 || e2?.status === 401) {
        setPwErr('Mật khẩu hiện tại không đúng.');
      } else {
        setPwErr(`Đổi mật khẩu thất bại: ${e2?.message || e2}`);
      }
    } finally {
      setPwSubmitting(false);
    }
  };

  // ============================================================
  // VIEW: Danh sách công việc + sự kiện + công việc gần đây
  // ============================================================
  const TaskListView = () => {
    const levelAccent = (level) => {
      if (level === 'Nghiêm trọng') return 'from-red-500/90 to-rose-600';
      if (level === 'Trung bình') return 'from-amber-400 to-orange-500';
      return 'from-slate-400 to-slate-600';
    };

    return (
      <div className="space-y-4 px-4 pb-32 pt-1">
        {dataError ? (
          <p className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-600">{dataError}</p>
        ) : null}

        <div className="space-y-3">
          {tasks.length === 0 && !dataLoading ? (
            <p className="text-center text-sm text-slate-200/80 py-6">
              Chưa có nhiệm vụ nào được phân công.
            </p>
          ) : null}
          {tasks.map((task) => (
            <div
              key={task.id}
              role="button"
              tabIndex={0}
              onClick={() => {
                setSelectedTask(task);
                setCurrentView('detail');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setSelectedTask(task);
                  setCurrentView('detail');
                }
              }}
              className="group relative cursor-pointer overflow-hidden rounded-[26px] bg-white shadow-md shadow-slate-200/60 ring-1 ring-slate-200/80 transition active:scale-[0.99]"
            >
              <div
                className={`absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b ${levelAccent(task.level)}`}
              />
              <div className="flex items-stretch gap-3 p-4 pl-5">
                <div
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${
                    task.level === 'Nghiêm trọng'
                      ? 'bg-red-50 text-red-600 ring-1 ring-red-100'
                      : 'bg-amber-50 text-amber-600 ring-1 ring-amber-100'
                  }`}
                >
                  <AlertCircle size={26} strokeWidth={2.25} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wide text-slate-400">
                      {task.code}
                    </span>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        getTaskStatusInfo(task.status).color
                      }`}
                    >
                      {getTaskStatusInfo(task.status).label}
                    </span>
                  </div>
                  <h3 className="mt-1 text-[17px] font-bold leading-snug text-gray-900">
                    {task.type}
                  </h3>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2 py-0.5 font-medium text-slate-600 ring-1 ring-slate-100">
                      <MapPin size={12} className="shrink-0 text-slate-400" />
                      {task.location}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2 py-0.5 font-medium text-slate-600 ring-1 ring-slate-100">
                      <Clock size={12} className="shrink-0 text-slate-400" />
                      {task.time}
                    </span>
                  </div>
                </div>
                <ChevronRight
                  size={22}
                  className="shrink-0 self-center text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-400"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xl font-black text-slate-50 drop-shadow-sm">Sự kiện trên tuyến</h2>
            <span className="rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white/90 ring-1 ring-white/25 backdrop-blur-sm">
              Theo dõi
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {incidents.length === 0 && !dataLoading ? (
              <p className="text-center text-sm text-slate-200/80 py-4">
                Không có sự kiện nào trên tuyến.
              </p>
            ) : null}
            {incidents.map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-4 rounded-[22px] border border-slate-200/70 bg-gradient-to-br from-white to-slate-50/90 p-4 shadow-sm shadow-slate-200/40 ring-1 ring-white"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-slate-100 bg-white shadow-sm">
                  {getIncidentIcon(event.kind)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="truncate text-sm font-bold text-gray-900">{event.title}</h4>
                    <span className="shrink-0 rounded-md bg-blue-50 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-tight text-blue-600 ring-1 ring-blue-100">
                      {event.tag}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={10} className="shrink-0" /> {event.location}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock size={10} className="shrink-0" /> {event.time}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div>
              <h2 className="text-xl font-black text-slate-50 drop-shadow-sm">Công việc gần đây</h2>
              <p className="mt-0.5 text-xs text-slate-300">
                Đã hoàn thành gần nhất ({completedTasks.length})
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-400/30 bg-emerald-500/20 text-emerald-100 shadow-inner backdrop-blur-sm">
              <CheckCircle2 size={22} strokeWidth={2.25} />
            </div>
          </div>

          <div className="space-y-2.5">
            {completedTasks.length === 0 && !dataLoading ? (
              <p className="text-center text-sm text-slate-200/80 py-4">
                Chưa có công việc hoàn thành.
              </p>
            ) : null}
            {completedTasks.map((t) => (
              <div
                key={t.id}
                className="flex gap-3 rounded-[22px] border border-emerald-100/90 bg-gradient-to-r from-emerald-50/80 via-white to-white p-3.5 shadow-sm shadow-emerald-100/50 ring-1 ring-emerald-50"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100/80 text-emerald-700 ring-1 ring-emerald-200/60">
                  <CheckCircle2 size={20} strokeWidth={2.5} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[11px] font-mono font-bold uppercase tracking-wide text-emerald-700/80">
                      {t.code}
                    </p>
                    <span className="shrink-0 rounded-full bg-white/90 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-700 ring-1 ring-emerald-100">
                      Hoàn thành
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm font-bold leading-snug text-gray-900">{t.type}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={10} className="shrink-0 text-slate-400" />
                      {t.location}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="inline-flex items-center gap-1 font-medium text-slate-600">
                      <Clock size={10} className="shrink-0 text-slate-400" />
                      {t.completedAt}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ============================================================
  // VIEW: Calls (Directory + History)
  // ============================================================
  const CallsView = () => (
    <div className="space-y-3 px-4 pb-32 pt-2">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-slate-50 drop-shadow-sm">Liên lạc PBX</h2>
        <button
          type="button"
          onClick={() => reloadData()}
          disabled={dataLoading}
          className="rounded-xl border border-white/30 bg-white/15 p-2 text-white backdrop-blur-sm disabled:opacity-60"
          aria-label="Tải lại danh bạ"
        >
          <RefreshCw size={16} className={dataLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="flex rounded-2xl bg-gray-100 p-1">
        <button
          type="button"
          onClick={() => setCallsSubTab('directory')}
          className={`flex-1 py-2 text-sm font-bold rounded-xl transition-colors ${
            callsSubTab === 'directory' ? 'bg-white shadow text-gray-900' : 'text-gray-500'
          }`}
        >
          Danh bạ
        </button>
        <button
          type="button"
          onClick={() => setCallsSubTab('history')}
          className={`flex-1 py-2 text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-1 ${
            callsSubTab === 'history' ? 'bg-white shadow text-gray-900' : 'text-gray-500'
          }`}
        >
          <History size={16} />
          Lịch sử
        </button>
      </div>

      {callsSubTab === 'directory' ? (
        <div className="space-y-4">
          {callUploadError ? (
            <p className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-600">{callUploadError}</p>
          ) : null}
          {callUploadSuccess ? (
            <p className="rounded-xl bg-green-50 p-3 text-sm font-medium text-green-700">{callUploadSuccess}</p>
          ) : null}
          {callRecording ? (
            <div className="flex items-center justify-center gap-2 py-2">
              <RefreshCw size={16} className="animate-spin text-blue-500" />
              <span className="text-xs font-bold text-gray-600">Đang ghi nhận cuộc gọi…</span>
              <div className="ml-2 h-2 w-24 rounded-full bg-gray-200">
                <div
                  className="h-2 rounded-full bg-blue-500 transition-all"
                  style={{ width: `${callUploadProgress}%` }}
                />
              </div>
            </div>
          ) : null}
          <div className="flex justify-between items-center px-2">
            <h3 className="font-bold text-gray-800">Danh bạ nội bộ</h3>
            <button
              type="button"
              onClick={openNewContact}
              className="flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold text-white shadow"
              style={{ backgroundColor: PRIMARY }}
            >
              <Plus size={14} /> Thêm
            </button>
          </div>

          {contacts.length === 0 ? (
            <p className="text-center text-sm text-slate-500 py-6 bg-white/80 rounded-2xl">
              Chưa có liên hệ. Bấm “Thêm” để tạo mới.
            </p>
          ) : (
            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="p-3 flex items-center justify-between border-b border-gray-50 last:border-0 active:bg-gray-50"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 font-bold relative shrink-0">
                      {(contact.name?.[0] || '?').toUpperCase()}
                      {contact.online ? (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-gray-800 truncate">{contact.name}</p>
                      <p className="text-xs text-gray-400">Extension: {contact.ext}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => openEditContact(contact)}
                      className="p-2 text-slate-500 hover:text-slate-700"
                      aria-label={`Sửa ${contact.name}`}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeContact(contact)}
                      className="p-2 text-red-500 hover:text-red-700"
                      aria-label={`Xóa ${contact.name}`}
                    >
                      <Trash2 size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        setCallRecording(true);
                        setCallUploadError('');
                        setCallUploadSuccess('');
                        setCallUploadProgress(0);
                        try {
                          const result = await recordCall({
                            extension: contact.ext,
                            name: contact.name,
                            type: 'outgoing',
                          });
                          setCallUploadProgress(100);
                          setCallUploadSuccess(`Đã ghi nhận cuộc gọi đến ${contact.name}`);
                          const now = new Date();
                          const timeStr = `${pad2(now.getHours())}:${pad2(now.getMinutes())} ${pad2(now.getDate())}/${pad2(now.getMonth() + 1)}`;
                          const newEntry = {
                            id: result?.id || 'h-' + Date.now(),
                            extension_nguoi_nhan: contact.ext,
                            ten_nguoi_nhan: contact.name,
                            thoi_gian: timeStr,
                            thoi_luong: null,
                            trang_thai: result?.trang_thai || 'ringing',
                          };
                          setCallHistory((prev) => [newEntry, ...prev]);
                          await reloadData();
                          setTimeout(() => setCallUploadSuccess(''), 3000);
                        } catch (e) {
                          const now = new Date();
                          const timeStr = `${pad2(now.getHours())}:${pad2(now.getMinutes())} ${pad2(now.getDate())}/${pad2(now.getMonth() + 1)}`;
                          const fallbackEntry = {
                            id: 'h-' + Date.now(),
                            extension_nguoi_nhan: contact.ext,
                            ten_nguoi_nhan: contact.name,
                            thoi_gian: timeStr,
                            thoi_luong: null,
                            trang_thai: 'ringing',
                          };
                          setCallHistory((prev) => [fallbackEntry, ...prev]);
                          setCallUploadError(`Không ghi nhận được lên server: ${e?.message || e}`);
                          setTimeout(() => setCallUploadError(''), 5000);
                        } finally {
                          setTimeout(() => {
                            setCallRecording(false);
                            setCallUploadProgress(0);
                          }, 1500);
                        }
                      }}
                      disabled={callRecording}
                      className="p-2.5 bg-blue-50 text-blue-600 rounded-xl ml-1 disabled:opacity-40 disabled:cursor-wait"
                      aria-label={`Gọi ${contact.ext}`}
                    >
                      {callRecording ? (
                        <RefreshCw size={16} className="animate-spin" />
                      ) : (
                        <Phone size={16} fill="currentColor" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-gray-400 px-1">
            Bấm icon điện thoại để ghi lịch sử cuộc gọi cục bộ trên thiết bị (chưa kết nối VoIP).
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {callHistory.length === 0 ? (
            <p className="text-gray-500 text-sm py-8 text-center">Chưa có lịch sử cuộc gọi.</p>
          ) : (
            callHistory.map((row) => (
              <div
                key={row.id}
                className="bg-white rounded-2xl border border-gray-100 p-4 flex justify-between items-center shadow-sm"
              >
                <div>
                  <p className="font-bold text-gray-800">
                    {row.ten_nguoi_nhan || row.extension_nguoi_nhan}
                  </p>
                  <p className="text-xs text-gray-400">
                    Ext {row.extension_nguoi_nhan} · {row.thoi_gian}
                  </p>
                </div>
                <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-full">
                  {row.trang_thai}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );

  // ============================================================
  // VIEW: Notifications
  // ============================================================
  const NotificationsView = () => {
    useEffect(() => {
      let cancelled = false;
      async function loadNotifications() {
        setNotifLoading(true);
        setNotifError('');
        try {
          const list = await getNotifications();
          if (!cancelled) {
            setNotifications(Array.isArray(list) ? list : []);
          }
        } catch (e) {
          if (!cancelled) setNotifError(`Không tải được thông báo: ${e?.message || e}`);
        } finally {
          if (!cancelled) setNotifLoading(false);
        }
      }
      loadNotifications();
      return () => { cancelled = true; };
    }, []);

    const handleMarkRead = async (notif) => {
      if (!notif.unread) return;
      try {
        await markRead(notif.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, unread: false } : n))
        );
      } catch {
        /* ignore */
      }
    };

    const handleDelete = async (notifId) => {
      try {
        await deleteNotification(notifId);
        setNotifications((prev) => prev.filter((n) => n.id !== notifId));
      } catch {
        /* ignore */
      }
    };

    const handleRegisterPush = async () => {
      if (!navigator?.serviceWorker?.ready) return;
      try {
        await registerPushToken('web-push-token', 'web');
      } catch {
        /* ignore */
      }
    };

    return (
      <div className="space-y-3 px-4 pb-32 pt-2">
        <div className="flex items-end justify-between gap-2">
          <h2 className="text-xl font-black text-slate-50 drop-shadow-sm">Thông báo</h2>
          {unreadNotificationCount > 0 ? (
            <span className="shrink-0 rounded-full bg-red-500 px-2.5 py-0.5 text-[11px] font-black text-white shadow-sm">
              {unreadNotificationCount} chưa đọc
            </span>
          ) : null}
        </div>
        <p className="-mt-2 text-xs text-slate-400">Đã đọc / chưa đọc</p>
        <button
          type="button"
          onClick={handleRegisterPush}
          className="text-xs text-blue-600 font-bold underline"
        >
          Đăng ký push notification
        </button>
        {notifError ? (
          <p className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-600">{notifError}</p>
        ) : null}
        {notifLoading ? (
          <div className="flex items-center justify-center py-12 space-x-2">
            <RefreshCw size={20} className="animate-spin text-blue-500" />
            <span className="text-sm text-gray-500">Đang tải thông báo…</span>
          </div>
        ) : null}
        <div className="space-y-3">
          {notifications.length === 0 && !notifLoading ? (
            <p className="text-center text-sm text-slate-200/80 py-6">Không có thông báo.</p>
          ) : null}
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`w-full text-left p-4 rounded-3xl border flex items-start space-x-3 ${
                notif.unread ? 'bg-blue-50 border-blue-100 shadow-sm' : 'bg-white border-gray-100'
              }`}
            >
              <button
                type="button"
                onClick={() => handleMarkRead(notif)}
                className={`p-2 rounded-xl shrink-0 ${
                  notif.unread ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-400'
                }`}
              >
                <Bell size={20} />
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-sm text-gray-800 leading-tight">{notif.title}</h4>
                  <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap ml-2">
                    {notif.time}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{notif.desc}</p>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(notif.id)}
                className="p-1.5 text-gray-300 hover:text-red-500 shrink-0"
                aria-label="Xóa thông báo"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ---- Load profile API khi vào tab "Tôi" ----
  useEffect(() => {
    if (!isLoggedIn || currentView !== 'list' || activeTab !== 'profile') return;
    let cancelled = false;
    async function loadProfile() {
      setProfileErr('');
      try {
        const data = await getProfile(session?.profile?.extension || '');
        if (!cancelled) {
          setProfile(data);
          saveSession({ ...session, profile: data });
        }
      } catch (e) {
        if (!cancelled) {
          setProfileErr(`Không tải được hồ sơ: ${e?.message || e}`);
          setProfile(session?.profile || {});
        }
      }
    }
    loadProfile();
    return () => { cancelled = true; };
  }, [activeTab, currentView, isLoggedIn, session]);

  const profileFallback = session?.profile || {};
  const profileDisplay = profile || profileFallback;

  // ---- Load preferences khi vào tab "Tôi" ----
  useEffect(() => {
    if (!isLoggedIn || currentView !== 'list' || activeTab !== 'profile') return;
    let cancelled = false;
    async function loadPref() {
      setPrefLoading(true);
      try {
        const data = await getPreferences();
        if (!cancelled) setPref(data);
      } catch {
        // keep default
      } finally {
        if (!cancelled) setPrefLoading(false);
      }
    }
    loadPref();
    return () => { cancelled = true; };
  }, [activeTab, currentView, isLoggedIn, session]);

  // ============================================================
  // BOOTING / LOGIN GATE
  // ============================================================
  if (booting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-sm text-slate-400">
        Đang khởi tạo…
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <LoginScreen
        loginAccount={loginAccount}
        setLoginAccount={setLoginAccount}
        loginExt={loginExt}
        setLoginExt={setLoginExt}
        loginPass={loginPass}
        setLoginPass={setLoginPass}
        loginErr={loginErr}
        loginSubmitting={loginSubmitting}
        onSubmit={handleLogin}
      />
    );
  }

  return (
    <div className="relative mx-auto flex min-h-[100dvh] max-w-md flex-col overflow-hidden bg-slate-950 font-sans text-gray-900">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundColor: '#0a1628',
          backgroundImage: [
            'linear-gradient(180deg, rgba(8,32,58,0.82) 0%, rgba(10,22,40,0.88) 42%, rgba(8,18,32,0.94) 100%)',
            'linear-gradient(135deg, rgba(0,151,240,0.22) 0%, transparent 52%)',
            `url(${ITS_AMBIENT_BG})`,
          ].join(', '),
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(-16deg, transparent, transparent 36px, rgba(255,255,255,0.4) 36px, rgba(255,255,255,0.4) 37px)',
        }}
      />

      {currentView === 'list' ? (
        <header
          className="relative z-10 shrink-0 border-b border-white/10 px-3 pb-2 pt-[max(0.25rem,env(safe-area-inset-top,0px))] text-white shadow-[0_12px_40px_-18px_rgba(0,0,0,0.55)] backdrop-blur-[2px]"
          style={{
            background: `linear-gradient(125deg, ${PRIMARY} 0%, #0578c4 45%, #094c6b 100%)`,
          }}
        >
          <div className="flex items-start gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/25 bg-white/15 text-white shadow-inner backdrop-blur-sm">
              <Navigation size={18} fill="white" />
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <h1 className="text-[11px] font-black uppercase leading-tight tracking-wide text-balance text-white drop-shadow-sm sm:text-xs">
                {HIGHWAY_TITLE}
              </h1>
              <p className="mt-1 text-[10px] font-semibold leading-none text-sky-100/95">
                {vietnameseWorkScreenDateLine()}
              </p>
            </div>
            {activeTab !== 'profile' ? (
              <button
                type="button"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/30 bg-white/95 text-sky-700 shadow-md backdrop-blur"
              >
                <Search size={17} />
              </button>
            ) : (
              <div className="h-9 w-9 shrink-0" aria-hidden />
            )}
          </div>
        </header>
      ) : null}

      {currentView === 'list' && activeTab === 'tasks' ? (
        <div className="relative z-10 shrink-0 border-b border-white/10 bg-slate-950/35 px-3 pb-2 pt-2 backdrop-blur-md">
          <div className="flex items-end justify-between gap-2 rounded-2xl border border-white/25 bg-white/92 px-3 py-2 shadow-lg shadow-slate-900/25 ring-1 ring-white/40 backdrop-blur-sm">
            <div className="min-w-0">
              <h2 className="text-xl font-black leading-tight tracking-tight text-gray-900">
                Nhiệm vụ
              </h2>
              <p className="mt-0.5 text-[11px] font-medium text-slate-500">
                Được giao · cập nhật theo ITS{dataLoading ? ' · đang tải…' : ''}
              </p>
            </div>
            <div className="shrink-0 rounded-full bg-gradient-to-br from-sky-100 to-cyan-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-sky-900 ring-1 ring-sky-200/80">
              {tasks.length} việc
            </div>
          </div>
        </div>
      ) : null}

      <main className="relative z-10 flex-1 overflow-y-auto">
        {currentView === 'list' ? (
          <>
            {activeTab === 'tasks' && <TaskListView />}
            {activeTab === 'calls' && <CallsView />}
            {activeTab === 'alerts' && <NotificationsView />}
            {activeTab === 'profile' && (
              <div className="space-y-6 px-4 pb-32 pt-2">
                <div className="rounded-[40px] border border-gray-100 bg-white p-6 text-center shadow-sm">
                  <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-[32px] bg-blue-50 text-3xl font-black text-blue-500">
                    {(profileDisplay?.ten_nhan_vien || profileDisplay?.full_name || profileDisplay?.fullName || (profileDisplay?.email || 'U')?.[0] || 'U').toUpperCase()}
                  </div>
                  <h3 className="text-xl font-black text-gray-800">
                    {profileDisplay?.ten_nhan_vien || profileDisplay?.full_name || profileDisplay?.fullName || (profileDisplay?.email || 'Người dùng')}
                  </h3>
                  <p className="text-gray-400 text-sm font-medium">
                    {profileDisplay?.chuc_vu || profileDisplay?.role || profileDisplay?.position || 'Chức vụ'}
                  </p>
                  {profileDisplay?.email ? (
                    <p className="text-xs text-gray-400 mt-1">{profileDisplay.email}</p>
                  ) : null}
                  <div className="mt-6 pt-6 border-t border-gray-50 flex justify-around">
                    <div>
                      <p className="text-xs text-gray-400 font-bold uppercase">Extension</p>
                      <p className="text-lg font-black" style={{ color: PRIMARY }}>
                        {profileDisplay?.extension || '-'}
                      </p>
                    </div>
                    <div className="w-px bg-gray-100" />
                    <div>
                      <p className="text-xs text-gray-400 font-bold uppercase">Đơn vị</p>
                      <p className="text-lg font-black text-gray-800">
                        {profileDisplay?.don_vi || profileDisplay?.unit || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setPwOpen((v) => !v)}
                    className="w-full flex items-center justify-between p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                        <KeyRound size={18} />
                      </div>
                      <span className="text-sm font-bold text-gray-800">Đổi mật khẩu</span>
                    </div>
                    <ChevronRight
                      size={18}
                      className={`text-gray-400 transition-transform ${pwOpen ? 'rotate-90' : ''}`}
                    />
                  </button>
                  {pwOpen ? (
                    <form onSubmit={submitPasswordChange} className="space-y-3 p-4 border-t border-gray-50">
                      {pwErr ? (
                        <p className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-600">
                          {pwErr}
                        </p>
                      ) : null}
                      {pwOk ? (
                        <p className="rounded-xl bg-green-50 p-3 text-sm font-medium text-green-700">
                          {pwOk}
                        </p>
                      ) : null}
                      <div className="space-y-1">
                        <label className="ml-1 text-xs font-bold uppercase text-gray-500">
                          Mật khẩu hiện tại
                        </label>
                        <input
                          type="password"
                          autoComplete="current-password"
                          value={pwOld}
                          onChange={(e) => setPwOld(e.target.value)}
                          className="w-full rounded-2xl border-none bg-gray-50 p-3 focus:ring-2 focus:ring-blue-400"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="ml-1 text-xs font-bold uppercase text-gray-500">
                          Mật khẩu mới
                        </label>
                        <input
                          type="password"
                          autoComplete="new-password"
                          value={pwNew}
                          onChange={(e) => setPwNew(e.target.value)}
                          className="w-full rounded-2xl border-none bg-gray-50 p-3 focus:ring-2 focus:ring-blue-400"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="ml-1 text-xs font-bold uppercase text-gray-500">
                          Xác nhận mật khẩu mới
                        </label>
                        <input
                          type="password"
                          autoComplete="new-password"
                          value={pwConfirm}
                          onChange={(e) => setPwConfirm(e.target.value)}
                          className="w-full rounded-2xl border-none bg-gray-50 p-3 focus:ring-2 focus:ring-blue-400"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={pwSubmitting}
                        className="w-full py-3 rounded-2xl text-white font-bold disabled:opacity-60"
                        style={{ backgroundColor: PRIMARY }}
                      >
                        {pwSubmitting ? 'Đang lưu…' : 'Cập nhật mật khẩu'}
                      </button>
                    </form>
                  ) : null}
                </div>

                <div className="rounded-3xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setPrefOpen((v) => !v)}
                    className="w-full flex items-center justify-between p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                        <Pencil size={18} />
                      </div>
                      <span className="text-sm font-bold text-gray-800">Cài đặt</span>
                    </div>
                    <ChevronRight
                      size={18}
                      className={`text-gray-400 transition-transform ${prefOpen ? 'rotate-90' : ''}`}
                    />
                  </button>
                  {prefOpen ? (
                    <div className="p-4 border-t border-gray-50 space-y-4">
                      {prefLoading ? (
                        <div className="flex items-center justify-center py-6 space-x-2">
                          <RefreshCw size={16} className="animate-spin text-blue-500" />
                          <span className="text-xs text-gray-500">Đang tải cài đặt…</span>
                        </div>
                      ) : (
                        <>
                        <div className="space-y-1">
                          <label className="ml-1 text-xs font-bold uppercase text-gray-500">Ngôn ngữ</label>
                          <div className="flex gap-2">
                            {['vi', 'en'].map((lang) => (
                              <button
                                key={lang}
                                type="button"
                                onClick={async () => {
                                  const updated = { ...(pref || {}), language: lang };
                                  setPref(updated);
                                  setPrefLoading(true);
                                  try {
                                    await updatePreferences({ language: lang });
                                    setPrefSaved(`Đã lưu ngôn ngữ: ${lang === 'vi' ? 'Tiếng Việt' : 'English'}`);
                                    setTimeout(() => setPrefSaved(''), 2000);
                                  } catch {
                                    setPrefSaved('Lưu thất bại');
                                    setTimeout(() => setPrefSaved(''), 2000);
                                  } finally {
                                    setPrefLoading(false);
                                  }
                                }}
                                className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
                                  (pref?.language || 'vi') === lang
                                    ? 'bg-blue-500 text-white shadow'
                                    : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                {lang === 'vi' ? 'Tiếng Việt' : 'English'}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="ml-1 text-xs font-bold uppercase text-gray-500">Giao diện</label>
                          <div className="flex gap-2">
                            {['light', 'dark', 'system'].map((theme) => (
                              <button
                                key={theme}
                                type="button"
                                onClick={async () => {
                                  const updated = { ...(pref || {}), theme };
                                  setPref(updated);
                                  setPrefLoading(true);
                                  try {
                                    await updatePreferences({ theme });
                                    setPrefSaved(`Đã lưu giao diện: ${theme}`);
                                    setTimeout(() => setPrefSaved(''), 2000);
                                  } catch {
                                    setPrefSaved('Lưu thất bại');
                                    setTimeout(() => setPrefSaved(''), 2000);
                                  } finally {
                                    setPrefLoading(false);
                                  }
                                }}
                                className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
                                  (pref?.theme || 'system') === theme
                                    ? 'bg-purple-500 text-white shadow'
                                    : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                {theme === 'light' ? 'Sáng' : theme === 'dark' ? 'Tối' : 'Hệ thống'}
                              </button>
                            ))}
                          </div>
                        </div>
                        {prefSaved ? (
                          <p className="rounded-xl bg-green-50 p-3 text-xs font-medium text-green-700">
                            {prefSaved}
                          </p>
                        ) : null}
                      </>
                    )}
                  </div>
                ) : null}
              </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full p-4 flex items-center justify-center space-x-3 text-red-500 font-bold bg-red-50 rounded-2xl"
                >
                  <LogOut size={20} />
                  <span>Đăng xuất hệ thống</span>
                </button>
              </div>
            )}
          </>
        ) : null}
        {currentView === 'detail' && selectedTask ? (
          <TaskDetailViewPanel
            key={selectedTask.id}
            task={selectedTask}
            operatorName={profileDisplay?.ten_nhan_vien || 'Người vận hành'}
            onBack={() => setCurrentView('list')}
            onUpdated={(updated) => {
              setTasks((prev) =>
                prev.map((x) => (x.id === updated.id ? { ...x, ...updated } : x))
              );
              setSelectedTask((prev) => (prev ? { ...prev, ...updated } : prev));
            }}
          />
        ) : null}
      </main>

      {isLoggedIn ? (
        <button
          type="button"
          onClick={() => setSosOpen(true)}
          className="absolute right-6 bottom-28 w-14 h-14 bg-red-600 text-white rounded-full flex items-center justify-center shadow-2xl z-50 border-4 border-white active:scale-90 transition-transform"
          aria-label="SOS khẩn cấp"
        >
          <PhoneCall size={24} />
        </button>
      ) : null}

      {sosOpen ? (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-black text-gray-900">Gọi khẩn cấp?</h3>
            <p className="text-sm text-gray-600">
              Ứng dụng sẽ mở trình quay số với số <strong>{SOS_TEL}</strong>. Trên máy tính có thể không
              có ứng dụng gọi.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSosOpen(false)}
                className="flex-1 py-3 rounded-2xl border border-gray-200 font-bold text-gray-700"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={confirmSos}
                className="flex-1 py-3 rounded-2xl bg-red-600 text-white font-bold"
              >
                Xác nhận gọi
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <ContactFormModal
        open={contactModalOpen}
        editing={contactEditing}
        onClose={() => setContactModalOpen(false)}
        onSubmit={submitContact}
        saving={contactSaving}
        errMsg={contactErr}
      />

      {currentView === 'list' ? (
        <nav className="relative z-40 flex shrink-0 justify-around rounded-t-[40px] border-t border-white/15 bg-white/85 px-4 py-4 shadow-[0_-12px_40px_-12px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <button
            type="button"
            onClick={() => setActiveTab('tasks')}
            className={`flex flex-col items-center space-y-1 transition-all ${
              activeTab === 'tasks' ? 'scale-110' : 'text-gray-300'
            }`}
          >
            <ClipboardList size={26} color={activeTab === 'tasks' ? PRIMARY : 'currentColor'} />
            <span
              className={`text-[10px] font-black uppercase tracking-tighter ${
                activeTab === 'tasks' ? 'opacity-100 text-gray-800' : 'opacity-0'
              }`}
            >
              Công việc
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('calls')}
            className={`flex flex-col items-center space-y-1 transition-all ${
              activeTab === 'calls' ? 'scale-110' : 'text-gray-300'
            }`}
          >
            <Phone size={26} color={activeTab === 'calls' ? PRIMARY : 'currentColor'} />
            <span
              className={`text-[10px] font-black uppercase tracking-tighter ${
                activeTab === 'calls' ? 'opacity-100 text-gray-800' : 'opacity-0'
              }`}
            >
              Liên lạc
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('alerts')}
            className={`flex flex-col items-center space-y-1 transition-all ${
              activeTab === 'alerts' ? 'scale-110' : 'text-gray-300'
            }`}
          >
            <div className="relative">
              <Bell size={26} color={activeTab === 'alerts' ? PRIMARY : 'currentColor'} />
              {unreadNotificationCount > 0 ? (
                <span className="absolute -right-2 -top-1 flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-white bg-red-500 px-1 text-[10px] font-black leading-none text-white">
                  {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                </span>
              ) : null}
            </div>
            <span
              className={`text-[10px] font-black uppercase tracking-tighter ${
                activeTab === 'alerts' ? 'opacity-100 text-gray-800' : 'opacity-0'
              }`}
            >
              Thông báo
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center space-y-1 transition-all ${
              activeTab === 'profile' ? 'scale-110' : 'text-gray-300'
            }`}
          >
            <User size={26} color={activeTab === 'profile' ? PRIMARY : 'currentColor'} />
            <span
              className={`text-[10px] font-black uppercase tracking-tighter ${
                activeTab === 'profile' ? 'opacity-100 text-gray-800' : 'opacity-0'
              }`}
            >
              Tôi
            </span>
          </button>
        </nav>
      ) : null}
    </div>
  );
}
