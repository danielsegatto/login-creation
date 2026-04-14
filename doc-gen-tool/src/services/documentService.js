import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { jsPDF } from 'jspdf';
import { formatLogin, toTitleCase } from '../utils/templates';

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
   * Generates a PDF entirely in the browser using jsPDF — no external API, 100% free.
   */
  downloadAsPdf: (data) => {
    const loginHandle = formatLogin(data.name, data.surnameIndex);
    const formattedNumber = data.informeNumber.toString().padStart(3, '0');
    const dept = data.selectedDept.toLowerCase();
    const fullEmail = `${loginHandle}@${dept}.es.gov.br`;
    const titleCaseName = toTitleCase(data.name);

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 25;
    const contentW = pageW - margin * 2;
    let y = 20;

    const line = (text, bold = false, size = 11) => {
      doc.setFont('helvetica', bold ? 'bold' : 'normal');
      doc.setFontSize(size);
      const lines = doc.splitTextToSize(text, contentW);
      doc.text(lines, margin, y);
      y += lines.length * (size * 0.4) + 2;
    };

    const gap = (mm = 5) => { y += mm; };

    // Header
    doc.setFillColor(0, 51, 102);
    doc.rect(0, 0, pageW, 14, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(255, 255, 255);
    doc.text('SECRETARIA DE SEGURANÇA PÚBLICA', pageW / 2, 9, { align: 'center' });
    doc.setTextColor(0, 0, 0);

    y = 24;

    // Informe number
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text(`INFORME-${formattedNumber}`, pageW / 2, y, { align: 'center' });
    gap(2);

    // Divider
    doc.setDrawColor(0, 51, 102);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageW - margin, y);
    gap(8);

    // Subject
    line('Assunto: Criação de login na rede e e-mail institucional', true, 11);
    gap(6);

    // Body
    line(`Login na rede e e-mail institucional para ${titleCaseName} foram criados.`, false, 11);
    gap(6);

    line('Informações da conta:', true, 11);
    gap(2);

    line('Conta de acesso à rede', false, 11);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(`Login:  ${loginHandle}`, margin + 8, y); y += 6;
    doc.text(`Senha:  inicial1`, margin + 8, y); y += 6;
    gap(2);

    line('Conta de e-mail institucional', false, 11);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(`Login:  ${fullEmail}`, margin + 8, y); y += 6;
    doc.text(`Senha:  inicial1`, margin + 8, y); y += 6;
    gap(6);

    // Note
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Obs:', margin, y, { renderingMode: 'fill' });
    doc.setFont('helvetica', 'normal');
    const obsText = ' será solicitado a troca das senhas no primeiro acesso.';
    doc.text(obsText, margin + doc.getTextWidth('Obs:'), y);
    y += 6;

    line(`Os detalhes e orientações para o primeiro acesso estão descritos no INFORME-${formattedNumber} em anexo.`, false, 11);
    gap(12);

    // Signature
    line('Att,', false, 11);
    gap(1);
    line(titleCaseName, false, 11);

    // Footer
    const pageH = doc.internal.pageSize.getHeight();
    doc.setFillColor(0, 51, 102);
    doc.rect(0, pageH - 10, pageW, 10, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(`INFORME-${formattedNumber} | ${dept}.es.gov.br`, pageW / 2, pageH - 4, { align: 'center' });
    doc.setTextColor(0, 0, 0);

    doc.save(`INFORME_${formattedNumber}_${data.name.replace(/\s+/g, '_')}.pdf`);
  },

  /**
   * Downloads the filled DOCX template directly (no conversion needed).
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
