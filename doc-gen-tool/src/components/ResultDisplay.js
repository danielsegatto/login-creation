import React from 'react';
import CopyableField from './CopyableField';

const boxStyle = { 
  padding: '15px', 
  border: '1px solid #ccc', 
  borderRadius: '4px', 
  backgroundColor: '#f9f9f9', 
  marginTop: '10px',
  cursor: 'pointer',
  transition: 'background-color 0.2s'
};

const ResultDisplay = ({ results, isGenerating, onDownloadPdf }) => {
  if (!results.loginHandle) return null;

  const handleCopyText = (htmlContent, label) => {
    const tempElement = document.createElement('div');
    tempElement.innerHTML = htmlContent.replace(/<br\s*\/?>/gi, '\n');
    const plainText = tempElement.innerText;

    const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
    const textBlob = new Blob([plainText], { type: 'text/plain' });

    const data = [new ClipboardItem({
      'text/plain': textBlob,
      'text/html': htmlBlob
    })];

    navigator.clipboard.write(data)
      .then(() => console.log(`Copied ${label} with formatting`))
      .catch(err => {
        console.error('Failed to copy: ', err);
        navigator.clipboard.writeText(plainText);
      });
  };

  return (
    <div style={{ marginTop: '30px', borderTop: '2px solid #eee', paddingTop: '20px' }}>
      
      {/* 1. Grid of one-click copy fields */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
        <CopyableField value={results.firstName} />
        <CopyableField value={results.surnameRest} />
        <CopyableField value={results.loginHandle} />
        <CopyableField value={results.email} />
        <CopyableField value={results.password} />
      </div>

      {/* 2. Interactive text blocks without labels */}
      <div style={{ marginBottom: '20px' }}>
        <div 
          title="Click to copy Institutional Notice"
          onClick={() => handleCopyText(results.htmlText, "Notice")}
          dangerouslySetInnerHTML={{ __html: results.htmlText }} 
          style={boxStyle}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f1f1'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f9f9f9'}
        />
        
        <div 
          title="Click to copy Credential Details"
          onClick={() => handleCopyText(results.htmlText2, "Credentials")}
          dangerouslySetInnerHTML={{ __html: results.htmlText2 }} 
          style={{ ...boxStyle, marginTop: '20px' }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f1f1'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f9f9f9'}
        />
      </div>

      {/* 3. Main Action Button */}
      <button 
        onClick={onDownloadPdf} 
        disabled={isGenerating}
        style={{ 
          width: '100%', 
          backgroundColor: isGenerating ? '#ccc' : '#003366', 
          color: 'white', 
          padding: '16px', 
          border: 'none', 
          borderRadius: '6px', 
          cursor: isGenerating ? 'not-allowed' : 'pointer',
          fontWeight: 'bold',
          fontSize: '16px',
          letterSpacing: '1px',
          transition: 'background-color 0.3s ease',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}
      >
        {isGenerating ? 'PROCESSANDO DOCUMENTO...' : 'GERAR PDF'}
      </button>
    </div>
  );
};

export default ResultDisplay;