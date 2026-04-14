import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import mammoth from 'mammoth';
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
   * Converts the filled DOCX to HTML via mammoth, then opens a print dialog
   * so the browser generates the PDF — 100% free, no external API.
   */
  downloadAsPdf: async (data) => {
    const formattedNumber = data.informeNumber.toString().padStart(3, '0');
    const filename = `INFORME_${formattedNumber}_${data.name.replace(/\s+/g, '_')}`;

    const docxBlob = await generateWordBlob(data);
    const arrayBuffer = await docxBlob.arrayBuffer();

    const result = await mammoth.convertToHtml({ arrayBuffer });
    const bodyHtml = result.value;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>${filename}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: Arial, sans-serif;
      font-size: 12pt;
      color: #000;
      padding: 2.5cm;
      max-width: 21cm;
      margin: 0 auto;
    }
    p { margin-bottom: 0.4em; line-height: 1.5; }
    table { border-collapse: collapse; width: 100%; margin-bottom: 0.8em; }
    td, th { padding: 4px 8px; border: 1px solid #ccc; }
    @media print {
      body { padding: 0; }
      @page { margin: 2.5cm; size: A4; }
    }
  </style>
</head>
<body>
  ${bodyHtml}
  <script>
    window.onload = function() {
      window.print();
    };
  </script>
</body>
</html>`);
    printWindow.document.close();
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
