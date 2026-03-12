import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { getTemplates } from './templates';
import './styles.css';

const DEPARTMENTS = ["seg", "sedh", "casa civil", "casa militar", "secom", "vice"];

function App() {
  const [name, setName] = useState('Geiza Maria Da Cruz Oliveira');
  const [selectedDept, setSelectedDept] = useState('sedh');
  const [htmlOutput, setHtmlOutput] = useState('');
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { name, department: selectedDept };
    const templates = getTemplates(data);

    setHtmlOutput(templates.htmlText);

    // PDF Generation logic (manual formatting)
    const doc = new jsPDF();
    let currentY = 20;
    const indentX = 10;
    const subIndentX = 20;

    doc.setFont("helvetica", "normal");
    doc.text(`Login na rede e e-mail institucional para `, 20, currentY);
    const textPart1Width = doc.getTextWidth(`Login na rede e e-mail institucional para `);
    
    doc.setFont("helvetica", "bold");
    doc.text(data.name, 20 + textPart1Width, currentY);
    const nameTextWidth = doc.getTextWidth(data.name);
    
    doc.setFont("helvetica", "normal");
    doc.text(` foram criados.`, 20 + textPart1Width + nameTextWidth, currentY);
    currentY += 12;

    doc.setFont("helvetica", "bold");
    doc.text("Informações da conta:", 20, currentY);
    currentY += 10;

    doc.text("conta de acesso a rede", 20 + indentX, currentY);
    currentY += 8;

    const loginHandle = templates.loginHandle; // Pass this from templates for cleaner code
    doc.text("login:", 20 + subIndentX, currentY);
    doc.setFont("helvetica", "normal");
    doc.text(loginHandle, 20 + subIndentX + doc.getTextWidth("login: "), currentY);
    currentY += 8;

    doc.setFont("helvetica", "bold");
    doc.text("senha:", 20 + subIndentX, currentY);
    doc.setFont("helvetica", "normal");
    doc.text("inicial1", 20 + subIndentX + doc.getTextWidth("senha: "), currentY);
    currentY += 12;

    doc.setFont("helvetica", "bold");
    doc.text("conta de e-mail institucional", 20 + indentX, currentY);
    currentY += 8;

    doc.text("login:", 20 + subIndentX, currentY);
    doc.setFont("helvetica", "normal");
    doc.text(`${loginHandle}@${selectedDept.toLowerCase()}.es.gov.br`, 20 + subIndentX + doc.getTextWidth("login: "), currentY);
    currentY += 8;

    doc.setFont("helvetica", "bold");
    doc.text("senha:", 20 + subIndentX, currentY);
    doc.setFont("helvetica", "normal");
    doc.text("inicial1", 20 + subIndentX + doc.getTextWidth("senha: "), currentY);
    currentY += 18;

    doc.setFont("helvetica", "bold");
    doc.text("Obs:", 20, currentY);
    doc.setFont("helvetica", "italic");
    doc.text("será solicitado a trocas das senhas no primeiro acesso.", 20 + doc.getTextWidth("Obs: "), currentY);
    
    currentY += 25;
    doc.setFont("helvetica", "normal");
    doc.text("Att,", 20, currentY);
    doc.text("Daniel Segatto Conti de Matos", 20, currentY + 12);

    const blob = doc.output('blob');
    setPdfBlobUrl(URL.createObjectURL(blob));
  };

  return (
    <div style={{ padding: '30px', fontFamily: 'sans-serif', maxWidth: '650px', margin: '0 auto' }}>
      <form onSubmit={handleSubmit} className="tool-form">
        <div className="form-group">
          <label><strong>Name:</strong></label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required style={{ width: '100%', padding: '8px' }} />
        </div>

        <div className="form-group">
          <label><strong>Department:</strong></label>
          <div className="dept-grid">
            {DEPARTMENTS.map(dept => (
              <div key={dept} className="dept-item">
                <input type="radio" name="dept" value={dept} id={dept} checked={selectedDept === dept} onChange={(e) => setSelectedDept(e.target.value)} required />
                <label htmlFor={dept}>{dept}</label>
              </div>
            ))}
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="primary-btn">Generate</button>
          <button type="button" onClick={() => { setName(''); setSelectedDept(''); setHtmlOutput(''); setPdfBlobUrl(null); }} className="secondary-btn">Reset</button>
        </div>
      </form>

      {htmlOutput && (
        <div style={{ marginTop: '30px', borderTop: '1px solid #ddd', paddingTop: '20px' }}>
          <div 
            contentEditable="true" 
            dangerouslySetInnerHTML={{ __html: htmlOutput }} 
            style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '4px', backgroundColor: 'white', minHeight: '200px' }}
          />
          
          {pdfBlobUrl && (
            <button 
              onClick={() => { const link = document.createElement('a'); link.href = pdfBlobUrl; link.download = `${name}_access.pdf`; link.click(); }} 
              style={{ marginTop: '20px', backgroundColor: '#2e7d32', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer', width: '100%' }}
            >
              Download PDF
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default App;