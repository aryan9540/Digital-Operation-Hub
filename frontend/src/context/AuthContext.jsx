import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('teamsync_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('teamsync_token'));
  const [loading, setLoading] = useState(true);

  // Sync user profile from server
  const refreshUser = useCallback(async () => {
    const activeToken = localStorage.getItem('teamsync_token');
    if (!activeToken) {
      setUser(null);
      setLoading(false);
      return null;
    }

    try {
      const response = await authApi.getMe();
      if (response && response.user) {
        setUser(response.user);
        localStorage.setItem('teamsync_user', JSON.stringify(response.user));
        return response.user;
      }
    } catch (error) {
      console.error('Failed to refresh user profile:', error);
      // If 401, clear storage
      if (error.status === 401) {
        localStorage.removeItem('teamsync_token');
        localStorage.removeItem('teamsync_user');
        setUser(null);
        setToken(null);
      }
    } finally {
      setLoading(false);
    }
    return null;
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email, password) => {
    const response = await authApi.login({ email, password });
    if (response && response.token && response.user) {
      setToken(response.token);
      setUser(response.user);
      localStorage.setItem('teamsync_token', response.token);
      localStorage.setItem('teamsync_user', JSON.stringify(response.user));
    }
    return response;
  };

  const register = async (name, email, password) => {
    const response = await authApi.register({ name, email, password });
    if (response && response.token && response.user) {
      setToken(response.token);
      setUser(response.user);
      localStorage.setItem('teamsync_token', response.token);
      localStorage.setItem('teamsync_user', JSON.stringify(response.user));
    }
    return response;
  };

  const googleAuth = async (googleData) => {
    const response = await authApi.googleAuth(googleData);
    if (response && response.token && response.user) {
      setToken(response.token);
      setUser(response.user);
      localStorage.setItem('teamsync_token', response.token);
      localStorage.setItem('teamsync_user', JSON.stringify(response.user));
    }
    return response;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      localStorage.removeItem('teamsync_token');
      localStorage.removeItem('teamsync_user');
      localStorage.removeItem('teamsync_active_workspace');
      setUser(null);
      setToken(null);
    }
  };

  const updateUserData = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('teamsync_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        loading,
        login,
        register,
        googleAuth,
        logout,
        refreshUser,
        updateUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
