import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import PublicRoute from './components/PublicRoute.jsx';
import Dashboard from './pages/Dashboard.jsx';
import DashboardAdmin from './pages/DashboardAdmin.jsx';
import DashboardEmpresa from './pages/DashboardEmpresa.jsx';
import DashboardTrabalhador from './pages/DashboardTrabalhador.jsx';
import Login from './pages/Login.jsx';
import NotFound from './pages/NotFound.jsx';
import Register from './pages/Register.jsx';
import Unauthorized from './pages/Unauthorized.jsx';
import { ROLES } from './utils/roles.js';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Rotas públicas (redirecionam quem já está logado) */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

        {/* /dashboard encaminha cada perfil para a sua tela */}
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />

        {/* As 3 telas principais, protegidas por RBAC */}
        <Route
          path="/dashboard-empresa"
          element={
            <PrivateRoute roles={[ROLES.EMPRESA]}>
              <DashboardEmpresa />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard-trabalhador"
          element={
            <PrivateRoute roles={[ROLES.TRABALHADOR]}>
              <DashboardTrabalhador />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard-admin"
          element={
            <PrivateRoute roles={[ROLES.ADMIN]}>
              <DashboardAdmin />
            </PrivateRoute>
          }
        />

        <Route path="/nao-autorizado" element={<Unauthorized />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
