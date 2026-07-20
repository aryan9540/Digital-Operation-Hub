import { apiClient } from './client';

export const authApi = {
  login: (credentials) =>
    apiClient('/auth/login', {
      method: 'POST',
      body: credentials,
    }),

  register: (userData) =>
    apiClient('/auth/register', {
      method: 'POST',
      body: userData,
    }),

  logout: () =>
    apiClient('/auth/logout', {
      method: 'POST',
    }),

  getMe: () =>
    apiClient('/auth/me'),

  googleAuth: (googleData) =>
    apiClient('/auth/google', {
      method: 'POST',
      body: googleData,
    }),
};
