import React, { useState } from 'react';
import SelecaoFormularios from './SelecaoFormularios';

function EcraProfessor() {
  const [formSelecionado, setFormSelecionado] = useState(null);
  const [respostas, setRespostas] = useState({});
  const [erros, setErros] = useState({});

  // Dados de exemplo para ocupação (Mock)
  const ocupacaoExistente = [
    { sala: 'Sala 101', data: '2026-05-20' },
    { sala: 'Auditório A', data: '2026-05-25' }
  ];

  // LÓGICA DE VALIDAÇÃO REFINADA
  const validarCampos = (novasRespostas) => {
    const novosErros = {};
    
    // 1. Procurar campos de Sala e Data no formulário atual
    const campoSala = formSelecionado.campos.find(c => 
      c.etiqueta.toLowerCase().includes('sala') || c.etiqueta.toLowerCase().includes('room')
    );
    const campoData = formSelecionado.campos.find(c => c.tipo === 'Data');

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
    formSelecionado.campos.forEach(campo => {
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
                    <span style={{ 
                      color: '#e74c3c', 
                      fontSize: '0.85rem', 
                      fontWeight: 'bold', 
                      marginTop: '5px', 
                      display: 'block' 
                    }}>
                      ⚠ {erros[campoId]}
                    </span>
                  )}
                </div>
              );
            })}

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

  return <SelecaoFormularios onSelectForm={setFormSelecionado} />;
}

export default EcraProfessor;
