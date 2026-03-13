import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { formatLogin } from '../utils/templates';

const API_KEY = 'aiVT5kEp6kAVYTjRsO0Bp6VucphUDpXK';

/**
 * Internal helper to generate a Word Blob from the template.
 */
const generateWordBlob = async (data) => {
  const response = await fetch('/informe_template.docx');
  if (!response.ok) throw new Error("Template not found in public folder");
  
  const arrayBuffer = await response.arrayBuffer();
  const zip = new PizZip(arrayBuffer);
  const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

  doc.render({
    informeNumber: data.informeNumber.toString().padStart(3, '0'),
    loginHandle: formatLogin(data.name, data.surnameIndex),
    department: data.selectedDept.toLowerCase()
  });

  return doc.getZip().generate({
    type: "blob",
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
};

export const documentService = {
  /**
   * Generates a DOCX and converts it to PDF via ConvertAPI.
   */
  downloadAsPdf: async (data) => {
    const docxBlob = await generateWordBlob(data);
    
    const formData = new FormData();
    formData.append('File', docxBlob, 'document.docx');
    formData.append('StoreFile', 'false'); 

    const response = await fetch('https://v2.convertapi.com/convert/docx/to/pdf', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${API_KEY}` },
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${errorText}`);
    }

    const result = await response.json();
    if (!result.Files || !result.Files[0].FileData) {
      throw new Error("No file data received from the API.");
    }

    const base64Data = result.Files[0].FileData;
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const pdfBlob = new Blob([new Uint8Array(byteNumbers)], { type: 'application/pdf' });
    const localUrl = window.URL.createObjectURL(pdfBlob);
    
    const link = document.createElement('a');
    link.href = localUrl;
    link.download = `INFORME_${data.informeNumber.toString().padStart(3, '0')}_${data.name.replace(/\s+/g, '_')}.pdf`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(localUrl);
  }
};