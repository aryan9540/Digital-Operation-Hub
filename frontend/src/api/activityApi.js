import { apiClient } from './client';

export const activityApi = {
  getWorkspaceActivities: (workspaceId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient(`/activities/workspace/${workspaceId}${query ? `?${query}` : ''}`);
  },

  getProjectActivities: (projectId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient(`/activities/project/${projectId}${query ? `?${query}` : ''}`);
  },
};
