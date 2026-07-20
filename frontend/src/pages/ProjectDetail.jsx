import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { projectApi } from '../api/projectApi';
import { taskApi } from '../api/taskApi';
import { epicApi } from '../api/epicApi';
import { useWorkspace } from '../context/WorkspaceContext';
import { useToast } from '../context/ToastContext';
import { StatusBadge, PriorityBadge } from '../components/common/Badge';
import { Avatar } from '../components/common/Avatar';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { TaskDetailModal } from '../components/modals/TaskDetailModal';
import { CreateTaskModal } from '../components/modals/CreateTaskModal';
import { CreateEpicModal } from '../components/modals/CreateEpicModal';
import {
  FolderGit2,
  ChevronLeft,
  Plus,
  Kanban,
  Target,
  BarChart2,
  Settings,
  Calendar,
  Clock,
  CheckCircle2,
  Trash2,
  Edit2,
  Layers
} from 'lucide-react';

export const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useWorkspace();
  const { addToast } = useToast();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [epics, setEpics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tasks'); // 'tasks' | 'epics' | 'timeline' | 'settings'

  // Modals
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isCreateEpicOpen, setIsCreateEpicOpen] = useState(false);

  // Settings form state
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editStatus, setEditStatus] = useState('planning');
  const [editKey, setEditKey] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);

  const loadProjectData = async () => {
    try {
      setLoading(true);
      const [projRes, taskRes, epicRes] = await Promise.allSettled([
        projectApi.getProjectById(id),
        taskApi.getTasksByProject(id),
        epicApi.getEpicsByProject(id),
      ]);

      if (projRes.status === 'fulfilled') {
        const p = projRes.value?.project || projRes.value;
        setProject(p);
        setEditName(p.name || '');
        setEditDesc(p.description || '');
        setEditStatus(p.status || 'planning');
        setEditKey(p.key || '');
      } else {
        addToast('Project not found', 'error');
        navigate('/projects');
        return;
      }

      if (taskRes.status === 'fulfilled') setTasks(taskRes.value?.tasks || []);
      if (epicRes.status === 'fulfilled') setEpics(epicRes.value?.epics || []);
    } catch (err) {
      addToast('Error loading project', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadProjectData();
  }, [id]);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      setSavingSettings(true);
      const res = await projectApi.updateProject(id, {
        name: editName,
        description: editDesc,
        status: editStatus,
        key: editKey,
      });
      setProject(res?.project || res);
      addToast('Project updated successfully', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to update project', 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!window.confirm(`Delete project "${project.name}" permanently?`)) return;
    try {
      await projectApi.deleteProject(id);
      addToast('Project deleted', 'success');
      navigate('/projects');
    } catch (err) {
      addToast(err.message || 'Failed to delete project', 'error');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '80px 0', textAlign: 'center' }}>
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!project) return null;

  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  const columns = [
    { key: 'todo', label: 'To Do', color: '#94a3b8' },
    { key: 'in-progress', label: 'In Progress', color: '#60a5fa' },
    { key: 'in-review', label: 'In Review', color: '#c084fc' },
    { key: 'completed', label: 'Completed', color: '#34d399' },
  ];

  const [dragOverCol, setDragOverCol] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDragOverCol(null);
  };

  const handleDragOver = (e, colKey) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverCol !== colKey) {
      setDragOverCol(colKey);
    }
  };

  const handleDragLeave = (e, colKey) => {
    if (e.currentTarget.contains(e.relatedTarget)) return;
    if (dragOverCol === colKey) {
      setDragOverCol(null);
    }
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    setDragOverCol(null);
    setIsDragging(false);
    const taskId = e.dataTransfer.getData('text/plain');
    if (!taskId) return;

    const taskToMove = tasks.find((t) => t._id === taskId);
    if (!taskToMove || taskToMove.status === targetStatus) return;

    const previousTasks = [...tasks];
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, status: targetStatus } : t))
    );

    try {
      await taskApi.updateTask(taskId, { status: targetStatus });
      addToast(`Task moved to ${columns.find((c) => c.key === targetStatus)?.label || targetStatus}`, 'success');
    } catch (err) {
      setTasks(previousTasks);
      addToast(err.message || 'Failed to move task', 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Back Link */}
      <div>
        <Link
          to="/projects"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '12.5px',
            color: 'var(--text-muted)',
            textDecoration: 'none',
          }}
        >
          <ChevronLeft size={14} /> Back to Projects
        </Link>
      </div>

      {/* Project Header */}
      <div
        className="card"
        style={{
          padding: '18px 22px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '14px',
        }}
      >
        <div style={{ maxWidth: '750px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: '11px',
                fontWeight: 700,
                padding: '2px 6px',
                borderRadius: 'var(--radius-xs)',
                background: 'var(--primary-subtle)',
                color: 'var(--primary)',
              }}
            >
              {project.key || 'PROJ'}
            </span>
            <h1 className="page-title" style={{ margin: 0 }}>
              {project.name}
            </h1>
            <StatusBadge status={project.status || 'planning'} />
          </div>

          {project.description && (
            <p className="page-subtitle" style={{ marginTop: '6px' }}>
              {project.description}
            </p>
          )}

          <div style={{ display: 'flex', gap: '16px', marginTop: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Calendar size={13} />
              <span>Target: {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Unscheduled'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <CheckCircle2 size={13} />
              <span>{completedTasks}/{tasks.length} Tasks ({progress}%)</span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setIsCreateTaskOpen(true)} className="btn-primary btn-sm">
            <Plus size={14} /> <span>New Task</span>
          </button>
          <button onClick={() => setIsCreateEpicOpen(true)} className="btn-secondary btn-sm">
            <Target size={14} /> <span>New Epic</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="tab-group">
        <button
          onClick={() => setActiveTab('tasks')}
          className={`tab-btn ${activeTab === 'tasks' ? 'active' : ''}`}
        >
          <Kanban size={14} /> <span>Tasks ({tasks.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('epics')}
          className={`tab-btn ${activeTab === 'epics' ? 'active' : ''}`}
        >
          <Target size={14} /> <span>Epics ({epics.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('timeline')}
          className={`tab-btn ${activeTab === 'timeline' ? 'active' : ''}`}
        >
          <BarChart2 size={14} /> <span>Metrics & Progress</span>
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
        >
          <Settings size={14} /> <span>Settings</span>
        </button>
      </div>

      {/* Tab 1: Tasks Board */}
      {activeTab === 'tasks' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px', alignItems: 'flex-start' }}>
          {columns.map((col) => {
            const colTasks = tasks.filter((t) => (t.status || 'todo') === col.key);

            return (
              <div
                key={col.key}
                onDragOver={(e) => handleDragOver(e, col.key)}
                onDragLeave={(e) => handleDragLeave(e, col.key)}
                onDrop={(e) => handleDrop(e, col.key)}
                className={`kanban-lane ${dragOverCol === col.key ? 'drag-over' : ''}`}
              >
                {/* Column Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2px 4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: col.color }} />
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>{col.label}</span>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', background: 'var(--bg-surface)', padding: '1px 6px', borderRadius: 'var(--radius-xs)' }}>
                    {colTasks.length}
                  </span>
                </div>

                {/* Task Cards in Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                  {colTasks.map((t) => (
                    <div
                      key={t._id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, t._id)}
                      onDragEnd={handleDragEnd}
                      onClick={() => setSelectedTaskId(t._id)}
                      className="kanban-card"
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--primary)', background: 'var(--primary-subtle)', padding: '1px 5px', borderRadius: 'var(--radius-xs)' }}>
                          {project.key}-{t.taskNumber || t._id?.slice(-4)}
                        </span>
                        <PriorityBadge priority={t.priority} />
                      </div>

                      <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.35, margin: '2px 0' }}>
                        {t.title}
                      </h4>

                      {t.epic && (
                        <span style={{ fontSize: '10.5px', color: '#c084fc', background: 'rgba(168, 85, 247, 0.1)', padding: '1px 5px', borderRadius: 'var(--radius-xs)', width: 'fit-content' }}>
                          {t.epic.title || 'Epic'}
                        </span>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px', paddingTop: '6px', borderTop: '1px solid var(--border-subtle)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>
                          {t.dueDate && (
                            <>
                              <Clock size={11} />
                              <span>{new Date(t.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                            </>
                          )}
                        </div>
                        <Avatar name={t.assignedTo?.name || t.assignee?.name || 'Unassigned'} size="small" />
                      </div>
                    </div>
                  ))}

                  {colTasks.length === 0 && (
                    <div style={{ padding: '28px 0', textAlign: 'center', color: 'var(--text-dim)', fontSize: '12px' }}>
                      Drop tasks here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Epics */}
      {activeTab === 'epics' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {epics.length === 0 ? (
            <div className="card" style={{ gridColumn: '1 / -1', padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Target size={40} style={{ opacity: 0.3, margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-main)' }}>No Epics Created</h3>
              <p style={{ fontSize: '13px', marginTop: '4px' }}>Break down this project into strategic epics and milestones.</p>
              <button onClick={() => setIsCreateEpicOpen(true)} className="btn-primary" style={{ marginTop: '16px', margin: '16px auto 0' }}>
                <Plus size={16} /> Create Epic
              </button>
            </div>
          ) : (
            epics.map((ep) => (
              <div
                key={ep._id}
                className="card"
                style={{
                  padding: '18px',
                  borderLeft: `4px solid ${ep.color || 'var(--primary)'}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)' }}>{ep.title}</h3>
                  <StatusBadge status={ep.status || 'planned'} />
                </div>

                <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  {ep.description || 'No description provided.'}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-dim)', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)' }}>
                  <span>Start: {ep.startDate ? new Date(ep.startDate).toLocaleDateString() : 'N/A'}</span>
                  <span>Target: {ep.targetDate ? new Date(ep.targetDate).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Timeline & Metrics */}
      {activeTab === 'timeline' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Project Health & Progress</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                  <span>Completion Rate</span>
                  <strong style={{ color: 'var(--primary)' }}>{progress}%</strong>
                </div>
                <div className="progress-bar">
                  <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '10px' }}>
                <div style={{ padding: '12px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
                  <p style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Total Tasks</p>
                  <h4 style={{ fontSize: '20px', fontWeight: 700, marginTop: '2px' }}>{tasks.length}</h4>
                </div>
                <div style={{ padding: '12px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
                  <p style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Epics</p>
                  <h4 style={{ fontSize: '20px', fontWeight: 700, marginTop: '2px' }}>{epics.length}</h4>
                </div>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Schedule & Deadlines</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Start Date</span>
                <span>{project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Not configured'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Target Completion</span>
                <span>{project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Not configured'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Created At</span>
                <span>{new Date(project.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Settings */}
      {activeTab === 'settings' && (
        <div className="card" style={{ maxWidth: '600px', padding: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Project Settings</h3>
          <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label className="form-label">Project Name</label>
              <input
                type="text"
                className="form-control"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label className="form-label">Project Key</label>
                <input
                  type="text"
                  className="form-control"
                  value={editKey}
                  onChange={(e) => setEditKey(e.target.value.toUpperCase())}
                  required
                />
              </div>

              <div>
                <label className="form-label">Status</label>
                <select
                  className="form-control"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                >
                  <option value="planning">Planning</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            <div>
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                rows="3"
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
              <button
                type="button"
                onClick={handleDeleteProject}
                className="btn-danger btn-ghost"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Trash2 size={15} /> Delete Project
              </button>

              <button type="submit" disabled={savingSettings} className="btn-primary">
                {savingSettings ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Task Detail Modal */}
      <TaskDetailModal
        isOpen={!!selectedTaskId}
        taskId={selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
        onTaskUpdated={loadProjectData}
        onTaskDeleted={loadProjectData}
      />

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateTaskOpen}
        defaultProjectId={id}
        onClose={() => setIsCreateTaskOpen(false)}
        onTaskCreated={loadProjectData}
      />

      {/* Create Epic Modal */}
      <CreateEpicModal
        isOpen={isCreateEpicOpen}
        defaultProjectId={id}
        onClose={() => setIsCreateEpicOpen(false)}
        onEpicCreated={loadProjectData}
      />
    </div>
  );
};
