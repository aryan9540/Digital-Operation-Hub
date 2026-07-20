import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { taskApi } from '../../api/taskApi';
import { projectApi } from '../../api/projectApi';
import { epicApi } from '../../api/epicApi';
import { workspaceApi } from '../../api/workspaceApi';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useToast } from '../../context/ToastContext';
import { CheckSquare, Calendar, User, Tag, Layers, AlertTriangle } from 'lucide-react';

export const CreateTaskModal = ({
  isOpen,
  onClose,
  defaultProjectId = '',
  defaultStatus = 'todo',
  onTaskCreated,
}) => {
  const { currentWorkspace } = useWorkspace();
  const { addToast } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState(defaultProjectId);
  const [epicId, setEpicId] = useState('');
  const [status, setStatus] = useState(defaultStatus);
  const [priority, setPriority] = useState('medium');
  const [assigneeId, setAssigneeId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [storyPoints, setStoryPoints] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  const [projects, setProjects] = useState([]);
  const [epics, setEpics] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load projects & workspace members when modal opens
  useEffect(() => {
    if (isOpen && currentWorkspace) {
      // Fetch projects
      projectApi.getProjectsByWorkspace(currentWorkspace._id)
        .then((res) => {
          const list = res.projects || [];
          setProjects(list);
          if (!projectId && list.length > 0) {
            setProjectId(list[0]._id);
          }
        })
        .catch((err) => console.error('Failed to load projects:', err));

      // Fetch members
      workspaceApi.getMembers(currentWorkspace._id)
        .then((res) => {
          setMembers(res.members || []);
        })
        .catch((err) => console.error('Failed to load members:', err));
    }
  }, [isOpen, currentWorkspace]);

  // Load epics when projectId changes
  useEffect(() => {
    if (projectId) {
      epicApi.getEpicsByProject(projectId)
        .then((res) => {
          setEpics(res.epics || []);
        })
        .catch((err) => {
          console.error('Failed to load epics:', err);
          setEpics([]);
        });
    } else {
      setEpics([]);
    }
  }, [projectId]);

  useEffect(() => {
    if (defaultProjectId) setProjectId(defaultProjectId);
    if (defaultStatus) setStatus(defaultStatus);
  }, [defaultProjectId, defaultStatus]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      addToast('Task title is required', 'error');
      return;
    }

    if (!projectId) {
      addToast('Please select a project for this task', 'error');
      return;
    }

    try {
      setLoading(true);
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const payload = {
        title: title.trim(),
        description: description.trim(),
        projectId,
        workspaceId: currentWorkspace._id,
        status,
        priority,
        ...(epicId ? { epicId } : {}),
        ...(assigneeId ? { assignedTo: assigneeId } : {}),
        ...(dueDate ? { dueDate } : {}),
      };

      const res = await taskApi.createTask(payload);
      addToast('Task created successfully!', 'success');
      setTitle('');
      setDescription('');
      setEpicId('');
      setAssigneeId('');
      setDueDate('');
      setStoryPoints('');
      setTagsInput('');
      onClose();
      if (onTaskCreated) onTaskCreated(res?.task || res);
    } catch (err) {
      addToast(err.message || 'Failed to create task', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Task"
      maxWidth="620px"
      footer={
        <>
          <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>
            Cancel
          </button>
          <button type="button" onClick={handleSubmit} className="btn-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create Task'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <label className="form-label" htmlFor="task-title">Task Title *</label>
          <div className="input-group">
            <span className="input-icon"><CheckSquare size={16} /></span>
            <input
              id="task-title"
              type="text"
              className="form-control"
              placeholder="e.g. Implement OAuth2 Refresh Token Rotation"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label className="form-label" htmlFor="task-proj">Project *</label>
            <select
              id="task-proj"
              className="form-control"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              required
            >
              <option value="">Select Project</option>
              {projects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} ({p.key || 'PROJ'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label" htmlFor="task-epic">Epic (Optional)</label>
            <select
              id="task-epic"
              className="form-control"
              value={epicId}
              onChange={(e) => setEpicId(e.target.value)}
              disabled={!projectId || epics.length === 0}
            >
              <option value="">No Epic / Standalone</option>
              {epics.map((ep) => (
                <option key={ep._id} value={ep._id}>
                  {ep.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="form-label" htmlFor="task-desc">Description</label>
          <textarea
            id="task-desc"
            className="form-control"
            rows="3"
            placeholder="Detailed description, acceptance criteria, or reproduction steps..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
          <div>
            <label className="form-label" htmlFor="task-status">Status</label>
            <select
              id="task-status"
              className="form-control"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="in-review">In Review</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div>
            <label className="form-label" htmlFor="task-priority">Priority</label>
            <select
              id="task-priority"
              className="form-control"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label className="form-label" htmlFor="task-points">Story Points</label>
            <input
              id="task-points"
              type="number"
              min="0"
              max="100"
              className="form-control"
              placeholder="e.g. 5"
              value={storyPoints}
              onChange={(e) => setStoryPoints(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label className="form-label" htmlFor="task-assignee">Assignee</label>
            <div className="input-group">
              <span className="input-icon"><User size={16} /></span>
              <select
                id="task-assignee"
                className="form-control"
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
              >
                <option value="">Unassigned</option>
                {members.map((m) => {
                  const u = m.user || m;
                  return (
                    <option key={u._id} value={u._id}>
                      {u.name} ({u.email})
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div>
            <label className="form-label" htmlFor="task-due">Due Date</label>
            <div className="input-group">
              <span className="input-icon"><Calendar size={16} /></span>
              <input
                id="task-due"
                type="date"
                className="form-control"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div>
          <label className="form-label" htmlFor="task-tags">Tags (comma separated)</label>
          <div className="input-group">
            <span className="input-icon"><Tag size={16} /></span>
            <input
              id="task-tags"
              type="text"
              className="form-control"
              placeholder="frontend, auth, security, api"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
            />
          </div>
        </div>
      </form>
    </Modal>
  );
};
