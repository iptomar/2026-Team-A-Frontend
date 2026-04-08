import React, { useState } from 'react';
import Login from './components/Login';
import './App.css';
import CriarFormulario from './components/CriarFormulario';
import EcraProfessor from './components/EcraProfessor';

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
      
      <main style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', padding: '20px' }}>
        
        {/* Secção de Criação (ex: Secretaria / Admin) */}
        <div style={{ flex: 1, minWidth: '300px' }}>
          <CriarFormulario />
        </div>

        {/* Secção de Visualização (Ecrã do Professor) */}
        <div style={{ flex: 1, minWidth: '300px' }}>
          <EcraProfessor />
        </div>

      </main>
    </div>
  );
}

export default App;