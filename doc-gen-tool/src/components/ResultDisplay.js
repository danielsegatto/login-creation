import React from 'react';

const boxStyle = { 
  padding: '15px', 
  border: '1px solid #ccc', 
  borderRadius: '4px', 
  backgroundColor: 'white', 
  marginTop: '10px' 
};

const ResultDisplay = ({ outputs, isGenerating, onDownloadWord, onDownloadPdf }) => {
  if (!outputs.html1) return null;

  return (
    <div style={{ marginTop: '30px', borderTop: '2px solid #eee', paddingTop: '20px' }}>
      <div contentEditable="true" dangerouslySetInnerHTML={{ __html: outputs.html1 }} style={boxStyle} />
      <div contentEditable="true" dangerouslySetInnerHTML={{ __html: outputs.html2 }} style={boxStyle} />

      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        <button 
          onClick={onDownloadWord} 
          style={{ flex: 1, backgroundColor: '#2b5797', color: 'white', padding: '12px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Download Word (.docx)
        </button>
        <button 
          onClick={onDownloadPdf} 
          disabled={isGenerating}
          style={{ flex: 1, backgroundColor: '#d32f2f', color: 'white', padding: '12px', border: 'none', borderRadius: '4px', cursor: isGenerating ? 'not-allowed' : 'pointer' }}
        >
          {isGenerating ? 'Converting to PDF...' : 'Download PDF'}
        </button>
      </div>
    </div>
  );
};

export default ResultDisplay;