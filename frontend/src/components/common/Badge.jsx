import React from 'react';

export const StatusBadge = ({ status }) => {
  const normalized = (status || 'todo').toLowerCase().replace(' ', '-');

  const formatText = (text) => {
    switch (text) {
      case 'in-progress':
        return 'In Progress';
      case 'todo':
        return 'To Do';
      case 'completed':
        return 'Completed';
      case 'planning':
        return 'Planning';
      case 'active':
        return 'Active';
      case 'archived':
        return 'Archived';
      case 'planned':
        return 'Planned';
      default:
        return text;
    }
  };

  return (
    <span className={`badge badge-${normalized}`}>
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: 'currentColor',
        }}
      />
      {formatText(normalized)}
    </span>
  );
};

export const PriorityBadge = ({ priority }) => {
  const normalized = (priority || 'medium').toLowerCase();

  return (
    <span className={`badge badge-priority-${normalized}`}>
      {normalized.charAt(0).toUpperCase() + normalized.slice(1)} Priority
    </span>
  );
};

export const RoleBadge = ({ role }) => {
  const normalized = (role || 'member').toLowerCase();

  return (
    <span className={`badge badge-${normalized}`}>
      {normalized.toUpperCase()}
    </span>
  );
};
