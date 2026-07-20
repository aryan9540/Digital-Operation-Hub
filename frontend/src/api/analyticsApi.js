import { apiClient } from './client';

export const analyticsApi = {
  getWorkspaceAnalytics: (workspaceId) =>
    apiClient(`/analytics/workspace/${workspaceId}`),

  getProjectAnalytics: (projectId) =>
    apiClient(`/analytics/project/${projectId}`),
};
