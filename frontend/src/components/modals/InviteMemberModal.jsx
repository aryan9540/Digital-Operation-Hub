import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { invitationApi } from '../../api/invitationApi';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useToast } from '../../context/ToastContext';
import { Mail, Shield, Copy, Check, UserPlus } from 'lucide-react';

export const InviteMemberModal = ({ isOpen, onClose, onInviteSent }) => {
  const { currentWorkspace } = useWorkspace();
  const { addToast } = useToast();

  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [loading, setLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentWorkspace) {
      addToast('No active workspace selected', 'error');
      return;
    }

    if (!email.trim()) {
      addToast('Email address is required', 'error');
      return;
    }

    try {
      setLoading(true);
      const res = await invitationApi.createInvitation(currentWorkspace._id, {
        email: email.trim(),
        role,
      });

      addToast(`Invitation sent to ${email.trim()}`, 'success');
      
      const fullLink = `${window.location.origin}${res.inviteLink || `/invite/${res.inviteToken}`}`;
      setGeneratedLink(fullLink);
      
      if (onInviteSent) onInviteSent(res);
    } catch (err) {
      addToast(err.message || 'Failed to send invitation', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (!generatedLink) return;
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    addToast('Invitation link copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleResetAndClose = () => {
    setEmail('');
    setRole('member');
    setGeneratedLink('');
    setCopied(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleResetAndClose}
      title="Invite Team Member"
      maxWidth="520px"
      footer={
        generatedLink ? (
          <button type="button" onClick={handleResetAndClose} className="btn-primary">
            Done
          </button>
        ) : (
          <>
            <button type="button" onClick={handleResetAndClose} className="btn-secondary" disabled={loading}>
              Cancel
            </button>
            <button type="button" onClick={handleSubmit} className="btn-primary" disabled={loading}>
              {loading ? 'Sending Invite...' : 'Send Invitation'}
            </button>
          </>
        )
      }
    >
      {generatedLink ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'center', padding: '8px 0' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#34d399',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
            }}
          >
            <UserPlus size={24} />
          </div>

          <div>
            <h4 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-main)' }}>
              Invitation Link Ready!
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
              We've created an invite for <strong style={{ color: 'var(--text-main)' }}>{email}</strong>. You can also share the direct link below:
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'var(--bg-input)',
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-main)',
            }}
          >
            <input
              type="text"
              readOnly
              value={generatedLink}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                fontSize: '13px',
                width: '100%',
                outline: 'none',
                fontFamily: 'monospace',
              }}
            />
            <button
              type="button"
              onClick={handleCopyLink}
              className="btn-secondary"
              style={{ padding: '6px 12px', fontSize: '12px', flexShrink: 0 }}
            >
              {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="form-label" htmlFor="invite-email">Email Address *</label>
            <div className="input-group">
              <span className="input-icon"><Mail size={16} /></span>
              <input
                id="invite-email"
                type="email"
                className="form-control"
                placeholder="colleague@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="form-label" htmlFor="invite-role">Workspace Role</label>
            <div className="input-group">
              <span className="input-icon"><Shield size={16} /></span>
              <select
                id="invite-role"
                className="form-control"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="member">Member — Can create and edit tasks, projects, epics</option>
                <option value="admin">Admin — Can manage members, settings, and workspace data</option>
                <option value="viewer">Viewer — Read-only access across all workspace projects</option>
              </select>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px', display: 'block' }}>
              You can change member roles at any time from workspace team settings.
            </span>
          </div>
        </form>
      )}
    </Modal>
  );
};
