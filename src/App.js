import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import EcraAdmin from './components/EcraAdmin';
import CriarFormulario from './components/CriarFormulario';
import EcraProfessor from './components/EcraProfessor';
import './App.css';

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

  const user = JSON.parse(localStorage.getItem('user') || '{"name":"Utilizador"}');

  return (
    <div className="App">
      <div style={{ textAlign: 'right', padding: '10px', backgroundColor: '#f8f9fa' }}>
        <span>Sessão: <strong>{user.name}</strong></span>
        <button onClick={handleLogout} style={{ marginLeft: '10px' }}>Sair</button>
      </div>
      <header className="App-header">
        <h1>Sistema de Gestão de Horários - IPT</h1>
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

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;