import React from 'react';

/**
 * Component to allow selection of a specific surname from a full name.
 * @param {string} name - The full name to split.
 * @param {number} surnameIndex - The currently selected index.
 * @param {function} setSurnameIndex - Function to update the selected index.
 */
const SurnameSelector = ({ name, surnameIndex, setSurnameIndex }) => {
  const nameParts = name.trim().split(/\s+/).filter(p => p.length > 0);

  // If there's only one name, we don't need selection buttons
  if (nameParts.length < 2) return null;

  return (
    <div className="form-group">
      <label><small>Select word for Login Surname:</small></label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '5px' }}>
        {nameParts.map((part, index) => (
          <button
            key={index}
            type="button"
            disabled={index === 0} // First name usually isn't the surname
            onClick={() => setSurnameIndex(index)}
            style={{
              padding: '4px 8px', 
              fontSize: '12px', 
              cursor: index === 0 ? 'not-allowed' : 'pointer',
              backgroundColor: surnameIndex === index ? '#007bff' : '#eee',
              color: surnameIndex === index ? 'white' : '#333',
              border: '1px solid #ccc', 
              borderRadius: '3px'
            }}
          >
            {part}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SurnameSelector;