import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { workspaceApi } from '../../api/workspaceApi';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useToast } from '../../context/ToastContext';
import { Briefcase, Layers } from 'lucide-react';

export const CreateWorkspaceModal = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const { refreshWorkspaces, setCurrentWorkspace } = useWorkspace();
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      addToast('Workspace name is required', 'error');
      return;
    }

    try {
      setLoading(true);
      const res = await workspaceApi.createWorkspace({ name: name.trim(), description: description.trim() });
      if (res && res.workspace) {
        addToast(`Workspace "${res.workspace.name}" created successfully!`, 'success');
        const list = await refreshWorkspaces();
        const created = list.find((w) => w._id === res.workspace._id);
        if (created) setCurrentWorkspace(created);
        setName('');
        setDescription('');
        onClose();
      }
    } catch (err) {
      addToast(err.message || 'Failed to create workspace', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Workspace"
      maxWidth="500px"
      footer={
        <>
          <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>
            Cancel
          </button>
          <button type="button" onClick={handleSubmit} className="btn-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create Workspace'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="form-label" htmlFor="ws-name">Workspace Name *</label>
          <div className="input-group">
            <span className="input-icon"><Briefcase size={16} /></span>
            <input
              id="ws-name"
              type="text"
              className="form-control"
              placeholder="e.g. Acme Corp Engineering"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>
        </div>

        <div>
          <label className="form-label" htmlFor="ws-desc">Description (Optional)</label>
          <textarea
            id="ws-desc"
            className="form-control"
            rows="3"
            placeholder="What is this workspace used for?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </form>
    </Modal>
  );
};
