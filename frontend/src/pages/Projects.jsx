import React, { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { useWorkspace } from '../context/WorkspaceContext';
import { projectApi } from '../api/projectApi';
import { taskApi } from '../api/taskApi';
import { useToast } from '../context/ToastContext';
import { StatusBadge } from '../components/common/Badge';
import { Avatar } from '../components/common/Avatar';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  FolderGit2,
  Plus,
  Search,
  Calendar,
  Layers,
  Trash2,
  Filter,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react';

export const Projects = () => {
  const { currentWorkspace, isAdmin } = useWorkspace();
  const { openCreateProject } = useOutletContext() || {};
  const { addToast } = useToast();

  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadProjects = async () => {
    if (!currentWorkspace) return;
    try {
      setLoading(true);
      const [projRes, taskRes] = await Promise.allSettled([
        projectApi.getProjectsByWorkspace(currentWorkspace._id),
        taskApi.getTasksByWorkspace(currentWorkspace._id),
      ]);

      if (projRes.status === 'fulfilled') setProjects(projRes.value?.projects || []);
      if (taskRes.status === 'fulfilled') setTasks(taskRes.value?.tasks || []);
    } catch (err) {
      addToast('Failed to load projects', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [currentWorkspace]);

  const handleDeleteProject = async (id, name, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete project "${name}"? This cannot be undone.`)) return;

    try {
      await projectApi.deleteProject(id);
      addToast(`Project "${name}" deleted`, 'success');
      setProjects((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      addToast(err.message || 'Failed to delete project', 'error');
    }
  };

  // Filter projects
  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.key?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">Manage sprints, epics, and milestones across your workspace</p>
        </div>

        <button onClick={openCreateProject} className="btn-primary btn-sm">
          <Plus size={14} />
          <span>New Project</span>
        </button>
      </div>

      {/* Filters & Search Toolbar */}
      <div
        className="card"
        style={{
          padding: '10px 14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        {/* Search */}
        <div style={{ width: '100%', maxWidth: '320px', position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-control"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '30px', height: '32px', fontSize: '12.5px' }}
          />
        </div>

        {/* Status Filter Buttons */}
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {['all', 'planning', 'active', 'completed', 'archived'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={statusFilter === st ? 'btn-primary btn-sm' : 'btn-ghost btn-sm'}
              style={{
                textTransform: 'capitalize',
                fontSize: '12px',
              }}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div style={{ padding: '80px 0', textAlign: 'center' }}>
          <LoadingSpinner size="large" />
        </div>
      ) : filteredProjects.length === 0 ? (
        <div
          className="card"
          style={{
            padding: '60px 20px',
            textAlign: 'center',
            color: 'var(--text-muted)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <FolderGit2 size={48} style={{ opacity: 0.3 }} />
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-main)' }}>No projects found</h3>
          <p style={{ fontSize: '13px', maxWidth: '360px' }}>
            {searchQuery || statusFilter !== 'all'
              ? 'Try adjusting your search or filter parameters.'
              : 'Create your first project to organize tasks and start collaborating.'}
          </p>
          <button onClick={openCreateProject} className="btn-primary" style={{ marginTop: '8px' }}>
            <Plus size={16} />
            <span>Create Project</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
          {filteredProjects.map((p) => {
            const projTasks = tasks.filter((t) => (t.project?._id || t.project) === p._id);
            const doneTasks = projTasks.filter((t) => t.status === 'completed').length;
            const progress = projTasks.length > 0 ? Math.round((doneTasks / projTasks.length) * 100) : 0;

            return (
              <Link
                key={p._id}
                to={`/projects/${p._id}`}
                className="card hover-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '20px',
                  textDecoration: 'none',
                  border: '1px solid var(--border-main)',
                  position: 'relative',
                }}
              >
                <div>
                  {/* Top Bar: Key & Status */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'rgba(99, 102, 241, 0.12)',
                        color: 'var(--primary)',
                      }}
                    >
                      {p.key || 'PROJ'}
                    </span>
                    <StatusBadge status={p.status || 'planning'} />
                  </div>

                  {/* Title & Description */}
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                    {p.name}
                  </h3>
                  <p
                    style={{
                      fontSize: '13px',
                      color: 'var(--text-muted)',
                      lineHeight: 1.5,
                      marginBottom: '16px',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      minHeight: '38px',
                    }}
                  >
                    {p.description || 'No description provided.'}
                  </p>
                </div>

                <div>
                  {/* Progress Indicator */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-dim)', marginBottom: '6px' }}>
                      <span>Progress</span>
                      <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{progress}% ({doneTasks}/{projTasks.length})</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                    </div>
                  </div>

                  {/* Footer: Dates & Actions */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingTop: '12px',
                      borderTop: '1px solid var(--border-subtle)',
                      fontSize: '12px',
                      color: 'var(--text-dim)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={13} />
                      <span>{p.endDate ? new Date(p.endDate).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'No due date'}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {isAdmin && (
                        <button
                          onClick={(e) => handleDeleteProject(p._id, p.name, e)}
                          className="btn-ghost btn-icon"
                          style={{ padding: '4px', color: 'var(--text-dim)' }}
                          title="Delete Project"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary)', fontWeight: 600, fontSize: '12px' }}>
                        View <ArrowRight size={13} />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};
