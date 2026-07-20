import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { invitationApi } from '../../api/invitationApi';
import { useAuth } from '../../context/AuthContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useToast } from '../../context/ToastContext';
import { Building2, UserCheck, AlertTriangle } from 'lucide-react';

export const AcceptInvite = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { refreshWorkspaces } = useWorkspace();
  const { addToast } = useToast();

  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInvite = async () => {
      try {
        setLoading(true);
        const res = await invitationApi.getInvitationByToken(token);
        setInvitation(res.invitation || res);
      } catch (err) {
        setError(err.message || 'Invitation not found or has expired');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchInvite();
    }
  }, [token]);

  const handleAccept = async () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/invite/${token}`);
      return;
    }

    try {
      setAccepting(true);
      await invitationApi.acceptInvitation(token);
      addToast('Invitation accepted! Welcome to the workspace.', 'success');
      await refreshWorkspaces();
      navigate('/dashboard');
    } catch (err) {
      addToast(err.message || 'Failed to accept invitation', 'error');
    } finally {
      setAccepting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-app)',
        padding: '24px',
      }}
    >
      <div style={{ width: '100%', maxWidth: '440px' }}>
        <div className="card" style={{ padding: '32px', textAlign: 'center' }}>
          {loading ? (
            <div style={{ padding: '40px 0', color: 'var(--text-muted)' }}>
              <div className="spinner" style={{ margin: '0 auto 16px' }} />
              Verifying invitation...
            </div>
          ) : error ? (
            <div style={{ padding: '12px 0' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--danger-bg)',
                  color: 'var(--danger)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}
              >
                <AlertTriangle size={22} />
              </div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
                Invitation Error
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                {error}
              </p>
              <Link to="/login" className="btn-primary" style={{ display: 'inline-flex' }}>
                Return to Login
              </Link>
            </div>
          ) : (
            <div>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--primary)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                  color: '#fff',
                }}
              >
                <Building2 size={22} />
              </div>

              <h2 style={{ fontSize: '19px', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                Workspace Invitation
              </h2>

              <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: 1.5 }}>
                You&apos;ve been invited to join{' '}
                <strong style={{ color: 'var(--text-main)' }}>
                  {invitation?.workspace?.name || 'a TeamSync Workspace'}
                </strong>{' '}
                as a <span style={{ textTransform: 'capitalize', color: 'var(--primary)' }}>{invitation?.role || 'Member'}</span>.
              </p>

              <div
                style={{
                  background: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 16px',
                  margin: '20px 0',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '12.5px',
                  textAlign: 'left',
                }}
              >
                <div style={{ color: 'var(--text-muted)' }}>
                  Invited by: <strong style={{ color: 'var(--text-main)' }}>{invitation?.invitedBy?.name || 'Workspace Admin'}</strong>
                </div>
                <div style={{ color: 'var(--text-muted)', marginTop: '4px' }}>
                  Recipient: <strong style={{ color: 'var(--text-main)' }}>{invitation?.email}</strong>
                </div>
              </div>

              <button
                onClick={handleAccept}
                disabled={accepting}
                className="btn-primary"
                style={{ width: '100%', padding: '10px', fontSize: '13.5px', fontWeight: 600, justifyContent: 'center' }}
              >
                <UserCheck size={16} />
                <span>{accepting ? 'Joining Workspace...' : 'Accept Invitation & Join'}</span>
              </button>

              {!isAuthenticated && (
                <p style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '14px' }}>
                  You will be prompted to log in or register before joining.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
