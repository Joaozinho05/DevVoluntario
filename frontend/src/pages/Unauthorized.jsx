import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { ROLE_HOME } from '../utils/roles.js';

export default function Unauthorized() {
  const { user } = useAuth();

  return (
    <div className="page page--narrow">
      <h1>Você não tem acesso a esta página</h1>
      <p>Seu perfil não tem permissão para abrir esta área.</p>
      <Link to={user ? ROLE_HOME[user.role] : '/login'} className="btn btn--primary">
        {user ? 'Voltar ao meu painel' : 'Entrar'}
      </Link>
    </div>
  );
}
