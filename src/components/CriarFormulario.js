import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CriarFormulario.css';

function CriarFormulario({ onFormularioCriado }) {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [loading, setLoading] = useState(false);
  const [campos, setCampos] = useState([]);
  const [novaEtiqueta, setNovaEtiqueta] = useState("");
  const [novoTipo, setNovoTipo] = useState("Texto Curto");
  const [novoObrigatorio, setNovoObrigatorio] = useState(false);
  const [isPreview, setIsPreview] = useState(false);

  const navigate = useNavigate();

  const adicionarCampo = () => {
    if (novaEtiqueta.trim() === '') {
      setMensagem('Erro: A etiqueta do campo é obrigatória.');
      return;
    }
    const novoCampo = {
      id: Date.now(),
      etiqueta: novaEtiqueta,
      tipo: novoTipo,
      obrigatorio: novoObrigatorio,
    };
    setCampos([...campos, novoCampo]);
    setNovaEtiqueta("");
    setMensagem("");
  };

  const removerCampo = (id) => {
    setCampos(campos.filter((campo) => campo.id !== id));
  };

  const handleSubmit = async (acao) => {
    if (titulo.trim() === "") {
      setMensagem("Erro: O Título é obrigatório.");
      return;
    }

    setLoading(true);
    setMensagem("");

    const novoFormulario = {
      titulo,
      descricao,
      categoria: categoria.trim() || 'Sem categoria',
      estado: acao,
      campos: campos.map(({ id, ...rest }) => rest),
      corPrincipal: localStorage.getItem('corPrincipal') || '#28a745',
      logo: localStorage.getItem('logo') || null
    };

    try {
      const response = await fetch("http://localhost:3000/api/forms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(novoFormulario)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao comunicar com o servidor");
      }

      setMensagem(`Sucesso! Formulário ${acao === 'Publicado' ? 'publicado' : 'guardado'} com sucesso.`);
      
      if (onFormularioCriado) onFormularioCriado();
      
      if (acao === 'Publicado') {
        setTimeout(() => navigate('/admin'), 1500);
      }
    } catch (error) {
      setMensagem(`Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <div className="form-header">
        <h2>{isPreview ? 'Visualização do Professor' : 'Editor de Formulário'}</h2>
        <button 
          className="btn-logout" 
          onClick={() => setIsPreview(!isPreview)}
        >
          {isPreview ? 'Voltar ao Editor' : '👁 Ver como Professor'}
        </button>
      </div>

      {mensagem && (
        <div className={`form-message ${mensagem.includes('Erro') ? 'form-message-error' : 'form-message-success'}`}>
          {mensagem}
          <button 
            type="button"
            onClick={() => setMensagem('')} 
            className="close-message"
            title="Fechar mensagem"
          >
            ×
          </button>
        </div>
      )}
      {isPreview ? (
        <div className="card">
          <div className="preview-header">
            <h1 className="preview-title">{titulo || 'Sem Título'}</h1>
            <p className="text-muted">{descricao || 'Sem descrição definida.'}</p>
          </div>
          <div className="field-preview-list">
            {campos.length === 0 ? (
              <p className="text-center text-muted" style={{ fontStyle: 'italic' }}>Nenhum campo adicionado.</p>
            ) : (
              campos.map((campo, index) => (
                <div key={campo.id}>
                  <label className="field-label">
                    {index + 1}. {campo.etiqueta} {campo.obrigatorio && <span className="required-asterisk">*</span>}
                  </label>
                  <input className="form-input" disabled placeholder="Resposta do utilizador..." />
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="editor-layout">
          {/* Secção 1: Dados Base */}
          <div className="card">
            <h3 className="section-header">Informação Geral</h3>
            <div className="input-group">
              <div>
                <label style={{ fontWeight: '600' }}>Título do Formulário *</label>
                <input 
                  className="form-input"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ex: Requisição de Material"
                />
              </div>
              <div>
                <label style={{ fontWeight: '600' }}>Descrição</label>
                <textarea 
                  className="form-input"
                  rows="3"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Instruções para o preenchimento..."
                />
              </div>
              <div>
                <label style={{ fontWeight: '600' }}>Categoria</label>
                <input
                  className="form-input"
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  placeholder="Ex: Infraestrutura, Material, Espaço"
                />
              </div>
            </div>
          </div>

          {/* Secção 2: Adicionar Campos */}
          <div className="card">
            <h3 className="section-header">Estrutura de Perguntas</h3>
            
            <div className="field-add-section">
              <div className="field-add-grid">
                <div>
                  <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>Pergunta / Etiqueta</label>
                  <input 
                    className="form-input"
                    value={novaEtiqueta}
                    onChange={(e) => setNovaEtiqueta(e.target.value)}
                    placeholder="Ex: Nome Completo"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>Tipo</label>
                  <select className="form-input" value={novoTipo} onChange={(e) => setNovoTipo(e.target.value)}>
                    <option value="Texto Curto">Texto Curto</option>
                    <option value="Texto Longo">Texto Longo</option>
                    <option value="Número">Número</option>
                    <option value="Data">Data</option>
                    <option value="Hora">Hora</option>
                  </select>
                </div>
                <div className="checkbox-group">
                  <input type="checkbox" checked={novoObrigatorio} onChange={(e) => setNovoObrigatorio(e.target.checked)} />
                  <label style={{ fontWeight: '600' }}>Obrigatório</label>
                </div>
              </div>
              <button 
                className="btn-primary" 
                style={{ marginTop: '15px', width: '100%' }}
                onClick={adicionarCampo}
                disabled={loading}
              >
                + Adicionar esta Pergunta
              </button>
            </div>

            <div className="field-list">
              {campos.map((campo, index) => (
                <div key={campo.id} className="field-item">
                  <div>
                    <span className="text-muted" style={{ fontWeight: '700', marginRight: '10px' }}>#{index+1}</span>
                    <strong style={{ fontSize: '1.1rem' }}>{campo.etiqueta}</strong>
                    <span className="text-muted" style={{ marginLeft: '10px', fontSize: '0.85rem' }}>({campo.tipo})</span>
                    {campo.obrigatorio && <span className="error-text" style={{ marginLeft: '10px', fontSize: '0.8rem', fontWeight: '700' }}>OBRIGATÓRIO</span>}
                  </div>
                  <button onClick={() => removerCampo(campo.id)} style={{ background: 'none', border: 'none', color: 'var(--error-text)', fontWeight: '600' }} disabled={loading}>Remover</button>
                </div>
              ))}
              {campos.length === 0 && <p className="text-center text-muted">Ainda não adicionou perguntas.</p>}
            </div>
          </div>

          {/* Secção 3: Ações Finais */}
          <div className="field-actions">
            <button 
              className="btn-logout btn-full" 
              onClick={() => handleSubmit('Rascunho')}
              disabled={loading}
            >
              {loading ? 'A guardar...' : 'Gravar como Rascunho'}
            </button>
            <button 
              className="btn-primary btn-full" 
              onClick={() => handleSubmit('Publicado')}
              disabled={loading || campos.length === 0}
            >
              {loading ? 'A publicar...' : 'Publicar Formulário'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CriarFormulario;
