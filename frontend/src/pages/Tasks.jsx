import React, { useState, useEffect } from 'react';
import { useOutletContext, useLocation } from 'react-router-dom';
import { useWorkspace } from '../context/WorkspaceContext';
import { taskApi } from '../api/taskApi';
import { projectApi } from '../api/projectApi';
import { workspaceApi } from '../api/workspaceApi';
import { useToast } from '../context/ToastContext';
import { StatusBadge, PriorityBadge } from '../components/common/Badge';
import { Avatar } from '../components/common/Avatar';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { TaskDetailModal } from '../components/modals/TaskDetailModal';
import {
  Kanban,
  List,
  Plus,
  Search,
  Filter,
  CheckSquare,
  Clock,
  User,
  FolderGit2,
  Calendar,
  Layers,
  ArrowUpDown
} from 'lucide-react';

export const Tasks = () => {
  const { currentWorkspace } = useWorkspace();
  const { openCreateTask } = useOutletContext() || {};
  const { addToast } = useToast();
  const location = useLocation();

  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // View & Filters
  const [viewMode, setViewMode] = useState('board'); // 'board' | 'list'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedAssignee, setSelectedAssignee] = useState('all');
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  // Check URL query search
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const search = params.get('search');
    if (search) setSearchQuery(search);
  }, [location.search]);

  const loadAllData = async () => {
    if (!currentWorkspace) return;
    try {
      setLoading(true);
      const [taskRes, projRes, memRes] = await Promise.allSettled([
        taskApi.getTasksByWorkspace(currentWorkspace._id),
        projectApi.getProjectsByWorkspace(currentWorkspace._id),
        workspaceApi.getMembers(currentWorkspace._id),
      ]);

      if (taskRes.status === 'fulfilled') setTasks(taskRes.value?.tasks || []);
      if (projRes.status === 'fulfilled') setProjects(projRes.value?.projects || []);
      if (memRes.status === 'fulfilled') setMembers(memRes.value?.members || []);
    } catch (err) {
      addToast('Failed to load tasks', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [currentWorkspace]);

  const handleQuickStatusChange = async (taskId, newStatus, e) => {
    e.stopPropagation();
    try {
      await taskApi.updateTask(taskId, { status: newStatus });
      setTasks((prev) => prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t)));
      addToast('Status updated', 'success');
    } catch (err) {
      addToast('Failed to update status', 'error');
    }
  };

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesProject =
      selectedProject === 'all' || (t.project?._id || t.project) === selectedProject;

    const matchesPriority = selectedPriority === 'all' || t.priority === selectedPriority;

    const matchesAssignee =
      selectedAssignee === 'all' || (t.assignee?._id || t.assignee) === selectedAssignee;

    return matchesSearch && matchesProject && matchesPriority && matchesAssignee;
  });

  const [dragOverCol, setDragOverCol] = useState(null);

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
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

  const columns = [
    { key: 'todo', label: 'To Do', color: '#94a3b8' },
    { key: 'in-progress', label: 'In Progress', color: '#60a5fa' },
    { key: 'in-review', label: 'In Review', color: '#c084fc' },
    { key: 'completed', label: 'Completed', color: '#34d399' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '1600px', margin: '0 auto' }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <h1 className="page-title">Tasks & Workflow</h1>
          <p className="page-subtitle">Interactive board and task management for {currentWorkspace?.name}</p>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* View Toggle */}
          <div style={{ display: 'flex', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', padding: '2px', border: '1px solid var(--border-main)' }}>
            <button
              onClick={() => setViewMode('board')}
              className={viewMode === 'board' ? 'btn-primary btn-sm' : 'btn-ghost btn-sm'}
            >
              <Kanban size={13} /> <span>Board</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'btn-primary btn-sm' : 'btn-ghost btn-sm'}
            >
              <List size={13} /> <span>List</span>
            </button>
          </div>

          <button onClick={openCreateTask} className="btn-primary btn-sm">
            <Plus size={14} /> <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Toolbar / Filters */}
      <div
        className="card"
        style={{
          padding: '10px 14px',
          display: 'flex',
          gap: '10px',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        {/* Search */}
        <div style={{ minWidth: '200px', flex: 1, position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-control"
            placeholder="Filter tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '30px', height: '32px', fontSize: '12.5px' }}
          />
        </div>

        {/* Project Filter */}
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

        {/* Priority Filter */}
        <select
          className="form-control"
          style={{ width: '140px', height: '32px', fontSize: '12.5px' }}
          value={selectedPriority}
          onChange={(e) => setSelectedPriority(e.target.value)}
        >
          <option value="all">All Priorities</option>
          <option value="low">Low Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="high">High Priority</option>
          <option value="urgent">Urgent</option>
        </select>

        {/* Assignee Filter */}
        <select
          className="form-control"
          style={{ width: '150px', height: '32px', fontSize: '12.5px' }}
          value={selectedAssignee}
          onChange={(e) => setSelectedAssignee(e.target.value)}
        >
          <option value="all">All Assignees</option>
          {members.map((m) => {
            const u = m.user || m;
            return (
              <option key={u._id} value={u._id}>
                {u.name}
              </option>
            );
          })}
        </select>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div style={{ padding: '60px 0', textAlign: 'center' }}>
          <LoadingSpinner size="large" />
        </div>
      ) : viewMode === 'board' ? (
        /* Kanban Board View */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(260px, 1fr))', gap: '12px', overflowX: 'auto', paddingBottom: '16px' }}>
          {columns.map((col) => {
            const colTasks = filteredTasks.filter((t) => (t.status || 'todo') === col.key);

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
                  {colTasks.map((t) => {
                    const projectObj = t.project || {};
                    return (
                      <div
                        key={t._id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, t._id)}
                        onDragEnd={handleDragEnd}
                        onClick={() => setSelectedTaskId(t._id)}
                        className="kanban-card"
                      >
                        {/* Top: Project Key & Priority */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span
                            style={{
                              fontSize: '11px',
                              fontFamily: 'monospace',
                              fontWeight: 600,
                              color: 'var(--primary)',
                              background: 'var(--primary-subtle)',
                              padding: '1px 5px',
                              borderRadius: 'var(--radius-xs)',
                            }}
                          >
                            {projectObj.key ? `${projectObj.key}-${t.taskNumber || t._id?.slice(-4)}` : 'TASK'}
                          </span>
                          <PriorityBadge priority={t.priority} />
                        </div>

                        {/* Title */}
                        <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.35, margin: '2px 0' }}>
                          {t.title}
                        </h4>

                        {/* Epic badge if attached */}
                        {t.epic && (
                          <span style={{ fontSize: '10.5px', color: '#c084fc', background: 'rgba(168, 85, 247, 0.1)', padding: '1px 5px', borderRadius: 'var(--radius-xs)', width: 'fit-content' }}>
                            {t.epic.title || 'Epic'}
                          </span>
                        )}

                        {/* Footer: Date & Assignee */}
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginTop: '2px',
                            paddingTop: '6px',
                            borderTop: '1px solid var(--border-subtle)',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>
                            {t.dueDate ? (
                              <>
                                <Clock size={11} />
                                <span>{new Date(t.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                              </>
                            ) : (
                              <span>No date</span>
                            )}
                          </div>

                          <Avatar name={t.assignedTo?.name || t.assignee?.name || 'Unassigned'} size="small" />
                        </div>
                      </div>
                    );
                  })}

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
      ) : (
        /* Table / List View */
        <div className="table-container">
          <table className="saas-table">
            <thead>
              <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-dim)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '12px 16px' }}>Task</th>
                <th style={{ padding: '12px 16px' }}>Project</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px' }}>Priority</th>
                <th style={{ padding: '12px 16px' }}>Assignee</th>
                <th style={{ padding: '12px 16px' }}>Due Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No tasks match your criteria.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((t) => (
                  <tr
                    key={t._id}
                    onClick={() => setSelectedTaskId(t._id)}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      transition: 'var(--transition-fast)',
                    }}
                    className="table-row-hover"
                  >
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-main)' }}>
                      {t.title}
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                      {t.project?.name || '—'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <StatusBadge status={t.status} />
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <PriorityBadge priority={t.priority} />
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Avatar name={t.assignee?.name || 'Unassigned'} size="small" />
                        <span>{t.assignee?.name || 'Unassigned'}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-dim)' }}>
                      {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Task Detail Modal */}
      <TaskDetailModal
        isOpen={!!selectedTaskId}
        taskId={selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
        onTaskUpdated={loadAllData}
        onTaskDeleted={loadAllData}
      />
    </div>
  );
};
