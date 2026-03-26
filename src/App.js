import React from 'react';
import './App.css';
import CriarFormulario from './components/CriarFormulario';

function App() {
  return (
    <div className="App">
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
