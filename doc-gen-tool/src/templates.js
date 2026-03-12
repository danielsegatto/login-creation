// src/templates.js

const formatLogin = (fullName, surnameIndex) => {
  const parts = fullName.trim().toLowerCase().split(/\s+/).filter(p => p.length > 0);
  if (parts.length < 2) return parts[0] || 'user';
  return `${parts[0]}.${parts[surnameIndex] || parts[parts.length - 1]}`;
};

export const getTemplates = (data) => {
  const loginHandle = formatLogin(data.name, data.surnameIndex);
  const dept = data.department.toLowerCase();

  // TEXT 1: Detailed Credentials
  const htmlText = `
    <div style="font-family: sans-serif; line-height: 1.6;">
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

  // TEXT 2: Brief Completion Notice with Dynamic Informe Number
  // We pad the number with 0s if it's less than 3 digits (e.g., 035)
  const formattedNumber = data.informeNumber.toString().padStart(3, '0');
  
  const htmlText2 = `
    <div style="font-family: sans-serif; line-height: 1.6;">
      Criação de login na rede e e-mail institucional concluída.<br/>
      Os detalhes e orientações para o primeiro acesso estão descritos no 
      <strong>INFORME-${formattedNumber}</strong> em anexo a esta mensagem.
    </div>`;

  return { htmlText, htmlText2, loginHandle };
};