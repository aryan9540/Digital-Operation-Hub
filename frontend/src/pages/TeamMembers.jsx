import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useWorkspace } from '../context/WorkspaceContext';
import { useAuth } from '../context/AuthContext';
import { workspaceApi } from '../api/workspaceApi';
import { invitationApi } from '../api/invitationApi';
import { useToast } from '../context/ToastContext';
import { RoleBadge } from '../components/common/Badge';
import { Avatar } from '../components/common/Avatar';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  Users,
  UserPlus,
  Shield,
  Trash2,
  Mail,
  Clock,
  CheckCircle2,
  XCircle,
  MoreHorizontal
} from 'lucide-react';

export const TeamMembers = () => {
  const { currentWorkspace, role, isAdmin, isOwner } = useWorkspace();
  const { user } = useAuth();
  const { openInviteMember } = useOutletContext() || {};
  const { addToast } = useToast();

  const [members, setMembers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadTeamData = async () => {
    if (!currentWorkspace) return;
    try {
      setLoading(true);
      const [memRes, invRes] = await Promise.allSettled([
        workspaceApi.getMembers(currentWorkspace._id),
        invitationApi.getWorkspaceInvitations(currentWorkspace._id),
      ]);

      if (memRes.status === 'fulfilled') setMembers(memRes.value?.members || []);
      if (invRes.status === 'fulfilled') setInvitations(invRes.value?.invitations || []);
    } catch (err) {
      addToast('Failed to load team data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeamData();
  }, [currentWorkspace]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await workspaceApi.updateMemberRole(currentWorkspace._id, userId, { role: newRole });
      addToast('Member role updated', 'success');
      loadTeamData();
    } catch (err) {
      addToast(err.message || 'Failed to update member role', 'error');
    }
  };

  const handleRemoveMember = async (userId, memberName) => {
    if (!window.confirm(`Remove ${memberName} from this workspace?`)) return;
    try {
      await workspaceApi.removeMember(currentWorkspace._id, userId);
      addToast('Member removed from workspace', 'success');
      setMembers((prev) => prev.filter((m) => (m.user?._id || m.user) !== userId));
    } catch (err) {
      addToast(err.message || 'Failed to remove member', 'error');
    }
  };

  const handleCancelInvite = async (invitationId) => {
    if (!window.confirm('Cancel this pending invitation?')) return;
    try {
      await invitationApi.cancelInvitation(invitationId);
      addToast('Invitation cancelled', 'success');
      setInvitations((prev) => prev.filter((inv) => inv._id !== invitationId));
    } catch (err) {
      addToast(err.message || 'Failed to cancel invitation', 'error');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '80px 0', textAlign: 'center' }}>
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <h1 className="page-title">Team & Members</h1>
          <p className="page-subtitle">
            Manage collaborators, roles, permissions, and invitations for {currentWorkspace?.name}
          </p>
        </div>

        {isAdmin && (
          <button onClick={openInviteMember} className="btn-primary btn-sm">
            <UserPlus size={14} />
            <span>Invite Colleague</span>
          </button>
        )}
      </div>

      {/* Active Members Table */}
      <div className="table-container">
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>
            Active Members ({members.length})
          </h3>
        </div>

        <table className="saas-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined Date</th>
              {isAdmin && <th style={{ textAlign: 'right' }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {members.map((m) => {
              const u = m.user || m;
              const isSelf = u._id === user?._id;
              const isWsOwner = (currentWorkspace.owner?._id || currentWorkspace.owner) === u._id;

              return (
                <tr key={u._id} style={{ borderBottom: '1px solid var(--border-subtle)' }} className="table-row-hover">
                  <td style={{ padding: '12px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Avatar name={u.name} size="medium" />
                      <div>
                        <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{u.name}</span>
                        {isSelf && (
                          <span style={{ fontSize: '11px', color: 'var(--primary)', marginLeft: '6px' }}>(You)</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 20px', color: 'var(--text-secondary)' }}>
                    {u.email}
                  </td>
                  <td style={{ padding: '12px 20px' }}>
                    {isAdmin && !isWsOwner && !isSelf ? (
                      <select
                        className="form-control"
                        style={{ fontSize: '12px', padding: '4px 8px', width: '110px' }}
                        value={m.role || 'member'}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                      >
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                        <option value="viewer">Viewer</option>
                      </select>
                    ) : (
                      <RoleBadge role={isWsOwner ? 'owner' : m.role || 'member'} />
                    )}
                  </td>
                  <td style={{ padding: '12px 20px', color: 'var(--text-dim)' }}>
                    {m.joinedAt ? new Date(m.joinedAt).toLocaleDateString() : 'N/A'}
                  </td>
                  {isAdmin && (
                    <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                      {!isWsOwner && !isSelf && (
                        <button
                          onClick={() => handleRemoveMember(u._id, u.name)}
                          className="btn-danger btn-ghost"
                          style={{ padding: '4px 8px', fontSize: '12px' }}
                          title="Remove user"
                        >
                          <Trash2 size={14} /> Remove
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pending Invitations Section */}
      {isAdmin && (
        <div className="table-container">
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>
              Pending Invitations ({invitations.length})
            </h3>
          </div>

          {invitations.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '13px' }}>
              No pending invitations for this workspace.
            </div>
          ) : (
            <table className="saas-table">
              <thead>
                <tr>
                  <th>Invited Email</th>
                  <th>Assigned Role</th>
                  <th>Invited On</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {invitations.map((inv) => (
                  <tr key={inv._id}>
                    <td style={{ fontWeight: 500, color: 'var(--text-main)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Mail size={13} style={{ color: 'var(--text-muted)' }} />
                        <span>{inv.email}</span>
                      </div>
                    </td>
                    <td>
                      <RoleBadge role={inv.role || 'member'} />
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>
                      {new Date(inv.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => handleCancelInvite(inv._id)}
                        className="btn-danger btn-sm"
                        style={{ padding: '3px 8px' }}
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};
