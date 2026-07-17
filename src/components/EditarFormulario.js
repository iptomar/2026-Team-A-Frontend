import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './EditarFormulario.css';
import { obterClassesPosicaoCampo } from '../utils/formUtils';
const TEMPLATES = [{
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
  type: 'Dropdown',
  label: 'Dropdown',
  w: 6
}, {
  type: 'Ficheiro',
  label: 'Upload de Ficheiro',
  w: 12
}];
function EditarFormulario() {
  const {
    id
  } = useParams();
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
            y: c.y || index * 2 + 1,
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
  const onDrop = e => {
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
    setCampos(campos.map(c => c.id === id ? {
      ...c,
      [prop]: val
    } : c));
  };
  const removerCampo = id => {
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
  const handleSave = async e => {
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
            minNumero: c.minNumero !== undefined && c.minNumero !== '' ? Number(c.minNumero) : undefined,
            maxNumero: c.maxNumero !== undefined && c.maxNumero !== '' ? Number(c.maxNumero) : undefined
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
  const adicionarOpcaoNoCampo = id => {
    if (isReadOnly) return;
    const campo = campos.find(item => item.id === id);
    if (!campo || !(campo.novaOpcao || '').trim()) return;
    if (campo.opcoes.includes(campo.novaOpcao)) {
      setMensagem('Erro: Esta opção já existe.');
      return;
    }
    setCampos(prev => prev.map(item => item.id === id ? {
      ...item,
      opcoes: [...item.opcoes, item.novaOpcao],
      novaOpcao: ''
    } : item));
  };
  const removerOpcaoDoCampo = (id, indice) => {
    if (isReadOnly) return;
    setCampos(prev => prev.map(c => c.id === id ? {
      ...c,
      opcoes: c.opcoes.filter((_, i) => i !== indice)
    } : c));
  };
  if (loading) return <div className="form-editor__loading">A carregar...</div>;
  return <div className="form-editor">
      <div className="form-editor__header">
        <h2>Editor de Layout Livre</h2>
        <div className="form-editor__header-actions">
          <button onClick={() => setIsPreview(!isPreview)} className="form-editor__preview-toggle">
            {isPreview ? 'Voltar ao Editor' : '👁 Pré-visualizar'}
          </button>
          <button className="btn-logout" onClick={() => navigate('/admin')}>Cancelar</button>
        </div>
      </div>

      {mensagem && <div className={`editor-message ${mensagem.includes('Erro') ? 'is-error' : 'is-success'}`}>
          {mensagem}
        </div>}

      <div className="form-editor__workspace">
        {/* Main Canvas and Preview container on Left */}
        <div className="form-editor__main">
          {isPreview ? <div className="ipt-form-card form-editor__preview">
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
                {campos.filter(c => c.visivel !== false).map(c => {
              const isSalaField = c.etiqueta.toLowerCase().includes('sala') || c.etiqueta.toLowerCase().includes('room');
              return <div key={c.id} className={obterClassesPosicaoCampo(c)}>
                      <label className="form-editor-field__label">
                        {c.etiqueta} {c.obrigatorio && <span className="form-editor-field__required">*</span>}
                      </label>
                      {isSalaField ? <select disabled className="form-editor-field__preview-control">
                          <option>Selecione uma sala...</option>
                        </select> : c.tipo === 'Dropdown' ? <select disabled className="form-editor-field__preview-control">
                          <option>Selecione uma opção...</option>
                          {c.opcoes && c.opcoes.map((op, idx) => <option key={idx}>{op}</option>)}
                        </select> : c.tipo === 'Ficheiro' ? <div className="file-field-preview">












                          <div className="file-field-preview__icon">📁</div>
                          <div className="file-field-preview__prompt">Arrastar e soltar ficheiro aqui</div>
                          <div className="file-field-preview__separator">ou</div>
                          <button type="button" disabled className="file-field-preview__button">











                            Selecionar Ficheiro
                          </button>
                        </div> : <input type={c.tipo === 'Data' ? 'date' : c.tipo === 'Hora' ? 'time' : c.tipo === 'Número' ? 'number' : 'text'} disabled placeholder={c.tipo === 'Data' || c.tipo === 'Hora' ? '' : 'Introduza aqui...'} className="form-editor-field__preview-control" />}
                    </div>;
            })}
              </div>
            </div> : <div className="form-editor__builder">
              {/* PDF Header Layout in Editor */}
              {showCabecalho && <div className="ipt-pdf-header">
                  {showLogo && <div className="ipt-pdf-header-logo-box">
                      {logo ? <img src={logo} alt="Logótipo" className="form-document__logo" /> : <div className="form-document__logo-placeholder">Sem Logo</div>}
                    </div>}
                  <div className="ipt-pdf-header-title-box">
                    {showTitulo ? <input className="ipt-pdf-header-title-input" value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="TÍTULO DO REQUERIMENTO" disabled={isReadOnly} /> : <div className="form-document__hidden-title-placeholder">(Título Ocultado)</div>}
                  </div>
                  <div className="ipt-pdf-header-meta-box">
                    <div className="ipt-pdf-meta-top">{codigoDocumento}</div>
                    <div className="ipt-pdf-meta-bottom">Página 1 de 1</div>
                  </div>
                </div>}

              {/* Schools Checkboxes Bar in Editor */}
              {showCabecalho && <div className="ipt-pdf-schools-bar">
                  <label><input type="checkbox" disabled={isReadOnly} /> ESGT</label>
                  <label><input type="checkbox" disabled={isReadOnly} /> ESTA</label>
                  <label><input type="checkbox" disabled={isReadOnly} /> ESTT</label>
                </div>}

              {/* Description Input Card */}
              <div className="card form-editor__metadata-card">
                <textarea value={descricao} onChange={e => setDescricao(e.target.value)} disabled={isReadOnly} rows="2" placeholder="Adicione uma descrição..." className="form-editor__description-input" />
                <div className="form-editor__category-row">
                  <label className="form-editor__category-label">Categoria:</label>
                  <input value={categoria} onChange={e => setCategoria(e.target.value)} disabled={isReadOnly} className="form-editor__category-input" />
                </div>
              </div>

              <div ref={canvasRef} onDragOver={e => !isReadOnly && e.preventDefault()} onDrop={onDrop} className="form-editor__canvas">







                {campos.filter(c => c.visivel !== false).map(c => <div key={c.id} className={`editable-field-card editable-field-card-blue ${obterClassesPosicaoCampo(c)}`}>
                    <div className="form-editor-editable-field__header">
                      <div onMouseDown={e => startMove(e, c.id)} className={`field-drag-handle ${isReadOnly ? 'is-read-only' : ''}`}>⠿</div>
                      <span className="form-editor-editable-field__drag-handle">{c.type}</span>
                      {!isReadOnly && <button onClick={() => removerCampo(c.id)} className="form-editor-editable-field__type">×</button>}
                    </div>
                    <input value={c.etiqueta} onChange={e => atualizarCampo(c.id, 'etiqueta', e.target.value)} disabled={isReadOnly} className="form-editor-editable-field__remove-button" />

                    <div className="form-editor-editable-field__label-input">
                      <input type="checkbox" checked={c.obrigatorio} onChange={e => atualizarCampo(c.id, 'obrigatorio', e.target.checked)} disabled={isReadOnly} />
                      <span className="form-editor-editable-field__required-row">Obrigatório</span>
                    </div>

                    {/* INPUTS PARA CONFIGURAR LIMITES EM EDIÇÃO */}
                    {['Texto Curto', 'Texto Longo', 'Nome', 'Email'].includes(c.tipo) && <div className="form-editor-editable-field__required-label">
                        <label className="form-editor-editable-field__constraint-row">Tam. Máximo:</label>
                        <input type="number" value={c.maxCaracteres || ''} onChange={e => atualizarCampo(c.id, 'maxCaracteres', e.target.value ? parseInt(e.target.value) : '')} placeholder="Caracteres máx." disabled={isReadOnly} className="form-editor-editable-field__constraint-label" />

                      </div>}
                    {c.tipo === 'Número' && <div className="form-editor-editable-field__constraint-input">
                        <div className="form-editor-editable-field__number-limits">
                          <label className="form-editor-editable-field__number-limit">Mínimo:</label>
                          <input type="number" value={c.minNumero !== undefined ? c.minNumero : ''} onChange={e => atualizarCampo(c.id, 'minNumero', e.target.value !== '' ? Number(e.target.value) : '')} placeholder="Mín" disabled={isReadOnly} className="form-editor-editable-field__constraint-label" />

                        </div>
                        <div className="form-editor-editable-field__constraint-input">
                          <label className="form-editor-editable-field__number-limit">Máximo:</label>
                          <input type="number" value={c.maxNumero !== undefined ? c.maxNumero : ''} onChange={e => atualizarCampo(c.id, 'maxNumero', e.target.value !== '' ? Number(e.target.value) : '')} placeholder="Máx" disabled={isReadOnly} className="form-editor-editable-field__constraint-label" />

                        </div>
                      </div>}



                    {tiposComOpcoes.includes(c.tipo) && <div className="form-editor-editable-field__constraint-input">
                        {!isReadOnly && <div className="form-editor-editable-field__options">
                            <input type="text" value={c.novaOpcao} onChange={e => atualizarCampo(c.id, 'novaOpcao', e.target.value)} placeholder="Opção..." className="form-editor-editable-field__new-option" />
                            <button onClick={() => adicionarOpcaoNoCampo(c.id)} className="form-editor-editable-field__add-option">+</button>
                          </div>}
                        <div className="form-editor-editable-field__option-list">
                          {c.opcoes.map((op, idx) => <span key={idx} className="form-editor-editable-field__option">
                              {op}
                              {!isReadOnly && <button onClick={() => removerOpcaoDoCampo(c.id, idx)} className="form-editor-editable-field__remove-option">×</button>}
                            </span>)}
                        </div>
                      </div>}

                    {!isReadOnly && <div onMouseDown={e => startResize(e, c.id)} className="form-editor-editable-field__resize-handle" />}
                  </div>)}
              </div>

              {!isReadOnly && <button onClick={handleSave} className="form-editor__save-button">
                  Guardar Alterações
                </button>}
            </div>}
        </div>

        {/* Control Panel / Sidebar on Right */}
        {!isPreview && <div className="form-editor__sidebar">
            {/* Definições Globais e Visibilidade Card */}
            <div className="card form-editor__sidebar-card">
              <h4 className="form-editor__sidebar-title">Definições Globais e Visibilidade</h4>

              {/* Secção 1: Estrutura Global */}
              <div className="form-editor__message">
                <p className="form-editor__settings-section">Estrutura Global do Formulário</p>
                <div className="form-editor__settings-heading">
                  <label className="form-editor__settings-options">
                    <input type="checkbox" checked={showCabecalho} onChange={e => setShowCabecalho(e.target.checked)} disabled={isReadOnly} />

                    Ativar Cabeçalho (IPT Logo)
                  </label>
                  <label className="form-editor__toggle-label">
                    <input type="checkbox" checked={showTitulo} onChange={e => setShowTitulo(e.target.checked)} disabled={isReadOnly} />

                    Ativar Título do Formulário
                  </label>
                  <label className="form-editor__toggle-label">
                    <input type="checkbox" checked={showLogo} onChange={e => setShowLogo(e.target.checked)} disabled={isReadOnly} />

                    Ativar Imagem/Logo (IPT)
                  </label>
                </div>
              </div>

              {/* Secção 1.5: Logótipo e Referência */}
              <div className="form-editor__toggle-label">
                <p className="form-editor__settings-section">Logótipo e Referência</p>
                <div className="form-editor__settings-heading">
                  <label className="form-editor__settings-options">Código do Documento:</label>
                  <input value={codigoDocumento} onChange={e => setCodigoDocumento(e.target.value)} placeholder="Ex: PT.SIGQ.MOD ACA 30 60 - 3" disabled={isReadOnly} className="form-editor__document-label" />

                  <label className="form-editor__document-code">Alterar Logótipo:</label>
                  <input type="file" accept="image/*" onChange={handleLogoChange} disabled={isReadOnly} className="form-editor__logo-label" />

                  {logo && <div className="form-editor__logo-input">
                      <img src={logo} alt="Mini Logo" className="form-editor__logo-preview" />
                    </div>}
                </div>
              </div>

              {/* Secção 2: Visibilidade de Campos */}
              <div>
                <p className="form-editor__logo-thumbnail">Visibilidade dos Campos Individuais</p>
                {campos.length === 0 ? <p className="form-editor__settings-heading">Nenhum campo adicionado.</p> : <div className="form-editor__empty-fields">
                    {campos.map(c => <div key={c.id} className="form-editor-field-visibility-list">










                        <div className="form-editor-field-visibility-item">
                          <input type="checkbox" checked={c.visivel !== false} onChange={e => atualizarCampo(c.id, 'visivel', e.target.checked)} title={c.visivel !== false ? "Desativar campo" : "Ativar campo"} disabled={isReadOnly} className={`visibility-toggle ${isReadOnly ? 'is-read-only' : ''}`} />

                          <span className={`form-editor-field-visibility-label ${c.visivel === false ? 'is-hidden' : ''}`}>
                            {c.etiqueta || "Sem nome"}
                          </span>
                        </div>
                        <div className="form-editor-field-visibility-item__content">
                          {!isReadOnly && <button onClick={() => removerCampo(c.id)} title="Eliminar campo" className="form-editor-field-visibility-item__actions">

                              🗑
                            </button>}
                        </div>
                      </div>)}
                  </div>}
              </div>
            </div>

            {/* Toolbox Card */}
            <div className="card form-editor-field-visibility-item__delete">
              <h4>Toolbox</h4>
              <p className="form-editor__sidebar-card">ARRASTE PARA O QUADRO</p>
              {TEMPLATES.map((t, i) => <div key={i} draggable={!isReadOnly} onDragStart={e => onDragStart(e, t)} className={`toolbox-item ${isReadOnly ? 'is-read-only' : ''}`}>
                  + {t.label}
                </div>)}
            </div>
          </div>}
      </div>
    </div>;
}
export default EditarFormulario;
