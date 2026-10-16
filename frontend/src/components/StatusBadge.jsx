const LABELS = {
  ABERTO: 'Aberto',
  ENCERRADO: 'Encerrado',
  PENDENTE: 'Pendente',
  ACEITO: 'Aceito',
  RECUSADO: 'Recusado',
};

export default function StatusBadge({ status }) {
  return <span className={`status status--${status.toLowerCase()}`}>{LABELS[status] ?? status}</span>;
}
