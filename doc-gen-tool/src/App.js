import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { getTemplates } from './templates';
import './styles.css';

const DEPARTMENTS = ["seg", "sedh", "casa civil", "casa militar", "secom", "vice"];

function App() {
  const [name, setName] = useState('Geiza Maria Da Cruz Oliveira');
  const [surnameIndex, setSurnameIndex] = useState(4);
  const [selectedDept, setSelectedDept] = useState('sedh');
  
  // State for the persistent Informe number
  const [informeNumber, setInformeNumber] = useState(() => {
    const saved = localStorage.getItem('currentInformeNumber');
    return saved !== null ? parseInt(saved, 10) : 35; // Default to 35 if not found
  });

  const [outputs, setOutputs] = useState({ html1: '', html2: '' });
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);

  // Sync Informe Number to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('currentInformeNumber', informeNumber);
  }, [informeNumber]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { 
      name, 
      department: selectedDept, 
      surnameIndex, 
      informeNumber // Pass the current number to templates
    };
    
    const result = getTemplates(data);
    setOutputs({ html1: result.htmlText, html2: result.htmlText2 });

    // PDF Logic (using data from first template as before)
    const doc = new jsPDF();
    // ... (Your existing PDF generation code here) ...
    // Note: If you want the PDF to also mention the INFORME number, 
    // you can use data.informeNumber in the PDF coordinates.

    setPdfBlobUrl(URL.createObjectURL(doc.output('blob')));

    // AUTO-INCREMENT: Only happens when the form is submitted
    setInformeNumber(prev => prev + 1);
  };

  return (
    <div style={{ padding: '30px', fontFamily: 'sans-serif', maxWidth: '650px', margin: '0 auto' }}>
      <form onSubmit={handleSubmit} className="tool-form">
        <div className="form-group">
          <label><strong>Name:</strong></label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', padding: '8px' }} required />
        </div>

        {/* Surname Selector for Login Handle */}
        <div className="form-group">
          <label><small>Select word for Login Surname:</small></label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '5px' }}>
            {name.trim().split(/\s+/).map((part, index) => (
              <button
                key={index} type="button" disabled={index === 0}
                onClick={() => setSurnameIndex(index)}
                style={{
                  padding: '4px 8px', fontSize: '12px', cursor: 'pointer',
                  backgroundColor: surnameIndex === index ? '#007bff' : '#eee',
                  color: surnameIndex === index ? 'white' : '#333',
                  border: '1px solid #ccc', borderRadius: '3px'
                }}
              >{part}</button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '20px' }}>
          <div className="form-group" style={{ flex: 2 }}>
            <label><strong>Department:</strong></label>
            <div className="dept-grid">
              {DEPARTMENTS.map(dept => (
                <div key={dept} className="dept-item">
                  <input type="radio" name="dept" value={dept} checked={selectedDept === dept} onChange={(e) => setSelectedDept(e.target.value)} required />
                  <label>{dept}</label>
                </div>
              ))}
            </div>
          </div>

          {/* Persistent Counter Field */}
          <div className="form-group" style={{ flex: 1 }}>
            <label><strong>Next INFORME:</strong></label>
            <input 
              type="number" 
              value={informeNumber} 
              onChange={(e) => setInformeNumber(parseInt(e.target.value, 10))}
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="primary-btn">Generate Login & Document</button>
        </div>
      </form>

      {outputs.html1 && (
        <div style={{ marginTop: '30px', borderTop: '2px solid #eee', paddingTop: '20px' }}>
          <div className="result-section">
            <label><strong>TEXT 1: Login Details (Rich Text)</strong></label>
            <div contentEditable="true" dangerouslySetInnerHTML={{ __html: outputs.html1 }} style={resultBoxStyle} />
          </div>

          <div className="result-section" style={{ marginTop: '20px' }}>
            <label><strong>TEXT 2: Conclusion Message (Rich Text)</strong></label>
            <div contentEditable="true" dangerouslySetInnerHTML={{ __html: outputs.html2 }} style={resultBoxStyle} />
          </div>

          {pdfBlobUrl && (
            <button onClick={() => { const link = document.createElement('a'); link.href = pdfBlobUrl; link.download = `Access_${name}.pdf`; link.click(); }} className="download-btn">
              Download PDF Document
            </button>
          )}
        </div>
      )}
    </div>
  );
}

const resultBoxStyle = { padding: '15px', border: '1px solid #ccc', borderRadius: '4px', backgroundColor: 'white', marginTop: '10px' };

export default App;