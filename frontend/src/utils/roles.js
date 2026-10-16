export const ROLES = Object.freeze({
  ADMIN: 'ADMIN',
  EMPRESA: 'EMPRESA',
  TRABALHADOR: 'TRABALHADOR',
});

export const ROLE_LABELS = {
  ADMIN: 'Administrador',
  EMPRESA: 'Empresa',
  TRABALHADOR: 'Voluntário',
};

// Tela inicial de cada perfil.
export const ROLE_HOME = {
  ADMIN: '/dashboard-admin',
  EMPRESA: '/dashboard-empresa',
  TRABALHADOR: '/dashboard-trabalhador',
};
