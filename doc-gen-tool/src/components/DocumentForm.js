import React from 'react';
import SurnameSelector from './SurnameSelector';

const DEPARTMENTS = ["seg", "sedh", "casa civil", "casa militar", "secom", "vice"];

/**
 * The primary input form for generating institutional access data.
 * @param {object} state - Current form state (name, selectedDept, etc.).
 * @param {object} actions - Handlers for updating state and submitting.
 */
const DocumentForm = ({ state, actions }) => {
  const { name, surnameIndex, selectedDept, informeNumber } = state;
  const { setName, setSurnameIndex, setSelectedDept, setInformeNumber, handleSubmit } = actions;

  return (
    <form onSubmit={handleSubmit} className="tool-form">
      {/* Name Input */}
      <div className="form-group">
        <label><strong>Name:</strong></label>
        <input 
          type="text" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }}
          required 
        />
      </div>

      {/* Surname Selection Logic */}
      <SurnameSelector 
        name={name} 
        surnameIndex={surnameIndex} 
        setSurnameIndex={setSurnameIndex} 
      />

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        {/* Department Selection */}
        <div className="form-group" style={{ flex: '2', minWidth: '200px' }}>
          <label><strong>Department:</strong></label>
          <div className="dept-grid">
            {DEPARTMENTS.map(dept => (
              <div key={dept} className="dept-item">
                <input 
                  type="radio" 
                  name="dept" 
                  value={dept} 
                  checked={selectedDept === dept} 
                  onChange={(e) => setSelectedDept(e.target.value)} 
                  required 
                />
                <label style={{ textTransform: 'uppercase' }}>{dept}</label>
              </div>
            ))}
          </div>
        </div>

        {/* Informe Number Control */}
        <div className="form-group" style={{ flex: '1', minWidth: '120px' }}>
          <label><strong>Next INFORME:</strong></label>
          <input 
            type="number" 
            value={informeNumber} 
            onChange={(e) => setInformeNumber(parseInt(e.target.value, 10) || 0)}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      <button type="submit" className="primary-btn">Generate Text Results</button>
    </form>
  );
};

export default DocumentForm;