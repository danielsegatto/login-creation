import React from 'react';
import SurnameSelector from './SurnameSelector';

const DEPARTMENTS = ["seg", "sedh", "casa civil", "casa militar", "secom", "vice"];

const DocumentForm = ({ state, actions }) => {
  const { name, surnameIndex, selectedDept, informeNumber } = state;
  const { setName, setSurnameIndex, setSelectedDept, setInformeNumber, handleSubmit } = actions;

  return (
    <form onSubmit={handleSubmit} className="tool-form">
      <div className="form-group">
        <label><strong>Name:</strong></label>
        <input 
          type="text" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          style={{ width: '100%', padding: '10px' }}
          required 
        />
      </div>

      <SurnameSelector 
        name={name} 
        surnameIndex={surnameIndex} 
        setSurnameIndex={setSurnameIndex} 
      />

      <div style={{ display: 'flex', gap: '20px' }}>
        <div className="form-group" style={{ flex: 2 }}>
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

        <div className="form-group" style={{ flex: 1 }}>
          <label><strong>Next INFORME:</strong></label>
          <input 
            type="number" 
            value={informeNumber} 
            onChange={(e) => setInformeNumber(parseInt(e.target.value, 10) || 0)}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
      </div>

      <button type="submit" className="primary-btn">Generate Text Results</button>
    </form>
  );
};

export default DocumentForm;