import React from 'react';

export const LoadingSpinner = ({ size = 'medium', message = 'Loading...', fullPage = false }) => {
  const sizeMap = {
    small: '16px',
    medium: '28px',
    large: '44px',
  };

  const spinnerStyle = {
    width: sizeMap[size] || sizeMap.medium,
    height: sizeMap[size] || sizeMap.medium,
    borderWidth: size === 'small' ? '2px' : '3px',
    borderStyle: 'solid',
    borderColor: 'rgba(99, 102, 241, 0.2)',
    borderTopColor: 'var(--primary)',
    borderRadius: '50%',
    animation: 'spin 0.6s linear infinite',
  };

  if (fullPage) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          gap: '16px',
          width: '100%',
        }}
      >
        <div style={spinnerStyle} />
        {message && <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', fontWeight: 500 }}>{message}</p>}
      </div>
    );
  }

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
      <div style={spinnerStyle} />
      {message && <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{message}</span>}
    </div>
  );
};
