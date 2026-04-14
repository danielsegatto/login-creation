import React from 'react';

const ErrorDisplay = ({ error, onDismiss }) => {
  if (!error) return null;

  return (
    <div style={{
      padding: '16px',
      marginBottom: '20px',
      backgroundColor: '#fee',
      border: '1px solid #f88',
      borderRadius: '6px',
      color: '#c33',
      fontSize: '14px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <div>
          <strong>Erro ao gerar PDF:</strong>
          <div style={{ marginTop: '8px', lineHeight: '1.5' }}>
            {error}
          </div>
        </div>
        <button
          onClick={onDismiss}
          style={{
            background: 'none',
            border: 'none',
            color: '#c33',
            cursor: 'pointer',
            fontSize: '18px',
            padding: '0 8px'
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default ErrorDisplay;
