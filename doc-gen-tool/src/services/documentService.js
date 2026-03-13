import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { saveAs } from 'file-saver';
import { formatLogin } from '../utils/templates';

const API_KEY = 'aiVT5kEp6kAVYTjRsO0Bp6VucphUDpXK';

// Private helper function
const generateWordBlob = async (data) => {
  const response = await fetch('/informe_template.docx');
  if (!response.ok) throw new Error("Template not found in public folder");
  
  const arrayBuffer = await response.arrayBuffer();
  const zip = new PizZip(arrayBuffer);
  const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

  const currentLogin = formatLogin(data.name, data.surnameIndex);
  const formattedNumber = data.informeNumber.toString().padStart(3, '0');

  doc.render({
    informeNumber: formattedNumber,
    loginHandle: currentLogin,
    department: data.selectedDept.toLowerCase()
  });

  return doc.getZip().generate({
    type: "blob",
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
};

// Public Service Methods
export const documentService = {
  downloadWord: async (data) => {
    const blob = await generateWordBlob(data);
    const formattedNumber = data.informeNumber.toString().padStart(3, '0');
    saveAs(blob, `INFORME_${formattedNumber}_${data.name.replace(/\s+/g, '_')}.docx`);
  },

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
    
    const byteArray = new Uint8Array(byteNumbers);
    const pdfBlob = new Blob([byteArray], { type: 'application/pdf' });

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