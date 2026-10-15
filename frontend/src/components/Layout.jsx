import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.jsx';

export default function Layout() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-main">
        <Outlet />
      </main>
      <footer className="app-footer">DevVoluntário, projeto do desafio LAB365/SENAI.</footer>
    </div>
  );
}
