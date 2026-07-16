import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import EcraAdmin from './components/EcraAdmin';
import CriarFormulario from './components/CriarFormulario';
import EcraProfessor from './components/EcraProfessor';
import OsMeusPedidos from './components/OsMeusPedidos';
import GerirPedidos from './components/GerirPedidos';
import DetalhesPedido from './components/DetalhesPedido';
import './App.css';
import EditarFormulario from './components/EditarFormulario';
import EcraCoordenador from './components/EcraCoordenador';
import GerirSalas from './components/GerirSalas';

const ProtectedRoute = ({ children, roleRequired }) => {
  const token = localStorage.getItem('token');
  const userString = localStorage.getItem('user');

  if (!token || !userString) return <Navigate to="/" replace />;

  const user = JSON.parse(userString);

  // Se for exigido um cargo específico (ou lista de cargos) e o utilizador não o tiver, redireciona
  if (roleRequired) {
    const roles = Array.isArray(roleRequired) ? roleRequired : [roleRequired];
    if (!roles.includes(user.role)) {
      // Redirecionamento inteligente baseado no cargo atual
      if (user.role === 'admin') return <Navigate to="/admin" replace />;
      if (user.role === 'coordenador' || user.role === 'diretor') return <Navigate to="/coordenador" replace />;
      if (user.role === 'aluno') return <Navigate to="/aluno" replace />;
      return <Navigate to="/professor" replace />;
    }
  }

  return children;
};

const HomeRedirect = () => {
  const token = localStorage.getItem('token');
  const userString = localStorage.getItem('user');

  if (token && userString) {
    const user = JSON.parse(userString);
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'coordenador' || user.role === 'diretor') return <Navigate to="/coordenador" replace />;
    if (user.role === 'aluno') return <Navigate to="/aluno" replace />;
    return <Navigate to="/professor" replace />;
  }

  return <Login onLogin={() => window.location.href = '/'} />;
};

const Layout = ({ children }) => {
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : { name: 'Utilizador' };

  const [corPrincipal, setCorPrincipal] = React.useState(localStorage.getItem('corPrincipal') || '#28a745');
  const [logo, setLogo] = React.useState(localStorage.getItem('logo'));
  const [theme, setTheme] = React.useState(localStorage.getItem('theme') || 'light');

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  React.useEffect(() => {
    const carregarVisual = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/settings/visual');
        if (response.ok) {
          const data = await response.json();
          if (data.corPrincipal) {
            setCorPrincipal(data.corPrincipal);
            localStorage.setItem('corPrincipal', data.corPrincipal);
          }
          if (data.logo) {
            setLogo(data.logo);
            localStorage.setItem('logo', data.logo);
          }
        }
      } catch (err) {
        console.error('Erro ao carregar visual:', err);
      }
    };

    if (!localStorage.getItem('corPrincipal') || !localStorage.getItem('logo')) {
      carregarVisual();
    }
  }, []);

  return (
    <div className="App">
      <nav className="navbar" style={{ backgroundColor: 'var(--navbar-bg)', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          {logo && (
            <img
              src={logo}
              alt="Logótipo da Instituição"
              style={{ maxHeight: '40px', objectFit: 'contain', cursor: 'pointer' }}
              onClick={() => window.location.href = '/'}
            />
          )}

          <h1 className="navbar-brand" style={{ cursor: 'pointer', margin: 0, color: 'var(--text-main)' }} onClick={() => window.location.href = '/'}>
            SmartForms
          </h1>

          {(user.role === 'professor' || user.role === 'aluno') && (
            <div className="nav-links">
              <button className="btn-secondary" onClick={() => window.location.href = user.role === 'aluno' ? '/aluno' : '/professor'}>Formulários</button>
              <button className="btn-secondary" onClick={() => window.location.href = '/meus-pedidos'}>Os Meus Pedidos</button>
            </div>
          )}

          {(user.role === 'admin' || user.role === 'coordenador' || user.role === 'diretor') && (
            <div className="nav-links">
              {user.role === 'admin' && (
                <>
                  <button className="btn-secondary" onClick={() => window.location.href = '/admin'}>
                    Gerir Formulários
                  </button>
                  <button className="btn-secondary" onClick={() => window.location.href = '/gerir-salas'}>
                    Gerir Salas
                  </button>
                </>
              )}
              <button className="btn-secondary" onClick={() => window.location.href = '/coordenador'}>
                Dashboard {user.role === 'diretor' ? 'Diretor' : 'Coordenador'}
              </button>
              <button className="btn-secondary" onClick={() => window.location.href = '/gerir-pedidos'}>
                Gerir Pedidos
              </button>
            </div>
          )}
        </div>

        <div className="user-section" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button
            onClick={toggleTheme}
            className="btn-secondary"
            style={{ padding: '5px 10px', fontSize: '1.2rem', border: '1px solid transparent' }}
            title="Alternar Modo Claro/Escuro"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <span className="user-info" style={{ color: 'var(--text-main)' }}>Sessão: <strong>{user.name || user.email}</strong> ({user.role})</span>
          <button className="btn-logout" onClick={handleLogout}>Sair</button>
        </div>
      </nav>

      <main className="main-content" style={{ padding: '2rem' }}>{children}</main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/register" element={<Register />} />

        <Route path="/professor" element={
          <ProtectedRoute roleRequired="professor">
            <Layout><EcraProfessor /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/aluno" element={
          <ProtectedRoute roleRequired="aluno">
            <Layout><EcraProfessor /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/meus-pedidos" element={
          <ProtectedRoute roleRequired={['professor', 'aluno']}>
            <Layout><OsMeusPedidos /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/detalhes-pedido/:id" element={
          <ProtectedRoute roleRequired={['professor', 'aluno', 'admin', 'coordenador', 'diretor']}>
            <Layout><DetalhesPedido /></Layout>
          </ProtectedRoute>
        } />

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
        <Route path="/editar-formulario/:id" element={
          <ProtectedRoute roleRequired="admin">
            <Layout><EditarFormulario /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/gerir-pedidos" element={
          <ProtectedRoute roleRequired={['admin', 'coordenador', 'diretor']}>
            <Layout><GerirPedidos /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/gerir-salas" element={
          <ProtectedRoute roleRequired="admin">
            <Layout><GerirSalas /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/coordenador" element={
          <ProtectedRoute roleRequired={['admin', 'coordenador', 'diretor']}>
            <Layout><EcraCoordenador /></Layout>
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
