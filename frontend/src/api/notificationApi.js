import { apiClient } from './client';

export const notificationApi = {
  getMyNotifications: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient(`/notifications${query ? `?${query}` : ''}`);
  },

  markAsRead: (id) =>
    apiClient(`/notifications/${id}/read`, {
      method: 'PUT',
    }),

  markAllAsRead: () =>
    apiClient('/notifications/read-all', {
      method: 'PUT',
    }),

  deleteNotification: (id) =>
    apiClient(`/notifications/${id}`, {
      method: 'DELETE',
    }),

  clearAll: () =>
    apiClient('/notifications/clear-all', {
      method: 'DELETE',
    }),
};
