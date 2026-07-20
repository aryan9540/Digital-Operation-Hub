import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { workspaceApi } from '../api/workspaceApi';
import { useAuth } from './AuthContext';

const WorkspaceContext = createContext(null);

export const WorkspaceProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [workspaces, setWorkspaces] = useState([]);
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch workspaces for current user
  const fetchWorkspaces = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setWorkspaces([]);
      setCurrentWorkspace(null);
      setLoading(false);
      return [];
    }

    try {
      setLoading(true);
      const response = await workspaceApi.getMyWorkspaces();
      const list = response?.workspaces || [];
      setWorkspaces(list);

      if (list.length > 0) {
        const savedId = localStorage.getItem('teamsync_active_workspace');
        const matched = list.find((w) => w._id === savedId);
        const selected = matched || list[0];
        setCurrentWorkspace(selected);
        localStorage.setItem('teamsync_active_workspace', selected._id);
      } else {
        setCurrentWorkspace(null);
        localStorage.removeItem('teamsync_active_workspace');
      }
      return list;
    } catch (error) {
      console.error('Failed to load workspaces:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  const switchWorkspace = (workspaceId) => {
    const found = workspaces.find((w) => w._id === workspaceId);
    if (found) {
      setCurrentWorkspace(found);
      localStorage.setItem('teamsync_active_workspace', found._id);
    }
  };

  // Determine user's role in the current active workspace
  const getRole = () => {
    if (!currentWorkspace || !user) return 'member';
    const userId = user._id || user.id;

    // Check if user is workspace owner
    const ownerId = currentWorkspace.owner?._id || currentWorkspace.owner;
    if (ownerId && ownerId.toString() === userId?.toString()) {
      return 'owner';
    }

    // Check member role in members array
    const memberEntry = currentWorkspace.members?.find(
      (m) => (m.user?._id || m.user)?.toString() === userId?.toString()
    );

    return memberEntry ? memberEntry.role : 'member';
  };

  const role = getRole();
  const isOwner = role === 'owner';
  const isAdmin = role === 'owner' || role === 'admin';

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        currentWorkspace,
        loading,
        role,
        isOwner,
        isAdmin,
        switchWorkspace,
        refreshWorkspaces: fetchWorkspaces,
        setCurrentWorkspace,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};
