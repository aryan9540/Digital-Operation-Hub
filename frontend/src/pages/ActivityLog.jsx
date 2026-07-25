import React, { useState, useEffect } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { activityApi } from '../api/activityApi';
import { Avatar } from '../components/common/Avatar';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  Activity,
  Layers,
  FolderGit2,
  Target,
  UserPlus,
  MessageSquare,
  Clock,
  Search,
  Filter
} from 'lucide-react';

export const ActivityLog = () => {
  const { currentWorkspace } = useWorkspace();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  const loadActivities = async () => {
    if (!currentWorkspace) return;
    try {
      setLoading(true);
      const res = await activityApi.getWorkspaceActivities(currentWorkspace._id, { limit: 50 });
      setActivities(res?.activities || []);
    } catch (err) {
      console.error('Failed to load activities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, [currentWorkspace]);

  const getActivityIcon = (type) => {
    switch (type) {
      case 'task':
      case 'task_created':
      case 'task_updated':
        return <Layers size={16} style={{ color: 'var(--primary)' }} />;
      case 'project':
      case 'project_created':
        return <FolderGit2 size={16} style={{ color: '#38bdf8' }} />;
      case 'epic':
      case 'epic_created':
        return <Target size={16} style={{ color: '#a855f7' }} />;
      case 'member':
      case 'member_invited':
      case 'member_joined':
        return <UserPlus size={16} style={{ color: '#34d399' }} />;
      case 'comment':
        return <MessageSquare size={16} style={{ color: '#fbbf24' }} />;
      default:
        return <Activity size={16} style={{ color: 'var(--text-muted)' }} />;
    }
  };

  const filteredActivities = activities.filter((act) => {
    const desc = (act.description || act.action || '').toLowerCase();
    const userName = (act.user?.name || '').toLowerCase();
    const query = searchQuery.toLowerCase();

    const matchesSearch = desc.includes(query) || userName.includes(query);
    const matchesFilter = actionFilter === 'all' || (act.entityType || act.type || '').toLowerCase().includes(actionFilter);

    return matchesSearch && matchesFilter;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <h1 className="page-title">Activity & Audit Log</h1>
          <p className="page-subtitle">
            Real-time activity stream and audit trail for {currentWorkspace?.name}
          </p>
        </div>
      </div>

      {/* Toolbar / Search & Filter */}
      <div className="card" style={{ padding: '10px 14px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-control"
            placeholder="Search activity stream..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '30px', height: '32px', fontSize: '12.5px' }}
          />
        </div>

        <select
          className="form-control"
          style={{ width: '150px', height: '32px', fontSize: '12.5px' }}
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
        >
          <option value="all">All Events</option>
          <option value="task">Tasks</option>
          <option value="project">Projects</option>
          <option value="epic">Epics</option>
          <option value="member">Team & Roles</option>
        </select>
      </div>

      {/* Timeline Stream */}
      {loading ? (
        <div style={{ padding: '80px 0', textAlign: 'center' }}>
          <LoadingSpinner size="large" />
        </div>
      ) : filteredActivities.length === 0 ? (
        <div className="card" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Activity size={44} style={{ opacity: 0.3, margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-main)' }}>No Activity Recorded</h3>
          <p style={{ fontSize: '13px', marginTop: '4px' }}>Actions performed in this workspace will appear here.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {filteredActivities.map((act) => {
            const userObj = act.user || {};
            return (
              <div
                key={act._id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '16px',
                  paddingBottom: '16px',
                  borderBottom: '1px solid var(--border-subtle)',
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-elevated)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid var(--border-main)',
                    flexShrink: 0,
                  }}
                >
                  {getActivityIcon(act.entityType || act.type)}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Avatar name={userObj.name || 'User'} size="small" />
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>
                        {userObj.name || 'Workspace Member'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-dim)' }}>
                      <Clock size={12} />
                      <span>{new Date(act.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>

                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: 1.5 }}>
                    {act.description || act.action}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
