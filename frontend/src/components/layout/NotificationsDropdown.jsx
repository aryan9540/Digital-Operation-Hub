import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationApi } from '../../api/notificationApi';
import { invitationApi } from '../../api/invitationApi';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useToast } from '../../context/ToastContext';
import { Bell, CheckCheck, Trash2, Clock, CheckCircle2, AlertCircle, Info, MessageSquare, Layers, UserPlus } from 'lucide-react';

export const NotificationsDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [acceptingId, setAcceptingId] = useState(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { refreshWorkspaces } = useWorkspace();
  const { addToast } = useToast();

  const fetchNotifications = async () => {
    try {
      const res = await notificationApi.getMyNotifications({ limit: 15 });
      if (res && res.notifications) {
        setNotifications(res.notifications);
        setUnreadCount(res.unreadCount ?? res.notifications.filter(n => !n.isRead).length);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleMarkAsRead = async (id, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    try {
      await notificationApi.markAsRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleAcceptInvite = async (n, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    try {
      setAcceptingId(n._id);
      const res = await invitationApi.getMyInvitations();
      const myInvites = res.invitations || [];
      const wsId = n.workspace?._id || n.workspace;
      const matchingInvite = wsId
        ? myInvites.find((inv) => (inv.workspace?._id || inv.workspace) === wsId)
        : myInvites[0];

      if (matchingInvite?.token) {
        await invitationApi.acceptInvitation(matchingInvite.token);
        addToast(`Joined workspace "${matchingInvite.workspace?.name || 'Workspace'}"!`, 'success');
        if (refreshWorkspaces) await refreshWorkspaces();
        handleMarkAsRead(n._id);
        setIsOpen(false);
      } else {
        addToast('No pending invitation found for this workspace', 'info');
      }
    } catch (err) {
      addToast(err.message || 'Failed to accept invitation', 'error');
    } finally {
      setAcceptingId(null);
    }
  };

  const handleNotificationClick = async (n) => {
    if (!n.isRead) {
      handleMarkAsRead(n._id);
    }
    if (n.type === 'workspace_invite') {
      try {
        const res = await invitationApi.getMyInvitations();
        const myInvites = res.invitations || [];
        const wsId = n.workspace?._id || n.workspace;
        const matchingInvite = wsId
          ? myInvites.find((inv) => (inv.workspace?._id || inv.workspace) === wsId)
          : myInvites[0];

        if (matchingInvite?.token) {
          setIsOpen(false);
          navigate(`/invite/${matchingInvite.token}`);
        }
      } catch (err) {
        console.error('Failed to resolve invitation link:', err);
      }
    }
  };

  const handleMarkAllRead = async () => {
    try {
      setLoading(true);
      await notificationApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      addToast('All notifications marked as read', 'success');
    } catch (err) {
      addToast('Failed to mark all as read', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClearAll = async () => {
    try {
      setLoading(true);
      await notificationApi.clearAll();
      setNotifications([]);
      setUnreadCount(0);
      addToast('Cleared all notifications', 'success');
    } catch (err) {
      addToast('Failed to clear notifications', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'workspace_invite':
        return <UserPlus size={14} style={{ color: '#10b981' }} />;
      case 'task_assigned':
      case 'task_created':
        return <Layers size={14} className="text-primary" style={{ color: 'var(--primary)' }} />;
      case 'comment_added':
        return <MessageSquare size={14} style={{ color: '#38bdf8' }} />;
      case 'status_change':
        return <CheckCircle2 size={14} style={{ color: '#34d399' }} />;
      case 'warning':
        return <AlertCircle size={14} style={{ color: '#fbbf24' }} />;
      default:
        return <Info size={14} style={{ color: '#a855f7' }} />;
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMin = Math.round((now - date) / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.round(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn-ghost btn-icon"
        style={{ position: 'relative', color: 'var(--text-secondary)' }}
        title="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              backgroundColor: 'var(--danger)',
              color: '#fff',
              fontSize: '10px',
              fontWeight: 700,
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 8px rgba(239, 68, 68, 0.6)',
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="glass-panel"
          style={{
            position: 'absolute',
            right: 0,
            top: 'calc(100% + 8px)',
            width: '360px',
            maxHeight: '480px',
            zIndex: 1000,
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--border-main)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'scaleIn 0.15s ease-out',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderBottom: '1px solid var(--border-subtle)',
              background: 'var(--bg-elevated)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 600, fontSize: '14px' }}>Notifications</span>
              {unreadCount > 0 && (
                <span className="badge badge-in-progress" style={{ padding: '2px 6px', fontSize: '11px' }}>
                  {unreadCount} new
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  disabled={loading}
                  className="btn-ghost"
                  style={{ fontSize: '12px', padding: '4px 8px', color: 'var(--primary)' }}
                  title="Mark all as read"
                >
                  <CheckCheck size={14} />
                  <span>Read all</span>
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={handleClearAll}
                  disabled={loading}
                  className="btn-ghost"
                  style={{ fontSize: '12px', padding: '4px 8px', color: 'var(--text-muted)' }}
                  title="Clear all"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div style={{ overflowY: 'auto', flex: 1, maxHeight: '380px' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '36px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Bell size={28} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
                <p style={{ fontSize: '13px', fontWeight: 500 }}>No notifications yet</p>
                <p style={{ fontSize: '12px', color: 'var(--text-dim)' }}>You are all caught up!</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  onClick={() => handleNotificationClick(n)}
                  style={{
                    padding: '12px 16px',
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'flex-start',
                    borderBottom: '1px solid var(--border-subtle)',
                    background: n.isRead ? 'transparent' : 'rgba(99, 102, 241, 0.06)',
                    cursor: 'pointer',
                    transition: 'var(--transition-fast)',
                  }}
                  className="notification-item"
                >
                  <div
                    style={{
                      marginTop: '2px',
                      padding: '6px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-surface)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {getIcon(n.type)}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: n.isRead ? 400 : 600, color: 'var(--text-main)' }}>
                      {n.title || n.message}
                    </div>
                    {n.description && (
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {n.description}
                      </p>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px', fontSize: '11px', color: 'var(--text-dim)' }}>
                      <Clock size={11} />
                      <span>{formatTime(n.createdAt)}</span>
                    </div>

                    {n.type === 'workspace_invite' && (
                      <div style={{ marginTop: '8px' }}>
                        <button
                          type="button"
                          onClick={(e) => handleAcceptInvite(n, e)}
                          disabled={acceptingId === n._id}
                          className="btn-primary"
                          style={{
                            padding: '4px 10px',
                            fontSize: '11px',
                            borderRadius: 'var(--radius-sm)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <UserPlus size={12} />
                          <span>{acceptingId === n._id ? 'Joining...' : 'Accept & Join'}</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {!n.isRead && (
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: 'var(--primary)',
                        marginTop: '6px',
                        flexShrink: 0,
                      }}
                    />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
