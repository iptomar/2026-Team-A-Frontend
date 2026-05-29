import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './EditarFormulario.css';

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
          // Converter campos do backend (etiqueta) para o formato do frontend (rotulo) se necessário
          // Mas vamos usar etiqueta consistentemente se possível. 
          // O backend usa 'etiqueta', o frontend 'EditarFormulario' usava 'rotulo'.
          // Vou ajustar para 'etiqueta' para ser consistente com o backend.
          setCampos(dados.campos.map(c => ({
            id: c._id || c.id,
            etiqueta: c.etiqueta,
            tipo: c.tipo,
            obrigatorio: c.obrigatorio,
            opcoes: c.opcoes || [],
            novaOpcao: ''
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

  const adicionarCampo = () => {
    if (isReadOnly) return;
    const novoCampo = {
      id: Date.now(),
      etiqueta: '',
      tipo: 'Texto Curto',
      obrigatorio: false,
      opcoes: [],
      novaOpcao: ''
    };
    setCampos([...campos, novoCampo]);
  };

  const removerCampo = (idParaRemover) => {
    if (isReadOnly) return;
    setCampos(campos.filter(campo => campo.id !== idParaRemover));
  };

  const atualizarCampo = (id, propriedade, valor) => {
    if (isReadOnly) return;
    const camposAtualizados = campos.map(campo => {
      if (campo.id === id) {
        if (propriedade === 'tipo' && !tiposComOpcoes.includes(valor)) {
          return { ...campo, [propriedade]: valor, opcoes: [], novaOpcao: '' };
        }
        return { ...campo, [propriedade]: valor };
      }
      return campo;
    });
    setCampos(camposAtualizados);
  };

  const adicionarOpcaoNoCampo = (id) => {
    if (isReadOnly) return;
    const campo = campos.find((item) => item.id === id);
    if (!campo) return;

    const valor = (campo.novaOpcao || '').trim();
    if (!valor) return;
    
    if (campo.opcoes.includes(valor)) {
      setMensagem('Erro: Esta opção já existe.');
      return;
    }

    const camposAtualizados = campos.map((item) => {
      if (item.id === id) {
        return { ...item, opcoes: [...(item.opcoes || []), valor], novaOpcao: '' };
      }
      return item;
    });

    setCampos(camposAtualizados);
  };

  const removerOpcaoDoCampo = (id, indice) => {
    if (isReadOnly) return;
    const camposAtualizados = campos.map((campo) => {
      if (campo.id === id) {
        return { ...campo, opcoes: (campo.opcoes || []).filter((_, index) => index !== indice) };
      }
      return campo;
    });
    setCampos(camposAtualizados);
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
          campos: campos.map(c => ({
            etiqueta: c.etiqueta,
            tipo: c.tipo,
            obrigatorio: c.obrigatorio,
            opcoes: c.opcoes
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

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>A carregar...</div>;

  const corPrincipal = localStorage.getItem('corPrincipal') || '#28a745';

  return (
    <div className="edit-container">
      <div className="edit-header">
        <h2 style={{ color: corPrincipal }}>Editar Formulário</h2>
        <button className="btn-logout" onClick={() => navigate('/admin')}>Cancelar</button>
      </div>

      {mensagem && (
        <div className={`edit-message ${mensagem.includes('Erro') ? 'form-message-error' : 'form-message-success'}`} style={{ border: `1px solid ${mensagem.includes('Erro') ? 'var(--error-text)' : 'var(--success-text)'}` }}>
          {mensagem}
        </div>
      )}

      <form onSubmit={handleSave} className="edit-form">
        <div className="card">
          <h3>Dados Gerais</h3>
          <div className="form-group">
            <label className="form-label">Título</label>
            <input 
              type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} 
              disabled={isReadOnly} required className="form-input"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Descrição</label>
            <textarea 
              value={descricao} onChange={(e) => setDescricao(e.target.value)} 
              disabled={isReadOnly} rows="3" className="form-input"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Categoria</label>
            <input
              type="text"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              disabled={isReadOnly}
              placeholder="Ex: Infraestrutura, Material, Espaço"
              className="form-input"
            />
          </div>
        </div>

        <div className="card">
          <div className="fields-header">
            <h3>Campos do Formulário</h3>
            {!isReadOnly && (
              <button type="button" onClick={adicionarCampo} className="btn-primary" style={{ backgroundColor: 'var(--primary-green)' }}>
                + Adicionar Campo
              </button>
            )}
          </div>

          {campos.map((campo, index) => (
            <div key={campo.id} className="field-editor-card">
              <div className="field-row">
                <span style={{ fontWeight: 'bold' }}>{index + 1}.</span>
                <input 
                  type="text" value={campo.etiqueta} onChange={(e) => atualizarCampo(campo.id, 'etiqueta', e.target.value)}
                  disabled={isReadOnly} placeholder="Etiqueta (ex: Nome Completo)" required className="field-input-etiqueta"
                />
                <select 
                  value={campo.tipo} onChange={(e) => atualizarCampo(campo.id, 'tipo', e.target.value)} 
                  disabled={isReadOnly} className="field-select-tipo"
                >
                  <option value="Texto Curto">Texto Curto</option>
                  <option value="Texto Longo">Texto Longo</option>
                  <option value="Data">Data</option>
                  <option value="Hora">Hora</option>
                  <option value="Dropdown">Dropdown</option>
                  <option value="Radio Button">Radio Button</option>
                  <option value="Checkbox">Checkbox</option>
                </select>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <input type="checkbox" checked={campo.obrigatorio} onChange={(e) => atualizarCampo(campo.id, 'obrigatorio', e.target.checked)} disabled={isReadOnly} />
                  Obrig.
                </label>
                {!isReadOnly && (
                  <button type="button" onClick={() => removerCampo(campo.id)} style={{ backgroundColor: 'var(--error-text)', color: 'white', border: 'none', padding: '8px', borderRadius: '4px' }}>
                    Apagar
                  </button>
                )}
              </div>

              {tiposComOpcoes.includes(campo.tipo) && (
                <div className="options-section">
                  {!isReadOnly && (
                    <div className="option-add-row">
                      <input
                        type="text" value={campo.novaOpcao}
                        onChange={(e) => atualizarCampo(campo.id, 'novaOpcao', e.target.value)}
                        placeholder="Nova opção" style={{ flex: 1, padding: '5px', backgroundColor: 'var(--input-bg)', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: '4px' }}
                      />
                      <button type="button" onClick={() => adicionarOpcaoNoCampo(campo.id)} style={{ padding: '5px 10px', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '4px' }}>
                        Adicionar
                      </button>
                    </div>
                  )}
                  <div className="options-list">
                    {campo.opcoes.map((opcao, idx) => (
                      <div key={idx} className="option-badge">
                        <span>{opcao}</span>
                        {!isReadOnly && (
                          <button type="button" onClick={() => removerOpcaoDoCampo(campo.id, idx)} style={{ border: 'none', background: 'none', color: 'var(--error-text)', fontWeight: 'bold', cursor: 'pointer' }}>×</button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {!isReadOnly && (
          <button type="submit" className="btn-primary btn-save">
            Guardar Alterações ({estado})
          </button>
        )}
      </form>
    </div>
  );
}

export default EditarFormulario;
