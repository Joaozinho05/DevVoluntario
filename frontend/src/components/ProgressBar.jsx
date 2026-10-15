// Barra do limite de vagas: "1 / 2 vagas preenchidas".
export default function ProgressBar({ value, max }) {
  const percent = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  const full = value >= max;

  return (
    <div className="progress">
      <div
        className="progress__track"
        role="progressbar"
        aria-label="Vagas preenchidas"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={Math.min(value, max)}
      >
        <div className={`progress__fill${full ? ' progress__fill--full' : ''}`} style={{ width: `${percent}%` }} />
      </div>
      <span className="progress__label">
        {value} / {max} {max === 1 ? 'vaga preenchida' : 'vagas preenchidas'}
      </span>
    </div>
  );
}
