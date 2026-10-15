export const formatDate = (iso) => new Date(iso).toLocaleDateString('pt-BR');

export const formatDateTime = (iso) =>
  new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
