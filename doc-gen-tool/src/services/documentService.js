import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { formatLogin } from '../utils/templates';

/**
 * Internal helper to generate a Word Blob from the template.
 */
const generateWordBlob = async (data) => {
  const response = await fetch(`${process.env.PUBLIC_URL}/informe_template.docx`);
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
   * Converts DOCX to PDF using CloudConvert's free API (25 conversions/day, no expiration).
   */
  downloadAsPdf: async (data) => {
    const formattedNumber = data.informeNumber.toString().padStart(3, '0');
    const filename = `INFORME_${formattedNumber}_${data.name.replace(/\s+/g, '_')}`;

    const apiKey = process.env.REACT_APP_CLOUDCONVERT_API_KEY;
    if (!apiKey) {
      throw new Error('CloudConvert API key not configured. Please add REACT_APP_CLOUDCONVERT_API_KEY to your environment.');
    }

    const docxBlob = await generateWordBlob(data);

    // Step 1: Upload the DOCX file
    const uploadFormData = new FormData();
    uploadFormData.append('file', docxBlob, 'document.docx');

    const uploadRes = await fetch('https://api.cloudconvert.com/v2/import/upload', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}` },
      body: uploadFormData
    });

    if (!uploadRes.ok) {
      const errorData = await uploadRes.json();
      throw new Error(errorData.message || 'Failed to upload file to CloudConvert');
    }

    const uploadData = await uploadRes.json();
    const fileId = uploadData.data.id;

    // Step 2: Create a conversion job
    const convertRes = await fetch('https://api.cloudconvert.com/v2/jobs', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tasks: {
          import_file: {
            operation: 'import/upload',
            file_id: fileId
          },
          convert_file: {
            operation: 'convert',
            input: 'import_file',
            output_format: 'pdf'
          },
          export_file: {
            operation: 'export/url',
            input: 'convert_file'
          }
        }
      })
    });

    if (!convertRes.ok) {
      const errorData = await convertRes.json();
      throw new Error(errorData.message || 'Failed to convert file');
    }

    const jobData = await convertRes.json();
    const jobId = jobData.data.id;

    // Step 3: Poll for completion
    let completed = false;
    let attempts = 0;
    const maxAttempts = 60; // 60 seconds max wait
    let pdfUrl = null;

    while (!completed && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      attempts++;

      const statusRes = await fetch(`https://api.cloudconvert.com/v2/jobs/${jobId}`, {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      });

      if (statusRes.ok) {
        const statusData = await statusRes.json();
        if (statusData.data.status === 'finished') {
          completed = true;
          // Get the export file URL
          const exportTask = statusData.data.tasks.find(t => t.name === 'export_file');
          if (exportTask && exportTask.result && exportTask.result.files && exportTask.result.files[0]) {
            pdfUrl = exportTask.result.files[0].url;
          }
        } else if (statusData.data.status === 'failed') {
          throw new Error('CloudConvert conversion failed');
        }
      }
    }

    if (!pdfUrl) {
      throw new Error('Conversion timeout or no PDF generated');
    }

    // Step 4: Download the PDF
    const pdfRes = await fetch(pdfUrl);
    if (!pdfRes.ok) throw new Error('Failed to download PDF');

    const pdfBlob = await pdfRes.blob();
    const localUrl = window.URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = localUrl;
    link.download = `${filename}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(localUrl);
  },

  /**
   * Downloads the filled DOCX template directly.
   */
  downloadAsDocx: async (data) => {
    const docxBlob = await generateWordBlob(data);
    const localUrl = window.URL.createObjectURL(docxBlob);
    const link = document.createElement('a');
    link.href = localUrl;
    link.download = `INFORME_${data.informeNumber.toString().padStart(3, '0')}_${data.name.replace(/\s+/g, '_')}.docx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(localUrl);
  }
};
