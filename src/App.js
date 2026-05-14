import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import EcraAdmin from './components/EcraAdmin';
import CriarFormulario from './components/CriarFormulario';
import EcraProfessor from './components/EcraProfessor';
import './App.css';
import EditarFormulario from './components/EditarFormulario';
import DefinicoesVisuais from './components/DefinicoesVisuais';

// 1. Guard de Rotas (Protege páginas internas)
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/" replace />;
  return children;
};

// 2. Redirecionamento da Home (Se já tiver token, vai para o dashboard)
const HomeRedirect = () => {
  const token = localStorage.getItem('token');
  const userString = localStorage.getItem('user');

  if (token && userString) {
    const user = JSON.parse(userString);
    // Redireciona conforme o cargo (role)
    return <Navigate to={user.role === 'admin' ? '/admin' : '/professor'} replace />;
  }
  
  // Se não tem token, mostra o Login e trata o login com armazenamento local
  const handleLogin = (user) => {
    localStorage.setItem('token', 'mock-token');
    localStorage.setItem('user', JSON.stringify(user));
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
  const user = userString ? JSON.parse(userString) : { name: 'Utilizador' };

  // LER AS DEFINIÇÕES VISUAIS GUARDADAS
  // Se não houver cor escolhida, usa o cinzento escuro padrão do React (#282c34)
  const corPrincipal = localStorage.getItem('corPrincipal') || '#282c34'; 
  const logo = localStorage.getItem('logo'); // Pode estar null se o Admin não carregou nada

  return (
    <div className="App">
      <div style={{ textAlign: 'right', padding: '10px', backgroundColor: '#f8f9fa', color: 'black' }}>
        <span>Sessão: <strong>{user.name}</strong></span>
        <button onClick={handleLogout} style={{ marginLeft: '10px' }}>Sair</button>
      </div>
      
      {/* 2. APLICAR A COR E O LOGÓTIPO AO CABEÇALHO */}
      <header 
        className="App-header" 
        style={{ 
          backgroundColor: corPrincipal, 
          padding: logo ? '20px' : '40px', // Ajusta o espaço vertical se houver imagem
          minHeight: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {/* Só mostra a tag da imagem se o logótipo existir na memória */}
        {logo && (
          <img 
            src={logo} 
            alt="Logótipo da Instituição" 
            style={{ maxHeight: '80px', marginBottom: '15px', objectFit: 'contain' }} 
          />
        )}
        <h1 style={{ margin: 0, fontSize: '24px' }}>Sistema de Gestão de Horários - IPT</h1>
      </header>
      
      <main style={{ padding: '20px' }}>{children}</main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Rota Raiz com lógica de redirecionamento inteligente */}
        <Route path="/" element={<HomeRedirect />} />

        {/* Rotas Protegidas */}
        <Route path="/professor" element={<ProtectedRoute><Layout><EcraProfessor /></Layout></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><Layout><EcraAdmin /></Layout></ProtectedRoute>} />
        <Route path="/criar-formulario" element={<ProtectedRoute><Layout><CriarFormulario /></Layout></ProtectedRoute>} />
        <Route path="/editar-formulario" element={<ProtectedRoute><Layout><EditarFormulario /></Layout></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/definicoes-visuais" element={<ProtectedRoute><Layout><DefinicoesVisuais /></Layout></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;