import { IncidentTask, ExpresswayEvent, TaskStep } from '../types/tasks';
import { apiClient } from './client';

const MOCK_TASKS: IncidentTask[] = [
  {
    id: 'TASK-8821',
    code: 'TASK-8821',
    title: 'Tai nạn giao thông',
    description: 'Va chạm giữa 2 xe con, gây ùn tắc nhẹ lane ngoài.',
    milestoneKm: 24,
    milestoneM: 500,
    direction: 'LAOCAI_HANOI',
    step: 'RECEIVED',
    priority: 'P1',
    assignedTo: 'Nguyễn Minh Hoàng',
    createdAt: '2026-04-20T14:20:00Z',
    updatedAt: '2026-04-20T14:20:00Z',
    attachments: [],
    notes: [
      {
        id: 'NOTE-01',
        author: 'Hệ thống',
        content: 'Phân công nhiệm vụ từ ITS/TMC',
        createdAt: '2026-04-20T14:20:00Z',
      },
    ],
  },
  {
    id: 'TASK-8825',
    code: 'TASK-8825',
    title: 'Xe hỏng hóc',
    description: 'Xe con chết máy dừng đỗ làn khẩn cấp, cần đặt biển cảnh báo và hỗ trợ cứu hộ.',
    milestoneKm: 158,
    milestoneM: 200,
    direction: 'HANOI_LAOCAI',
    step: 'IN_PROGRESS',
    priority: 'P2',
    assignedTo: 'Nguyễn Minh Hoàng',
    createdAt: '2026-04-20T14:20:00Z',
    updatedAt: '2026-04-20T14:20:00Z',
    attachments: [],
    notes: [
      {
        id: 'NOTE-02',
        author: 'Nguyễn Minh Hoàng',
        content: 'Đang tiếp cận hiện trường',
        createdAt: '2026-04-20T14:20:00Z',
      },
    ],
  },
  {
    id: 'TASK-8742',
    code: 'TASK-8742',
    title: 'Dọn dẹp chướng ngại vật mặt đường',
    description: 'Đã thu gom dọn dẹp vật cản trên tuyến, đảm bảo an toàn giao thông.',
    milestoneKm: 35,
    milestoneM: 0,
    direction: 'HANOI_LAOCAI',
    step: 'COMPLETED',
    priority: 'P3',
    assignedTo: 'Nguyễn Minh Hoàng',
    createdAt: '2026-04-20T10:00:00Z',
    updatedAt: '2026-04-20T12:00:00Z',
    attachments: [],
    notes: [],
  },
];

const MOCK_EVENTS: ExpresswayEvent[] = [
  {
    id: 'EVT-01',
    title: 'Sơn kẻ đường định kỳ',
    type: 'CONSTRUCTION',
    location: 'Km 40 - Km 45',
    time: '08:00 - 17:00',
    severity: 'WARNING',
  },
  {
    id: 'EVT-02',
    title: 'Mưa lớn, tầm nhìn hạn chế',
    type: 'WEATHER',
    location: 'Khu vực Yên Bái',
    time: 'Đang diễn ra',
    severity: 'CRITICAL',
  },
];

export async function getAssignedTasksApi(): Promise<IncidentTask[]> {
  try {
    const res = await apiClient.get<IncidentTask[]>('/api/tasks/assigned');
    return res.data;
  } catch {
    return MOCK_TASKS;
  }
}

export async function updateTaskStepApi(id: string, step: TaskStep): Promise<IncidentTask> {
  try {
    const res = await apiClient.patch<IncidentTask>(`/api/tasks/${id}/step`, { step });
    return res.data;
  } catch {
    const task = MOCK_TASKS.find((t) => t.id === id);
    if (task) {
      task.step = step;
      task.updatedAt = new Date().toISOString();
      return { ...task };
    }
    throw new Error('Task not found');
  }
}

export async function getExpresswayEventsApi(): Promise<ExpresswayEvent[]> {
  try {
    const res = await apiClient.get<ExpresswayEvent[]>('/api/events');
    return res.data;
  } catch {
    return MOCK_EVENTS;
  }
}
