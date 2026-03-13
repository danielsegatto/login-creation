import React, { useState } from 'react';
import DocumentForm from './components/DocumentForm';
import ResultDisplay from './components/ResultDisplay';
import { useInformeNumber } from './hooks/useInformeNumber';
import { documentService } from './services/documentService';
import { getTemplates, toTitleCase } from './utils/templates';

function App() {
  // 1. Initialize State (Clean slate, no defaults)
  const [name, setName] = useState('');
  const [surnameIndex, setSurnameIndex] = useState(null);
  const [selectedDept, setSelectedDept] = useState('seg');
  const [informeNumber, setInformeNumber] = useInformeNumber();
  const [results, setResults] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);

  // 2. Prepare Form State and Actions
  const formState = { name, surnameIndex, selectedDept, informeNumber };

  const formActions = {
    setName,
    setSurnameIndex,
    setSelectedDept,
    setInformeNumber,
    onSubmit: (e) => {
      e.preventDefault();
      
      const templateData = getTemplates(formState);
      const nameParts = name.trim().split(/\s+/);
      
      setResults({
        ...formState,
        ...templateData,
        // Now applying Title Case to the individual display fields:
        firstName: toTitleCase(nameParts[0]),
        surnameRest: toTitleCase(nameParts.slice(1).join(' ')),
        email: templateData.fullEmail,
        password: 'inicial1'
      });
    }
  };

  // 3. PDF Generation Handler
  const handleGeneratePdf = async () => {
    setIsGenerating(true);
    try {
      await documentService.downloadAsPdf(formState);
    } catch (error) {
      alert("Erro ao gerar PDF: " + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // 4. Render with SEG Polish
  return (
    <div className="app-container">
      <header>
      </header>

      <DocumentForm state={formState} actions={formActions} />

      <ResultDisplay 
        results={results} 
        isGenerating={isGenerating} 
        onDownloadPdf={handleGeneratePdf} 
      />
    </div>
  );
}

export default App;