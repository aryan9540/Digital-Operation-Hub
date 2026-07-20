import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Avatar } from '../common/Avatar';
import { StatusBadge, PriorityBadge } from '../common/Badge';
import { taskApi } from '../../api/taskApi';
import { commentApi } from '../../api/commentApi';
import { workspaceApi } from '../../api/workspaceApi';
import { useAuth } from '../../context/AuthContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useToast } from '../../context/ToastContext';
import {
  CheckSquare,
  Calendar,
  User,
  Tag,
  MessageSquare,
  Send,
  Trash2,
  Edit2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Hash,
  X,
  Plus
} from 'lucide-react';

export const TaskDetailModal = ({
  isOpen,
  onClose,
  taskId,
  onTaskUpdated,
  onTaskDeleted,
}) => {
  const { user } = useAuth();
  const { currentWorkspace } = useWorkspace();
  const { addToast } = useToast();

  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);
  const [members, setMembers] = useState([]);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleEdit, setTitleEdit] = useState('');
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [descEdit, setDescEdit] = useState('');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  // Load Task & comments
  const loadTaskData = async () => {
    if (!taskId) return;
    try {
      setLoading(true);
      const res = await taskApi.getTaskById(taskId);
      const t = res.task || res;
      setTask(t);
      setTitleEdit(t.title || '');
      setDescEdit(t.description || '');

      // Load comments
      const commRes = await commentApi.getTaskComments(taskId).catch(() => ({ comments: [] }));
      setComments(commRes.comments || []);
    } catch (err) {
      console.error('Failed to load task details:', err);
      addToast(err.message || 'Failed to load task', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && taskId) {
      loadTaskData();
      if (currentWorkspace) {
        workspaceApi.getMembers(currentWorkspace._id)
          .then((res) => setMembers(res.members || []))
          .catch((err) => console.error(err));
      }
    } else {
      setTask(null);
      setComments([]);
      setIsEditingTitle(false);
      setIsEditingDesc(false);
    }
  }, [isOpen, taskId, currentWorkspace]);

  const handleUpdateField = async (updates) => {
    try {
      const res = await taskApi.updateTask(task._id, updates);
      const updated = res.task || { ...task, ...updates };
      setTask(updated);
      if (onTaskUpdated) onTaskUpdated(updated);
      addToast('Task updated', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to update task', 'error');
    }
  };

  const handleSaveTitle = async () => {
    if (!titleEdit.trim()) return;
    await handleUpdateField({ title: titleEdit.trim() });
    setIsEditingTitle(false);
  };

  const handleSaveDesc = async () => {
    await handleUpdateField({ description: descEdit.trim() });
    setIsEditingDesc(false);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || commentLoading) return;

    try {
      setCommentLoading(true);
      const res = await commentApi.createComment(task._id, commentText.trim());
      setComments((prev) => [...prev, res.comment || res]);
      setCommentText('');
      addToast('Comment posted', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to add comment', 'error');
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await commentApi.deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      addToast('Comment deleted', 'success');
    } catch (err) {
      addToast('Failed to delete comment', 'error');
    }
  };

  const handleDeleteTask = async () => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await taskApi.deleteTask(task._id);
      addToast('Task deleted successfully', 'success');
      onClose();
      if (onTaskDeleted) onTaskDeleted(task._id);
    } catch (err) {
      addToast(err.message || 'Failed to delete task', 'error');
    }
  };

  const handleToggleSubtask = async (index) => {
    if (!task.subtasks) return;
    const newSubtasks = [...task.subtasks];
    newSubtasks[index].completed = !newSubtasks[index].completed;
    await handleUpdateField({ subtasks: newSubtasks });
  };

  const handleAddSubtask = async (e) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    const newSubtasks = [...(task.subtasks || []), { title: newSubtaskTitle.trim(), completed: false }];
    await handleUpdateField({ subtasks: newSubtasks });
    setNewSubtaskTitle('');
  };

  const handleDeleteSubtask = async (index) => {
    const newSubtasks = task.subtasks.filter((_, i) => i !== index);
    await handleUpdateField({ subtasks: newSubtasks });
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: 'var(--text-dim)', fontSize: '13px', fontFamily: 'monospace' }}>
            {task?.project?.key ? `${task.project.key}-${task.taskNumber || task._id?.slice(-4)}` : 'TASK'}
          </span>
          <span style={{ color: 'var(--border-main)' }}>•</span>
          <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            {task?.project?.name || 'Workspace Task'}
          </span>
        </div>
      }
      maxWidth="860px"
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <button
            type="button"
            onClick={handleDeleteTask}
            className="btn-danger btn-ghost"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Trash2 size={15} />
            <span>Delete Task</span>
          </button>
          <button type="button" onClick={onClose} className="btn-secondary">
            Close
          </button>
        </div>
      }
    >
      {loading || !task ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <div className="spinner" style={{ margin: '0 auto 16px' }} />
          Loading task details...
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '24px' }}>
          {/* Left Column: Title, Description, Subtasks, Comments */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Title Section */}
            <div>
              {isEditingTitle ? (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="text"
                    className="form-control"
                    value={titleEdit}
                    onChange={(e) => setTitleEdit(e.target.value)}
                    autoFocus
                  />
                  <button onClick={handleSaveTitle} className="btn-primary" style={{ padding: '6px 12px' }}>
                    Save
                  </button>
                  <button onClick={() => setIsEditingTitle(false)} className="btn-secondary" style={{ padding: '6px 10px' }}>
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => setIsEditingTitle(true)}
                  style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    color: 'var(--text-main)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '4px 6px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid transparent',
                  }}
                  className="hover-editable"
                >
                  <span>{task.title}</span>
                  <Edit2 size={14} style={{ color: 'var(--text-dim)', opacity: 0.6 }} />
                </div>
              )}
            </div>

            {/* Description Section */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Description</label>
                {!isEditingDesc && (
                  <button
                    onClick={() => setIsEditingDesc(true)}
                    className="btn-ghost"
                    style={{ fontSize: '11px', padding: '2px 6px', color: 'var(--text-dim)' }}
                  >
                    Edit
                  </button>
                )}
              </div>

              {isEditingDesc ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <textarea
                    className="form-control"
                    rows="4"
                    value={descEdit}
                    onChange={(e) => setDescEdit(e.target.value)}
                    placeholder="Add more detailed context..."
                    autoFocus
                  />
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button onClick={() => setIsEditingDesc(false)} className="btn-secondary" style={{ padding: '4px 10px', fontSize: '12px' }}>
                      Cancel
                    </button>
                    <button onClick={handleSaveDesc} className="btn-primary" style={{ padding: '4px 12px', fontSize: '12px' }}>
                      Save Description
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => setIsEditingDesc(true)}
                  style={{
                    padding: '10px 12px',
                    background: 'var(--bg-input)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '13px',
                    color: task.description ? 'var(--text-secondary)' : 'var(--text-dim)',
                    minHeight: '60px',
                    cursor: 'pointer',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {task.description || 'Click to add a description or acceptance criteria...'}
                </div>
              )}
            </div>

            {/* Subtasks / Checklist */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>
                  Subtasks & Checklist {task.subtasks?.length ? `(${task.subtasks.filter(s => s.completed).length}/${task.subtasks.length})` : ''}
                </label>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '8px' }}>
                {task.subtasks?.map((subtask, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px 10px',
                      background: 'var(--bg-surface)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={subtask.completed}
                      onChange={() => handleToggleSubtask(idx)}
                      style={{ cursor: 'pointer', accentColor: 'var(--primary)' }}
                    />
                    <span
                      style={{
                        flex: 1,
                        fontSize: '13px',
                        textDecoration: subtask.completed ? 'line-through' : 'none',
                        color: subtask.completed ? 'var(--text-dim)' : 'var(--text-main)',
                      }}
                    >
                      {subtask.title}
                    </span>
                    <button
                      onClick={() => handleDeleteSubtask(idx)}
                      className="btn-ghost"
                      style={{ padding: '2px', color: 'var(--text-dim)' }}
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddSubtask} style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  className="form-control"
                  style={{ fontSize: '12px', padding: '6px 10px' }}
                  placeholder="Add a checklist item..."
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                />
                <button type="submit" className="btn-secondary" style={{ padding: '6px 10px', fontSize: '12px', flexShrink: 0 }}>
                  <Plus size={14} /> Add
                </button>
              </form>
            </div>

            {/* Comments Stream */}
            <div>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MessageSquare size={15} /> Comments ({comments.length})
              </label>

              {/* Add Comment Input */}
              <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <Avatar name={user?.name} size="medium" />
                <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Write a comment or mention @team..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                  />
                  <button
                    type="submit"
                    disabled={!commentText.trim() || commentLoading}
                    className="btn-primary"
                    style={{ padding: '8px 14px', flexShrink: 0 }}
                  >
                    <Send size={14} />
                  </button>
                </div>
              </form>

              {/* Comments List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '240px', overflowY: 'auto' }}>
                {comments.length === 0 ? (
                  <p style={{ fontSize: '12px', color: 'var(--text-dim)', textAlign: 'center', padding: '12px 0' }}>
                    No comments yet. Be the first to start the discussion!
                  </p>
                ) : (
                  comments.map((c) => {
                    const author = c.author || c.user || {};
                    const isSelf = author._id === user?._id;
                    return (
                      <div
                        key={c._id}
                        style={{
                          display: 'flex',
                          gap: '10px',
                          padding: '10px 12px',
                          borderRadius: 'var(--radius-md)',
                          background: 'var(--bg-elevated)',
                          border: '1px solid var(--border-subtle)',
                        }}
                      >
                        <Avatar name={author.name || 'User'} size="small" />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)' }}>
                              {author.name || 'User'}
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                                {new Date(c.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {isSelf && (
                                <button
                                  onClick={() => handleDeleteComment(c._id)}
                                  className="btn-ghost"
                                  style={{ padding: '2px', color: 'var(--text-dim)' }}
                                  title="Delete comment"
                                >
                                  <Trash2 size={12} />
                                </button>
                              )}
                            </div>
                          </div>
                          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', whiteSpace: 'pre-wrap' }}>
                            {c.text || c.content}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Metadata Properties Panel */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              padding: '16px',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-main)',
              height: 'fit-content',
            }}
          >
            <h4 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-dim)' }}>
              Properties
            </h4>

            {/* Status */}
            <div>
              <label className="form-label" style={{ fontSize: '12px' }}>Status</label>
              <select
                className="form-control"
                style={{ fontSize: '13px', padding: '6px 10px' }}
                value={task.status}
                onChange={(e) => handleUpdateField({ status: e.target.value })}
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="in-review">In Review</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="form-label" style={{ fontSize: '12px' }}>Priority</label>
              <select
                className="form-control"
                style={{ fontSize: '13px', padding: '6px 10px' }}
                value={task.priority}
                onChange={(e) => handleUpdateField({ priority: e.target.value })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            {/* Assignee */}
            <div>
              <label className="form-label" style={{ fontSize: '12px' }}>Assignee</label>
              <select
                className="form-control"
                style={{ fontSize: '13px', padding: '6px 10px' }}
                value={task.assignee?._id || task.assignee || ''}
                onChange={(e) => handleUpdateField({ assignee: e.target.value || null })}
              >
                <option value="">Unassigned</option>
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

            {/* Story Points */}
            <div>
              <label className="form-label" style={{ fontSize: '12px' }}>Story Points / Estimate</label>
              <input
                type="number"
                min="0"
                max="100"
                className="form-control"
                style={{ fontSize: '13px', padding: '6px 10px' }}
                value={task.storyPoints ?? ''}
                placeholder="None"
                onChange={(e) => handleUpdateField({ storyPoints: e.target.value ? Number(e.target.value) : 0 })}
              />
            </div>

            {/* Due Date */}
            <div>
              <label className="form-label" style={{ fontSize: '12px' }}>Due Date</label>
              <input
                type="date"
                className="form-control"
                style={{ fontSize: '13px', padding: '6px 10px' }}
                value={task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''}
                onChange={(e) => handleUpdateField({ dueDate: e.target.value || null })}
              />
            </div>

            {/* Epic */}
            {task.epic && (
              <div>
                <label className="form-label" style={{ fontSize: '12px' }}>Epic</label>
                <div
                  style={{
                    fontSize: '12px',
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(139, 92, 246, 0.12)',
                    color: '#c084fc',
                    border: '1px solid rgba(139, 92, 246, 0.25)',
                    fontWeight: 500,
                  }}
                >
                  {task.epic.title || 'Connected Epic'}
                </div>
              </div>
            )}

            {/* Tags */}
            {task.tags && task.tags.length > 0 && (
              <div>
                <label className="form-label" style={{ fontSize: '12px' }}>Tags</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {task.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="badge"
                      style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', fontSize: '11px' }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
};
