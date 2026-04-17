import { create } from 'zustand';

interface AppState {
  isOffline: boolean;
  setOffline: (status: boolean) => void;
}

/**
 * Global App Store
 * Manages cross-component UI states like connectivity.
 */
export const useAppStore = create<AppState>((set) => ({
  isOffline: false,
  setOffline: (status) => set({ isOffline: status }),
}));
