import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import './App.css';
import EcraAdmin from './components/EcraAdmin';
import CriarFormulario from './components/CriarFormulario';
import EcraProfessor from './components/EcraProfessor';
import './App.css';

// 1. Componente Route Guard (Barreira de Segurança)
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token'); // Verifica o token de sessão
  
  if (!token) {
    // Se não há token, expulsa para o login
    return <Navigate to="/" replace />;
  }
  return children;
};

// 2. Layout para as páginas protegidas (inclui o botão de Sair)
const Layout = ({ children }) => {
  const handleLogout = () => {
    localStorage.removeItem('token'); // Limpa a sessão
    window.location.href = '/';
  };

  return (
    <div className="App">
      <div style={{ textAlign: 'right', padding: '10px', backgroundColor: '#f8f9fa' }}>
        <span>Sessão: <strong>{user.name}</strong></span>
        <button onClick={handleLogout} style={{ marginLeft: '10px' }}>Sair</button>
      </div>
      <header className="App-header">
        <h1>Sistema de Gestão de Horários - IPT</h1>
      </header>
      
      <main style={{ padding: '20px' }}>
        {/* Rota condicional baseada no tipo de utilizador */}
        {user.role === 'admin' ? (
          <EcraAdmin />
        ) : user.role === 'professor' ? (
          <EcraProfessor />
        ) : null}
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Rota Pública */}
        <Route path="/" element={<Login />} />

        {/* Rotas Protegidas (Route Guards) */}
        <Route 
          path="/professor" 
          element={
            <ProtectedRoute>
              <Layout>
                <EcraProfessor />
              </Layout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/criar-formulario" 
          element={
            <ProtectedRoute>
              <Layout>
                <CriarFormulario />
              </Layout>
            </ProtectedRoute>
          } 
        />

        {/* Redirecionar qualquer outra rota para o login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;