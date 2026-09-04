import React, { useState, useEffect } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { useAuth } from '../context/AuthContext';
import { workspaceApi } from '../api/workspaceApi';
import { userApi } from '../api/userApi';
import { useToast } from '../context/ToastContext';
import { Avatar } from '../components/common/Avatar';
import {
  Settings as SettingsIcon,
  User,
  Building2,
  Lock,
  Trash2,
  LogOut,
  Shield,
  Save,
  Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Settings = () => {
  const { currentWorkspace, isOwner, isAdmin, refreshWorkspaces, switchWorkspace } = useWorkspace();
  const { user, updateUserData, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('workspace'); // 'workspace' | 'profile' | 'security'

  // Workspace form
  const [wsName, setWsName] = useState('');
  const [wsDesc, setWsDesc] = useState('');
  const [savingWs, setSavingWs] = useState(false);

  // Profile form
  const [name, setName] = useState(user?.name || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (currentWorkspace) {
      setWsName(currentWorkspace.name || '');
      setWsDesc(currentWorkspace.description || '');
    }
  }, [currentWorkspace]);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
    }
  }, [user]);

  const handleUpdateWorkspace = async (e) => {
    e.preventDefault();
    if (!wsName.trim()) {
      addToast('Workspace name cannot be empty', 'error');
      return;
    }

    try {
      setSavingWs(true);
      const res = await workspaceApi.updateWorkspace(currentWorkspace._id, {
        name: wsName.trim(),
        description: wsDesc.trim(),
      });
      addToast('Workspace settings saved!', 'success');
      await refreshWorkspaces();
    } catch (err) {
      addToast(err.message || 'Failed to update workspace', 'error');
    } finally {
      setSavingWs(false);
    }
  };

  const handleDeleteWorkspace = async () => {
    if (!window.confirm(`Are you SURE you want to delete workspace "${currentWorkspace.name}"? This deletes all associated projects, tasks, and comments permanently.`)) return;

    try {
      await workspaceApi.deleteWorkspace(currentWorkspace._id);
      addToast('Workspace deleted', 'success');
      const remaining = await refreshWorkspaces();
      if (remaining.length > 0) {
        switchWorkspace(remaining[0]._id);
      }
      navigate('/dashboard');
    } catch (err) {
      addToast(err.message || 'Failed to delete workspace', 'error');
    }
  };

  const handleLeaveWorkspace = async () => {
    if (!window.confirm(`Leave workspace "${currentWorkspace.name}"?`)) return;

    try {
      await workspaceApi.leaveWorkspace(currentWorkspace._id);
      addToast('Left workspace successfully', 'success');
      const remaining = await refreshWorkspaces();
      if (remaining.length > 0) {
        switchWorkspace(remaining[0]._id);
      }
      navigate('/dashboard');
    } catch (err) {
      addToast(err.message || 'Failed to leave workspace', 'error');
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      addToast('Name is required', 'error');
      return;
    }

    try {
      setSavingProfile(true);
      const res = await userApi.updateProfile({ name: name.trim() });
      if (res?.user) {
        updateUserData(res.user);
      }
      addToast('Profile updated successfully', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      addToast('Please enter both current and new passwords', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      addToast('New passwords do not match', 'error');
      return;
    }
    if (newPassword.length < 6) {
      addToast('New password must be at least 6 characters', 'error');
      return;
    }

    try {
      setSavingPassword(true);
      await userApi.changePassword({ currentPassword, newPassword });
      addToast('Password changed successfully!', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      addToast(err.message || 'Failed to change password', 'error');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '900px', margin: '0 auto' }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Manage workspace configurations, account profile, and credentials</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-group">
        <button
          onClick={() => setActiveTab('workspace')}
          className={`tab-btn ${activeTab === 'workspace' ? 'active' : ''}`}
        >
          <Building2 size={14} /> <span>Workspace</span>
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
        >
          <User size={14} /> <span>My Profile</span>
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
        >
          <Lock size={14} /> <span>Security & Password</span>
        </button>
      </div>

      {/* Tab 1: Workspace Settings */}
      {activeTab === 'workspace' && currentWorkspace && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card" style={{ padding: '20px' }}>
            <h3 className="section-title">General Workspace Settings</h3>

            <form onSubmit={handleUpdateWorkspace} style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '480px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="settings-ws-name">Workspace Name</label>
                <input
                  id="settings-ws-name"
                  type="text"
                  className="form-control"
                  value={wsName}
                  onChange={(e) => setWsName(e.target.value)}
                  disabled={!isAdmin}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="settings-ws-desc">Description</label>
                <textarea
                  id="settings-ws-desc"
                  className="form-control"
                  rows="3"
                  value={wsDesc}
                  onChange={(e) => setWsDesc(e.target.value)}
                  disabled={!isAdmin}
                />
              </div>

              {isAdmin && (
                <button type="submit" disabled={savingWs} className="btn-primary btn-sm" style={{ width: 'fit-content' }}>
                  <Save size={14} />
                  <span>{savingWs ? 'Saving...' : 'Save Changes'}</span>
                </button>
              )}
            </form>
          </div>

          {/* Danger Zone */}
          <div
            className="card"
            style={{
              padding: '24px',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              background: 'rgba(239, 68, 68, 0.04)',
            }}
          >
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--danger)', marginBottom: '8px' }}>
              Danger Zone
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Actions here cannot be reversed. Please proceed with caution.
            </p>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {!isOwner && (
                <button onClick={handleLeaveWorkspace} className="btn-danger btn-ghost">
                  <LogOut size={15} /> Leave Workspace
                </button>
              )}

              {isOwner && (
                <button onClick={handleDeleteWorkspace} className="btn-danger">
                  <Trash2 size={15} /> Delete Workspace Permanently
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Profile Settings */}
      {activeTab === 'profile' && (
        <div className="card" style={{ padding: '24px', maxWidth: '600px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px' }}>
            Personal Profile
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <Avatar name={user?.name} size="xlarge" />
            <div>
              <h4 style={{ fontSize: '16px', fontWeight: 700 }}>{user?.name}</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{user?.email}</p>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-control"
                value={user?.email || ''}
                disabled
                style={{ opacity: 0.7, cursor: 'not-allowed' }}
              />
              <span style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px', display: 'block' }}>
                Primary login email cannot be modified.
              </span>
            </div>

            <button type="submit" disabled={savingProfile} className="btn-primary" style={{ width: 'fit-content', marginTop: '8px' }}>
              <Save size={15} />
              <span>{savingProfile ? 'Updating...' : 'Save Profile'}</span>
            </button>
          </form>
        </div>
      )}

      {/* Tab 3: Security & Password */}
      {activeTab === 'security' && (
        <div className="card" style={{ padding: '24px', maxWidth: '540px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px' }}>
            Change Password
          </h3>

          <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label className="form-label">Current Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="form-label">New Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Minimum 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" disabled={savingPassword} className="btn-primary" style={{ width: 'fit-content', marginTop: '8px' }}>
              <Lock size={15} />
              <span>{savingPassword ? 'Updating Password...' : 'Update Password'}</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
