const ROLES = Object.freeze({
  ADMIN: 'ADMIN',
  EMPRESA: 'EMPRESA',
  TRABALHADOR: 'TRABALHADOR',
});

// Perfis que podem ser escolhidos no auto-cadastro público.
// ADMIN nunca é criado por /auth/register (use o seed ou o banco).
const REGISTERABLE_ROLES = [ROLES.EMPRESA, ROLES.TRABALHADOR];

const JOB_STATUS = Object.freeze({ ABERTO: 'ABERTO', ENCERRADO: 'ENCERRADO' });
const APPLICATION_STATUS = Object.freeze({
  PENDENTE: 'PENDENTE',
  ACEITO: 'ACEITO',
  RECUSADO: 'RECUSADO',
});

module.exports = { ROLES, REGISTERABLE_ROLES, JOB_STATUS, APPLICATION_STATUS };
