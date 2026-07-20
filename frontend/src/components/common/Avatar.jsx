import React from 'react';

export const Avatar = ({ name = 'User', src = '', size = 'medium', className = '' }) => {
  const sizeMap = {
    small: { dim: 26, fontSize: 11 },
    medium: { dim: 34, fontSize: 13 },
    large: { dim: 48, fontSize: 17 },
    xlarge: { dim: 64, fontSize: 22 },
  };

  const currentSize = sizeMap[size] || sizeMap.medium;

  const getInitials = (n) => {
    if (!n) return 'U';
    const parts = n.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return n.substring(0, 2).toUpperCase();
  };

  const getGradient = (str) => {
    const gradients = [
      'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
      'linear-gradient(135deg, #3b82f6 0%, #2dd4bf 100%)',
      'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
      'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
      'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    ];
    let hash = 0;
    for (let i = 0; i < (str || '').length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % gradients.length;
    return gradients[index];
  };

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={className}
        style={{
          width: `${currentSize.dim}px`,
          height: `${currentSize.dim}px`,
          borderRadius: '50%',
          objectFit: 'cover',
          border: '1px solid var(--border-main)',
          flexShrink: 0,
        }}
        onError={(e) => {
          e.target.style.display = 'none';
        }}
      />
    );
  }

  return (
    <div
      className={className}
      style={{
        width: `${currentSize.dim}px`,
        height: `${currentSize.dim}px`,
        borderRadius: '50%',
        background: getGradient(name),
        color: '#ffffff',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: `${currentSize.fontSize}px`,
        fontWeight: 700,
        letterSpacing: '0.02em',
        flexShrink: 0,
        border: '1px solid rgba(255, 255, 255, 0.15)',
        userSelect: 'none',
      }}
      title={name}
    >
      {getInitials(name)}
    </div>
  );
};
