import React from 'react';

/**
 * A reusable component that copies its value to the clipboard when clicked.
 * @param {string} label - The label for the field (e.g., "First Name").
 * @param {string} value - The text to be copied.
 */
const CopyableField = ({ label, value }) => {
  const handleCopy = () => {
    if (!value) return;
    
    // Uses the browser's Clipboard API
    navigator.clipboard.writeText(value)
      .then(() => {
        // You could add a 'Copied!' notification here later
        console.log(`Copied ${label}: ${value}`);
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };

  return (
    <div style={{ flex: '1', minWidth: '150px', marginBottom: '10px' }}>
      <div 
        onClick={handleCopy}
        title="Click to copy"
        style={{
          padding: '10px',
          border: '1px solid #ddd',
          borderRadius: '4px',
          backgroundColor: '#f1f1f1',
          cursor: 'pointer',
          fontSize: '13px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          transition: 'background-color 0.2s'
        }}
        onMouseOver={(e) => e.target.style.backgroundColor = '#e8e8e8'}
        onMouseOut={(e) => e.target.style.backgroundColor = '#f1f1f1'}
      >
        {value || '---'}
      </div>
    </div>
  );
};

export default CopyableField;