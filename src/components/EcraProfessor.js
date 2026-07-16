import React, { useState, useEffect, useMemo, useRef } from 'react';
import { agruparFormulariosPorCategoria } from '../utils/formUtils';
import { SALAS } from '../utils/salasData';
import './EcraProfessor.css';

const CampoFicheiro = ({ campo, value, onChange, temErro, corTema }) => {
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const processFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const payload = {
        name: file.name,
        size: file.size,
        type: file.type,
        content: e.target.result // base64 data URL
      };
      onChange(JSON.stringify(payload));
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Parse current value if it exists
  let fileData = null;
  if (value) {
    try {
      fileData = JSON.parse(value);
    } catch (e) {
      // not a json
    }
  }

  return (
    <div style={{ marginTop: '5px' }}>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileSelect} 
        style={{ display: 'none' }} 
      />
      
      {fileData ? (
        <div style={{ 
          border: `2px solid ${corTema}`, 
          borderRadius: '8px', 
          padding: '15px', 
          backgroundColor: '#f6ffed', 
          display: 'flex', 
          flexDirection: 'column',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.5rem' }}>📄</span>
              <div>
                <div style={{ fontWeight: 'bold', color: 'var(--text-main)', wordBreak: 'break-all' }}>{fileData.name}</div>
                <div style={{ fontSize: '0.8rem', color: '#888' }}>
                  {(fileData.size / 1024).toFixed(1)} KB
                </div>
              </div>
            </div>
            <button 
              type="button" 
              onClick={() => onChange('')} 
              style={{ 
                backgroundColor: 'transparent', 
                border: 'none', 
                color: 'red', 
                cursor: 'pointer', 
                fontWeight: 'bold',
                fontSize: '1.1rem',
                padding: '5px 10px'
              }}
            >
              Remover
            </button>
          </div>
          {fileData.content && fileData.content.startsWith('data:image/') && (
            <div style={{ textAlign: 'center', marginTop: '5px' }}>
              <img 
                src={fileData.content} 
                alt="Pré-visualização" 
                style={{ 
                  maxHeight: '120px', 
                  maxWidth: '100%', 
                  borderRadius: '4px', 
                  border: '1px solid #ddd',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }} 
              />
            </div>
          )}
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current.click()}
          style={{
            border: `2px dashed ${dragOver ? corTema : temErro ? 'var(--error-text)' : '#ccc'}`,
            borderRadius: '8px',
            padding: '30px 20px',
            textAlign: 'center',
            backgroundColor: dragOver ? `${corTema}11` : '#f8f9fa',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            outline: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
          }}
        >
          <div style={{ fontSize: '2.5rem' }}>📁</div>
          <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>
            Arrastar e soltar ficheiro aqui
          </div>
          <div style={{ fontSize: '0.85rem', color: '#888' }}>
            ou
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current.click();
            }}
            style={{
              padding: '10px 20px',
              backgroundColor: corTema,
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '0.9rem',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              transition: 'transform 0.1s ease, filter 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.filter = 'brightness(0.9)'}
            onMouseOut={(e) => e.currentTarget.style.filter = 'none'}
          >
            Selecionar Ficheiro
          </button>
        </div>
      )}
    </div>
  );
};

function EcraProfessor() {
  const [formularios, setFormularios] = useState([]);
  const [formSelecionado, setFormSelecionado] = useState(null);
  const [respostas, setRespostas] = useState({});
  const [erros, setErros] = useState({});
  const [loading, setLoading] = useState(true);
  const [ocupacaoReal, setOcupacaoReal] = useState([]);
  const [salaSelecionada, setSalaSelecionada] = useState(null);
  const [salas, setSalas] = useState(SALAS);

  const carregarSalas = async () => {
    try {
      // Tentar semear a BD primeiro (caso esteja vazia)
      await fetch('http://localhost:3000/api/salas/seed', { method: 'POST' });
      
      const resposta = await fetch('http://localhost:3000/api/salas');
      if (resposta.ok) {
        const dados = await resposta.json();
        if (dados && dados.length > 0) {
          setSalas(dados);
        }
      }
    } catch (erro) {
      console.warn('Backend não disponível para carregar salas, a usar dados locais.');
    }
  };

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
    carregarSalas();
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
        setSalaSelecionada(null);
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
      <div className="success-screen">
        <div className="card success-card">
          <div className="success-icon">✅</div>
          <h2 style={{ color: 'var(--text-main)', marginBottom: '1rem' }}>Submissão Concluída!</h2>
          <p className="text-muted" style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>
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
      <div className="form-view-container">
        <button 
          onClick={() => { setFormSelecionado(null); setErros({}); setRespostas({}); setSubmetidoComSucesso(false); setSalaSelecionada(null); }} 
          className="btn-logout"
          style={{ marginBottom: '20px' }}
        >
          ← Voltar aos Formulários
        </button>
        
        <div className="card" style={{ borderTop: `6px solid ${corTema}` }}>
          {/* Cabeçalho Estruturado Estilo IPT */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '200px 1fr 200px',
            border: '1px solid var(--border-color)',
            marginBottom: '0px',
            fontFamily: 'sans-serif',
            backgroundColor: '#fff'
          }}>
            <div style={{
              borderRight: '1px solid var(--border-color)',
              padding: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {logoTema ? (
                <img src={logoTema} alt="Logo" style={{ maxHeight: '70px', maxWidth: '100%', objectFit: 'contain' }} />
              ) : (
                <div style={{ color: '#ccc', fontSize: '0.8rem' }}>Sem Logótipo</div>
              )}
            </div>
            
            <div style={{
              borderRight: '1px solid var(--border-color)',
              padding: '10px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-main)' }}>
                Requerimento
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 'bold', letterSpacing: '1px', marginTop: '5px', color: corTema }}>
                {formSelecionado.titulo}
              </div>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              fontSize: '0.8rem'
            }}>
              <div style={{
                borderBottom: '1px solid var(--border-color)',
                padding: '8px 10px',
                textAlign: 'center',
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '600',
                color: 'var(--text-main)'
              }}>
                {formSelecionado.codigoDocumento || 'PT.SIGQ.MOD ACA 30 60 - 3'}
              </div>
              <div style={{
                padding: '8px 10px',
                textAlign: 'center',
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)'
              }}>
                Página 1 de 1
              </div>
            </div>
          </div>

          {/* Caixa de Checkboxes das Escolas */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '30px',
            padding: '10px',
            border: '1px solid var(--border-color)',
            borderTop: 'none',
            marginBottom: '20px',
            fontSize: '0.85rem',
            fontWeight: 'bold',
            backgroundColor: '#fff'
          }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--text-main)' }}>
              <input type="checkbox" defaultChecked /> ESGT
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--text-main)' }}>
              <input type="checkbox" /> ESTA
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--text-main)' }}>
              <input type="checkbox" /> ESTT
            </label>
          </div>

          <p className="text-muted" style={{ marginBottom: '30px', textAlign: 'center' }}>{formSelecionado.descricao}</p>
          
          <div className="form-fields-container">
            {formSelecionado.campos.map((campo) => {
              const campoId = campo._id || campo.id;
              const temErro = !!erros[campoId];
              const isSala = campo.etiqueta.toLowerCase().includes('sala') || campo.etiqueta.toLowerCase().includes('room');

              return (
                <div key={campoId}>
                  <label className="field-label-text">
                    {campo.etiqueta} {campo.obrigatorio && <span className="required-asterisk">*</span>}
                  </label>
                  
                  {campo.tipo === 'Ficheiro' ? (
                    <CampoFicheiro 
                      campo={campo}
                      value={respostas[campoId] || ''}
                      onChange={(valor) => handleInputChange(campoId, valor)}
                      temErro={temErro}
                      corTema={corTema}
                    />
                  ) : isSala ? (
                    <select
                      className="form-input"
                      value={respostas[campoId] || ''}
                      onChange={(e) => {
                        const valor = e.target.value;
                        const sala = salas.find(s => s.nome === valor) || null;
                        setSalaSelecionada(sala);
                        handleInputChange(campoId, valor);
                      }}
                      style={{ 
                        borderColor: temErro ? 'var(--error-text)' : 'var(--border-color)',
                        borderWidth: temErro ? '2px' : '1px',
                        outlineColor: corTema
                      }}
                    >
                      <option value="">--- Selecione uma Sala ---</option>
                      {salas.map(s => (
                        <option key={s._id || s.id} value={s.nome}>
                          {s.nome} (Lotação: {s.lotacao})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input 
                      className="form-input"
                      type={campo.tipo === 'Data' ? 'date' : campo.tipo === 'Hora' ? 'time' : campo.tipo === 'Número' ? 'number' : 'text'} 
                      value={respostas[campoId] || ''}
                      onChange={(e) => handleInputChange(campoId, e.target.value)}
                      style={{ 
                        borderColor: temErro ? 'var(--error-text)' : 'var(--border-color)',
                        borderWidth: temErro ? '2px' : '1px',
                        outlineColor: corTema
                      }}
                      placeholder={campo.tipo === 'Data' || campo.tipo === 'Hora' ? '' : 'Introduza aqui...'}
                    />
                  )}

                  {isSala && salaSelecionada && (
                    <div className="room-info-card" style={{ 
                      marginTop: '10px', 
                      padding: '12px', 
                      backgroundColor: 'var(--muted-bg)', 
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      border: `1px solid ${corTema}44`
                    }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div><strong>Tipo:</strong> {salaSelecionada.tipo}</div>
                        <div><strong>Lotação:</strong> {salaSelecionada.lotacao}</div>
                        <div><strong>Projetor:</strong> {salaSelecionada.equipamentos.projetor ? '✅' : '❌'}</div>
                        <div><strong>Tomadas:</strong> {salaSelecionada.equipamentos.tomadas ? '✅' : '❌'}</div>
                      </div>
                    </div>
                  )}

                  {temErro && (
                    <span className="error-message-small">
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
                backgroundColor: podeSubmeter ? corTema : 'var(--skeleton-bg)',
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
        <p className="text-muted">Selecione um formulário para iniciar o preenchimento.</p>
      </div>
      
      {loading ? (
        <div className="text-center" style={{ padding: '40px' }}>A carregar formulários...</div>
      ) : formularios.length === 0 ? (
        <div className="card text-center text-muted">
          Não há formulários publicados de momento.
        </div>
      ) : (
        <div>
          {Object.entries(formulariosAgrupados).map(([categoria, itens]) => (
            <section key={categoria} className="category-section">
              <div className="category-header">
                <h3 className="category-title">{categoria}</h3>
                <span className="status-badge status-publicado">{itens.length} formulário(s)</span>
              </div>
              <div className="grid-container">
                {itens.map((form) => (
                  <div key={form._id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <h3 style={{ marginBottom: '0.5rem' }}>{form.titulo}</h3>
                      <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                        {form.descricao || 'Sem descrição disponível.'}
                      </p>
                    </div>
                    <div className="card-footer">
                      <span className="status-badge status-publicado">Disponível</span>
                      <button 
                        className="btn-primary btn-fill"
                        onClick={() => {
                          setFormSelecionado(form);
                          carregarOcupacao();
                        }}
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
