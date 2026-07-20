import { apiClient } from './client';

export const projectApi = {
  getProjectsByWorkspace: (workspaceId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient(`/projects/workspace/${workspaceId}${query ? `?${query}` : ''}`);
  },

  getProjectById: (id) => apiClient(`/projects/${id}`),

  createProject: (projectData) =>
    apiClient('/projects', {
      method: 'POST',
      body: projectData,
    }),

  updateProject: (id, projectData) =>
    apiClient(`/projects/${id}`, {
      method: 'PUT',
      body: projectData,
    }),

  deleteProject: (id) =>
    apiClient(`/projects/${id}`, {
      method: 'DELETE',
    }),
};
