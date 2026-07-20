import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { epicApi } from '../../api/epicApi';
import { projectApi } from '../../api/projectApi';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useToast } from '../../context/ToastContext';
import { Target, Calendar, Folder } from 'lucide-react';

export const CreateEpicModal = ({
  isOpen,
  onClose,
  defaultProjectId = '',
  onEpicCreated,
}) => {
  const { currentWorkspace } = useWorkspace();
  const { addToast } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState(defaultProjectId);
  const [status, setStatus] = useState('planned');
  const [startDate, setStartDate] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [color, setColor] = useState('#6366f1');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && currentWorkspace) {
      projectApi.getProjectsByWorkspace(currentWorkspace._id)
        .then((res) => {
          const list = res.projects || [];
          setProjects(list);
          if (!projectId && list.length > 0) {
            setProjectId(list[0]._id);
          }
        })
        .catch((err) => console.error('Failed to load projects:', err));
    }
  }, [isOpen, currentWorkspace]);

  useEffect(() => {
    if (defaultProjectId) setProjectId(defaultProjectId);
  }, [defaultProjectId]);

  const colorOptions = [
    '#6366f1', // Indigo
    '#8b5cf6', // Purple
    '#ec4899', // Pink
    '#3b82f6', // Blue
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#ef4444', // Red
    '#06b6d4', // Cyan
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      addToast('Epic title is required', 'error');
      return;
    }
    if (!projectId) {
      addToast('Please select a project for this epic', 'error');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        title: title.trim(),
        description: description.trim(),
        projectId,
        workspaceId: currentWorkspace._id,
        status,
        color,
        ...(startDate ? { startDate } : {}),
        ...(targetDate ? { targetDate } : {}),
      };

      const res = await epicApi.createEpic(payload);
      addToast(`Epic "${title}" created successfully!`, 'success');
      setTitle('');
      setDescription('');
      setStatus('planned');
      setStartDate('');
      setTargetDate('');
      onClose();
      if (onEpicCreated) onEpicCreated(res?.epic || res);
    } catch (err) {
      addToast(err.message || 'Failed to create epic', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Epic / Initiative"
      maxWidth="540px"
      footer={
        <>
          <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>
            Cancel
          </button>
          <button type="button" onClick={handleSubmit} className="btn-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create Epic'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <label className="form-label" htmlFor="epic-title">Epic Title *</label>
          <div className="input-group">
            <span className="input-icon"><Target size={16} /></span>
            <input
              id="epic-title"
              type="text"
              className="form-control"
              placeholder="e.g. Q3 Architecture Revamp & Billing Portal"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label className="form-label" htmlFor="epic-proj">Project *</label>
            <div className="input-group">
              <span className="input-icon"><Folder size={16} /></span>
              <select
                id="epic-proj"
                className="form-control"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                required
              >
                <option value="">Select Project</option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="form-label" htmlFor="epic-status">Status</label>
            <select
              id="epic-status"
              className="form-control"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="planned">Planned</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div>
          <label className="form-label" htmlFor="epic-desc">Epic Goals & Description</label>
          <textarea
            id="epic-desc"
            className="form-control"
            rows="3"
            placeholder="High-level objective, milestones, or customer impact..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <label className="form-label">Epic Theme Color</label>
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            {colorOptions.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: c,
                  border: color === c ? '2px solid #ffffff' : '2px solid transparent',
                  cursor: 'pointer',
                  transform: color === c ? 'scale(1.15)' : 'scale(1)',
                  transition: 'var(--transition-fast)',
                }}
              />
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label className="form-label" htmlFor="epic-start">Start Date</label>
            <input
              id="epic-start"
              type="date"
              className="form-control"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div>
            <label className="form-label" htmlFor="epic-target">Target Completion</label>
            <input
              id="epic-target"
              type="date"
              className="form-control"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
            />
          </div>
        </div>
      </form>
    </Modal>
  );
};
