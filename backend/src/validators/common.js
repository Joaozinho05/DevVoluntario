const { z } = require('zod');

// true se `value` é uma URL http(s) do domínio informado (ou de um subdomínio dele).
function isUrlFromDomain(value, domain) {
  try {
    const { protocol, hostname } = new URL(value);
    return (
      ['http:', 'https:'].includes(protocol) &&
      (hostname === domain || hostname.endsWith(`.${domain}`))
    );
  } catch {
    return false;
  }
}

// Parâmetro de rota :id (inteiro positivo).
const idParamSchema = z.object({
  id: z.coerce
    .number({ invalid_type_error: 'ID inválido' })
    .int('ID inválido')
    .positive('ID inválido'),
});

module.exports = { isUrlFromDomain, idParamSchema };
