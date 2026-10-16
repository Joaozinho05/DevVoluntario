import { useCallback, useEffect, useState } from 'react';
import ProgressBar from '../components/ProgressBar.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { jobsApi } from '../services/api.js';
import { formatDate, formatDateTime } from '../utils/format.js';

const INITIAL_FORM = { title: '', description: '', vacancies: 2 };

function CandidateList({ applications }) {
  if (applications.length === 0) {
    return <p className="empty">Nenhuma candidatura recebida ainda.</p>;
  }

  return (
    <ul className="candidate-list">
      {applications.map((application) => {
        const { candidate } = application;
        return (
          <li key={application.id} className="candidate">
            <div className="candidate__head">
              <strong>{candidate.name}</strong>
              <span className="candidate__time">{formatDateTime(application.createdAt)}</span>
            </div>
            <span className="candidate__email">{candidate.email}</span>
            {(candidate.githubUrl || candidate.linkedinUrl) && (
              <span className="candidate__links">
                {candidate.githubUrl && (
                  <a href={candidate.githubUrl} target="_blank" rel="noreferrer">
                    GitHub
                  </a>
                )}
                {candidate.linkedinUrl && (
                  <a href={candidate.linkedinUrl} target="_blank" rel="noreferrer">
                    LinkedIn
                  </a>
                )}
              </span>
            )}
            {candidate.bio && <p className="candidate__bio">{candidate.bio}</p>}
          </li>
        );
      })}
    </ul>
  );
}

export default function DashboardEmpresa() {
  const { token } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [form, setForm] = useState(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formMessage, setFormMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const loadJobs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await jobsApi.mine(token);
      setJobs(data.jobs);
      setLoadError('');
    } catch (err) {
      setLoadError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: undefined }));
    setFormMessage(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setFormMessage(null);
    setFieldErrors({});

    try {
      await jobsApi.create(token, { ...form, vacancies: Number(form.vacancies) });
      setForm(INITIAL_FORM);
      setFormMessage({ type: 'success', text: 'Cargo publicado.' });
      await loadJobs();
    } catch (err) {
      const byField = {};
      (err.errors || []).forEach(({ field, message }) => {
        if (field && !byField[field]) byField[field] = message;
      });
      setFieldErrors(byField);
      setFormMessage({
        type: 'error',
        text: Object.keys(byField).length ? 'Corrija os campos destacados.' : err.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page page--wide">
      <header className="page__header">
        <h1>Painel da empresa</h1>
        <p>Publique cargos e acompanhe quem se candidatou a cada um.</p>
      </header>

      <div className="split">
        <section className="panel">
          <h2>Publicar um cargo</h2>
          <form className="form" onSubmit={handleSubmit} noValidate>
            <div className="field">
              <label htmlFor="job-title">Título</label>
              <input
                id="job-title"
                name="title"
                type="text"
                placeholder="Ex.: Desenvolvedor(a) React Júnior"
                value={form.title}
                onChange={handleChange}
                aria-invalid={Boolean(fieldErrors.title)}
                required
              />
              {fieldErrors.title && <span className="field__error">{fieldErrors.title}</span>}
            </div>

            <div className="field">
              <label htmlFor="job-description">Descrição e tecnologias</label>
              <textarea
                id="job-description"
                name="description"
                rows={5}
                placeholder="O que a pessoa vai fazer e quais tecnologias vai usar."
                value={form.description}
                onChange={handleChange}
                aria-invalid={Boolean(fieldErrors.description)}
                required
              />
              {fieldErrors.description && <span className="field__error">{fieldErrors.description}</span>}
            </div>

            <div className="field">
              <label htmlFor="job-vacancies">Número de vagas</label>
              <input
                id="job-vacancies"
                name="vacancies"
                type="number"
                min={1}
                max={100}
                value={form.vacancies}
                onChange={handleChange}
                aria-invalid={Boolean(fieldErrors.vacancies)}
                required
              />
              {fieldErrors.vacancies && <span className="field__error">{fieldErrors.vacancies}</span>}
            </div>

            {formMessage && (
              <p className={`alert ${formMessage.type === 'success' ? 'alert--success' : 'alert--error'}`} role="status">
                {formMessage.text}
              </p>
            )}

            <button type="submit" className="btn btn--primary" disabled={submitting}>
              {submitting ? 'Publicando...' : 'Publicar cargo'}
            </button>
          </form>
        </section>

        <section>
          <div className="section-head">
            <h2>Meus cargos</h2>
            <button type="button" className="btn btn--outline btn--small" onClick={loadJobs} disabled={loading}>
              {loading ? 'Atualizando...' : 'Atualizar'}
            </button>
          </div>

          {loadError && (
            <p className="alert alert--error" role="alert">
              {loadError}
            </p>
          )}

          {!loading && !loadError && jobs.length === 0 && (
            <p className="empty">Você ainda não publicou nenhum cargo. Use o formulário ao lado para começar.</p>
          )}

          <ul className="job-list">
            {jobs.map((job) => (
              <li key={job.id} className="job-card">
                <div className="job-card__head">
                  <div>
                    <h3>{job.title}</h3>
                    <p className="job-card__meta">Publicado em {formatDate(job.createdAt)}</p>
                  </div>
                  <StatusBadge status={job.status} />
                </div>

                <p className="job-card__desc">{job.description}</p>
                <ProgressBar value={job.applicationsCount} max={job.vacancies} />

                <div className="candidates">
                  <h4>Candidatos inscritos ({job.applications.length})</h4>
                  <CandidateList applications={job.applications} />
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
