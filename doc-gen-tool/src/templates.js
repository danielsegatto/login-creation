// src/templates.js

const formatLogin = (fullName) => {
  const parts = fullName.trim().toLowerCase().split(/\s+/);
  if (parts.length < 2) return parts[0] || 'user';
  return `${parts[0]}.${parts[parts.length - 1]}`;
};

export const getTemplates = (data) => {
  const loginHandle = formatLogin(data.name);
  const dept = data.department.toLowerCase();

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

  return { htmlText, loginHandle };
};