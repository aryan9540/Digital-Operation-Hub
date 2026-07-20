import { apiClient } from './client';

export const commentApi = {
  getTaskComments: (taskId) => apiClient(`/comments/task/${taskId}`),

  createComment: (taskId, text) =>
    apiClient('/comments', {
      method: 'POST',
      body: { taskId, text },
    }),

  updateComment: (id, text) =>
    apiClient(`/comments/${id}`, {
      method: 'PUT',
      body: { text },
    }),

  deleteComment: (id) =>
    apiClient(`/comments/${id}`, {
      method: 'DELETE',
    }),
};
