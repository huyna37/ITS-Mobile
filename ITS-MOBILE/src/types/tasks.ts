export type TaskStep = 'RECEIVED' | 'IN_PROGRESS' | 'COMPLETED';

export type TaskPriority = 'P0' | 'P1' | 'P2' | 'P3';

export interface TaskAttachment {
  id: string;
  name: string;
  type: 'image' | 'video' | 'document';
  uri: string;
  sizeBytes?: number;
  uploadedAt: string;
}

export interface TaskNote {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

export interface IncidentTask {
  id: string;
  code: string;
  incidentCode?: string;
  title: string;
  description: string;
  milestoneKm: number;
  milestoneM: number;
  direction: 'HANOI_LAOCAI' | 'LAOCAI_HANOI';
  step: TaskStep;
  priority: TaskPriority;
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
  attachments: TaskAttachment[];
  notes: TaskNote[];
  script?: string;
}

export interface ExpresswayEvent {
  id: string;
  title: string;
  type: 'CONSTRUCTION' | 'WEATHER' | 'TRAFFIC_JAM' | 'ACCIDENT';
  location: string;
  time: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
}
