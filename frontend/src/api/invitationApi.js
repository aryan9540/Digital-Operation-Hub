import { apiClient } from './client';

export const invitationApi = {
  createInvitation: (workspaceId, inviteData) =>
    apiClient(`/invitations/workspace/${workspaceId}`, {
      method: 'POST',
      body: inviteData,
    }),

  getWorkspaceInvitations: (workspaceId) =>
    apiClient(`/invitations/workspace/${workspaceId}`),

  getMyInvitations: () => apiClient('/invitations/my'),

  getInvitationByToken: (token) => apiClient(`/invitations/token/${token}`),

  acceptInvitation: (token) =>
    apiClient(`/invitations/token/${token}/accept`, {
      method: 'POST',
    }),

  declineInvitation: (token) =>
    apiClient(`/invitations/token/${token}/decline`, {
      method: 'POST',
    }),

  cancelInvitation: (id) =>
    apiClient(`/invitations/${id}`, {
      method: 'DELETE',
    }),
};
