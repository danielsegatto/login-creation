import React, { useState, useEffect } from 'react';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { saveAs } from 'file-saver';
import ConvertApi from 'convertapi-js';
import { getTemplates, formatLogin } from './templates';
import './styles.css';

const DEPARTMENTS = ["seg", "sedh", "casa civil", "casa militar", "secom", "vice"];

function App() {
  const [name, setName] = useState('Geiza Maria Da Cruz Oliveira');
  const [surnameIndex, setSurnameIndex] = useState(4);
  const [selectedDept, setSelectedDept] = useState('sedh');
  
  // Persistent Informe Number using localStorage
  const [informeNumber, setInformeNumber] = useState(() => {
    const saved = localStorage.getItem('currentInformeNumber');
    return saved !== null ? parseInt(saved, 10) : 35;
  });

  const [outputs, setOutputs] = useState({ html1: '', html2: '' });
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    localStorage.setItem('currentInformeNumber', informeNumber);
  }, [informeNumber]);

  // Shared logic to generate the Word Blob from the template
  const generateWordBlob = async () => {
    const response = await fetch('/informe_template.docx');
    if (!response.ok) throw new Error("Template not found in public folder");
    
    const arrayBuffer = await response.arrayBuffer();
    const zip = new PizZip(arrayBuffer);
    const doc = new Docxtemplater(zip, { 
      paragraphLoop: true, 
      linebreaks: true 
    });

    const currentLogin = formatLogin(name, surnameIndex);
    const formattedNumber = informeNumber.toString().padStart(3, '0');

    doc.render({
      informeNumber: formattedNumber,
      loginHandle: currentLogin,
      department: selectedDept.toLowerCase()
    });

    return doc.getZip().generate({
      type: "blob",
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });
  };

  const downloadWord = async () => {
    try {
      const blob = await generateWordBlob();
      const formattedNumber = informeNumber.toString().padStart(3, '0');
      saveAs(blob, `INFORME_${formattedNumber}_${name.replace(/\s+/g, '_')}.docx`);
    } catch (error) {
      console.error(error);
      alert("Error generating Word document.");
    }
  };

const downloadAsPdf = async () => {
  setIsGenerating(true);
  try {
    const docxBlob = await generateWordBlob();
    const formData = new FormData();
    formData.append('File', docxBlob, 'document.docx');

    // We add 'StoreFile: false' to get the file directly in the response
    formData.append('StoreFile', 'false'); 

    const response = await fetch('https://v2.convertapi.com/convert/docx/to/pdf', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer aiVT5kEp6kAVYTjRsO0Bp6VucphUDpXK'
      },
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${errorText}`);
    }

    const result = await response.json();
    
    // ConvertAPI returns the file content as a Base64 string when StoreFile is false
    if (!result.Files || !result.Files[0].FileData) {
      throw new Error("No file data received from the API.");
    }

    const base64Data = result.Files[0].FileData;
    
    // Convert Base64 string to a local Blob
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const pdfBlob = new Blob([byteArray], { type: 'application/pdf' });

    // Download the local Blob
    const localUrl = window.URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = localUrl;
    link.download = `INFORME_${informeNumber.toString().padStart(3, '0')}_${name.replace(/\s+/g, '_')}.pdf`;
    
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    window.URL.revokeObjectURL(localUrl);

  } catch (error) {
    console.error("PDF Error:", error);
    alert(`PDF conversion failed: ${error.message}`);
  } finally {
    setIsGenerating(false);
  }
};
  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { name, department: selectedDept, surnameIndex, informeNumber };
    const result = getTemplates(data);
    setOutputs({ html1: result.htmlText, html2: result.htmlText2 });
    
    // Increment counter after showing text results
    setInformeNumber(prev => prev + 1);
  };

  const nameParts = name.trim().split(/\s+/).filter(p => p.length > 0);

  return (
    <div style={{ padding: '30px', fontFamily: 'sans-serif', maxWidth: '650px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center' }}>Institutional Access Tool</h2>
      
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

        <div className="form-group">
          <label><small>Select word for Login Surname:</small></label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '5px' }}>
            {nameParts.map((part, index) => (
              <button
                key={index}
                type="button"
                disabled={index === 0} 
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

      {outputs.html1 && (
        <div style={{ marginTop: '30px', borderTop: '2px solid #eee', paddingTop: '20px' }}>
          <div contentEditable="true" dangerouslySetInnerHTML={{ __html: outputs.html1 }} style={boxStyle} />
          
          <div contentEditable="true" dangerouslySetInnerHTML={{ __html: outputs.html2 }} style={boxStyle} />

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button onClick={downloadWord} style={{ flex: 1, backgroundColor: '#2b5797', color: 'white', padding: '12px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              Download Word (.docx)
            </button>
            <button 
              onClick={downloadAsPdf} 
              disabled={isGenerating}
              style={{ flex: 1, backgroundColor: '#d32f2f', color: 'white', padding: '12px', border: 'none', borderRadius: '4px', cursor: isGenerating ? 'not-allowed' : 'pointer' }}
            >
              {isGenerating ? 'Converting to PDF...' : 'Download PDF'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const boxStyle = { padding: '15px', border: '1px solid #ccc', borderRadius: '4px', backgroundColor: 'white', marginTop: '10px' };

export default App;