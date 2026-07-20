import { apiClient } from './client';

export const userApi = {
  getProfile: () => apiClient('/users/profile'),

  updateProfile: (profileData) =>
    apiClient('/users/profile', {
      method: 'PUT',
      body: profileData,
    }),

  changePassword: (passwords) =>
    apiClient('/users/change-password', {
      method: 'PUT',
      body: passwords,
    }),

  getUsers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient(`/users${query ? `?${query}` : ''}`);
  },

  getUserById: (id) => apiClient(`/users/${id}`),

  deleteAccount: (id) =>
    apiClient(`/users/${id}`, {
      method: 'DELETE',
    }),
};
