import React, { useState } from 'react';
import { useInformeNumber } from './hooks/useInformeNumber';
import { documentService } from './services/documentService';
import { getTemplates } from './utils/templates';
import DocumentForm from './components/DocumentForm';
import ResultDisplay from './components/ResultDisplay';
import './styles.css';

function App() {
 const [name, setName] = useState(''); 
const [surnameIndex, setSurnameIndex] = useState(null); 
const [selectedDept, setSelectedDept] = useState(''); 
const [informeNumber, setInformeNumber] = useInformeNumber(); 
  
  const [results, setResults] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);

  // 2. Data Package for Services
  const currentData = { 
    name, 
    surnameIndex, 
    department: selectedDept, // Aligning naming with template expectations
    selectedDept, 
    informeNumber 
  };

  // 3. Event Handlers 
  const handleSubmit = (e) => {
    e.preventDefault();
    const resultData = getTemplates(currentData);
    setResults(resultData);
    
    // Auto-increment the counter for the next user 
    setInformeNumber(prev => prev + 1);
  };

  const handleDownloadPdf = async () => {
    setIsGenerating(true);
    try {
      await documentService.downloadAsPdf(currentData);
    } catch (error) {
      console.error("PDF Error:", error);
      alert(`Could not generate PDF: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // 4. Grouped props for cleaner JSX 
  const formState = { name, surnameIndex, selectedDept, informeNumber };
  const formActions = { 
    setName, 
    setSurnameIndex, 
    setSelectedDept, 
    setInformeNumber, 
    handleSubmit 
  };

  return (
    <div style={{ padding: '30px', fontFamily: 'sans-serif', maxWidth: '650px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center' }}>Institutional Access Tool</h2>
      
      {/* Input Layer */}
      <DocumentForm state={formState} actions={formActions} />
      
      {/* Output & Actions Layer  */}
      <ResultDisplay 
        results={results} 
        isGenerating={isGenerating}
        onDownloadPdf={handleDownloadPdf}
      />
    </div>
  );
}

export default App;