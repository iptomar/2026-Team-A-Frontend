import React, { useState, useEffect, useMemo } from 'react';
import { agruparFormulariosPorCategoria } from '../utils/formUtils';

function EcraProfessor() {
  const [formularios, setFormularios] = useState([]);
  const [formSelecionado, setFormSelecionado] = useState(null);
  const [respostas, setRespostas] = useState({});
  const [erros, setErros] = useState({});
  const [loading, setLoading] = useState(true);
  const [ocupacaoReal, setOcupacaoReal] = useState([]);

  const carregarOcupacao = async () => {
    try {
      const token = localStorage.getItem('token');
      const resposta = await fetch('http://localhost:3000/api/submissoes/ocupacao', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resposta.ok) {
        const dados = await resposta.json();
        setOcupacaoReal(dados);
      }
    } catch (erro) {
      console.error('Erro ao carregar ocupação:', erro);
    }
  };

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
    carregarOcupacao();
  }, []);

  const formulariosAgrupados = useMemo(() => agruparFormulariosPorCategoria(formularios), [formularios]);

  // LÓGICA DE VALIDAÇÃO REFINADA (SMART)
  const validarCampos = (novasRespostas) => {
    const novosErros = {};
    
    // 1. Procurar campos de Sala, Data e Horário no formulário atual
    const campoSala = formSelecionado?.campos.find(c => 
      c.etiqueta.toLowerCase().includes('sala') || c.etiqueta.toLowerCase().includes('room')
    );
    const campoData = formSelecionado?.campos.find(c => c.tipo === 'Data');
    
    const campoInicio = formSelecionado?.campos.find(c => 
      c.etiqueta.toLowerCase().includes('início') || c.etiqueta.toLowerCase().includes('inicio') || c.etiqueta.toLowerCase().includes('entrada')
    );
    const campoFim = formSelecionado?.campos.find(c => 
      c.etiqueta.toLowerCase().includes('fim') || c.etiqueta.toLowerCase().includes('saída') || c.etiqueta.toLowerCase().includes('saida')
    );

    // 2. Validar Ocupação de Sala (Real com Overlap de Horas)
    if (campoSala && campoData) {
      const salaId = campoSala._id || campoSala.id;
      const dataId = campoData._id || campoData.id;
      const inicioId = campoInicio?._id || campoInicio?.id;
      const fimId = campoFim?._id || campoFim?.id;
      
      const salaValue = novasRespostas[salaId];
      const dataValue = novasRespostas[dataId];
      const inicioValue = inicioId ? novasRespostas[inicioId] : null;
      const fimValue = fimId ? novasRespostas[fimId] : null;

      if (salaValue && dataValue) {
        const conflito = ocupacaoReal.find(o => {
          // Mesma sala e mesmo dia?
          if (o.sala.toLowerCase() === salaValue.toLowerCase() && o.data === dataValue) {
            // Se ambos tiverem horas definidas, verificamos overlap
            if (inicioValue && fimValue && o.inicio && o.fim) {
              return (inicioValue < o.fim && fimValue > o.inicio);
            }
            // Se um deles não tiver horas (ex: reserva de dia inteiro), assumimos conflito
            return true;
          }
          return false;
        });

        if (conflito) {
          const infoHoras = (conflito.inicio && conflito.fim) ? ` das ${conflito.inicio} às ${conflito.fim}` : ' (dia inteiro)';
          novosErros[salaId] = `Sala já reservada neste dia${infoHoras}!`;
        }
      }
    }

    // 3. Validar Horários (Fim > Início)
    if (campoInicio && campoFim) {
      const inicioId = campoInicio._id || campoInicio.id;
      const fimId = campoFim._id || campoFim.id;
      
      const inicioValue = novasRespostas[inicioId];
      const fimValue = novasRespostas[fimId];

      if (inicioValue && fimValue && inicioValue >= fimValue) {
        novosErros[fimId] = 'A hora de fim deve ser posterior à de início.';
      }
    }

    // 4. Validar Datas Futuras (para todos os campos do tipo Data)
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

  const [submetidoComSucesso, setSubmetidoComSucesso] = useState(false);

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
        setSubmetidoComSucesso(true);
        setRespostas({});
        // Voltar à lista após 3 segundos
        setTimeout(() => {
          setFormSelecionado(null);
          setSubmetidoComSucesso(false);
        }, 3000);
      } else {
        const errorData = await resposta.json();
        alert('Erro ao submeter: ' + (errorData.error || 'Erro desconhecido'));
      }
    } catch (erro) {
      console.error('Erro na submissão:', erro);
      alert('Erro de ligação ao servidor.');
    }
  };

  if (submetidoComSucesso) {
    return (
      <div style={{ maxWidth: '600px', margin: '100px auto', textAlign: 'center' }}>
        <div className="card" style={{ padding: '50px', borderTop: '8px solid var(--primary-green)' }}>
          <div style={{ fontSize: '5rem', marginBottom: '20px' }}>✅</div>
          <h2 style={{ color: 'var(--text-main)', marginBottom: '1rem' }}>Submissão Concluída!</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: '1.6' }}>
            O seu pedido foi registado com sucesso no sistema <strong>SmartForms</strong>.<br />
            Será redirecionado para a lista de formulários em instantes.
          </p>
          <button 
            className="btn-primary" 
            style={{ marginTop: '30px' }}
            onClick={() => { setFormSelecionado(null); setSubmetidoComSucesso(false); }}
          >
            Voltar Agora
          </button>
        </div>
      </div>
    );
  }

  if (formSelecionado) {
    // Aplicar cor e logo do formulário se existirem
    const corTema = formSelecionado.corPrincipal || '#28a745';
    const logoTema = formSelecionado.logo || localStorage.getItem('logo');

    return (
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <button 
          onClick={() => { setFormSelecionado(null); setErros({}); setRespostas({}); setSubmetidoComSucesso(false); }} 
          className="btn-logout"
          style={{ marginBottom: '20px' }}
        >
          ← Voltar aos Formulários
        </button>
        
        <div className="card" style={{ borderTop: `6px solid ${corTema}` }}>
          <div style={{ borderBottom: '1px solid var(--border-color)', marginBottom: '2rem', paddingBottom: '1rem', textAlign: 'center' }}>
            {logoTema && (
              <img src={logoTema} alt="Logo" style={{ maxHeight: '60px', marginBottom: '1rem' }} />
            )}
            <h2 style={{ color: corTema }}>{formSelecionado.titulo}</h2>
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
                    type={campo.tipo === 'Data' ? 'date' : campo.tipo === 'Hora' ? 'time' : campo.tipo === 'Número' ? 'number' : 'text'} 
                    value={respostas[campoId] || ''}
                    onChange={(e) => handleInputChange(campoId, e.target.value)}
                    style={{ 
                      borderColor: temErro ? '#e74c3c' : 'var(--border-color)',
                      borderWidth: temErro ? '2px' : '1px',
                      outlineColor: corTema
                    }}
                    placeholder={campo.tipo === 'Data' || campo.tipo === 'Hora' ? '' : 'Introduza aqui...'}
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
                backgroundColor: podeSubmeter ? corTema : '#ccc',
                opacity: podeSubmeter ? 1 : 0.6,
                cursor: podeSubmeter ? 'pointer' : 'not-allowed',
                border: 'none',
                color: 'white',
                borderRadius: 'var(--radius-md)',
                fontWeight: 'bold'
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
        <div>
          {Object.entries(formulariosAgrupados).map(([categoria, itens]) => (
            <section key={categoria} style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0 }}>{categoria}</h3>
                <span className="status-badge status-publicado">{itens.length} formulário(s)</span>
              </div>
              <div className="grid-container">
                {itens.map((form) => (
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
                        onClick={() => {
                          setFormSelecionado(form);
                          carregarOcupacao();
                        }}
                        style={{ padding: '8px 15px' }}
                      >
                        Preencher
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

export default EcraProfessor;
