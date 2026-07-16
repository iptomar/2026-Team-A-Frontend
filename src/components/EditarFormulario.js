import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './EditarFormulario.css';

const TEMPLATES = [
  { type: 'Texto Curto', label: 'Texto Curto', w: 6 },
  { type: 'Texto Longo', label: 'Texto Longo', w: 12 },
  { type: 'Número', label: 'Número', w: 4 },
  { type: 'Data', label: 'Data', w: 4 },
  { type: 'Dropdown', label: 'Dropdown', w: 6 },
  { type: 'Ficheiro', label: 'Upload de Ficheiro', w: 12 }
];

function EditarFormulario() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('');
  const [campos, setCampos] = useState([]);
  const [estado, setEstado] = useState('Rascunho');
  const [mensagem, setMensagem] = useState('');
  const [loading, setLoading] = useState(true);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [corPrincipal, setCorPrincipal] = useState('#28a745');
  const [logo, setLogo] = useState('');
  const [codigoDocumento, setCodigoDocumento] = useState('PT.SIGQ.MOD ACA 30 60 - 3');
  const [showCabecalho, setShowCabecalho] = useState(true);
  const [showTitulo, setShowTitulo] = useState(true);
  const [showLogo, setShowLogo] = useState(true);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setLogo(uploadEvent.target.result);
      };
      reader.readAsDataURL(file);
    }
  };
  const canvasRef = useRef(null);

  const tiposComOpcoes = ['Dropdown', 'Radio Button', 'Checkbox'];

  useEffect(() => {
    const carregarFormulario = async () => {
      try {
        const resposta = await fetch(`http://localhost:3000/api/forms/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (resposta.ok) {
          const dados = await resposta.json();
          setTitulo(dados.titulo);
          setDescricao(dados.descricao);
          setCategoria(dados.categoria || 'Sem categoria');
          setEstado(dados.estado);
          setCorPrincipal(dados.corPrincipal || '#28a745');
          setLogo(dados.logo || '');
          setCodigoDocumento(dados.codigoDocumento || 'PT.SIGQ.MOD ACA 30 60 - 3');
          setShowCabecalho(dados.showCabecalho !== undefined ? dados.showCabecalho : true);
          setShowTitulo(dados.showTitulo !== undefined ? dados.showTitulo : true);
          setShowLogo(dados.showLogo !== undefined ? dados.showLogo : true);
          // Garantir coordenadas para a grelha
          setCampos(dados.campos.map((c, index) => ({
            id: c._id || c.id || `campo-${index}`,
            etiqueta: c.etiqueta,
            tipo: c.tipo,
            obrigatorio: c.obrigatorio,
            visivel: c.visivel !== undefined ? c.visivel : true,
            opcoes: c.opcoes || [],
            novaOpcao: '',
            x: c.x || 1,
            y: c.y || (index * 2) + 1,
            w: c.w || 12,
            maxCaracteres: c.maxCaracteres || '',
            minNumero: c.minNumero !== undefined ? c.minNumero : '',
            maxNumero: c.maxNumero !== undefined ? c.maxNumero : ''
          })));

          if (dados.estado === 'Publicado' || dados.estado === 'Arquivado') {
            setIsReadOnly(true);
            setMensagem(`Aviso: Este formulário está ${dados.estado} e não pode ser editado.`);
          }
        } else {
          setMensagem('Erro: Não foi possível carregar o formulário.');
        }
      } catch (erro) {
        console.error('Erro ao carregar:', erro);
        setMensagem('Erro: Falha na ligação ao servidor.');
      } finally {
        setLoading(false);
      }
    };

    carregarFormulario();
  }, [id]);

  const onDragStart = (e, template) => {
    if (isReadOnly) return;
    window._draggedTemplate = template;
  };

  const onDrop = (e) => {
    if (isReadOnly) return;
    e.preventDefault();
    const template = window._draggedTemplate;
    if (!template) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const colWidth = canvasRect.width / 12;
    const rowHeight = 100;

    const mouseX = e.clientX - canvasRect.left;
    const mouseY = e.clientY - canvasRect.top;

    const x = Math.floor(mouseX / colWidth) + 1;
    const y = Math.floor(mouseY / rowHeight) + 1;

    const novoCampo = {
      id: `campo-${Date.now()}`,
      x: Math.min(x, 12 - (template.w - 1)),
      y: y,
      w: template.w,
      etiqueta: template.label,
      tipo: template.type,
      obrigatorio: false,
      visivel: true,
      opcoes: [],
      novaOpcao: ''
    };

    setCampos([...campos, novoCampo]);
    window._draggedTemplate = null;
  };

  const atualizarCampo = (id, prop, val) => {
    if (isReadOnly) return;
    setCampos(campos.map(c => c.id === id ? { ...c, [prop]: val } : c));
  };

  const removerCampo = (id) => {
    if (isReadOnly) return;
    setCampos(campos.filter(c => c.id !== id));
  };

  const startResize = (e, id) => {
    if (isReadOnly) return;
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const campo = campos.find(c => c.id === id);
    const startW = campo.w;
    const colWidth = canvasRef.current.offsetWidth / 12;

    const onMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const colDelta = Math.round(deltaX / colWidth);
      const newW = Math.max(2, Math.min(12 - (campo.x - 1), startW + colDelta));
      atualizarCampo(id, 'w', newW);
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const startMove = (e, id) => {
    if (isReadOnly) return;
    e.preventDefault();
    e.stopPropagation();
    const startMouseX = e.clientX;
    const startMouseY = e.clientY;
    const campo = campos.find(c => c.id === id);
    const startGridX = campo.x;
    const startGridY = campo.y;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const colWidth = canvasRect.width / 12;
    const rowHeight = 100;

    const onMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startMouseX;
      const deltaY = moveEvent.clientY - startMouseY;
      const colDelta = Math.round(deltaX / colWidth);
      const rowDelta = Math.round(deltaY / rowHeight);
      const newX = Math.max(1, Math.min(12 - (campo.w - 1), startGridX + colDelta));
      const newY = Math.max(1, startGridY + rowDelta);
      if (newX !== campo.x || newY !== campo.y) {
        setCampos(prev => prev.map(c => c.id === id ? { ...c, x: newX, y: newY } : c));
      }
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (isReadOnly) return;

    try {
      const resposta = await fetch(`http://localhost:3000/api/forms/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          titulo,
          descricao,
          categoria: categoria.trim() || 'Sem categoria',
          estado,
          corPrincipal,
          logo,
          codigoDocumento,
          showCabecalho,
          showTitulo,
          showLogo,
          campos: campos.map(c => ({
            etiqueta: c.etiqueta,
            tipo: c.tipo,
            obrigatorio: c.obrigatorio,
            visivel: c.visivel !== undefined ? c.visivel : true,
            opcoes: c.opcoes,
            x: c.x,
            y: c.y,
            w: c.w,
            // Carrega os limites da BD
            maxCaracteres: c.maxCaracteres ? parseInt(c.maxCaracteres) : undefined,
            minNumero: (c.minNumero !== undefined && c.minNumero !== '') ? Number(c.minNumero) : undefined,
            maxNumero: (c.maxNumero !== undefined && c.maxNumero !== '') ? Number(c.maxNumero) : undefined
          }))
        })
      });

      if (resposta.ok) {
        setMensagem('Formulário atualizado com sucesso!');
        setTimeout(() => navigate('/admin'), 2000);
      } else {
        const erro = await resposta.json();
        setMensagem(`Erro: ${erro.error}`);
      }
    } catch (err) {
      setMensagem('Erro ao guardar as alterações.');
    }
  };

  const adicionarOpcaoNoCampo = (id) => {
    if (isReadOnly) return;
    const campo = campos.find((item) => item.id === id);
    if (!campo || !(campo.novaOpcao || '').trim()) return;

    if (campo.opcoes.includes(campo.novaOpcao)) {
      setMensagem('Erro: Esta opção já existe.');
      return;
    }

    setCampos(prev => prev.map(item =>
      item.id === id ? { ...item, opcoes: [...item.opcoes, item.novaOpcao], novaOpcao: '' } : item
    ));
  };

  const removerOpcaoDoCampo = (id, indice) => {
    if (isReadOnly) return;
    setCampos(prev => prev.map(c =>
      c.id === id ? { ...c, opcoes: c.opcoes.filter((_, i) => i !== indice) } : c
    ));
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>A carregar...</div>;

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
        <h2>Editor de Layout Livre</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setIsPreview(!isPreview)} style={{ padding: '10px 20px', borderRadius: '4px', border: '1px solid #ddd', backgroundColor: '#fff', cursor: 'pointer' }}>
            {isPreview ? 'Voltar ao Editor' : '👁 Pré-visualizar'}
          </button>
          <button className="btn-logout" onClick={() => navigate('/admin')}>Cancelar</button>
        </div>
      </div>

      {mensagem && (
        <div style={{ padding: '15px', backgroundColor: mensagem.includes('Erro') ? '#fff1f0' : '#f6ffed', color: mensagem.includes('Erro') ? '#cf1322' : '#52c41a', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '20px', textAlign: 'center' }}>
          {mensagem}
        </div>
      )}

      <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
        {/* Main Canvas and Preview container on Left */}
        <div style={{ flex: 1 }}>
          {isPreview ? (
            <div className="ipt-form-card" style={{ minHeight: '600px' }}>
              {/* PDF Header Layout */}
              {showCabecalho && (
                <div className="ipt-pdf-header">
                  {showLogo && (
                    <div className="ipt-pdf-header-logo-box">
                      {logo ? (
                        <img src={logo} alt="Logótipo" style={{ objectFit: 'contain' }} />
                      ) : (
                        <div style={{ color: '#ccc', fontSize: '0.8rem' }}>Sem Logo</div>
                      )}
                    </div>
                  )}
                  <div className="ipt-pdf-header-title-box">
                    {showTitulo ? (
                      <h1 className="ipt-pdf-header-title-text">{titulo || 'REQUERIMENTO / ASSUNTOS DIVERSOS'}</h1>
                    ) : (
                      <h1 className="ipt-pdf-header-title-text" style={{ visibility: 'hidden' }}>REQUERIMENTO</h1>
                    )}
                  </div>
                  <div className="ipt-pdf-header-meta-box">
                    <div className="ipt-pdf-meta-top">{codigoDocumento}</div>
                    <div className="ipt-pdf-meta-bottom">Página 1 de 1</div>
                  </div>
                </div>
              )}

              {/* Schools Checkboxes Bar */}
              {showCabecalho && (
                <div className="ipt-pdf-schools-bar">
                  <label><input type="checkbox" disabled /> ESGT</label>
                  <label><input type="checkbox" disabled /> ESTA</label>
                  <label><input type="checkbox" disabled /> ESTT</label>
                </div>
              )}

              {descricao && (
                <div style={{ marginBottom: '25px', padding: '15px', backgroundColor: 'var(--muted-bg)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-color)' }}>
                  <p style={{ margin: 0, color: 'var(--text-muted)', fontStyle: 'italic' }}>{descricao}</p>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '20px' }}>
                {campos.filter(c => c.visivel !== false).map(c => {
                  const isSalaField = c.etiqueta.toLowerCase().includes('sala') || c.etiqueta.toLowerCase().includes('room');
                  return (
                    <div key={c.id} style={{ gridColumn: `${c.x || 1} / span ${c.w || 12}`, gridRowStart: c.y || 'auto' }}>
                      <label style={{ fontWeight: '600', display: 'block', marginBottom: '8px' }}>
                        {c.etiqueta} {c.obrigatorio && <span style={{ color: 'red' }}>*</span>}
                      </label>
                      {isSalaField ? (
                        <select style={{ width: '100%', padding: '10px', border: '1px solid var(--border-color)', borderRadius: '6px', backgroundColor: 'var(--input-bg)', color: 'var(--text-main)', outlineColor: '#006cc6' }} disabled>
                          <option>Selecione uma sala...</option>
                        </select>
                      ) : c.tipo === 'Dropdown' ? (
                        <select style={{ width: '100%', padding: '10px', border: '1px solid var(--border-color)', borderRadius: '6px', backgroundColor: 'var(--input-bg)', color: 'var(--text-main)', outlineColor: '#006cc6' }} disabled>
                          <option>Selecione uma opção...</option>
                          {c.opcoes && c.opcoes.map((op, idx) => (
                            <option key={idx}>{op}</option>
                          ))}
                        </select>
                      ) : c.tipo === 'Ficheiro' ? (
                        <div style={{ 
                          border: '2px dashed #ccc', 
                          borderRadius: '8px', 
                          padding: '20px', 
                          textAlign: 'center', 
                          backgroundColor: '#f8f9fa', 
                          color: '#666',
                          fontSize: '0.9rem',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '10px'
                        }}>
                          <div style={{ fontSize: '2rem' }}>📁</div>
                          <div style={{ fontWeight: '600' }}>Arrastar e soltar ficheiro aqui</div>
                          <div style={{ fontSize: '0.8rem', color: '#888' }}>ou</div>
                          <button
                            type="button"
                            disabled
                            style={{
                              padding: '8px 16px',
                              backgroundColor: '#ccc',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              fontWeight: 'bold',
                              cursor: 'not-allowed',
                              fontSize: '0.85rem'
                            }}
                          >
                            Selecionar Ficheiro
                          </button>
                        </div>
                      ) : (
                        <input
                          type={c.tipo === 'Data' ? 'date' : c.tipo === 'Hora' ? 'time' : c.tipo === 'Número' ? 'number' : 'text'}
                          style={{ width: '100%', padding: '10px', border: '1px solid var(--border-color)', borderRadius: '6px', backgroundColor: 'var(--input-bg)', color: 'var(--text-main)', outlineColor: '#006cc6' }}
                          disabled
                          placeholder={c.tipo === 'Data' || c.tipo === 'Hora' ? '' : 'Introduza aqui...'}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* PDF Header Layout in Editor */}
              {showCabecalho && (
                <div className="ipt-pdf-header">
                  {showLogo && (
                    <div className="ipt-pdf-header-logo-box">
                      {logo ? (
                        <img src={logo} alt="Logótipo" style={{ objectFit: 'contain' }} />
                      ) : (
                        <div style={{ color: '#ccc', fontSize: '0.8rem' }}>Sem Logo</div>
                      )}
                    </div>
                  )}
                  <div className="ipt-pdf-header-title-box">
                    {showTitulo ? (
                      <input
                        className="ipt-pdf-header-title-input"
                        value={titulo}
                        onChange={e => setTitulo(e.target.value)}
                        placeholder="TÍTULO DO REQUERIMENTO"
                        disabled={isReadOnly}
                      />
                    ) : (
                      <div style={{ color: '#ccc', fontStyle: 'italic', fontSize: '0.9rem' }}>(Título Ocultado)</div>
                    )}
                  </div>
                  <div className="ipt-pdf-header-meta-box">
                    <div className="ipt-pdf-meta-top">{codigoDocumento}</div>
                    <div className="ipt-pdf-meta-bottom">Página 1 de 1</div>
                  </div>
                </div>
              )}

              {/* Schools Checkboxes Bar in Editor */}
              {showCabecalho && (
                <div className="ipt-pdf-schools-bar">
                  <label><input type="checkbox" disabled={isReadOnly} /> ESGT</label>
                  <label><input type="checkbox" disabled={isReadOnly} /> ESTA</label>
                  <label><input type="checkbox" disabled={isReadOnly} /> ESTT</label>
                </div>
              )}

              {/* Description Input Card */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <textarea style={{ width: '100%', border: 'none', resize: 'none', outline: 'none', color: '#666', borderBottom: '1px solid #eee' }} value={descricao} onChange={e => setDescricao(e.target.value)} disabled={isReadOnly} rows="2" placeholder="Adicione uma descrição..." />
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <label style={{ fontWeight: '600', fontSize: '0.9rem' }}>Categoria:</label>
                  <input style={{ padding: '5px 10px', borderRadius: '4px', border: '1px solid #ddd', flex: 1 }} value={categoria} onChange={e => setCategoria(e.target.value)} disabled={isReadOnly} />
                </div>
              </div>

              <div
                ref={canvasRef}
                onDragOver={e => !isReadOnly && e.preventDefault()}
                onDrop={onDrop}
                style={{
                  backgroundColor: '#fff', border: '2px solid #ddd', borderRadius: '12px', minHeight: '1000px',
                  display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gridAutoRows: '100px',
                  backgroundImage: 'radial-gradient(#ddd 1px, transparent 1px)', backgroundSize: 'calc(100% / 12) 100px',
                  padding: '10px', gap: '10px'
                }}
              >
                {campos.filter(c => c.visivel !== false).map(c => (
                  <div key={c.id} style={{ gridColumn: `${c.x} / span ${c.w}`, gridRowStart: c.y, backgroundColor: '#fff', border: '1px solid #007bff', borderRadius: '8px', padding: '15px', position: 'relative', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                      <div onMouseDown={(e) => startMove(e, c.id)} style={{ cursor: isReadOnly ? 'default' : 'move', fontSize: '1.2rem', color: '#ccc' }}>⠿</div>
                      <span style={{ fontSize: '0.6rem', color: '#999', textTransform: 'uppercase', fontWeight: 'bold' }}>{c.type}</span>
                      {!isReadOnly && <button onClick={() => removerCampo(c.id)} style={{ border: 'none', background: 'none', color: 'red', cursor: 'pointer', fontWeight: 'bold' }}>×</button>}
                    </div>
                    <input style={{ border: 'none', borderBottom: '1px solid #eee', fontWeight: 'bold', width: '100%', outline: 'none' }} value={c.etiqueta} onChange={e => atualizarCampo(c.id, 'etiqueta', e.target.value)} disabled={isReadOnly} />

                    <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <input type="checkbox" checked={c.obrigatorio} onChange={e => atualizarCampo(c.id, 'obrigatorio', e.target.checked)} disabled={isReadOnly} />
                      <span style={{ fontSize: '0.7rem', color: '#888' }}>Obrigatório</span>
                    </div>

                    {/* INPUTS PARA CONFIGURAR LIMITES EM EDIÇÃO */}
                    {['Texto Curto', 'Texto Longo', 'Nome', 'Email'].includes(c.tipo) && (
                      <div style={{ marginTop: '5px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <label style={{ fontSize: '0.65rem', color: '#666', fontWeight: 'bold' }}>Tam. Máximo:</label>
                        <input
                          type="number"
                          style={{ fontSize: '0.7rem', padding: '2px 4px', border: '1px solid #ddd', borderRadius: '4px' }}
                          value={c.maxCaracteres || ''}
                          onChange={e => atualizarCampo(c.id, 'maxCaracteres', e.target.value ? parseInt(e.target.value) : '')}
                          placeholder="Caracteres máx."
                          disabled={isReadOnly}
                        />
                      </div>
                    )}
                    {c.tipo === 'Número' && (
                      <div style={{ marginTop: '5px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <label style={{ fontSize: '0.65rem', color: '#666', fontWeight: 'bold' }}>Mínimo:</label>
                          <input
                            type="number"
                            style={{ fontSize: '0.7rem', padding: '2px 4px', border: '1px solid #ddd', borderRadius: '4px', width: '100%' }}
                            value={c.minNumero !== undefined ? c.minNumero : ''}
                            onChange={e => atualizarCampo(c.id, 'minNumero', e.target.value !== '' ? Number(e.target.value) : '')}
                            placeholder="Mín"
                            disabled={isReadOnly}
                          />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <label style={{ fontSize: '0.65rem', color: '#666', fontWeight: 'bold' }}>Máximo:</label>
                          <input
                            type="number"
                            style={{ fontSize: '0.7rem', padding: '2px 4px', border: '1px solid #ddd', borderRadius: '4px', width: '100%' }}
                            value={c.maxNumero !== undefined ? c.maxNumero : ''}
                            onChange={e => atualizarCampo(c.id, 'maxNumero', e.target.value !== '' ? Number(e.target.value) : '')}
                            placeholder="Máx"
                            disabled={isReadOnly}
                          />
                        </div>
                      </div>
                    )}



                    {tiposComOpcoes.includes(c.tipo) && (
                      <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                        {!isReadOnly && (
                          <div style={{ display: 'flex', gap: '5px', marginBottom: '5px' }}>
                            <input type="text" value={c.novaOpcao} onChange={e => atualizarCampo(c.id, 'novaOpcao', e.target.value)} placeholder="Opção..." style={{ flex: 1, fontSize: '0.8rem' }} />
                            <button onClick={() => adicionarOpcaoNoCampo(c.id)} style={{ fontSize: '0.8rem' }}>+</button>
                          </div>
                        )}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                          {c.opcoes.map((op, idx) => (
                            <span key={idx} style={{ padding: '2px 8px', backgroundColor: '#e9ecef', borderRadius: '10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center' }}>
                              {op}
                              {!isReadOnly && <button onClick={() => removerOpcaoDoCampo(c.id, idx)} style={{ border: 'none', background: 'none', marginLeft: '5px', cursor: 'pointer', color: 'red' }}>×</button>}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {!isReadOnly && <div onMouseDown={e => startResize(e, c.id)} style={{ position: 'absolute', right: 0, bottom: 0, width: '15px', height: '15px', cursor: 'nwse-resize', borderRight: '2px solid #007bff', borderBottom: '2px solid #007bff', borderRadius: '0 0 8px 0' }} />}
                  </div>
                ))}
              </div>

              {!isReadOnly && (
                <button onClick={handleSave} style={{ padding: '15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}>
                  Guardar Alterações
                </button>
              )}
            </div>
          )}
        </div>

        {/* Control Panel / Sidebar on Right */}
        {!isPreview && (
          <div style={{ width: '320px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Definições Globais e Visibilidade Card */}
            <div className="card" style={{ padding: '20px' }}>
              <h4 style={{ marginBottom: '15px' }}>Definições Globais e Visibilidade</h4>

              {/* Secção 1: Estrutura Global */}
              <div style={{ marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#999', textTransform: 'uppercase', marginBottom: '10px' }}>Estrutura Global do Formulário</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={showCabecalho}
                      onChange={(e) => setShowCabecalho(e.target.checked)}
                      disabled={isReadOnly}
                    />
                    Ativar Cabeçalho (IPT Logo)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={showTitulo}
                      onChange={(e) => setShowTitulo(e.target.checked)}
                      disabled={isReadOnly}
                    />
                    Ativar Título do Formulário
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={showLogo}
                      onChange={(e) => setShowLogo(e.target.checked)}
                      disabled={isReadOnly}
                    />
                    Ativar Imagem/Logo (IPT)
                  </label>
                </div>
              </div>

              {/* Secção 1.5: Logótipo e Referência */}
              <div style={{ marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#999', textTransform: 'uppercase', marginBottom: '10px' }}>Logótipo e Referência</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Código do Documento:</label>
                  <input
                    style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '0.85rem' }}
                    value={codigoDocumento}
                    onChange={(e) => setCodigoDocumento(e.target.value)}
                    placeholder="Ex: PT.SIGQ.MOD ACA 30 60 - 3"
                    disabled={isReadOnly}
                  />
                  <label style={{ fontSize: '0.85rem', fontWeight: '600', marginTop: '5px' }}>Alterar Logótipo:</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    style={{ fontSize: '0.8rem' }}
                    disabled={isReadOnly}
                  />
                  {logo && (
                    <div style={{ textAlign: 'center', marginTop: '5px' }}>
                      <img src={logo} alt="Mini Logo" style={{ maxHeight: '40px', maxWidth: '100px', objectFit: 'contain', border: '1px solid #ddd', borderRadius: '4px' }} />
                    </div>
                  )}
                </div>
              </div>

              {/* Secção 2: Visibilidade de Campos */}
              <div>
                <p style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#999', textTransform: 'uppercase', marginBottom: '10px' }}>Visibilidade dos Campos Individuais</p>
                {campos.length === 0 ? (
                  <p style={{ fontSize: '0.85rem', color: '#999', fontStyle: 'italic' }}>Nenhum campo adicionado.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '250px', overflowY: 'auto', paddingRight: '5px' }}>
                    {campos.map((c) => (
                      <div
                        key={c.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 10px',
                          backgroundColor: '#f8f9fa',
                          border: '1px solid #eee',
                          borderRadius: '4px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', flex: 1 }}>
                          <input
                            type="checkbox"
                            checked={c.visivel !== false}
                            onChange={(e) => atualizarCampo(c.id, 'visivel', e.target.checked)}
                            title={c.visivel !== false ? "Desativar campo" : "Ativar campo"}
                            disabled={isReadOnly}
                            style={{ cursor: isReadOnly ? 'not-allowed' : 'pointer' }}
                          />
                          <span style={{ fontSize: '0.85rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', opacity: c.visivel !== false ? 1 : 0.5 }}>
                            {c.etiqueta || "Sem nome"}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                          {!isReadOnly && (
                            <button
                              onClick={() => removerCampo(c.id)}
                              style={{ border: 'none', background: 'none', color: 'red', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}
                              title="Eliminar campo"
                            >
                              🗑
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Toolbox Card */}
            <div className="card" style={{ padding: '20px' }}>
              <h4>Toolbox</h4>
              <p style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#999', marginBottom: '10px' }}>ARRASTE PARA O QUADRO</p>
              {TEMPLATES.map((t, i) => (
                <div key={i} draggable={!isReadOnly} onDragStart={(e) => onDragStart(e, t)} style={{ padding: '10px', backgroundColor: '#f8f9fa', border: '1px solid #ddd', marginBottom: '8px', cursor: isReadOnly ? 'not-allowed' : 'grab', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                  + {t.label}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EditarFormulario;
