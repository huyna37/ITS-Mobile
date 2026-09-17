import { create } from 'zustand';
import { IncidentTask, ExpresswayEvent, TaskStep, TaskAttachment } from '../types/tasks';
import {
  getAssignedTasksApi,
  getExpresswayEventsApi,
  updateTaskStepApi,
} from '../api/tasksApi';

interface TasksState {
  tasks: IncidentTask[];
  events: ExpresswayEvent[];
  selectedTask: IncidentTask | null;
  isLoading: boolean;
  isRefreshing: boolean;

  fetchTasks: () => Promise<void>;
  refreshTasks: () => Promise<void>;
  selectTask: (task: IncidentTask) => void;
  advanceTaskStep: (id: string) => Promise<boolean>;
  updateTaskStep: (id: string, step: TaskStep) => Promise<boolean>;
  addAttachment: (taskId: string, attachment: TaskAttachment) => void;
  removeAttachment: (taskId: string, attachmentId: string) => void;
}

export const useTasksStore = create<TasksState>((set, get) => ({
  tasks: [],
  events: [],
  selectedTask: null,
  isLoading: false,
  isRefreshing: false,

  fetchTasks: async () => {
    set({ isLoading: true });
    try {
      const [tasks, events] = await Promise.all([
        getAssignedTasksApi(),
        getExpresswayEventsApi(),
      ]);
      set({ tasks, events, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  refreshTasks: async () => {
    set({ isRefreshing: true });
    try {
      const [tasks, events] = await Promise.all([
        getAssignedTasksApi(),
        getExpresswayEventsApi(),
      ]);
      set({ tasks, events, isRefreshing: false });
    } catch {
      set({ isRefreshing: false });
    }
  },

  selectTask: (task) => {
    set({ selectedTask: task });
  },

  advanceTaskStep: async (id: string) => {
    const currentTask = get().tasks.find((t) => t.id === id);
    if (!currentTask) return false;

    let nextStep: TaskStep | null = null;
    if (currentTask.step === 'RECEIVED') {
      nextStep = 'IN_PROGRESS';
    } else if (currentTask.step === 'IN_PROGRESS') {
      nextStep = 'COMPLETED';
    } else {
      return false; // Đã hoàn thành, không chuyển tiếp
    }

    try {
      const updated = await updateTaskStepApi(id, nextStep);
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? updated : t)),
        selectedTask: state.selectedTask?.id === id ? updated : state.selectedTask,
      }));
      return true;
    } catch {
      return false;
    }
  },

  updateTaskStep: async (id: string, step: TaskStep) => {
    try {
      const updated = await updateTaskStepApi(id, step);
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? updated : t)),
        selectedTask: state.selectedTask?.id === id ? updated : state.selectedTask,
      }));
      return true;
    } catch {
      // Optimistic update
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? { ...t, step } : t)),
        selectedTask: state.selectedTask?.id === id ? { ...state.selectedTask, step } : state.selectedTask,
      }));
      return true;
    }
  },

  addAttachment: (taskId, attachment) => {
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId
          ? { ...t, attachments: [...t.attachments, attachment] }
          : t
      ),
      selectedTask:
        state.selectedTask?.id === taskId
          ? {
              ...state.selectedTask,
              attachments: [...state.selectedTask.attachments, attachment],
            }
          : state.selectedTask,
    }));
  },

  removeAttachment: (taskId, attachmentId) => {
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId
          ? { ...t, attachments: t.attachments.filter((a) => a.id !== attachmentId) }
          : t
      ),
      selectedTask:
        state.selectedTask?.id === taskId
          ? {
              ...state.selectedTask,
              attachments: state.selectedTask.attachments.filter((a) => a.id !== attachmentId),
            }
          : state.selectedTask,
    }));
  },
}));
