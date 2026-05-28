import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

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
          estado: 'Rascunho',
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

  const corPrincipal = localStorage.getItem('corPrincipal') || '#0056b3';

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: corPrincipal }}>Editar Formulário</h2>
        <button className="btn-logout" onClick={() => navigate('/admin')}>Cancelar</button>
      </div>

      {mensagem && (
        <div style={{
          padding: '15px', marginBottom: '20px', borderRadius: '4px',
          backgroundColor: mensagem.includes('Erro') ? '#ffebee' : '#e8f5e9',
          color: mensagem.includes('Erro') ? '#c62828' : '#2e7d32',
          border: `1px solid ${mensagem.includes('Erro') ? '#ef9a9a' : '#a5d6a7'}`,
          textAlign: 'center'
        }}>
          {mensagem}
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="card">
          <h3>Dados Gerais</h3>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Título</label>
            <input 
              type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} 
              disabled={isReadOnly} required className="form-input"
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Descrição</label>
            <textarea 
              value={descricao} onChange={(e) => setDescricao(e.target.value)} 
              disabled={isReadOnly} rows="3" className="form-input"
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Categoria</label>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3>Campos do Formulário</h3>
            {!isReadOnly && (
              <button type="button" onClick={adicionarCampo} className="btn-primary" style={{ backgroundColor: '#28a745' }}>
                + Adicionar Campo
              </button>
            )}
          </div>

          {campos.map((campo, index) => (
            <div key={campo.id} style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px', marginBottom: '15px', border: '1px solid #ddd' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontWeight: 'bold' }}>{index + 1}.</span>
                <input 
                  type="text" value={campo.etiqueta} onChange={(e) => atualizarCampo(campo.id, 'etiqueta', e.target.value)}
                  disabled={isReadOnly} placeholder="Etiqueta (ex: Nome Completo)" required style={{ flex: 1, padding: '8px' }}
                />
                <select 
                  value={campo.tipo} onChange={(e) => atualizarCampo(campo.id, 'tipo', e.target.value)} 
                  disabled={isReadOnly} style={{ padding: '8px' }}
                >
                  <option value="Texto Curto">Texto Curto</option>
                  <option value="Texto Longo">Texto Longo</option>
                  <option value="Data">Data</option>
                  <option value="Dropdown">Dropdown</option>
                  <option value="Radio Button">Radio Button</option>
                  <option value="Checkbox">Checkbox</option>
                </select>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <input type="checkbox" checked={campo.obrigatorio} onChange={(e) => atualizarCampo(campo.id, 'obrigatorio', e.target.checked)} disabled={isReadOnly} />
                  Obrig.
                </label>
                {!isReadOnly && (
                  <button type="button" onClick={() => removerCampo(campo.id)} style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '8px', borderRadius: '4px' }}>
                    Apagar
                  </button>
                )}
              </div>

              {tiposComOpcoes.includes(campo.tipo) && (
                <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#fff', borderRadius: '4px', border: '1px solid #eee' }}>
                  {!isReadOnly && (
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                      <input
                        type="text" value={campo.novaOpcao}
                        onChange={(e) => atualizarCampo(campo.id, 'novaOpcao', e.target.value)}
                        placeholder="Nova opção" style={{ flex: 1, padding: '5px' }}
                      />
                      <button type="button" onClick={() => adicionarOpcaoNoCampo(campo.id)} style={{ padding: '5px 10px', backgroundColor: '#17a2b8', color: 'white', border: 'none' }}>
                        Adicionar
                      </button>
                    </div>
                  )}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {campo.opcoes.map((opcao, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 10px', backgroundColor: '#e9ecef', borderRadius: '20px' }}>
                        <span>{opcao}</span>
                        {!isReadOnly && (
                          <button type="button" onClick={() => removerOpcaoDoCampo(campo.id, idx)} style={{ border: 'none', background: 'none', color: '#dc3545', fontWeight: 'bold', cursor: 'pointer' }}>×</button>
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
          <button type="submit" className="btn-primary" style={{ padding: '15px', fontSize: '1.1rem' }}>
            Guardar Alterações (Rascunho)
          </button>
        )}
      </form>
    </div>
  );
}

export default EditarFormulario;
