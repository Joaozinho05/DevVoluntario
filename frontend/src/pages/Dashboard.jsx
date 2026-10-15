import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { ROLE_HOME } from '../utils/roles.js';

// /dashboard apenas encaminha cada perfil para o seu painel.
export default function Dashboard() {
  const { user } = useAuth();
  return <Navigate to={ROLE_HOME[user.role]} replace />;
}
