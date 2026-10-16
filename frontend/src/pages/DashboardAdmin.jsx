import { useCallback, useEffect, useState } from 'react';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import RoleBadge from '../components/RoleBadge.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { adminApi, jobsApi } from '../services/api.js';
import { formatDate } from '../utils/format.js';

export default function DashboardAdmin() {
  const { token, user: currentUser } = useAuth();
  const [tab, setTab] = useState('users'); // 'users' | 'jobs'
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState(null);

  const [pending, setPending] = useState(null); // { type: 'user' | 'job', item }
  const [deleting, setDeleting] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [usersData, jobsData] = await Promise.all([adminApi.users(token), jobsApi.list()]);
      setUsers(usersData.users);
      setJobs(jobsData.jobs);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const confirmDelete = async () => {
    if (!pending) return;
    setDeleting(true);
    setFeedback(null);

    try {
      if (pending.type === 'user') {
        await adminApi.deleteUser(token, pending.item.id);
        setFeedback({ type: 'success', text: `Usuário "${pending.item.name}" excluído.` });
      } else {
        await adminApi.deleteJob(token, pending.item.id);
        setFeedback({ type: 'success', text: `Cargo "${pending.item.title}" excluído.` });
      }
      setPending(null);
      await loadAll(); // excluir um usuário também remove cargos e candidaturas dele
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
      setPending(null);
    } finally {
      setDeleting(false);
    }
  };

  const dialog =
    pending?.type === 'user'
      ? {
          title: 'Excluir usuário?',
          message: `A conta de ${pending.item.name} (${pending.item.email}) será removida, junto com os cargos e as candidaturas dela. Essa ação não pode ser desfeita.`,
        }
      : {
          title: 'Excluir cargo?',
          message: `O cargo "${pending?.item.title}" será removido, junto com as candidaturas recebidas. Essa ação não pode ser desfeita.`,
        };

  return (
    <div className="page page--wide">
      <header className="page__header">
        <h1>Painel da administração</h1>
        <p>Gerencie usuários e cargos de toda a plataforma.</p>
      </header>

      <div className="tabs" role="tablist" aria-label="Gerenciar">
        <button
          type="button"
          role="tab"
          id="tab-users"
          className="tab"
          aria-selected={tab === 'users'}
          aria-controls="panel-users"
          onClick={() => setTab('users')}
        >
          Usuários ({users.length})
        </button>
        <button
          type="button"
          role="tab"
          id="tab-jobs"
          className="tab"
          aria-selected={tab === 'jobs'}
          aria-controls="panel-jobs"
          onClick={() => setTab('jobs')}
        >
          Cargos ({jobs.length})
        </button>
      </div>

      {feedback && (
        <p
          className={`alert ${feedback.type === 'success' ? 'alert--success' : 'alert--error'}`}
          role={feedback.type === 'success' ? 'status' : 'alert'}
        >
          {feedback.text}
        </p>
      )}

      {error && (
        <p className="alert alert--error" role="alert">
          {error}
        </p>
      )}

      {tab === 'users' && (
        <section id="panel-users" role="tabpanel" aria-labelledby="tab-users" className="panel">
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>E-mail</th>
                  <th>Perfil</th>
                  <th>Cargos</th>
                  <th>Candidaturas</th>
                  <th>Criado em</th>
                  <th>
                    <span className="visually-hidden">Ações</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((item) => {
                  const isSelf = item.id === currentUser.id;
                  return (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>{item.email}</td>
                      <td>
                        <RoleBadge role={item.role} />
                      </td>
                      <td>{item._count.jobs}</td>
                      <td>{item._count.applications}</td>
                      <td>{formatDate(item.createdAt)}</td>
                      <td className="table__actions">
                        <button
                          type="button"
                          className="btn btn--danger btn--small"
                          disabled={isSelf}
                          title={isSelf ? 'Você não pode excluir a própria conta' : undefined}
                          onClick={() => setPending({ type: 'user', item })}
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {!loading && users.length === 0 && <p className="empty">Nenhum usuário cadastrado.</p>}
        </section>
      )}

      {tab === 'jobs' && (
        <section id="panel-jobs" role="tabpanel" aria-labelledby="tab-jobs" className="panel">
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Cargo</th>
                  <th>Empresa</th>
                  <th>Vagas preenchidas</th>
                  <th>Situação</th>
                  <th>Criado em</th>
                  <th>
                    <span className="visually-hidden">Ações</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((item) => (
                  <tr key={item.id}>
                    <td>{item.title}</td>
                    <td>{item.company.name}</td>
                    <td>
                      {item.applicationsCount} / {item.vacancies}
                    </td>
                    <td>
                      <StatusBadge status={item.status} />
                    </td>
                    <td>{formatDate(item.createdAt)}</td>
                    <td className="table__actions">
                      <button
                        type="button"
                        className="btn btn--danger btn--small"
                        onClick={() => setPending({ type: 'job', item })}
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!loading && jobs.length === 0 && <p className="empty">Nenhum cargo publicado.</p>}
        </section>
      )}

      <ConfirmDialog
        open={Boolean(pending)}
        title={dialog.title}
        message={dialog.message}
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setPending(null)}
      />
    </div>
  );
}
