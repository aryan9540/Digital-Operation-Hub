import { apiClient } from './client';

export const taskApi = {
  getTasksByWorkspace: (workspaceId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient(`/tasks/workspace/${workspaceId}${query ? `?${query}` : ''}`);
  },

  getTasksByProject: (projectId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient(`/tasks/project/${projectId}${query ? `?${query}` : ''}`);
  },

  getTaskById: (id) => apiClient(`/tasks/${id}`),

  createTask: (taskData) =>
    apiClient('/tasks', {
      method: 'POST',
      body: taskData,
    }),

  updateTask: (id, taskData) =>
    apiClient(`/tasks/${id}`, {
      method: 'PUT',
      body: taskData,
    }),

  deleteTask: (id) =>
    apiClient(`/tasks/${id}`, {
      method: 'DELETE',
    }),

  assignTask: (id, userId) =>
    apiClient(`/tasks/${id}/assign`, {
      method: 'PUT',
      body: { userId },
    }),
};
