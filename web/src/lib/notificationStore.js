import { create } from 'zustand';
import apiRequest from './apiRequest';

export const useNotificationStore = create((set, get) => ({
  number: 0,
  isLoading: false,
  error: null,

  fetch: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiRequest('/user/notifications');
      console.log('Notification response:', response.data);
      set({
        number: response.data.data,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      set({
        error: error.message || 'Failed to fetch notifications',
        isLoading: false,
      });
    }
  },

  decrease: () => {
    set(state => ({
      number: Math.max(0, state.number - 1),
    }));
  },

  increase: () => {
    set(state => ({ number: state.number + 1 }));
  },

  reset: () => {
    set({ number: 0, error: null });
  },

  hasNotifications: () => get().number > 0,
}));
