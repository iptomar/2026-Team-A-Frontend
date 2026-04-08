import React from 'react';
import './App.css';
import CriarFormulario from './components/CriarFormulario';
import EcraProfessor from './components/EcraProfessor';

function App() {
  return (
    <div className="App">
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