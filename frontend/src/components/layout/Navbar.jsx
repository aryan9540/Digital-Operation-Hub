import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Avatar } from '../common/Avatar';
import { NotificationsDropdown } from './NotificationsDropdown';
import {
  Plus,
  Search,
  FolderPlus,
  CheckSquare,
  Target,
  UserPlus,
  LogOut,
  Settings,
  User,
  Menu,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Navbar = ({
  onToggleSidebar,
  onOpenCreateTask,
  onOpenCreateProject,
  onOpenCreateEpic,
  onOpenInviteMember,
}) => {
  const { user, logout } = useAuth();
  const { currentWorkspace, role } = useWorkspace();
  const navigate = useNavigate();

  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const createMenuRef = useRef(null);
  const userMenuRef = useRef(null);

  // Close menus on outside click
  useEffect(() => {
    const handleOutside = (e) => {
      if (createMenuRef.current && !createMenuRef.current.contains(e.target)) {
        setCreateMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/tasks?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header
      style={{
        height: 'var(--topbar-height)',
        backgroundColor: 'var(--bg-sidebar)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      {/* Left: Mobile Toggle & Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, maxWidth: '440px' }}>
        <button
          onClick={onToggleSidebar}
          className="btn-ghost btn-icon mobile-menu-btn"
          style={{ display: 'none' }}
          title="Toggle Navigation"
        >
          <Menu size={18} />
        </button>

        {/* Global Search Bar */}
        <form onSubmit={handleSearchSubmit} style={{ width: '100%' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-control"
              placeholder="Search tasks, projects (press Enter)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                paddingLeft: '32px',
                paddingRight: '10px',
                height: '32px',
                fontSize: '12.5px',
                borderRadius: 'var(--radius-sm)',
              }}
            />
          </div>
        </form>
      </div>

      {/* Right: Quick Action Dropdown, Notifications, User Menu */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Quick Create Dropdown */}
        <div style={{ position: 'relative' }} ref={createMenuRef}>
          <button
            onClick={() => setCreateMenuOpen(!createMenuOpen)}
            className="btn-primary"
            style={{
              padding: '6px 12px',
              fontSize: '12.5px',
              borderRadius: 'var(--radius-sm)',
              gap: '5px',
            }}
          >
            <Plus size={14} />
            <span>Create</span>
            <ChevronDown size={12} style={{ opacity: 0.8 }} />
          </button>

          {createMenuOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                right: 0,
                width: '190px',
                borderRadius: 'var(--radius-sm)',
                padding: '4px',
                zIndex: 100,
                boxShadow: 'var(--shadow-md)',
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border-main)',
              }}
            >
              <button
                onClick={() => {
                  setCreateMenuOpen(false);
                  if (onOpenCreateTask) onOpenCreateTask();
                }}
                className="dropdown-item"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '13px',
                  color: 'var(--text-main)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <CheckSquare size={15} style={{ color: 'var(--primary)' }} />
                <span>New Task</span>
              </button>

              <button
                onClick={() => {
                  setCreateMenuOpen(false);
                  if (onOpenCreateProject) onOpenCreateProject();
                }}
                className="dropdown-item"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '13px',
                  color: 'var(--text-main)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <FolderPlus size={15} style={{ color: '#38bdf8' }} />
                <span>New Project</span>
              </button>

              <button
                onClick={() => {
                  setCreateMenuOpen(false);
                  if (onOpenCreateEpic) onOpenCreateEpic();
                }}
                className="dropdown-item"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '13px',
                  color: 'var(--text-main)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <Target size={15} style={{ color: '#a855f7' }} />
                <span>New Epic</span>
              </button>

              <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '4px 0' }} />

              <button
                onClick={() => {
                  setCreateMenuOpen(false);
                  if (onOpenInviteMember) onOpenInviteMember();
                }}
                className="dropdown-item"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '13px',
                  color: 'var(--text-main)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <UserPlus size={15} style={{ color: '#34d399' }} />
                <span>Invite Member</span>
              </button>
            </div>
          )}
        </div>

        {/* Notifications Dropdown */}
        <NotificationsDropdown />

        {/* Workspace role indicator badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            fontSize: '11px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            color: 'var(--text-muted)',
          }}
        >
          {role || 'MEMBER'}
        </div>

        {/* User Profile Avatar & Dropdown */}
        <div style={{ position: 'relative' }} ref={userMenuRef}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '3px',
              borderRadius: 'var(--radius-full)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <Avatar name={user?.name || 'User'} size="medium" />
          </button>

          {userMenuOpen && (
            <div
              className="glass-panel"
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '230px',
                borderRadius: 'var(--radius-md)',
                padding: '8px',
                zIndex: 100,
                boxShadow: 'var(--shadow-lg)',
                border: '1px solid var(--border-main)',
                animation: 'scaleIn 0.15s ease-out',
              }}
            >
              {/* User summary header */}
              <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '6px' }}>
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>{user?.name}</p>
                <p style={{ fontSize: '11px', color: 'var(--text-dim)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.email}
                </p>
              </div>

              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  navigate('/settings');
                }}
                className="dropdown-item"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '13px',
                  color: 'var(--text-main)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <Settings size={15} style={{ color: 'var(--text-muted)' }} />
                <span>Account Settings</span>
              </button>

              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  navigate('/team');
                }}
                className="dropdown-item"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '13px',
                  color: 'var(--text-main)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <User size={15} style={{ color: 'var(--text-muted)' }} />
                <span>Team & Roles</span>
              </button>

              <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '4px 0' }} />

              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  logout();
                  navigate('/login');
                }}
                className="dropdown-item"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '13px',
                  color: 'var(--danger)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <LogOut size={15} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
