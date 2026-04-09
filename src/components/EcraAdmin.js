import React from 'react';
import CriarFormulario from './CriarFormulario';

function EcraAdmin() {
  return (
    <div style={{ padding: '20px' }}>
      <h2>Painel de Administração</h2>
      <p>Bem-vindo ao painel administrativo. Aqui podes gerir e criar formulários.</p>
      <CriarFormulario />
    </div>
  );
}

export default EcraAdmin;
