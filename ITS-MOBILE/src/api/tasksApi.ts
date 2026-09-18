import { IncidentTask, ExpresswayEvent, TaskStep } from '../types/tasks';
import { apiClient } from './client';

export interface BackendTaskAttachment {
  id: string;
  name: string;
  uri: string;
  type: string;
  sizeBytes: number;
  uploadedAt: string;
}

export interface BackendTaskNote {
  id: string;
  author: string;
  content: string;
  createdAt: string;
  oldStatus?: string;
  newStatus?: string;
  logType?: 'STATUS_CHANGE' | 'FIELD_NOTE' | 'SYSTEM';
}

export interface BackendTaskResponse {
  id: string;
  code: string;
  incidentCode?: string;
  type: string;
  level: string;
  location: string;
  direction: string;
  time: string;
  status: number;
  description: string;
  script: string;
  attachments?: BackendTaskAttachment[];
  notes?: BackendTaskNote[];
}

export interface BackendIncidentResponse {
  id: string;
  kind: string;
  title: string;
  location: string;
  time: string;
  tag: string;
}

function parseMilestoneKm(locationStr: string): number {
  const match = locationStr.match(/(\d+)/);
  if (match) {
    return parseInt(match[1], 10);
  }
  return 0;
}

function parseMilestoneM(locationStr: string): number {
  const match = locationStr.match(/\+(\d+)/);
  if (match) {
    return parseInt(match[1], 10);
  }
  return 0;
}

export function mapBackendTask(item: BackendTaskResponse): IncidentTask {
  const taskStep: TaskStep = item.status === 1 ? 'RECEIVED' : item.status === 2 ? 'IN_PROGRESS' : 'COMPLETED';

  return {
    id: item.id,
    code: item.code,
    incidentCode: item.incidentCode || item.code,
    title: item.type,
    description: item.description,
    milestoneKm: parseMilestoneKm(item.location),
    milestoneM: parseMilestoneM(item.location),
    direction: item.direction.includes('Hà Nội') && item.direction.includes('Lào Cai') && item.direction.indexOf('Hà Nội') < item.direction.indexOf('Lào Cai')
      ? 'HANOI_LAOCAI'
      : 'LAOCAI_HANOI',
    step: taskStep,
    priority: item.level === 'P0' ? 'P0' : item.level === 'P1' ? 'P1' : item.level === 'P2' ? 'P2' : 'P3',
    assignedTo: item.code,
    createdAt: item.time,
    updatedAt: item.time,
    attachments: (item.attachments || []).map((a) => ({
      id: a.id,
      name: a.name,
      type: (a.type === 'video' ? 'video' : a.type === 'document' ? 'document' : 'image') as any,
      uri: a.uri,
      sizeBytes: a.sizeBytes,
      uploadedAt: a.uploadedAt,
    })),
    notes: (item.notes || []).map((n) => ({
      id: n.id,
      author: n.author,
      content: n.content,
      createdAt: n.createdAt,
      oldStatus: n.oldStatus,
      newStatus: n.newStatus,
      logType: n.logType,
    })),
    script: item.script,
  };
}

function mapBackendIncident(item: BackendIncidentResponse): ExpresswayEvent {
  return {
    id: item.id,
    title: item.title,
    type: item.kind === 'CONSTRUCTION' ? 'CONSTRUCTION' : item.kind === 'WEATHER' ? 'WEATHER' : item.kind === 'TRAFFIC_JAM' ? 'TRAFFIC_JAM' : 'ACCIDENT',
    location: item.location,
    time: item.time,
    severity: item.tag === 'CRITICAL' ? 'CRITICAL' : item.tag === 'WARNING' ? 'WARNING' : 'INFO',
  };
}

/**
 * Lấy danh sách nhiệm vụ được giao và nhiệm vụ hoàn thành từ backend thật
 */
export async function getAssignedTasksApi(): Promise<IncidentTask[]> {
  const [assignedRes, completedRes] = await Promise.all([
    apiClient.get<BackendTaskResponse[]>('/api/tasks/assigned'),
    apiClient.get<BackendTaskResponse[]>('/api/tasks/completed-recent'),
  ]);

  const assignedTasks = assignedRes.data.map(mapBackendTask);
  const completedTasks = completedRes.data.map(mapBackendTask);
  return [...assignedTasks, ...completedTasks];
}

/**
 * Cập nhật trạng thái nhiệm vụ trên máy chủ backend
 */
export async function updateTaskStepApi(id: string, step: TaskStep): Promise<IncidentTask> {
  const statusCode = step === 'RECEIVED' ? 1 : step === 'IN_PROGRESS' ? 2 : 3;

  await apiClient.patch(`/api/tasks/${id}`, {
    status: statusCode,
    actor: 'Tuần kiểm tra VEC',
  });

  const tasks = await getAssignedTasksApi();
  const updated = tasks.find((t) => t.id === id);
  if (updated) {
    return updated;
  }
  throw new Error('Cập nhật trạng thái nhiệm vụ không thành công');
}

/**
 * Lấy danh sách sự kiện trên tuyến từ backend thật
 */
export async function getExpresswayEventsApi(): Promise<ExpresswayEvent[]> {
  const res = await apiClient.get<BackendIncidentResponse[]>('/api/incidents');
  return res.data.map(mapBackendIncident);
}

/**
 * Gửi báo cáo hiện trường (ghi nhận + tệp đính kèm) về máy chủ TMC
 */
export async function submitTaskReportApi(
  taskId: string,
  data: { note?: string; fileIds?: string[]; actor?: string }
): Promise<boolean> {
  const res = await apiClient.post<{ success: boolean }>(`/api/tasks/${taskId}/report`, data);
  return res.data?.success === true;
}

