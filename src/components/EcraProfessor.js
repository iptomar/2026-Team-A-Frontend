import React, { useState, useEffect } from 'react';

function EcraProfessor() {
  const [formularios, setFormularios] = useState([]);

  // Simulação de carregamento de dados 
  useEffect(() => {
    // Exemplo de dados
    const dadosDaAPI = [
      { id: 1, titulo: 'Alteração de Turno', estado: 'Rascunho' },
      { id: 2, titulo: 'Dúvidas de P.I.', estado: 'Publicado' },
      { id: 3, titulo: 'Inscrição em Exame', estado: 'Publicado' },
      { id: 4, titulo: 'Avaliação Contínua', estado: 'Inativo' }
    ];
    
    setFormularios(dadosDaAPI);
  }, []);

  // Lógica de Filtragem: Mantém apenas os formulários com estado 'Publicado'
  const formulariosVisiveis = formularios.filter(
    (form) => form.estado === 'Publicado'
  );

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', fontFamily: 'Arial' }}>
      <h2>Formulários Disponíveis para Preenchimento</h2>
      
      {formulariosVisiveis.length === 0 ? (
        <p>Não há formulários publicados de momento.</p>
      ) : (
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {/* Mapear e mostrar apenas o array já filtrado */}
          {formulariosVisiveis.map((form) => (
            <li 
              key={form.id} 
              style={{ border: '1px solid #ccc', margin: '10px 0', padding: '15px', borderRadius: '4px' }}
            >
              <h3>{form.titulo}</h3>
              <p style={{ color: 'green', fontSize: '14px' }}>Estado: {form.estado}</p>
              <button style={{ padding: '8px 12px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                Preencher
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default EcraProfessor;