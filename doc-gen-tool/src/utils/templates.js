/**
 * Helper to capitalize the first letter of each word and lowercase the rest.
 */
export const toTitleCase = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Formats a login handle using the first name and a chosen surname word.
 * Defaults to the last word if no specific surname index is selected.
 */
export const formatLogin = (fullName, surnameIndex) => {
  const parts = fullName.trim().toLowerCase().split(/\s+/).filter(p => p.length > 0);
  
  if (parts.length < 2) return parts[0] || 'user';
  
  const firstName = parts[0];
  
  let chosenSurname;
  if (surnameIndex !== null && surnameIndex !== undefined && parts[surnameIndex] && surnameIndex !== 0) {
    chosenSurname = parts[surnameIndex];
  } else {
    chosenSurname = parts[parts.length - 1];
  }
  
  return `${firstName}.${chosenSurname}`;
};

/**
 * Generates the rich-text HTML templates and metadata for the UI.
 */
export const getTemplates = (data) => {
  const loginHandle = formatLogin(data.name, data.surnameIndex);
  const formattedNumber = (data.informeNumber || 0).toString().padStart(3, '0');
  const dept = (data.selectedDept || 'seg').toLowerCase();
  const fullEmail = `${loginHandle}@${dept}.es.gov.br`;
  
  // Format the name to Title Case regardless of input
  const titleCaseName = toTitleCase(data.name);

  // TEXT 1: Institutional Notice
  const htmlText = `
    <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
      Criação de login na rede e e-mail institucional concluída.<br/>
      Os detalhes e orientações para o primeiro acesso estão descritos no <strong>INFORME-${formattedNumber}</strong> em anexo a esta mensagem.
    </div>`;

  // TEXT 2: Detailed Credentials
  const htmlText2 = `
    <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
      Login na rede e e-mail institucional para <strong>${titleCaseName}</strong> foram criados.<br/><br/>
      <strong>Informações da conta:</strong><br/>
      conta de acesso a rede<br/>
      <div style="margin-left: 20px;">
        <strong>login:</strong> ${loginHandle}<br/>
        <strong>senha:</strong> inicial1<br/>
      </div>
      conta de e-mail institucional<br/>
      <div style="margin-left: 20px;">
        <strong>login:</strong> ${fullEmail}<br/>
        <strong>senha:</strong> inicial1<br/>
      </div><br/>
      <strong>Obs:</strong> será solicitado a trocas das senhas no primeiro acesso.<br/>
      Os detalhes e orientações para o primeiro acesso estão descritos no <strong>INFORME-${formattedNumber}</strong> em anexo.<br/><br/>
      Att,<br/>
      Daniel Segatto Conti de Matos
    </div>`;

  return { 
    loginHandle, 
    fullEmail, 
    htmlText, 
    htmlText2, 
    formattedNumber 
  };
};