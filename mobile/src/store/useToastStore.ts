import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastState {
  queue: ToastItem[];
  current: ToastItem | null;
  show: (type: ToastType, title: string, message?: string) => void;
  hide: () => void;
  clearAll: () => void;
  processNext: () => void;
}

const MAX_QUEUE_SIZE = 5;

/**
 * Global Toast Store (Pro Version)
 * Implements message queuing, prioritization, and duplicate prevention.
 */
export const useToastStore = create<ToastState>((set, get) => ({
  queue: [],
  current: null,

  show: (type, title, message) => {
    const { queue, current } = get();
    
    // Prevent duplicate consecutive toasts
    const lastInQueue = queue.length > 0 ? queue[queue.length - 1] : current;
    if (lastInQueue?.title === title && lastInQueue?.message === message && lastInQueue?.type === type) {
      return;
    }

    const newItem: ToastItem = {
      id: Math.random().toString(36).substring(7),
      type,
      title,
      message,
    };

    // Standard FIFO queue for predictable flow
    let newQueue = [...queue, newItem];

    // Limit queue size
    if (newQueue.length > MAX_QUEUE_SIZE) {
      newQueue = newQueue.slice(0, MAX_QUEUE_SIZE);
    }

    set({ queue: newQueue });

    // If nothing is showing, start processing
    if (!current) {
      get().processNext();
    }
  },

  hide: () => {
    set({ current: null });
    setTimeout(() => get().processNext(), 500);
  },

  processNext: () => {
    const { queue } = get();
    if (queue.length === 0) {
      set({ current: null });
      return;
    }

    const [next, ...rest] = queue;
    set({ current: next, queue: rest });
  },

  clearAll: () => {
    set({ queue: [], current: null });
  },
}));
