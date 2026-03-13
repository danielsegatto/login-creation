import React from 'react';

const SurnameSelector = ({ name, surnameIndex, setSurnameIndex }) => {
  const parts = name.trim().split(/\s+/).filter(p => p.length > 0);

  // Don't show anything if there's only one name
  if (parts.length < 2) return null;

  return (
    <div className="form-group" style={{ marginTop: '15px' }}>
      <div className="surname-container">
        {parts.map((word, index) => {
          // Skip the first name (index 0) as it's always used
          if (index === 0) return null;

          const isActive = surnameIndex === index;

          return (
            <button
              key={index}
              type="button"
              className={`surname-btn ${isActive ? 'active' : ''}`}
              onClick={() => setSurnameIndex(index)}
            >
              {word.toUpperCase()}
            </button>
          );
        })}
      </div>
      <p style={{ fontSize: '11px', color: '#888', marginTop: '8px' }}>
        * O login será gerado como: <strong>{parts[0].toLowerCase()}.{(parts[surnameIndex] || parts[parts.length-1]).toLowerCase()}</strong>
      </p>
    </div>
  );
};

export default SurnameSelector;