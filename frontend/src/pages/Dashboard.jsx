import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { useWorkspace } from '../context/WorkspaceContext';
import { useAuth } from '../context/AuthContext';
import { projectApi } from '../api/projectApi';
import { taskApi } from '../api/taskApi';
import { activityApi } from '../api/activityApi';
import { analyticsApi } from '../api/analyticsApi';
import { StatusBadge, PriorityBadge } from '../components/common/Badge';
import { Avatar } from '../components/common/Avatar';
import { TaskDetailModal } from '../components/modals/TaskDetailModal';
import {
  FolderGit2,
  CheckSquare,
  CheckCircle2,
  Clock,
  TrendingUp,
  Users,
  Plus,
  ArrowUpRight,
  Activity,
  Layers,
  Calendar,
  AlertCircle
} from 'lucide-react';

export const Dashboard = () => {
  const { currentWorkspace } = useWorkspace();
  const { user } = useAuth();
  const { openCreateTask, openCreateProject, openInviteMember } = useOutletContext() || {};

  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  const loadDashboardData = async () => {
    if (!currentWorkspace) return;
    try {
      setLoading(true);
      const [projRes, taskRes, actRes, anaRes] = await Promise.allSettled([
        projectApi.getProjectsByWorkspace(currentWorkspace._id),
        taskApi.getTasksByWorkspace(currentWorkspace._id, { limit: 20 }),
        activityApi.getWorkspaceActivities(currentWorkspace._id, { limit: 8 }),
        analyticsApi.getWorkspaceAnalytics(currentWorkspace._id),
      ]);

      if (projRes.status === 'fulfilled') setProjects(projRes.value?.projects || []);
      if (taskRes.status === 'fulfilled') setTasks(taskRes.value?.tasks || []);
      if (actRes.status === 'fulfilled') setActivities(actRes.value?.activities || []);
      if (anaRes.status === 'fulfilled') setAnalytics(anaRes.value?.analytics || anaRes.value || null);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [currentWorkspace]);

  // Derived metrics
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'in-progress').length;
  const highPriorityTasks = tasks.filter((t) => t.priority === 'high' || t.priority === 'urgent');
  const completionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Workspace Header */}
      <div
        className="card"
        style={{
          padding: '18px 22px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 className="page-title" style={{ margin: 0 }}>
              {currentWorkspace?.name || 'Workspace Dashboard'}
            </h1>
          </div>
          <p className="page-subtitle">
            {currentWorkspace?.description || `Welcome back, ${user?.name}. Here is your workspace overview.`}
          </p>
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={openCreateTask} className="btn-primary btn-sm">
            <Plus size={14} />
            <span>New Task</span>
          </button>
          <button onClick={openCreateProject} className="btn-secondary btn-sm">
            <FolderGit2 size={14} />
            <span>New Project</span>
          </button>
          <button onClick={openInviteMember} className="btn-secondary btn-sm">
            <Users size={14} />
            <span>Invite</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
        {/* Total Projects */}
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa' }}>
            <FolderGit2 size={18} />
          </div>
          <div>
            <div className="stat-label">Projects</div>
            <div className="stat-value">{projects.length}</div>
          </div>
        </div>

        {/* Tasks In Progress */}
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)' }}>
            <CheckSquare size={18} />
          </div>
          <div>
            <div className="stat-label">In Progress</div>
            <div className="stat-value">{inProgressTasks}</div>
          </div>
        </div>

        {/* Completed Tasks */}
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#34d399' }}>
            <CheckCircle2 size={18} />
          </div>
          <div>
            <div className="stat-label">Completed</div>
            <div className="stat-value">{completedTasks}</div>
          </div>
        </div>

        {/* Completion Rate */}
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#c084fc' }}>
            <TrendingUp size={18} />
          </div>
          <div>
            <div className="stat-label">Completion</div>
            <div className="stat-value">{completionRate}%</div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '24px' }}>
        {/* Left Column: Recent Projects + Priority Tasks */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Active Projects Widget */}
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FolderGit2 size={18} style={{ color: 'var(--primary)' }} />
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>Projects Pipeline</h3>
              </div>
              <Link to="/projects" className="btn-ghost" style={{ fontSize: '12px', color: 'var(--primary)', gap: '4px' }}>
                <span>View all ({projects.length})</span>
                <ArrowUpRight size={14} />
              </Link>
            </div>

            {projects.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-dim)' }}>
                <FolderGit2 size={32} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
                <p style={{ fontSize: '13px' }}>No projects created yet</p>
                <button onClick={openCreateProject} className="btn-secondary" style={{ marginTop: '12px', fontSize: '12px' }}>
                  <Plus size={14} /> Create first project
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {projects.slice(0, 4).map((p) => {
                  const projTasks = tasks.filter((t) => (t.project?._id || t.project) === p._id);
                  const projDone = projTasks.filter((t) => t.status === 'completed').length;
                  const projProgress = projTasks.length > 0 ? Math.round((projDone / projTasks.length) * 100) : 0;

                  return (
                    <Link
                      key={p._id}
                      to={`/projects/${p._id}`}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        padding: '12px 14px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border-subtle)',
                        textDecoration: 'none',
                        transition: 'var(--transition-fast)',
                      }}
                      className="hover-card"
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-main)' }}>
                            {p.name}
                          </span>
                          <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'monospace' }}>
                            [{p.key || 'PROJ'}]
                          </span>
                        </div>
                        <StatusBadge status={p.status || 'planning'} />
                      </div>

                      {/* Progress bar */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-dim)', marginBottom: '4px' }}>
                          <span>{projDone} of {projTasks.length} tasks completed</span>
                          <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{projProgress}%</span>
                        </div>
                        <div className="progress-bar">
                          <div className="progress-bar-fill" style={{ width: `${projProgress}%` }} />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* High Priority & Urgent Tasks Widget */}
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={18} style={{ color: '#f87171' }} />
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>
                  High Priority Focus ({highPriorityTasks.length})
                </h3>
              </div>
              <Link to="/tasks" className="btn-ghost" style={{ fontSize: '12px', color: 'var(--primary)', gap: '4px' }}>
                <span>All Tasks</span>
                <ArrowUpRight size={14} />
              </Link>
            </div>

            {highPriorityTasks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-dim)' }}>
                <CheckCircle2 size={28} style={{ margin: '0 auto 8px', color: '#34d399', opacity: 0.6 }} />
                <p style={{ fontSize: '13px' }}>No urgent blockers right now!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {highPriorityTasks.slice(0, 5).map((t) => (
                  <div
                    key={t._id}
                    onClick={() => setSelectedTaskId(t._id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                    }}
                    className="hover-card"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                      <PriorityBadge priority={t.priority} />
                      <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {t.title}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                      <StatusBadge status={t.status} />
                      <Avatar name={t.assignee?.name || 'Unassigned'} size="small" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Recent Workspace Activity Stream */}
        <div className="card" style={{ padding: '20px', height: 'fit-content' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={18} style={{ color: '#38bdf8' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>Live Activity</h3>
            </div>
            <Link to="/activity" className="btn-ghost" style={{ fontSize: '12px', color: 'var(--primary)', gap: '4px' }}>
              <span>View all</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>

          {activities.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--text-dim)' }}>
              <Activity size={28} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
              <p style={{ fontSize: '13px' }}>No recent activities</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {activities.slice(0, 6).map((act) => {
                const userObj = act.user || {};
                return (
                  <div
                    key={act._id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      fontSize: '12px',
                    }}
                  >
                    <Avatar name={userObj.name || 'User'} size="small" />
                    <div style={{ flex: 1 }}>
                      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                        <strong style={{ color: 'var(--text-main)' }}>{userObj.name || 'Team member'}</strong>{' '}
                        {act.description || act.action || 'performed an action'}
                      </p>
                      <span style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px', display: 'block' }}>
                        {new Date(act.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Task Detail Modal */}
      <TaskDetailModal
        isOpen={!!selectedTaskId}
        taskId={selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
        onTaskUpdated={loadDashboardData}
        onTaskDeleted={loadDashboardData}
      />
    </div>
  );
};
