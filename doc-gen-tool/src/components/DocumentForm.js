import React from 'react';
import SurnameSelector from './SurnameSelector';

const departments = ['SEG', 'SEDH', 'CASA CIVIL', 'CASA MILITAR', 'SECOM', 'VICE'];

/**
 * The primary input form for generating institutional access data.
 * @param {object} state - Current form state (name, selectedDept, etc.).
 * @param {object} actions - Handlers for updating state and submitting.
 */
const DocumentForm = ({ state, actions }) => {
  const { name, surnameIndex, selectedDept, informeNumber } = state;
  const { setName, setSurnameIndex, setSelectedDept, setInformeNumber, onSubmit } = actions;

  return (
    <form onSubmit={onSubmit}>
      <div className="form-group">
        <label>NOME COMPLETO:</label>
        <input 
          type="text" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          required 
        />
      </div>

      <SurnameSelector 
        name={name} 
        surnameIndex={surnameIndex} 
        setSurnameIndex={setSurnameIndex} 
      />

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '20px' }}>
        <div className="form-group" style={{ flex: '2', minWidth: '280px' }}>
          <div className="dept-grid">
            {departments.map(dept => (
              <label key={dept} className="dept-option">
                <input 
                  type="radio" 
                  name="dept"
                  value={dept.toLowerCase()} 
                  checked={selectedDept === dept.toLowerCase()}
                  onChange={(e) => setSelectedDept(e.target.value)}
                />
                <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{dept}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="form-group" style={{ flex: '1', minWidth: '100px' }}>
          <label>Nº INFORME:</label>
          <input 
            type="number" 
            value={informeNumber} 
            onChange={(e) => setInformeNumber(parseInt(e.target.value) || 0)} 
            required
          />
        </div>
      </div>

      <button type="submit" className="btn-primary">Gerar</button>
    </form>
  );
};

export default DocumentForm;