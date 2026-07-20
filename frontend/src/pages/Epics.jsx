import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { useWorkspace } from '../context/WorkspaceContext';
import { projectApi } from '../api/projectApi';
import { epicApi } from '../api/epicApi';
import { taskApi } from '../api/taskApi';
import { useToast } from '../context/ToastContext';
import { StatusBadge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  Target,
  Plus,
  Calendar,
  Layers,
  CheckCircle2,
  Clock,
  FolderGit2,
  Trash2
} from 'lucide-react';

export const Epics = () => {
  const { currentWorkspace, isAdmin } = useWorkspace();
  const { openCreateEpic } = useOutletContext() || {};
  const { addToast } = useToast();

  const [epics, setEpics] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState('all');

  const loadData = async () => {
    if (!currentWorkspace) return;
    try {
      setLoading(true);
      const [projRes, taskRes] = await Promise.allSettled([
        projectApi.getProjectsByWorkspace(currentWorkspace._id),
        taskApi.getTasksByWorkspace(currentWorkspace._id),
      ]);

      const projectList = projRes.status === 'fulfilled' ? projRes.value?.projects || [] : [];
      setProjects(projectList);
      if (taskRes.status === 'fulfilled') setTasks(taskRes.value?.tasks || []);

      // Fetch epics for all projects
      const epicPromises = projectList.map((p) =>
        epicApi.getEpicsByProject(p._id).catch(() => ({ epics: [] }))
      );
      const epicResponses = await Promise.allSettled(epicPromises);

      const allEpics = [];
      epicResponses.forEach((res) => {
        if (res.status === 'fulfilled' && res.value?.epics) {
          allEpics.push(...res.value.epics);
        }
      });
      setEpics(allEpics);
    } catch (err) {
      addToast('Failed to load roadmap epics', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentWorkspace]);

  const handleDeleteEpic = async (id, title, e) => {
    e.stopPropagation();
    if (!window.confirm(`Delete epic "${title}"?`)) return;
    try {
      await epicApi.deleteEpic(id);
      addToast('Epic deleted', 'success');
      setEpics((prev) => prev.filter((ep) => ep._id !== id));
    } catch (err) {
      addToast(err.message || 'Failed to delete epic', 'error');
    }
  };

  const filteredEpics = epics.filter((ep) => {
    if (selectedProject === 'all') return true;
    return (ep.project?._id || ep.project) === selectedProject;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <h1 className="page-title">Epics & Roadmap</h1>
          <p className="page-subtitle">
            High-level initiatives, quarterly milestones, and agile roadmaps
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <select
            className="form-control"
            style={{ width: '160px', height: '32px', fontSize: '12.5px' }}
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
          >
            <option value="all">All Projects</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>

          <button onClick={openCreateEpic} className="btn-primary btn-sm">
            <Plus size={14} />
            <span>New Epic</span>
          </button>
        </div>
      </div>

      {/* Epics Grid */}
      {loading ? (
        <div style={{ padding: '80px 0', textAlign: 'center' }}>
          <LoadingSpinner size="large" />
        </div>
      ) : filteredEpics.length === 0 ? (
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
          <Target size={48} style={{ opacity: 0.3 }} />
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-main)' }}>No Epics Found</h3>
          <p style={{ fontSize: '13px', maxWidth: '380px' }}>
            Epics represent large bodies of work that can be broken down into smaller tasks.
          </p>
          <button onClick={openCreateEpic} className="btn-primary" style={{ marginTop: '8px' }}>
            <Plus size={16} /> Create Epic
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
          {filteredEpics.map((ep) => {
            const epicTasks = tasks.filter((t) => (t.epic?._id || t.epic) === ep._id);
            const doneEpicTasks = epicTasks.filter((t) => t.status === 'completed').length;
            const progress = epicTasks.length > 0 ? Math.round((doneEpicTasks / epicTasks.length) * 100) : 0;
            const projectName = ep.project?.name || projects.find((p) => p._id === ep.project)?.name || 'Project';

            return (
              <div
                key={ep._id}
                className="card hover-card"
                style={{
                  padding: '20px',
                  borderTop: `4px solid ${ep.color || 'var(--primary)'}`,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '16px',
                }}
              >
                <div>
                  {/* Top Bar: Project Name & Status */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <FolderGit2 size={13} /> {projectName}
                    </span>
                    <StatusBadge status={ep.status || 'planned'} />
                  </div>

                  {/* Title & Description */}
                  <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                    {ep.title}
                  </h3>
                  <p
                    style={{
                      fontSize: '13px',
                      color: 'var(--text-muted)',
                      lineHeight: 1.5,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {ep.description || 'No detailed roadmap description.'}
                  </p>
                </div>

                <div>
                  {/* Progress */}
                  <div style={{ marginBottom: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-dim)', marginBottom: '6px' }}>
                      <span>{doneEpicTasks} of {epicTasks.length} linked tasks completed</span>
                      <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{progress}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-bar-fill" style={{ width: `${progress}%`, backgroundColor: ep.color || 'var(--primary)' }} />
                    </div>
                  </div>

                  {/* Footer: Timeline dates & delete */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingTop: '12px',
                      borderTop: '1px solid var(--border-subtle)',
                      fontSize: '11px',
                      color: 'var(--text-dim)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={13} />
                      <span>
                        {ep.startDate ? new Date(ep.startDate).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Start'}
                        {' → '}
                        {ep.targetDate ? new Date(ep.targetDate).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Target'}
                      </span>
                    </div>

                    {isAdmin && (
                      <button
                        onClick={(e) => handleDeleteEpic(ep._id, ep.title, e)}
                        className="btn-ghost btn-icon"
                        style={{ padding: '4px', color: 'var(--text-dim)' }}
                        title="Delete Epic"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
