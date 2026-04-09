import React, { useState } from 'react';
import Login from './components/Login';
import './App.css';
import EcraAdmin from './components/EcraAdmin';
import EcraProfessor from './components/EcraProfessor';

function App() {
  const [user, setUser] = useState(null);

  if (!user) {
    return <Login onLogin={(userData) => setUser(userData)} />;
  }

  return (
    <div className="App">
      <div style={{ textAlign: 'right', padding: '10px', backgroundColor: '#f8f9fa' }}>
        <span>Sessão: <strong>{user.name}</strong></span>
        <button onClick={() => setUser(null)} style={{ marginLeft: '10px' }}>Sair</button>
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
}

export default App;