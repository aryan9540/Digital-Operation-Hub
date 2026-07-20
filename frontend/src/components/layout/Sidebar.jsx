import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../common/Avatar';
import {
  LayoutDashboard,
  FolderGit2,
  Kanban,
  Target,
  BarChart3,
  Users,
  Activity,
  Settings,
  ChevronDown,
  Plus,
  Building2,
  LogOut,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose, onOpenCreateWorkspace }) => {
  const { workspaces, currentWorkspace, switchWorkspace, role } = useWorkspace();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [wsDropdownOpen, setWsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setWsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/projects', label: 'Projects', icon: FolderGit2 },
    { to: '/tasks', label: 'Tasks & Board', icon: Kanban },
    { to: '/epics', label: 'Epics & Roadmap', icon: Target },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/team', label: 'Team Members', icon: Users },
    { to: '/activity', label: 'Activity Log', icon: Activity },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      className={`app-sidebar ${isOpen ? 'open' : ''}`}
      style={{
        width: 'var(--sidebar-width)',
        backgroundColor: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 60,
        userSelect: 'none',
      }}
    >
      {/* Brand & Workspace Switcher Header */}
      <div
        style={{
          padding: '16px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 4px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Sparkles size={16} color="#fff" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontWeight: 700, fontSize: '14px', letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
              TeamSync
            </span>
            <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '11px', background: 'var(--primary-subtle)', padding: '1px 5px', borderRadius: 'var(--radius-xs)' }}>
              B2B
            </span>
          </div>
        </div>

        {/* Workspace Dropdown Switcher */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button
            onClick={() => setWsDropdownOpen(!wsDropdownOpen)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '7px 10px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-main)',
              color: 'var(--text-main)',
              cursor: 'pointer',
              transition: 'var(--transition-fast)',
              textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
              <Building2 size={15} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
              <div style={{ overflow: 'hidden' }}>
                <div
                  style={{
                    fontSize: '12.5px',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {currentWorkspace?.name || 'Select Workspace'}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {role || 'Workspace'}
                </div>
              </div>
            </div>
            <ChevronDown size={13} style={{ color: 'var(--text-dim)', flexShrink: 0 }} />
          </button>

          {/* Workspace Switch Menu */}
          {wsDropdownOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                left: 0,
                right: 0,
                zIndex: 200,
                borderRadius: 'var(--radius-sm)',
                padding: '4px',
                boxShadow: 'var(--shadow-md)',
                border: '1px solid var(--border-main)',
                backgroundColor: 'var(--bg-elevated)',
                maxHeight: '260px',
                overflowY: 'auto',
              }}
            >
              <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', padding: '4px 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Your Workspaces
              </div>

              {workspaces.map((ws) => (
                <button
                  key={ws._id}
                  onClick={() => {
                    switchWorkspace(ws._id);
                    setWsDropdownOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '7px 8px',
                    borderRadius: 'var(--radius-xs)',
                    fontSize: '12.5px',
                    color: ws._id === currentWorkspace?._id ? 'var(--text-main)' : 'var(--text-secondary)',
                    fontWeight: ws._id === currentWorkspace?._id ? 600 : 400,
                    background: ws._id === currentWorkspace?._id ? 'var(--bg-surface-hover)' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {ws.name}
                  </span>
                  {ws._id === currentWorkspace?._id && (
                    <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--primary)' }} />
                  )}
                </button>
              ))}

              <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '4px 0' }} />

              <button
                onClick={() => {
                  setWsDropdownOpen(false);
                  if (onOpenCreateWorkspace) onOpenCreateWorkspace();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  width: '100%',
                  padding: '7px 8px',
                  borderRadius: 'var(--radius-xs)',
                  fontSize: '12px',
                  color: 'var(--primary)',
                  fontWeight: 600,
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <Plus size={13} />
                <span>Create Workspace</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              onClick={() => onClose && onClose()}
              className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '7px 10px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '13px',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? 'var(--text-main)' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'var(--bg-surface)' : 'transparent',
                textDecoration: 'none',
                transition: 'var(--transition-fast)',
              })}
            >
              {({ isActive }) => (
                <>
                  <Icon size={16} style={{ color: isActive ? 'var(--primary)' : 'var(--text-muted)', flexShrink: 0 }} />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Summary Footer */}
      <div
        style={{
          padding: '14px 16px',
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-app)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
          <Avatar name={user?.name || 'User'} size="medium" />
          <div style={{ overflow: 'hidden' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name}
            </p>
            <p style={{ fontSize: '11px', color: 'var(--text-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.email}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="btn-ghost btn-icon"
          style={{ color: 'var(--text-dim)', flexShrink: 0 }}
          title="Sign Out"
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
};
