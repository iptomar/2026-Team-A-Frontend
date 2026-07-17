import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './CriarFormulario.css';
import { obterClassesPosicaoCampo } from '../utils/formUtils';

// Itens da Toolbox Iniciais
const INITIAL_TEMPLATES = [{
  type: 'Texto Curto',
  label: 'Texto Curto',
  w: 6
}, {
  type: 'Texto Longo',
  label: 'Texto Longo',
  w: 12
}, {
  type: 'Número',
  label: 'Número',
  w: 4
}, {
  type: 'Data',
  label: 'Data',
  w: 4
}, {
  type: 'Nome',
  label: 'Nome Completo',
  w: 12
}, {
  type: 'Email',
  label: 'Email',
  w: 6
}, {
  type: 'Ficheiro',
  label: 'Upload de Ficheiro',
  w: 12
}];
function CriarFormulario({
  onFormularioCriado
}) {
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
  const handleLogoChange = e => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = uploadEvent => {
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
    const novo = {
      type: novoModeloTipo,
      label: novoModeloNome,
      w: 6
    };
    setTemplates(prev => ({
      ...prev,
      PERSONALIZADOS: [...prev.PERSONALIZADOS, novo]
    }));
    setNovoModeloNome('');
  };
  const onDragStart = (e, template) => {
    window._draggedTemplate = template;
  };
  const onDrop = e => {
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
    setCampos(campos.map(c => c.id === id ? {
      ...c,
      [prop]: val
    } : c));
  };
  const removerCampo = id => setCampos(campos.filter(c => c.id !== id));
  const startResize = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const campo = campos.find(c => c.id === id);
    const startW = campo.w;
    const colWidth = canvasRef.current.offsetWidth / 12;
    const onMouseMove = moveEvent => {
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
    const onMouseMove = moveEvent => {
      const deltaX = moveEvent.clientX - startMouseX;
      const deltaY = moveEvent.clientY - startMouseY;
      const colDelta = Math.round(deltaX / colWidth);
      const rowDelta = Math.round(deltaY / rowHeight);
      const newX = Math.max(1, Math.min(12 - (campo.w - 1), startGridX + colDelta));
      const newY = Math.max(1, startGridY + rowDelta);
      if (newX !== campo.x || newY !== campo.y) {
        setCampos(prev => prev.map(c => c.id === id ? {
          ...c,
          x: newX,
          y: newY
        } : c));
      }
    };
    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };
  const handleSubmit = async acao => {
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
        minNumero: c.minNumero !== undefined && c.minNumero !== '' ? Number(c.minNumero) : undefined,
        maxNumero: c.maxNumero !== undefined && c.maxNumero !== '' ? Number(c.maxNumero) : undefined
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
  return <div className="form-builder">
      <div className="form-builder__header">
        <h2>Painel de Desenho Livre</h2>
        <button onClick={() => setIsPreview(!isPreview)} className="form-builder__preview-toggle">
          {isPreview ? 'Voltar ao Editor' : '👁 Ver Formulário'}
        </button>
      </div>

      {mensagem && <div className={`editor-message ${mensagem.includes('Erro') ? 'is-error' : 'is-success'}`}>
          {mensagem}
        </div>}

      <div className="form-builder__workspace">
        {/* Main Canvas and Preview container on Left */}
        <div className="form-builder__main">
          {isPreview ? <div className="ipt-form-card form-builder__preview">
              {/* PDF Header Layout */}
              {showCabecalho && <div className="ipt-pdf-header">
                  {showLogo && <div className="ipt-pdf-header-logo-box">
                      {logo ? <img src={logo} alt="Logótipo" className="form-document__logo" /> : <div className="form-document__logo-placeholder">Sem Logo</div>}
                    </div>}
                  <div className="ipt-pdf-header-title-box">
                    {showTitulo ? <h1 className="ipt-pdf-header-title-text">{titulo || 'REQUERIMENTO / ASSUNTOS DIVERSOS'}</h1> : <h1 className="ipt-pdf-header-title-text form-document__hidden-title">REQUERIMENTO</h1>}
                  </div>
                  <div className="ipt-pdf-header-meta-box">
                    <div className="ipt-pdf-meta-top">{codigoDocumento}</div>
                    <div className="ipt-pdf-meta-bottom">Página 1 de 1</div>
                  </div>
                </div>}

              {/* Schools Checkboxes Bar */}
              {showCabecalho && <div className="ipt-pdf-schools-bar">
                  <label><input type="checkbox" disabled /> ESGT</label>
                  <label><input type="checkbox" disabled /> ESTA</label>
                  <label><input type="checkbox" disabled /> ESTT</label>
                </div>}

              {descricao && <div className="form-document__description">
                  <p className="form-document__description-text">{descricao}</p>
                </div>}

              <div className="form-document__fields">
                {campos.filter(c => c.visivel !== false).map(c => <div key={c.id} className={obterClassesPosicaoCampo(c)}>
                    <label className="form-builder-field__label">{c.label} {c.obrigatorio && <span className="form-builder-field__required">*</span>}</label>
                    {c.type === 'Ficheiro' ? <div className="file-field-preview">












                        <div className="file-field-preview__icon">📁</div>
                        <div className="file-field-preview__prompt">Arrastar e soltar ficheiro aqui</div>
                        <div className="file-field-preview__separator">ou</div>
                        <button type="button" disabled className="file-field-preview__button">











                          Selecionar Ficheiro
                        </button>
                      </div> : <input disabled placeholder={`Resposta (${c.type})...`} className="form-builder-field__preview-control" />}
                  </div>)}
              </div>
            </div> : <div className="form-builder__editor">
              {/* PDF Header Layout in Editor */}
              {showCabecalho && <div className="ipt-pdf-header">
                  {showLogo && <div className="ipt-pdf-header-logo-box">
                      {logo ? <img src={logo} alt="Logótipo" className="form-document__logo" /> : <div className="form-document__logo-placeholder">Sem Logo</div>}
                    </div>}
                  <div className="ipt-pdf-header-title-box">
                    {showTitulo ? <input className="ipt-pdf-header-title-input" value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="TÍTULO DO REQUERIMENTO" /> : <div className="form-document__hidden-title-placeholder">(Título Ocultado)</div>}
                  </div>
                  <div className="ipt-pdf-header-meta-box">
                    <div className="ipt-pdf-meta-top">{codigoDocumento}</div>
                    <div className="ipt-pdf-meta-bottom">Página 1 de 1</div>
                  </div>
                </div>}

              {/* Schools Checkboxes Bar in Editor */}
              {showCabecalho && <div className="ipt-pdf-schools-bar">
                  <label><input type="checkbox" /> ESGT</label>
                  <label><input type="checkbox" /> ESTA</label>
                  <label><input type="checkbox" /> ESTT</label>
                </div>}

              {/* Description Input Card */}
              <div className="card form-builder__metadata-card">
                <textarea rows="2" value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Adicione uma descrição..." className="form-builder__description-input" />

                <div className="form-builder__category-row">
                  <label className="form-builder__category-label">Categoria:</label>
                  <input value={categoria} onChange={e => setCategoria(e.target.value)} placeholder="Ex: Infraestrutura, Material, Espaço" className="form-builder__category-input" />

                </div>
              </div>

              <div ref={canvasRef} onDragOver={e => e.preventDefault()} onDrop={onDrop} className="form-builder__canvas">







                {campos.filter(c => c.visivel !== false).map(c => <div key={c.id} className={`editable-field-card editable-field-card-green ${obterClassesPosicaoCampo(c)}`}>
                    <div className="form-builder-editable-field__header">
                      <div onMouseDown={e => startMove(e, c.id)} className="form-builder-editable-field__drag-handle">⠿</div>
                      <span className="form-builder-editable-field__type">{c.type}</span>
                      <button onClick={() => removerCampo(c.id)} className="form-builder-editable-field__remove-button">×</button>
                    </div>
                    <input value={c.label} onChange={e => atualizarCampo(c.id, 'label', e.target.value)} className="form-builder-editable-field__label-input" />

                    <div className="form-builder-editable-field__required-row">
                      <input type="checkbox" checked={c.obrigatorio} onChange={e => atualizarCampo(c.id, 'obrigatorio', e.target.checked)} />
                      <span className="form-builder-editable-field__required-label">Obrigatório</span>
                    </div>

                    {/* INPUTS PARA CONFIGURAR LIMITES */}
                    {['Texto Curto', 'Texto Longo', 'Nome', 'Email'].includes(c.type) && <div className="form-builder-editable-field__constraint-row">
                        <label className="form-builder-editable-field__constraint-label">Tam. Máximo:</label>
                        <input type="number" value={c.maxCaracteres || ''} onChange={e => atualizarCampo(c.id, 'maxCaracteres', e.target.value ? parseInt(e.target.value) : '')} placeholder="Caracteres máx." className="form-builder-editable-field__constraint-input" />

                      </div>}
                    {c.type === 'Número' && <div className="form-builder-editable-field__number-limits">
                        <div className="form-builder-editable-field__number-limit">
                          <label className="form-builder-editable-field__constraint-label">Mínimo:</label>
                          <input type="number" value={c.minNumero !== undefined ? c.minNumero : ''} onChange={e => atualizarCampo(c.id, 'minNumero', e.target.value !== '' ? Number(e.target.value) : '')} placeholder="Mín" className="form-builder-editable-field__constraint-input" />

                        </div>
                        <div className="form-builder-editable-field__number-limit">
                          <label className="form-builder-editable-field__constraint-label">Máximo:</label>
                          <input type="number" value={c.maxNumero !== undefined ? c.maxNumero : ''} onChange={e => atualizarCampo(c.id, 'maxNumero', e.target.value !== '' ? Number(e.target.value) : '')} placeholder="Máx" className="form-builder-editable-field__constraint-input" />

                        </div>
                      </div>}

                    <div onMouseDown={e => startResize(e, c.id)} className="form-builder-editable-field__resize-handle" />
                  </div>)}
              </div>

              <div className="form-builder__actions">
                <button className="btn-logout form-builder__submit-button" onClick={() => handleSubmit('Rascunho')}>Gravar Rascunho</button>
                <button className="btn-primary form-builder__submit-button" onClick={() => handleSubmit('Publicado')}>Publicar</button>
              </div>
            </div>}
        </div>

        {/* Control Panel / Sidebar on Right */}
        {!isPreview && <div className="form-builder__sidebar">
            {/* Definições Globais e Visibilidade Card */}
            <div className="card form-builder__sidebar-card">
              <h4 className="form-builder__sidebar-title">Definições Globais e Visibilidade</h4>

              {/* Secção 1: Estrutura Global */}
              <div className="form-builder__message">
                <p className="form-builder__settings-section">Estrutura Global do Formulário</p>
                <div className="form-builder__settings-heading">
                  <label className="form-builder__settings-options">
                    <input type="checkbox" checked={showCabecalho} onChange={e => setShowCabecalho(e.target.checked)} />

                    Ativar Cabeçalho (IPT Logo)
                  </label>
                  <label className="form-builder__toggle-label">
                    <input type="checkbox" checked={showTitulo} onChange={e => setShowTitulo(e.target.checked)} />

                    Ativar Título do Formulário
                  </label>
                  <label className="form-builder__toggle-label">
                    <input type="checkbox" checked={showLogo} onChange={e => setShowLogo(e.target.checked)} />

                    Ativar Imagem/Logo (IPT)
                  </label>
                </div>
              </div>

              {/* Secção 1.5: Logótipo e Referência */}
              <div className="form-builder__toggle-label">
                <p className="form-builder__settings-section">Logótipo e Referência</p>
                <div className="form-builder__settings-heading">
                  <label className="form-builder__settings-options">Código do Documento:</label>
                  <input value={codigoDocumento} onChange={e => setCodigoDocumento(e.target.value)} placeholder="Ex: PT.SIGQ.MOD ACA 30 60 - 3" className="form-builder__document-label" />

                  <label className="form-builder__document-code">Alterar Logótipo:</label>
                  <input type="file" accept="image/*" onChange={handleLogoChange} className="form-builder__logo-label" />


                  {logo && <div className="form-builder__logo-input">
                      <img src={logo} alt="Mini Logo" className="form-builder__logo-preview" />
                    </div>}
                </div>
              </div>

              {/* Secção 2: Visibilidade de Campos */}
              <div>
                <p className="form-builder__logo-thumbnail">Visibilidade dos Campos Individuais</p>
                {campos.length === 0 ? <p className="form-builder__settings-heading">Nenhum campo adicionado.</p> : <div className="form-builder__empty-fields">
                    {campos.map(c => <div key={c.id} className="form-builder-field-visibility-list">










                        <div className="form-builder-field-visibility-item">
                          <input type="checkbox" checked={c.visivel !== false} onChange={e => atualizarCampo(c.id, 'visivel', e.target.checked)} title={c.visivel !== false ? "Desativar campo" : "Ativar campo"} className="form-builder-field-visibility-item__content" />


                          <span className={`form-builder-field-visibility-label ${c.visivel === false ? 'is-hidden' : ''}`}>
                            {c.label || "Sem nome"}
                          </span>
                        </div>
                        <div className="form-builder-field-visibility-item__checkbox">
                          <button onClick={() => removerCampo(c.id)} title="Eliminar campo" className="form-builder-field-visibility-item__actions">

                            🗑
                          </button>
                        </div>
                      </div>)}
                  </div>}
              </div>
            </div>

            {/* Toolbox Card */}
            <div className="card form-builder-field-visibility-item__delete">
              <h4 className="form-builder__sidebar-card">Toolbox</h4>
              <p className="form-builder__sidebar-title">TIPOS BÁSICOS</p>
              {templates.TIPOS.map((t, i) => <div key={`tipo-${i}`} draggable onDragStart={e => onDragStart(e, t)} className="toolbox__section-label">
                  + {t.label}
                </div>)}

              {templates.PERSONALIZADOS.length > 0 && <>
                  <p className="toolbox__item">PERSONALIZADOS</p>
                  {templates.PERSONALIZADOS.map((t, i) => <div key={`custom-${i}`} draggable onDragStart={e => onDragStart(e, t)} className="toolbox__custom-label">
                      ★ {t.label}
                    </div>)}
                </>}

              <div className="toolbox__item--custom">
                <p className="toolbox__creator">Criar Ferramenta</p>
                <input placeholder="Nome da pergunta..." value={novoModeloNome} onChange={e => setNovoModeloNome(e.target.value)} className="toolbox__creator-title" />

                <select value={novoModeloTipo} onChange={e => setNovoModeloTipo(e.target.value)} className="toolbox__name-input">

                  <option value="Texto Curto">Texto Curto</option>
                  <option value="Texto Longo">Texto Longo</option>
                  <option value="Número">Número</option>
                  <option value="Data">Data</option>
                </select>
                <button onClick={adicionarCustom} className="toolbox__type-select">+ Adicionar</button>
              </div>
            </div>
          </div>}
      </div>
    </div>;
}
export default CriarFormulario;
