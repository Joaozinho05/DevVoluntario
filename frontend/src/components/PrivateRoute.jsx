import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// Protege uma rota por autenticação e (opcionalmente) por perfil.
//   <PrivateRoute><Page /></PrivateRoute>                   -> qualquer usuário logado
//   <PrivateRoute roles={['ADMIN']}><Page /></PrivateRoute> -> apenas ADMIN
export default function PrivateRoute({ roles, children }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (roles?.length && !roles.includes(user.role)) {
    return <Navigate to="/nao-autorizado" replace />;
  }

  return children ?? <Outlet />;
}
