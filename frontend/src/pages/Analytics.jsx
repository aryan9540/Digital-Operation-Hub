import React, { useState, useEffect } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { analyticsApi } from '../api/analyticsApi';
import { taskApi } from '../api/taskApi';
import { projectApi } from '../api/projectApi';
import { workspaceApi } from '../api/workspaceApi';
import { Avatar } from '../components/common/Avatar';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  BarChart3,
  TrendingUp,
  CheckCircle2,
  Clock,
  Users,
  PieChart,
  Layers,
  AlertTriangle,
  FolderGit2
} from 'lucide-react';

export const Analytics = () => {
  const { currentWorkspace } = useWorkspace();
  const [analytics, setAnalytics] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      if (!currentWorkspace) return;
      try {
        setLoading(true);
        const [anaRes, taskRes, projRes, memRes] = await Promise.allSettled([
          analyticsApi.getWorkspaceAnalytics(currentWorkspace._id),
          taskApi.getTasksByWorkspace(currentWorkspace._id),
          projectApi.getProjectsByWorkspace(currentWorkspace._id),
          workspaceApi.getMembers(currentWorkspace._id),
        ]);

        if (anaRes.status === 'fulfilled') setAnalytics(anaRes.value?.analytics || anaRes.value || null);
        if (taskRes.status === 'fulfilled') setTasks(taskRes.value?.tasks || []);
        if (projRes.status === 'fulfilled') setProjects(projRes.value?.projects || []);
        if (memRes.status === 'fulfilled') setMembers(memRes.value?.members || []);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [currentWorkspace]);

  if (loading) {
    return (
      <div style={{ padding: '80px 0', textAlign: 'center' }}>
        <LoadingSpinner size="large" />
      </div>
    );
  }

  // Calculate metrics
  const totalTasks = tasks.length;
  const todoCount = tasks.filter((t) => (t.status || 'todo') === 'todo').length;
  const inProgressCount = tasks.filter((t) => t.status === 'in-progress').length;
  const inReviewCount = tasks.filter((t) => t.status === 'in-review').length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const completionRate = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  const lowPriority = tasks.filter((t) => (t.priority || 'low') === 'low').length;
  const mediumPriority = tasks.filter((t) => t.priority === 'medium').length;
  const highPriority = tasks.filter((t) => t.priority === 'high').length;
  const urgentPriority = tasks.filter((t) => t.priority === 'urgent').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <h1 className="page-title">Workspace Analytics & Reports</h1>
          <p className="page-subtitle">
            Performance metrics, workload distribution, and sprint velocity for {currentWorkspace?.name}
          </p>
        </div>
      </div>

      {/* Top Stat Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)' }}>
            <Layers size={18} />
          </div>
          <div>
            <div className="stat-label">Total Tasks</div>
            <div className="stat-value">{totalTasks}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#34d399' }}>
            <CheckCircle2 size={18} />
          </div>
          <div>
            <div className="stat-label">Completed</div>
            <div className="stat-value">{completedCount} ({completionRate}%)</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa' }}>
            <FolderGit2 size={18} />
          </div>
          <div>
            <div className="stat-label">Active Projects</div>
            <div className="stat-value">{projects.length}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#c084fc' }}>
            <Users size={18} />
          </div>
          <div>
            <div className="stat-label">Team Members</div>
            <div className="stat-value">{members.length}</div>
          </div>
        </div>
      </div>

      {/* Breakdown Section: Task Status & Priority */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Status Distribution */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={18} style={{ color: 'var(--primary)' }} /> Task Status Breakdown
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { label: 'To Do', count: todoCount, color: '#94a3b8' },
              { label: 'In Progress', count: inProgressCount, color: '#60a5fa' },
              { label: 'In Review', count: inReviewCount, color: '#c084fc' },
              { label: 'Completed', count: completedCount, color: '#34d399' },
            ].map((item) => {
              const pct = totalTasks > 0 ? Math.round((item.count / totalTasks) * 100) : 0;
              return (
                <div key={item.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: item.color }} />
                      <span>{item.label}</span>
                    </div>
                    <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                      {item.count} ({pct}%)
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-bar-fill" style={{ width: `${pct}%`, backgroundColor: item.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={18} style={{ color: '#f59e0b' }} /> Priority Distribution
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { label: 'Urgent', count: urgentPriority, color: '#ef4444' },
              { label: 'High', count: highPriority, color: '#f87171' },
              { label: 'Medium', count: mediumPriority, color: '#fbbf24' },
              { label: 'Low', count: lowPriority, color: '#34d399' },
            ].map((item) => {
              const pct = totalTasks > 0 ? Math.round((item.count / totalTasks) * 100) : 0;
              return (
                <div key={item.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: item.color }} />
                      <span>{item.label} Priority</span>
                    </div>
                    <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                      {item.count} ({pct}%)
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-bar-fill" style={{ width: `${pct}%`, backgroundColor: item.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Team Member Workload Allocation */}
      <div className="card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={18} style={{ color: '#38bdf8' }} /> Team Workload Distribution
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {members.map((m) => {
            const u = m.user || m;
            const userTasks = tasks.filter((t) => (t.assignee?._id || t.assignee) === u._id);
            const userCompleted = userTasks.filter((t) => t.status === 'completed').length;
            const userRate = userTasks.length > 0 ? Math.round((userCompleted / userTasks.length) * 100) : 0;

            return (
              <div
                key={u._id}
                style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Avatar name={u.name} size="medium" />
                  <div style={{ overflow: 'hidden' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {u.name}
                    </h4>
                    <span style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'capitalize' }}>
                      {m.role || 'Member'}
                    </span>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-dim)', marginBottom: '4px' }}>
                    <span>{userCompleted} of {userTasks.length} tasks completed</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{userRate}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-bar-fill" style={{ width: `${userRate}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
