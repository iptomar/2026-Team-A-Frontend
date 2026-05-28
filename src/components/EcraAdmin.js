import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { agruparFormulariosPorCategoria } from '../utils/formUtils';

function EcraAdmin() {
  const [formularios, setFormularios] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const carregarFormularios = async () => {
    setLoading(true);
    try {
      const resposta = await fetch('http://localhost:3000/api/forms', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (resposta.ok) {
        const dados = await resposta.json();
        setFormularios(dados);
      } else {
        console.error('Erro ao carregar formulários do servidor');
      }
    } catch (erro) {
      console.error('Erro de rede ao carregar:', erro);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarFormularios();
  }, []);

  const formulariosAgrupados = useMemo(() => agruparFormulariosPorCategoria(formularios), [formularios]);

  const apagarFormulario = async (id) => {
    if (!window.confirm('Tem a certeza que deseja apagar este formulário?')) return;
    try {
      const resposta = await fetch(`http://localhost:3000/api/forms/${id}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        }
      });
      if (resposta.ok) {
        alert('Formulário apagado com sucesso!');
        carregarFormularios();
      } else {
        const data = await resposta.json();
        // Mostrar a mensagem de erro específica do backend (ex: pedidos pendentes)
        alert(`Erro: ${data.error || 'Não foi possível apagar o formulário.'}`);
      }
    } catch (erro) {
      console.error('Erro ao apagar:', erro);
      alert('Erro de rede ao tentar apagar o formulário.');
    }
  };

  const clonarFormulario = async (id) => {
    if (!window.confirm('Deseja criar uma cópia deste formulário?')) return;
    try {
      const resposta = await fetch(`http://localhost:3000/api/forms/${id}/clonar`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        }
      });
      if (resposta.ok) {
        alert('Formulário clonado com sucesso! A cópia foi criada como rascunho.');
        carregarFormularios();
      } else {
        const data = await resposta.json();
        alert(`Erro ao clonar: ${data.error}`);
      }
    } catch (erro) {
      console.error('Erro ao clonar:', erro);
      alert('Erro de rede ao tentar clonar o formulário.');
    }
  };

  const arquivarFormulario = async (id) => {
    if (!window.confirm('Tem a certeza que deseja arquivar este formulário? Esta ação é irreversível.')) return;
    try {
      const resposta = await fetch(`http://localhost:3000/api/forms/${id}/arquivar`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (resposta.ok) {
        alert('Formulário arquivado com sucesso!');
        carregarFormularios();
      }
    } catch (erro) {
      console.error('Erro ao arquivar:', erro);
    }
  };

  const despublicarFormulario = async (id) => {
    if (!window.confirm('Deseja retirar este formulário de circulação e voltá-lo para Rascunho? Isto permitirá editá-lo novamente.')) return;
    try {
      const resposta = await fetch(`http://localhost:3000/api/forms/${id}/despublicar`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (resposta.ok) {
        alert('Formulário revertido para Rascunho!');
        carregarFormularios();
      } else {
        const data = await resposta.json();
        alert(`Erro: ${data.error}`);
      }
    } catch (erro) {
      console.error('Erro ao despublicar:', erro);
    }
  };

  const publicarFormulario = async (id) => {
    if (!window.confirm('Deseja publicar este formulário? Ele ficará visível para todos os professores.')) return;
    try {
      const resposta = await fetch(`http://localhost:3000/api/forms/${id}/publicar`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (resposta.ok) {
        alert('Formulário publicado com sucesso!');
        carregarFormularios();
      } else {
        const data = await resposta.json();
        alert(`Erro: ${data.error}`);
      }
    } catch (erro) {
      console.error('Erro ao publicar:', erro);
    }
  };

  const getStatusClass = (estado) => {
    switch (estado) {
      case 'Publicado': return 'status-publicado';
      case 'Rascunho': return 'status-rascunho';
      case 'Arquivado': return 'status-inativo'; 
      default: return 'status-inativo';
    }
  };



  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2>Painel de Administração</h2>
          <p style={{ color: 'var(--text-muted)' }}>Gerir formulários e configurações do sistema.</p>
        </div>
        
        {/* Agrupamento dos botões de ação do topo */}
        <div style={{ display: 'flex', gap: '15px' }}>
          <button 
            className="btn-primary" 
            onClick={() => navigate('/criar-formulario')}
            style={{ padding: '12px 25px' }}
          >
            + Criar Novo Formulário
          </button>
        </div>
      </div>

      {/* Lista de formulários agrupada por categoria */}
      <div>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="card" style={{ padding: '20px' }}>
                <div className="skeleton skeleton-text" style={{ width: '30%', height: '24px', marginBottom: '20px' }}></div>
                <div className="skeleton skeleton-row"></div>
                <div className="skeleton skeleton-row"></div>
                <div className="skeleton skeleton-row"></div>
              </div>
            ))}
          </div>
        ) : (
          Object.entries(formulariosAgrupados).map(([categoria, itens]) => (
            <section key={categoria} style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0 }}>{categoria}</h3>
                <span className="status-badge status-publicado">{itens.length} formulário(s)</span>
              </div>
              <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid var(--border-color)' }}>
                      <th style={{ padding: '15px 20px' }}>Título do Formulário</th>
                      <th style={{ padding: '15px 20px' }}>Estado</th>
                      <th style={{ padding: '15px 20px' }}>Data Criacão</th>
                      <th style={{ padding: '15px 20px', textAlign: 'right' }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {itens.map((form) => (
                      <tr key={form._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '15px 20px', fontWeight: '600' }}>{form.titulo}</td>
                        <td style={{ padding: '15px 20px' }}>
                          <span className={`status-badge ${getStatusClass(form.estado)}`}>
                            {form.estado}
                          </span>
                        </td>
                        <td style={{ padding: '15px 20px', color: 'var(--text-muted)' }}>
                          {new Date(form.dataCriacao || form.createdAt).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '15px 20px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button 
                              className="btn-primary" 
                              style={{ padding: '5px 12px', backgroundColor: '#28a745' }}
                              onClick={() => clonarFormulario(form._id)}
                            >
                              Clonar
                            </button>
                            {form.estado === 'Rascunho' && (
                              <button 
                                className="btn-primary" 
                                style={{ padding: '5px 12px', backgroundColor: '#28a745' }}
                                onClick={() => publicarFormulario(form._id)}
                              >
                                Publicar
                              </button>
                            )}
                            <button 
                              className="btn-logout" 
                              style={{ padding: '5px 12px' }}
                              onClick={() => navigate(`/editar-formulario/${form._id}`)}
                              disabled={form.estado === 'Publicado'  || form.estado === 'Arquivado'}
                            >
                              Editar
                            </button>
                            {/* Apenas para formulários Publicados */}
                            {form.estado === 'Publicado' && (
                              <>
                                <button
                                  className="btn-secondary"
                                  style={{ padding: '5px 12px', fontSize: '0.85rem' }}
                                  onClick={() => despublicarFormulario(form._id)}
                                >
                                  Retirar para Rascunho
                                </button>
                                <button
                                  className="btn-primary"
                                  style={{ padding: '5px 12px', backgroundColor: '#6c757d' }}
                                  onClick={() => arquivarFormulario(form._id)}
                                >
                                  Arquivar
                                </button>
                              </>
                            )}
                            {form.estado !== 'Publicado' && form.estado !== 'Arquivado' && (
                              <button 
                                className="btn-logout" 
                                style={{ padding: '5px 12px', color: 'var(--error-text)' }}
                                onClick={() => apagarFormulario(form._id)}
                              >
                                Apagar
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))
        )}
        
        {/* Mensagem caso não existam formulários */}
        {!loading && formularios.length === 0 && (
          <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Nenhum formulário encontrado na base de dados.
          </div>
        )}
      </div>
    </div>
  );
}

export default EcraAdmin;
