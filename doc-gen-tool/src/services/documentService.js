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
      throw new Error('CloudConvert API key not configured. Please contact the administrator.');
    }

    try {
      console.log('Starting DOCX to PDF conversion...');

      const docxBlob = await generateWordBlob(data);
      console.log('DOCX generated, uploading to CloudConvert...');

      // Step 1: Upload the DOCX file
      const uploadFormData = new FormData();
      uploadFormData.append('file', docxBlob, 'document.docx');

      const uploadRes = await fetch('https://api.cloudconvert.com/v2/import/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}` },
        body: uploadFormData
      });

      if (!uploadRes.ok) {
        const errorText = await uploadRes.text();
        console.error('Upload failed:', uploadRes.status, errorText);
        throw new Error(`Upload failed (${uploadRes.status}). Check your API key or try again.`);
      }

      const uploadData = await uploadRes.json();
      const fileId = uploadData.data?.id;
      if (!fileId) {
        throw new Error('No file ID returned from CloudConvert upload');
      }
      console.log('File uploaded successfully, file ID:', fileId);

      // Step 2: Create a conversion job
      console.log('Creating conversion job...');
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
              input_format: 'docx',
              output_format: 'pdf',
              engine: 'libreoffice'
            },
            export_file: {
              operation: 'export/url',
              input: 'convert_file'
            }
          }
        })
      });

      if (!convertRes.ok) {
        const errorText = await convertRes.text();
        console.error('Conversion job creation failed:', convertRes.status, errorText);

        // Handle specific error codes
        if (convertRes.status === 402) {
          // Check if it's a parallel job limit error
          if (errorText.includes('PARALLEL_JOB_LIMIT_EXCEEDED')) {
            throw new Error('Too many conversions running. Please wait for the current conversion to finish before starting another.');
          }
          throw new Error('Payment required. Your free tier may have reached its limit. Please try again later.');
        }

        throw new Error(`Conversion failed (${convertRes.status}). API key may be invalid or limit exceeded.`);
      }

      const jobData = await convertRes.json();
      const jobId = jobData.data?.id;
      if (!jobId) {
        throw new Error('No job ID returned from CloudConvert');
      }
      console.log('Conversion job created, job ID:', jobId);

      // Step 3: Poll for completion
      let completed = false;
      let attempts = 0;
      const maxAttempts = 120; // 120 seconds timeout
      let pdfUrl = null;

      while (!completed && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        attempts++;

        if (attempts % 10 === 0) {
          console.log(`Polling... attempt ${attempts}/${maxAttempts}`);
        }

        try {
          const statusRes = await fetch(`https://api.cloudconvert.com/v2/jobs/${jobId}`, {
            headers: { 'Authorization': `Bearer ${apiKey}` }
          });

          if (!statusRes.ok) {
            console.error('Status check failed:', statusRes.status);
            continue;
          }

          const statusData = await statusRes.json();
          const jobStatus = statusData.data?.status;
          console.log(`Job status: ${jobStatus}`);

          if (jobStatus === 'finished') {
            completed = true;
            const exportTask = statusData.data?.tasks?.find(t => t.name === 'export_file');
            if (exportTask?.result?.files?.[0]) {
              pdfUrl = exportTask.result.files[0].url;
              console.log('Conversion complete, PDF URL obtained');
            }
          } else if (jobStatus === 'failed') {
            const errorMsg = statusData.data?.tasks?.find(t => t.status === 'failed')?.message || 'Unknown error';
            console.error('Job failed:', errorMsg);
            throw new Error(`CloudConvert conversion failed: ${errorMsg}`);
          }
        } catch (err) {
          console.error('Error during status check:', err.message);
        }
      }

      if (!completed) {
        console.error('Conversion timeout after 120 seconds');
        throw new Error('PDF conversion is taking too long. CloudConvert may be overloaded. Please try again.');
      }

      if (!pdfUrl) {
        throw new Error('PDF generated but no download URL found');
      }

      // Step 4: Download the PDF
      console.log('Downloading PDF...');
      const pdfRes = await fetch(pdfUrl);
      if (!pdfRes.ok) {
        throw new Error(`Failed to download PDF (${pdfRes.status})`);
      }

      const pdfBlob = await pdfRes.blob();
      const localUrl = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = localUrl;
      link.download = `${filename}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(localUrl);

      console.log('PDF download complete!');
    } catch (err) {
      console.error('PDF conversion error:', err);
      throw err;
    }
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
