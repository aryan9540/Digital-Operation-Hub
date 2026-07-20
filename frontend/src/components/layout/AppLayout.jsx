import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { CreateWorkspaceModal } from '../modals/CreateWorkspaceModal';
import { CreateProjectModal } from '../modals/CreateProjectModal';
import { CreateTaskModal } from '../modals/CreateTaskModal';
import { CreateEpicModal } from '../modals/CreateEpicModal';
import { InviteMemberModal } from '../modals/InviteMemberModal';
import { useWorkspace } from '../../context/WorkspaceContext';
import { LoadingSpinner } from '../common/LoadingSpinner';

export const AppLayout = () => {
  const { currentWorkspace, loading } = useWorkspace();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Global Modals State
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isEpicModalOpen, setIsEpicModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-app)' }}>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            zIndex: 55,
            backdropFilter: 'blur(4px)',
          }}
        />
      )}

      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenCreateWorkspace={() => setIsWorkspaceModalOpen(true)}
      />

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowX: 'hidden' }}>
        <Navbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onOpenCreateTask={() => setIsTaskModalOpen(true)}
          onOpenCreateProject={() => setIsProjectModalOpen(true)}
          onOpenCreateEpic={() => setIsEpicModalOpen(true)}
          onOpenInviteMember={() => setIsInviteModalOpen(true)}
        />

        <main style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
              <LoadingSpinner size="large" />
            </div>
          ) : !currentWorkspace ? (
            <div
              style={{
                maxWidth: '500px',
                margin: '80px auto',
                textAlign: 'center',
                padding: '40px',
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--border-main)',
              }}
            >
              <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>No Workspace Selected</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
                Create a new workspace or ask your team administrator to invite you to an existing workspace.
              </p>
              <button
                onClick={() => setIsWorkspaceModalOpen(true)}
                className="btn-primary"
                style={{ margin: '0 auto' }}
              >
                Create Workspace
              </button>
            </div>
          ) : (
            <Outlet
              context={{
                openCreateTask: () => setIsTaskModalOpen(true),
                openCreateProject: () => setIsProjectModalOpen(true),
                openCreateEpic: () => setIsEpicModalOpen(true),
                openInviteMember: () => setIsInviteModalOpen(true),
              }}
            />
          )}
        </main>
      </div>

      {/* Global Modals */}
      <CreateWorkspaceModal
        isOpen={isWorkspaceModalOpen}
        onClose={() => setIsWorkspaceModalOpen(false)}
      />
      <CreateProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onProjectCreated={() => {}}
      />
      <CreateTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onTaskCreated={() => {}}
      />
      <CreateEpicModal
        isOpen={isEpicModalOpen}
        onClose={() => setIsEpicModalOpen(false)}
        onEpicCreated={() => {}}
      />
      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onInviteSent={() => {}}
      />
    </div>
  );
};
