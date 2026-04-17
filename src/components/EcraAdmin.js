import React, { useState, useEffect } from 'react';
import CriarFormulario from './CriarFormulario';
import { useNavigate } from 'react-router-dom';

function EcraAdmin() {
  const [formularios, setFormularios] = useState([]);

  // 1. Ir buscar os formulários reais à Base de Dados
  const carregarFormularios = async () => {
    try {
      const resposta = await fetch('http://localhost:5000/api/formularios'); // Confirma o porto do teu backend
      const dados = await resposta.json();
      setFormularios(dados);
    } catch (erro) {
      console.error('Erro ao carregar formulários:', erro);
    }
  };

  useEffect(() => {
    carregarFormularios();
  }, []);

  // 2. Apagar formulário na API
  const apagarFormulario = async (id) => {
    try {
      const resposta = await fetch(`http://localhost:5000/api/formularios/${id}`, {
        method: 'DELETE',
      });
      
      if (resposta.ok) {
        alert('Formulário apagado com sucesso!');
        carregarFormularios(); // Atualiza a lista no ecrã
      } else {
        const dadosErro = await resposta.json();
        alert(`Erro do Servidor: ${dadosErro.erro}`);
      }
    } catch (erro) {
      console.error('Erro ao apagar:', erro);
    }
  };

  const navigate = useNavigate();

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h2>Painel de Administração</h2>
      <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap', marginTop: '30px' }}>
        
        <div style={{ flex: 1, minWidth: '300px' }}>
          {/* Passamos a função para ele atualizar a lista logo após criar */}
          <CriarFormulario onFormularioCriado={carregarFormularios} />
        </div>

        <div style={{ flex: 1, minWidth: '300px' }}>
          <h3>Gerir Formulários Existentes</h3>
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {formularios.map((form) => (
              <li key={form._id} style={{ border: '1px solid #ccc', margin: '10px 0', padding: '15px', borderRadius: '4px' }}>
                <h4 style={{ margin: '0 0 10px 0' }}>{form.titulo}</h4>
                <p style={{ color: form.estado === 'Publicado' ? 'green' : '#b8860b', margin: '0 0 15px 0' }}>
                  Estado: <strong>{form.estado}</strong>
                </p>
                
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    disabled={form.estado === 'Publicado'}
                    style={{ padding: '8px 15px', cursor: form.estado === 'Publicado' ? 'not-allowed' : 'pointer', opacity: form.estado === 'Publicado' ? 0.5 : 1 }}
                  >
                    Editar
                  </button>
                  

                  <button 
                    onClick={() => apagarFormulario(form._id)} // MongoDB usa _id em vez de id
                    disabled={form.estado === 'Publicado'}
                    style={{ padding: '8px 15px', backgroundColor: form.estado === 'Publicado' ? '#ccc' : '#dc3545', color: form.estado === 'Publicado' ? '#666' : 'white', border: 'none', cursor: form.estado === 'Publicado' ? 'not-allowed' : 'pointer' }}
                  >
                    Apagar
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <button onClick={() => navigate('/editar-formulario')} style={{ padding: '12px', fontSize: '16px', backgroundColor: '#0056b3', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px', marginTop: '10px' }}>
            Editar Formulário (Ir para Ecrã de Edição)
          </button>
        </div>
      </div>
    </div>
  );
}

export default EcraAdmin;