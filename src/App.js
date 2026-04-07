import React, { useState } from 'react';
import Login from './components/Login';
import './App.css';
import CriarFormulario from './components/CriarFormulario';

function App() {
  const [user, setUser] = useState(null);

  if (!user) {
    return <Login onLogin={(role) => setUser(role)} />;
  }


  return (
    <div className="App">
      <div style={{ textAlign: 'right', padding: '10px', backgroundColor: '#f8f9fa' }}>
        <span>Sessão: <strong>{user}</strong></span>
        <button onClick={() => setUser(null)} style={{ marginLeft: '10px' }}>Sair</button>
      </div>
      <header className="App-header">
        <h1>Sistema de Gestão de Horários - IPT</h1>
      </header>
      
      <main>
        {/* O teu componente é chamado aqui */}
        <CriarFormulario />
      </main>
    </div>
  );
}

export default App;
