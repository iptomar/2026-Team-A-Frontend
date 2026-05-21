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
import DefinicoesVisuais from './components/DefinicoesVisuais';
import EcraCoordenador from './components/EcraCoordenador'; 

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
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'coordenador') return <Navigate to="/coordenador" replace />; 
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

  // LER AS DEFINIÇÕES VISUAIS GUARDADAS
  // Se não houver cor escolhida, usa o cinzento escuro padrão do React (#282c34)
  const [corPrincipal, setCorPrincipal] = React.useState(localStorage.getItem('corPrincipal') || '#282c34'); 
  const [logo, setLogo] = React.useState(localStorage.getItem('logo')); 

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
      {/* Navbar com fundo branco */}
      <nav className="navbar" style={{ backgroundColor: '#ffffff', borderTop: `4px solid ${corPrincipal}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          
          {/* Logótipo ao lado do título */}
          {logo && (
            <img 
              src={logo} 
              alt="Logótipo da Instituição" 
              style={{ maxHeight: '40px', objectFit: 'contain', cursor: 'pointer' }} 
              onClick={() => window.location.href = '/'}
            />
          )}

  
          <h1 className="navbar-brand" style={{ cursor: 'pointer', margin: 0 }} onClick={() => window.location.href = '/'}>
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
          {user.role === 'coordenador' && (
            <div className="nav-links">
              <button className="btn-secondary" onClick={() => window.location.href = '/coordenador'}>Dashboard Coordenador</button>
              <button className="btn-secondary" onClick={() => window.location.href = '/gerir-pedidos'}>Gerir Pedidos</button>
            </div>
          )}
        
        </div>

        {/* secção de utilizador da equipa com o botão de Sair */}
        <div className="user-section">
          <span className="user-info">Sessão: <strong>{user.name || user.email}</strong> ({user.role})</span>
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
        <Route path="/detalhes-pedido/:id" element={
          <ProtectedRoute roleRequired="professor">
            <Layout><DetalhesPedido /></Layout>
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
        <Route path="/definicoes-visuais" element={<ProtectedRoute><Layout><DefinicoesVisuais /></Layout></ProtectedRoute>} />
        <Route path="/coordenador" element={<ProtectedRoute><Layout><EcraCoordenador /></Layout></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
