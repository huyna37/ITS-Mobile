import { IncidentTask, ExpresswayEvent, TaskStep } from '../types/tasks';
import { apiClient } from './client';

const MOCK_TASKS: IncidentTask[] = [
  {
    id: 'TASK-01',
    code: 'SC-20260916-001',
    title: 'Xử lý xe tải nổ lốp dừng đỗ nguy hiểm trên làn dừng khẩn cấp',
    description: 'Xe tải biển số 29C-881.92 nổ lốp sau bên phải, có nguy cơ cản trở lưu thông giờ cao điểm. Cần đặt chóp nón phản quang và hỗ trợ cứu hộ.',
    milestoneKm: 124,
    milestoneM: 450,
    direction: 'HANOI_LAOCAI',
    step: 'RECEIVED',
    priority: 'P0',
    assignedTo: 'Nguyễn Văn Tuần Tra',
    createdAt: '2026-09-16T08:15:00Z',
    updatedAt: '2026-09-16T08:15:00Z',
    attachments: [
      {
        id: 'ATT-01',
        name: 'hien-truong-no-lop.jpg',
        type: 'image',
        uri: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80',
        uploadedAt: '2026-09-16T08:20:00Z',
      },
    ],
    notes: [
      {
        id: 'NOTE-01',
        author: 'TMC Điều phối',
        content: 'Camera C08-124 phát hiện sự cố lúc 08:12. Đội 1 nhanh chóng tiếp cận.',
        createdAt: '2026-09-16T08:15:00Z',
      },
    ],
  },
  {
    id: 'TASK-02',
    code: 'SC-20260916-002',
    title: 'Va chạm nhẹ giữa 2 xe con tại nút giao IC8 Phù Ninh',
    description: 'Hai xe con va chạm nhẹ, không có thương vong về người. Hai tài xế đang thương lượng, cần hướng dẫn phương tiện di chuyển vào lề.',
    milestoneKm: 54,
    milestoneM: 200,
    direction: 'LAOCAI_HANOI',
    step: 'IN_PROGRESS',
    priority: 'P1',
    assignedTo: 'Nguyễn Văn Tuần Tra',
    createdAt: '2026-09-16T08:45:00Z',
    updatedAt: '2026-09-16T09:00:00Z',
    attachments: [],
    notes: [
      {
        id: 'NOTE-02',
        author: 'Tuần tra viên',
        content: 'Đã tiếp cận hiện trường lúc 08:58, đang phân luồng giao thông.',
        createdAt: '2026-09-16T09:00:00Z',
      },
    ],
  },
  {
    id: 'TASK-03',
    code: 'SC-20260915-089',
    title: 'Dọn dẹp mảnh vỡ gỗ rơi vãi trên mặt đường',
    description: 'Đã hoàn tất thu dọn 5 khúc gỗ rơi từ xe chở hàng, quét dọn mặt đường sạch sẽ và trả lại lưu thông thông suốt.',
    milestoneKm: 89,
    milestoneM: 700,
    direction: 'HANOI_LAOCAI',
    step: 'COMPLETED',
    priority: 'P2',
    assignedTo: 'Nguyễn Văn Tuần Tra',
    createdAt: '2026-09-15T15:20:00Z',
    updatedAt: '2026-09-15T16:05:00Z',
    attachments: [],
    notes: [],
  },
];

const MOCK_EVENTS: ExpresswayEvent[] = [
  {
    id: 'EVT-01',
    title: 'Thi công sơn kẻ vạch đường Km 45 - Km 48',
    type: 'CONSTRUCTION',
    location: 'Km 45+000 ➔ Km 48+000 (Hướng HN-LC)',
    time: '08:00 - 17:00 ngày 16/09',
    severity: 'WARNING',
  },
  {
    id: 'EVT-02',
    title: 'Mưa lớn giảm tầm nhìn đoạn Yên Bái - Lào Cai',
    type: 'WEATHER',
    location: 'Km 160+000 ➔ Km 210+000',
    time: 'Hiện tại',
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
