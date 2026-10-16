import { useCallback, useEffect, useState } from 'react';
import ProfileEditor from '../components/ProfileEditor.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { applicationsApi, jobsApi } from '../services/api.js';
import { formatDateTime } from '../utils/format.js';

export default function DashboardTrabalhador() {
  const { token } = useAuth();

  // Feed de cargos
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobsError, setJobsError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  // Candidaturas
  const [history, setHistory] = useState([]);
  const [historyError, setHistoryError] = useState('');
  const [applyingId, setApplyingId] = useState(null);
  const [feedback, setFeedback] = useState(null); // { type, text }

  // Busca com pequeno atraso para não chamar a API a cada tecla.
  useEffect(() => {
    let cancelled = false;
    setJobsLoading(true);

    const timer = setTimeout(
      async () => {
        try {
          const data = await jobsApi.list({ search: search.trim(), status });
          if (!cancelled) {
            setJobs(data.jobs);
            setJobsError('');
          }
        } catch (err) {
          if (!cancelled) setJobsError(err.message);
        } finally {
          if (!cancelled) setJobsLoading(false);
        }
      },
      search ? 300 : 0
    );

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [search, status, reloadKey]);

  const loadHistory = useCallback(async () => {
    try {
      const data = await applicationsApi.mine(token);
      setHistory(data.applications);
      setHistoryError('');
    } catch (err) {
      setHistoryError(err.message);
    }
  }, [token]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleApply = async (job) => {
    setApplyingId(job.id);
    setFeedback(null);

    try {
      const data = await jobsApi.apply(token, job.id);

      // Atualiza o card na hora com a contagem e o status devolvidos pela API.
      setJobs((current) =>
        current.map((item) =>
          item.id === job.id
            ? { ...item, applicationsCount: data.job.applicationsCount, status: data.job.status }
            : item
        )
      );
      setFeedback({
        type: 'success',
        text:
          data.job.status === 'ENCERRADO'
            ? `Candidatura enviada! Com ela, as vagas de "${job.title}" foram todas preenchidas.`
            : `Candidatura enviada para "${job.title}".`,
      });
      loadHistory();
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
      // Limite atingido por outra pessoa ou cargo removido: recarrega o feed com os dados reais.
      if (err.status === 400 || err.status === 404) setReloadKey((key) => key + 1);
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <div className="page page--wide">
      <header className="page__header">
        <h1>Painel do voluntário</h1>
        <p>Encontre cargos abertos, candidate-se e acompanhe o que você já enviou.</p>
      </header>

      <div className="split">
        <ProfileEditor />

        <div className="stack">
          <section>
            <div className="section-head">
              <h2>Cargos abertos</h2>
            </div>

            <div className="toolbar">
              <input
                type="search"
                aria-label="Buscar por título ou tecnologia"
                placeholder="Buscar por título ou tecnologia (ex.: React)"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <select
                aria-label="Filtrar por situação"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
              >
                <option value="">Todos os cargos</option>
                <option value="ABERTO">Somente com vagas</option>
                <option value="ENCERRADO">Vagas esgotadas</option>
              </select>
            </div>

            {feedback && (
              <p
                className={`alert ${feedback.type === 'success' ? 'alert--success' : 'alert--error'}`}
                role={feedback.type === 'success' ? 'status' : 'alert'}
              >
                {feedback.text}
              </p>
            )}

            {jobsError && (
              <p className="alert alert--error" role="alert">
                {jobsError}
              </p>
            )}

            {!jobsLoading && !jobsError && jobs.length === 0 && (
              <p className="empty">Nenhum cargo encontrado com esses filtros.</p>
            )}

            <ul className="job-list">
              {jobs.map((job) => {
                const soldOut = job.status === 'ENCERRADO' || job.applicationsCount >= job.vacancies;
                const applying = applyingId === job.id;

                return (
                  <li key={job.id} className="job-card">
                    <div className="job-card__head">
                      <div>
                        <h3>{job.title}</h3>
                        <p className="job-card__meta">{job.company.name}</p>
                      </div>
                      <StatusBadge status={soldOut ? 'ENCERRADO' : 'ABERTO'} />
                    </div>

                    <p className="job-card__desc">{job.description}</p>

                    <div className="job-card__foot">
                      <ProgressBar value={job.applicationsCount} max={job.vacancies} />
                      <button
                        type="button"
                        className={`btn ${soldOut ? 'btn--soldout' : 'btn--primary'}`}
                        disabled={soldOut || applying}
                        onClick={() => handleApply(job)}
                      >
                        {soldOut ? 'Vagas Esgotadas' : applying ? 'Enviando...' : 'Candidatar-me'}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="panel">
            <h2>Minhas candidaturas</h2>

            {historyError && (
              <p className="alert alert--error" role="alert">
                {historyError}
              </p>
            )}

            {!historyError && history.length === 0 ? (
              <p className="empty">Você ainda não se candidatou. Escolha um cargo no feed acima.</p>
            ) : (
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Cargo</th>
                      <th>Empresa</th>
                      <th>Enviada em</th>
                      <th>Situação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((application) => (
                      <tr key={application.id}>
                        <td>{application.job.title}</td>
                        <td>{application.job.company.name}</td>
                        <td>{formatDateTime(application.createdAt)}</td>
                        <td>
                          <StatusBadge status={application.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
