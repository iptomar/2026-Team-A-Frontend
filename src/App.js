import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import EcraAdmin from './components/EcraAdmin';
import CriarFormulario from './components/CriarFormulario';
import EcraProfessor from './components/EcraProfessor';
import OsMeusPedidos from './components/OsMeusPedidos';
import GerirPedidos from './components/GerirPedidos';
import './App.css';
import EditarFormulario from './components/EditarFormulario';

const ProtectedRoute = ({ children, roleRequired }) => {
  const token = localStorage.getItem('token');
  const userString = localStorage.getItem('user');
  
  if (!token || !userString) return <Navigate to="/" replace />;
  
  const user = JSON.parse(userString);
  
  // Se for exigido um cargo específico e o utilizador não o tiver, redireciona
  if (roleRequired && user.role !== roleRequired) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/professor'} replace />;
  }
  
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
          {user.role === 'admin' && (
            <div className="nav-links">
              <button className="btn-secondary" onClick={() => window.location.href = '/admin'}>Gerir Formulários</button>
              <button className="btn-secondary" onClick={() => window.location.href = '/gerir-pedidos'}>Gerir Pedidos</button>
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
        
        {/* Rota do Professor */}
        <Route path="/professor" element={
          <ProtectedRoute roleRequired="professor">
            <Layout><EcraProfessor /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/meus-pedidos" element={
          <ProtectedRoute roleRequired="professor">
            <Layout><OsMeusPedidos /></Layout>
          </ProtectedRoute>
        } />

        {/* Rotas do Administrador */}
        <Route path="/admin" element={
          <ProtectedRoute roleRequired="admin">
            <Layout><EcraAdmin /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/criar-formulario" element={
          <ProtectedRoute roleRequired="admin">
            <Layout><CriarFormulario /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/editar-formulario" element={
          <ProtectedRoute roleRequired="admin">
            <Layout><EditarFormulario /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/gerir-pedidos" element={
          <ProtectedRoute roleRequired="admin">
            <Layout><GerirPedidos /></Layout>
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
