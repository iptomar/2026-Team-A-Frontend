import React, { useState, useEffect } from 'react';

const SelecaoFormularios = ({ onSelectForm }) => {
  const [formularios, setFormularios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarFormularios = async () => {
      setLoading(true);
      try {
        const resposta = await fetch('http://localhost:3000/api/forms');
        if (resposta.ok) {
          const dados = await resposta.json();
          // Apenas formulários que estão no estado 'Publicado'
          setFormularios(dados.filter(f => f.estado === 'Publicado'));
        }
      } catch (erro) {
        console.error('Erro ao carregar:', erro);
      } finally {
        setLoading(false);
      }
    };

    carregarFormularios();
  }, []);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>A carregar formulários ativos...</div>;
  }

  if (formularios.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
        <p>Não existem formulários ativos de momento.</p>
      </div>
    );
  }

  return (
    <div className="selecao-formularios">
      <div style={{ marginBottom: '2rem' }}>
        <h2>Selecione um Formulário</h2>
        <p style={{ color: 'var(--text-muted)' }}>Escolha um dos formulários abaixo para submeter o seu pedido.</p>
      </div>

      <div className="grid-container">
        {formularios.map((form) => (
          <div key={form._id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ marginBottom: '0.5rem' }}>{form.titulo}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                {form.descricao || 'Sem descrição disponível.'}
              </p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="status-badge status-publicado">Ativo</span>
              <button 
                className="btn-primary"
                onClick={() => onSelectForm(form)}
                style={{ padding: '8px 15px' }}
              >
                Selecionar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SelecaoFormularios;
