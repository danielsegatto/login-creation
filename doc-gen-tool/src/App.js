import React, { useState } from 'react';
import { useInformeNumber } from './hooks/useInformeNumber';
import { documentService } from './services/documentService';
import { getTemplates } from './utils/templates';
import DocumentForm from './components/DocumentForm';
import ResultDisplay from './components/ResultDisplay';
import './styles.css';

function App() {
  // State Management
  const [name, setName] = useState('Geiza Maria Da Cruz Oliveira');
  const [surnameIndex, setSurnameIndex] = useState(4);
  const [selectedDept, setSelectedDept] = useState('sedh');
  const [informeNumber, setInformeNumber] = useInformeNumber();
  
  const [outputs, setOutputs] = useState({ html1: '', html2: '' });
  const [isGenerating, setIsGenerating] = useState(false);

  // Data package for services
  const currentData = { name, surnameIndex, selectedDept, informeNumber };

  // Event Handlers
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // getTemplates expects a property named 'department'
    const data = { 
      name, 
      department: selectedDept, // Map selectedDept to department
      surnameIndex, 
      informeNumber 
    };
    
    const result = getTemplates(data);
    setOutputs({ html1: result.htmlText, html2: result.htmlText2 });
    
    setInformeNumber(prev => prev + 1);
  };  

  const handleDownloadWord = async () => {
    try {
      await documentService.downloadWord(currentData);
    } catch (error) {
      console.error(error);
      alert("Error generating Word document.");
    }
  };

  const handleDownloadPdf = async () => {
    setIsGenerating(true);
    try {
      await documentService.downloadAsPdf(currentData);
    } catch (error) {
      console.error(error);
      alert(`PDF conversion failed: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Grouped props for cleaner JSX
  const formState = { name, surnameIndex, selectedDept, informeNumber };
  const formActions = { setName, setSurnameIndex, setSelectedDept, setInformeNumber, handleSubmit };

  return (
    <div style={{ padding: '30px', fontFamily: 'sans-serif', maxWidth: '650px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center' }}>Institutional Access Tool</h2>
      
      <DocumentForm state={formState} actions={formActions} />
      
      <ResultDisplay 
        outputs={outputs} 
        isGenerating={isGenerating}
        onDownloadWord={handleDownloadWord}
        onDownloadPdf={handleDownloadPdf}
      />
    </div>
  );
}

export default App;