import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import EcraAdmin from './components/EcraAdmin';
import CriarFormulario from './components/CriarFormulario';
import EcraProfessor from './components/EcraProfessor';
import OsMeusPedidos from './components/OsMeusPedidos';
import './App.css';
import EditarFormulario from './components/EditarFormulario';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/" replace />;
  return children;
};

const HomeRedirect = () => {
  const token = localStorage.getItem('token');
  const userString = localStorage.getItem('user');

  if (token && userString) {
    const user = JSON.parse(userString);
    return <Navigate to={user.role === 'admin' ? '/admin' : '/professor'} replace />;
  }
  
  const handleLogin = () => {
    window.location.href = '/';
  };

  return <Login onLogin={handleLogin} />;
};

const Layout = ({ children }) => {
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : { email: 'Utilizador' };

  return (
    <div className="App">
      <nav className="navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <h1 className="navbar-brand" style={{ cursor: 'pointer' }} onClick={() => window.location.href = '/'}>
            Gestão Horários IPT
          </h1>
          {user.role === 'professor' && (
            <div className="nav-links">
              <button className="btn-secondary" onClick={() => window.location.href = '/professor'}>Formulários</button>
              <button className="btn-secondary" onClick={() => window.location.href = '/meus-pedidos'}>Os Meus Pedidos</button>
            </div>
          )}
        </div>
        <div className="user-section">
          <span className="user-info">Sessão: <strong>{user.email}</strong> ({user.role})</span>
          <button className="btn-logout" onClick={handleLogout}>Sair</button>
        </div>
      </nav>
      <main className="main-content">{children}</main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/register" element={<Register />} />
        <Route path="/professor" element={<ProtectedRoute><Layout><EcraProfessor /></Layout></ProtectedRoute>} />
        <Route path="/meus-pedidos" element={<ProtectedRoute><Layout><OsMeusPedidos /></Layout></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><Layout><EcraAdmin /></Layout></ProtectedRoute>} />
        <Route path="/criar-formulario" element={<ProtectedRoute><Layout><CriarFormulario /></Layout></ProtectedRoute>} />
        <Route path="/editar-formulario" element={<ProtectedRoute><Layout><EditarFormulario /></Layout></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
