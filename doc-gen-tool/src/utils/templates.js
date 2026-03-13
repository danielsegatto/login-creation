// src/templates.js

/**
 * Formats a full name into "firstname.chosenSurname"
 * @param {string} fullName - The full name string from the form.
 * @param {number} surnameIndex - The index of the word to be used as the surname.
 */
export const formatLogin = (fullName, surnameIndex) => {
  const parts = fullName.trim().toLowerCase().split(/\s+/).filter(part => part.length > 0);
  
  // Guard clause for single names or empty input
  if (parts.length < 2) return parts[0] || 'user';
  
  const firstName = parts[0];
  // Use the specific index provided by the user buttons, or default to the last word
  const chosenSurname = parts[surnameIndex] !== undefined ? parts[surnameIndex] : parts[parts.length - 1];
  
  return `${firstName}.${chosenSurname}`;
};

/**
 * Generates rich-text HTML templates based on submitted form data.
 * @param {object} data - Object containing name, department, surnameIndex, and informeNumber.
 */
export const getTemplates = (data) => {
  const loginHandle = formatLogin(data.name, data.surnameIndex);
  const dept = data.department.toLowerCase();
  
  // Format the Informe number to be 3 digits (e.g., 035)
  const formattedNumber = data.informeNumber.toString().padStart(3, '0');

  // TEXT 1: Detailed Credentials for internal records or initial contact
  const htmlText = `
    <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
      Login na rede e e-mail institucional para <strong>${data.name}</strong> foram criados.<br/>
      <strong>Informações da conta:</strong><br/>
      <div style="margin-left: 25px;">
        <strong>conta de acesso a rede</strong><br/>
        <div style="margin-left: 25px;">
          <strong>login:</strong> ${loginHandle}<br/>
          <strong>senha:</strong> inicial1<br/>
        </div>
        <strong>conta de e-mail institucional</strong><br/>
        <div style="margin-left: 25px;">
          <strong>login:</strong> ${loginHandle}@${dept}.es.gov.br<br/>
          <strong>senha:</strong> inicial1<br/>
        </div>
      </div>
      <br/>
      <strong>Obs:</strong> <em>será solicitado a trocas das senhas no primeiro acesso.</em><br/><br/>
      Att,<br/>
      Daniel Segatto Conti de Matos
    </div>`;

  // TEXT 2: Brief Completion Notice with Dynamic Informe Reference
  const htmlText2 = `
    <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
      Criação de login na rede e e-mail institucional concluída.<br/>
      Os detalhes e orientações para o primeiro acesso estão descritos no 
      <strong>INFORME-${formattedNumber}</strong> em anexo a esta mensagem.
    </div>`;

  return { 
    htmlText, 
    htmlText2, 
    loginHandle,
    formattedNumber 
  };
};