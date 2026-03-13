/**
 * Formata um nome completo para "nome.sobrenomeEscolhido"
 */
export const formatLogin = (fullName, surnameIndex) => {
  const parts = fullName.trim().toLowerCase().split(/\s+/).filter(part => part.length > 0);
  if (parts.length < 2) return parts[0] || 'user';
  
  const firstName = parts[0];
  const chosenSurname = parts[surnameIndex] !== undefined ? parts[surnameIndex] : parts[parts.length - 1];
  
  return `${firstName}.${chosenSurname}`;
};

/**
 * Gera os templates HTML e os campos de metadados individuais.
 * Texto 1 atualizado conforme nova instrução.
 */
export const getTemplates = (data) => {
  const nameParts = data.name.trim().split(/\s+/).filter(p => p.length > 0);
  
  const firstName = nameParts[0] || '';
  const surnameRest = nameParts.slice(1).join(' ');
  const loginHandle = formatLogin(data.name, data.surnameIndex);
  const dept = (data.department || '').toLowerCase();
  const formattedNumber = (data.informeNumber || 0).toString().padStart(3, '0');
  const fullEmail = `${loginHandle}@${dept}.es.gov.br`;

  // TEXTO 1: Atualizado para o aviso de conclusão
  const htmlText = `
    <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
      Criação de login na rede e e-mail institucional concluída.<br/>
      Os detalhes e orientações para o primeiro acesso estão descritos no <strong>INFORME-${formattedNumber}</strong> em anexo a esta mensagem.
    </div>`;

  // TEXTO 2: Bloco detalhado de credenciais (mantendo o padrão anterior)
  const htmlText2 = `
    <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
      Login na rede e e-mail institucional para <strong>${data.name}</strong> foram criados.<br/><br/>
      <strong>Informações da conta:</strong><br/>
      Conta de acesso a rede<br/>
      <div style="margin-left: 20px;">
        <strong>login:</strong> ${loginHandle}<br/>
        <strong>senha:</strong> inicial1<br/>
      </div>
      Conta de e-mail institucional<br/>
      <div style="margin-left: 20px;">
        <strong>login:</strong> ${fullEmail}<br/>
        <strong>senha:</strong> inicial1<br/>
      </div><br/>
      <strong>Obs:</strong><br/>
      Será solicitado a trocas das senhas no primeiro acesso.<br/>
      Os detalhes e orientações para o primeiro acesso estão descritos no <strong>INFORME-${formattedNumber}</strong> em anexo.<br/><br/>
      Att,<br/>
      Daniel Segatto Conti de Matos
    </div>`;

  return { 
    firstName,
    surnameRest,
    loginHandle,
    email: fullEmail,
    password: 'inicial1',
    htmlText, 
    htmlText2, 
    formattedNumber 
  };
};