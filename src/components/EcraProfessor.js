import React, { useState, useEffect } from 'react';

function EcraProfessor() {
  const [formularios, setFormularios] = useState([]);
  const [formSelecionado, setFormSelecionado] = useState(null);
  const [respostas, setRespostas] = useState({});
  const [erros, setErros] = useState({});
  const [loading, setLoading] = useState(true);

  const ocupacaoExistente = [
    { sala: 'Sala 101', data: '2026-05-20' },
    { sala: 'Auditório A', data: '2026-05-25' }
  ];

  const carregarFormularios = async () => {
    setLoading(true);
    try {
      const resposta = await fetch('http://localhost:3000/api/forms');
      if (resposta.ok) {
        const dados = await resposta.json();
        // Filtra apenas os publicados para o professor
        setFormularios(dados.filter(f => f.estado === 'Publicado'));
      }
    } catch (erro) {
      console.error('Erro ao carregar:', erro);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarFormularios();
  }, []);

  const validarCampos = (novasRespostas) => {
    const novosErros = {};
    formSelecionado.campos.forEach(campo => {
      if (campo.tipo === 'Data') {
        const valorData = novasRespostas[campo.id];
        if (valorData) {
          const hoje = new Date();
          hoje.setHours(0, 0, 0, 0);
          const dataInserida = new Date(valorData);
          if (dataInserida < hoje) {
            novosErros[campo.id] = 'Data inválida (selecione uma data futura)';
          }
        }
      }
    });

    const campoSala = formSelecionado.campos.find(c => c.etiqueta.toLowerCase().includes('sala'));
    const campoData = formSelecionado.campos.find(c => c.tipo === 'Data');

    if (campoSala && campoData) {
      const salaValue = novasRespostas[campoSala.id];
      const dataValue = novasRespostas[campoData.id];

      if (salaValue && dataValue) {
        const ocupada = ocupacaoExistente.some(o => o.sala === salaValue && o.data === dataValue);
        if (ocupada) {
          novosErros[campoSala.id] = 'Sala ocupada';
        }
      }
    }
    setErros(novosErros);
  };

  const handleInputChange = (campoId, valor) => {
    const novasRespostas = { ...respostas, [campoId]: valor };
    setRespostas(novasRespostas);
    validarCampos(novasRespostas);
  };

  const handleSubmeter = async () => {
    try {
      const token = localStorage.getItem('token');
      const resposta = await fetch('http://localhost:3000/api/submissoes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          formularioId: formSelecionado._id,
          tituloFormulario: formSelecionado.titulo,
          respostas: respostas
        })
      });

      if (resposta.ok) {
        alert('Pedido submetido com sucesso!');
        setFormSelecionado(null);
        setRespostas({});
      } else {
        const errorData = await resposta.json();
        alert('Erro ao submeter: ' + (errorData.error || 'Erro desconhecido'));
      }
    } catch (erro) {
      console.error('Erro na submissão:', erro);
      alert('Erro de ligação ao servidor.');
    }
  };

  if (formSelecionado) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <button 
          onClick={() => { setFormSelecionado(null); setErros({}); setRespostas({}); }} 
          className="btn-logout"
          style={{ marginBottom: '20px' }}
        >
          ← Voltar aos Formulários
        </button>
        
        <div className="card">
          <div style={{ borderBottom: '1px solid var(--border-color)', marginBottom: '2rem', paddingBottom: '1rem' }}>
            <h2>{formSelecionado.titulo}</h2>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>{formSelecionado.descricao}</p>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {formSelecionado.campos.map((campo) => (
              <div key={campo._id || campo.id}>
                <label style={{ fontWeight: '600', display: 'block', marginBottom: '8px' }}>{campo.etiqueta}</label>
                
                <input 
                  className="form-input"
                  type={campo.tipo === 'Data' ? 'date' : 'text'} 
                  onChange={(e) => handleInputChange(campo._id || campo.id, e.target.value)}
                  style={{ borderColor: erros[campo._id || campo.id] ? 'var(--error-text)' : 'var(--border-color)' }}
                />

                {erros[campo._id || campo.id] && (
                  <span style={{ color: 'var(--error-text)', fontSize: '0.85rem', fontWeight: '600', marginTop: '5px', display: 'block' }}>
                    ⚠ {erros[campo._id || campo.id]}
                  </span>
                )}
              </div>
            ))}

            <button 
              disabled={Object.keys(erros).length > 0}
              className="btn-primary"
              style={{ padding: '15px', fontSize: '1.1rem' }}
              onClick={handleSubmeter}
            >
              Submeter Requisição
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h2>Formulários Disponíveis</h2>
        <p style={{ color: 'var(--text-muted)' }}>Selecione um formulário para iniciar o preenchimento.</p>
      </div>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>A carregar formulários...</div>
      ) : formularios.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          Não há formulários publicados de momento.
        </div>
      ) : (
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
                <span className="status-badge status-publicado">Disponível</span>
                <button 
                  className="btn-primary"
                  onClick={() => setFormSelecionado(form)}
                  style={{ padding: '8px 15px' }}
                >
                  Preencher
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default EcraProfessor;
