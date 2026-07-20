import { apiClient } from './client';

export const epicApi = {
  getEpicsByProject: (projectId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient(`/epics/project/${projectId}${query ? `?${query}` : ''}`);
  },

  getEpicById: (id) => apiClient(`/epics/${id}`),

  createEpic: (epicData) =>
    apiClient('/epics', {
      method: 'POST',
      body: epicData,
    }),

  updateEpic: (id, epicData) =>
    apiClient(`/epics/${id}`, {
      method: 'PUT',
      body: epicData,
    }),

  deleteEpic: (id) =>
    apiClient(`/epics/${id}`, {
      method: 'DELETE',
    }),
};
