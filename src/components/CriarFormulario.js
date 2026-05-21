import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function CriarFormulario({ onFormularioCriado }) {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
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
      estado: acao,
      campos: campos.map(({ id, ...rest }) => rest),
      corPrincipal: localStorage.getItem('corPrincipal') || '#282c34',
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
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>{isPreview ? 'Visualização do Professor' : 'Editor de Formulário'}</h2>
        <button 
          className="btn-logout" 
          onClick={() => setIsPreview(!isPreview)}
        >
          {isPreview ? 'Voltar ao Editor' : '👁 Ver como Professor'}
        </button>
      </div>

      {mensagem && (
        <div style={{ 
          padding: '15px', 
          borderRadius: 'var(--radius-md)', 
          backgroundColor: mensagem.includes('Erro') ? 'var(--error-bg)' : '#e8f5e9',
          color: mensagem.includes('Erro') ? 'var(--error-text)' : '#2e7d32',
          marginBottom: '2rem',
          fontWeight: '600',
          borderLeft: `5px solid ${mensagem.includes('Erro') ? 'var(--error-text)' : '#2e7d32'}`
        }}>
          {mensagem}
          <button 
            type="button"
            onClick={() => setMensagem('')} 
            style={{ 
              position: 'absolute', 
              right: '10px', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              background: 'none', 
              border: 'none', 
              color: 'inherit', 
              cursor: 'pointer',
              fontSize: '20px',
              fontWeight: 'bold'
            }}
            title="Fechar mensagem"
          >
            ×
          </button>
        </div>
      )}
      {isPreview ? (
        <div className="card">
          <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
            <h1 style={{ color: 'var(--primary-green)' }}>{titulo || 'Sem Título'}</h1>
            <p style={{ color: 'var(--text-muted)' }}>{descricao || 'Sem descrição definida.'}</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {campos.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontStyle: 'italic' }}>Nenhum campo adicionado.</p>
            ) : (
              campos.map((campo, index) => (
                <div key={campo.id}>
                  <label style={{ fontWeight: '600', display: 'block', marginBottom: '8px' }}>
                    {index + 1}. {campo.etiqueta} {campo.obrigatorio && <span style={{ color: 'red' }}>*</span>}
                  </label>
                  <input className="form-input" disabled placeholder="Resposta do utilizador..." />
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Secção 1: Dados Base */}
          <div className="card">
            <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>Informação Geral</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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
            </div>
          </div>

          {/* Secção 2: Adicionar Campos */}
          <div className="card">
            <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>Estrutura de Perguntas</h3>
            
            <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: 'var(--radius-md)', marginBottom: '2rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px auto', gap: '15px', alignItems: 'flex-end' }}>
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
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', height: '45px' }}>
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {campos.map((campo, index) => (
                <div key={campo.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontWeight: '700', marginRight: '10px' }}>#{index+1}</span>
                    <strong style={{ fontSize: '1.1rem' }}>{campo.etiqueta}</strong>
                    <span style={{ marginLeft: '10px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>({campo.tipo})</span>
                    {campo.obrigatorio && <span style={{ marginLeft: '10px', color: 'var(--error-text)', fontSize: '0.8rem', fontWeight: '700' }}>OBRIGATÓRIO</span>}
                  </div>
                  <button onClick={() => removerCampo(campo.id)} style={{ background: 'none', border: 'none', color: 'var(--error-text)', fontWeight: '600' }} disabled={loading}>Remover</button>
                </div>
              ))}
              {campos.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Ainda não adicionou perguntas.</p>}
            </div>
          </div>

          {/* Secção 3: Ações Finais */}
          <div style={{ display: 'flex', gap: '20px' }}>
            <button 
              className="btn-logout" 
              style={{ flex: 1, padding: '15px' }}
              onClick={() => handleSubmit('Rascunho')}
              disabled={loading}
            >
              {loading ? 'A guardar...' : 'Gravar como Rascunho'}
            </button>
            <button 
              className="btn-primary" 
              style={{ flex: 1, padding: '15px' }}
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
