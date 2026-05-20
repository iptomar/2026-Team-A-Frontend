import React, { useState, useEffect } from 'react';

function EcraProfessor() {
  const [formularios, setFormularios] = useState([]);
  const [formSelecionado, setFormSelecionado] = useState(null);
  const [respostas, setRespostas] = useState({});
  const [erros, setErros] = useState({});
  const [loading, setLoading] = useState(true);

  // Dados de exemplo para ocupação (Mock)
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

  // LÓGICA DE VALIDAÇÃO REFINADA
  const validarCampos = (novasRespostas) => {
    const novosErros = {};
    
    // 1. Procurar campos de Sala e Data no formulário atual
    const campoSala = formSelecionado?.campos.find(c => 
      c.etiqueta.toLowerCase().includes('sala') || c.etiqueta.toLowerCase().includes('room')
    );
    const campoData = formSelecionado?.campos.find(c => c.tipo === 'Data');

    // 2. Validar Ocupação de Sala
    if (campoSala && campoData) {
      const salaId = campoSala._id || campoSala.id;
      const dataId = campoData._id || campoData.id;
      
      const salaValue = novasRespostas[salaId];
      const dataValue = novasRespostas[dataId];

      if (salaValue && dataValue) {
        const ocupada = ocupacaoExistente.some(o => 
          o.sala.toLowerCase() === salaValue.toLowerCase() && o.data === dataValue
        );
        if (ocupada) {
          novosErros[salaId] = 'Sala ocupada nesta data!';
        }
      }
    }

    // 3. Validar Datas Futuras (para todos os campos do tipo Data)
    formSelecionado?.campos.forEach(campo => {
      if (campo.tipo === 'Data') {
        const campoId = campo._id || campo.id;
        const valorData = novasRespostas[campoId];
        if (valorData) {
          const hoje = new Date();
          hoje.setHours(0, 0, 0, 0);
          const dataInserida = new Date(valorData);
          if (dataInserida < hoje) {
            novosErros[campoId] = 'Data inválida (selecione uma data futura)';
          }
        }
      }
    });

    setErros(novosErros);
  };

  const handleInputChange = (campoId, valor) => {
    const novasRespostas = { ...respostas, [campoId]: valor };
    setRespostas(novasRespostas);
    validarCampos(novasRespostas);
  };

  // Lógica Matemática: Verifica se o formulário está completo e sem erros
  const podeSubmeter = formSelecionado && formSelecionado.campos.every(campo => {
    const valor = respostas[campo._id || campo.id];
    const preenchido = valor !== undefined && valor !== null && String(valor).trim() !== '';
    const validacaoObrigatorio = campo.obrigatorio ? preenchido : true;
    const semErroNoCampo = !erros[campo._id || campo.id];
    return validacaoObrigatorio && semErroNoCampo;
  });

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
            {formSelecionado.campos.map((campo) => {
              const campoId = campo._id || campo.id;
              const temErro = !!erros[campoId];

              return (
                <div key={campoId}>
                  <label style={{ fontWeight: '600', display: 'block', marginBottom: '8px' }}>
                    {campo.etiqueta} {campo.obrigatorio && <span style={{ color: 'red' }}>*</span>}
                  </label>
                  
                  <input 
                    className="form-input"
                    type={campo.tipo === 'Data' ? 'date' : 'text'} 
                    onChange={(e) => handleInputChange(campoId, e.target.value)}
                    style={{ 
                      borderColor: temErro ? '#e74c3c' : 'var(--border-color)',
                      borderWidth: temErro ? '2px' : '1px'
                    }}
                    placeholder={campo.tipo === 'Data' ? '' : 'Introduza aqui...'}
                  />

                  {temErro && (
                    <span style={{ color: '#e74c3c', fontSize: '0.85rem', fontWeight: 'bold', marginTop: '5px', display: 'block' }}>
                      ⚠ {erros[campoId]}
                    </span>
                  )}
                </div>
              );
            })}

            <button 
              disabled={!podeSubmeter}
              className="btn-primary"
              style={{ 
                padding: '15px', 
                fontSize: '1.1rem',
                opacity: podeSubmeter ? 1 : 0.6,
                cursor: podeSubmeter ? 'pointer' : 'not-allowed'
              }}
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
