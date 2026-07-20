import { apiClient } from './client';

export const workspaceApi = {
  getMyWorkspaces: () => apiClient('/workspaces'),

  getWorkspaceById: (id) => apiClient(`/workspaces/${id}`),

  createWorkspace: (workspaceData) =>
    apiClient('/workspaces', {
      method: 'POST',
      body: workspaceData,
    }),

  updateWorkspace: (id, workspaceData) =>
    apiClient(`/workspaces/${id}`, {
      method: 'PUT',
      body: workspaceData,
    }),

  deleteWorkspace: (id) =>
    apiClient(`/workspaces/${id}`, {
      method: 'DELETE',
    }),

  getMembers: (workspaceId) => apiClient(`/workspaces/${workspaceId}/members`),

  addMember: (workspaceId, memberData) =>
    apiClient(`/workspaces/${workspaceId}/members`, {
      method: 'POST',
      body: memberData,
    }),

  removeMember: (workspaceId, userId) =>
    apiClient(`/workspaces/${workspaceId}/members/${userId}`, {
      method: 'DELETE',
    }),

  updateMemberRole: (workspaceId, userId, roleData) =>
    apiClient(`/workspaces/${workspaceId}/members/${userId}/role`, {
      method: 'PUT',
      body: roleData,
    }),

  leaveWorkspace: (workspaceId) =>
    apiClient(`/workspaces/${workspaceId}/leave`, {
      method: 'POST',
    }),
};
