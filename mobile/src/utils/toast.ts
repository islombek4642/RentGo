import { useToastStore } from '../store/useToastStore';

/**
 * Global Toast Utility
 * Standardizes messages across the app using the custom useToastStore.
 */
export const toast = {
  success: (title: string, message?: string) => {
    useToastStore.getState().show('success', title, message);
  },
  error: (title: string, message?: string) => {
    useToastStore.getState().show('error', title, message);
  },
  info: (title: string, message?: string) => {
    useToastStore.getState().show('info', title, message);
  },
};
