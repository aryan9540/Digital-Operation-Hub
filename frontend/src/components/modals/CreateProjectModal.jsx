import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { projectApi } from '../../api/projectApi';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useToast } from '../../context/ToastContext';
import { FolderPlus, Calendar, Layers, Hash } from 'lucide-react';

export const CreateProjectModal = ({ isOpen, onClose, onProjectCreated }) => {
  const { currentWorkspace } = useWorkspace();
  const { addToast } = useToast();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [key, setKey] = useState('');
  const [status, setStatus] = useState('planning');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNameChange = (e) => {
    const val = e.target.value;
    setName(val);
    if (!key || key.length <= 4) {
      const generatedKey = val.replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase();
      setKey(generatedKey);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentWorkspace) {
      addToast('No active workspace selected', 'error');
      return;
    }

    if (!name.trim()) {
      addToast('Project name is required', 'error');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name: name.trim(),
        description: description.trim(),
        key: key.trim().toUpperCase() || name.substring(0, 3).toUpperCase(),
        workspaceId: currentWorkspace._id,
        status,
        ...(startDate ? { startDate } : {}),
        ...(endDate ? { endDate } : {}),
      };

      const res = await projectApi.createProject(payload);
      addToast(`Project "${name}" created successfully!`, 'success');
      setName('');
      setDescription('');
      setKey('');
      setStatus('planning');
      setStartDate('');
      setEndDate('');
      onClose();
      if (onProjectCreated) onProjectCreated(res?.project || res);
    } catch (err) {
      addToast(err.message || 'Failed to create project', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Project"
      maxWidth="560px"
      footer={
        <>
          <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>
            Cancel
          </button>
          <button type="button" onClick={handleSubmit} className="btn-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create Project'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label className="form-label" htmlFor="project-name">Project Name *</label>
          <div className="input-group">
            <span className="input-icon"><FolderPlus size={16} /></span>
            <input
              id="project-name"
              type="text"
              className="form-control"
              placeholder="e.g. NextGen Web App 2.0"
              value={name}
              onChange={handleNameChange}
              required
              autoFocus
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label className="form-label" htmlFor="project-key">Project Key (Prefix)</label>
            <div className="input-group">
              <span className="input-icon"><Hash size={16} /></span>
              <input
                id="project-key"
                type="text"
                className="form-control"
                placeholder="e.g. WEB"
                maxLength={6}
                value={key}
                onChange={(e) => setKey(e.target.value.toUpperCase())}
              />
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px', display: 'block' }}>
              Used as prefix for tasks (e.g. WEB-101)
            </span>
          </div>

          <div>
            <label className="form-label" htmlFor="project-status">Initial Status</label>
            <select
              id="project-status"
              className="form-control"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="planning">Planning</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        <div>
          <label className="form-label" htmlFor="project-desc">Description</label>
          <textarea
            id="project-desc"
            className="form-control"
            rows="3"
            placeholder="Brief details about the project goals and roadmap..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label className="form-label" htmlFor="project-start">Start Date</label>
            <input
              id="project-start"
              type="date"
              className="form-control"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div>
            <label className="form-label" htmlFor="project-end">Target Due Date</label>
            <input
              id="project-end"
              type="date"
              className="form-control"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
      </form>
    </Modal>
  );
};
