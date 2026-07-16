import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './CriarFormulario.css';

// Itens da Toolbox Iniciais
const INITIAL_TEMPLATES = [
  { type: 'Texto Curto', label: 'Texto Curto', w: 6 },
  { type: 'Texto Longo', label: 'Texto Longo', w: 12 },
  { type: 'Número', label: 'Número', w: 4 },
  { type: 'Data', label: 'Data', w: 4 },
  { type: 'Nome', label: 'Nome Completo', w: 12 },
  { type: 'Email', label: 'Email', w: 6 },
  { type: 'Ficheiro', label: 'Upload de Ficheiro', w: 12 }
];

function CriarFormulario({ onFormularioCriado }) {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('');
  const [campos, setCampos] = useState([]);
  const [isPreview, setIsPreview] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [loading, setLoading] = useState(false);

  const [showCabecalho, setShowCabecalho] = useState(true);
  const [showTitulo, setShowTitulo] = useState(true);
  const [showLogo, setShowLogo] = useState(true);
  const [logo, setLogo] = useState(localStorage.getItem('logo') || null);
  const [codigoDocumento, setCodigoDocumento] = useState('PT.SIGQ.MOD ACA 30 60 - 3');

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

  // 1. Gestão de Modelos (Padrão + Personalizados)
  const [templates, setTemplates] = useState({
    TIPOS: INITIAL_TEMPLATES,
    PERSONALIZADOS: []
  });
  const [novoModeloNome, setNovoModeloNome] = useState('');
  const [novoModeloTipo, setNovoModeloTipo] = useState('Texto Curto');

  const canvasRef = useRef(null);
  const navigate = useNavigate();

  // Adicionar uma nova ferramenta personalizada à sidebar
  const adicionarCustom = () => {
    if (!novoModeloNome.trim()) return;
    const novo = { type: novoModeloTipo, label: novoModeloNome, w: 6 };
    setTemplates(prev => ({ ...prev, PERSONALIZADOS: [...prev.PERSONALIZADOS, novo] }));
    setNovoModeloNome('');
  };

  const onDragStart = (e, template) => {
    window._draggedTemplate = template;
  };

  const onDrop = (e) => {
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
      label: template.label,
      type: template.type,
      obrigatorio: false
    };

    setCampos([...campos, novoCampo]);
    window._draggedTemplate = null;
  };

  const atualizarCampo = (id, prop, val) => {
    setCampos(campos.map(c => c.id === id ? { ...c, [prop]: val } : c));
  };

  const removerCampo = (id) => setCampos(campos.filter(c => c.id !== id));

  const startResize = (e, id) => {
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

  const handleSubmit = async (acao) => {
    if (titulo.trim() === "") {
      setMensagem("Erro: O Título é obrigatório.");
      return;
    }
    setLoading(true);
    setMensagem("");
    const data = {
      titulo,
      descricao,
      categoria: categoria.trim() || 'Sem categoria',
      estado: acao,
      campos: campos.map(c => ({
        etiqueta: c.label,
        tipo: c.type,
        obrigatorio: c.obrigatorio,
        visivel: c.visivel !== undefined ? c.visivel : true,
        x: c.x,
        y: c.y,
        w: c.w,
        maxCaracteres: c.maxCaracteres ? parseInt(c.maxCaracteres) : undefined,
        minNumero: (c.minNumero !== undefined && c.minNumero !== '') ? Number(c.minNumero) : undefined,
        maxNumero: (c.maxNumero !== undefined && c.maxNumero !== '') ? Number(c.maxNumero) : undefined
      })),
      corPrincipal: localStorage.getItem('corPrincipal') || '#28a745',
      logo: logo,
      codigoDocumento: codigoDocumento,
      showCabecalho,
      showTitulo,
      showLogo
    };
    try {
      const response = await fetch("http://localhost:3000/api/forms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error("Erro no servidor");
      setMensagem("Sucesso! Formulário criado.");
      if (onFormularioCriado) onFormularioCriado();
      if (acao === 'Publicado') setTimeout(() => navigate('/admin'), 1500);
    } catch (error) {
      setMensagem(`Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
        <h2>Painel de Desenho Livre</h2>
        <button onClick={() => setIsPreview(!isPreview)} style={{ padding: '10px 20px', cursor: 'pointer', borderRadius: '6px', border: '1px solid #ddd', backgroundColor: '#fff', fontWeight: 'bold' }}>
          {isPreview ? 'Voltar ao Editor' : '👁 Ver Formulário'}
        </button>
      </div>

      {mensagem && (
        <div style={{
          padding: '15px',
          backgroundColor: mensagem.includes('Erro') ? '#fff1f0' : '#f6ffed',
          border: `1px solid ${mensagem.includes('Erro') ? '#ffa39e' : '#b7eb8f'}`,
          borderRadius: '4px',
          marginBottom: '20px',
          textAlign: 'center',
          color: mensagem.includes('Erro') ? '#cf1322' : '#52c41a',
          fontWeight: 'bold'
        }}>
          {mensagem}
        </div>
      )}

      <div style={{ display: 'flex', gap: '30px' }}>
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
                {campos.filter(c => c.visivel !== false).map(c => (
                  <div key={c.id} style={{ gridColumn: `${c.x} / span ${c.w}`, gridRowStart: c.y }}>
                    <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>{c.label} {c.obrigatorio && <span style={{ color: 'red' }}>*</span>}</label>
                    {c.type === 'Ficheiro' ? (
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
                      <input style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} disabled placeholder={`Resposta (${c.type})...`} />
                    )}
                  </div>
                ))}
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
                  <label><input type="checkbox" /> ESGT</label>
                  <label><input type="checkbox" /> ESTA</label>
                  <label><input type="checkbox" /> ESTT</label>
                </div>
              )}

              {/* Description Input Card */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <textarea
                  style={{ width: '100%', border: 'none', borderBottom: '1px solid #eee', resize: 'none', outline: 'none', color: '#666', fontSize: '1rem' }}
                  rows="2" value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Adicione uma descrição..."
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <label style={{ fontWeight: '600', fontSize: '0.9rem' }}>Categoria:</label>
                  <input
                    style={{ padding: '5px 10px', borderRadius: '4px', border: '1px solid #ddd', flex: 1 }}
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    placeholder="Ex: Infraestrutura, Material, Espaço"
                  />
                </div>
              </div>

              <div
                ref={canvasRef}
                onDragOver={e => e.preventDefault()}
                onDrop={onDrop}
                style={{
                  backgroundColor: '#fff', border: '2px solid #ddd', borderRadius: '12px', minHeight: '1000px',
                  display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gridAutoRows: '100px',
                  backgroundImage: 'radial-gradient(#ddd 1px, transparent 1px)', backgroundSize: 'calc(100% / 12) 100px',
                  padding: '10px', gap: '10px'
                }}
              >
                {campos.filter(c => c.visivel !== false).map(c => (
                  <div key={c.id} style={{ gridColumn: `${c.x} / span ${c.w}`, gridRowStart: c.y, backgroundColor: '#fff', border: '1px solid #28a745', borderRadius: '8px', padding: '15px', position: 'relative', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                      <div onMouseDown={(e) => startMove(e, c.id)} style={{ cursor: 'move', fontSize: '1.2rem', color: '#ccc' }}>⠿</div>
                      <span style={{ fontSize: '0.6rem', color: '#999', textTransform: 'uppercase', fontWeight: 'bold' }}>{c.type}</span>
                      <button onClick={() => removerCampo(c.id)} style={{ border: 'none', background: 'none', color: 'red', cursor: 'pointer', fontWeight: 'bold' }}>×</button>
                    </div>
                    <input style={{ border: 'none', borderBottom: '1px solid #eee', fontWeight: 'bold', width: '100%', outline: 'none' }} value={c.label} onChange={e => atualizarCampo(c.id, 'label', e.target.value)} />

                    <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <input type="checkbox" checked={c.obrigatorio} onChange={e => atualizarCampo(c.id, 'obrigatorio', e.target.checked)} />
                      <span style={{ fontSize: '0.7rem', color: '#888' }}>Obrigatório</span>
                    </div>

                    {/* INPUTS PARA CONFIGURAR LIMITES */}
                    {['Texto Curto', 'Texto Longo', 'Nome', 'Email'].includes(c.type) && (
                      <div style={{ marginTop: '5px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <label style={{ fontSize: '0.65rem', color: '#666', fontWeight: 'bold' }}>Tam. Máximo:</label>
                        <input
                          type="number"
                          style={{ fontSize: '0.7rem', padding: '2px 4px', border: '1px solid #ddd', borderRadius: '4px' }}
                          value={c.maxCaracteres || ''}
                          onChange={e => atualizarCampo(c.id, 'maxCaracteres', e.target.value ? parseInt(e.target.value) : '')}
                          placeholder="Caracteres máx."
                        />
                      </div>
                    )}
                    {c.type === 'Número' && (
                      <div style={{ marginTop: '5px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <label style={{ fontSize: '0.65rem', color: '#666', fontWeight: 'bold' }}>Mínimo:</label>
                          <input
                            type="number"
                            style={{ fontSize: '0.7rem', padding: '2px 4px', border: '1px solid #ddd', borderRadius: '4px', width: '100%' }}
                            value={c.minNumero !== undefined ? c.minNumero : ''}
                            onChange={e => atualizarCampo(c.id, 'minNumero', e.target.value !== '' ? Number(e.target.value) : '')}
                            placeholder="Mín"
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
                          />
                        </div>
                      </div>
                    )}

                    <div onMouseDown={e => startResize(e, c.id)} style={{ position: 'absolute', right: 0, bottom: 0, width: '15px', height: '15px', cursor: 'nwse-resize', borderRight: '2px solid #28a745', borderBottom: '2px solid #28a745', borderRadius: '0 0 8px 0' }} />
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '20px' }}>
                <button className="btn-logout" style={{ flex: 1, padding: '15px', fontWeight: 'bold' }} onClick={() => handleSubmit('Rascunho')}>Gravar Rascunho</button>
                <button className="btn-primary" style={{ flex: 1, padding: '15px', fontWeight: 'bold' }} onClick={() => handleSubmit('Publicado')}>Publicar</button>
              </div>
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
                    />
                    Ativar Cabeçalho (IPT Logo)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={showTitulo}
                      onChange={(e) => setShowTitulo(e.target.checked)}
                    />
                    Ativar Título do Formulário
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={showLogo}
                      onChange={(e) => setShowLogo(e.target.checked)}
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
                  />
                  <label style={{ fontSize: '0.85rem', fontWeight: '600', marginTop: '5px' }}>Alterar Logótipo:</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    style={{ fontSize: '0.8rem' }}
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
                            style={{ cursor: 'pointer' }}
                          />
                          <span style={{ fontSize: '0.85rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', opacity: c.visivel !== false ? 1 : 0.5 }}>
                            {c.label || "Sem nome"}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                          <button
                            onClick={() => removerCampo(c.id)}
                            style={{ border: 'none', background: 'none', color: 'red', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}
                            title="Eliminar campo"
                          >
                            🗑
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Toolbox Card */}
            <div className="card" style={{ padding: '20px' }}>
              <h4 style={{ marginBottom: '15px' }}>Toolbox</h4>
              <p style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#999' }}>TIPOS BÁSICOS</p>
              {templates.TIPOS.map((t, i) => (
                <div key={`tipo-${i}`} draggable onDragStart={(e) => onDragStart(e, t)} style={{ padding: '10px', backgroundColor: '#f8f9fa', border: '1px solid #ddd', marginBottom: '5px', cursor: 'grab', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                  + {t.label}
                </div>
              ))}

              {templates.PERSONALIZADOS.length > 0 && (
                <>
                  <p style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#28a745', marginTop: '15px' }}>PERSONALIZADOS</p>
                  {templates.PERSONALIZADOS.map((t, i) => (
                    <div key={`custom-${i}`} draggable onDragStart={(e) => onDragStart(e, t)} style={{ padding: '10px', backgroundColor: '#f6ffed', border: '1px solid #b7eb8f', marginBottom: '5px', cursor: 'grab', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                      ★ {t.label}
                    </div>
                  ))}
                </>
              )}

              <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #eee' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '10px' }}>Criar Ferramenta</p>
                <input
                  style={{ width: '100%', padding: '8px', fontSize: '0.8rem', marginBottom: '5px', borderRadius: '4px', border: '1px solid #ddd' }}
                  placeholder="Nome da pergunta..."
                  value={novoModeloNome}
                  onChange={e => setNovoModeloNome(e.target.value)}
                />
                <select
                  style={{ width: '100%', padding: '8px', fontSize: '0.8rem', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                  value={novoModeloTipo}
                  onChange={e => setNovoModeloTipo(e.target.value)}
                >
                  <option value="Texto Curto">Texto Curto</option>
                  <option value="Texto Longo">Texto Longo</option>
                  <option value="Número">Número</option>
                  <option value="Data">Data</option>
                </select>
                <button onClick={adicionarCustom} style={{ width: '100%', padding: '8px', backgroundColor: '#f0f0f0', border: '1px solid #ccc', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>+ Adicionar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CriarFormulario;
